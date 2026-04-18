'use client';

import { ReactNode } from 'react';
import type { ActMeta } from './story-types';

interface ChapterStageProps {
  act: ActMeta;
  children: ReactNode;
  topRight?: ReactNode;
}

/**
 * Clean, themed shell modeled on the AWS journey demo. The header is kept
 * intentionally lean: a single eyebrow line (Act number · mood · duration),
 * the act title, and a short subtitle. Everything denser is the job of the
 * act content itself.
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

      <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-8 md:px-10">
        <header className="mb-10">
          <div
            className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: theme.primary }}
          >
            <span>Act {act.number.toString().padStart(2, '0')}</span>
            {theme.moodLabel && (
              <>
                <span style={{ color: theme.muted, opacity: 0.5 }}>·</span>
                <span style={{ color: theme.muted, letterSpacing: '0.2em' }}>
                  {theme.moodLabel}
                </span>
              </>
            )}
            <span style={{ color: theme.muted, opacity: 0.5 }}>·</span>
            <span className="font-mono" style={{ color: theme.muted, letterSpacing: '0.12em' }}>
              {act.duration}
            </span>
          </div>
          <h1
            className="text-[28px] font-semibold leading-[1.1] tracking-tight md:text-[40px]"
            style={{ color: theme.text }}
          >
            {act.title}
          </h1>
          <p
            className="mt-2 max-w-2xl text-[14px] md:text-[15px] leading-snug"
            style={{ color: theme.muted }}
          >
            {act.subtitle}
          </p>
        </header>
        {children}
      </div>
    </section>
  );
}
