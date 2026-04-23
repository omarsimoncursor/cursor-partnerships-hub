'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Loader2, User } from 'lucide-react';
import type { CustomerRecord } from '@/lib/demo/customer-store';

export class VulnerabilityExposureError extends Error {
  cveId: string;
  cwe: string;
  cvss: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  endpoint: string;
  leakedRows: number;
  payload: string;
  filePath: string;

  constructor(leakedRows: number) {
    super(
      `NoSQL injection in lookupCustomerProfile leaked ${leakedRows} customer records (CWE-943, CVSS 9.8)`,
    );
    this.name = 'VulnerabilityExposureError';
    this.cveId = 'SNYK-JS-CUSTOMER-PROFILE-001';
    this.cwe = 'CWE-943';
    this.cvss = 9.8;
    this.severity = 'critical';
    this.endpoint = '/api/customer-profile/lookup';
    this.leakedRows = leakedRows;
    this.payload = `' || '1'=='1`;
    this.filePath = 'src/lib/demo/customer-profile.ts';
  }
}

const INJECTION_PAYLOAD = `' || '1'=='1`;

interface LookupResponse {
  matched: number;
  records: CustomerRecord[];
}

const HOLD_AFTER_LEAK_MS = 1800;

export function CustomerProfileCard() {
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState<LookupResponse | null>(null);
  const [shouldThrow, setShouldThrow] = useState<VulnerabilityExposureError | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!processing || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const url = `/api/customer-profile/lookup?username=${encodeURIComponent(INJECTION_PAYLOAD)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data: LookupResponse = await res.json();
        if (cancelled) return;
        setResponse(data);
        holdTimer = setTimeout(() => {
          if (cancelled) return;
          setShouldThrow(new VulnerabilityExposureError(data.matched ?? data.records.length));
        }, HOLD_AFTER_LEAK_MS);
      } catch {
        if (cancelled) return;
        setShouldThrow(new VulnerabilityExposureError(12));
      }
    })();

    return () => {
      cancelled = true;
      if (holdTimer) clearTimeout(holdTimer);
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
            <div className="w-8 h-8 rounded-lg bg-[#4C44CB]/15 border border-[#4C44CB]/30 flex items-center justify-center">
              <User className="w-4 h-4 text-[#9F98FF]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Customer Profile API</p>
              <p className="text-xs text-text-tertiary">Internal lookup tool · staging</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">Run security regression check</p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Replays the morning AppSec test against{' '}
              <span className="font-mono text-text-secondary">/api/customer-profile/lookup</span>{' '}
              with a NoSQL injection payload submitted by Snyk Code.
            </p>
          </div>

          {/* Payload preview */}
          <div className="rounded-lg border border-dark-border bg-dark-bg overflow-hidden">
            <div className="px-3 py-2 border-b border-dark-border flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                Test payload
              </span>
              <span className="text-[10px] font-mono text-text-tertiary">
                CWE-943 · NoSQL injection
              </span>
            </div>
            <pre className="px-3 py-2.5 text-[12px] font-mono text-[#9F98FF] whitespace-pre-wrap break-words">
GET /api/customer-profile/lookup
?username={INJECTION_PAYLOAD}
            </pre>
          </div>

          {/* Live response area */}
          {response ? (
            <div className="rounded-lg border border-[#E11D48]/40 bg-[#E11D48]/5 overflow-hidden">
              <div className="px-3 py-2 border-b border-[#E11D48]/40 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#FB7185] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185] animate-pulse" />
                  200 OK · {response.matched} records returned
                </span>
                <span className="text-[10px] font-mono text-[#FB7185]">leak detected</span>
              </div>
              <pre className="px-3 py-2.5 text-[11px] font-mono text-text-primary leading-relaxed max-h-40 overflow-y-auto">
{JSON.stringify(
  response.records.slice(0, 3).map(r => ({
    id: r.id,
    username: r.username,
    email: r.email,
    hashedPassword: r.hashedPassword.slice(0, 18) + '…',
    internalRole: r.internalRole,
  })),
  null,
  2,
)}
{`
… ${Math.max(0, response.records.length - 3)} more records returned`}
              </pre>
            </div>
          ) : (
            processing && (
              <div className="px-3 py-2 rounded-md border border-[#4C44CB]/25 bg-[#4C44CB]/5 font-mono text-[11px] text-text-secondary min-h-[28px] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#9F98FF] animate-pulse" />
                <span className="truncate">Hitting /api/customer-profile/lookup…</span>
              </div>
            )
          )}

          {/* CTA */}
          <button
            onClick={handleRun}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#4C44CB] text-white font-medium text-sm
                       hover:bg-[#5C54E0] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(76,68,203,0.25)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running check...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                Run check
              </>
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Calls the real endpoint &mdash; the leak is not simulated
          </p>
        </div>
      </div>
    </div>
  );
}
