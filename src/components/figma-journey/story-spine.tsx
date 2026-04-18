'use client';

import { FIGMA_ACT_ORDER, FIGMA_ACT_THEMES, type FigmaActId } from './acts/act-theme';

interface FigmaStorySpineProps {
  currentAct: FigmaActId;
  unlockedActs: Set<FigmaActId>;
  onJump: (act: FigmaActId) => void;
}

export function FigmaStorySpine({ currentAct, unlockedActs, onJump }: FigmaStorySpineProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 border-b"
      style={{
        height: 52,
        background: '#14112A',
        borderColor: 'rgba(162, 89, 255, 0.2)',
      }}
      aria-label="Figma journey story spine"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/70">
          <FigmaGlyph size={14} />
          Figma × Cursor — Design in the AI-native SDLC
        </div>

        <div className="relative flex flex-1 items-center justify-center gap-0 px-8">
          {FIGMA_ACT_ORDER.map((act, idx) => {
            const theme = FIGMA_ACT_THEMES[act];
            const isCurrent = act === currentAct;
            const isCompleted = act < currentAct;
            const isUnlocked = unlockedActs.has(act);

            let bg = 'transparent';
            let border = 'rgba(255,255,255,0.3)';
            if (isCurrent) {
              bg = '#A259FF';
              border = '#A259FF';
            } else if (isCompleted) {
              bg = '#FFFFFF';
              border = '#FFFFFF';
            }

            return (
              <div key={act} className="flex items-center">
                <button
                  type="button"
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
                      boxShadow: isCurrent ? '0 0 0 4px rgba(162,89,255,0.25)' : 'none',
                      animation: isCurrent ? 'figmaSpinePulse 2.2s ease-in-out infinite' : 'none',
                    }}
                  />
                  <span
                    className="hidden md:block text-[9px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: isCurrent ? '#A259FF' : 'rgba(255,255,255,0.55)' }}
                  >
                    {theme.label}
                  </span>
                </button>
                {idx < FIGMA_ACT_ORDER.length - 1 && (
                  <div
                    className="h-px w-8 md:w-12"
                    style={{
                      background:
                        isCompleted || isCurrent
                          ? 'rgba(162,89,255,0.6)'
                          : 'rgba(255,255,255,0.12)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="w-[260px] text-right text-[11px] uppercase tracking-widest text-white/50">
          <span className="hidden md:inline">Act {currentAct} of 6 · </span>
          <span style={{ color: '#A259FF' }}>{FIGMA_ACT_THEMES[currentAct].title}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes figmaSpinePulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(162, 89, 255, 0.25); }
          50%      { box-shadow: 0 0 0 10px rgba(162, 89, 255, 0); }
        }
      `}</style>
    </nav>
  );
}

/**
 * Compact Figma glyph — the classic five-dot mark, simplified.
 */
function FigmaGlyph({ size = 16 }: { size?: number }) {
  const r = size / 2;
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 24 36" aria-hidden role="img">
      <circle cx={r} cy={r} r={r} fill="#F24E1E" />
      <circle cx={size - r} cy={r} r={r} fill="#FF7262" />
      <circle cx={r} cy={size + r} r={r} fill="#A259FF" />
      <circle cx={size - r} cy={size + r} r={r} fill="#1ABCFE" />
      <circle cx={r} cy={2 * size + r} r={r} fill="#0ACF83" />
    </svg>
  );
}
