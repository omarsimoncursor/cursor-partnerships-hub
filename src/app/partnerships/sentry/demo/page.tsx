'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoErrorBoundary } from '@/components/sentry-demo/demo-error-boundary';
import { CheckoutCard } from '@/components/sentry-demo/checkout-card';
import { CostComparison } from '@/components/sentry-demo/cost-comparison';
import { GuardrailsPanel } from '@/components/sentry-demo/guardrails-panel';
import { FullErrorPage } from '@/components/sentry-demo/full-error-page';
import { ErrorFallback } from '@/components/sentry-demo/error-fallback';
import { AgentConsole } from '@/components/sentry-demo/agent-console';
import { ArtifactCards } from '@/components/sentry-demo/artifact-cards';
import { TriageReport } from '@/components/sentry-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/sentry-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/sentry-demo/artifacts/pr-modal';
import { SentryModal } from '@/components/sentry-demo/artifacts/sentry-modal';

type Phase = 'idle' | 'error' | 'running' | 'complete';
type Artifact = 'pr' | 'triage' | 'jira' | 'sentry';

export default function SentryDemoPage() {
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
            href="/partnerships/sentry"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sentry Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#362D59]/20 border border-[#362D59]/30 flex items-center justify-center text-sm font-bold text-[#b8a6ff]">
                  S
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch orchestration in real time
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                A real production error fires below. Sentry captures it, Cursor coordinates Opus, Composer, Codex,
                and five MCPs &mdash; and submits a tested PR. No engineer paged.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/25 shadow-[0_0_24px_rgba(96,165,250,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-accent-blue" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-accent-blue font-semibold">Process Order</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-accent-blue animate-bounce" />
              </div>
            </div>

            <DemoErrorBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <CheckoutCard />
              </div>
            </DemoErrorBoundary>

            <section className="mt-24">
              <CostComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One click. Seven MCPs coordinated. Three models, one PR ready for review.
                <span className="text-text-secondary ml-1">This is what Cursor as an orchestration layer looks like.</span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR (full takeover) */}
        {phase === 'error' && error && (
          <FullErrorPage error={error} onGo={handleGo} onReset={handleReset} />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${phase === 'complete' ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'}`} />
                <span className={`text-[11px] font-mono uppercase tracking-wider ${phase === 'complete' ? 'text-accent-green' : 'text-accent-amber'}`}>
                  {phase === 'complete' ? 'Run complete' : 'Agent engaged'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Fix proposed · all artifacts ready for review.'
                  : 'Cursor is orchestrating the fix in the background'}
              </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                {/* Left: Sentry summary */}
                <div className="min-h-[520px]">
                  <ErrorFallback
                    error={error}
                    onReset={handleReset}
                    onViewSentry={() => openArtifact('sentry')}
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center border border-dark-border">
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                  </div>
                </div>

                {/* Right: Agent console */}
                <div className="min-h-[520px] max-h-[calc(100vh-220px)]">
                  <AgentConsole onComplete={handleConsoleComplete} />
                </div>
              </div>

              {phase === 'complete' && (
                <ArtifactCards onOpen={openArtifact} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Artifact modals */}
      {artifact === 'triage' && <TriageReport onClose={closeArtifact} />}
      {artifact === 'jira' && <JiraTicket onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
      {artifact === 'sentry' && <SentryModal onClose={closeArtifact} />}
    </div>
  );
}
