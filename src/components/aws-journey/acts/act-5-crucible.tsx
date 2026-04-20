'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, FileText, Play, Send, ShieldCheck, TrendingUp } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { WeekBarWidget } from '../time/week-bar-widget';
import { OverrideCard } from '../override-card';
import { CursorLogo } from '../cursor-logo';
import { StoryBeat } from '../story-beat';
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
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [metrics, setMetrics] = useState<Metric>(INITIAL_METRICS);
  const [alertVisible, setAlertVisible] = useState(false);
  const [briefVisible, setBriefVisible] = useState(false);
  const [briefSent, setBriefSent] = useState(false);
  const [davisVisible, setDavisVisible] = useState(false);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
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
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const show = setTimeout(() => setAlertVisible(true), SPIKE_START_MS + 200);
    const hide = setTimeout(() => setAlertVisible(false), SPIKE_START_MS + SPIKE_DURATION_MS + 1200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [running]);

  // Once the spike clears, Cursor compiles a FinOps brief, then "sends" it to
  // R. Davis on Slack, then Davis's approval lands as a reply to that brief —
  // so the human sign-off feels like a response to something concrete rather
  // than a bolt out of the blue.
  useEffect(() => {
    if (!running) return;
    const briefAppearAt = SPIKE_START_MS + SPIKE_DURATION_MS + 600;
    const briefSentAt = briefAppearAt + 2200;
    const davisAt = Math.max(DAVIS_SHOWN_AT_MS, briefSentAt + 1400);
    const t1 = setTimeout(() => setBriefVisible(true), briefAppearAt);
    const t2 = setTimeout(() => setBriefSent(true), briefSentAt);
    const t3 = setTimeout(() => setDavisVisible(true), davisAt);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [running]);

  const spiking = elapsed >= SPIKE_START_MS && elapsed < SPIKE_START_MS + SPIKE_DURATION_MS;

  return (
    <ActShell
      act={5}
      topRight={<WeekBarWidget startDay={11} endDay={17} currentDay={Math.min(17, 11 + Math.floor((elapsed / SCENE_DURATION_MS) * 6))} phaseLabel="Staging" accent="#4DD4FF" />}
    >
      <ActHeader
        act={5}
        eyebrow="Click 'Run load test' to fire 12,000 requests/sec at the new service in staging. Cursor will tail CloudWatch and flag any problem the moment it appears."
      />

      <StoryBeat
        tone="dark"
        agent="cloud"
        title="Cursor wrote the load test, runs it, and watches the metrics in real time."
        body={<>When a cold-start spike appears, the agent diagnoses it and proposes a fix with a dollar number attached — so FinOps just answers yes or no.</>}
        oldWay="3 days · 3 days"
        newWay="20 min · 3 min"
      />

      {/* Top: 4 metric tiles */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
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

      {/* Middle row: dial + side rail */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_360px]">
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-5"
          style={{
            minHeight: 280,
            background: 'radial-gradient(circle at center, rgba(77,212,255,0.08) 0%, transparent 70%)',
            borderColor: 'rgba(77,212,255,0.15)',
          }}
        >
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#4DD4FF' }}>
            <CursorLogo size={12} tone="dark" />
            <span>Cursor · k6 load driver</span>
          </div>
          <TrafficDial rps={metrics.rps} spiking={spiking} />

          {!running && (
            <button
              type="button"
              onClick={() => setRunning(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: '#4DD4FF', color: '#060A12' }}
            >
              <Play className="h-4 w-4 fill-current" />
              Run load test
            </button>
          )}

          {alertVisible && (
            <div
              className="absolute left-3 right-3 top-3 rounded-lg border p-2.5 text-[12px] shadow-xl"
              style={{
                background: 'rgba(17, 24, 39, 0.95)',
                borderColor: '#EF4444',
                color: '#F3F4F6',
                animation: 'crucibleAlertIn 300ms ease-out',
              }}
            >
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#EF4444' }}>
                <AlertTriangle className="h-3 w-3" />
                Cursor · cold-start spike
              </div>
              <p className="text-[12px]" style={{ color: 'rgba(243,244,246,0.85)' }}>
                p99 hit <strong className="text-white">{(metrics.p99 / 1000).toFixed(2)}s</strong>. Fix: provisioned concurrency on{' '}
                <code className="font-mono text-[11px]">CreateOrderFn</code> · <strong className="text-white">+$180/mo</strong>.
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

        <div className="flex flex-col gap-2.5">
          {/* Cursor compiles + sends the FinOps brief that R. Davis will react to. */}
          <FinOpsBrief visible={briefVisible} sent={briefSent} />

          <OverrideCard speaker="davis" tone="approve" visible={davisVisible} darkMode>
            <p className="text-[12.5px] leading-snug">
              Read Cursor&rsquo;s brief. <strong>$180/mo vs $47k/hr in downtime risk — approved.</strong> Flag{' '}
              <span className="font-mono">CreateOrderFn</span> in the Compute Optimizer dashboard so we revisit post-hypercare.
            </p>
          </OverrideCard>

          <RunCostTile visible={davisVisible} />

          <button
            type="button"
            onClick={onAdvance}
            disabled={!davisVisible}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF9900', color: '#060A12' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve trade-off (gate 3/4)
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
      className="rounded-lg border px-3 py-2"
      style={{
        background: spiking ? 'rgba(239, 68, 68, 0.08)' : 'rgba(77, 212, 255, 0.04)',
        borderColor: spiking ? 'rgba(239, 68, 68, 0.45)' : 'rgba(77, 212, 255, 0.2)',
      }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold tabular-nums ${mono ? 'font-mono' : ''}`} style={{ color: highlight }}>
          {display}
        </span>
        {unit && <span className="text-[12px]" style={{ color: 'rgba(243,244,246,0.55)' }}>{unit}</span>}
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
  const size = 150;
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
        <div className="font-mono text-2xl font-bold" style={{ color }}>
          {rps.toLocaleString()}
        </div>
        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(243,244,246,0.55)' }}>
          rps · target 12k
        </div>
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

/**
 * The brief Cursor compiles after the cold-start spike clears. It bundles the
 * failing metric, the proposed fix, the cost math, and the dollar comparison —
 * then "sends" itself to the FinOps lead via Slack. R. Davis's approval card
 * lands a beat after the `sent` flag flips.
 */
function FinOpsBrief({ visible, sent }: { visible: boolean; sent: boolean }) {
  return (
    <div
      className="rounded-lg border p-3 transition-all duration-500"
      style={{
        background: 'rgba(255, 153, 0, 0.05)',
        borderColor: sent ? 'rgba(126, 231, 135, 0.45)' : 'rgba(255, 153, 0, 0.4)',
        color: '#F3F4F6',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: sent ? '#7EE787' : '#FF9900' }}>
        <CursorLogo size={12} tone="dark" />
        <FileText className="h-3 w-3" />
        FinOps brief · auto-compiled
      </div>

      <div className="text-[12.5px] font-semibold leading-snug">
        Cold-start spike on <code className="font-mono text-[11.5px]">CreateOrderFn</code>
      </div>

      <dl className="mt-1.5 space-y-0.5 text-[11.5px]" style={{ color: 'rgba(243,244,246,0.85)' }}>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-[10px] uppercase tracking-wider opacity-70">Observed</dt>
          <dd>p99 <span className="font-mono font-semibold text-[#FCA5A5]">1.14s</span> at 12k rps (target &lt; 400ms)</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-[10px] uppercase tracking-wider opacity-70">Proposed fix</dt>
          <dd>Provisioned concurrency · 2 instances</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-[10px] uppercase tracking-wider opacity-70">Cost impact</dt>
          <dd className="font-mono"><span style={{ color: '#FBBF24' }}>+$180/mo</span></dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-[10px] uppercase tracking-wider opacity-70">Downtime risk avoided</dt>
          <dd className="font-mono"><span style={{ color: '#7EE787' }}>$47k/hr</span></dd>
        </div>
      </dl>

      <div
        className="mt-2 flex items-center gap-1.5 border-t pt-1.5 text-[10.5px]"
        style={{ borderColor: 'rgba(255,255,255,0.08)', color: sent ? '#A7F3D0' : 'rgba(243,244,246,0.65)' }}
      >
        <Send className="h-3 w-3" />
        {sent ? (
          <>
            <span>Sent to <span className="font-semibold">R. Davis</span> via</span>{' '}
            <code className="font-mono">#finops-approvals</code>
            <span className="ml-auto opacity-75">awaiting reply…</span>
          </>
        ) : (
          <>
            <span>Compiling brief from CloudWatch + AWS Cost Explorer (MCP)…</span>
          </>
        )}
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

