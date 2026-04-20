'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, Terminal, GitCommit, Check } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { CalendarWidget } from '../time/calendar-widget';
import { OverrideCard } from '../override-card';
import { CursorLogo } from '../cursor-logo';
import { StoryBeat } from '../story-beat';
import { ACT_TIMING } from '../data/script';
import { ORDERS_STACK_CDK, CODEX_PATCHES } from '../data/orders-stack';
import { ORDERS_SERVICE_JAVA } from '../data/orders-java-source';

interface Act4Props {
  onAdvance: () => void;
}

type Step =
  | 'awaiting-start'
  | 'typing'
  | 'tests-running'
  | 'codex'
  | 'patched'
  | 'chen'
  | 'complete';

const CDK_LINE_COUNT = ORDERS_STACK_CDK.length;

const JAVA_HIGHLIGHTS: Array<{ atLine: number; javaStartLine: number; javaEndLine: number; label: string }> = [
  { atLine: 14,  javaStartLine: 46,  javaEndLine: 50,  label: '@Stateless public class' },
  { atLine: 22,  javaStartLine: 72,  javaEndLine: 95,  label: 'createOrder(...)' },
  { atLine: 34,  javaStartLine: 100, javaEndLine: 155, label: 'Oracle PL/SQL CallableStatement' },
  { atLine: 48,  javaStartLine: 55,  javaEndLine: 62,  label: 'Oracle DataSource via JNDI' },
  { atLine: 62,  javaStartLine: 68,  javaEndLine: 75,  label: 'Stateless transactional boundary' },
];

const ACT4_TOTAL_TYPING_MS = 8500;

/**
 * Test-runner pacing. The timeline effect derives its Codex/patch/chen
 * timings from these so the visuals stay in lock-step with the bar.
 *
 *   testStart → 22 ticks of RUNNER_TICK_MS → fail at #23 → wait
 *   RUNNER_INVESTIGATION_MS for Codex → resume → 24 ticks of RUNNER_TICK_MS
 *   to reach 47 / green.
 */
const RUNNER_TICK_MS = 110;
const RUNNER_TESTS_BEFORE_FAIL = 22;
const RUNNER_INVESTIGATION_MS = 5_500;

export function Act4Build({ onAdvance }: Act4Props) {
  const [typedLines, setTypedLines] = useState(0);
  const [step, setStep] = useState<Step>('awaiting-start');
  const [started, setStarted] = useState(false);
  const [appliedPatches, setAppliedPatches] = useState<Set<number>>(new Set());
  const [codexVisible, setCodexVisible] = useState<Record<'iam' | 'vpc', boolean>>({ iam: false, vpc: false });
  const [testState, setTestState] = useState<{ passed: number; failing: boolean; total: number }>({ passed: 0, failing: false, total: 47 });

  // Author-from-top progressive typing — only starts after the user clicks.
  // Keyed on `started`, not `step`, so the raf keeps ticking as step changes.
  useEffect(() => {
    if (!started) return;
    const startAt = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startAt;
      const pct = Math.min(1, elapsed / ACT4_TOTAL_TYPING_MS);
      const count = Math.floor(pct * CDK_LINE_COUNT);
      setTypedLines(count);
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  // Test-runner + Codex timeline — kicked off exactly once when the user
  // runs the build. Keyed on `started` (a one-way latch) so the timers
  // aren't cancelled every time `step` transitions; previously this effect
  // depended on `step`, which meant the first setStep fired, cleanup ran,
  // and t2..t7 got cleared — leaving the scene stuck at 'tests-running'.
  useEffect(() => {
    if (!started) return;
    // Synced to the test runner below. Runner reaches test #23 and fails at
    // ~testFailMs; Codex narrative starts ~600ms after that so the viewer
    // can read the failure line, then patches land right when the runner is
    // about to resume (resumeMs = testFailMs + RUNNER_INVESTIGATION_MS).
    const testStartMs = ACT_TIMING.act4TerminalStartMs;     // tests appear
    const testFailMs = testStartMs + RUNNER_TESTS_BEFORE_FAIL * RUNNER_TICK_MS; // ~9.4s
    const codexAt = testFailMs + 600;                       // ~10s
    const resumeAt = testFailMs + RUNNER_INVESTIGATION_MS;  // ~14.9s

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setStep('tests-running'), testStartMs),
      setTimeout(() => setStep('codex'), codexAt),
      // Two patch cards slide in during the investigation window
      setTimeout(() => setCodexVisible({ iam: true, vpc: false }), codexAt + 700),
      setTimeout(() => setCodexVisible({ iam: true, vpc: true }), codexAt + 2000),
      // Patches apply just before the runner unfreezes — viewer sees the
      // green ✓ on the cards a beat before the terminal flips back to green.
      setTimeout(() => setAppliedPatches(new Set([62, 48])), resumeAt - 500),
      setTimeout(() => setStep('patched'), resumeAt - 200),
      // Chen approves comfortably after the suite finishes (47/47 lands at
      // resumeAt + ~2.7s from the runner below).
      setTimeout(() => setStep('chen'), resumeAt + 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [started]);

  // Simulated test runner — runs the full suite once when started flips.
  // Around test 22 the run *halts* on a failing test; control hands to
  // Codex, the patch cards slide in, the patches apply, and the runner
  // resumes once `appliedPatches` is non-empty, finishing 47/47 green.
  // Keyed on `started`, NOT on `step`, so the loop can't be cancelled
  // mid-run by step transitions.
  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let passed = 0;
    const sleep = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    const tick = async () => {
      // Hold until the terminal is visible (step transitions to
      // 'tests-running' at ACT_TIMING.act4TerminalStartMs). Otherwise the
      // runner sprints ahead and the user sees the red failure phase the
      // moment the terminal appears.
      await sleep(ACT_TIMING.act4TerminalStartMs);
      if (cancelled) return;
      setTestState({ passed: 0, failing: false, total: 47 });

      // Phase 1 — run forward until test #23 fails.
      while (!cancelled && passed < RUNNER_TESTS_BEFORE_FAIL) {
        await sleep(RUNNER_TICK_MS);
        if (cancelled) return;
        passed += 1;
        setTestState({ passed, failing: false, total: 47 });
      }
      if (cancelled) return;
      // Phase 2 — failing test #23, runner halts; Codex takes over visually.
      setTestState({ passed, failing: true, total: 47 });
      await sleep(RUNNER_INVESTIGATION_MS);
      if (cancelled) return;
      // Phase 3 — patch applied, retry the failing test, then march on green.
      setTestState({ passed, failing: false, total: 47 });
      await sleep(450);
      if (cancelled) return;
      passed += 1;
      setTestState({ passed, failing: false, total: 47 });
      while (!cancelled && passed < 47) {
        await sleep(RUNNER_TICK_MS);
        if (cancelled) return;
        passed += 1;
        setTestState({ passed, failing: false, total: 47 });
      }
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [started]);

  const javaLines = useMemo(() => ORDERS_SERVICE_JAVA.split('\n'), []);
  const activeJavaBand = useMemo(() => {
    // Highlight the java block associated with the most recently typed trigger
    const lastTrigger = [...JAVA_HIGHLIGHTS].reverse().find((h) => typedLines >= h.atLine);
    return lastTrigger;
  }, [typedLines]);

  const chenVisible = step === 'chen';

  return (
    <ActShell
      act={4}
      topRight={
        <CalendarWidget
          currentDay={3}
          targetDay={11}
          contextLabel="Build"
          accent="#FF9900"
          darkMode={true}
        />
      }
    >
      <ActHeader
        act={4}
        eyebrow="Click 'Start build' and watch Cursor rewrite a 20-year-old Java service into AWS code, line by line, while a second agent monitors and patches security issues before a human ever even sees the PR."
      />

      <StoryBeat
        tone="dark"
        agent="both"
        title="Two agents, working together: one writes the code, one reviews it."
        body={<>The Cloud Agent rewrites Java → AWS Lambda + CDK while Codex catches IAM &amp; VPC issues. Tests run live. M. Chen just verifies policy.</>}
        oldWay="12 weeks hand-porting"
        newWay="9 agent-days + auto-patches"
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
        {/* Left pane: Java EE source */}
        <div className="min-w-0">
          <Pane
            title="OrdersService.java"
            subtitle="Legacy · WebSphere 8.5"
            language="java"
            lines={javaLines}
            highlightBand={activeJavaBand ? { start: activeJavaBand.javaStartLine, end: activeJavaBand.javaEndLine, label: activeJavaBand.label } : null}
            maxHeight={560}
          />
        </div>

        {/* Middle pane: CDK being authored */}
        <div className="relative min-w-0">
          <Pane
            title="orders-stack.ts"
            subtitle="Cursor · AWS CDK"
            language="ts"
            lines={ORDERS_STACK_CDK.slice(0, typedLines)}
            cursorLine={typedLines}
            patchedLines={appliedPatches}
            patchReplacements={Object.fromEntries(CODEX_PATCHES.map((p) => [p.line, p.replacementLine]))}
            maxHeight={560}
            authorTag
          />
          {step === 'awaiting-start' && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg text-center"
              style={{ background: 'rgba(13,17,23,0.92)', border: '1px solid rgba(126,231,135,0.15)' }}
            >
              <div className="max-w-[260px] text-[12.5px]" style={{ color: 'rgba(230,237,243,0.8)' }}>
                Ready to rewrite <strong className="text-white">2,800 lines of Java</strong> into AWS Lambda + CDK.
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('typing');
                  setStarted(true);
                }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ background: '#FF9900', color: '#0D1117' }}
              >
                <CursorLogo size={14} tone="light" />
                Start build
              </button>
            </div>
          )}
        </div>

        {/* Right column: codex + chen + terminal */}
        <div className="flex flex-col gap-2.5">
          <CodexCard
            patch={CODEX_PATCHES.find((p) => p.category === 'iam')!}
            visible={codexVisible.iam}
            applied={appliedPatches.has(62)}
          />
          <CodexCard
            patch={CODEX_PATCHES.find((p) => p.category === 'vpc')!}
            visible={codexVisible.vpc}
            applied={appliedPatches.has(48)}
          />
          <OverrideCard speaker="chen" tone="approve" visible={chenVisible} darkMode>
            <p className="text-[12.5px] leading-snug">
              Codex catches match our IAM + VPC baseline. <strong>Approved.</strong> Access Analyzer: 0 findings.
            </p>
          </OverrideCard>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!chenVisible}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF9900', color: '#0D1117' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve security (gate 2/4)
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Terminal strip */}
      <TerminalStrip
        active={step === 'tests-running' || step === 'codex' || step === 'patched' || step === 'chen'}
        passed={testState.passed}
        total={testState.total}
        failing={testState.failing}
        step={step}
      />
    </ActShell>
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
  language: 'java' | 'ts';
  lines: string[];
  cursorLine?: number;
  patchedLines?: Set<number>;
  patchReplacements?: Record<number, string>;
  highlightBand?: { start: number; end: number; label: string } | null;
  maxHeight?: number;
  authorTag?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the CDK pane to keep the last-typed line visible
  useEffect(() => {
    if (cursorLine !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [cursorLine]);

  // Auto-scroll the java pane so the active band is visible
  useEffect(() => {
    if (highlightBand && scrollRef.current) {
      const top = Math.max(0, (highlightBand.start - 4) * 19);
      scrollRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, [highlightBand?.start]);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border"
      style={{ background: '#0D1117', borderColor: 'rgba(126,231,135,0.15)' }}
    >
      <div
        className="flex min-w-0 items-center gap-2 border-b px-3 py-2 text-[11px] font-mono"
        style={{ background: '#161B22', borderColor: 'rgba(255,255,255,0.08)', color: '#E6EDF3' }}
      >
        {authorTag ? (
          <CursorLogo size={14} tone="dark" />
        ) : (
          <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${language === 'java' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        )}
        <span className="shrink-0 truncate font-semibold">{title}</span>
        <span className="hidden truncate opacity-50 md:inline">· {subtitle}</span>
        {highlightBand && (
          <span className="ml-auto shrink-0 truncate rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-amber-300" title={highlightBand.label}>
            {highlightBand.label}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="relative flex-1 overflow-auto px-1 font-mono text-[12px] leading-[19px]"
        style={{ maxHeight: maxHeight ?? 520, color: '#E6EDF3' }}
      >
        {lines.map((line, i) => {
          const lineNumber = i + 1;
          const inBand = highlightBand && lineNumber >= highlightBand.start && lineNumber <= highlightBand.end;
          const isPatched = patchedLines?.has(lineNumber) ?? false;
          const displayLine = isPatched && patchReplacements?.[lineNumber] ? patchReplacements[lineNumber] : line;
          return (
            <div
              key={i}
              className="flex gap-3 px-2 transition-colors"
              style={{
                background: inBand
                  ? 'rgba(251, 191, 36, 0.1)'
                  : isPatched
                  ? 'rgba(126, 231, 135, 0.1)'
                  : 'transparent',
                borderLeft: inBand ? '2px solid #FBBF24' : isPatched ? '2px solid #7EE787' : '2px solid transparent',
              }}
            >
              <span className="shrink-0 select-none text-right" style={{ color: 'rgba(230,237,243,0.3)', width: 28 }}>
                {lineNumber}
              </span>
              <span className="flex-1 whitespace-pre">
                <SyntaxLine line={displayLine} language={language} />
              </span>
            </div>
          );
        })}
        {cursorLine !== undefined && cursorLine < (highlightBand?.end ?? CDK_LINE_COUNT) && (
          <div className="px-2 pl-[44px]">
            <span className="inline-block h-[13px] w-[7px] align-middle" style={{ background: '#7EE787', animation: 'blink 1.1s steps(2, start) infinite' }} />
          </div>
        )}
        <style jsx>{`
          @keyframes blink { to { background: transparent; } }
        `}</style>
      </div>
    </div>
  );
}

/** Very lightweight highlighter: keywords + strings + comments. */
function SyntaxLine({ line, language }: { line: string; language: 'java' | 'ts' }) {
  // Comment lines
  if (line.trim().startsWith('//')) {
    return <span style={{ color: '#8B949E', fontStyle: 'italic' }}>{line}</span>;
  }
  if (language === 'java' && (line.trim().startsWith('/*') || line.trim().startsWith('*'))) {
    return <span style={{ color: '#8B949E', fontStyle: 'italic' }}>{line}</span>;
  }
  const keywords = language === 'ts'
    ? /\b(import|from|export|const|let|var|if|else|return|new|class|interface|extends|implements|readonly|public|private|static|async|await|function|this|void)\b/g
    : /\b(package|import|public|private|protected|static|final|class|interface|extends|implements|throws|if|else|return|new|this|void|int|long|String|List|try|catch|throw|null|true|false)\b/g;
  const annotations = language === 'java' ? /(@\w+)/g : null;
  const strings = /("[^"]*"|'[^']*'|`[^`]*`)/g;

  // Very basic token replacement via split
  const pieces: Array<{ text: string; type: 'keyword' | 'str' | 'annot' | 'plain' }> = [];
  let last = 0;
  const regex = new RegExp(`${strings.source}|${keywords.source}${annotations ? `|${annotations.source}` : ''}`, 'g');
  let m;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) pieces.push({ text: line.slice(last, m.index), type: 'plain' });
    const tok = m[0];
    if (/^["'`]/.test(tok)) pieces.push({ text: tok, type: 'str' });
    else if (tok.startsWith('@')) pieces.push({ text: tok, type: 'annot' });
    else pieces.push({ text: tok, type: 'keyword' });
    last = m.index + tok.length;
  }
  if (last < line.length) pieces.push({ text: line.slice(last), type: 'plain' });

  return (
    <>
      {pieces.map((p, i) => {
        switch (p.type) {
          case 'keyword': return <span key={i} style={{ color: '#FF7B72' }}>{p.text}</span>;
          case 'str':     return <span key={i} style={{ color: '#A5D6FF' }}>{p.text}</span>;
          case 'annot':   return <span key={i} style={{ color: '#D2A8FF' }}>{p.text}</span>;
          default:        return <span key={i}>{p.text}</span>;
        }
      })}
    </>
  );
}

function CodexCard({ patch, visible, applied }: { patch: { line: number; summary: string; detail: string; category: string }; visible: boolean; applied: boolean }) {
  return (
    <div
      className="rounded-lg border px-2.5 py-2 text-[12px] transition-all duration-500"
      style={{
        background: applied ? 'rgba(126, 231, 135, 0.06)' : 'rgba(234, 179, 8, 0.06)',
        borderColor: applied ? 'rgba(126, 231, 135, 0.3)' : 'rgba(234, 179, 8, 0.35)',
        color: '#E6EDF3',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
      }}
    >
      <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: applied ? '#7EE787' : '#FBBF24' }}>
        <GitCommit className="h-3 w-3" />
        Codex · line {patch.line}
        {applied && <span className="ml-auto flex items-center gap-1 text-[10px]"><Check className="h-3 w-3" /> patched</span>}
      </div>
      <div className="text-[12px] font-semibold leading-snug">{patch.summary}</div>
    </div>
  );
}

function TerminalStrip({
  active,
  passed,
  total,
  failing,
  step,
}: {
  active: boolean;
  passed: number;
  total: number;
  failing: boolean;
  step: Step;
}) {
  // The failing-test banner stays up while Codex is working, not just for the
  // brief "failing=true" flash. We're failing if the runner reported a fail
  // OR we're in any of the Codex / patched intermediate states.
  const inIncident = failing || step === 'codex';
  const recovered = step === 'patched' || step === 'chen';
  const allGreen = passed === total && passed > 0;

  let headerStatus: { label: string; color: string };
  if (allGreen) headerStatus = { label: '✓ 47/47 green', color: '#7EE787' };
  else if (inIncident) headerStatus = { label: '⚠ test failure · Codex investigating', color: '#F87171' };
  else if (recovered) headerStatus = { label: '✓ patch applied · re-running', color: '#7EE787' };
  else headerStatus = { label: `${passed}/${total}`, color: '#7EE787' };

  return (
    <div
      className="mt-3 overflow-hidden rounded-lg border"
      style={{
        background: '#010409',
        borderColor: inIncident ? 'rgba(248,113,113,0.45)' : 'rgba(126,231,135,0.15)',
        transition: 'border-color 250ms',
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-3 py-1 text-[11px] font-mono"
        style={{
          background: inIncident ? 'rgba(127, 29, 29, 0.45)' : '#161B22',
          borderColor: 'rgba(255,255,255,0.06)',
          color: '#8B949E',
        }}
      >
        <Terminal className="h-3 w-3" />
        <span>npm test · integration suite</span>
        <span className="ml-auto font-semibold" style={{ color: headerStatus.color }}>
          {headerStatus.label}
        </span>
      </div>

      <div className="px-3 py-2 font-mono text-[11px]" style={{ color: '#E6EDF3' }}>
        {!active && <div className="opacity-50">$ _</div>}
        {active && (
          <>
            <ProgressBar passed={passed} total={total} failing={failing || inIncident} />

            {/* Default running line */}
            {!inIncident && !recovered && !allGreen && (
              <div className="mt-1.5 text-[10.5px] opacity-80">
                running… {passed} passed, {total - passed} pending
              </div>
            )}

            {/* Failing-test banner — sticky while Codex investigates */}
            {inIncident && (
              <div className="mt-2 space-y-1 rounded-md border px-2.5 py-2" style={{ borderColor: 'rgba(248,113,113,0.5)', background: 'rgba(127,29,29,0.25)' }}>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: '#FCA5A5' }}>
                  <span>✗ FAIL</span>
                  <span className="opacity-80">tests/handlers/cancel-order.test.ts</span>
                  <span className="ml-auto text-[10px] opacity-70">test #23 of 47</span>
                </div>
                <div className="pl-3 text-[10.5px]" style={{ color: 'rgba(252,165,165,0.85)' }}>
                  AccessDeniedException: User &ldquo;OrdersFnRole&rdquo; is not authorized to perform{' '}
                  <span className="font-semibold">dynamodb:PutItem</span> on resource{' '}
                  <span className="font-semibold">Orders</span>
                </div>
                <div className="border-t pt-1.5 text-[10.5px]" style={{ borderColor: 'rgba(248,113,113,0.25)', color: '#FBBF24' }}>
                  <span className="mr-1.5 inline-flex items-center gap-1 font-semibold uppercase tracking-[0.12em]">
                    <CursorLogo size={10} tone="dark" /> Codex
                  </span>
                  <span>investigating IAM scope on <span className="font-mono">orders-stack.ts:62</span>…</span>
                </div>
              </div>
            )}

            {/* Recovered banner — patch applied, re-running */}
            {recovered && !allGreen && (
              <div className="mt-2 rounded-md border px-2.5 py-1.5 text-[10.5px]" style={{ borderColor: 'rgba(126,231,135,0.35)', background: 'rgba(34,197,94,0.08)', color: '#A7F3D0' }}>
                <span className="mr-1.5 inline-flex items-center gap-1 font-semibold uppercase tracking-[0.12em]" style={{ color: '#7EE787' }}>
                  <Check className="h-3 w-3" /> Codex patch applied
                </span>
                Scoped <span className="font-mono">dynamodb:*</span> → <span className="font-mono">dynamodb:PutItem</span> on resource{' '}
                <span className="font-mono">Orders</span>. Re-running suite…
              </div>
            )}

            {/* All green */}
            {allGreen && (
              <div className="mt-1.5 text-[10.5px]" style={{ color: '#7EE787' }}>
                ✓ 47 tests passed · coverage 94.7% · 11.4s · 1 issue auto-patched by Codex
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ passed, total, failing }: { passed: number; total: number; failing: boolean }) {
  return (
    <div className="mt-2 flex gap-[2px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 transition-all"
          style={{
            background:
              i < passed
                ? '#7EE787'
                : i === passed && failing
                ? '#F87171'
                : 'rgba(139,148,158,0.2)',
          }}
        />
      ))}
    </div>
  );
}
