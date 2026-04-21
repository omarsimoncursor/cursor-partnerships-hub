'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { CalendarCollapse } from '../calendar-collapse';
import { CreditsCounter } from '../credits-counter';
import { TimelineScrubber } from '../timeline-scrubber';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';
import { StepResult } from '../step-result';
import { CALENDAR, buildBricks } from '../story-data';
import { Pause, Play, RotateCcw } from 'lucide-react';

type Status = 'idle' | 'running' | 'done';

export function Act06Scale({ onAdvance }: ActComponentProps) {
  const act = ACTS[5];
  const bricks = useMemo(() => buildBricks(), []);
  const [status, setStatus] = useState<Status>('idle');
  const [month, setMonth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    if (month >= CALENDAR.length - 1) {
      setPlaying(false);
      setStatus('done');
      return;
    }
    const t = setTimeout(() => {
      if (playingRef.current) setMonth((m) => Math.min(CALENDAR.length - 1, m + 1));
    }, 700);
    return () => clearTimeout(t);
  }, [playing, month]);

  const modernizedThrough = useMemo(() => {
    let count = 0;
    for (const b of bricks) {
      if (b.modernizedAtMonth <= month) count++;
    }
    return count;
  }, [bricks, month]);
  const collapseRatio = Math.min(1, month / (CALENDAR.length - 1));
  const block = CALENDAR[month];

  const onRun = () => {
    setStatus('running');
    setMonth(0);
    setPlaying(true);
  };

  return (
    <ChapterStage act={act}>
      <StoryStep
        accent="#4C9AFF"
        step="Step 1 of 1 · Compounding"
        setting="Asset #1 was Friday. Cursor never sleeps."
        question={
          <>
            One asset took an afternoon. <span className="text-[#7DD3F5]">There are 910 to go.</span>{' '}
            Watch the next 15 months play out — every lit square is a live Snowflake workload.
          </>
        }
        actuator={
          <StepActuator
            accent="#4C9AFF"
            status={status}
            runLabel="Press play · 15 months"
            runSub="Plays back at 1 month / second. Drag the scrubber to revisit any month."
            runningLabel={`Month ${String(month).padStart(2, '0')} of 15… ${block.assetsCompleted.toLocaleString()} of 911 modernized`}
            doneLabel="All 911 assets shipped to Snowflake"
            onRun={onRun}
          />
        }
        result={
          status === 'done' ? (
            <StepResult
              accent="#4C9AFF"
              headline="Snowflake credits started flowing in month one, not month forty. The whole portfolio retired in 15 months."
              stats={[
                { label: 'Assets shipped', value: '911', hint: 'all reviewer-approved' },
                { label: 'Time vs GSI', value: '15 mo', hint: 'vs 48 months' },
                { label: 'Pulled-forward credits', value: '~$16M', hint: '33 months earlier' },
              ]}
              continueLabel="Continue · the morning after"
              onContinue={onAdvance}
            />
          ) : null
        }
        rail={
          <>
            <CursorValueCallout
              accent="#4C9AFF"
              headline="Cursor turns each shipped asset into leverage on the next."
              body="The reviewer&rsquo;s rounding macro, the deprecated-FX audit, the template that fits 37 BTEQ rollups — Cursor reuses every decision across the portfolio. Asset #1 is expensive. Asset #37 is almost free."
            />
            {status !== 'idle' && <CreditsCounter monthIndex={month} />}
          </>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-[#0A1221]/75 p-5">
          <AssetWall
            modernizedThrough={modernizedThrough}
            heroBrickId={null}
            dense={true}
            interactive={false}
          />
        </div>

        {status !== 'idle' && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A1221]/70 px-4 py-3">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#29B5E8]/40 bg-[#29B5E8]/20 text-[#7DD3F5] hover:bg-[#29B5E8]/30 cursor-pointer"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => {
                setMonth(0);
                setPlaying(true);
                setStatus('running');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
              aria-label="Restart"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1">
              <TimelineScrubber
                value={month}
                max={CALENDAR.length - 1}
                onChange={(n) => {
                  setPlaying(false);
                  setMonth(n);
                  setStatus(n >= CALENDAR.length - 1 ? 'done' : 'running');
                }}
                stops={[0, 3, 6, 9, 12, 15].map((m) => ({
                  value: m,
                  label: m === 0 ? 'Kickoff' : m === 15 ? 'Finish' : `M${String(m).padStart(2, '0')}`,
                }))}
              />
            </div>
          </div>
        )}

        {status !== 'idle' && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-[#0A1221]/70 p-4">
            <CalendarCollapse monthIndex={month} collapseRatio={collapseRatio} />
          </div>
        )}

        {status !== 'idle' && block.narrative && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#29B5E8]/25 bg-[#29B5E8]/5 px-4 py-3">
            <span className="shrink-0 pt-0.5 font-mono text-[10.5px] text-[#7DD3F5]">
              M{month.toString().padStart(2, '0')}
            </span>
            <p className="text-[13px] leading-relaxed text-white">{block.narrative}</p>
          </div>
        )}
      </StoryStep>
    </ChapterStage>
  );
}
