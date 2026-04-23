'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'snyk'
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
  snyk:      { label: 'snyk-mcp',        color: 'text-[#9F98FF]',    bg: 'bg-[#4C44CB]/15',    border: 'border-[#4C44CB]/35' },
  github:    { label: 'github-mcp',      color: 'text-text-primary', bg: 'bg-text-primary/10', border: 'border-text-primary/20' },
  jira:      { label: 'jira-mcp',        color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',    border: 'border-[#4C9AFF]/30' },
  shell:     { label: 'shell',           color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  opus:      { label: 'opus · triage',   color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',    border: 'border-[#D97757]/30' },
  composer:  { label: 'composer · edit', color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/30' },
  codex:     { label: 'codex · review',  color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',    border: 'border-[#10a37f]/30' },
  codegen:   { label: 'codegen',         color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/20' },
  done:      { label: 'complete',        color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
};

const SCRIPT: Step[] = [
  // Snyk intake
  { channel: 'snyk',     delayMs: 400,  label: 'Fetching Snyk project',                detail: 'org cursor-demos · project cursor-for-enterprise · branch main' },
  { channel: 'snyk',     delayMs: 600,  label: 'Critical confirmed: SNYK-JS-CUSTOMER-PROFILE-001', detail: 'NoSQL injection · CWE-943 · CVSS 9.8 · OWASP A03:2021' },
  { channel: 'snyk',     delayMs: 700,  label: 'Pulling data flow · 5 hops',          detail: 'request.query.username → ProfileQuery → string-interpolated selector → Mongo predicate' },
  { channel: 'snyk',     delayMs: 500,  label: 'Companion finding (Snyk Open Source)', detail: 'mongoose@5.13.7 · prototype pollution · CVSS 7.5 · fix 5.13.20' },
  { channel: 'snyk',     delayMs: 400,  label: 'Fetching Snyk fix advisory',          detail: 'parameterize selector · allowlist-based input validation · constant-time compare' },

  // Jira ticket
  { channel: 'jira',     delayMs: 700,  label: 'Creating security ticket',            detail: 'Project: CUR · Type: Security · Priority: P1 · Critical' },
  { channel: 'jira',     delayMs: 500,  label: 'Ticket CUR-7841 created',             detail: 'Linked to Snyk project + both findings · channel #appsec-incidents notified' },

  // Opus triage
  { channel: 'opus',     delayMs: 1000, label: 'Claude Opus: triaging',               detail: 'Model selected for long-context taint reasoning across advisory + code' },
  { channel: 'github',   delayMs: 700,  label: 'Pulling commit history',              detail: 'git log -- src/lib/demo/customer-profile.ts package.json' },
  { channel: 'github',   delayMs: 600,  label: 'Regression found: 5e9d3c2',           detail: '"feat: add internal customer lookup" · 11 days ago · author marcus.a' },
  { channel: 'opus',     delayMs: 1100, label: 'Root-cause hypothesis formed',        detail: 'tainted-input string concat into selector · predicate collapses to always-true' },
  { channel: 'codegen',  delayMs: 900,  label: 'Generating triage report',            detail: 'docs/triage/2026-04-16-snyk-customer-profile.md' },

  // Composer writes
  { channel: 'composer', delayMs: 1000, label: 'Composer: writing the patch',         detail: 'Model selected for speed on scoped security edits' },
  { channel: 'shell',    delayMs: 500,  label: 'Reading customer-profile.ts',         detail: '1 file · 26 lines loaded' },
  { channel: 'composer', delayMs: 900,  label: 'Parameterized the selector',          detail: 'pass username as a value, not a string interpolation, in parseSelector' },
  { channel: 'composer', delayMs: 800,  label: 'Added allowlist + ValidationError',   detail: '/^[a-zA-Z0-9_.-]{1,64}$/ · throw on miss · typed error class' },
  { channel: 'composer', delayMs: 700,  label: 'Bumped mongoose 5.13.7 → 5.13.20',    detail: 'package.json + package-lock.json · resolves SNYK-JS-MONGOOSE-2961688' },

  // Codex reviews
  { channel: 'codex',    delayMs: 1100, label: 'Codex: reviewing patch before PR',    detail: 'Model selected for code review depth on security-sensitive edits' },
  { channel: 'codex',    delayMs: 800,  label: 'No behavior change for valid input',  detail: 'same return shape · 12 unit tests still pass · contract preserved' },
  { channel: 'codex',    delayMs: 700,  label: 'Style + lint review: ✓',              detail: 'matches existing project conventions' },

  // Verification
  { channel: 'shell',    delayMs: 700,  label: 'npx tsc --noEmit',                    detail: '✓ no type errors' },
  { channel: 'shell',    delayMs: 700,  label: 'npm run lint',                        detail: '✓ 0 problems · eslint-plugin-security clean' },
  { channel: 'shell',    delayMs: 800,  label: 'npx vitest run customer-profile',    detail: '✓ 11 passed · 1 new (rejects injection payload with ValidationError)' },
  { channel: 'shell',    delayMs: 900,  label: 'node scripts/reproduce-snyk-injection.mjs', detail: 'before: 12 leaked rows · after: 0 leaked rows · ValidationError thrown' },
  { channel: 'shell',    delayMs: 700,  label: 'snyk test --severity-threshold=medium', detail: '✓ 0 critical · 0 high · 0 medium · 2 low (informational)' },

  // PR submission
  { channel: 'github',   delayMs: 600,  label: 'Creating branch security/patch-customer-profile-injection', detail: 'base: main' },
  { channel: 'github',   delayMs: 600,  label: 'Committing & pushing',                detail: '2 files changed · +34 −7 · signed-off-by: cursor-agent' },
  { channel: 'github',   delayMs: 800,  label: 'Opening pull request #214',           detail: 'security: parameterize customer profile lookup + bump mongoose' },
  { channel: 'jira',     delayMs: 500,  label: 'CUR-7841 → In Review',                detail: 'PR #214 linked · Snyk findings cleared at the medium threshold' },
  { channel: 'done',     delayMs: 500,  label: 'Artifacts ready for review',          detail: 'Snyk issue · Triage report · Jira ticket · Pull request' },
];

interface AgentConsoleProps {
  onComplete?: () => void;
}

// Real playback ~21s; displayed timestamps scale to ~2m of agent work.
const TIME_SCALE = 6.4;

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

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]">
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Snyk webhook…</p>
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
