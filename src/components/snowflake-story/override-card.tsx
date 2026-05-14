'use client';

import type { ReactNode } from 'react';
import { Character } from './character';
import { CHARACTERS, type CharacterKey } from './data/characters';

export interface OverrideCardProps {
  speaker: CharacterKey | 'cursor';
  timestamp?: string;
  children: ReactNode;
  tone?: 'override' | 'approve' | 'ai';
  visible: boolean;
  delayMs?: number;
  darkMode?: boolean;
}

/**
 * Slack-style comment card that slides in from the right. Used for human
 * override / approval moments and for Cursor&rsquo;s replies. Mirrors the AWS
 * journey&rsquo;s OverrideCard so the two stories feel like they share a vocabulary.
 */
export function OverrideCard({
  speaker,
  timestamp = 'just now',
  children,
  tone = 'approve',
  visible,
  delayMs = 0,
  darkMode = false,
}: OverrideCardProps) {
  const isAi = speaker === 'cursor';
  const character = isAi ? null : CHARACTERS[speaker];

  const accent = isAi
    ? '#29B5E8'
    : tone === 'override'
      ? '#EF4444'
      : character?.accent ?? '#34D399';

  const borderLeft = {
    override: '#EF4444',
    approve: '#34D399',
    ai: '#29B5E8',
  }[tone];

  const bg = darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const textColor = darkMode ? '#E5E7EB' : '#111827';
  const mutedColor = darkMode ? 'rgba(229, 231, 235, 0.55)' : 'rgba(17, 24, 39, 0.55)';

  return (
    <div
      className="rounded-xl p-4 text-left shadow-xl transition-all duration-500 ease-out"
      style={{
        background: bg,
        color: textColor,
        borderLeft: `4px solid ${borderLeft}`,
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.08)'}`,
        borderLeftWidth: 4,
        borderLeftColor: borderLeft,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(48px, 8px, 0)',
        transitionDelay: `${delayMs}ms`,
        maxWidth: 460,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        {isAi ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: '#1F2937', border: '1px solid #374151' }}
            aria-label="Cursor"
          >
            ⌘
          </div>
        ) : (
          <Character name={speaker as CharacterKey} size={32} showTooltip={false} compact />
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold" style={{ color: accent }}>
            {isAi ? 'Cursor' : character?.name}
          </span>
          <span className="text-[11px]" style={{ color: mutedColor }}>
            {isAi ? 'AI agent' : character?.role} · {timestamp}
          </span>
        </div>
        {tone === 'override' && (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: '#FEE2E2', color: '#B91C1C' }}
          >
            Override
          </span>
        )}
        {tone === 'approve' && !isAi && (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: darkMode ? 'rgba(52,211,153,0.12)' : '#D1FAE5',
              color: '#065F46',
            }}
          >
            Approves
          </span>
        )}
      </div>

      <div
        className="text-[13px] leading-relaxed"
        style={{ color: darkMode ? 'rgba(229, 231, 235, 0.95)' : '#1F2937' }}
      >
        {children}
      </div>
    </div>
  );
}
