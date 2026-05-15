'use client';

import { TrendingDown } from 'lucide-react';

interface Metric {
  label: string;
  before: string;
  after: string;
  delta: string;
  note?: string;
}

const METRICS: Metric[] = [
  {
    label: 'Users in scope',
    before: '4,287',
    after: '18',
    delta: '−99.6%',
    note: '(security-admin + compliance-officer)',
  },
  {
    label: 'Risk score (ZPA)',
    before: '92 / 100 · Critical',
    after: '7 / 100 · Healthy',
    delta: 'cleared',
  },
  {
    label: 'Unmanaged-device paths',
    before: '1',
    after: '0',
    delta: 'closed',
  },
  {
    label: 'Time to PR',
    before: '3+ business days',
    after: '2:14',
    delta: '−99%',
    note: '(median sec-incident → fix PR)',
  },
];

export function RiskComparison() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Value capture per Zero Trust violation
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Same app. Same evaluator. 99.6% fewer users in scope.
        </h3>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto]">
          {/* Header row */}
          <div className="hidden md:contents">
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Metric
              </p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Before
              </p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-[#65B5F2] uppercase tracking-wider">
                With Cursor
              </p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Delta
              </p>
            </div>
          </div>

          {METRICS.map((m, i) => (
            <div key={m.label} className="contents">
              <div
                className={`px-5 py-4 ${
                  i < METRICS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
              </div>
              <div
                className={`px-5 py-4 ${
                  i < METRICS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <p className="text-sm text-text-secondary font-mono line-through opacity-70">
                  {m.before}
                </p>
              </div>
              <div
                className={`px-5 py-4 ${
                  i < METRICS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <p className="text-sm text-[#65B5F2] font-mono font-semibold">{m.after}</p>
                {m.note && (
                  <p className="text-[11px] text-text-tertiary mt-0.5">{m.note}</p>
                )}
              </div>
              <div
                className={`px-5 py-4 flex items-center gap-1.5 ${
                  i < METRICS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-accent-green" />
                <p className="text-sm text-accent-green font-mono font-semibold">{m.delta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center mt-4">
        Scales to every ZPA segment, every flagged policy. Cursor becomes the layer where Zero Trust
        controls and the codebase converge.
      </p>
    </div>
  );
}
