'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineScrubberProps {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  stops?: Array<{ value: number; label: string }>;
  autoplay?: boolean;
  tickMs?: number;
  topLabel?: React.ReactNode;
  bottomLabel?: React.ReactNode;
  className?: string;
}

export function TimelineScrubber({
  value, min = 0, max, onChange, stops = [],
  autoplay = false, tickMs = 900, topLabel, bottomLabel, className = '',
}: TimelineScrubberProps) {
  const playingRef = useRef(autoplay);

  useEffect(() => {
    playingRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    if (!autoplay) return;
    if (value >= max) return;
    const t = setTimeout(() => {
      if (playingRef.current) onChange(Math.min(max, value + 1));
    }, tickMs);
    return () => clearTimeout(t);
  }, [value, max, autoplay, tickMs, onChange]);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {topLabel && <div className="mb-2">{topLabel}</div>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Step back"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 relative">
          <div className="h-[6px] rounded-full bg-white/10 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(to right, #29B5E8, #7DD3F5)',
                boxShadow: '0 0 16px rgba(41,181,232,0.6)',
                transition: 'width 300ms ease',
              }}
            />
            {stops.map((stop) => {
              const stopPct = ((stop.value - min) / (max - min)) * 100;
              const reached = value >= stop.value;
              return (
                <div
                  key={stop.value}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border transition-colors"
                  style={{
                    left: `calc(${stopPct}% - 4px)`,
                    background: reached ? '#7DD3F5' : '#0A1221',
                    borderColor: reached ? '#29B5E8' : 'rgba(255,255,255,0.2)',
                    boxShadow: reached ? '0 0 8px rgba(41,181,232,0.8)' : 'none',
                  }}
                />
              );
            })}
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing"
            aria-label="Timeline scrubber"
          />
          {stops.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              {stops.map((stop) => {
                const reached = value >= stop.value;
                return (
                  <span
                    key={stop.value}
                    className="transition-colors"
                    style={{ color: reached ? '#7DD3F5' : 'rgba(237,236,236,0.35)' }}
                  >
                    {stop.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Step forward"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {bottomLabel && <div className="mt-2">{bottomLabel}</div>}
    </div>
  );
}
