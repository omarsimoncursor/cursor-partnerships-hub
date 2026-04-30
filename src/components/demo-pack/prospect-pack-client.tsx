'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Cpu, Layers, Presentation, Sparkles, Terminal } from 'lucide-react';
import type { DemoPackPayload } from '@/lib/demo-pack/types';
import { listVendorsByIds } from '@/lib/demo-pack/vendors';
import { ProspectBrandStyles } from '@/components/demo-pack/brand-styles';
import { RoiCalculator } from '@/components/demo-pack/roi-calculator';
import { SdkWorkflowIllustrated, SdkWorkflowBuilder } from '@/components/demo-pack/sdk-workflow-builder';
import { prospectDisplayName } from '@/lib/demo-pack/display-name';
import clsx from 'clsx';
import { encodeDemoPack } from '@/lib/demo-pack/encode';

type Props = {
  initialPayload: DemoPackPayload;
};

export function ProspectPackClient({ initialPayload }: Props) {
  const [payload, setPayload] = useState(initialPayload);

  const name = useMemo(
    () => prospectDisplayName(payload.domain, payload.displayName),
    [payload.domain, payload.displayName]
  );

  const vendors = listVendorsByIds(payload.vendorIds);

  const packToken = useMemo(() => encodeDemoPack(payload), [payload]);

  const liveDemos = vendors.filter(v => v.kind === 'live_demo');
  const other = vendors.filter(v => v.kind !== 'live_demo');

  return (
    <ProspectBrandStyles primaryHex={payload.primaryHex}>
      <div className="min-h-screen">
        <nav className="sticky top-0 z-30 py-4 px-6 bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <Link
              href="/tools/demo-pack"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Cursor Partnerships demo pack
            </Link>
          </div>
        </nav>

        <main className="pb-24">
          <section className="px-6 pt-12 pb-16 border-b border-dark-border bg-gradient-to-b from-[var(--prospect-accent-soft)]/25 to-transparent">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end gap-8 justify-between">
                <div className="space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-2 text-sm text-[var(--prospect-accent,#60a5fa)] font-medium">
                    <Sparkles className="w-4 h-4" />
                    Prepared for {name}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
                    MCP-led workflows paired with Cursor&apos;s agent platform
                  </h1>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    <span className="text-[var(--prospect-accent,#60a5fa)] font-medium">{payload.domain}</span>
                    {' — '}this page ties together Cursor, the partner MCP surface, and illustrative SDK choreography so
                    the team can evaluate automation grounded in tooling already in place.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                  <div className="w-20 h-20 rounded-2xl border-2 border-[var(--prospect-accent-strong)] shadow-[0_0_48px_var(--prospect-accent-soft)] flex items-center justify-center text-3xl font-bold text-text-primary bg-dark-surface/80 backdrop-blur">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-text-tertiary font-mono">Branded overview</span>
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-5xl mx-auto px-6 space-y-20 pt-16">
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-[var(--prospect-accent,#60a5fa)]" />
                <h2 className="text-2xl font-bold text-text-primary">Selected integrations</h2>
              </div>

              {liveDemos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                    Interactive partner demos (click-through)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {liveDemos.map(v => (
                      <Link
                        key={v.id}
                        href={v.demoHref!}
                        className={clsx(
                          'glass-card p-6 border-transparent hover:border-[var(--prospect-accent-soft)] block group'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border border-white/10"
                            style={{ backgroundColor: `${v.color}22`, color: v.color }}
                          >
                            {v.letter}
                          </div>
                          <div className="min-w-0">
                            <span className="text-lg font-semibold text-text-primary group-hover:text-[var(--prospect-accent,#60a5fa)] transition-colors">
                              {v.name}
                            </span>
                            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{v.blurb}</p>
                            <span className="inline-flex mt-3 text-xs font-mono text-[var(--prospect-accent,#60a5fa)]">
                              Open demo →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {other.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                    Narrative pages and automation surfaces
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {other.map(v => {
                      const href = v.narrativeHref;
                      const inner = (
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border border-white/10"
                            style={{ backgroundColor: `${v.color}22`, color: v.color }}
                          >
                            {v.letter}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-semibold text-text-primary">{v.name}</span>
                              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-dark-surface-hover text-text-tertiary">
                                {v.kind.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{v.blurb}</p>
                            {href ? (
                              <span className="inline-flex mt-3 text-xs font-mono text-[var(--prospect-accent,#60a5fa)]">
                                Open narrative →
                              </span>
                            ) : (
                              <span className="inline-flex mt-3 text-xs text-text-tertiary font-mono">
                                Automate via MCP or SDK alongside repository context.
                              </span>
                            )}
                          </div>
                        </div>
                      );
                      if (href) {
                        return (
                          <Link
                            key={v.id}
                            href={href}
                            className="glass-card p-6 block group border-transparent hover:border-[var(--prospect-accent-soft)]"
                          >
                            {inner}
                          </Link>
                        );
                      }
                      return (
                        <div key={v.id} className="glass-card p-6 border-dark-border bg-dark-surface/20">
                          {inner}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-[var(--prospect-accent,#60a5fa)]" />
                  <h2 className="text-2xl font-bold text-text-primary">Customize SDK workflow chain</h2>
                </div>
                <p className="text-sm text-text-tertiary max-w-xl">
                  Reorder agent tools—the view updates live for working sessions or screen share.
                </p>
              </div>
              <SdkWorkflowBuilder
                orderedIds={payload.workflowToolIds}
                onChange={workflowToolIds => setPayload({ ...payload, workflowToolIds })}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-text-tertiary" />
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                    Script-style preview
                  </h3>
                </div>
                <SdkWorkflowIllustrated orderedIds={payload.workflowToolIds} />
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-2">
                <Presentation className="w-6 h-6 text-[var(--prospect-accent,#60a5fa)]" />
                <h2 className="text-2xl font-bold text-text-primary">ROI: intelligent model routing</h2>
              </div>
              <RoiCalculator value={payload.roi} onChange={roi => setPayload({ ...payload, roi })} />
            </section>

            <p className="text-xs text-text-tertiary text-center pb-8 border-t border-dark-border pt-8">
              This page reflects a salesperson-composed preset. Figures are illustrative.{' '}
              <Link
                href={`/tools/demo-pack?t=${encodeURIComponent(packToken)}`}
                className="text-[var(--prospect-accent,#60a5fa)] hover:underline"
              >
                Open builder to edit presets
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </ProspectBrandStyles>
  );
}
