'use client';

import { Gauge, ScrollText, Shield, ShieldCheck, UserCheck } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: Gauge,
    label: 'Confidence threshold',
    detail:
      'Revert is only auto-shipped above 0.7 confidence. Below threshold, the page goes through to a human.',
  },
  {
    icon: ShieldCheck,
    label: 'Canary + SLO gate',
    detail:
      'Promotion to 100% requires the canary 5xx rate to stay under 0.5% for 60s sustained.',
  },
  {
    icon: UserCheck,
    label: 'Change-freeze respect',
    detail:
      'Agent honors deploy-freeze windows and explicitly pages a human before touching production.',
  },
  {
    icon: ScrollText,
    label: 'Full audit trail',
    detail:
      'Every MCP call, decision, NOTE, and diff is mirrored to the PD incident and the postmortem doc.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why SREs trust this auto-pilot
          </p>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Guardrails before promotion. Humans paged when confidence drops.
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
              <div className="w-8 h-8 rounded-lg bg-[#06AC38]/10 border border-[#06AC38]/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#57D990]" />
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
