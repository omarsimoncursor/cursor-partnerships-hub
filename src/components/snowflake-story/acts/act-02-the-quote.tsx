'use client';

import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { AlertTriangle, FileWarning, PenTool } from 'lucide-react';

export function Act02TheQuote(_: ActComponentProps) {
  const act = ACTS[1];
  return (
    <ChapterStage act={act}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <h2 className="text-[22px] font-semibold leading-tight text-[#0F172A] md:text-[26px]">
            The incumbent GSI has a 4-year path. The CFO won&apos;t sign it.
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-[#475569]">
            The proposal is predictable, expensive, and written in a way that makes the data team a
            passenger on their own modernization. It&apos;s the kind of path every enterprise has
            said yes to before — and the kind every CFO is now questioning.
          </p>

          <GsiProposalCard />

          <ParallelCostCard />
        </div>

        <div className="flex flex-col gap-4">
          <EmailThread
            label="Internal thread · Leadership"
            tone="light"
            messages={[
              {
                from: 'gsi',
                to: 'VP Data & Analytics; CFO',
                time: 'Wed 9:14am',
                subject: 'Acme Modernization — Final SOW v7',
                body: (
                  <>
                    <p>
                      Attached is the final statement of work for Acme&apos;s Teradata-to-Snowflake
                      modernization. 48 months, fixed fee, 14 engineers on our bench plus two
                      onshore leads. Billing quarterly, no change orders baked in.
                    </p>
                    <p className="mt-2">
                      Predictable, on-budget, fully managed. We recommend counter-signature by
                      Dec 15 to hit our Q1 delivery slot.
                    </p>
                  </>
                ),
                attachments: [
                  { label: 'Acme-Modernization-SOW-v7.pdf' },
                  { label: '48-month-runbook.pdf' },
                ],
              },
              {
                from: 'cfo',
                to: 'VP Data & Analytics',
                time: 'Wed 11:02am',
                subject: 'Acme Modernization — Final SOW v7',
                body: (
                  <>
                    <p>
                      We are not signing an $18M SOW for a 4-year engagement with this GSI. Four
                      years of parallel licensing and consulting fees before we see a single new
                      workload on Snowflake is not a modernization — it&apos;s a standstill with a
                      line item.
                    </p>
                    <p className="mt-2">
                      Find another path. I&apos;m giving you until the Dec 15 board meeting.
                    </p>
                  </>
                ),
              },
              {
                from: 'vp',
                to: 'Principal Data Engineer; Senior Data Engineer',
                time: 'Wed 11:47am',
                subject: 'Acme Modernization — Final SOW v7',
                body: (
                  <>
                    <p>
                      You saw the CFO&apos;s note. If we&apos;re going to push back on the GSI
                      path, we need more than a philosophical argument by Friday — we need one
                      asset, end-to-end, on Snowflake, with the reviewer gates we&apos;d expect in
                      a real release.
                    </p>
                    <p className="mt-2">
                      Principal drives. Reviewer holds the merge button. Let&apos;s see what we
                      can get done on Friday.
                    </p>
                  </>
                ),
              },
            ]}
          />

          <CursorValueCallout
            tone="light"
            accent="#2563EB"
            label="Why the third option exists now"
            headline="Cursor collapses the slowest parts of a migration — plan, translate, verify — without taking the keyboard from your team."
            body="Every hour the GSI bills to onboard, diagram, and hand-translate is an hour Cursor does in minutes, supervised. Modernization speed becomes a function of how fast the team wants to review, not how fast an outside bench can ramp."
          />
        </div>
      </div>
    </ChapterStage>
  );
}

function GsiProposalCard() {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border shadow-lg"
      style={{ background: '#FFFDF7', borderColor: 'rgba(17,24,39,0.12)', color: '#1F2937' }}
    >
      <div
        className="pointer-events-none absolute right-5 top-6 rotate-[-10deg] rounded border-[3px] px-2.5 py-1 text-center text-[11px] font-black uppercase tracking-[0.18em]"
        style={{
          borderColor: '#B91C1C',
          color: '#B91C1C',
          opacity: 0.82,
          fontFamily: 'ui-monospace, monospace',
          boxShadow: 'inset 0 0 0 2px rgba(185,28,28,0.2)',
        }}
      >
        REJECTED
        <div className="text-[9px] font-bold opacity-85">CFO · Wed 11:02am</div>
      </div>

      <header
        className="flex items-center gap-2 border-b px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ background: '#F3F0E7', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
      >
        <PenTool className="h-3.5 w-3.5" />
        Statement of Work · Apex Global Services
      </header>

      <div className="space-y-3 px-5 py-5">
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-bold tabular-nums" style={{ color: '#111827' }}>
            $18M
          </div>
          <div className="text-[12px]" style={{ color: '#6B7280' }}>
            · 48 months · 16 FTE average
          </div>
        </div>

        <ul className="space-y-1 text-[12.5px]" style={{ color: '#374151' }}>
          <li>• 6-month discovery phase with 8-person pod, deliverable: 400-page PDF</li>
          <li>• 48 months of rotating offshore engineers rewriting all 911 assets</li>
          <li>• 9-month UAT running Teradata + Snowflake in parallel</li>
          <li>• First Snowflake workload in production: <strong>month 40</strong></li>
          <li>• Portfolio finish: <strong>May 2030</strong></li>
        </ul>

        <div
          className="rounded border-l-2 px-3 py-2 text-[11px] font-mono"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <FileWarning className="mr-1 inline h-3 w-3 align-text-bottom" />
          Teradata Enterprise Edition support renewal window: Dec 31, 2027. At this cadence, the
          migration is 30 months late.
        </div>
      </div>
    </article>
  );
}

function ParallelCostCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF, #F7F5EF)',
        borderColor: 'rgba(17,24,39,0.12)',
        color: '#1F2937',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ background: '#F3F0E7', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Parallel licensing during GSI plan
      </header>
      <div className="grid grid-cols-3 gap-3 px-5 py-4">
        <Cost label="Teradata" value="$4.1M" note="continues through month 40" />
        <Cost label="Informatica" value="$1.7M" note="until final cutover" />
        <Cost label="Snowflake" value="$0.2M" note="UAT credits only" />
      </div>
      <div className="border-t px-5 py-3 text-[12px]" style={{ borderColor: 'rgba(17,24,39,0.08)', color: '#475569' }}>
        The GSI&apos;s $18M fee is on top of $6M of legacy licensing you keep paying because
        nothing has moved to Snowflake yet.
      </div>
    </div>
  );
}

function Cost({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border bg-white px-3 py-2.5" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
      <p className="text-[10.5px] font-mono uppercase tracking-wider text-[#6B7280]">{label}</p>
      <p className="text-[20px] font-bold text-[#B91C1C] font-mono tabular-nums">{value}</p>
      <p className="text-[11px] text-[#6B7280] mt-0.5">{note}</p>
    </div>
  );
}
