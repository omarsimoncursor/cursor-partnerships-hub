'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  Network,
  ScrollText,
  GitPullRequest,
  Clock,
  Workflow,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

export default function ZscalerPartnership() {
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
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#0079D5]/20 border border-[#0079D5]/40 flex items-center justify-center text-lg font-bold text-[#65B5F2]">
              Z
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From Zero Trust violation to merged PR
          </h1>
          <p className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            Zscaler ZPA flags an over-permissive policy. Cursor reads the offending application
            policy out of the codebase, scopes it down, verifies deny-by-default, and submits a PR.
            The reviewer ships the change.
          </p>
          <p className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor sits between the security control plane and the source of truth. This motion is
            repeatable across every ZPA segment a customer governs.
          </p>
          <p className="text-sm text-text-tertiary mb-8">
            Scroll to read the thesis, or jump straight to the live demo.
          </p>

          {/* Live demo CTA */}
          <div className="flex justify-center">
            <Link
              href="/partnerships/zscaler/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#0079D5] text-white font-medium text-sm
                         hover:bg-[#1A8FE8] transition-all duration-200
                         shadow-[0_0_32px_rgba(0,121,213,0.35)] hover:shadow-[0_0_48px_rgba(0,121,213,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live policy-fix demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Thesis: why this matters */}
      <section className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.22em] mb-3">
            The agentic Zero Trust loop
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 max-w-2xl">
            Zscaler sees the violation. The fix lives in the codebase. Cursor closes the loop.
          </h2>
          <p className="text-base text-text-secondary max-w-3xl mb-12">
            Most security toolchains stop at detection. ZPA flags a policy as too broad, opens a
            ticket, paged the security team, and waits for an engineer to translate the ZPA finding
            into a change in code. That last mile takes days. Cursor compresses it to minutes.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <ThesisCard
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Zscaler is the source of policy truth"
              detail="Risk score, scope, posture, identity claims. ZPA already knows what should and should not be reachable."
            />
            <ThesisCard
              icon={<ScrollText className="w-5 h-5" />}
              title="Code is the source of policy implementation"
              detail="The application policy that maps roles, posture, and locations lives in your repo. Cursor reads it, edits it, and verifies it."
            />
            <ThesisCard
              icon={<GitPullRequest className="w-5 h-5" />}
              title="Cursor closes the loop into a PR"
              detail="Triage, patch, lint, typecheck, conformance probe, PR opened, Jira updated. A reviewer approves and merges."
            />
          </div>
        </div>
      </section>

      {/* The motion in 7 steps */}
      <section className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.22em] mb-3">
            What the agent does, every time
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-10 max-w-2xl">
            The Zscaler-Cursor agent contract.
          </h2>

          <ol className="space-y-3">
            <Step
              n="1"
              icon={<Network className="w-4 h-4" />}
              title="Zscaler MCP intake"
              detail="Pull the ZPA risk event, the ZIA web log slice, the affected app segment, the in-scope vs intent user counts."
            />
            <Step
              n="2"
              icon={<KeyRound className="w-4 h-4" />}
              title="Identity context (Okta MCP)"
              detail="Reconcile group claims to confirm what the policy should be — the agent never proposes scope it can't justify."
            />
            <Step
              n="3"
              icon={<Workflow className="w-4 h-4" />}
              title="Regression hunt (GitHub MCP)"
              detail="Find the commit that widened scope. Cite the SHA in the PR body."
            />
            <Step
              n="4"
              icon={<ScrollText className="w-4 h-4" />}
              title="Read the policy and form a hypothesis"
              detail="No edit before the agent has written down what is wrong and what the minimal fix looks like."
            />
            <Step
              n="5"
              icon={<Smartphone className="w-4 h-4" />}
              title="Patch with least privilege"
              detail="Wildcards become explicit allow-lists. Posture becomes required. Locations and IdPs are bounded."
            />
            <Step
              n="6"
              icon={<ShieldCheck className="w-4 h-4" />}
              title="Static and conformance verify"
              detail="tsc + lint, plus a small probe of 4 simulated requests asserting deny-by-default. PR only opens if the probe passes."
            />
            <Step
              n="7"
              icon={<GitPullRequest className="w-4 h-4" />}
              title="Open the PR, update Jira"
              detail="PR body cites the ZPA event, the regression commit, the before/after scope table, and the risk assessment. Jira moves to In Review."
            />
          </ol>
        </div>
      </section>

      {/* Where the value lands */}
      <section className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.22em] mb-3">
            Why this is a co-sell, not a feature
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-10 max-w-2xl">
            Three sides win, none compromise.
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <ValueCard
              tone="green"
              who="The customer"
              detail="Existing ZPA investment becomes a continuous remediation engine. Mean time to scope-down drops from days to minutes."
            />
            <ValueCard
              tone="blue"
              who="Zscaler"
              detail="The Zero Trust Exchange becomes the trigger for code-level remediation, not just a detector. Stickier in every account."
            />
            <ValueCard
              tone="amber"
              who="Cursor"
              detail="Co-selling with Zscaler puts Cursor in front of the security team — a buying center most dev tools never reach."
            />
          </div>

          <div className="mt-12 flex items-center gap-3 text-text-tertiary text-sm">
            <Clock className="w-4 h-4" />
            <span>
              Median measured in the demo: 2m 14s from ZPA risk event to merged-ready PR.
            </span>
          </div>
        </div>
      </section>

      {/* CTA: live demo */}
      <section className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-mono text-[#65B5F2] uppercase tracking-[0.22em] mb-3">
            See it in motion
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Click the button. Live demo opens.
          </h2>
          <p className="text-base text-text-secondary mb-8 max-w-xl mx-auto">
            One click triggers a real over-permissive endpoint, a Zscaler-style takeover, a scripted
            agent run, and four pixel-perfect artifact modals you can hand to a security team.
          </p>
          <Link
            href="/partnerships/zscaler/demo"
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                       bg-[#0079D5] text-white font-semibold text-base
                       hover:bg-[#1A8FE8] transition-all duration-200
                       shadow-[0_0_32px_rgba(0,121,213,0.45)] hover:shadow-[0_0_48px_rgba(0,121,213,0.6)]"
          >
            <PlayCircle className="w-5 h-5" />
            Run the live policy-fix demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Next demo navigation */}
      <div className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/partnerships/datadog"
            className="example-cta-pulse group block rounded-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02]"
            style={{
              borderColor: 'rgba(99, 44, 166, 0.5)',
              backgroundColor: 'rgba(99, 44, 166, 0.12)',
              ['--pulse-color' as string]: 'rgba(99, 44, 166, 0.3)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#A689D4]">
                  Next Partnership Demo
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  Datadog + Cursor: From Incident to Automated Fix
                </h3>
                <p className="text-sm text-text-primary/70 leading-relaxed">
                  See how Datadog catches an SLO breach and Cursor coordinates Opus, Composer, and
                  Codex into a tested PR.
                </p>
              </div>
              <div className="shrink-0 w-14 h-14 rounded-full bg-[#632CA6]/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 text-[#A689D4]" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ThesisCard({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
      <div className="w-10 h-10 rounded-lg bg-[#0079D5]/15 border border-[#0079D5]/30 text-[#65B5F2] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-base font-semibold text-text-primary mb-2">{title}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  detail,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <li className="rounded-xl border border-dark-border bg-dark-surface p-4 flex items-start gap-4">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-[#0079D5]/15 border border-[#0079D5]/30 text-[#65B5F2] flex items-center justify-center font-mono text-[13px]">
        {n}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#65B5F2]">{icon}</span>
          <p className="text-sm md:text-base font-semibold text-text-primary">{title}</p>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
      </div>
    </li>
  );
}

function ValueCard({
  tone,
  who,
  detail,
}: {
  tone: 'green' | 'blue' | 'amber';
  who: string;
  detail: string;
}) {
  const styles =
    tone === 'green'
      ? { ring: 'border-accent-green/25', text: 'text-accent-green' }
      : tone === 'blue'
        ? { ring: 'border-accent-blue/25', text: 'text-accent-blue' }
        : { ring: 'border-accent-amber/25', text: 'text-accent-amber' };
  return (
    <div className={`rounded-xl border ${styles.ring} bg-dark-surface p-5`}>
      <p className={`text-sm font-bold mb-2 ${styles.text}`}>{who}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
