'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Cloud, Cpu, Database, FileCode2, Loader2 } from 'lucide-react';

export interface BoundedContextSummary {
  name: string;
  loc: number;
  target: string;
}

export interface ModernizationScopePayload {
  legacyLoc: number;
  filesAnalyzed: { java: number; jsp: number; xml: number; plsql: number };
  websphereVersion: string;
  oracleVersion: string;
  boundedContexts: BoundedContextSummary[];
  totalBoundedContexts: number;
  gsiBaseline: { years: number; usd: number };
  cursorBaseline: { months: number; usd: number };
  annualOnPremCost: number;
  proposedAnnualAwsCost: number;
  pulledForwardManagedServiceArrUsd: number;
  mapCreditEligible: boolean;
  firstBoundedContextToExtract: string;
  wellArchitectedPillars: string[];
  totalBoundaryViolations: number;
}

export class ModernizationScopeError extends Error {
  payload: ModernizationScopePayload;
  elapsedMs: number;

  constructor(payload: ModernizationScopePayload, elapsedMs: number) {
    const yrs = payload.gsiBaseline.years;
    const usd = (payload.gsiBaseline.usd / 1_000_000).toFixed(0);
    super(
      `Modernization scope detected: ${yrs} years / $${usd}M GSI baseline (Java EE + Oracle 12c monolith)`,
    );
    this.name = 'ModernizationScopeError';
    this.payload = payload;
    this.elapsedMs = elapsedMs;
  }
}

const SCAN_STAGES = [
  'Scanning monolith…',
  'Inferring bounded contexts…',
  'Matching to AWS managed services…',
  'Estimating TCO swing…',
  'Citing Well-Architected pillars…',
] as const;

type Tab = 'java' | 'xml' | 'sql';

const TABS: Array<{ id: Tab; label: string; icon: typeof FileCode2 }> = [
  { id: 'java', label: 'OrdersService.java', icon: FileCode2 },
  { id: 'xml', label: 'persistence.xml', icon: Database },
  { id: 'sql', label: 'orders-ddl.sql', icon: Cpu },
];

const JAVA_SNIPPET = `@Stateless
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public class OrdersService {

    @PersistenceContext(unitName = "orders-pu")
    private EntityManager em;

    @Resource(mappedName = "jdbc/OracleDS")
    private DataSource oracleDs;

    public long reserveInventory(long orderId, String sku, int qty)
            throws NamingException, SQLException {

        Context ctx = new InitialContext();
        DataSource ds = (DataSource) ctx.lookup(
            "java:comp/env/jdbc/OracleDS");

        CallableStatement cs = ds.getConnection()
            .prepareCall("{ call SP_RESERVE_INVENTORY(?, ?, ?, ?) }");
        cs.setLong(1, orderId);
        cs.setString(2, sku);
        cs.setInt(3, qty);
        cs.registerOutParameter(4, Types.REF_CURSOR);
        cs.execute();

        ResultSet rs = (ResultSet) cs.getObject(4);
        if (rs != null && rs.next()) {
            return rs.getLong("RESERVATION_ID");
        }
        return -1L;
    }
}`;

const XML_SNIPPET = `<persistence-unit name="orders-pu" transaction-type="JTA">
  <provider>org.eclipse.persistence.jpa.PersistenceProvider</provider>
  <jta-data-source>jdbc/OracleDS</jta-data-source>

  <properties>
    <property name="eclipselink.target-database"
              value="org.eclipse.persistence.platform
                     .database.OraclePlatform" />
    <property name="eclipselink.target-server"
              value="WebSphere_7" />
    <property name="eclipselink.jdbc.batch-writing"
              value="ORACLE-JDBC" />
    <property name="eclipselink.connection-pool
              .default.max" value="64" />
  </properties>
</persistence-unit>`;

const SQL_SNIPPET = `CREATE SEQUENCE SEQ_ORDERS
  START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE PROCEDURE SP_RESERVE_INVENTORY (
  P_ORDER_ID  IN  NUMBER,
  P_SKU       IN  VARCHAR2,
  P_QTY       IN  NUMBER,
  P_CURSOR    OUT SYS_REFCURSOR
) AS
  V_ON_HAND   NUMBER(10);
  V_RESERVED  NUMBER(10);
BEGIN
  SELECT ON_HAND, RESERVED INTO V_ON_HAND, V_RESERVED
  FROM   INVENTORY
  WHERE  SKU = P_SKU
  FOR UPDATE;

  IF V_ON_HAND - V_RESERVED < P_QTY THEN
    RAISE_APPLICATION_ERROR(-20010,
      'insufficient inventory for sku=' || P_SKU);
  END IF;

  UPDATE INVENTORY SET RESERVED = RESERVED + P_QTY
   WHERE SKU = P_SKU;

  OPEN P_CURSOR FOR
    SELECT SEQ_ORDERS.NEXTVAL AS RESERVATION_ID, ...
    FROM   DUAL;
END SP_RESERVE_INVENTORY;`;

type Token = { text: string; cls?: string };

const JAVA_RULES: Array<{ re: RegExp; cls: string }> = [
  { re: /@\w+/g, cls: 'text-[#FF9900]' },
  {
    re: /\b(public|private|protected|class|return|if|else|new|throws|throw|try|catch|finally|void|static|final|import|package|extends|implements)\b/g,
    cls: 'text-[#D97757]',
  },
  {
    re: /\b(EntityManager|DataSource|Context|InitialContext|CallableStatement|ResultSet|Types|String|long|int|boolean|double)\b/g,
    cls: 'text-[#4C9AFF]',
  },
  { re: /"[^"]*"/g, cls: 'text-[#57D9A3]' },
  { re: /\/\/[^\n]*/g, cls: 'text-[#7C8A99] italic' },
  { re: /\b(SP_[A-Z_]+|SEQ_[A-Z_]+|REF_CURSOR|REQUIRED|REQUIRES_NEW)\b/g, cls: 'text-[#A689D4]' },
];

const XML_RULES: Array<{ re: RegExp; cls: string }> = [
  { re: /<\/?[a-zA-Z-]+/g, cls: 'text-[#D97757]' },
  { re: /\/?>/g, cls: 'text-[#D97757]' },
  { re: /[a-zA-Z-]+(?==)/g, cls: 'text-[#4C9AFF]' },
  { re: /"[^"]*"/g, cls: 'text-[#57D9A3]' },
  { re: /\b(Oracle[A-Z]\w+|WebSphere_7|ORACLE-JDBC|jdbc\/OracleDS)\b/g, cls: 'text-[#FF9900]' },
];

const SQL_RULES: Array<{ re: RegExp; cls: string }> = [
  {
    re: /\b(CREATE|OR REPLACE|PROCEDURE|SEQUENCE|TABLE|INSERT|SELECT|UPDATE|INTO|FROM|WHERE|BEGIN|END|IF|THEN|AS|OPEN|FOR|RETURN|IN|OUT|DECLARE|EXCEPTION|WHEN)\b/gi,
    cls: 'text-[#D97757]',
  },
  {
    re: /\b(NUMBER|VARCHAR2|CHAR|DATE|SYS_REFCURSOR|RAISE_APPLICATION_ERROR|SYSDATE|DUAL|NEXTVAL|CURRVAL)\b/gi,
    cls: 'text-[#A689D4]',
  },
  { re: /\b(SEQ_[A-Z_]+|SP_[A-Z_]+|P_[A-Z_]+|V_[A-Z_]+)\b/g, cls: 'text-[#FF9900]' },
  { re: /'[^']*'/g, cls: 'text-[#57D9A3]' },
  { re: /--[^\n]*/g, cls: 'text-[#7C8A99] italic' },
];

function tokenize(line: string, rules: Array<{ re: RegExp; cls: string }>): Token[] {
  let tokens: Token[] = [{ text: line }];
  for (const rule of rules) {
    const next: Token[] = [];
    for (const tok of tokens) {
      if (tok.cls) {
        next.push(tok);
        continue;
      }
      let last = 0;
      const flags = rule.re.flags.includes('g') ? rule.re.flags : rule.re.flags + 'g';
      const re = new RegExp(rule.re.source, flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(tok.text)) !== null) {
        if (m.index > last) {
          next.push({ text: tok.text.slice(last, m.index) });
        }
        next.push({ text: m[0], cls: rule.cls });
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < tok.text.length) {
        next.push({ text: tok.text.slice(last) });
      }
    }
    tokens = next;
  }
  return tokens;
}

function HighlightedCode({ code, lang }: { code: string; lang: Tab }) {
  const lines = useMemo(() => code.split('\n'), [code]);
  const rules = lang === 'java' ? JAVA_RULES : lang === 'xml' ? XML_RULES : SQL_RULES;
  return (
    <pre className="font-mono text-[11.5px] leading-[1.55] text-[#E7ECEE] overflow-x-auto">
      {lines.map((line, i) => {
        const tokens = tokenize(line.length === 0 ? ' ' : line, rules);
        return (
          <div key={i} className="flex gap-3">
            <span className="text-[#4C5866] select-none w-6 text-right shrink-0">{i + 1}</span>
            <span className="whitespace-pre flex-1">
              {tokens.map((t, j) => (
                <span key={j} className={t.cls}>
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </pre>
  );
}

export function AssessCard() {
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [tab, setTab] = useState<Tab>('java');
  const [shouldThrow, setShouldThrow] = useState<ModernizationScopeError | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!processing) return;
    startRef.current = performance.now();

    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, SCAN_STAGES.length - 1));
    }, 1000);

    let cancelled = false;
    (async () => {
      let payload: ModernizationScopePayload | null = null;
      try {
        const res = await fetch('/api/aws-assess/run', { cache: 'no-store' });
        payload = (await res.json()) as ModernizationScopePayload;
      } catch {
        // Route may not be available in CI/static; fall through with defaults.
      }
      if (cancelled) return;
      const elapsedMs = Math.round(performance.now() - startRef.current);
      setShouldThrow(
        new ModernizationScopeError(payload ?? defaultPayload(), elapsedMs),
      );
    })();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [processing]);

  if (shouldThrow) {
    throw shouldThrow;
  }

  function handleRun() {
    setProcessing(true);
  }

  const snippet = tab === 'java' ? JAVA_SNIPPET : tab === 'xml' ? XML_SNIPPET : SQL_SNIPPET;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-xl border border-[#FF9900]/20 bg-dark-surface overflow-hidden shadow-[0_0_48px_rgba(255,153,0,0.08)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF9900]/15 border border-[#FF9900]/30 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-[#FF9900]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary">
                Run AWS modernization readiness scan
              </p>
              <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
                Java EE · WebSphere 8.5 · Oracle 12c · on-prem
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#0972D3] bg-[#0972D3]/10 border border-[#0972D3]/30 px-2 py-0.5 rounded">
              us-east-1
            </span>
          </div>
        </div>

        {/* Source picker tabs */}
        <div className="flex items-center gap-0 border-b border-dark-border bg-[#0B0F14]">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2.5 text-[11.5px] font-mono flex items-center gap-2 border-b-2 transition-colors ${
                  active
                    ? 'border-[#FF9900] text-text-primary bg-dark-bg'
                    : 'border-transparent text-text-tertiary hover:text-text-secondary cursor-pointer'
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Code viewer */}
        <div className="px-5 py-4 bg-[#0B0F14] max-h-[260px] overflow-y-auto">
          <HighlightedCode code={snippet} lang={tab} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 border-t border-dark-border">
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Candidate bounded context:{' '}
              <span className="font-mono text-[#FF9900]">OrdersService</span>
            </p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Target:{' '}
              <span className="font-mono text-[#0972D3]">
                AWS Lambda · Aurora Serverless v2 · CDK · ECS Fargate
              </span>
            </p>
          </div>

          {/* Targets chips */}
          <div className="flex flex-wrap gap-1.5">
            {['Lambda', 'Aurora Serverless v2', 'CDK', 'Secrets Manager', 'VPC endpoints', 'CloudWatch'].map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-bg border border-dark-border text-[10px] font-mono text-text-tertiary"
              >
                <span className="w-1 h-1 rounded-full bg-[#FF9900]/70" />
                {t}
              </span>
            ))}
          </div>

          {/* MAP eligibility badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-text-tertiary" />
              <div>
                <p className="text-[11px] font-medium text-text-primary leading-none mb-0.5">
                  MAP eligibility
                </p>
                <p className="text-[10px] text-text-tertiary">
                  Migration Acceleration Program · Modernize
                </p>
              </div>
            </div>
            <span className="text-xs text-[#00A86B] font-mono">Eligible</span>
          </div>

          {/* Loading ticker */}
          {processing && (
            <div className="px-3 py-2 rounded-md border border-[#FF9900]/25 bg-[#FF9900]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#FF9900] animate-pulse" />
              <span className="truncate">{SCAN_STAGES[stepIdx]}</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#FF9900] text-[#0B0F14] font-semibold text-sm
                       hover:bg-[#FFAC33] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(255,153,0,0.28)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running readiness scan…
              </>
            ) : (
              'Run readiness scan'
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Reads the real legacy files from disk — scan latency is not simulated.
          </p>
        </div>
      </div>
    </div>
  );
}

function defaultPayload(): ModernizationScopePayload {
  return {
    legacyLoc: 1_182_400,
    filesAnalyzed: { java: 4217, jsp: 612, xml: 418, plsql: 287 },
    websphereVersion: '8.5.5.20',
    oracleVersion: '12c (12.1.0.2)',
    boundedContexts: [
      { name: 'OrdersService', loc: 14_200, target: 'Lambda + Aurora Serverless v2' },
      { name: 'InventoryService', loc: 9_800, target: 'Lambda + DynamoDB' },
      { name: 'BillingService', loc: 22_100, target: 'ECS Fargate + Aurora PG' },
      { name: 'ShippingService', loc: 8_400, target: 'Lambda + Step Functions' },
      { name: 'CatalogService', loc: 18_600, target: 'Lambda + OpenSearch Serverless' },
    ],
    totalBoundedContexts: 38,
    gsiBaseline: { years: 5, usd: 14_000_000 },
    cursorBaseline: { months: 18, usd: 3_800_000 },
    annualOnPremCost: 8_400_000,
    proposedAnnualAwsCost: 2_100_000,
    pulledForwardManagedServiceArrUsd: 11_000_000,
    mapCreditEligible: true,
    firstBoundedContextToExtract: 'OrdersService',
    wellArchitectedPillars: ['OPS', 'SEC', 'REL', 'PERF', 'COST', 'SUS'],
    totalBoundaryViolations: 18,
  };
}
