'use client';

import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface CursorValueCalloutProps {
  /** Headline — what Cursor uniquely does at this stage, in one line. */
  headline: ReactNode;
  /** 1–2 sentence explanation in plain English. */
  body: ReactNode;
  /** Per-act accent (defaults to Snowflake cyan). */
  accent?: string;
  /** Tone — dark themes get a glassy dark card, light themes get an ivory card. */
  tone?: 'dark' | 'light';
  /** Optional small label that sits above the headline. */
  label?: string;
  /** Optional footer (e.g. stat bar / link). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Consistent "Why Cursor matters here" card — dropped into every act so a
 * non-technical viewer always sees, in a single glance, what Cursor uniquely
 * contributes at that beat of the story.
 */
export function CursorValueCallout({
  headline,
  body,
  accent = '#29B5E8',
  tone = 'dark',
  label = 'Where Cursor earns the next step',
  footer,
  className = '',
}: CursorValueCalloutProps) {
  const isDark = tone === 'dark';
  const bg = isDark
    ? `linear-gradient(135deg, ${accent}14, ${accent}05 60%, rgba(255,255,255,0.02))`
    : `linear-gradient(135deg, ${accent}18, #FFFFFF 70%)`;
  const borderColor = `${accent}55`;
  const textColor = isDark ? '#F3F4F6' : '#0F172A';
  const mutedColor = isDark ? 'rgba(243,244,246,0.7)' : 'rgba(15,23,42,0.7)';

  return (
    <div
      className={`relative rounded-2xl border p-5 md:p-6 ${className}`}
      style={{
        background: bg,
        borderColor,
        color: textColor,
        boxShadow: isDark
          ? `0 18px 50px -25px ${accent}55`
          : `0 12px 30px -20px rgba(15,23,42,0.25)`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}55` }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span
          className="text-[10.5px] font-mono uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-[16px] md:text-[17px] font-semibold leading-snug"
        style={{ color: textColor }}
      >
        {headline}
      </p>
      <p className="mt-2 text-[13px] md:text-[13.5px] leading-relaxed" style={{ color: mutedColor }}>
        {body}
      </p>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
