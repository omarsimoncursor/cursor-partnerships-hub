'use client';

import { Shield, FolderLock, UserCheck, ScrollText, KeyRound, Layers } from 'lucide-react';

const GUARDRAILS = [
  {
    icon: KeyRound,
    label: 'Containment first',
    detail: 'Agent rotates / revokes / quarantines before touching code. Code edits only run after the threat is contained.',
  },
  {
    icon: UserCheck,
    label: 'Never auto-merge',
    detail: 'Agents propose PRs; reviewers ship them. History-purge PRs always remain draft until a human approves.',
  },
  {
    icon: FolderLock,
    label: 'Scoped MCP credentials',
    detail: 'Each MCP gets the least-privilege token for its job. Tokens never leave your VPC.',
  },
  {
    icon: ScrollText,
    label: 'SDK-grade audit trail',
    detail: 'Every SDK + MCP call shows up in the run trace. Index it in Splunk, attach it to the PR.',
  },
  {
    icon: Layers,
    label: 'Composable, not all-or-nothing',
    detail: 'Each automation is a small webhook handler in your repo. Roll out one workflow at a time.',
  },
];

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
          Guardrails baked into the SDK contract.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {GUARDRAILS.map(({ icon: Icon, label, detail }) => (
          <div
            key={label}
            className="rounded-lg border border-dark-border bg-dark-surface p-3"
          >
            <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-2">
              <Icon className="w-3.5 h-3.5 text-accent-blue" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
            <p className="text-[11px] text-text-tertiary leading-relaxed">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
