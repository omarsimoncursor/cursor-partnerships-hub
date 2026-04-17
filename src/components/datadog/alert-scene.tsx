'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { AlertTriangle, Activity, Clock, Server } from 'lucide-react';

export function AlertScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the dashboard
      gsap.from('[data-alert-dashboard]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Pulse the alert after dashboard appears
      gsap.from('[data-alert-banner]', {
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

      // Animate metric bars
      gsap.from('[data-metric-bar]', {
        scrollTrigger: {
          trigger: '[data-metrics]',
          start: 'top 80%',
        },
        scaleX: 0,
        transformOrigin: 'left',
        stagger: 0.05,
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
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 1</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Alert Fires</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Datadog detects an anomaly in production. P99 latency on the checkout endpoint has spiked well beyond the configured threshold.
        </p>

        {/* Dashboard mockup */}
        <div data-alert-dashboard className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          {/* Dashboard header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-bg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#632CA6] flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
              <span className="text-sm text-text-secondary">Datadog APM</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last 1h</span>
              <span className="flex items-center gap-1"><Server className="w-3 h-3" /> prod-us-west</span>
            </div>
          </div>

          {/* Alert banner */}
          <div data-alert-banner className="mx-4 mt-4 p-4 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-accent-red mb-1">
                ALERT: P99 Latency Spike Detected
              </p>
              <p className="text-xs text-text-secondary font-mono">
                /api/checkout &bull; P99: 2,340ms (threshold: 500ms) &bull; Triggered 3m ago
              </p>
            </div>
          </div>

          {/* Metrics visualization */}
          <div data-metrics className="p-6 space-y-6">
            {/* Latency chart mockup */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary uppercase tracking-wider">Endpoint Latency (P99)</span>
                <span className="text-xs font-mono text-accent-red">2,340ms</span>
              </div>
              <div className="h-24 flex items-end gap-[2px]">
                {Array.from({ length: 60 }).map((_, i) => {
                  const isSpike = i > 45;
                  const normalHeight = 10 + Math.random() * 15;
                  const spikeHeight = 40 + Math.random() * 55;
                  const height = isSpike ? spikeHeight : normalHeight;
                  return (
                    <div
                      key={i}
                      data-metric-bar
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        backgroundColor: isSpike ? 'rgba(248, 113, 113, 0.8)' : 'rgba(96, 165, 250, 0.3)',
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-tertiary">-60m</span>
                <span className="text-[10px] text-text-tertiary">now</span>
              </div>
            </div>

            {/* Error rate */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-dark-bg">
                <p className="text-[10px] text-text-tertiary uppercase mb-1">Error Rate</p>
                <p className="text-lg font-bold text-accent-red">4.7%</p>
                <p className="text-[10px] text-text-tertiary">+380% from baseline</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg">
                <p className="text-[10px] text-text-tertiary uppercase mb-1">Throughput</p>
                <p className="text-lg font-bold text-accent-amber">1,240 req/s</p>
                <p className="text-[10px] text-text-tertiary">Within normal range</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-bg">
                <p className="text-[10px] text-text-tertiary uppercase mb-1">Affected Users</p>
                <p className="text-lg font-bold text-text-primary">~2,100</p>
                <p className="text-[10px] text-text-tertiary">In last 3 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
