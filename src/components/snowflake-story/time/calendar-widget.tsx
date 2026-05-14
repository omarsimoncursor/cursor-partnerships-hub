'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDay } from '../data/script';

interface CalendarWidgetProps {
  currentDay: number;
  contextLabel?: string;
  /** If provided, widget auto-advances from currentDay to targetDay on mount. */
  targetDay?: number;
  accent?: string;
  darkMode?: boolean;
}

/**
 * Day-counter widget. Direct port of the AWS journey&rsquo;s CalendarWidget so the
 * two stories feel like they share a clock.
 */
export function CalendarWidget({
  currentDay,
  contextLabel,
  targetDay,
  accent = '#29B5E8',
  darkMode = false,
}: CalendarWidgetProps) {
  const [displayDay, setDisplayDay] = useState(currentDay);
  const [flipping, setFlipping] = useState(false);
  const prevDayRef = useRef(currentDay);

  useEffect(() => {
    if (targetDay !== undefined && targetDay !== displayDay) {
      const delta = targetDay - displayDay;
      if (delta === 0) return;
      let step = 0;
      const totalSteps = Math.abs(delta);
      const dir = Math.sign(delta);
      const intervalMs = Math.max(80, 600 / Math.max(1, totalSteps));
      const id = setInterval(() => {
        step += 1;
        setFlipping(true);
        setDisplayDay((d) => d + dir);
        setTimeout(() => setFlipping(false), intervalMs - 20);
        if (step >= totalSteps) clearInterval(id);
      }, intervalMs);
      return () => clearInterval(id);
    }
    if (currentDay !== prevDayRef.current) {
      setFlipping(true);
      setDisplayDay(currentDay);
      const t = setTimeout(() => setFlipping(false), 280);
      prevDayRef.current = currentDay;
      return () => clearTimeout(t);
    }
    return;
  }, [currentDay, targetDay, displayDay]);

  const textMain = darkMode ? '#F3F4F6' : '#111827';
  const textMuted = darkMode ? 'rgba(243,244,246,0.55)' : 'rgba(17,24,39,0.55)';
  const pageBg = darkMode ? '#1F2937' : '#FFFFFF';
  const shadowBg = darkMode ? '#111827' : '#E5E7EB';

  return (
    <div
      className="relative select-none"
      style={{ width: 160, perspective: 800 }}
      aria-label={`Calendar day ${displayDay}`}
    >
      <div
        className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg"
        style={{ background: shadowBg, opacity: 0.45 }}
      />
      <div
        className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-lg"
        style={{ background: shadowBg, opacity: 0.65 }}
      />

      <div
        className="relative overflow-hidden rounded-lg border transition-transform"
        style={{
          background: pageBg,
          borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.1)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'top',
          transform: flipping ? 'rotateX(-6deg)' : 'rotateX(0deg)',
          transitionDuration: '220ms',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <div
          className="flex h-6 items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white"
          style={{ background: accent }}
        >
          {contextLabel ?? 'Journey'}
        </div>

        <div className="px-3 pb-3 pt-2 text-center">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: textMuted }}
          >
            Day
          </div>
          <div
            className="text-4xl font-bold tabular-nums transition-all"
            style={{
              color: textMain,
              transform: flipping ? 'scale(0.9)' : 'scale(1)',
            }}
          >
            {displayDay}
          </div>
          <div className="mt-1 font-mono text-[11px]" style={{ color: textMuted }}>
            {formatDay(displayDay)}
          </div>
        </div>
      </div>
    </div>
  );
}
