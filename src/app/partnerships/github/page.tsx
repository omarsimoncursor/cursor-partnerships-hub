'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PrScene = dynamic(() => import('@/components/github-demo/pr-scene').then(m => ({ default: m.PrScene })), { ssr: false });
const IngestScene = dynamic(() => import('@/components/github-demo/ingest-scene').then(m => ({ default: m.IngestScene })), { ssr: false });
const RefactorScene = dynamic(() => import('@/components/github-demo/refactor-scene').then(m => ({ default: m.RefactorScene })), { ssr: false });
const TestsScene = dynamic(() => import('@/components/github-demo/tests-scene').then(m => ({ default: m.TestsScene })), { ssr: false });
const GithubValueScene = dynamic(() => import('@/components/github-demo/github-value-scene').then(m => ({ default: m.GithubValueScene })), { ssr: false });
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function GithubPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-gh-hero-text]', {
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

      {/* Previous demo nav */}
      <div className="fixed top-16 left-0 right-0 z-40 py-2 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/partnerships/sentry" className="inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Previous: Sentry Demo
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div data-gh-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#238636]/20 border border-[#238636]/30 flex items-center justify-center text-lg font-bold text-[#238636]">
              G
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 data-gh-hero-text className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From PR Review to Refactor
          </h1>
          <p data-gh-hero-text className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            This co-sell motion shows how Cursor&apos;s agent supercharges GitHub&apos;s code review workflow, automating multi-file refactors and test generation from review comments.
          </p>
          <p data-gh-hero-text className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor helps enterprises supercharge their existing tech stack. This agentic workflow is repeatable across any GitHub Enterprise customer.
          </p>
          <p data-gh-hero-text className="text-sm text-text-tertiary mb-12">
            Scroll to experience the workflow
          </p>
        </div>
      </section>

      {/* Act 1: PR Review */}
      <PrScene />

      {/* Act 2: Cursor Ingests Repo */}
      <IngestScene />

      {/* Act 3: Multi-file Refactor */}
      <RefactorScene />

      {/* Act 4: Auto-generated Tests */}
      <TestsScene />

      {/* Act 5: Joint Value Prop */}
      <GithubValueScene />

      {/* Next demo nav + Footer */}
      <footer className="py-16 px-6 border-t border-dark-border">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/partnerships/aws"
            className="inline-flex items-center gap-2 text-sm text-accent-blue hover:underline mb-8"
          >
            Next: AWS Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-text-tertiary mb-4">
            This page demonstrates the type of co-branded content that could be produced for each partnership motion.
          </p>
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partnerships
          </Link>
        </div>
      </footer>
    </div>
  );
}
