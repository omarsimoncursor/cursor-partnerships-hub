'use client';

import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface CursorValueCalloutProps {
  /** Headline — what Cursor uniquely does at this stage, in one line. */
  headline: ReactNode;
  /** 1\u20132 sentence explanation in plain English. */
  body: ReactNode;
  /** Per-act accent (defaults to Snowflake cyan). */
  accent?: string;
  /** Tone — dark themes get a glassy dark card, light themes get an ivory card. */
  tone?: 'dark' | 'light';
  /** Optional small label that sits above the headline. Defaults to a uniform tag. */
  label?: string;
  /** Optional footer (e.g. stat bar / link). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Uniform "What Cursor did here" card — dropped into every act in the same
 * place so a non-technical viewer learns to look for it. Two lines max.
 */
export function CursorValueCallout({
  headline,
  body,
  accent = '#29B5E8',
  tone = 'dark',
  label = 'What Cursor did here',
  footer,
  className = '',
}: CursorValueCalloutProps) {
  const isDark = tone === 'dark';
  const bg = isDark
    ? `linear-gradient(135deg, ${accent}18, ${accent}06 70%, rgba(255,255,255,0.02))`
    : `linear-gradient(135deg, ${accent}18, #FFFFFF 70%)`;
  const borderColor = `${accent}55`;
  const textColor = isDark ? '#F5F5F7' : '#0F172A';
  const mutedColor = isDark ? 'rgba(245,245,247,0.7)' : 'rgba(15,23,42,0.7)';

  return (
    <div
      className={`relative rounded-2xl border p-4 md:p-5 ${className}`}
      style={{
        background: bg,
        borderColor,
        color: textColor,
        boxShadow: isDark
          ? `0 18px 50px -25px ${accent}55`
          : `0 12px 30px -20px rgba(15,23,42,0.25)`,
      }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}55` }}
        >
          <Sparkles className="h-3 w-3" />
        </span>
        <span
          className="text-[10.5px] font-mono uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-[15px] font-semibold leading-snug"
        style={{ color: textColor }}
      >
        {headline}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: mutedColor }}>
        {body}
      </p>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
