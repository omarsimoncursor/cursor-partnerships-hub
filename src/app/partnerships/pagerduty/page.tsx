'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { gsap } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

const PageFiresScene = dynamic(
  () => import('@/components/pagerduty/page-fires-scene').then(m => ({ default: m.PageFiresScene })),
  { ssr: false },
);
const SdkActivatedScene = dynamic(
  () =>
    import('@/components/pagerduty/sdk-activated-scene').then(m => ({
      default: m.SdkActivatedScene,
    })),
  { ssr: false },
);
const SdkOrchestrationScene = dynamic(
  () =>
    import('@/components/pagerduty/sdk-orchestration-scene').then(m => ({
      default: m.SdkOrchestrationScene,
    })),
  { ssr: false },
);
const SdkShipsPrScene = dynamic(
  () =>
    import('@/components/pagerduty/sdk-ships-pr-scene').then(m => ({
      default: m.SdkShipsPrScene,
    })),
  { ssr: false },
);
const SdkValueScene = dynamic(
  () =>
    import('@/components/pagerduty/sdk-value-scene').then(m => ({ default: m.SdkValueScene })),
  { ssr: false },
);

export default function PagerdutyPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pd-hero-text]', {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership Demo</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div data-pd-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#06AC38]/15 border border-[#06AC38]/35 flex items-center justify-center text-lg font-bold text-[#57D990]">
              PD
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>

          <p
            data-pd-hero-text
            className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#57D990] mb-3"
          >
            Powered by @cursor/sdk · runs in your VPC
          </p>

          <h1
            data-pd-hero-text
            className="text-4xl md:text-6xl font-bold text-text-primary mb-6"
          >
            The page that didn&apos;t fire.
          </h1>

          <p
            data-pd-hero-text
            className="text-lg text-text-secondary mb-3 max-w-xl mx-auto"
          >
            PagerDuty triggers a P1 incident at 03:14 AM. The Cursor SDK, running in your own
            sandboxed worker, ack&apos;s, triages, reverts, and resolves &mdash; without paging a
            human. Programmable. Auditable. Token-billed.
          </p>

          <p
            data-pd-hero-text
            className="text-sm text-text-tertiary mb-8 max-w-lg mx-auto"
          >
            Same runtime as Cursor desktop. Spawn subagents from a TypeScript handler.
            Admin-enforced sandbox network policy (Cursor 2.5). The on-call wakes up to a PR.
          </p>

          <div data-pd-hero-text className="flex justify-center mb-10">
            <Link
              href="/partnerships/pagerduty/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#06AC38] text-white font-medium text-sm hover:bg-[#08C443] transition-all duration-200 shadow-[0_0_32px_rgba(6,172,56,0.35)] hover:shadow-[0_0_48px_rgba(6,172,56,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p data-pd-hero-text className="text-sm text-text-tertiary">
            Scroll to walk through the five-act story
          </p>
        </div>
      </section>

      {/* Act 1: The Page Fires */}
      <PageFiresScene />

      {/* Act 2: The Cursor SDK Activates */}
      <SdkActivatedScene />

      {/* Act 3: Multi-Subagent Orchestration via the SDK */}
      <SdkOrchestrationScene />

      {/* Act 4: The SDK Ships the Revert */}
      <SdkShipsPrScene />

      {/* Act 5: Better Together */}
      <SdkValueScene />
    </div>
  );
}
