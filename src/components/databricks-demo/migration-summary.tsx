'use client';

import { Flame, ExternalLink, RotateCcw } from 'lucide-react';
import type { MigrationScopeError, MigrationScopePayload } from './migration-card';

interface MigrationSummaryProps {
  error: Error;
  onReset: () => void;
  onViewWorkspace?: () => void;
}

function asMigrationError(error: Error): MigrationScopeError | null {
  if (error.name === 'MigrationScopeError' && 'payload' in error) {
    return error as MigrationScopeError;
  }
  return null;
}

const FALLBACK: MigrationScopePayload = {
  legacyLoc: 47_412,
  filesAnalyzed: { plsql: 184, informatica: 312, other: 97 },
  dialectIdioms: [],
  gsiBaseline: { years: 5, usd: 22_000_000 },
  cursorBaseline: { months: 18, usd: 6_800_000 },
  annualOnPremCost: 14_700_000,
  proposedAnnualDatabricksCost: 3_900_000,
  pulledForwardArr: 45_000_000,
  pulledForwardArrMonths: 42,
  firstWorkflowToMigrate: 'customer_rfm_segmentation',
  totalOracleTb: 18,
};

function fmtUsdM(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(usd % 1_000_000 === 0 ? 0 : 1)}M`;
  return `$${(usd / 1_000).toFixed(0)}K`;
}

export function MigrationSummary({ error, onReset, onViewWorkspace }: MigrationSummaryProps) {
  const mig = asMigrationError(error);
  const p = mig?.payload ?? FALLBACK;

  return (
    <div className="w-full h-full rounded-xl border border-[#FF3621]/25 bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#FF3621]/25 bg-[#FF3621]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#FF3621]/20 border border-[#FF3621]/35 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-[#FF6B55]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#FF6B55] leading-none mb-0.5">
              Workflow #1 in flight · 1 of {p.filesAnalyzed.informatica}
            </p>
            <p className="text-[11px] text-text-tertiary font-mono truncate">
              databricks · acme-dw-prod · ~18-day enterprise lifecycle
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Current workflow */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            First workflow in flight
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-[#FF6B55] break-words">
            {p.firstWorkflowToMigrate}
          </div>
        </div>

        {/* Baseline comparison */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Baseline · GSI vs Cursor
          </p>
          <BaselineBars
            gsiYears={p.gsiBaseline.years}
            cursorMonths={p.cursorBaseline.months}
          />
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="GSI baseline"
            value={`${p.gsiBaseline.years}y · ${fmtUsdM(p.gsiBaseline.usd)}`}
            color="text-[#FF8A5C]"
          />
          <Stat
            label="With Cursor"
            value={`${p.cursorBaseline.months}m · ${fmtUsdM(p.cursorBaseline.usd)}`}
            color="text-[#57D9A3]"
          />
          <Stat
            label="Pulled-forward ARR"
            value={`${fmtUsdM(p.pulledForwardArr)}+`}
            color="text-[#FF6B55]"
            note={`${p.pulledForwardArrMonths}m sooner`}
          />
          <Stat
            label="Annual run-cost swing"
            value={`${fmtUsdM(p.annualOnPremCost)} → ${fmtUsdM(p.proposedAnnualDatabricksCost)}`}
            color="text-[#57D9A3]"
          />
        </div>

        {/* Per-workflow lifecycle */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Per-workflow lifecycle (calendar)
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div><span className="text-[#FF6B55]">Day 0</span> · agent compute (~40 min): transpile + harness + PR</div>
            <div><span className="text-[#FF6B55]">Day 1–2</span> · code review (named data-platform reviewer)</div>
            <div><span className="text-[#FF6B55]">Day 2–16</span> · DLT shadow / parallel run vs Oracle (2 refreshes)</div>
            <div><span className="text-[#FF6B55]">Day 16–17</span> · 3 stakeholder sign-offs · CAB notify</div>
            <div><span className="text-[#FF6B55]">Day 18</span> · cutover window · Oracle archived (30-day)</div>
          </div>
        </div>

        {/* Target shape */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Target shape
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="text-[#FF6B55]">customer_rfm_pipeline.py · DLT</div>
            <div>└─ bronze.customers · silver.rfm_scores · gold.rfm_scores</div>
            <div className="text-text-tertiary">└─ Unity Catalog · main.customer_analytics</div>
            <div className="text-text-tertiary">└─ Photon serverless · DBR 14.3 LTS</div>
          </div>
        </div>

        {/* Idioms tagged */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Dialect idioms in first proc
          </p>
          <div className="flex flex-wrap gap-1">
            {['cursor loops', 'MERGE', 'CONNECT BY', 'ROWNUM', 'NVL/DECODE', 'global temp tables'].map(i => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#FFB98E] bg-[#FF8A5C]/10 border border-[#FF8A5C]/25"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewWorkspace}
          className="w-full py-2 px-3 rounded-lg bg-[#FF3621] text-white font-medium text-sm
                     hover:bg-[#FF5A3C] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Databricks workspace
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

function Stat({
  label,
  value,
  color,
  note,
}: {
  label: string;
  value: string;
  color: string;
  note?: string;
}) {
  return (
    <div className="p-2.5 rounded-md bg-dark-bg">
      <p className="text-[10px] text-text-tertiary uppercase mb-0.5">{label}</p>
      <p className={`text-[12px] font-bold font-mono ${color}`}>{value}</p>
      {note && <p className="text-[10px] text-text-tertiary mt-0.5 font-mono">{note}</p>}
    </div>
  );
}

// Horizontal bar chart showing GSI years vs Cursor months on a shared timeline.
function BaselineBars({ gsiYears, cursorMonths }: { gsiYears: number; cursorMonths: number }) {
  const totalMonths = gsiYears * 12;
  const cursorPct = Math.max(4, (cursorMonths / totalMonths) * 100);

  return (
    <div className="p-2.5 rounded-md bg-dark-bg">
      <div className="mb-2 flex items-center justify-between text-[10px] font-mono">
        <span className="text-text-tertiary">Now</span>
        <span className="text-text-tertiary">+{gsiYears * 12}m</span>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#FFB98E]">GSI</span>
            <span className="text-[10px] font-mono text-[#FFB98E]">{gsiYears}y · {gsiYears * 12}m</span>
          </div>
          <div className="h-2 rounded-full bg-[#FF8A5C]/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#FF8A5C]/80 to-[#FF8A5C]/40"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#57D9A3]">Cursor</span>
            <span className="text-[10px] font-mono text-[#57D9A3]">{cursorMonths}m</span>
          </div>
          <div className="h-2 rounded-full bg-[#00A972]/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#00A972]/80 to-[#00A972]/40"
              style={{ width: `${cursorPct}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-text-tertiary font-mono">
        {gsiYears * 12 - cursorMonths} months of Databricks consumption pulled forward
      </p>
    </div>
  );
}
