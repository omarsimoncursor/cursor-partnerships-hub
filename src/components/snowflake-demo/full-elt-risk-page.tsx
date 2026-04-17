'use client';

import { useEffect, useRef } from 'react';
import { Snowflake, ArrowRight, RotateCcw } from 'lucide-react';
import type { EltRiskError } from './audit-card';

interface FullEltRiskPageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
}

function asEltError(error: Error): EltRiskError | null {
  if (error.name === 'EltRiskError') {
    return error as EltRiskError;
  }
  return null;
}

export function FullEltRiskPage({ error, onGo, onReset }: FullEltRiskPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const elt = asEltError(error);
  const payload = elt?.payload;

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const brokenCount = payload?.brokenPipelineCount ?? 4;
  const staleH = payload?.stalestPipelineHours ?? 14;
  const staleM = payload?.stalestPipelineMinutes ?? 22;
  const annualLegacy = payload?.annualLegacyCost ?? 8_200_000;
  const annualSnow = payload?.proposedAnnualSnowflakeCost ?? 2_300_000;
  const files = payload?.filesAnalyzed ?? { bteq: 247, tsql: 412, informatica: 184, ssis: 68 };
  const gsi = payload?.gsiBaseline ?? { years: 4, usd: 18_000_000 };
  const cursor = payload?.cursorBaseline ?? { months: 15, usd: 5_400_000 };
  const pulledForwardUsd = payload?.pulledForwardCreditsUsd ?? 16_000_000;
  const pulledForwardMonths = payload?.pulledForwardMonths ?? 33;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg">
      {/* Top Snowflake bar */}
      <div className="h-1 w-full bg-[#29B5E8] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-14">
        <div className="max-w-4xl w-full text-center">
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#29B5E8]/15 border border-[#29B5E8]/40 mb-6">
            <Snowflake className="w-8 h-8 text-[#29B5E8]" />
          </div>

          {/* Breach label */}
          <p className="text-[11px] font-mono text-[#29B5E8] uppercase tracking-[0.22em] mb-3">
            Legacy ELT platform risk · modernization scope · P1
          </p>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-3 leading-tight">
            {brokenCount} broken pipelines, {staleH}h {staleM}m stale revenue data,
            <br className="hidden md:block" />
            <span className="text-[#29B5E8]"> ${(annualLegacy / 1_000_000).toFixed(1)}M/yr</span>{' '}
            to keep it limping.
          </h1>

          <p className="text-sm md:text-base text-text-secondary mb-8 max-w-2xl mx-auto">
            {payload?.legacyLoc?.toLocaleString() ?? '63,180'} lines across Teradata BTEQ (
            {files.bteq}), T-SQL ({files.tsql}), Informatica ({files.informatica}), SSIS ({files.ssis})
            · daily rollup last succeeded {staleH}h {staleM}m ago.
          </p>

          {/* Metric grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 max-w-4xl mx-auto">
            <MetricTile
              label="GSI baseline"
              primary={`${gsi.years} years`}
              secondary={`$${(gsi.usd / 1_000_000).toFixed(0)}M quoted`}
              tone="legacy"
            />
            <MetricTile
              label="Cursor-accelerated"
              primary={`${cursor.months} months`}
              secondary={`$${(cursor.usd / 1_000_000).toFixed(1)}M compute + review`}
              tone="snowflake"
            />
            <MetricTile
              label="Pulled-forward credits"
              primary={`~$${(pulledForwardUsd / 1_000_000).toFixed(0)}M`}
              secondary={`${pulledForwardMonths} months earlier`}
              tone="snowflake"
            />
            <MetricTile
              label="Annual run cost swing"
              primary={`$${(annualLegacy / 1_000_000).toFixed(1)}M → $${(annualSnow / 1_000_000).toFixed(1)}M`}
              secondary={`−${Math.round(((annualLegacy - annualSnow) / annualLegacy) * 100)}%`}
              tone="green"
            />
          </div>

          {/* Callout */}
          <div className="mx-auto max-w-3xl rounded-xl border border-[#29B5E8]/25 bg-[#11567F]/15 p-4 mb-10 text-left">
            <p className="text-[12px] font-mono text-[#7DD3F5] uppercase tracking-wider mb-1.5">
              Proof — one full asset, end to end
            </p>
            <p className="text-sm text-text-primary mb-2">
              Watch Cursor modernize one BTEQ + one T-SQL proc + one Informatica mapping into a
              Snowflake-native dbt DAG with <strong>Cortex-verified semantic equivalence</strong>{' '}
              and a 1% row-level diff. Two human review checkpoints. Two dbt iteration cycles. PR
              approved and queued for the Friday change window.
            </p>
            <p className="text-[12px] text-text-secondary font-mono">
              <span className="text-[#7DD3F5]">~4h 03m wall clock</span>{' '}
              <span className="text-text-tertiary">·</span>{' '}
              <span className="text-text-primary">2h 16m agent compute</span>{' '}
              <span className="text-text-tertiary">·</span>{' '}
              <span className="text-accent-amber">1h 47m human review</span>{' '}
              <span className="text-text-tertiary">·</span>{' '}
              <span className="text-text-tertiary">vs GSI baseline 2 weeks · $58K per asset</span>
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#29B5E8] text-[#0A1419] font-semibold text-base
                         hover:bg-[#4FC3EE] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(41,181,232,0.45)] hover:shadow-[0_0_48px_rgba(41,181,232,0.6)]
                         cursor-pointer"
            >
              Watch Cursor modernize this
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

function MetricTile({
  label,
  primary,
  secondary,
  tone,
}: {
  label: string;
  primary: string;
  secondary: string;
  tone: 'legacy' | 'snowflake' | 'green';
}) {
  const toneStyles =
    tone === 'legacy'
      ? 'border-accent-amber/25 bg-accent-amber/5'
      : tone === 'green'
        ? 'border-[#4ADE80]/25 bg-[#4ADE80]/5'
        : 'border-[#29B5E8]/25 bg-[#11567F]/15';
  const primaryColor =
    tone === 'legacy'
      ? 'text-accent-amber'
      : tone === 'green'
        ? 'text-[#4ADE80]'
        : 'text-[#7DD3F5]';
  return (
    <div className={`rounded-xl border ${toneStyles} p-4 text-left`}>
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className={`text-xl font-bold font-mono ${primaryColor} leading-tight mb-1`}>
        {primary}
      </p>
      <p className="text-[11px] text-text-secondary leading-snug">{secondary}</p>
    </div>
  );
}
