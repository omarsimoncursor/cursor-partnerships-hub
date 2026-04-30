'use client';

import { useEffect, useRef, useState } from 'react';
import { GitPullRequest, Loader2, Play, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { CustomerRecord } from '@/lib/demo/customer-store';
import { VulnerabilityExposureError } from './customer-profile-card';

/**
 * The trigger card. Visually a clean GitHub-style PR row with one button.
 *
 * Under the hood it still hits the real exploit endpoint so the leak is
 * real, but everything visually noisy in v2 (the 5-stage spine, the SDK
 * code line, the icon row) is gone. The only thing the buyer sees is:
 *
 *   PR #214 · feat: add internal customer lookup
 *   [ Run security check ]
 */

const INJECTION_PAYLOAD = `' || '1'=='1`;
const HOLD_AFTER_LEAK_MS = 1600;

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
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-2xl border overflow-hidden shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
        style={{ background: 'rgb(var(--dark-surface))', borderColor: 'rgb(var(--dark-border))' }}
      >
        {/* PR header */}
        <div
          className="px-5 py-3.5 border-b flex items-center gap-3"
          style={{ background: 'rgb(var(--dark-bg))', borderColor: 'rgb(var(--dark-border))' }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(76,68,203,0.15)', border: '1px solid rgba(76,68,203,0.30)' }}
          >
            <GitPullRequest className="w-4 h-4" style={{ color: '#9F98FF' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-mono mb-0.5" style={{ color: '#7C7CA0' }}>
              Pull request #214
            </p>
            <p className="text-sm font-medium text-text-primary truncate">
              feat: add internal customer lookup
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Live status */}
          {response ? (
            <CheckRow
              icon={<ShieldAlert className="w-4 h-4" />}
              tone="red"
              title="Security check failed"
              detail={`The new lookup leaked ${response.matched} customer records to a single crafted request.`}
            />
          ) : processing ? (
            <CheckRow
              icon={<Loader2 className="w-4 h-4 animate-spin" />}
              tone="amber"
              title="Running security check"
              detail="Cursor is replaying the AppSec test against this pull request."
            />
          ) : (
            <CheckRow
              icon={<ShieldCheck className="w-4 h-4" />}
              tone="neutral"
              title="Security check pending"
              detail="Click below to run the pre-merge security check before this PR can merge."
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
                Running security check...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run security check
              </>
            )}
          </button>

          <p className="text-[11px] text-center" style={{ color: '#7C7CA0' }}>
            The leak is real, not simulated.
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
      className="rounded-lg border p-3.5 flex gap-3"
      style={{ background: accent.bg, borderColor: accent.border }}
    >
      <div className="shrink-0 mt-0.5" style={{ color: accent.color }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: accent.color }}>
          {title}
        </p>
        <p className="text-[12.5px] mt-0.5" style={{ color: '#9FA0BC' }}>
          {detail}
        </p>
      </div>
    </div>
  );
}
