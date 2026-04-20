'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ACT_ORDER, ACT_THEMES, type ActId } from './acts/act-theme';

interface StorySpineProps {
  currentAct: ActId;
  unlockedActs: Set<ActId>;
  onJump: (act: ActId) => void;
}

export function StorySpine({ currentAct, unlockedActs, onJump }: StorySpineProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 border-b"
      style={{
        height: 52,
        background: '#232F3E',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
      aria-label="Journey story spine"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Left: back-to-AWS link + short brand. Always single-line. */}
        <div className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          <Link
            href="/partnerships/aws"
            className="inline-flex items-center gap-1 rounded text-white/55 transition-colors hover:text-white"
            aria-label="Back to AWS partnership page"
          >
            <ArrowLeft className="h-3 w-3" />
            <span className="hidden sm:inline">AWS</span>
          </Link>
          <span className="h-3 w-px bg-white/15" aria-hidden />
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: '#FF9900' }}
            aria-hidden
          />
          <span className="hidden md:inline">Modernization journey</span>
        </div>

        {/* Center spine — dots only. The active act's label floats underneath
            the spine bar so the user always knows where they are without
            cramming 7 labels onto one row. */}
        <div className="relative flex shrink-0 items-center justify-center gap-0">
          {ACT_ORDER.map((act, idx) => {
            const theme = ACT_THEMES[act];
            const isCurrent = act === currentAct;
            const isCompleted = act < currentAct;
            const isUnlocked = unlockedActs.has(act);

            let bg = 'transparent';
            let border = 'rgba(255,255,255,0.3)';
            if (isCurrent) {
              bg = '#FF9900';
              border = '#FF9900';
            } else if (isCompleted) {
              bg = '#FFFFFF';
              border = '#FFFFFF';
            }

            return (
              <div key={act} className="flex items-center">
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => (isUnlocked ? onJump(act) : undefined)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && isUnlocked) {
                      e.preventDefault();
                      onJump(act);
                    }
                  }}
                  disabled={!isUnlocked}
                  className="group relative flex h-8 w-7 items-center justify-center transition-opacity"
                  style={{ opacity: isUnlocked ? 1 : 0.45, cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                  title={isUnlocked ? `Jump to ${theme.label}` : `${theme.label} (locked)`}
                  aria-label={`${isUnlocked ? 'Jump to' : 'Locked:'} Act ${act} — ${theme.label}`}
                >
                  <span
                    className="inline-block rounded-full transition-all"
                    style={{
                      width: isCurrent ? 14 : 10,
                      height: isCurrent ? 14 : 10,
                      background: bg,
                      border: `2px solid ${border}`,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(255,153,0,0.25)' : 'none',
                      animation: isCurrent ? 'journeyPulse 2.2s ease-in-out infinite' : 'none',
                    }}
                  />
                </button>
                {idx < ACT_ORDER.length - 1 && (
                  <div
                    className="h-px w-4 md:w-8"
                    style={{
                      background:
                        isCompleted || isCurrent
                          ? 'rgba(255,153,0,0.6)'
                          : 'rgba(255,255,255,0.12)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: just the active label so the spine always has its caption,
            even on narrow widths. Single-line, truncates if absurdly small. */}
        <div className="flex min-w-0 shrink items-baseline justify-end gap-2 text-right text-[11px] uppercase tracking-[0.16em] text-white/55">
          <span className="hidden md:inline">Act {currentAct}/7 ·</span>
          <span className="truncate font-semibold" style={{ color: '#FF9900' }}>
            {ACT_THEMES[currentAct].label}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes journeyPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255, 153, 0, 0.25); }
          50%      { box-shadow: 0 0 0 10px rgba(255, 153, 0, 0); }
        }
      `}</style>
    </nav>
  );
}
