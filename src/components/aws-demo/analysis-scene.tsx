'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { Brain, FileSearch, GitBranch, CheckCircle2 } from 'lucide-react';

const ANALYSIS_LINES = [
  { text: 'Analyzing monolith architecture...', prefix: '>' },
  { text: 'Scanning 312 files across 5 core modules...', prefix: '>' },
  { text: 'Detected module boundaries:', prefix: '>' },
  { text: '  Auth       - 23 files, 4 external deps', color: '#FF9900' },
  { text: '  Payments   - 41 files, 6 external deps', color: '#FF9900' },
  { text: '  Orders     - 38 files, 5 external deps', color: '#FF9900' },
  { text: '  Inventory  - 29 files, 3 external deps', color: '#FF9900' },
  { text: '  Notifications - 18 files, 2 external deps', color: '#FF9900' },
  { text: '', prefix: '' },
  { text: 'Dependency analysis:', prefix: '>', color: '#4ade80' },
  { text: '  Orders -> Payments (tight coupling, 14 shared interfaces)', color: '#fbbf24' },
  { text: '  Orders -> Inventory (moderate coupling, 6 shared interfaces)', color: '#fbbf24' },
  { text: '  Auth -> * (shared dependency, extract first)', color: '#fbbf24' },
  { text: '  Notifications -> Orders (event-driven candidate)', color: '#4ade80' },
  { text: '', prefix: '' },
  { text: 'Recommended extraction order:', prefix: '>', color: '#4ade80' },
  { text: '  1. Auth (independent, no downstream deps)', color: '#4ade80' },
  { text: '  2. Notifications (event-driven, low risk)', color: '#4ade80' },
  { text: '  3. Inventory (moderate coupling)', color: '#4ade80' },
  { text: '  4. Payments + Orders (extract together, then separate)', color: '#4ade80' },
];

const ANALYSIS_STEPS = [
  { icon: FileSearch, label: 'Scanning codebase', detail: '312 files analyzed across 5 modules' },
  { icon: GitBranch, label: 'Mapping dependencies', detail: '26 cross-module interfaces found' },
  { icon: Brain, label: 'Identifying boundaries', detail: 'Service boundaries detected' },
  { icon: CheckCircle2, label: 'Extraction plan ready', detail: '4-phase migration recommended' },
];

export function AnalysisScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-aws-analysis-panel]', {
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

      gsap.from('[data-aws-analysis-step]', {
        scrollTrigger: {
          trigger: '[data-aws-analysis-steps]',
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
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cursor Analyzes Service Boundaries</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor scans the entire monolith, maps cross-module dependencies, and identifies optimal service boundaries for extraction.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Analysis steps */}
          <div data-aws-analysis-steps className="space-y-4">
            {ANALYSIS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} data-aws-analysis-step className="glass-card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#FF9900]" />
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
          <div data-aws-analysis-panel className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#FF9900]" />
              <span className="text-xs text-text-tertiary">Cursor AI Analysis</span>
            </div>
            <div className="p-4 min-h-[420px]">
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
