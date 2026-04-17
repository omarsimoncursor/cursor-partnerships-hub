'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, PlayCircle, Shield, Snowflake, Sparkles, Rocket, TrendingUp } from 'lucide-react';
import { ACTS } from '@/components/snowflake-story/story-types';

export default function SnowflakePartnership() {
  return (
    <div className="min-h-screen">
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

      <section className="min-h-screen flex items-center justify-center px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#29B5E8]/20 border border-[#29B5E8]/40 flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-[#29B5E8]" />
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>

          <span className="inline-block text-[11px] font-mono uppercase tracking-[0.25em] text-[#7DD3F5] mb-4">
            A 7-act story about one enterprise modernization
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold text-text-primary mb-5 tracking-tight leading-tight">
            From a rejected $18M GSI quote
            <br className="hidden md:block" />
            to a lit-up Snowflake wall, in 15 months.
          </h1>
          <p className="text-lg text-text-secondary mb-3 max-w-2xl mx-auto leading-relaxed">
            Watch Maya Alfaro — a principal data engineer with a decade of Teradata BTEQ on her
            shoulders — hand Cursor her legacy ELT portfolio. Her team keeps the keyboard.
            Jordan Park still gates every merge. Credits start flowing on asset #1, not asset #911.
          </p>
          <p className="text-sm text-text-tertiary mb-10 max-w-xl mx-auto">
            Click through seven chapters. Every one has an interactive beat. Total runtime is
            ~8 minutes — and it&apos;s the demo a Snowflake AE plays on their next modernization call.
          </p>

          <div className="flex justify-center mb-12">
            <Link
              href="/partnerships/snowflake/demo"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                         bg-[#29B5E8] text-[#0A1419] font-semibold text-base
                         hover:bg-[#4FC3EE] transition-all duration-200
                         shadow-[0_0_32px_rgba(41,181,232,0.4)] hover:shadow-[0_0_48px_rgba(41,181,232,0.55)]"
            >
              <PlayCircle className="w-5 h-5" />
              Play the 7-act story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-10 max-w-5xl mx-auto">
            {ACTS.map((act) => (
              <div
                key={act.id}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 text-left"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5] mb-1">
                  Act {act.number.toString().padStart(2, '0')}
                </p>
                <p className="text-[13px] font-semibold text-text-primary leading-tight">
                  {act.title}
                </p>
                <p className="text-[10.5px] text-text-tertiary mt-1 leading-snug line-clamp-2">
                  {act.subtitle}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left mb-6">
            <RepBullet
              icon={TrendingUp}
              title="~$16M pulled-forward credits"
              body="33 months earlier than the GSI baseline — quota retirement now, not in 2030."
            />
            <RepBullet
              icon={Rocket}
              title="Win-rate lift vs Databricks + BigQuery"
              body="Speed-of-migration is where Snowflake loses. This demo flips the axis in 8 minutes."
            />
            <RepBullet
              icon={Sparkles}
              title="Cortex + Snowpark pull-through"
              body="Modernized code lights up the native features that drive expansion — automatically."
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-border bg-dark-surface text-[11.5px] text-text-secondary">
            <Shield className="w-3.5 h-3.5 text-[#7DD3F5]" />
            Row-level equivalence + Cortex semantic diff + human-approved merges throughout.
          </div>
        </div>
      </section>
    </div>
  );
}

function RepBullet({
  icon: Icon, title, body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-[#29B5E8]/25 bg-[#11567F]/10 p-4 flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#29B5E8]/15 border border-[#29B5E8]/35 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#7DD3F5]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
        <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
