'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Zap, Shield, RefreshCw } from 'lucide-react';

const VALUE_CARDS = [
  {
    icon: Zap,
    title: 'Faster Pipeline Recovery',
    description: 'Cursor reads GitLab CI logs, identifies failing tests, and traces them back to root cause. No more manual log parsing or guesswork.',
    color: '#FC6D26',
  },
  {
    icon: Shield,
    title: 'Fixes That Pass the First Time',
    description: 'Cursor generates targeted fixes with full codebase context, so the pipeline goes green on the next push, not after multiple retry cycles.',
    color: '#60a5fa',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Quality Loops',
    description: 'GitLab catches regressions early. Cursor resolves them fast. Together, they keep the main branch deployable at all times.',
    color: '#4ade80',
  },
];

export function GitLabValueScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-glvp-logos]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-glvp-line]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        scaleX: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('[data-glvp-card]', {
        scrollTrigger: {
          trigger: '[data-glvp-cards]',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-glvp-stat]', {
        scrollTrigger: {
          trigger: '[data-glvp-stat]',
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
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
        <div data-glvp-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#FC6D26]/20 border border-[#FC6D26]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#FC6D26]">G</span>
          </div>
          <div data-glvp-line className="w-24 h-[2px] bg-gradient-to-r from-[#FC6D26] to-accent-blue" />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-blue">C</span>
          </div>
        </div>

        {/* Value prop cards */}
        <div data-glvp-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-glvp-card className="glass-card p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: card.color + '15' }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">{card.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* MTTR metric */}
        <div data-glvp-stat className="glass-card p-10 max-w-md mx-auto text-center border-accent-green/20">
          <div className="text-5xl font-bold text-accent-green mb-3">
            <AnimatedCounter target={85} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">Faster Pipeline Recovery</p>
          <p className="text-sm text-text-secondary">
            When GitLab catches failures early and Cursor resolves them instantly, broken pipelines become a minor interruption instead of a blocker.
          </p>
        </div>
      </div>
    </section>
  );
}
