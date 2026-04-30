'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoVulnBoundary } from '@/components/snyk-demo/demo-vuln-boundary';
import { SDKPipelineCard } from '@/components/snyk-demo/sdk-pipeline-card';
import { ShiftLeftStages } from '@/components/snyk-demo/shift-left-stages';
import { SeverityComparison } from '@/components/snyk-demo/severity-comparison';
import { GuardrailsPanel } from '@/components/snyk-demo/guardrails-panel';
import { FullVulnPage } from '@/components/snyk-demo/full-vuln-page';
import { SDKRunSummary } from '@/components/snyk-demo/sdk-run-summary';
import { SDKOrchestrationPanel } from '@/components/snyk-demo/sdk-orchestration-panel';
import { SDKCodePanel } from '@/components/snyk-demo/sdk-code-panel';
import { ArtifactCards } from '@/components/snyk-demo/artifact-cards';
import { TriageReport } from '@/components/snyk-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/snyk-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/snyk-demo/artifacts/pr-modal';
import { SnykModal } from '@/components/snyk-demo/artifacts/snyk-modal';

type Phase = 'idle' | 'error' | 'running' | 'complete';
type Artifact = 'pr' | 'triage' | 'jira' | 'snyk';

export default function SnykDemoPage() {
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
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/snyk"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Snyk Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#4C44CB]/20 border border-[#4C44CB]/35 flex items-center justify-center text-sm font-bold text-[#9F98FF]">
                  S
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: '#9F98FF' }}>
                Snyk × Cursor SDK · @cursor/february v1.0.7
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch the Cursor SDK block a merge and ship the fix.
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
                A pre-merge security gate calls{' '}
                <code className="font-mono text-[#9F98FF]">Agent.create({'{'}cloud:{'{'}repos: [{'{'}url, prUrl{'}'}]{'}'}{'}'})</code>{' '}
                from CI. Snyk catches the vulnerability, Cursor orchestrates the patch, and the merge
                stays blocked until the exploit replay reports zero leaked rows. Same SDK call, every
                stage of the pipeline.
              </p>
            </div>

            {/* Shift-left spine on the hero */}
            <div className="max-w-4xl mx-auto mb-10">
              <ShiftLeftStages active="pr-gate" covered={['ide', 'commit']} />
            </div>

            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#4C44CB]/10 border border-[#4C44CB]/30 shadow-[0_0_24px_rgba(76,68,203,0.2)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#9F98FF]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#9F98FF] font-semibold">Run pre-merge security check</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9F98FF] animate-bounce" />
              </div>
            </div>

            <DemoVulnBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <SDKPipelineCard />
              </div>
            </DemoVulnBoundary>

            <section className="mt-24">
              <SeverityComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One SDK call. Five stages of coverage. Three models, one PR ready for review.
                <span className="text-text-secondary ml-1">
                  This is what Cursor as the security automation layer looks like.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {phase === 'error' && error && (
          <FullVulnPage error={error} onGo={handleGo} onReset={handleReset} />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/25 mb-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'complete' ? 'bg-accent-green' : 'bg-[#FB7185] animate-pulse'
                  }`}
                />
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    phase === 'complete' ? 'text-accent-green' : 'text-[#FB7185]'
                  }`}
                >
                  {phase === 'complete' ? 'Run finished · gate clear' : 'SDK run · streaming'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Patch proposed · all artifacts ready for review.'
                  : 'Cursor SDK is orchestrating the fix on PR #214'}
              </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto space-y-4">
              {/* SDK code panel up top */}
              <SDKCodePanel active={isActive} />

              {/* Split: Left = vuln + SDK identity, Right = SDK orchestration panel */}
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)] gap-4 items-stretch">
                <div className="min-h-[640px]">
                  <SDKRunSummary
                    error={error}
                    onReset={handleReset}
                    onViewSnyk={() => openArtifact('snyk')}
                  />
                </div>

                <div className="hidden md:flex items-center justify-center">
                  <div className="bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center border border-dark-border">
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                  </div>
                </div>

                <div className="min-h-[640px] max-h-[calc(100vh-240px)]">
                  <SDKOrchestrationPanel
                    onComplete={handleConsoleComplete}
                    forcedStatus={phase === 'complete' ? 'FINISHED' : undefined}
                  />
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
      {artifact === 'snyk' && <SnykModal onClose={closeArtifact} />}
    </div>
  );
}
