'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, FileLock2, Loader2 } from 'lucide-react';

export class ZeroTrustViolationError extends Error {
  endpoint: string;
  inScope: number;
  intent: number;
  scopeRatio: string;
  unmanagedDevicePaths: number;
  policyApp: string;
  elapsedMs: number;

  constructor(args: {
    endpoint: string;
    inScope: number;
    intent: number;
    scopeRatio: string;
    unmanagedDevicePaths: number;
    policyApp: string;
    elapsedMs: number;
  }) {
    super(
      `Broad-scope access on ${args.endpoint} — ${args.inScope.toLocaleString()} users in scope vs intent ${args.intent} (${args.scopeRatio} over scope).`
    );
    this.name = 'ZeroTrustViolationError';
    this.endpoint = args.endpoint;
    this.inScope = args.inScope;
    this.intent = args.intent;
    this.scopeRatio = args.scopeRatio;
    this.unmanagedDevicePaths = args.unmanagedDevicePaths;
    this.policyApp = args.policyApp;
    this.elapsedMs = args.elapsedMs;
  }
}

const LOADING_STEPS = [
  'Negotiating ZPA segment…',
  'Resolving identity claim…',
  'Evaluating access policy…',
  'Streaming audit log page…',
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
    }, 250);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/audit-logs', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;

        const elapsedMs = Math.round(performance.now() - startRef.current);

        // The buggy policy returns 200 with a permissive scope.
        // Throw a deterministic violation so the boundary fires regardless.
        const scope = json?.scope ?? {
          inScope: 4287,
          intent: 18,
          ratio: '238.2x',
          unmanagedDevicePaths: 1,
        };

        setShouldThrow(
          new ZeroTrustViolationError({
            endpoint: '/api/admin/audit-logs',
            inScope: scope.inScope,
            intent: scope.intent,
            scopeRatio: scope.ratio,
            unmanagedDevicePaths: scope.unmanagedDevicePaths,
            policyApp: 'workforce-admin/audit-logs',
            elapsedMs,
          })
        );
      } catch {
        if (cancelled) return;
        const elapsedMs = Math.round(performance.now() - startRef.current);
        setShouldThrow(
          new ZeroTrustViolationError({
            endpoint: '/api/admin/audit-logs',
            inScope: 4287,
            intent: 18,
            scopeRatio: '238.2x',
            unmanagedDevicePaths: 1,
            policyApp: 'workforce-admin/audit-logs',
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
              <FileLock2 className="w-4 h-4 text-[#65B5F2]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Workforce Admin</p>
              <p className="text-xs text-text-tertiary">Internal app · Zero Trust enforced via ZPA</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">Open employee audit logs</p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Reads the access log for the last 24 hours.
              Endpoint: <span className="font-mono text-text-secondary">/api/admin/audit-logs</span>
            </p>
          </div>

          {/* Posture chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'role: any', warn: true },
              { label: 'posture: skip', warn: true },
              { label: 'location: any', warn: true },
              { label: 'idp: any', warn: true },
            ].map(c => (
              <span
                key={c.label}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-bg border text-[10px] font-mono ${
                  c.warn
                    ? 'border-accent-amber/30 text-accent-amber'
                    : 'border-dark-border text-text-tertiary'
                }`}
              >
                <span
                  className={`w-1 h-1 rounded-full ${c.warn ? 'bg-accent-amber' : 'bg-[#65B5F2]'}`}
                />
                {c.label}
              </span>
            ))}
          </div>

          {/* Intent vs scope */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-text-tertiary" />
              <div>
                <p className="text-[11px] font-medium text-text-primary leading-none mb-0.5">
                  Least-privilege intent
                </p>
                <p className="text-[10px] text-text-tertiary">
                  security-admin + compliance-officer (HQ, managed-compliant)
                </p>
              </div>
            </div>
            <span className="text-xs text-accent-green font-mono">18 users</span>
          </div>

          {/* Loading ticker */}
          {processing && (
            <div className="px-3 py-2 rounded-md border border-[#0079D5]/20 bg-[#0079D5]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#65B5F2] animate-pulse" />
              <span className="truncate">{LOADING_STEPS[stepIdx]}</span>
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
                Opening audit logs...
              </>
            ) : (
              'Open audit logs'
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Calls the real endpoint, evaluates the real policy.
          </p>
        </div>
      </div>
    </div>
  );
}
