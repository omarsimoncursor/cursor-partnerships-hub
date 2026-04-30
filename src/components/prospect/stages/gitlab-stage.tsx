'use client';

import type { StageProps } from './types';

const JOBS = [
  { stage: 'lint',     name: 'eslint',         status: 'success' as const },
  { stage: 'test',     name: 'jest:unit',      status: 'success' as const },
  { stage: 'test',     name: 'jest:integration', status: 'failed' as const },
  { stage: 'test',     name: 'cypress:e2e',    status: 'success' as const },
  { stage: 'build',    name: 'next:build',     status: 'skipped' as const },
  { stage: 'deploy',   name: 'preview',        status: 'skipped' as const },
];

const STATUS_COLOR: Record<string, string> = {
  success: '#4ade80',
  failed: '#f87171',
  skipped: '#a3a3a3',
  running: '#fbbf24',
};

export function GitLabStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  // After agent's 3rd step, the failed job becomes a passing retry
  const fixed = isComplete || activeStep >= 3;
  const retried = isComplete || activeStep >= 4;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg/70 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          gitlab.com / {account.toLowerCase()} / web-checkout / -/pipelines/8821
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#ffd2a3' }}>
          GITLAB
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider"
            style={{
              background: retried ? '#4ade8022' : '#f8717122',
              color: retried ? '#4ade80' : '#f87171',
            }}
          >
            {retried ? 'pipeline passed' : 'pipeline failed'}
          </span>
          <p className="text-sm font-medium text-text-primary">#8821 · main · "fix(checkout): cache fx.lookup"</p>
        </div>

        {/* Stage flow */}
        <div className="grid grid-cols-4 gap-2">
          {(['lint', 'test', 'build', 'deploy'] as const).map(stage => {
            const stageJobs = JOBS.filter(j => j.stage === stage);
            const anyFailed = stageJobs.some(j => j.status === 'failed') && !fixed;
            const allDone = retried || stageJobs.every(j => j.status === 'success' || j.status === 'skipped');
            const color = anyFailed ? '#f87171' : allDone ? '#4ade80' : '#fbbf24';
            return (
              <div key={stage} className="rounded-lg border p-2" style={{ borderColor: `${color}55`, background: `${color}10` }}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-1">{stage}</p>
                {stageJobs.map(job => {
                  const effective = fixed && job.status === 'failed' ? 'success' : job.status;
                  return (
                    <div key={job.name} className="flex items-center gap-1.5 text-[10.5px] font-mono">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STATUS_COLOR[effective], boxShadow: effective === 'success' && fixed ? '0 0 6px #4ade80' : 'none' }}
                      />
                      <span className="text-text-secondary truncate">{job.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Job log preview */}
        <div className="rounded-lg border border-dark-border bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-border bg-dark-surface/60 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            <span>job · jest:integration · log</span>
            <span style={{ color: fixed ? '#4ade80' : '#f87171' }}>{fixed ? 'pass' : 'fail'}</span>
          </div>
          <pre className="p-3 text-[10.5px] font-mono leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
{fixed ? `> jest --runInBand
PASS  src/checkout/cart.test.ts (4.21s)
  totalize() with mixed currencies
    \u2713 sums lines via FX (148ms)
Tests: 1 passed, 1 total` : `> jest --runInBand
FAIL  src/checkout/cart.test.ts
  totalize() with mixed currencies
    \u2717 expected 12800, received NaN  (4.18s)
Tests: 1 failed, 1 total`}
          </pre>
        </div>

        <div className="text-[10.5px] font-mono text-text-tertiary">
          {retried
            ? 'cursor agent · pushed fix + re-ran pipeline · MR commented with green build link'
            : activeStep < 0
              ? 'pipeline ingested · cursor agent dispatched'
              : 'cursor agent · diagnosing failing assertion'}
        </div>
      </div>
    </div>
  );
}
