'use client';

import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, TrendingUp } from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { CalendarWidget } from '../time/calendar-widget';
import { OverrideCard } from '../override-card';
import { AccelerationTile } from '../acceleration-tile';
import { CortexEquivalenceViz } from '../cortex-equivalence-viz';
import { ACTS, type ActComponentProps } from '../story-types';
import { ACT_TIMING } from '../data/script';

const SCENE_DURATION_MS = 11_000;
const VERIFY_PROGRESS_MS = ACT_TIMING.act5VerifyDurationMs;
const FINOPS_SHOWN_AT_MS = ACT_TIMING.act5FinopsApprovalMs;

/**
 * Act 5 · Verify.
 *
 * Cursor runs the new dbt model in parallel with Teradata over a 1% sample,
 * then Snowflake Cortex looks for semantic drift the row-level diff
 * can&rsquo;t catch. Equivalence proves out, the FinOps lead approves the credit
 * budget (gate 3/4), and the viewer advances to cutover.
 *
 * Mirrors AWS journey Act 5 — same metric tiles + load-test viz pattern, but
 * tuned to data-platform metrics (row delta, USD delta, semantic drift).
 */
export function Act05ProofAndReview(props: ActComponentProps) {
  const { onAdvance } = props;
  const act = ACTS[4];
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [finopsVisible, setFinopsVisible] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - start;
      setElapsed(t);
      const pct = Math.min(1, t / VERIFY_PROGRESS_MS);
      setProgress(pct);
      if (t < SCENE_DURATION_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setFinopsVisible(true), FINOPS_SHOWN_AT_MS);
    return () => clearTimeout(t);
  }, []);

  const rowsCompared = Math.round(progress * 14_017);
  const usdDelta = progress > 0.6 ? '$0.00' : '—';
  const cortexVerdict = progress > 0.88 ? 'no drift' : 'analyzing…';

  return (
    <ChapterStage
      act={act}
      topRight={
        <CalendarWidget
          currentDay={5}
          targetDay={11}
          contextLabel="Verify"
          accent="#A78BFA"
          darkMode
        />
      }
    >
      <ChapterHeader
        act={act}
        eyebrow="Cursor runs both stacks in parallel on a 1% sample. Snowflake Cortex catches semantic drift the row-level diff can&rsquo;t. The FinOps lead signs off on the credit budget."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricTile
          label="rows compared"
          value={rowsCompared.toLocaleString()}
          color="#7DD3F5"
          mono
        />
        <MetricTile
          label="row Δ"
          value={progress > 0.4 ? '0' : '—'}
          color={progress > 0.4 ? '#7EE787' : '#A78BFA'}
        />
        <MetricTile
          label="ΣUSD Δ"
          value={usdDelta}
          color={progress > 0.6 ? '#7EE787' : '#A78BFA'}
        />
        <MetricTile
          label="Cortex verdict"
          value={cortexVerdict}
          color={progress > 0.88 ? '#7EE787' : '#A78BFA'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <div
          className="relative flex flex-col overflow-hidden rounded-xl border"
          style={{
            minHeight: 360,
            background:
              'radial-gradient(circle at center, rgba(167,139,250,0.06) 0%, transparent 70%)',
            borderColor: 'rgba(167,139,250,0.18)',
          }}
        >
          <div
            className="flex items-center gap-2 border-b px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: 'rgba(167,139,250,0.18)', color: '#A78BFA' }}
          >
            <CursorLogo size={14} tone="dark" />
            Cursor Cloud Agent · equivalence harness
          </div>

          <div className="flex-1 p-4">
            <CortexEquivalenceViz progress={progress} />
          </div>

          <div
            className="border-t px-4 py-2 font-mono text-[11px]"
            style={{ borderColor: 'rgba(167,139,250,0.18)', color: 'rgba(243,244,246,0.65)' }}
          >
            t+{Math.round(elapsed / 1000)}s · 1% sample · Snowflake Cortex semantic diff +
            row-level harness
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <AccelerationTile taskId="cortex-verify" tone="dark" variant="strip" />
          <AccelerationTile taskId="finops-brief" tone="dark" variant="strip" />

          <OverrideCard speaker="davis" tone="approve" visible={finopsVisible} darkMode>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">
                  $0.30 / day in credits against $5.9M / yr in TCO swing — approve.
                </span>
              </p>
              <p className="text-[12px] opacity-85">
                Wiring the daily revenue mart into the FinOps dashboard with a kill-switch at
                3× projected credits. Cursor — open the dashboard ticket.
              </p>
            </div>
          </OverrideCard>

          <RunCostTile visible={finopsVisible} />

          <button
            type="button"
            onClick={onAdvance}
            disabled={!finopsVisible}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#29B5E8', color: '#060A12' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve FinOps trade-off (gate 3/4)
            <span>→</span>
          </button>
        </div>
      </div>
    </ChapterStage>
  );
}

function MetricTile({
  label,
  value,
  color,
  mono,
}: {
  label: string;
  value: string;
  color: string;
  mono?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: 'rgba(167, 139, 250, 0.04)',
        borderColor: 'rgba(167, 139, 250, 0.2)',
      }}
    >
      <div
        className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: 'rgba(243,244,246,0.55)' }}
      >
        {label}
      </div>
      <div
        className={`text-2xl font-bold tabular-nums ${mono ? 'font-mono' : ''}`}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

function RunCostTile({ visible }: { visible: boolean }) {
  return (
    <div
      className="rounded-lg border p-3 transition-all duration-500"
      style={{
        background: 'rgba(41, 181, 232, 0.06)',
        borderColor: 'rgba(41, 181, 232, 0.3)',
        color: '#F3F4F6',
        opacity: visible ? 1 : 0.3,
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: '#29B5E8' }}
      >
        <TrendingUp className="h-3 w-3" /> Projected credit / TCO delta
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat5 num="$0.30" label="per day" />
        <Stat5 num="$5.9M" label="/yr saved" good />
        <Stat5 num="3×" label="kill-switch" warn />
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] opacity-70">
        <Activity className="h-3 w-3" /> vs Teradata maintenance + license $5.9M / yr
      </div>
    </div>
  );
}

function Stat5({
  num,
  label,
  good,
  warn,
}: {
  num: string;
  label: string;
  good?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <div
        className="text-lg font-bold tabular-nums"
        style={{ color: good ? '#7EE787' : warn ? '#FBBF24' : '#E6EDF3' }}
      >
        {num}
      </div>
      <div className="text-[9px] uppercase tracking-wider opacity-60">{label}</div>
    </div>
  );
}
