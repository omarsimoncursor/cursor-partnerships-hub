'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  GitPullRequest,
  Clock,
  Workflow,
  KeyRound,
  Smartphone,
  FileCode2,
  Network,
  Users,
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
            From ZPA risk event to merged Terraform PR
          </h1>
          <p className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            ZPA flags an over-permissive access rule. Cursor reads the customer&apos;s Terraform
            module, writes the missing SCIM, posture, network, and client conditions, runs
            terraform plan, replays the conformance probe, and submits a PR. Atlantis applies on
            merge. The reviewer ships the change.
          </p>
          <p className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor sits between Zscaler, Okta, and the IaC repo. This is repeatable across every
            ZPA segment a customer governs in Terraform.
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

      {/* The real triage path today */}
      <section className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.22em] mb-3">
            How enterprises triage this today
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 max-w-2xl">
            The 2 to 3 business-day handoff between Risk Operations and Platform Engineering.
          </h2>
          <p className="text-base text-text-secondary max-w-3xl mb-10">
            Most ZPA-as-Code shops follow the same painful path. Risk Operations gets paged, the
            on-call security engineer can&apos;t directly fix the rule because it&apos;s in code,
            so a ticket bounces to the platform team that owns the Terraform module. Days later
            someone writes the missing conditions, the PR sits in review, and Atlantis finally
            applies. Cursor compresses that handoff to minutes without changing who reviews and
            approves.
          </p>

          <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto] text-sm">
              <Header>Step</Header>
              <Header>Owner today</Header>
              <Header className="text-right">Today</Header>
              <Header className="text-right text-[#65B5F2]">With Cursor</Header>

              <Row n="1" task="ZPA Risk Operations gets paged" owner="Sec on-call" today="0" cursor="0" />
              <Row
                n="2"
                task="On-call requests context from app team"
                owner="Sec on-call"
                today="~30 min"
                cursor="auto"
              />
              <Row
                n="3"
                task="Identify policy is IaC-managed"
                owner="App PM + Sec"
                today="~2 hours"
                cursor="auto"
              />
              <Row
                n="4"
                task="Open the .tf, draft missing conditions"
                owner="Platform eng"
                today="~4 hours"
                cursor="<2 min"
              />
              <Row
                n="5"
                task="terraform plan, conformance probe in CI"
                owner="Platform"
                today="~1 hour"
                cursor="auto"
              />
              <Row
                n="6"
                task="Security team reviews + approves PR"
                owner="Sec + Platform"
                today="~1 day"
                cursor="unchanged"
                last
              />
            </div>
          </div>

          <p className="text-sm text-text-tertiary mt-4">
            The reviewer step is intentionally unchanged. Cursor accelerates the work that humans
            were doing badly (correlating ZPA findings to .tf files, writing the conditions,
            running plan, building the evidence packet). It does not bypass the people who say yes.
          </p>
        </div>
      </section>

      {/* The thesis: three sources of truth, one orchestration layer */}
      <section className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.22em] mb-3">
            The agentic Zero Trust loop
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 max-w-2xl">
            Zscaler sees the violation. Terraform owns the policy. Cursor closes the loop.
          </h2>
          <p className="text-base text-text-secondary max-w-3xl mb-12">
            Most security toolchains stop at detection. ZPA flags a segment as too broad, opens a
            risk event, and waits for an engineer to translate the finding into a Terraform change.
            That last mile is what Cursor compresses.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <ThesisCard
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Zscaler is the source of risk truth"
              detail="Risk score, scope, posture, identity claims. ZPA already knows what should and should not be reachable for each app segment."
            />
            <ThesisCard
              icon={<FileCode2 className="w-5 h-5" />}
              title="Terraform is the source of policy truth"
              detail="The zscaler/zpa Terraform provider owns the rule definitions. The fix is HCL: SCIM_GROUP, POSTURE, TRUSTED_NETWORK, CLIENT_TYPE conditions on the right access rule."
            />
            <ThesisCard
              icon={<GitPullRequest className="w-5 h-5" />}
              title="Cursor closes the loop into a PR"
              detail="Triage, edit the .tf, terraform plan, tfsec, conformance probe, PR opened, Jira updated. A reviewer approves; Atlantis applies."
            />
          </div>
        </div>
      </section>

      {/* The motion in 8 steps */}
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
              detail="Pull the ZPA risk event, the ZIA web log slice, the affected app segment, the in-scope vs intent user counts. Cross-reference the IaC owner via segment tags."
            />
            <Step
              n="2"
              icon={<KeyRound className="w-4 h-4" />}
              title="Identity context (Okta MCP)"
              detail="Resolve SCIM groups so the proposed allow-list is justifiable: this many users, these named groups, this is why."
            />
            <Step
              n="3"
              icon={<Workflow className="w-4 h-4" />}
              title="Regression hunt (GitHub MCP)"
              detail="`git log infrastructure/zscaler/` to find the commit that stripped or omitted the conditions. Cite the SHA in the PR body."
            />
            <Step
              n="4"
              icon={<FileCode2 className="w-4 h-4" />}
              title="Read the .tf and form a hypothesis"
              detail="No edit before the agent has written down which condition blocks are missing and what the minimal HCL diff looks like."
            />
            <Step
              n="5"
              icon={<Smartphone className="w-4 h-4" />}
              title="Patch the conditions"
              detail="Add SCIM_GROUP (with OR across the smallest justifiable groups), POSTURE, TRUSTED_NETWORK, CLIENT_TYPE — all wired to existing data sources. The application segment never changes."
            />
            <Step
              n="6"
              icon={<ShieldCheck className="w-4 h-4" />}
              title="terraform plan + tfsec + conformance probe"
              detail="Plan must be in-place-only (no destroy, no recreate). tfsec/checkov must close the broad-scope finding. The probe (4 simulated requests) must restore deny-by-default."
            />
            <Step
              n="7"
              icon={<GitPullRequest className="w-4 h-4" />}
              title="Open the PR, with everything inline"
              detail="HCL diff, terraform plan output, conformance probe results, ZPA event link, regression SHA, risk assessment. The reviewer reads one PR; the evidence is all there."
            />
            <Step
              n="8"
              icon={<Users className="w-4 h-4" />}
              title="Jira update + Atlantis apply"
              detail="CUR-5712 moves to In Review with the PR linked. Reviewer approves. Atlantis runs terraform apply on merge. Risk score drops from 92 to 7."
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
              detail="ZPA + Terraform + a security review pipeline they already trust. Cursor absorbs the Risk Operations &harr; Platform Engineering handoff. Mean time to scope-down drops from days to minutes; the approval gate is unchanged."
            />
            <ValueCard
              tone="blue"
              who="Zscaler"
              detail="ZPA risk events become continuous, automated remediation rather than tickets that age out. The Zero Trust Exchange becomes stickier in every account that has matured to ZPA-as-Code."
            />
            <ValueCard
              tone="amber"
              who="Cursor"
              detail="Co-selling with Zscaler puts Cursor in front of the security and platform teams, two buying centers most dev tools never reach. The motion is repeatable across every Zscaler customer with a Terraform pipeline."
            />
          </div>

          <div className="mt-12 flex items-center gap-3 text-text-tertiary text-sm">
            <Clock className="w-4 h-4" />
            <span>
              Median measured in the demo: 2m 14s from ZPA risk event to merge-ready Terraform PR.
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
            One click reads the real .tf module, runs the real conformance probe, fires the
            scripted agent run, and unlocks four pixel-perfect artifacts you can hand to a
            security or platform team.
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

function Header({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 py-3 border-b border-dark-border bg-dark-bg text-[11px] font-mono uppercase tracking-wider text-text-tertiary ${className}`}
    >
      {children}
    </div>
  );
}

function Row({
  n,
  task,
  owner,
  today,
  cursor,
  last,
}: {
  n: string;
  task: string;
  owner: string;
  today: string;
  cursor: string;
  last?: boolean;
}) {
  const cursorClass =
    cursor === 'auto' || cursor === 'unchanged'
      ? 'text-text-secondary'
      : 'text-accent-green';
  const cursorPrefix = cursor === 'auto' ? 'auto' : cursor === 'unchanged' ? 'unchanged' : cursor;
  return (
    <>
      <div
        className={`px-4 py-3 ${last ? '' : 'border-b border-dark-border'} text-text-tertiary font-mono text-xs flex items-center gap-2`}
      >
        <span className="w-5 h-5 rounded bg-dark-bg border border-dark-border flex items-center justify-center text-[11px] text-text-secondary">
          {n}
        </span>
        <span className="text-text-primary">{task}</span>
      </div>
      <div className={`px-4 py-3 ${last ? '' : 'border-b border-dark-border'} text-text-secondary`}>
        {owner}
      </div>
      <div
        className={`px-4 py-3 text-right font-mono text-text-secondary ${last ? '' : 'border-b border-dark-border'}`}
      >
        {today}
      </div>
      <div
        className={`px-4 py-3 text-right font-mono ${cursorClass} ${last ? '' : 'border-b border-dark-border'}`}
      >
        {cursorPrefix}
      </div>
    </>
  );
}
