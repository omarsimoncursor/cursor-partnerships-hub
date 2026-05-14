'use client';

import { useState } from 'react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

/**
 * Password gate for `/admin`. The actual password is never sent to
 * the browser — we POST what the user types to `/api/admin/auth`
 * and the server compares against ADMIN_PASSWORD (env, defaulting
 * to a fixed value baked into the server route).
 *
 * This component receives no password-related prop, so the value can
 * never leak through React server-component serialization.
 */
export function AdminGate() {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) {
        // Reload so the server component re-runs and reads the new
        // session cookie.
        window.location.reload();
        return;
      }
      if (res.status === 401) {
        setError('Incorrect password.');
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || 'Sign-in failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-[11px] font-mono uppercase tracking-wider text-accent-amber mb-5">
          <Sparkles className="w-3 h-3" />
          Internal admin
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Sign in to continue.</h1>
        <p className="text-sm text-text-secondary mb-6">
          The admin view is password-protected. The same password unlocks all admin functions
          (prospect list, edit / delete, analytics).
        </p>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-dark-border bg-dark-surface p-6 space-y-4"
        >
          <label className="block">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary mb-2 inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Admin password
            </span>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              spellCheck={false}
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-md bg-dark-bg border border-dark-border focus:border-accent-blue text-base text-text-primary outline-none transition-colors font-mono"
            />
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
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-semibold disabled:opacity-50 transition-all bg-accent-blue text-dark-bg"
          >
            {submitting ? 'Signing in\u2026' : 'Sign in'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
