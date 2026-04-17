'use client';

import { Snowflake, Sparkles, TrendingUp, Rocket } from 'lucide-react';

const BULLETS = [
  {
    icon: TrendingUp,
    title: 'Pulled-forward credits',
    body:
      '~$16M in Snowflake credits, 33 months earlier. Every BTEQ or T-SQL asset Cursor modernizes is a workload that runs on Snowflake today, not 4 years from now.',
  },
  {
    icon: Rocket,
    title: 'Win-rate lift vs Databricks & BigQuery',
    body:
      'Snowflake loses bake-offs on "speed of migration." Cursor changes that axis — 266× faster on the first asset, defensible across the portfolio.',
  },
  {
    icon: Sparkles,
    title: 'Cortex + Snowpark pull-through',
    body:
      'Modernized code lights up Cortex AI, SEARCH / SUMMARIZE / COMPLETE, Snowpark Python, dynamic tables, and streams & tasks on day one. Credit-expansion features are pre-wired.',
  },
] as const;

export function RepValueCard() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Snowflake className="w-3.5 h-3.5 text-[#29B5E8]" />
          <p className="text-[11px] font-mono text-[#7DD3F5] uppercase tracking-wider">
            For the Snowflake AE
          </p>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Why you play this demo for your account.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {BULLETS.map(b => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="rounded-xl border border-[#29B5E8]/25 bg-[#11567F]/10 p-5 flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#29B5E8]/15 border border-[#29B5E8]/35 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#7DD3F5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1.5">{b.title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{b.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-tertiary text-center mt-4">
        Credits start flowing the quarter the first BTEQ lands — not the quarter the GSI engagement
        signs off.
      </p>
    </div>
  );
}
