'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoPerfBoundary } from '@/components/datadog-demo/demo-perf-boundary';
import { ReportsCard } from '@/components/datadog-demo/reports-card';
import { LatencyComparison } from '@/components/datadog-demo/latency-comparison';
import { GuardrailsPanel } from '@/components/datadog-demo/guardrails-panel';
import { FullSloBreachPage } from '@/components/datadog-demo/full-slo-breach-page';
import { AgentNetwork } from '@/components/datadog-demo/agent-network';
import { TimeToResolution } from '@/components/datadog-demo/time-to-resolution';
import { ArtifactCards } from '@/components/datadog-demo/artifact-cards';
import { TriageReport } from '@/components/datadog-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/datadog-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/datadog-demo/artifacts/pr-modal';
import { DatadogModal } from '@/components/datadog-demo/artifacts/datadog-modal';

type Phase = 'idle' | 'error' | 'running' | 'complete';
type Artifact = 'pr' | 'triage' | 'jira' | 'datadog';

export default function DatadogDemoPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [boundaryKey, setBoundaryKey] = useState(0);

  const handleError = useCallback((e: Error) => {
    setError(e);
    setPhase('error');
  }, []);

  const handleGo = useCallback(() => {
    setPhase('running');
  }, []);

  const handleConsoleComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setError(null);
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
            href="/partnerships/datadog"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Datadog Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#632CA6]/20 border border-[#632CA6]/35 flex items-center justify-center text-sm font-bold text-[#A689D4]">
                  D
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch Cursor resolve an SLO breach in real time
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                A real production report takes 7+ seconds. Datadog catches the breach, Cursor coordinates
                Opus, Composer, Codex, and six MCPs &mdash; and submits a tested PR. PagerDuty never pages.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#632CA6]/10 border border-[#632CA6]/30 shadow-[0_0_24px_rgba(99,44,166,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#A689D4]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#A689D4] font-semibold">Run report</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#A689D4] animate-bounce" />
              </div>
            </div>

            <DemoPerfBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <ReportsCard />
              </div>
            </DemoPerfBoundary>

            <section className="mt-24">
              <LatencyComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One click. Six MCPs coordinated. Three models, one PR ready for review.
                <span className="text-text-secondary ml-1">
                  This is what Cursor as an orchestration layer looks like.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR (full takeover) */}
        {phase === 'error' && error && (
          <FullSloBreachPage
            error={error}
            onGo={handleGo}
            onReset={handleReset}
            onViewDatadog={() => openArtifact('datadog')}
          />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 ${
                  phase === 'complete'
                    ? 'bg-accent-green/10 border border-accent-green/25'
                    : 'bg-[#632CA6]/10 border border-[#632CA6]/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'complete' ? 'bg-accent-green' : 'bg-[#A689D4] animate-pulse'
                  }`}
                />
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    phase === 'complete' ? 'text-accent-green' : 'text-[#A689D4]'
                  }`}
                >
                  {phase === 'complete' ? 'Run complete' : 'Agent engaged'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Issue resolved. Artifacts ready for review.'
                  : 'Cursor agent is orchestrating the fix'}
              </h2>
            </div>

            <AgentNetwork
              onComplete={handleConsoleComplete}
              onViewDatadog={() => openArtifact('datadog')}
            />

            {phase === 'complete' && (
              <div className="mt-12 space-y-10">
                <TimeToResolution />
                <ArtifactCards onOpen={openArtifact} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Artifact modals */}
      {artifact === 'triage' && <TriageReport onClose={closeArtifact} />}
      {artifact === 'jira' && <JiraTicket onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
      {artifact === 'datadog' && <DatadogModal onClose={closeArtifact} />}
    </div>
  );
}
