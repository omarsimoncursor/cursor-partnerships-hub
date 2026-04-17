'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Layers, Sparkles, Palette } from 'lucide-react';

const VALUE_CARDS = [
  {
    icon: Layers,
    title: 'Design is the Source of Truth',
    subtitle: 'Figma MCP',
    description: 'Designs are directly machine-readable. Colors, typography, spacing, component structure -- all extracted from Figma and applied faithfully. The spec never goes stale because it is the spec.',
    color: '#A259FF',
  },
  {
    icon: Sparkles,
    title: 'Designers Control the Output',
    subtitle: 'Cursor Design Mode',
    description: 'PMs and designers iterate on real, running components in plain English. No handoff documents. No reinterpretation. What the designer approves is exactly what ships to production.',
    color: '#F59E0B',
  },
  {
    icon: Palette,
    title: 'Pixel-Perfect, Every Time',
    subtitle: 'Multi-Model Orchestration',
    description: 'Opus reads the design, Composer builds it to spec, Codex verifies fidelity and accessibility. Every corner radius, every shadow, every gradient -- matched exactly as drawn.',
    color: '#60a5fa',
  },
];

export function FigmaValueScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-fv-logos]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0, scale: 0.9, duration: 0.8, ease: 'back.out(1.5)',
      });
      gsap.from('[data-fv-line]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        scaleX: 0, duration: 0.8, delay: 0.4, ease: 'power3.out',
      });
      gsap.from('[data-fv-card]', {
        scrollTrigger: { trigger: '[data-fv-cards]', start: 'top 80%' },
        y: 30, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out',
      });
      gsap.from('[data-fv-stat]', {
        scrollTrigger: { trigger: '[data-fv-stat]', start: 'top 85%' },
        y: 20, opacity: 0, duration: 0.8, ease: 'power3.out',
      });
      gsap.from('[data-fv-thesis]', {
        scrollTrigger: { trigger: '[data-fv-thesis]', start: 'top 85%' },
        opacity: 0, y: 20, duration: 0.6, ease: 'power3.out',
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
        <div data-fv-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#A259FF]/20 border border-[#A259FF]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#A259FF]">F</span>
          </div>
          <div data-fv-line className="w-24 h-[2px] bg-gradient-to-r from-[#A259FF] to-accent-blue" />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-blue">C</span>
          </div>
        </div>

        {/* Value prop cards */}
        <div data-fv-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-fv-card className="glass-card p-6">
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

        {/* Design velocity metric */}
        <div data-fv-stat className="glass-card p-10 max-w-md mx-auto text-center border-accent-green/20 mb-12">
          <div className="text-5xl font-bold text-accent-green mb-3">
            <AnimatedCounter target={78} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">Reduction in Design-to-Production Time</p>
          <p className="text-sm text-text-secondary">
            When Figma designs are directly readable by Cursor via MCP and designers iterate through Design Mode, the entire pipeline collapses from weeks to hours. What is designed is what ships.
          </p>
        </div>

        {/* Platform thesis */}
        <div data-fv-thesis className="glass-card p-6 border-l-2 border-[#A259FF]">
          <p className="text-base text-text-secondary leading-relaxed">
            Cursor bridges the gap between design and engineering. Through the Figma MCP, designs are the source of truth. Through Design Mode, designers and PMs iterate directly on real components. Through multi-model orchestration, every gradient, radius, and shadow is implemented exactly as drawn. The game of telephone is over.
          </p>
        </div>
      </div>
    </section>
  );
}
