'use client';

import { ArrowRight, Building2, Clock, MousePointerClick, Sparkles, Workflow } from 'lucide-react';
import { CursorLogo } from './cursor-logo';

interface PrologueProps {
  onBegin: () => void;
}

/**
 * Calm, single-screen prologue that runs before Act 1. Sets the table for
 * the journey: who Acme is, what we're about to demonstrate, what the user
 * is about to do. Intentionally light on numbers — the seven acts will do
 * the arguing. Just orientation.
 */
export function Prologue({ onBegin }: PrologueProps) {
  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center px-6 py-12 md:px-10"
      style={{ background: '#0F1521', color: '#F3F4F6' }}
    >
      {/* Soft amber glow at the top, matching Act 1's mood */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(229,83,0,0.10), transparent 60%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Brand line */}
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{
            borderColor: 'rgba(255,153,0,0.35)',
            background: 'rgba(255,153,0,0.08)',
            color: '#FFC66D',
          }}
        >
          <CursorLogo size={12} tone="dark" />
          Cursor × AWS · Interactive demonstration
        </div>

        {/* Hero */}
        <h1 className="mt-5 text-[34px] font-bold leading-tight md:text-[44px]">
          A real cloud migration, in <span style={{ color: '#FF9900' }}>22 days</span>.
        </h1>

        <p
          className="mt-3 max-w-2xl text-[15px] leading-relaxed md:text-[16px]"
          style={{ color: 'rgba(243,244,246,0.78)' }}
        >
          You&rsquo;re about to step inside <strong className="text-white">Acme Co.</strong> — a 2,000-person retailer with a
          20-year-old monolith, an Oracle deadline 14 months out, and a board meeting in nine days.
          We&rsquo;ll show you the same modernization the team actually shipped, scene by scene, so you can
          see exactly where Cursor&rsquo;s Cloud Agents, MCP marketplace, and multi-agent orchestration
          do the heavy lifting.
        </p>

        {/* Three "what you'll see" cards */}
        <div className="mt-7 grid w-full grid-cols-1 gap-3 text-left md:grid-cols-3">
          <PrologueCard
            n="1"
            icon={<Building2 className="h-4 w-4" />}
            title="The setup"
            body="Why Acme has to migrate now, why the GSI quote is unacceptable, and why AI is the only plan that finishes in time."
          />
          <PrologueCard
            n="2"
            icon={<Workflow className="h-4 w-4" />}
            title="The work"
            body="Watch a fleet of Cursor agents scan, design, port, test, and cut over a real production service — with humans signing every gate."
          />
          <PrologueCard
            n="3"
            icon={<Sparkles className="h-4 w-4" />}
            title="The result"
            body="One service live on AWS in 22 days. The full 38-service portfolio finishes 10 months before Oracle support ends."
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onBegin}
          className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#FF9900', color: '#0F1521' }}
        >
          Begin the journey
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Foot meta */}
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[12px]"
          style={{ color: 'rgba(243,244,246,0.5)' }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> ~5 minutes end-to-end
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="h-3 w-3" /> Click-through at your own pace
          </span>
          <span className="inline-flex items-center gap-1.5">
            7 scenes · 4 human-review gates
          </span>
        </div>
      </div>
    </section>
  );
}

function PrologueCard({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article
      className="flex flex-col gap-2 rounded-xl border px-4 py-3.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold"
          style={{ background: 'rgba(255,153,0,0.18)', color: '#FFC66D' }}
        >
          {n}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#FFC66D' }}>
          {icon}
          {title}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.78)' }}>
        {body}
      </p>
    </article>
  );
}
