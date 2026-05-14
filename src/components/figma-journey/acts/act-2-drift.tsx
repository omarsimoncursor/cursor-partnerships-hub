'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
} from 'lucide-react';
import { FigmaActShell, FigmaActHeader } from './act-shell';
import { FigmaGlyph } from '../figma-glyph';
import { IPhoneFrame } from '@/components/figma-partner/iphone-frame';
import { MacBookFrame } from '@/components/shared/macbook-frame';

interface Act2Props {
  onAdvance: () => void;
}

const HALLUCINATIONS = [
  {
    label: 'Brand color',
    spec: '#6C3CE0 (Acme Violet)',
    actual: '#FF7A00 (generic orange)',
  },
  { label: 'Corner radius', spec: '20px (--radius-lg)', actual: '4px (LLM default)' },
  { label: 'Font', spec: 'Söhne 600 / 14px', actual: 'system-ui, "sans-serif"' },
  { label: 'Spacing token', spec: '24px (space-6)', actual: '11px ("looks about right")' },
  { label: 'Component', spec: '<ProductCardV3 />', actual: 'invented from scratch' },
  { label: 'Imagery', spec: 'photographed product', actual: 'gradient placeholder' },
];

export function Act2Drift({ onAdvance }: Act2Props) {
  return (
    <FigmaActShell act={2}>
      <FigmaActHeader
        act={2}
        eyebrow="The same designer's PM tries 'just have AI build it.' Here is what AI ships when Figma isn't in the loop."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left: the actual Figma spec — ground truth */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#A259FF' }}>
            <FigmaGlyph size={10} />
            What the designer drew · ground truth
          </div>
          <IPhoneFrame label="Figma file · v3.4" labelColor="#A259FF">
            <SpecCardScreen />
          </IPhoneFrame>
        </div>

        {/* Right: macbook with the AI-only output */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#F87171' }}>
            <Ban className="h-3 w-3" />
            What AI shipped · no Figma access
          </div>
          <div className="flex justify-center">
            <MacBookFrame finish="space-black" width={620} label="Generic LLM · zero design context" labelColor="#F87171">
              <div className="flex h-full w-full flex-col bg-[#15131D]">
                {/* Browser chrome */}
                <div className="flex shrink-0 items-center gap-1.5 border-b border-white/5 bg-[#1a1825] px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <div className="h-2 w-2 rounded-full bg-[#28c840]" />
                  <div className="ml-3 flex items-center gap-1.5 text-[9px] text-white/50 font-mono">
                    <Sparkles className="h-2.5 w-2.5 text-[#F87171]" />
                    <span>cursor — without figma mcp</span>
                  </div>
                  <span className="ml-auto rounded-full bg-[#F87171]/15 px-1.5 py-0.5 font-mono text-[8px] text-[#F87171]">
                    HALLUCINATING
                  </span>
                </div>

                {/* Side-by-side preview + diff list */}
                <div className="flex flex-1 overflow-hidden">
                  <div className="flex-1 overflow-hidden border-r border-white/5 p-4">
                    <div className="mb-2 text-[8px] font-mono uppercase tracking-widest text-white/35">
                      preview
                    </div>
                    <DriftedCardWeb />
                  </div>
                  <div className="w-[260px] overflow-y-auto bg-[#0F0D1A] p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#F87171]">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      drift report · 6 issues
                    </div>
                    <ul className="space-y-1.5">
                      {HALLUCINATIONS.map((h, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-white/8 bg-white/[0.02] p-2"
                        >
                          <div className="text-[9px] font-mono uppercase tracking-wider text-white/45">
                            {h.label}
                          </div>
                          <div className="mt-0.5 text-[9.5px] line-through text-[#86EFAC]/80">
                            {h.spec}
                          </div>
                          <div className="text-[9.5px] font-semibold text-[#F87171]">
                            {h.actual}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </MacBookFrame>
          </div>
        </div>
      </div>

      {/* The verdict strip */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <Stat
          number="0"
          unit="components"
          label="from your design system were used"
          color="#F87171"
        />
        <Stat
          number="6"
          unit="hallucinations"
          label="introduced into a single screen"
          color="#F59E0B"
        />
        <Stat
          number="3-5"
          unit="cycles"
          label="of redlining before this matches the spec"
          color="#F87171"
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 pt-2 text-center">
        <p className="max-w-2xl text-[14px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.7)' }}>
          The model didn&apos;t fail because it&apos;s a bad model. It failed because it never saw
          the Figma file. Without design context, an LLM is a confident guess machine. The result is
          something that <em>kind of</em> looks like an app — and nothing like the designer&apos;s
          intent.
        </p>
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#A259FF', color: '#0F0A1F' }}
        >
          Now plug Figma into the loop
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </FigmaActShell>
  );
}

/** The polished, Figma-drawn spec — clean, branded, with rich detail. */
function SpecCardScreen() {
  return (
    <div className="px-4 pt-2 pb-4">
      <div className="mb-4 flex items-center justify-between">
        <ChevronLeft className="h-5 w-5 text-white/80" />
        <span className="text-[13px] font-semibold text-white">Acme · Featured</span>
        <ShoppingBag className="h-5 w-5 text-white/80" />
      </div>

      <div
        className="relative mb-4 overflow-hidden rounded-2xl p-4"
        style={{
          background: 'linear-gradient(145deg, rgba(162, 89, 255, 0.12), rgba(20, 17, 42, 0.95))',
          border: '1px solid rgba(162, 89, 255, 0.18)',
          boxShadow: '0 12px 36px rgba(108, 60, 224, 0.18), 0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        <div
          className="absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide text-white"
          style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}
        >
          NEW
        </div>
        {/* "Photographed" product surface */}
        <div
          className="mb-3 flex h-[120px] items-center justify-center overflow-hidden rounded-xl"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, rgba(162,89,255,0.18) 35%, rgba(108,60,224,0.12) 70%, rgba(20,17,42,1) 100%)',
          }}
        >
          <ProductSilhouette />
        </div>
        <p className="mb-0.5 text-[13px] font-semibold text-white">Acme Aero Backpack</p>
        <div className="mb-1 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-[#FBBF24] text-[#FBBF24]" />
          ))}
          <span className="ml-1 text-[9px] text-white/50">4.9 · 12,418 reviews</span>
        </div>
        <p className="mb-3 text-[10px] text-white/45">Recycled Cordura · 24L · lifetime warranty</p>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-white">$185</span>
          <button
            className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wide text-white"
            style={{
              background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
              boxShadow: '0 4px 18px rgba(162, 89, 255, 0.45)',
            }}
          >
            Add to bag
          </button>
        </div>
      </div>

      <div
        className="mb-3 rounded-2xl p-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white/85">Wishlist</span>
          <Heart className="h-3.5 w-3.5 text-[#A259FF]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-12 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(162,89,255,0.18), rgba(108,60,224,0.06))',
              }}
            />
          ))}
        </div>
      </div>

      <button
        className="w-full rounded-2xl py-3 text-[13px] font-semibold tracking-wide text-white"
        style={{
          background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
          boxShadow: '0 6px 22px rgba(162, 89, 255, 0.35)',
        }}
      >
        Continue to checkout
      </button>
    </div>
  );
}

/** A loose backpack silhouette — purely decorative. */
function ProductSilhouette() {
  return (
    <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
      <defs>
        <linearGradient id="bp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4B5FF" />
          <stop offset="100%" stopColor="#6C3CE0" />
        </linearGradient>
      </defs>
      <path
        d="M22 10 Q40 0, 58 10 L62 24 Q72 28, 72 42 L72 78 Q72 88, 62 88 L18 88 Q8 88, 8 78 L8 42 Q8 28, 18 24 Z"
        fill="url(#bp-grad)"
      />
      <rect x="22" y="38" width="36" height="22" rx="4" fill="rgba(0,0,0,0.25)" />
      <rect x="28" y="44" width="24" height="2.5" rx="1.25" fill="rgba(255,255,255,0.4)" />
      <circle cx="40" cy="68" r="3" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

/**
 * The drifted, AI-hallucinated version. Wrong colors, wrong fonts, generic
 * components, awkward spacing, missing details.
 */
function DriftedCardWeb() {
  return (
    <div
      className="mx-auto h-full max-w-[260px] rounded-md border border-white/8 bg-[#0e0c1a] p-3"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Top "nav" — flat, ugly */}
      <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[9px] text-white/55">‹ Back</span>
        <span className="text-[10px] font-bold text-white">My Store</span>
        <span className="text-[9px] text-white/55">Cart (1)</span>
      </div>

      {/* Card with garish color, sharp corners, default font */}
      <div
        className="rounded p-2"
        style={{
          background: '#1a1726',
          border: '1px solid #2a2640',
        }}
      >
        <div className="mb-2 flex h-[72px] items-center justify-center rounded bg-gradient-to-br from-[#FF7A00] to-[#A85500]">
          <span className="text-[22px]">🎒</span>
        </div>
        <p
          className="mb-0.5 text-[11px] font-bold text-white"
          style={{ fontFamily: 'system-ui' }}
        >
          Backpack — Premium Edition
        </p>
        <p className="mb-2 text-[9px] text-white/60">High quality. Best seller. Lorem ipsum.</p>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-white">$185.00</span>
          <button
            className="rounded px-2.5 py-1 text-[9px] font-bold text-white"
            style={{ background: '#FF7A00', borderRadius: 4 }}
          >
            BUY NOW
          </button>
        </div>
      </div>

      {/* "Wishlist" was forgotten entirely — replaced with a placeholder */}
      <div
        className="mt-3 rounded border border-dashed border-white/15 px-2 py-2 text-[8px] italic text-white/40"
      >
        // TODO: add wishlist + recommendations component (see Figma — not provided)
      </div>

      {/* Cta — square, system blue, no brand */}
      <button
        className="mt-3 w-full rounded py-2 text-[10px] font-semibold text-white"
        style={{ background: '#3b82f6' }}
      >
        Submit Order
      </button>
    </div>
  );
}

function Stat({
  number,
  unit,
  label,
  color,
}: {
  number: string;
  unit: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>
          {number}
        </span>
        <span className="text-[11px] uppercase tracking-wider" style={{ color }}>
          {unit}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-white/65">{label}</p>
    </div>
  );
}
