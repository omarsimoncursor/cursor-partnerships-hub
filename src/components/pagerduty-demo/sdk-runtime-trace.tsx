'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check, Globe2, Server } from 'lucide-react';
import { SCRIPT, type Step } from './agent-console';

// SDK runtime trace — re-skin of the v1 agent console. Each script step is
// rendered as a normalized SDK event row (sdk.subagent.spawn / sdk.tool.call /
// sdk.decision / sdk.pull_request.opened / etc.) with a sandbox header bar
// showing the worker hostname, allowed egress, and token budget.

type Status = 'pending' | 'running' | 'done';

// Map the v1 channel taxonomy onto SDK event-type vocabulary.
type SdkEventKind =
  | 'sdk.run.start'
  | 'sdk.subagent.spawn'
  | 'sdk.tool.call'
  | 'sdk.decision'
  | 'sdk.pull_request.opened'
  | 'sdk.statuspage.update'
  | 'sdk.slack.post'
  | 'sdk.shell.exec'
  | 'sdk.deploy.canary'
  | 'sdk.deploy.promote'
  | 'sdk.metric.record'
  | 'sdk.run.complete';

interface SdkRow {
  kind: SdkEventKind;
  subagent?: 'parent' | 'triage' | 'revert' | 'comms' | 'deploy';
  detail?: string;
  /** Carry the original script step so we keep the underlying timing source */
  step: Step;
  elapsed: number;
  status: Status;
}

const KIND_STYLE: Record<
  SdkEventKind,
  { bg: string; border: string; color: string }
> = {
  'sdk.run.start':           { bg: 'bg-[#82AAFF]/10',  border: 'border-[#82AAFF]/30',  color: 'text-[#82AAFF]' },
  'sdk.subagent.spawn':      { bg: 'bg-[#A259FF]/10',  border: 'border-[#A259FF]/30',  color: 'text-[#C792EA]' },
  'sdk.tool.call':           { bg: 'bg-text-primary/10', border: 'border-text-primary/20', color: 'text-text-primary' },
  'sdk.decision':            { bg: 'bg-accent-green/10', border: 'border-accent-green/25', color: 'text-accent-green' },
  'sdk.pull_request.opened': { bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', color: 'text-accent-blue' },
  'sdk.statuspage.update':   { bg: 'bg-[#3DB46D]/10',  border: 'border-[#3DB46D]/30',  color: 'text-[#3DB46D]' },
  'sdk.slack.post':          { bg: 'bg-[#4A154B]/30',  border: 'border-[#4A154B]/50',  color: 'text-[#E0BFE5]' },
  'sdk.shell.exec':          { bg: 'bg-accent-green/10', border: 'border-accent-green/20', color: 'text-accent-green' },
  'sdk.deploy.canary':       { bg: 'bg-[#FF9900]/10',  border: 'border-[#FF9900]/30',  color: 'text-[#FFB766]' },
  'sdk.deploy.promote':      { bg: 'bg-[#FF9900]/10',  border: 'border-[#FF9900]/30',  color: 'text-[#FFB766]' },
  'sdk.metric.record':       { bg: 'bg-[#06AC38]/10',  border: 'border-[#06AC38]/25',  color: 'text-[#57D990]' },
  'sdk.run.complete':        { bg: 'bg-accent-green/10', border: 'border-accent-green/20', color: 'text-accent-green' },
};

const SUBAGENT_TAG: Record<NonNullable<SdkRow['subagent']>, { color: string; label: string }> = {
  parent: { color: 'text-[#82AAFF]', label: 'parent' },
  triage: { color: 'text-[#C792EA]', label: 'triage' },
  revert: { color: 'text-accent-blue', label: 'revert' },
  comms:  { color: 'text-[#3DB46D]', label: 'comms' },
  deploy: { color: 'text-[#FFB766]', label: 'deploy' },
};

// One mapping function from the legacy step taxonomy to the new SDK shape.
// Centralising this keeps the timing source-of-truth in agent-console.tsx
// while letting the trace evolve independently.
function mapStep(step: Step, idx: number): Pick<SdkRow, 'kind' | 'subagent' | 'detail'> {
  const detail = step.detail;
  switch (step.channel) {
    case 'pagerduty':
      if (idx === 0) return { kind: 'sdk.run.start', subagent: 'parent', detail };
      if (step.label.startsWith('ACK')) return { kind: 'sdk.tool.call', subagent: 'parent', detail };
      if (step.label.startsWith('Marking') || step.label.includes('RESOLVED'))
        return { kind: 'sdk.tool.call', subagent: 'parent', detail };
      if (step.label.startsWith('Posting'))
        return { kind: 'sdk.tool.call', subagent: 'parent', detail };
      return { kind: 'sdk.tool.call', subagent: 'parent', detail };
    case 'datadog':
      return { kind: 'sdk.tool.call', subagent: 'triage', detail };
    case 'github':
      if (step.label.startsWith('Opening pull')) {
        return { kind: 'sdk.pull_request.opened', subagent: 'revert', detail };
      }
      return { kind: 'sdk.tool.call', subagent: 'triage', detail };
    case 'opus':
      if (step.label.startsWith('Decision')) {
        return { kind: 'sdk.decision', subagent: 'triage', detail };
      }
      return { kind: 'sdk.subagent.spawn', subagent: 'triage', detail };
    case 'composer':
      return { kind: 'sdk.subagent.spawn', subagent: 'revert', detail };
    case 'codex':
      return { kind: 'sdk.tool.call', subagent: 'revert', detail };
    case 'shell':
      return { kind: 'sdk.shell.exec', subagent: 'revert', detail };
    case 'deploy':
      if (step.label.startsWith('Promoting'))
        return { kind: 'sdk.deploy.promote', subagent: 'deploy', detail };
      return { kind: 'sdk.deploy.canary', subagent: 'deploy', detail };
    case 'codegen':
      return { kind: 'sdk.tool.call', subagent: 'triage', detail };
    case 'statuspage':
      return { kind: 'sdk.statuspage.update', subagent: 'comms', detail };
    case 'slack':
      return { kind: 'sdk.slack.post', subagent: 'comms', detail };
    case 'jira':
      return { kind: 'sdk.tool.call', subagent: 'comms', detail };
    case 'done':
      return { kind: 'sdk.run.complete', subagent: 'parent', detail };
  }
}

// Each row's "verb-line" — the human-readable label that explains the event
// in product terms. We re-use the existing step.label so the timing/copy
// remain editable in one place.
function verbLine(step: Step, kind: SdkEventKind): string {
  if (kind === 'sdk.run.start') return 'agent.send() — kicking off run';
  if (kind === 'sdk.subagent.spawn') {
    if (step.channel === 'opus') return 'spawn subagent · model=claude-opus-4-thinking';
    if (step.channel === 'composer') return 'spawn subagent · model=composer-2';
    return step.label;
  }
  return step.label;
}

const TIME_SCALE = 12.6; // matches agent-console — keeps the displayed clock identical

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  const totalMs = Math.floor(ms);
  const mins = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds) % 60;
  const millis = totalMs % 1000;
  if (mins > 0) {
    return `+${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `+${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}s`;
}

interface SdkRuntimeTraceProps {
  onComplete?: () => void;
  onStepAdvance?: (stepIdx: number, step: Step) => void;
  onTokenBudgetChange?: (used: number) => void;
}

export function SdkRuntimeTrace({
  onComplete,
  onStepAdvance,
  onTokenBudgetChange,
}: SdkRuntimeTraceProps) {
  const [rows, setRows] = useState<SdkRow[]>([]);
  const [finished, setFinished] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const startRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    SCRIPT.forEach((step, i) => {
      cumulative += step.delayMs;
      const t = setTimeout(() => {
        const elapsed = (performance.now() - startRef.current) * TIME_SCALE;
        const mapped = mapStep(step, i);
        setRows(prev => {
          const updated = prev.map(r => ({ ...r, status: 'done' as Status }));
          return [
            ...updated,
            {
              kind: mapped.kind,
              subagent: mapped.subagent,
              detail: mapped.detail,
              step,
              elapsed,
              status: 'running' as Status,
            },
          ];
        });
        // Token budget — illustrative incremental burn, deterministic per step
        const cost = costForKind(mapped.kind);
        setTokensUsed(prev => {
          const next = prev + cost;
          onTokenBudgetChange?.(next);
          return next;
        });
        onStepAdvance?.(i, step);

        if (i === SCRIPT.length - 1) {
          const done = setTimeout(() => {
            setRows(prev => prev.map(r => ({ ...r, status: 'done' as Status })));
            setFinished(true);
            onComplete?.();
          }, 500);
          timers.push(done);
        }
      }, cumulative);
      timers.push(t);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete, onStepAdvance, onTokenBudgetChange]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rows.length]);

  const elapsedLabel =
    rows.length > 0 ? formatElapsed(rows[rows.length - 1].elapsed) : '+00.000s';

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      {/* Sandbox header bar */}
      <SandboxHeader tokensUsed={tokensUsed} finished={finished} elapsedLabel={elapsedLabel} />

      {/* Stream body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]"
      >
        {rows.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">
            Waiting for PagerDuty webhook on{' '}
            <span className="font-mono text-text-secondary">/api/pagerduty-webhook</span>…
          </p>
        )}
        {rows.map((row, i) => {
          const style = KIND_STYLE[row.kind];
          const isActive = row.status === 'running';
          const tag = row.subagent ? SUBAGENT_TAG[row.subagent] : undefined;

          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'sdkRowFade 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[88px]">
                {formatElapsed(row.elapsed)}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.border} ${style.color} whitespace-nowrap`}
              >
                {row.kind}
              </span>
              {tag && (
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-dark-border bg-dark-bg ${tag.color} whitespace-nowrap`}
                >
                  {tag.label}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  {isActive ? (
                    <span className="inline-block w-3 h-3 mt-0.5 shrink-0">
                      <span className="block w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
                    </span>
                  ) : (
                    <Check className="w-3 h-3 mt-0.5 text-accent-green shrink-0" />
                  )}
                  <span className="text-text-primary break-words">
                    {verbLine(row.step, row.kind)}
                  </span>
                </div>
                {row.detail && (
                  <div className="text-text-tertiary text-[11px] ml-5 mt-0.5 break-words">
                    {row.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes sdkRowFade {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const TOKEN_BUDGET = 50_000;

function SandboxHeader({
  tokensUsed,
  finished,
  elapsedLabel,
}: {
  tokensUsed: number;
  finished: boolean;
  elapsedLabel: string;
}) {
  const pct = Math.min(100, (tokensUsed / TOKEN_BUDGET) * 100);
  return (
    <div className="border-b border-dark-border bg-dark-bg shrink-0">
      {/* Top row — agent identity + elapsed */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">
              @cursor/sdk · run.stream()
            </p>
            <p className="text-[10.5px] text-text-tertiary font-mono truncate">
              <Server className="w-3 h-3 inline -mt-0.5 mr-1 text-text-tertiary" />
              worker-cursor-sdk-7f4d.acme.internal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'
            }`}
          />
          <span className="text-[11px] text-text-tertiary font-mono">{elapsedLabel}</span>
        </div>
      </div>

      {/* Bottom row — sandbox policy + token budget */}
      <div className="flex items-center gap-3 px-4 pb-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
          <Globe2 className="w-3 h-3 text-[#57D990]" />
          <span className="font-mono uppercase tracking-wider">egress allowlist</span>
        </div>
        <ChipPill text="api.pagerduty.com" />
        <ChipPill text="api.datadoghq.com" />
        <ChipPill text="api.github.com" />
        <ChipPill text="status.acme.com" />
        <ChipPill text="hooks.slack.com" />

        <div className="ml-auto flex items-center gap-2 min-w-[180px]">
          <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider shrink-0">
            tokens
          </span>
          <div className="h-1.5 flex-1 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${pct}%`,
                background: pct > 80 ? '#FFB766' : '#57D990',
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-secondary shrink-0">
            {tokensUsed.toLocaleString()} / {TOKEN_BUDGET.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChipPill({ text }: { text: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono border border-[#06AC38]/25 bg-[#06AC38]/8 text-[#57D990]">
      {text}
    </span>
  );
}

// Illustrative per-event cost in tokens. Deterministic, not based on the
// real billing model — purpose is to make the budget bar feel alive.
function costForKind(kind: SdkEventKind): number {
  switch (kind) {
    case 'sdk.run.start':
      return 320;
    case 'sdk.subagent.spawn':
      return 480;
    case 'sdk.tool.call':
      return 240;
    case 'sdk.decision':
      return 920; // long-context Opus thought
    case 'sdk.pull_request.opened':
      return 360;
    case 'sdk.statuspage.update':
      return 180;
    case 'sdk.slack.post':
      return 110;
    case 'sdk.shell.exec':
      return 90;
    case 'sdk.deploy.canary':
      return 140;
    case 'sdk.deploy.promote':
      return 140;
    case 'sdk.metric.record':
      return 60;
    case 'sdk.run.complete':
      return 80;
  }
}
