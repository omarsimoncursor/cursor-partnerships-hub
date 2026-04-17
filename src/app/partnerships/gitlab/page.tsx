'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PipelineScene = dynamic(() => import('@/components/gitlab-demo/pipeline-scene').then(m => ({ default: m.PipelineScene })), { ssr: false });
const DiagnoseScene = dynamic(() => import('@/components/gitlab-demo/diagnose-scene').then(m => ({ default: m.DiagnoseScene })), { ssr: false });
const FixScene = dynamic(() => import('@/components/gitlab-demo/fix-scene').then(m => ({ default: m.FixScene })), { ssr: false });
const DeployScene = dynamic(() => import('@/components/gitlab-demo/deploy-scene').then(m => ({ default: m.DeployScene })), { ssr: false });
const GitLabValueScene = dynamic(() => import('@/components/gitlab-demo/gitlab-value-scene').then(m => ({ default: m.GitLabValueScene })), { ssr: false });
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function GitLabPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-gl-hero-text]', {
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
          <Link href="/partnerships/aws" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Previous: AWS Demo
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Partnership Demo</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div data-gl-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FC6D26]/20 border border-[#FC6D26]/30 flex items-center justify-center text-lg font-bold text-[#FC6D26]">
              G
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 data-gl-hero-text className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From CI Failure to Deployed Fix
          </h1>
          <p data-gl-hero-text className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            This co-sell motion shows how Cursor&apos;s agent supercharges GitLab&apos;s CI/CD pipeline, automating the path from failed build to deployed fix.
          </p>
          <p data-gl-hero-text className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor helps enterprises supercharge their existing tech stack. This agentic automation is repeatable across any GitLab customer.
          </p>
          <p data-gl-hero-text className="text-sm text-text-tertiary mb-12">
            Scroll to experience the workflow
          </p>
        </div>
      </section>

      {/* Act 1: Pipeline Fails */}
      <PipelineScene />

      {/* Act 2: Cursor Reads Logs */}
      <DiagnoseScene />

      {/* Act 3: Root Cause + Fix */}
      <FixScene />

      {/* Act 4: Pipeline Goes Green */}
      <DeployScene />

      {/* Act 5: Joint Value Proposition */}
      <GitLabValueScene />

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-dark-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-text-tertiary mb-4">
            This page demonstrates the type of co-branded content that could be produced for each partnership motion.
          </p>
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-2 text-sm text-accent-blue hover:underline"
          >
            Back to Partnerships
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
