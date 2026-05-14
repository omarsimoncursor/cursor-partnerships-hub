'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { CalendarWidget } from '../time/calendar-widget';
import { OverrideCard } from '../override-card';
import { AccelerationTile } from '../acceleration-tile';
import { ACTS, type ActComponentProps } from '../story-types';
import { ACT_TIMING } from '../data/script';

type Phase = 'loading' | 'plan-shown' | 'override' | 'absorbed';

/**
 * Act 3 · Plan & Override.
 *
 * Cursor drafts the migration plan on a "whiteboard" (sticky notes + an
 * abstract DAG sketch). The Principal pushes back on rounding behavior;
 * Cursor absorbs the override and a new sticky note appears. Then the
 * viewer approves the architecture gate (1/4).
 *
 * Mirrors AWS journey Act 3 step-for-step.
 */
export function Act03Diagnosis({ onAdvance }: ActComponentProps) {
  const act = ACTS[2];
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('plan-shown'), 400);
    const t2 = setTimeout(
      () => setPhase('override'),
      ACT_TIMING.act3OverrideDelayMs + 400,
    );
    const t3 = setTimeout(
      () => setPhase('absorbed'),
      ACT_TIMING.act3AiReplyDelayMs + 400,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const aiReplyVisible = phase === 'absorbed';
  const overrideVisible = phase === 'override' || phase === 'absorbed';
  const stickyMorphed = phase === 'absorbed';

  return (
    <ChapterStage
      act={act}
      topRight={
        <CalendarWidget
          currentDay={1}
          targetDay={3}
          contextLabel="Plan"
          accent="#F59E0B"
          darkMode={false}
        />
      }
    >
      <ChapterHeader
        act={act}
        eyebrow="Cursor Cloud Agent drafts the migration plan in 14 minutes. The principal pushes back on rounding. The agent absorbs the correction."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Whiteboard */}
        <div
          className="relative overflow-hidden rounded-xl border shadow-inner"
          style={{
            minHeight: 560,
            background: `
              repeating-linear-gradient(0deg, rgba(17,24,39,0.05) 0 1px, transparent 1px 28px),
              repeating-linear-gradient(90deg, rgba(17,24,39,0.05) 0 1px, transparent 1px 28px),
              #FAF8F3
            `,
            borderColor: 'rgba(17, 24, 39, 0.12)',
          }}
        >
          <div
            className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border bg-white/90 px-2.5 py-1.5 shadow-sm"
            style={{ borderColor: 'rgba(17,24,39,0.1)' }}
          >
            <CursorLogo size={16} tone="light" />
            <span className="text-[11px] font-semibold text-[#14120B]">
              Drafted by{' '}
              <span style={{ color: '#B45309' }}>Cursor Cloud Agent</span>
            </span>
            <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-800">
              14 min
            </span>
          </div>
          <PlanDagSvg morphed={stickyMorphed} />
          <StickyNotes morphed={stickyMorphed} />
        </div>

        {/* Right column: conversation */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: 'rgba(17,24,39,0.1)' }}
          >
            <div
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#6B7280' }}
            >
              #data-platform · slack review thread
            </div>
            <div className="flex items-start gap-2 text-[13px] text-[#1F2937]">
              <CursorLogo size={18} tone="light" className="mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Cursor Cloud Agent</span>
                <span className="ml-1 font-mono text-[11px] opacity-60">APP · 10:14 AM</span>
                <p>
                  Posted the migration plan for{' '}
                  <span className="font-mono">daily_revenue_rollup</span> and @-mentioned the
                  Principal for review.
                </p>
              </div>
            </div>
          </div>

          <AccelerationTile taskId="plan-draft" tone="light" variant="strip" />

          <OverrideCard speaker="park" tone="override" visible={overrideVisible}>
            <div className="space-y-2">
              <p>
                The legacy BTEQ uses <strong>banker&rsquo;s rounding</strong>, not half-up.
                Finance reconciles monthly against it — if we change the rounding, the books
                stop matching for the same year.
              </p>
              <p>
                Also the staging CTE with <span className="font-mono">ON COMMIT</span> reads
                odd. If you need cross-step state use a transient.
              </p>
              <p className="text-[12px] opacity-70">
                Reference: 2024-Q3 close reconciliation memo.
              </p>
            </div>
          </OverrideCard>

          <OverrideCard speaker="cursor" tone="ai" visible={aiReplyVisible} delayMs={200}>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Updating plan.</span> Adding a{' '}
                <span className="font-mono">bankers_round()</span> dbt macro and swapping the
                staging CTE for a transient. Re-ran the 1% sample — Δ still zero.
              </p>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <CheckCircle2 className="h-3 w-3" /> Grounded in
                </div>
                <code className="font-mono text-[11px]">
                  acme/finance-recon-memo-2024-q3.md
                </code>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded bg-slate-50 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Plan changes
                  </div>
                  <div className="font-semibold text-slate-900">+1 macro · CTE → transient</div>
                </div>
                <div className="rounded bg-slate-50 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Re-verify time
                  </div>
                  <div className="font-semibold text-slate-900">6 min</div>
                </div>
              </div>
            </div>
          </OverrideCard>

          {aiReplyVisible && (
            <AccelerationTile taskId="plan-override" tone="light" variant="chip" />
          )}

          <button
            type="button"
            onClick={onAdvance}
            disabled={!aiReplyVisible}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#29B5E8', color: '#111827' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve plan (gate 1/4)
            <span>→</span>
          </button>
        </div>
      </div>
    </ChapterStage>
  );
}

function PlanDagSvg({ morphed }: { morphed: boolean }) {
  return (
    <svg viewBox="0 0 820 520" className="absolute inset-0 h-full w-full p-6">
      <defs>
        <marker
          id="wb-arrow-snow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
        </marker>
      </defs>

      {/* Source — legacy */}
      <Box
        x={20}
        y={200}
        w={170}
        h={80}
        label="Teradata BTEQ"
        sub="daily_revenue_rollup.bteq"
        fill="#FFF4DB"
        border="#E0B453"
      />

      {/* Staging */}
      <Box
        x={250}
        y={120}
        w={180}
        h={70}
        label={morphed ? 'Transient staging table' : 'Staging CTE'}
        sub={morphed ? 'after override · cross-step state' : 'ON COMMIT PRESERVE ROWS'}
        fill="#E8F4FF"
        border="#2563EB"
      />

      {/* Target dbt model */}
      <Box
        x={250}
        y={230}
        w={180}
        h={140}
        label="dbt model"
        sub="fct_daily_revenue.sql"
        fill="#E5F6FB"
        border="#29B5E8"
        double
      >
        <text
          x="340"
          y="276"
          textAnchor="middle"
          fontSize="10"
          fontFamily="ui-monospace"
          fill="#1F2937"
        >
          QUALIFY ROW_NUMBER() (native)
        </text>
        <text
          x="340"
          y="294"
          textAnchor="middle"
          fontSize="10"
          fontFamily="ui-monospace"
          fill="#1F2937"
        >
          {morphed ? 'bankers_round() macro' : 'ROUND(amount, 2)'}
        </text>
        <text
          x="340"
          y="312"
          textAnchor="middle"
          fontSize="10"
          fontFamily="ui-monospace"
          fill="#1F2937"
        >
          14 dbt tests · grain · FX · top-100
        </text>
      </Box>

      {/* Tests */}
      <Box
        x={490}
        y={230}
        w={150}
        h={70}
        label="Cortex semantic diff"
        sub="1% row-equivalence harness"
        fill="#F3E8FF"
        border="#A78BFA"
      />

      {/* Snowflake target */}
      <Box
        x={490}
        y={340}
        w={150}
        h={60}
        label="Snowflake mart"
        sub="fct_daily_revenue · prod"
        fill="#E6FCF5"
        border="#16A34A"
      />

      {/* Reviewer gate */}
      <Box
        x={665}
        y={285}
        w={130}
        h={70}
        label="Reviewer gate"
        sub={morphed ? 'with finance-recon ref' : 'pending'}
        fill="#FEF3C7"
        border="#F59E0B"
      />

      {/* Arrows */}
      <Arrow d="M 190 240 C 220 230, 230 170, 250 155" />
      <Arrow d="M 190 240 C 220 270, 230 290, 250 290" />
      <Arrow d="M 430 290 L 490 270" />
      <Arrow d="M 565 300 C 565 320, 565 340, 565 340" />
      <Arrow d="M 640 270 L 665 305" />
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  fill,
  border,
  double,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  fill: string;
  border: string;
  double?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <g>
      {double && (
        <rect
          x={x + 3}
          y={y + 3}
          width={w}
          height={h}
          rx="10"
          fill="none"
          stroke={border}
          strokeWidth="1.5"
          opacity="0.35"
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={fill}
        stroke={border}
        strokeWidth="1.8"
      />
      <text
        x={x + w / 2}
        y={y + 22}
        textAnchor="middle"
        fontSize="13"
        fontWeight={700}
        fill="#111827"
        fontFamily="Inter, system-ui"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 38}
          textAnchor="middle"
          fontSize="10"
          fill="rgba(17,24,39,0.6)"
          fontFamily="ui-monospace"
        >
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

function Arrow({ d, dashed }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#111827"
      strokeWidth={1.4}
      opacity={0.7}
      strokeDasharray={dashed ? '6 5' : undefined}
      markerEnd="url(#wb-arrow-snow)"
    />
  );
}

function StickyNotes({ morphed }: { morphed: boolean }) {
  return (
    <>
      {/* Sticky 1 — orange, plan summary */}
      <div
        className="absolute"
        style={{ top: 20, right: 28, width: 220, transform: 'rotate(3deg)' }}
      >
        <StickyNote color="#FFB95E" shadowColor="rgba(229, 83, 0, 0.15)">
          <div className="font-semibold">Plan summary.</div>
          <p
            className="mt-1 text-[12px] leading-snug"
            style={{ color: '#4B1E00' }}
          >
            Staging → fct grain · 14 dbt tests · Cortex semantic diff + 1%
            row-equivalence harness. Reviewer approves before any code is
            committed.
          </p>
        </StickyNote>
      </div>

      {/* Sticky 2 — blue, target SLA */}
      <div
        className="absolute"
        style={{ bottom: 100, right: 40, width: 210, transform: 'rotate(-2.5deg)' }}
      >
        <StickyNote color="#BFDBFE" shadowColor="rgba(37, 99, 235, 0.15)">
          <div className="font-semibold" style={{ color: '#1E3A8A' }}>
            Target SLA
          </div>
          <p
            className="mt-1 text-[12px] leading-snug"
            style={{ color: '#1E3A8A' }}
          >
            Snowflake X-Small WH · target wall-clock{' '}
            <span className="font-bold">&lt; 30s</span> (BTEQ baseline: 57m).
            <br />
            Target credits/day:{' '}
            <span className="font-bold">~$0.30</span>.
          </p>
        </StickyNote>
      </div>

      {/* Sticky 3 — yellow, banker's rounding (appears after override) */}
      <div
        className="absolute transition-all duration-700"
        style={{
          bottom: 24,
          left: 28,
          width: 220,
          transform: `rotate(-4deg) scale(${morphed ? 1 : 0.8})`,
          opacity: morphed ? 1 : 0,
        }}
      >
        <StickyNote color="#FDE68A" shadowColor="rgba(234, 179, 8, 0.15)">
          <div className="font-semibold" style={{ color: '#78350F' }}>
            NEW · bankers_round() macro
          </div>
          <p
            className="mt-1 text-[12px] leading-snug"
            style={{ color: '#78350F' }}
          >
            Preserves legacy BTEQ rounding behavior.
            <br />
            Referenced: <span className="font-bold">2024-Q3 close memo</span>.
          </p>
        </StickyNote>
      </div>
    </>
  );
}

function StickyNote({
  children,
  color,
  shadowColor,
}: {
  children: React.ReactNode;
  color: string;
  shadowColor: string;
}) {
  return (
    <div
      className="rounded-sm p-3 text-[13px]"
      style={{
        background: color,
        color: '#4B1E00',
        fontStyle: 'italic',
        letterSpacing: '0.02em',
        boxShadow: `0 8px 18px -6px ${shadowColor}, 0 1px 2px rgba(0,0,0,0.05)`,
      }}
    >
      {children}
    </div>
  );
}
