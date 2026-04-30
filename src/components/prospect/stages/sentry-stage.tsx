'use client';

import type { StageProps } from './types';

const STACK_FRAMES = [
  { file: 'app/checkout/route.ts', line: 142, fn: 'POST', highlight: false },
  { file: 'lib/billing/charge.ts', line: 87, fn: 'chargeCard', highlight: false },
  { file: 'lib/billing/normalize.ts', line: 31, fn: 'normalizeCurrency', highlight: true },
  { file: 'node_modules/iso-currencies/index.js', line: 14, fn: 'lookup', highlight: false },
];

export function SentryStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const showFailingTest = activeStep >= 1;
  const showPatch = activeStep >= 3 || isComplete;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          sentry.io / {account.toLowerCase()} / issues / CHK-2401
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#cbb5ff' }}>
          SENTRY
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">CHK-2401 {'\u2022'} unresolved {'\u2022'} 142 events / 24h</p>
            <p className="text-base font-semibold text-text-primary mt-0.5">
              <span style={{ color: brand === '#362D59' ? '#cbb5ff' : brand }}>TypeError</span>: Cannot read properties of undefined (reading &apos;code&apos;)
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">in normalizeCurrency · lib/billing/normalize.ts:31</p>
          </div>
          <div
            className="text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider shrink-0"
            style={{
              background: isComplete ? '#4ade8022' : '#f8717122',
              color: isComplete ? '#4ade80' : '#f87171',
            }}
          >
            {isComplete ? 'auto-resolved' : 'firing'}
          </div>
        </div>

        {/* Stack trace */}
        <div className="rounded-lg border border-dark-border bg-dark-surface">
          <div className="px-3 py-1.5 border-b border-dark-border text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            Stack trace
          </div>
          <ol className="divide-y divide-dark-border">
            {STACK_FRAMES.map((frame, i) => (
              <li
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono"
                style={{
                  background: frame.highlight && activeStep >= 0 ? `${brand}22` : 'transparent',
                  color: frame.highlight ? '#fff' : 'rgba(237,236,236,0.6)',
                }}
              >
                <span className="text-text-tertiary tabular-nums w-6">{i + 1}</span>
                <span className="text-text-primary/80">{frame.fn}</span>
                <span className="text-text-tertiary truncate">{frame.file}:{frame.line}</span>
                {frame.highlight && activeStep >= 2 && (
                  <span className="ml-auto text-[10px] px-1.5 rounded" style={{ background: `${brand}55`, color: '#fff' }}>
                    cursor located regression
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Failing test that the agent generated */}
        {showFailingTest && (
          <div className="rounded-lg border border-dark-border bg-dark-bg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-border bg-dark-surface">
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                generated regression test {showPatch ? '· passing' : '· failing'}
              </p>
              <span
                className="text-[10px] font-mono px-1.5 rounded"
                style={{
                  background: showPatch ? '#4ade8022' : '#f8717122',
                  color: showPatch ? '#4ade80' : '#f87171',
                }}
              >
                {showPatch ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-text-secondary overflow-x-auto">
{`it('normalizes XOF without code field', () => {
  expect(normalizeCurrency({ amount: 1200 }))
    .toEqual({ amount: 1200, code: 'USD' });
});`}
            </pre>
          </div>
        )}

        {/* Diff patch */}
        {showPatch && (
          <div className="rounded-lg border border-dark-border bg-dark-bg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-border bg-dark-surface">
              <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                lib/billing/normalize.ts
              </p>
              <span className="text-[10px] font-mono text-accent-green">+3 −1</span>
            </div>
            <div className="text-[11px] font-mono">
              <div className="px-3 py-0.5 bg-[#f8717118] text-[#f87171]">
                <span className="opacity-60 mr-2">- 31</span>return {'{ amount: input.amount, code: input.code.toUpperCase() }'};
              </div>
              <div className="px-3 py-0.5 bg-[#4ade8018] text-[#4ade80]">
                <span className="opacity-60 mr-2">+ 31</span>const code = input.code?.toUpperCase() ?? &apos;USD&apos;;
              </div>
              <div className="px-3 py-0.5 bg-[#4ade8018] text-[#4ade80]">
                <span className="opacity-60 mr-2">+ 32</span>return {'{ amount: input.amount, code }'};
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
