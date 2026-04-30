'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calculator,
  ChevronDown,
  Code2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  clearbitLogoUrl,
  getVendorsFor,
  resolvedAccent,
  type ProspectConfig,
} from '@/lib/prospect/config';
import { VendorDemoCard } from '@/components/prospect/vendor-demo-card';
import { SdkComposer } from '@/components/prospect/sdk-composer';
import { RoiCalculator } from '@/components/prospect/roi-calculator';

type Props = {
  config: ProspectConfig;
};

export function ProspectPage({ config }: Props) {
  const accent = resolvedAccent(config);
  const vendors = getVendorsFor(config);
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    setLogoOk(true);
  }, [config.domain]);

  // Inject the brand accent as a CSS variable so children can pull it
  // through Tailwind arbitrary values when convenient.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--prospect-accent', accent);
    return () => {
      document.documentElement.style.removeProperty('--prospect-accent');
    };
  }, [accent]);

  return (
    <div className="min-h-screen">
      {/* Light brand wash so the page feels owned by the prospect */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(60% 40% at 50% 0%, ${accent}1f 0%, transparent 70%)`,
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/prospect-builder"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Builder
          </Link>
          <span className="text-sm text-text-tertiary font-mono">
            Cursor x {config.account}
          </span>
        </div>
      </nav>

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <header className="grid md:grid-cols-[auto_1fr] gap-6 items-start mb-16">
            <div className="flex items-center gap-4">
              {logoOk && config.domain ? (
                <img
                  src={clearbitLogoUrl(config.domain)}
                  alt={`${config.account} logo`}
                  className="w-16 h-16 rounded-xl bg-white/95 object-contain p-2"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: `${accent}25`, color: accent }}
                >
                  {config.account.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="hidden md:flex w-px h-12 self-center"
                style={{ background: 'rgba(237,236,236,0.12)' }}
              />
              <div className="flex items-center gap-2.5">
                <span
                  className="px-2 py-1 rounded-md text-xs font-mono uppercase tracking-wider"
                  style={{ background: `${accent}1a`, color: accent }}
                >
                  Cursor
                </span>
                <span className="text-text-tertiary">x</span>
                <span className="px-2 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-dark-surface text-text-secondary border border-dark-border">
                  {config.account}
                </span>
              </div>
            </div>
            <div>
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-mono mb-4"
                style={{ background: `${accent}1a`, color: accent }}
              >
                <Sparkles className="w-3 h-3" />
                Prepared for {config.account}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-text-primary leading-tight mb-3">
                What Cursor unlocks across {config.account}&apos;s existing stack.
              </h1>
              <p className="text-base text-text-secondary max-w-2xl mb-2">
                {config.tagline ||
                  `An interactive demo of Cursor's MCP integrations and SDK automations against the tools ${config.account} already uses. Every workflow below is playable; the SDK composer and ROI calculator are scoped to ${config.account} specifically.`}
              </p>
              {config.rep && (
                <p className="text-xs text-text-tertiary font-mono">
                  Prepared by {config.rep} {'\u2022'} Cursor Partnerships
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <a
                  href="#integrations"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                  style={{ background: accent, color: '#0a0a0a' }}
                >
                  Run the demos
                  <ChevronDown className="w-4 h-4" />
                </a>
                <a
                  href="#roi"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors"
                  style={{ borderColor: `${accent}55`, color: accent }}
                >
                  Jump to ROI for {config.account}
                  <Calculator className="w-4 h-4" />
                </a>
              </div>
            </div>
          </header>

          {/* Stack matrix */}
          <section className="mb-16">
            <SectionHeader
              icon={<Layers className="w-4 h-4" />}
              eyebrow="Detected stack"
              title={`Cursor integrates with the tools ${config.account} already runs on.`}
              accent={accent}
            />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {vendors.map(v => (
                <a
                  key={v.id}
                  href={`#vendor-${v.id}`}
                  className="rounded-lg border p-4 hover:scale-[1.01] transition-all"
                  style={{
                    borderColor: `${v.brand}33`,
                    background: `${v.brand}0a`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold overflow-hidden"
                      style={{ background: `${v.brand}25`, color: v.brand }}
                    >
                      {v.logo ? (
                        <img src={v.logo} alt={`${v.name} logo`} className="w-full h-full object-contain p-1.5" />
                      ) : (
                        v.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{v.name}</p>
                      <p className="text-[10px] uppercase tracking-wider font-mono text-text-tertiary">
                        {v.mode === 'mcp' ? 'MCP' : v.mode === 'sdk' ? 'SDK' : 'MCP + SDK'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-snug">{v.category}</p>
                </a>
              ))}
              {vendors.length === 0 && (
                <p className="col-span-full text-sm text-text-secondary">
                  No vendors selected. Pop back into the builder to add their stack.
                </p>
              )}
            </div>
          </section>

          {/* Vendor demos */}
          <section id="integrations" className="mb-20">
            <SectionHeader
              icon={<Sparkles className="w-4 h-4" />}
              eyebrow={`${vendors.length} interactive demos`}
              title={`What Cursor automates for ${config.account}, demo by demo.`}
              description={`Each demo plays the agent steps end to end so the ${config.account} team can see exactly what Cursor does in their environment.`}
              accent={accent}
            />
            <div className="space-y-6">
              {vendors.map((v, i) => (
                <VendorDemoCard key={v.id} vendor={v} account={config.account} pageAccent={accent} index={i} />
              ))}
            </div>
          </section>

          {/* SDK Composer */}
          <section className="mb-20">
            <SectionHeader
              icon={<Code2 className="w-4 h-4" />}
              eyebrow="SDK workflow composer"
              title="String the same tools together into a custom Cursor agent."
              description={`Drop steps from ${config.account}'s stack into the canvas. Cursor's SDK turns the resulting workflow into a runnable agent: scheduled, on-demand, or wired to a webhook.`}
              accent={accent}
            />
            <SdkComposer account={config.account} accent={accent} vendorIds={vendors.map(v => v.id)} />
          </section>

          {/* ROI */}
          <section id="roi" className="mb-20">
            <SectionHeader
              icon={<Calculator className="w-4 h-4" />}
              eyebrow="Token ROI"
              title="Auto router pays for Cursor before productivity gains kick in."
              description={`Most engineering queries don't need a frontier model. Cursor's auto router sends only the queries that need reasoning to Claude Opus and routes the rest to Composer. Move the sliders to see the swing for ${config.account}.`}
              accent={accent}
            />
            <RoiCalculator account={config.account} accent={accent} />
          </section>

          {/* Next steps */}
          <section
            className="rounded-2xl border p-8 md:p-10"
            style={{ borderColor: `${accent}55`, background: `${accent}10` }}
          >
            <p className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: accent }}>
              Suggested next step
            </p>
            <h3 className="text-2xl md:text-3xl font-semibold text-text-primary mb-3">
              Pick one workflow above and pilot it on a {config.account} repo this quarter.
            </h3>
            <p className="text-sm text-text-secondary max-w-2xl mb-5">
              Cursor stands up the integration with the {config.account} team, the agent runs against a sandbox, and
              the team sees end-to-end value before any commitment. The ROI calc above is the floor, not the ceiling.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://cursor.com/contact"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{ background: accent, color: '#0a0a0a' }}
              >
                Set up the pilot
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-dark-border text-text-primary hover:bg-dark-surface transition-colors"
              >
                Browse all Cursor partnership demos
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  accent: string;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-mono mb-3"
        style={{ background: `${accent}1a`, color: accent }}
      >
        {icon}
        {eyebrow}
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary leading-tight mb-2">{title}</h2>
      {description && <p className="text-sm text-text-secondary leading-relaxed">{description}</p>}
    </div>
  );
}
