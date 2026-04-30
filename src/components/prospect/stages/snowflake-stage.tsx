'use client';

import type { StageProps } from './types';

const LEGACY_SQL = `-- legacy / teradata BTEQ
.LOGON tdprod/etl_user;
.SET WIDTH 200;

CREATE MULTISET TABLE EDW.FCT_DAILY_REVENUE AS (
  SEL  CAST(o.ORDER_DATE AS DATE)  AS order_date,
       o.CURRENCY_CODE              AS ccy,
       SUM(o.ORDER_TOTAL * fx.RATE) AS revenue_usd
  FROM EDW.ORDERS_HISTORY o
  LEFT JOIN EDW.FX_RATES fx
    ON  fx.CCY = o.CURRENCY_CODE
    AND fx.EFFECTIVE_DATE = CAST(o.ORDER_DATE AS DATE)
  GROUP BY 1, 2
) WITH DATA PRIMARY INDEX (order_date);

.LOGOFF;`;

const DBT_MODEL = `-- mart_daily_revenue.sql · dbt + Snowflake
{{ config(materialized='incremental', unique_key=['order_date','ccy']) }}

with orders as (
  select order_date::date as order_date, currency_code as ccy, order_total
  from {{ ref('stg_orders') }}
),
fx as (
  select ccy, effective_date, rate
  from {{ ref('stg_fx_rates_lookback_24h') }}
)
select   o.order_date,
         o.ccy,
         sum(o.order_total * fx.rate) as revenue_usd
from     orders o
left join fx on fx.ccy = o.ccy and fx.effective_date = o.order_date
group by 1, 2;`;

export function SnowflakeStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const showRight = activeStep >= 1;
  const verified = activeStep >= 3 || isComplete;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          app.snowflake.com / {account.toLowerCase()} / migration
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}22`, color: brand }}>
          SNOWFLAKE MCP
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-dark-border">
        {/* LEFT: legacy SQL */}
        <div>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dark-border bg-dark-surface">
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary">legacy / teradata bteq</span>
            <span className="ml-auto text-[9px] font-mono text-[#f87171]">retiring</span>
          </div>
          <pre className="p-3 text-[10px] font-mono leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
{LEGACY_SQL}
          </pre>
        </div>

        {/* RIGHT: dbt + Snowflake */}
        <div>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dark-border bg-dark-surface">
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary">{showRight ? 'dbt / mart_daily_revenue.sql' : 'awaiting agent…'}</span>
            <span className="ml-auto text-[9px] font-mono" style={{ color: brand }}>snowflake-native</span>
          </div>
          {!showRight ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full mb-2 animate-pulse" style={{ background: brand }} />
              <p className="text-[10px] font-mono">cursor.parse(legacyGlob)</p>
            </div>
          ) : (
            <pre className="p-3 text-[10px] font-mono leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
{DBT_MODEL}
            </pre>
          )}
        </div>
      </div>

      {/* Verification strip */}
      <div className="grid grid-cols-3 divide-x divide-dark-border border-t border-dark-border text-[11px] font-mono">
        <CheckCell label="row count" value={verified ? '14,237 / 14,237' : '—'} ok={verified} />
        <CheckCell label="Σ revenue Δ" value={verified ? '$0.00' : '—'} ok={verified} />
        <CheckCell label="cortex semantic check" value={verified ? 'no drift' : 'pending'} ok={verified} />
      </div>
    </div>
  );
}

function CheckCell({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? '#4ade80' : '#a3a3a3' }} />
        <span className={ok ? 'text-accent-green' : 'text-text-secondary'}>{value}</span>
      </div>
    </div>
  );
}
