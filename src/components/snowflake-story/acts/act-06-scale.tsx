'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { CalendarCollapse } from '../calendar-collapse';
import { CreditsCounter } from '../credits-counter';
import { TimelineScrubber } from '../timeline-scrubber';
import { CALENDAR, buildBricks } from '../story-data';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function Act06Scale(_: ActComponentProps) {
  const act = ACTS[5];
  const bricks = useMemo(() => buildBricks(), []);
  const [month, setMonth] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const modernizedThrough = useMemo(() => {
    let count = 0;
    for (const b of bricks) {
      if (b.modernizedAtMonth <= month) count++;
    }
    return count;
  }, [bricks, month]);

  const collapseRatio = Math.min(1, month / (CALENDAR.length - 1));

  useEffect(() => {
    if (!playing) return;
    if (month >= CALENDAR.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      if (playingRef.current) setMonth((m) => Math.min(CALENDAR.length - 1, m + 1));
    }, 950);
    return () => clearTimeout(t);
  }, [playing, month]);

  const block = CALENDAR[month];

  return (
    <ChapterStage act={act}>
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7DD3F5]">
                Month {String(month).padStart(2, '0')} · {block.assetsCompleted.toLocaleString()} of 911 modernized
              </span>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-semibold text-text-primary leading-tight mb-2">
              Pull back. Watch the compound effect.
            </h2>
            <p className="text-[14px] text-text-secondary mb-6 max-w-2xl leading-relaxed">
              Drag the monthly scrubber to drive both the wall and the calendar collapse. This is
              the same wall from Act 1 — but every brick that lights up is a live Snowflake
              workload earning credits. The Snowflake AE&apos;s quota starts retiring the moment
              asset #1 lands, not when asset #911 does.
            </p>

            <div className="rounded-xl border border-white/10 bg-[#0A1221]/75 backdrop-blur p-5 mb-4">
              <AssetWall
                modernizedThrough={modernizedThrough}
                heroBrickId={null}
                dense={true}
                interactive={false}
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A1221]/70 backdrop-blur px-4 py-3">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#29B5E8]/20 border border-[#29B5E8]/40 hover:bg-[#29B5E8]/30 text-[#7DD3F5] cursor-pointer"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setMonth(0); setPlaying(true); }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 cursor-pointer"
                aria-label="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1">
                <TimelineScrubber
                  value={month}
                  max={CALENDAR.length - 1}
                  onChange={(n) => { setPlaying(false); setMonth(n); }}
                  stops={[0, 3, 6, 9, 12, 15].map((m) => ({
                    value: m,
                    label: m === 0 ? 'Kickoff' : m === 15 ? 'Finish' : `M${String(m).padStart(2, '0')}`,
                  }))}
                />
              </div>
            </div>

            {block.narrative && (
              <div className="mt-4 rounded-xl border border-[#29B5E8]/25 bg-[#29B5E8]/5 px-4 py-3 flex items-start gap-3">
                <span className="text-[10.5px] font-mono text-[#7DD3F5] shrink-0 pt-0.5">
                  M{month.toString().padStart(2, '0')}
                </span>
                <p className="text-[13px] text-text-primary leading-relaxed">{block.narrative}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <CreditsCounter monthIndex={month} />
            <div className="rounded-xl border border-white/10 bg-[#0A1221]/75 backdrop-blur p-5">
              <CalendarCollapse monthIndex={month} collapseRatio={collapseRatio} />
            </div>
          </div>
        </div>
      </div>
    </ChapterStage>
  );
}
