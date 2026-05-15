'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { EditProspectModal, type EditableProspect } from './edit-modal';
import { ActivityModal } from './activity-modal';
import { AnalyticsTab } from './analytics-tab';
import { CreateProspectModal } from './create-modal';
import { SequencesTab } from './sequences-tab';
import { Pager, paginate } from './pager';

// Legacy localStorage key — left unchanged when the route moved
// from /prospect-builder/admin to /admin so existing reps don't
// have to re-paste their CHATGTM_API_TOKEN. The string is only
// referenced here and in the (now-removed) save-prospect-panel.
const TOKEN_STORAGE_KEY = 'cursor.prospect-builder.api-token';

type ProspectRow = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  level_normalized: string;
  level_raw: string | null;
  linkedin_url: string | null;
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
  // The personalized-demo password. Returned by the ChatGTM list
  // endpoint as `demo_password` (post the outreach-tracking
  // migration); the older `password` field is kept here as a fallback
  // in case the admin is loaded against a stale build.
  demo_password: string | null;
  password?: string;
  metadata?: Record<string, unknown>;
  build_status: 'queued' | 'building' | 'ready' | 'failed';
  build_started_at: string | null;
  build_completed_at: string | null;
  build_error: string | null;
  created_at: string;
};

const PAGE_SIZE = 25;

export function AdminClient() {
  const [apiToken, setApiToken] = useState('');
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ProspectRow | null>(null);
  const [activityTarget, setActivityTarget] = useState<ProspectRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'prospects' | 'sequences' | 'analytics'>('prospects');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setApiToken(window.localStorage.getItem(TOKEN_STORAGE_KEY) || '');
    setTokenLoaded(true);
  }, []);

  useEffect(() => {
    if (!tokenLoaded) return;
    if (apiToken) window.localStorage.setItem(TOKEN_STORAGE_KEY, apiToken);
  }, [apiToken, tokenLoaded]);

  // Reset to page 1 whenever the active filter set changes — paging
  // through stale results after a filter change is just confusing.
  useEffect(() => {
    setPage(0);
  }, [query, companyFilter]);

  // Unique companies for the filter dropdown. Built off the loaded
  // dataset so reps only see companies they actually have prospects
  // for.
  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const p of prospects) set.add(p.company_name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [prospects]);

  // Client-side filter: cheap to run since the listing endpoint caps
  // at 200 rows. Matches name / email / company / slug / level / raw
  // level, case-insensitive, AND-ed with the company filter.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prospects.filter((p) => {
      if (companyFilter && p.company_name !== companyFilter) return false;
      if (!q) return true;
      const hay = [
        p.name,
        p.email || '',
        p.company_name,
        p.company_domain,
        p.slug,
        p.level_raw || '',
        p.level_normalized,
      ]
        .join('\u0001')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [prospects, query, companyFilter]);

  const { totalPages, currentPage, pageStart, visible } = paginate(filtered, page, PAGE_SIZE);

  const signOut = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setApiToken('');
    setProspects([]);
    setError(null);
  };

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

  const handleDelete = async (p: ProspectRow) => {
    const confirmed = window.confirm(
      `Delete the demo for ${p.name} at ${p.company_name}?\n\nThis removes the URL ${window.location.origin}/p/${p.slug} permanently, along with every view + event recorded for them. This cannot be undone.`,
    );
    if (!confirmed) return;
    setDeleting(p.id);
    try {
      const res = await fetch(`/api/chatgtm/prospects/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiToken.trim()}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.detail || `Delete failed (${res.status})`);
        return;
      }
      setProspects((prev) => prev.filter((x) => x.id !== p.id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to hub
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-tertiary font-mono">Saved prospects</span>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/admin/auth', { method: 'DELETE' });
                } catch {
                  // best effort — fall through to reload regardless
                }
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-red border border-dark-border hover:border-accent-red/40 rounded-md px-2 py-1 transition-colors"
              title="Sign out of the admin (clears the password session cookie)"
            >
              <LogOut className="w-3 h-3" />
              Lock
            </button>
          </div>
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

          {/* First-time setup: prompt for the token. After it's saved we
              never show the field again — a small sign-out affordance in
              the controls row handles "I want to clear / rotate". */}
          {tokenLoaded && !apiToken && (
            <SignInCard
              onSubmit={(value) => {
                setApiToken(value);
                // Let the apiToken-change effect persist to localStorage,
                // then load on the next tick.
                setTimeout(() => load(), 0);
              }}
            />
          )}

          {/* Tab strip — only visible after the API token is set, since
              every tab consumes that token. */}
          {apiToken && (
            <div className="flex items-center gap-1 border-b border-dark-border mb-6">
              <TabButton
                active={activeTab === 'prospects'}
                onClick={() => setActiveTab('prospects')}
                label="Prospects"
              />
              <TabButton
                active={activeTab === 'sequences'}
                onClick={() => setActiveTab('sequences')}
                label="Sequences"
              />
              <TabButton
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
                label="Analytics"
              />
              <Link
                href="/outreach/dashboard"
                className="px-3 py-2 text-sm font-medium border-b-2 border-transparent text-text-tertiary hover:text-text-primary transition-colors inline-flex items-center gap-1.5"
                title="Open the territory outreach dashboard (intent-signal driven)"
              >
                Outreach
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {apiToken && activeTab === 'sequences' && <SequencesTab apiToken={apiToken.trim()} />}

          {apiToken && activeTab === 'analytics' && <AnalyticsTab apiToken={apiToken.trim()} />}

          {apiToken && activeTab === 'prospects' && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[260px] flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
                <Search className="w-4 h-4 text-text-tertiary shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, company, slug, or level\u2026"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-0.5 text-text-tertiary hover:text-text-primary"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none transition-colors min-w-[180px]"
              >
                <option value="">All companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent-blue text-dark-bg transition-all hover:opacity-90"
                title="Generate a personalized demo for a new prospect"
              >
                <UserPlus className="w-4 h-4" />
                New prospect
              </button>

              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-dark-border hover:bg-dark-surface transition-colors disabled:opacity-50"
                title="Reload"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Reload
              </button>

              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover transition-colors"
                title="Sign out (forget the saved API token)"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}

          {apiToken && activeTab === 'prospects' && error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red mb-4">
              {error}
            </div>
          )}

          {apiToken && activeTab === 'prospects' && prospects.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
              <p className="text-sm text-text-secondary">No prospects yet. ChatGTM will populate this list as it pushes records.</p>
            </div>
          )}

          {/* Result-count + page summary */}
          {apiToken && activeTab === 'prospects' && prospects.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-1 text-[11px] font-mono text-text-tertiary">
              <span>
                {filtered.length === prospects.length
                  ? `${prospects.length} prospect${prospects.length === 1 ? '' : 's'}`
                  : `${filtered.length} of ${prospects.length} match${filtered.length === 1 ? 'es' : 'es'}`}
              </span>
              {totalPages > 1 && (
                <span>
                  Page {currentPage + 1} of {totalPages}
                </span>
              )}
            </div>
          )}

          {showCreateModal && (
            <CreateProspectModal
              apiToken={apiToken.trim()}
              onClose={() => setShowCreateModal(false)}
              onCreated={load}
            />
          )}

          {editTarget && (
            <EditProspectModal
              prospect={editTarget as EditableProspect}
              apiToken={apiToken.trim()}
              onClose={() => setEditTarget(null)}
              onSaved={load}
            />
          )}

          {activityTarget && (
            <ActivityModal
              prospect={{
                id: activityTarget.id,
                slug: activityTarget.slug,
                name: activityTarget.name,
                company_name: activityTarget.company_name,
              }}
              apiToken={apiToken.trim()}
              onClose={() => setActivityTarget(null)}
            />
          )}

          {activeTab === 'prospects' && prospects.length > 0 && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
              <p className="text-sm text-text-secondary">
                No matches for &ldquo;{query}&rdquo;{companyFilter ? ` in ${companyFilter}` : ''}.
              </p>
              <div className="flex justify-center gap-2 mt-3">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-xs text-accent-blue hover:underline"
                  >
                    Clear search
                  </button>
                )}
                {companyFilter && (
                  <button
                    onClick={() => setCompanyFilter('')}
                    className="text-xs text-accent-blue hover:underline"
                  >
                    Clear company filter
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prospects' && filtered.length > 0 && (
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
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
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
                        <PasswordCell password={p.demo_password ?? p.password ?? ''} />
                      </td>
                      <td className="px-4 py-3 align-top text-[11px] text-text-tertiary tabular-nums">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActivityTarget(p)}
                            className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors"
                            aria-label="View activity"
                            title="Activity timeline"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditTarget(p)}
                            className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors"
                            aria-label="Edit prospect"
                            title="Edit prospect"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deleting === p.id}
                            className="p-1.5 rounded text-text-tertiary hover:text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-50"
                            aria-label="Delete prospect"
                            title="Delete prospect"
                          >
                            {deleting === p.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'prospects' && (
            <Pager
              page={currentPage}
              totalPages={totalPages}
              pageStart={pageStart}
              pageSize={PAGE_SIZE}
              totalItems={filtered.length}
              onPage={setPage}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * First-time setup card. Once the rep saves a token it lives in
 * localStorage and this card disappears — the controls row above the
 * table shows a small "Sign out" button instead, so the token is never
 * surfaced in the UI after the initial setup.
 */
function SignInCard({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
      className="glass-card p-6 mb-6 max-w-xl mx-auto"
    >
      <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-1.5 inline-flex items-center gap-1.5">
        <KeyRound className="w-3 h-3" />
        Sign in
      </p>
      <h2 className="text-base font-semibold text-text-primary mb-1">Enter your CHATGTM API token</h2>
      <p className="text-[12px] text-text-secondary mb-4 leading-snug">
        The token is the value of <code className="text-accent-amber font-mono">CHATGTM_API_TOKEN</code> from
        the deployment env. It&apos;s stored only in this browser&apos;s localStorage.
      </p>
      <input
        type="password"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="cgtm_..."
        spellCheck={false}
        className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors font-mono"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-accent-blue text-dark-bg disabled:opacity-50"
      >
        Save token
      </button>
    </form>
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

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-accent-blue text-text-primary'
          : 'border-transparent text-text-tertiary hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
}
