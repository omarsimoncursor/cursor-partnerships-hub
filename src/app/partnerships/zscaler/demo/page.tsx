'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoZeroTrustBoundary } from '@/components/zscaler-demo/demo-zerotrust-boundary';
import { AuditCard } from '@/components/zscaler-demo/audit-card';
import { RiskComparison } from '@/components/zscaler-demo/risk-comparison';
import { GuardrailsPanel } from '@/components/zscaler-demo/guardrails-panel';
import { FullViolationPage } from '@/components/zscaler-demo/full-violation-page';
import { ViolationSummary } from '@/components/zscaler-demo/violation-summary';
import { AgentConsole } from '@/components/zscaler-demo/agent-console';
import { ArtifactCards } from '@/components/zscaler-demo/artifact-cards';
import { TriageReport } from '@/components/zscaler-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/zscaler-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/zscaler-demo/artifacts/pr-modal';
import { ZscalerModal } from '@/components/zscaler-demo/artifacts/zscaler-modal';

type Phase = 'idle' | 'error' | 'running' | 'complete';
type Artifact = 'pr' | 'triage' | 'jira' | 'zscaler';

export default function ZscalerDemoPage() {
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
            href="/partnerships/zscaler"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Zscaler Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#0079D5]/20 border border-[#0079D5]/35 flex items-center justify-center text-sm font-bold text-[#65B5F2]">
                  Z
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch Cursor close a Zero Trust violation in real time
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                A real ZPA application access rule (managed via the official zscaler/zpa Terraform
                provider) is missing its SCIM, posture, network, and client conditions. Zscaler ZPA
                flags the segment, Cursor reads the .tf, writes the missing conditions, runs
                terraform plan, replays the conformance probe, and submits a verified PR.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0079D5]/10 border border-[#0079D5]/30 shadow-[0_0_24px_rgba(0,121,213,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#65B5F2]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#65B5F2] font-semibold">Run policy conformance probe</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#65B5F2] animate-bounce" />
              </div>
            </div>

            <DemoZeroTrustBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <AuditCard />
              </div>
            </DemoZeroTrustBoundary>

            <section className="mt-24">
              <RiskComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One click. Four MCPs coordinated. Three models, one Terraform PR ready for review.
                <span className="text-text-secondary ml-1">
                  This is what Cursor as the orchestration layer between Zscaler, Okta, the IaC repo,
                  and the platform team looks like.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR (full takeover) */}
        {phase === 'error' && error && (
          <FullViolationPage error={error} onGo={handleGo} onReset={handleReset} />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20 mb-3">
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
                  {phase === 'complete' ? 'Run complete' : 'Agent engaged'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Fix proposed · all artifacts ready for review.'
                  : 'Cursor is orchestrating the policy fix in the background'}
              </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                {/* Left: violation summary */}
                <div className="min-h-[520px]">
                  <ViolationSummary
                    error={error}
                    onReset={handleReset}
                    onViewZscaler={() => openArtifact('zscaler')}
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

              {phase === 'complete' && <ArtifactCards onOpen={openArtifact} />}
            </div>
          </div>
        )}
      </main>

      {/* Artifact modals */}
      {artifact === 'triage' && <TriageReport onClose={closeArtifact} />}
      {artifact === 'jira' && <JiraTicket onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
      {artifact === 'zscaler' && <ZscalerModal onClose={closeArtifact} />}
    </div>
  );
}
