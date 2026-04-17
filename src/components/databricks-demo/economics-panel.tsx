'use client';

import { TrendingDown } from 'lucide-react';

interface Row {
  label: string;
  before: string;
  after: string;
  delta: string;
  note?: string;
}

const ROWS: Row[] = [
  {
    label: 'Migration bill',
    before: '$22M over 5 years',
    after: '$6.8M over 18 months',
    delta: '−69%',
    note: '(incumbent GSI fixed bid)',
  },
  {
    label: 'Pulled-forward ARR',
    before: '—',
    after: '$45M+ · 42 months sooner',
    delta: 'new',
    note: '(at $15M/yr committed-use)',
  },
  {
    label: 'Annual run cost',
    before: '$14.7M/yr on-prem',
    after: '$3.9M/yr on Databricks',
    delta: '−73%',
    note: '(Oracle + Informatica + DC retired)',
  },
  {
    label: 'Per-workflow calendar',
    before: '~12 weeks (GSI)',
    after: '~18 days (agent + reviews + parallel run + cutover)',
    delta: '−78%',
    note: '(human review + 2-wk shadow + sign-off + CAB still happen)',
  },
  {
    label: 'Per-workflow engineering cost',
    before: '$71,200 GSI fixed-bid',
    after: '~$2,400 internal',
    delta: '−97%',
    note: '(~40 min agent compute + ~6 hrs human review)',
  },
  {
    label: 'Portfolio throughput',
    before: '~1 workflow / 2 weeks (GSI)',
    after: '~12 in flight at any time · 18-month finish',
    delta: '24× concurrency',
    note: '(2 squads · same review/sign-off/CAB gates)',
  },
];

export function EconomicsPanel() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Databricks consumption pulled forward · Oracle/Informatica TCO retired
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          What the Databricks AE takes to their prospect&apos;s CFO.
        </h3>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto]">
          {/* Header row */}
          <div className="hidden md:contents">
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Line item</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Before</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-[#FF6B55] uppercase tracking-wider">With Cursor</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Delta</p>
            </div>
          </div>

          {ROWS.map((m, i) => (
            <div key={m.label} className="contents">
              <div
                className={`px-5 py-4 ${i < ROWS.length - 1 ? 'border-b border-dark-border' : ''}`}
              >
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
              </div>
              <div
                className={`px-5 py-4 ${i < ROWS.length - 1 ? 'border-b border-dark-border' : ''}`}
              >
                <p className="text-sm text-text-secondary font-mono line-through opacity-70">
                  {m.before}
                </p>
              </div>
              <div
                className={`px-5 py-4 ${i < ROWS.length - 1 ? 'border-b border-dark-border' : ''}`}
              >
                <p className="text-sm text-[#FF6B55] font-mono font-semibold">{m.after}</p>
                {m.note && <p className="text-[11px] text-text-tertiary mt-0.5">{m.note}</p>}
              </div>
              <div
                className={`px-5 py-4 flex items-center gap-1.5 ${
                  i < ROWS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-[#57D9A3]" />
                <p className="text-sm text-[#57D9A3] font-mono font-semibold">{m.delta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center mt-4">
        DBU rates reference serverless SQL Warehouse Large at $0.70/DBU-hour (public list). Round up for SE-safe quoting.
      </p>
    </div>
  );
}
