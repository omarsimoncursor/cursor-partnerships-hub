'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, ShieldCheck } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { WeekBarWidget } from '../time/week-bar-widget';
import { OverrideCard } from '../override-card';
import { CursorLogo } from '../cursor-logo';
import { AccelerationTile } from '../acceleration-tile';
import { StoryBeat } from '../story-beat';
import { CUTOVER_RUNBOOK } from '../data/runbook';
import { ACT_TIMING } from '../data/script';

interface Act6Props {
  onAdvance: () => void;
}

type CanaryStep = 0 | 1 | 10 | 50 | 100;
const STEPS: CanaryStep[] = [0, 1, 10, 50, 100];
const DAY_BY_STEP: Record<CanaryStep, number> = { 0: 17, 1: 18, 10: 19, 50: 20, 100: 21 };

export function Act6Cutover({ onAdvance }: Act6Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [kimBeforeVisible, setKimBeforeVisible] = useState(false);
  const [kimAfterVisible, setKimAfterVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = STEPS[stepIdx];
  const currentDay = DAY_BY_STEP[current];

  useEffect(() => {
    const t = setTimeout(() => setKimBeforeVisible(true), ACT_TIMING.act6KimBeforeMs);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance canary every 3s while `auto` is true
  useEffect(() => {
    if (!auto) return;
    if (stepIdx >= STEPS.length - 1) return;
    if (!kimBeforeVisible) return;
    timerRef.current = window.setTimeout(() => {
      setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    }, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [auto, stepIdx, kimBeforeVisible]);

  // Kim's "complete" message appears when we reach 100%
  useEffect(() => {
    if (current === 100) {
      const t = setTimeout(() => setKimAfterVisible(true), 800);
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
        eyebrow="Real customer traffic gets moved to the new service, a little at a time: 1% → 10% → 50% → 100%. A Cursor Cloud Agent drives each step and watches the metrics; a human holds the rollback lever."
      />

      <StoryBeat
        tone="dark"
        agent="cloud"
        title="What’s happening: Cursor is performing the live cutover — the riskiest moment of the whole project."
        body={
          <>
            The old monolith is still serving orders on the left. The new AWS service is ready on the right. A{' '}
            <strong style={{ color: '#FF9900' }}>Cursor Cloud Agent</strong> authored the 12-step runbook (left panel)
            overnight, is now <em>executing</em> it step-by-step, and is shifting real traffic through the dial in the
            middle: first 1%, then 10%, 50%, 100%. At each step it tails CloudWatch on the right, and if any
            SLO trips it would roll back automatically. The on-call engineer, S. Kim, does not type a command —{' '}
            she just watches, and holds the rollback lever. This used to be the thing that kept people up all night.
          </>
        }
        oldWay="4 days to write the runbook · 5 days to script the canary · an all-hands war room on cutover night"
        newWay="30 min to author the runbook · 25 min to orchestrate the canary · 6 min of live SLO watch"
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        {/* Left: runbook */}
        <div
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
        >
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#10B981' }}>
            <CursorLogo size={14} tone="dark" />
            <span>Cursor Cloud Agent · Runbook</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
            12 checks · authored overnight
          </div>
          <ol className="mb-1 space-y-2">
            {CUTOVER_RUNBOOK.map((item) => {
              const unlocked = current >= item.unlockAt;
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-[11px] transition-all"
                  style={{ opacity: unlocked ? 1 : 0.35 }}
                >
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border"
                    style={{
                      background: unlocked ? '#10B981' : 'transparent',
                      borderColor: unlocked ? '#10B981' : 'rgba(249,250,251,0.3)',
                    }}
                  >
                    {unlocked && <Check className="h-3 w-3 text-[#030712]" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 leading-snug" style={{ color: unlocked ? '#F9FAFB' : 'rgba(249,250,251,0.5)', textDecoration: unlocked ? 'line-through' : undefined }}>
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <AccelerationTile taskId="runbook" tone="dark" variant="chip" />
        </div>

        {/* Center: traffic dial */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-6"
          style={{
            minHeight: 400,
            background: 'radial-gradient(circle at center, rgba(255,153,0,0.05) 0%, transparent 70%)',
            borderColor: 'rgba(255,153,0,0.2)',
          }}
        >
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#FF9900' }}>
            <CursorLogo size={14} tone="dark" />
            <span>Cursor Cloud Agent · Canary orchestrator</span>
          </div>
          <div className="mb-3 -mt-2 text-[10px] uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
            Production traffic · monolith → Lambda
          </div>

          <CutoverDial percent={current} complete={cutoverComplete} />

          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  type="button"
                  onClick={() => { setAuto(false); setStepIdx(i); }}
                  className="relative flex h-7 w-12 items-center justify-center rounded-full text-[10px] font-mono font-bold transition-all"
                  style={{
                    background: i === stepIdx ? '#FF9900' : i < stepIdx ? 'rgba(16,185,129,0.25)' : 'rgba(249,250,251,0.08)',
                    color: i === stepIdx ? '#030712' : i < stepIdx ? '#10B981' : 'rgba(249,250,251,0.55)',
                  }}
                >
                  {s}%
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className="h-px w-3"
                    style={{ background: i < stepIdx ? '#10B981' : 'rgba(249,250,251,0.1)' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{
                background: auto ? 'rgba(255,153,0,0.15)' : 'transparent',
                borderColor: 'rgba(255,153,0,0.4)',
                color: '#FF9900',
              }}
            >
              {auto ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {auto ? 'Auto-advancing' : 'Paused'}
            </button>
            <button
              type="button"
              onClick={() => { setAuto(false); setStepIdx((i) => Math.min(STEPS.length - 1, i + 1)); }}
              disabled={stepIdx >= STEPS.length - 1}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              Next canary step →
            </button>
          </div>
        </div>

        {/* Right: cloudwatch + Kim */}
        <div className="flex flex-col gap-3">
          <CloudWatchTile current={current} />

          <AccelerationTile taskId="live-watch" tone="dark" variant="chip" />

          <OverrideCard speaker="kim" tone="approve" visible={kimBeforeVisible && !kimAfterVisible} darkMode>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Runbook clean. Parity report green for 14 straight days.</span>
              </p>
              <p className="text-[12px] opacity-85">
                Go for 1% canary. I’ll hold the rollback lever until we’re past 50% and the monolith path is cold.
              </p>
            </div>
          </OverrideCard>

          <OverrideCard speaker="kim" tone="approve" visible={kimAfterVisible} darkMode>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Cutover complete.</span> Monolith OrdersService cold since 14:02 UTC.
              </p>
              <p className="text-[12px] opacity-85">
                Hyper-care closes in 48h. Standing down the rollback lever.
              </p>
            </div>
          </OverrideCard>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!cutoverComplete}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
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
  const size = 240;
  const stroke = 14;
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
        <div className="font-mono text-6xl font-bold" style={{ color: complete ? '#10B981' : '#FF9900' }}>
          {percent}
          <span className="text-3xl">%</span>
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
