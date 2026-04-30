'use client';

import type { StageProps } from './types';

const GROUPS = [
  { name: 'eng-platform',     before: false, after: true },
  { name: 'on-call-platform', before: false, after: true },
  { name: 'aws-prod-readonly', before: false, after: true },
  { name: 'datadog-readwrite', before: true,  after: true },
  { name: 'all-employees',     before: true,  after: true },
];

export function OktaStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const planned = isComplete || activeStep >= 2;
  const applied = isComplete || activeStep >= 4;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          {account.toLowerCase()}.okta.com / users / kira.j@{account.toLowerCase()}.com
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#a3d4ff' }}>
          OKTA
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${brand}33`, color: brand }}>
            KJ
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Kira Johnson</p>
            <p className="text-[11px] text-text-tertiary font-mono">Senior Platform Engineer · started today</p>
          </div>
          <div
            className="ml-auto text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider"
            style={{
              background: applied ? '#4ade8022' : '#fbbf2422',
              color: applied ? '#4ade80' : '#fbbf24',
            }}
          >
            {applied ? 'provisioned' : 'pending PR review'}
          </div>
        </div>

        <div className="rounded-lg border border-dark-border overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px] px-3 py-1.5 bg-dark-surface border-b border-dark-border text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            <span>Group</span>
            <span>Before</span>
            <span>After (PR #218)</span>
          </div>
          {GROUPS.map(g => {
            const becomingTrue = !g.before && g.after;
            return (
              <div
                key={g.name}
                className="grid grid-cols-[1fr_120px_120px] px-3 py-1.5 border-b border-dark-border last:border-b-0 items-center text-[11px] font-mono"
                style={{ background: applied && becomingTrue ? '#4ade8010' : 'transparent' }}
              >
                <span className="text-text-primary truncate">{g.name}</span>
                <span style={{ color: g.before ? '#a3a3a3' : 'rgba(237,236,236,0.25)' }}>
                  {g.before ? 'member' : '—'}
                </span>
                <span style={{ color: g.after ? (applied ? '#4ade80' : (planned ? brand : '#fbbf24')) : 'rgba(237,236,236,0.25)' }}>
                  {g.after ? (applied ? 'member' : (planned ? '+ add' : 'planned')) : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {planned && (
          <div className="rounded-lg border border-dark-border bg-dark-bg overflow-hidden">
            <div className="px-3 py-1.5 border-b border-dark-border bg-dark-surface text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              roles.yaml · pull request #218
            </div>
            <pre className="p-3 text-[10.5px] font-mono leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
{`users:
  kira.j:
    role: senior-platform-engineer
+   groups:
+     - eng-platform
+     - on-call-platform
+     - aws-prod-readonly`}
            </pre>
          </div>
        )}

        <div className="text-[10.5px] font-mono text-text-tertiary">
          {applied
            ? 'manager-approved PR merged · changes pushed to Okta via API · audit trail in git'
            : planned
              ? 'PR opened — manager review required before changes hit Okta'
              : 'cursor sdk · matching role to groups via roles.yaml'}
        </div>
      </div>
    </div>
  );
}
