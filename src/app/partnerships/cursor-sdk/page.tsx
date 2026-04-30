'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, MousePointerClick, ChevronDown } from 'lucide-react';
import { GuardrailsPanel } from '@/components/sdk-demo/guardrails-panel';

function CursorMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="675 300 250 343"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M920.015 424.958L805.919 359.086C802.256 356.97 797.735 356.97 794.071 359.086L679.981 424.958C676.901 426.736 675 430.025 675 433.587V566.419C675 569.981 676.901 573.269 679.981 575.048L794.077 640.92C797.74 643.036 802.261 643.036 805.925 640.92L920.02 575.048C923.1 573.269 925.001 569.981 925.001 566.419V433.587C925.001 430.025 923.1 426.736 920.02 424.958H920.015ZM912.848 438.911L802.706 629.682C801.961 630.968 799.995 630.443 799.995 628.954V504.039C799.995 501.543 798.662 499.234 796.498 497.981L688.321 435.526C687.036 434.781 687.561 432.816 689.05 432.816H909.334C912.462 432.816 914.417 436.206 912.853 438.917H912.848V438.911Z"
      />
    </svg>
  );
}

export default function CursorSdkPartnership() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">SDK Demo</span>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center text-text-primary">
                <CursorMark className="w-6 h-6" />
              </div>
              <span className="text-text-tertiary text-2xl">×</span>
              <div className="w-12 h-12 rounded-xl bg-accent-amber/15 border border-accent-amber/30 flex items-center justify-center text-base font-bold text-accent-amber">
                SDK
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-5 tracking-tight">
              Headless Agents. In your stack. Reachable from any webhook.
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Cursor&apos;s SDK brings flexible AI automation to your entire stack. Call agents from
              webhooks, scheduled jobs, SOAR playbooks, or Slack commands. Open the interactive
              demo to build an agentic workflow with Cursor&apos;s SDK.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <Link
              href="/partnerships/cursor-sdk/demo"
              className="example-cta-pulse group inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-accent-blue text-dark-bg font-semibold shadow-[0_0_0_1px_rgba(96,165,250,0.4),0_8px_24px_rgba(96,165,250,0.25)] hover:bg-accent-blue/90 transition-all duration-200"
              style={{ ['--pulse-color' as string]: 'rgba(96,165,250,0.35)' }}
            >
              <MousePointerClick className="w-4 h-4" />
              Open the live builder
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-16">
            <PitchCard
              step="1"
              title="Pick your tools"
              body="8 security tools in the palette: GitGuardian, Wiz, Snyk, CrowdStrike, Okta, Splunk, Zscaler, Vanta. Pick an event each one fires."
            />
            <PitchCard
              step="2"
              title="Compose the response"
              body="14 actions across containment, remediation, and audit. The action list orders itself containment-first, the way a real responder works."
            />
            <PitchCard
              step="3"
              title="Run the SDK"
              body="The TypeScript code on the right updates as you click. Hit Run to watch it execute across 6+ MCPs in under a minute, with full audit trail."
            />
          </div>

          <div className="mb-16">
            <GuardrailsPanel />
          </div>

          <div className="rounded-2xl border border-dark-border bg-dark-surface p-6 md:p-8">
            <p className="text-[11px] font-mono text-accent-amber uppercase tracking-[0.2em] mb-2">
              For the security AE
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-4">
              Why this lands with a CISO and a platform-engineering lead at the same time.
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <li className="flex items-start gap-3">
                <ChevronDown className="w-4 h-4 mt-1 text-accent-blue rotate-[-90deg] shrink-0" />
                <span>
                  <span className="text-text-primary font-medium">CISO</span>: Every detection in
                  every tool ends in a contained incident with audit-grade evidence the auditor
                  will accept. MTTR collapses from hours to seconds.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronDown className="w-4 h-4 mt-1 text-accent-blue rotate-[-90deg] shrink-0" />
                <span>
                  <span className="text-text-primary font-medium">Platform engineering</span>: The
                  SDK ships as a small, ordinary Node webhook handler in their existing repo. They
                  index the run events in Splunk. They version-control the agent prompt alongside
                  application code.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronDown className="w-4 h-4 mt-1 text-accent-blue rotate-[-90deg] shrink-0" />
                <span>
                  <span className="text-text-primary font-medium">Security partners</span>:
                  GitGuardian, Wiz, Snyk, CrowdStrike, Okta and others stop at &quot;we found
                  something&quot;. Cursor is the integration that takes them to &quot;and we fixed
                  it&quot;, programmable from any of their existing webhook surfaces.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function PitchCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-mono font-bold flex items-center justify-center">
          {step}
        </div>
        <p className="text-base font-semibold text-text-primary">{title}</p>
      </div>
      <p className="text-[13.5px] text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}
