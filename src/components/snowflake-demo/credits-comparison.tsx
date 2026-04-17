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
    label: 'Daily rollup wall time',
    before: '3,412s',
    after: '12.8s',
    delta: '266× faster',
  },
  {
    label: 'Annual ELT run cost',
    before: '$8.2M / yr',
    after: '$2.3M / yr',
    delta: '−$5.9M',
    note: '(Teradata + Informatica → Snowflake credits)',
  },
  {
    label: 'Migration baseline',
    before: '4 years · $18M',
    after: '15 months · $5.4M',
    delta: 'resolved',
    note: '(GSI quote vs Cursor-accelerated)',
  },
  {
    label: 'Pulled-forward credits · AE quota',
    before: '—',
    after: '~$16M',
    delta: '33 months earlier',
  },
  {
    label: 'Time to modernized PR',
    before: '~2 weeks',
    after: '2:28',
    delta: '−99%',
    note: '(GSI pod vs agent)',
  },
];

export function CreditsComparison() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Value capture per modernized asset
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Teradata run cost collapses into Snowflake credits.{' '}
          <span className="text-[#7DD3F5]">Credits start flowing on day one.</span>
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
                Legacy (Teradata + Informatica)
              </p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-[#7DD3F5] uppercase tracking-wider">
                With Cursor + Snowflake
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
                <p className="text-sm text-[#7DD3F5] font-mono font-semibold">{m.after}</p>
                {m.note && <p className="text-[11px] text-text-tertiary mt-0.5">{m.note}</p>}
              </div>
              <div
                className={`px-5 py-4 flex items-center gap-1.5 ${
                  i < METRICS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-[#4ADE80]" />
                <p className="text-sm text-[#4ADE80] font-mono font-semibold">{m.delta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center mt-4">
        Unit prices: Snowflake Enterprise ≈ $3/credit · Teradata CPU-seconds + Informatica agent
        licensing estimated against Acme Analytics&apos; 2025 true-up. &quot;Est.&quot; on all credit numbers.
      </p>
    </div>
  );
}
