'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const TelephoneScene = dynamic(() => import('@/components/figma-partner/telephone-scene').then(m => ({ default: m.TelephoneScene })), { ssr: false });
const McpBridgeScene = dynamic(() => import('@/components/figma-partner/mcp-bridge-scene').then(m => ({ default: m.McpBridgeScene })), { ssr: false });
const DesignModeScene = dynamic(() => import('@/components/figma-partner/design-mode-scene').then(m => ({ default: m.DesignModeScene })), { ssr: false });
const OrchestrationScene = dynamic(() => import('@/components/figma-partner/orchestration-scene').then(m => ({ default: m.OrchestrationScene })), { ssr: false });
const FigmaValueScene = dynamic(() => import('@/components/figma-partner/figma-value-scene').then(m => ({ default: m.FigmaValueScene })), { ssr: false });

export default function FigmaPartnership() {
  useSmoothScroll();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-figma-hero-text]', {
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
          <div data-figma-hero-text className="inline-flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#A259FF]/20 border border-[#A259FF]/30 flex items-center justify-center text-lg font-bold text-[#A259FF]">
              F
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-lg font-bold text-accent-blue">
              C
            </div>
          </div>
          <h1 data-figma-hero-text className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            From Design to Production
          </h1>
          <p data-figma-hero-text className="text-lg text-text-secondary mb-3 max-w-xl mx-auto">
            Cursor&apos;s Figma MCP eliminates the game of telephone between PM, Design, and Engineering. Designs are directly readable by the agent. Designers iterate on real code. Engineers review PRs, not mockups.
          </p>
          <p data-figma-hero-text className="text-sm text-text-tertiary mb-4 max-w-lg mx-auto">
            Cursor is the central orchestration platform that bridges design and engineering through MCP integrations.
          </p>
          <div data-figma-hero-text className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link
              href="/partnerships/figma/journey"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #A259FF 0%, #6C3CE0 100%)',
                boxShadow: '0 0 32px rgba(162,89,255,0.30)',
              }}
            >
              Walk the Figma × Cursor journey
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/partnerships/figma/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border"
              style={{
                borderColor: 'rgba(162,89,255,0.4)',
                color: '#A259FF',
              }}
            >
              Or run the live design-drift demo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p data-figma-hero-text className="text-xs text-text-tertiary mb-6">
            Pick the journey for the 6-act story · pick the demo for the live MCP call
          </p>

          <p data-figma-hero-text className="text-sm text-text-tertiary mb-12">
            Or scroll to experience the full workflow
          </p>
        </div>
      </section>

      {/* Act 1: The Game of Telephone */}
      <TelephoneScene />

      {/* Act 2: Figma MCP Connects Designs to Cursor */}
      <McpBridgeScene />

      {/* Act 3: Design Mode — Designers Iterate Directly */}
      <DesignModeScene />

      {/* Act 4: Multi-Model Build Pipeline */}
      <OrchestrationScene />

      {/* Act 5: Joint Value Proposition */}
      <FigmaValueScene />

      {/* Next demo navigation */}
      <div className="py-20 px-6 border-t border-dark-border">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/partnerships/datadog"
            className="example-cta-pulse group block rounded-xl border-2 p-8 transition-all duration-300 hover:scale-[1.02]"
            style={{
              borderColor: 'rgba(99, 44, 166, 0.5)',
              backgroundColor: 'rgba(99, 44, 166, 0.12)',
              ['--pulse-color' as string]: 'rgba(99, 44, 166, 0.3)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2 text-[#632CA6]">
                  Next Partnership Demo
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  Datadog + Cursor: From Incident to Automated PR
                </h3>
                <p className="text-sm text-text-primary/70 leading-relaxed">
                  See how Datadog&apos;s MCP triggers a Cursor Cloud Agent that triages, fixes, and pushes a PR automatically.
                </p>
              </div>
              <div className="shrink-0 w-14 h-14 rounded-full bg-[#632CA6]/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 text-[#632CA6]" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
