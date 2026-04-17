'use client';

import { ReactNode } from 'react';
import { SceneImage } from './scene-image';
import type { ActMeta } from './story-types';

interface ChapterStageProps {
  act: ActMeta;
  children: ReactNode;
  hideScene?: boolean;
}

export function ChapterStage({ act, children, hideScene = false }: ChapterStageProps) {
  return (
    <section className="relative w-full min-h-[100vh] flex flex-col">
      {!hideScene && (
        <SceneImage
          src={act.sceneImage}
          dominantColor={act.dominantColor}
          moodColor={act.moodColor}
          alt={`${act.title} — establishing shot`}
        />
      )}
      <div className="relative z-10 flex flex-col">
        <div className="px-8 md:px-12 pt-24 md:pt-28">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7DD3F5]">
              Act {act.number.toString().padStart(2, '0')}
            </span>
            <span className="h-px w-8 bg-[#29B5E8]/40" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
              {act.duration}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-text-primary leading-tight tracking-tight">
            {act.title}
          </h1>
          <p className="text-sm md:text-base text-text-secondary mt-2 max-w-xl">
            {act.subtitle}
          </p>
        </div>
      </div>
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </section>
  );
}
