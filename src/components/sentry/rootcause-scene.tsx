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
    role: 'Triage & Root Cause',
    description: 'Traces the error across the full dependency graph using semantic indexing. Identifies the Stripe SDK upgrade as root cause.',
    detail: 'Missing property mapping after Stripe v4 upgrade',
  },
  {
    icon: Code2,
    model: 'Cursor Composer',
    modelColor: '#60A5FA',
    role: 'Fix & Guard',
    description: 'Maps response.id to chargeId in stripe-client.ts and adds a defensive null check in the payment service.',
    detail: '2 files modified, null guard added',
  },
  {
    icon: ShieldCheck,
    model: 'GPT Codex',
    modelColor: '#4ADE80',
    role: 'Review & Test',
    description: 'Reviews the fix for correctness, generates regression tests for the missing property and null response edge cases.',
    detail: '2 regression tests, security pass, approved',
  },
];

const TRIAGE_LINES = [
  { text: 'Opus receiving error context from semantic index...', prefix: '>' },
  { text: 'Codebase: 623 files indexed, 9 service modules mapped', prefix: '>' },
  { text: '', prefix: '' },
  { text: 'Tracing TypeError through call chain...', prefix: '>', color: '#A259FF' },
  { text: '  payment.ts:47 → stripe-client.ts:23 → orders/create.ts:89', color: '#60a5fa' },
  { text: '', prefix: '' },
  { text: 'Root cause identified:', prefix: '>', color: '#4ade80' },
  { text: '  stripe-client.ts returns { id, status } on Stripe v4', color: '#fbbf24' },
  { text: '  payment.ts expects { chargeId, status } (pre-v4 shape)', color: '#fbbf24' },
  { text: '  Missing property mapping after SDK upgrade', color: '#fbbf24' },
  { text: '', prefix: '' },
  { text: 'Fix plan: Map charge.id → chargeId + null guard', prefix: '>', color: '#4ade80' },
  { text: 'Handing off to Composer for implementation...', prefix: '>', color: '#60A5FA' },
];

export function RootCauseScene() {
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

      gsap.from('[data-rc-panel]', {
        scrollTrigger: {
          trigger: '[data-rc-panel]',
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
          Cursor&apos;s Cloud Agent routes each phase to the right model. Opus traces root cause using semantic indexing, Composer writes the fix, and Codex verifies correctness.
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
        <div data-rc-panel className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#A259FF]" />
            <span className="text-xs text-text-tertiary">Opus Root Cause Analysis &mdash; Semantic Indexing Context</span>
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
