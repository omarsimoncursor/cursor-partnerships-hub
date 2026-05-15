'use client';

import { useEffect, useRef } from 'react';
import { Activity, Clock, GitPullRequest, ShieldCheck } from 'lucide-react';
import { gsap } from '@/lib/gsap-init';
import { PRReviewStation } from '@/components/shared/pr-review-station';

const PR_FILES = [
  {
    name: 'src/lib/payments/transfer.ts',
    additions: 4,
    deletions: 218,
    status: 'modified' as const,
  },
];

const CI_CHECKS = [
  { name: 'typecheck', status: 'passed' as const, duration: '3s' },
  { name: 'lint', status: 'passed' as const, duration: '2s' },
  { name: 'unit-tests', status: 'passed' as const, duration: '9s' },
  { name: 'canary-deploy', status: 'passed' as const, duration: '42s' },
  { name: 'slo-gate', status: 'approved' as const, duration: '2s' },
];

export function SdkShipsPrScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-ship-metric]', {
        scrollTrigger: { trigger: '[data-pd-ship-metrics]', start: 'top 85%' },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      });
      gsap.from('[data-pd-ship-callout]', {
        scrollTrigger: { trigger: '[data-pd-ship-callout]', start: 'top 85%' },
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'back.out(1.5)',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">
            Act 4
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            The SDK Ships the Revert
          </h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          The revert subagent opens PR #318 via the GitHub MCP. The deploy subagent gates promotion
          on the canary&apos;s SLO holding for 60 seconds. Only then is the PD incident resolved.
          The on-call wakes up to a PR, not a page.
        </p>

        <PRReviewStation
          prTitle="revert: roll back v1.43.0 (resolves INC-21487)"
          prNumber="#318"
          prDescription="The Cursor SDK's triage subagent identified commit a4f2e1b as the regression. Confidence 0.93. Forward-fix would require a schema migration; revert is mechanical and reversible. Pure subtractive change. CI passed including a new SLO-gate check that held the canary at 5% for 60s of sustained 0.0% 5xx before promoting."
          prFiles={PR_FILES}
          additions={4}
          deletions={218}
          ciChecks={CI_CHECKS}
          accentColor="#06AC38"
          sourceColor="#06AC38"
        />

        {/* Metrics */}
        <div
          data-pd-ship-metrics
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 mb-10"
        >
          <div data-pd-ship-metric className="glass-card p-4 text-center">
            <Clock className="w-5 h-5 text-[#57D990] mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">12s</p>
            <p className="text-[10px] text-text-tertiary">MTTA · ack-by-SDK</p>
          </div>
          <div data-pd-ship-metric className="glass-card p-4 text-center">
            <GitPullRequest className="w-5 h-5 text-accent-blue mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">4m 12s</p>
            <p className="text-[10px] text-text-tertiary">MTTR · trigger-to-resolved</p>
          </div>
          <div data-pd-ship-metric className="glass-card p-4 text-center">
            <Activity className="w-5 h-5 text-[#FFB766] mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">0</p>
            <p className="text-[10px] text-text-tertiary">Humans paged</p>
          </div>
        </div>

        {/* "What the SDK gave you" callout */}
        <div
          data-pd-ship-callout
          className="glass-card p-6 border-l-2 border-[#06AC38] max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#06AC38]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#57D990]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary mb-2">
                What the SDK gave you
              </p>
              <ul className="text-sm text-text-secondary leading-relaxed space-y-1.5">
                <li>
                  <span className="text-text-primary font-medium">You own the runtime.</span>{' '}
                  Self-hosted worker, scoped repo access, admin-enforced network allowlist
                  (Cursor 2.5).
                </li>
                <li>
                  <span className="text-text-primary font-medium">You own the policy.</span>{' '}
                  Confidence threshold, canary gate, change-freeze respect — all live in your
                  TypeScript, not a vendor dashboard.
                </li>
                <li>
                  <span className="text-text-primary font-medium">You own the audit log.</span>{' '}
                  Every <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] text-[#82AAFF] font-mono">run.stream()</code>{' '}
                  event lands in your PD timeline, your Datadog metrics, your S3 archive.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
