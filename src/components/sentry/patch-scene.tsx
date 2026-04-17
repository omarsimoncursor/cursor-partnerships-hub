'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Clock, GitPullRequest, CheckCircle2, User } from 'lucide-react';
import { PRReviewStation } from '@/components/shared/pr-review-station';

const PR_FILES = [
  { name: 'src/services/stripe-client.ts', additions: 4, deletions: 2, status: 'modified' as const },
  { name: 'src/services/payment.ts', additions: 6, deletions: 1, status: 'modified' as const },
  { name: 'src/services/payment.test.ts', additions: 18, deletions: 0, status: 'added' as const },
];

const CI_CHECKS = [
  { name: 'Unit Tests', status: 'passed' as const, duration: '38s' },
  { name: 'Integration Tests', status: 'passed' as const, duration: '1m 04s' },
  { name: 'Codex Review', status: 'approved' as const, duration: '19s' },
  { name: 'Lint & Types', status: 'passed' as const, duration: '11s' },
];

export function PatchScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-patch-metric]', {
        scrollTrigger: { trigger: '[data-patch-metrics]', start: 'top 85%' },
        opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: 'power3.out',
      });
      gsap.from('[data-patch-callout]', {
        scrollTrigger: { trigger: '[data-patch-callout]', start: 'top 85%' },
        opacity: 0, scale: 0.95, duration: 0.6, ease: 'back.out(1.5)',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 4</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Engineer Reviews the PR</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          The Cloud Agent pushes a pull request with the Stripe mapping fix, null guard, and regression tests. CI passes. The engineer reviews before merge &mdash; this is the human-in-the-loop step.
        </p>

        <PRReviewStation
          prTitle="fix: map Stripe v4 charge.id to chargeId + null guard"
          prNumber="#892"
          prDescription="The Stripe SDK v4 upgrade changed the charge response shape: chargeId was renamed to id. Updated the stripe-client mapping layer and added a defensive null check in processPayment. Regression tests cover both the missing property and null response edge cases."
          prFiles={PR_FILES}
          additions={28}
          deletions={3}
          ciChecks={CI_CHECKS}
          accentColor="#4ADE80"
          sourceColor="#e1567c"
        />

        {/* Metrics */}
        <div data-patch-metrics className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 mb-10">
          <div data-patch-metric className="glass-card p-4 text-center">
            <Clock className="w-5 h-5 text-accent-green mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">6 min</p>
            <p className="text-[10px] text-text-tertiary">Error to PR</p>
          </div>
          <div data-patch-metric className="glass-card p-4 text-center">
            <GitPullRequest className="w-5 h-5 text-accent-blue mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">0</p>
            <p className="text-[10px] text-text-tertiary">Engineer debug time</p>
          </div>
          <div data-patch-metric className="glass-card p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-accent-amber mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">4/4</p>
            <p className="text-[10px] text-text-tertiary">CI checks passed</p>
          </div>
        </div>

        {/* Human-in-the-loop callout */}
        <div data-patch-callout className="glass-card p-6 border-l-2 border-accent-green max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary mb-2">Human-in-the-Loop: Review, Not Debug</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                The engineer&apos;s role has fundamentally shifted. Instead of hours of log-diving and stack trace analysis, they review a clean PR with passing tests and an independent AI code review already completed. The control point is the merge button, not the debugger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
