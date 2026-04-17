'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { BteqToDbtMorph } from '../bteq-to-dbt-morph';
import { TimelineScrubber } from '../timeline-scrubber';
import { CharacterDialogue } from '../character-dialogue';
import { CharacterAvatar } from '../character-avatar';
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
  dialogue: Array<{ who: 'maya' | 'cursor' | 'jordan'; text: string }>;
}

const PHASES: PhaseMeta[] = [
  {
    id: 0,
    label: 'Plan',
    when: 'T+14m',
    title: 'Opus proposes. Maya reviews before a line of code.',
    body: (
      <p>
        Opus drafts the modernization plan — target shape (staging + fct + 14 tests), idiom map,
        verification strategy (Cortex semantic diff + 1% row-equivalence harness). The plan
        posts to <span className="font-mono text-[#7DD3F5]">#data-platform</span> and pings Maya
        before any code gets written.
      </p>
    ),
    morphProgress: 0.08,
    highlight: null,
    icon: <FileCode2 className="w-3.5 h-3.5" />,
    accent: '#7DD3F5',
    dialogue: [
      { who: 'cursor', text: 'Plan drafted. Staging CTE replaces MULTISET VOLATILE, QUALIFY stays native, COLLECT STATS drops out. Ready for your eyes, Maya.' },
      { who: 'maya', text: "Hold. Banker's rounding, not half-up. Our finance reconciles monthly against BTEQ. Drop the CTE and use a transient for staging." },
    ],
  },
  {
    id: 1,
    label: 'Translate',
    when: 'T+1h 05m',
    title: 'Composer rewrites the BTEQ as a Snowflake-native dbt model.',
    body: (
      <p>
        Each Teradata-specific token rewrites to its Snowflake equivalent, token by token.
        <span className="font-mono text-[#29B5E8]"> MULTISET VOLATILE</span> folds into a CTE,
        <span className="font-mono text-[#29B5E8]"> QUALIFY</span> stays native,{' '}
        <span className="font-mono text-[#29B5E8]"> COLLECT STATS</span> disappears (Snowflake
        maintains micro-partition stats automatically).
      </p>
    ),
    morphProgress: 0.55,
    highlight: 'multiset',
    icon: <GitBranch className="w-3.5 h-3.5" />,
    accent: '#29B5E8',
    dialogue: [
      { who: 'cursor', text: 'Translated. Diff is ~180 lines of dbt. Adding the bankers_round macro now — it vectorizes cleanly on Snowflake.' },
    ],
  },
  {
    id: 2,
    label: 'Human override',
    when: 'T+1h 47m',
    title: 'Maya intervenes. Cursor adapts.',
    body: (
      <p>
        Maya notices the QUALIFY ordering differs subtly from the BTEQ — a tie-break on{' '}
        <span className="font-mono text-[#F59E0B]">customer_id</span> the original script relied
        on implicitly. Cursor adjusts the window spec and re-runs the plan against the 1% sample.
      </p>
    ),
    morphProgress: 0.75,
    highlight: 'qualify',
    icon: <UserCircle2 className="w-3.5 h-3.5" />,
    accent: '#F59E0B',
    dialogue: [
      { who: 'maya', text: "The QUALIFY ties break on customer_id in the original — add it to the ORDER BY or we'll see rank drift on the top-100 leaderboard." },
      { who: 'cursor', text: 'Good catch. Adjusted the ORDER BY and re-ran on the 1% sample. Top-100 rank drift is still 0.' },
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
        X-Small warehouse. 12.8s wall-clock. 14 tests compile. Cursor opens the Snowsight
        workspace so Maya can inspect the DAG and the query profile.
      </p>
    ),
    morphProgress: 0.95,
    highlight: null,
    icon: <Play className="w-3.5 h-3.5" />,
    accent: '#4ADE80',
    dialogue: [
      { who: 'cursor', text: 'dbt run · 12.8s · 1 model, 0 errors. Opening Snowsight so you can see the DAG. Next: run the 14 tests.' },
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
        silently dropping them. Cursor proposes a <span className="font-mono">deprecated_currencies.csv</span>{' '}
        seed + explicit audit table so finance can hand-review instead of losing rows.
      </p>
    ),
    morphProgress: 1,
    highlight: 'date-math',
    icon: <TestTube2 className="w-3.5 h-3.5" />,
    accent: '#C084FC',
    dialogue: [
      { who: 'cursor', text: "Test failure: currency_code is NULL on 4 rows. Root cause: XOF FX rate deprecated 2023. Legacy BTEQ silently dropped them. Proposing a seed + audit table instead of a silent COALESCE — finance should see those." },
      { who: 'maya', text: "Exactly right. I'd rather surface 4 rows in an exceptions table than lose them. Ship it." },
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
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em] px-2 py-1 rounded-full border"
                style={{
                  color: meta.accent,
                  borderColor: `${meta.accent}40`,
                  background: `${meta.accent}10`,
                }}
              >
                {meta.icon}
                Phase {meta.id + 1} · {meta.label}
              </span>
              <span className="text-[11px] font-mono text-text-tertiary">{meta.when}</span>
            </div>

            <h2 className="text-[22px] md:text-[28px] font-semibold text-text-primary leading-tight mb-2">
              {meta.title}
            </h2>
            <div className="text-[13.5px] text-text-secondary mb-5 max-w-2xl leading-relaxed">
              {meta.body}
            </div>

            <BteqToDbtMorph progress={meta.morphProgress} highlight={meta.highlight} />

            <div className="mt-5">
              <TimelineScrubber
                value={phase}
                max={PHASES.length - 1}
                onChange={(n) => setPhase(n as Phase)}
                stops={PHASES.map((p) => ({ value: p.id, label: p.label }))}
                topLabel={
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary">
                    Drag to revisit any phase of the 4-hour build
                  </p>
                }
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenArtifact('snowsight')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#29B5E8] text-[#0A1419] font-semibold text-[12.5px] hover:bg-[#4FC3EE] transition-colors cursor-pointer shadow-[0_0_20px_rgba(41,181,232,0.35)]"
              >
                Open Snowsight · see the dbt run
              </button>
              <button
                onClick={() => onOpenArtifact('triage')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-text-secondary hover:text-text-primary hover:bg-white/5 text-[12.5px] cursor-pointer"
              >
                Read the triage report
              </button>
              <p className="text-[10.5px] font-mono text-text-tertiary ml-auto">
                artifact · Snowsight workspace <span className="text-[#7DD3F5]">(hero)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <CharacterDialogue
              autoplay
              maxVisible={3}
              lines={meta.dialogue.map((d) => ({
                character: d.who,
                holdMs: 3600,
                text: d.text,
                time: meta.when,
              }))}
              key={`dialogue-${phase}`}
            />

            <div className="rounded-xl border border-white/10 bg-[#0A1221]/70 backdrop-blur p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5] mb-2">
                Phase ledger
              </p>
              <ul className="space-y-1.5 text-[12.5px]">
                {PHASES.map((p) => {
                  const done = p.id < phase;
                  const active = p.id === phase;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-2"
                      style={{
                        color: active ? p.accent : done ? 'rgba(237,236,236,0.75)' : 'rgba(237,236,236,0.35)',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: active ? p.accent : done ? '#4ADE80' : 'rgba(237,236,236,0.25)',
                          boxShadow: active ? `0 0 8px ${p.accent}` : 'none',
                        }}
                      />
                      <span className="w-20 shrink-0 font-mono text-[10.5px] text-text-tertiary">
                        {p.when}
                      </span>
                      <span className="flex-1">{p.label}</span>
                      {done && <span className="text-[10.5px] text-[#4ADE80] font-mono">✓</span>}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0A1221]/50 backdrop-blur p-4 flex items-center gap-3">
              <CharacterAvatar character="cursor" size="sm" />
              <p className="text-[11.5px] text-text-secondary leading-relaxed">
                Cursor paused twice for Maya&apos;s input. Every intervention is logged in the PR
                body so Jordan can audit it later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChapterStage>
  );
}
