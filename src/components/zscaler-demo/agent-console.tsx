'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';

type Status = 'pending' | 'running' | 'done';

type Channel =
  | 'zscaler'
  | 'okta'
  | 'github'
  | 'jira'
  | 'shell'
  | 'terraform'
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

const CHANNEL_STYLES: Record<
  Channel,
  { label: string; color: string; bg: string; border: string }
> = {
  zscaler:   { label: 'zscaler-mcp',     color: 'text-[#65B5F2]',    bg: 'bg-[#0079D5]/15',    border: 'border-[#0079D5]/35' },
  okta:      { label: 'okta-mcp',        color: 'text-[#5BB7E2]',    bg: 'bg-[#007DC1]/10',    border: 'border-[#007DC1]/30' },
  github:    { label: 'github-mcp',      color: 'text-text-primary', bg: 'bg-text-primary/10', border: 'border-text-primary/20' },
  jira:      { label: 'jira-mcp',        color: 'text-[#4C9AFF]',    bg: 'bg-[#0052CC]/15',    border: 'border-[#4C9AFF]/30' },
  shell:     { label: 'shell',           color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  terraform: { label: 'terraform',       color: 'text-[#7B42BC]',    bg: 'bg-[#7B42BC]/10',    border: 'border-[#7B42BC]/30' },
  opus:      { label: 'opus · triage',   color: 'text-[#D97757]',    bg: 'bg-[#D97757]/10',    border: 'border-[#D97757]/30' },
  composer:  { label: 'composer · edit', color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/30' },
  codex:     { label: 'codex · review',  color: 'text-[#10a37f]',    bg: 'bg-[#10a37f]/10',    border: 'border-[#10a37f]/30' },
  codegen:   { label: 'codegen',         color: 'text-accent-blue',  bg: 'bg-accent-blue/10',  border: 'border-accent-blue/20' },
  done:      { label: 'complete',        color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
};

const SCRIPT: Step[] = [
  // Zscaler intake
  { channel: 'zscaler',   delayMs: 400,  label: 'Fetching ZPA risk event evt-21794',           detail: 'segment workforce-admin-audit-logs · severity Critical (92/100)' },
  { channel: 'zscaler',   delayMs: 600,  label: 'ZIA web log slice (last 60m)',                detail: '312 hits · 4 unmanaged-device sessions · 51 unique users with employee role' },
  { channel: 'zscaler',   delayMs: 600,  label: 'Scope vs intent diff',                        detail: '4,287 users in scope · least-privilege intent 18 · 238x over scope' },
  { channel: 'zscaler',   delayMs: 500,  label: 'Cross-referencing IaC owner',                 detail: 'segment marker → terraform-managed · module: infrastructure/zscaler' },

  // Identity context
  { channel: 'okta',      delayMs: 600,  label: 'Resolving SCIM groups for least-privilege',   detail: 'security-admin (12) + compliance-officer (6) = 18 users' },

  // Incident management
  { channel: 'jira',      delayMs: 600,  label: 'Creating security incident ticket',           detail: 'Project: CUR · Type: Sec-Incident · Priority: Sec-P1 · Zero Trust' },
  { channel: 'jira',      delayMs: 500,  label: 'Ticket CUR-5712 created',                     detail: 'Linked to Zscaler risk evt-21794' },

  // Opus triages
  { channel: 'opus',      delayMs: 1000, label: 'Claude Opus: triaging',                       detail: 'long-context reasoning over .tf module + Okta claims + ZPA event' },
  { channel: 'github',    delayMs: 700,  label: 'git log infrastructure/zscaler/',             detail: '--since=14.days · author + message + file scope' },
  { channel: 'github',    delayMs: 600,  label: 'Regression found: b7c91d2',                   detail: '"wip: open audit logs for QA" · 3 days ago · qa-bot · widened conditions' },
  { channel: 'opus',      delayMs: 1100, label: 'Root cause hypothesis',                       detail: 'rule has APP condition only · SCIM_GROUP / POSTURE / TRUSTED_NETWORK / CLIENT_TYPE missing' },
  { channel: 'codegen',   delayMs: 900,  label: 'Generating triage report',                    detail: 'docs/triage/2026-04-23-zerotrust-violation-workforce-admin.md' },

  // Composer writes the .tf
  { channel: 'composer',  delayMs: 1100, label: 'Composer: editing the policy',                detail: 'opening infrastructure/zscaler/workforce-admin.tf' },
  { channel: 'shell',     delayMs: 500,  label: 'cat workforce-admin.tf',                      detail: '38 lines · 2 resources · 1 conditions block (APP only)' },
  { channel: 'composer',  delayMs: 900,  label: 'Adding SCIM_GROUP condition',                 detail: 'security-admin OR compliance-officer · resolved via data sources' },
  { channel: 'composer',  delayMs: 800,  label: 'Adding POSTURE condition',                    detail: 'managed-compliant-corp posture profile · rhs = "true"' },
  { channel: 'composer',  delayMs: 800,  label: 'Adding TRUSTED_NETWORK condition',            detail: 'corp-egress trusted network · rhs = "true"' },
  { channel: 'composer',  delayMs: 700,  label: 'Adding CLIENT_TYPE condition',                detail: 'zpn_client_type_zapp only · blocks browser/exporter clients' },

  // Codex reviews
  { channel: 'codex',     delayMs: 1100, label: 'Codex: reviewing the diff',                   detail: 'least-privilege check · no resource recreation · operator AND across blocks' },
  { channel: 'codex',     delayMs: 800,  label: 'No destructive plan changes',                 detail: 'app segment unchanged · only conditions added · no resource ids change' },
  { channel: 'codex',     delayMs: 700,  label: 'Style + provider conventions: ✓',             detail: 'matches infrastructure/zscaler/* idioms' },

  // Verification
  { channel: 'shell',     delayMs: 600,  label: 'terraform fmt -check',                        detail: '✓ no formatting changes' },
  { channel: 'terraform', delayMs: 800,  label: 'terraform validate',                          detail: '✓ Success! The configuration is valid.' },
  { channel: 'terraform', delayMs: 1100, label: 'terraform plan -out=tfplan',                  detail: '~ 1 to change · 0 to destroy · 0 to add · zero blast on app segment' },
  { channel: 'terraform', delayMs: 700,  label: 'tfsec + checkov · IaC linters',               detail: 'AVD-ZPA-001 (broad scope) → resolved · 0 high · 0 medium' },
  { channel: 'shell',     delayMs: 900,  label: 'Replaying conformance probe (4 reqs)',        detail: 'sec-admin/compliant ✓ · sec-admin/noncompliant ✗ · employee/compliant ✗ · anon/unmanaged ✗' },
  { channel: 'shell',     delayMs: 500,  label: 'Scope recompute',                             detail: '4,287 → 18 users · 238.2x narrower · 0 unmanaged-device paths' },

  // PR submission
  { channel: 'github',    delayMs: 600,  label: 'Creating branch sec/scope-down-workforce-admin-zpa', detail: 'base: main' },
  { channel: 'github',    delayMs: 600,  label: 'Committing & pushing',                        detail: '1 file changed · +24 −1 · signed-off-by: cursor-agent · plan attached' },
  { channel: 'github',    delayMs: 800,  label: 'Opening pull request #213',                   detail: 'sec(zpa): scope down workforce-admin-audit-logs ALLOW rule (4,287 → 18)' },
  { channel: 'jira',      delayMs: 500,  label: 'CUR-5712 → In Review',                        detail: 'PR #213 + tfplan + ZPA risk evt-21794 cross-referenced' },
  { channel: 'done',      delayMs: 500,  label: 'Artifacts ready for review',                  detail: 'Zscaler ZPA console · Triage report · Jira ticket · Pull request' },
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
              cursor/partnerships-hub · main
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'
            }`}
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
          <p className="text-text-tertiary italic px-1 py-2">Waiting for Zscaler webhook…</p>
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
