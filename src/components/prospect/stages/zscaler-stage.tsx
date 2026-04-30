'use client';

import type { StageProps } from './types';

const POLICIES = [
  { name: 'corp-baseline-allow', state: 'in-sync', baseline: true },
  { name: 'devops-egress-3306', state: 'drift-add', baseline: false, note: 'manual console add by alex.r — not in git' },
  { name: 'finance-pci-strict', state: 'drift-mod', baseline: true, note: 'src changed from 10.0/8 to 0.0/0' },
  { name: 'guest-wifi', state: 'in-sync', baseline: true },
  { name: 'data-plane-deny-egress', state: 'drift-del', baseline: true, note: 'silently removed in console' },
];

export function ZscalerStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const corrected = isComplete || activeStep >= 3;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          admin.zscaler.com / {account.toLowerCase()} / policies
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#9bd1ff' }}>
          ZSCALER
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
          <Stat label="Policies" value={`${POLICIES.length}`} sub="live tenant" />
          <Stat
            label="Drift detected"
            value={corrected ? '0' : '3'}
            sub={corrected ? 'all corrected' : 'awaiting review'}
            tone={corrected ? 'good' : 'warn'}
          />
          <Stat label="Audit PR" value={corrected ? 'open #218' : 'pending'} sub="git-tracked" />
        </div>

        <div className="rounded-lg border border-dark-border overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_140px] px-3 py-1.5 bg-dark-surface border-b border-dark-border text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            <span>Policy</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {POLICIES.map((p, i) => {
            const drift = p.state.startsWith('drift');
            const correctedRow = drift && corrected;
            return (
              <div
                key={p.name}
                className="grid grid-cols-[1fr_120px_140px] px-3 py-1.5 border-b border-dark-border last:border-b-0 items-center text-[11px] font-mono transition-colors"
                style={{
                  background: correctedRow ? '#4ade8010' : drift ? '#fbbf2410' : 'transparent',
                  opacity: activeStep < 0 && drift ? 0.45 : 1,
                }}
              >
                <div className="min-w-0">
                  <p className="text-text-primary truncate">{p.name}</p>
                  {p.note && (
                    <p className="text-[10px] text-text-tertiary truncate">{p.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: correctedRow ? '#4ade80' : drift ? '#fbbf24' : '#4ade80',
                      boxShadow: correctedRow ? '0 0 6px #4ade80' : 'none',
                    }}
                  />
                  <span style={{ color: correctedRow ? '#4ade80' : drift ? '#fbbf24' : '#4ade80' }}>
                    {correctedRow ? 'in-sync' : p.state}
                  </span>
                </div>
                <span className="text-text-tertiary truncate">
                  {correctedRow
                    ? 'reverted via API'
                    : drift && activeStep >= 1
                      ? 'cursor planning'
                      : drift
                        ? 'queued'
                        : 'baseline'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-[10.5px] font-mono text-text-tertiary">
          {corrected
            ? 'audit-ready: every policy change captured as a reviewable git commit'
            : activeStep < 0
              ? 'nightly sweep · live tenant snapshotted'
              : 'cursor sdk · diffing live config against git baseline'}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'good' | 'warn' }) {
  const color = tone === 'good' ? '#4ade80' : tone === 'warn' ? '#fbbf24' : 'rgba(237,236,236,0.85)';
  return (
    <div className="rounded-lg border border-dark-border bg-dark-surface px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>
    </div>
  );
}
