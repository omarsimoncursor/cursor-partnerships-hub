'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Brain, Code2, ShieldCheck, CheckCircle2, Clock, Palette, ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { IPhoneFrame } from './iphone-frame';
import { FlowPipe } from '@/components/shared/flow-pipe';

const PIPELINE_STAGES = [
  {
    icon: Brain,
    model: 'Claude Opus',
    modelColor: '#A259FF',
    role: 'Architect from Design',
    description: 'Reads the full Figma spec via MCP. Maps design components to code architecture, plans responsive breakpoints, defines the component tree.',
    visual: 'Component tree planned from Figma layers',
  },
  {
    icon: Code2,
    model: 'Cursor Composer',
    modelColor: '#60A5FA',
    role: 'Build Pixel-Perfect',
    description: 'Implements each component matching the Figma file exactly. Applies extracted design tokens for colors, spacing, radius, and typography.',
    visual: 'Design tokens applied to every element',
  },
  {
    icon: ShieldCheck,
    model: 'GPT Codex',
    modelColor: '#4ADE80',
    role: 'Verify Fidelity',
    description: 'Checks for accessibility (WCAG contrast ratios), responsive behavior, and pixel-level design fidelity against the Figma source.',
    visual: 'WCAG AA pass, 0 design drift detected',
  },
];

function FidelityHeadphones({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="fid-cup-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B373FF" />
          <stop offset="100%" stopColor="#6C3CE0" />
        </linearGradient>
        <linearGradient id="fid-band-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A2FF" />
          <stop offset="100%" stopColor="#7D4AD9" />
        </linearGradient>
        <linearGradient id="fid-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="fid-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offset" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 16 70 Q 16 22, 60 22 Q 104 22, 104 70"
        stroke="url(#fid-band-grad)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 20 70 Q 20 28, 60 28 Q 100 28, 100 70"
        stroke="#4A2898"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.25"
      />
      <g filter="url(#fid-shadow)">
        <rect x="6" y="60" width="28" height="42" rx="11" fill="url(#fid-cup-grad)" />
        <rect x="6" y="60" width="28" height="16" rx="11" fill="url(#fid-highlight)" />
        <circle cx="20" cy="81" r="7" fill="#2E1765" opacity="0.35" />
        <circle cx="20" cy="81" r="3" fill="#1a0a3d" opacity="0.5" />
      </g>
      <g filter="url(#fid-shadow)">
        <rect x="86" y="60" width="28" height="42" rx="11" fill="url(#fid-cup-grad)" />
        <rect x="86" y="60" width="28" height="16" rx="11" fill="url(#fid-highlight)" />
        <circle cx="100" cy="81" r="7" fill="#2E1765" opacity="0.35" />
        <circle cx="100" cy="81" r="3" fill="#1a0a3d" opacity="0.5" />
      </g>
      <circle cx="20" cy="67" r="1" fill="white" opacity="0.8" />
      <circle cx="100" cy="67" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

function FidelityCartScreen() {
  return (
    <div className="px-4 pt-2 pb-4">
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-5">
        <ChevronLeft className="w-5 h-5 text-white/80" />
        <span className="text-[13px] font-semibold text-white">Shopping Cart</span>
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-white/80" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}>
            2
          </div>
        </div>
      </div>

      {/* Product card */}
      <div
        className="rounded-2xl p-4 mb-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(162, 89, 255, 0.08), rgba(30, 30, 46, 0.9))',
          border: '1px solid rgba(162, 89, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(162, 89, 255, 0.12), 0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-bold text-white tracking-wide z-10"
          style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}
        >
          -20% OFF
        </div>

        <div
          className="w-full h-[110px] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(162, 89, 255, 0.15), rgba(108, 60, 224, 0.08))' }}
        >
          <FidelityHeadphones size={96} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <p className="text-[13px] font-semibold text-white mb-0.5">Premium Wireless Headphones</p>
        <p className="text-[10px] text-white/45 mb-3">Noise-cancelling &middot; 30hr battery &middot; Spatial Audio</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-white">$249</span>
            <span className="text-[11px] text-white/35 line-through">$299</span>
          </div>
          <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(162, 89, 255, 0.25)' }}>
            <button className="w-7 h-7 flex items-center justify-center text-white/50">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 h-7 flex items-center justify-center text-[11px] font-semibold text-white bg-white/5">1</span>
            <button className="w-7 h-7 flex items-center justify-center text-[#A259FF]">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-3">Order Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[11px] text-white/50">Subtotal</span>
            <span className="text-[11px] text-white/80">$249.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/50">Shipping</span>
            <span className="text-[11px] text-[#4ADE80] font-medium">Free</span>
          </div>
          <div className="h-px bg-white/8 my-1" />
          <div className="flex justify-between">
            <span className="text-[12px] font-semibold text-white">Total</span>
            <span className="text-[12px] font-bold text-white">$249.00</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-white tracking-wide"
        style={{
          background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
          boxShadow: '0 4px 20px rgba(162, 89, 255, 0.3), 0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        Checkout
      </button>

      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="w-8 h-5 rounded bg-white/10" />
        <div className="w-8 h-5 rounded bg-white/10" />
        <div className="w-8 h-5 rounded bg-white/10" />
      </div>
    </div>
  );
}

export function OrchestrationScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pipeline-stage]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0, y: 40, stagger: 0.2, duration: 0.8, ease: 'power3.out',
      });
      gsap.from('[data-pipeline-arrow]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        opacity: 0, scale: 0, stagger: 0.3, duration: 0.4, delay: 0.8, ease: 'back.out(2)',
      });
      gsap.from('[data-fidelity-left]', {
        scrollTrigger: { trigger: '[data-fidelity]', start: 'top 75%' },
        opacity: 0, x: -40, duration: 0.8, ease: 'power3.out',
      });
      gsap.from('[data-fidelity-right]', {
        scrollTrigger: { trigger: '[data-fidelity]', start: 'top 75%' },
        opacity: 0, x: 40, duration: 0.8, delay: 0.3, ease: 'power3.out',
      });
      gsap.from('[data-fidelity-match]', {
        scrollTrigger: { trigger: '[data-fidelity]', start: 'top 70%' },
        opacity: 0, scale: 0, duration: 0.5, delay: 0.8, ease: 'back.out(2)',
      });
      gsap.from('[data-orch-metric]', {
        scrollTrigger: { trigger: '[data-orch-metrics]', start: 'top 85%' },
        opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 4</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">The Agent Builds Exactly What Was Designed</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Multi-model orchestration turns the approved Figma design into production components. Opus reads the design spec, Composer builds pixel-perfect, Codex verifies fidelity. Zero drift.
        </p>

        {/* Pipeline visualization */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 mb-16">
          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={i} className="flex items-center flex-1">
                <div data-pipeline-stage className="glass-card p-5 flex-1 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stage.modelColor}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stage.modelColor }} />
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${stage.modelColor}15`, color: stage.modelColor }}
                    >
                      {stage.model}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">{stage.role}</h3>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">{stage.description}</p>
                  <div className="pt-3 border-t border-dark-border">
                    <p className="text-xs" style={{ color: stage.modelColor }}>{stage.visual}</p>
                  </div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-5" style={{ backgroundColor: stage.modelColor }} />
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div data-pipeline-arrow className="hidden md:flex items-center justify-center w-16 shrink-0">
                    <FlowPipe
                      width={64}
                      height={40}
                      color={PIPELINE_STAGES[i + 1].modelColor}
                      packetCount={2}
                      duration={1.4}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fidelity comparison in iPhones */}
        <div data-fidelity className="mb-16">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <CheckCircle2 className="w-5 h-5 text-accent-green" />
            <span className="text-sm font-semibold text-accent-green">Design Fidelity Check &mdash; 100% Match</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
            <div data-fidelity-left className="shrink-0">
              <IPhoneFrame label="Figma Spec" labelColor="#A259FF">
                <FidelityCartScreen />
              </IPhoneFrame>
            </div>

            {/* Match indicator */}
            <div data-fidelity-match className="flex flex-col items-center justify-center w-20 md:w-28 shrink-0 py-6">
              <div className="w-14 h-14 rounded-full bg-accent-green/10 border-2 border-accent-green/30 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-7 h-7 text-accent-green" />
              </div>
              <span className="text-[11px] text-accent-green font-bold tracking-wide">PIXEL</span>
              <span className="text-[11px] text-accent-green font-bold tracking-wide">PERFECT</span>
            </div>

            <div data-fidelity-right className="shrink-0">
              <IPhoneFrame label="Built by Cursor Agent" labelColor="#4ADE80">
                <FidelityCartScreen />
              </IPhoneFrame>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div data-orch-metrics className="grid grid-cols-3 gap-4">
          <div data-orch-metric className="glass-card p-5 text-center">
            <Clock className="w-6 h-6 text-accent-green mx-auto mb-3" />
            <p className="text-2xl font-bold text-text-primary mb-1">12 min</p>
            <p className="text-xs text-text-tertiary">Figma design to finished components</p>
          </div>
          <div data-orch-metric className="glass-card p-5 text-center">
            <Palette className="w-6 h-6 text-[#A259FF] mx-auto mb-3" />
            <p className="text-2xl font-bold text-text-primary mb-1">100%</p>
            <p className="text-xs text-text-tertiary">Design token fidelity</p>
          </div>
          <div data-orch-metric className="glass-card p-5 text-center">
            <CheckCircle2 className="w-6 h-6 text-accent-amber mx-auto mb-3" />
            <p className="text-2xl font-bold text-text-primary mb-1">0</p>
            <p className="text-xs text-text-tertiary">Design drift issues</p>
          </div>
        </div>
      </div>
    </section>
  );
}
