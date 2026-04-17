'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { TimelineStepper } from '@/components/ui/timeline-stepper';

export function AdoptionRoiScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-figma-roi-header]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-roi-card]', {
        scrollTrigger: {
          trigger: '[data-figma-roi-grid]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-roi-steps]', {
        scrollTrigger: {
          trigger: '[data-figma-roi-steps]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div data-figma-roi-header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 6</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cursor is a the Leading AI Centric, Secure, Enterprise IDE.</h2>
          </div>
          <p className="text-text-secondary max-w-3xl">
            Not a plugin, not a chatbot, but a developer ready tool built for orchestrating powerful agentic workflows.
          </p>
        </div>

        {/* ROI metric cards */}
        <div data-figma-roi-grid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <div data-figma-roi-card>
            <GlassCard hover={false} className="text-center h-full">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Annual Productivity Savings</p>
              <p className="text-3xl md:text-4xl font-bold text-accent-green">$8.5M</p>
            </GlassCard>
          </div>
          <div data-figma-roi-card>
            <GlassCard hover={false} className="text-center h-full">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">ROI Multiplier</p>
              <p className="text-3xl md:text-4xl font-bold text-accent-blue">28.1x</p>
            </GlassCard>
          </div>
          <div data-figma-roi-card>
            <GlassCard hover={false} className="text-center h-full">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Annual Token Cost Savings</p>
              <p className="text-3xl md:text-4xl font-bold text-accent-amber">
                $<AnimatedCounter target={416} suffix="K" />
              </p>
            </GlassCard>
          </div>
          <div data-figma-roi-card>
            <GlassCard hover={false} className="text-center h-full">
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Total Cursor Cost (650 seats)</p>
              <p className="text-3xl md:text-4xl font-bold text-text-secondary">
                $<AnimatedCounter target={312} suffix="K" />
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Proposed Next Steps */}
        <div data-figma-roi-steps>
          <h3 className="text-xl font-bold text-text-primary mb-8">Proposed Next Steps</h3>
          <TimelineStepper
            steps={[
              {
                timeframe: 'Today',
                description: "Remediate Privacy Mode \u2014 I'll email the non-compliant user list with enablement instructions",
              },
              {
                timeframe: 'Week 1',
                description: "Pilot. Copy Figma's plugin-samples repo to dev server, SSH in via Cursor, experience time and cost savings yourself.",
              },
              {
                timeframe: 'Week 2',
                description: 'Security architecture review with your Security Engineering team',
              },
              {
                timeframe: 'Week 3',
                description: 'Pilot program for the C++/Rust rendering engine team (10\u201320 seats) \u2014 highest complexity, highest ROI',
              },
              {
                timeframe: 'Week 4',
                description: 'Executive briefing on productivity gains, cost savings, enterprise security, and agentic integrations with existing tech stack.',
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
