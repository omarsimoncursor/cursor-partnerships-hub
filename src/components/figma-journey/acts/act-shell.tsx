'use client';

import type { ReactNode } from 'react';
import { FIGMA_ACT_THEMES, type FigmaActId } from './act-theme';

/**
 * Figma journey act shell — full-viewport background + consistent content
 * padding, reserves 52px for the story spine.
 */
export function FigmaActShell({
  act,
  topRight,
  children,
  contentClassName,
}: {
  act: FigmaActId;
  topRight?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  const theme = FIGMA_ACT_THEMES[act];
  const isGradient = theme.bg.startsWith('linear-gradient');

  return (
    <section
      className="relative min-h-screen w-full"
      style={{
        background: theme.bg,
        color: theme.text,
        paddingTop: 52,
      }}
      data-figma-act={act}
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
        <div className="pointer-events-auto absolute right-6 top-[68px] z-20 md:right-8">
          {topRight}
        </div>
      )}
      <div className={`relative mx-auto max-w-7xl px-6 pb-28 pt-8 md:px-10 ${contentClassName ?? ''}`}>
        {children}
      </div>
    </section>
  );
}

export function FigmaActHeader({ act, eyebrow }: { act: FigmaActId; eyebrow?: string }) {
  const theme = FIGMA_ACT_THEMES[act];
  return (
    <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
      <div>
        <div
          className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: theme.primary }}
        >
          Act {act} · {theme.label}
        </div>
        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: theme.text }}>
          {theme.title}
        </h1>
        {eyebrow && (
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            {eyebrow}
          </p>
        )}
      </div>
    </header>
  );
}
