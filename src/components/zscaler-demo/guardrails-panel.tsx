'use client';

import { Shield, FolderLock, CheckCircle2, UserCheck, ScrollText } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: FolderLock,
    label: 'Scoped file access',
    detail: 'Agent can only modify `infrastructure/zscaler/**`. No SCIM provisioning, no IdP edits, no app-segment churn.',
  },
  {
    icon: CheckCircle2,
    label: 'terraform plan + conformance gate',
    detail: 'PR only opens when `terraform plan` is in-place-only AND 4 simulated requests pass deny-by-default.',
  },
  {
    icon: UserCheck,
    label: 'Human approval + Atlantis apply',
    detail: 'Agent proposes the .tf change. A reviewer approves. Atlantis runs `terraform apply` on merge.',
  },
  {
    icon: ScrollText,
    label: 'Full audit trail in the PR',
    detail: 'Every MCP call, ZPA event, terraform plan, conformance probe row, prompt, and diff is attached.',
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
              <div className="w-8 h-8 rounded-lg bg-[#0079D5]/10 border border-[#0079D5]/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#65B5F2]" />
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
