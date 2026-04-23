'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

export type Channel =
  | 'pagerduty'
  | 'datadog'
  | 'github'
  | 'statuspage'
  | 'slack'
  | 'deploy'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'codegen'
  | 'jira'
  | 'done';

export interface Step {
  channel: Channel;
  label: string;
  detail?: string;
  delayMs: number;
  // Optional event mirrored to the live PagerDuty timeline (left panel).
  // Shape: { kind: 'ack'|'note'|'resolved', text: string, displayTime: string }
  pdEvent?: PdEvent;
}

export interface PdEvent {
  kind: 'triggered' | 'ack' | 'note' | 'resolved';
  title: string;
  detail?: string;
  // Display timestamp shown in the timeline (matches the displayed clock)
  displayTime: string;
}

const CHANNEL_STYLES: Record<
  Channel,
  { label: string; color: string; bg: string; border: string }
> = {
  pagerduty:  { label: 'pagerduty-mcp',  color: 'text-[#57D990]',    bg: 'bg-[#06AC38]/10',         border: 'border-[#06AC38]/30' },
  datadog:    { label: 'datadog-mcp',    color: 'text-[#A689D4]',    bg: 'bg-[#632CA6]/15',         border: 'border-[#632CA6]/35' },
  github:     { label: 'github-mcp',     color: 'text-text-primary', bg: 'bg-text-primary/10',      border: 'border-text-primary/20' },
  statuspage: { label: 'statuspage-mcp', color: 'text-[#3DB46D]',    bg: 'bg-[#3DB46D]/10',         border: 'border-[#3DB46D]/30' },
  slack:      { label: 'slack-mcp',      color: 'text-[#E0BFE5]',    bg: 'bg-[#4A154B]/30',         border: 'border-[#4A154B]/50' },
  deploy:     { label: 'deploy-mcp',     color: 'text-[#FFB766]',    bg: 'bg-[#FF9900]/10',         border: 'border-[#FF9900]/30' },
  shell:      { label: 'shell',          color: 'text-accent-green', bg: 'bg-accent-green/10',      border: 'border-accent-green/20' },
  opus:       { label: 'opus · triage',  color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',         border: 'border-[#D97757]/30' },
  composer:   { label: 'composer · revert', color: 'text-accent-blue', bg: 'bg-accent-blue/10',     border: 'border-accent-blue/30' },
  codex:      { label: 'codex · review', color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',         border: 'border-[#10a37f]/30' },
  codegen:    { label: 'codegen',        color: 'text-accent-blue',  bg: 'bg-accent-blue/10',       border: 'border-accent-blue/20' },
  jira:       { label: 'jira-mcp',       color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',         border: 'border-[#4C9AFF]/30' },
  done:       { label: 'complete',       color: 'text-accent-green', bg: 'bg-accent-green/10',      border: 'border-accent-green/20' },
};

// 28 channel-coded steps. Real wall-time totals ~20s; displayed clock scales
// to ~4 minutes (03:14:22 → 03:18:34) via TIME_SCALE.
export const SCRIPT: Step[] = [
  // 1. Intake — webhook + ack
  { channel: 'pagerduty', delayMs: 500, label: 'Webhook received',
    detail: 'incident.trigger · INC-21487 · payments-api 5xx burst' },
  { channel: 'pagerduty', delayMs: 600, label: 'Fetching incident detail',
    detail: 'GET /incidents/INC-21487 · alert payload · escalation policy' },
  { channel: 'pagerduty', delayMs: 500, label: 'Reading escalation policy',
    detail: 'Payments-Pri · 3 levels · primary Alex Chen (paged in 47s)' },
  { channel: 'pagerduty', delayMs: 700, label: 'ACK incident — page suppressed',
    detail: 'cursor-agent acknowledged · alex chen.phone NOT rung',
    pdEvent: { kind: 'ack', title: 'ACKNOWLEDGED by cursor-agent', detail: '12s after trigger · phone never rang', displayTime: '03:14:34' } },

  // 2. Correlate signal (Datadog)
  { channel: 'pagerduty', delayMs: 400, label: 'Posting initial NOTE',
    detail: '"Triaging via Datadog APM + GitHub commit history"',
    pdEvent: { kind: 'note', title: 'NOTE · Triaging via Datadog APM + GitHub history', displayTime: '03:14:38' } },
  { channel: 'datadog',   delayMs: 700, label: 'Correlating alert source',
    detail: 'datadog monitor #42971 · payments-api 5xx · 7.4% (>5% threshold)' },
  { channel: 'datadog',   delayMs: 700, label: 'Pulling APM trace for /payments/charge',
    detail: 'trace_id 9c1e447d2b8f3a55 · 5xx burst started at 03:14:18' },
  { channel: 'datadog',   delayMs: 500, label: 'Reading deployment marker',
    detail: 'deploy v1.43.0 promoted at 03:13:51 · 27s before alert' },

  // 3. Regression hunt (GitHub)
  { channel: 'opus',      delayMs: 1100, label: 'Claude Opus: triaging',
    detail: 'Model selected for long-context reasoning over alert + commits + change log' },
  { channel: 'github',    delayMs: 700, label: 'Pulling commit history',
    detail: 'git log v1.42.1..v1.43.0 -- src/lib/payments/' },
  { channel: 'github',    delayMs: 600, label: 'Single change found: a4f2e1b',
    detail: '"feat: bank-transfer support" · src/lib/payments/transfer.ts (+218 −4)' },

  // 4. Decision
  { channel: 'opus',      delayMs: 1100, label: 'Decision: revert (confidence 0.93)',
    detail: 'Forward fix would require schema migration. Revert is mechanical and reversible.',
    pdEvent: { kind: 'note', title: 'NOTE · Decision: revert v1.43.0 (confidence 0.93)', detail: 'forward fix needs schema migration · revert is mechanical', displayTime: '03:15:48' } },
  { channel: 'codegen',   delayMs: 700, label: 'Drafting postmortem skeleton',
    detail: 'docs/postmortems/2026-04-23-INC-21487.md' },

  // 5. Composer — revert
  { channel: 'composer',  delayMs: 1100, label: 'Composer: generating revert',
    detail: 'git revert a4f2e1b · branch revert/v1.43.0-bank-transfer' },
  { channel: 'shell',     delayMs: 500, label: 'Inspecting diff',
    detail: '1 file · −218 +4 · pure subtraction · no semver bump' },

  // 6. Codex — review
  { channel: 'codex',     delayMs: 1000, label: 'Codex: reviewing the revert',
    detail: 'Model selected for code-review depth' },
  { channel: 'codex',     delayMs: 700, label: 'Verified subtractive · safe to ship',
    detail: 'no unrelated files touched · types unchanged · no migrations' },

  // 7. Shell verify
  { channel: 'shell',     delayMs: 600, label: 'npx tsc --noEmit',
    detail: '✓ no type errors' },
  { channel: 'shell',     delayMs: 600, label: 'npm test -- payments',
    detail: '✓ 84 passed · 0 failed · 0 skipped' },

  // 8. Open PR
  { channel: 'github',    delayMs: 700, label: 'Opening pull request #318',
    detail: 'revert: roll back v1.43.0 (resolves INC-21487)',
    pdEvent: { kind: 'note', title: 'NOTE · Revert PR #318 opened, deploying', displayTime: '03:16:11' } },

  // 9. Deploy through canary
  { channel: 'deploy',    delayMs: 700, label: 'Pushing branch · CI green',
    detail: 'typecheck ✓ · lint ✓ · unit ✓ · perf-suite ✓' },
  { channel: 'deploy',    delayMs: 800, label: 'Canary 5% · us-west-2',
    detail: '2/2 pods on revert · 5xx 0.0% · p99 118ms' },
  { channel: 'deploy',    delayMs: 700, label: 'SLO gate · check passing',
    detail: 'error rate 0.0% < 0.5% threshold · 60s sustained',
    pdEvent: { kind: 'note', title: 'NOTE · Canary green · promoting to 100%', displayTime: '03:17:54' } },
  { channel: 'deploy',    delayMs: 700, label: 'Promoting to 100%',
    detail: 'fleet-wide · 18/18 pods on revert · v1.42.1 restored' },

  // 10. Communicate
  { channel: 'statuspage',delayMs: 600, label: 'Posting Statuspage update',
    detail: '"Investigating" → "Identified" → "Resolved" · 3 updates · public' },
  { channel: 'slack',     delayMs: 500, label: 'Posting #ops summary',
    detail: '"INC-21487 auto-resolved · revert v1.43.0 · 0 humans paged"' },
  { channel: 'jira',      delayMs: 500, label: 'PAY-2204 → Done',
    detail: 'Linked PR #318 · PD INC-21487 · postmortem doc' },

  // 11. Resolve incident
  { channel: 'pagerduty', delayMs: 700, label: 'Marking INC-21487 RESOLVED',
    detail: '4m 12s total · SLO inside budget for 2 min · safe to close',
    pdEvent: { kind: 'resolved', title: 'RESOLVED by cursor-agent', detail: '4m 12s total · 0 humans paged', displayTime: '03:18:34' } },
  { channel: 'done',      delayMs: 500, label: 'Artifacts ready for review',
    detail: 'PD incident · Statuspage · Revert PR · Postmortem' },
];

interface AgentConsoleProps {
  onComplete?: () => void;
  onStepAdvance?: (stepIdx: number, step: Step) => void;
}

// Real playback ~20s; displayed clock advances to ~4m through TIME_SCALE.
const TIME_SCALE = 12.6;

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

export function AgentConsole({ onComplete, onStepAdvance }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<
    Array<Step & { elapsed: number; status: Status }>
  >([]);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    SCRIPT.forEach((step, i) => {
      cumulative += step.delayMs;
      const t = setTimeout(() => {
        const elapsed = (performance.now() - startRef.current) * TIME_SCALE;
        setVisibleSteps(prev => {
          const updated = prev.map(s => ({ ...s, status: 'done' as Status }));
          return [...updated, { ...step, elapsed, status: 'running' as Status }];
        });
        onStepAdvance?.(i, step);

        if (i === SCRIPT.length - 1) {
          const done = setTimeout(() => {
            setVisibleSteps(prev => prev.map(s => ({ ...s, status: 'done' as Status })));
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
  }, [onComplete, onStepAdvance]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps.length]);

  const durationLabel =
    visibleSteps.length > 0
      ? formatElapsed(visibleSteps[visibleSteps.length - 1].elapsed)
      : '+00.000s';

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">
              Cursor Background Agent
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              cursor/partnerships-hub · main · auto-pilot
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'}`}
          />
          <span className="text-[11px] text-text-tertiary font-mono">{durationLabel}</span>
        </div>
      </div>

      {/* Console body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]"
      >
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">
            Waiting for PagerDuty webhook…
          </p>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'agentFadeIn 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[88px]">
                {formatElapsed(step.elapsed)}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.border} ${style.color} whitespace-nowrap`}
              >
                {style.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  {isActive ? (
                    <span className="inline-block w-3 h-3 mt-0.5 shrink-0">
                      <span className="block w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
                    </span>
                  ) : (
                    <Check className="w-3 h-3 mt-0.5 text-accent-green shrink-0" />
                  )}
                  <span className="text-text-primary break-words">{step.label}</span>
                </div>
                {step.detail && (
                  <div className="text-text-tertiary text-[11px] ml-5 mt-0.5 break-words">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes agentFadeIn {
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
