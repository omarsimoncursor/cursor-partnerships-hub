'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  MousePointerClick,
  RotateCcw,
} from 'lucide-react';
import { OncallBoard } from '@/components/pagerduty-demo/oncall-board';
import { DemoDeployBoundary } from '@/components/pagerduty-demo/demo-deploy-boundary';
import { FullIncidentPage } from '@/components/pagerduty-demo/full-incident-page';
import { IncidentSummary, type TimelineEntry } from '@/components/pagerduty-demo/incident-summary';
import { AgentConsole, type Step } from '@/components/pagerduty-demo/agent-console';
import { ArtifactCards, type Artifact } from '@/components/pagerduty-demo/artifact-cards';
import { CounterfactualCard } from '@/components/pagerduty-demo/counterfactual-card';
import { PageSuppressionStats } from '@/components/pagerduty-demo/page-suppression-stats';
import { GuardrailsPanel } from '@/components/pagerduty-demo/guardrails-panel';
import { PagerdutyModal } from '@/components/pagerduty-demo/artifacts/pagerduty-modal';
import { StatuspageModal } from '@/components/pagerduty-demo/artifacts/statuspage-modal';
import { PrModal } from '@/components/pagerduty-demo/artifacts/pr-modal';
import { Postmortem } from '@/components/pagerduty-demo/artifacts/postmortem';

type Phase = 'idle' | 'error' | 'running' | 'complete';

export default function PagerdutyDemoPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [boundaryKey, setBoundaryKey] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [resolved, setResolved] = useState(false);

  const handleError = useCallback((e: Error) => {
    setError(e);
    setPhase('error');
  }, []);

  const handleGo = useCallback(() => {
    setPhase('running');
    setTimeline([]);
    setResolved(false);
  }, []);

  const handleStepAdvance = useCallback((stepIdx: number, step: Step) => {
    if (!step.pdEvent) return;
    setTimeline(prev => [...prev, { ...step.pdEvent!, seq: stepIdx }]);
    if (step.pdEvent.kind === 'resolved') {
      setResolved(true);
    }
  }, []);

  const handleConsoleComplete = useCallback(() => {
    setPhase('complete');
    setResolved(true);
  }, []);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setError(null);
    setArtifact(null);
    setTimeline([]);
    setResolved(false);
    setBoundaryKey(k => k + 1);
  }, []);

  const openArtifact = useCallback((a: Artifact) => setArtifact(a), []);
  const closeArtifact = useCallback(() => setArtifact(null), []);

  const isActive = phase === 'running' || phase === 'complete';

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/pagerduty"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PagerDuty Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#06AC38]/15 border border-[#06AC38]/35 flex items-center justify-center text-sm font-bold text-[#57D990]">
                  PD
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch a P1 page resolve itself at 03:14 AM
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                A bad deploy fires a PagerDuty incident on payments-api. Cursor ack&apos;s within
                12 seconds, decides revert vs fix-forward, ships the revert through canary, posts
                the Statuspage update, and resolves the incident — without paging a human.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#06AC38]/10 border border-[#06AC38]/30 shadow-[0_0_24px_rgba(6,172,56,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#57D990]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#57D990] font-semibold">Simulate deploy</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#57D990] animate-bounce" />
              </div>
            </div>

            <DemoDeployBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <OncallBoard />
              </div>
            </DemoDeployBoundary>

            <section className="mt-24">
              <PageSuppressionStats />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One bad deploy. Six MCPs orchestrated. Zero phones ring.
                <span className="text-text-secondary ml-1">
                  Cursor becomes the auto-pilot inside your on-call rotation.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR — full-screen incident takeover */}
        {phase === 'error' && error && (
          <FullIncidentPage error={error} onGo={handleGo} onReset={handleReset} />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 ${
                  phase === 'complete'
                    ? 'bg-[#06AC38]/10 border border-[#06AC38]/25'
                    : 'bg-accent-amber/10 border border-accent-amber/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'complete' ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'
                  }`}
                />
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    phase === 'complete' ? 'text-accent-green' : 'text-accent-amber'
                  }`}
                >
                  {phase === 'complete' ? 'Auto-resolve complete' : 'Auto-pilot engaged'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'INC-21487 resolved · 4m 12s · 0 humans paged.'
                  : 'Cursor is handling the page in the background'}
              </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                {/* Left: live PagerDuty incident timeline */}
                <div className="min-h-[520px]">
                  <IncidentSummary
                    entries={timeline}
                    resolved={resolved}
                    onReset={handleReset}
                    onViewIncident={() => openArtifact('pagerduty')}
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
                  <AgentConsole
                    onComplete={handleConsoleComplete}
                    onStepAdvance={handleStepAdvance}
                  />
                </div>
              </div>

              {phase === 'complete' && (
                <>
                  <ArtifactCards onOpen={openArtifact} />
                  <CounterfactualCard />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Artifact modals */}
      {artifact === 'pagerduty' && <PagerdutyModal onClose={closeArtifact} />}
      {artifact === 'statuspage' && <StatuspageModal onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
      {artifact === 'postmortem' && <Postmortem onClose={closeArtifact} />}
    </div>
  );
}
