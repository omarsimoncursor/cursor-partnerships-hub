'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { TimelineStepper } from '@/components/ui/timeline-stepper';

export function RemediationScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to let Lenis finish initializing before creating pinned ScrollTriggers
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    const ctx = gsap.context(() => {
      const dots = gsap.utils.toArray<HTMLElement>('[data-remediation-dot]');
      const redDots = dots.filter(d => d.dataset.dotColor === 'red');
      const shieldEl = document.querySelector('[data-remediation-shield]');
      const privacyCards = gsap.utils.toArray<HTMLElement>('[data-remediation-card]');

      // Main pinned timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinnedRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1 (0–0.3): Red dots sweep to green
      redDots.forEach((dot, i) => {
        const startPos = (i / redDots.length) * 0.25;
        tl.to(dot, {
          backgroundColor: '#ffffff',
          boxShadow: '0 0 16px 4px rgba(255,255,255,0.6)',
          duration: 0.01,
        }, startPos);
        tl.to(dot, {
          backgroundColor: '#4ade80',
          boxShadow: '0 0 8px 2px rgba(74, 222, 128, 0.4)',
          duration: 0.02,
        }, startPos + 0.01);
        tl.to(dot, {
          boxShadow: 'none',
          duration: 0.02,
        }, startPos + 0.03);
      });

      // Phase 2 (0.3–0.5): Shield scales up
      if (shieldEl) {
        tl.fromTo(shieldEl, {
          scale: 0,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 1,
          duration: 0.15,
          ease: 'back.out(1.7)',
        }, 0.3);
      }

      // Phase 3 (0.5–1.0): Privacy cards fade in
      privacyCards.forEach((card, i) => {
        const startPos = 0.5 + (i / privacyCards.length) * 0.35;
        tl.fromTo(card, {
          opacity: 0,
          y: 30,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.1,
          ease: 'power3.out',
        }, startPos);
      });

      // Action plan below pinned section
      gsap.from('[data-remediation-plan]', {
        scrollTrigger: {
          trigger: '[data-remediation-plan]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  // Build the 31-dot array: 13 green, 18 red
  const dots = Array.from({ length: 31 }, (_, i) => (i < 13 ? 'green' : 'red'));

  const privacyCards = [
    {
      title: 'Models are Never Trained on Your Code',
      description: 'Cursor protects your code from being used to train large language models.',
    },
    {
      title: 'Data is Never Stored or Retained',
      description: 'Customer data is never stored, logged, or retained by Cursor or the model providers.',
    },
    {
      title: 'Requests are Isolated Per Session',
      description: 'All requests are sandboxed within the active context window. No cross-session data leakage.',
    },
    {
      title: 'SOC 2 Type II Compliant',
      description: "Cursor's infrastructure meets SOC 2 Type II standards for enterprise security and data handling.",
    },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Pinned scroll section */}
      <div ref={pinnedRef} className="min-h-screen flex items-center justify-center px-6 will-change-transform">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 2</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Remediation in Real Time</h2>
          </div>

          {/* Dot grid */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {dots.map((color, i) => (
              <div
                key={i}
                data-remediation-dot
                data-dot-color={color}
                className={`w-5 h-5 rounded-full ${
                  color === 'green' ? 'bg-accent-green' : 'bg-accent-red'
                }`}
              />
            ))}
          </div>

          {/* Shield icon (hidden initially) */}
          <div className="flex justify-center mb-10">
            <div
              data-remediation-shield
              className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center opacity-0 scale-0"
              style={{ boxShadow: '0 0 60px 20px rgba(74, 222, 128, 0.15)' }}
            >
              <Shield className="w-10 h-10 text-accent-green" />
            </div>
          </div>

          {/* Privacy cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {privacyCards.map((card, i) => (
              <div key={i} data-remediation-card className="opacity-0">
                <GlassCard hover={false} className="h-full">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">{card.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action plan (below the pinned section) */}
      <div data-remediation-plan className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-text-primary mb-8">Immediate Remediation Plan</h3>
          <TimelineStepper
            steps={[
              {
                timeframe: 'Immediately after this call',
                description: 'Email list of all 18 non-compliant users with written & video Privacy Mode enablement instructions (<20 seconds per user)',
              },
              {
                timeframe: 'By End-of-Day',
                description: 'Escalate internally to see if we can purge any stored data from those accounts.',
              },
              {
                timeframe: 'Ongoing',
                description: "Once all 31 users have Privacy Mode enabled, Cursor becomes the opposite of a security threat. It's a security enabler. The safest way to access AI in the enterprise.",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
