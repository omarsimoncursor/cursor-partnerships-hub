'use client';

import { Shield, Sparkles, ShieldCheck, UserCheck, Layers } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: ShieldCheck,
    label: 'Row-level equivalence before PR',
    detail:
      'Agent never opens a PR unless a 1% row-sample diff against the Teradata / SQL Server snapshot is Δ = 0.',
  },
  {
    icon: Sparkles,
    label: 'Cortex semantic diff logged',
    detail:
      '`SNOWFLAKE.CORTEX.COMPLETE` compares before/after semantics. Output is pasted into the PR body for the reviewer to audit.',
  },
  {
    icon: Layers,
    label: 'No silent schema changes',
    detail:
      'dbt `on_schema_change = \'fail\'` plus unique_key tests block column drops, type widening, and grain shifts.',
  },
  {
    icon: UserCheck,
    label: 'Human-approved merge only',
    detail:
      'Agent proposes. A reviewer merges. Warehouse-size creep, Cortex pricing tier changes, and role grants all require explicit approval.',
  },
] as const;

export function GuardrailsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Why Snowflake customers trust this motion
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
              <div className="w-8 h-8 rounded-lg bg-[#29B5E8]/10 border border-[#29B5E8]/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#7DD3F5]" />
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
