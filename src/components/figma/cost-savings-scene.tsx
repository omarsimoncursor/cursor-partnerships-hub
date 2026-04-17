'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { GlassCard } from '@/components/ui/glass-card';
import { ComparisonTable } from '@/components/ui/comparison-table';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export function CostSavingsScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-figma-cost-header]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-cost-table]', {
        scrollTrigger: {
          trigger: '[data-figma-cost-table]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-cost-routing]', {
        scrollTrigger: {
          trigger: '[data-figma-cost-routing]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Dots animate
      gsap.from('[data-figma-cost-dot]', {
        scrollTrigger: {
          trigger: '[data-figma-cost-routing]',
          start: 'top 75%',
        },
        opacity: 0,
        scale: 0,
        stagger: 0.02,
        duration: 0.3,
        ease: 'back.out(2)',
      });

      gsap.from('[data-figma-cost-counter]', {
        scrollTrigger: {
          trigger: '[data-figma-cost-counters]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-cost-example]', {
        scrollTrigger: {
          trigger: '[data-figma-cost-example]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-cost-callout]', {
        scrollTrigger: {
          trigger: '[data-figma-cost-callout]',
          start: 'top 85%',
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const claudeRows = [
    {
      dimension: 'Interface',
      competitor: 'Terminal/GUI, code abstracted',
      cursor: 'Full IDE',
    },
    {
      dimension: 'Models',
      competitor: 'Anthropic only (Claude)',
      cursor: 'Claude + GPT + Gemini + Composer',
    },
    {
      dimension: 'Enterprise',
      competitor: 'Lacks agentic orchestration',
      cursor: 'Enterprise platform, security policies, agentic orchestration',
    },
  ];

  // Generate dots: 15% bright (frontier), 85% dim (fast)
  const totalDots = 40;
  const frontierCount = Math.round(totalDots * 0.15);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div data-figma-cost-header>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 4</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Intelligent Model Routing</h2>
          </div>
          <p className="text-text-secondary mb-12 max-w-3xl">
            Frontier models are 10&ndash;40x more expensive than fast models per query. Most developers send every request to frontier when less than 15% of requests actually require frontier reasoning.
          </p>
        </div>

        {/* Claude Code comparison */}
        <div data-figma-cost-table className="mb-16">
          <ComparisonTable competitorName="Claude Code" rows={claudeRows} />
        </div>

        {/* Model routing visualization */}
        <div data-figma-cost-routing className="mb-16">
          <div className="rounded-xl border border-dark-border bg-dark-surface p-8">
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {Array.from({ length: totalDots }).map((_, i) => {
                const isFrontier = i < frontierCount;
                return (
                  <div
                    key={i}
                    data-figma-cost-dot
                    className={`w-4 h-4 rounded-full ${
                      isFrontier
                        ? 'bg-accent-blue shadow-[0_0_12px_4px_rgba(96,165,250,0.4)]'
                        : 'bg-text-tertiary/30'
                    }`}
                    style={isFrontier ? { animation: 'ctaPulse 2.5s ease-in-out infinite', ['--pulse-color' as string]: 'rgba(96, 165, 250, 0.3)' } : {}}
                  />
                );
              })}
            </div>
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-blue shadow-[0_0_8px_2px_rgba(96,165,250,0.4)]" />
                <span className="text-text-secondary">~15% Frontier</span>
                <span className="text-text-tertiary text-xs">&mdash; Architecture decisions, complex debugging, novel problem solving</span>
              </div>
            </div>
            <div className="flex justify-center gap-8 text-sm mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-text-tertiary/30" />
                <span className="text-text-secondary">~85% Fast</span>
                <span className="text-text-tertiary text-xs">&mdash; Repetative executions, refactors, test generation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost counters */}
        <div data-figma-cost-counters className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div data-figma-cost-counter>
            <GlassCard hover={false} className="text-center">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Without routing</p>
              <p className="text-2xl md:text-3xl font-bold text-accent-red">
                $<AnimatedCounter target={515} suffix="K/year" />
              </p>
            </GlassCard>
          </div>
          <div data-figma-cost-counter>
            <GlassCard hover={false} className="text-center">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">With Cursor routing</p>
              <p className="text-2xl md:text-3xl font-bold text-accent-green">
                $<AnimatedCounter target={99} suffix="K/year" />
              </p>
            </GlassCard>
          </div>
          <div data-figma-cost-counter>
            <GlassCard hover={false} className="text-center">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Savings</p>
              <p className="text-2xl md:text-3xl font-bold text-accent-blue">
                $<AnimatedCounter target={416} suffix="K/year" />
              </p>
              <p className="text-xs text-text-tertiary mt-1">80% reduction</p>
            </GlassCard>
          </div>
        </div>

        {/* Concrete example */}
        <div data-figma-cost-example>
          <h3 className="text-xl font-bold text-text-primary mb-4">Real Example: Figma&apos;s code-connect Repository</h3>
          <p className="text-text-secondary mb-8 max-w-3xl leading-relaxed">
            Figma&apos;s <code className="font-mono text-text-primary bg-cta-bg px-1.5 py-0.5 rounded">code-connect</code> bridges design components to production code across 4 frameworks &mdash; React, SwiftUI, Jetpack Compose, and HTML. Here&apos;s the cost breakdown of a standard develoepr task, a new framework integration:
          </p>

          {/* Cost breakdown table */}
          <div className="rounded-xl border border-dark-border overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-bg">
                  <th className="px-4 py-3 text-left text-xs font-mono text-text-tertiary uppercase tracking-wider border-r border-dark-border">Step</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-text-tertiary uppercase tracking-wider border-r border-dark-border">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-text-tertiary uppercase tracking-wider border-r border-dark-border">Tokens</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-text-tertiary uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-dark-border">
                  <td className="px-4 py-3 text-sm text-text-primary border-r border-dark-border bg-dark-surface">Architect the approach, study React connector, design Angular adapter</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border">Frontier</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border">~100K</td>
                  <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">$1.00</td>
                </tr>
                <tr className="border-t border-dark-border">
                  <td className="px-4 py-3 text-sm text-text-primary border-r border-dark-border bg-dark-surface">Implement + test first binding method</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border">Frontier</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border">~200K</td>
                  <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">$2.00</td>
                </tr>
                <tr className="border-t border-dark-border">
                  <td className="px-4 py-3 text-sm text-text-primary border-r border-dark-border bg-dark-surface">Implement remaining 15&ndash;20 bindings following established pattern</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border">Fast</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border">~500K</td>
                  <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">$0.25</td>
                </tr>
                <tr className="border-t border-dark-border">
                  <td className="px-4 py-3 text-sm text-text-primary border-r border-dark-border bg-dark-surface">Generate tests for repetitive methods</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border">Fast</td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border">~300K</td>
                  <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">$0.15</td>
                </tr>
                <tr className="border-t border-dark-border bg-dark-surface">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary border-r border-dark-border">Total with routing</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border"></td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border"></td>
                  <td className="px-4 py-3 text-sm font-bold text-accent-green text-right font-mono">$3.40</td>
                </tr>
                <tr className="border-t border-dark-border bg-dark-surface">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary border-r border-dark-border">Total without routing (all frontier)</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border"></td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border"></td>
                  <td className="px-4 py-3 text-sm font-bold text-accent-red text-right font-mono">$11.00</td>
                </tr>
                <tr className="border-t border-dark-border bg-dark-surface">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary border-r border-dark-border">Savings</td>
                  <td className="px-4 py-3 text-sm text-text-secondary border-r border-dark-border"></td>
                  <td className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-dark-border"></td>
                  <td className="px-4 py-3 text-sm font-bold text-accent-blue text-right font-mono">69%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Plugin samples callout */}
        <div data-figma-cost-callout>
          <GlassCard hover={false}>
            <p className="text-sm text-text-secondary leading-relaxed">
              Figma&apos;s plugin-samples repo contains 30+ sample plugins. When a new API version ships, Cursor architects the migration pattern on the first plugin with a frontier model, then routes the remaining 29 through a fast model. Same work. Fraction of the cost.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
