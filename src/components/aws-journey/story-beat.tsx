'use client';

import type { ReactNode } from 'react';
import { CursorLogo } from './cursor-logo';

type Agent = 'cloud' | 'ide' | 'codex' | 'both';

const AGENT_COPY: Record<Agent, { label: string; color: string }> = {
  cloud:  { label: 'Cursor Cloud Agent',    color: '#FF9900' },
  ide:    { label: 'Cursor in the IDE',     color: '#4DD4FF' },
  codex:  { label: 'Cursor Codex review',   color: '#FBBF24' },
  both:   { label: 'Cursor Cloud + IDE',    color: '#FF9900' },
};

/**
 * Non-technical "what's happening right now, and why Cursor made it fast"
 * card shown at the top of each act. Takes a tone to match the act's palette.
 */
export function StoryBeat({
  tone,
  agent,
  title,
  body,
  oldWay,
  newWay,
  className,
}: {
  tone: 'dark' | 'light';
  agent: Agent;
  /** 1-sentence "what's happening on this screen" in plain English. */
  title: string;
  /** 1-2 short sentences explaining Cursor's role in non-technical language. */
  body: ReactNode;
  /** Plain-English "the old way" label, e.g. "Old way: 12 weeks of GSI consultants". */
  oldWay?: string;
  /** Plain-English "the Cursor way" label, e.g. "With Cursor: 9 days of agent time". */
  newWay?: string;
  className?: string;
}) {
  const { label, color } = AGENT_COPY[agent];
  const isDark = tone === 'dark';

  const textColor = isDark ? '#F3F4F6' : '#0F172A';
  const mutedColor = isDark ? 'rgba(243,244,246,0.75)' : 'rgba(15,23,42,0.72)';
  const faintColor = isDark ? 'rgba(243,244,246,0.55)' : 'rgba(15,23,42,0.55)';

  return (
    <div
      className={`mb-4 flex flex-col gap-2.5 rounded-lg border px-3.5 py-3 md:flex-row md:items-center md:gap-4 md:px-4 ${className ?? ''}`}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(255,153,0,0.07) 0%, rgba(255,153,0,0.02) 100%)'
          : 'linear-gradient(180deg, rgba(255,153,0,0.07) 0%, rgba(255,153,0,0.015) 100%)',
        borderColor: isDark ? 'rgba(255,153,0,0.25)' : 'rgba(255,153,0,0.32)',
        color: textColor,
      }}
    >
      <div className="flex shrink-0 items-center gap-2">
        <CursorLogo size={18} tone={isDark ? 'dark' : 'light'} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-semibold leading-snug"
          style={{ color: textColor }}
        >
          {title}
        </div>
        <p
          className="mt-0.5 text-[12px] leading-snug"
          style={{ color: mutedColor }}
        >
          {body}
        </p>
      </div>

      {(oldWay || newWay) && (
        <div
          className="flex shrink-0 flex-col gap-1 text-[11px] md:w-[220px]"
          style={{ color: faintColor }}
        >
          {oldWay && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-60">Before</span>
              <span className="line-through" style={{ color: isDark ? 'rgba(243,244,246,0.6)' : 'rgba(15,23,42,0.6)' }}>
                {oldWay}
              </span>
            </div>
          )}
          {newWay && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#FF9900' }}>Cursor</span>
              <span className="font-semibold" style={{ color: isDark ? '#FFC66D' : '#B45309' }}>
                {newWay}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
