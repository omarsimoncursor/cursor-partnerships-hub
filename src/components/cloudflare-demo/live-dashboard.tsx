'use client';

/**
 * Live left-panel Cloudflare dashboard for the running + complete phases.
 *
 * Reads `liveOffsetMs` from a single shared timer in the parent page so it
 * animates in lockstep with the agent console on the right.
 *
 * Renders:
 *   - the analytics dashboard (driven by liveOffsetMs)
 *   - a "Mitigation timeline" docked footer that ticks in new entries as
 *     each fixture stage's `timelineLine` unlocks
 *   - in the complete phase, swaps to a "View attack detail" CTA
 */

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import {
  CF_PANEL,
  CF_BORDER_HARD,
  CF_TEXT_PRIMARY,
  CF_TEXT_SECONDARY,
  CF_TEXT_TERTIARY,
  CF_ORANGE,
  CF_GREEN,
  CF_AMBER,
  CF_RED,
} from './cloudflare-chrome';
import { AnalyticsDashboard } from './analytics-dashboard';
import {
  RUNNING_PHASE_REAL_MS,
  formatDisplayedClock,
  interpolateAt,
  ATTACK_STAGES,
} from '@/lib/demo/cloudflare-attack-fixture';

interface LiveDashboardProps {
  /** Whether the running-phase timer has finished and we're in `complete`. */
  complete?: boolean;
  /** Open the Cloudflare attack-detail artifact modal. */
  onViewAttackDetail?: () => void;
  onReset?: () => void;
}

export function LiveDashboard({ complete, onViewAttackDetail, onReset }: LiveDashboardProps) {
  const [offsetMs, setOffsetMs] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = performance.now();
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startRef.current;
      const cap = complete ? RUNNING_PHASE_REAL_MS : Math.min(elapsed, RUNNING_PHASE_REAL_MS);
      setOffsetMs(cap);
      if (!complete && elapsed < RUNNING_PHASE_REAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [complete]);

  // When complete, freeze the dashboard at the recovered stage.
  const liveOffset = complete ? RUNNING_PHASE_REAL_MS : offsetMs;
  const live = interpolateAt(liveOffset);

  return (
    <div
      className="w-full h-full rounded-xl border overflow-hidden flex flex-col"
      style={{ borderColor: CF_BORDER_HARD }}
    >
      {/* Live dashboard chrome */}
      <div className="flex-1 min-h-0 relative">
        <AnalyticsDashboard liveOffsetMs={liveOffset} compact hideSimulateCta />
      </div>

      {/* Mitigation timeline + actions footer */}
      <div
        className="border-t shrink-0"
        style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
      >
        <div className="px-4 py-2.5 flex items-center gap-3 border-b" style={{ borderColor: CF_BORDER_HARD }}>
          <span
            className={`w-2 h-2 rounded-full ${complete ? '' : 'animate-pulse'}`}
            style={{ background: complete ? CF_GREEN : CF_AMBER }}
          />
          <p className="text-[11.5px] font-semibold text-white">
            Mitigation timeline · {complete ? 'recovered' : 'in progress'}
          </p>
          <span className="ml-auto text-[10.5px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
            T+{formatDisplayedClock(live.timelineEntries.at(-1)?.displayedSeconds ?? 0)}
          </span>
        </div>
        <ul className="px-4 py-2 space-y-1 max-h-[120px] overflow-y-auto">
          {live.timelineEntries.length === 0 && (
            <li className="text-[11px] italic" style={{ color: CF_TEXT_TERTIARY }}>
              Waiting on first agent action…
            </li>
          )}
          {live.timelineEntries.map((entry, i) => (
            <li key={`${entry.displayedSeconds}-${i}`} className="flex items-start gap-2 text-[11.5px]">
              <span
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background:
                    entry.tone === 'attack'
                      ? CF_RED
                      : entry.tone === 'mitigating'
                        ? CF_AMBER
                        : entry.tone === 'recovered'
                          ? CF_GREEN
                          : CF_ORANGE,
                }}
              />
              <span style={{ color: CF_TEXT_SECONDARY }}>{entry.line}</span>
            </li>
          ))}
        </ul>

        <div className="px-3 pb-3 pt-1 flex items-center gap-2">
          <button
            onClick={onViewAttackDetail}
            className="flex-1 py-2 px-3 rounded-lg text-white font-medium text-sm
                       transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: CF_ORANGE }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FAAE40')}
            onMouseLeave={e => (e.currentTarget.style.background = CF_ORANGE)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open attack detail
          </button>
          <button
            onClick={onReset}
            className="py-2 px-3 rounded-lg border font-medium text-sm cursor-pointer
                       flex items-center justify-center gap-2 transition-colors"
            style={{ borderColor: CF_BORDER_HARD, color: CF_TEXT_SECONDARY }}
            onMouseEnter={e => {
              e.currentTarget.style.color = CF_TEXT_PRIMARY;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = CF_TEXT_SECONDARY;
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep ATTACK_STAGES referenced for tree-shaking-friendly debug.
void ATTACK_STAGES;
