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
    label: 'Per bounded context',
    before: '~16 weeks',
    after: '~22 calendar days',
    delta: '5× faster',
    note: '(4 human review gates included)',
  },
  {
    label: 'Portfolio timeline (38 contexts)',
    before: '5 years',
    after: '18 months',
    delta: '3.3× faster',
    note: '(GSI-quoted MAP · parallelized waves)',
  },
  {
    label: 'Services spend',
    before: 'WebSphere + Oracle + DC',
    after: 'Lambda + Aurora + CW',
    delta: '−75%',
    note: '($8.4M → $2.1M annual)',
  },
  {
    label: 'Managed-service ARR',
    before: 'Deferred ~5y',
    after: 'Pulled forward ~$11M',
    delta: '42mo earlier',
    note: '(quota upside for AE)',
  },
  {
    label: 'Bedrock / Q pull-through',
    before: 'Blocked by legacy',
    after: 'Unlocked per context',
    delta: 'compound',
    note: '(every extraction is Q-ready)',
  },
];

export function TcoComparison() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Value capture per modernization engagement
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Same monolith. 3.3× faster. Managed-service ARR unlocked by Q2, not Q20.
        </h3>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto]">
          <div className="hidden md:contents">
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Metric</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">GSI baseline</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-[#FF9900] uppercase tracking-wider">With Cursor</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Delta</p>
            </div>
          </div>

          {METRICS.map((m, i) => (
            <div key={m.label} className="contents">
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
              </div>
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm text-text-secondary font-mono line-through opacity-70">{m.before}</p>
              </div>
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm text-[#FF9900] font-mono font-semibold">{m.after}</p>
                {m.note && <p className="text-[11px] text-text-tertiary mt-0.5">{m.note}</p>}
              </div>
              <div
                className={`px-5 py-4 flex items-center gap-1.5 ${
                  i < METRICS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-[#00A86B]" />
                <p className="text-sm text-[#00A86B] font-mono font-semibold">{m.delta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center mt-4">
        Scales to every Java EE / .NET / mainframe monolith in the AWS pipeline. Every context Cursor extracts becomes managed-service ARR.
      </p>
    </div>
  );
}
