'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  Rocket,
  DollarSign,
  Users,
  Shield,
  Flame,
} from 'lucide-react';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

const REP_VALUE = [
  {
    icon: Rocket,
    label: 'Pulled-forward ARR',
    body: 'Compressing a 5-year GSI migration to 18 months is ~$45M in Databricks consumption pulled forward per $15M/yr account.',
  },
  {
    icon: DollarSign,
    label: 'Unblocked deals',
    body: 'Migration bill drops from $22M to $6.8M. The customer CFO can approve it. Deals move from "blocked on budget" to "in execution."',
  },
  {
    icon: Users,
    label: 'Clean account',
    body: 'Customer team stays on the keyboard. No GSI middleman. The account stays clean for Genie, Unity Catalog, Mosaic AI expansion.',
  },
] as const;

const GUARDRAILS = [
  'Row-equivalence harness gates every PR',
  'Unity Catalog lineage preserved',
  'No schema widening without explicit note',
  'Human approves before prod promotion',
];

export default function DatabricksPartnership() {
  useSmoothScroll();

  return (
    <div className="min-h-screen">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership Demo</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FF3621]/20 border border-[#FF3621]/35 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#FF6B55]" />
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>

          <p className="text-[11px] font-mono text-[#FF6B55] uppercase tracking-[0.22em] mb-4">
            Databricks + Cursor · Legacy platform migration
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-[1.05]">
            From <span className="text-[#FF6B55]">Informatica + Oracle</span> to <span className="text-[#FF6B55]">Databricks</span>, in months — not years.
          </h1>

          <p className="text-lg text-text-secondary mb-3 max-w-2xl mx-auto">
            Cursor compresses a five-year, twenty-two-million-dollar GSI migration plan into an eighteen-month, $6.8M program — and pulls Databricks consumption forward by ~$45M per account.
          </p>
          <p className="text-sm text-text-tertiary mb-10 max-w-xl mx-auto">
            This demo is built for a Databricks AE to play for a customer stuck on Oracle + Informatica. Click through one real stored procedure walking its full ~18-day enterprise migration lifecycle — agent compute, code review, parallel run, sign-offs, CAB-approved cutover — played back in ~30 seconds.
          </p>

          {/* CTA pill */}
          <div className="flex justify-center mb-16">
            <Link
              href="/partnerships/databricks/demo"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                         bg-[#FF3621] text-white font-medium text-base
                         hover:bg-[#FF5A3C] transition-all duration-200
                         shadow-[0_0_32px_rgba(255,54,33,0.35)] hover:shadow-[0_0_48px_rgba(255,54,33,0.5)]"
            >
              <PlayCircle className="w-5 h-5" />
              Run the live migration demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Partner-rep value bullets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12 text-left">
            {REP_VALUE.map(b => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="rounded-xl border border-[#FF3621]/20 bg-dark-surface/60 backdrop-blur p-5 hover:border-[#FF3621]/35 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-[#FF6B55]" />
                    <p className="text-sm font-semibold text-text-primary">{b.label}</p>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{b.body}</p>
                </div>
              );
            })}
          </div>

          {/* Guardrails summary */}
          <div className="rounded-xl border border-dark-border bg-dark-surface/40 p-5 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <Shield className="w-3.5 h-3.5 text-text-tertiary" />
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                Guardrails every migration PR must clear
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-text-secondary">
              {GUARDRAILS.map((g, i) => (
                <span key={g} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span className="text-text-tertiary">·</span>}
                  <span>{g}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
