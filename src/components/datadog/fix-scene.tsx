'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Clock, GitPullRequest, CheckCircle2, User } from 'lucide-react';
import { PRReviewStation } from '@/components/shared/pr-review-station';

const PR_FILES = [
  { name: 'src/api/checkout/handler.ts', additions: 6, deletions: 3, status: 'modified' as const },
  { name: 'src/api/checkout/handler.test.ts', additions: 24, deletions: 0, status: 'added' as const },
  { name: 'src/services/payment/gateway.ts', additions: 2, deletions: 1, status: 'modified' as const },
];

const CI_CHECKS = [
  { name: 'Unit Tests', status: 'passed' as const, duration: '42s' },
  { name: 'Integration Tests', status: 'passed' as const, duration: '1m 18s' },
  { name: 'Codex Review', status: 'approved' as const, duration: '23s' },
  { name: 'Lint & Types', status: 'passed' as const, duration: '12s' },
];

export function FixScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-fix-metric]', {
        scrollTrigger: { trigger: '[data-fix-metrics]', start: 'top 85%' },
        opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: 'power3.out',
      });
      gsap.from('[data-fix-callout]', {
        scrollTrigger: { trigger: '[data-fix-callout]', start: 'top 85%' },
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
          The Cloud Agent pushes a pull request to GitHub with the fix and generated tests. CI passes. The engineer&apos;s role shifts from debugging to reviewing &mdash; this is the human-in-the-loop step.
        </p>

        <PRReviewStation
          prTitle="fix: parallelize checkout handler async operations"
          prNumber="#1247"
          prDescription="Refactored sequential awaits in checkout handler to use Promise.all() for independent operations. Pricing and inventory checks now run concurrently. Payment pre-auth preserved as sequential (depends on pricing result). Added regression tests for concurrent execution paths."
          prFiles={PR_FILES}
          additions={32}
          deletions={4}
          ciChecks={CI_CHECKS}
          accentColor="#4ADE80"
          sourceColor="#632CA6"
        />

        {/* Metrics */}
        <div data-fix-metrics className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 mb-10">
          <div data-fix-metric className="glass-card p-4 text-center">
            <Clock className="w-5 h-5 text-accent-green mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">4 min</p>
            <p className="text-[10px] text-text-tertiary">Alert to PR</p>
          </div>
          <div data-fix-metric className="glass-card p-4 text-center">
            <GitPullRequest className="w-5 h-5 text-accent-blue mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">0</p>
            <p className="text-[10px] text-text-tertiary">Engineer debug time</p>
          </div>
          <div data-fix-metric className="glass-card p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-accent-amber mx-auto mb-2" />
            <p className="text-lg font-bold text-text-primary">4/4</p>
            <p className="text-[10px] text-text-tertiary">CI checks passed</p>
          </div>
        </div>

        {/* Human-in-the-loop callout */}
        <div data-fix-callout className="glass-card p-6 border-l-2 border-accent-green max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary mb-2">Human-in-the-Loop: Review, Not Debug</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                The engineer&apos;s role has fundamentally shifted. Instead of spending hours debugging, they review a clean PR with passing tests and an independent AI code review already completed. The control point is the merge button, not the terminal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
