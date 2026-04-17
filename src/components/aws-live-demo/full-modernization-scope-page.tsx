'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Cloud, RotateCcw } from 'lucide-react';
import type { ModernizationScopeError, ModernizationScopePayload } from './assess-card';

interface FullModernizationScopePageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
}

function asScopeError(error: Error): ModernizationScopeError | null {
  if (error.name === 'ModernizationScopeError') {
    return error as ModernizationScopeError;
  }
  return null;
}

export function FullModernizationScopePage({
  error,
  onGo,
  onReset,
}: FullModernizationScopePageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const scope = asScopeError(error);
  const payload: ModernizationScopePayload | null = scope?.payload ?? null;

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const gsiYears = payload?.gsiBaseline.years ?? 5;
  const gsiUsd = payload?.gsiBaseline.usd ?? 14_000_000;
  const cursorMonths = payload?.cursorBaseline.months ?? 18;
  const cursorUsd = payload?.cursorBaseline.usd ?? 3_800_000;
  const pulledArr = payload?.pulledForwardManagedServiceArrUsd ?? 11_000_000;
  const onPremCost = payload?.annualOnPremCost ?? 8_400_000;
  const awsCost = payload?.proposedAnnualAwsCost ?? 2_100_000;
  const totalContexts = payload?.totalBoundedContexts ?? 38;
  const legacyLocM = ((payload?.legacyLoc ?? 1_182_400) / 1_000_000).toFixed(1);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0B0F14]">
      {/* Top AWS squid-ink bar */}
      <div className="h-1 w-full bg-[#FF9900] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF9900]/15 border border-[#FF9900]/35 mb-6">
            <Cloud className="w-8 h-8 text-[#FF9900]" />
          </div>

          {/* Label */}
          <p className="text-[11px] font-mono text-[#FF9900] uppercase tracking-[0.22em] mb-3">
            Modernization scope detected · MAP-eligible · 1 / {totalContexts} extracting
          </p>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            {gsiYears} years. ${(gsiUsd / 1_000_000).toFixed(0)}M.
            <br className="hidden md:block" /> The incumbent GSI&apos;s quote.
          </h1>

          <p className="text-base text-text-secondary mb-8 max-w-xl mx-auto">
            {legacyLocM}M LOC of Java EE on WebSphere 8.5 + Oracle 12c. {totalContexts} bounded-context candidates.
            <span className="text-text-primary font-medium"> ${(onPremCost / 1_000_000).toFixed(1)}M per year</span> on-prem run cost.
            Cursor compresses this into managed-service ARR before the CFO finishes reading the SOW.
          </p>

          {/* Four metric tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 text-left">
            <MetricTile
              label="GSI baseline"
              value={`${gsiYears}y · $${(gsiUsd / 1_000_000).toFixed(0)}M`}
              sub="Accenture / Deloitte quote"
              tone="amber"
            />
            <MetricTile
              label="With Cursor"
              value={`${cursorMonths}mo · $${(cursorUsd / 1_000_000).toFixed(1)}M`}
              sub={`${Math.round(((gsiYears * 12) / cursorMonths) * 10) / 10}× faster`}
              tone="green"
            />
            <MetricTile
              label="Pulled-forward ARR"
              value={`~$${(pulledArr / 1_000_000).toFixed(0)}M`}
              sub="42 months earlier"
              tone="orange"
            />
            <MetricTile
              label="Run cost swing"
              value={`$${(onPremCost / 1_000_000).toFixed(1)}M → $${(awsCost / 1_000_000).toFixed(1)}M`}
              sub="annual · managed services"
              tone="blue"
            />
          </div>

          {/* Callout strip — realistic timeline framing */}
          <div className="rounded-xl border border-[#0972D3]/25 bg-[#0972D3]/5 p-4 mb-8 text-left">
            <p className="text-[11px] font-mono text-[#4C9AFF] uppercase tracking-[0.18em] mb-1">
              Realistic enterprise timeline · not a 2-minute demo
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              Watch the{' '}
              <span className="font-mono text-[#FF9900]">OrdersService</span> bounded context ship to prod in{' '}
              <span className="font-semibold text-[#FF9900]">~22 calendar days</span> — agent work compressed where it can be, plus{' '}
              <span className="font-semibold text-[#FF9900]">4 explicit human review gates</span> (architecture, security, FinOps, cutover) and a senior code review at merge. Traditional baseline for the same context: <span className="line-through text-text-tertiary">~16 weeks</span>.
            </p>
            <p className="text-[11px] text-text-tertiary mt-2">
              Per-context cadence × parallelization across teams = ~18 months for the 38-context portfolio. Console plays the realistic timeline in about 20 seconds so you can see every gate.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#FF9900] text-[#0B0F14] font-semibold text-base
                         hover:bg-[#FFAC33] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(255,153,0,0.4)] hover:shadow-[0_0_48px_rgba(255,153,0,0.55)]
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
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'amber' | 'green' | 'orange' | 'blue';
}) {
  const color =
    tone === 'amber'
      ? 'text-[#F5A623]'
      : tone === 'green'
        ? 'text-[#00A86B]'
        : tone === 'orange'
          ? 'text-[#FF9900]'
          : 'text-[#4C9AFF]';
  const border =
    tone === 'amber'
      ? 'border-[#F5A623]/30'
      : tone === 'green'
        ? 'border-[#00A86B]/30'
        : tone === 'orange'
          ? 'border-[#FF9900]/30'
          : 'border-[#4C9AFF]/30';
  return (
    <div className={`rounded-xl border ${border} bg-[#232F3E]/60 p-3.5`}>
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className={`text-base md:text-lg font-bold font-mono ${color}`}>{value}</p>
      <p className="text-[10.5px] text-text-tertiary mt-1">{sub}</p>
    </div>
  );
}
