'use client';

import { Shield, Scale, Network, UserCheck, ScrollText } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: Scale,
    label: 'Row-equivalence harness',
    detail: 'Every migration PR is gated on `row delta = 0` and `monetary Σ delta = $0.00` against a 1% Oracle sample.',
  },
  {
    icon: Network,
    label: 'Unity Catalog lineage preserved',
    detail: 'Bronze → silver → gold lineage registered before PR opens. No tables land in the wild without grants + owner.',
  },
  {
    icon: UserCheck,
    label: 'Human approval gate',
    detail: 'Agent proposes the migration, never merges. A data-platform reviewer ships the change.',
  },
  {
    icon: ScrollText,
    label: 'No schema widening',
    detail: 'Agent rejects its own patch if column types widen, columns drop, or natural keys shift. A migration note is required otherwise.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why a data-platform team trusts this motion
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
              <div className="w-8 h-8 rounded-lg bg-[#FF3621]/10 border border-[#FF3621]/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#FF6B55]" />
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
