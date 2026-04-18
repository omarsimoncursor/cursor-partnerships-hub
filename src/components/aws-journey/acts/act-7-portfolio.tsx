'use client';

import { useState } from 'react';
import { Cloud, FileText, GitPullRequest, Mail, RefreshCcw, Ticket, Zap } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { CHARACTERS, CHARACTER_ORDER } from '../data/characters';
import { CharacterStack } from '../character';
import { ArtifactModal } from '../artifacts/artifact-modal';
import { AwsConsoleArtifact } from '../artifacts/aws-console';
import { TriageReportArtifact } from '../artifacts/triage-report';
import { JiraTicketArtifact } from '../artifacts/jira-ticket';
import { GitHubPrArtifact } from '../artifacts/github-pr';
import { CursorLogo } from '../cursor-logo';
import { AI_TASKS, AI_TOTALS, CATEGORY_META, type AiTask } from '../data/ai-acceleration';

interface Act7Props {
  onReplay: () => void;
}

type ArtifactKey = 'console' | 'triage' | 'jira' | 'pr';

export function Act7Portfolio({ onReplay }: Act7Props) {
  const [openArtifact, setOpenArtifact] = useState<ArtifactKey | null>(null);

  return (
    <ActShell act={7}>
      <ActHeader
        act={7}
        eyebrow="Cursor Cloud Agents turned a 14-month modernization into a 22-day one — with every gate still approved by a named human."
      />

      {/* The close */}
      <section
        className="mb-5 rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: 'rgba(17, 24, 39, 0.1)' }}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <CursorLogo size={18} tone="light" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B45309]">
                Cursor Cloud Agents + AWS
              </span>
            </div>
            <h2 className="text-2xl font-bold leading-tight text-[#0F172A] md:text-[28px]">
              14 months of work, done in 22 days — because Cursor did the work.
            </h2>
            <p className="mt-1.5 text-[13.5px]" style={{ color: '#475569' }}>
              <strong>{Math.round(AI_TOTALS.baselineHours / 8)} person-days</strong> of senior-engineer work completed in{' '}
              <strong>{AI_TOTALS.cursorHours.toFixed(1)} agent-hours</strong> —{' '}
              <strong style={{ color: '#B45309' }}>{Math.round(AI_TOTALS.speedup)}× faster</strong>. Humans still signed every gate.
            </p>
          </div>
          <div className="flex items-center gap-3 md:border-l md:pl-4" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
            <Stat7 label="Oracle EoL" value="Dec 2027" />
            <Stat7 label="Cursor" value="Feb 2028" accent="#FF9900" />
            <Stat7 label="GSI" value="May 2030" accent="#DC2626" muted />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-[12.5px] text-[#334155]">
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: '#DCFCE7', color: '#15803D' }}>
            10 mo ahead
          </span>
          <span>
            Full 38-service portfolio finishes <strong>10 months before</strong> Oracle support ends.
            The GSI plan would finish <strong>30 months late</strong>.
          </span>
        </div>
      </section>

      {/* The Acceleration Ledger */}
      <AccelerationLedger />

      {/* Artifact receipts */}
      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#475569]">Receipts</h3>
          <span className="text-[11px] text-[#94A3B8]">The same artifacts every reviewer signed off on.</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <ReceiptButton
            icon={<Cloud className="h-4 w-4" />}
            title="AWS Console"
            sub="orders-prod live"
            onClick={() => setOpenArtifact('console')}
          />
          <ReceiptButton
            icon={<FileText className="h-4 w-4" />}
            title="Triage report"
            sub="Target plan v1.2"
            onClick={() => setOpenArtifact('triage')}
          />
          <ReceiptButton
            icon={<Ticket className="h-4 w-4" />}
            title="Jira epic"
            sub="ORDERS-4201 · Done"
            onClick={() => setOpenArtifact('jira')}
          />
          <ReceiptButton
            icon={<GitPullRequest className="h-4 w-4" />}
            title="GitHub PR"
            sub="#247 · 47 tests green"
            onClick={() => setOpenArtifact('pr')}
          />
        </div>
      </section>

      {/* Curtain call */}
      <section
        className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border p-3"
        style={{ borderColor: 'rgba(17,24,39,0.08)', background: '#FFFFFFAA' }}
      >
        <span className="text-[11px] uppercase tracking-widest text-[#475569]">Reviewed by</span>
        <CharacterStack names={CHARACTER_ORDER} size={34} />
        <span className="text-[12px] text-[#475569]">
          {CHARACTER_ORDER.map((k) => CHARACTERS[k].name).join(' · ')}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={{ borderColor: 'rgba(180,83,9,0.3)', background: 'rgba(255,153,0,0.08)', color: '#B45309' }}>
          <CursorLogo size={14} tone="light" />
          Everything else: Cursor Cloud Agents
        </span>
      </section>

      {/* Final CTAs */}
      <section className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href="mailto:enterprise@cursor.com?subject=AWS%20modernization%20demo%20%E2%80%94%20next%20steps&body=Hi%20team%2C%20I%20just%20watched%20the%20Cursor%20x%20AWS%20journey.%20Can%20we%20find%20time%20this%20week%3F"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          style={{ background: '#FF9900', color: '#0F172A' }}
        >
          <Mail className="h-4 w-4" />
          Talk to your Cursor Advisor
        </a>
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'rgba(15,23,42,0.2)', color: '#0F172A' }}
        >
          <RefreshCcw className="h-4 w-4" />
          Replay the story
        </button>
      </section>

      {/* Modals */}
      <ArtifactModal
        open={openArtifact === 'console'}
        title="AWS Console · orders-prod"
        subtitle="us-east-1 · acme-prod account"
        accent="#FF9900"
        onClose={() => setOpenArtifact(null)}
      >
        <AwsConsoleArtifact />
      </ArtifactModal>
      <ArtifactModal
        open={openArtifact === 'triage'}
        title="Modernization triage · OrdersService"
        subtitle="Target-state plan v1.2"
        accent="#16A34A"
        onClose={() => setOpenArtifact(null)}
      >
        <TriageReportArtifact />
      </ArtifactModal>
      <ArtifactModal
        open={openArtifact === 'jira'}
        title="ORDERS-4201"
        subtitle="Jira · Epic · Done"
        accent="#2563EB"
        onClose={() => setOpenArtifact(null)}
      >
        <JiraTicketArtifact />
      </ArtifactModal>
      <ArtifactModal
        open={openArtifact === 'pr'}
        title="PR #247 · acme/orders-modernization"
        subtitle="Merged · 47 tests green"
        accent="#8250DF"
        onClose={() => setOpenArtifact(null)}
      >
        <GitHubPrArtifact />
      </ArtifactModal>
    </ActShell>
  );
}

function Stat7({ label, value, accent = '#0F172A', muted }: { label: string; value: string; accent?: string; muted?: boolean }) {
  return (
    <div className={muted ? 'opacity-70' : ''}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{label}</div>
      <div className="mt-0.5 text-sm font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * AccelerationLedger — the Act 7 centerpiece.
 *
 * Replaces the old "portfolio of 38 bounded contexts" graphic. Here, each row
 * is one real task Cursor Cloud Agents accelerated during the OrdersService
 * modernization: baseline GSI duration shown as a long gray bar, Cursor's
 * actual agent-time shown as a short orange bar, grouped by the act it lived
 * in (Discover → Design → Build → Verify → Operate).
 * ------------------------------------------------------------------------ */

function AccelerationLedger() {
  // Log-scale the bars so 3 minutes and 12 weeks both read cleanly.
  const maxHours = Math.max(...AI_TASKS.map((t) => t.baselineHours));
  const minHours = 0.05;
  const scale = (hours: number) => {
    const clamped = Math.max(minHours, hours);
    return Math.log10(clamped / minHours) / Math.log10(maxHours / minHours);
  };

  const categories: AiTask['category'][] = ['discover', 'design', 'build', 'verify', 'operate'];

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
            would have taken at a GSI’s baseline cadence.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="flex items-center gap-1 text-[11px] font-mono font-bold tabular-nums"
            style={{ color: '#B45309' }}
          >
            <Zap className="h-3.5 w-3.5" />
            {Math.round(AI_TOTALS.speedup)}× aggregate
          </div>
          <div className="font-mono text-[10px] text-[#64748B]">
            {AI_TOTALS.cursorHours.toFixed(1)}h agent · vs {Math.round(AI_TOTALS.baselineHours / 8)}d person
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
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {tasks.length} task{tasks.length === 1 ? '' : 's'}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {tasks.map((task) => (
                  <LedgerRow key={task.id} task={task} scale={scale} categoryColor={meta.color} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-3 text-[10px] text-[#64748B]" style={{ borderColor: '#E2E8F0' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-6 rounded-sm" style={{ background: '#CBD5E1' }} />
          GSI baseline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-6 rounded-sm" style={{ background: '#FF9900' }} />
          Cursor Cloud Agent
        </span>
        <span className="ml-auto italic">Bars are log-scaled so 3-minute and 12-week tasks both read cleanly.</span>
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
        <span className="font-bold tabular-nums" style={{ color: '#FF9900' }}>
          {speedup}×
        </span>
      </div>

      <div className="relative col-span-2 flex h-4 items-center">
        {/* Baseline bar (gray) */}
        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            width: `${baselinePct * 100}%`,
            background: 'linear-gradient(90deg, rgba(203,213,225,0.9) 0%, rgba(203,213,225,0.5) 100%)',
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

        {/* Cursor bar (orange) — overlaid */}
        <div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full shadow-sm"
          style={{
            width: `${cursorPct * 100}%`,
            background: 'linear-gradient(90deg, #FF9900 0%, #FFBF5C 100%)',
          }}
          aria-label={`Cursor: ${task.cursorLabel}`}
        />
        <span
          className="absolute flex items-center gap-1 font-mono text-[10px] font-bold"
          style={{
            left: `calc(${cursorPct * 100}% + 4px)`,
            color: '#B45309',
            whiteSpace: 'nowrap',
          }}
        >
          {task.cursorLabel}
        </span>
      </div>
    </li>
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
        style={{ background: '#FFF3DB', color: '#B45309' }}
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
