'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';

const AlertScene = dynamic(() => import('@/components/datadog/alert-scene').then(m => ({ default: m.AlertScene })), { ssr: false });
const EditorScene = dynamic(() => import('@/components/datadog/editor-scene').then(m => ({ default: m.EditorScene })), { ssr: false });
const AnalysisScene = dynamic(() => import('@/components/datadog/analysis-scene').then(m => ({ default: m.AnalysisScene })), { ssr: false });
const FixScene = dynamic(() => import('@/components/datadog/fix-scene').then(m => ({ default: m.FixScene })), { ssr: false });
const ValuePropScene = dynamic(() => import('@/components/datadog/value-prop-scene').then(m => ({ default: m.ValuePropScene })), { ssr: false });

export default function DatadogPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-dd-hero-text]', {
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
          <Link href="/partnerships" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership Demo</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div data-dd-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#632CA6]/20 border border-[#632CA6]/30 flex items-center justify-center text-lg font-bold text-[#632CA6]">
              D
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 data-dd-hero-text className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From Incident to Automated PR
          </h1>
          <p data-dd-hero-text className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            Datadog&apos;s MCP triggers a Cursor Cloud Agent that triages, fixes, tests, and pushes a PR &mdash; all without an engineer touching a keyboard. The human-in-the-loop reviews the PR before deploy.
          </p>
          <p data-dd-hero-text className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor is the central orchestration platform for AI-powered development. This motion is repeatable across any Datadog customer.
          </p>
          <p data-dd-hero-text className="text-sm text-text-tertiary mb-8">
            Scroll to experience the workflow
          </p>

          {/* Live demo CTA */}
          <div data-dd-hero-text className="flex justify-center">
            <Link
              href="/partnerships/datadog/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#632CA6] text-white font-medium text-sm
                         hover:bg-[#7339C0] transition-all duration-200
                         shadow-[0_0_32px_rgba(99,44,166,0.35)] hover:shadow-[0_0_48px_rgba(99,44,166,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live triage demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Act 1: Alert Fires */}
      <AlertScene />

      {/* Act 2: MCP Triggers Cursor Cloud Agent */}
      <EditorScene />

      {/* Act 3: Multi-Model Orchestration */}
      <AnalysisScene />

      {/* Act 4: PR Pushed, Engineer Reviews */}
      <FixScene />

      {/* Act 5: Joint Value Proposition */}
      <ValuePropScene />

      {/* Next demo navigation */}
      <div className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/partnerships/sentry"
            className="example-cta-pulse group block rounded-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02]"
            style={{
              borderColor: 'rgba(54, 45, 89, 0.5)',
              backgroundColor: 'rgba(54, 45, 89, 0.12)',
              ['--pulse-color' as string]: 'rgba(54, 45, 89, 0.3)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#362D59]">
                  Next Partnership Demo
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  Sentry + Cursor: From Error to Patch
                </h3>
                <p className="text-sm text-text-primary/70 leading-relaxed">
                  See how Sentry captures errors and Cursor traces root cause to generate targeted fixes in minutes.
                </p>
              </div>
              <div className="shrink-0 w-14 h-14 rounded-full bg-[#362D59]/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 text-[#362D59]" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
