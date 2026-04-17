'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { XCircle, CheckCircle2, Clock, GitBranch, Loader2 } from 'lucide-react';

const PIPELINE_STAGES = [
  { name: 'Build', status: 'passed', duration: '1m 23s' },
  { name: 'Test', status: 'failed', duration: '3m 47s' },
  { name: 'Deploy', status: 'skipped', duration: '--' },
];

const LOG_LINES = [
  { text: '$ npm run test', type: 'command' },
  { text: '', type: 'blank' },
  { text: '> jest --ci --coverage', type: 'info' },
  { text: '', type: 'blank' },
  { text: ' PASS  src/utils/format.test.ts', type: 'pass' },
  { text: ' PASS  src/api/auth.test.ts', type: 'pass' },
  { text: ' PASS  src/api/users.test.ts', type: 'pass' },
  { text: ' FAIL  src/api/orders/process.test.ts', type: 'fail' },
  { text: '', type: 'blank' },
  { text: '  OrderProcessor > processOrder', type: 'info' },
  { text: '    > should handle concurrent inventory updates', type: 'info' },
  { text: '', type: 'blank' },
  { text: '    Expected: { status: "confirmed", items: 3 }', type: 'info' },
  { text: '    Received: { status: "partial", items: 2 }', type: 'error' },
  { text: '', type: 'blank' },
  { text: '      at Object.<anonymous> (src/api/orders/process.test.ts:47:18)', type: 'error' },
  { text: '', type: 'blank' },
  { text: 'Tests:       1 failed, 3 passed, 4 total', type: 'summary' },
  { text: 'Time:        3.47s', type: 'info' },
  { text: '', type: 'blank' },
  { text: 'ERROR: Job failed: exit code 1', type: 'error' },
];

export function PipelineScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-gl-pipeline]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-gl-stage]', {
        scrollTrigger: {
          trigger: '[data-gl-stages]',
          start: 'top 80%',
        },
        opacity: 0,
        scale: 0.9,
        stagger: 0.15,
        duration: 0.5,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-gl-log-line]', {
        scrollTrigger: {
          trigger: '[data-gl-logs]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -5,
        stagger: 0.04,
        duration: 0.3,
        delay: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-gl-fail-banner]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        delay: 0.8,
        ease: 'back.out(1.5)',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 1</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Pipeline Fails</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          A merge request triggers the GitLab CI/CD pipeline. The build passes, but the test stage fails with a failing assertion in the order processing module.
        </p>

        {/* Pipeline mockup */}
        <div data-gl-pipeline className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          {/* Pipeline header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-bg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#FC6D26] flex items-center justify-center">
                <GitBranch className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-text-secondary">GitLab CI/CD</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5m 10s</span>
              <span className="font-mono">#48291</span>
            </div>
          </div>

          {/* Pipeline info */}
          <div className="px-6 py-3 border-b border-dark-border flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <GitBranch className="w-3 h-3" />
              <span className="font-mono">feature/order-concurrency</span>
            </div>
            <span className="text-xs text-text-tertiary">by Alex Chen</span>
          </div>

          {/* Failure banner */}
          <div data-gl-fail-banner className="mx-4 mt-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-accent-red mb-1">
                Pipeline Failed
              </p>
              <p className="text-xs text-text-secondary font-mono">
                Stage: test &bull; Job: unit_tests &bull; Exit code 1
              </p>
            </div>
          </div>

          {/* Pipeline stages */}
          <div data-gl-stages className="px-6 py-6">
            <div className="flex items-center gap-3">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    data-gl-stage
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                      stage.status === 'passed'
                        ? 'bg-accent-green/10 border-accent-green/20'
                        : stage.status === 'failed'
                        ? 'bg-accent-red/10 border-accent-red/20'
                        : 'bg-dark-bg border-dark-border opacity-50'
                    }`}
                  >
                    {stage.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-accent-green" />}
                    {stage.status === 'failed' && <XCircle className="w-4 h-4 text-accent-red" />}
                    {stage.status === 'skipped' && <Loader2 className="w-4 h-4 text-text-tertiary" />}
                    <div>
                      <p className={`text-sm font-medium ${
                        stage.status === 'passed' ? 'text-accent-green' :
                        stage.status === 'failed' ? 'text-accent-red' : 'text-text-tertiary'
                      }`}>{stage.name}</p>
                      <p className="text-[10px] text-text-tertiary">{stage.duration}</p>
                    </div>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className={`w-8 h-[2px] ${
                      stage.status === 'passed' ? 'bg-accent-green/30' : 'bg-dark-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Log output */}
          <div data-gl-logs className="mx-4 mb-4 rounded-lg bg-dark-bg border border-dark-border overflow-hidden">
            <div className="px-4 py-2 border-b border-dark-border flex items-center gap-2">
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Job Output</span>
              <span className="text-[10px] font-mono text-accent-red">unit_tests</span>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              {LOG_LINES.map((line, i) => (
                <div key={i} data-gl-log-line className="font-mono text-xs leading-5">
                  {line.type === 'blank' ? (
                    <span>&nbsp;</span>
                  ) : (
                    <span className={
                      line.type === 'command' ? 'text-accent-blue' :
                      line.type === 'pass' ? 'text-accent-green' :
                      line.type === 'fail' ? 'text-accent-red font-semibold' :
                      line.type === 'error' ? 'text-accent-red' :
                      line.type === 'summary' ? 'text-accent-amber' :
                      'text-text-secondary'
                    }>
                      {line.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
