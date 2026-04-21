'use client';

import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ResultStat {
  /** Tiny uppercase label, e.g. "WALL-CLOCK". */
  label: string;
  /** The headline number, e.g. "12.8s". */
  value: string;
  /** Optional one-line context, e.g. "vs 3,412s on Teradata". */
  hint?: string;
}

interface StepResultProps {
  /** The headline summary of what just happened, in plain English. */
  headline: ReactNode;
  /** Up to four key stats rendered as tiles. */
  stats?: ResultStat[];
  /** Optional Continue button label — usually advances to the next act. */
  continueLabel?: string;
  onContinue?: () => void;
  /** Per-act accent. */
  accent?: string;
  tone?: 'dark' | 'light';
}

/**
 * Standard "what just happened" card. Always renders after the focal artifact
 * so the viewer reads the result in plain numbers and never has to interpret
 * the visualization themselves.
 */
export function StepResult({
  headline,
  stats,
  continueLabel,
  onContinue,
  accent = '#4ADE80',
  tone = 'dark',
}: StepResultProps) {
  const isDark = tone === 'dark';
  const text = isDark ? '#F5F5F7' : '#0F172A';
  const muted = isDark ? 'rgba(245,245,247,0.6)' : 'rgba(15,23,42,0.6)';

  return (
    <div
      className="rounded-2xl border px-5 py-4"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${accent}14, rgba(255,255,255,0.02))`
          : `linear-gradient(135deg, ${accent}18, #FFFFFF)`,
        borderColor: `${accent}55`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: accent }} />
        <p className="text-[14.5px] font-semibold leading-snug" style={{ color: text }}>
          {headline}
        </p>
      </div>
      {stats && stats.length > 0 && (
        <div
          className={`mt-3 grid gap-2`}
          style={{
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border px-3 py-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.04)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{ color: muted }}
              >
                {s.label}
              </p>
              <p
                className="mt-0.5 font-mono text-[18px] font-semibold tabular-nums"
                style={{ color: text }}
              >
                {s.value}
              </p>
              {s.hint && (
                <p className="text-[10.5px]" style={{ color: muted }}>
                  {s.hint}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {continueLabel && onContinue && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold cursor-pointer"
            style={{
              background: accent,
              color: '#0A1419',
              boxShadow: `0 0 18px ${accent}55`,
            }}
          >
            {continueLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}
