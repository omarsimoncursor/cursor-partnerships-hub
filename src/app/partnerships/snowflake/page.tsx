'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  PlayCircle,
  Rocket,
  Shield,
  Snowflake,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ACTS } from '@/components/snowflake-story/story-types';

export default function SnowflakePartnership() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-border bg-dark-bg/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Partnerships
          </Link>
          <span className="font-mono text-sm text-text-tertiary">Partnership Demo</span>
        </div>
      </nav>

      <section className="flex min-h-screen items-center justify-center px-6 pb-16 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#29B5E8]/40 bg-[#29B5E8]/20">
              <Snowflake className="h-6 w-6 text-[#29B5E8]" />
            </div>
            <span className="text-2xl text-text-tertiary">+</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-blue/30 bg-accent-blue/20 text-lg font-bold text-accent-blue">
              C
            </div>
          </div>

          <span className="mb-4 inline-block font-mono text-[11px] uppercase tracking-[0.25em] text-[#7DD3F5]">
            A 7-act story, told through the emails that actually got sent
          </span>
          <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-text-primary md:text-6xl">
            From a rejected $18M GSI quote
            <br className="hidden md:block" />
            to Teradata going dark, in 15 months.
          </h1>
          <p className="mx-auto mb-3 max-w-2xl text-lg leading-relaxed text-text-secondary">
            A principal data engineer with a decade of Teradata BTEQ on her team&apos;s shoulders
            hands Cursor her legacy ELT portfolio. The reviewer still holds every merge. Snowflake
            credits start flowing on asset #1, not asset #911.
          </p>
          <p className="mx-auto mb-10 max-w-xl text-sm text-text-tertiary">
            Seven chapters. Every one is interactive. Runs in about 8 minutes — built for a
            non-technical audience.
          </p>

          <div className="mb-12 flex justify-center">
            <Link
              href="/partnerships/snowflake/demo"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#29B5E8] px-6 py-3 text-base font-semibold text-[#0A1419] shadow-[0_0_32px_rgba(41,181,232,0.4)] transition-all duration-200 hover:bg-[#4FC3EE] hover:shadow-[0_0_48px_rgba(41,181,232,0.55)]"
            >
              <PlayCircle className="h-5 w-5" />
              Play the 7-act story
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-2 md:grid-cols-7">
            {ACTS.map((act) => (
              <div
                key={act.id}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 text-left"
              >
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7DD3F5]">
                  Act {act.number.toString().padStart(2, '0')}
                </p>
                <p className="text-[13px] font-semibold leading-tight text-text-primary">
                  {act.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-text-tertiary">
                  {act.subtitle}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 text-left md:grid-cols-3">
            <RepBullet
              icon={TrendingUp}
              title="~$16M pulled-forward credits"
              body="33 months earlier than the GSI baseline — value starts compounding now, not in 2030."
            />
            <RepBullet
              icon={Rocket}
              title="The team keeps the keyboard"
              body="Role titles, not headshots. Every email in the story is an internal one — Cursor earns each next step."
            />
            <RepBullet
              icon={Sparkles}
              title="Cortex + Snowpark, automatically"
              body="Modernized code lights up the native features that drive expansion — no extra engagement needed."
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-dark-border bg-dark-surface px-4 py-2 text-[11.5px] text-text-secondary">
            <Shield className="h-3.5 w-3.5 text-[#7DD3F5]" />
            Row-level equivalence + Cortex semantic diff + human-approved merges throughout.
          </div>
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] text-text-tertiary">
            <Mail className="h-3 w-3" />
            Story told through internal emails — no chat bubbles, no sales rep.
          </p>
        </div>
      </section>
    </div>
  );
}

function RepBullet({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#29B5E8]/25 bg-[#11567F]/10 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#29B5E8]/35 bg-[#29B5E8]/15">
        <Icon className="h-4 w-4 text-[#7DD3F5]" />
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs leading-relaxed text-text-secondary">{body}</p>
      </div>
    </div>
  );
}
