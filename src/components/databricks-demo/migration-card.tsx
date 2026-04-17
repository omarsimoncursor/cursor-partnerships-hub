'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Database, Loader2, Play } from 'lucide-react';

// -----------------------------------------------------------------------------
// MigrationScopeError — thrown into the DemoMigrationBoundary to flip the
// demo page from `idle` → `error`. Carries the analyzed payload so the
// full-screen takeover can quote concrete figures.
// -----------------------------------------------------------------------------

export interface MigrationScopePayload {
  legacyLoc: number;
  filesAnalyzed: { plsql: number; informatica: number; other: number };
  dialectIdioms: string[];
  gsiBaseline: { years: number; usd: number };
  cursorBaseline: { months: number; usd: number };
  annualOnPremCost: number;
  proposedAnnualDatabricksCost: number;
  pulledForwardArr: number;
  pulledForwardArrMonths: number;
  firstWorkflowToMigrate: string;
  totalOracleTb: number;
}

const FALLBACK_PAYLOAD: MigrationScopePayload = {
  legacyLoc: 47_412,
  filesAnalyzed: { plsql: 184, informatica: 312, other: 97 },
  dialectIdioms: [
    'cursor loops',
    'MERGE',
    'CONNECT BY',
    'ROWNUM',
    'NVL/DECODE',
    'global temp tables',
    'TO_CHAR date fmt',
  ],
  gsiBaseline: { years: 5, usd: 22_000_000 },
  cursorBaseline: { months: 18, usd: 6_800_000 },
  annualOnPremCost: 14_700_000,
  proposedAnnualDatabricksCost: 3_900_000,
  pulledForwardArr: 45_000_000,
  pulledForwardArrMonths: 42,
  firstWorkflowToMigrate: 'customer_rfm_segmentation',
  totalOracleTb: 18,
};

export class MigrationScopeError extends Error {
  payload: MigrationScopePayload;

  constructor(payload: MigrationScopePayload) {
    super(
      `Migration scope detected: ${payload.legacyLoc.toLocaleString()} PL/SQL LOC, ${payload.filesAnalyzed.informatica} Informatica workflows — GSI baseline ${payload.gsiBaseline.years}y / $${(
        payload.gsiBaseline.usd / 1_000_000
      ).toFixed(0)}M.`,
    );
    this.name = 'MigrationScopeError';
    this.payload = payload;
  }
}

// -----------------------------------------------------------------------------
// Scripted loading ticker
// -----------------------------------------------------------------------------

const LOADING_STEPS = [
  'Parsing PL/SQL…',
  'Scanning Informatica repository…',
  'Inventorying stored procedures…',
  'Counting idiom frequencies…',
  'Estimating migration scope…',
] as const;

// -----------------------------------------------------------------------------
// Tabbed editor content — excerpts of the real assets so the prospect can
// see the legacy code without scrolling through the full files. The full
// files live on disk and are read by /api/migration/analyze.
// -----------------------------------------------------------------------------

const PLSQL_SNIPPET = `-- LEGACY: Oracle 19c · ACME_DW.customer_rfm_segmentation
-- Idioms touched on migration day:
--   · explicit cursor + FETCH loop
--   · GLOBAL TEMPORARY TABLE
--   · MERGE INTO ... USING
--   · CONNECT BY PRIOR (recursive hierarchy)
--   · NVL / DECODE / ROWNUM / TO_CHAR(date,'YYYYMM')

CREATE GLOBAL TEMPORARY TABLE tmp_rfm_scores (
  customer_id NUMBER(18), run_ym CHAR(6),
  last_order_dt DATE, recency_days NUMBER(6),
  order_count NUMBER(8), gross_sales NUMBER(18,2),
  r_score NUMBER(1), f_score NUMBER(1),
  m_score NUMBER(1), rfm_cell CHAR(3)
) ON COMMIT PRESERVE ROWS;

CURSOR c_customers IS
  SELECT c.customer_id,
         NVL(MAX(o.order_dt), DATE '1900-01-01'),
         COUNT(o.order_id),
         NVL(SUM(o.gross_amount), 0)
    FROM acme_dw.customers c
    LEFT JOIN acme_dw.orders o
      ON o.customer_id = c.customer_id
     AND o.order_dt   >= ADD_MONTHS(p_run_date, -24)
   WHERE c.status_cd IN ('A','H')
     AND ROWNUM <= 5000000
   GROUP BY c.customer_id
   ORDER BY c.customer_id;

OPEN c_customers;
LOOP
  FETCH c_customers INTO r_cust.customer_id, ...
  EXIT WHEN c_customers%NOTFOUND;
  -- stage into tmp_rfm_scores
END LOOP;
CLOSE c_customers;

MERGE INTO acme_dw.mart_customer_rfm t
USING ( SELECT customer_id, run_ym, rfm_cell,
               DECODE(rfm_cell,'555','Champion','544','Loyal',
                              '344','Promising','155','Hibernating','Other')
          FROM tmp_rfm_scores
         WHERE run_ym = TO_CHAR(p_run_date,'YYYYMM') ) s
ON (t.customer_id = s.customer_id AND t.run_ym = s.run_ym)
WHEN MATCHED THEN UPDATE SET t.rfm_cell = s.rfm_cell, ...
WHEN NOT MATCHED THEN INSERT (...) VALUES (...);

-- Tier rollup over the customer_tier hierarchy.
SELECT LPAD(' ', 2*(LEVEL-1)) || t.tier_code,
       COUNT(DISTINCT r.customer_id), SUM(r.gross_sales)
  FROM acme_dw.customer_tier t
  LEFT JOIN acme_dw.mart_customer_rfm r ON r.tier_code = t.tier_code
 START WITH t.parent_tier IS NULL
CONNECT BY PRIOR t.tier_code = t.parent_tier;`;

const INFA_SNIPPET = `<!-- Informatica PowerCenter · ACME_PC_REPO / ACME_DW_MARKETING -->
<MAPPING NAME="m_customer_rfm" ISVALID="YES">

  <TRANSFORMATION NAME="SQ_CUSTOMERS_ORDERS" TYPE="Source Qualifier">
    <TABLEATTRIBUTE NAME="Sql Query" VALUE="
      SELECT c.customer_id, c.status_cd,
             NVL(MAX(o.order_dt), DATE '1900-01-01') AS last_order_dt,
             COUNT(o.order_id)                        AS order_count,
             NVL(SUM(o.gross_amount), 0)              AS gross_sales
        FROM acme_dw.customers c
        LEFT JOIN acme_dw.orders o
          ON o.customer_id = c.customer_id
         AND o.order_dt   >= ADD_MONTHS(SYSDATE, -24)
       WHERE c.status_cd IN ('A','H')
       GROUP BY c.customer_id, c.status_cd"/>
  </TRANSFORMATION>

  <TRANSFORMATION NAME="EXP_DERIVE_RECENCY" TYPE="Expression">
    <TRANSFORMFIELD NAME="RUN_YM"       PORTTYPE="OUTPUT"
                    EXPRESSION="TO_CHAR(SYSDATE,'YYYYMM')"/>
    <TRANSFORMFIELD NAME="RECENCY_DAYS" PORTTYPE="OUTPUT"
                    EXPRESSION="GREATEST(TRUNC(SYSDATE) - LAST_ORDER_DT, 0)"/>
  </TRANSFORMATION>

  <TRANSFORMATION NAME="AGG_QUINTILE_SCORES" TYPE="Aggregator">
    <TRANSFORMFIELD NAME="R_SCORE" PORTTYPE="OUTPUT"
                    EXPRESSION="NTILE(5) OVER (ORDER BY RECENCY_DAYS ASC)"/>
    <TRANSFORMFIELD NAME="F_SCORE" PORTTYPE="OUTPUT"
                    EXPRESSION="NTILE(5) OVER (ORDER BY ORDER_COUNT DESC)"/>
    <TRANSFORMFIELD NAME="M_SCORE" PORTTYPE="OUTPUT"
                    EXPRESSION="NTILE(5) OVER (ORDER BY GROSS_SALES DESC)"/>
  </TRANSFORMATION>

  <TRANSFORMATION NAME="EXP_SEGMENT_NAME" TYPE="Expression">
    <TRANSFORMFIELD NAME="SEGMENT_NAME" PORTTYPE="OUTPUT"
                    EXPRESSION="DECODE(RFM_CELL,'555','Champion','544','Loyal',
                                                '344','Promising','Other')"/>
  </TRANSFORMATION>

</MAPPING>

<WORKFLOW NAME="wf_m_customer_rfm"
          SCHEDULERNAME="wk_monday_03_15_pst"/>`;

// -----------------------------------------------------------------------------
// Minimal syntax highlighting for PL/SQL and Informatica XML. Deliberately
// simple — regex-based, no tokenizer, no dependencies.
// -----------------------------------------------------------------------------

const PLSQL_KEYWORDS = new Set([
  'CREATE', 'GLOBAL', 'TEMPORARY', 'TABLE', 'ON', 'COMMIT', 'PRESERVE', 'ROWS',
  'CURSOR', 'IS', 'SELECT', 'FROM', 'LEFT', 'JOIN', 'WHERE', 'AND', 'OR', 'IN',
  'GROUP', 'BY', 'ORDER', 'OPEN', 'LOOP', 'FETCH', 'INTO', 'EXIT', 'WHEN',
  'CLOSE', 'MERGE', 'USING', 'MATCHED', 'THEN', 'UPDATE', 'SET', 'NOT',
  'INSERT', 'VALUES', 'START', 'WITH', 'CONNECT', 'PRIOR', 'IF', 'ELSIF',
  'END', 'AS', 'NULL', 'DATE', 'BEGIN', 'PROCEDURE', 'FUNCTION', 'PACKAGE',
  'BODY', 'DECLARE', 'RETURN', 'NUMBER', 'CHAR', 'VARCHAR2', 'OUTPUT',
]);
const PLSQL_BUILTINS = new Set([
  'NVL', 'DECODE', 'ROWNUM', 'COUNT', 'SUM', 'MAX', 'MIN', 'LENGTH',
  'TO_CHAR', 'TO_DATE', 'TRUNC', 'SYSDATE', 'SYSTIMESTAMP', 'ADD_MONTHS',
  'GREATEST', 'LEAST', 'COALESCE', 'NTILE', 'ROW_NUMBER', 'OVER', 'LPAD',
  'LEVEL', 'DEFAULT',
]);

type Token = { type: 'kw' | 'fn' | 'str' | 'num' | 'cmt' | 'op' | 'txt'; text: string };

function tokenizePlsql(line: string): Token[] {
  const tokens: Token[] = [];

  const commentIdx = line.indexOf('--');
  let codePart = line;
  let commentPart = '';
  if (commentIdx >= 0) {
    codePart = line.slice(0, commentIdx);
    commentPart = line.slice(commentIdx);
  }

  const re = /('[^']*'|"[^"]*"|\b\d+(?:\.\d+)?\b|\w+|\s+|[^\s\w])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(codePart)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) {
      tokens.push({ type: 'txt', text: t });
    } else if (/^'/.test(t) || /^"/.test(t)) {
      tokens.push({ type: 'str', text: t });
    } else if (/^\d/.test(t)) {
      tokens.push({ type: 'num', text: t });
    } else if (/^\w+$/.test(t)) {
      const up = t.toUpperCase();
      if (PLSQL_KEYWORDS.has(up)) tokens.push({ type: 'kw', text: t });
      else if (PLSQL_BUILTINS.has(up)) tokens.push({ type: 'fn', text: t });
      else tokens.push({ type: 'txt', text: t });
    } else {
      tokens.push({ type: 'op', text: t });
    }
  }
  if (commentPart) tokens.push({ type: 'cmt', text: commentPart });
  return tokens;
}

function tokenizeXml(line: string): Token[] {
  const tokens: Token[] = [];
  const commentMatch = /<!--.*-->/.exec(line);
  if (commentMatch && commentMatch[0] === line.trim()) {
    tokens.push({ type: 'cmt', text: line });
    return tokens;
  }

  const re = /(<\/?[\w-]+|\/?>|"[^"]*"|\b[\w-]+=|\s+|[^\s])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) tokens.push({ type: 'txt', text: t });
    else if (/^<\/?/.test(t) || /^\/?>$/.test(t)) tokens.push({ type: 'kw', text: t });
    else if (/^"/.test(t)) tokens.push({ type: 'str', text: t });
    else if (/=$/.test(t)) tokens.push({ type: 'fn', text: t });
    else tokens.push({ type: 'txt', text: t });
  }
  return tokens;
}

function tokenColor(type: Token['type']): string {
  switch (type) {
    case 'kw': return 'text-[#FF5A3C]';
    case 'fn': return 'text-[#FFB86C]';
    case 'str': return 'text-[#A3E635]';
    case 'num': return 'text-[#7DD3FC]';
    case 'cmt': return 'text-text-tertiary italic';
    case 'op': return 'text-text-secondary';
    default: return 'text-text-primary';
  }
}

function HighlightedCode({
  code,
  language,
}: {
  code: string;
  language: 'plsql' | 'xml';
}) {
  const lines = code.split('\n');
  const tokenize = language === 'plsql' ? tokenizePlsql : tokenizeXml;
  return (
    <pre className="text-[11.5px] leading-[1.55] font-mono whitespace-pre overflow-x-auto">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="select-none text-text-tertiary/50 pr-3 text-right w-8 shrink-0">
            {i + 1}
          </span>
          <span className="flex-1 min-w-0">
            {tokenize(line).map((tok, j) => (
              <span key={j} className={tokenColor(tok.type)}>
                {tok.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  );
}

// -----------------------------------------------------------------------------
// Main card
// -----------------------------------------------------------------------------

type Tab = 'plsql' | 'infa';

export function MigrationCard() {
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('plsql');
  const [shouldThrow, setShouldThrow] = useState<MigrationScopeError | null>(null);

  useEffect(() => {
    if (!processing) return;

    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 950);

    let cancelled = false;
    (async () => {
      let payload: MigrationScopePayload = FALLBACK_PAYLOAD;
      try {
        const res = await fetch('/api/migration/analyze', { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as Partial<MigrationScopePayload> & {
            legacyLoc?: number;
          };
          payload = {
            ...FALLBACK_PAYLOAD,
            ...data,
            filesAnalyzed: data.filesAnalyzed ?? FALLBACK_PAYLOAD.filesAnalyzed,
            gsiBaseline: data.gsiBaseline ?? FALLBACK_PAYLOAD.gsiBaseline,
            cursorBaseline: data.cursorBaseline ?? FALLBACK_PAYLOAD.cursorBaseline,
          };
        }
      } catch {
        // Swallow: the demo still fires scope detection with the fallback payload.
      }
      if (cancelled) return;
      setShouldThrow(new MigrationScopeError(payload));
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden shadow-[0_0_40px_rgba(255,54,33,0.06)]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-dark-border bg-dark-bg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FF3621]/15 border border-[#FF3621]/35 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-[#FF6B55]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary leading-tight">
                Migrate this Informatica workflow
              </p>
              <p className="text-[11.5px] text-text-tertiary font-mono truncate">
                Oracle 19c · PL/SQL · <span className="text-text-secondary">CUSTOMER_RFM_SEGMENTATION</span> → Databricks · Unity Catalog · DLT
              </p>
            </div>
          </div>
          <span className="shrink-0 hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#FF6B55] bg-[#FF3621]/10 border border-[#FF3621]/25 px-2 py-0.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-[#FF6B55] animate-pulse" />
            Legacy
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex items-center border-b border-dark-border bg-[#101820]">
          <TabButton
            active={activeTab === 'plsql'}
            onClick={() => setActiveTab('plsql')}
            icon={<FileIcon color="#FF6B55" />}
            label="customer_rfm_segmentation.sql"
            sublabel="PL/SQL"
          />
          <TabButton
            active={activeTab === 'infa'}
            onClick={() => setActiveTab('infa')}
            icon={<FileIcon color="#7DD3FC" />}
            label="wf_m_customer_rfm.xml"
            sublabel="Informatica"
          />
          <div className="ml-auto pr-4 text-[10px] font-mono text-text-tertiary">
            {activeTab === 'plsql' ? '214 LOC · 6 idioms flagged' : '62 LOC · 6 transforms'}
          </div>
        </div>

        {/* Code body */}
        <div className="bg-[#0B1116] max-h-72 overflow-y-auto px-4 py-3">
          {activeTab === 'plsql' ? (
            <HighlightedCode code={PLSQL_SNIPPET} language="plsql" />
          ) : (
            <HighlightedCode code={INFA_SNIPPET} language="xml" />
          )}
        </div>

        {/* Action row */}
        <div className="p-5 space-y-3 bg-dark-surface">
          {/* Idiom chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'cursor loops',
              'MERGE',
              'CONNECT BY',
              'ROWNUM',
              'NVL/DECODE',
              'global temp tables',
            ].map(idiom => (
              <span
                key={idiom}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-bg border border-[#FF3621]/25 text-[10px] font-mono text-[#FF6B55]"
              >
                <span className="w-1 h-1 rounded-full bg-[#FF6B55]/70" />
                {idiom}
              </span>
            ))}
          </div>

          {/* Ticker */}
          {processing && (
            <div className="px-3 py-2 rounded-md border border-[#FF3621]/25 bg-[#FF3621]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#FF6B55] animate-pulse" />
              <span className="truncate">{LOADING_STEPS[stepIdx]}</span>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#FF3621] text-white font-medium text-sm
                       hover:bg-[#FF5A3C] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_28px_rgba(255,54,33,0.3)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing migration scope…
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run migration analysis
              </>
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Reads the real stored proc + Informatica XML on disk — analysis latency is not simulated
          </p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 px-4 py-2.5 text-[11.5px] border-r border-dark-border transition-colors cursor-pointer ${
        active
          ? 'bg-[#0B1116] text-text-primary'
          : 'bg-[#0d141b] text-text-secondary hover:bg-[#101820] hover:text-text-primary'
      }`}
      style={
        active
          ? { boxShadow: 'inset 0 2px 0 0 #FF3621' }
          : undefined
      }
    >
      {icon}
      <span className="font-mono">{label}</span>
      <span className="text-[10px] text-text-tertiary ml-1">{sublabel}</span>
    </button>
  );
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <path
        d="M1.5 1.5h5.5l3.5 3.5v7.5a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"
        fill={`${color}22`}
        stroke={color}
        strokeWidth="1"
      />
      <path d="M7 1.5V5h3.5" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}
