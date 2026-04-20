'use client';

import type { ReactNode } from 'react';
import { ACT_THEMES, type ActId } from './act-theme';

/**
 * Standard full-viewport shell used by every act. Applies the per-act background,
 * reserves space for the fixed story spine (52px) and stakes HUD, and provides
 * a consistent content area.
 */
export function ActShell({
  act,
  topRight,
  children,
  contentClassName,
}: {
  act: ActId;
  topRight?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  const theme = ACT_THEMES[act];
  const isGradient = theme.bg.startsWith('linear-gradient');

  return (
    <section
      className="relative min-h-screen w-full"
      style={{
        background: theme.bg,
        color: theme.text,
        paddingTop: 52,
      }}
      data-act={act}
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
        <div className="pointer-events-auto absolute right-6 top-[96px] z-20 md:right-10">
          {topRight}
        </div>
      )}
      <div className={`relative mx-auto max-w-7xl px-6 pb-28 pt-12 md:px-10 md:pt-16 ${contentClassName ?? ''}`}>
        {children}
      </div>
    </section>
  );
}

export function ActHeader({ act, eyebrow }: { act: ActId; eyebrow?: string }) {
  const theme = ACT_THEMES[act];
  return (
    <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
      <div className="max-w-3xl">
        <div
          className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: theme.primary }}
        >
          Act {act} · {theme.label}
        </div>
        <h1 className="text-2xl font-bold md:text-[28px]" style={{ color: theme.text }}>
          {theme.title}
        </h1>
        {eyebrow && (
          <p className="mt-2 text-[14px] leading-relaxed md:text-[15px]" style={{ color: theme.muted }}>
            {eyebrow}
          </p>
        )}
      </div>
    </header>
  );
}
