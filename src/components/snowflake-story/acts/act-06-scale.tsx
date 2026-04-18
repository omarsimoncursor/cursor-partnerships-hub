'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { CalendarCollapse } from '../calendar-collapse';
import { CreditsCounter } from '../credits-counter';
import { TimelineScrubber } from '../timeline-scrubber';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { CALENDAR, buildBricks } from '../story-data';
import { Disclosure } from '../disclosure';
import { Mail, Play, Pause, RotateCcw } from 'lucide-react';

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
      <div className="mb-6 flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7DD3F5]">
          Month {String(month).padStart(2, '0')}
        </span>
        <span className="text-white/35">·</span>
        <span className="text-[13px] text-white/70">
          <span className="text-white">{block.assetsCompleted.toLocaleString()}</span> of 911
          modernized
        </span>
      </div>
      <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-white/70">
        This is the same wall from Act 1. Every square that lights up is a live Snowflake
        workload earning credits. Drag the scrubber to watch four years collapse into fifteen
        months.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
        <div className="flex flex-col gap-4">

          <div className="rounded-2xl border border-white/10 bg-[#0A1221]/75 p-5">
            <AssetWall
              modernizedThrough={modernizedThrough}
              heroBrickId={null}
              dense={true}
              interactive={false}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A1221]/70 px-4 py-3">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#29B5E8]/20 border border-[#29B5E8]/40 hover:bg-[#29B5E8]/30 text-[#7DD3F5] cursor-pointer"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setMonth(0);
                setPlaying(true);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1">
              <TimelineScrubber
                value={month}
                max={CALENDAR.length - 1}
                onChange={(n) => {
                  setPlaying(false);
                  setMonth(n);
                }}
                stops={[0, 3, 6, 9, 12, 15].map((m) => ({
                  value: m,
                  label:
                    m === 0 ? 'Kickoff' : m === 15 ? 'Finish' : `M${String(m).padStart(2, '0')}`,
                }))}
              />
            </div>
          </div>

          {block.narrative && (
            <div className="flex items-start gap-3 rounded-xl border border-[#29B5E8]/25 bg-[#29B5E8]/5 px-4 py-3">
              <span className="text-[10.5px] font-mono text-[#7DD3F5] shrink-0 pt-0.5">
                M{month.toString().padStart(2, '0')}
              </span>
              <p className="text-[13px] text-white leading-relaxed">{block.narrative}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <CreditsCounter monthIndex={month} />
          <div className="rounded-2xl border border-white/10 bg-[#0A1221]/75 p-5">
            <CalendarCollapse monthIndex={month} collapseRatio={collapseRatio} />
          </div>

          <CursorValueCallout
            accent="#4C9AFF"
            label="Why the wall lights up so fast"
            headline="Cursor turns each shipped asset into leverage on the next."
            body="The reviewer&rsquo;s taste, the banker&rsquo;s-rounding macro, the deprecated-FX audit — Cursor reuses every decision across the portfolio. Asset #1 is expensive. Asset #37 is almost free."
          />

          <Disclosure
            label="Read check-in threads along the way"
            meta="Month 03 + Month 09"
            icon={<Mail className="h-3 w-3" />}
            accent="#4C9AFF"
          >
            <div className="pt-1">
              <EmailThread
                label="Inbox · Acme · Leadership"
                tone="dark"
                messages={[
                  {
                    from: 'vp',
                    to: 'CFO',
                    cc: ['Board'],
                    time: 'Month 03',
                    subject: 'Modernization status — 82 of 911 assets on Snowflake',
                    body: (
                      <p>
                        At the GSI pace we&apos;d still be in discovery. Three months in, 82
                        assets are in production on Snowflake, reviewer gates intact, and Cortex
                        credits are flowing. We retire the GSI path formally at the Q1 board
                        meeting.
                      </p>
                    ),
                  },
                  {
                    from: 'reviewer',
                    to: 'Principal Data Engineer',
                    time: 'Month 09',
                    subject: 'Hit rate on the revenue-rollup template',
                    body: (
                      <p>
                        37 of the BTEQ rollups fell to the same template — most of them were a
                        review each, not a rewrite. That&apos;s where the compounding comes
                        from. We should write up the pattern for the next wave.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </Disclosure>
        </div>
      </div>
    </ChapterStage>
  );
}
