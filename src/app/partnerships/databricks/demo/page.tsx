'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';
import { DemoMigrationBoundary } from '@/components/databricks-demo/demo-migration-boundary';
import { MigrationCard } from '@/components/databricks-demo/migration-card';
import { FullMigrationScopePage } from '@/components/databricks-demo/full-migration-scope-page';
import { MigrationSummary } from '@/components/databricks-demo/migration-summary';
import { AgentConsole } from '@/components/databricks-demo/agent-console';
import { ArtifactCards, type DatabricksArtifact } from '@/components/databricks-demo/artifact-cards';
import { EconomicsPanel } from '@/components/databricks-demo/economics-panel';
import { RepValueCard } from '@/components/databricks-demo/rep-value-card';
import { GuardrailsPanel } from '@/components/databricks-demo/guardrails-panel';
import { TriageReport } from '@/components/databricks-demo/artifacts/triage-report';
import { JiraTicket } from '@/components/databricks-demo/artifacts/jira-ticket';
import { PrModal } from '@/components/databricks-demo/artifacts/pr-modal';
import { DatabricksModal } from '@/components/databricks-demo/artifacts/databricks-modal';

type Phase = 'idle' | 'error' | 'running' | 'complete';

export default function DatabricksDemoPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [artifact, setArtifact] = useState<DatabricksArtifact | null>(null);
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

  const openArtifact = useCallback((a: DatabricksArtifact) => setArtifact(a), []);
  const closeArtifact = useCallback(() => setArtifact(null), []);

  const isActive = phase === 'running' || phase === 'complete';

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/databricks"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Databricks Partnership
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
                <div className="w-10 h-10 rounded-xl bg-[#FF3621]/20 border border-[#FF3621]/40 flex items-center justify-center text-sm font-bold text-[#FF6B55]">
                  D
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Walk one legacy Oracle workflow through its full ~18-day Databricks migration lifecycle
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
                A real Oracle PL/SQL stored proc + Informatica mapping is analyzed on disk. Cursor orchestrates Databricks MCP, Opus, Composer, Codex, and Unity Catalog (~40 min agent compute) — then sits in code review, runs a 2-week DLT shadow against Oracle, gets 3 stakeholder sign-offs, and cuts over in a CAB-approved window. <span className="text-text-primary">Played back at warp speed.</span> The incumbent GSI&apos;s 5-year, $22M plan becomes 18 months and $6.8M.
              </p>
            </div>

            {/* Start-demo CTA callout */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FF3621]/10 border border-[#FF3621]/30 shadow-[0_0_24px_rgba(255,54,33,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#FF6B55]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#FF6B55] font-semibold">Run migration analysis</span> to start the demo
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#FF6B55] animate-bounce" />
              </div>
            </div>

            <DemoMigrationBoundary key={boundaryKey} onError={handleError}>
              <div className="flex justify-center">
                <MigrationCard />
              </div>
            </DemoMigrationBoundary>

            <section className="mt-20">
              <RepValueCard />
            </section>

            <section className="mt-16">
              <EconomicsPanel />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                ~40 min agent compute · 4 human checkpoints · 2-week parallel run · CAB-approved cutover.
                <span className="text-text-secondary ml-1">
                  Cursor compresses the engineering — the change-management gates a regulated data platform requires still happen.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR (full takeover) */}
        {phase === 'error' && error && (
          <FullMigrationScopePage error={error} onGo={handleGo} onReset={handleReset} />
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
                  {phase === 'complete' ? 'Workflow #1 cutover · Day 18' : 'Lifecycle in flight · warp speed'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Workflow #1 of 312 retired from Oracle · 18 days end-to-end · 4 human checkpoints clean.'
                  : 'Cursor walks the workflow through agent compute → code review → parallel run → sign-off → cutover'}
              </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] gap-4 items-stretch">
                {/* Left: migration summary */}
                <div className="min-h-[520px]">
                  <MigrationSummary
                    error={error}
                    onReset={handleReset}
                    onViewWorkspace={() => openArtifact('databricks')}
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
      {artifact === 'databricks' && <DatabricksModal onClose={closeArtifact} />}
    </div>
  );
}
