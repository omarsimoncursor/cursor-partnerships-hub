'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoDriftBoundary } from '@/components/figma-demo/demo-drift-boundary';
import { DesignQACard } from '@/components/figma-demo/design-qa-card';
import { VelocityComparison } from '@/components/figma-demo/velocity-comparison';
import { GuardrailsPanel } from '@/components/figma-demo/guardrails-panel';
import { FullDriftPage } from '@/components/figma-demo/full-drift-page';
import { DriftSummary } from '@/components/figma-demo/drift-summary';
import { AgentConsole } from '@/components/figma-demo/agent-console';
import { ArtifactCards } from '@/components/figma-demo/artifact-cards';
import { TriageReport } from '@/components/figma-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/figma-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/figma-demo/artifacts/pr-modal';
import { FigmaModal } from '@/components/figma-demo/artifacts/figma-modal';
import { FigmaLogo } from '@/components/figma-demo/artifacts/figma-logo';

type Phase = 'idle' | 'drift' | 'running' | 'complete';
type Artifact = 'figma' | 'pr' | 'triage' | 'jira';

export default function FigmaDemoPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [boundaryKey, setBoundaryKey] = useState(0);

  const handleDriftDetected = useCallback(() => {
    setPhase('drift');
  }, []);

  const handleGo = useCallback(() => {
    setPhase('running');
  }, []);

  const handleConsoleComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setArtifact(null);
    setBoundaryKey(k => k + 1);
  }, []);

  const openArtifact = useCallback((a: Artifact) => setArtifact(a), []);
  const closeArtifact = useCallback(() => setArtifact(null), []);

  const isActive = phase === 'running' || phase === 'complete';

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/figma"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Figma Partnership
          </Link>
          <div className="flex items-center gap-3">
            {isActive && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors px-2.5 py-1 rounded-md hover:bg-dark-surface-hover cursor-pointer"
                title="Reset demo"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <span className="text-sm text-text-tertiary font-mono">Live Demo</span>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* IDLE */}
        {phase === 'idle' && (
          <div className="px-6 pb-24">
            <div className="text-center mb-10 mt-6">
              <div className="inline-flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{
                    background: 'rgba(162,89,255,0.12)',
                    borderColor: 'rgba(162,89,255,0.30)',
                  }}
                >
                  <FigmaLogo size={14} />
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch design–to–production close in real time
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                A real product card has drifted from its Figma spec. Cursor reads the variables,
                triages the violations, and submits a token-only PR — every Cursor model and MCP coordinated.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(162,89,255,0.10)',
                  border: '1px solid rgba(162,89,255,0.28)',
                  boxShadow: '0 0 24px rgba(162,89,255,0.18)',
                }}
              >
                <MousePointerClick className="w-3.5 h-3.5" style={{ color: '#A259FF' }} />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="font-semibold" style={{ color: '#D6BBFF' }}>Run design QA</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" style={{ color: '#A259FF' }} />
              </div>
            </div>

            <DemoDriftBoundary key={boundaryKey}>
              <div className="flex justify-center">
                <DesignQACard onDriftDetected={handleDriftDetected} />
              </div>
            </DemoDriftBoundary>

            <section className="mt-24">
              <VelocityComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One click. Figma MCP, GitHub MCP, Jira MCP coordinated. Three models, one PR ready for review.
                <span className="text-text-secondary ml-1">
                  This is what Cursor as the orchestration layer looks like for design fidelity.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* DRIFT (full takeover) */}
        {phase === 'drift' && <FullDriftPage onGo={handleGo} onReset={handleReset} />}

        {/* RUNNING + COMPLETE */}
        {isActive && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                style={{
                  background: phase === 'complete' ? 'rgba(74,222,128,0.10)' : 'rgba(245,166,35,0.10)',
                  border: `1px solid ${phase === 'complete' ? 'rgba(74,222,128,0.25)' : 'rgba(245,166,35,0.30)'}`,
                }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${phase === 'complete' ? 'bg-accent-green' : 'animate-pulse'}`}
                  style={{ background: phase === 'complete' ? undefined : '#F5A623' }}
                />
                <span
                  className="text-[11px] font-mono uppercase tracking-wider"
                  style={{ color: phase === 'complete' ? '#4ADE80' : '#F5A623' }}
                >
                  {phase === 'complete' ? 'Run complete' : 'Agent engaged'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Fix proposed · all artifacts ready for review.'
                  : 'Cursor is restoring 100% Figma match in the background'}
              </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                {/* Left: drift summary */}
                <div className="min-h-[520px]">
                  <DriftSummary
                    onReset={handleReset}
                    onViewFigma={() => openArtifact('figma')}
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center border border-dark-border">
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                  </div>
                </div>

                {/* Right: agent console */}
                <div className="min-h-[520px] max-h-[calc(100vh-220px)]">
                  <AgentConsole onComplete={handleConsoleComplete} />
                </div>
              </div>

              {phase === 'complete' && <ArtifactCards onOpen={openArtifact} />}
            </div>
          </div>
        )}
      </main>

      {/* Artifact modals */}
      {artifact === 'figma' && <FigmaModal onClose={closeArtifact} />}
      {artifact === 'triage' && <TriageReport onClose={closeArtifact} />}
      {artifact === 'jira' && <JiraTicket onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
    </div>
  );
}
