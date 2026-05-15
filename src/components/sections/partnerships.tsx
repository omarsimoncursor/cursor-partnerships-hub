'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { SectionHeading } from '@/components/ui/section-heading';
import { PartnerCard } from '@/components/ui/partner-card';
import { PARTNER_CATEGORIES } from '@/lib/constants';
import { ArrowRight, Cloud, Wrench, Building2, Users, Handshake, Zap } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cloud: Cloud,
  devtools: Wrench,
  consulting: Building2,
};

export function Partnerships() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 3-way benefit cards
      gsap.fromTo('[data-benefit-card]',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '[data-benefit-cards]',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power3.out',
        }
      );

      // Partner cards
      gsap.fromTo('[data-partner-card]',
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '[data-partner-grid]',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.5,
          ease: 'power3.out',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const categories = Object.entries(PARTNER_CATEGORIES);

  return (
    <section ref={sectionRef} id="partnerships" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          badge="The Agentic Partnership Thesis"
          title="Cursor. Partner. Customer. Everyone Wins."
        />

        {/* 3-Way Benefit Visual */}
        <div data-benefit-cards className="grid md:grid-cols-3 gap-6 mb-20">
          <div data-benefit-card className="glass-card p-8 border-accent-green/20">
            <div className="w-14 h-14 rounded-2xl bg-accent-green/10 flex items-center justify-center mb-5">
              <Users className="w-7 h-7 text-accent-green" />
            </div>
            <h3 className="text-lg font-bold text-accent-green mb-2">The Customer Wins</h3>
            <p className="text-base text-text-secondary leading-relaxed">
              Large enterprises spend millions every month across their software stack. Cursor unlocks automations from a customer&apos;s existing technology stack, dramatically increasing their ROI and improving tool efficacy.
            </p>
          </div>
          <div data-benefit-card className="glass-card p-8 border-accent-blue/20">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-5">
              <Handshake className="w-7 h-7 text-accent-blue" />
            </div>
            <h3 className="text-lg font-bold text-accent-blue mb-2">The Partner Wins</h3>
            <p className="text-base text-text-secondary leading-relaxed">
              Cursor adds legitimate automation to partner technologies. This improves the efficacy of their tool without increasing the cost to the customer, making them stickier and harder to displace.
            </p>
          </div>
          <div data-benefit-card className="glass-card p-8 border-accent-amber/20">
            <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 flex items-center justify-center mb-5">
              <Zap className="w-7 h-7 text-accent-amber" />
            </div>
            <h3 className="text-lg font-bold text-accent-amber mb-2">Cursor Wins</h3>
            <p className="text-base text-text-secondary leading-relaxed">
              Co-selling with trusted vendors gives Cursor an immediate foot in the door at large enterprises. Instead of cold outreach, we walk in alongside the tools their engineering teams already depend on and deliver real automation.
            </p>
          </div>
        </div>

        {/* Partnership Demo Showcase */}
        <div data-demo-showcase className="mb-20">
          <h3 className="text-2xl font-bold text-text-primary mb-3">
            Show Agentic Workflows in Action
          </h3>
          <p className="text-text-secondary mb-8 max-w-3xl">
            These interactive workflow demos show customers and partners exactly what Cursor can unlock — illustrating how Cursor transforms each partner&apos;s capabilities through automation.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                href: '/partnerships/cursor-sdk',
                partner: 'Cursor SDK',
                title: 'Build a Security Automation, Live',
                description: 'Pick a tool and a response sequence. The SDK code updates as you click. Hit Run and watch the agent execute across 6+ MCPs.',
                color: '#60A5FA',
                letter: '⌘',
              },
              {
                href: '/partnerships/datadog',
                partner: 'Datadog',
                title: 'From Incident to Automated Fix',
                description: 'Datadog detects a production anomaly. Cursor\'s agent analyzes the codebase and generates the fix automatically.',
                color: '#632CA6',
                letter: 'D',
              },
              {
                href: '/partnerships/databricks',
                partner: 'Databricks',
                title: 'From Legacy Oracle to Live Databricks',
                description: 'Cursor migrates Oracle PL/SQL + Informatica to Databricks DLT + Unity Catalog — compressing 5-year GSI migrations to 18 months.',
                color: '#FF3621',
                letter: 'D',
              },
              {
                href: '/partnerships/sentry',
                partner: 'Sentry',
                title: 'From Error to Automated Patch',
                description: 'Sentry captures an error. Cursor\'s agent traces root cause across the codebase and produces a targeted patch.',
                color: '#362D59',
                letter: 'S',
              },
              {
                href: '/partnerships/snyk',
                partner: 'Snyk',
                title: 'From Snyk Critical to Verified PR',
                description: 'Snyk finds the vulnerability. Cursor parameterizes the call site, bumps the dependency, replays the exploit, and opens a tested PR.',
                color: '#4C44CB',
                letter: 'S',
              },
              {
                href: '/partnerships/github',
                partner: 'GitHub',
                title: 'From PR Review to Agentic Refactor',
                description: 'GitHub surfaces review feedback. Cursor\'s agent executes multi-file refactors and generates tests automatically.',
                color: '#238636',
                letter: 'G',
              },
              {
                href: '/partnerships/aws',
                partner: 'AWS',
                title: 'From Monolith to Automated Decomposition',
                description: 'Cursor\'s agent analyzes monolith architecture, decomposes services, and generates AWS infrastructure code.',
                color: '#FF9900',
                letter: 'A',
              },
              {
                href: '/partnerships/snowflake',
                partner: 'Snowflake',
                title: 'From Teradata BTEQ to Snowflake-native dbt',
                description: 'A GSI quotes 4 years and $18M to migrate. Cursor modernizes one BTEQ + one T-SQL proc into a Cortex-verified dbt DAG in ~2 minutes.',
                color: '#29B5E8',
                letter: '\u2744',
              },
              {
                href: '/partnerships/gitlab',
                partner: 'GitLab',
                title: 'From CI Failure to Automated Redeploy',
                description: 'A GitLab pipeline fails. Cursor\'s agent reads logs, fixes the code, and redeploys automatically.',
                color: '#FC6D26',
                letter: 'L',
              },
              {
                href: '/partnerships/figma',
                partner: 'Figma',
                title: 'From Design to Production Code',
                description: 'Figma designs are read directly by Cursor via MCP. Designers iterate with the agent. The game of telephone between PM, design, and engineering is eliminated.',
                color: '#A259FF',
                letter: 'F',
              },
            ].map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                data-demo-card
                className="example-cta-pulse group block rounded-xl border-2 p-5 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  borderColor: `${demo.color}40`,
                  backgroundColor: `${demo.color}0a`,
                  ['--pulse-color' as string]: `${demo.color}25`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${demo.color}20`, color: demo.color }}
                  >
                    {demo.letter}
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wider" style={{ color: demo.color }}>
                      {demo.partner} + Cursor Agent
                    </p>
                  </div>
                </div>
                <h4 className="text-base font-bold text-text-primary mb-1.5">{demo.title}</h4>
                <p className="text-sm text-text-primary/60 leading-relaxed mb-3">{demo.description}</p>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all duration-300"
                  style={{ color: demo.color }}
                >
                  View agentic workflow <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Partner grid by category */}
        <div data-partner-grid className="space-y-10 mb-20">
          <h3 className="text-2xl font-bold text-text-primary mb-2">Target Partners</h3>
          <p className="text-text-secondary mb-6">
            Each partner represents a specific agentic workflow that Cursor automates. Hover over any partner to see the co-sell rationale.
          </p>
          {categories.map(([key, category]) => {
            const Icon = CATEGORY_ICONS[key] || Cloud;
            return (
              <div key={key}>
                <div className="flex items-center gap-3 mb-5">
                  <Icon className="w-5 h-5 text-text-tertiary" />
                  <h3 className="text-lg font-semibold text-text-primary">{category.title}</h3>
                  <span className="text-sm text-text-tertiary font-mono">
                    {category.partners.length} partners
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.partners.map((partner, i) => (
                    <div key={i} data-partner-card>
                      <PartnerCard
                        name={partner.name}
                        webinar={'webinar' in partner ? partner.webinar : undefined}
                        motion={'motion' in partner ? partner.motion : undefined}
                        rationale={partner.rationale}
                        logo={partner.logo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-divider" />
      </div>
    </section>
  );
}
