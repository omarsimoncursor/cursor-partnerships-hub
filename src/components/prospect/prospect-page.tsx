'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ChevronDown,
  Code2,
  ExternalLink,
  Gauge,
  Layers,
  Plug,
  Sparkles,
  Workflow,
} from 'lucide-react';
import {
  getVendorsFor,
  resolvedAccent,
  type ProspectConfig,
} from '@/lib/prospect/config';
import { AccountLogo } from '@/components/prospect/account-logo';
import { AuroraBackdrop } from '@/components/prospect/aurora-backdrop';
import { VendorDemoCard } from '@/components/prospect/vendor-demo-card';
import { RoiCalculator } from '@/components/prospect/roi-calculator';
import { CursorSdkLiveDemo } from '@/components/sdk-demo/cursor-sdk-live-demo';

type Props = {
  config: ProspectConfig;
  // Personalization layer used by /p/[slug]:
  //   - prospectName: rendered in the hero ("Prepared for Jane Smith")
  //   - showRoiCalculator: false suppresses the ROI section for ICs and managers
  //   - sdkWorkflowFocus: optional vendor id the page should lead with
  //   - unmatchedTechnologies: technologies from Sumble that didn't match a
  //     vendor in the catalog; rendered as an "SDK automation" callout.
  prospectName?: string;
  prospectLevelLabel?: string;
  showRoiCalculator?: boolean;
  sdkWorkflowFocus?: string | null;
  unmatchedTechnologies?: string[];
};

export function ProspectPage({
  config,
  prospectName,
  prospectLevelLabel,
  showRoiCalculator = true,
  unmatchedTechnologies = [],
}: Props) {
  const accent = resolvedAccent(config);
  const vendors = getVendorsFor(config);

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
    <div className="min-h-screen relative">
      <AuroraBackdrop accent={accent} />

      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="https://cursor.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <AccountLogo domain="cursor.com" account="Cursor" accent="#edecec" size={20} />
            Cursor
          </Link>
          <span className="text-sm text-text-tertiary font-mono">
            Cursor x {config.account}
          </span>
        </div>
      </nav>

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <header className="mb-14">
            <div className="flex items-center gap-4 mb-8">
              <AccountLogo domain={config.domain} account={config.account} accent={accent} size={84} />
              <span className="text-text-tertiary text-3xl font-thin">{'\u00d7'}</span>
              <AccountLogo domain="cursor.com" account="Cursor" accent="#edecec" size={84} />
            </div>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-mono mb-5 border"
              style={{
                background: `${accent}14`,
                color: accent,
                borderColor: `${accent}33`,
              }}
            >
              <Sparkles className="w-3 h-3" />
              {prospectName
                ? `Prepared for ${prospectName} \u00b7 ${config.account}${prospectLevelLabel ? ` \u00b7 ${prospectLevelLabel}` : ''}`
                : `Prepared for ${config.account}`}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight max-w-4xl">
              <span className="text-text-primary">What Cursor unlocks across </span>
              <span
                style={{
                  backgroundImage: `linear-gradient(120deg, ${accent} 0%, ${accent}c0 60%, ${accent}80 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {config.account}&apos;s
              </span>
              <span className="text-text-primary"> existing stack.</span>
            </h1>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mt-5">
              {config.tagline ||
                `An interactive demo of Cursor's MCP integrations and SDK automations against the tools ${config.account} already uses. Every workflow below is playable, plus a live Cursor SDK demo and an ROI calculator scoped to ${config.account}.`}
            </p>
            {config.rep && (
              <p className="text-xs text-text-tertiary font-mono mt-2">
                Prepared by {config.rep} {'\u2022'} Cursor Partnerships
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <a
                href="#integrations"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ background: accent, color: '#0a0a0a', boxShadow: `0 0 32px ${accent}55` }}
              >
                Run the demos
                <ChevronDown className="w-4 h-4" />
              </a>
              <a
                href="#composer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium border transition-colors hover:bg-dark-surface"
                style={{ borderColor: `${accent}55`, color: accent }}
              >
                Try the SDK demo
                <Code2 className="w-4 h-4" />
              </a>
              {showRoiCalculator && (
                <a
                  href="#roi"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium border border-dark-border text-text-secondary transition-colors hover:bg-dark-surface hover:text-text-primary"
                >
                  ROI for {config.account}
                  <Calculator className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Headline metric band */}
            <div className="mt-10 grid sm:grid-cols-3 gap-3">
              <HeroStat
                icon={<Plug className="w-3.5 h-3.5" />}
                label="Integrations live"
                value={String(vendors.length)}
                hint={`MCP + SDK against ${config.account}'s stack`}
                accent={accent}
              />
              <HeroStat
                icon={<Workflow className="w-3.5 h-3.5" />}
                label="Workflows playable"
                value={String(vendors.length + 5)}
                hint="Per-vendor demos + live SDK demo"
                accent={accent}
              />
              <HeroStat
                icon={<Gauge className="w-3.5 h-3.5" />}
                label="Token cost ceiling"
                value="−84%"
                hint="Auto router vs. all-frontier (default sliders)"
                accent={accent}
              />
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

          {/* Cursor SDK live demo — the same multi-phase interactive demo
              we ship on /partnerships/cursor-sdk/demo. Lets the prospect
              build a real Cursor agent workflow end to end and see the
              five artifacts the agent produces. */}
          <section id="composer" className="mb-20">
            <SectionHeader
              icon={<Code2 className="w-4 h-4" />}
              eyebrow="Cursor SDK live demo"
              title="Build a real Cursor agent, live."
              description={`Pick a tool, an alert, and what you want the agent to do. The TypeScript on the right updates as you click — that's actual code being built in real time. Press Run to watch the agent execute the workflow and produce five inspectable artifacts (Jira ticket, GitHub PR, Slack thread, audit timeline, SDK call trace).`}
              accent={accent}
            />
            <CursorSdkLiveDemo hero={false} />
          </section>

          {/* ROI - shown for leadership / executive levels only */}
          {showRoiCalculator && (
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
          )}

          {/* Unmatched technologies — flagged as SDK automation candidates so
              the rep has something concrete to discuss for tools that aren't
              in our MCP catalog yet. */}
          {unmatchedTechnologies.length > 0 && (
            <section className="mb-20">
              <SectionHeader
                icon={<Workflow className="w-4 h-4" />}
                eyebrow="SDK automations"
                title={`${config.account}'s other tools, automated via the Cursor SDK.`}
                description={`These technologies ${config.account} runs aren't in the Cursor MCP marketplace yet, but each one is automatable via the Cursor SDK with a thin agent harness. Cursor stands up the integration during the pilot.`}
                accent={accent}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unmatchedTechnologies.map((t) => (
                  <div
                    key={t}
                    className="rounded-lg border p-4 bg-dark-surface"
                    style={{ borderColor: `${accent}33` }}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-mono text-text-tertiary mb-1">SDK automation</p>
                    <p className="text-sm font-semibold text-text-primary">{t}</p>
                    <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                      Wire {t} into a Cursor cloud agent via its REST/SDK and ship the same end-to-end automation pattern as the cards above.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

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

function HeroStat({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 transition-colors hover:bg-dark-surface-hover bg-dark-surface"
      style={{ borderColor: `${accent}33` }}
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono mb-1.5" style={{ color: accent }}>
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold text-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-text-secondary mt-1 leading-snug">{hint}</p>
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
