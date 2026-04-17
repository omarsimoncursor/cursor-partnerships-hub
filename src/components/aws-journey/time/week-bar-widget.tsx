'use client';

import { formatDay } from '../data/script';

interface WeekBarWidgetProps {
  startDay: number;
  endDay: number;
  currentDay: number;
  phaseLabel: string; // e.g., "Staging", "Cutover"
  accent?: string;
  darkMode?: boolean;
}

export function WeekBarWidget({
  startDay,
  endDay,
  currentDay,
  phaseLabel,
  accent = '#FF9900',
  darkMode = true,
}: WeekBarWidgetProps) {
  const segments = Math.max(1, endDay - startDay + 1);
  const elapsed = Math.max(0, Math.min(segments, currentDay - startDay + 1));
  const text = darkMode ? '#F3F4F6' : '#111827';
  const muted = darkMode ? 'rgba(243,244,246,0.55)' : 'rgba(17,24,39,0.55)';
  const track = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)';

  return (
    <div style={{ width: 220 }} aria-label={`${phaseLabel} progress day ${elapsed} of ${segments}`}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {phaseLabel}
        </span>
        <span className="text-[10px] font-mono" style={{ color: muted }}>
          Day {elapsed}/{segments}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, idx) => {
          const day = startDay + idx;
          const isCurrent = day === currentDay;
          const isFilled = idx < elapsed;
          return (
            <div key={idx} className="relative flex-1">
              <div
                className="h-2 rounded-sm transition-all"
                style={{
                  background: isFilled ? accent : track,
                  opacity: isFilled && !isCurrent ? 0.7 : 1,
                }}
              />
              {isCurrent && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: accent,
                    boxShadow: `0 0 0 4px ${accent}33`,
                    animation: 'weekbarPulse 1.8s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 text-[10px] font-mono" style={{ color: muted }}>
        {formatDay(startDay)} → {formatDay(endDay)}
      </div>

      <style jsx>{`
        @keyframes weekbarPulse {
          0%, 100% { box-shadow: 0 0 0 4px ${accent}33; }
          50%      { box-shadow: 0 0 0 8px ${accent}00; }
        }
      `}</style>
    </div>
  );
}
