'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { AccountLogo } from '@/components/prospect/account-logo';
import { AuroraBackdrop } from '@/components/prospect/aurora-backdrop';
import { configureTracker, track } from '@/lib/prospect/tracker';

type Props = {
  slug: string;
  prospectName: string;
  company: string;
  domain: string;
  accent: string;
};

export function UnlockGate({ slug, prospectName, company, domain, accent }: Props) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wire up the tracker the moment the gate renders so we can record
  // page.view (locked) + attempts.
  useEffect(() => {
    configureTracker(slug);
    track('page.view', { unlocked: false });
  }, [slug]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    setError(null);
    track('unlock.attempt');
    try {
      const res = await fetch(`/api/p/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) {
        track('unlock.success');
        // Reload to let the server render the demo with the unlock cookie set.
        window.location.href = `/p/${slug}`;
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) {
        track('unlock.failure', { reason: 'invalid_password' });
        setError('That password did not match. Check the LinkedIn message or email it was shared in.');
      } else if (res.status === 404) {
        track('unlock.failure', { reason: 'not_found' });
        setError('This demo link is no longer active. Please reach out to your Cursor contact.');
      } else {
        track('unlock.failure', { reason: 'http_error', status: res.status });
        setError(body?.detail || 'Something went wrong unlocking the demo. Please try again.');
      }
    } catch {
      track('unlock.failure', { reason: 'network_error' });
      setError('Network error reaching the demo server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = prospectName.split(/\s+/)[0] || prospectName;

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
            Personalized Demo Prepared for{' '}
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
            An interactive walkthrough of how Cursor automates work across {company}&apos;s stack. Enter the password
            from your LinkedIn message or email to continue.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 rounded-2xl border bg-dark-surface p-6 space-y-4"
            style={{ borderColor: `${accent}40` }}
          >
            <label className="block">
              <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary mb-2 inline-flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                Demo password
              </span>
              <input
                autoFocus
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`${firstName}1234`}
                className="w-full px-4 py-3 rounded-md bg-dark-bg border border-dark-border focus:border-accent-blue text-base text-text-primary placeholder:text-text-tertiary outline-none transition-colors font-mono"
              />
              <span className="block text-[11px] text-text-tertiary mt-1.5 leading-snug">
                Format: your first name followed by 4 digits, e.g. <span className="font-mono">{firstName}1234</span>
              </span>
            </label>

            {error && (
              <div
                className="rounded-md border px-3 py-2 text-xs leading-snug"
                style={{ borderColor: '#f8717140', background: '#f871710f', color: '#f87171' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !password.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              {submitting ? 'Unlocking\u2026' : 'Unlock the demo'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-text-tertiary mt-6 leading-relaxed">
            Don&apos;t have a password? Reply to the LinkedIn message or email this link came from and your Cursor
            contact will resend it.
          </p>
        </div>
      </main>
    </div>
  );
}
