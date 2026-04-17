'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { GlassCard } from '@/components/ui/glass-card';
import { ComparisonTable } from '@/components/ui/comparison-table';
import { LanguageBar } from '@/components/ui/language-bar';
import { Cpu, Code2, TestTube } from 'lucide-react';

export function CopilotComparisonScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-figma-comparison-header]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-comparison-table]', {
        scrollTrigger: {
          trigger: '[data-figma-comparison-table]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-agent-card]', {
        scrollTrigger: {
          trigger: '[data-figma-agents]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-langbar]', {
        scrollTrigger: {
          trigger: '[data-figma-langbar]',
          start: 'top 85%',
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const comparisonRows = [
    {
      dimension: 'Architecture',
      competitor: 'IDE extension (limited by host editor APIs)',
      cursor: 'Full IDE with native codebase indexing',
    },
    {
      dimension: 'Context',
      competitor: 'File-level + neighbors',
      cursor: 'Entire repository, semantic search across all files, all languages',
    },
    {
      dimension: 'Model routing',
      competitor: 'Global model selection or "Auto" (GitHub chooses)',
      cursor: 'Per-task intelligent routing, frontier for complex reasoning, fast models for completions',
    },
    {
      dimension: 'Agents',
      competitor: 'Coding agent in preview',
      cursor: 'Production-ready multi-agent orchestration. Simultaneous agents with distinct skills',
    },
    {
      dimension: 'Premium limits',
      competitor: '1,000 premium requests/user/month (Opus 4.6 = 30x multiplier \u2192 only ~33 frontier calls)',
      cursor: 'No hard premium caps, model routing optimizes cost automatically',
    },
  ];

  const agents = [
    {
      icon: Cpu,
      title: 'Rendering Engine Specialist',
      description: 'Refactoring C++ rendering code, understands memory management, GPU pipelines, and WebGL shaders.',
    },
    {
      icon: Code2,
      title: 'Plugin API Expert',
      description: 'Updating TypeScript bindings across 30+ plugin samples, knows the Figma Plugin API type system.',
    },
    {
      icon: TestTube,
      title: 'Test Engineer',
      description: 'Generating cross-language integration tests, verifies C++ \u2194 Rust \u2194 TypeScript boundaries work correctly.',
    },
  ];

  const languageSegments = [
    { name: 'TypeScript', percentage: 48, color: '#3178C6' },
    { name: 'C++', percentage: 22, color: '#F34B7D' },
    { name: 'Rust', percentage: 12, color: '#DEA584' },
    { name: 'JavaScript', percentage: 8, color: '#F7DF1E' },
    { name: 'WebAssembly', percentage: 5, color: '#654FF0' },
    { name: 'Python', percentage: 3, color: '#3572A5' },
  ];

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div data-figma-comparison-header>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 3</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Cursor Vs. GitHub CoPilot</h2>
          </div>
          <p className="text-text-secondary mb-12 max-w-2xl">
            Both tools now offer multi-model support. The difference is how they&apos;re used.
          </p>
        </div>

        {/* Comparison table */}
        <div data-figma-comparison-table className="mb-16">
          <ComparisonTable competitorName="GitHub Copilot Enterprise" rows={comparisonRows} />
        </div>

        {/* Multi-agent orchestration */}
        <div data-figma-agents>
          <h3 className="text-xl font-bold text-text-primary mb-8">Multi-Agent Orchestration on Figma&apos;s Codebase</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {agents.map((agent, i) => (
              <div key={i} data-figma-agent-card>
                <GlassCard hover={false} className="h-full">
                  <agent.icon className="w-8 h-8 text-accent-blue mb-4" />
                  <h4 className="text-sm font-semibold text-text-primary mb-2">{agent.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{agent.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-tertiary text-center mb-16">
            All three agents share full codebase context and coordinate from a single Cursor interface.
          </p>
        </div>

        {/* Language bar */}
        <div data-figma-langbar>
          <LanguageBar segments={languageSegments} />
          <p className="text-sm text-text-secondary mt-6 leading-relaxed max-w-3xl">
            When Figma&apos;s C++ rendering engine talks to Rust through FFI boundaries into the TypeScript plugin API, Cursor understands the whole conversation. Copilot sees only the file you&apos;re on.
          </p>
        </div>
      </div>
    </section>
  );
}
