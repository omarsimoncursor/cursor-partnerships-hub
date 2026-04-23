'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, PlayCircle, ShieldAlert, GitPullRequest, Users, Box, Code as CodeIcon, Package, Cloud } from 'lucide-react';

const SNYK_PRODUCTS = [
  {
    icon: CodeIcon,
    name: 'Snyk Code',
    detail: 'SAST findings stream into the agent the moment a critical lands.',
  },
  {
    icon: Package,
    name: 'Snyk Open Source',
    detail: 'Dependency CVEs trigger upgrade PRs that respect the lockfile.',
  },
  {
    icon: Box,
    name: 'Snyk Container',
    detail: 'Base-image bumps and Dockerfile rewrites that keep the build green.',
  },
  {
    icon: Cloud,
    name: 'Snyk IaC',
    detail: 'Misconfig fixes against the same Terraform the developer wrote.',
  },
] as const;

export default function SnykPartnership() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/partnerships" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#4C44CB]/20 border border-[#4C44CB]/30 flex items-center justify-center text-lg font-bold text-[#9F98FF]">
              S
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From Snyk Critical to Verified PR
          </h1>
          <p className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            Snyk finds the vulnerability. Cursor produces the fix. The agent
            triages the data flow, parameterizes the call site, bumps the
            vulnerable dependency, and replays the exploit, all before AppSec
            opens a debugger. The human-in-the-loop reviews the PR before deploy.
          </p>
          <p className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor is the orchestration layer between Snyk, GitHub, Jira, and
            the developer&apos;s editor. This motion is repeatable across every Snyk
            customer.
          </p>
          <p className="text-sm text-text-tertiary mb-8">
            Scroll for the workflow, or jump straight into the live demo.
          </p>

          <div className="flex justify-center">
            <Link
              href="/partnerships/snyk/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#4C44CB] text-white font-medium text-sm
                         hover:bg-[#5C54E0] transition-all duration-200
                         shadow-[0_0_32px_rgba(76,68,203,0.35)] hover:shadow-[0_0_48px_rgba(76,68,203,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live demo
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-mono text-[#9F98FF] uppercase tracking-[0.22em] mb-2">
              The motion
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Snyk catches it. Cursor closes it.
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Every Snyk critical becomes a tested, evidence-backed PR — without
              an engineer touching the keyboard until the review step.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <WorkflowCard
              step="1"
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Detect"
              detail="Snyk Code, Open Source, Container, and IaC stream findings into the project's MCP. The Cursor agent is invited as a reviewer the moment a critical lands."
            />
            <WorkflowCard
              step="2"
              icon={<Users className="w-5 h-5" />}
              title="Orchestrate"
              detail="Opus triages the data flow with line-level citations. Composer applies the fix. Codex reviews. Shell verifies the exploit is dead. Snyk re-tests clean."
            />
            <WorkflowCard
              step="3"
              icon={<GitPullRequest className="w-5 h-5" />}
              title="Ship"
              detail="A single PR lands with the exploit-replay table, the regression commit citation, and full audit trail. AppSec reviews. Engineering merges."
            />
          </div>
        </div>
      </section>

      {/* Snyk product surface */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-mono text-[#9F98FF] uppercase tracking-[0.22em] mb-2">
              Coverage
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              One agent across every Snyk product.
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              SAST, SCA, container, IaC. Same orchestration loop, different
              MCPs, identical guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {SNYK_PRODUCTS.map(p => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="rounded-xl border border-dark-border bg-dark-surface p-5 flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#4C44CB]/15 border border-[#4C44CB]/30 flex items-center justify-center text-[#9F98FF]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{p.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Co-sell value */}
      <section className="py-24 px-6 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-mono text-[#9F98FF] uppercase tracking-[0.22em] mb-2">
              Why this co-sell works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Snyk wins. The customer wins. AppSec wins.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <ValueCard
              title="Snyk wins"
              detail="Every finding becomes a closed PR, not a backlog item. The platform is sticky precisely because it's now actionable, not advisory."
            />
            <ValueCard
              title="The customer wins"
              detail="MTTR on critical Snyk findings drops from days to minutes. The security backlog shrinks to zero at the medium threshold."
            />
            <ValueCard
              title="AppSec wins"
              detail="No more triage rotations on tainted-input bugs. AppSec reviews PRs instead of debugging them — and ships their week's roadmap."
            />
          </div>

          <div className="text-center mt-10">
            <Link
              href="/partnerships/snyk/demo"
              className="inline-flex items-center gap-2 text-sm text-[#9F98FF] hover:underline"
            >
              See it run live
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-dark-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-text-tertiary mb-6">
            This page demonstrates the type of co-branded content that could be produced for each partnership motion.
          </p>
          <div className="flex items-center justify-center gap-8">
            <Link
              href="/partnerships"
              className="inline-flex items-center gap-2 text-sm text-accent-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Partnerships
            </Link>
            <Link
              href="/partnerships/snyk/demo"
              className="inline-flex items-center gap-2 text-sm text-text-primary hover:text-[#9F98FF] transition-colors font-medium"
            >
              Run the live demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkflowCard({
  step,
  icon,
  title,
  detail,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-full bg-[#4C44CB] text-white text-xs font-bold flex items-center justify-center">
          {step}
        </span>
        <div className="text-[#9F98FF]">{icon}</div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}

function ValueCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
      <p className="text-sm font-semibold text-[#9F98FF] mb-2">{title}</p>
      <p className="text-sm text-text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}
