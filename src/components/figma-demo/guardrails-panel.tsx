'use client';

import { Shield, Layers, Eye, UserCheck, ScrollText } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: Layers,
    label: 'Token-only substitution',
    detail: 'The agent only swaps hardcoded literals for `tokens.*` references. No semantic, layout, or behavior changes.',
  },
  {
    icon: Eye,
    label: 'WCAG auto-check',
    detail: 'Any color change is verified against WCAG AA contrast on the affected surface. PR is blocked if it regresses.',
  },
  {
    icon: UserCheck,
    label: 'Human approval gate',
    detail: 'Agent proposes the patch and opens the PR. A designer or engineer reviews and merges — never the agent.',
  },
  {
    icon: ScrollText,
    label: 'Full audit trail',
    detail: 'Every Figma variable read, model call, and diff is attached to the PR — including before/after screenshots.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why design teams trust this motion
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
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  background: 'rgba(162,89,255,0.10)',
                  borderColor: 'rgba(162,89,255,0.30)',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: '#A259FF' }} />
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
