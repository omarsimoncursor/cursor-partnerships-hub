'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MonolithScene = dynamic(() => import('@/components/aws-demo/monolith-scene').then(m => ({ default: m.MonolithScene })), { ssr: false });
const AnalysisScene = dynamic(() => import('@/components/aws-demo/analysis-scene').then(m => ({ default: m.AnalysisScene })), { ssr: false });
const DecomposeScene = dynamic(() => import('@/components/aws-demo/decompose-scene').then(m => ({ default: m.DecomposeScene })), { ssr: false });
const InfraScene = dynamic(() => import('@/components/aws-demo/infra-scene').then(m => ({ default: m.InfraScene })), { ssr: false });
const AWSValueScene = dynamic(() => import('@/components/aws-demo/aws-value-scene').then(m => ({ default: m.AWSValueScene })), { ssr: false });
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';

export default function AWSPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-aws-hero-text]', {
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
          <Link href="/partnerships/github" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Previous: GitHub Demo
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div data-aws-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FF9900]/20 border border-[#FF9900]/30 flex items-center justify-center text-sm font-bold text-[#FF9900]">
              AWS
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 data-aws-hero-text className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From Monolith to Microservices
          </h1>
          <p data-aws-hero-text className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            This co-sell motion shows how Cursor&apos;s agent supercharges AWS modernization, automating the decomposition from monolith to production-ready microservices and infrastructure code.
          </p>
          <p data-aws-hero-text className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor maximizes ROI from AWS investments by automating the hardest part of cloud migration. Scalable across any AWS enterprise customer.
          </p>
          <div data-aws-hero-text className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/partnerships/aws/journey"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF9900] px-6 py-3 text-sm font-semibold text-[#0F1521] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Walk the modernization journey
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#monolith-scene"
              className="inline-flex items-center gap-2 rounded-full border border-[#FF9900]/40 px-6 py-3 text-sm font-semibold text-[#FF9900] transition-colors hover:bg-[#FF9900]/10"
            >
              Or scroll the scroll-story
            </a>
          </div>
          <p data-aws-hero-text className="text-sm text-text-tertiary mb-12">
            Pick the journey for a step-by-step interactive story · pick the scroll-story for a 60-second teaser
          </p>

          {/* Live demo CTA */}
          <div data-aws-hero-text className="flex justify-center">
            <Link
              href="/partnerships/aws/demo"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                         bg-[#FF9900] text-[#0B0F14] font-semibold text-sm
                         hover:bg-[#FFAC33] transition-all duration-200
                         shadow-[0_0_32px_rgba(255,153,0,0.35)] hover:shadow-[0_0_48px_rgba(255,153,0,0.5)]"
            >
              <PlayCircle className="w-4 h-4" />
              Run the live modernization demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Act 1: The Legacy Monolith */}
      <div id="monolith-scene">
        <MonolithScene />
      </div>

      {/* Act 2: Cursor Analyzes Service Boundaries */}
      <AnalysisScene />

      {/* Act 3: Decomposition in Action */}
      <DecomposeScene />

      {/* Act 4: Infrastructure Code Generated */}
      <InfraScene />

      {/* Act 5: Joint Value Proposition */}
      <AWSValueScene />

      {/* Footer with next demo nav */}
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
              href="/partnerships/gitlab"
              className="inline-flex items-center gap-2 text-sm text-[#FF9900] hover:underline"
            >
              Next: GitLab Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
