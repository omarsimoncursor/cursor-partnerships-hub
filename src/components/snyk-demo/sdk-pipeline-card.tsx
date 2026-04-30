'use client';

import { useEffect, useRef, useState } from 'react';
import { GitPullRequest, Loader2, ShieldAlert, ShieldCheck, Play } from 'lucide-react';
import type { CustomerRecord } from '@/lib/demo/customer-store';
import { ShiftLeftStages } from './shift-left-stages';
import { VulnerabilityExposureError } from './customer-profile-card';

/**
 * Pre-merge security gate trigger card. Replaces v1's `CustomerProfileCard`
 * visual framing — but uses the same exploit fetch under the hood, so the
 * leak is still real.
 *
 * The card looks like a CI status panel in a code-review UI: PR header,
 * 5-stage shift-left progress, the SDK call that runs Stage 3, and a
 * `Run pre-merge security check` button.
 */

const INJECTION_PAYLOAD = `' || '1'=='1`;
const HOLD_AFTER_LEAK_MS = 1800;

interface LookupResponse {
  matched: number;
  records: CustomerRecord[];
}

export function SDKPipelineCard() {
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

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'rgb(var(--dark-surface))', borderColor: 'rgb(var(--dark-border))' }}
      >
        {/* PR header */}
        <div
          className="px-5 py-3.5 border-b flex items-center gap-3"
          style={{ background: 'rgb(var(--dark-bg))', borderColor: 'rgb(var(--dark-border))' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(76,68,203,0.15)', border: '1px solid rgba(76,68,203,0.30)' }}
          >
            <GitPullRequest className="w-4 h-4" style={{ color: '#9F98FF' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] mb-0.5" style={{ color: '#7C7CA0' }}>
              <span className="font-mono truncate">cursor-demos/cursor-for-enterprise</span>
              <span>·</span>
              <span className="font-mono">PR #214</span>
            </div>
            <p className="text-sm font-medium text-text-primary truncate">
              feat: add internal customer lookup
            </p>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background: 'rgba(76,68,203,0.15)', border: '1px solid rgba(76,68,203,0.30)', color: '#9F98FF' }}
          >
            opened by marcus.a
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* 5-stage spine */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: '#9F98FF' }}>
                Shift-left CI pipeline
              </p>
              <p className="text-[10.5px] font-mono" style={{ color: '#7C7CA0' }}>
                Stage 3 of 5
              </p>
            </div>
            <ShiftLeftStages
              active="pr-gate"
              covered={['ide', 'commit']}
              variant="card"
            />
          </div>

          {/* SDK call line */}
          <div
            className="rounded-md border overflow-hidden"
            style={{ background: '#0A0B23', borderColor: '#23264F' }}
          >
            <div
              className="px-3 py-1.5 border-b flex items-center justify-between"
              style={{ background: '#13142F', borderColor: '#23264F' }}
            >
              <span className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: '#9F98FF' }}>
                Stage 3 · Cursor SDK call
              </span>
              <span className="text-[10px] font-mono" style={{ color: '#7C7CA0' }}>
                ci/security-gate.ts
              </span>
            </div>
            <pre
              className="px-3 py-2 text-[11.5px] font-mono leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: '#C9C9E5' }}
            >
{`Agent.create({
  cloud: { repos: [{ url, prUrl }] },
  mcpServers: { snyk, jira },
}).send(buildSecurityGatePrompt(...));`}
            </pre>
          </div>

          {/* CI check status row */}
          {response ? (
            <CheckRow
              icon={<ShieldAlert className="w-4 h-4" />}
              tone="red"
              title={`security-gate · failed (${response.matched} records exposed)`}
              detail="Snyk Code · NoSQL injection (CWE-943) confirmed by exploit replay. Merge blocked."
            />
          ) : (
            <CheckRow
              icon={processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              tone={processing ? 'amber' : 'neutral'}
              title={processing ? 'security-gate · running' : 'security-gate · idle'}
              detail={
                processing
                  ? 'POST /v1/agents · Cursor SDK provisioning a cloud agent for the PR…'
                  : 'Click below to run Stage 3 against this PR.'
              }
            />
          )}

          {/* CTA */}
          <button
            onClick={() => setProcessing(true)}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-[#4C44CB] text-white font-medium text-sm
                       hover:bg-[#5C54E0] transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer
                       shadow-[0_0_24px_rgba(76,68,203,0.25)]"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running pre-merge security check...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run pre-merge security check
              </>
            )}
          </button>

          <p className="text-[11px] text-center" style={{ color: '#7C7CA0' }}>
            Calls the real endpoint &mdash; the leak is not simulated
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckRow({
  icon,
  tone,
  title,
  detail,
}: {
  icon: React.ReactNode;
  tone: 'red' | 'amber' | 'neutral';
  title: string;
  detail: string;
}) {
  const accent =
    tone === 'red'
      ? { color: '#FB7185', border: 'rgba(225,29,72,0.35)', bg: 'rgba(225,29,72,0.06)' }
      : tone === 'amber'
        ? { color: '#FBBF24', border: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.06)' }
        : { color: '#9F98FF', border: 'rgba(76,68,203,0.35)', bg: 'rgba(76,68,203,0.06)' };

  return (
    <div
      className="rounded-md border p-3 flex gap-3"
      style={{ background: accent.bg, borderColor: accent.border }}
    >
      <div className="shrink-0 mt-0.5" style={{ color: accent.color }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium" style={{ color: accent.color }}>
          {title}
        </p>
        <p className="text-[11.5px] mt-0.5" style={{ color: '#9FA0BC' }}>
          {detail}
        </p>
      </div>
    </div>
  );
}
