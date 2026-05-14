'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  GitCommit,
  MousePointer2,
  Palette,
  Sparkles,
  ShoppingBag,
  Star,
  Heart,
} from 'lucide-react';
import { FigmaActShell, FigmaActHeader } from './act-shell';
import { FigmaGlyph } from '../figma-glyph';
import { IPhoneFrame } from '@/components/figma-partner/iphone-frame';
import { MacBookFrame } from '@/components/shared/macbook-frame';
import { FlowPipe } from '@/components/shared/flow-pipe';

interface Act4Props {
  onAdvance: () => void;
  onMcpCall?: () => void;
  onFidelity?: (pct: number) => void;
}

type Step = 'before' | 'designer-edits' | 'mcp-call' | 'agent-patches' | 'shipped';

/**
 * Act 4: the designer changes the primary CTA in Figma. Cursor calls the Figma
 * MCP to fetch the updated component, the Composer writes the patch, and the
 * live preview on the iPhone swaps to the new style.
 */
export function Act4DesignMode({ onAdvance, onMcpCall, onFidelity }: Act4Props) {
  const [step, setStep] = useState<Step>('before');

  useEffect(() => {
    onFidelity?.(65);
    const t1 = setTimeout(() => setStep('designer-edits'), 900);
    const t2 = setTimeout(() => {
      setStep('mcp-call');
      onMcpCall?.();
      onFidelity?.(85);
    }, 2600);
    const t3 = setTimeout(() => setStep('agent-patches'), 4600);
    const t4 = setTimeout(() => {
      setStep('shipped');
      onFidelity?.(100);
    }, 6800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onMcpCall, onFidelity]);

  const variantShipped = step === 'shipped';
  const variantPreview = step === 'agent-patches' || step === 'shipped';

  return (
    <FigmaActShell act={4}>
      <FigmaActHeader
        act={4}
        eyebrow="The designer opens Figma, swaps the primary CTA to the new secondary variant, and saves. Cursor notices, calls the Figma MCP, and ships the change. No ticket. No Slack thread."
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_auto_0.95fr] lg:items-center">
        {/* LEFT: designer in Figma */}
        <div className="flex justify-center lg:justify-start">
          <MacBookFrame
            finish="silver"
            width={620}
            label="Figma — acme-checkout · Designer: Priya"
            labelColor="#6C3CE0"
          >
            <FigmaCanvas step={step} />
          </MacBookFrame>
        </div>

        {/* MIDDLE: the MCP call itself */}
        <McpCallBridge step={step} />

        {/* RIGHT: the iPhone live preview */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: variantShipped ? '#16A34A' : '#6C3CE0' }}
          >
            Shipped preview · Cursor composer
          </div>
          <IPhoneFrame
            label={variantShipped ? 'live · v3.5' : 'applying patch'}
            labelColor={variantShipped ? '#16A34A' : '#6C3CE0'}
          >
            <LivePreviewScreen variantNew={variantPreview} />
          </IPhoneFrame>
          <AgentStripe step={step} />
        </div>
      </div>

      {/* Receipts / commit line */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <ReceiptCard
          icon={<FigmaGlyph size={14} />}
          title="Figma"
          value="variant=secondary"
          sub="ProductCardV3 · updated by Priya"
          color="#A259FF"
          active={step !== 'before'}
        />
        <ReceiptCard
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Figma MCP"
          value="get_component()"
          sub="styles · variants · responsive rules"
          color="#6C3CE0"
          active={step === 'mcp-call' || step === 'agent-patches' || step === 'shipped'}
        />
        <ReceiptCard
          icon={<GitCommit className="h-3.5 w-3.5" />}
          title="PR #418"
          value="ProductCardV3.tsx"
          sub="+6 / -4 · tests pass · 0 drift"
          color="#16A34A"
          active={step === 'shipped'}
        />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 pt-2 text-center">
        <p className="max-w-2xl text-[14px] leading-relaxed" style={{ color: 'rgba(20,17,42,0.75)' }}>
          This is the Figma → Cursor loop working as designed. The designer stays in Figma, where
          they&apos;re fastest. The agent stays in Cursor, where it&apos;s fastest. The MCP is the handshake.
          What ships is exactly what was designed — no interpretation, no regressions, no revision
          cycles.
        </p>
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#6C3CE0', color: '#FFFFFF', boxShadow: '0 12px 24px -8px rgba(108,60,224,0.45)' }}
        >
          See Figma&apos;s place in the AI-native SDLC
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </FigmaActShell>
  );
}

/* -------------------------  Figma canvas  ------------------------- */

function FigmaCanvas({ step }: { step: Step }) {
  const showEdit = step !== 'before';
  const variantNew = step !== 'before';
  return (
    <div className="flex h-full w-full flex-col bg-[#2C2C2C]">
      {/* Figma toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-black/40 bg-[#1E1E1E] px-3 py-1.5">
        <FigmaGlyph size={10} />
        <span className="text-[9px] font-semibold text-white/80">acme-checkout · Design</span>
        <span className="ml-2 text-[8px] font-mono text-white/40">v3.4 → v3.5 (unsaved)</span>
        <span className="ml-auto flex items-center gap-1.5">
          <Avatar seed="P" color="#A259FF" />
          <Avatar seed="M" color="#0ACF83" small />
          <Avatar seed="J" color="#FF7262" small />
          <span className="ml-2 rounded-full bg-[#0ACF83]/15 px-1.5 py-0.5 font-mono text-[8px] text-[#0ACF83]">
            3 live
          </span>
        </span>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Left layer panel */}
        <div className="absolute left-0 top-0 bottom-0 w-[130px] border-r border-black/40 bg-[#2C2C2C] p-2">
          <div className="mb-1.5 text-[8px] font-mono uppercase tracking-widest text-white/35">
            Layers
          </div>
          <ul className="space-y-0.5 text-[9px] text-white/60">
            <li>▾ Page — Checkout</li>
            <li className="pl-2">▾ Frame · iPhone 15</li>
            <li
              className="pl-4 rounded-sm px-1"
              style={{
                color: showEdit ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                background: showEdit ? 'rgba(24,145,255,0.35)' : 'transparent',
              }}
            >
              ▸ ProductCardV3
            </li>
            <li className="pl-6 text-white/45">photo</li>
            <li className="pl-6 text-white/45">title</li>
            <li
              className="pl-6 rounded-sm px-1"
              style={{
                color: showEdit ? '#18E1A8' : 'rgba(255,255,255,0.45)',
              }}
            >
              cta {showEdit && <span className="ml-1 text-[7px] font-mono text-[#18E1A8]">● edit</span>}
            </li>
            <li className="pl-4 text-white/45">▸ Wishlist</li>
          </ul>
        </div>

        {/* The artboard */}
        <div className="absolute left-[150px] right-[150px] top-6 bottom-6 flex items-center justify-center">
          <div
            className="relative rounded-lg bg-[#14112A] p-3 shadow-2xl"
            style={{
              width: 180,
              border: showEdit ? '1.5px solid #1891FF' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: showEdit
                ? '0 0 0 3px rgba(24,145,255,0.15), 0 12px 32px rgba(0,0,0,0.45)'
                : '0 12px 32px rgba(0,0,0,0.45)',
            }}
          >
            {/* Frame label */}
            {showEdit && (
              <div
                className="absolute -top-5 left-0 rounded px-1.5 py-0.5 text-[8px] font-mono text-white"
                style={{ background: '#1891FF' }}
              >
                ProductCardV3 · 280×312
              </div>
            )}

            {/* Mock of the card on the Figma canvas */}
            <MiniSpecCard variantNew={variantNew} />

            {/* Selection resize handles when "editing" */}
            {showEdit && (
              <>
                {[
                  'left-[-4px] top-[-4px]',
                  'right-[-4px] top-[-4px]',
                  'left-[-4px] bottom-[-4px]',
                  'right-[-4px] bottom-[-4px]',
                ].map((pos) => (
                  <span
                    key={pos}
                    className={`absolute h-1.5 w-1.5 border border-white bg-[#1891FF] ${pos}`}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right inspect panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[150px] border-l border-black/40 bg-[#2C2C2C] p-2">
          <div className="mb-1.5 flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-white/35">
            <Palette className="h-2.5 w-2.5" /> Inspect
          </div>
          <div
            className="mb-1.5 rounded border px-1.5 py-1 text-[9px]"
            style={{
              background: showEdit ? 'rgba(24,145,255,0.1)' : 'rgba(255,255,255,0.04)',
              borderColor: showEdit ? 'rgba(24,145,255,0.4)' : 'rgba(255,255,255,0.08)',
              color: showEdit ? '#9FD3FF' : 'rgba(255,255,255,0.6)',
            }}
          >
            Variant:
            <span className="ml-1 font-mono">
              {variantNew ? 'secondary ●' : 'primary'}
            </span>
          </div>
          <div className="space-y-1 text-[8.5px] font-mono text-white/55">
            <Prop k="Fill" v="$brand.500" />
            <Prop k="Radius" v="$radius.lg" />
            <Prop k="Padding" v="16 20" />
            <Prop k="Font" v="Söhne 600" />
            <Prop k="Shadow" v="$elev.3" />
          </div>

          <div className="mt-3 rounded border border-[#A259FF]/30 bg-[#A259FF]/10 px-1.5 py-1.5 text-[8.5px] leading-tight">
            <div className="font-mono text-[7.5px] uppercase tracking-widest text-[#D4B5FF]">
              Comment · Priya
            </div>
            <div className="mt-0.5 text-white/85">
              {step === 'before'
                ? 'Let\'s try the secondary variant for this CTA — more breathing room.'
                : step === 'shipped'
                  ? 'Ship it. Exactly what I wanted.'
                  : 'Updated. Calling Cursor.'}
            </div>
          </div>
        </div>

        {/* Cursor (the pointer) — moves onto the CTA when editing */}
        <div
          className="pointer-events-none absolute transition-all duration-1000"
          style={{
            left: step === 'before' ? '70%' : '52%',
            top: step === 'before' ? '82%' : '62%',
            opacity: step === 'shipped' ? 0 : 1,
          }}
        >
          <MousePointer2 className="h-4 w-4 text-white drop-shadow" />
          <span
            className="absolute left-3 top-3 rounded px-1.5 py-0.5 text-[8px] font-semibold text-white"
            style={{ background: '#A259FF' }}
          >
            Priya
          </span>
        </div>
      </div>

      {/* Bottom status */}
      <div className="flex shrink-0 items-center gap-3 border-t border-black/40 bg-[#1E1E1E] px-3 py-1 font-mono text-[8px] text-white/55">
        <span>{variantNew ? 'saving v3.5…' : 'v3.4 saved'}</span>
        <span className="text-white/30">·</span>
        <span className="text-[#0ACF83]">
          {showEdit ? 'syncing component → MCP' : 'design system in sync'}
        </span>
        <span className="ml-auto">zoom 100% · 1 selected</span>
      </div>
    </div>
  );
}

function MiniSpecCard({ variantNew }: { variantNew: boolean }) {
  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between text-[8px] text-white/60">
        <ChevronLeft className="h-2.5 w-2.5" />
        <span className="font-semibold">Acme · Featured</span>
        <ShoppingBag className="h-2.5 w-2.5" />
      </div>
      <div
        className="mb-2 flex h-[70px] items-center justify-center rounded-md"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(162,89,255,0.22) 35%, rgba(108,60,224,0.12) 70%, rgba(20,17,42,1) 100%)',
        }}
      >
        <svg width={46} height={54} viewBox="0 0 80 92" fill="none">
          <defs>
            <linearGradient id="bp-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4B5FF" />
              <stop offset="100%" stopColor="#6C3CE0" />
            </linearGradient>
          </defs>
          <path
            d="M22 10 Q40 0, 58 10 L62 24 Q72 28, 72 42 L72 78 Q72 88, 62 88 L18 88 Q8 88, 8 78 L8 42 Q8 28, 18 24 Z"
            fill="url(#bp-grad-4)"
          />
        </svg>
      </div>
      <p className="mb-0.5 text-[9px] font-semibold text-white">Acme Aero Backpack</p>
      <p className="mb-2 text-[7.5px] text-white/50">Recycled Cordura · 24L</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white">$185</span>
        {variantNew ? (
          <button
            className="rounded-full border px-2 py-0.5 text-[7.5px] font-semibold tracking-wide"
            style={{
              color: '#A259FF',
              borderColor: '#A259FF',
              background: 'rgba(162, 89, 255, 0.08)',
            }}
          >
            Add to bag
          </button>
        ) : (
          <button
            className="rounded-full px-2 py-0.5 text-[7.5px] font-bold tracking-wide text-white"
            style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}
          >
            Add to bag
          </button>
        )}
      </div>
    </div>
  );
}

function Avatar({ seed, color, small }: { seed: string; color: string; small?: boolean }) {
  const size = small ? 14 : 16;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[8px] font-bold text-white"
      style={{ background: color, width: size, height: size }}
    >
      {seed}
    </span>
  );
}

function Prop({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/5 py-0.5">
      <span className="text-white/40">{k}</span>
      <span className="text-white/75">{v}</span>
    </div>
  );
}

/* -------------------------  MCP bridge  ------------------------- */

function McpCallBridge({ step }: { step: Step }) {
  const active = step === 'mcp-call' || step === 'agent-patches' || step === 'shipped';
  return (
    <div className="relative hidden flex-col items-center justify-center px-2 py-6 lg:flex">
      <div
        className="mb-2 rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] transition-all"
        style={{
          background: active ? 'rgba(162, 89, 255, 0.12)' : 'rgba(0,0,0,0.05)',
          borderColor: active ? '#A259FF' : 'rgba(20,17,42,0.2)',
          color: active ? '#6C3CE0' : 'rgba(20,17,42,0.5)',
        }}
      >
        Figma MCP
      </div>
      <FlowPipe
        width={100}
        height={48}
        color="#A259FF"
        label="get_component"
        packetCount={4}
        duration={1.6}
      />
      <div
        className="mt-2 rounded-md border px-3 py-1.5 text-[9px] font-mono transition-all"
        style={{
          background: active ? 'rgba(162, 89, 255, 0.08)' : 'rgba(255,255,255,0.5)',
          borderColor: active ? 'rgba(162, 89, 255, 0.35)' : 'rgba(20,17,42,0.12)',
          color: '#14112A',
        }}
      >
        {active ? (
          <>
            <span className="text-[#6C3CE0]">↑</span> ProductCardV3{' '}
            <span className="text-[#6C3CE0]">·</span> variant=secondary
          </>
        ) : (
          'awaiting change…'
        )}
      </div>
    </div>
  );
}

/* -------------------------  iPhone preview  ------------------------- */

function LivePreviewScreen({ variantNew }: { variantNew: boolean }) {
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
          className="mb-3 flex h-[110px] items-center justify-center overflow-hidden rounded-xl"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, rgba(162,89,255,0.18) 35%, rgba(108,60,224,0.12) 70%, rgba(20,17,42,1) 100%)',
          }}
        >
          <svg width={70} height={80} viewBox="0 0 80 92" fill="none">
            <defs>
              <linearGradient id="bp-grad-lp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4B5FF" />
                <stop offset="100%" stopColor="#6C3CE0" />
              </linearGradient>
            </defs>
            <path
              d="M22 10 Q40 0, 58 10 L62 24 Q72 28, 72 42 L72 78 Q72 88, 62 88 L18 88 Q8 88, 8 78 L8 42 Q8 28, 18 24 Z"
              fill="url(#bp-grad-lp)"
            />
          </svg>
        </div>
        <p className="mb-0.5 text-[13px] font-semibold text-white">Acme Aero Backpack</p>
        <div className="mb-1 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-[#FBBF24] text-[#FBBF24]" />
          ))}
          <span className="ml-1 text-[9px] text-white/50">4.9</span>
        </div>
        <p className="mb-3 text-[10px] text-white/45">Recycled Cordura · 24L · lifetime warranty</p>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-white">$185</span>
          {variantNew ? (
            <button
              className="rounded-full border-2 px-4 py-1.5 text-[10px] font-bold tracking-wide transition-all"
              style={{
                color: '#A259FF',
                borderColor: '#A259FF',
                background: 'rgba(162, 89, 255, 0.08)',
              }}
            >
              Add to bag
            </button>
          ) : (
            <button
              className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wide text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
                boxShadow: '0 4px 18px rgba(162, 89, 255, 0.45)',
              }}
            >
              Add to bag
            </button>
          )}
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

function AgentStripe({ step }: { step: Step }) {
  const text =
    step === 'before'
      ? 'Agent idle · watching Figma for design changes…'
      : step === 'designer-edits'
        ? 'Change detected in acme-checkout · ProductCardV3'
        : step === 'mcp-call'
          ? 'Fetching component spec via Figma MCP…'
          : step === 'agent-patches'
            ? 'Composer patching ProductCardV3.tsx · 3 token swaps'
            : 'Done · pushed PR #418 · tests green · 0 drift';
  const tone = step === 'shipped' ? '#16A34A' : step === 'before' ? 'rgba(20,17,42,0.55)' : '#6C3CE0';
  return (
    <div
      className="flex w-full max-w-[300px] items-center gap-2 rounded-xl border px-3 py-2 text-[11px]"
      style={{
        background: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(20,17,42,0.1)',
        color: tone,
      }}
    >
      {step === 'shipped' ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full"
          style={{ background: tone }}
        />
      )}
      <span className="flex-1 font-medium">{text}</span>
    </div>
  );
}

/* -------------------------  receipts  ------------------------- */

function ReceiptCard({
  icon,
  title,
  value,
  sub,
  color,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  color: string;
  active: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4 transition-all"
      style={{
        background: active ? `${color}10` : 'rgba(255,255,255,0.6)',
        borderColor: active ? `${color}40` : 'rgba(20,17,42,0.08)',
        boxShadow: active ? `0 8px 22px -12px ${color}55` : 'none',
        opacity: active ? 1 : 0.6,
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color }}>
        {icon}
        <span>{title}</span>
      </div>
      <div className="font-mono text-[13px] font-semibold" style={{ color: '#14112A' }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: 'rgba(20,17,42,0.55)' }}>
        {sub}
      </div>
    </div>
  );
}
