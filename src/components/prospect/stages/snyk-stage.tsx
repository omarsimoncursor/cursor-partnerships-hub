'use client';

import type { StageProps } from './types';

const VULNS = [
  { id: 'SNYK-JS-LODASH-1018905',  pkg: 'lodash@4.17.20',   sev: 'critical', cve: 'CVE-2021-23337', fix: '4.17.21', repo: 'web-checkout' },
  { id: 'SNYK-JS-AXIOS-1579269',   pkg: 'axios@0.21.0',     sev: 'high',     cve: 'CVE-2021-3749',  fix: '0.21.4',  repo: 'web-checkout' },
  { id: 'SNYK-JS-FOLLOW-1320368',  pkg: 'follow-redirects@1.13.1', sev: 'high', cve: 'CVE-2022-0155', fix: '1.14.7', repo: 'api-gateway' },
  { id: 'SNYK-JS-MINIMIST-2429795',pkg: 'minimist@1.2.5',   sev: 'critical', cve: 'CVE-2021-44906', fix: '1.2.6',   repo: 'data-pipeline' },
  { id: 'SNYK-JS-NODEMAILER-1315',  pkg: 'nodemailer@6.4.10',sev: 'high',     cve: 'CVE-2021-23566', fix: '6.6.1',   repo: 'notifications' },
  { id: 'SNYK-JS-SHELLJS-1576593', pkg: 'shelljs@0.8.4',    sev: 'high',     cve: 'CVE-2022-0144',  fix: '0.8.5',   repo: 'devtools' },
];

const SEV_COLORS: Record<string, string> = {
  critical: '#f87171',
  high: '#fbbf24',
};

export function SnykStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  // Reveal one row per "tick" while the agent runs, so the table fills in.
  const visibleCount = activeStep < 0
    ? 0
    : Math.min(VULNS.length, Math.round(((activeStep + 1) / 5) * VULNS.length));
  const fixedCount = isComplete ? VULNS.length : Math.max(0, visibleCount - 2);

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          app.snyk.io / org / {account.toLowerCase()} / projects
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#4C4A7344', color: '#cfceea' }}>
          SNYK
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Critical" value={isComplete ? '0' : '2'} delta={isComplete ? '−2' : null} color="#f87171" />
          <Stat label="High" value={isComplete ? '0' : '4'} delta={isComplete ? '−4' : null} color="#fbbf24" />
          <Stat label="Auto-fixed by Cursor" value={String(fixedCount)} delta={fixedCount > 0 ? `+${fixedCount}` : null} color={brand} />
        </div>

        <div className="rounded-lg border border-dark-border overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_120px_90px] px-3 py-1.5 bg-dark-surface border-b border-dark-border text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            <span>Severity</span>
            <span>Package · CVE</span>
            <span>Repo</span>
            <span className="text-right">Fix</span>
          </div>
          <div>
            {VULNS.map((v, i) => {
              const visible = i < visibleCount;
              const fixed = i < fixedCount;
              return (
                <div
                  key={v.id}
                  className="grid grid-cols-[100px_1fr_120px_90px] px-3 py-1.5 border-b border-dark-border last:border-b-0 items-center text-[11px] font-mono transition-all"
                  style={{
                    opacity: visible ? 1 : 0.15,
                    background: fixed ? '#4ade8010' : 'transparent',
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: fixed ? '#4ade80' : SEV_COLORS[v.sev],
                        boxShadow: fixed ? '0 0 6px #4ade80' : 'none',
                      }}
                    />
                    <span style={{ color: fixed ? '#4ade80' : SEV_COLORS[v.sev] }}>
                      {fixed ? 'fixed' : v.sev}
                    </span>
                  </span>
                  <span className="truncate">
                    <span className="text-text-primary">{v.pkg}</span>
                    <span className="text-text-tertiary ml-2">{v.cve}</span>
                  </span>
                  <span className="text-text-tertiary truncate">{v.repo}</span>
                  <span className="text-right">
                    {fixed ? (
                      <span className="text-accent-green">{'->'} {v.fix}</span>
                    ) : (
                      <span className="text-text-tertiary">{v.fix}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] font-mono text-text-tertiary">
          {!isComplete && activeStep >= 0 && `cursor sdk · proposing lowest-risk semver bumps for ${visibleCount} vulns`}
          {isComplete && `PR #4218 opened · all critical + high CVEs auto-patched · CI green · waiting on security review`}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, color }: { label: string; value: string; delta: string | null; color: string }) {
  return (
    <div className="rounded-lg border border-dark-border bg-dark-surface px-3 py-2">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{label}</p>
      <div className="flex items-baseline gap-2 mt-0.5">
        <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
        {delta && <p className="text-[10px] font-mono" style={{ color: delta.startsWith('-') || delta.startsWith('\u2212') ? '#4ade80' : color }}>{delta}</p>}
      </div>
    </div>
  );
}
