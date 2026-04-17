'use client';

import { Zap } from 'lucide-react';
import { CursorLogo } from './cursor-logo';
import { AI_TASKS, type AiTask } from './data/ai-acceleration';

/**
 * Compact in-scene tile showing what Cursor Cloud Agents did at this step
 * and the speedup vs baseline. Variants accommodate dark and light acts.
 *
 *   <AccelerationTile taskId="codebase-scan" />
 *   <AccelerationTile task={{...custom}} tone="light" variant="strip" />
 */
export function AccelerationTile({
  taskId,
  task,
  tone = 'dark',
  variant = 'card',
  className,
}: {
  taskId?: AiTask['id'];
  task?: AiTask;
  tone?: 'dark' | 'light';
  variant?: 'card' | 'strip' | 'chip';
  className?: string;
}) {
  const t = task ?? AI_TASKS.find((x) => x.id === taskId);
  if (!t) return null;

  const speedup = Math.max(1, Math.round(t.baselineHours / t.cursorHours));
  const isDark = tone === 'dark';

  if (variant === 'chip') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${className ?? ''}`}
        style={{
          background: isDark ? 'rgba(255,153,0,0.12)' : 'rgba(255,153,0,0.14)',
          borderColor: 'rgba(255,153,0,0.45)',
          color: isDark ? '#FFC66D' : '#B45309',
        }}
      >
        <CursorLogo size={12} tone={isDark ? 'dark' : 'light'} />
        <Zap className="h-3 w-3" />
        <span>{speedup}× faster</span>
        <span className="font-mono normal-case tracking-normal opacity-70">
          {t.cursorLabel} · vs {t.baselineLabel}
        </span>
      </span>
    );
  }

  if (variant === 'strip') {
    return (
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${className ?? ''}`}
        style={{
          background: isDark ? 'rgba(255,153,0,0.08)' : 'rgba(255,153,0,0.06)',
          borderColor: 'rgba(255,153,0,0.35)',
          color: isDark ? '#F3F4F6' : '#111827',
        }}
      >
        <CursorLogo size={18} tone={isDark ? 'dark' : 'light'} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] leading-tight">
            <span className="font-semibold">Cursor Cloud Agent · {t.title}</span>
          </div>
          <div className="text-[10px] opacity-70 leading-tight truncate">
            {t.cursorLabel} vs {t.baselineLabel} baseline
          </div>
        </div>
        <span
          className="font-mono text-sm font-bold tabular-nums"
          style={{ color: '#FF9900' }}
        >
          {speedup}×
        </span>
      </div>
    );
  }

  // default: "card"
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border p-3 ${className ?? ''}`}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(255,153,0,0.10) 0%, rgba(255,153,0,0.03) 100%)'
          : 'linear-gradient(180deg, rgba(255,153,0,0.08) 0%, rgba(255,153,0,0.02) 100%)',
        borderColor: 'rgba(255,153,0,0.35)',
        color: isDark ? '#F3F4F6' : '#0F172A',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CursorLogo size={16} tone={isDark ? 'dark' : 'light'} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#FF9900' }}
          >
            Cursor Cloud Agent
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold"
          style={{
            background: 'rgba(255,153,0,0.18)',
            color: '#FF9900',
          }}
        >
          {speedup}× faster
        </span>
      </div>
      <div>
        <div className="text-[13px] font-semibold leading-tight">{t.title}</div>
        <p
          className="mt-0.5 text-[11px] leading-snug"
          style={{ color: isDark ? 'rgba(243,244,246,0.72)' : 'rgba(15,23,42,0.7)' }}
        >
          {t.detail}
        </p>
      </div>
      <div
        className="flex items-baseline gap-1.5 border-t pt-1.5 text-[11px]"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }}
      >
        <span
          className="font-mono font-semibold"
          style={{ color: '#FF9900' }}
        >
          {t.cursorLabel}
        </span>
        <span className="opacity-55">agent time</span>
        <span className="mx-1 opacity-40">·</span>
        <span className="font-mono line-through opacity-55">{t.baselineLabel}</span>
        <span className="opacity-55">baseline</span>
      </div>
    </div>
  );
}
