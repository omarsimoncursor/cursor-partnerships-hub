'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckSquare, ClipboardCopy, Layers, Sparkles } from 'lucide-react';
import { DEMO_VENDORS } from '@/lib/demo-pack/vendors';
import { SdkWorkflowBuilder } from '@/components/demo-pack/sdk-workflow-builder';
import { RoiCalculator } from '@/components/demo-pack/roi-calculator';
import { ProspectBrandStyles } from '@/components/demo-pack/brand-styles';
import { decodeDemoPack, defaultDemoPackPayload, encodeDemoPack } from '@/lib/demo-pack/encode';
import type { DemoPackPayload } from '@/lib/demo-pack/types';
import clsx from 'clsx';

export function DemoPackBuilderContent() {
  const search = useSearchParams();
  const [payload, setPayload] = useState<DemoPackPayload>(() => defaultDemoPackPayload());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = search.get('t');
    if (!t) return;
    const decoded = decodeDemoPack(t);
    if (decoded) setPayload(decoded);
  }, [search]);

  const token = useMemo(() => encodeDemoPack(payload), [payload]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/p/${token}`;
  }, [token]);

  const previewHex = payload.primaryHex || '#60a5fa';

  const toggleVendor = useCallback((id: string) => {
    setPayload(p => ({
      ...p,
      vendorIds: p.vendorIds.includes(id) ? p.vendorIds.filter(x => x !== id) : [...p.vendorIds, id],
    }));
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  const editProspectHref = `/tools/demo-pack?t=${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Partnerships Hub
          </Link>
          <span className="text-xs md:text-sm text-text-tertiary font-mono truncate">Demo Pack Builder</span>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto space-y-12">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[var(--prospect-accent,#60a5fa)] text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Internal prospecting
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            Compose a branded demo pack
          </h1>
          <p className="text-text-secondary max-w-3xl leading-relaxed">
            Enter an account domain, select vendors they run (live demos where the repo has them, narrative or SDK-only
            otherwise), optionally tune SDK workflow steps and ROI inputs, then share a single link built for that
            account. Append{' '}
            <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-dark-surface border border-dark-border">
              ?t=&lt;token&gt;
            </code>{' '}
            (from <code className="text-xs font-mono">/p/&hellip;</code>) to load an existing preset in the builder.
          </p>
        </header>

        <section className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-blue" />
            Account & brand
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Domain</label>
              <input
                value={payload.domain}
                onChange={e => setPayload({ ...payload, domain: e.target.value })}
                placeholder="cigna.com"
                className="mt-1.5 w-full rounded-lg bg-dark-surface border border-dark-border px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                Display name <span className="normal-case opacity-70">(optional)</span>
              </label>
              <input
                value={payload.displayName ?? ''}
                onChange={e => setPayload({ ...payload, displayName: e.target.value || undefined })}
                placeholder="Auto from domain if empty"
                className="mt-1.5 w-full rounded-lg bg-dark-surface border border-dark-border px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue/40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                Primary brand color <span className="normal-case opacity-70">(hex, optional)</span>
              </label>
              <div className="mt-1.5 flex gap-3 items-center">
                <input
                  value={payload.primaryHex ?? ''}
                  onChange={e =>
                    setPayload({
                      ...payload,
                      primaryHex: e.target.value ? e.target.value : undefined,
                    })
                  }
                  placeholder="#0066B2"
                  className="flex-1 rounded-lg bg-dark-surface border border-dark-border px-3 py-2.5 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-blue/40"
                />
                <span
                  className="w-11 h-11 rounded-xl border border-dark-border shrink-0"
                  style={{ backgroundColor: previewHex }}
                  title="Preview swatch"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-accent-green" />
            Vendors in this demo pack
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Checked items surface on the prospect page with deep links into live demos when available (Datadog,
            Databricks, Sentry, Figma, Snowflake, AWS); narrative-only partners link to partnership pages;
            SDK-only rows describe automation without a canned interactive demo here.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {DEMO_VENDORS.map(v => (
              <label
                key={v.id}
                className={clsx(
                  'flex gap-3 items-start rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                  payload.vendorIds.includes(v.id)
                    ? 'border-accent-blue/35 bg-accent-blue/[0.07]'
                    : 'border-dark-border hover:border-dark-border-hover bg-dark-surface/30'
                )}
              >
                <input
                  type="checkbox"
                  checked={payload.vendorIds.includes(v.id)}
                  onChange={() => toggleVendor(v.id)}
                  className="mt-1 rounded border-dark-border"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-text-primary">{v.name}</span>
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-dark-surface-hover text-text-tertiary">
                      {v.kind.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1 leading-snug">{v.blurb}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-text-primary">SDK workflow composer</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Stacks agent primitives with MCP integrations to visualize how Cursor can automate across vendor tools—use
            it as slide-ready narrative for stakeholder meetings.
          </p>
          <ProspectBrandStyles primaryHex={payload.primaryHex}>
            <SdkWorkflowBuilder
              orderedIds={payload.workflowToolIds}
              onChange={workflowToolIds => setPayload({ ...payload, workflowToolIds })}
            />
          </ProspectBrandStyles>
        </section>

        <section className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-text-primary">ROI: auto-router vs all-frontier</h2>
          <ProspectBrandStyles primaryHex={payload.primaryHex}>
            <RoiCalculator value={payload.roi} onChange={roi => setPayload({ ...payload, roi })} />
          </ProspectBrandStyles>
        </section>

        <section className="glass-card p-6 md:p-8 space-y-4 border-accent-blue/20">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardCopy className="w-5 h-5 text-accent-amber" />
            Share link
          </h2>
          <p className="text-sm text-text-secondary">
            The payload travels in the URL (base64). Treat shared links like internal drafts; regenerate if inputs
            change materially.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <code className="flex-1 text-xs md:text-sm font-mono bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 truncate text-text-secondary">
              {shareUrl || 'Generating…'}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex justify-center items-center gap-2 rounded-lg bg-accent-blue text-dark-bg px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
              disabled={!shareUrl}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <Link
              href={`/p/${token}`}
              className="shrink-0 inline-flex justify-center items-center rounded-lg border border-dark-border-hover px-4 py-2.5 text-sm font-medium hover:bg-dark-surface-hover transition-colors text-text-primary text-center"
            >
              Open preview
            </Link>
            <Link
              href={editProspectHref}
              className="shrink-0 inline-flex justify-center items-center rounded-lg border border-dark-border-hover px-4 py-2.5 text-sm font-medium hover:bg-dark-surface-hover transition-colors text-text-primary text-center"
              title="Bookmark this URL from a prospect pack to reopen the preset in the builder"
            >
              Builder deep link
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
