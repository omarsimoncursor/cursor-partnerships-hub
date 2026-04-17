'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AlertTriangle, Clock, MessageSquare, XCircle, ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { IPhoneFrame } from './iphone-frame';

const PAIN_POINTS = [
  { icon: Clock, label: '3-5 revision cycles', description: 'Average rounds before design matches implementation' },
  { icon: MessageSquare, label: '47% of tickets', description: 'Reopened due to design-implementation mismatches' },
  { icon: XCircle, label: '2-3 week delays', description: 'Added to timelines from miscommunication overhead' },
];

function PolishedHeadphones({ size = 110 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="poly-cup-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B373FF" />
          <stop offset="100%" stopColor="#6C3CE0" />
        </linearGradient>
        <linearGradient id="poly-band-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A2FF" />
          <stop offset="100%" stopColor="#7D4AD9" />
        </linearGradient>
        <linearGradient id="poly-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="poly-shadow" x="-20%" y="-20%" width="140%" height="140%">
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
      {/* Headband outer arc */}
      <path
        d="M 16 70 Q 16 22, 60 22 Q 104 22, 104 70"
        stroke="url(#poly-band-grad)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      {/* Headband inner cushion */}
      <path
        d="M 20 70 Q 20 28, 60 28 Q 100 28, 100 70"
        stroke="#4A2898"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.25"
      />
      {/* Left cup */}
      <g filter="url(#poly-shadow)">
        <rect x="6" y="60" width="28" height="42" rx="11" fill="url(#poly-cup-grad)" />
        <rect x="6" y="60" width="28" height="16" rx="11" fill="url(#poly-highlight)" />
        <circle cx="20" cy="81" r="7" fill="#2E1765" opacity="0.35" />
        <circle cx="20" cy="81" r="3" fill="#1a0a3d" opacity="0.5" />
      </g>
      {/* Right cup */}
      <g filter="url(#poly-shadow)">
        <rect x="86" y="60" width="28" height="42" rx="11" fill="url(#poly-cup-grad)" />
        <rect x="86" y="60" width="28" height="16" rx="11" fill="url(#poly-highlight)" />
        <circle cx="100" cy="81" r="7" fill="#2E1765" opacity="0.35" />
        <circle cx="100" cy="81" r="3" fill="#1a0a3d" opacity="0.5" />
      </g>
      {/* Tiny brand dot on each cup */}
      <circle cx="20" cy="67" r="1" fill="white" opacity="0.8" />
      <circle cx="100" cy="67" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

function DesignerCartScreen() {
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
        {/* Discount badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-bold text-white tracking-wide z-10"
          style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}
        >
          -20% OFF
        </div>

        {/* Product image */}
        <div
          className="w-full h-[110px] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(162, 89, 255, 0.15), rgba(108, 60, 224, 0.08))' }}
        >
          <PolishedHeadphones size={96} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <p className="text-[13px] font-semibold text-white mb-0.5">Premium Wireless Headphones</p>
        <p className="text-[10px] text-white/45 mb-3">Noise-cancelling &middot; 30hr battery &middot; Spatial Audio</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-white">$249</span>
            <span className="text-[11px] text-white/35 line-through">$299</span>
          </div>

          {/* Qty selector */}
          <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(162, 89, 255, 0.25)' }}>
            <button className="w-7 h-7 flex items-center justify-center text-white/50 hover:bg-white/5">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 h-7 flex items-center justify-center text-[11px] font-semibold text-white bg-white/5">1</span>
            <button className="w-7 h-7 flex items-center justify-center text-[#A259FF]">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Order summary */}
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

      {/* Checkout CTA */}
      <button
        className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-white tracking-wide"
        style={{
          background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
          boxShadow: '0 4px 20px rgba(162, 89, 255, 0.3), 0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        Checkout
      </button>

      {/* Payment methods */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="w-8 h-5 rounded bg-white/10" />
        <div className="w-8 h-5 rounded bg-white/10" />
        <div className="w-8 h-5 rounded bg-white/10" />
      </div>
    </div>
  );
}

function DriftedHeadphones({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Headband — too thin, wrong arc */}
      <path
        d="M 28 62 Q 60 38, 92 62"
        stroke="#9CA3AF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="butt"
      />
      {/* Left cup — wrong proportions, square-ish, flat */}
      <rect x="18" y="58" width="22" height="34" rx="4" fill="#D1D5DB" />
      <rect x="22" y="68" width="14" height="14" rx="2" fill="#9CA3AF" opacity="0.5" />
      {/* Right cup — mis-aligned slightly */}
      <rect x="80" y="60" width="22" height="34" rx="4" fill="#D1D5DB" />
      <rect x="84" y="70" width="14" height="14" rx="2" fill="#9CA3AF" opacity="0.5" />
    </svg>
  );
}

function EngineerCartScreen() {
  return (
    <div className="px-4 pt-2 pb-4">
      {/* Nav bar - slightly off */}
      <div className="flex items-center justify-between mb-4">
        <ChevronLeft className="w-5 h-5 text-white/60" />
        <span className="text-[13px] font-medium text-white/80">Cart</span>
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-white/60" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded bg-[#A259FF] flex items-center justify-center text-[7px] font-bold text-white">
            2
          </div>
        </div>
      </div>

      {/* Product card - drifted */}
      <div
        className="rounded-lg p-3 mb-3 relative"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Badge - wrong style */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-[#A259FF]">
          -20% OFF
        </div>

        {/* Product image - flat */}
        <div className="w-full h-[90px] rounded bg-white/5 mb-2.5 flex items-center justify-center">
          <DriftedHeadphones size={72} />
        </div>

        <p className="text-[12px] font-medium text-white/90 mb-0.5">Premium Wireless Headphones</p>
        <p className="text-[10px] text-white/35 mb-2">Noise-cancelling, 30hr battery</p>

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-white/90">$249</span>
          {/* Qty - basic */}
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded bg-white/8 flex items-center justify-center text-white/40">
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="w-6 h-6 flex items-center justify-center text-[11px] text-white/70">1</span>
            <button className="w-6 h-6 rounded bg-white/8 flex items-center justify-center text-white/40">
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary - minimal */}
      <div className="p-3 mb-3">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[10px] text-white/40">Subtotal</span>
            <span className="text-[10px] text-white/60">$249.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-white/40">Shipping</span>
            <span className="text-[10px] text-white/60">Free</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between">
            <span className="text-[11px] font-medium text-white/80">Total</span>
            <span className="text-[11px] font-medium text-white/80">$249.00</span>
          </div>
        </div>
      </div>

      {/* CTA - wrong radius, no gradient */}
      <button className="w-full py-3 rounded-lg text-[12px] font-medium text-white bg-[#A259FF]">
        Checkout
      </button>

      <div className="flex items-center justify-center gap-2 mt-2.5">
        <div className="w-7 h-4 rounded-sm bg-white/6" />
        <div className="w-7 h-4 rounded-sm bg-white/6" />
        <div className="w-7 h-4 rounded-sm bg-white/6" />
      </div>
    </div>
  );
}

export function TelephoneScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-phone-left]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0, x: -60, rotateY: 8, duration: 1, ease: 'power3.out',
      });
      gsap.from('[data-drift-arrow]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0, scale: 0, duration: 0.4, delay: 0.7, ease: 'back.out(2)',
      });
      gsap.from('[data-phone-right]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0, x: 60, rotateY: -8, duration: 1, delay: 0.3, ease: 'power3.out',
      });
      gsap.from('[data-redline]', {
        scrollTrigger: { trigger: '[data-redlines]', start: 'top 80%' },
        opacity: 0, y: 10, stagger: 0.08, duration: 0.4, delay: 1.2, ease: 'power3.out',
      });
      gsap.from('[data-pain-point]', {
        scrollTrigger: { trigger: '[data-pain-points]', start: 'top 80%' },
        opacity: 0, y: 20, stagger: 0.15, duration: 0.5, ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 1</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">The Game of Telephone</h2>
        </div>
        <p className="text-text-secondary mb-16 max-w-xl">
          A designer draws a polished checkout cart in Figma. The engineer interprets the spec differently. Corner radii, shadows, gradients, spacing &mdash; every detail drifts. QA catches discrepancies. The cycle repeats for weeks.
        </p>

        {/* Side-by-side iPhones */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 mb-16">
          <div data-phone-left className="shrink-0">
            <IPhoneFrame label="Figma Design Spec" labelColor="#A259FF">
              <DesignerCartScreen />
            </IPhoneFrame>
          </div>

          {/* Drift indicator */}
          <div data-drift-arrow className="flex flex-col items-center justify-center w-20 md:w-28 shrink-0 py-6">
            <div className="w-12 h-12 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-accent-red" />
            </div>
            <span className="text-[11px] text-accent-red font-bold tracking-wide">DESIGN</span>
            <span className="text-[11px] text-accent-red font-bold tracking-wide">DRIFT</span>
          </div>

          <div data-phone-right className="shrink-0">
            <IPhoneFrame label="What Was Shipped" labelColor="#f87171">
              <EngineerCartScreen />
            </IPhoneFrame>
          </div>
        </div>

        {/* Redline annotations */}
        <div data-redlines className="rounded-xl border border-accent-red/20 bg-accent-red/5 p-5 mb-16">
          <p className="text-xs font-semibold text-accent-red mb-4 uppercase tracking-wider">QA Redline Review &mdash; 14 discrepancies found</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { spec: 'border-radius: 16px', actual: '8px', label: 'Corner Radius' },
              { spec: 'gradient badge (pill)', actual: 'solid flat (square)', label: 'Badge Style' },
              { spec: 'shadow-lg + glow', actual: 'no shadow', label: 'Card Shadow' },
              { spec: 'padding: 16px', actual: '12px', label: 'Card Padding' },
              { spec: 'gradient CTA', actual: 'flat solid', label: 'Button Style' },
              { spec: '$299 strikethrough', actual: 'missing', label: 'Original Price' },
              { spec: 'pill qty selector', actual: 'square buttons', label: 'Qty Control' },
              { spec: 'summary bg card', actual: 'no background', label: 'Summary Section' },
            ].map((diff, i) => (
              <div key={i} data-redline className="bg-dark-bg rounded-lg p-3">
                <p className="text-[10px] text-text-tertiary uppercase mb-1.5">{diff.label}</p>
                <p className="text-[10px] text-accent-green line-through mb-0.5 font-mono">{diff.spec}</p>
                <p className="text-[10px] text-accent-red font-semibold font-mono">{diff.actual}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pain points */}
        <div data-pain-points className="grid md:grid-cols-3 gap-4">
          {PAIN_POINTS.map((point, i) => {
            const Icon = point.icon;
            return (
              <div key={i} data-pain-point className="glass-card p-5 border-accent-red/10">
                <Icon className="w-6 h-6 text-accent-red mb-3" />
                <p className="text-lg font-bold text-text-primary mb-1">{point.label}</p>
                <p className="text-xs text-text-secondary">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
