'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Footer } from '@/components/layout/footer';
import { PartnerTile } from '@/components/ui/partner-tile';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

// The site is served as a partnerships hub. The homepage ("/") is an
// intentionally spare, visual launchpad: a title, a subhead, and a grid
// of partner tiles — each a door into a fully-built co-sell demo. Every
// other route (technical-buyers, non-technical-buyers, prospects/*,
// roi/*, and the /partnerships page) still renders for direct links.
const PARTNER_TILES = [
  {
    href: '/partnerships/datadog',
    partner: 'Datadog',
    title: 'From Incident to Automated Fix',
    description:
      "Datadog detects a production anomaly. Cursor's agent analyzes the codebase, pinpoints the regression, and ships the fix.",
    color: '#A98CE0',
    logo: '/logos/datadog.svg',
  },
  {
    href: '/partnerships/databricks',
    partner: 'Databricks',
    title: 'From Legacy Oracle to Live Databricks',
    description:
      'Cursor migrates Oracle PL/SQL and Informatica to Databricks DLT + Unity Catalog — compressing five-year GSI migrations to 18 months.',
    color: '#FF5733',
    logo: '/logos/Databricks_Logo.png',
  },
  {
    href: '/partnerships/sentry',
    partner: 'Sentry',
    title: 'From Error to Automated Patch',
    description:
      "Sentry captures an exception in production. Cursor's agent traces root cause across the codebase and produces a targeted patch.",
    color: '#B794F6',
    logo: '/logos/sentry.svg',
  },
  {
    href: '/partnerships/github',
    partner: 'GitHub',
    title: 'From PR Review to Agentic Refactor',
    description:
      "GitHub surfaces review feedback. Cursor's agent executes multi-file refactors, regenerates tests, and ships the PR.",
    color: '#4AC26B',
    logo: '/logos/github_wordmark_light.svg',
  },
  {
    href: '/partnerships/aws',
    partner: 'AWS',
    title: 'From Monolith to Automated Decomposition',
    description:
      "Cursor's agent analyzes monolith architecture, decomposes services, and generates production-ready AWS infrastructure code.",
    color: '#FF9900',
    logo: '/logos/aws_light.svg',
  },
  {
    href: '/partnerships/snowflake',
    partner: 'Snowflake',
    title: 'From Teradata BTEQ to Snowflake-Native dbt',
    description:
      'A GSI quotes four years and $18M. Cursor modernizes one BTEQ and one T-SQL proc into a Cortex-verified dbt DAG in ~2 minutes.',
    color: '#29B5E8',
    logo: '/logos/Snowflake_Logo.svg',
  },
  {
    href: '/partnerships/gitlab',
    partner: 'GitLab',
    title: 'From CI Failure to Automated Redeploy',
    description:
      "A GitLab pipeline fails. Cursor's agent reads the logs, fixes the code, regenerates the pipeline, and redeploys.",
    color: '#FC6D26',
    logo: '/logos/gitlab.svg',
  },
  {
    href: '/partnerships/figma',
    partner: 'Figma',
    title: 'From Design to Production Code',
    description:
      'Cursor reads Figma designs directly via MCP. Designers iterate with the agent. The telephone game between PM, design, and engineering is eliminated.',
    color: '#A259FF',
    logo: '/logos/figma.png',
  },
];

export default function Home() {
  useSmoothScroll();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-eyebrow]',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        '[data-hero-title] > span',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.2,
        }
      );
      gsap.fromTo(
        '[data-hero-sub]',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.55 }
      );
      gsap.fromTo(
        '[data-partner-tile]',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.06,
          delay: 0.7,
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute -top-1/3 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(169, 140, 224, 0.45), rgba(96, 165, 250, 0.15) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full opacity-[0.12] blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 153, 0, 0.4), transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-[0.10] blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(74, 194, 107, 0.4), transparent 70%)',
          }}
        />
      </div>

      <main>
        {/* Hero */}
        <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-24">
          <div className="mx-auto max-w-6xl text-center">
            <div
              data-hero-eyebrow
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-dark-border bg-cta-bg px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              Cursor Partnerships
            </div>

            <h1
              data-hero-title
              className="hero-gradient-text mx-auto max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              <span className="block">Cursor turns the tools</span>
              <span className="block">enterprises already use</span>
              <span className="block">into agentic workflows.</span>
            </h1>

            <p
              data-hero-sub
              className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl"
            >
              A rare three-way value exchange: customers compound ROI on
              existing tools, partners get stickier, Cursor walks in the front
              door at every enterprise. Pick a partner to see the co-sell
              motion in action.
            </p>
          </div>
        </section>

        {/* Partner tiles */}
        <section className="px-6 pb-32">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNER_TILES.map((tile) => (
                <PartnerTile key={tile.href} {...tile} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
