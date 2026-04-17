'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { FileSearch, GitBranch, Brain, Terminal } from 'lucide-react';

const ANALYSIS_LINES = [
  { text: 'Reading pipeline logs from GitLab CI...', prefix: '>' },
  { text: 'Job: unit_tests (failed) on branch feature/order-concurrency', prefix: '>' },
  { text: '', prefix: '' },
  { text: 'Failing test identified:', prefix: '>', color: '#FC6D26' },
  { text: '  src/api/orders/process.test.ts:47', color: '#FC6D26' },
  { text: '  "should handle concurrent inventory updates"', color: '#FC6D26' },
  { text: '', prefix: '' },
  { text: 'Opening source file: src/api/orders/processor.ts', prefix: '>' },
  { text: 'Scanning related modules...', prefix: '>' },
  { text: '', prefix: '' },
  { text: 'Found race condition in processOrder():', prefix: '>', color: '#4ade80' },
  { text: '  Inventory check and decrement are not atomic', color: '#fbbf24' },
  { text: '  Concurrent requests can read stale inventory counts', color: '#fbbf24' },
  { text: '  Missing transaction lock on inventory update', color: '#fbbf24' },
  { text: '', prefix: '' },
  { text: 'Fix strategy: Wrap inventory operations in a transaction', prefix: '>', color: '#4ade80' },
];

const DIAGNOSIS_STEPS = [
  { icon: Terminal, label: 'Parse pipeline logs', detail: 'Extracted failing job output' },
  { icon: FileSearch, label: 'Locate failing test', detail: 'process.test.ts line 47' },
  { icon: GitBranch, label: 'Trace to source', detail: 'processor.ts > processOrder()' },
  { icon: Brain, label: 'Identify root cause', detail: 'Race condition in inventory check' },
];

export function DiagnoseScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-diag-panel]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          onEnter: () => setShowTyping(true),
        },
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-diag-step]', {
        scrollTrigger: {
          trigger: '[data-diag-steps]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 15,
        stagger: 0.2,
        duration: 0.5,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 2</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cursor Reads the Logs</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor ingests the GitLab pipeline logs, pinpoints the failing test, and traces the failure back to the source code. The root cause is identified in seconds.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Diagnosis steps */}
          <div data-diag-steps className="space-y-4">
            {DIAGNOSIS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} data-diag-step className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#FC6D26]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#FC6D26]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                    <p className="text-xs text-text-tertiary">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal output */}
          <div data-diag-panel className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#FC6D26]" />
              <span className="text-xs text-text-tertiary">Cursor AI Diagnosis</span>
            </div>
            <div className="p-4 min-h-[320px]">
              {showTyping && (
                <TypingAnimation
                  lines={ANALYSIS_LINES}
                  speed={20}
                  className="text-xs"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
