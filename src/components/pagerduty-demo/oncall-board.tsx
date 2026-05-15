'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  GitBranch,
  Loader2,
  Phone,
  Rocket,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { DEPLOY_TIMELINE, INCIDENT_SEED } from '@/lib/demo/payments-deploy';

export class IncidentTriggeredError extends Error {
  incidentId: string;
  service: string;
  errorRatePct: number;
  monitorId: string;
  monitorName: string;
  burnRate: number;
  badCommitSha: string;
  deployVersion: string;
  triggeredAtIso: string;
  affectedRegions: string[];

  constructor() {
    super(
      `P1 incident — ${INCIDENT_SEED.service} 5xx error rate ${INCIDENT_SEED.errorRate}% > 5% for 3min`
    );
    this.name = 'IncidentTriggeredError';
    this.incidentId = INCIDENT_SEED.incidentId;
    this.service = INCIDENT_SEED.service;
    this.errorRatePct = INCIDENT_SEED.errorRate;
    this.monitorId = INCIDENT_SEED.monitorId;
    this.monitorName = INCIDENT_SEED.monitorName;
    this.burnRate = INCIDENT_SEED.errorBudgetBurnRate;
    this.badCommitSha = INCIDENT_SEED.badCommitSha;
    this.deployVersion = INCIDENT_SEED.deployVersion;
    this.triggeredAtIso = INCIDENT_SEED.triggeredAtIso;
    this.affectedRegions = INCIDENT_SEED.affectedRegions;
  }
}

export function OncallBoard() {
  const [deploying, setDeploying] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [throwError, setThrowError] = useState<IncidentTriggeredError | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!deploying) return;
    startRef.current = performance.now();

    let cumulative = 0;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    DEPLOY_TIMELINE.forEach((stage, i) => {
      cumulative += stage.durationMs;
      const t = setTimeout(() => {
        setStageIdx(i + 1);
      }, cumulative);
      timers.push(t);
    });

    let cancelled = false;
    (async () => {
      try {
        await fetch('/api/payments/deploy', {
          method: 'POST',
          cache: 'no-store',
        });
      } catch {
        // Even if the API errors, the incident should still trigger
      }
      if (cancelled) return;
      setThrowError(new IncidentTriggeredError());
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [deploying]);

  if (throwError) {
    throw throwError;
  }

  const currentStage = stageIdx > 0 ? DEPLOY_TIMELINE[Math.min(stageIdx - 1, DEPLOY_TIMELINE.length - 1)] : null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-dark-border bg-dark-surface overflow-hidden shadow-[0_0_60px_rgba(6,172,56,0.05)]">
        {/* Header — the on-call status board chrome */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#06AC38]/15 border border-[#06AC38]/30 flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#57D990]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary leading-none mb-0.5">
                On-call status board
              </p>
              <p className="text-[11px] text-text-tertiary font-mono">
                acme-eng · payments-pri rotation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono">
            <Clock className="w-3 h-3" />
            03:14 AM PT
          </div>
        </div>

        {/* Service card */}
        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-dark-border bg-dark-bg p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#06AC38]/10 border border-[#06AC38]/25 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#57D990]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-text-primary">payments-api</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06AC38]/15 border border-[#06AC38]/30 text-[10px] font-mono text-[#57D990] uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-[#57D990]" />
                  Operational
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary font-mono">
                P99 124ms · 5xx 0.0% · 18 pods · prod
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">Primary</p>
              <p className="text-xs text-text-primary font-medium flex items-center gap-1.5">
                <Users className="w-3 h-3 text-text-tertiary" />
                Alex Chen
              </p>
            </div>
          </div>

          {/* Recent deploys */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Rocket className="w-3.5 h-3.5 text-text-tertiary" />
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Recent deploys
              </p>
            </div>

            <div className="rounded-lg border border-dark-border bg-dark-bg overflow-hidden divide-y divide-dark-border">
              <DeployRow
                version="v1.42.0"
                title="fix: tokenization retry timeout"
                status="live · 6h"
                tone="green"
              />
              <DeployRow
                version="v1.42.1"
                title="chore: dependency bump"
                status="live · 2h"
                tone="green"
              />
              <DeployRow
                version="v1.43.0"
                title="feat: bank-transfer support"
                status={deploying ? 'rolling out' : 'awaiting traffic ramp'}
                tone={deploying ? 'amber' : 'pending'}
                pending
              />
            </div>
          </div>

          {/* Live deploy ticker (only while running) */}
          {deploying && currentStage && (
            <div className="rounded-lg border border-[#06AC38]/25 bg-[#06AC38]/5 px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Loader2 className="w-3 h-3 text-[#57D990] animate-spin" />
                <p className="text-[11px] font-mono text-[#57D990] uppercase tracking-wider">
                  Deploying · {currentStage.label}
                </p>
              </div>
              <p className="text-[11.5px] font-mono text-text-secondary truncate">
                {currentStage.detail}
              </p>
              {/* Progress bar */}
              <div className="mt-2 h-1 rounded-full bg-dark-border overflow-hidden">
                <div
                  className="h-full bg-[#57D990] transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, (stageIdx / DEPLOY_TIMELINE.length) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => setDeploying(true)}
            disabled={deploying}
            className="w-full py-3 px-4 rounded-lg bg-[#06AC38] text-white font-medium text-sm
                       hover:bg-[#08C443] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(6,172,56,0.25)]"
          >
            {deploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying v1.43.0…
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                Simulate deploy of v1.43.0
              </>
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Deploy is real — the rollout takes ~5s before traffic ramps up
          </p>
        </div>
      </div>
    </div>
  );
}

function DeployRow({
  version,
  title,
  status,
  tone,
  pending,
}: {
  version: string;
  title: string;
  status: string;
  tone: 'green' | 'amber' | 'pending';
  pending?: boolean;
}) {
  const dot =
    tone === 'green'
      ? 'bg-[#57D990]'
      : tone === 'amber'
        ? 'bg-[#F5A623] animate-pulse'
        : 'bg-text-tertiary';
  const statusColor =
    tone === 'green'
      ? 'text-[#57D990]'
      : tone === 'amber'
        ? 'text-[#F5A623]'
        : 'text-text-tertiary';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="font-mono text-[11.5px] text-text-primary shrink-0 w-14">
        {version}
      </span>
      <span className="text-[12px] text-text-secondary truncate flex-1">{title}</span>
      <span
        className={`text-[10.5px] font-mono uppercase tracking-wider shrink-0 ${statusColor}`}
      >
        {pending && tone !== 'amber' && (
          <CheckCircle2 className="w-3 h-3 inline -mt-0.5 mr-1 opacity-30" />
        )}
        {status}
      </span>
    </div>
  );
}
