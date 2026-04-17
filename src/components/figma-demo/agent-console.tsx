'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'figma'
  | 'designmode'
  | 'github'
  | 'jira'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex'
  | 'visual'
  | 'codegen'
  | 'done';

interface Step {
  channel: Channel;
  label: string;
  detail?: string;
  delayMs: number;
}

const CHANNEL_STYLES: Record<Channel, { label: string; color: string; bg: string; border: string }> = {
  figma:      { label: 'figma-mcp',         color: 'text-[#D6BBFF]',    bg: 'bg-[#A259FF]/15',     border: 'border-[#A259FF]/35' },
  designmode: { label: 'cursor · design',   color: 'text-[#B591FF]',    bg: 'bg-[#B591FF]/10',     border: 'border-[#B591FF]/30' },
  github:     { label: 'github-mcp',        color: 'text-text-primary', bg: 'bg-text-primary/10',  border: 'border-text-primary/20' },
  jira:       { label: 'jira-mcp',          color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',     border: 'border-[#4C9AFF]/30' },
  shell:      { label: 'shell',             color: 'text-accent-green', bg: 'bg-accent-green/10',  border: 'border-accent-green/20' },
  opus:       { label: 'opus · triage',     color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',     border: 'border-[#D97757]/30' },
  composer:   { label: 'composer · edit',   color: 'text-accent-blue',  bg: 'bg-accent-blue/10',   border: 'border-accent-blue/30' },
  codex:      { label: 'codex · review',    color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',     border: 'border-[#10a37f]/30' },
  visual:     { label: 'visual-regression', color: 'text-accent-amber', bg: 'bg-accent-amber/10',  border: 'border-accent-amber/25' },
  codegen:    { label: 'codegen',           color: 'text-accent-blue',  bg: 'bg-accent-blue/10',   border: 'border-accent-blue/20' },
  done:       { label: 'complete',          color: 'text-accent-green', bg: 'bg-accent-green/10',  border: 'border-accent-green/20' },
};

/**
 * The script plays back in ~19s of real time for demo pacing, but the
 * displayed timestamps are scaled to reflect realistic agent work time
 * (~2m 10s of MCP round-trips, model inference, and shell commands).
 *
 * Determinism is non-negotiable: same SCRIPT, same delays, every run.
 */
const SCRIPT: Step[] = [
  // Figma intake
  { channel: 'figma',      delayMs: 400,  label: 'Connecting to Figma file',           detail: 'GET /v1/files/zk2N…M9pq' },
  { channel: 'figma',      delayMs: 700,  label: 'Loaded component ProductCard@2.3',   detail: 'frame: Marketing/Shop/ProductCard@2.3 · 1 instance · 14 dependents' },
  { channel: 'figma',      delayMs: 700,  label: 'Reading variable collection',        detail: 'design-system/tokens@v2.3 · 32 variables · 4 modes' },
  { channel: 'figma',      delayMs: 800,  label: 'Diff: 4 violations vs token usage',  detail: 'radius/md −4px · space/6 −4px · font.title +100/−1 · color/brand/accent ΔE 6.2' },

  // Jira ticket
  { channel: 'jira',       delayMs: 600,  label: 'Creating design-QA ticket',          detail: 'Project: CUR · Type: Design QA · Priority: P2 · Component: UI/Storefront' },
  { channel: 'jira',       delayMs: 500,  label: 'Ticket CUR-4409 created',            detail: 'Linked to Figma file zk2N…M9pq · ProductCard@2.3' },

  // Opus triage + regression hunt
  { channel: 'opus',       delayMs: 1000, label: 'Claude Opus: triaging drift',        detail: 'Model selected for long-context reasoning over Figma variables + React tree' },
  { channel: 'github',     delayMs: 700,  label: 'Pulling commit history',             detail: 'git log --since=14.days -- src/components/figma-demo/product-card-drifted.tsx' },
  { channel: 'github',     delayMs: 600,  label: 'Regression found: 3ef91a2',          detail: '"revert: product card restyle" · 3 days ago · re-introduced hardcoded literals' },
  { channel: 'opus',       delayMs: 1000, label: 'Root cause confirmed',               detail: 'Token references replaced with literals during a partial revert · 1 file · 4 sites' },

  // Optional Cursor Design Mode preview
  { channel: 'designmode', delayMs: 900,  label: 'Cursor Design Mode: rendering pins', detail: 'Live preview · 4 numbered annotations bound to violation set' },

  // Triage report
  { channel: 'codegen',    delayMs: 800,  label: 'Generating triage report',           detail: 'docs/triage/2026-04-16-design-drift-product-card.md' },

  // Composer token-only edit
  { channel: 'composer',   delayMs: 1000, label: 'Composer: token substitution',       detail: 'Reading product-card-drifted.tsx + design-tokens.ts' },
  { channel: 'composer',   delayMs: 800,  label: 'Replacing hardcoded literals',       detail: '12 → tokens.radius.button · 16 → tokens.radius.card · 20 → tokens.space.cardPadding' },
  { channel: 'composer',   delayMs: 800,  label: 'Patching title + CTA',               detail: '17/700 → tokens.font.titleSize / titleWeight · #9A4FFF → tokens.color.brandAccent' },
  { channel: 'composer',   delayMs: 600,  label: 'Patch summary',                      detail: '1 file changed · +7 −7 · token-only · no semantic edits' },

  // Codex review
  { channel: 'codex',      delayMs: 1000, label: 'Codex: reviewing patch before PR',   detail: 'Model selected for code review depth + a11y checks' },
  { channel: 'codex',      delayMs: 700,  label: 'No type or behavior change',         detail: 'props unchanged · render tree unchanged · layout unchanged' },
  { channel: 'codex',      delayMs: 700,  label: 'WCAG contrast verified',             detail: 'CTA on surface  4.17:1 → 4.63:1 · price ΔE 0.2 · AA ✓' },

  // Static + visual verification
  { channel: 'shell',      delayMs: 600,  label: 'npx tsc --noEmit',                   detail: '✓ no type errors' },
  { channel: 'shell',      delayMs: 600,  label: 'npm run lint',                       detail: '✓ no lint warnings' },
  { channel: 'visual',     delayMs: 900,  label: 'Visual regression sweep',            detail: 'Comparing against Figma frame · 4 anchor points' },
  { channel: 'visual',     delayMs: 700,  label: 'Pixel diff: 4 → 0',                  detail: 'Mean ΔE 5.4 → 0.2 · match: 100% · zero variance across 1×/2× DPR' },

  // PR submission
  { channel: 'github',     delayMs: 600,  label: 'Branch fix/product-card-token-drift', detail: 'base: main' },
  { channel: 'github',     delayMs: 600,  label: 'Committing & pushing',               detail: '1 file changed · +7 −7 · signed-off-by: cursor-agent' },
  { channel: 'github',     delayMs: 800,  label: 'Opening pull request #163',          detail: 'fix(ui): restore token references on ProductCard v2.3 (100% Figma match)' },
  { channel: 'jira',       delayMs: 500,  label: 'CUR-4409 → In Review',               detail: 'PR #163 + Figma file linked · awaiting reviewer' },
  { channel: 'done',       delayMs: 500,  label: 'Artifacts ready for review',         detail: 'Figma file · Triage report · Jira ticket · Pull request' },
];

interface AgentConsoleProps {
  onComplete?: () => void;
}

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
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center border"
            style={{
              background: 'rgba(162,89,255,0.10)',
              borderColor: 'rgba(162,89,255,0.30)',
            }}
          >
            <Bot className="w-3.5 h-3.5" style={{ color: '#A259FF' }} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">Cursor Background Agent</p>
            <p className="text-[11px] text-text-tertiary font-mono">cursor/partnerships-hub · main</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${finished ? 'bg-accent-green' : 'bg-[#F5A623] animate-pulse'}`} />
          <span className="text-[11px] text-text-tertiary font-mono">{durationLabel}</span>
        </div>
      </div>

      {/* Console body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[320px]">
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Figma webhook…</p>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'figmaAgentFadeIn 0.2s ease-out' }}
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
                      <span className="block w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
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
        @keyframes figmaAgentFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
