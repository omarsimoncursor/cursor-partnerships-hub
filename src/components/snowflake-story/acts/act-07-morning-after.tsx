'use client';

import {
  Cloud,
  FileText,
  GitPullRequest,
  Mail,
  RefreshCcw,
  Rocket,
  Ticket,
  Zap,
} from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { CharacterStack } from '../character';
import { CHARACTERS, CHARACTER_ORDER } from '../data/characters';
import { ACTS, type ActComponentProps } from '../story-types';
import {
  AI_TASKS,
  AI_TOTALS,
  CATEGORY_META,
  type AiTask,
} from '../data/ai-acceleration';
import { JOURNEY_CONSTANTS } from '../data/script';

interface Act07Props extends ActComponentProps {
  onAdvance: () => void;
}

/**
 * Act 7 · Portfolio.
 *
 * The receipts: the same artifacts every reviewer signed off on. The
 * Acceleration Ledger groups every task Cursor accelerated by category and
 * shows GSI baseline vs Cursor agent-time as overlaid bars. A "what happens
 * next" sidebar previews the wave plan. Final CTA replays the story or links
 * back to the partnership page.
 *
 * Structurally identical to AWS journey Act 7 — copy and rebrand for
 * consistency between the two stories.
 */
export function Act07MorningAfter({ onAdvance, onOpenArtifact }: Act07Props) {
  const act = ACTS[6];

  return (
    <ChapterStage act={act}>
      <ChapterHeader
        act={act}
        eyebrow={`22 calendar days · 4 / 4 gates passed · ${AI_TASKS.length} tasks where Cursor Cloud Agents did the heavy lifting.`}
      />

      {/* The close */}
      <section
        className="mb-6 rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: 'rgba(17, 24, 39, 0.1)' }}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <CursorLogo size={20} tone="light" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0E7BB0]">
                Cursor Cloud Agents + Snowflake
              </span>
            </div>
            <h2 className="text-2xl font-bold leading-tight text-[#0F172A] md:text-3xl">
              daily_revenue_rollup live on Snowflake
            </h2>
            <p className="mt-1 text-[14px] text-[#475569]">
              22 calendar days · {Math.round(AI_TOTALS.baselineHours / 8)} person-days of work
              completed in <strong>{AI_TOTALS.cursorHours.toFixed(1)} agent-hours</strong> · one
              reviewer override absorbed · $5.9M / yr TCO swing
            </p>
          </div>
          <div
            className="flex items-center gap-4 md:border-l md:pl-4"
            style={{ borderColor: 'rgba(17,24,39,0.08)' }}
          >
            <Stat7 label="Teradata renewal" value="Jun 30, 2027" />
            <Stat7
              label="Your finish"
              value={JOURNEY_CONSTANTS.projectedFinishLabel}
              accent="#29B5E8"
            />
            <Stat7
              label="GSI finish"
              value={JOURNEY_CONSTANTS.gsiFinishLabel}
              accent="#DC2626"
              muted
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#334155]">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: '#DCFCE7', color: '#15803D' }}
          >
            {JOURNEY_CONSTANTS.projectedFinishMonthsAhead} mo ahead
          </span>
          <span>
            At the Cursor cadence you finish the portfolio{' '}
            <strong>{JOURNEY_CONSTANTS.projectedFinishMonthsAhead} months before</strong> the
            Teradata contract expires. At the GSI&rsquo;s cadence, you finish{' '}
            <strong>{JOURNEY_CONSTANTS.gsiMonthsLate} months late</strong>.
          </span>
        </div>
      </section>

      {/* Acceleration Ledger + what's next */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <AccelerationLedger />
        <WhatHappensNext />
      </div>

      {/* Receipts */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#475569]">
            Receipts
          </h3>
          <span className="text-[11px] text-[#94A3B8]">
            Click to open the same artifacts every reviewer saw.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReceiptButton
            icon={<Cloud className="h-4 w-4" />}
            title="Snowsight"
            sub="fct_daily_revenue · prod"
            onClick={() => onOpenArtifact('snowsight')}
          />
          <ReceiptButton
            icon={<FileText className="h-4 w-4" />}
            title="Triage report"
            sub="Migration plan v1.2"
            onClick={() => onOpenArtifact('triage')}
          />
          <ReceiptButton
            icon={<Ticket className="h-4 w-4" />}
            title="Jira CUR-5202"
            sub="Done · 14 review cycles"
            onClick={() => onOpenArtifact('jira')}
          />
          <ReceiptButton
            icon={<GitPullRequest className="h-4 w-4" />}
            title="GitHub PR #318"
            sub="Merged · 14 tests green"
            onClick={() => onOpenArtifact('pr')}
          />
        </div>
      </section>

      {/* Curtain call */}
      <section
        className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border p-4"
        style={{ borderColor: 'rgba(17,24,39,0.08)', background: '#FFFFFFAA' }}
      >
        <span className="text-[11px] uppercase tracking-widest text-[#475569]">
          Reviewed by
        </span>
        <CharacterStack names={CHARACTER_ORDER} size={34} />
        <span className="text-[12px] text-[#475569]">
          {CHARACTER_ORDER.map((k) => CHARACTERS[k].name).join(' · ')}
        </span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
          style={{
            borderColor: 'rgba(14,123,176,0.3)',
            background: 'rgba(41,181,232,0.1)',
            color: '#0E7BB0',
          }}
        >
          <CursorLogo size={14} tone="light" />
          Cursor Cloud Agents did the rest
        </span>
      </section>

      {/* Final CTAs */}
      <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/partnerships/snowflake"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          style={{ background: '#29B5E8', color: '#0F172A' }}
        >
          <Rocket className="h-4 w-4" />
          Start your own assessment
        </a>
        <a
          href="mailto:enterprise@cursor.com?subject=Snowflake%20modernization%20demo%20%E2%80%94%20next%20steps&body=Hi%20team%2C%20I%20just%20watched%20the%20Cursor%20x%20Snowflake%20journey.%20Can%20we%20find%20time%20this%20week%3F"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'rgba(15,23,42,0.2)', color: '#0F172A' }}
        >
          <Mail className="h-4 w-4" />
          Talk to your Snowflake AE
        </a>
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'rgba(15,23,42,0.2)', color: '#0F172A' }}
        >
          <RefreshCcw className="h-4 w-4" />
          Replay the story
        </button>
      </section>
    </ChapterStage>
  );
}

function Stat7({
  label,
  value,
  accent = '#0F172A',
  muted,
}: {
  label: string;
  value: string;
  accent?: string;
  muted?: boolean;
}) {
  return (
    <div className={muted ? 'opacity-70' : ''}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function AccelerationLedger() {
  const maxHours = Math.max(...AI_TASKS.map((t) => t.baselineHours));
  const minHours = 0.05;
  const scale = (hours: number) => {
    const clamped = Math.max(minHours, hours);
    return Math.log10(clamped / minHours) / Math.log10(maxHours / minHours);
  };

  const categories: AiTask['category'][] = [
    'discover',
    'design',
    'build',
    'verify',
    'operate',
  ];

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: 'rgba(17, 24, 39, 0.08)' }}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CursorLogo size={18} tone="light" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14120B]">
              AI Acceleration Ledger
            </h3>
          </div>
          <p className="mt-1 text-[12px] text-[#475569]">
            Every task Cursor Cloud Agents did during the 22-day modernization, and how long it
            would have taken at a GSI&rsquo;s baseline cadence.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums"
            style={{ color: '#0E7BB0' }}
          >
            <Zap className="h-3.5 w-3.5" />
            {Math.round(AI_TOTALS.speedup)}× aggregate
          </div>
          <div className="font-mono text-[10px] text-[#64748B]">
            {AI_TOTALS.cursorHours.toFixed(1)}h agent · vs{' '}
            {Math.round(AI_TOTALS.baselineHours / 8)}d person
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const tasks = AI_TASKS.filter((t) => t.category === cat);
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ background: `${meta.color}18`, color: meta.color }}
                >
                  Act {meta.act} · {meta.label}
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  {tasks.length} task{tasks.length === 1 ? '' : 's'}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {tasks.map((task) => (
                  <LedgerRow
                    key={task.id}
                    task={task}
                    scale={scale}
                    categoryColor={meta.color}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-3 border-t pt-3 text-[10px] text-[#64748B]"
        style={{ borderColor: '#E2E8F0' }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-6 rounded-sm"
            style={{ background: '#CBD5E1' }}
          />
          GSI baseline
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-6 rounded-sm"
            style={{ background: '#29B5E8' }}
          />
          Cursor Cloud Agent
        </span>
        <span className="ml-auto italic">
          Bars are log-scaled so 6-minute and 6-month tasks both read cleanly.
        </span>
      </div>
    </div>
  );
}

function LedgerRow({
  task,
  scale,
  categoryColor,
}: {
  task: AiTask;
  scale: (hours: number) => number;
  categoryColor: string;
}) {
  const baselinePct = scale(task.baselineHours);
  const cursorPct = scale(task.cursorHours);
  const speedup = Math.max(1, Math.round(task.baselineHours / task.cursorHours));

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5">
      <div className="flex items-center gap-2 text-[12px] text-[#0F172A]">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: categoryColor }}
        />
        <span className="font-semibold">{task.title}</span>
        <span className="truncate text-[11px] text-[#64748B]">· {task.detail}</span>
      </div>

      <div className="shrink-0 text-right font-mono text-[11px]">
        <span className="font-bold tabular-nums" style={{ color: '#29B5E8' }}>
          {speedup}×
        </span>
      </div>

      <div className="relative col-span-2 flex h-4 items-center">
        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            width: `${baselinePct * 100}%`,
            background:
              'linear-gradient(90deg, rgba(203,213,225,0.9) 0%, rgba(203,213,225,0.5) 100%)',
          }}
          aria-label={`GSI baseline: ${task.baselineLabel}`}
        />
        <span
          className="absolute font-mono text-[10px]"
          style={{
            left: `calc(${baselinePct * 100}% + 6px)`,
            color: '#64748B',
            whiteSpace: 'nowrap',
          }}
        >
          {task.baselineLabel}
        </span>

        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full shadow-sm"
          style={{
            width: `${cursorPct * 100}%`,
            background: 'linear-gradient(90deg, #29B5E8 0%, #7DD3F5 100%)',
          }}
          aria-label={`Cursor: ${task.cursorLabel}`}
        />
        <span
          className="absolute flex items-center gap-1 font-mono text-[10px] font-bold"
          style={{
            left: `calc(${cursorPct * 100}% + 4px)`,
            color: '#0E7BB0',
            whiteSpace: 'nowrap',
          }}
        >
          {task.cursorLabel}
        </span>
      </div>
    </li>
  );
}

function WhatHappensNext() {
  return (
    <aside
      className="flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm"
      style={{ borderColor: 'rgba(17,24,39,0.08)' }}
    >
      <div className="flex items-center gap-2">
        <CursorLogo size={16} tone="light" />
        <div className="text-sm font-semibold uppercase tracking-widest text-[#475569]">
          What happens next
        </div>
      </div>
      <p className="text-[12px] text-[#475569]">
        The same agent + the same four reviewers roll across the remaining 910 ELT assets in
        four waves. The pattern from asset #1 carries to the 36 sibling rollups in wave 2.
      </p>

      <NextRow color="#7DD3F5" title="Wave 1 · Day 23" detail="36 sibling rollups · ~30 days" />
      <NextRow color="#A78BFA" title="Wave 2 · Day 53" detail="247 BTEQ scripts · ~70 days" />
      <NextRow color="#FBBF24" title="Wave 3 · Day 123" detail="412 T-SQL stored procs · ~120 days" />
      <NextRow color="#10B981" title="Wave 4 · Day 243" detail="252 Informatica + SSIS jobs · final tail" />

      <div
        className="mt-2 rounded-lg border p-3"
        style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#15803D]">
          Projected finish
        </div>
        <div className="mt-1 text-xl font-bold text-[#15803D]">
          {JOURNEY_CONSTANTS.projectedFinishLabel}
        </div>
        <div className="text-[12px] text-[#166534]">
          {JOURNEY_CONSTANTS.projectedFinishMonthsAhead} months before Teradata support
          renewal.
        </div>
      </div>
    </aside>
  );
}

function NextRow({
  color,
  title,
  detail,
}: {
  color: string;
  title: string;
  detail: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-md border px-3 py-2"
      style={{ borderColor: '#E2E8F0' }}
    >
      <span
        className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      <div className="flex-1">
        <span className="text-[12px] font-semibold text-[#0F172A]">{title}</span>
        <p className="text-[11px] text-[#475569]">{detail}</p>
      </div>
    </div>
  );
}

function ReceiptButton({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: 'rgba(17,24,39,0.1)' }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ background: '#E5F6FB', color: '#0E7BB0' }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-[#0F172A]">{title}</div>
        <div className="truncate text-[11px] text-[#64748B]">{sub}</div>
      </div>
      <span className="ml-auto text-[#94A3B8] group-hover:text-[#0F172A]">→</span>
    </button>
  );
}
