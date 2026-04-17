'use client';

import { useEffect, useRef } from 'react';
import { Flame, ArrowRight, RotateCcw } from 'lucide-react';
import type { MigrationScopeError, MigrationScopePayload } from './migration-card';

interface FullMigrationScopePageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
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

export function FullMigrationScopePage({ error, onGo, onReset }: FullMigrationScopePageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const mig = asMigrationError(error);
  const p = mig?.payload ?? FALLBACK;

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg">
      {/* Top brick-red bar */}
      <div className="h-1 w-full bg-[#FF3621] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF3621]/15 border border-[#FF3621]/40 mb-6">
            <Flame className="w-8 h-8 text-[#FF6B55]" />
          </div>

          {/* Scope label */}
          <p className="text-[11px] font-mono text-[#FF6B55] uppercase tracking-[0.22em] mb-3">
            Migration scope reality · ACME data platform · P0
          </p>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 leading-[1.1]">
            Migration scope detected:{' '}
            <span className="text-[#FF6B55]">{p.gsiBaseline.years} years</span>,{' '}
            <span className="text-[#FF6B55]">{fmtUsdM(p.gsiBaseline.usd)}</span>{' '}
            with the incumbent GSI.
          </h1>

          <p className="text-base text-text-secondary mb-8 max-w-xl mx-auto leading-relaxed">
            <span className="font-mono text-text-primary">
              {p.legacyLoc.toLocaleString()}
            </span>{' '}
            lines of Oracle PL/SQL ·{' '}
            <span className="font-mono text-text-primary">
              {p.filesAnalyzed.informatica}
            </span>{' '}
            Informatica workflows ·{' '}
            <span className="font-mono text-text-primary">{p.totalOracleTb} TB</span>{' '}
            Oracle · <span className="font-mono text-text-primary">{fmtUsdM(p.annualOnPremCost)}/yr</span> on-prem run cost.
          </p>

          {/* Metric tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
            <ScopeTile
              eyebrow="Incumbent GSI baseline"
              headline={`${p.gsiBaseline.years} years · ${fmtUsdM(p.gsiBaseline.usd)}`}
              detail="Fixed-bid migration quote from the GSI. Requires displacing in-house engineering. Does not include annual on-prem costs that keep running until cutover."
              tone="amber"
            />
            <ScopeTile
              eyebrow="Cursor-accelerated baseline"
              headline={`${p.cursorBaseline.months} months · ${fmtUsdM(p.cursorBaseline.usd)}`}
              detail="Your engineers stay on the keyboard. Agent orchestrates Databricks MCP + dialect transpile + row-equivalence verification per workflow."
              tone="green"
            />
            <ScopeTile
              eyebrow="Pulled-forward Databricks ARR"
              headline={`${fmtUsdM(p.pulledForwardArr)}+ · ${p.pulledForwardArrMonths} months sooner`}
              detail="Every quarter of migration compressed is a quarter of Databricks consumption earlier. Based on $15M/yr committed-use at the 42-month gap vs GSI plan."
              tone="brand"
            />
            <ScopeTile
              eyebrow="Annual run-cost swing"
              headline={`${fmtUsdM(p.annualOnPremCost)}/yr → ${fmtUsdM(p.proposedAnnualDatabricksCost)}/yr`}
              detail="Oracle licensing + Informatica agents + on-prem compute retired in favor of Databricks SQL Warehouse + DLT + Photon on serverless DBU."
              tone="green"
            />
          </div>

          {/* Callout strip */}
          <div className="mx-auto max-w-2xl rounded-xl border border-[#FF3621]/25 bg-[#1B0D0B] p-4 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B55] animate-pulse" />
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                Proof · one stored proc through the full enterprise lifecycle
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Watch Cursor walk <span className="font-mono text-[#FF6B55]">{p.firstWorkflowToMigrate}</span>{' '}
              through an <span className="text-text-primary font-semibold">~18-day enterprise migration lifecycle</span> — agent compute (~40 min) → named code reviewer → 2-week DLT shadow / parallel run vs Oracle → 3 stakeholder sign-offs → CAB-approved cutover. Played back at warp speed so you can see the whole shape in ~30 seconds.
              <span className="text-text-tertiary ml-1">
                1 of {p.filesAnalyzed.informatica} Informatica workflows. ~12 in flight at any time → portfolio finishes in {p.cursorBaseline.months} months.
              </span>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Live demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
            Watch a Cursor agent migrate this workflow end-to-end — verified against the Oracle snapshot.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#FF3621] text-white font-semibold text-base
                         hover:bg-[#FF5A3C] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_36px_rgba(255,54,33,0.45)] hover:shadow-[0_0_52px_rgba(255,54,33,0.6)]
                         cursor-pointer"
            >
              Watch Cursor migrate this
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onReset}
              className="px-5 py-3 rounded-full border border-dark-border text-text-secondary font-medium text-sm
                         hover:bg-dark-surface-hover hover:text-text-primary transition-colors cursor-pointer
                         flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScopeTile({
  eyebrow,
  headline,
  detail,
  tone,
}: {
  eyebrow: string;
  headline: string;
  detail: string;
  tone: 'amber' | 'green' | 'brand';
}) {
  const toneCls =
    tone === 'amber'
      ? 'border-[#FF8A5C]/25 bg-[#1B1412] text-[#FFB98E]'
      : tone === 'green'
        ? 'border-[#00A972]/25 bg-[#0E1A14] text-[#57D9A3]'
        : 'border-[#FF3621]/35 bg-[#1B0D0B] text-[#FF6B55]';
  return (
    <div className={`rounded-xl border p-4 ${toneCls}`}>
      <p className="text-[10.5px] font-mono uppercase tracking-[0.14em] mb-1.5 opacity-90">
        {eyebrow}
      </p>
      <p className="text-xl font-semibold font-mono text-text-primary mb-1.5 leading-tight">
        {headline}
      </p>
      <p className="text-[12.5px] text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
