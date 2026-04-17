'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Snowflake, Database, FileCode2 } from 'lucide-react';

export interface EltRiskPayload {
  legacyLoc: number;
  filesAnalyzed: { bteq: number; tsql: number; informatica: number; ssis: number };
  dialectIdioms: string[];
  gsiBaseline: { years: number; usd: number };
  cursorBaseline: { months: number; usd: number };
  annualLegacyCost: number;
  proposedAnnualSnowflakeCost: number;
  pulledForwardCreditsUsd: number;
  pulledForwardMonths: number;
  brokenPipelineCount: number;
  stalestPipelineHours: number;
  stalestPipelineMinutes: number;
  firstScriptToMigrate: string;
}

export class EltRiskError extends Error {
  payload: EltRiskPayload;

  constructor(payload: EltRiskPayload) {
    super(
      `ELT platform risk detected: ${payload.filesAnalyzed.bteq} BTEQ + ${payload.filesAnalyzed.tsql} T-SQL · $${payload.annualLegacyCost.toLocaleString()}/yr legacy run`,
    );
    this.name = 'EltRiskError';
    this.payload = payload;
  }
}

const LOADING_STEPS = [
  'Scanning Teradata BTEQ repository…',
  'Parsing T-SQL stored procedures…',
  'Correlating Informatica lineage…',
  'Tagging dialect-specific idioms…',
  'Estimating modernization scope…',
] as const;

type TabKey = 'bteq' | 'tsql' | 'informatica';

const BTEQ_EXCERPT = `.LOGON \${TD_HOST}/\${TD_USER},\${TD_PASSWORD};
.SET ERRORLEVEL 3807 SEVERITY 0;
.SET MAXERROR 1;

DATABASE perf_dw;

CREATE MULTISET VOLATILE TABLE tmp_orders_raw AS (
    SELECT o.order_id, o.customer_id, o.region_code,
           o.currency_code, CAST(o.order_ts AS DATE) AS order_date
      FROM stg_orders o
     WHERE CAST(o.order_ts AS DATE) = (DATE - 1)
       AND o.order_status IN ('SHIPPED', 'DELIVERED', 'INVOICED')
) WITH DATA PRIMARY INDEX (order_id)
  ON COMMIT PRESERVE ROWS;

COLLECT STATISTICS ON tmp_orders_raw COLUMN (region_code);

CREATE MULTISET VOLATILE TABLE tmp_order_lines AS (
    SELECT ol.order_id, ol.line_number, ol.product_id, ol.quantity,
           ol.unit_price_local, ol.line_discount_local, ol.tax_local,
           o.customer_id, o.region_code, o.currency_code, o.order_date
      FROM stg_order_lines ol
      JOIN tmp_orders_raw o ON ol.order_id = o.order_id
    QUALIFY ROW_NUMBER() OVER (
        PARTITION BY ol.order_id, ol.line_number
        ORDER BY ol.updated_ts DESC
    ) = 1
) WITH DATA PRIMARY INDEX (order_id, line_number)
  ON COMMIT PRESERVE ROWS;

MERGE INTO fct_daily_revenue AS tgt
USING (
    SELECT order_date, region_code, currency_code, category_name,
           SUM(gross_usd + tax_usd) AS net_revenue_usd,
           CURRENT_TIMESTAMP         AS last_refreshed_at
      FROM tmp_line_enriched
     GROUP BY order_date, region_code, currency_code, category_name
) AS src
   ON tgt.order_date = src.order_date
  AND tgt.region_code = src.region_code
  AND tgt.category_name = src.category_name
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...;`;

const TSQL_EXCERPT = `CREATE PROCEDURE dbo.usp_enrich_customers_360
    @run_window_start DATETIME2(3) = NULL,
    @run_window_end   DATETIME2(3) = NULL,
    @rows_merged      INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @now DATETIME2(3) = SYSUTCDATETIME();

    INSERT INTO @events
    SELECT e.event_id, e.customer_id, e.event_ts,
           e.event_channel, j.event_type, j.order_id,
           j.order_value_usd, j.loyalty_points, j.is_returning
      FROM dbo.stg_customer_events e
     CROSS APPLY OPENJSON(e.event_payload)
          WITH (
              event_type      VARCHAR(64)    '$.type',
              order_id        BIGINT         '$.order.id',
              order_value_usd DECIMAL(18, 4) '$.order.value_usd',
              loyalty_points  INT            '$.loyalty.points_delta',
              is_returning    BIT            '$.customer.is_returning'
          ) j
     WHERE e.event_ts >= @window_start
       AND e.event_ts <  @window_end;

    MERGE INTO dbo.mart_customer_360 AS tgt
    USING tier_assignment AS src
       ON tgt.customer_id = src.customer_id
    WHEN MATCHED THEN UPDATE SET ...
    WHEN NOT MATCHED BY TARGET THEN INSERT (...);
END;`;

const INFORMATICA_EXCERPT = `<POWERMART REPOSITORY_VERSION="186.0" DATABASETYPE="Oracle">
  <FOLDER NAME="CUSTOMER_360" GROUP="ANALYTICS">
    <SOURCE NAME="SRC_STG_CUSTOMER_EVENTS"
            DBDNAME="ACME_CRM" OWNERNAME="DBO" SOURCETYPE="Relational">
      <SOURCEFIELD NAME="EVENT_PAYLOAD" DATATYPE="nvarchar(max)"/>
    </SOURCE>

    <MAPPING NAME="m_customer_360_enrich" ISVALID="YES">
      <TRANSFORMATION NAME="EXP_PARSE_PAYLOAD" TYPE="Expression">
        <TRANSFORMFIELD NAME="event_type"
          EXPRESSION=":LKP.JSON_LOOKUP(EVENT_PAYLOAD, '$.type')"/>
      </TRANSFORMATION>
      <TRANSFORMATION NAME="AGG_ROLLING_WINDOWS" TYPE="Aggregator">
        <TRANSFORMFIELD NAME="SPEND_13M_USD"
          EXPRESSION="SUM(IIF(EVENT_TS >=
            ADD_TO_DATE(SESSSTARTTIME, 'MM', -13),
            order_value_usd, 0))"/>
      </TRANSFORMATION>
      <TRANSFORMATION NAME="LKP_LOYALTY_TIER" TYPE="Lookup"/>
      <TRANSFORMATION NAME="UPD_MART_CUSTOMER_360" TYPE="Update Strategy"/>
    </MAPPING>
  </FOLDER>
</POWERMART>`;

export function AuditCard() {
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [shouldThrow, setShouldThrow] = useState<EltRiskError | null>(null);
  const [tab, setTab] = useState<TabKey>('bteq');
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!processing) return;
    startRef.current = performance.now();

    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 1100);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/audit/run', { cache: 'no-store' });
        const payload = (await res.json()) as EltRiskError['payload'];
        if (cancelled) return;
        setShouldThrow(new EltRiskError(payload));
      } catch {
        if (cancelled) return;
        setShouldThrow(
          new EltRiskError({
            legacyLoc: 63_180,
            filesAnalyzed: { bteq: 247, tsql: 412, informatica: 184, ssis: 68 },
            dialectIdioms: [
              'QUALIFY',
              'COLLECT STATS',
              'MULTISET VOLATILE',
              'MERGE',
              'CROSS APPLY',
              'OPENJSON',
              'Teradata date math',
            ],
            gsiBaseline: { years: 4, usd: 18_000_000 },
            cursorBaseline: { months: 15, usd: 5_400_000 },
            annualLegacyCost: 8_200_000,
            proposedAnnualSnowflakeCost: 2_300_000,
            pulledForwardCreditsUsd: 16_000_000,
            pulledForwardMonths: 33,
            brokenPipelineCount: 4,
            stalestPipelineHours: 14,
            stalestPipelineMinutes: 22,
            firstScriptToMigrate: 'daily_revenue_rollup',
          }),
        );
      }
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

  const currentSource =
    tab === 'bteq' ? BTEQ_EXCERPT : tab === 'tsql' ? TSQL_EXCERPT : INFORMATICA_EXCERPT;
  const currentFileName =
    tab === 'bteq'
      ? 'daily_revenue_rollup.bteq'
      : tab === 'tsql'
        ? 'usp_enrich_customers_360.sql'
        : 'wf_customers_360.xml';

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#29B5E8]/15 border border-[#29B5E8]/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#29B5E8]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">ELT freshness audit</p>
              <p className="text-xs text-text-tertiary">
                Teradata 17 · SQL Server 2019 · Informatica 10.4 → Snowflake + dbt + Cortex AI
              </p>
            </div>
          </div>
        </div>

        {/* Config block */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11.5px]">
            <InfoRow label="Source A" value="Teradata 17 · BTEQ" />
            <InfoRow label="Source B" value="SQL Server 2019 · T-SQL proc" />
            <InfoRow label="Target" value="Snowflake · dbt · Cortex AI" />
          </div>

          {/* Tabs */}
          <div className="rounded-lg border border-dark-border overflow-hidden">
            <div className="flex items-center gap-0 bg-dark-bg border-b border-dark-border">
              <TabButton active={tab === 'bteq'} onClick={() => setTab('bteq')}>
                daily_revenue_rollup.bteq
              </TabButton>
              <TabButton active={tab === 'tsql'} onClick={() => setTab('tsql')}>
                usp_enrich_customers_360.sql
              </TabButton>
              <TabButton active={tab === 'informatica'} onClick={() => setTab('informatica')}>
                wf_customers_360.xml
              </TabButton>
            </div>
            <div className="bg-[#0A1419] px-4 py-3 flex items-center gap-2 border-b border-dark-border">
              <FileCode2 className="w-3 h-3 text-[#29B5E8]" />
              <span className="text-[11px] font-mono text-text-tertiary">
                legacy/{currentFileName}
              </span>
              <span className="ml-auto text-[10px] font-mono text-text-tertiary">
                read-only · server-side
              </span>
            </div>
            <pre className="px-4 py-3 bg-[#0A1419] font-mono text-[11px] text-text-secondary overflow-x-auto leading-relaxed max-h-[300px] overflow-y-auto">
              {currentSource}
            </pre>
          </div>

          {/* Freshness indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg border border-accent-amber/20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              <div>
                <p className="text-[11px] font-medium text-text-primary leading-none mb-0.5">
                  Last successful daily rollup
                </p>
                <p className="text-[10px] text-text-tertiary">fct_daily_revenue · perf_dw</p>
              </div>
            </div>
            <span className="text-xs text-accent-amber font-mono">14h 22m ago</span>
          </div>

          {/* Loading ticker */}
          {processing && (
            <div className="px-3 py-2 rounded-md border border-[#29B5E8]/20 bg-[#29B5E8]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#29B5E8] animate-pulse" />
              <span className="truncate">{LOADING_STEPS[stepIdx]}</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#29B5E8] text-[#0A1419] font-semibold text-sm
                       hover:bg-[#4FC3EE] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(41,181,232,0.35)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Auditing legacy ELT…
              </>
            ) : (
              <>
                <Snowflake className="w-4 h-4" />
                Run ELT freshness audit
              </>
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Calls /api/audit/run — reads real legacy files, tags idioms, returns scope payload
          </p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-[11.5px] font-mono border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
        active
          ? 'border-[#29B5E8] text-text-primary bg-[#29B5E8]/5'
          : 'border-transparent text-text-tertiary hover:text-text-secondary'
      }`}
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-md bg-dark-bg border border-dark-border">
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-text-primary font-mono truncate">{value}</p>
    </div>
  );
}
