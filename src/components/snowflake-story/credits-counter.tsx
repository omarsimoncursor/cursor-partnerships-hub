'use client';

import { CALENDAR } from './story-data';
import { TrendingUp, Sparkles, Database, Share2 } from 'lucide-react';

interface CreditsCounterProps {
  monthIndex: number;
  className?: string;
}

export function CreditsCounter({ monthIndex, className = '' }: CreditsCounterProps) {
  const block = CALENDAR[Math.min(monthIndex, CALENDAR.length - 1)];
  const creditsUsd = block.cumulativeCredits;
  const assets = block.assetsCompleted;

  const pullThrough: Array<{ label: string; icon: React.ReactNode; activeAt: number }> = [
    { label: 'Cortex AI', icon: <Sparkles className="w-3 h-3" />, activeAt: 2 },
    { label: 'Dynamic Tables', icon: <Database className="w-3 h-3" />, activeAt: 5 },
    { label: 'Snowpark', icon: <TrendingUp className="w-3 h-3" />, activeAt: 9 },
    { label: 'Marketplace', icon: <Share2 className="w-3 h-3" />, activeAt: 12 },
  ];

  return (
    <div className={`rounded-xl border border-[#29B5E8]/25 bg-gradient-to-br from-[#0C1E31]/95 to-[#071321]/95 backdrop-blur p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5]">
          Snowflake credits · pulled forward
        </span>
      </div>

      <p
        className="text-[52px] leading-none font-mono font-semibold text-text-primary tabular-nums"
        style={{
          background: 'linear-gradient(180deg, #E5F6FB 0%, #7DD3F5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {formatUsd(creditsUsd)}
      </p>

      <p className="text-[11px] text-text-tertiary font-mono mt-1">
        vs GSI baseline: credits wouldn&apos;t flow for another{' '}
        <span className="text-[#F59E0B]">{Math.max(0, 48 - monthIndex)} months</span>
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            Assets in production
          </p>
          <p className="text-[20px] font-mono font-semibold text-text-primary tabular-nums">
            {assets.toLocaleString()}
            <span className="text-text-tertiary text-[13px]"> / 911</span>
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            Calendar month
          </p>
          <p className="text-[20px] font-mono font-semibold text-text-primary tabular-nums">
            {String(monthIndex).padStart(2, '0')}
            <span className="text-text-tertiary text-[13px]"> / 15</span>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-2">
          Pull-through products online
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pullThrough.map((p) => {
            const active = monthIndex >= p.activeAt;
            return (
              <span
                key={p.label}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-mono transition-all"
                style={{
                  borderColor: active ? 'rgba(41,181,232,0.45)' : 'rgba(255,255,255,0.08)',
                  background: active ? 'rgba(41,181,232,0.12)' : 'rgba(255,255,255,0.02)',
                  color: active ? '#7DD3F5' : 'rgba(237,236,236,0.35)',
                  boxShadow: active ? '0 0 12px rgba(41,181,232,0.25)' : 'none',
                }}
              >
                {p.icon}
                {p.label}
              </span>
            );
          })}
        </div>
      </div>

      {block.narrative && (
        <div className="mt-5 pt-4 border-t border-white/5">
          <p className="text-[11px] text-text-secondary leading-relaxed">
            <span className="text-[#7DD3F5] font-mono">M{monthIndex}</span> — {block.narrative}
          </p>
        </div>
      )}
    </div>
  );
}

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}
