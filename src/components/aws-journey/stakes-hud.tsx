'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { JOURNEY_CONSTANTS } from './data/script';
import type { ActId } from './acts/act-theme';

interface StakesHudProps {
  currentAct: ActId;
  gatesPassed: number;
  arrRevealed: boolean;       // set true when Act 2 exits
  runCostRevealed: boolean;   // set true when Act 5 exits
}

interface Countdown {
  months: number;
  days: number;
  hours: number;
}

function computeCountdown(target: Date): Countdown {
  const now = Date.now();
  let diff = Math.max(0, target.getTime() - now);
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const days = totalDays - months * 30;
  return { months, days, hours };
}

function useLerp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);
  return value;
}

function formatDollars(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

export function StakesHud({ currentAct, gatesPassed, arrRevealed, runCostRevealed }: StakesHudProps) {
  const [countdown, setCountdown] = useState<Countdown>(() => computeCountdown(JOURNEY_CONSTANTS.oracleContractEnd));
  // Default to the small pill so the HUD never sits on top of an approve-gate
  // button. Users can expand it on demand, and it's always at least visible.
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(computeCountdown(JOURNEY_CONSTANTS.oracleContractEnd));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const arrValue = useLerp(JOURNEY_CONSTANTS.pulledForwardArrTarget, arrRevealed, 1400);
  const runCostValue = useLerp(JOURNEY_CONSTANTS.runCostSwingTarget, runCostRevealed, 1400);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-xl transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(35, 47, 62, 0.85)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 10px 28px -14px rgba(0,0,0,0.6)',
        }}
        aria-label="Show stakes HUD"
      >
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF9900]" />
        <span className="text-white/60 uppercase tracking-[0.16em] text-[10px]">Stakes</span>
        <span className="font-mono text-white">{countdown.months}mo {String(countdown.days).padStart(2, '0')}d</span>
        <span className="text-white/50">·</span>
        <span className="font-mono text-[#FF9900]">{gatesPassed}/4</span>
        <ChevronUp className="h-3 w-3 text-white/55" />
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-4 right-4 z-40 w-[320px] max-w-[calc(100vw-32px)] rounded-xl border p-4 text-white backdrop-blur-xl transition-all"
      style={{
        background: 'rgba(35, 47, 62, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6)',
      }}
      aria-label="Stakes HUD"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
          Stakes
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF9900]" />
            live
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-full p-0.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Collapse stakes HUD"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        <Row
          label="Oracle contract"
          value={`${countdown.months}mo ${String(countdown.days).padStart(2, '0')}d`}
          valueColor="#FF9900"
          mono
        />
        <Row
          label="Pulled-forward ARR"
          value={arrRevealed ? formatDollars(arrValue) : '$0'}
          hint={arrRevealed ? '→ $11M' : undefined}
          valueColor={arrRevealed ? '#34D399' : 'rgba(255,255,255,0.55)'}
        />
        <Row
          label="Run-cost swing"
          value={runCostRevealed ? `${formatDollars(runCostValue)}/yr` : '—'}
          hint={runCostRevealed ? '→ $6.3M/yr' : undefined}
          valueColor={runCostRevealed ? '#4DD4FF' : 'rgba(255,255,255,0.55)'}
        />
        <Row
          label="Gates passed"
          value={`${gatesPassed} / 4`}
          valueColor={gatesPassed > 0 ? '#FF9900' : 'rgba(255,255,255,0.55)'}
          mono
        />
      </div>

      {currentAct === 7 && (
        <div className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/70">
          <span className="text-white/50">Projected finish:</span>{' '}
          <span className="font-semibold text-[#FF9900]">{JOURNEY_CONSTANTS.projectedFinishLabel}</span>{' '}
          · <span className="text-[#34D399]">10mo before expiry</span>
        </div>
      )}
    </aside>
  );
}

function Row({
  label,
  value,
  hint,
  valueColor,
  mono,
}: {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-white/55">{label}</span>
      <span
        className={`${mono ? 'font-mono' : ''} text-sm font-semibold tabular-nums`}
        style={{ color: valueColor }}
      >
        {value}
        {hint && <span className="ml-1 text-[10px] font-normal text-white/40">{hint}</span>}
      </span>
    </div>
  );
}
