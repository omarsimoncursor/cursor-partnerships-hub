'use client';

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
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/70">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: '#FF9900' }}
          />
          AWS × Cursor — Modernization journey
        </div>

        <div className="relative flex flex-1 items-center justify-center gap-0 px-8">
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
                  role="button"
                  tabIndex={0}
                  onClick={() => (isUnlocked ? onJump(act) : undefined)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && isUnlocked) {
                      e.preventDefault();
                      onJump(act);
                    }
                  }}
                  disabled={!isUnlocked}
                  className="group relative flex flex-col items-center gap-1 px-2 transition-opacity"
                  style={{ opacity: isUnlocked ? 1 : 0.45, cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                  title={isUnlocked ? `Jump to ${theme.title}` : `${theme.title} (locked)`}
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
                  <span
                    className="hidden md:block text-[9px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: isCurrent ? '#FF9900' : 'rgba(255,255,255,0.55)' }}
                  >
                    {theme.label}
                  </span>
                </button>
                {idx < ACT_ORDER.length - 1 && (
                  <div
                    className="h-px w-8 md:w-12"
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

        <div className="w-[260px] text-right text-[11px] uppercase tracking-widest text-white/50">
          <span className="hidden md:inline">Act {currentAct} of 7 · </span>
          <span style={{ color: '#FF9900' }}>{ACT_THEMES[currentAct].title}</span>
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
