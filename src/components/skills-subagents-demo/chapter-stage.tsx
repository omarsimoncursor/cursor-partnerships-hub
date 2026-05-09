'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import type { ActMeta } from './story-types';

interface ChapterStageProps {
  act: ActMeta;
  children: React.ReactNode;
}

/**
 * Shared cinematic background for every act. Paints a soft radial glow in
 * the act's mood color over a near-black canvas so each chapter has a
 * distinct color memory.
 */
export function ChapterStage({ act, children }: ChapterStageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }, ref);
    return () => ctx.revert();
  }, [act.id]);

  return (
    <div
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-[#05060B] text-text-primary"
    >
      {/* Mood glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(circle at 75% 18%, ${act.moodColor}22 0%, transparent 55%), radial-gradient(circle at 18% 95%, ${act.moodColor}18 0%, transparent 60%)`,
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(237,236,236,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(237,236,236,0.18) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ActHeaderProps {
  number: number;
  title: string;
  kicker: string;
  moodColor: string;
}

export function ActHeader({ number, title, kicker, moodColor }: ActHeaderProps) {
  return (
    <header className="pt-20 pb-2 px-6 max-w-6xl mx-auto">
      <div
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10.5px] font-mono uppercase tracking-[0.28em] mb-3"
        style={{
          color: moodColor,
          backgroundColor: `${moodColor}14`,
          border: `1px solid ${moodColor}33`,
        }}
      >
        <span>Act {String(number).padStart(2, '0')}</span>
        <span className="opacity-50">·</span>
        <span className="text-text-tertiary">{kicker}</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-semibold text-text-primary tracking-tight leading-tight">
        {title}
      </h2>
    </header>
  );
}
