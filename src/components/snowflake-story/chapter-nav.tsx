'use client';

import { ChevronLeft, ChevronRight, RotateCcw, Snowflake } from 'lucide-react';
import Link from 'next/link';
import { ACTS } from './story-types';

interface ChapterNavProps {
  currentIndex: number;
  onJump: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function ChapterNav({
  currentIndex,
  onJump,
  onPrev,
  onNext,
  onRestart,
}: ChapterNavProps) {
  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= ACTS.length - 1;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-5 bg-gradient-to-b from-[#05080F]/90 via-[#05080F]/60 to-transparent backdrop-blur-sm">
        <Link
          href="/partnerships/snowflake"
          className="inline-flex items-center gap-2 text-[12px] text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Snowflake Partnership
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#29B5E8]/20 border border-[#29B5E8]/50 flex items-center justify-center">
            <Snowflake className="w-3 h-3 text-[#29B5E8]" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary">
            Snowflake · Cursor · Live Migration
          </span>
        </div>
        <button
          onClick={onRestart}
          className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-text-primary transition-colors px-2.5 py-1 rounded-md hover:bg-white/5 cursor-pointer"
          title="Restart story"
        >
          <RotateCcw className="w-3 h-3" />
          Restart
        </button>
      </nav>

      <div className="fixed top-1/2 -translate-y-1/2 right-5 z-40 hidden md:flex flex-col gap-3">
        {ACTS.map((act, i) => {
          const active = i === currentIndex;
          const done = i < currentIndex;
          return (
            <button
              key={act.id}
              onClick={() => onJump(i)}
              className="group relative flex items-center gap-3 py-1"
              title={`Act ${act.number} — ${act.title}`}
            >
              <span
                className={`text-[10px] font-mono text-right w-6 transition-colors ${
                  active ? 'text-[#7DD3F5]' : done ? 'text-text-secondary' : 'text-text-tertiary/60'
                }`}
              >
                {act.number.toString().padStart(2, '0')}
              </span>
              <span
                className={`relative block rounded-full transition-all duration-300 ${
                  active
                    ? 'w-2.5 h-2.5 bg-[#29B5E8] shadow-[0_0_12px_rgba(41,181,232,0.8)]'
                    : done
                      ? 'w-2 h-2 bg-[#29B5E8]/60'
                      : 'w-1.5 h-1.5 bg-text-tertiary/40 group-hover:bg-[#29B5E8]/50'
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-all duration-300 ${
                  active
                    ? 'opacity-100 translate-x-0 text-text-primary'
                    : 'opacity-0 -translate-x-2 pointer-events-none text-text-secondary group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              >
                {act.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-[#05080F]/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={onPrev}
          disabled={atStart}
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-white/10 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous chapter (←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 px-3">
          <span className="text-[11px] font-mono text-text-tertiary">Chapter</span>
          <span className="text-[13px] font-mono text-text-primary tabular-nums">
            {String(currentIndex + 1).padStart(2, '0')}
            <span className="text-text-tertiary"> / {String(ACTS.length).padStart(2, '0')}</span>
          </span>
        </div>
        <button
          onClick={onNext}
          disabled={atEnd}
          className="group pl-4 pr-3 py-1.5 rounded-full bg-[#29B5E8] text-[#0A1419] font-semibold text-[12px] hover:bg-[#4FC3EE] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(41,181,232,0.35)] cursor-pointer"
        >
          {atEnd ? 'Restart' : 'Next chapter'}
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </>
  );
}
