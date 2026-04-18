'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { BteqToDbtMorph } from '../bteq-to-dbt-morph';
import { TimelineScrubber } from '../timeline-scrubber';
import { ChatThread, type ChatMessage } from '../chat-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { Disclosure } from '../disclosure';
import { ListChecks } from 'lucide-react';
import { FileCode2, GitBranch, Play, TestTube2, UserCircle2 } from 'lucide-react';

type Phase = 0 | 1 | 2 | 3 | 4;

interface PhaseMeta {
  id: Phase;
  label: string;
  when: string;
  title: string;
  body: React.ReactNode;
  morphProgress: number;
  highlight: 'multiset' | 'qualify' | 'collect-stats' | 'date-math' | null;
  icon: React.ReactNode;
  accent: string;
  thread: ChatMessage[];
}

const PHASES: PhaseMeta[] = [
  {
    id: 0,
    label: 'Plan',
    when: 'T+14m',
    title: 'Cursor drafts the plan. The reviewer gets the first say.',
    body: (
      <p>
        Cursor posts the modernization plan to <span className="font-mono text-[#7DD3F5]">#data-platform</span>:
        target shape (staging + fct + 14 tests), idiom map, verification strategy (Cortex semantic
        diff + 1% row-equivalence harness). No code gets written before the plan is reviewed.
      </p>
    ),
    morphProgress: 0.08,
    highlight: null,
    icon: <FileCode2 className="w-3.5 h-3.5" />,
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
              tests on grain, FX, and top-100 rank. Verification: Cortex semantic diff + 1%
              row-equivalence harness.
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
            Hold. Banker&apos;s rounding, not half-up — finance reconciles monthly against the
            BTEQ. And the staging CTE with <span className="font-mono">ON COMMIT</span> reads
            odd; if you need cross-step state use a transient.
          </p>
        ),
      },
    ],
  },
  {
    id: 1,
    label: 'Translate',
    when: 'T+1h 05m',
    title: 'Cursor rewrites the BTEQ as a Snowflake-native dbt model.',
    body: (
      <p>
        Each Teradata-specific token rewrites to its Snowflake equivalent.
        <span className="font-mono text-[#29B5E8]"> MULTISET VOLATILE</span> folds into a CTE,
        <span className="font-mono text-[#29B5E8]"> QUALIFY</span> stays native,{' '}
        <span className="font-mono text-[#29B5E8]"> COLLECT STATS</span> disappears.
      </p>
    ),
    morphProgress: 0.55,
    highlight: 'multiset',
    icon: <GitBranch className="w-3.5 h-3.5" />,
    accent: '#29B5E8',
    thread: [
      {
        from: 'cursor',
        time: '11:05 AM',
        body: (
          <p>
            Translated. Diff is ~180 lines of dbt. Banker&apos;s-rounding macro added, transient
            staging table swapped in. Re-ran the 1% sample — Δ still zero.
          </p>
        ),
        attachments: [
          { label: 'fct_daily_revenue.sql', sub: 'new · 132 lines' },
          { label: 'diff +180 −12', sub: 'patch' },
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'Human override',
    when: 'T+1h 47m',
    title: 'The principal intervenes. Cursor adapts.',
    body: (
      <p>
        The principal notices the QUALIFY ordering differs subtly from the BTEQ — a tie-break on{' '}
        <span className="font-mono text-[#F59E0B]">customer_id</span> the original script relied
        on implicitly. Cursor adjusts the window spec and re-runs the plan against the 1% sample.
      </p>
    ),
    morphProgress: 0.75,
    highlight: 'qualify',
    icon: <UserCircle2 className="w-3.5 h-3.5" />,
    accent: '#F59E0B',
    thread: [
      {
        from: 'principal',
        time: '11:47 AM',
        body: (
          <p>
            The QUALIFY ties break on <span className="font-mono">customer_id</span> in the
            original. If you leave it off the ORDER BY we&apos;ll see rank drift on the top-100
            leaderboard. Finance will find it by Wednesday.
          </p>
        ),
      },
      {
        from: 'cursor',
        time: '12:03 PM',
        body: (
          <p>
            Good catch. Adjusted the ORDER BY, re-ran on the 1% sample. Top-100 rank drift is
            still zero.
          </p>
        ),
        attachments: [{ label: 'window-spec.diff', sub: '+1 −0' }],
      },
    ],
  },
  {
    id: 3,
    label: 'Run',
    when: 'T+2h 14m',
    title: 'First successful dbt run on Snowflake.',
    body: (
      <p>
        <span className="font-mono text-[#4ADE80]">
          dbt run --select fct_daily_revenue --target dev
        </span>
        <br />
        X-Small warehouse. 12.8s wall-clock. 14 tests compile. Cursor opens Snowsight so the team
        can inspect the DAG and query profile.
      </p>
    ),
    morphProgress: 0.95,
    highlight: null,
    icon: <Play className="w-3.5 h-3.5" />,
    accent: '#4ADE80',
    thread: [
      {
        from: 'cursor',
        time: '12:14 PM',
        body: (
          <p>
            Snowflake XS warehouse. 12.8s wall-clock. One model, zero errors. Opening Snowsight
            so you can eyeball the DAG. Running the 14 tests next.
          </p>
        ),
        attachments: [{ label: 'snowsight://fct_daily_revenue', sub: 'opened in browser' }],
      },
    ],
  },
  {
    id: 4,
    label: 'Test',
    when: 'T+2h 38m',
    title: '13 of 14 pass. Cursor diagnoses the one that fails — unprompted.',
    body: (
      <p>
        <span className="font-mono text-[#F87171]">✗ not_null_currency_code (4 rows)</span>.
        Cursor diagnoses: XOF (CFA franc) FX rates deprecated in 2023 — the legacy BTEQ was
        silently dropping them. Cursor proposes a seed + explicit audit table so finance can
        hand-review instead of losing rows.
      </p>
    ),
    morphProgress: 1,
    highlight: 'date-math',
    icon: <TestTube2 className="w-3.5 h-3.5" />,
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
              BTEQ silently dropped those rows.
            </p>
            <p className="mt-1.5">
              Proposing a seed plus an audit table — not a silent COALESCE. Finance should see
              those four rows, not lose them.
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
            Exactly right. I&apos;d rather surface four rows in an exceptions table than lose
            them. Ship the seed. I&apos;ll flag it to finance for hand-review.
          </p>
        ),
      },
    ],
  },
];

export function Act04FirstAsset({ onOpenArtifact }: ActComponentProps) {
  const act = ACTS[3];
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    if (phase >= PHASES.length - 1) return;
    const t = setTimeout(() => setPhase((p) => Math.min(4, p + 1) as Phase), 7000);
    return () => clearTimeout(t);
  }, [phase]);

  const meta = PHASES[phase];

  return (
    <ChapterStage act={act}>
      <p className="mb-6 max-w-2xl text-[14px] leading-relaxed text-white/70">
        Friday afternoon. Cursor takes one asset end-to-end — plan, translate, run, test — and
        pauses for the team at every step that requires taste.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em]"
              style={{
                color: meta.accent,
                borderColor: `${meta.accent}40`,
                background: `${meta.accent}10`,
              }}
            >
              {meta.icon}
              Phase {meta.id + 1} · {meta.label}
            </span>
            <span className="font-mono text-[11px] text-white/50">{meta.when}</span>
          </div>

          <h2 className="text-[20px] md:text-[24px] font-semibold leading-tight text-white">
            {meta.title}
          </h2>

          <BteqToDbtMorph progress={meta.morphProgress} highlight={meta.highlight} />

          <TimelineScrubber
            value={phase}
            max={PHASES.length - 1}
            onChange={(n) => setPhase(n as Phase)}
            stops={PHASES.map((p) => ({ value: p.id, label: p.label }))}
            topLabel={
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                Drag to revisit any phase of the 4-hour build
              </p>
            }
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenArtifact('snowsight')}
              className="inline-flex items-center gap-2 rounded-full bg-[#29B5E8] px-4 py-2 text-[12.5px] font-semibold text-[#0A1419] shadow-[0_0_20px_rgba(41,181,232,0.35)] transition-colors hover:bg-[#4FC3EE] cursor-pointer"
            >
              Open Snowsight
            </button>
            <button
              onClick={() => onOpenArtifact('triage')}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12.5px] text-white/80 hover:bg-white/5 hover:text-white cursor-pointer"
            >
              Read the triage report
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ChatThread
            key={`thread-${phase}`}
            label={`#data-platform · phase ${phase + 1} of 5`}
            messages={meta.thread}
          />

          <CursorValueCallout
            accent="#29B5E8"
            label="What only Cursor can do here"
            headline="Cursor writes the migration. Your team still reviews every decision."
            body="The reviewer sees the plan first. Every in-flight correction — rounding, tie-breaks, deprecated currencies — is absorbed and re-verified in minutes."
          />

          <Disclosure
            label="See all five phases"
            meta={`${phase + 1} of 5 · ${meta.when}`}
            icon={<ListChecks className="h-3 w-3" />}
            accent="#7DD3F5"
          >
            <ul className="space-y-1.5 pt-1 text-[12.5px]">
              {PHASES.map((p) => {
                const done = p.id < phase;
                const active = p.id === phase;
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-2"
                    style={{
                      color: active
                        ? p.accent
                        : done
                          ? 'rgba(237,236,236,0.75)'
                          : 'rgba(237,236,236,0.35)',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: active
                          ? p.accent
                          : done
                            ? '#4ADE80'
                            : 'rgba(237,236,236,0.25)',
                        boxShadow: active ? `0 0 8px ${p.accent}` : 'none',
                      }}
                    />
                    <span className="w-20 shrink-0 font-mono text-[10.5px] text-white/45">
                      {p.when}
                    </span>
                    <span className="flex-1">{p.label}</span>
                    {done && <span className="font-mono text-[10.5px] text-[#4ADE80]">✓</span>}
                  </li>
                );
              })}
            </ul>
          </Disclosure>
        </div>
      </div>
    </ChapterStage>
  );
}
