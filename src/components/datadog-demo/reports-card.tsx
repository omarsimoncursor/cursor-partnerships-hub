'use client';

import { useEffect, useRef, useState } from 'react';
import { BarChart3, Loader2, TrendingUp } from 'lucide-react';

export class SloBreachError extends Error {
  elapsedMs: number;
  p99Ms: number;
  sloTargetMs: number;
  endpoint: string;

  constructor(elapsedMs: number) {
    const p99 = Math.max(elapsedMs, 7412);
    super(`P99 latency 7,412ms exceeded SLO target 500ms (14.8x over budget) on /api/reports/generate`);
    this.name = 'SloBreachError';
    this.elapsedMs = elapsedMs;
    this.p99Ms = p99;
    this.sloTargetMs = 500;
    this.endpoint = '/api/reports/generate';
  }
}

const LOADING_STEPS = [
  'Pulling orders for us-east and us-west…',
  'Pulling orders for eu and apac…',
  'Pulling orders for latam and uk…',
  'Calculating tax across regions…',
  'Building the revenue chart…',
  'This is taking longer than 500ms…',
  'Datadog is watching the latency climb…',
] as const;

interface ReportsCardProps {
  /**
   * Called once the simulated request completes and the SLO breach is detected.
   * Replaces the older throw-and-catch error-boundary handshake.
   */
  onBreach?: (error: SloBreachError) => void;
}

export function ReportsCard({ onBreach }: ReportsCardProps = {}) {
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number>(0);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!processing) return;
    startRef.current = performance.now();
    firedRef.current = false;

    const stepInterval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 1100);

    const elapsedInterval = setInterval(() => {
      setElapsedMs(performance.now() - startRef.current);
    }, 50);

    let cancelled = false;
    (async () => {
      try {
        await fetch('/api/reports/generate', { cache: 'no-store' });
      } catch {
        // Swallow — the demo still fires the SLO breach below.
      }
      if (cancelled || firedRef.current) return;
      firedRef.current = true;
      const elapsed = Math.round(performance.now() - startRef.current);
      onBreach?.(new SloBreachError(elapsed));
    })();

    return () => {
      cancelled = true;
      clearInterval(stepInterval);
      clearInterval(elapsedInterval);
    };
  }, [processing, onBreach]);

  function handleRun() {
    setProcessing(true);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#632CA6]/15 border border-[#632CA6]/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#A689D4]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Analytics</p>
              <p className="text-xs text-text-tertiary">Revenue reporting · Q4 demo</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">Generate Q4 revenue report</p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Aggregate orders across all 6 regions and render the consolidated chart.
              Endpoint: <span className="font-mono text-text-secondary">/api/reports/generate</span>
            </p>
          </div>

          {/* Region chips */}
          <div className="flex flex-wrap gap-1.5">
            {['us-east', 'us-west', 'eu', 'apac', 'latam', 'uk'].map(r => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-bg border border-dark-border text-[10px] font-mono text-text-tertiary"
              >
                <span className="w-1 h-1 rounded-full bg-[#A689D4]/70" />
                {r}
              </span>
            ))}
          </div>

          {/* SLO badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-text-tertiary" />
              <div>
                <p className="text-[11px] font-medium text-text-primary leading-none mb-0.5">SLO target</p>
                <p className="text-[10px] text-text-tertiary">P99 latency · /api/reports/generate</p>
              </div>
            </div>
            <span className="text-xs text-accent-green font-mono">&lt; 500ms</span>
          </div>

          {/* Live progress while running */}
          {processing && (
            <LiveProgress elapsedMs={elapsedMs} step={LOADING_STEPS[stepIdx]} />
          )}

          {/* CTA */}
          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#632CA6] text-white font-medium text-sm hover:bg-[#7339C0] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_24px_rgba(99,44,166,0.25)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating report ({(elapsedMs / 1000).toFixed(1)}s)
              </>
            ) : (
              'Run report'
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            {processing
              ? 'Hold on — this is a real request, hitting a real (slow) endpoint.'
              : 'Calls the real endpoint, latency is not simulated.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Live progress UI shown while the request is in flight. Designed to make it
// crystal-clear that the demo is doing something — a moving bar, ticking
// elapsed counter, and a plain-English description of the current step.
function LiveProgress({ elapsedMs, step }: { elapsedMs: number; step: string }) {
  // Cap the bar at ~8s for visual headroom; SLO line sits at 500ms.
  const CAP = 8000;
  const SLO = 500;
  const pct = Math.min(100, (elapsedMs / CAP) * 100);
  const sloPct = (SLO / CAP) * 100;
  const overBudget = elapsedMs > SLO;

  return (
    <div className="space-y-2.5 rounded-lg border border-[#632CA6]/30 bg-[#632CA6]/[0.06] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`shrink-0 w-1.5 h-1.5 rounded-full ${
              overBudget ? 'bg-accent-amber' : 'bg-[#A689D4]'
            } animate-pulse`}
          />
          <span className="text-[12px] font-medium text-text-primary truncate">{step}</span>
        </div>
        <span
          className={`shrink-0 font-mono text-[11px] tabular-nums ${
            overBudget ? 'text-accent-amber' : 'text-[#A689D4]'
          }`}
        >
          {(elapsedMs / 1000).toFixed(2)}s
        </span>
      </div>

      {/* Progress bar with a visible SLO marker line */}
      <div className="relative h-2 rounded-full bg-dark-bg overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear"
          style={{
            width: `${pct}%`,
            background: overBudget
              ? 'linear-gradient(90deg, #A689D4 0%, #F5A623 80%)'
              : '#A689D4',
          }}
        />
        {/* SLO target line */}
        <div
          className="absolute inset-y-0 w-px bg-accent-green/60"
          style={{ left: `${sloPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
        <span className="text-accent-green">SLO &lt; 500ms</span>
        <span>{overBudget ? `${(elapsedMs / SLO).toFixed(1)}× over budget` : 'within budget'}</span>
      </div>
    </div>
  );
}
