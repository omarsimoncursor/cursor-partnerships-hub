'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { AccountLogo } from '@/components/prospect/account-logo';
import { AuroraBackdrop } from '@/components/prospect/aurora-backdrop';

type Props = {
  slug: string;
  prospectName: string;
  company: string;
  domain: string;
  accent: string;
  initialStatus: 'queued' | 'building' | 'failed';
};

const POLL_INTERVAL_MS = 1500;
// If the build hasn't completed in this many ms we let the user
// continue anyway — the demo will render with whatever fallbacks are
// available (logo lookup happens client-side regardless).
const MAX_WAIT_MS = 60_000;

export function BuildingState({ slug, prospectName, company, domain, accent, initialStatus }: Props) {
  const [status, setStatus] = useState<'queued' | 'building' | 'ready' | 'failed'>(initialStatus);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t0 = Date.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/p/${slug}/status`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setStatus(data.build_status);
          setElapsed(Date.now() - t0);
          if (data.build_status === 'ready') {
            // Hard reload so the server-rendered demo replaces this client tree.
            window.location.href = `/p/${slug}`;
            return;
          }
          if (data.build_status === 'failed') {
            setError(data.build_error || 'Build failed.');
          }
        }
      } catch {
        // ignore transient network errors; we'll retry on the next tick
      }
      if (cancelled) return;
      if (Date.now() - t0 > MAX_WAIT_MS) {
        // Fall through: reload anyway. The demo will render with whatever
        // assets we have; logos still load client-side.
        window.location.href = `/p/${slug}?bypass=1`;
        return;
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    timer = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [slug]);

  const isFailed = status === 'failed';
  const seconds = Math.max(1, Math.round(elapsed / 1000));
  // Cap the visual progress at 95% until we actually flip to ready, so
  // the bar never lies about being "done".
  const progressPct = Math.min(95, 18 + (seconds / 12) * 60);

  return (
    <div className="min-h-screen relative">
      <AuroraBackdrop accent={accent} />

      <main className="min-h-screen px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <AccountLogo domain={domain} account={company} accent={accent} size={56} />
            <span className="text-text-tertiary text-2xl font-thin">{'\u00d7'}</span>
            <AccountLogo domain="cursor.com" account="Cursor" accent="#edecec" size={56} />
          </div>

          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-mono mb-5 border"
            style={{ background: `${accent}14`, color: accent, borderColor: `${accent}33` }}
          >
            <Sparkles className="w-3 h-3" />
            Personalized Cursor demo
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-[1.1] tracking-tight">
            Preparing your demo for{' '}
            <span
              style={{
                backgroundImage: `linear-gradient(120deg, ${accent} 0%, ${accent}c0 60%, ${accent}80 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {prospectName}
            </span>
            .
          </h1>
          <p className="text-base text-text-secondary mt-3 max-w-md">
            Your interactive Cursor walkthrough for {company} is being assembled. This usually takes a few seconds.
          </p>

          <div
            className="mt-8 rounded-2xl border bg-dark-surface p-6"
            style={{ borderColor: `${accent}40` }}
          >
            <div className="flex items-center gap-3 mb-4">
              {isFailed ? (
                <CheckCircle2 className="w-5 h-5 text-accent-amber" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: accent }} />
              )}
              <p className="text-sm text-text-primary font-medium">
                {status === 'queued' && 'Queued'}
                {status === 'building' && 'Building your personalized demo'}
                {status === 'ready' && 'Ready, redirecting\u2026'}
                {status === 'failed' && 'Recovering from a hiccup'}
              </p>
              <span className="ml-auto text-[11px] font-mono text-text-tertiary tabular-nums">{seconds}s</span>
            </div>

            <div className="h-1.5 rounded-full bg-dark-bg overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${accent}55, ${accent})`,
                }}
              />
            </div>

            <ul className="mt-4 space-y-1.5 text-[11px] text-text-tertiary leading-snug">
              <BuildStep label="Loading the prospect record" done={true} />
              <BuildStep label={`Pre-warming the ${company} brand assets`} done={status === 'ready' || seconds > 1} active={status === 'building' && seconds <= 2} />
              <BuildStep label="Personalizing the integration matrix" done={status === 'ready' || seconds > 3} active={status === 'building' && seconds > 1 && seconds <= 4} />
              <BuildStep label="Composing the SDK workflow stage" done={status === 'ready' || seconds > 5} active={status === 'building' && seconds > 3 && seconds <= 6} />
            </ul>

            {isFailed && (
              <div
                className="mt-4 rounded-md border px-3 py-2 text-[11px] leading-snug"
                style={{ borderColor: '#fbbf2440', background: '#fbbf240a', color: '#fbbf24' }}
              >
                {error || 'The build hit an issue but we\u2019ll keep retrying in the background. The demo will still render with safe fallbacks.'}
              </div>
            )}
          </div>

          <p className="text-[11px] text-text-tertiary mt-6 leading-relaxed">
            This page refreshes automatically the moment your demo is ready.
          </p>
        </div>
      </main>
    </div>
  );
}

function BuildStep({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: done ? '#4ade80' : active ? 'currentColor' : 'rgba(237,236,236,0.18)',
        }}
      />
      <span className={done ? 'text-text-secondary line-through opacity-60' : active ? 'text-text-primary' : ''}>
        {label}
      </span>
    </li>
  );
}
