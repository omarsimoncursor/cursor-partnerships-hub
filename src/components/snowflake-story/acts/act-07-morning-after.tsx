'use client';

import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AeEndcard } from '../ae-endcard';
import { CharacterAvatar } from '../character-avatar';
import { CheckCircle2, Circle, Moon, Power, Sunrise } from 'lucide-react';

interface Act07Props extends ActComponentProps {
  onAdvance: () => void;
}

export function Act07MorningAfter({ onAdvance }: Act07Props) {
  const act = ACTS[6];

  return (
    <ChapterStage act={act}>
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 items-start">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1">
              <Sunrise className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#F59E0B]">
                15 months later · Monday 6:47am
              </span>
            </div>
            <h2 className="text-[26px] md:text-[34px] font-semibold text-text-primary leading-tight">
              Maya sleeps through the night. Samira closes the expansion.
            </h2>

            <MayaCalendar />
            <TeradataShutdown />
          </div>

          <div className="lg:sticky lg:top-24">
            <AeEndcard onRestart={onAdvance} />
          </div>
        </div>
      </div>
    </ChapterStage>
  );
}

function MayaCalendar() {
  const events: Array<{ day: string; label: string; kind: 'sleep' | 'meeting' | 'clear' }> = [
    { day: 'Mon', label: '6:47 — coffee. Nothing paging.', kind: 'sleep' },
    { day: 'Mon', label: '10:00 — 1:1 with Jordan · 30m', kind: 'meeting' },
    { day: 'Tue', label: '(open)', kind: 'clear' },
    { day: 'Wed', label: 'Cortex AI features working group', kind: 'meeting' },
    { day: 'Thu', label: '(open — heads-down)', kind: 'clear' },
    { day: 'Fri', label: '14:00 — modernization retro', kind: 'meeting' },
  ];
  return (
    <div className="rounded-xl border border-white/10 bg-[#0A1221]/80 backdrop-blur p-5">
      <div className="flex items-center gap-3 mb-4">
        <CharacterAvatar character="maya" size="sm" />
        <div>
          <p className="text-[12px] font-semibold text-text-primary">Maya&apos;s calendar</p>
          <p className="text-[10.5px] font-mono text-text-tertiary">
            No &ldquo;pipeline failure&rdquo; invites. No 2am pages. For the first time in 3 years.
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] font-mono text-[#4ADE80]">
          <Moon className="w-3 h-3" /> slept 9 hours
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-4 text-[12.5px]">
        {events.map((e, i) => (
          <CalendarRow key={i} {...e} />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10.5px] font-mono">
        <span className="text-text-tertiary">pages this week</span>
        <span className="text-[#4ADE80]">0</span>
      </div>
    </div>
  );
}

function CalendarRow({ day, label, kind }: { day: string; label: string; kind: 'sleep' | 'meeting' | 'clear' }) {
  const palette = {
    sleep: { color: '#7DD3F5', icon: <CheckCircle2 className="w-3 h-3" /> },
    meeting: { color: '#A78BFA', icon: <Circle className="w-3 h-3" /> },
    clear: { color: 'rgba(237,236,236,0.35)', icon: <Circle className="w-3 h-3" /> },
  }[kind];
  return (
    <>
      <span className="text-[10.5px] font-mono uppercase tracking-wider text-text-tertiary pt-0.5">
        {day}
      </span>
      <span className="flex items-start gap-2" style={{ color: palette.color }}>
        <span className="pt-0.5">{palette.icon}</span>
        <span className="text-text-primary">{label}</span>
      </span>
    </>
  );
}

function TeradataShutdown() {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1A0E0E]/80 to-[#080A10]/90 backdrop-blur p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-md bg-[#F87171]/15 border border-[#F87171]/35 flex items-center justify-center">
          <Power className="w-4 h-4 text-[#F87171]" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-text-primary">Teradata console · acme-prod</p>
          <p className="text-[10.5px] font-mono text-text-tertiary">
            Last process decommissioned 06:00 PT, Monday morning.
          </p>
        </div>
        <span className="ml-auto text-[10.5px] font-mono text-[#F87171] uppercase tracking-wider">
          dark
        </span>
      </div>

      <div className="rounded-md border border-white/5 bg-[#05080F] font-mono text-[11.5px] p-3 text-text-tertiary space-y-0.5 leading-relaxed">
        <p className="text-text-secondary">
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
        <p className="text-text-secondary pt-1">
          <span className="text-[#4ADE80]">[SNOWFLAKE]</span> Marketplace listing live ·
          customer-360 mart available to 3 partners
        </p>
        <p>
          <span className="text-[#4ADE80]">[SNOWFLAKE]</span> Cortex-powered Agents in staging · 14
          workflows using modernized marts
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <OutcomeStat label="Credits flowing" value="month 1" tone="success" />
        <OutcomeStat label="TCO swing" value="−$5.9M/yr" tone="success" />
        <OutcomeStat label="Teradata licenses" value="0" tone="muted" />
      </div>
    </div>
  );
}

function OutcomeStat({
  label, value, tone,
}: { label: string; value: string; tone: 'success' | 'muted' }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-2 py-2">
      <p className="text-[9.5px] font-mono uppercase tracking-wider text-text-tertiary">{label}</p>
      <p
        className="text-[14px] font-mono font-semibold"
        style={{ color: tone === 'success' ? '#4ADE80' : 'rgba(237,236,236,0.55)' }}
      >
        {value}
      </p>
    </div>
  );
}
