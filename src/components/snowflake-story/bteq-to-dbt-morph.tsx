'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';

interface BteqToDbtMorphProps {
  progress: number;
  highlight?: 'multiset' | 'qualify' | 'collect-stats' | 'date-math' | null;
  className?: string;
}

interface CodeLine {
  text: string;
  tone: 'directive' | 'ddl' | 'plain' | 'qualify' | 'date' | 'comment' | 'cte' | 'macro';
  tag?: string;
}

const BTEQ_LINES: CodeLine[] = [
  { text: '.LOGON td_prod/analytics_engineer;', tone: 'directive' },
  { text: '.SET ERROROUT STDOUT;', tone: 'directive' },
  { text: '', tone: 'plain' },
  { text: 'CREATE MULTISET VOLATILE TABLE _daily_revenue_stg', tone: 'ddl', tag: 'multiset' },
  { text: '  ON COMMIT PRESERVE ROWS AS (', tone: 'ddl', tag: 'multiset' },
  { text: '  SELECT order_date, region, currency, category,', tone: 'plain' },
  { text: '         SUM(net_amount) AS revenue_native,', tone: 'plain' },
  { text: '         RANK() OVER (PARTITION BY region ORDER BY SUM(net_amount) DESC) AS rnk', tone: 'plain' },
  { text: '  FROM acme_crm.fact_orders', tone: 'plain' },
  { text: '  WHERE order_date BETWEEN (DATE - 365) AND (DATE - 1)', tone: 'date', tag: 'date-math' },
  { text: '  GROUP BY order_date, region, currency, category', tone: 'plain' },
  { text: ') WITH DATA PRIMARY INDEX (order_date, region);', tone: 'ddl' },
  { text: '', tone: 'plain' },
  { text: 'COLLECT STATISTICS ON _daily_revenue_stg COLUMN (order_date);', tone: 'directive', tag: 'collect-stats' },
  { text: '', tone: 'plain' },
  { text: 'SELECT * FROM _daily_revenue_stg', tone: 'plain' },
  { text: 'QUALIFY ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue_native DESC) = 1;', tone: 'qualify', tag: 'qualify' },
  { text: '', tone: 'plain' },
  { text: '.IF ERRORCODE <> 0 THEN .QUIT 12;', tone: 'directive' },
  { text: '.LOGOFF;', tone: 'directive' },
];

const DBT_LINES: CodeLine[] = [
  { text: "-- models/marts/fct_daily_revenue.sql", tone: 'comment' },
  { text: "{{ config(materialized='incremental', unique_key=['order_date','region'],", tone: 'macro' },
  { text: "         on_schema_change='append_new_columns') }}", tone: 'macro' },
  { text: '', tone: 'plain' },
  { text: 'with revenue_stg as (', tone: 'cte', tag: 'multiset' },
  { text: '  select order_date, region, currency, category,', tone: 'plain' },
  { text: "         sum(net_amount) as revenue_native,", tone: 'plain' },
  { text: '         rank() over (partition by region order by sum(net_amount) desc) as rnk', tone: 'plain' },
  { text: "  from {{ ref('stg_revenue_events') }}", tone: 'macro' },
  { text: "  where order_date between dateadd(day, -365, current_date())", tone: 'date', tag: 'date-math' },
  { text: "                         and dateadd(day, -1,   current_date())", tone: 'date', tag: 'date-math' },
  { text: '  group by order_date, region, currency, category', tone: 'plain' },
  { text: ')', tone: 'plain' },
  { text: '', tone: 'plain' },
  { text: 'select *', tone: 'plain' },
  { text: 'from revenue_stg', tone: 'plain' },
  { text: 'qualify row_number() over (partition by region order by revenue_native desc) = 1', tone: 'qualify', tag: 'qualify' },
  { text: '-- micro-partition stats are maintained automatically by Snowflake', tone: 'comment', tag: 'collect-stats' },
];

export function BteqToDbtMorph({ progress, highlight, className = '' }: BteqToDbtMorphProps) {
  const bteqOpacity = useMemo(() => clamp(1 - progress * 1.25, 0.05, 1), [progress]);
  const dbtOpacity = useMemo(() => clamp(progress * 1.4 - 0.05, 0, 1), [progress]);

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 lg:gap-6 items-stretch ${className}`}
    >
      <CodePane
        title="daily_revenue_rollup.bteq"
        subtitle="Teradata 17 · BTEQ"
        accent="#F59E0B"
        lines={BTEQ_LINES}
        opacity={bteqOpacity}
        dim={progress > 0.3}
        highlight={highlight}
      />
      <MorphArrow progress={progress} />
      <CodePane
        title="fct_daily_revenue.sql"
        subtitle="dbt · Snowflake-native"
        accent="#29B5E8"
        lines={DBT_LINES}
        opacity={dbtOpacity}
        dim={progress < 0.7}
        highlight={highlight}
      />
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function CodePane({
  title, subtitle, accent, lines, opacity, dim, highlight,
}: {
  title: string; subtitle: string; accent: string; lines: CodeLine[];
  opacity: number; dim?: boolean; highlight?: string | null;
}) {
  return (
    <div className="rounded-xl border bg-[#07101B]/90 overflow-hidden flex flex-col" style={{ borderColor: `${accent}35` }}>
      <div className="flex items-center gap-2.5 px-4 py-2 border-b" style={{ borderColor: `${accent}20`, background: `${accent}10` }}>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: '#F87171' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#FBBF24' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />
        </div>
        <div className="ml-2">
          <p className="text-[12px] font-mono text-text-primary leading-tight">{title}</p>
          <p className="text-[10px] font-mono text-text-tertiary">{subtitle}</p>
        </div>
      </div>
      <div
        className="flex-1 p-4 overflow-x-auto text-[11.5px] font-mono leading-relaxed"
        style={{
          opacity,
          transition: 'opacity 300ms ease, filter 300ms ease',
          filter: dim ? 'saturate(0.5) brightness(0.85)' : 'none',
        }}
      >
        {lines.map((line, i) => (
          <CodeLineView key={i} line={line} highlight={highlight} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function CodeLineView({ line, highlight, accent }: { line: CodeLine; highlight?: string | null; accent: string }) {
  const tonePalette: Record<CodeLine['tone'], string> = {
    directive: '#9FA9B8', ddl: '#7DD3F5', plain: '#D8E3EF', qualify: '#F59E0B',
    date: '#C084FC', comment: '#5F7086', cte: '#60A5FA', macro: '#93C5FD',
  };
  const isHighlight = !!line.tag && line.tag === highlight;
  return (
    <div
      className="whitespace-pre"
      style={{
        color: tonePalette[line.tone],
        background: isHighlight ? `${accent}22` : 'transparent',
        borderLeft: isHighlight ? `2px solid ${accent}` : '2px solid transparent',
        paddingLeft: 6,
        marginLeft: -6,
        transition: 'background-color 200ms ease, border-color 200ms ease',
      }}
    >
      {line.text || '\u00A0'}
    </div>
  );
}

function MorphArrow({ progress }: { progress: number }) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-2 px-2">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full border"
        style={{
          borderColor: '#29B5E8',
          background: 'rgba(41,181,232,0.12)',
          boxShadow: '0 0 22px rgba(41,181,232,0.35)',
        }}
      >
        <ArrowRight className="w-5 h-5 text-[#7DD3F5]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-16 bg-gradient-to-b from-[#29B5E8] to-transparent" />
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7DD3F5]">
          {Math.round(progress * 100)}%
        </p>
        <p className="text-[9.5px] font-mono uppercase tracking-wider text-text-tertiary text-center leading-tight max-w-[80px]">
          idioms<br />rewritten
        </p>
      </div>
    </div>
  );
}
