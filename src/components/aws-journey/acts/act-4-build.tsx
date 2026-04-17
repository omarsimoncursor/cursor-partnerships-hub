'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, Terminal, GitCommit, Check, X } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { CalendarWidget } from '../time/calendar-widget';
import { OverrideCard } from '../override-card';
import { CursorLogo } from '../cursor-logo';
import { AccelerationTile } from '../acceleration-tile';
import { ACT_TIMING } from '../data/script';
import { ORDERS_STACK_CDK, CODEX_PATCHES } from '../data/orders-stack';
import { ORDERS_SERVICE_JAVA } from '../data/orders-java-source';

interface Act4Props {
  onAdvance: () => void;
}

type Step =
  | 'idle'
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

export function Act4Build({ onAdvance }: Act4Props) {
  const [typedLines, setTypedLines] = useState(0);
  const [step, setStep] = useState<Step>('idle');
  const [appliedPatches, setAppliedPatches] = useState<Set<number>>(new Set());
  const [codexVisible, setCodexVisible] = useState<Record<'iam' | 'vpc', boolean>>({ iam: false, vpc: false });
  const [testState, setTestState] = useState<{ passed: number; failing: boolean; total: number }>({ passed: 0, failing: false, total: 47 });

  // Author-from-top progressive typing
  useEffect(() => {
    setStep('typing');
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
  }, []);

  // Test-runner timeline
  useEffect(() => {
    const t1 = setTimeout(() => setStep('tests-running'), ACT_TIMING.act4TerminalStartMs);
    const t2 = setTimeout(() => setStep('codex'), ACT_TIMING.act4CodexCommentsMs);
    const t3 = setTimeout(() => setCodexVisible({ iam: true, vpc: false }), ACT_TIMING.act4CodexCommentsMs + 80);
    const t4 = setTimeout(() => setCodexVisible({ iam: true, vpc: true }), ACT_TIMING.act4CodexCommentsMs + 1100);
    const t5 = setTimeout(() => setAppliedPatches(new Set([62, 48])), ACT_TIMING.act4CodexCommentsMs + 2300);
    const t6 = setTimeout(() => setStep('patched'), ACT_TIMING.act4CodexCommentsMs + 2500);
    const t7 = setTimeout(() => setStep('chen'), ACT_TIMING.act4ChenApprovalMs);
    return () => [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
  }, []);

  // Simulated test runner
  useEffect(() => {
    if (step !== 'tests-running' && step !== 'codex' && step !== 'patched' && step !== 'chen') return;
    let cancelled = false;
    let passed = 0;
    const tick = async () => {
      const runTest = () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            if (cancelled) return resolve();
            if (passed === 22) {
              setTestState({ passed, failing: true, total: 47 });
              setTimeout(() => {
                if (cancelled) return resolve();
                setTestState({ passed, failing: false, total: 47 });
                resolve();
              }, 600);
            } else {
              passed += 1;
              setTestState({ passed, failing: false, total: 47 });
              resolve();
            }
          }, 140);
        });
      while (!cancelled && passed < 47) {
        await runTest();
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [step]);

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
        eyebrow="Cursor Cloud Agent transforms 2.8k LOC of Java EE into TypeScript + AWS CDK. Codex auto-patches security. M. Chen approves."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_380px]">
        {/* Left pane: Java EE source */}
        <Pane
          title="OrdersService.java"
          subtitle="Legacy · WebSphere 8.5 + Oracle 12c"
          language="java"
          lines={javaLines}
          highlightBand={activeJavaBand ? { start: activeJavaBand.javaStartLine, end: activeJavaBand.javaEndLine, label: activeJavaBand.label } : null}
          maxHeight={520}
        />

        {/* Middle pane: CDK being authored */}
        <Pane
          title="orders-stack.ts"
          subtitle="authored by Cursor Cloud Agent · AWS CDK"
          language="ts"
          lines={ORDERS_STACK_CDK.slice(0, typedLines)}
          cursorLine={typedLines}
          patchedLines={appliedPatches}
          patchReplacements={Object.fromEntries(CODEX_PATCHES.map((p) => [p.line, p.replacementLine]))}
          maxHeight={520}
          authorTag
        />

        {/* Right column: codex + chen + terminal */}
        <div className="flex flex-col gap-3">
          <AccelerationTile taskId="java-to-cdk" tone="dark" variant="card" />

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
          <AccessAnalyzerTile visible={chenVisible} />
          <OverrideCard speaker="chen" tone="approve" visible={chenVisible} darkMode>
            <div className="space-y-2">
              <p>
                Both Codex catches match our IAM baseline and VPC pattern
                (<span className="font-mono">CIS AWS Foundations §3.1, §4.2</span>). Approved.
              </p>
              <p className="text-[12px] opacity-80">
                Also running Access Analyzer on the staging deploy — expect 0 findings.
              </p>
            </div>
          </OverrideCard>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!chenVisible}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
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
        className="flex items-center gap-2 border-b px-3 py-2 text-[11px] font-mono"
        style={{ background: '#161B22', borderColor: 'rgba(255,255,255,0.08)', color: '#E6EDF3' }}
      >
        {authorTag ? (
          <CursorLogo size={14} tone="dark" />
        ) : (
          <span className={`inline-block h-2 w-2 rounded-full ${language === 'java' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
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
      className="rounded-lg border p-3 text-[12px] transition-all duration-500"
      style={{
        background: applied ? 'rgba(126, 231, 135, 0.06)' : 'rgba(234, 179, 8, 0.06)',
        borderColor: applied ? 'rgba(126, 231, 135, 0.3)' : 'rgba(234, 179, 8, 0.35)',
        color: '#E6EDF3',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: applied ? '#7EE787' : '#FBBF24' }}>
        <GitCommit className="h-3 w-3" />
        Codex review · line {patch.line}
        {applied && <span className="ml-auto flex items-center gap-1 text-[10px]"><Check className="h-3 w-3" /> patched</span>}
      </div>
      <div className="text-[12px] font-semibold">{patch.summary}</div>
      <p className="mt-1 text-[11px] opacity-80">{patch.detail}</p>
    </div>
  );
}

function AccessAnalyzerTile({ visible }: { visible: boolean }) {
  return (
    <div
      className="rounded-lg border p-3 transition-all duration-500"
      style={{
        background: 'rgba(126, 231, 135, 0.06)',
        borderColor: 'rgba(126, 231, 135, 0.3)',
        color: '#E6EDF3',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#7EE787' }}>
        <ShieldCheck className="h-3 w-3" />
        IAM Access Analyzer · staging
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat num="0" label="over-privileged" />
        <Stat num="0" label="public" />
        <Stat num="✓"  label="least-priv" good />
      </div>
    </div>
  );
}

function Stat({ num, label, good }: { num: string; label: string; good?: boolean }) {
  return (
    <div>
      <div className="text-lg font-bold tabular-nums" style={{ color: good ? '#7EE787' : '#E6EDF3' }}>{num}</div>
      <div className="text-[9px] uppercase tracking-wider opacity-60">{label}</div>
    </div>
  );
}

function TerminalStrip({ active, passed, total, failing }: { active: boolean; passed: number; total: number; failing: boolean }) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border"
      style={{ background: '#010409', borderColor: 'rgba(126,231,135,0.15)' }}
    >
      <div className="flex items-center gap-2 border-b px-3 py-1.5 text-[11px] font-mono" style={{ background: '#161B22', borderColor: 'rgba(255,255,255,0.06)', color: '#8B949E' }}>
        <Terminal className="h-3 w-3" />
        <span>integration-tests · npm test</span>
        <span className="ml-auto text-[10px] opacity-60">{active ? 'running' : 'idle'}</span>
      </div>
      <div className="px-4 py-3 font-mono text-[11px] leading-5" style={{ color: '#E6EDF3' }}>
        {!active && <div className="opacity-50">$ _</div>}
        {active && (
          <>
            <div style={{ color: '#7EE787' }}>
              $ npm test -- --coverage
            </div>
            <div className="opacity-70">PASS  tests/handlers/create-order.test.ts</div>
            <div className="opacity-70">PASS  tests/handlers/list-orders.test.ts</div>
            <div className="opacity-70">PASS  tests/handlers/update-status.test.ts</div>
            <div>
              <span style={{ color: failing ? '#F87171' : '#7EE787' }}>
                {failing ? '⚠ FAIL' : '✓ PASS'}
              </span>{' '}
              <span className="opacity-80">
                {failing
                  ? 'tests/handlers/cancel-order.test.ts  — retry #1 after patch'
                  : passed > 22
                  ? 'tests/handlers/cancel-order.test.ts  — patched & retried (green)'
                  : 'integration suite progressing…'}
              </span>
            </div>
            <div className="mt-1">
              <span style={{ color: '#58A6FF' }}>Tests:</span>{' '}
              <span style={{ color: '#7EE787' }}>{passed} passed</span>
              <span className="opacity-60">, {failing ? '1 failing (auto-recovering)' : '0 failing'}, {total - passed} pending</span>
            </div>
            <ProgressBar passed={passed} total={total} failing={failing} />
            {passed === total && (
              <div className="mt-1" style={{ color: '#7EE787' }}>
                ✓ All 47 tests passed · <span className="opacity-70">coverage 94.7% · duration 11.4s</span>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _X = X; // keep lucide-react import alive if we expand later
