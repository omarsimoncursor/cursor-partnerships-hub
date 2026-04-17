'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { GlassCard } from '@/components/ui/glass-card';
import { Star, Users, Layers, Puzzle } from 'lucide-react';

export function WhyFigmaScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-figma-why-header]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-why-repo]', {
        scrollTrigger: {
          trigger: '[data-figma-why-repos]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-why-pain]', {
        scrollTrigger: {
          trigger: '[data-figma-why-pains]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-figma-why-badges]', {
        scrollTrigger: {
          trigger: '[data-figma-why-badges]',
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

  const repos = [
    { name: 'plugin-samples', stars: '1,200', language: 'TypeScript', description: 'Sample plugins demonstrating the Figma Plugin API' },
    { name: 'code-connect', stars: '950', language: 'TypeScript', description: 'Bridge between Figma components and production code' },
    { name: 'plugin-typings', stars: '650', language: 'TypeScript', description: 'TypeScript type definitions for the Plugin API' },
    { name: 'widget-samples', stars: '420', language: 'TypeScript', description: 'Sample FigJam widgets' },
    { name: 'rest-api-spec', stars: '380', language: 'TypeScript', description: 'OpenAPI specification for the Figma REST API' },
  ];

  const painSignals = [
    {
      icon: Layers,
      title: 'Multiplayer Architecture Complexity',
      description: 'Real-time collaborative editing across web, desktop, and mobile with a custom C++ rendering engine compiled to WebAssembly.',
    },
    {
      icon: Puzzle,
      title: 'Design-to-Code Pipeline',
      description: 'code-connect maintains bindings across 4 frameworks (React, SwiftUI, Jetpack Compose, HTML). Each framework is a distinct codebase in TypeScript, Swift, or Kotlin.',
    },
    {
      icon: Users,
      title: 'Plugin Ecosystem Maintenance',
      description: '30+ official plugin samples, community plugins, and a typed API surface that must stay backward-compatible across versions.',
    },
  ];

  const techBadges = ['TypeScript', 'C++', 'Rust', 'WebAssembly', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'WebGL'];

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div data-figma-why-header>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 5</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Why This Matters for Figma</h2>
          </div>
          <h3 className="text-lg text-text-secondary mb-12">85 Public Repositories Analyzed</h3>
        </div>

        {/* Repo grid */}
        <div data-figma-why-repos className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {repos.map((repo, i) => (
            <div key={i} data-figma-why-repo>
              <GlassCard hover={false} className="h-full">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-mono font-semibold text-text-primary">{repo.name}</h4>
                  <div className="flex items-center gap-1 text-accent-amber">
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono">{repo.stars}</span>
                  </div>
                </div>
                <span className="inline-block text-[10px] font-mono text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded mb-3">
                  {repo.language}
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">{repo.description}</p>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Pain signal cards */}
        <div data-figma-why-pains className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {painSignals.map((signal, i) => (
            <div key={i} data-figma-why-pain>
              <GlassCard hover={false} className="h-full">
                <signal.icon className="w-8 h-8 text-[#A259FF] mb-4" />
                <h4 className="text-sm font-semibold text-text-primary mb-2">{signal.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{signal.description}</p>
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Tech stack badges */}
        <div data-figma-why-badges>
          <div className="flex flex-wrap gap-2 mb-8">
            {techBadges.map((badge, i) => (
              <span
                key={i}
                className="text-xs font-mono text-text-secondary bg-cta-bg px-3 py-1.5 rounded-full border border-dark-border"
              >
                {badge}
              </span>
            ))}
          </div>

          <GlassCard hover={false}>
            <p className="text-sm text-text-secondary">
              <span className="text-accent-blue font-semibold">85 open engineering roles</span> &mdash; Figma is actively hiring across engineering, indicating growing complexity and need for developer productivity tools.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
