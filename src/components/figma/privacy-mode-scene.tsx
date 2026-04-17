'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AlertTriangle } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';

export function PrivacyModeScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Dashboard fade in
      gsap.from('[data-figma-privacy-dashboard]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Dots stagger in with wave effect
      gsap.from('[data-figma-privacy-dot]', {
        scrollTrigger: {
          trigger: '[data-figma-privacy-grid]',
          start: 'top 75%',
        },
        opacity: 0,
        scale: 0,
        stagger: 0.04,
        duration: 0.4,
        ease: 'back.out(2)',
      });

      // Red dots pulse animation
      gsap.to('[data-figma-privacy-dot-red]', {
        scrollTrigger: {
          trigger: '[data-figma-privacy-grid]',
          start: 'top 70%',
        },
        boxShadow: '0 0 12px 4px rgba(248, 113, 113, 0.4)',
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'sine.inOut',
        delay: 1.5,
      });

      // Alert banner scale in
      gsap.from('[data-figma-privacy-alert]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        delay: 0.6,
        ease: 'back.out(1.5)',
      });

      // Metric cards
      gsap.from('[data-figma-privacy-metric]', {
        scrollTrigger: {
          trigger: '[data-figma-privacy-metrics]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Build the 31-dot array: 13 green first, then 18 red
  const dots = Array.from({ length: 31 }, (_, i) => i < 13 ? 'green' : 'red');

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 1</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">31 Shadow Users Detected</h2>
        </div>

        {/* Alert banner */}
        <div data-figma-privacy-alert className="mb-12 p-4 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-accent-red">
            SECURITY ALERT: 18 users with Privacy Mode disabled
          </p>
        </div>

        {/* Dashboard */}
        <div data-figma-privacy-dashboard className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden p-8">
          {/* Dot grid */}
          <div data-figma-privacy-grid className="flex flex-wrap gap-3 justify-center mb-10">
            {dots.map((color, i) => (
              <div
                key={i}
                data-figma-privacy-dot
                {...(color === 'red' ? { 'data-figma-privacy-dot-red': '' } : {})}
                className={`w-5 h-5 rounded-full ${
                  color === 'green'
                    ? 'bg-accent-green'
                    : 'bg-accent-red'
                }`}
              />
            ))}
          </div>

          {/* Metric cards */}
          <div data-figma-privacy-metrics className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div data-figma-privacy-metric>
              <MetricCard value={31} label="Cursor Users" className="!text-accent-green [&>div:first-child]:!text-accent-green" />
            </div>
            <div data-figma-privacy-metric>
              <MetricCard value={18} label="Non-Compliant" className="!text-accent-red [&>div:first-child]:!text-accent-red" />
            </div>
            <div data-figma-privacy-metric>
              <MetricCard value={58} label="Need to Address" suffix="%" className="!text-accent-amber [&>div:first-child]:!text-accent-amber" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
