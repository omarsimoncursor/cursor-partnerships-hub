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
    label: 'First mitigation live',
    before: '24 min · WAF rule (manual)',
    after: '45 s · WAF rule (Log mode)',
    delta: '−97%',
    note: '(SOC paged at T+8min · with Cursor: T+0)',
  },
  {
    label: 'Edge rate-limit live',
    before: '~36 min',
    after: '90 s · Worker production deploy',
    delta: '−96%',
    note: '(canary route validated first)',
  },
  {
    label: 'App-side PR opened',
    before: '~3 days',
    after: '2 m 30 s · draft, awaiting review',
    delta: '−99%',
    note: '(security-sensitive: human gate enforced)',
  },
  {
    label: 'Humans paged',
    before: 'on-call SOC + on-call eng',
    after: '0',
    delta: '−100%',
    note: '(Slack #sec-ops summary only)',
  },
];

export function MitigationTimeCard() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          Value capture per credential-stuffing event
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          First mitigation in &lt;1 minute. Three defense layers in under 3.
        </h3>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_auto_1.2fr_auto]">
          <div className="hidden md:contents">
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Layer</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Without Cursor</p>
            </div>
            <div className="px-5 py-3 border-b border-dark-border">
              <p className="text-[10px] font-mono text-[#FAAE40] uppercase tracking-wider">With Cursor</p>
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
                <p className="text-sm text-text-secondary font-mono opacity-80">{m.before}</p>
              </div>
              <div className={`px-5 py-4 ${i < METRICS.length - 1 ? 'border-b border-dark-border' : ''}`}>
                <p className="text-sm text-[#FAAE40] font-mono font-semibold">{m.after}</p>
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
        Scales to every credential-stuffing wave, every L7 spike, every misbehaving ASN — across edge config and application code in one workflow.
      </p>
    </div>
  );
}
