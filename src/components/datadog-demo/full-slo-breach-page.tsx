'use client';

import { useEffect, useRef } from 'react';
import { Activity, ArrowRight, ExternalLink, RotateCcw } from 'lucide-react';
import type { SloBreachError } from './reports-card';

interface FullSloBreachPageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
  onViewDatadog?: () => void;
}

function asSloError(error: Error): SloBreachError | null {
  if (error.name === 'SloBreachError') {
    return error as SloBreachError;
  }
  return null;
}

export function FullSloBreachPage({ error, onGo, onReset, onViewDatadog }: FullSloBreachPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const slo = asSloError(error);
  const p99 = slo?.p99Ms ?? 7412;
  const target = slo?.sloTargetMs ?? 500;
  const multiple = (p99 / target).toFixed(1);

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg">
      {/* Top purple Datadog bar */}
      <div className="h-1 w-full bg-[#632CA6] sticky top-0" />

      {/* Main area — min-h keeps content centered when it fits, scrolls when it overflows */}
      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#632CA6]/15 border border-[#632CA6]/35 mb-6">
            <Activity className="w-8 h-8 text-[#A689D4]" />
          </div>

          {/* Breach label */}
          <p className="text-[11px] font-mono text-accent-amber uppercase tracking-[0.22em] mb-3">
            Latency SLO breach · monitor-ID 3f12-8a2c · P1
          </p>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            P99 latency breached on /api/reports/generate.
          </h1>

          <p className="text-base text-text-secondary mb-8 max-w-lg mx-auto">
            Datadog detected the regression and fired the webhook. Incident opened,
            PagerDuty paged, engineer notified.
          </p>

          {/* Metric card — the signature SLO summary */}
          <div className="mx-auto max-w-xl rounded-xl border border-[#632CA6]/25 bg-[#1B1424] p-5 mb-10 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                Monitor · APM · web.request
              </span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <Metric label="P99 Latency" value={`${(p99 / 1000).toFixed(2)}s`} tone="amber" big />
              <Metric label="SLO Target" value={`${target}ms`} tone="green" />
              <Metric label="Over Budget" value={`${multiple}×`} tone="amber" />
            </div>

            <p className="font-mono text-[12px] text-text-secondary break-words mb-1">
              /api/reports/generate
              <span className="text-text-tertiary"> · P99 · {p99.toLocaleString()}ms · target {target}ms</span>
            </p>
            <p className="font-mono text-[11px] text-text-tertiary">
              Root cause (APM trace): sequential await chain in{' '}
              <span className="text-[#A689D4]">src/lib/demo/aggregate-orders.ts</span> — 6 dependent DB calls serialized where parallelism was safe.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* CTA */}
          <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
            Watch a Cursor agent triage, patch, and ship a verified fix in under two minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#632CA6] text-white font-semibold text-base
                         hover:bg-[#7339C0] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(99,44,166,0.4)] hover:shadow-[0_0_48px_rgba(99,44,166,0.55)]
                         cursor-pointer"
            >
              Watch Cursor triage this
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {onViewDatadog && (
              <button
                onClick={onViewDatadog}
                className="px-5 py-3 rounded-full border border-[#632CA6]/40 text-[#A689D4] font-medium text-sm
                           hover:bg-[#632CA6]/10 hover:border-[#632CA6]/60 transition-colors cursor-pointer
                           flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View issue in Datadog
              </button>
            )}

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

function Metric({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone: 'amber' | 'green';
  big?: boolean;
}) {
  const color = tone === 'amber' ? 'text-accent-amber' : 'text-accent-green';
  return (
    <div>
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`${big ? 'text-2xl' : 'text-lg'} font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
