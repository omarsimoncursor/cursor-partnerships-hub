'use client';

import type { StageProps } from './types';

const REVIEW_THREADS = [
  { author: 'taylor.k', file: 'lib/checkout/cart.ts', line: 87, comment: 'extract this into a pure helper for testability' },
  { author: 'morgan.r', file: 'lib/checkout/cart.ts', line: 142, comment: 'use the existing PriceFormatter, not a one-off' },
  { author: 'jamie.l', file: 'app/checkout/page.tsx', line: 31, comment: 'aria-label is missing on the totals region' },
  { author: 'taylor.k', file: 'tests/cart.test.ts', line: 0, comment: 'add a test for the multi-currency case' },
];

const DIFF_HUNKS = [
  { file: 'lib/checkout/cart.ts', additions: ['+ export function totalize(lines: Line[]): Money {', '+   return lines.reduce(sumMoney, ZERO_MONEY);', '+ }'], removals: ['- // (inline reduce in cart.ts)'] },
  { file: 'lib/checkout/cart.ts', additions: ['+ const total = PriceFormatter.format(cart.total);'], removals: ['- const total = `$${cart.total.amount.toFixed(2)}`;'] },
  { file: 'app/checkout/page.tsx', additions: ['+ <section aria-label="Order totals">'], removals: ['- <section>'] },
  { file: 'tests/cart.test.ts', additions: ['+ it("totalizes multi-currency carts via FX", () => { /* ... */ });'], removals: [] },
];

export function GitHubStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const visibleHunks = activeStep < 0 ? 0 : Math.min(DIFF_HUNKS.length, activeStep);
  const ready = isComplete || activeStep >= 4;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          github.com / {account.toLowerCase()} / web-checkout / pull / 4218
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#a8e6b3' }}>
          GITHUB
        </span>
      </div>

      <div className="grid grid-cols-[1fr_240px] divide-x divide-dark-border">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider" style={{ background: ready ? '#4ade8022' : `${brand}22`, color: ready ? '#4ade80' : '#a8e6b3' }}>
              {ready ? 'updated' : 'in progress'}
            </span>
            <p className="text-sm font-semibold text-text-primary">refactor: address review feedback (4 threads)</p>
          </div>
          <p className="text-[11px] text-text-tertiary">
            #4218 · cursor-agent pushed {visibleHunks} commit{visibleHunks === 1 ? '' : 's'} · {visibleHunks * 8 + (visibleHunks ? 4 : 0)} lines changed across {Math.min(visibleHunks, 3)} files
          </p>

          <div className="space-y-2">
            {DIFF_HUNKS.map((hunk, i) => {
              const visible = i < visibleHunks;
              return (
                <div
                  key={i}
                  className="rounded-lg border border-dark-border bg-dark-bg overflow-hidden transition-all"
                  style={{ opacity: visible ? 1 : 0.2, transform: visible ? 'translateY(0)' : 'translateY(4px)' }}
                >
                  <div className="px-3 py-1.5 border-b border-dark-border bg-dark-surface text-[10px] font-mono text-text-tertiary flex items-center justify-between">
                    <span>{hunk.file}</span>
                    <span>
                      <span className="text-accent-green mr-2">+{hunk.additions.length}</span>
                      <span className="text-[#f87171]">−{hunk.removals.length}</span>
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono">
                    {hunk.removals.map((line, j) => (
                      <div key={`r-${j}`} className="px-3 py-0.5 bg-[#f8717118] text-[#f87171] truncate">{line}</div>
                    ))}
                    {hunk.additions.map((line, j) => (
                      <div key={`a-${j}`} className="px-3 py-0.5 bg-[#4ade8018] text-[#4ade80] truncate">{line}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: review threads getting resolved */}
        <div className="p-3 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-1">Reviewer threads</p>
          {REVIEW_THREADS.map((t, i) => {
            const resolved = activeStep >= 2 && i < visibleHunks + 1;
            return (
              <div
                key={i}
                className="rounded-md border border-dark-border bg-dark-surface p-2 transition-all"
                style={{ opacity: resolved ? 0.65 : 1 }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center" style={{ background: brand, color: '#0a0a0a' }}>
                    {t.author.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-text-secondary">{t.author}</span>
                  {resolved && (
                    <span className="ml-auto text-[9px] font-mono text-accent-green">resolved</span>
                  )}
                </div>
                <p className="text-[10.5px] text-text-secondary leading-snug" style={{ textDecoration: resolved ? 'line-through' : 'none' }}>
                  {t.comment}
                </p>
                <p className="text-[9px] font-mono text-text-tertiary mt-0.5">{t.file}{t.line ? `:${t.line}` : ''}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
