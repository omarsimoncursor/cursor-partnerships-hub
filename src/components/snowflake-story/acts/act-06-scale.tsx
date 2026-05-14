'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, ShieldCheck } from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { CalendarWidget } from '../time/calendar-widget';
import { OverrideCard } from '../override-card';
import { AccelerationTile } from '../acceleration-tile';
import { ACTS, type ActComponentProps } from '../story-types';
import { CUTOVER_RUNBOOK } from '../data/runbook';
import { ACT_TIMING } from '../data/script';

type CanaryStep = 0 | 1 | 10 | 50 | 100;
const STEPS: CanaryStep[] = [0, 1, 10, 50, 100];
const DAY_BY_STEP: Record<CanaryStep, number> = {
  0: 17,
  1: 18,
  10: 19,
  50: 20,
  100: 22,
};

/**
 * Act 6 · Cutover.
 *
 * Cursor wrote the runbook overnight. The viewer drives the canary 0 → 1 → 10
 * → 50 → 100% on the new revenue mart. The data-reliability lead approves
 * each step and stands down the rollback lever at completion.
 *
 * Direct port of AWS journey Act 6 with Snowflake-tinted runbook + tiles.
 */
export function Act06Scale({ onAdvance }: ActComponentProps) {
  const act = ACTS[5];
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

  useEffect(() => {
    if (current === 100) {
      const t = setTimeout(() => setKimAfterVisible(true), 800);
      return () => clearTimeout(t);
    }
    return;
  }, [current]);

  const cutoverComplete = current === 100 && kimAfterVisible;

  return (
    <ChapterStage
      act={act}
      topRight={
        <CalendarWidget
          currentDay={currentDay}
          contextLabel="Cutover"
          accent="#10B981"
          darkMode
        />
      }
    >
      <ChapterHeader
        act={act}
        eyebrow="Cursor Cloud Agent wrote the cutover runbook overnight, orchestrates the canary, and tails the parity diff. The data-reliability lead holds the rollback lever."
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_280px]">
        {/* Left: runbook */}
        <div
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            borderColor: 'rgba(16, 185, 129, 0.2)',
          }}
        >
          <div
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: '#10B981' }}
          >
            <CursorLogo size={14} tone="dark" />
            <span>Cursor Cloud Agent · Runbook</span>
          </div>
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{ color: 'rgba(243,244,246,0.55)' }}
          >
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
                    {unlocked && (
                      <Check className="h-3 w-3 text-[#030712]" strokeWidth={3} />
                    )}
                  </span>
                  <span
                    className="flex-1 leading-snug"
                    style={{
                      color: unlocked ? '#F9FAFB' : 'rgba(249,250,251,0.5)',
                      textDecoration: unlocked ? 'line-through' : undefined,
                    }}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <AccelerationTile taskId="runbook" tone="dark" variant="chip" />
        </div>

        {/* Center: canary dial */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-6"
          style={{
            minHeight: 400,
            background:
              'radial-gradient(circle at center, rgba(41,181,232,0.06) 0%, transparent 70%)',
            borderColor: 'rgba(41,181,232,0.2)',
          }}
        >
          <div
            className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#29B5E8' }}
          >
            <CursorLogo size={14} tone="dark" />
            <span>Cursor Cloud Agent · Canary orchestrator</span>
          </div>
          <div
            className="-mt-2 mb-3 text-[10px] uppercase tracking-wider"
            style={{ color: 'rgba(243,244,246,0.55)' }}
          >
            Read traffic · Teradata mart → Snowflake mart
          </div>

          <CutoverDial percent={current} complete={cutoverComplete} />

          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuto(false);
                    setStepIdx(i);
                  }}
                  className="relative flex h-7 w-12 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-all"
                  style={{
                    background:
                      i === stepIdx
                        ? '#29B5E8'
                        : i < stepIdx
                          ? 'rgba(16,185,129,0.25)'
                          : 'rgba(249,250,251,0.08)',
                    color:
                      i === stepIdx
                        ? '#030712'
                        : i < stepIdx
                          ? '#10B981'
                          : 'rgba(249,250,251,0.55)',
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
                background: auto ? 'rgba(41,181,232,0.15)' : 'transparent',
                borderColor: 'rgba(41,181,232,0.4)',
                color: '#29B5E8',
              }}
            >
              {auto ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {auto ? 'Auto-advancing' : 'Paused'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuto(false);
                setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
              }}
              disabled={stepIdx >= STEPS.length - 1}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              Next canary step →
            </button>
          </div>
        </div>

        {/* Right: live watch + reliability lead */}
        <div className="flex flex-col gap-3">
          <ParityTile current={current} />
          <AccelerationTile taskId="live-watch" tone="dark" variant="chip" />

          <OverrideCard
            speaker="kim"
            tone="approve"
            visible={kimBeforeVisible && !kimAfterVisible}
            darkMode
          >
            <div className="space-y-2">
              <p>
                <span className="font-semibold">
                  Runbook clean. Parity baseline at zero for 14 straight days.
                </span>
              </p>
              <p className="text-[12px] opacity-85">
                Go for 1% canary. I&rsquo;ll hold the rollback lever until we&rsquo;re past 50%
                and the legacy reader path is cold.
              </p>
            </div>
          </OverrideCard>

          <OverrideCard speaker="kim" tone="approve" visible={kimAfterVisible} darkMode>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Cutover complete.</span> Legacy reader cold since
                14:02 UTC.
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
            style={{ background: '#29B5E8', color: '#030712' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve cutover (gate 4/4)
            <span>→</span>
          </button>
        </div>
      </div>
    </ChapterStage>
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(41,181,232,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={complete ? '#10B981' : '#29B5E8'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1), stroke 280ms',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-mono text-6xl font-bold"
          style={{ color: complete ? '#10B981' : '#29B5E8' }}
        >
          {percent}
          <span className="text-3xl">%</span>
        </div>
        <div
          className="mt-1 text-[10px] uppercase tracking-widest"
          style={{ color: 'rgba(249,250,251,0.55)' }}
        >
          {complete ? 'cutover complete' : percent === 0 ? 'pre-cutover' : 'canary live'}
        </div>
      </div>
    </div>
  );
}

function ParityTile({ current }: { current: CanaryStep }) {
  const drift = current === 0 ? '0' : current === 1 ? '0' : current === 10 ? '0' : current === 50 ? '0' : '0';
  const rankDelta = current === 0 ? '0' : current === 1 ? '0' : current === 10 ? '0' : current === 50 ? '0' : '0';
  const reads = current === 0 ? 12 : current === 1 ? 128 : current === 10 ? 1_280 : current === 50 ? 6_400 : 12_800;
  const credits = current === 0 ? 0.02 : current === 1 ? 0.04 : current === 10 ? 0.12 : current === 50 ? 0.18 : 0.30;

  return (
    <div
      className="rounded-lg border p-3"
      style={{ background: 'rgba(41,181,232,0.05)', borderColor: 'rgba(41,181,232,0.2)' }}
    >
      <div
        className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: '#29B5E8' }}
      >
        <CursorLogo size={12} tone="dark" />
        Snowsight · live-tailed
      </div>
      <dl className="space-y-1.5 text-[11px]">
        <Row label="parity drift" value={drift} good={drift === '0'} />
        <Row label="top-100 rank Δ" value={rankDelta} good={rankDelta === '0'} />
        <Row label="reads / hr" value={reads.toLocaleString()} />
        <Row label="credits / day" value={`$${credits.toFixed(2)}`} />
      </dl>
    </div>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[10px] uppercase tracking-wider text-white/55">{label}</dt>
      <dd
        className="font-mono text-[12px] font-semibold"
        style={{ color: good ? '#10B981' : '#F9FAFB' }}
      >
        {value}
      </dd>
    </div>
  );
}
