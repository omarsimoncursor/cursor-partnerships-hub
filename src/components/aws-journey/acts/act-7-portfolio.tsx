'use client';

import { useState } from 'react';
import { Cloud, FileText, GitPullRequest, Mail, RefreshCcw, Rocket, Ticket, Zap } from 'lucide-react';
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
        className="mb-6 rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: 'rgba(17, 24, 39, 0.1)' }}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <CursorLogo size={20} tone="light" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B45309]">
                Cursor Cloud Agents + AWS
              </span>
            </div>
            <h2 className="text-2xl font-bold leading-tight text-[#0F172A] md:text-3xl">
              What took 14 months now takes 22 days — because Cursor did the work.
            </h2>
            <p className="mt-1 text-[14px]" style={{ color: '#475569' }}>
              OrdersService is live on AWS. <strong>{Math.round(AI_TOTALS.baselineHours / 8)} person-days</strong> of
              senior-engineer work were completed in{' '}
              <strong>{AI_TOTALS.cursorHours.toFixed(1)} agent-hours</strong> — a{' '}
              <strong style={{ color: '#B45309' }}>{Math.round(AI_TOTALS.speedup)}× speedup</strong>. Humans still signed
              every gate; Cursor did the drafting, porting, testing, cutover, and the midnight watch.
            </p>
          </div>
          <div className="flex items-center gap-4 md:border-l md:pl-4" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
            <Stat7 label="Oracle EoL" value="Dec 31, 2027" />
            <Stat7 label="Your finish" value="Feb 15, 2028" accent="#FF9900" />
            <Stat7 label="GSI finish" value="May 2030" accent="#DC2626" muted />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#334155]">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ background: '#DCFCE7', color: '#15803D' }}>
            10 mo ahead
          </span>
          <span>
            With Cursor Cloud Agents driving the work, the full 38-service portfolio finishes{' '}
            <strong>10 months before</strong> the Oracle contract ends. Without Cursor, the same GSI plan finishes{' '}
            <strong>30 months late</strong> — and Acme pays the Oracle extension.
          </span>
        </div>

        {/* Story recap of what Cursor specifically did, per act */}
        <div className="mt-5 grid gap-2 rounded-lg border p-4 text-[12.5px] leading-relaxed md:grid-cols-2" style={{ borderColor: 'rgba(17,24,39,0.08)', background: '#FFFBF2', color: '#334155' }}>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#B45309' }}>
              Where Cursor did the heavy lifting
            </div>
            <ul className="space-y-1.5">
              <RecapItem act="Act 2" role="Cloud Agent" text="Read 4.2M lines of legacy code overnight and mapped 38 services." />
              <RecapItem act="Act 3" role="Cloud Agent" text="Drafted the AWS architecture in 45 minutes and rewrote it in 6 minutes after the architect pushed back." />
              <RecapItem act="Act 4" role="Cloud + Codex" text="Ported a 2.8k-line Java service to AWS Lambda + CDK, wrote 47 tests, and patched security issues before review." />
            </ul>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] md:invisible">&nbsp;</div>
            <ul className="space-y-1.5">
              <RecapItem act="Act 5" role="Cloud Agent" text="Stress-tested at 12k rps, caught a cold-start issue live, proposed the fix with a dollar number attached." />
              <RecapItem act="Act 6" role="Cloud Agent" text="Wrote the cutover runbook, drove traffic 0→100% in 4 canary steps, and live-watched every metric." />
              <RecapItem act="Gates" role="Humans" text="4 / 4 approval gates still reviewed and signed by named humans." />
            </ul>
          </div>
        </div>
      </section>

      {/* The Acceleration Ledger + what's next */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <AccelerationLedger />
        <WhatHappensNext />
      </div>

      {/* Artifact receipts */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#475569]">Receipts</h3>
          <span className="text-[11px] text-[#94A3B8]">Click to open the same artifacts every reviewer saw.</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReceiptButton
            icon={<Cloud className="h-4 w-4" />}
            title="AWS Console"
            sub="orders-prod · us-east-1"
            onClick={() => setOpenArtifact('console')}
          />
          <ReceiptButton
            icon={<FileText className="h-4 w-4" />}
            title="Triage report"
            sub="Target-state plan v1.2"
            onClick={() => setOpenArtifact('triage')}
          />
          <ReceiptButton
            icon={<Ticket className="h-4 w-4" />}
            title="Jira ORDERS-4201"
            sub="Done · 34 story points"
            onClick={() => setOpenArtifact('jira')}
          />
          <ReceiptButton
            icon={<GitPullRequest className="h-4 w-4" />}
            title="GitHub PR #247"
            sub="Merged · 47 tests green"
            onClick={() => setOpenArtifact('pr')}
          />
        </div>
      </section>

      {/* Curtain call */}
      <section
        className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border p-4"
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
      <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/partnerships/aws"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          style={{ background: '#FF9900', color: '#0F172A' }}
        >
          <Rocket className="h-4 w-4" />
          Start your own assessment
        </a>
        <a
          href="mailto:enterprise@cursor.com?subject=AWS%20modernization%20demo%20%E2%80%94%20next%20steps&body=Hi%20team%2C%20I%20just%20watched%20the%20Cursor%20x%20AWS%20journey.%20Can%20we%20find%20time%20this%20week%3F"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'rgba(15,23,42,0.2)', color: '#0F172A' }}
        >
          <Mail className="h-4 w-4" />
          Talk to your AWS rep
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

function RecapItem({ act, role, text }: { act: string; role: string; text: string }) {
  const roleColor = role === 'Humans' ? '#15803D' : role === 'Cloud + Codex' ? '#B45309' : '#B45309';
  return (
    <li className="flex items-start gap-2">
      <span
        className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
        style={{
          borderColor: role === 'Humans' ? 'rgba(21,128,61,0.3)' : 'rgba(180,83,9,0.3)',
          background: role === 'Humans' ? 'rgba(21,128,61,0.08)' : 'rgba(255,153,0,0.1)',
          color: roleColor,
        }}
      >
        {role !== 'Humans' && <CursorLogo size={10} tone="light" />}
        {role}
      </span>
      <span className="text-[12px]">
        <span className="font-semibold text-[#0F172A]">{act}.</span>{' '}
        <span style={{ color: '#475569' }}>{text}</span>
      </span>
    </li>
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

function WhatHappensNext() {
  return (
    <aside className="flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
      <div className="flex items-center gap-2">
        <CursorLogo size={16} tone="light" />
        <div className="text-sm font-semibold uppercase tracking-widest text-[#475569]">What happens next</div>
      </div>
      <p className="text-[12px] text-[#475569]">
        Same Cursor Cloud Agent pod, same four human reviewers on the gates — now rolling across the
        remaining 37 services in parallel waves. No new headcount, no new SOW.
      </p>

      <NextRow color="#4DD4FF" title="Wave 1 · Day 23"   detail="4 contexts in parallel · ~30 days" />
      <NextRow color="#A78BFA" title="Wave 2 · Day 53"   detail="9 contexts across 3 agent pods · ~70 days" />
      <NextRow color="#FBBF24" title="Wave 3 · Day 123"  detail="14 contexts · the long tail" />
      <NextRow color="#EF4444" title="Wave 4 · Q4 2027"  detail="11 batch jobs · final stragglers" />

      <div className="mt-2 rounded-lg border p-3" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#15803D]">Projected finish</div>
        <div className="mt-1 text-xl font-bold text-[#15803D]">Feb 15, 2028</div>
        <div className="text-[12px] text-[#166534]">10 months before Oracle support expires.</div>
      </div>
    </aside>
  );
}

function NextRow({ color, title, detail }: { color: string; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border px-3 py-2" style={{ borderColor: '#E2E8F0' }}>
      <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
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
