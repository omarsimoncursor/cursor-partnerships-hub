'use client';

import type { StageProps } from './types';

const COLUMNS = [
  { name: 'To Do', color: '#a3a3a3' },
  { name: 'In Progress', color: '#fbbf24' },
  { name: 'In Review', color: '#60a5fa' },
  { name: 'Done', color: '#4ade80' },
];

const TICKETS = [
  { key: 'PLT-4218', summary: 'Cache fx.lookup in checkout totalize', col: 0 },
  { key: 'PLT-4217', summary: 'Add aria-label to checkout totals', col: 0 },
  { key: 'PLT-4202', summary: 'Migrate notifications worker to SQS FIFO', col: 1 },
];

export function JiraStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  // PLT-4218 transitions across columns as the agent runs.
  const heroCol = isComplete ? 3 : Math.min(3, Math.max(0, activeStep));

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          {account.toLowerCase()}.atlassian.net / boards / PLT
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: brand }}>
          JIRA
        </span>
      </div>

      <div className="grid grid-cols-4 divide-x divide-dark-border min-h-[260px]">
        {COLUMNS.map((col, i) => (
          <div key={col.name} className="p-2.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">{col.name}</p>
              <span className="text-[9px] font-mono px-1 rounded" style={{ background: `${col.color}22`, color: col.color }}>
                {(i === heroCol ? 1 : 0) + TICKETS.filter(t => t.col === i && t.key !== 'PLT-4218').length}
              </span>
            </div>
            <div className="space-y-1.5">
              {/* Hero ticket — moves to heroCol */}
              {i === heroCol && (
                <div
                  className="rounded-md border bg-dark-surface p-2 transition-all"
                  style={{
                    borderColor: brand,
                    boxShadow: `0 0 14px ${brand}55`,
                  }}
                >
                  <p className="text-[10px] font-mono mb-1" style={{ color: brand }}>PLT-4218</p>
                  <p className="text-[11px] font-medium text-text-primary leading-tight">Cache fx.lookup in checkout totalize</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[9px] font-mono px-1 rounded bg-dark-bg text-text-tertiary">cursor-agent</span>
                    {i >= 2 && (
                      <span className="text-[9px] font-mono px-1 rounded" style={{ background: `${brand}33`, color: brand }}>
                        PR #4218
                      </span>
                    )}
                    {i === 3 && (
                      <span className="ml-auto text-[10px] text-accent-green">{'\u2713'}</span>
                    )}
                  </div>
                </div>
              )}
              {/* Static tickets */}
              {TICKETS.filter(t => t.col === i && t.key !== 'PLT-4218').map(t => (
                <div key={t.key} className="rounded-md border border-dark-border bg-dark-surface p-2">
                  <p className="text-[10px] font-mono mb-1 text-text-tertiary">{t.key}</p>
                  <p className="text-[11px] text-text-secondary leading-tight">{t.summary}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dark-border px-3 py-2 text-[10.5px] font-mono text-text-tertiary">
        {isComplete
          ? 'PLT-4218 transitioned to Done · cycle time 4m 17s · ACs auto-checked from PR description'
          : activeStep < 0
            ? 'cursor agent · waiting for ticket'
            : `cursor agent · transitioned PLT-4218 \u2192 ${COLUMNS[heroCol].name}`}
      </div>
    </div>
  );
}
