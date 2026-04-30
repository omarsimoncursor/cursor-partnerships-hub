'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StageProps } from './types';

// 24 buckets of "p99 latency" — first 18 are the breach period, last 6
// reveal post-fix recovery once the agent completes.
const BEFORE = [220, 240, 280, 320, 360, 410, 470, 540, 612, 680, 720, 760, 790, 802, 812, 815, 808, 798];
const AFTER = [620, 410, 240, 188, 172, 168];

export function DatadogStage({ totalSteps, activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const isRunning = status === 'running';

  const series = useMemo(() => {
    if (isComplete) return [...BEFORE, ...AFTER];
    return BEFORE;
  }, [isComplete]);

  const max = 900;
  const barW = 100 / 24;

  // Pulse the cursor scan indicator across the chart while the agent runs
  const [scanX, setScanX] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = ((now - t0) / 2200) % 1;
      setScanX(t * 100);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isRunning]);

  // Step-keyed flame frames: shrinking widths as the agent identifies the slow span
  const flameOps = [
    { name: 'POST /api/checkout', w: 100, color: brand },
    { name: 'authMiddleware', w: 8, color: '#a78bfa' },
    { name: 'CartService.totalize', w: 78, color: brand },
    { name: 'PricingClient.fetch', w: 64, color: '#f472b6' },
    { name: 'TaxLookup.lookup', w: 52, color: '#fbbf24' },
    { name: 'fx.cacheMiss', w: 38, color: '#f87171' },
  ];

  const highlightFlameFrom = activeStep >= 1 ? 4 : -1;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      {/* Browser-ish chrome */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          app.datadoghq.com / {account.toLowerCase()} / apm / checkout
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}25`, color: brand }}>
          DATADOG
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* SLO header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">SLO {'\u2022'} checkout p99 latency</p>
            <p className="text-2xl font-bold text-text-primary tabular-nums">
              {isComplete ? '168' : '812'}<span className="text-xs text-text-tertiary ml-1">ms</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Target</p>
            <p className="text-sm font-mono text-text-secondary">{'<'} 300 ms</p>
          </div>
          <div
            className="text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider"
            style={{
              background: isComplete ? '#4ade8022' : '#f8717122',
              color: isComplete ? '#4ade80' : '#f87171',
            }}
          >
            {isComplete ? 'recovered' : 'breaching'}
          </div>
        </div>

        {/* p99 timeline chart */}
        <div className="relative h-28 rounded-lg bg-dark-surface border border-dark-border overflow-hidden">
          {/* SLO target line at 300ms */}
          <div
            className="absolute left-0 right-0 border-t border-dashed"
            style={{
              top: `${100 - (300 / max) * 100}%`,
              borderColor: 'rgba(74,222,128,0.45)',
            }}
          />
          <span className="absolute right-1 top-[50%] -translate-y-full text-[9px] font-mono text-accent-green/70">
            SLO 300ms
          </span>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {series.map((v, i) => {
              const h = (v / max) * 100;
              const breach = v > 300;
              const post = i >= BEFORE.length;
              return (
                <rect
                  key={i}
                  x={i * barW + 0.4}
                  y={100 - h}
                  width={barW - 0.8}
                  height={h}
                  fill={post ? '#4ade80' : breach ? '#f87171' : brand}
                  opacity={post ? 0.95 : breach ? 0.85 : 0.7}
                >
                  {post && (
                    <animate attributeName="opacity" from="0" to="0.95" dur="0.6s" fill="freeze" />
                  )}
                </rect>
              );
            })}
          </svg>

          {isRunning && (
            <div
              className="absolute top-0 bottom-0 w-px pointer-events-none"
              style={{
                left: `${scanX}%`,
                background: `linear-gradient(to bottom, transparent 0%, ${brand} 50%, transparent 100%)`,
                boxShadow: `0 0 8px ${brand}`,
              }}
            />
          )}

          <div className="absolute bottom-1 left-2 text-[9px] font-mono text-text-tertiary">
            {isComplete ? 'last 30 min · post-fix' : 'last 24 min'}
          </div>
        </div>

        {/* Flame graph */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              slowest exemplar trace {activeStep >= 1 && '· cursor isolated the hot frame'}
            </p>
            <p className="text-[10px] font-mono text-text-tertiary tabular-nums">trace_id ab12c…</p>
          </div>
          <div className="space-y-0.5">
            {flameOps.map((op, i) => {
              const highlighted = i === highlightFlameFrom;
              return (
                <div
                  key={i}
                  className="relative h-5 rounded transition-all"
                  style={{
                    width: `${op.w}%`,
                    marginLeft: `${(100 - op.w) / 2}%`,
                    background: op.color,
                    opacity: highlightFlameFrom === -1 ? 0.7 : highlighted ? 1 : 0.3,
                    boxShadow: highlighted ? `0 0 14px ${op.color}` : 'none',
                  }}
                >
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-mono text-white/95 truncate">
                    {op.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status strip */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-text-tertiary">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isComplete ? '#4ade80' : isRunning ? brand : '#a3a3a3' }} />
          <span>
            {activeStep < 0 && 'monitor armed · awaiting breach'}
            {activeStep === 0 && 'monitor triggered · cursor agent dispatched'}
            {activeStep === 1 && 'pulling exemplar trace from Datadog APM'}
            {activeStep === 2 && `mapping span to ${account} repo`}
            {activeStep === 3 && 'patching cache lookup · running benchmark'}
            {activeStep === 4 && 'opening PR with Datadog dashboard link'}
            {activeStep >= totalSteps && 'PR merged · p99 recovered'}
          </span>
        </div>
      </div>
    </div>
  );
}
