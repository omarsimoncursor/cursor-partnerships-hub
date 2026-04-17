'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { GitPullRequest, Zap, CheckCircle } from 'lucide-react';

const VALUE_CARDS = [
  {
    icon: GitPullRequest,
    title: 'Smarter Reviews',
    description: 'GitHub surfaces review feedback and code quality issues. Cursor understands the full repo context to execute the right fix.',
    color: '#238636',
  },
  {
    icon: Zap,
    title: 'Instant Refactors',
    description: 'Cursor transforms review comments into multi-file refactors in minutes. No more back-and-forth review cycles.',
    color: '#60a5fa',
  },
  {
    icon: CheckCircle,
    title: 'Ship with Confidence',
    description: 'Auto-generated tests and CI validation ensure every refactor is production-ready before merge.',
    color: '#4ade80',
  },
];

export function GithubValueScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-ghvp-logos]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0, scale: 0.9, duration: 0.8, ease: 'back.out(1.5)',
      });
      gsap.from('[data-ghvp-line]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        scaleX: 0, duration: 0.8, delay: 0.4, ease: 'power3.out',
      });
      gsap.from('[data-ghvp-card]', {
        scrollTrigger: { trigger: '[data-ghvp-cards]', start: 'top 80%' },
        y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out',
      });
      gsap.from('[data-ghvp-stat]', {
        scrollTrigger: { trigger: '[data-ghvp-stat]', start: 'top 85%' },
        y: 20, opacity: 0, duration: 0.8, ease: 'power3.out',
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

        <div data-ghvp-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#238636]/20 border border-[#238636]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#238636]">G</span>
          </div>
          <div data-ghvp-line className="w-24 h-[2px] bg-gradient-to-r from-[#238636] to-accent-blue" />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-blue">C</span>
          </div>
        </div>

        <div data-ghvp-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-ghvp-card className="glass-card p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: card.color + '15' }}>
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">{card.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div data-ghvp-stat className="glass-card p-10 max-w-md mx-auto text-center border-accent-green/20">
          <div className="text-5xl font-bold text-accent-green mb-3">
            <AnimatedCounter target={75} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">Faster Code Review Cycles</p>
          <p className="text-sm text-text-secondary">
            When GitHub review feedback feeds directly into Cursor's intelligent refactoring, review cycles shrink from days to minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
