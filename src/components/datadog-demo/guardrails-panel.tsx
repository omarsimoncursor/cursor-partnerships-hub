'use client';

import { Shield, FolderLock, CheckCircle2, UserCheck, ScrollText } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: FolderLock,
    label: 'Scoped file access',
    detail: 'Agent can only modify `src/**`. No migrations, infra, or CI configs.',
  },
  {
    icon: CheckCircle2,
    label: 'Perf regression gate',
    detail: 'PR only opens when live latency beats the SLO target — no theoretical fixes.',
  },
  {
    icon: UserCheck,
    label: 'Human approval gate',
    detail: 'Agent proposes, never merges. A reviewer ships the change.',
  },
  {
    icon: ScrollText,
    label: 'Full audit trail',
    detail: 'Every MCP call, span, prompt, and diff is attached to the PR.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why enterprises trust this motion
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
              <div className="w-8 h-8 rounded-lg bg-[#632CA6]/10 border border-[#632CA6]/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#A689D4]" />
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
