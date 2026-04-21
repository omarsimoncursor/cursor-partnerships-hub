'use client';

import { ReactNode } from 'react';
import type { ActMeta } from './story-types';

interface ChapterStageProps {
  act: ActMeta;
  /** Optional widget pinned to the top-right (calendar / week bar). */
  topRight?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

/**
 * Standard full-viewport shell used by every Snowflake act. Mirrors the AWS
 * journey&rsquo;s ActShell almost line-for-line so the two stories share a
 * vocabulary: per-act background tone, optional top-right time widget, and a
 * generous content area with consistent paddings.
 */
export function ChapterStage({
  act,
  topRight,
  children,
  contentClassName,
}: ChapterStageProps) {
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
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.primary}11, transparent 60%)`,
          }}
        />
      )}
      {topRight && (
        <div className="pointer-events-auto absolute right-6 top-[68px] z-20 md:right-8">
          {topRight}
        </div>
      )}
      <div
        className={`relative mx-auto max-w-7xl px-6 pb-28 pt-8 md:px-10 ${contentClassName ?? ''}`}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Standard act header. Big, opinionated, argues a case in one sentence.
 * Mirrors the AWS journey ActHeader.
 */
export function ChapterHeader({
  act,
  eyebrow,
}: {
  act: ActMeta;
  eyebrow?: string;
}) {
  const { theme } = act;
  return (
    <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
      <div>
        <div
          className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: theme.primary }}
        >
          Act {act.number} · {theme.moodLabel ?? ''}
        </div>
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: theme.text }}
        >
          {act.title}
        </h1>
        {eyebrow && (
          <p
            className="mt-1 max-w-3xl text-sm md:text-[15px] leading-snug"
            style={{ color: theme.muted }}
          >
            {eyebrow}
          </p>
        )}
      </div>
    </header>
  );
}
