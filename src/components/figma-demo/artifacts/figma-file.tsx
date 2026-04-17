'use client';

import { type ReactNode } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Search,
  MessageCircle,
  Play,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreHorizontal,
  Code2,
} from 'lucide-react';
import { FigmaLogo } from './figma-logo';
import { ProductCardCanonical } from '../product-card-drifted';

/**
 * Pixel-perfect reproduction of the Figma desktop file UI viewing
 * `Marketing/Shop/ProductCard@2.3`. Composition mirrors the real app:
 *
 *   ┌──────────────────────── top bar (44px) ────────────────────────┐
 *   │ menu · F · file · save     · tools ·    avatars · Share · ▶  │
 *   ├────────┬─────────────────────────────────────────┬────────────┤
 *   │ Layers │  Canvas  (#E5E5E5)                       │  Design    │
 *   │ Assets │  - frame label                           │  Prototype │
 *   │        │  - centered ProductCardCanonical         │  Inspect   │
 *   │        │  - blue 1px selection border             │  ----      │
 *   │        │  - 4 numbered drift annotation pins      │  variables │
 *   │        │  - smart-guides hint                     │  appearance│
 *   └────────┴─────────────────────────────────────────┴────────────┘
 *
 * All chrome colors are sampled from the live Figma client. Avoid editing
 * unless you have the real app open side-by-side.
 */
export function FigmaFile() {
  return (
    <div
      className="w-full h-full bg-white text-[#1E1E1E] overflow-hidden flex flex-col"
      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <TopBar />
      <div className="flex-1 grid grid-cols-[240px_1fr_260px] min-h-0">
        <LeftPanel />
        <Canvas />
        <RightPanel />
      </div>
    </div>
  );
}

/* ─────────────────────────── Top bar ─────────────────────────── */

function TopBar() {
  return (
    <div className="h-11 border-b border-[#E5E5E5] bg-white flex items-center px-2 gap-1 shrink-0">
      {/* Far-left cluster */}
      <button className="w-8 h-8 rounded hover:bg-[#F5F5F5] flex items-center justify-center text-[#1E1E1E]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>
      <div className="w-8 h-8 flex items-center justify-center">
        <FigmaLogo size={14} />
      </div>

      {/* File name + save */}
      <div className="flex items-center gap-1 px-2 h-8 rounded hover:bg-[#F5F5F5] cursor-pointer min-w-0">
        <span className="text-[12px] text-[#777] shrink-0">Cursor Storefront /</span>
        <span className="text-[12px] font-medium text-[#1E1E1E] truncate">Marketing / Shop / ProductCard</span>
        <ChevronDown className="w-3 h-3 text-[#777] shrink-0" />
      </div>
      <div className="flex items-center gap-1 px-1.5 h-6 rounded text-[11px] text-[#777] bg-[#F5F5F5]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#14AE5C]" />
        Saved
      </div>

      {/* Tools cluster (centered) */}
      <div className="flex-1 flex items-center justify-center gap-0.5">
        <ToolButton active>
          {/* move */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M2 1.5L12 7L7.8 8.4L11 12.4L9.4 13L6.2 9L4 11V1.5z" />
          </svg>
        </ToolButton>
        <ToolButton>
          {/* frame */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M2 4.5h10M2 9.5h10M4.5 2v10M9.5 2v10" />
          </svg>
        </ToolButton>
        <ToolButton>
          {/* shape */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
            <rect x="2.5" y="2.5" width="9" height="9" rx="1" />
          </svg>
        </ToolButton>
        <ToolButton>
          {/* pen */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M2 12l4-1 6-6-3-3-6 6-1 4z" />
          </svg>
        </ToolButton>
        <ToolButton>
          {/* text */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 3h8v1.6H7.9V12H6.1V4.6H3V3z" />
          </svg>
        </ToolButton>
        <ToolButton>
          {/* hand */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M5 6V3.5a1 1 0 112 0V6m0-1.5a1 1 0 112 0V7m0-2a1 1 0 112 0v4.5c0 1.7-1.3 3-3 3H6c-1 0-1.6-.4-2-1l-2-3" />
          </svg>
        </ToolButton>
        <ToolButton>
          <MessageCircle className="w-3.5 h-3.5" />
        </ToolButton>
      </div>

      {/* Right cluster: avatars + share + present */}
      <div className="flex items-center gap-1.5">
        <Avatar bg="#14AE5C" initial="M" />
        <Avatar bg="#F24E1E" initial="A" />
        <Avatar bg="#1ABCFE" initial="K" />
        <button className="ml-1 px-3 h-7 rounded-md text-[12px] font-semibold text-white"
          style={{ background: '#0D99FF' }}>
          Share
        </button>
        <button className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ background: '#1E1E1E' }}>
          <Play className="w-3 h-3 fill-white" />
        </button>
      </div>
    </div>
  );
}

function ToolButton({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      className={`w-8 h-8 rounded flex items-center justify-center ${
        active ? 'bg-[#0D99FF] text-white' : 'text-[#1E1E1E] hover:bg-[#F5F5F5]'
      }`}
    >
      {children}
    </button>
  );
}

function Avatar({ bg, initial }: { bg: string; initial: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white"
      style={{ background: bg }}
    >
      {initial}
    </div>
  );
}

/* ─────────────────────────── Left panel ─────────────────────────── */

function LeftPanel() {
  return (
    <div className="border-r border-[#E5E5E5] bg-white flex flex-col min-h-0 text-[#1E1E1E]">
      {/* Tabs */}
      <div className="h-9 border-b border-[#E5E5E5] flex items-center px-3 gap-4 text-[11px] font-medium shrink-0">
        <button className="text-[#1E1E1E] border-b-[2px] border-[#1E1E1E] -mb-[1px] pb-1">File</button>
        <button className="text-[#777]">Assets</button>
      </div>

      {/* Pages */}
      <PanelSection title="Pages">
        <Row indent={0} icon={<PageIcon />} label="📄  Cover" />
        <Row indent={0} icon={<PageIcon />} label="🛍  Shop" selected />
        <Row indent={0} icon={<PageIcon />} label="🧪  Sandbox" />
      </PanelSection>

      {/* Layers */}
      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Layers" separator>
          <Row indent={0} icon={<FrameIcon />} label="Page · Shop" caretOpen />
          <Row indent={1} icon={<ComponentSetIcon />} label="ProductCard" caretOpen badge="Set" />
          <Row indent={2} icon={<ComponentIcon />} label="ProductCard@2.3" selected caretOpen highlight />
          <Row indent={3} icon={<AutoLayoutIcon />} label="Auto layout · vertical" caretOpen />
          <Row indent={4} icon={<FrameIcon />} label="Image" />
          <Row indent={4} icon={<AutoLayoutIcon />} label="TitleRow" caretOpen />
          <Row indent={5} icon={<TextIcon />} label="Title" />
          <Row indent={5} icon={<TextIcon />} label="Price" />
          <Row indent={4} icon={<TextIcon />} label="Description" />
          <Row indent={4} icon={<InstanceIcon />} label="CTA · Button/Primary" />
          <Row indent={2} icon={<ComponentIcon />} label="ProductCard@2.2" muted />
          <Row indent={2} icon={<ComponentIcon />} label="ProductCard@2.1" muted />
        </PanelSection>
      </div>
    </div>
  );
}

function PanelSection({
  title,
  children,
  separator,
}: {
  title: string;
  children: ReactNode;
  separator?: boolean;
}) {
  return (
    <div className={separator ? 'border-t border-[#E5E5E5]' : ''}>
      <div className="h-7 flex items-center px-3 text-[10.5px] font-semibold text-[#777] uppercase tracking-wider">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  indent,
  icon,
  label,
  selected,
  caretOpen,
  badge,
  muted,
  highlight,
}: {
  indent: number;
  icon: ReactNode;
  label: string;
  selected?: boolean;
  caretOpen?: boolean;
  badge?: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-1 h-7 pr-2 text-[12px] cursor-default ${
        selected
          ? 'bg-[#0D99FF] text-white'
          : highlight
            ? 'bg-[#0D99FF]/10 text-[#1E1E1E]'
            : 'text-[#1E1E1E] hover:bg-[#F5F5F5]'
      } ${muted ? 'opacity-55' : ''}`}
      style={{ paddingLeft: 8 + indent * 12 }}
    >
      {/* Caret column */}
      <span className="w-3 flex items-center justify-center">
        {caretOpen !== undefined ? (
          caretOpen ? (
            <ChevronDown className="w-3 h-3 opacity-70" />
          ) : (
            <ChevronRight className="w-3 h-3 opacity-70" />
          )
        ) : null}
      </span>
      {/* Icon column */}
      <span className="w-4 flex items-center justify-center">{icon}</span>
      <span className="truncate flex-1">{label}</span>
      {badge && (
        <span className={`text-[9.5px] font-mono px-1 py-0.5 rounded ${selected ? 'bg-white/20 text-white' : 'bg-[#F5F5F5] text-[#777]'}`}>
          {badge}
        </span>
      )}
      {/* Hover-only visibility/lock toggles */}
      <span className="hidden group-hover:flex items-center gap-1 opacity-60">
        <Eye className="w-3 h-3" />
        <Unlock className="w-3 h-3" />
      </span>
    </div>
  );
}

function FrameIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 4h8M2 8h8M4 2v8M8 2v8" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}
function AutoLayoutIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
      <rect x="1.5" y="1.5" width="9" height="2.2" rx="0.5" />
      <rect x="1.5" y="4.9" width="9" height="2.2" rx="0.5" />
      <rect x="1.5" y="8.3" width="9" height="2.2" rx="0.5" />
    </svg>
  );
}
function TextIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2 2h8v1.6H6.9V11H5.1V3.6H2V2z" />
    </svg>
  );
}
function PageIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="0.9">
      <path d="M3 1h4l3 3v7H3z" />
    </svg>
  );
}
function ComponentIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="#9747FF">
      <path d="M6 1.5l1.5 1.5L6 4.5 4.5 3 6 1.5zm3 3L10.5 6 9 7.5 7.5 6 9 4.5zm-6 0L4.5 6 3 7.5 1.5 6 3 4.5zm3 3L7.5 9 6 10.5 4.5 9 6 7.5z" />
    </svg>
  );
}
function ComponentSetIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#9747FF" strokeDasharray="1.5 1.2" strokeWidth="0.9">
      <rect x="1.2" y="1.2" width="9.6" height="9.6" rx="1" />
    </svg>
  );
}
function InstanceIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#9747FF" strokeWidth="0.9">
      <path d="M6 1.7L10.3 6 6 10.3 1.7 6 6 1.7z" />
    </svg>
  );
}

/* ─────────────────────────── Canvas ─────────────────────────── */

function Canvas() {
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        background: '#E5E5E5',
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Centered frame with label and selection */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative">
          {/* Frame label */}
          <div className="absolute -top-5 left-0 text-[11px] font-medium" style={{ color: '#0D99FF' }}>
            ProductCard@2.3
          </div>

          {/* Selection border + the canonical card */}
          <div
            className="relative"
            style={{
              outline: '1px solid #0D99FF',
              outlineOffset: '0px',
              boxShadow: '0 0 0 1px #0D99FF',
            }}
          >
            <ProductCardCanonical />

            {/* 4 drift annotation pins on the canvas */}
            <Pin n={1} top={-12} left={-12} note="radius/md" />
            <Pin n={2} top={-12} left={'46%'} note="space/6" />
            <Pin n={3} top={'56%'} left={-12} note="font.title" />
            <Pin n={4} top={'88%'} left={'42%'} note="color/brand/accent" />

            {/* Selection handles */}
            <Handle pos="tl" />
            <Handle pos="tr" />
            <Handle pos="bl" />
            <Handle pos="br" />

            {/* Smart-guide measurement hint */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="block w-px h-12" style={{ background: '#FF3B30' }} />
              <span className="text-[10px] font-mono px-1 py-0.5 rounded text-white" style={{ background: '#FF3B30' }}>
                320
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment rail (bottom) */}
      <div className="border-t border-[#D5D5D5] bg-white px-3 py-2 flex items-center gap-3 shrink-0">
        <div className="w-5 h-5 rounded-full bg-[#FFC700] flex items-center justify-center text-[9px] font-bold text-[#1E1E1E] ring-2 ring-white">
          C
        </div>
        <p className="text-[11.5px] text-[#1E1E1E] truncate">
          <span className="font-semibold">Cursor Agent</span>{' '}
          <span className="text-[#777]">·</span> Pixel mismatch detected · 4 annotations linked to PR #163
        </p>
        <span className="ml-auto text-[10px] text-[#777] font-mono">2m ago</span>
      </div>

      {/* Bottom-left zoom controls */}
      <div className="absolute bottom-12 left-3 flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-md shadow-sm px-1 h-7">
        <button className="w-5 h-5 flex items-center justify-center text-[#1E1E1E] hover:bg-[#F5F5F5] rounded">
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-[11px] text-[#1E1E1E] px-1 tabular-nums">100%</span>
        <button className="w-5 h-5 flex items-center justify-center text-[#1E1E1E] hover:bg-[#F5F5F5] rounded">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function Pin({ n, top, left, note }: { n: number; top: number | string; left: number | string; note: string }) {
  return (
    <div
      className="absolute flex items-center gap-1.5"
      style={{ top, left, transform: 'translate(-2px, -2px)', zIndex: 5 }}
    >
      <span
        className="flex items-center justify-center text-[11px] font-bold text-[#1a0d00]"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: '#F5A623',
          border: '2px solid #fff',
          boxShadow: '0 4px 14px rgba(245,166,35,0.55)',
        }}
      >
        <span style={{ transform: 'rotate(45deg)' }}>{n}</span>
      </span>
      <span
        className="font-mono text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm"
        style={{
          background: '#1E1E1E',
          color: '#F5A623',
          border: '1px solid rgba(245,166,35,0.5)',
        }}
      >
        {note}
      </span>
    </div>
  );
}

function Handle({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positions: Record<typeof pos, React.CSSProperties> = {
    tl: { top: -3, left: -3 },
    tr: { top: -3, right: -3 },
    bl: { bottom: -3, left: -3 },
    br: { bottom: -3, right: -3 },
  };
  return (
    <span
      className="absolute"
      style={{
        ...positions[pos],
        width: 6,
        height: 6,
        background: '#FFFFFF',
        border: '1px solid #0D99FF',
        borderRadius: 1,
      }}
    />
  );
}

/* ─────────────────────────── Right panel (Inspect) ─────────────────────────── */

function RightPanel() {
  return (
    <div className="border-l border-[#E5E5E5] bg-white flex flex-col min-h-0 text-[#1E1E1E]">
      {/* Tabs */}
      <div className="h-9 border-b border-[#E5E5E5] flex items-center px-3 gap-4 text-[11px] font-medium shrink-0">
        <button className="text-[#777]">Design</button>
        <button className="text-[#777]">Prototype</button>
        <button className="text-[#1E1E1E] border-b-[2px] border-[#1E1E1E] -mb-[1px] pb-1 flex items-center gap-1">
          <Code2 className="w-3 h-3" />
          Inspect
        </button>
      </div>

      {/* Selected element */}
      <div className="px-3 py-2 border-b border-[#E5E5E5] bg-[#FAFAFA] shrink-0">
        <p className="text-[10.5px] font-mono text-[#777] uppercase tracking-wider mb-0.5">Selection</p>
        <p className="text-[12.5px] font-medium text-[#1E1E1E] truncate">ProductCard@2.3</p>
        <p className="text-[10.5px] text-[#777] mt-0.5">Component · Used in 14 places</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Position + size */}
        <Section title="Layout">
          <Field label="W" value="320" />
          <Field label="H" value="auto" />
          <Field label="Padding" value="24" tokenName="space/6" />
          <Field label="Gap" value="16" tokenName="space/4" />
          <RowFlex>
            <span className="text-[10px] uppercase tracking-wider text-[#777]">Direction</span>
            <span className="text-[11.5px]">↓ Vertical</span>
          </RowFlex>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <Swatch hex="#111116" tokenName="color/surface" />
          <Field label="Radius" value="16" tokenName="radius/md" />
          <RowFlex>
            <span className="text-[10px] uppercase tracking-wider text-[#777]">Stroke</span>
            <span className="text-[11.5px] text-[#777] font-mono">rgba(255,255,255,0.08)</span>
          </RowFlex>
          <RowFlex>
            <span className="text-[10px] uppercase tracking-wider text-[#777]">Effect</span>
            <span className="text-[11.5px] text-[#777]">Shadow · Y 24 · blur 60</span>
          </RowFlex>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <RowFlex>
            <span className="text-[10px] uppercase tracking-wider text-[#777]">Title</span>
            <span className="text-[11.5px] font-mono">600 · 18 px</span>
          </RowFlex>
          <RowFlex>
            <span className="text-[10px] uppercase tracking-wider text-[#777]">Token</span>
            <TokenChip color="#14AE5C">font.title</TokenChip>
          </RowFlex>
        </Section>

        {/* Variables */}
        <Section title="Variables">
          <VariableRow color="#A259FF" name="color/brand/accent"  hex="#A259FF" />
          <VariableRow color="#14AE5C" name="color/badge/success" hex="#14B892" />
          <VariableRow color="#1E1E1E" name="color/surface"       hex="#111116" />
          <VariableRow color="#14AE5C" name="radius/md"           hex="16 px" />
          <VariableRow color="#14AE5C" name="space/6"             hex="24 px" />
        </Section>

        {/* Code preview */}
        <Section title="Code · CSS">
          <pre className="text-[11px] font-mono leading-relaxed p-2 m-2 rounded bg-[#F5F5F5] text-[#1E1E1E] overflow-x-auto">
{`background: var(--color-surface);
border-radius: var(--radius-md);
padding: var(--space-6);
gap: var(--space-4);
color: var(--color-text-primary);`}
          </pre>
        </Section>

        {/* Export */}
        <Section title="Export" last>
          <RowFlex>
            <span className="text-[10px] uppercase tracking-wider text-[#777]">PNG · 1×</span>
            <button
              className="text-[11px] font-medium px-2 py-0.5 rounded text-white"
              style={{ background: '#0D99FF' }}
            >
              Export
            </button>
          </RowFlex>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={last ? '' : 'border-b border-[#E5E5E5]'}>
      <div className="h-8 flex items-center justify-between px-3 text-[10.5px] font-semibold text-[#777] uppercase tracking-wider">
        <span>{title}</span>
        <MoreHorizontal className="w-3.5 h-3.5 opacity-60" />
      </div>
      <div className="pb-2">{children}</div>
    </div>
  );
}

function Field({ label, value, tokenName }: { label: string; value: string; tokenName?: string }) {
  return (
    <div className="px-3 py-1 flex items-center gap-2 hover:bg-[#FAFAFA]">
      <span className="text-[10px] uppercase tracking-wider text-[#777] w-12">{label}</span>
      <span className="text-[11.5px] font-mono text-[#1E1E1E] flex-1">{value}</span>
      {tokenName && <TokenChip color="#14AE5C">{tokenName}</TokenChip>}
    </div>
  );
}

function RowFlex({ children }: { children: ReactNode }) {
  return <div className="px-3 py-1 flex items-center justify-between gap-2 hover:bg-[#FAFAFA]">{children}</div>;
}

function Swatch({ hex, tokenName }: { hex: string; tokenName: string }) {
  return (
    <div className="px-3 py-1 flex items-center gap-2 hover:bg-[#FAFAFA]">
      <span
        className="w-4 h-4 rounded-sm border border-black/10 shrink-0"
        style={{ background: hex }}
      />
      <span className="text-[11.5px] font-mono text-[#1E1E1E]">{hex}</span>
      <TokenChip color="#14AE5C">{tokenName}</TokenChip>
    </div>
  );
}

function VariableRow({ color, name, hex }: { color: string; name: string; hex: string }) {
  return (
    <div className="px-3 py-1.5 flex items-center gap-2 hover:bg-[#FAFAFA]">
      <span
        className="w-3.5 h-3.5 rounded-sm border border-black/10 shrink-0"
        style={{ background: color }}
      />
      <span className="text-[11.5px] font-mono text-[#1E1E1E] truncate flex-1">{name}</span>
      <span className="text-[10.5px] font-mono text-[#777]">{hex}</span>
    </div>
  );
}

function TokenChip({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
      style={{
        color,
        background: `${color}1a`,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  );
}

/* Suppress unused-import warnings for icons we keep imported for future use */
const __ICON_KEEP__ = { Search, EyeOff, Lock };
void __ICON_KEEP__;
