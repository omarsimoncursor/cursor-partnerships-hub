'use client';

import { Activity, ExternalLink, RotateCcw } from 'lucide-react';
import type { SloBreachError } from './reports-card';

interface SloSummaryProps {
  error: Error;
  onReset: () => void;
  onViewDatadog?: () => void;
}

function asSloError(error: Error): SloBreachError | null {
  if (error.name === 'SloBreachError') {
    return error as SloBreachError;
  }
  return null;
}

export function SloSummary({ error, onReset, onViewDatadog }: SloSummaryProps) {
  const slo = asSloError(error);
  const p99 = slo?.p99Ms ?? 7412;
  const target = slo?.sloTargetMs ?? 500;
  const multiple = (p99 / target).toFixed(1);
  const endpoint = slo?.endpoint ?? '/api/reports/generate';

  return (
    <div className="w-full h-full rounded-xl border border-[#632CA6]/25 bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#632CA6]/25 bg-[#632CA6]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#632CA6]/20 border border-[#632CA6]/30 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-[#A689D4]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#A689D4] leading-none mb-0.5">
              SLO breach detected
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              datadog · monitor 3f12-8a2c
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Endpoint row */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Affected endpoint
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-[#A689D4] break-words">
            GET {endpoint}
          </div>
        </div>

        {/* Sparkline */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            P99 latency · last 1h
          </p>
          <div className="relative p-2.5 rounded-md bg-dark-bg overflow-hidden">
            <LatencySparkline />
          </div>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="P99" value={`${(p99 / 1000).toFixed(1)}s`} color="text-accent-amber" />
          <Stat label="Target" value={`${target}ms`} color="text-accent-green" />
          <Stat label="Over" value={`${multiple}×`} color="text-accent-amber" />
        </div>

        {/* Span summary */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Slow path
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="text-[#A689D4]">aggregate-orders.ts :: aggregateOrdersByRegion</div>
            <div>└─ 6 regions · 12 serial spans</div>
            <div className="text-text-tertiary">└─ 0 parallelism</div>
            <div className="text-text-tertiary">└─ regression commit a4f2e1b</div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewDatadog}
          className="w-full py-2 px-3 rounded-lg bg-[#632CA6] text-white font-medium text-sm
                     hover:bg-[#7339C0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Datadog
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

// Deterministic latency sparkline — flat baseline with a spike near the end.
function LatencySparkline() {
  const width = 260;
  const height = 56;
  const points = [
    180, 190, 178, 205, 195, 188, 210, 198, 220, 208,
    195, 212, 225, 218, 240, 260, 285, 310, 360, 420,
    540, 720, 980, 1380, 2100, 3200, 4400, 5600, 6800, 7412,
  ];
  const maxY = 7500;
  const stepX = width / (points.length - 1);

  const coords = points.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / maxY) * (height - 4) - 2;
    return { x, y, v };
  });

  const path = coords
    .map((c, i) => (i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`))
    .join(' ');

  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="block">
      <defs>
        <linearGradient id="sloFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* SLO target line */}
      <line
        x1="0"
        y1={height - (500 / maxY) * (height - 4) - 2}
        x2={width}
        y2={height - (500 / maxY) * (height - 4) - 2}
        stroke="#4ADE80"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.55"
      />
      <path d={fillPath} fill="url(#sloFill)" />
      <path d={path} fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Final spike dot */}
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill="#F5A623" />
    </svg>
  );
}
