'use client';

import { useEffect, useRef } from 'react';
import { ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import type { ZeroTrustViolationError } from './audit-card';

interface FullViolationPageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
}

function asViolation(error: Error): ZeroTrustViolationError | null {
  if (error.name === 'ZeroTrustViolationError') {
    return error as ZeroTrustViolationError;
  }
  return null;
}

export function FullViolationPage({ error, onGo, onReset }: FullViolationPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const v = asViolation(error);
  const inScope = v?.inScope ?? 4287;
  const intent = v?.intent ?? 18;
  const ratio = v?.scopeRatio ?? '238.2x';
  const failed = v?.failedProbes ?? 3;
  const total = v?.totalProbes ?? 4;
  const tfFile = v?.tfFile ?? 'infrastructure/zscaler/workforce-admin.tf';

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg">
      <div className="h-1 w-full bg-[#0079D5] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0079D5]/15 border border-[#0079D5]/35 mb-6">
            <ShieldAlert className="w-8 h-8 text-[#65B5F2]" />
          </div>

          <p className="text-[11px] font-mono text-accent-amber uppercase tracking-[0.22em] mb-3">
            Zero Trust violation · ZPA Policy Engine · Sec-P1
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            ZPA access rule has no SCIM, posture, or network conditions.
          </h1>

          <p className="text-base text-text-secondary mb-8 max-w-lg mx-auto">
            Zscaler ZPA flagged the application segment. Conformance probe failed{' '}
            <span className="text-accent-amber font-mono">
              {failed}/{total}
            </span>{' '}
            simulated requests. Risk Operations opened CUR-5712 and assigned it to
            the Cursor Background Agent.
          </p>

          {/* Metric card */}
          <div className="mx-auto max-w-xl rounded-xl border border-[#0079D5]/25 bg-[#0B1A2D] p-5 mb-10 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                ZPA segment · workforce-admin-audit-logs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <Metric label="In scope" value={inScope.toLocaleString()} tone="amber" big />
              <Metric label="Intent" value={intent.toString()} tone="green" />
              <Metric label="Over scope" value={ratio} tone="amber" />
            </div>

            <p className="font-mono text-[12px] text-text-secondary break-words mb-1">
              {tfFile}
            </p>
            <p className="font-mono text-[11px] text-text-tertiary mb-2">
              Resource:{' '}
              <span className="text-[#65B5F2]">
                zpa_policy_access_rule.workforce_admin_audit_logs_allow
              </span>
            </p>
            <p className="font-mono text-[11px] text-text-tertiary">
              The rule is <span className="text-accent-amber">action = &quot;ALLOW&quot;</span>{' '}
              with only an APP condition. No SCIM_GROUP, no POSTURE, no TRUSTED_NETWORK,
              no CLIENT_TYPE. Any authenticated user from any device on any network
              from any client can reach the audit log.
            </p>
          </div>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
            Watch a Cursor agent triage the rule, write the missing conditions,
            run terraform plan, replay the probe, and ship a verified PR in under
            two minutes.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#0079D5] text-white font-semibold text-base
                         hover:bg-[#1A8FE8] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(0,121,213,0.4)] hover:shadow-[0_0_48px_rgba(0,121,213,0.55)]
                         cursor-pointer"
            >
              Watch Cursor scope this policy
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onReset}
              className="px-5 py-3 rounded-full border border-dark-border text-text-secondary font-medium text-sm
                         hover:bg-dark-surface-hover hover:text-text-primary transition-colors cursor-pointer
                         flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone: 'amber' | 'green';
  big?: boolean;
}) {
  const color = tone === 'amber' ? 'text-accent-amber' : 'text-accent-green';
  return (
    <div>
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`${big ? 'text-2xl' : 'text-lg'} font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
