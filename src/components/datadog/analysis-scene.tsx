'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { Brain, Code2, ShieldCheck, Database } from 'lucide-react';
import { FlowPipe } from '@/components/shared/flow-pipe';

const PIPELINE_STAGES = [
  {
    icon: Brain,
    model: 'Claude Opus',
    modelColor: '#A259FF',
    role: 'Triage & Plan',
    description: 'Analyzes the anomaly using full codebase context from semantic indexing. Identifies root cause and plans the fix strategy.',
    detail: 'Sequential await pattern causing latency cascade',
  },
  {
    icon: Code2,
    model: 'Cursor Composer',
    modelColor: '#60A5FA',
    role: 'Implement Fix',
    description: 'Executes the fix plan across multiple files. Parallelizes independent operations and preserves dependency chains.',
    detail: '3 files modified, Promise.all() refactor applied',
  },
  {
    icon: ShieldCheck,
    model: 'GPT Codex',
    modelColor: '#4ADE80',
    role: 'Review & Test',
    description: 'Independent code review, regression test generation, and correctness verification before the PR is pushed.',
    detail: '2 tests generated, 0 issues found, approved',
  },
];

const TRIAGE_LINES = [
  { text: 'Opus receiving anomaly context from semantic index...', prefix: '>' },
  { text: 'Codebase: 847 files indexed, 12 service modules mapped', prefix: '>' },
  { text: '', prefix: '' },
  { text: 'Tracing /api/checkout through dependency graph...', prefix: '>', color: '#A259FF' },
  { text: '  handler.ts → pricing.ts → inventory.ts → payment.ts', color: '#60a5fa' },
  { text: '', prefix: '' },
  { text: 'Root cause identified:', prefix: '>', color: '#4ade80' },
  { text: '  Sequential await on 3 independent async operations', color: '#fbbf24' },
  { text: '  Each await compounds latency under load', color: '#fbbf24' },
  { text: '', prefix: '' },
  { text: 'Fix plan: Parallelize with Promise.all()', prefix: '>', color: '#4ade80' },
  { text: 'Handing off to Composer for implementation...', prefix: '>', color: '#60A5FA' },
];

export function AnalysisScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pipeline-stage]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-pipeline-arrow]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
        opacity: 0,
        scale: 0,
        stagger: 0.3,
        duration: 0.4,
        delay: 0.8,
        ease: 'back.out(2)',
      });

      gsap.from('[data-analysis-panel]', {
        scrollTrigger: {
          trigger: '[data-analysis-panel]',
          start: 'top 80%',
          onEnter: () => setShowTyping(true),
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 3</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Multi-Model Orchestration</h2>
        </div>
        <p className="text-text-secondary mb-4 max-w-2xl">
          Cursor&apos;s Cloud Agent routes each phase to the right model. Opus triages using semantic indexing context, Composer implements the fix, and Codex reviews for quality.
        </p>
        <div className="flex items-center gap-2 mb-12">
          <Database className="w-4 h-4 text-accent-blue" />
          <span className="text-sm text-accent-blue font-medium">Powered by Cursor Semantic Indexing &mdash; full codebase context in every step</span>
        </div>

        {/* Pipeline visualization */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 mb-12">
          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={i} className="flex items-center flex-1">
                <div data-pipeline-stage className="glass-card p-5 flex-1 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stage.modelColor}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stage.modelColor }} />
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${stage.modelColor}15`, color: stage.modelColor }}
                    >
                      {stage.model}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">{stage.role}</h3>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">{stage.description}</p>
                  <div className="pt-3 border-t border-dark-border">
                    <p className="text-[10px] text-text-tertiary uppercase mb-1">Output</p>
                    <p className="text-xs font-mono" style={{ color: stage.modelColor }}>{stage.detail}</p>
                  </div>
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5"
                    style={{ backgroundColor: stage.modelColor }}
                  />
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div data-pipeline-arrow className="hidden md:flex items-center justify-center w-16 shrink-0">
                    <FlowPipe
                      width={64}
                      height={40}
                      color={PIPELINE_STAGES[i + 1].modelColor}
                      packetCount={2}
                      duration={1.4}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Opus triage terminal */}
        <div data-analysis-panel className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#A259FF]" />
            <span className="text-xs text-text-tertiary">Opus Triage &mdash; Semantic Indexing Context</span>
          </div>
          <div className="p-4 min-h-[280px]">
            {showTyping && (
              <TypingAnimation
                lines={TRIAGE_LINES}
                speed={20}
                className="text-xs"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
