'use client';

import { ReactNode } from 'react';
import type { ActMeta } from './story-types';

interface ChapterStageProps {
  act: ActMeta;
  children: ReactNode;
  topRight?: ReactNode;
}

/**
 * Clean, themed shell modeled on the AWS journey demo. Each act gets a solid
 * (or subtly gradiented) background driven by `act.theme.bg`, a soft primary
 * radial glow, and a consistent header row with act number, title, and mood
 * label. No blurred photography — everything reads crisp for a non-technical
 * viewer, exactly like the AWS story.
 */
export function ChapterStage({ act, children, topRight }: ChapterStageProps) {
  const { theme } = act;
  const isGradient = theme.bg.startsWith('linear-gradient');

  return (
    <section
      className="relative min-h-screen w-full"
      style={{
        background: theme.bg,
        color: theme.text,
        paddingTop: 56,
      }}
      data-act={act.id}
    >
      {!isGradient && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.primary}14, transparent 60%)`,
          }}
        />
      )}

      {topRight && (
        <div className="pointer-events-auto absolute right-6 top-[70px] z-20 md:right-8">
          {topRight}
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-8 md:px-10">
        <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div
              className="mb-1 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: theme.primary }}
            >
              <span>Act {act.number.toString().padStart(2, '0')}</span>
              <span
                className="inline-block h-px w-8 opacity-60"
                style={{ background: theme.primary }}
              />
              {theme.moodLabel && (
                <span style={{ color: theme.muted, letterSpacing: '0.2em' }}>
                  {theme.moodLabel}
                </span>
              )}
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-mono normal-case tracking-wide"
                style={{
                  borderColor: `${theme.primary}55`,
                  color: theme.primary,
                  background: `${theme.primary}12`,
                }}
              >
                {act.duration}
              </span>
            </div>
            <h1
              className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              style={{ color: theme.text }}
            >
              {act.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm md:text-base" style={{ color: theme.muted }}>
              {act.subtitle}
            </p>
            {act.eyebrow && (
              <p
                className="mt-1 text-[12.5px] font-mono"
                style={{ color: theme.muted, opacity: 0.85 }}
              >
                {act.eyebrow}
              </p>
            )}
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}
