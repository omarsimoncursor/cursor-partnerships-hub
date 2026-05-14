'use client';

import { AlertTriangle, Clock, FileWarning, Mail, PenTool, Zap } from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { ACTS, type ActComponentProps } from '../story-types';

/**
 * Act 1 · Cold open.
 *
 * Three cards argue the case in 30 seconds:
 *   1. CFO email — the deadline.
 *   2. Q1 close post-mortem — the reason.
 *   3. GSI quote — the path the team is rejecting.
 *
 * Then a "third option" card introduces Cursor and the viewer clicks
 * "Send Cursor in" to advance.
 */
export function Act01TheWall({ onAdvance }: ActComponentProps) {
  const act = ACTS[0];

  return (
    <ChapterStage act={act}>
      <ChapterHeader
        act={act}
        eyebrow="Wednesday morning. The data team has 9 days to come back with a credible alternative — not a deck. A real one."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <CfoEmail />
        <PostMortemCard />
        <GsiQuoteCard />
      </div>

      {/* Footer strip — the deadline */}
      <div
        className="mt-10 flex items-center gap-3 rounded-lg border px-5 py-4"
        style={{
          background: 'rgba(229, 83, 0, 0.08)',
          borderColor: 'rgba(229, 83, 0, 0.35)',
        }}
      >
        <Clock className="h-4 w-4 shrink-0" style={{ color: '#E55300' }} />
        <div className="flex-1 text-sm text-[#F3F4F6]">
          <span className="font-semibold">
            Teradata Enterprise Edition support renewal: June 30, 2027.
          </span>{' '}
          <span style={{ color: 'rgba(243,244,246,0.7)' }}>
            ~7 months from the start of this story.
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-5 pt-2 text-center">
        <p className="max-w-xl text-sm" style={{ color: 'rgba(243,244,246,0.65)' }}>
          The GSI will take 4 years and won&rsquo;t put a workload on Snowflake until month 40.
          You need a third option.
        </p>

        {/* Third-option card — the Cursor CTA */}
        <div
          className="flex w-full max-w-xl flex-col gap-3 rounded-xl border px-5 py-4 text-left shadow-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(41,181,232,0.12) 0%, rgba(41,181,232,0.04) 100%)',
            borderColor: 'rgba(41,181,232,0.35)',
            color: '#F9FAFB',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CursorLogo size={22} tone="dark" />
              <div className="flex flex-col">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#29B5E8' }}
                >
                  The third option
                </span>
                <span className="text-base font-bold leading-tight">
                  Cursor Cloud Agents + Snowflake
                </span>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(41,181,232,0.18)', color: '#7DD3F5' }}
            >
              <Zap className="h-3 w-3" /> Asset #1 in an afternoon
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.8)' }}>
            Cursor Cloud Agents work alongside the data team — reading every legacy script,
            drafting the migration plan, rewriting BTEQ as Snowflake-native dbt, generating the
            test suite, and orchestrating the cutover. Every gate still goes through a named
            human reviewer. First production cutover in <strong>22 days</strong>, not 14 months.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#29B5E8', color: '#0F1521' }}
        >
          <CursorLogo size={16} tone="light" />
          Send Cursor in to read the repo
          <span>→</span>
        </button>
      </div>
    </ChapterStage>
  );
}

function CfoEmail() {
  return (
    <article
      className="relative overflow-hidden rounded-xl border shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
      style={{
        background: '#F9FAFB',
        borderColor: 'rgba(17, 24, 39, 0.12)',
        color: '#111827',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          background: '#F3F4F6',
          borderColor: 'rgba(17,24,39,0.08)',
          color: '#6B7280',
        }}
      >
        <Mail className="h-3.5 w-3.5" /> Mail · Inbox
        <span className="ml-auto font-mono text-[10px] font-normal">2 days ago</span>
      </header>

      <div className="space-y-3 px-5 py-4 text-[13px] leading-relaxed">
        <div
          className="space-y-0.5 border-b pb-3 text-[12px]"
          style={{ borderColor: 'rgba(17,24,39,0.08)' }}
        >
          <div>
            <span className="font-semibold">From:</span> CFO &lt;cfo@acme.com&gt;
          </div>
          <div>
            <span className="font-semibold">To:</span> VP Data &amp; Analytics
          </div>
          <div className="text-[13px] font-semibold text-[#111827]">
            The GSI&rsquo;s SOW — find another path
          </div>
        </div>

        <p>Team —</p>
        <p>
          We are not signing an $18M SOW for a 4-year engagement with this GSI. Four years of
          parallel licensing and consulting fees before we see a single new workload on Snowflake
          is not a modernization — it&rsquo;s a standstill with a line item.
        </p>
        <p>
          Find another path. I&rsquo;m giving you until the Dec 15 board meeting to come back
          with one. A real path — not a deck.
        </p>
        <p className="font-semibold text-[#111827]">— CFO</p>
      </div>
    </article>
  );
}

function PostMortemCard() {
  return (
    <article
      className="relative overflow-hidden rounded-xl border"
      style={{
        background: '#111827',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        color: '#F3F4F6',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239,68,68,0.25)',
          color: '#FCA5A5',
        }}
      >
        <AlertTriangle className="h-3.5 w-3.5" /> INC-2026-1109 · Q1 close post-mortem
      </header>

      <dl className="space-y-3 px-5 py-4 text-[13px]">
        <Kv label="Asset" value="daily_revenue_rollup.bteq" mono small />
        <Kv label="Last successful run" value="14h 22m ago" tone="warn" />
        <Kv label="Symptom" value="Q1 close blocked" mono small tone="warn" />
        <Kv
          label="Owner"
          value="2 of 248 data engineers can read BTEQ"
          mono
          small
          tone="muted"
        />
        <Kv label="Recurrence" value="3rd Q-close in 18 months" tone="warn" />

        <div
          className="mt-3 rounded-md border px-3 py-2 text-[11px]"
          style={{
            borderColor: 'rgba(252,165,165,0.25)',
            background: 'rgba(239,68,68,0.06)',
            color: '#FCA5A5',
          }}
        >
          <code className="font-mono">
            BTEQ -&gt; INSERT INTO STG_DAILY_REV: ABORT 3807 — table or view does not exist
          </code>
        </div>
      </dl>
    </article>
  );
}

function Kv({
  label,
  value,
  mono,
  small,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  tone?: 'warn' | 'muted';
}) {
  const valueColor =
    tone === 'warn' ? '#FCA5A5' : tone === 'muted' ? 'rgba(243,244,246,0.6)' : '#F3F4F6';
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt
        className="text-[11px] uppercase tracking-wider"
        style={{ color: 'rgba(243,244,246,0.55)' }}
      >
        {label}
      </dt>
      <dd
        className={`${mono ? 'font-mono' : ''} ${small ? 'text-[12px]' : 'text-sm'} text-right font-semibold`}
        style={{ color: valueColor, maxWidth: '60%' }}
      >
        {value}
      </dd>
    </div>
  );
}

function GsiQuoteCard() {
  return (
    <article
      className="relative overflow-hidden rounded-xl border"
      style={{
        background: '#FAF8F3',
        borderColor: 'rgba(17, 24, 39, 0.15)',
        color: '#1F2937',
      }}
    >
      <div
        className="pointer-events-none absolute right-4 top-6 rotate-[-14deg] rounded border-[3px] px-2.5 py-1 text-center text-[11px] font-black uppercase tracking-[0.18em]"
        style={{
          borderColor: '#B91C1C',
          color: '#B91C1C',
          opacity: 0.82,
          fontFamily: 'ui-monospace, monospace',
          boxShadow: 'inset 0 0 0 2px rgba(185,28,28,0.2)',
        }}
      >
        REJECTED
        <div className="text-[9px] font-bold opacity-85">CFO · 2 days ago</div>
      </div>

      <header
        className="border-b px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{
          background: '#F3F0E7',
          borderColor: 'rgba(17,24,39,0.08)',
          color: '#6B7280',
        }}
      >
        <PenTool className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom" />
        Statement of Work · Hyperscale GSI
      </header>

      <div className="space-y-3 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold tabular-nums text-[#111827]">$18M</div>
          <div className="text-[12px] text-[#6B7280]">· 48 months · 14 consultants</div>
        </div>

        <ul className="space-y-1 text-[12px] text-[#374151]">
          <li>• 6-month discovery phase, deliverable: 400-page PDF</li>
          <li>• 911 legacy ELT assets rewritten over 4 modernization waves</li>
          <li>
            • First Snowflake workload in production:{' '}
            <span className="font-semibold">month 40</span>
          </li>
          <li>
            • Projected portfolio finish: <span className="font-semibold">Oct 2030</span>
          </li>
        </ul>

        <div
          className="rounded border-l-2 px-3 py-2 font-mono text-[11px]"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <FileWarning className="mr-1 inline h-3 w-3 align-text-bottom" />
          Teradata renewal Jun 30, 2027. At this cadence, 28 months late.
        </div>
      </div>
    </article>
  );
}
