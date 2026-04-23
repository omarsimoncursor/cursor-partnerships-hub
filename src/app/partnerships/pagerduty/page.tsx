'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  GitBranch,
  Globe,
  PhoneOff,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { gsap } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

export default function PagerdutyPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-hero-text]', {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen">
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
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div data-pd-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#06AC38]/15 border border-[#06AC38]/35 flex items-center justify-center text-lg font-bold text-[#57D990]">
              PD
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>

          <p
            data-pd-hero-text
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#57D990] mb-3"
          >
            P1 page · 03:14 AM · auto-resolved
          </p>

          <h1
            data-pd-hero-text
            className="text-4xl md:text-6xl font-bold text-text-primary mb-6"
          >
            The page that didn&apos;t fire.
          </h1>

          <p
            data-pd-hero-text
            className="text-lg text-text-secondary mb-3 max-w-xl mx-auto"
          >
            PagerDuty triggers an incident on payments-api at 03:14 AM. Cursor ack&apos;s in 12
            seconds, decides revert vs fix-forward, ships the revert through canary, and resolves
            the incident in 4 minutes — without paging a human.
          </p>

          <p
            data-pd-hero-text
            className="text-sm text-text-tertiary mb-8 max-w-lg mx-auto"
          >
            Cursor becomes the auto-pilot inside your on-call rotation. Same MCPs, same humans —
            the page just resolves itself.
          </p>

          <div data-pd-hero-text className="flex justify-center mb-8">
            <Link
              href="/partnerships/pagerduty/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#06AC38] text-white font-medium text-sm
                         hover:bg-[#08C443] transition-all duration-200
                         shadow-[0_0_32px_rgba(6,172,56,0.35)] hover:shadow-[0_0_48px_rgba(6,172,56,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live auto-resolve demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Quick stat strip */}
          <div data-pd-hero-text className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            <Stat icon={<PhoneOff className="w-3.5 h-3.5 text-[#57D990]" />} label="Humans paged" value="0" />
            <Stat label="MTTR" value="4m 12s" />
            <Stat label="Decisions audited" value="100%" />
          </div>
        </div>
      </section>

      {/* Story strip — five beats */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-tertiary mb-2">
              The motion
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-text-primary">
              Five steps. One PagerDuty incident. Zero phone calls.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Beat
              i={1}
              icon={<Bot className="w-4 h-4 text-[#57D990]" />}
              title="ACK in 12s"
              detail="Auto-pilot acks the incident before the page hits the on-call's phone."
            />
            <Beat
              i={2}
              icon={<GitBranch className="w-4 h-4 text-[#A689D4]" />}
              title="Triage"
              detail="Datadog APM + GitHub commit history fetched in parallel."
            />
            <Beat
              i={3}
              icon={<ShieldCheck className="w-4 h-4 text-accent-blue" />}
              title="Decision"
              detail="Revert vs fix-forward, with confidence threshold and rationale logged."
            />
            <Beat
              i={4}
              icon={<CheckCircle2 className="w-4 h-4 text-[#FFB766]" />}
              title="Canary + SLO"
              detail="5% canary, 60s SLO sustain, then promotion to 100%."
            />
            <Beat
              i={5}
              icon={<Globe className="w-4 h-4 text-[#3DB46D]" />}
              title="Resolve"
              detail="Statuspage + Slack updates posted. PD incident closed. Postmortem drafted."
            />
          </div>

          <div className="mt-12 rounded-2xl border border-[#06AC38]/25 bg-[#06AC38]/5 p-6 md:p-8 text-center">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#57D990] mb-2">
              Click the button. Live demo.
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-3">
              You can&apos;t feel page-suppression in a deck.
            </h3>
            <p className="text-sm text-text-secondary max-w-xl mx-auto mb-5">
              The interactive demo deploys a real bad version of payments-api, fires a real
              incident takeover, and walks you through every MCP call, decision, and canary check
              in real time.
            </p>
            <Link
              href="/partnerships/pagerduty/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                         bg-[#06AC38] text-white font-medium text-sm
                         hover:bg-[#08C443] transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Run the demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5">
      <div className="flex items-center gap-1.5 justify-center mb-1">
        {icon}
        <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-base font-bold font-mono text-text-primary">{value}</p>
    </div>
  );
}

function Beat({
  i,
  icon,
  title,
  detail,
}: {
  i: number;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-4 flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          step {i}
        </span>
      </div>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
