'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react';

const BREADCRUMBS = [
  { time: '14:23:01', category: 'navigation', message: '/dashboard' },
  { time: '14:23:03', category: 'ui.click', message: 'button#submit-order' },
  { time: '14:23:03', category: 'fetch', message: 'POST /api/orders/create' },
  { time: '14:23:04', category: 'fetch', message: '200 GET /api/inventory/check' },
  { time: '14:23:04', category: 'fetch', message: 'POST /api/payments/charge' },
  { time: '14:23:05', category: 'error', message: 'TypeError: Cannot read properties of undefined' },
];

const STACK_TRACE = [
  { fn: 'processPayment', file: 'src/services/payment.ts', line: 47, col: 12, highlight: true },
  { fn: 'handleOrderSubmit', file: 'src/api/orders/create.ts', line: 89, col: 8, highlight: false },
  { fn: 'OrderController.create', file: 'src/controllers/order.ts', line: 34, col: 5, highlight: false },
  { fn: 'routeHandler', file: 'src/middleware/router.ts', line: 112, col: 3, highlight: false },
];

export function ErrorScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-error-dashboard]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-error-banner]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        delay: 0.6,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-error-bar]', {
        scrollTrigger: {
          trigger: '[data-error-chart]',
          start: 'top 80%',
        },
        scaleY: 0,
        transformOrigin: 'bottom',
        stagger: 0.03,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-breadcrumb]', {
        scrollTrigger: {
          trigger: '[data-breadcrumbs]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -10,
        stagger: 0.06,
        duration: 0.4,
        delay: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-stack-line]', {
        scrollTrigger: {
          trigger: '[data-stack-trace]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -8,
        stagger: 0.08,
        duration: 0.4,
        delay: 1.0,
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
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Sentry Catches an Error</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Sentry captures an unhandled TypeError in production. The error count is spiking and users are being affected on the order submission flow.
        </p>

        {/* Dashboard mockup */}
        <div data-error-dashboard className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          {/* Dashboard header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-bg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#362D59] flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-sm text-text-secondary">Sentry Issues</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last 24h</span>
              <span className="px-2 py-0.5 rounded bg-accent-red/10 text-accent-red font-mono">Unresolved</span>
            </div>
          </div>

          {/* Error banner */}
          <div data-error-banner className="mx-4 mt-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-accent-red mb-1">
                  TypeError: Cannot read properties of undefined (reading &apos;chargeId&apos;)
                </p>
                <p className="text-xs text-text-secondary font-mono mb-2">
                  processPayment &bull; src/services/payment.ts &bull; line 47
                </p>
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-accent-red" /> 1,847 events
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> 312 users affected
                  </span>
                  <span>First seen 47m ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Error count chart */}
            <div data-error-chart>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary uppercase tracking-wider">Error Frequency</span>
                <span className="text-xs font-mono text-accent-red">1,847 events</span>
              </div>
              <div className="h-24 flex items-end gap-[2px]">
                {Array.from({ length: 48 }).map((_, i) => {
                  const isSpike = i > 36;
                  const normalHeight = 3 + Math.random() * 8;
                  const rampHeight = 15 + ((i - 36) / 12) * 80 + Math.random() * 15;
                  const height = isSpike ? Math.min(rampHeight, 95) : normalHeight;
                  return (
                    <div
                      key={i}
                      data-error-bar
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        backgroundColor: isSpike ? 'rgba(248, 113, 113, 0.8)' : 'rgba(139, 92, 246, 0.3)',
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-tertiary">-24h</span>
                <span className="text-[10px] text-text-tertiary">now</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-dark-bg">
                <p className="text-[10px] text-text-tertiary uppercase mb-1">Events</p>
                <p className="text-lg font-bold text-accent-red">1,847</p>
                <p className="text-[10px] text-text-tertiary">+4,200% from baseline</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg">
                <p className="text-[10px] text-text-tertiary uppercase mb-1">Users Affected</p>
                <p className="text-lg font-bold text-text-primary">312</p>
                <p className="text-[10px] text-text-tertiary">In last 47 minutes</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg">
                <p className="text-[10px] text-text-tertiary uppercase mb-1">Level</p>
                <p className="text-lg font-bold text-accent-amber">P1</p>
                <p className="text-[10px] text-text-tertiary">Auto-escalated</p>
              </div>
            </div>

            {/* Stack trace */}
            <div data-stack-trace>
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3">Stack Trace</p>
              <div className="rounded-lg bg-dark-bg p-4 font-mono text-xs space-y-1">
                {STACK_TRACE.map((frame, i) => (
                  <div
                    key={i}
                    data-stack-line
                    className={`py-1 px-2 rounded ${frame.highlight ? 'bg-accent-red/10 text-accent-red' : 'text-text-secondary'}`}
                  >
                    <span className="text-text-tertiary mr-2">{i === 0 ? '>' : ' '}</span>
                    <span className={frame.highlight ? 'text-accent-red font-semibold' : 'text-text-primary'}>
                      {frame.fn}
                    </span>
                    <span className="text-text-tertiary ml-2">
                      {frame.file}:{frame.line}:{frame.col}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breadcrumbs */}
            <div data-breadcrumbs>
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-3">Breadcrumbs</p>
              <div className="rounded-lg bg-dark-bg p-4 space-y-1.5">
                {BREADCRUMBS.map((crumb, i) => (
                  <div key={i} data-breadcrumb className="flex items-center gap-3 text-xs">
                    <span className="text-text-tertiary font-mono w-16 shrink-0">{crumb.time}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                      crumb.category === 'error'
                        ? 'bg-accent-red/10 text-accent-red'
                        : 'bg-[#362D59]/20 text-[#8b7fc7]'
                    }`}>
                      {crumb.category}
                    </span>
                    <span className={crumb.category === 'error' ? 'text-accent-red' : 'text-text-secondary'}>
                      {crumb.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
