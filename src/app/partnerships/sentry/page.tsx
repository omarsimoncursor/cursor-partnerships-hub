'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ErrorScene = dynamic(() => import('@/components/sentry/error-scene').then(m => ({ default: m.ErrorScene })), { ssr: false });
const TraceScene = dynamic(() => import('@/components/sentry/trace-scene').then(m => ({ default: m.TraceScene })), { ssr: false });
const RootCauseScene = dynamic(() => import('@/components/sentry/rootcause-scene').then(m => ({ default: m.RootCauseScene })), { ssr: false });
const PatchScene = dynamic(() => import('@/components/sentry/patch-scene').then(m => ({ default: m.PatchScene })), { ssr: false });
const SentryValueScene = dynamic(() => import('@/components/sentry/sentry-value-scene').then(m => ({ default: m.SentryValueScene })), { ssr: false });
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function SentryPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-sentry-hero-text]', {
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
          <div data-sentry-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#362D59]/20 border border-[#362D59]/30 flex items-center justify-center text-lg font-bold text-[#362D59]">
              S
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 data-sentry-hero-text className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From Error to Automated PR
          </h1>
          <p data-sentry-hero-text className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            Sentry&apos;s MCP triggers a Cursor Cloud Agent that traces root cause, patches, tests, and pushes a PR &mdash; all without an engineer touching a debugger. The human-in-the-loop reviews the PR before deploy.
          </p>
          <p data-sentry-hero-text className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor is the central orchestration platform for AI-powered development. This motion is repeatable across any Sentry customer.
          </p>
          <p data-sentry-hero-text className="text-sm text-text-tertiary mb-12">
            Scroll to experience the workflow
          </p>
        </div>
      </section>

      {/* Act 1: Sentry Error Dashboard */}
      <ErrorScene />

      {/* Act 2: MCP Triggers Cursor Cloud Agent */}
      <TraceScene />

      {/* Act 3: Multi-Model Orchestration */}
      <RootCauseScene />

      {/* Act 4: PR Pushed, Engineer Reviews */}
      <PatchScene />

      {/* Act 5: Joint Value Proposition */}
      <SentryValueScene />

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-dark-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-text-tertiary mb-6">
            This page demonstrates the type of co-branded content that could be produced for each partnership motion.
          </p>
          <div className="flex items-center justify-center gap-8">
            <Link
              href="/partnerships"
              className="inline-flex items-center gap-2 text-sm text-accent-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Partnerships
            </Link>
            <Link
              href="/partnerships/github"
              className="inline-flex items-center gap-2 text-sm text-text-primary hover:text-accent-blue transition-colors font-medium"
            >
              Next: GitHub Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
