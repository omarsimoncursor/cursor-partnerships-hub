'use client';

import { Briefcase, Rocket, DollarSign, Users } from 'lucide-react';

const BULLETS = [
  {
    icon: Rocket,
    title: 'Pulled-forward ARR',
    body: (
      <>
        At a <span className="font-mono text-[#FF6B55]">$15M/yr</span> committed-use target, compressing a 5-year migration to 18 months is worth{' '}
        <span className="font-semibold text-text-primary">~$45M in consumption pulled forward per account.</span>
      </>
    ),
  },
  {
    icon: DollarSign,
    title: 'Unblocked deals',
    body: (
      <>
        Migration bill drops from <span className="font-mono text-[#FFB98E]">$22M</span> to{' '}
        <span className="font-mono text-[#57D9A3]">$6.8M</span>. The customer CFO can budget it; the AE can actually close.
      </>
    ),
  },
  {
    icon: Users,
    title: 'Clean account, no GSI middleman',
    body: (
      <>
        Customer&apos;s own team stays on the keyboard. Account stays clean for expansion — Genie, Unity Catalog, Mosaic AI, foundation models — without a SI tollbooth.
      </>
    ),
  },
] as const;

export function RepValueCard() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-xl border border-[#FF3621]/25 bg-gradient-to-br from-[#1B0D0B] via-dark-surface to-dark-surface p-6 md:p-7">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#FF3621]/15 border border-[#FF3621]/35 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-[#FF6B55]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono text-[#FF6B55] uppercase tracking-[0.18em] mb-1">
              For the Databricks AE
            </p>
            <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-tight">
              Why you play this demo: every quarter of migration compressed is a quarter of Databricks consumption earlier.
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BULLETS.map(b => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="rounded-lg border border-dark-border bg-dark-bg/60 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-[#FF6B55]" />
                  <p className="text-sm font-semibold text-text-primary">{b.title}</p>
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed">{b.body}</p>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-text-tertiary mt-5 text-center leading-relaxed">
          Defensive against Snowflake / BigQuery: customers who can migrate fast don&apos;t bake off. Cursor is the faster path.
        </p>
      </div>
    </div>
  );
}
