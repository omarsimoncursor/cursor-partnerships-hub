'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Layers, Palette, Type, Grid3X3, Maximize2 } from 'lucide-react';
import { FlowPipe } from '@/components/shared/flow-pipe';

const DESIGN_TOKENS = [
  { name: 'Primary', value: '#A259FF', type: 'color', preview: 'bg' },
  { name: 'Secondary', value: '#6C3CE0', type: 'color', preview: 'bg' },
  { name: 'Surface', value: '#1E1E2E', type: 'color', preview: 'bg' },
  { name: 'Success', value: '#4ADE80', type: 'color', preview: 'bg' },
];

const TYPOGRAPHY = [
  { name: 'Heading', font: 'Inter', weight: '700', size: '24px' },
  { name: 'Body', font: 'Inter', weight: '400', size: '14px' },
  { name: 'Caption', font: 'Inter', weight: '500', size: '11px' },
];

const SPACING = [
  { name: 'Card Padding', value: '24px' },
  { name: 'Corner Radius', value: '16px' },
  { name: 'Grid Gap', value: '16px' },
  { name: 'Badge Radius', value: '999px' },
];

export function McpBridgeScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-figma-canvas]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        opacity: 0, x: -30, duration: 0.8, ease: 'power3.out',
      });
      gsap.from('[data-mcp-bridge]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0, scale: 0, duration: 0.5, delay: 0.6, ease: 'back.out(2)',
      });
      gsap.from('[data-token-panel]', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        opacity: 0, x: 30, duration: 0.8, delay: 0.8, ease: 'power3.out',
      });
      gsap.from('[data-token-item]', {
        scrollTrigger: { trigger: '[data-token-panel]', start: 'top 80%' },
        opacity: 0, y: 8, stagger: 0.06, duration: 0.4, delay: 1.2, ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 2</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Figma MCP Connects Designs to Cursor</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          The Figma MCP makes every design asset machine-readable. Colors, typography, spacing, component structure &mdash; all extracted directly from the Figma file. No screenshots in Jira. No guessing.
        </p>

        {/* Figma canvas -> MCP -> Extracted tokens */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 mb-12">
          {/* Figma canvas mockup */}
          <div data-figma-canvas className="flex-1 rounded-xl border border-[#A259FF]/30 bg-[#A259FF]/5 overflow-hidden">
            <div className="px-4 py-2 border-b border-[#A259FF]/20 bg-[#A259FF]/10 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#A259FF]" />
              <span className="text-xs text-[#A259FF] font-semibold">Figma &mdash; Checkout Redesign</span>
            </div>
            <div className="p-5">
              {/* Mini artboard with rendered components */}
              <div className="bg-dark-bg rounded-xl p-4 border border-dark-border space-y-3">
                {/* Card preview */}
                <div className="rounded-2xl bg-dark-surface p-4 border border-dark-border relative" style={{ boxShadow: '0 4px 20px rgba(162, 89, 255, 0.1)' }}>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}>-20%</div>
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A259FF]/20 to-[#6C3CE0]/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-2.5 bg-text-primary/20 rounded w-3/4 mb-1.5" />
                      <div className="h-2 bg-text-tertiary/10 rounded w-1/2 mb-2" />
                      <div className="h-2 bg-[#A259FF]/20 rounded w-1/3" />
                    </div>
                  </div>
                </div>
                {/* Button row */}
                <div className="flex gap-2">
                  <div className="flex-1 h-9 rounded-xl flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: 'linear-gradient(135deg, #A259FF, #6C3CE0)' }}>Add to Cart</div>
                  <div className="flex-1 h-9 rounded-xl border border-[#A259FF]/30 flex items-center justify-center text-[10px] text-[#A259FF] font-semibold">Save</div>
                </div>
                {/* Color strip */}
                <div className="flex gap-1.5 pt-2">
                  {DESIGN_TOKENS.map((t, i) => (
                    <div key={i} className="w-6 h-6 rounded-lg border border-white/10" style={{ backgroundColor: t.value }} title={t.name} />
                  ))}
                  <div className="ml-auto flex items-center gap-1 text-[9px] text-text-tertiary">
                    <Grid3X3 className="w-3 h-3" /> 8px grid
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MCP Bridge - animated flow pipe */}
          <div data-mcp-bridge className="hidden md:flex items-center justify-center w-32 shrink-0">
            <FlowPipe
              width={120}
              height={60}
              color="#A259FF"
              label="Figma MCP"
              packetCount={4}
              duration={2.2}
            />
          </div>
          <div className="flex md:hidden items-center justify-center w-full shrink-0">
            <FlowPipe
              width={100}
              height={40}
              color="#A259FF"
              vertical
              direction="down"
              packetCount={3}
              duration={2.2}
            />
          </div>

          {/* Extracted design tokens */}
          <div data-token-panel className="flex-1 rounded-xl border border-accent-blue/30 bg-accent-blue/5 overflow-hidden">
            <div className="px-4 py-2 border-b border-accent-blue/20 bg-accent-blue/10 flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent-blue" />
              <span className="text-xs text-accent-blue font-semibold">Design Tokens Extracted</span>
              <span className="ml-auto text-[10px] text-accent-green px-2 py-0.5 rounded-full bg-accent-green/10">Synced</span>
            </div>
            <div className="p-4 space-y-4">
              {/* Colors */}
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette className="w-3 h-3" /> Colors
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_TOKENS.map((token, i) => (
                    <div key={i} data-token-item className="flex items-center gap-2 bg-dark-bg rounded-lg px-2.5 py-1.5">
                      <div className="w-5 h-5 rounded-md border border-white/10 shrink-0" style={{ backgroundColor: token.value }} />
                      <div>
                        <p className="text-[10px] text-text-primary">{token.name}</p>
                        <p className="text-[9px] text-text-tertiary">{token.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Typography */}
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> Typography
                </p>
                <div className="space-y-1.5">
                  {TYPOGRAPHY.map((t, i) => (
                    <div key={i} data-token-item className="flex items-center justify-between bg-dark-bg rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-text-primary">{t.name}</span>
                      <span className="text-[9px] text-text-tertiary">{t.font} {t.weight} / {t.size}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Spacing */}
              <div>
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3" /> Spacing
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPACING.map((s, i) => (
                    <div key={i} data-token-item className="flex items-center justify-between bg-dark-bg rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-text-primary">{s.name}</span>
                      <span className="text-[10px] text-accent-blue font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
