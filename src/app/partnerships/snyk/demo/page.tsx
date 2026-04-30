'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  MousePointerClick,
  RotateCcw,
  ShieldAlert,
  Bot,
  GitPullRequest,
} from 'lucide-react';
import { DemoVulnBoundary } from '@/components/snyk-demo/demo-vuln-boundary';
import { SDKPipelineCard } from '@/components/snyk-demo/sdk-pipeline-card';
import { SeverityComparison } from '@/components/snyk-demo/severity-comparison';
import { GuardrailsPanel } from '@/components/snyk-demo/guardrails-panel';
import { FullVulnPage } from '@/components/snyk-demo/full-vuln-page';
import { AgentStage } from '@/components/snyk-demo/agent-stage';
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

  const handleStageComplete = useCallback(() => {
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
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3 max-w-3xl mx-auto">
                Watch a Cursor agent fix a security flaw, end to end.
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
                Snyk catches the vulnerability. The Cursor agent writes the patch, re-runs the
                exploit to prove it&apos;s gone, and opens a pull request for a human to review.
                You&apos;ll see every step.
              </p>
            </div>

            {/* CTA pill above the trigger */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#4C44CB]/10 border border-[#4C44CB]/30 shadow-[0_0_24px_rgba(76,68,203,0.2)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#9F98FF]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#9F98FF] font-semibold">Run security check</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9F98FF] animate-bounce" />
              </div>
            </div>

            <DemoVulnBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <SDKPipelineCard />
              </div>
            </DemoVulnBoundary>

            {/* Plain-English 3-step explainer */}
            <section className="mt-20 max-w-4xl mx-auto">
              <p className="text-center text-[11px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: '#9F98FF' }}>
                What you&apos;re about to watch
              </p>
              <h2 className="text-center text-xl md:text-2xl font-semibold text-text-primary mb-8">
                Three things, in plain English.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SimpleStep
                  number="1"
                  icon={<ShieldAlert className="w-5 h-5" />}
                  title="Snyk catches the bug"
                  body="A real attack returns the entire customer table. Snyk identifies the bad pattern in the code."
                  tone="red"
                />
                <SimpleStep
                  number="2"
                  icon={<Bot className="w-5 h-5" />}
                  title="The agent fixes it"
                  body="It rewrites the unsafe line, upgrades the vulnerable library, and re-runs the same attack to prove the fix works."
                  tone="indigo"
                />
                <SimpleStep
                  number="3"
                  icon={<GitPullRequest className="w-5 h-5" />}
                  title="A human reviews"
                  body="A pull request lands with the patch and the proof. The agent never merges code on its own."
                  tone="green"
                />
              </div>
            </section>

            <section className="mt-20">
              <SeverityComparison />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>
          </div>
        )}

        {/* ERROR (full takeover) */}
        {phase === 'error' && error && (
          <FullVulnPage error={error} onGo={handleGo} onReset={handleReset} />
        )}

        {/* RUNNING + COMPLETE */}
        {isActive && error && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                style={{
                  background: phase === 'complete' ? 'rgba(74,222,128,0.10)' : 'rgba(76,68,203,0.10)',
                  border: phase === 'complete' ? '1px solid rgba(74,222,128,0.30)' : '1px solid rgba(76,68,203,0.30)',
                }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'complete' ? 'bg-accent-green' : 'bg-[#9F98FF] animate-pulse'
                  }`}
                />
                <span
                  className="text-[11px] font-mono uppercase tracking-wider"
                  style={{ color: phase === 'complete' ? '#4ADE80' : '#9F98FF' }}
                >
                  {phase === 'complete' ? 'Done · ready for review' : 'Agent at work'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'The fix is ready. Inspect what the agent produced.'
                  : 'Six steps. About two minutes of agent work, replayed in real time.'}
              </h2>
            </div>

            <div className="w-full max-w-5xl mx-auto">
              <AgentStage onComplete={handleStageComplete} />
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

function SimpleStep({
  number,
  icon,
  title,
  body,
  tone,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tone: 'red' | 'indigo' | 'green';
}) {
  const accent =
    tone === 'red'
      ? { color: '#FB7185', bg: 'rgba(225,29,72,0.10)', border: 'rgba(225,29,72,0.30)' }
      : tone === 'green'
        ? { color: '#4ADE80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.30)' }
        : { color: '#9F98FF', bg: 'rgba(76,68,203,0.10)', border: 'rgba(76,68,203,0.30)' };

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'rgb(var(--dark-surface))', borderColor: 'rgb(var(--dark-border))' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{ background: accent.bg, color: accent.color, border: `1px solid ${accent.border}` }}
        >
          {number}
        </span>
        <div style={{ color: accent.color }}>{icon}</div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}
