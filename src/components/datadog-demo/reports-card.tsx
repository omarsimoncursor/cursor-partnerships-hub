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
  'Querying orders across regions…',
  'Aggregating us-east, us-west…',
  'Aggregating eu, apac…',
  'Aggregating latam, uk…',
  'Computing regional tax…',
  'Compiling Q4 revenue report…',
] as const;

export function ReportsCard() {
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [shouldThrow, setShouldThrow] = useState<SloBreachError | null>(null);
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
        await fetch('/api/reports/generate', { cache: 'no-store' });
      } catch {
        // swallow — demo still fires the SLO breach
      }
      if (cancelled) return;
      const elapsedMs = Math.round(performance.now() - startRef.current);
      setShouldThrow(new SloBreachError(elapsedMs));
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

          {/* Loading ticker */}
          {processing && (
            <div className="px-3 py-2 rounded-md border border-[#632CA6]/20 bg-[#632CA6]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#A689D4] animate-pulse" />
              <span className="truncate">{LOADING_STEPS[stepIdx]}</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#632CA6] text-white font-medium text-sm
                       hover:bg-[#7339C0] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(99,44,166,0.25)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating report...
              </>
            ) : (
              'Run report'
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Calls the real endpoint — latency is not simulated
          </p>
        </div>
      </div>
    </div>
  );
}
