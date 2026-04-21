'use client';

import { useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { BteqToDbtMorph } from '../bteq-to-dbt-morph';
import { ChatThread, type ChatMessage } from '../chat-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';
import { StepResult } from '../step-result';
import { FileCode2, GitBranch, Play, TestTube2, UserCircle2 } from 'lucide-react';

type PhaseId = 0 | 1 | 2 | 3 | 4;
type Status = 'idle' | 'running' | 'done';

interface Phase {
  id: PhaseId;
  label: string;
  when: string;
  /** What this phase is trying to accomplish, in plain English. */
  question: React.ReactNode;
  /** Idle-state button label. */
  runLabel: string;
  /** Running-state label. */
  runningLabel: string;
  /** Done summary headline. */
  resultHeadline: React.ReactNode;
  /** Done summary stats. */
  resultStats: { label: string; value: string; hint?: string }[];
  morphProgress: number;
  highlight: 'multiset' | 'qualify' | 'collect-stats' | 'date-math' | null;
  icon: React.ReactNode;
  accent: string;
  /** Chat messages this phase appends to the running thread. */
  thread: ChatMessage[];
  /** "What Cursor did here" rail. */
  rail: { headline: string; body: string };
}

const PHASES: Phase[] = [
  {
    id: 0,
    label: 'Plan',
    when: 'T+14m',
    question: (
      <>
        Cursor reads <span className="text-[#7DD3F5]">daily_revenue_rollup.bteq</span> and
        proposes how to rewrite it for Snowflake — <em>before</em> writing any code. The reviewer
        gets the first say.
      </>
    ),
    runLabel: 'Ask Cursor for a plan',
    runningLabel: 'Cursor is drafting the plan…',
    resultHeadline: 'Cursor posted the plan. The principal pushed back on rounding behavior. No code yet.',
    resultStats: [
      { label: 'Time to plan', value: '14m', hint: 'GSI baseline: 2 weeks' },
      { label: 'Plan changes requested', value: '1', hint: 'banker’s rounding' },
      { label: 'Code written', value: '0 lines', hint: 'plan-first workflow' },
    ],
    morphProgress: 0.08,
    highlight: null,
    icon: <FileCode2 className="h-3.5 w-3.5" />,
    accent: '#7DD3F5',
    thread: [
      {
        from: 'cursor',
        time: '10:14 AM',
        body: (
          <>
            <p>
              Proposed plan for <span className="font-mono">daily_revenue_rollup</span>: staging
              CTE replaces MULTISET VOLATILE, QUALIFY stays native, COLLECT STATS drops out. 14
              tests on grain, FX and top-100 rank.
            </p>
            <p className="mt-1.5">No code written yet — ready for your review.</p>
          </>
        ),
        attachments: [{ label: 'plan.md', sub: '+126 lines · proposed' }],
      },
      {
        from: 'principal',
        time: '10:34 AM',
        body: (
          <p>
            Hold. Banker&rsquo;s rounding, not half-up — finance reconciles monthly against the
            BTEQ.
          </p>
        ),
      },
    ],
    rail: {
      headline: 'Cursor proposes; the team approves. No surprises.',
      body: 'The plan is written in English the reviewer can read. A 14-minute plan replaces what would be a 2-week kickoff with a vendor.',
    },
  },
  {
    id: 1,
    label: 'Translate',
    when: 'T+1h 05m',
    question: (
      <>
        Now Cursor rewrites the legacy script as a Snowflake-native dbt model — applying the
        principal&rsquo;s rounding correction.
      </>
    ),
    runLabel: 'Translate the script',
    runningLabel: 'Cursor is rewriting the legacy script for Snowflake…',
    resultHeadline: 'Translated. Watch each Teradata-specific token rewrite into its Snowflake equivalent below.',
    resultStats: [
      { label: 'Lines rewritten', value: '180', hint: '+180 / −12 in dbt' },
      { label: 'Dialect quirks', value: '3', hint: 'MULTISET · QUALIFY · COLLECT STATS' },
      { label: 'Sample row delta', value: '0', hint: 'against legacy on 1% sample' },
    ],
    morphProgress: 0.55,
    highlight: 'multiset',
    icon: <GitBranch className="h-3.5 w-3.5" />,
    accent: '#29B5E8',
    thread: [
      {
        from: 'cursor',
        time: '11:05 AM',
        body: (
          <p>
            Translated. Banker&rsquo;s-rounding macro added. Re-ran the 1% sample — Δ still zero.
          </p>
        ),
        attachments: [
          { label: 'fct_daily_revenue.sql', sub: 'new · 132 lines' },
          { label: 'diff +180 −12', sub: 'patch' },
        ],
      },
    ],
    rail: {
      headline: 'A migration the team can read while it&rsquo;s being written.',
      body: 'Cursor doesn’t hand back a black box. The diff is one click away, and the team has been in the loop since the plan.',
    },
  },
  {
    id: 2,
    label: 'Override',
    when: 'T+1h 47m',
    question: (
      <>
        The principal spots a tie-break the legacy script relied on implicitly. Cursor adapts on
        the spot.
      </>
    ),
    runLabel: 'Send the correction to Cursor',
    runningLabel: 'Cursor is absorbing the correction…',
    resultHeadline: 'Cursor applied the fix and re-verified against the sample. No rank drift.',
    resultStats: [
      { label: 'Time to absorb', value: '16m', hint: 'no SOW change order' },
      { label: 'Rank drift', value: '0', hint: 'top-100 customers' },
      { label: 'Reviewer comments', value: '1 → 0', hint: 'resolved' },
    ],
    morphProgress: 0.78,
    highlight: 'qualify',
    icon: <UserCircle2 className="h-3.5 w-3.5" />,
    accent: '#F59E0B',
    thread: [
      {
        from: 'principal',
        time: '11:47 AM',
        body: (
          <p>
            QUALIFY ties break on <span className="font-mono">customer_id</span> in the original.
            Off the ORDER BY = rank drift on the top-100 leaderboard. Finance will find it.
          </p>
        ),
      },
      {
        from: 'cursor',
        time: '12:03 PM',
        body: <p>Good catch. Adjusted the ORDER BY, re-ran on the 1% sample. Drift is zero.</p>,
        attachments: [{ label: 'window-spec.diff', sub: '+1 −0' }],
      },
    ],
    rail: {
      headline: 'Cursor changes course in minutes, not change orders.',
      body: 'Every correction the team makes is absorbed and re-verified before the next coffee. No invoices, no scope creep.',
    },
  },
  {
    id: 3,
    label: 'Run',
    when: 'T+2h 14m',
    question: <>Time to see if it actually runs on Snowflake.</>,
    runLabel: 'Run the new model on Snowflake',
    runningLabel: 'Executing dbt run on Snowflake X-Small warehouse…',
    resultHeadline: 'First successful dbt run. 12.8 seconds, zero errors.',
    resultStats: [
      { label: 'Wall-clock', value: '12.8s', hint: 'vs 3,412s on Teradata' },
      { label: 'Speedup', value: '266×', hint: 'same logic' },
      { label: 'Models built', value: '1 of 1', hint: 'no errors' },
    ],
    morphProgress: 0.95,
    highlight: null,
    icon: <Play className="h-3.5 w-3.5" />,
    accent: '#4ADE80',
    thread: [
      {
        from: 'cursor',
        time: '12:14 PM',
        body: (
          <p>
            Snowflake X-Small. 12.8s wall-clock. One model, zero errors. Opening Snowsight for
            you. Running the 14 tests next.
          </p>
        ),
        attachments: [{ label: 'snowsight://fct_daily_revenue', sub: 'opened in browser' }],
      },
    ],
    rail: {
      headline: 'A 57-minute Teradata job becomes a 13-second Snowflake job.',
      body: 'Same business logic, written natively for the new platform. The performance is a free side effect.',
    },
  },
  {
    id: 4,
    label: 'Test',
    when: 'T+2h 38m',
    question: (
      <>
        Cursor runs the test suite. One test fails — and Cursor diagnoses why{' '}
        <em>without being asked</em>.
      </>
    ),
    runLabel: 'Run the 14 tests',
    runningLabel: 'Running 14 tests against the new model…',
    resultHeadline: 'Cursor caught a deprecated currency the legacy script had been silently dropping for two years.',
    resultStats: [
      { label: 'Tests passed', value: '13 / 14', hint: 'after first run' },
      { label: 'Bug found', value: 'XOF FX', hint: 'deprecated 2023' },
      { label: 'Rows surfaced', value: '4', hint: 'instead of dropped' },
    ],
    morphProgress: 1,
    highlight: 'date-math',
    icon: <TestTube2 className="h-3.5 w-3.5" />,
    accent: '#C084FC',
    thread: [
      {
        from: 'cursor',
        time: '12:38 PM',
        body: (
          <>
            <p>
              Test <span className="font-mono text-[#F87171]">not_null_currency_code</span>{' '}
              failed on 4 rows. Root cause: XOF (CFA franc) FX rate deprecated in 2023. Legacy
              BTEQ silently dropped them.
            </p>
            <p className="mt-1.5">
              Proposing a seed plus an audit table — not a silent COALESCE. Finance should{' '}
              <em>see</em> those four rows.
            </p>
          </>
        ),
        attachments: [
          { label: 'deprecated_currencies.csv', sub: 'new seed' },
          { label: 'exceptions/deprecated_fx.sql', sub: 'audit table' },
        ],
      },
      {
        from: 'principal',
        time: '12:46 PM',
        body: (
          <p>
            Exactly right. Surface them. I&rsquo;ll flag finance for hand-review. Ship the seed.
          </p>
        ),
      },
    ],
    rail: {
      headline: 'Cursor doesn&rsquo;t just translate. It improves the data hygiene.',
      body: 'A two-year-old silent bug in the legacy script comes out in the open — because Cursor knows to ask the team rather than paper it over.',
    },
  },
];

export function Act04FirstAsset({ onAdvance }: ActComponentProps) {
  const act = ACTS[3];
  const [phaseIndex, setPhaseIndex] = useState<PhaseId>(0);
  const [phaseStatus, setPhaseStatus] = useState<Status>('idle');

  const meta = PHASES[phaseIndex];
  const cumulativeMessages = PHASES.slice(0, phaseIndex)
    .flatMap((p) => p.thread)
    .concat(phaseStatus !== 'idle' ? meta.thread : []);
  const morphProgress =
    phaseStatus === 'idle' && phaseIndex === 0
      ? 0
      : phaseStatus === 'idle'
        ? PHASES[phaseIndex - 1]?.morphProgress ?? 0
        : meta.morphProgress;

  const onRun = () => {
    setPhaseStatus('running');
    setTimeout(() => setPhaseStatus('done'), 2200);
  };

  const onContinue = () => {
    if (phaseIndex < PHASES.length - 1) {
      setPhaseIndex((p) => (p + 1) as PhaseId);
      setPhaseStatus('idle');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onAdvance();
    }
  };

  return (
    <ChapterStage act={act}>
      <PhaseStrip phaseIndex={phaseIndex} phaseStatus={phaseStatus} />

      <StoryStep
        accent={meta.accent}
        step={`Step ${meta.id + 1} of 5 · ${meta.label}`}
        setting={`${meta.when} · #data-platform`}
        question={meta.question}
        actuator={
          <StepActuator
            accent={meta.accent}
            status={phaseStatus}
            runLabel={meta.runLabel}
            runningLabel={meta.runningLabel}
            doneLabel={`${meta.label} done`}
            onRun={onRun}
          />
        }
        result={
          phaseStatus === 'done' ? (
            <StepResult
              accent={meta.accent}
              headline={meta.resultHeadline}
              stats={meta.resultStats}
              continueLabel={
                phaseIndex < PHASES.length - 1
                  ? `Continue · step ${phaseIndex + 2} of 5 · ${PHASES[phaseIndex + 1].label}`
                  : 'Continue · prove and review'
              }
              onContinue={onContinue}
            />
          ) : null
        }
        rail={
          <>
            <CursorValueCallout
              accent={meta.accent}
              headline={meta.rail.headline}
              body={meta.rail.body}
            />
            {phaseStatus !== 'idle' && (
              <ChatThread
                key={`thread-${phaseIndex}-${phaseStatus}`}
                label={`#data-platform · ${meta.label.toLowerCase()}`}
                messages={cumulativeMessages}
                autoplay
              />
            )}
          </>
        }
      >
        <BteqToDbtMorph progress={morphProgress} highlight={meta.highlight} />
      </StoryStep>
    </ChapterStage>
  );
}

function PhaseStrip({ phaseIndex, phaseStatus }: { phaseIndex: PhaseId; phaseStatus: Status }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {PHASES.map((p) => {
        const done =
          p.id < phaseIndex || (p.id === phaseIndex && phaseStatus === 'done');
        const active = p.id === phaseIndex;
        const upcoming = p.id > phaseIndex;
        return (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-mono"
            style={{
              borderColor: active
                ? `${p.accent}55`
                : done
                  ? 'rgba(74,222,128,0.45)'
                  : 'rgba(255,255,255,0.10)',
              background: active
                ? `${p.accent}12`
                : done
                  ? 'rgba(74,222,128,0.08)'
                  : 'rgba(255,255,255,0.02)',
              color: active
                ? p.accent
                : done
                  ? '#4ADE80'
                  : 'rgba(255,255,255,0.45)',
              opacity: upcoming ? 0.7 : 1,
            }}
          >
            <span className="font-semibold">{p.id + 1}</span>
            <span>{p.label}</span>
            {done && <span>✓</span>}
            {active && phaseStatus === 'running' && <span className="animate-pulse">…</span>}
          </div>
        );
      })}
    </div>
  );
}
