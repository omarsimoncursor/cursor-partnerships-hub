'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const TOKEN_STORAGE_KEY = 'cursor.prospect-builder.api-token';

type ProspectRow = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  level_normalized: string;
  level_raw: string | null;
  company_name: string;
  company_domain: string;
  company_accent: string | null;
  vendor_ids: string[];
  unmatched_technologies: string[];
  show_roi_calculator: boolean;
  mcp_relevant: boolean;
  sdk_workflow: string | null;
  gmail_draft_link: string | null;
  linkedin_message_link: string | null;
  source: string;
  password: string;
  build_status: 'queued' | 'building' | 'ready' | 'failed';
  build_started_at: string | null;
  build_completed_at: string | null;
  build_error: string | null;
  created_at: string;
};

export default function AdminProspectsPage() {
  const [apiToken, setApiToken] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setApiToken(window.localStorage.getItem(TOKEN_STORAGE_KEY) || '');
    setTokenLoaded(true);
  }, []);

  useEffect(() => {
    if (!tokenLoaded) return;
    if (apiToken) window.localStorage.setItem(TOKEN_STORAGE_KEY, apiToken);
  }, [apiToken, tokenLoaded]);

  const load = async () => {
    if (!apiToken.trim()) {
      setError('Enter the CHATGTM_API_TOKEN to load prospects.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chatgtm/prospects?limit=200&include=password', {
        headers: { Authorization: `Bearer ${apiToken.trim()}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) setError('Token rejected.');
        else if (res.status === 503) setError(body?.detail || 'Database not configured.');
        else setError(body?.detail || `Load failed (${res.status}).`);
        return;
      }
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when a token is already present.
  useEffect(() => {
    if (tokenLoaded && apiToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenLoaded]);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/prospect-builder"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to builder
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Saved prospects</span>
        </div>
      </nav>

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-[11px] font-mono uppercase tracking-wider text-accent-amber mb-4">
              <Sparkles className="w-3 h-3" />
              Internal admin view
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Personalized demos created via ChatGTM.
            </h1>
            <p className="text-base text-text-secondary">
              All prospects ChatGTM has pushed via <code className="text-accent-amber font-mono">POST /api/chatgtm/prospects</code> as well as
              demos created from this builder. Click into any row to preview the demo as the prospect would see it.
            </p>
          </div>

          <div className="glass-card p-4 mb-6 flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[260px]">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-text-tertiary mb-1.5 inline-flex items-center gap-1.5">
                <KeyRound className="w-3 h-3" />
                CHATGTM_API_TOKEN
              </span>
              <input
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="cgtm_..."
                spellCheck={false}
                type="password"
                className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors font-mono"
              />
            </label>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-dark-border hover:bg-dark-surface transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Loading\u2026' : 'Reload'}
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red mb-4">
              {error}
            </div>
          )}

          {prospects.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
              <p className="text-sm text-text-secondary">No prospects yet. ChatGTM will populate this list as it pushes records.</p>
            </div>
          )}

          {prospects.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-dark-border bg-dark-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border text-[11px] uppercase tracking-wider font-mono text-text-tertiary">
                    <th className="text-left px-4 py-3">Prospect</th>
                    <th className="text-left px-4 py-3">Company</th>
                    <th className="text-left px-4 py-3">Level</th>
                    <th className="text-left px-4 py-3">Vendors</th>
                    <th className="text-left px-4 py-3">ROI</th>
                    <th className="text-left px-4 py-3">Build</th>
                    <th className="text-left px-4 py-3">Demo</th>
                    <th className="text-left px-4 py-3">Password</th>
                    <th className="text-left px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((p) => (
                    <tr key={p.id} className="border-b border-dark-border/60 hover:bg-dark-surface-hover transition-colors">
                      <td className="px-4 py-3 align-top">
                        <p className="text-text-primary font-medium">{p.name}</p>
                        {p.email && <p className="text-[11px] text-text-tertiary">{p.email}</p>}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-text-primary">{p.company_name}</p>
                        <p className="text-[11px] text-text-tertiary font-mono">{p.company_domain}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider"
                          style={{
                            background: 'rgba(96,165,250,0.12)',
                            color: '#93c5fd',
                          }}
                        >
                          {p.level_normalized}
                        </span>
                        {p.level_raw && p.level_raw.toLowerCase() !== p.level_normalized && (
                          <p className="text-[10px] text-text-tertiary mt-1">{p.level_raw}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-[11px] text-text-secondary">
                          {p.vendor_ids.length} matched
                          {p.unmatched_technologies.length > 0 && (
                            <span className="text-text-tertiary"> · {p.unmatched_technologies.length} SDK</span>
                          )}
                        </p>
                        <p className="text-[10px] text-text-tertiary truncate max-w-[180px]">{p.vendor_ids.join(', ') || '—'}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`text-xs ${p.show_roi_calculator ? 'text-accent-green' : 'text-text-tertiary'}`}>
                          {p.show_roi_calculator ? 'Shown' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <BuildBadge status={p.build_status} error={p.build_error} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <a
                          href={`/p/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent-blue hover:underline"
                        >
                          /p/{p.slug}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <PasswordCell password={p.password} />
                      </td>
                      <td className="px-4 py-3 align-top text-[11px] text-text-tertiary tabular-nums">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BuildBadge({
  status,
  error,
}: {
  status: 'queued' | 'building' | 'ready' | 'failed';
  error?: string | null;
}) {
  const meta: Record<typeof status, { color: string; bg: string; label: string }> = {
    queued: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'Queued' },
    building: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Building' },
    ready: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'Ready' },
    failed: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Failed' },
  };
  const m = meta[status];
  return (
    <div title={error || ''}>
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider"
        style={{ background: m.bg, color: m.color }}
      >
        {m.label}
      </span>
    </div>
  );
}

function PasswordCell({ password }: { password: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard restrictions
    }
  };

  // Render a fixed-width dot mask so the column doesn't change width when
  // toggling reveal — keeps the table tidy.
  const masked = '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs text-text-primary tabular-nums select-all min-w-[7ch]">
        {revealed ? password : masked}
      </span>
      <button
        onClick={() => setRevealed((r) => !r)}
        className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label={revealed ? 'Hide password' : 'Show password'}
        title={revealed ? 'Hide' : 'Reveal'}
      >
        {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={onCopy}
        className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Copy password"
        title="Copy"
        style={copied ? { color: '#4ade80' } : undefined}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
