'use client';

import { useEffect, useRef } from 'react';
import { LucideIcon, Cloud, Database, FileSearch } from 'lucide-react';
import { gsap } from '@/lib/gsap-init';
import { FlowPipe } from './flow-pipe';
import { SystemNode } from './system-node';

interface SemanticResult {
  file: string;
  relevance: string;
  reason: string;
}

interface McpFlowDiagramProps {
  /** Source system (e.g., Datadog, Sentry) */
  sourceIcon: LucideIcon;
  sourceName: string;
  sourceColor: string;
  /** Payload preview lines to show flowing through */
  payloadLines: string[];
  /** Top-level event descriptor (e.g., "P1 Anomaly", "TypeError") */
  eventBadge: { label: string; value: string };
  /** Semantic index results */
  semanticResults: SemanticResult[];
  semanticTopColor?: string;
}

export function McpFlowDiagram({
  sourceIcon,
  sourceName,
  sourceColor,
  payloadLines,
  eventBadge,
  semanticResults,
  semanticTopColor = '#4ADE80',
}: McpFlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-mcp-node]', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        opacity: 0, scale: 0.6, stagger: 0.15, duration: 0.6, ease: 'back.out(1.5)',
      });
      gsap.from('[data-mcp-payload-card]', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 65%' },
        opacity: 0, y: -20, duration: 0.6, delay: 0.6, ease: 'power3.out',
      });
      gsap.from('[data-mcp-semantic-card]', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 65%' },
        opacity: 0, y: 20, duration: 0.6, delay: 0.8, ease: 'power3.out',
      });
      gsap.from('[data-semantic-row]', {
        scrollTrigger: { trigger: '[data-mcp-semantic-card]', start: 'top 80%' },
        opacity: 0, x: -10, stagger: 0.08, duration: 0.4, delay: 1.0, ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Payload tooltip above flow */}
      <div
        data-mcp-payload-card
        className="relative max-w-md mx-auto mb-6 rounded-xl overflow-hidden"
        style={{
          background: `${sourceColor}08`,
          border: `1px solid ${sourceColor}25`,
          boxShadow: `0 8px 24px ${sourceColor}15`,
        }}
      >
        <div className="px-4 py-2 flex items-center gap-2" style={{ background: `${sourceColor}12`, borderBottom: `1px solid ${sourceColor}20` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: sourceColor, boxShadow: `0 0 6px ${sourceColor}` }} />
          <span className="text-[10px] font-mono font-semibold tracking-wider uppercase" style={{ color: sourceColor }}>
            {sourceName} MCP Event
          </span>
          <span className="ml-auto text-[9px] font-mono text-text-tertiary">{eventBadge.label}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${sourceColor}20`, color: sourceColor }}>
            {eventBadge.value}
          </span>
        </div>
        <div className="p-3 font-mono text-[10px] leading-5 text-text-secondary">
          {payloadLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Little tail pointing down */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
          style={{
            background: `${sourceColor}12`,
            borderRight: `1px solid ${sourceColor}25`,
            borderBottom: `1px solid ${sourceColor}25`,
          }}
        />
      </div>

      {/* Horizontal flow: Source -> MCP Pipe -> Cloud Agent -> MCP Pipe -> Semantic Index */}
      {/* pt-10 pb-8 creates a safe zone for status dots, pulse halos, and the scale(1.3) + blur-xl glow aura around each node; overflow-x-auto implicitly clips y per CSS spec, so padding gives them room */}
      <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pt-10 pb-8">
        <div data-mcp-node className="shrink-0">
          <SystemNode
            icon={sourceIcon}
            label={sourceName}
            sublabel="Source of truth"
            color={sourceColor}
            size="lg"
            status="active"
          />
        </div>

        <div className="shrink-0">
          <FlowPipe
            width={160}
            height={60}
            color={sourceColor}
            label="MCP"
            packetCount={3}
            duration={2.0}
          />
        </div>

        <div data-mcp-node className="shrink-0">
          <SystemNode
            icon={Cloud}
            label="Cursor Cloud Agent"
            sublabel="Always-on orchestrator"
            color="#60A5FA"
            size="lg"
            pulse
            status="active"
          />
        </div>

        <div className="shrink-0">
          <FlowPipe
            width={160}
            height={60}
            color="#60A5FA"
            label="Query"
            packetCount={3}
            duration={1.8}
          />
        </div>

        <div data-mcp-node className="shrink-0">
          <SystemNode
            icon={Database}
            label="Semantic Index"
            sublabel="Full codebase"
            color="#A259FF"
            size="lg"
            status="success"
          />
        </div>
      </div>

      {/* Semantic results card below */}
      <div
        data-mcp-semantic-card
        className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden max-w-3xl mx-auto"
      >
        <div className="px-4 py-3 border-b border-dark-border bg-dark-bg flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-[#A259FF]" />
          <span className="text-xs text-text-tertiary font-mono">semantic_index.query()</span>
          <span className="ml-auto text-[10px] font-mono text-accent-green flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            {semanticResults.length} files / 0.2s
          </span>
        </div>
        <div className="divide-y divide-dark-border">
          {semanticResults.map((result, i) => (
            <div key={i} data-semantic-row className="px-4 py-2.5 flex items-center gap-4">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: i === 0 ? `${semanticTopColor}15` : '#60A5FA15',
                  color: i === 0 ? semanticTopColor : '#60A5FA',
                }}
              >
                {result.relevance}
              </span>
              <span className="text-xs font-mono text-text-primary truncate">{result.file}</span>
              <span className="text-[10px] text-text-tertiary ml-auto hidden sm:inline">{result.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
