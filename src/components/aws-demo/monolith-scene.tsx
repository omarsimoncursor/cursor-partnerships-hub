'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Box, Database, ShoppingCart, Shield, Bell, Package } from 'lucide-react';

const MODULES = [
  { name: 'Auth', icon: Shield, row: 0, col: 0 },
  { name: 'Payments', icon: Database, row: 0, col: 1 },
  { name: 'Orders', icon: ShoppingCart, row: 0, col: 2 },
  { name: 'Inventory', icon: Package, row: 1, col: 0 },
  { name: 'Notifications', icon: Bell, row: 1, col: 1 },
];

export function MonolithScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-monolith-box]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-monolith-module]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
        opacity: 0,
        y: 15,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.5,
        ease: 'power3.out',
      });

      gsap.from('[data-monolith-label]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 55%',
        },
        opacity: 0,
        y: 10,
        stagger: 0.08,
        duration: 0.4,
        delay: 1,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 1</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">The Legacy Monolith</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          A single, tightly-coupled application handles everything. Every module lives in one deployable unit, making scaling and independent releases impossible.
        </p>

        {/* Architecture diagram */}
        <div className="flex flex-col items-center">
          {/* Monolith container */}
          <div data-monolith-box className="relative rounded-2xl border-2 border-[#FF9900]/40 bg-[#FF9900]/5 p-8 md:p-12 w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Box className="w-5 h-5 text-[#FF9900]" />
              <span className="text-sm font-mono text-[#FF9900] uppercase tracking-wider">Monolith Application</span>
            </div>

            {/* Modules grid */}
            <div className="grid grid-cols-3 gap-4">
              {MODULES.map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={i}
                    data-monolith-module
                    className="rounded-lg border border-dark-border bg-dark-surface p-4 flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FF9900]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#FF9900]" />
                    </div>
                    <span className="text-xs font-mono text-text-secondary">{mod.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Internal dependency lines (visual) */}
            <div className="mt-6 pt-6 border-t border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">Shared Database</span>
                <span className="text-[10px] text-text-tertiary">Single Deploy Target</span>
                <span className="text-[10px] text-text-tertiary">Coupled Dependencies</span>
              </div>
            </div>
          </div>

          {/* Pain points */}
          <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
            {[
              { label: 'Deployment Risk', value: 'High', detail: 'One change redeploys everything' },
              { label: 'Scaling', value: 'Vertical Only', detail: 'Cannot scale modules independently' },
              { label: 'Team Velocity', value: 'Slowing', detail: 'Teams blocked by shared codebase' },
            ].map((item, i) => (
              <div key={i} data-monolith-label className="glass-card p-4 text-center">
                <p className="text-lg font-bold text-accent-red mb-1">{item.value}</p>
                <p className="text-xs font-semibold text-text-primary mb-1">{item.label}</p>
                <p className="text-[10px] text-text-tertiary">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
