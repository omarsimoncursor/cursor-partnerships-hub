'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, Terminal, TrendingUp } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { WeekBarWidget } from '../time/week-bar-widget';
import { OverrideCard } from '../override-card';
import { CursorLogo } from '../cursor-logo';
import { AccelerationTile } from '../acceleration-tile';
import { ACT_TIMING } from '../data/script';

interface Act5Props {
  onAdvance: () => void;
}

const SCENE_DURATION_MS = 11_000;
const SPIKE_START_MS = ACT_TIMING.act5ColdStartSpikeMs;
const SPIKE_DURATION_MS = 2200;
const DAVIS_SHOWN_AT_MS = ACT_TIMING.act5DavisApprovalMs;

interface Metric {
  p99: number;        // ms
  invocations: number; // /hr
  errorRate: number;  // fraction
  acu: number;
  rps: number;        // requests per second (for dial)
  sparkline: number[]; // last 40 p99 samples
}

const INITIAL_METRICS: Metric = {
  p99: 340,
  invocations: 0,
  errorRate: 0,
  acu: 0.5,
  rps: 0,
  sparkline: Array.from({ length: 40 }, () => 340),
};

export function Act5Crucible({ onAdvance }: Act5Props) {
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState<Metric>(INITIAL_METRICS);
  const [alertVisible, setAlertVisible] = useState(false);
  const [davisVisible, setDavisVisible] = useState(false);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - startRef.current;
      setElapsed(t);
      const pct = Math.min(1, t / SCENE_DURATION_MS);
      const spiking = t >= SPIKE_START_MS && t < SPIKE_START_MS + SPIKE_DURATION_MS;

      const rps = Math.round(pct * 12_000);
      const invocations = Math.round(rps * 3600);

      const p99Base = 340 + Math.sin(t / 400) * 8 + (pct < 0.1 ? (0.1 - pct) * 120 : 0);
      const p99 = spiking ? 1140 + Math.random() * 50 : p99Base + (pct > 0.9 ? 8 : 0);

      const acu =
        pct < 0.45 ? 0.5 + pct * 5.1 : pct < 0.75 ? 2.8 - (pct - 0.45) * 4.4 : 1.4;

      setMetrics((prev) => ({
        p99: Math.round(p99),
        invocations,
        errorRate: 0,
        acu: Number(acu.toFixed(2)),
        rps,
        sparkline: [...prev.sparkline.slice(1), p99],
      }));

      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Alert banner timing
  useEffect(() => {
    const show = setTimeout(() => setAlertVisible(true), SPIKE_START_MS + 200);
    const hide = setTimeout(() => setAlertVisible(false), SPIKE_START_MS + SPIKE_DURATION_MS + 1200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDavisVisible(true), DAVIS_SHOWN_AT_MS);
    return () => clearTimeout(t);
  }, []);

  const spiking = elapsed >= SPIKE_START_MS && elapsed < SPIKE_START_MS + SPIKE_DURATION_MS;

  return (
    <ActShell
      act={5}
      topRight={<WeekBarWidget startDay={11} endDay={17} currentDay={Math.min(17, 11 + Math.floor((elapsed / SCENE_DURATION_MS) * 6))} phaseLabel="Staging" accent="#4DD4FF" />}
    >
      <ActHeader
        act={5}
        eyebrow="Cursor Cloud Agent authored the 12k rps load test overnight. It’s also tailing CloudWatch live. R. Davis makes the FinOps call."
      />

      {/* Top: 4 metric tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile
          label="p99 latency"
          value={metrics.p99}
          unit="ms"
          spiking={spiking}
          highlight={spiking ? '#EF4444' : metrics.p99 < 400 ? '#7EE787' : '#4DD4FF'}
          sparkline={metrics.sparkline}
        />
        <MetricTile label="invocations / hr" value={metrics.invocations} unit="" highlight="#4DD4FF" mono />
        <MetricTile label="error rate" value={0} unit="%" highlight="#7EE787" fixed={2} />
        <MetricTile label="Aurora ACU" value={metrics.acu} unit="" highlight="#4DD4FF" fixed={2} />
      </div>

      {/* Middle row: dial + k6 terminal */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-6"
          style={{
            minHeight: 320,
            background: 'radial-gradient(circle at center, rgba(77,212,255,0.08) 0%, transparent 70%)',
            borderColor: 'rgba(77,212,255,0.15)',
          }}
        >
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#4DD4FF' }}>
            <CursorLogo size={14} tone="dark" />
            <span>Cursor Cloud Agent · Load driver</span>
          </div>
          <TrafficDial rps={metrics.rps} spiking={spiking} />
          <K6Terminal rps={metrics.rps} spiking={spiking} />

          {alertVisible && (
            <div
              className="absolute left-4 right-4 top-4 rounded-lg border p-3 text-[12px] shadow-xl transition-all"
              style={{
                background: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#EF4444',
                color: '#F3F4F6',
                animation: 'crucibleAlertIn 300ms ease-out',
              }}
            >
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#EF4444' }}>
                <CursorLogo size={14} tone="dark" />
                <AlertTriangle className="h-3.5 w-3.5" />
                Cursor Cloud Agent · Cold-start spike detected
              </div>
              <p className="mb-1 text-[12px]">
                {metrics.rps.toLocaleString()} rps, p99 <span className="font-bold">{(metrics.p99 / 1000).toFixed(2)}s</span>
              </p>
              <p className="text-[12px]" style={{ color: 'rgba(243,244,246,0.75)' }}>
                Proposal: enable provisioned concurrency on <span className="font-mono">CreateOrderFn</span> (2 instances).
                Impact: +<span className="font-semibold text-white">$180/mo</span>. p99 steady-state stays under 400ms.
              </p>
            </div>
          )}

          <style jsx>{`
            @keyframes crucibleAlertIn {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>

        <div className="flex flex-col gap-3">
          <AccelerationTile taskId="load-test" tone="dark" variant="strip" />
          {spiking && (
            <AccelerationTile taskId="cold-start-fix" tone="dark" variant="strip" />
          )}

          <OverrideCard speaker="davis" tone="approve" visible={davisVisible} darkMode>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">$180/mo against $47k/hr in downtime risk — approve.</span>
              </p>
              <p className="text-[12px] opacity-85">
                Flagging <span className="font-mono">CreateOrderFn</span> in the Compute Optimizer dashboard so we
                revisit post-hypercare.
              </p>
            </div>
          </OverrideCard>

          <RunCostTile visible={davisVisible} />

          <button
            type="button"
            onClick={onAdvance}
            disabled={!davisVisible}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF9900', color: '#060A12' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve FinOps trade-off (gate 3/4)
            <span>→</span>
          </button>
        </div>
      </div>
    </ActShell>
  );
}

function MetricTile({
  label,
  value,
  unit,
  highlight,
  sparkline,
  mono,
  fixed,
  spiking,
}: {
  label: string;
  value: number;
  unit: string;
  highlight: string;
  sparkline?: number[];
  mono?: boolean;
  fixed?: number;
  spiking?: boolean;
}) {
  const display = typeof value === 'number' && fixed !== undefined ? value.toFixed(fixed) : value.toLocaleString();
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: spiking ? 'rgba(239, 68, 68, 0.08)' : 'rgba(77, 212, 255, 0.04)',
        borderColor: spiking ? 'rgba(239, 68, 68, 0.45)' : 'rgba(77, 212, 255, 0.2)',
      }}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${mono ? 'font-mono' : ''}`} style={{ color: highlight }}>
          {display}
        </span>
        {unit && <span className="text-sm" style={{ color: 'rgba(243,244,246,0.55)' }}>{unit}</span>}
      </div>
      {sparkline && (
        <Sparkline values={sparkline} color={highlight} max={1200} />
      )}
    </div>
  );
}

function Sparkline({ values, color, max }: { values: number[]; color: string; max: number }) {
  const w = 200;
  const h = 28;
  const min = 200;
  const range = Math.max(1, max - min);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-7 w-full">
      <polyline fill="none" stroke={color} strokeWidth="1.2" points={pts} />
    </svg>
  );
}

function TrafficDial({ rps, spiking }: { rps: number; spiking: boolean }) {
  const pct = Math.min(1, rps / 12_000);
  const size = 180;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const color = spiking ? '#EF4444' : '#4DD4FF';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(77,212,255,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke 180ms' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-3xl font-bold" style={{ color }}>
          {rps.toLocaleString()}
        </div>
        <div className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(243,244,246,0.55)' }}>
          rps · target 12,000
        </div>
      </div>
    </div>
  );
}

function K6Terminal({ rps, spiking }: { rps: number; spiking: boolean }) {
  const reqDurationAvg = spiking ? 540 : 87;
  const p95 = spiking ? 980 : 245;
  const p99 = spiking ? 1140 : 342;

  return (
    <div
      className="mt-4 w-full rounded-lg border p-3 font-mono text-[11px]"
      style={{ background: '#010409', borderColor: 'rgba(126,231,135,0.15)', color: '#E6EDF3' }}
    >
      <div className="mb-1 flex items-center gap-2 text-[10px] opacity-70">
        <Terminal className="h-3 w-3" /> k6 run · traffic ramp
      </div>
      <div style={{ color: '#7EE787' }}>
        checks: <span className="font-bold">100.00%</span>
      </div>
      <div style={{ color: 'rgba(230,237,243,0.85)' }}>
        http_req_duration: avg=<span className="font-bold">{reqDurationAvg}ms</span>,
        p(95)=<span className="font-bold">{p95}ms</span>,
        p(99)=<span className={spiking ? 'font-bold text-[#F87171]' : 'font-bold'}>{p99}ms</span>
      </div>
      <div style={{ color: 'rgba(230,237,243,0.75)' }}>
        iterations: <span className="font-mono">{(rps * 60).toLocaleString()}</span> in 60s
      </div>
    </div>
  );
}

function RunCostTile({ visible }: { visible: boolean }) {
  return (
    <div
      className="rounded-lg border p-3 transition-all duration-500"
      style={{
        background: 'rgba(77, 212, 255, 0.06)',
        borderColor: 'rgba(77, 212, 255, 0.3)',
        color: '#F3F4F6',
        opacity: visible ? 1 : 0.3,
      }}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#4DD4FF' }}>
        <TrendingUp className="h-3 w-3" /> Projected run-cost delta
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat5 num="$527" label="per month" />
        <Stat5 num="$6.3M" label="/yr saved" good />
        <Stat5 num="+$180" label="prov concurrency" warn />
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] opacity-70">
        <Activity className="h-3 w-3" /> vs monolith run-rate $70k/mo allocated
      </div>
    </div>
  );
}

function Stat5({ num, label, good, warn }: { num: string; label: string; good?: boolean; warn?: boolean }) {
  return (
    <div>
      <div className="text-lg font-bold tabular-nums" style={{ color: good ? '#7EE787' : warn ? '#FBBF24' : '#E6EDF3' }}>
        {num}
      </div>
      <div className="text-[9px] uppercase tracking-wider opacity-60">{label}</div>
    </div>
  );
}

