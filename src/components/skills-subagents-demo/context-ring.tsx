'use client';

import { useEffect, useState } from 'react';

interface ContextRingProps {
  /** Percentage 0–100 the ring should display. */
  percent: number;
  /** Pixel diameter of the ring. */
  size?: number;
  /** Stroke width of the ring. */
  stroke?: number;
  /** Primary color of the filled arc. */
  color?: string;
  /** Optional headline label inside the ring. */
  label?: string;
  /** Optional secondary line under the percent. */
  sublabel?: string;
  /** Whether to animate from the previous value (default true). */
  animate?: boolean;
}

export function ContextRing({
  percent,
  size = 220,
  stroke = 14,
  color = '#A78BFA',
  label,
  sublabel,
  animate = true,
}: ContextRingProps) {
  const [display, setDisplay] = useState(animate ? 0 : percent);

  useEffect(() => {
    if (!animate) {
      setDisplay(percent);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = display;
    const duration = 900;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (percent - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, animate]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Context window ${display.toFixed(1)} percent full`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(237,236,236,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 12px ${color}aa)`,
            transition: 'stroke 0.3s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        {label && (
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1">
            {label}
          </span>
        )}
        <span
          className="font-semibold tabular-nums leading-none"
          style={{ color, fontSize: size * 0.18 }}
        >
          {display.toFixed(1)}%
        </span>
        {sublabel && (
          <span className="text-[11px] text-text-secondary mt-1.5 max-w-[160px] leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
