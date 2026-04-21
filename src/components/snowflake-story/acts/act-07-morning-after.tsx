'use client';

import { useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';
import { StepResult } from '../step-result';
import { CheckCircle2, Moon, Power, RotateCcw } from 'lucide-react';

interface Act07Props extends ActComponentProps {
  onAdvance: () => void;
}

type Beat = 'idle' | 'shutdown' | 'sleep' | 'final';

export function Act07MorningAfter({ onAdvance }: Act07Props) {
  const act = ACTS[6];
  const [beat, setBeat] = useState<Beat>('idle');

  if (beat === 'idle') {
    return (
      <ChapterStage act={act}>
        <StoryStep
          tone="light"
          accent="#16A34A"
          step="The result · 1 of 3"
          setting="15 months later · Monday 6:47am"
          question={
            <>
              The portfolio is on Snowflake. Teradata is decommissioned. The data team had a quiet
              weekend.
            </>
          }
          actuator={
            <StepActuator
              tone="light"
              accent="#16A34A"
              status="idle"
              runLabel="Read the close-out memo"
              runSub="One Monday-morning summary, then the shutdown log."
              onRun={() => setBeat('shutdown')}
            />
          }
          rail={
            <CursorValueCallout
              tone="light"
              accent="#16A34A"
              headline="Cursor closed a 4-year migration in 15 months — without outsourcing taste."
              body="Your team wrote the standards, Cursor wrote the code, your reviewer approved every merge."
            />
          }
        >
          <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#16A34A]">
              Email · Monday 6:52am
            </p>
            <p className="mt-2 text-[16px] font-semibold text-[#0F172A]">
              Teradata decommissioned · 911 assets live on Snowflake
            </p>
            <p className="mt-3 text-[13px] text-[#475569]">
              From: <strong className="text-[#0F172A]">VP Data &amp; Analytics</strong> · To: CFO,
              CEO, Board
            </p>
            <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-[#0F172A]">
              <p>
                Last Teradata process ran at 06:00 this morning. License relinquished, renewal
                cancelled. 911 assets on Snowflake, all approved through our reviewer gates, all
                reconciled against the legacy source.
              </p>
              <p>
                Against the GSI baseline: <strong>33 months earlier</strong>,{' '}
                <strong>~$12M less out the door</strong>,{' '}
                <strong>~$5.9M / yr in steady-state savings</strong>. The data team kept the
                keyboard the whole way.
              </p>
            </div>
          </div>
        </StoryStep>
      </ChapterStage>
    );
  }

  if (beat === 'shutdown') {
    return (
      <ChapterStage act={act}>
        <StoryStep
          tone="light"
          accent="#B91C1C"
          step="The result · 2 of 3"
          setting="06:00 PT, Monday morning"
          question={
            <>
              The last Teradata process ran at <span className="text-[#B91C1C]">06:00 PT</span>.
              The legacy stack is dark.
            </>
          }
          actuator={
            <StepActuator
              tone="light"
              accent="#B91C1C"
              status="done"
              doneLabel="Teradata is dark"
              continueLabel="Continue · how the data team&rsquo;s week looks now"
              onContinue={() => setBeat('sleep')}
            />
          }
          rail={
            <CursorValueCallout
              tone="light"
              accent="#B91C1C"
              headline="Decommissioning is the real proof of a migration."
              body="A migration nobody dares to turn the legacy stack off after isn&rsquo;t a migration. This one is."
            />
          }
        >
          <TeradataShutdown />
        </StoryStep>
      </ChapterStage>
    );
  }

  if (beat === 'sleep') {
    return (
      <ChapterStage act={act}>
        <StoryStep
          tone="light"
          accent="#16A34A"
          step="The result · 3 of 3"
          setting="The data team&rsquo;s calendar this week"
          question={<>For the first time in three years: zero pages over the weekend.</>}
          actuator={
            <StepActuator
              tone="light"
              accent="#16A34A"
              status="done"
              doneLabel="No incidents to attend to"
              continueLabel="Continue · the final tally"
              onContinue={() => setBeat('final')}
            />
          }
          rail={
            <CursorValueCallout
              tone="light"
              accent="#16A34A"
              headline="The team&rsquo;s upside isn&rsquo;t just delivered code."
              body="It&rsquo;s the on-call shift that doesn&rsquo;t page, the heads-down day that stays heads-down, the retro that&rsquo;s about new work instead of old fires."
            />
          }
        >
          <CalendarCard />
        </StoryStep>
      </ChapterStage>
    );
  }

  return (
    <ChapterStage act={act}>
      <StoryStep
        tone="light"
        accent="#16A34A"
        step="The result · final"
        setting="Compared to the GSI&rsquo;s 4-year, $18M proposal"
        question={<>This is what the team brought to the board meeting.</>}
        result={
          <StepResult
            tone="light"
            accent="#16A34A"
            headline="A 4-year, $18M migration delivered in 15 months — with the data team on the keyboard the whole way."
            stats={[
              { label: 'Time vs GSI', value: '15 mo', hint: 'vs 48 months' },
              { label: 'Pulled-forward credits', value: '~$16M', hint: '33 months earlier' },
              { label: 'Steady-state savings', value: '$5.9M / yr', hint: 'TCO swing' },
              { label: 'Reviewer approval', value: '100%', hint: 'every merge' },
            ]}
            continueLabel="Replay the story from the start"
            onContinue={onAdvance}
          />
        }
        rail={
          <button
            onClick={onAdvance}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0F172A]/15 bg-white px-5 py-3 text-[13px] font-semibold text-[#0F172A] shadow-sm hover:bg-[#F1F5F9] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Play the story again
          </button>
        }
      >
        <div />
      </StoryStep>
    </ChapterStage>
  );
}

function CalendarCard() {
  const events: Array<{ day: string; label: string; tone: 'sleep' | 'meeting' | 'clear' }> = [
    { day: 'Mon', label: '6:47 — coffee. Nothing paging.', tone: 'sleep' },
    { day: 'Mon', label: '10:00 — 1:1 with reviewer · 30m', tone: 'meeting' },
    { day: 'Tue', label: '(open)', tone: 'clear' },
    { day: 'Wed', label: 'Cortex agents working group', tone: 'meeting' },
    { day: 'Thu', label: '(open — heads-down)', tone: 'clear' },
    { day: 'Fri', label: '14:00 — modernization retro', tone: 'meeting' },
  ];
  return (
    <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div>
          <p className="text-[12px] font-semibold text-[#0F172A]">Data team · this week</p>
          <p className="font-mono text-[10.5px] text-[#64748B]">
            No &ldquo;pipeline failure&rdquo; invites. No 2am pages.
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] text-[#16A34A]">
          <Moon className="h-3 w-3" /> on-call pages: 0
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[12.5px]">
        {events.map((e, i) => (
          <CalendarRow key={i} {...e} />
        ))}
      </div>
    </div>
  );
}

function CalendarRow({ day, label, tone }: { day: string; label: string; tone: 'sleep' | 'meeting' | 'clear' }) {
  const palette = {
    sleep: '#16A34A',
    meeting: '#2563EB',
    clear: '#94A3B8',
  }[tone];
  return (
    <>
      <span className="pt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[#64748B]">
        {day}
      </span>
      <span className="flex items-start gap-2" style={{ color: palette }}>
        <CheckCircle2 className="mt-0.5 h-3 w-3" />
        <span className="text-[#0F172A]">{label}</span>
      </span>
    </>
  );
}

function TeradataShutdown() {
  return (
    <div className="rounded-2xl border border-[#F87171]/30 bg-gradient-to-br from-[#FEF2F2] to-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#F87171]/35 bg-[#F87171]/15">
          <Power className="h-4 w-4 text-[#B91C1C]" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[#0F172A]">
            Teradata console · acme-prod
          </p>
          <p className="font-mono text-[10.5px] text-[#64748B]">
            Last process decommissioned 06:00 PT, Monday morning.
          </p>
        </div>
        <span className="ml-auto font-mono text-[10.5px] uppercase tracking-wider text-[#B91C1C]">
          dark
        </span>
      </div>

      <div className="space-y-0.5 rounded-md border border-[#0F172A]/10 bg-[#0F1521] p-3 font-mono text-[11.5px] leading-relaxed text-white">
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> STOP SESSION * — 0 active sessions
        </p>
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> CHECKPOINT fct_daily_revenue — last
          run 15 months ago
        </p>
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> BTEQ repository frozen at commit{' '}
          <span className="text-[#7DD3F5]">a27f3d1</span>
        </p>
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> License relinquished · renewal
          cancelled
        </p>
      </div>
    </div>
  );
}
