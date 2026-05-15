'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, MousePointerClick, RotateCcw } from 'lucide-react';

import { AttackSimulator } from '@/components/cloudflare-demo/attack-simulator';
import { FullAttackPage } from '@/components/cloudflare-demo/full-attack-page';
import { LiveDashboard } from '@/components/cloudflare-demo/live-dashboard';
import { AgentConsole } from '@/components/cloudflare-demo/agent-console';
import {
  ArtifactCards,
  type CloudflareArtifact,
} from '@/components/cloudflare-demo/artifact-cards';
import { MitigationTimeCard } from '@/components/cloudflare-demo/mitigation-time-card';
import { GuardrailsPanel } from '@/components/cloudflare-demo/guardrails-panel';

import { CloudflareModal } from '@/components/cloudflare-demo/artifacts/cloudflare-modal';
import { WafModal } from '@/components/cloudflare-demo/artifacts/waf-modal';
import { PrModal } from '@/components/cloudflare-demo/artifacts/pr-modal';
import { Postmortem } from '@/components/cloudflare-demo/artifacts/postmortem';

type Phase = 'idle' | 'attack' | 'running' | 'complete';

export default function CloudflareDemoPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [artifact, setArtifact] = useState<CloudflareArtifact | null>(null);
  const [simulatorKey, setSimulatorKey] = useState(0);

  const handleAttackTriggered = useCallback(() => {
    setPhase('attack');
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
    setSimulatorKey(k => k + 1);
  }, []);

  const openArtifact = useCallback((a: CloudflareArtifact) => setArtifact(a), []);
  const closeArtifact = useCallback(() => setArtifact(null), []);

  const isActive = phase === 'running' || phase === 'complete';

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/cloudflare"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cloudflare Partnership
          </Link>
          <div className="flex items-center gap-3">
            {(phase === 'attack' || isActive) && (
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
                <div className="w-10 h-10 rounded-xl bg-[#F38020]/20 border border-[#F38020]/35 flex items-center justify-center text-sm font-bold text-[#FAAE40]">
                  ☁
                </div>
                <span className="text-text-tertiary text-lg">+</span>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-sm font-bold text-accent-blue">
                  C
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                Watch Cursor stop a credential-stuffing attack at the edge
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
                A real-time-feeling Cloudflare Analytics dashboard for{' '}
                <span className="font-mono text-text-primary">acme-app.com</span>. Click{' '}
                <span className="text-[#FAAE40] font-semibold">Simulate credential-stuffing wave</span> to
                fire a 4.3M-attempt attack and watch Cursor ship a 3-layer mitigation in under three minutes.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F38020]/10 border border-[#F38020]/30 shadow-[0_0_24px_rgba(243,128,32,0.15)]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#FAAE40]" />
                <span className="text-xs md:text-sm text-text-primary font-medium">
                  Click <span className="text-[#FAAE40] font-semibold">Simulate credential-stuffing wave</span> to start
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#FAAE40] animate-bounce" />
              </div>
            </div>

            {/* Hero analytics dashboard */}
            <div className="max-w-6xl mx-auto rounded-xl overflow-hidden border border-dark-border bg-dark-surface">
              <AttackSimulator key={simulatorKey} onComplete={handleAttackTriggered} />
            </div>

            <section className="mt-24">
              <MitigationTimeCard />
            </section>

            <section className="mt-16">
              <GuardrailsPanel />
            </section>

            <div className="mt-20 text-center max-w-2xl mx-auto px-6">
              <p className="text-sm text-text-tertiary">
                One click. Three defense layers. Edge config + Worker + app code, all coordinated.
                <span className="text-text-secondary ml-1">
                  This is what Cursor as the action layer for Cloudflare looks like.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ATTACK takeover */}
        {phase === 'attack' && <FullAttackPage onGo={handleGo} onReset={handleReset} />}

        {/* RUNNING + COMPLETE */}
        {isActive && (
          <div className="px-6 pb-24">
            <div className="text-center mb-6 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F38020]/10 border border-[#F38020]/25 mb-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'complete' ? 'bg-accent-green' : 'bg-[#F38020] animate-pulse'
                  }`}
                />
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider ${
                    phase === 'complete' ? 'text-accent-green' : 'text-[#FAAE40]'
                  }`}
                >
                  {phase === 'complete' ? 'Mitigation complete' : 'Agent engaged'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
                {phase === 'complete'
                  ? 'Three layers landed · all artifacts ready for the security reviewer.'
                  : 'Cursor is mitigating the attack across edge config and code'}
              </h2>
            </div>

            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1fr)] gap-4 items-stretch">
                {/* Left: live Cloudflare dashboard */}
                <div className="min-h-[640px]">
                  <LiveDashboard
                    complete={phase === 'complete'}
                    onViewAttackDetail={() => openArtifact('attack')}
                    onReset={handleReset}
                  />
                </div>

                {/* Divider */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center border border-dark-border">
                    <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                  </div>
                </div>

                {/* Right: agent console */}
                <div className="min-h-[640px] max-h-[calc(100vh-180px)]">
                  <AgentConsole onComplete={handleConsoleComplete} />
                </div>
              </div>

              {phase === 'complete' && <ArtifactCards onOpen={openArtifact} />}
            </div>
          </div>
        )}
      </main>

      {/* Artifact modals */}
      {artifact === 'attack' && <CloudflareModal onClose={closeArtifact} />}
      {artifact === 'waf' && <WafModal onClose={closeArtifact} />}
      {artifact === 'pr' && <PrModal onClose={closeArtifact} />}
      {artifact === 'postmortem' && <Postmortem onClose={closeArtifact} />}
    </div>
  );
}
