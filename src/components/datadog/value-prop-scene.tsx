'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Zap, Cloud, GitPullRequest } from 'lucide-react';

const VALUE_CARDS = [
  {
    icon: Zap,
    title: 'Detect',
    subtitle: 'Datadog',
    description: 'Datadog surfaces the anomaly the moment it starts. The Datadog MCP fires an event payload directly to Cursor, eliminating manual triage entirely.',
    color: '#632CA6',
  },
  {
    icon: Cloud,
    title: 'Orchestrate',
    subtitle: 'Cursor Cloud Agent via MCP',
    description: 'Cursor\'s Cloud Agent receives the MCP event, queries the semantic index, and orchestrates a multi-model pipeline: Opus plans, Composer builds, Codex reviews.',
    color: '#60a5fa',
  },
  {
    icon: GitPullRequest,
    title: 'Ship',
    subtitle: 'Automated PR',
    description: 'A tested, reviewed PR is pushed automatically. The engineer reviews and merges. From incident to production fix without a single line of manual debugging.',
    color: '#4ade80',
  },
];

export function ValuePropScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-vp-logos]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-vp-line]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        scaleX: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('[data-vp-card]', {
        scrollTrigger: {
          trigger: '[data-vp-cards]',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-vp-stat]', {
        scrollTrigger: {
          trigger: '[data-vp-stat]',
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-vp-thesis]', {
        scrollTrigger: {
          trigger: '[data-vp-thesis]',
          start: 'top 85%',
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 5</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Better Together</h2>
        </div>

        {/* Logo connection */}
        <div data-vp-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#632CA6]/20 border border-[#632CA6]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#632CA6]">D</span>
          </div>
          <div data-vp-line className="w-24 h-[2px] bg-gradient-to-r from-[#632CA6] to-accent-blue" />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-blue">C</span>
          </div>
        </div>

        {/* Value prop cards */}
        <div data-vp-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-vp-card className="glass-card p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: card.color + '15' }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">{card.title}</h3>
                <p className="text-xs font-mono mb-3" style={{ color: card.color }}>{card.subtitle}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* MTTR metric */}
        <div data-vp-stat className="glass-card p-10 max-w-md mx-auto text-center border-accent-green/20 mb-12">
          <div className="text-5xl font-bold text-accent-green mb-3">
            <AnimatedCounter target={87} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">Reduction in Mean Time to Resolution</p>
          <p className="text-sm text-text-secondary">
            When Datadog&apos;s detection triggers Cursor&apos;s automated orchestration pipeline via MCP, incident resolution transforms from hours of debugging to minutes of PR review.
          </p>
        </div>

        {/* Platform thesis */}
        <div data-vp-thesis className="glass-card p-6 border-l-2 border-accent-blue">
          <p className="text-base text-text-secondary leading-relaxed">
            Cursor is more than an IDE &mdash; it&apos;s the central orchestration platform for AI-powered development. Through MCP integrations, every tool in the engineering stack becomes an automated trigger. Datadog detects, Cursor orchestrates, engineers review. The future of incident response is already here.
          </p>
        </div>
      </div>
    </section>
  );
}
