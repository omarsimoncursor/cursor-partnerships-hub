'use client';

import { Check, Sparkles } from 'lucide-react';

interface CortexEquivalenceVizProps {
  progress: number;
  className?: string;
}

export function CortexEquivalenceViz({ progress, className = '' }: CortexEquivalenceVizProps) {
  const streamOpacity = Math.min(1, progress * 1.2);
  const convergenceLit = progress > 0.55;
  const verdictLit = progress > 0.88;

  return (
    <div className={`rounded-xl border border-white/10 bg-[#0A1221]/70 backdrop-blur overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[340px]">
          <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="bteqStream" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="dbtStream" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#29B5E8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#29B5E8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="convergence" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#29B5E8" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#4ADE80" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            <text x="30" y="60" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#F59E0B">
              Teradata BTEQ · 1.4M rows
            </text>
            <text x="30" y="260" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#7DD3F5">
              dbt fct_daily_revenue · 1.4M rows
            </text>

            <path d="M 30 80 Q 180 80 260 140" stroke="url(#bteqStream)" strokeWidth="2" fill="none" opacity={streamOpacity} />
            <path d="M 30 240 Q 180 240 260 180" stroke="url(#dbtStream)" strokeWidth="2" fill="none" opacity={streamOpacity} />

            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`bteq-${i}`} opacity={streamOpacity}>
                <circle r="2" fill="#F59E0B">
                  <animateMotion dur={`${2 + (i % 3) * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.15}s`} path="M 30 80 Q 180 80 260 140" />
                </circle>
              </g>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`dbt-${i}`} opacity={streamOpacity}>
                <circle r="2" fill="#7DD3F5">
                  <animateMotion dur={`${2 + (i % 3) * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.15}s`} path="M 30 240 Q 180 240 260 180" />
                </circle>
              </g>
            ))}

            <rect
              x="256" y="130" width="60" height="60" rx="8"
              fill="none"
              stroke={convergenceLit ? '#4ADE80' : '#29B5E8'}
              strokeWidth="1.5"
              strokeDasharray={convergenceLit ? 'none' : '4 3'}
              opacity={0.85}
            />
            <text x="286" y="164" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={convergenceLit ? '#4ADE80' : '#7DD3F5'} textAnchor="middle">
              diff
            </text>

            <path d="M 316 160 Q 430 160 540 160" stroke="url(#convergence)" strokeWidth="2.5" fill="none" opacity={convergenceLit ? 1 : 0.4} />
            {convergenceLit &&
              Array.from({ length: 6 }).map((_, i) => (
                <circle key={i} r="2.5" fill="#4ADE80">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${i * 0.25}s`} path="M 316 160 Q 430 160 540 160" />
                </circle>
              ))}

            <text x="540" y="140" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={convergenceLit ? '#4ADE80' : '#5A6872'} textAnchor="end">
              merged stream
            </text>
            <text x="540" y="180" fontSize="9" fontFamily="JetBrains Mono, monospace" fill={convergenceLit ? '#4ADE80' : '#5A6872'} textAnchor="end">
              Δ rows = 0 · ΣUSD = $0
            </text>
          </svg>
        </div>

        <div className="border-l border-white/10 bg-[#0D1726]/80 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#29B5E8]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5]">
              Cortex semantic diff
            </span>
          </div>

          <VerdictCard active={progress > 0.4} label="Row-level equivalence (1% sample)" value="Δ rows = 0" detail="14,017 rows sampled · perfect match" />
          <VerdictCard active={progress > 0.6} label="Monetary sum" value="ΣUSD Δ = $0.00" detail="Currency normalization byte-identical" />
          <VerdictCard active={progress > 0.78} label="Top-10 rank drift" value="0 positions" detail="Customer leaderboard preserved" />
          <VerdictCard active={verdictLit} label="Cortex COMPLETE verdict" value="No semantic drift" detail="mistral-large · MERGE + QUALIFY equivalences held" highlight />

          <div className="mt-auto pt-3 border-t border-white/5 text-[10.5px] text-text-tertiary font-mono flex items-center justify-between">
            <span>latency</span>
            <span className="text-text-secondary">Teradata 3,412s · Snowflake 12.8s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerdictCard({
  active, label, value, detail, highlight,
}: {
  active: boolean; label: string; value: string; detail: string; highlight?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2 transition-all"
      style={{
        borderColor: active
          ? highlight
            ? 'rgba(74,222,128,0.45)'
            : 'rgba(41,181,232,0.35)'
          : 'rgba(255,255,255,0.06)',
        background: active
          ? highlight
            ? 'rgba(74,222,128,0.07)'
            : 'rgba(41,181,232,0.05)'
          : 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="flex items-center gap-2">
        <p className="text-[10.5px] font-mono uppercase tracking-wider text-text-tertiary">{label}</p>
        {active && <Check className="w-3 h-3" style={{ color: highlight ? '#4ADE80' : '#29B5E8' }} />}
      </div>
      <p
        className="text-[14px] font-mono font-semibold mt-0.5"
        style={{ color: active ? (highlight ? '#4ADE80' : '#7DD3F5') : '#6B7280' }}
      >
        {value}
      </p>
      <p className="text-[10.5px] text-text-tertiary mt-0.5">{detail}</p>
    </div>
  );
}
