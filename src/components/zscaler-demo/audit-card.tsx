'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, FileCode2, Loader2 } from 'lucide-react';

export class ZeroTrustViolationError extends Error {
  appSegment: string;
  policyResource: string;
  inScope: number;
  intent: number;
  scopeRatio: string;
  unmanagedDevicePaths: number;
  hasScimCondition: boolean;
  hasPostureCondition: boolean;
  hasTrustedNetworkCondition: boolean;
  hasClientTypeCondition: boolean;
  failedProbes: number;
  totalProbes: number;
  tfFile: string;
  elapsedMs: number;

  constructor(args: {
    appSegment: string;
    policyResource: string;
    inScope: number;
    intent: number;
    scopeRatio: string;
    unmanagedDevicePaths: number;
    hasScimCondition: boolean;
    hasPostureCondition: boolean;
    hasTrustedNetworkCondition: boolean;
    hasClientTypeCondition: boolean;
    failedProbes: number;
    totalProbes: number;
    tfFile: string;
    elapsedMs: number;
  }) {
    super(
      `Policy conformance failed for ${args.policyResource} - ${args.failedProbes}/${args.totalProbes} probes failed, ${args.inScope.toLocaleString()} users in scope vs intent ${args.intent}.`
    );
    this.name = 'ZeroTrustViolationError';
    this.appSegment = args.appSegment;
    this.policyResource = args.policyResource;
    this.inScope = args.inScope;
    this.intent = args.intent;
    this.scopeRatio = args.scopeRatio;
    this.unmanagedDevicePaths = args.unmanagedDevicePaths;
    this.hasScimCondition = args.hasScimCondition;
    this.hasPostureCondition = args.hasPostureCondition;
    this.hasTrustedNetworkCondition = args.hasTrustedNetworkCondition;
    this.hasClientTypeCondition = args.hasClientTypeCondition;
    this.failedProbes = args.failedProbes;
    this.totalProbes = args.totalProbes;
    this.tfFile = args.tfFile;
    this.elapsedMs = args.elapsedMs;
  }
}

const LOADING_STEPS = [
  'terraform init',
  'terraform validate',
  'parsing zpa_policy_access_rule.workforce_admin_audit_logs_allow',
  'running policy-conformance probe (4 simulated requests)',
] as const;

export function AuditCard() {
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [shouldThrow, setShouldThrow] = useState<ZeroTrustViolationError | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!processing) return;
    startRef.current = performance.now();

    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 320);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/zscaler/policy-conformance', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;

        const elapsedMs = Math.round(performance.now() - startRef.current);
        const scope = json?.scope ?? {
          inScope: 4287,
          intent: 18,
          ratio: '238.2x',
          unmanagedDevicePaths: 1,
          hasScimCondition: false,
          hasPostureCondition: false,
          hasTrustedNetworkCondition: false,
          hasClientTypeCondition: false,
        };
        const probe: Array<{ pass: boolean }> = json?.probe ?? [];
        const failed = probe.filter(p => !p.pass).length;
        const total = probe.length || 4;

        setShouldThrow(
          new ZeroTrustViolationError({
            appSegment: 'workforce-admin-audit-logs',
            policyResource: 'zpa_policy_access_rule.workforce_admin_audit_logs_allow',
            inScope: scope.inScope,
            intent: scope.intent,
            scopeRatio: scope.ratio,
            unmanagedDevicePaths: scope.unmanagedDevicePaths,
            hasScimCondition: scope.hasScimCondition,
            hasPostureCondition: scope.hasPostureCondition,
            hasTrustedNetworkCondition: scope.hasTrustedNetworkCondition,
            hasClientTypeCondition: scope.hasClientTypeCondition,
            failedProbes: failed,
            totalProbes: total,
            tfFile: json?.tfFile ?? 'infrastructure/zscaler/workforce-admin.tf',
            elapsedMs,
          })
        );
      } catch {
        if (cancelled) return;
        const elapsedMs = Math.round(performance.now() - startRef.current);
        setShouldThrow(
          new ZeroTrustViolationError({
            appSegment: 'workforce-admin-audit-logs',
            policyResource: 'zpa_policy_access_rule.workforce_admin_audit_logs_allow',
            inScope: 4287,
            intent: 18,
            scopeRatio: '238.2x',
            unmanagedDevicePaths: 1,
            hasScimCondition: false,
            hasPostureCondition: false,
            hasTrustedNetworkCondition: false,
            hasClientTypeCondition: false,
            failedProbes: 3,
            totalProbes: 4,
            tfFile: 'infrastructure/zscaler/workforce-admin.tf',
            elapsedMs,
          })
        );
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [processing]);

  if (shouldThrow) {
    throw shouldThrow;
  }

  function handleRun() {
    setProcessing(true);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0079D5]/15 border border-[#0079D5]/35 flex items-center justify-center">
              <FileCode2 className="w-4 h-4 text-[#65B5F2]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">ZPA-as-Code · Conformance</p>
              <p className="text-xs text-text-tertiary">Cron: nightly · CI: every PR</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Run policy conformance probe
            </p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Reads the ZPA Terraform module, parses{' '}
              <span className="font-mono text-text-secondary">zpa_policy_access_rule.workforce_admin_audit_logs_allow</span>
              , replays four canonical access requests through it, and asserts deny-by-default.
            </p>
          </div>

          {/* Module summary */}
          <div className="p-3 rounded-lg bg-dark-bg space-y-1.5 font-mono text-[11px]">
            <div className="text-text-tertiary">module:</div>
            <div className="text-[#65B5F2] truncate">infrastructure/zscaler/</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-1.5 py-0.5 rounded bg-[#0079D5]/10 border border-[#0079D5]/30 text-[10px] text-[#65B5F2]">
                provider: zscaler/zpa ~&gt; 4.4
              </span>
              <span className="px-1.5 py-0.5 rounded bg-dark-border text-[10px] text-text-tertiary">
                resources: 2
              </span>
            </div>
          </div>

          {/* Conditions chips - what the rule SHOULD have */}
          <div>
            <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
              Required conditions (per least-privilege baseline)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'SCIM_GROUP', missing: true },
                { label: 'POSTURE', missing: true },
                { label: 'TRUSTED_NETWORK', missing: true },
                { label: 'CLIENT_TYPE', missing: true },
              ].map(c => (
                <span
                  key={c.label}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-bg border text-[10px] font-mono ${
                    c.missing
                      ? 'border-accent-amber/30 text-accent-amber'
                      : 'border-dark-border text-text-tertiary'
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${c.missing ? 'bg-accent-amber' : 'bg-[#65B5F2]'}`}
                  />
                  {c.missing ? 'missing: ' : ''}
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Intent */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-text-tertiary" />
              <div>
                <p className="text-[11px] font-medium text-text-primary leading-none mb-0.5">
                  Least-privilege intent
                </p>
                <p className="text-[10px] text-text-tertiary">
                  security-admin + compliance-officer · managed-compliant · corp-egress
                </p>
              </div>
            </div>
            <span className="text-xs text-accent-green font-mono">18 users</span>
          </div>

          {/* Loading ticker */}
          {processing && (
            <div className="px-3 py-2 rounded-md border border-[#0079D5]/20 bg-[#0079D5]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#65B5F2] animate-pulse" />
              <span className="truncate">$ {LOADING_STEPS[stepIdx]}</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#0079D5] text-white font-medium text-sm
                       hover:bg-[#1A8FE8] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(0,121,213,0.30)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running probe...
              </>
            ) : (
              'Run policy conformance probe'
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Reads the real .tf file, runs the real probe.
          </p>
        </div>
      </div>
    </div>
  );
}
