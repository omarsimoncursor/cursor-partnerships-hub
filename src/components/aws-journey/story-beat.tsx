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
      className={`mb-6 flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-start md:gap-4 md:p-5 ${className ?? ''}`}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(255,153,0,0.08) 0%, rgba(255,153,0,0.02) 100%)'
          : 'linear-gradient(180deg, rgba(255,153,0,0.08) 0%, rgba(255,153,0,0.015) 100%)',
        borderColor: isDark ? 'rgba(255,153,0,0.3)' : 'rgba(255,153,0,0.35)',
        color: textColor,
      }}
    >
      <div className="flex shrink-0 items-center gap-2 md:w-[172px] md:flex-col md:items-start">
        <CursorLogo size={20} tone={isDark ? 'dark' : 'light'} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-[14px] font-semibold leading-snug md:text-[15px]"
          style={{ color: textColor }}
        >
          {title}
        </div>
        <p
          className="mt-1 text-[12.5px] leading-relaxed md:text-[13px]"
          style={{ color: mutedColor }}
        >
          {body}
        </p>

        {(oldWay || newWay) && (
          <div
            className="mt-3 grid gap-2 text-[11px] md:grid-cols-2"
            style={{ color: faintColor }}
          >
            {oldWay && (
              <div
                className="rounded-md border px-2.5 py-1.5"
                style={{
                  background: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(15,23,42,0.04)',
                  borderColor: isDark ? 'rgba(243,244,246,0.08)' : 'rgba(15,23,42,0.08)',
                }}
              >
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
                  Old way
                </span>
                <span style={{ color: isDark ? 'rgba(243,244,246,0.8)' : 'rgba(15,23,42,0.8)' }}>
                  {oldWay}
                </span>
              </div>
            )}
            {newWay && (
              <div
                className="rounded-md border px-2.5 py-1.5"
                style={{
                  background: 'rgba(255,153,0,0.08)',
                  borderColor: 'rgba(255,153,0,0.35)',
                }}
              >
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#FF9900' }}>
                  With Cursor
                </span>
                <span style={{ color: isDark ? '#FFD79A' : '#B45309', fontWeight: 600 }}>
                  {newWay}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
