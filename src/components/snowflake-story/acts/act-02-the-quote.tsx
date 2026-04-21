'use client';

import { useState } from 'react';
import { FileWarning, PenTool } from 'lucide-react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';
import { StepResult } from '../step-result';

type Beat = 'idle' | 'opened' | 'rejected';

export function Act02TheQuote({ onAdvance }: ActComponentProps) {
  const act = ACTS[1];
  const [beat, setBeat] = useState<Beat>('idle');

  const status = beat === 'idle' ? 'idle' : beat === 'opened' ? 'running' : 'done';

  return (
    <ChapterStage act={act}>
      <StoryStep
        tone="light"
        accent="#B91C1C"
        step="The impasse · 1 of 1"
        setting="Wednesday · Acme HQ"
        question={
          <>
            The system integrator quotes <span className="text-[#B91C1C]">$18M over 4 years</span>
            . The team won&rsquo;t see a Snowflake workload in production until{' '}
            <span className="text-[#B91C1C]">month 40</span>.
          </>
        }
        actuator={
          <StepActuator
            tone="light"
            accent="#B91C1C"
            status={status}
            runLabel="Open the SOW"
            runSub="See exactly what the team is being asked to sign."
            runningLabel="Reading the proposal…"
            doneLabel="The CFO has replied"
            onRun={() => {
              setBeat('opened');
              setTimeout(() => setBeat('rejected'), 1100);
            }}
          />
        }
        result={
          status === 'done' ? (
            <StepResult
              tone="light"
              accent="#B91C1C"
              headline="The CFO declined the SOW. The team has until the Dec 15 board meeting to come back with a credible third option."
              stats={[
                { label: 'GSI quote', value: '$18M', hint: '48 months · fixed fee' },
                { label: 'First Snowflake workload', value: 'Month 40', hint: 'after 9-month UAT' },
                { label: 'Parallel licensing', value: '$6M / yr', hint: 'while nothing moves' },
              ]}
              continueLabel="Continue · the team tries Cursor"
              onContinue={onAdvance}
            />
          ) : null
        }
        rail={
          <CursorValueCallout
            tone="light"
            accent="#2563EB"
            label="The third option"
            headline="Cursor collapses the slowest parts of a migration without taking the keyboard."
            body="Discovery, translation, verification — the work that fills GSI invoices — Cursor does in minutes, supervised by the team that actually owns the code."
          />
        }
      >
        <GsiProposalCard rejected={status === 'done'} />
      </StoryStep>
    </ChapterStage>
  );
}

function GsiProposalCard({ rejected }: { rejected: boolean }) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border shadow-lg"
      style={{ background: '#FFFDF7', borderColor: 'rgba(17,24,39,0.12)', color: '#1F2937' }}
    >
      {rejected && (
        <div
          className="pointer-events-none absolute right-5 top-6 rotate-[-10deg] rounded border-[3px] px-2.5 py-1 text-center text-[11px] font-black uppercase tracking-[0.18em] rejected-stamp"
          style={{
            borderColor: '#B91C1C',
            color: '#B91C1C',
            opacity: 0.9,
            fontFamily: 'ui-monospace, monospace',
            boxShadow: 'inset 0 0 0 2px rgba(185,28,28,0.2)',
          }}
        >
          REJECTED
          <div className="text-[9px] font-bold opacity-85">CFO · Wed 11:02am</div>
        </div>
      )}

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
          <li>• 6-month discovery phase, deliverable: 400-page PDF</li>
          <li>• 48 months of offshore engineers rewriting all 911 assets</li>
          <li>• 9-month UAT running both stacks in parallel</li>
          <li>• First Snowflake workload in production: <strong>month 40</strong></li>
          <li>• Portfolio finish: <strong>May 2030</strong></li>
        </ul>

        <div
          className="rounded border-l-2 px-3 py-2 text-[11px] font-mono"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <FileWarning className="mr-1 inline h-3 w-3 align-text-bottom" />
          Teradata Enterprise support renewal: Dec 31, 2027. At this cadence, 30 months late.
        </div>
      </div>

      <style jsx>{`
        :global(.rejected-stamp) {
          animation: stampIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes stampIn {
          0% {
            opacity: 0;
            transform: rotate(-25deg) scale(2.2);
          }
          100% {
            opacity: 0.9;
            transform: rotate(-10deg) scale(1);
          }
        }
      `}</style>
    </article>
  );
}
