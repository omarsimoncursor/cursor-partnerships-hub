'use client';

import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export interface StoryStepProps {
  /**
   * Numeric label shown in the small badge — usually "Step N of M" so the
   * viewer always knows where they are in the act.
   */
  step: string;
  /**
   * One-sentence problem statement: what the team is trying to do at this
   * exact moment, in plain English. This is what the viewer reads first.
   */
  question: ReactNode;
  /**
   * Optional kicker shown below the question for setting (e.g. "Friday
   * 10:14am · #data-platform"). Kept very short.
   */
  setting?: string;
  /** Per-act accent. */
  accent?: string;
  /** Light or dark surface tint. */
  tone?: 'dark' | 'light';
  /** The focal artifact for this step (chart, code morph, email, chat). */
  children: ReactNode;
  /**
   * Right-side rail content — usually a `WhatCursorDid` card and / or
   * supporting result tiles.
   */
  rail?: ReactNode;
  /**
   * The actuator row: the big "Run Cursor" button + any continue/replay
   * affordances. Rendered immediately under the question so the viewer's
   * eye flows: read → click → watch → read result.
   */
  actuator?: ReactNode;
  /**
   * The result row: rendered after the focal artifact. Usually a numeric
   * outcome ("Δ rows: 0 · 12.8s") with a Continue button into the next step
   * or act.
   */
  result?: ReactNode;
  className?: string;
}

/**
 * Standard slide layout for the Snowflake story. Every step in every act
 * follows the same Question → Actuate → Process → Result rhythm so the
 * viewer always knows what to read first and what to do next.
 */
export function StoryStep({
  step,
  question,
  setting,
  accent = '#29B5E8',
  tone = 'dark',
  children,
  rail,
  actuator,
  result,
  className = '',
}: StoryStepProps) {
  const isDark = tone === 'dark';
  const textColor = isDark ? '#F5F5F7' : '#0F172A';
  const mutedColor = isDark ? 'rgba(245,245,247,0.65)' : 'rgba(15,23,42,0.65)';

  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] items-start ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em]"
            style={{
              color: accent,
              borderColor: `${accent}40`,
              background: `${accent}12`,
            }}
          >
            <Sparkles className="h-3 w-3" />
            {step}
          </span>
          {setting && (
            <span
              className="font-mono text-[11px]"
              style={{ color: mutedColor }}
            >
              {setting}
            </span>
          )}
        </div>

        <h2
          className="text-[20px] font-semibold leading-snug md:text-[24px]"
          style={{ color: textColor }}
        >
          {question}
        </h2>

        {actuator && <div>{actuator}</div>}

        <div className="mt-1">{children}</div>

        {result && <div>{result}</div>}
      </div>

      {rail && <div className="flex flex-col gap-4 lg:sticky lg:top-24">{rail}</div>}
    </div>
  );
}
