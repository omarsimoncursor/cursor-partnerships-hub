'use client';

import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CursorValueCallout } from '../cursor-value-callout';
import { EmailThread } from '../email-thread';
import { Disclosure } from '../disclosure';
import { CheckCircle2, Moon, Power, Rocket, RotateCcw, Sparkles, TrendingUp } from 'lucide-react';

interface Act07Props extends ActComponentProps {
  onAdvance: () => void;
}

export function Act07MorningAfter({ onAdvance }: Act07Props) {
  const act = ACTS[6];

  return (
    <ChapterStage act={act}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="flex flex-col gap-4">
          <CalendarCard />
          <Disclosure
            label="See the Teradata shutdown log"
            meta="last process · 06:00 PT"
            icon={<Power className="h-3 w-3" />}
            tone="light"
            accent="#B91C1C"
          >
            <div className="pt-1">
              <TeradataShutdown />
            </div>
          </Disclosure>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <EmailThread
            label="Inbox · Acme · close-out"
            tone="light"
            messages={[
              {
                from: 'vp',
                to: 'CFO; CEO; Board',
                time: 'Monday 6:52am',
                subject: 'Teradata decommissioned · portfolio on Snowflake',
                body: (
                  <>
                    <p>
                      Last Teradata process ran at 06:00 this morning. License is relinquished,
                      renewal cancelled. 911 assets on Snowflake, all approved through our
                      reviewer gates, all reconciled against the legacy source.
                    </p>
                    <p className="mt-2">
                      Against the GSI baseline: 33 months earlier, ~$12M less out the door,
                      ~$5.9M/yr in steady-state TCO swing. The data team kept the keyboard the
                      whole way.
                    </p>
                  </>
                ),
                attachments: [{ label: 'close-out-memo.pdf' }, { label: 'portfolio-snapshot.xlsx' }],
              },
              {
                from: 'principal',
                to: 'VP Data & Analytics',
                time: 'Monday 7:04am',
                subject: 'Teradata decommissioned · portfolio on Snowflake',
                body: (
                  <>
                    <p>
                      First weekend on-call in three years without a page. I slept nine hours.
                      That&apos;s the metric I&apos;m bringing to the retro.
                    </p>
                    <p className="mt-2">
                      Next wave: Cortex-powered agents on the modernized marts. Cursor already
                      has a draft plan — I&apos;ll review it Wednesday.
                    </p>
                  </>
                ),
              },
            ]}
          />

          <CursorValueCallout
            tone="light"
            accent="#16A34A"
            label="Why this story ends differently"
            headline="Cursor turned a 4-year migration into a 15-month modernization — without outsourcing a line of taste."
            body="Your team wrote the taste, Cursor wrote the code, your reviewer approved the merge. Snowflake credits started flowing in month one, not month forty. That's the shape of every modernization Cursor runs."
            footer={
              <div className="grid grid-cols-3 gap-2 text-center">
                <OutcomeStat icon={<TrendingUp className="h-3 w-3" />} label="Credits pulled forward" value="33 months" />
                <OutcomeStat icon={<Rocket className="h-3 w-3" />} label="Migration finished in" value="15 months" />
                <OutcomeStat icon={<Sparkles className="h-3 w-3" />} label="Cortex agents live" value="14" />
              </div>
            }
          />

          <button
            onClick={onAdvance}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#0F172A]/15 bg-white px-5 py-3 text-[13px] font-semibold text-[#0F172A] shadow-sm hover:bg-[#F1F5F9] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Play the story again
          </button>
        </div>
      </div>
    </ChapterStage>
  );
}

function CalendarCard() {
  const events: Array<{ day: string; label: string; kind: 'sleep' | 'meeting' | 'clear' }> = [
    { day: 'Mon', label: '6:47 — coffee. Nothing paging.', kind: 'sleep' },
    { day: 'Mon', label: '10:00 — 1:1 with reviewer · 30m', kind: 'meeting' },
    { day: 'Tue', label: '(open)', kind: 'clear' },
    { day: 'Wed', label: 'Cortex agents working group', kind: 'meeting' },
    { day: 'Thu', label: '(open — heads-down)', kind: 'clear' },
    { day: 'Fri', label: '14:00 — modernization retro', kind: 'meeting' },
  ];
  return (
    <div className="rounded-2xl border border-[#0F172A]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div>
          <p className="text-[12px] font-semibold text-[#0F172A]">Data team · this week</p>
          <p className="text-[10.5px] font-mono text-[#64748B]">
            No &ldquo;pipeline failure&rdquo; invites. No 2am pages. First time in three years.
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-mono text-[#16A34A]">
          <Moon className="w-3 h-3" /> on-call page count: 0
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-4 text-[12.5px]">
        {events.map((e, i) => (
          <CalendarRow key={i} {...e} />
        ))}
      </div>
    </div>
  );
}

function CalendarRow({
  day,
  label,
  kind,
}: {
  day: string;
  label: string;
  kind: 'sleep' | 'meeting' | 'clear';
}) {
  const palette = {
    sleep: { color: '#16A34A' },
    meeting: { color: '#2563EB' },
    clear: { color: '#94A3B8' },
  }[kind];
  return (
    <>
      <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#64748B] pt-0.5">
        {day}
      </span>
      <span className="flex items-start gap-2" style={{ color: palette.color }}>
        <CheckCircle2 className="h-3 w-3 mt-0.5" />
        <span className="text-[#0F172A]">{label}</span>
      </span>
    </>
  );
}

function TeradataShutdown() {
  return (
    <div className="rounded-2xl border border-[#F87171]/30 bg-gradient-to-br from-[#FEF2F2] to-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-md bg-[#F87171]/15 border border-[#F87171]/35 flex items-center justify-center">
          <Power className="w-4 h-4 text-[#B91C1C]" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[#0F172A]">Teradata console · acme-prod</p>
          <p className="text-[10.5px] font-mono text-[#64748B]">
            Last process decommissioned 06:00 PT, Monday morning.
          </p>
        </div>
        <span className="ml-auto text-[10.5px] font-mono text-[#B91C1C] uppercase tracking-wider">
          dark
        </span>
      </div>

      <div className="rounded-md border border-[#0F172A]/10 bg-[#0F1521] text-white font-mono text-[11.5px] p-3 space-y-0.5 leading-relaxed">
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> STOP SESSION * — 0 active sessions
        </p>
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> CHECKPOINT fct_daily_revenue — last run
          15 months ago
        </p>
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> BTEQ repository frozen at commit{' '}
          <span className="text-[#7DD3F5]">a27f3d1</span>
        </p>
        <p>
          <span className="text-[#F87171]">[TD-PROD]</span> License relinquished · renewal cancelled
        </p>
        <p className="pt-1">
          <span className="text-[#4ADE80]">[SNOWFLAKE]</span> Marketplace listing live ·
          customer-360 mart available to 3 partners
        </p>
        <p>
          <span className="text-[#4ADE80]">[SNOWFLAKE]</span> Cortex agents in staging · 14
          workflows on the modernized marts
        </p>
      </div>
    </div>
  );
}

function OutcomeStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[#0F172A]/10 bg-white px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-[9.5px] font-mono uppercase tracking-wider text-[#64748B]">
        {icon}
        {label}
      </div>
      <p className="text-[14px] font-mono font-semibold text-[#16A34A]">{value}</p>
    </div>
  );
}
