'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Cloud,
  Layers,
  Palette,
  ShoppingBag,
  Sparkles,
  Type,
  Star,
  Heart,
} from 'lucide-react';
import { FigmaActShell, FigmaActHeader } from './act-shell';
import { FigmaGlyph } from '../figma-glyph';
import { IPhoneFrame } from '@/components/figma-partner/iphone-frame';
import { MacBookFrame } from '@/components/shared/macbook-frame';

interface Act3Props {
  onAdvance: () => void;
  /** Notify the page when the live MCP call completes successfully. */
  onMcpCall?: (n: number) => void;
}

type Phase = 'request' | 'roundtrip' | 'response' | 'compose' | 'rendered';

const TRANSCRIPT: Array<{
  side: 'cursor' | 'figma';
  ts: string;
  text: string;
  badge?: string;
}> = [
  {
    side: 'cursor',
    ts: '10:42:14',
    text: 'tools/call → figma.get_node({ file: "acme-checkout", node: "ProductCardV3" })',
    badge: 'mcp.request',
  },
  {
    side: 'figma',
    ts: '10:42:14',
    text: 'returned 1 component · 17 layers · 4 variants · 12 design tokens',
    badge: 'mcp.response',
  },
  {
    side: 'cursor',
    ts: '10:42:15',
    text: 'tools/call → figma.get_styles({ scope: "ProductCardV3" })',
    badge: 'mcp.request',
  },
  {
    side: 'figma',
    ts: '10:42:15',
    text: 'returned 8 color tokens · 3 typography styles · 4 spacing tokens',
    badge: 'mcp.response',
  },
  {
    side: 'cursor',
    ts: '10:42:16',
    text: 'tools/call → figma.get_image({ node: "AcmeAeroBackpack/photo" })',
    badge: 'mcp.request',
  },
  {
    side: 'figma',
    ts: '10:42:16',
    text: 'returned 1 image asset · 2x retina · 84KB webp',
    badge: 'mcp.response',
  },
  {
    side: 'cursor',
    ts: '10:42:17',
    text: '✔ context loaded · generating ProductCardV3.tsx with grounded design tokens',
    badge: 'compose',
  },
];

export function Act3Handshake({ onAdvance, onMcpCall }: Act3Props) {
  const [phase, setPhase] = useState<Phase>('request');
  const [tIndex, setTIndex] = useState(0);
  const [calls, setCalls] = useState(0);

  // Drive the transcript
  useEffect(() => {
    if (phase !== 'roundtrip') return;
    if (tIndex >= TRANSCRIPT.length) {
      setPhase('response');
      return;
    }
    const id = setTimeout(() => {
      const entry = TRANSCRIPT[tIndex];
      if (entry?.side === 'figma' && entry.badge === 'mcp.response') {
        setCalls((c) => {
          const next = Math.min(3, c + 1);
          onMcpCall?.(next);
          return next;
        });
      }
      setTIndex((i) => i + 1);
    }, 700);
    return () => clearTimeout(id);
  }, [phase, tIndex, onMcpCall]);

  // Top-level phase machine
  useEffect(() => {
    setPhase('request');
    const t1 = setTimeout(() => setPhase('roundtrip'), 600);
    return () => {
      clearTimeout(t1);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'response') return;
    const t = setTimeout(() => setPhase('compose'), 700);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'compose') return;
    const t = setTimeout(() => setPhase('rendered'), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  const rendered = phase === 'rendered';

  return (
    <FigmaActShell act={3}>
      <FigmaActHeader
        act={3}
        eyebrow="Cursor doesn't guess. It asks Figma. The Figma MCP is the bridge between the design source of truth and the AI agent writing your code."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left — the "stage": Cursor agent panel + Figma file */}
        <MacBookFrame
          finish="space-black"
          width={600}
          label="Cursor — agent calling figma mcp"
          labelColor="#A259FF"
        >
          <div className="flex h-full w-full bg-[#0E0A1F]">
            {/* Cursor agent transcript */}
            <div className="flex flex-1 flex-col border-r border-white/5">
              <div className="flex shrink-0 items-center gap-1.5 border-b border-white/5 bg-[#15122A] px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <div className="h-2 w-2 rounded-full bg-[#28c840]" />
                <div className="ml-3 flex items-center gap-1.5 text-[9px] text-white/50 font-mono">
                  <Sparkles className="h-2.5 w-2.5 text-[#A259FF]" />
                  <span>cursor — agent</span>
                </div>
                <span
                  className="ml-auto rounded-full px-1.5 py-0.5 font-mono text-[8px] text-[#A259FF]"
                  style={{ background: 'rgba(162, 89, 255, 0.15)' }}
                >
                  {calls}/3 MCP
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono">
                <div className="mb-2 text-[9px] uppercase tracking-widest text-white/40">
                  agent prompt
                </div>
                <div className="mb-3 rounded-md border border-white/10 bg-white/[0.03] p-2 text-[10px] text-white/85">
                  Build the <span className="text-[#A259FF]">ProductCardV3</span> from the Acme
                  checkout file, exact to the Figma spec.
                </div>
                <div className="mb-2 text-[9px] uppercase tracking-widest text-white/40">
                  trace
                </div>
                <ol className="space-y-1.5">
                  {TRANSCRIPT.slice(0, tIndex).map((entry, i) => (
                    <TranscriptLine key={i} entry={entry} fresh={i === tIndex - 1} />
                  ))}
                </ol>
              </div>
            </div>

            {/* Figma file panel */}
            <div className="w-[210px] shrink-0 bg-[#0B0817] flex flex-col">
              <div className="flex shrink-0 items-center gap-1.5 border-b border-white/5 bg-[#13102A] px-3 py-1.5">
                <FigmaGlyph size={9} />
                <span className="text-[9px] font-semibold text-white/70">Figma — acme-checkout</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5">
                <FigmaLayerTree highlight={tIndex} />
                <FigmaTokenStrip highlight={tIndex} />
              </div>
            </div>
          </div>
        </MacBookFrame>

        {/* Right column: live phone preview + token receipts */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4ADE80]">
            ↓ Generated by Cursor with grounded Figma context
          </div>
          <IPhoneFrame label={rendered ? 'Pixel-perfect output' : 'Composing…'} labelColor={rendered ? '#4ADE80' : '#A259FF'}>
            {rendered ? <SpecCardScreen /> : <ComposingScreen />}
          </IPhoneFrame>
          <ReceiptsStrip phase={phase} calls={calls} />
        </div>
      </div>

      {/* The thesis line + advance */}
      <div className="mt-12 flex flex-col items-center gap-4 pt-2 text-center">
        <div
          className="max-w-3xl rounded-xl border px-6 py-5"
          style={{
            background:
              'linear-gradient(180deg, rgba(162,89,255,0.1) 0%, rgba(162,89,255,0.02) 100%)',
            borderColor: 'rgba(162, 89, 255, 0.3)',
          }}
        >
          <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#A259FF' }}>
            <FigmaGlyph size={10} /> figma is in the ai sdlc loop
          </div>
          <p className="text-base leading-relaxed md:text-lg" style={{ color: '#F3F4F6' }}>
            The Figma MCP is what makes pixel-perfect AI generation possible. Without it,
            <span className="opacity-60"> the agent guesses.</span> With it,
            <strong style={{ color: '#A259FF' }}> the agent reads the source of truth.</strong>
          </p>
          <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.65)' }}>
            Designers and Figma sales reps: this is the message. <strong>Cursor + Figma MCP</strong>{' '}
            is what ensures generated code <em>can&apos;t</em> hallucinate components or deviate from
            the design system.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#A259FF', color: '#0F0A1F' }}
        >
          Watch the designer steer the agent
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </FigmaActShell>
  );
}

/* -----------------------------  bits  ----------------------------- */

function TranscriptLine({
  entry,
  fresh,
}: {
  entry: (typeof TRANSCRIPT)[number];
  fresh: boolean;
}) {
  const isReq = entry.side === 'cursor';
  const accent = entry.badge === 'compose' ? '#4ADE80' : isReq ? '#A259FF' : '#60A5FA';
  const bg = entry.badge === 'compose'
    ? 'rgba(74, 222, 128, 0.08)'
    : isReq
      ? 'rgba(162, 89, 255, 0.07)'
      : 'rgba(96, 165, 250, 0.07)';
  return (
    <li
      className="rounded-md border px-2 py-1.5 transition-all"
      style={{
        background: bg,
        borderColor: `${accent}30`,
        boxShadow: fresh ? `0 0 0 2px ${accent}25` : 'none',
      }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[8px] font-mono text-white/40">{entry.ts}</span>
        <span
          className="rounded-full px-1.5 py-[1px] font-mono text-[7.5px] uppercase tracking-wider"
          style={{ background: `${accent}20`, color: accent }}
        >
          {entry.badge}
        </span>
      </div>
      <p className="mt-0.5 text-[10px] leading-snug text-white/85">{entry.text}</p>
    </li>
  );
}

function FigmaLayerTree({ highlight }: { highlight: number }) {
  const layers: Array<{ name: string; depth: number; lit: boolean }> = [
    { name: 'Page · Checkout', depth: 0, lit: true },
    { name: 'Frame · iPhone 15', depth: 1, lit: true },
    { name: '🟣 ProductCardV3', depth: 2, lit: highlight >= 2 },
    { name: '   🖼 photo', depth: 3, lit: highlight >= 6 },
    { name: '   T title', depth: 3, lit: highlight >= 4 },
    { name: '   ★ rating', depth: 3, lit: highlight >= 4 },
    { name: '   $ price', depth: 3, lit: highlight >= 4 },
    { name: '   ▢ cta', depth: 3, lit: highlight >= 4 },
    { name: 'Frame · Wishlist', depth: 1, lit: false },
  ];
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[8px] font-mono uppercase tracking-widest text-white/40">
        layers
      </div>
      <ul className="space-y-0.5">
        {layers.map((l, i) => (
          <li
            key={i}
            className="rounded-sm px-1.5 py-0.5 text-[9.5px] transition-colors"
            style={{
              paddingLeft: 6 + l.depth * 8,
              color: l.lit ? '#D4B5FF' : 'rgba(255,255,255,0.4)',
              background: l.lit ? 'rgba(162,89,255,0.08)' : 'transparent',
            }}
          >
            {l.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FigmaTokenStrip({ highlight }: { highlight: number }) {
  const showTokens = highlight >= 4;
  const showImage = highlight >= 6;
  return (
    <>
      <div className="mb-1.5 text-[8px] font-mono uppercase tracking-widest text-white/40">
        styles
      </div>
      <div className="grid grid-cols-4 gap-1">
        {['#A259FF', '#6C3CE0', '#F3F4F6', '#FBBF24'].map((c, i) => (
          <div
            key={i}
            className="h-5 w-full rounded transition-opacity"
            style={{ background: c, opacity: showTokens ? 1 : 0.2 }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[8px] text-white/55">
        <div className={showTokens ? '' : 'opacity-30'}>Söhne 600</div>
        <div className={showTokens ? '' : 'opacity-30'}>14 / 20</div>
        <div className={showTokens ? '' : 'opacity-30'}>radius 20</div>
        <div className={showTokens ? '' : 'opacity-30'}>space 24</div>
      </div>
      <div
        className={`mt-2 flex h-12 items-center justify-center rounded text-[8px] transition-opacity ${
          showImage ? 'opacity-100' : 'opacity-20'
        }`}
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, rgba(162,89,255,0.18) 35%, rgba(108,60,224,0.12) 70%, rgba(20,17,42,1) 100%)',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        backpack.webp
      </div>
    </>
  );
}

function ReceiptsStrip({ phase, calls }: { phase: Phase; calls: number }) {
  const items = [
    { icon: <Layers className="h-3 w-3" />, label: '17 layers', got: calls >= 1 },
    { icon: <Palette className="h-3 w-3" />, label: '12 tokens', got: calls >= 2 },
    { icon: <Cloud className="h-3 w-3" />, label: '1 asset', got: calls >= 3 },
    {
      icon: <Type className="h-3 w-3" />,
      label: 'Söhne 600',
      got: calls >= 2,
    },
  ];
  return (
    <div
      className="flex w-full max-w-[300px] flex-wrap items-center justify-center gap-1.5 rounded-xl border px-3 py-2"
      style={{
        background: 'rgba(162, 89, 255, 0.05)',
        borderColor: 'rgba(162, 89, 255, 0.25)',
      }}
    >
      {items.map((it, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-all"
          style={{
            background: it.got ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.04)',
            borderColor: it.got ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255,255,255,0.1)',
            color: it.got ? '#4ADE80' : 'rgba(255,255,255,0.5)',
          }}
        >
          {it.got ? <Check className="h-3 w-3" /> : it.icon}
          {it.label}
        </span>
      ))}
      <span className="ml-auto text-[9px] uppercase tracking-wider text-white/45">
        receipts {phase === 'rendered' ? '· complete' : ''}
      </span>
    </div>
  );
}

function ComposingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
      <div className="flex items-center gap-2 text-[10px] font-mono text-[#A259FF]">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#A259FF]" />
        composing ProductCardV3 with grounded tokens
      </div>
      <div className="space-y-2 w-full">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-3 rounded animate-pulse"
            style={{
              background: 'rgba(162,89,255,0.12)',
              animationDelay: `${i * 120}ms`,
              width: `${100 - i * 8}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

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

function ProductSilhouette() {
  return (
    <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
      <defs>
        <linearGradient id="bp-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4B5FF" />
          <stop offset="100%" stopColor="#6C3CE0" />
        </linearGradient>
      </defs>
      <path
        d="M22 10 Q40 0, 58 10 L62 24 Q72 28, 72 42 L72 78 Q72 88, 62 88 L18 88 Q8 88, 8 78 L8 42 Q8 28, 18 24 Z"
        fill="url(#bp-grad-3)"
      />
      <rect x="22" y="38" width="36" height="22" rx="4" fill="rgba(0,0,0,0.25)" />
      <rect x="28" y="44" width="24" height="2.5" rx="1.25" fill="rgba(255,255,255,0.4)" />
      <circle cx="40" cy="68" r="3" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}
