'use client';

import { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { WeekBarWidget } from '../time/week-bar-widget';
import { OverrideCard } from '../override-card';
import { CursorLogo } from '../cursor-logo';
import { StoryBeat } from '../story-beat';
import { CUTOVER_RUNBOOK } from '../data/runbook';

interface Act6Props {
  onAdvance: () => void;
}

type CanaryStep = 0 | 1 | 10 | 50 | 100;
const STEPS: CanaryStep[] = [0, 1, 10, 50, 100];
const DAY_BY_STEP: Record<CanaryStep, number> = { 0: 17, 1: 18, 10: 19, 50: 20, 100: 21 };

export function Act6Cutover({ onAdvance }: Act6Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [kimBeforeVisible, setKimBeforeVisible] = useState(false);
  const [kimAfterVisible, setKimAfterVisible] = useState(false);

  const current = STEPS[stepIdx];
  const currentDay = DAY_BY_STEP[current];

  useEffect(() => {
    const t = setTimeout(() => setKimBeforeVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Kim's "complete" message appears once the user reaches 100%
  useEffect(() => {
    if (current === 100) {
      const t = setTimeout(() => setKimAfterVisible(true), 700);
      return () => clearTimeout(t);
    }
    return;
  }, [current]);

  const cutoverComplete = current === 100 && kimAfterVisible;

  return (
    <ActShell
      act={6}
      topRight={
        <WeekBarWidget
          startDay={17}
          endDay={21}
          currentDay={currentDay}
          phaseLabel="Cutover"
          accent="#FF9900"
        />
      }
    >
      <ActHeader
        act={6}
        eyebrow="The riskiest moment of the project: moving real customer traffic from the monolith to the new AWS service. Click 'Next canary step' to ratchet 1% → 10% → 50% → 100%."
      />

      <StoryBeat
        tone="dark"
        agent="cloud"
        title="Cursor wrote the runbook, drives the canary, and watches every metric — so the on-call engineer just holds the rollback lever."
        body={<>If any SLO trips, the agent rolls back automatically. This used to be the thing that kept people up at night.</>}
        oldWay="4-day runbook · all-hands war room"
        newWay="30-min runbook · live SLO watchdog"
      />

      <div className="grid gap-3 lg:grid-cols-[240px_1fr_240px]">
        {/* Left: runbook */}
        <div
          className="flex flex-col gap-2.5 rounded-xl border p-3.5"
          style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
        >
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#10B981' }}>
            <CursorLogo size={12} tone="dark" />
            <span>Cursor · Runbook</span>
          </div>
          <ol className="space-y-1.5">
            {CUTOVER_RUNBOOK.map((item) => {
              const unlocked = current >= item.unlockAt;
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-[11px] transition-all"
                  style={{ opacity: unlocked ? 1 : 0.35 }}
                >
                  <span
                    className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border"
                    style={{
                      background: unlocked ? '#10B981' : 'transparent',
                      borderColor: unlocked ? '#10B981' : 'rgba(249,250,251,0.3)',
                    }}
                  >
                    {unlocked && <Check className="h-2.5 w-2.5 text-[#030712]" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 leading-snug" style={{ color: unlocked ? '#F9FAFB' : 'rgba(249,250,251,0.5)', textDecoration: unlocked ? 'line-through' : undefined }}>
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Center: traffic dial */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-5"
          style={{
            minHeight: 320,
            background: 'radial-gradient(circle at center, rgba(255,153,0,0.05) 0%, transparent 70%)',
            borderColor: 'rgba(255,153,0,0.2)',
          }}
        >
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#FF9900' }}>
            <CursorLogo size={12} tone="dark" />
            <span>Production traffic · monolith → Lambda</span>
          </div>

          <CutoverDial percent={current} complete={cutoverComplete} />

          <div className="mt-3 flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStepIdx(i)}
                  className="relative flex h-6 w-11 items-center justify-center rounded-full text-[10px] font-mono font-bold transition-all"
                  style={{
                    background: i === stepIdx ? '#FF9900' : i < stepIdx ? 'rgba(16,185,129,0.25)' : 'rgba(249,250,251,0.08)',
                    color: i === stepIdx ? '#030712' : i < stepIdx ? '#10B981' : 'rgba(249,250,251,0.55)',
                  }}
                >
                  {s}%
                </button>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-2.5" style={{ background: i < stepIdx ? '#10B981' : 'rgba(249,250,251,0.1)' }} />
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
            disabled={stepIdx >= STEPS.length - 1}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-30"
            style={{ background: '#FF9900', color: '#030712' }}
          >
            {stepIdx === 0 ? 'Begin canary →' : stepIdx >= STEPS.length - 1 ? 'Cutover complete' : 'Next canary step →'}
          </button>
        </div>

        {/* Right: cloudwatch + Kim */}
        <div className="flex flex-col gap-2.5">
          <CloudWatchTile current={current} />

          <OverrideCard speaker="kim" tone="approve" visible={kimBeforeVisible && !kimAfterVisible} darkMode>
            <p className="text-[12.5px] leading-snug">
              <strong>Parity green for 14 days.</strong> Go for 1% canary — I&rsquo;ll hold the rollback lever.
            </p>
          </OverrideCard>

          <OverrideCard speaker="kim" tone="approve" visible={kimAfterVisible} darkMode>
            <p className="text-[12.5px] leading-snug">
              <strong>Cutover complete.</strong> Monolith cold at 14:02 UTC.
            </p>
          </OverrideCard>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!cutoverComplete}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF9900', color: '#030712' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve cutover (gate 4/4)
            <span>→</span>
          </button>
        </div>
      </div>
    </ActShell>
  );
}

function CutoverDial({ percent, complete }: { percent: CanaryStep; complete: boolean }) {
  const size = 180;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,153,0,0.1)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={complete ? '#10B981' : '#FF9900'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1), stroke 280ms' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-5xl font-bold" style={{ color: complete ? '#10B981' : '#FF9900' }}>
          {percent}
          <span className="text-2xl">%</span>
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: 'rgba(249,250,251,0.55)' }}>
          {complete ? 'cutover complete' : percent === 0 ? 'pre-cutover' : 'canary live'}
        </div>
      </div>
    </div>
  );
}

function CloudWatchTile({ current }: { current: CanaryStep }) {
  // Metrics evolve gently as canary percentages increase
  const p99 = current === 0 ? 340 : current === 1 ? 336 : current === 10 ? 342 : current === 50 ? 348 : 340;
  const errors = 0;
  const invPerHr = current === 0 ? 12 : current === 1 ? 128 : current === 10 ? 1_280 : current === 50 ? 6_400 : 12_800;
  const acu = current === 0 ? 0.5 : current === 1 ? 0.5 : current === 10 ? 1.2 : current === 50 ? 1.6 : 0.62;

  return (
    <div
      className="rounded-lg border p-3"
      style={{ background: 'rgba(255,153,0,0.05)', borderColor: 'rgba(255,153,0,0.2)' }}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#FF9900' }}>
        <CursorLogo size={12} tone="dark" />
        CloudWatch · live-tailed
      </div>
      <dl className="space-y-1.5 text-[11px]">
        <Row label="p99 latency" value={`${p99} ms`}      good={p99 < 400} />
        <Row label="error rate" value={`${errors.toFixed(2)}%`} good />
        <Row label="invocations/hr" value={invPerHr.toLocaleString()} />
        <Row label="Aurora ACU" value={acu.toString()} />
      </dl>
    </div>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[10px] uppercase tracking-wider text-white/55">{label}</dt>
      <dd className="font-mono text-[12px] font-semibold" style={{ color: good ? '#10B981' : '#F9FAFB' }}>
        {value}
      </dd>
    </div>
  );
}
