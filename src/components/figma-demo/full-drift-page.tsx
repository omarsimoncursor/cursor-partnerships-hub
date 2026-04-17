'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, Eye } from 'lucide-react';
import { ProductCardCanonical, ProductCardDrifted } from './product-card-drifted';

interface Callout {
  n: number;
  property: string;
  expected: string;
  shipped: string;
  delta: string;
}

const CALLOUTS: Callout[] = [
  { n: 1, property: 'radius/md',           expected: '16 px',     shipped: '12 px',     delta: '−4 px' },
  { n: 2, property: 'space/6 (padding)',   expected: '24 px',     shipped: '20 px',     delta: '−4 px' },
  { n: 3, property: 'font.title',          expected: '600 / 18',  shipped: '700 / 17',  delta: '+100 / −1' },
  { n: 4, property: 'color/brand/accent',  expected: '#A259FF',   shipped: '#9A4FFF',   delta: 'ΔE 6.2' },
];

interface FullDriftPageProps {
  onGo: () => void;
  onReset: () => void;
}

export function FullDriftPage({ onGo, onReset }: FullDriftPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-dark-bg overflow-y-auto">
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #A259FF 0%, #6C3CE0 100%)' }}
      />

      <div className="flex-1 flex flex-col items-center px-6 py-12 md:py-16">
        <div className="max-w-5xl w-full">
          {/* Heading */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
              style={{
                background: 'rgba(245,166,35,0.10)',
                border: '1px solid rgba(245,166,35,0.30)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623]">
                Design drift detected
              </span>
            </div>

            <h1
              className="text-3xl md:text-5xl font-bold leading-tight mb-3"
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #D6BBFF 50%, #A259FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Design drift detected on ProductCard v2.3
            </h1>

            <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
              <span className="font-mono text-[#F5A623]">4 violations</span> against{' '}
              <span className="font-mono text-text-primary">design-system/tokens@v2.3</span> — drift
              exceeds <span className="font-mono">±2 px / ΔE &gt; 4</span> threshold.
            </p>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {/* Figma frame */}
            <ComparisonPanel
              label="Figma frame"
              sublabel="Marketing/Shop/ProductCard@2.3"
              accentColor="#A259FF"
              tag="TARGET"
            >
              <ProductCardCanonical />
            </ComparisonPanel>

            {/* Shipped */}
            <ComparisonPanel
              label="Shipped"
              sublabel="src/components/figma-demo/product-card-drifted.tsx"
              accentColor="#F5A623"
              tag="DRIFTED"
            >
              <div className="relative">
                <ProductCardDrifted />
                {/* Static numbered pins on the shipped version */}
                <PinDot n={1} top={-10} left={-10} />
                <PinDot n={2} top={-10} left={'46%'} />
                <PinDot n={3} top={'56%'} left={-10} />
                <PinDot n={4} top={'88%'} left={'42%'} />
              </div>
            </ComparisonPanel>
          </div>

          {/* Callouts table */}
          <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden mb-10">
            <div className="grid grid-cols-[44px_1.4fr_1fr_1fr_1fr] px-5 py-2.5 border-b border-dark-border bg-dark-bg text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              <span>#</span>
              <span>Variable</span>
              <span>Figma spec</span>
              <span>Shipped</span>
              <span>Delta</span>
            </div>
            {CALLOUTS.map((c, i) => (
              <div
                key={c.n}
                className={`grid grid-cols-[44px_1.4fr_1fr_1fr_1fr] px-5 py-3 items-center text-sm ${
                  i < CALLOUTS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold"
                  style={{
                    background: '#F5A623',
                    color: '#1a0d00',
                    boxShadow: '0 0 0 2px rgba(245,166,35,0.18)',
                  }}
                >
                  {c.n}
                </span>
                <span className="font-mono text-[12.5px] text-text-primary">{c.property}</span>
                <span className="font-mono text-[12.5px] text-text-secondary">{c.expected}</span>
                <span className="font-mono text-[12.5px] text-[#F5A623]">{c.shipped}</span>
                <span className="font-mono text-[12.5px] text-[#F5A623]">{c.delta}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* CTAs */}
          <div className="text-center">
            <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
              Watch a Cursor agent restore the component to 100% Figma match —
              token-only edits, no semantic changes.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                ref={goRef}
                onClick={onGo}
                className="group px-7 py-3 rounded-full font-semibold text-base
                           transition-all duration-200 flex items-center gap-2 cursor-pointer text-white"
                style={{
                  background: 'linear-gradient(135deg, #A259FF 0%, #6C3CE0 100%)',
                  boxShadow: '0 0 32px rgba(162,89,255,0.35)',
                }}
              >
                <Eye className="w-4 h-4" />
                Watch Cursor fix this
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onReset}
                className="px-5 py-3 rounded-full border border-dark-border text-text-secondary font-medium text-sm
                           hover:bg-dark-surface-hover hover:text-text-primary transition-colors cursor-pointer
                           flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonPanel({
  label,
  sublabel,
  accentColor,
  tag,
  children,
}: {
  label: string;
  sublabel: string;
  accentColor: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-border bg-dark-bg flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary leading-none mb-1">{label}</p>
          <p className="text-[11px] text-text-tertiary font-mono truncate">{sublabel}</p>
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
          style={{
            color: accentColor,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}40`,
          }}
        >
          {tag}
        </span>
      </div>
      <div className="p-8 flex items-center justify-center min-h-[440px]" style={{ background: '#0a0a0d' }}>
        {children}
      </div>
    </div>
  );
}

function PinDot({ n, top, left }: { n: number; top: number | string; left: number | string }) {
  return (
    <span
      className="absolute flex items-center justify-center text-[11px] font-bold"
      style={{
        top,
        left,
        width: 22,
        height: 22,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: '#F5A623',
        color: '#1a0d00',
        border: '2px solid #fff',
        boxShadow: '0 4px 14px rgba(245,166,35,0.55)',
        zIndex: 5,
      }}
    >
      <span style={{ transform: 'rotate(45deg)' }}>{n}</span>
    </span>
  );
}
