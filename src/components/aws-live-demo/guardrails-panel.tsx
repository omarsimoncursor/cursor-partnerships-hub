'use client';

import { Shield, Lock, CheckCircle2, UserCheck, BookOpen } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: Lock,
    label: 'IAM least-privilege by default',
    detail:
      'Emitted CDK stacks scope every action to a specific ARN. No `*` resources. No `iam:*`. Codex audits before the PR opens.',
  },
  {
    icon: CheckCircle2,
    label: 'No public data plane',
    detail:
      'Aurora endpoints stay private. Secrets live in Secrets Manager. VPC endpoints replace NAT for Secrets Manager + RDS Data API.',
  },
  {
    icon: UserCheck,
    label: 'Human approval gate',
    detail:
      'Agent opens the PR and moves Jira to In Review. A human merges. The customer team stays on the keyboard.',
  },
  {
    icon: BookOpen,
    label: 'Well-Architected citations required',
    detail:
      'Every modernization PR cites at least three of the six pillars (OPS, SEC, REL, PERF, COST, SUS) with pillar question IDs.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why an AWS SA trusts this motion
          </p>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Cloudscape-shaped guardrails, not cowboy migrations.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GUARDRAILS.map(g => {
          const Icon = g.icon;
          return (
            <div
              key={g.label}
              className="rounded-xl border border-dark-border bg-dark-surface p-4 flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#FF9900]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary mb-1">{g.label}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{g.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
