'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Zap, Shield, Layers, TrendingUp } from 'lucide-react';

const VALUE_CARDS = [
  {
    icon: Layers,
    title: 'Intelligent Decomposition',
    description: 'Cursor analyzes the full codebase to identify clean service boundaries, minimizing cross-service coupling and data dependencies.',
    color: '#FF9900',
  },
  {
    icon: Shield,
    title: 'Production-Ready Infrastructure',
    description: 'Generated Terraform and CDK code follows AWS best practices with proper security groups, IAM roles, and multi-AZ deployments.',
    color: '#60a5fa',
  },
  {
    icon: TrendingUp,
    title: 'Accelerated Migration',
    description: 'What traditionally takes quarters of engineering work is reduced to weeks with AI-assisted code extraction and infrastructure generation.',
    color: '#4ade80',
  },
];

const MIGRATION_STATS = [
  { label: 'Lines Refactored', value: 47200, suffix: '' },
  { label: 'Services Extracted', value: 5, suffix: '' },
  { label: 'Terraform Resources', value: 43, suffix: '' },
  { label: 'Weeks Saved', value: 14, suffix: '' },
];

export function AWSValueScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-aws-vp-logos]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-aws-vp-line]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        scaleX: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('[data-aws-vp-card]', {
        scrollTrigger: {
          trigger: '[data-aws-vp-cards]',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-aws-vp-stat]', {
        scrollTrigger: {
          trigger: '[data-aws-vp-stats]',
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
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
        <div data-aws-vp-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#FF9900]/20 border border-[#FF9900]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#FF9900]">AWS</span>
          </div>
          <div data-aws-vp-line className="w-24 h-[2px] bg-gradient-to-r from-[#FF9900] to-accent-blue" />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-blue">C</span>
          </div>
        </div>

        {/* Value prop cards */}
        <div data-aws-vp-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-aws-vp-card className="glass-card p-6">
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

        {/* Migration stats */}
        <div data-aws-vp-stats className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {MIGRATION_STATS.map((stat, i) => (
            <div key={i} data-aws-vp-stat className="glass-card p-5 text-center">
              <div className="text-3xl font-bold text-[#FF9900] mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-text-tertiary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom metric */}
        <div data-aws-vp-stat className="glass-card p-10 max-w-md mx-auto text-center border-[#FF9900]/20">
          <Zap className="w-8 h-8 text-[#FF9900] mx-auto mb-3" />
          <div className="text-5xl font-bold text-[#FF9900] mb-3">
            <AnimatedCounter target={73} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">Faster Migration Timeline</p>
          <p className="text-sm text-text-secondary">
            When AWS infrastructure expertise meets AI-powered code refactoring, enterprise modernization projects that once took quarters now complete in weeks.
          </p>
        </div>
      </div>
    </section>
  );
}
