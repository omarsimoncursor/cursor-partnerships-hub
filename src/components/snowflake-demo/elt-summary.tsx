'use client';

import { Snowflake, ExternalLink, RotateCcw } from 'lucide-react';
import type { EltRiskError } from './audit-card';

interface EltSummaryProps {
  error: Error;
  onReset: () => void;
  onViewSnowflake?: () => void;
}

function asEltError(error: Error): EltRiskError | null {
  if (error.name === 'EltRiskError') {
    return error as EltRiskError;
  }
  return null;
}

export function EltSummary({ error, onReset, onViewSnowflake }: EltSummaryProps) {
  const elt = asEltError(error);
  const payload = elt?.payload;
  const files = payload?.filesAnalyzed ?? { bteq: 247, tsql: 412, informatica: 184, ssis: 68 };
  const idioms = payload?.dialectIdioms ?? [
    'QUALIFY',
    'COLLECT STATS',
    'MULTISET VOLATILE',
    'MERGE',
    'CROSS APPLY',
    'OPENJSON',
    'Teradata date math',
  ];
  const annualLegacy = payload?.annualLegacyCost ?? 8_200_000;
  const annualSnow = payload?.proposedAnnualSnowflakeCost ?? 2_300_000;
  const firstScript = payload?.firstScriptToMigrate ?? 'daily_revenue_rollup';

  return (
    <div className="w-full h-full rounded-xl border border-[#29B5E8]/25 bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#29B5E8]/25 bg-[#29B5E8]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#29B5E8]/20 border border-[#29B5E8]/40 flex items-center justify-center">
            <Snowflake className="w-3.5 h-3.5 text-[#29B5E8]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#7DD3F5] leading-none mb-0.5">
              ELT modernization scope
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              snowflake · account acme-analytics
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* File counts */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Legacy repository
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="BTEQ" value={String(files.bteq)} color="text-[#7DD3F5]" />
            <Stat label="T-SQL" value={String(files.tsql)} color="text-[#7DD3F5]" />
            <Stat label="Informatica" value={String(files.informatica)} color="text-text-primary" />
            <Stat label="SSIS" value={String(files.ssis)} color="text-text-primary" />
          </div>
        </div>

        {/* Migration target */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            First asset picked
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-[#7DD3F5] break-words">
            {firstScript}.bteq → models/marts/fct_daily_revenue.sql
          </div>
        </div>

        {/* Idiom chips */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Dialect idioms to rewrite
          </p>
          <div className="flex flex-wrap gap-1.5">
            {idioms.map(i => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#29B5E8]/25 bg-[#29B5E8]/10 text-[#7DD3F5]"
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        {/* Cost swing */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Annual run cost swing
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="flex items-center justify-between">
              <span>Legacy (TD + Informatica + SSIS ops)</span>
              <span className="text-accent-amber">${(annualLegacy / 1_000_000).toFixed(1)}M/yr</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Snowflake credits (steady state)</span>
              <span className="text-[#4ADE80]">${(annualSnow / 1_000_000).toFixed(1)}M/yr</span>
            </div>
            <div className="text-text-tertiary pt-1 border-t border-dark-border mt-1">
              −{Math.round(((annualLegacy - annualSnow) / annualLegacy) * 100)}% · every
              modernized asset shifts spend to Snowflake credits
            </div>
          </div>
        </div>

        {/* First asset focus */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Target shape
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="text-[#7DD3F5]">models/staging/stg_revenue_events.sql</div>
            <div className="text-[#7DD3F5]">models/marts/fct_daily_revenue.sql</div>
            <div>└─ dbt tests + unique_key</div>
            <div>└─ Cortex semantic diff macro</div>
            <div className="text-text-tertiary">└─ XS warehouse · est. 0.0042 credits</div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewSnowflake}
          className="w-full py-2 px-3 rounded-lg bg-[#29B5E8] text-[#0A1419] font-semibold text-sm
                     hover:bg-[#4FC3EE] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Snowsight workspace
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-3 rounded-lg border border-dark-border text-text-secondary
                     font-medium text-sm hover:bg-dark-surface-hover hover:text-text-primary
                     transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset demo
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2.5 rounded-md bg-dark-bg">
      <p className="text-[10px] text-text-tertiary uppercase mb-0.5">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
