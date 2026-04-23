'use client';

import { Shield, Eye, UserCheck, ScrollText, Globe } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: Eye,
    label: 'Log mode → 60s observe → Block',
    detail: 'Every WAF rule lands in Log mode first. Auto-rollback if false-positive rate > 0.1%.',
  },
  {
    icon: Shield,
    label: 'Worker canary deploy',
    detail: 'New Worker patches deploy to a canary route first; promoted only after the error budget is unaffected.',
  },
  {
    icon: Globe,
    label: 'Never block whole countries / ASNs',
    detail: 'Agent scopes rules to ASN + endpoint + UA. Anything broader requires human approval.',
  },
  {
    icon: UserCheck,
    label: 'Security-sensitive PRs are draft',
    detail: 'App-side authentication patches are always opened as draft for human review — never auto-merged.',
  },
  {
    icon: ScrollText,
    label: 'Full audit trail to SIEM',
    detail: 'Every action (Cloudflare API call, Worker deploy, PR open) flushed via Logpush → S3 → SIEM.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why security teams trust this motion
          </p>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Guardrails, not guesswork.
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
              <div className="w-8 h-8 rounded-lg bg-[#F38020]/10 border border-[#F38020]/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#FAAE40]" />
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
