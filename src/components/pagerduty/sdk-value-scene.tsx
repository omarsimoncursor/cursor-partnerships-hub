'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import Link from 'next/link';
import { ArrowRight, Code2, Phone, PlayCircle, ShieldCheck } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { SdkCodePanel, SDK_CREATE_SAMPLE } from './sdk-code-panel';

const VALUE_CARDS = [
  {
    icon: Phone,
    title: 'Page',
    subtitle: 'PagerDuty',
    description:
      "PagerDuty fires the incident the moment Datadog's monitor breaches. The webhook V3 payload arrives at your sandboxed worker in milliseconds.",
    color: '#06AC38',
  },
  {
    icon: Code2,
    title: 'Build',
    subtitle: 'Cursor SDK in your VPC',
    description:
      "Agent.create() spawns the parent. Async subagents handle triage, revert, and comms in parallel. Same runtime as Cursor desktop — token-billed, sandbox-enforced.",
    color: '#60A5FA',
  },
  {
    icon: ShieldCheck,
    title: 'Resolve',
    subtitle: 'Programmable on-call auto-pilot',
    description:
      'Confidence floor, canary gate, and change-freeze respect live in your TypeScript. PR opens, SLO holds, incident closes. The on-call wakes up to a PR, not a page.',
    color: '#4ADE80',
  },
];

export function SdkValueScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-vp-logos]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });

      gsap.from('[data-pd-vp-line]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        scaleX: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('[data-pd-vp-card]', {
        scrollTrigger: { trigger: '[data-pd-vp-cards]', start: 'top 80%' },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-pd-vp-stat]', {
        scrollTrigger: { trigger: '[data-pd-vp-stat]', start: 'top 85%' },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-pd-vp-thesis]', {
        scrollTrigger: { trigger: '[data-pd-vp-thesis]', start: 'top 85%' },
        opacity: 0,
        y: 20,
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
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">
            Act 5
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Better Together</h2>
        </div>

        {/* Logo connection */}
        <div data-pd-vp-logos className="flex items-center justify-center gap-6 mb-16">
          <div className="w-20 h-20 rounded-2xl bg-[#06AC38]/15 border border-[#06AC38]/35 flex items-center justify-center text-2xl font-bold text-[#57D990]">
            PD
          </div>
          <div
            data-pd-vp-line
            className="w-24 h-[2px] bg-gradient-to-r from-[#06AC38] to-accent-blue"
          />
          <div className="w-20 h-20 rounded-2xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-2xl font-bold text-accent-blue">
            C
          </div>
        </div>

        {/* Value prop cards */}
        <div data-pd-vp-cards className="grid md:grid-cols-3 gap-6 mb-16">
          {VALUE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} data-pd-vp-card className="glass-card p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: card.color + '15' }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">{card.title}</h3>
                <p className="text-xs font-mono mb-3" style={{ color: card.color }}>
                  {card.subtitle}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* MTTR metric */}
        <div
          data-pd-vp-stat
          className="glass-card p-10 max-w-md mx-auto text-center border-[#06AC38]/25 mb-12"
        >
          <div className="text-5xl font-bold text-[#57D990] mb-3">
            <AnimatedCounter target={91} suffix="%" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-2">
            Reduction in Mean Time to Resolution
          </p>
          <p className="text-sm text-text-secondary">
            From 47 minutes of manual on-call response to 4 minutes 12 seconds of automated
            auto-pilot. Zero humans paged. The SDK is the substrate; PagerDuty is the trigger.
          </p>
        </div>

        {/* Code snippet thesis */}
        <div data-pd-vp-thesis className="mb-12">
          <SdkCodePanel
            tabs={[SDK_CREATE_SAMPLE]}
            accentColor="#06AC38"
            title="Build it yourself in an afternoon"
            badge="@cursor/sdk"
            maxHeight="320px"
          />
        </div>

        {/* Final CTA */}
        <div className="glass-card p-8 border-l-2 border-[#06AC38] text-center">
          <p className="text-base text-text-secondary leading-relaxed mb-5">
            The Cursor SDK turns your on-call rotation into a programmable auto-pilot you own.
            Same runtime as Cursor desktop. Same models. Sandbox-enforced. Token-billed.{' '}
            <span className="text-text-primary">
              PagerDuty fires the page; the SDK turns it into a PR.
            </span>
          </p>
          <Link
            href="/partnerships/pagerduty/demo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#06AC38] text-white font-medium text-sm hover:bg-[#08C443] transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Run the live demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
