'use client';

import { TrendingUp, Handshake, Sparkles } from 'lucide-react';

const REP_VALUE = [
  {
    icon: TrendingUp,
    label: 'Pulled-forward managed-service ARR',
    detail:
      'Every EJB or stored proc Cursor modernizes becomes Lambda + Aurora consumption 42 months sooner. ~$11M ARR per Fortune 1000 account, captured inside the current quota year.',
  },
  {
    icon: Handshake,
    label: 'MAP engagements that actually finish',
    detail:
      'MAP credits only settle when workloads modernize. Cursor keeps the in-house team on the keyboard — no GSI middleman, no 5-year timeline. MAP success rate, not just MAP attach.',
  },
  {
    icon: Sparkles,
    label: 'Bedrock + Amazon Q pull-through',
    detail:
      'Every Cursor-extracted context lands on Aurora Serverless v2 and Lambda in AWS SDK v3 — already Bedrock-agent and Q Developer ready. Net-new AI ARR on the same account.',
  },
] as const;

export function RepValueCard() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-[#FF9900] uppercase tracking-wider">
            For the AWS rep
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          What this unlocks for your book.
        </h3>
        <p className="text-xs text-text-tertiary mt-2 max-w-xl mx-auto">
          The customer&apos;s buyer sees modernization. The AE / SA / PDM sees three quota levers inside the current fiscal year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REP_VALUE.map(v => {
          const Icon = v.icon;
          return (
            <div
              key={v.label}
              className="rounded-xl border border-[#FF9900]/20 bg-dark-surface p-4 flex flex-col gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#FF9900]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary mb-1">{v.label}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{v.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
