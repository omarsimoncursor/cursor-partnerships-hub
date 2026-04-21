'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { OpusReasoningPane } from '../opus-reasoning-pane';
import { IdiomConstellation } from '../idiom-constellation';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';
import { StepResult } from '../step-result';
import { IDIOMS } from '../story-data';

type Phase = 'idle' | 'reading' | 'mapping' | 'done';

export function Act03Diagnosis({ onAdvance }: ActComponentProps) {
  const act = ACTS[2];
  const [phase, setPhase] = useState<Phase>('idle');
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (phase !== 'mapping') return;
    let i = 0;
    const tick = () => {
      i++;
      setRevealed(Math.min(IDIOMS.length, i));
      if (i < IDIOMS.length) {
        id = window.setTimeout(tick, 380);
      } else {
        id = window.setTimeout(() => setPhase('done'), 600);
      }
    };
    let id = window.setTimeout(tick, 200);
    return () => window.clearTimeout(id);
  }, [phase]);

  const status = phase === 'idle' ? 'idle' : phase === 'done' ? 'done' : 'running';
  const runningLabel =
    phase === 'reading'
      ? 'Cursor is reading every legacy script…'
      : 'Mapping each old idiom to a Snowflake equivalent…';

  return (
    <ChapterStage act={act}>
      <StoryStep
        accent="#29B5E8"
        step="Step 1 of 1 · Discovery"
        setting="Friday 8:04am · 4-minute reading window"
        question={
          <>
            Cursor needs to <span className="text-[#7DD3F5]">read every legacy script</span> and
            map each Teradata-specific quirk to its Snowflake equivalent. Then the team can plan
            the migration.
          </>
        }
        actuator={
          <StepActuator
            accent="#29B5E8"
            status={status}
            runLabel="Send Cursor in to read the repo"
            runSub="911 scripts · 63,180 lines · 4 dialects. The GSI quoted 6 months for this."
            runningLabel={runningLabel}
            doneLabel="Cursor finished reading"
            onRun={() => {
              setPhase('reading');
              setTimeout(() => setPhase('mapping'), 4200);
            }}
          />
        }
        result={
          status === 'done' ? (
            <StepResult
              accent="#29B5E8"
              headline="Cursor read every legacy script and mapped every dialect quirk to a Snowflake equivalent — without writing a line of code yet."
              stats={[
                { label: 'Scripts read', value: '911', hint: '4 dialects' },
                { label: 'Lines of code', value: '63,180', hint: 'in 4 minutes' },
                { label: 'Quirks mapped', value: `${IDIOMS.length}`, hint: 'covers 94% of footprint' },
                { label: 'GSI baseline', value: '6 months', hint: 'for the same phase' },
              ]}
              continueLabel="Continue · migrate the first asset"
              onContinue={onAdvance}
            />
          ) : null
        }
        rail={
          <>
            <CursorValueCallout
              accent="#29B5E8"
              headline="Six months of GSI discovery, done in one morning of reading."
              body="Cursor's codebase-wide indexing collapses the most expensive part of any migration into the time it takes the team to pour coffee."
            />
            {status !== 'idle' && (
              <OpusReasoningPane autoplay />
            )}
          </>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-[#0A1221]/70 p-5">
          {phase === 'idle' ? (
            <IdleHint />
          ) : (
            <IdiomConstellation revealed={revealed} />
          )}
        </div>
      </StoryStep>
    </ChapterStage>
  );
}

function IdleHint() {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#29B5E8]/40 bg-[#29B5E8]/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#29B5E8]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="max-w-sm text-[14px] font-medium text-white/80">
        Press the button above to send Cursor into the codebase.
      </p>
      <p className="mt-1 max-w-sm text-[12px] text-white/50">
        Each circle that lights up is one Teradata-specific quirk Cursor finds and maps. Hover any
        one when they appear.
      </p>
    </div>
  );
}
