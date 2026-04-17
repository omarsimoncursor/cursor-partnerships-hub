'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Zap, Cloud, GitPullRequest } from 'lucide-react';

const VALUE_CARDS = [
  {
    icon: Zap,
    title: 'Capture',
    subtitle: 'Sentry',
    description: 'Sentry captures runtime errors with full stack traces, breadcrumbs, and user context. The Sentry MCP fires the error payload directly to Cursor, eliminating manual triage.',
    color: '#362D59',
  },
  {
    icon: Cloud,
    title: 'Orchestrate',
    subtitle: 'Cursor Cloud Agent via MCP',
    description: 'Cursor\'s Cloud Agent receives the MCP event, queries the semantic index, and orchestrates a multi-model pipeline: Opus traces root cause, Composer patches, Codex reviews.',
    color: '#60a5fa',
  },
  {
    icon: GitPullRequest,
    title: 'Ship',
    subtitle: 'Automated PR',
    description: 'A tested, reviewed PR with the fix, null guards, and regression tests is pushed automatically. The engineer reviews and merges. From error to production patch without manual debugging.',
    color: '#4ade80',
  },
];

export function SentryValueScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-sv-logos]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-sv-line]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        scaleX: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('[data-sv-card]', {
        scrollTrigger: {
          trigger: '[data-sv-cards]',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-sv-stat]', {
        scrollTrigger: {
          trigger: '[data-sv-stat]',
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-sv-thesis]', {
        scrollTrigger: {
          trigger: '[data-sv-thesis]',
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
        <div data-sv-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#362D59]/20 border border-[#362D59]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#8b7fc7]">S</span>
          </div>
          <div data-sv-line className="w-24 h-[2px] bg-gradient-to-r from-[#362D59] to-accent-blue" />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-blue">C</span>
          </div>
        </div>

        {/* Value prop cards */}
        <div data-sv-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-sv-card className="glass-card p-6">
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
        <div data-sv-stat className="glass-card p-10 max-w-md mx-auto text-center border-accent-green/20 mb-12">
          <div className="text-5xl font-bold text-accent-green mb-3">
            <AnimatedCounter target={92} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">Reduction in Time from Error to Patch</p>
          <p className="text-sm text-text-secondary">
            When Sentry&apos;s error capture triggers Cursor&apos;s automated orchestration pipeline via MCP, debugging transforms from hours of log-diving to minutes of PR review.
          </p>
        </div>

        {/* Platform thesis */}
        <div data-sv-thesis className="glass-card p-6 border-l-2 border-accent-blue">
          <p className="text-base text-text-secondary leading-relaxed">
            Cursor is more than an IDE &mdash; it&apos;s the central orchestration platform for AI-powered development. Through MCP integrations, every tool in the engineering stack becomes an automated trigger. Sentry captures, Cursor orchestrates, engineers review. The future of error resolution is already here.
          </p>
        </div>
      </div>
    </section>
  );
}
