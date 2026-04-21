'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, GitCommit, ShieldCheck, Terminal } from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { CalendarWidget } from '../time/calendar-widget';
import { OverrideCard } from '../override-card';
import { AccelerationTile } from '../acceleration-tile';
import { ACTS, type ActComponentProps } from '../story-types';
import { ACT_TIMING } from '../data/script';
import { DAILY_REVENUE_BTEQ, FCT_DAILY_REVENUE_DBT, DBT_PATCHES } from '../data/dbt-source';

type Step = 'idle' | 'typing' | 'tests-running' | 'patch' | 'patched' | 'review' | 'complete';

const DBT_LINES = FCT_DAILY_REVENUE_DBT.split('\n');
const DBT_LINE_COUNT = DBT_LINES.length;

const BTEQ_HIGHLIGHTS: Array<{
  atLine: number;
  bteqStartLine: number;
  bteqEndLine: number;
  label: string;
}> = [
  { atLine: 4, bteqStartLine: 4, bteqEndLine: 7, label: 'config block' },
  { atLine: 12, bteqStartLine: 8, bteqEndLine: 14, label: 'MULTISET VOLATILE → CTE' },
  { atLine: 22, bteqStartLine: 17, bteqEndLine: 21, label: 'fx + deprecation filter' },
  { atLine: 27, bteqStartLine: 24, bteqEndLine: 27, label: 'COLLECT STATS dropped' },
  { atLine: 35, bteqStartLine: 36, bteqEndLine: 41, label: 'QUALIFY + bankers_round' },
];

const ACT4_TYPING_MS = 8500;

/**
 * Act 4 · Build.
 *
 * Three panes: legacy BTEQ on the left, dbt being authored by Cursor in the
 * middle, Codex-style review cards + reviewer approval on the right. A
 * terminal strip at the bottom plays the dbt test runner. The viewer
 * approves the build gate (2/4) once the reviewer signs off.
 *
 * Mirrors AWS journey Act 4&rsquo;s structure 1:1 with Snowflake-tinted content.
 */
export function Act04FirstAsset({ onAdvance }: ActComponentProps) {
  const act = ACTS[3];
  const [typedLines, setTypedLines] = useState(0);
  const [step, setStep] = useState<Step>('idle');
  const [appliedPatches, setAppliedPatches] = useState<Set<number>>(new Set());
  const [patchVisible, setPatchVisible] = useState(false);
  const [testState, setTestState] = useState<{ passed: number; failing: boolean; total: number }>(
    { passed: 0, failing: false, total: 14 },
  );

  // Author-from-top progressive typing
  useEffect(() => {
    setStep('typing');
    const startAt = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startAt;
      const pct = Math.min(1, elapsed / ACT4_TYPING_MS);
      const count = Math.floor(pct * DBT_LINE_COUNT);
      setTypedLines(count);
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sequenced reveals: typing -> tests -> patch comment -> applied -> reviewer
  useEffect(() => {
    const t1 = setTimeout(() => setStep('tests-running'), ACT_TIMING.act4TerminalStartMs);
    const t2 = setTimeout(() => {
      setStep('patch');
      setPatchVisible(true);
    }, ACT_TIMING.act4PatchCommentsMs);
    const t3 = setTimeout(() => {
      setAppliedPatches(new Set([35]));
      setStep('patched');
    }, ACT_TIMING.act4PatchCommentsMs + 1800);
    const t4 = setTimeout(
      () => setStep('review'),
      ACT_TIMING.act4ReviewerApprovalMs,
    );
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // Test runner — fails at test 8 (the rev_rank ordering), then recovers after patch
  useEffect(() => {
    if (step === 'idle' || step === 'typing') return;
    let cancelled = false;
    let passed = 0;
    const tick = async () => {
      const runTest = () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            if (cancelled) return resolve();
            if (passed === 8 && !appliedPatches.has(35)) {
              setTestState({ passed, failing: true, total: 14 });
              setTimeout(() => {
                if (cancelled) return resolve();
                resolve();
              }, 800);
            } else {
              passed += 1;
              setTestState({ passed, failing: false, total: 14 });
              resolve();
            }
          }, 220);
        });
      while (!cancelled && passed < 14) {
        if (passed === 8 && !appliedPatches.has(35)) {
          // wait for patch
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        await runTest();
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [step, appliedPatches]);

  const bteqLines = useMemo(() => DAILY_REVENUE_BTEQ.split('\n'), []);
  const activeBteqBand = useMemo(() => {
    const lastTrigger = [...BTEQ_HIGHLIGHTS]
      .reverse()
      .find((h) => typedLines >= h.atLine);
    return lastTrigger;
  }, [typedLines]);

  const reviewerVisible = step === 'review' || step === 'complete';

  return (
    <ChapterStage
      act={act}
      topRight={
        <CalendarWidget
          currentDay={3}
          targetDay={5}
          contextLabel="Build"
          accent="#29B5E8"
          darkMode
        />
      }
    >
      <ChapterHeader
        act={act}
        eyebrow="Cursor Cloud Agent rewrites 214 lines of Teradata BTEQ as a 132-line Snowflake-native dbt model. Codex auto-patches the rounding regression. The reviewer approves."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_380px]">
        <Pane
          title="daily_revenue_rollup.bteq"
          subtitle="Legacy · Teradata 17"
          language="bteq"
          lines={bteqLines}
          highlightBand={
            activeBteqBand
              ? {
                  start: activeBteqBand.bteqStartLine,
                  end: activeBteqBand.bteqEndLine,
                  label: activeBteqBand.label,
                }
              : null
          }
          maxHeight={520}
        />

        <Pane
          title="fct_daily_revenue.sql"
          subtitle="authored by Cursor · dbt + Snowflake"
          language="sql"
          lines={DBT_LINES.slice(0, typedLines)}
          cursorLine={typedLines}
          patchedLines={appliedPatches}
          patchReplacements={Object.fromEntries(
            DBT_PATCHES.map((p) => [p.line, p.after]),
          )}
          maxHeight={520}
          authorTag
        />

        <div className="flex flex-col gap-3">
          <AccelerationTile taskId="translate-bteq" tone="dark" variant="card" />

          <PatchCard
            patch={DBT_PATCHES[0]}
            visible={patchVisible}
            applied={appliedPatches.has(35)}
          />

          <OverrideCard speaker="chen" tone="approve" visible={reviewerVisible} darkMode>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">14 / 14 tests green.</span> Diff is clean —
                rounding macro + transient swap match the plan we approved in Act 3.
              </p>
              <p className="text-[12px] opacity-80">
                Queueing for the Friday change window. Cursor — open the backfill subtask for
                the 4 deprecated XOF rows before merge.
              </p>
            </div>
          </OverrideCard>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!reviewerVisible}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#29B5E8', color: '#0D1117' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve build (gate 2/4)
            <span>→</span>
          </button>
        </div>
      </div>

      <TerminalStrip
        active={step !== 'idle' && step !== 'typing'}
        passed={testState.passed}
        total={testState.total}
        failing={testState.failing}
        patched={appliedPatches.has(35)}
      />
    </ChapterStage>
  );
}

function Pane({
  title,
  subtitle,
  language,
  lines,
  cursorLine,
  patchedLines,
  patchReplacements,
  highlightBand,
  maxHeight,
  authorTag,
}: {
  title: string;
  subtitle: string;
  language: 'bteq' | 'sql';
  lines: string[];
  cursorLine?: number;
  patchedLines?: Set<number>;
  patchReplacements?: Record<number, string>;
  highlightBand?: { start: number; end: number; label: string } | null;
  maxHeight?: number;
  authorTag?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cursorLine !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [cursorLine]);

  useEffect(() => {
    if (highlightBand && scrollRef.current) {
      const top = Math.max(0, (highlightBand.start - 4) * 19);
      scrollRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, [highlightBand?.start]);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border"
      style={{ background: '#0D1117', borderColor: 'rgba(125,211,245,0.15)' }}
    >
      <div
        className="flex items-center gap-2 border-b px-3 py-2 font-mono text-[11px]"
        style={{
          background: '#161B22',
          borderColor: 'rgba(255,255,255,0.08)',
          color: '#E6EDF3',
        }}
      >
        {authorTag ? (
          <CursorLogo size={14} tone="dark" />
        ) : (
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              language === 'bteq' ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
          />
        )}
        <span className="font-semibold">{title}</span>
        <span className="opacity-50">· {subtitle}</span>
        {highlightBand && (
          <span className="ml-auto rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-amber-300">
            {highlightBand.label}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-1 font-mono text-[12px] leading-[19px]"
        style={{ maxHeight: maxHeight ?? 520, color: '#E6EDF3' }}
      >
        {lines.map((line, i) => {
          const lineNumber = i + 1;
          const inBand =
            highlightBand &&
            lineNumber >= highlightBand.start &&
            lineNumber <= highlightBand.end;
          const isPatched = patchedLines?.has(lineNumber) ?? false;
          const displayLine =
            isPatched && patchReplacements?.[lineNumber] ? patchReplacements[lineNumber] : line;
          return (
            <div
              key={i}
              className="flex gap-3 px-2 transition-colors"
              style={{
                background: inBand
                  ? 'rgba(251, 191, 36, 0.1)'
                  : isPatched
                    ? 'rgba(125, 211, 245, 0.12)'
                    : 'transparent',
                borderLeft: inBand
                  ? '2px solid #FBBF24'
                  : isPatched
                    ? '2px solid #29B5E8'
                    : '2px solid transparent',
              }}
            >
              <span
                className="shrink-0 select-none text-right"
                style={{ color: 'rgba(230,237,243,0.3)', width: 28 }}
              >
                {lineNumber}
              </span>
              <span className="flex-1 whitespace-pre">
                <SyntaxLine line={displayLine} language={language} />
              </span>
            </div>
          );
        })}
        {cursorLine !== undefined && cursorLine < DBT_LINE_COUNT && (
          <div className="px-2 pl-[44px]">
            <span
              className="inline-block h-[13px] w-[7px] align-middle"
              style={{ background: '#29B5E8', animation: 'blink 1.1s steps(2, start) infinite' }}
            />
          </div>
        )}
        <style jsx>{`
          @keyframes blink {
            to {
              background: transparent;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

/** Lightweight token highlighter — sufficient for the demo. */
function SyntaxLine({ line, language }: { line: string; language: 'bteq' | 'sql' }) {
  if (line.trim().startsWith('--') || line.trim().startsWith('.')) {
    return <span style={{ color: '#8B949E', fontStyle: 'italic' }}>{line}</span>;
  }
  const keywords =
    language === 'sql'
      ? /\b(with|as|select|from|join|on|where|group by|qualify|order by|partition by|count|sum|distinct|rank|row_number|case|when|then|else|end|materialized|incremental|merge|append_new_columns|transient|true)\b/gi
      : /\b(CREATE|MULTISET|VOLATILE|TABLE|ON COMMIT|PRESERVE ROWS|AS|WITH DATA|SELECT|FROM|JOIN|ON|WHERE|GROUP BY|SUM|COUNT|DISTINCT|RANK|ROW_NUMBER|PARTITION BY|ORDER BY|QUALIFY|INSERT INTO|COLLECT STATISTICS|COLUMN|BETWEEN|AND|DATE)\b/g;
  const strings = /("[^"]*"|'[^']*'|`[^`]*`)/g;
  const jinja = /(\{\{[^}]*\}\}|\{%[^%]*%\})/g;

  const pieces: Array<{ text: string; type: 'keyword' | 'str' | 'jinja' | 'plain' }> = [];
  let last = 0;
  const regex = new RegExp(`${strings.source}|${jinja.source}|${keywords.source}`, 'gi');
  let m;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) pieces.push({ text: line.slice(last, m.index), type: 'plain' });
    const tok = m[0];
    if (/^["'`]/.test(tok)) pieces.push({ text: tok, type: 'str' });
    else if (tok.startsWith('{{') || tok.startsWith('{%'))
      pieces.push({ text: tok, type: 'jinja' });
    else pieces.push({ text: tok, type: 'keyword' });
    last = m.index + tok.length;
  }
  if (last < line.length) pieces.push({ text: line.slice(last), type: 'plain' });

  return (
    <>
      {pieces.map((p, i) => {
        switch (p.type) {
          case 'keyword':
            return (
              <span key={i} style={{ color: '#FF7B72' }}>
                {p.text}
              </span>
            );
          case 'str':
            return (
              <span key={i} style={{ color: '#A5D6FF' }}>
                {p.text}
              </span>
            );
          case 'jinja':
            return (
              <span key={i} style={{ color: '#D2A8FF' }}>
                {p.text}
              </span>
            );
          default:
            return <span key={i}>{p.text}</span>;
        }
      })}
    </>
  );
}

function PatchCard({
  patch,
  visible,
  applied,
}: {
  patch: { line: number; summary: string; detail: string };
  visible: boolean;
  applied: boolean;
}) {
  return (
    <div
      className="rounded-lg border p-3 text-[12px] transition-all duration-500"
      style={{
        background: applied ? 'rgba(125, 211, 245, 0.06)' : 'rgba(234, 179, 8, 0.06)',
        borderColor: applied ? 'rgba(125, 211, 245, 0.3)' : 'rgba(234, 179, 8, 0.35)',
        color: '#E6EDF3',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
      }}
    >
      <div
        className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: applied ? '#29B5E8' : '#FBBF24' }}
      >
        <GitCommit className="h-3 w-3" />
        Codex review · line {patch.line}
        {applied && (
          <span className="ml-auto flex items-center gap-1 text-[10px]">
            <Check className="h-3 w-3" /> patched
          </span>
        )}
      </div>
      <div
        className="text-[12px] font-semibold"
        // patch.summary contains an HTML entity (&rsquo;) we want to render
        dangerouslySetInnerHTML={{ __html: patch.summary }}
      />
      <p
        className="mt-1 text-[11px] opacity-80"
        dangerouslySetInnerHTML={{ __html: patch.detail }}
      />
    </div>
  );
}

function TerminalStrip({
  active,
  passed,
  total,
  failing,
  patched,
}: {
  active: boolean;
  passed: number;
  total: number;
  failing: boolean;
  patched: boolean;
}) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border"
      style={{ background: '#010409', borderColor: 'rgba(125,211,245,0.15)' }}
    >
      <div
        className="flex items-center gap-2 border-b px-3 py-1.5 font-mono text-[11px]"
        style={{ background: '#161B22', borderColor: 'rgba(255,255,255,0.06)', color: '#8B949E' }}
      >
        <Terminal className="h-3 w-3" />
        <span>integration-tests · dbt test</span>
        <span className="ml-auto text-[10px] opacity-60">{active ? 'running' : 'idle'}</span>
      </div>
      <div
        className="px-4 py-3 font-mono text-[11px] leading-5"
        style={{ color: '#E6EDF3' }}
      >
        {!active && <div className="opacity-50">$ _</div>}
        {active && (
          <>
            <div style={{ color: '#7DD3F5' }}>
              $ dbt test --select fct_daily_revenue
            </div>
            <div className="opacity-70">PASS unique_fct_daily_revenue_grain</div>
            <div className="opacity-70">PASS not_null_revenue_usd</div>
            <div className="opacity-70">PASS positive_orders_count</div>
            <div>
              <span style={{ color: failing ? '#F87171' : '#7DD3F5' }}>
                {failing ? '⚠ FAIL' : '✓ PASS'}
              </span>{' '}
              <span className="opacity-80">
                {failing
                  ? 'fct_daily_revenue_top_100_rank_drift  — bankers_round needed'
                  : patched
                    ? 'fct_daily_revenue_top_100_rank_drift  — patched & re-ran (green)'
                    : 'fct_daily_revenue suite progressing…'}
              </span>
            </div>
            <div className="mt-1">
              <span style={{ color: '#58A6FF' }}>Tests:</span>{' '}
              <span style={{ color: '#7DD3F5' }}>{passed} passed</span>
              <span className="opacity-60">
                , {failing ? '1 failing (auto-recovering)' : '0 failing'}, {total - passed}{' '}
                pending
              </span>
            </div>
            <ProgressBar passed={passed} total={total} failing={failing} />
            {passed === total && (
              <div className="mt-1" style={{ color: '#7DD3F5' }}>
                ✓ All 14 tests passed ·{' '}
                <span className="opacity-70">
                  warehouse XS · wall-clock 12.8s · Δ rows 0
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  passed,
  total,
  failing,
}: {
  passed: number;
  total: number;
  failing: boolean;
}) {
  return (
    <div className="mt-2 flex gap-[2px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 transition-all"
          style={{
            background:
              i < passed
                ? '#7DD3F5'
                : i === passed && failing
                  ? '#F87171'
                  : 'rgba(139,148,158,0.2)',
          }}
        />
      ))}
    </div>
  );
}
