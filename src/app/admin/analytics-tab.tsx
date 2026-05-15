'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownUp,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Linkedin,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import { ActivityModal } from './activity-modal';
import { Pager, paginate } from './pager';

type CompanyCount = {
  company_name: string;
  company_domain: string;
  total: number;
  opened: number;
};

type Totals = {
  total_prospects: number;
  total_opened: number;
  total_companies: number;
};

type OpenedRow = {
  id: string;
  slug: string;
  url: string;
  name: string;
  email: string | null;
  linkedin_url: string | null;
  company_name: string;
  company_domain: string;
  level_normalized: string;
  level_raw: string | null;
  reached_out_at: string | null;
  first_unlocked_at: string;
  last_unlocked_at: string;
  unlocked_view_count: number;
  // Per-prospect detail surfaced from the Prospects tab.
  vendor_ids: string[];
  unmatched_technologies: string[];
  show_roi_calculator: boolean;
  build_status: 'queued' | 'building' | 'ready' | 'failed';
  build_error: string | null;
  demo_password: string | null;
  created_at: string;
};

const PAGE_SIZE = 25;

type Props = { apiToken: string };

type SortKey = 'last_opened' | 'first_opened' | 'view_count' | 'company';

export function AnalyticsTab({ apiToken }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [companies, setCompanies] = useState<CompanyCount[]>([]);
  const [opened, setOpened] = useState<OpenedRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('last_opened');
  const [sortDesc, setSortDesc] = useState(true);
  const [companyFilter, setCompanyFilter] = useState('');
  const [hideReached, setHideReached] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [activityTarget, setActivityTarget] = useState<OpenedRow | null>(null);

  const load = async () => {
    if (!apiToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chatgtm/analytics', {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail || `Load failed (${res.status}).`);
        return;
      }
      const data = await res.json();
      setTotals(data.totals);
      setCompanies(data.companies || []);
      setOpened(data.opened || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiToken]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = opened.filter((r) => {
      if (companyFilter && r.company_name !== companyFilter) return false;
      if (hideReached && r.reached_out_at) return false;
      if (!q) return true;
      const hay = [
        r.name,
        r.email || '',
        r.company_name,
        r.linkedin_url || '',
        r.level_raw || '',
        r.level_normalized,
      ]
        .join('\u0001')
        .toLowerCase();
      return hay.includes(q);
    });

    arr = [...arr].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'last_opened':
          cmp = +new Date(a.last_unlocked_at) - +new Date(b.last_unlocked_at);
          break;
        case 'first_opened':
          cmp = +new Date(a.first_unlocked_at) - +new Date(b.first_unlocked_at);
          break;
        case 'view_count':
          cmp = a.unlocked_view_count - b.unlocked_view_count;
          break;
        case 'company':
          cmp = a.company_name.localeCompare(b.company_name);
          break;
      }
      return sortDesc ? -cmp : cmp;
    });
    return arr;
  }, [opened, companyFilter, hideReached, search, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const toggleReached = async (row: OpenedRow) => {
    const next = !row.reached_out_at;
    // Optimistic UI: update immediately so the checkbox feels instant.
    setTogglingId(row.id);
    setOpened((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, reached_out_at: next ? new Date().toISOString() : null }
          : r,
      ),
    );
    try {
      const res = await fetch(`/api/chatgtm/prospects/${row.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ reached_out: next }),
      });
      if (!res.ok) {
        // Roll back on failure.
        setOpened((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, reached_out_at: row.reached_out_at } : r,
          ),
        );
      }
    } catch {
      setOpened((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, reached_out_at: row.reached_out_at } : r,
        ),
      );
    } finally {
      setTogglingId(null);
    }
  };

  const reachedCount = useMemo(
    () => opened.filter((r) => r.reached_out_at).length,
    [opened],
  );

  // Reset to page 1 whenever the active filter / sort changes — paging
  // through stale rows after a filter change is just confusing.
  useEffect(() => {
    setPage(0);
  }, [companyFilter, hideReached, search, sortKey, sortDesc]);

  const { totalPages, currentPage, pageStart, visible } = paginate(
    filteredSorted,
    page,
    PAGE_SIZE,
  );

  return (
    <div>
      {/* Top-line stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat
          label="Total demos"
          value={totals?.total_prospects ?? 0}
          hint="across all companies"
        />
        <Stat
          label="Opened"
          value={totals?.total_opened ?? 0}
          hint={
            totals?.total_prospects
              ? `${Math.round(((totals.total_opened || 0) / totals.total_prospects) * 100)}% of total`
              : ''
          }
        />
        <Stat
          label="Companies"
          value={totals?.total_companies ?? 0}
          hint="distinct accounts"
        />
        <Stat
          label="Reached out"
          value={reachedCount}
          hint={
            opened.length
              ? `${Math.round((reachedCount / opened.length) * 100)}% of openers`
              : ''
          }
          accent="#4ade80"
        />
      </div>

      {/* Per-company breakdown */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            By company
          </h2>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover rounded-md px-2 py-1.5"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Reload
          </button>
        </div>
        <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-[11px] uppercase tracking-wider font-mono text-text-tertiary">
                <th className="text-left px-4 py-2.5">Company</th>
                <th className="text-right px-4 py-2.5">Demos generated</th>
                <th className="text-right px-4 py-2.5">Opened</th>
                <th className="text-right px-4 py-2.5">Open rate</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr
                  key={c.company_name}
                  className="border-b border-dark-border/60 hover:bg-dark-surface-hover transition-colors cursor-pointer"
                  onClick={() => setCompanyFilter((cur) => (cur === c.company_name ? '' : c.company_name))}
                >
                  <td className="px-4 py-2.5">
                    <p className="text-text-primary">{c.company_name}</p>
                    <p className="text-[11px] text-text-tertiary font-mono">{c.company_domain}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">{c.total}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-text-primary">{c.opened}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                    {c.total > 0 ? `${Math.round((c.opened / c.total) * 100)}%` : '—'}
                  </td>
                </tr>
              ))}
              {companies.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-text-tertiary text-sm">
                    No prospects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Opened-list table */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <Linkedin className="w-3 h-3" />
              Opens by date
            </h2>
            <p className="text-[11px] text-text-tertiary mt-0.5 max-w-md">
              Click the LinkedIn icon to DM each prospect. Tick the check after you&apos;ve reached out.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
              <Search className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search opens"
                className="bg-transparent text-xs text-text-primary placeholder:text-text-tertiary outline-none w-44"
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-0.5 text-text-tertiary hover:text-text-primary">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-xs text-text-primary outline-none"
            >
              <option value="">All companies</option>
              {companies.map((c) => (
                <option key={c.company_name} value={c.company_name}>
                  {c.company_name}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideReached}
                onChange={(e) => setHideReached(e.target.checked)}
              />
              Hide reached out
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red mb-3">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-dark-border bg-dark-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-[11px] uppercase tracking-wider font-mono text-text-tertiary">
                <th className="text-left px-4 py-2.5">
                  <SortHeader label="Reached" hideArrow />
                </th>
                <th className="text-left px-4 py-2.5">Prospect</th>
                <th className="text-left px-4 py-2.5">
                  <SortHeader
                    label="Company"
                    active={sortKey === 'company'}
                    desc={sortDesc}
                    onClick={() => toggleSort('company')}
                  />
                </th>
                <th className="text-left px-4 py-2.5">Vendors</th>
                <th className="text-left px-4 py-2.5">ROI</th>
                <th className="text-left px-4 py-2.5">Build</th>
                <th className="text-left px-4 py-2.5">Password</th>
                <th className="text-left px-4 py-2.5">
                  <SortHeader
                    label="Last opened"
                    active={sortKey === 'last_opened'}
                    desc={sortDesc}
                    onClick={() => toggleSort('last_opened')}
                  />
                </th>
                <th className="text-right px-4 py-2.5">
                  <SortHeader
                    label="Views"
                    active={sortKey === 'view_count'}
                    desc={sortDesc}
                    onClick={() => toggleSort('view_count')}
                  />
                </th>
                <th className="text-right px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-dark-border/60 hover:bg-dark-surface-hover transition-colors">
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => toggleReached(row)}
                      disabled={togglingId === row.id}
                      title={
                        row.reached_out_at
                          ? `Reached out ${new Date(row.reached_out_at).toLocaleString()}`
                          : 'Mark reached out'
                      }
                      className={`p-1 rounded transition-colors ${row.reached_out_at ? 'text-accent-green' : 'text-text-tertiary hover:text-text-primary'}`}
                    >
                      {togglingId === row.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : row.reached_out_at ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-text-primary">{row.name}</p>
                    <p className="text-[11px] text-text-tertiary">
                      {row.level_raw || row.level_normalized}
                      {row.email && <span className="block">{row.email}</span>}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-text-secondary">{row.company_name}</p>
                    <p className="text-[11px] text-text-tertiary font-mono">{row.company_domain}</p>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <p className="text-[11px] text-text-secondary">
                      {row.vendor_ids.length} matched
                      {row.unmatched_technologies.length > 0 && (
                        <span className="text-text-tertiary"> · {row.unmatched_technologies.length} SDK</span>
                      )}
                    </p>
                    <p className="text-[10px] text-text-tertiary truncate max-w-[180px]">
                      {row.vendor_ids.join(', ') || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <span className={`text-[11px] ${row.show_roi_calculator ? 'text-accent-green' : 'text-text-tertiary'}`}>
                      {row.show_roi_calculator ? 'Shown' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <BuildBadge status={row.build_status} error={row.build_error} />
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    {row.demo_password ? (
                      <PasswordCell password={row.demo_password} />
                    ) : (
                      <span className="text-[11px] text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-text-secondary tabular-nums align-top">
                    {fmtRelativeAndAbsolute(row.last_unlocked_at)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-text-primary align-top">
                    {row.unlocked_view_count}
                  </td>
                  <td className="px-4 py-2.5 text-right align-top">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setActivityTarget(row)}
                        title="View this prospect's activity timeline"
                        aria-label="View activity"
                        className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                      {row.linkedin_url ? (
                        <a
                          href={row.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-accent-blue hover:underline px-2 py-1 rounded-md border border-accent-blue/30 hover:bg-accent-blue/5"
                          title="Open prospect's LinkedIn profile"
                        >
                          <Linkedin className="w-3 h-3" />
                        </a>
                      ) : null}
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-primary px-2 py-1 rounded-md border border-dark-border hover:border-dark-border-hover"
                        title="Open the prospect's demo URL"
                      >
                        Demo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSorted.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-text-tertiary text-sm">
                    No opens recorded {companyFilter ? `for ${companyFilter}` : ''}
                    {hideReached ? ' (with the hide-reached filter on)' : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={currentPage}
          totalPages={totalPages}
          pageStart={pageStart}
          pageSize={PAGE_SIZE}
          totalItems={filteredSorted.length}
          onPage={setPage}
        />
      </section>

      {activityTarget && (
        <ActivityModal
          prospect={{
            id: activityTarget.id,
            slug: activityTarget.slug,
            name: activityTarget.name,
            company_name: activityTarget.company_name,
          }}
          apiToken={apiToken}
          onClose={() => setActivityTarget(null)}
        />
      )}
    </div>
  );
}

// Local copies of the BuildBadge + PasswordCell helpers from
// admin-client.tsx — duplicated rather than imported because the
// admin-client component is large and mostly Prospects-tab-specific;
// these two pieces are small enough that keeping them per-tab is
// less coupling than ripping them out into yet another shared file.
function BuildBadge({
  status,
  error,
}: {
  status: 'queued' | 'building' | 'ready' | 'failed' | string;
  error: string | null;
}) {
  const tone =
    status === 'ready' ? 'text-accent-green border-accent-green/30 bg-accent-green/5' :
    status === 'failed' ? 'text-accent-red border-accent-red/40 bg-accent-red/5' :
    status === 'building' ? 'text-accent-blue border-accent-blue/40 bg-accent-blue/5' :
    'text-text-tertiary border-dark-border bg-dark-surface';
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${tone}`}
      title={error || undefined}
    >
      {status}
    </span>
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
  // Fixed-width dot mask so toggling reveal doesn't reflow the column.
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
        {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
      <button
        onClick={onCopy}
        className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Copy password"
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? <CheckCircle2 className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
      <p className="text-[10px] uppercase tracking-wider font-mono text-text-tertiary">{label}</p>
      <p
        className="text-2xl md:text-3xl font-bold tabular-nums mt-1"
        style={{ color: accent || 'var(--color-text-primary)' }}
      >
        {value.toLocaleString()}
      </p>
      {hint && <p className="text-[11px] text-text-tertiary mt-1">{hint}</p>}
    </div>
  );
}

function SortHeader({
  label,
  active,
  desc,
  onClick,
  hideArrow,
}: {
  label: string;
  active?: boolean;
  desc?: boolean;
  onClick?: () => void;
  hideArrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1 ${active ? 'text-text-primary' : 'text-text-tertiary'} ${onClick ? 'hover:text-text-primary cursor-pointer' : ''}`}
    >
      {label}
      {!hideArrow && onClick && (
        <ArrowDownUp className="w-3 h-3" style={active ? { transform: desc ? 'rotate(0deg)' : 'rotate(180deg)' } : undefined} />
      )}
    </button>
  );
}

function fmtRelativeAndAbsolute(iso: string): React.ReactNode {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  let rel: string;
  if (diffMs < 60_000) rel = 'just now';
  else if (diffMs < 60 * 60_000) rel = `${Math.floor(diffMs / 60_000)}m ago`;
  else if (diffMs < 24 * 60 * 60_000) rel = `${Math.floor(diffMs / (60 * 60_000))}h ago`;
  else if (diffMs < 7 * 24 * 60 * 60_000) rel = `${Math.floor(diffMs / (24 * 60 * 60_000))}d ago`;
  else rel = date.toLocaleDateString();
  return (
    <>
      <span className="text-text-primary">{rel}</span>
      <span className="block text-[10px] text-text-tertiary">{date.toLocaleString()}</span>
    </>
  );
}
