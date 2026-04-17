'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Eye, MessageSquare, RotateCcw, Sparkles, MousePointer2, Check, ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { IPhoneFrame } from './iphone-frame';
import { MacBookFrame } from '@/components/shared/macbook-frame';
import { FlowPipe } from '@/components/shared/flow-pipe';

type FixKey = 'radius' | 'badge' | 'image' | 'cta';

interface Annotation {
  id: FixKey;
  index: number;
  title: string;
  issue: string;
  fix: string;
  /** Position of the pin on the phone canvas (% of canvas w/h) */
  pin: { top: string; left: string };
  /** Position of the callout card relative to the phone canvas */
  callout: { top: string; left?: string; right?: string };
}

const ANNOTATIONS: Annotation[] = [
  {
    id: 'radius',
    index: 1,
    title: 'Corner Radius',
    issue: 'border-radius: 8px',
    fix: 'Should be 20px (token: --radius-lg)',
    pin: { top: '12%', left: '4%' },
    callout: { top: '2%', left: 'calc(100% + 20px)' },
  },
  {
    id: 'badge',
    index: 2,
    title: 'Discount Badge',
    issue: 'Flat purple, square corners',
    fix: 'Use brand gradient + pill shape',
    pin: { top: '15%', left: '85%' },
    callout: { top: '22%', left: 'calc(100% + 20px)' },
  },
  {
    id: 'image',
    index: 3,
    title: 'Product Image Surface',
    issue: 'Flat rgba(255,255,255,0.05) fill',
    fix: 'Apply brand gradient surface',
    pin: { top: '30%', left: '50%' },
    callout: { top: '44%', left: 'calc(100% + 20px)' },
  },
  {
    id: 'cta',
    index: 4,
    title: 'Checkout Button',
    issue: 'Solid fill, no elevation',
    fix: 'Brand gradient + level 3 shadow',
    pin: { top: '90%', left: '50%' },
    callout: { top: '66%', left: 'calc(100% + 20px)' },
  },
];

const BENEFITS = [
  { icon: Eye, title: 'Inspect Real Components', description: 'Click any element on a rendered preview to see the live code behind it. No "it\'s pixel 42 from the top" guessing.' },
  { icon: MessageSquare, title: 'Annotate, Don\'t Explain', description: 'Drop visual corrections directly on the UI. The agent reads your pins as structured intent, not prose.' },
  { icon: RotateCcw, title: 'Zero Revision Cycles', description: 'Design intent flows straight to production code. No screenshots in Jira, no misinterpreted specs.' },
];

/** Mini headphones illustration — polished or drifted */
function Headphones({ drifted = false, size = 72 }: { drifted?: boolean; size?: number }) {
  if (drifted) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <path d="M 28 62 Q 60 38, 92 62" stroke="#9CA3AF" strokeWidth="3" fill="none" />
        <rect x="18" y="58" width="22" height="34" rx="4" fill="#D1D5DB" />
        <rect x="22" y="68" width="14" height="14" rx="2" fill="#9CA3AF" opacity="0.5" />
        <rect x="80" y="60" width="22" height="34" rx="4" fill="#D1D5DB" />
        <rect x="84" y="70" width="14" height="14" rx="2" fill="#9CA3AF" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="dm-cup" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B373FF" />
          <stop offset="100%" stopColor="#6C3CE0" />
        </linearGradient>
        <linearGradient id="dm-band" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A2FF" />
          <stop offset="100%" stopColor="#7D4AD9" />
        </linearGradient>
      </defs>
      <path d="M 16 70 Q 16 22, 60 22 Q 104 22, 104 70" stroke="url(#dm-band)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="6" y="60" width="28" height="42" rx="11" fill="url(#dm-cup)" />
      <rect x="86" y="60" width="28" height="42" rx="11" fill="url(#dm-cup)" />
      <circle cx="20" cy="81" r="3" fill="#1a0a3d" opacity="0.5" />
      <circle cx="100" cy="81" r="3" fill="#1a0a3d" opacity="0.5" />
    </svg>
  );
}

/** Rendered cart inside the designer's browser — starts drifted, progressively fixes */
function RenderedCart({ fixed }: { fixed: Record<FixKey, boolean> }) {
  const radiusClass = fixed.radius ? 'rounded-2xl' : 'rounded-lg';
  const imageBg = fixed.image
    ? 'linear-gradient(135deg, rgba(162, 89, 255, 0.15), rgba(108, 60, 224, 0.08))'
    : 'rgba(255,255,255,0.05)';
  const badgeStyle = fixed.badge
    ? { background: 'linear-gradient(135deg, #A259FF, #6C3CE0)', borderRadius: '9999px', padding: '4px 10px' }
    : { background: '#A259FF', borderRadius: '4px', padding: '2px 8px' };
  const ctaStyle = fixed.cta
    ? {
        background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
        boxShadow: '0 4px 20px rgba(162, 89, 255, 0.35)',
        borderRadius: '14px',
      }
    : { background: '#A259FF', borderRadius: '8px', boxShadow: 'none' };

  return (
    <div
      className="relative bg-[#0f0d0a] rounded-[22px] overflow-hidden border border-white/8"
      style={{ width: 230, height: 360 }}
    >
      <div className="px-3 pt-2 pb-3 h-full flex flex-col">
        {/* Nav */}
        <div className="flex items-center justify-between mb-3">
          <ChevronLeft className="w-4 h-4 text-white/70" />
          <span className="text-[11px] font-semibold text-white">Cart</span>
          <div className="relative">
            <ShoppingCart className="w-4 h-4 text-white/70" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-[#A259FF]">2</div>
          </div>
        </div>

        {/* Product card */}
        <div
          className={`relative p-2.5 mb-3 transition-all duration-700 ${radiusClass}`}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute top-2 right-2 text-[8px] font-bold text-white tracking-wide transition-all duration-700"
            style={badgeStyle}
          >
            -20% OFF
          </div>
          <div
            className={`w-full h-[80px] mb-2 flex items-center justify-center transition-all duration-700 ${fixed.image ? 'rounded-xl' : 'rounded'}`}
            style={{ background: imageBg }}
          >
            <Headphones drifted={!fixed.image} size={fixed.image ? 68 : 60} />
          </div>
          <p className="text-[11px] font-semibold text-white mb-0.5">Premium Wireless Headphones</p>
          <p className="text-[9px] text-white/40 mb-1.5">Noise-cancelling · 30hr battery</p>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-white">$249</span>
            <div className="flex items-center gap-0.5">
              <button className="w-5 h-5 rounded bg-white/8 flex items-center justify-center text-white/50">
                <Minus className="w-2 h-2" />
              </button>
              <span className="w-5 h-5 flex items-center justify-center text-[9px] text-white/80">1</span>
              <button className="w-5 h-5 rounded bg-white/8 flex items-center justify-center text-white/50">
                <Plus className="w-2 h-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-2 mb-2 space-y-1">
          <div className="flex justify-between text-[9px]">
            <span className="text-white/45">Subtotal</span>
            <span className="text-white/70">$249.00</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-white/45">Shipping</span>
            <span className="text-white/70">Free</span>
          </div>
          <div className="h-px bg-white/8 my-1" />
          <div className="flex justify-between">
            <span className="text-[10px] font-medium text-white">Total</span>
            <span className="text-[10px] font-bold text-white">$249.00</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full py-2.5 text-[11px] font-semibold text-white transition-all duration-700"
          style={ctaStyle}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

/** Annotation pin marker (numbered badge) */
function AnnotationPin({ index, resolved, visible }: { index: number; resolved: boolean; visible: boolean }) {
  const color = resolved ? '#4ADE80' : '#F87171';
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)' }}
    >
      <div className="relative">
        {/* Outer pulse ring */}
        {!resolved && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: color, opacity: 0.4 }}
          />
        )}
        {/* Pin */}
        <div
          className="relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white/20"
          style={{
            background: color,
            boxShadow: `0 0 12px ${color}, 0 2px 6px rgba(0,0,0,0.3)`,
          }}
        >
          {resolved ? <Check className="w-3 h-3" strokeWidth={3} /> : index}
        </div>
      </div>
    </div>
  );
}

/** Annotation callout card */
function AnnotationCallout({ annotation, resolved, visible }: { annotation: Annotation; resolved: boolean; visible: boolean }) {
  const borderColor = resolved ? '#4ADE80' : '#F87171';
  const bgColor = resolved ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)';
  return (
    <div
      className="absolute transition-all duration-500 pointer-events-none"
      style={{
        top: annotation.callout.top,
        left: annotation.callout.left,
        right: annotation.callout.right,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-8px)',
      }}
    >
      <div
        className="rounded-lg p-2 w-[160px]"
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          boxShadow: `0 4px 16px ${borderColor}30, 0 0 0 1px ${borderColor}20`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
            style={{ background: borderColor }}
          >
            {resolved ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : annotation.index}
          </div>
          <span className="text-[10px] font-semibold text-white">{annotation.title}</span>
          {resolved && (
            <span className="text-[8px] font-mono text-[#4ADE80] ml-auto uppercase tracking-wider">Fixed</span>
          )}
        </div>
        <p className={`text-[9px] font-mono mb-0.5 ${resolved ? 'line-through text-white/40' : 'text-[#F87171]'}`}>
          {annotation.issue}
        </p>
        <p className={`text-[9px] ${resolved ? 'text-[#4ADE80]' : 'text-white/70'}`}>
          → {annotation.fix}
        </p>
      </div>
    </div>
  );
}

/** Live preview cart for the iPhone on the right */
function LivePreviewCart({ fixed }: { fixed: Record<FixKey, boolean> }) {
  const radiusClass = fixed.radius ? 'rounded-2xl' : 'rounded-lg';
  const imageBg = fixed.image
    ? 'linear-gradient(135deg, rgba(162, 89, 255, 0.15), rgba(108, 60, 224, 0.08))'
    : 'rgba(255,255,255,0.05)';
  const badgeStyle = fixed.badge
    ? { background: 'linear-gradient(135deg, #A259FF, #6C3CE0)', borderRadius: '9999px', padding: '4px 10px' }
    : { background: '#A259FF', borderRadius: '4px', padding: '2px 8px' };
  const ctaStyle = fixed.cta
    ? {
        background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
        boxShadow: '0 6px 24px rgba(162, 89, 255, 0.4)',
        borderRadius: '16px',
      }
    : { background: '#A259FF', borderRadius: '8px', boxShadow: 'none' };

  return (
    <div className="px-4 pt-2 pb-4">
      <div className="flex items-center justify-between mb-4">
        <ChevronLeft className="w-5 h-5 text-white/80" />
        <span className="text-[13px] font-semibold text-white">Cart</span>
        <ShoppingCart className="w-5 h-5 text-white/80" />
      </div>

      <div
        className={`relative p-4 mb-3 transition-all duration-700 ${radiusClass}`}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="absolute top-3 right-3 text-[9px] font-bold text-white tracking-wide transition-all duration-700"
          style={badgeStyle}
        >
          -20% OFF
        </div>
        <div
          className={`w-full h-[100px] mb-3 flex items-center justify-center transition-all duration-700 ${fixed.image ? 'rounded-xl' : 'rounded'}`}
          style={{ background: imageBg }}
        >
          <Headphones drifted={!fixed.image} size={fixed.image ? 80 : 68} />
        </div>
        <p className="text-[13px] font-semibold text-white mb-0.5">Premium Wireless Headphones</p>
        <p className="text-[10px] text-white/45 mb-3">Noise-cancelling · 30hr battery</p>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-white">$249</span>
          <div className="flex items-center gap-0.5">
            <button className="w-6 h-6 rounded bg-white/8 flex items-center justify-center text-white/50">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 h-6 flex items-center justify-center text-[10px] text-white/80">1</span>
            <button className="w-6 h-6 rounded bg-white/8 flex items-center justify-center text-white/50">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 mb-3 space-y-1.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/50">Subtotal</span>
          <span className="text-white/80">$249.00</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-white/50">Shipping</span>
          <span className="text-[#4ADE80] font-medium">Free</span>
        </div>
        <div className="h-px bg-white/8" />
        <div className="flex justify-between">
          <span className="text-[11px] font-medium text-white">Total</span>
          <span className="text-[11px] font-bold text-white">$249.00</span>
        </div>
      </div>

      <button
        className="w-full py-3.5 text-[13px] font-semibold text-white transition-all duration-700"
        style={ctaStyle}
      >
        Checkout
      </button>
    </div>
  );
}

export function DesignModeScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  // step 0: all annotations open (unfixed)
  // step 1: annotation 1 resolved
  // step 2: annotations 1+2 resolved
  // step 3: annotations 1+2+3 resolved
  // step 4: all 4 resolved (fully fixed)
  const fixed: Record<FixKey, boolean> = {
    radius: step >= 1,
    badge: step >= 2,
    image: step >= 3,
    cta: step >= 4,
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-dm-stage]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0, y: 30, duration: 1, ease: 'power3.out',
      });
      gsap.from('[data-dm-benefit]', {
        scrollTrigger: { trigger: '[data-dm-benefits]', start: 'top 80%' },
        opacity: 0, y: 20, stagger: 0.15, duration: 0.5, ease: 'power3.out',
      });

      const interval = { val: 0 };
      const tween = gsap.to(interval, {
        val: 1,
        duration: 2.2,
        repeat: -1,
        ease: 'none',
        onRepeat: () => {
          setStep(prev => (prev >= 4 ? 0 : prev + 1));
        },
        scrollTrigger: {
          trigger: '[data-dm-stage]',
          start: 'top 60%',
          end: 'bottom top',
          toggleActions: 'play pause resume pause',
        },
      });
      return () => tween.kill();
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 3</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Design Mode &mdash; Annotate the Real UI</h2>
        </div>
        <p className="text-text-secondary mb-16 max-w-xl">
          Designers don&apos;t write tickets. They open Cursor Design Mode, click the misconfigured elements on the rendered page, and drop visual corrections directly on the UI. The agent reads the pins and ships fixes &mdash; the live preview updates in real time.
        </p>

        {/* MacBook + iPhone */}
        <div data-dm-stage className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0 mb-20">
          <div className="shrink-0">
            <MacBookFrame finish="silver" width={720} label="Cursor Design Mode" labelColor="#A259FF">
              <div className="h-full w-full bg-[#14120b] flex flex-col overflow-hidden">
                {/* Browser toolbar */}
                <div className="h-7 bg-[#1a1814] flex items-center px-3 gap-1.5 border-b border-white/5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                  <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                  <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                  <div className="flex items-center gap-1.5 ml-3">
                    <Sparkles className="w-2.5 h-2.5 text-[#A259FF]" />
                    <span className="text-[9px] text-white/60 font-semibold">Cursor &mdash; Design Mode</span>
                  </div>
                  <div className="ml-4 flex items-center gap-1.5 text-[9px] text-white/50 font-mono">
                    <MousePointer2 className="w-2.5 h-2.5 text-[#A259FF]" />
                    <span>Inspect</span>
                  </div>
                  <span className="ml-auto text-[8px] text-[#4ADE80] bg-[#4ADE80]/10 px-1.5 py-0.5 rounded-full font-mono">LIVE PREVIEW</span>
                </div>

                {/* Design canvas */}
                <div className="flex-1 relative bg-[radial-gradient(circle_at_20%_20%,rgba(162,89,255,0.05),transparent_50%)] overflow-hidden">
                  {/* Grid texture */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Rendered cart + annotations */}
                  <div className="relative flex items-center h-full pl-8">
                    <div className="relative">
                      <RenderedCart fixed={fixed} />

                      {/* Pins overlaid on rendered canvas */}
                      {ANNOTATIONS.map((ann) => (
                        <div
                          key={ann.id}
                          className="absolute"
                          style={{ top: ann.pin.top, left: ann.pin.left }}
                        >
                          <AnnotationPin
                            index={ann.index}
                            resolved={fixed[ann.id]}
                            visible
                          />
                        </div>
                      ))}

                      {/* Callouts floating to the right */}
                      {ANNOTATIONS.map((ann) => (
                        <AnnotationCallout
                          key={ann.id}
                          annotation={ann}
                          resolved={fixed[ann.id]}
                          visible
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-black/40 backdrop-blur-sm border-t border-white/5 flex items-center gap-3 text-[9px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A259FF] animate-pulse" />
                      <span className="text-white/60">{ANNOTATIONS.filter(a => !fixed[a.id]).length} open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-2.5 h-2.5 text-[#4ADE80]" />
                      <span className="text-[#4ADE80]">{ANNOTATIONS.filter(a => fixed[a.id]).length} fixed</span>
                    </div>
                    <span className="ml-auto text-white/40">ProductCard.tsx · line 47</span>
                    <span className="text-[#A259FF]">Cursor Agent applying fixes…</span>
                  </div>
                </div>
              </div>
            </MacBookFrame>
          </div>

          {/* Connecting pipe */}
          <div className="hidden lg:flex items-center justify-center shrink-0 w-24">
            <FlowPipe
              width={88}
              height={60}
              color="#A259FF"
              label="sync"
              packetCount={3}
              duration={1.4}
            />
          </div>
          <div className="flex lg:hidden items-center justify-center shrink-0">
            <FlowPipe
              width={80}
              height={40}
              color="#A259FF"
              vertical
              direction="down"
              packetCount={3}
              duration={1.4}
            />
          </div>

          <div className="shrink-0">
            <IPhoneFrame label="Live Preview" labelColor="#4ADE80">
              <LivePreviewCart fixed={fixed} />
            </IPhoneFrame>
          </div>
        </div>

        {/* Benefits */}
        <div data-dm-benefits className="grid md:grid-cols-3 gap-4">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} data-dm-benefit className="glass-card p-5">
                <Icon className="w-6 h-6 text-[#A259FF] mb-3" />
                <h3 className="text-base font-semibold text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
