'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoModernizationBoundary } from '@/components/aws-live-demo/demo-modernization-boundary';
import { AssessCard } from '@/components/aws-live-demo/assess-card';
import { TcoComparison } from '@/components/aws-live-demo/tco-comparison';
import { RepValueCard } from '@/components/aws-live-demo/rep-value-card';
import { GuardrailsPanel } from '@/components/aws-live-demo/guardrails-panel';
import { FullModernizationScopePage } from '@/components/aws-live-demo/full-modernization-scope-page';
import { ModernizationSummary } from '@/components/aws-live-demo/modernization-summary';
import { AgentConsole } from '@/components/aws-live-demo/agent-console';
import { ArtifactCards } from '@/components/aws-live-demo/artifact-cards';
import { TriageReport } from '@/components/aws-live-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/aws-live-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/aws-live-demo/artifacts/pr-modal';
import { AwsModal } from '@/components/aws-live-demo/artifacts/aws-modal';

type Phase = 'idle' | 'error' | 'running' | 'complete';
type Artifact = 'pr' | 'triage' | 'jira' | 'aws';

export default function AwsDemoPage() {
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
            href="/partnerships/aws"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AWS Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#FF9900]/20 border border-[#FF9900]/35 flex items-center justify-center text-sm font-bold text-[#FF9900]">
                  AWS
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch a realistic AWS modernization play through, days and review gates included
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
                A GSI quotes 5 years and $14M for the full 38-context portfolio. Cursor compresses the agent-doable work and surfaces every human review gate (architecture, security, FinOps, cutover, code) — one bounded context ships to prod in <span className="text-[#FF9900] font-semibold">~22 calendar days</span> with <span className="text-[#FF9900] font-semibold">4 human review gates</span>, the portfolio in ~18 months.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 shadow-[0_0_24px_rgba(255,153,0,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#FF9900]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#FF9900] font-semibold">Run readiness scan</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#FF9900] animate-bounce" />
              </div>
            </div>

            <DemoModernizationBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <AssessCard />
              </div>
            </DemoModernizationBoundary>

            <section className="mt-20">
              <RepValueCard />
            </section>

            <section className="mt-16">
              <TcoComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One click. AWS Knowledge MCP + Bedrock + Composer + Codex coordinated. CDK-managed Lambda + Aurora + Secrets Manager, IAM least-priv, ready for review.
                <span className="text-text-secondary ml-1">
                  This is what Cursor as the modernization layer looks like.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR (full takeover) */}
        {phase === 'error' && error && (
          <FullModernizationScopePage error={error} onGo={handleGo} onReset={handleReset} />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/25 mb-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'complete' ? 'bg-[#00A86B]' : 'bg-[#FF9900] animate-pulse'
                  }`}
                />
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    phase === 'complete' ? 'text-[#00A86B]' : 'text-[#FF9900]'
                  }`}
                >
                  {phase === 'complete'
                    ? 'Shipped to prod · 22d · 4 / 4 gates'
                    : 'Agent + reviewers · OrdersService timeline playing'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'OrdersService live on AWS · 1 of 38 bounded contexts shipped to prod.'
                  : 'Cursor + the customer team are modernizing OrdersService — every gate surfaced'}
              </h2>
              {phase !== 'complete' && (
                <p className="text-xs text-text-tertiary mt-2 max-w-xl mx-auto">
                  Console plays the realistic ~22-day timeline in about 20 seconds. Watch for the orange{' '}
                  <span className="text-[#FF9900] font-semibold">human · review</span> rows — those are the gates that make a real enterprise sign.
                </p>
              )}
            </div>

            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                <div className="min-h-[560px]">
                  <ModernizationSummary
                    error={error}
                    onReset={handleReset}
                    onViewAwsConsole={() => openArtifact('aws')}
                  />
                </div>

                <div className="hidden md:flex items-center justify-center">
                  <div className="bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center border border-dark-border">
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                  </div>
                </div>

                <div className="min-h-[560px] max-h-[calc(100vh-220px)]">
                  <AgentConsole onComplete={handleConsoleComplete} />
                </div>
              </div>

              {phase === 'complete' && <ArtifactCards onOpen={openArtifact} />}
            </div>
          </div>
        )}
      </main>

      {artifact === 'triage' && <TriageReport onClose={closeArtifact} />}
      {artifact === 'jira' && <JiraTicket onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
      {artifact === 'aws' && <AwsModal onClose={closeArtifact} />}
    </div>
  );
}
