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
    label: 'Time to PR',
    before: '47 min',
    after: '2:14',
    delta: '−95%',
  },
  {
    label: 'Engineer time consumed',
    before: '35 min',
    after: '30 sec',
    delta: '−98%',
    note: '(PR review only)',
  },
  {
    label: 'Context switches',
    before: '4',
    after: '1',
    delta: '−75%',
    note: '(just the review)',
  },
  {
    label: 'Deploy risk',
    before: 'Manual patch',
    after: 'Tested + typed',
    delta: 'Lower',
  },
];

export function CostComparison() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Value capture per incident
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Same outcome. 45 minutes of engineering time reclaimed.
        </h3>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto]">
          {/* Header row */}
          <div className="hidden md:contents">
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Metric</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Before</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-accent-blue uppercase tracking-wider">With Cursor</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Delta</p>
            </div>
          </div>

          {/* Metric rows */}
          {METRICS.map((m, i) => (
            <div key={m.label} className="contents">
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
              </div>
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm text-text-secondary font-mono line-through opacity-70">{m.before}</p>
              </div>
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm text-accent-blue font-mono font-semibold">{m.after}</p>
                {m.note && <p className="text-[11px] text-text-tertiary mt-0.5">{m.note}</p>}
              </div>
              <div className={`px-5 py-4 flex items-center gap-1.5 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <TrendingDown className="w-3.5 h-3.5 text-accent-green" />
                <p className="text-sm text-accent-green font-mono font-semibold">{m.delta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center mt-4">
        Scales to every Sentry issue, every day. Cursor becomes the layer where observability, code, and CI converge.
      </p>
    </div>
  );
}
