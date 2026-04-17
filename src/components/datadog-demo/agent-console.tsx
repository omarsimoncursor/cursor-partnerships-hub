'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'datadog'
  | 'pagerduty'
  | 'github'
  | 'jira'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'codegen'
  | 'done';

interface Step {
  channel: Channel;
  label: string;
  detail?: string;
  delayMs: number;
}

const CHANNEL_STYLES: Record<Channel, { label: string; color: string; bg: string; border: string }> = {
  datadog:   { label: 'datadog-mcp',    color: 'text-[#A689D4]',    bg: 'bg-[#632CA6]/15',         border: 'border-[#632CA6]/35' },
  pagerduty: { label: 'pagerduty-mcp',  color: 'text-[#57D990]',    bg: 'bg-[#06AC38]/10',         border: 'border-[#06AC38]/30' },
  github:    { label: 'github-mcp',     color: 'text-text-primary', bg: 'bg-text-primary/10',      border: 'border-text-primary/20' },
  jira:      { label: 'jira-mcp',       color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',         border: 'border-[#4C9AFF]/30' },
  shell:     { label: 'shell',          color: 'text-accent-green', bg: 'bg-accent-green/10',      border: 'border-accent-green/20' },
  opus:      { label: 'opus · triage',  color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',         border: 'border-[#D97757]/30' },
  composer:  { label: 'composer · edit', color: 'text-accent-blue', bg: 'bg-accent-blue/10',       border: 'border-accent-blue/30' },
  codex:     { label: 'codex · review', color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',         border: 'border-[#10a37f]/30' },
  codegen:   { label: 'codegen',        color: 'text-accent-blue',  bg: 'bg-accent-blue/10',       border: 'border-accent-blue/20' },
  done:      { label: 'complete',       color: 'text-accent-green', bg: 'bg-accent-green/10',      border: 'border-accent-green/20' },
};

const SCRIPT: Step[] = [
  // Datadog intake
  { channel: 'datadog',   delayMs: 400,  label: 'Fetching monitor detail',           detail: 'GET /api/v1/monitor/3f12-8a2c · web.request · /api/reports/generate' },
  { channel: 'datadog',   delayMs: 600,  label: 'SLO breach confirmed',              detail: 'P99 7,412ms · target 500ms · 14.8× over budget · burn-rate 12×' },
  { channel: 'datadog',   delayMs: 700,  label: 'Pulling APM trace · 12 spans',      detail: 'trace_id 8b2e19f4c3d74a9f · 6 serial fetchRegionOrders · 6 serial fetchRegionTax' },
  { channel: 'datadog',   delayMs: 500,  label: 'Reading deployment marker',         detail: 'deploy-4412 · 4d ago · commit a4f2e1b' },

  // Incident paging
  { channel: 'pagerduty', delayMs: 500,  label: 'PagerDuty incident INC-8421 ack\u2019d', detail: 'auto-ack by cursor-agent · suppressing page' },
  { channel: 'jira',      delayMs: 700,  label: 'Creating incident ticket',          detail: 'Project: CUR · Type: Incident · Priority: P1 · SLO breach' },
  { channel: 'jira',      delayMs: 500,  label: 'Ticket CUR-4318 created',           detail: 'Linked to Datadog monitor 3f12-8a2c' },

  // Opus triages
  { channel: 'opus',      delayMs: 1000, label: 'Claude Opus: triaging',             detail: 'Model selected for long-context reasoning over trace + code' },
  { channel: 'github',    delayMs: 700,  label: 'Pulling commit history',            detail: 'git log --since=7.days -- src/lib/demo/aggregate-orders.ts' },
  { channel: 'github',    delayMs: 600,  label: 'Regression found: a4f2e1b',         detail: '"feat: add eu + latam regions" · 4 days ago' },
  { channel: 'opus',      delayMs: 1100, label: 'Root-cause hypothesis formed',      detail: 'sequential await chain · 6 regions × 2 calls · O(n) blocking, parallelism safe' },
  { channel: 'codegen',   delayMs: 900,  label: 'Generating triage report',          detail: 'docs/triage/2026-04-16-slo-breach-aggregate-orders.md' },

  // Composer writes
  { channel: 'composer',  delayMs: 1100, label: 'Composer: writing the patch',       detail: 'Model selected for speed on scoped edits' },
  { channel: 'shell',     delayMs: 500,  label: 'Reading aggregate-orders.ts',       detail: '1 file · 18 lines loaded' },
  { channel: 'composer',  delayMs: 900,  label: 'Replaced for-loop with Promise.all', detail: 'const results = await Promise.all(REGIONS.map(fetchRegionSummary))' },
  { channel: 'composer',  delayMs: 900,  label: 'Added fetchRegionSummary helper',    detail: 'parallelizes inner orders + tax fetch per region' },

  // Codex reviews
  { channel: 'codex',     delayMs: 1100, label: 'Codex: reviewing patch before PR',  detail: 'Model selected for code review depth' },
  { channel: 'codex',     delayMs: 800,  label: 'No behavioral change',              detail: 'same output shape · same types · same callers' },
  { channel: 'codex',     delayMs: 700,  label: 'Style + lint review: ✓',            detail: 'matches existing project conventions' },

  // Verification
  { channel: 'shell',     delayMs: 700,  label: 'npx tsc --noEmit',                  detail: '✓ no type errors' },
  { channel: 'shell',     delayMs: 800,  label: 'Starting dev server',               detail: '▲ Next.js 16.1.6 — ready in 584ms' },
  { channel: 'shell',     delayMs: 900,  label: 'curl -w "%{time_total}" /api/reports/generate', detail: '0.612s · ✓ well under 500ms SLO target' },
  { channel: 'shell',     delayMs: 500,  label: 'Baseline comparison',               detail: '7.41s → 0.61s · 12.1× faster · 8.1× under SLO' },

  // PR submission
  { channel: 'github',    delayMs: 600,  label: 'Creating branch fix/parallelize-region-aggregation', detail: 'base: main' },
  { channel: 'github',    delayMs: 600,  label: 'Committing & pushing',              detail: '1 file changed · +18 −11 · signed-off-by: cursor-agent' },
  { channel: 'github',    delayMs: 800,  label: 'Opening pull request #157',         detail: 'perf: parallelize region aggregation (12× faster, resolves P1 SLO breach)' },
  { channel: 'jira',      delayMs: 500,  label: 'CUR-4318 → In Review',              detail: 'PR #157 linked to ticket · PagerDuty incident resolved' },
  { channel: 'done',      delayMs: 500,  label: 'Artifacts ready for review',        detail: 'Datadog trace · Triage report · Jira ticket · Pull request' },
];

interface AgentConsoleProps {
  onComplete?: () => void;
}

// Real playback ~19.5s; displayed timestamps scale to ~2m 15s of agent work.
const TIME_SCALE = 6.9;

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

export function AgentConsole({ onComplete }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<Array<Step & { elapsed: number; status: Status }>>([]);
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
  }, [onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps.length]);

  const durationLabel = visibleSteps.length > 0
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
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">Cursor Background Agent</p>
            <p className="text-[11px] text-text-tertiary font-mono">cursor/partnerships-hub · main</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'}`} />
          <span className="text-[11px] text-text-tertiary font-mono">{durationLabel}</span>
        </div>
      </div>

      {/* Console body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]">
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Datadog webhook…</p>
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
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
