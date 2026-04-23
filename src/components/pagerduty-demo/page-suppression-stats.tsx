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
    label: 'Mean time to resolve',
    before: '47 min',
    after: '4m 12s',
    delta: '−91.0%',
  },
  {
    label: 'Humans paged',
    before: '2',
    after: '0',
    delta: '−100%',
    note: '(primary + escalation)',
  },
  {
    label: 'Time of day cost',
    before: '03:14 AM PT',
    after: 'no phone rang',
    delta: 'reclaimed',
  },
  {
    label: 'Customer-facing 5xx',
    before: '47 min @ 7.4%',
    after: '4m 12s @ 7.4%',
    delta: '−91% blast',
  },
];

export function PageSuppressionStats() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Value capture per P1 page
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Same incident. Resolved in 4 minutes. No phones ring.
        </h3>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto]">
          <div className="hidden md:contents">
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Metric
              </p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Without Cursor
              </p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-[#57D990] uppercase tracking-wider">
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
                className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}
              >
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
              </div>
              <div
                className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}
              >
                <p className="text-sm text-text-secondary font-mono line-through opacity-70">
                  {m.before}
                </p>
              </div>
              <div
                className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}
              >
                <p className="text-sm text-[#57D990] font-mono font-semibold">{m.after}</p>
                {m.note && <p className="text-[11px] text-text-tertiary mt-0.5">{m.note}</p>}
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
        Replays for every P1 page across every service. Cursor becomes the auto-pilot inside the on-call rotation.
      </p>
    </div>
  );
}
