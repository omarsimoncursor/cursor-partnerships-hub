'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const WORKFLOWS = [
  {
    href: '/partnerships/cursor-sdk',
    partner: 'Cursor SDK',
    title: 'Build a security automation, live',
    description:
      'Pick a tool and a response sequence. The SDK code updates as you click. Hit Run and watch the agent execute across 6+ MCPs.',
    color: '#60A5FA',
    letter: '\u2318',
  },
  {
    href: '/partnerships/datadog',
    partner: 'Datadog',
    title: 'From incident to automated fix',
    description:
      "Datadog detects a production anomaly. Cursor's agent analyzes the codebase and ships the fix automatically.",
    color: '#632CA6',
    letter: 'D',
  },
  {
    href: '/partnerships/databricks',
    partner: 'Databricks',
    title: 'Legacy Oracle to live Databricks',
    description:
      'Cursor migrates Oracle PL/SQL + Informatica to Databricks DLT + Unity Catalog — compressing multi-year migrations to months.',
    color: '#FF3621',
    letter: 'D',
  },
  {
    href: '/partnerships/sentry',
    partner: 'Sentry',
    title: 'From error to automated patch',
    description:
      "Sentry captures an error. Cursor's agent traces the root cause across the codebase and produces a targeted patch.",
    color: '#362D59',
    letter: 'S',
  },
  {
    href: '/partnerships/github',
    partner: 'GitHub',
    title: 'From PR review to agentic refactor',
    description:
      "GitHub surfaces review feedback. Cursor's agent executes multi-file refactors and generates tests automatically.",
    color: '#238636',
    letter: 'G',
  },
  {
    href: '/partnerships/aws',
    partner: 'AWS',
    title: 'Monolith to automated decomposition',
    description:
      "Cursor's agent analyzes monolith architecture, decomposes services, and generates AWS infrastructure code.",
    color: '#FF9900',
    letter: 'A',
  },
  {
    href: '/partnerships/snowflake',
    partner: 'Snowflake',
    title: 'Teradata BTEQ to Snowflake-native dbt',
    description:
      'Cursor modernizes BTEQ + T-SQL procedures into a Cortex-verified dbt DAG in minutes, not years.',
    color: '#29B5E8',
    letter: '\u2744',
  },
  {
    href: '/partnerships/gitlab',
    partner: 'GitLab',
    title: 'CI failure to automated redeploy',
    description:
      "A GitLab pipeline fails. Cursor's agent reads the logs, fixes the code, and redeploys automatically.",
    color: '#FC6D26',
    letter: 'L',
  },
  {
    href: '/partnerships/figma',
    partner: 'Figma',
    title: 'From design to production code',
    description:
      'Figma designs are read directly by Cursor via MCP. Designers iterate with the agent — no telephone game between PM, design, and engineering.',
    color: '#A259FF',
    letter: 'F',
  },
];

export function DemoWorkflows() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-demo-card]',
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '[data-demo-grid]',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.5,
          ease: 'power3.out',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="workflows" className="pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div data-demo-grid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOWS.map((demo) => (
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
                <p
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ color: demo.color }}
                >
                  {demo.partner}
                </p>
              </div>
              <h4 className="text-base font-bold text-text-primary mb-1.5">{demo.title}</h4>
              <p className="text-sm text-text-primary/60 leading-relaxed mb-3">
                {demo.description}
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all duration-300"
                style={{ color: demo.color }}
              >
                Run the workflow <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
