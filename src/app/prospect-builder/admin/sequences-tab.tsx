'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  RefreshCw,
  Reply,
  Search,
  Send,
  X,
} from 'lucide-react';

// Row shape returned by GET /api/chatgtm/prospects?include=opens.
// Only the columns the dashboard actually renders are typed here;
// extra fields on the wire are tolerated.
type SequenceRow = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  company_name: string;
  company_domain: string;
  level_normalized: string;
  classified_level: string | null;
  team: string | null;
  thread_id: string | null;
  last_sequence_sent: number | null;
  last_email_send_date: string | null;
  next_email_send_date: string | null;
  replied: boolean;
  linkedin_sent: boolean;
  unlocked_view_count?: number;
  first_unlocked_at?: string | null;
  last_unlocked_at?: string | null;
  created_at: string;
};

type SequenceStatus = 'not_started' | 'active' | 'complete' | 'replied';

function statusOf(p: SequenceRow): SequenceStatus {
  if (p.replied) return 'replied';
  const step = p.last_sequence_sent;
  if (step == null) return 'not_started';
  if (step >= 6) return 'complete';
  return 'active';
}

const STATUS_LABEL: Record<SequenceStatus, string> = {
  not_started: 'Not started',
  active: 'In sequence',
  complete: 'Sequence complete',
  replied: 'Replied',
};

const STATUS_BADGE_CLASS: Record<SequenceStatus, string> = {
  not_started: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
  active: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  complete: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
  replied: 'bg-accent-green/10 text-accent-green border-accent-green/30',
};

type Props = { apiToken: string };

export function SequencesTab({ apiToken }: Props) {
  const [rows, setRows] = useState<SequenceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SequenceStatus | ''>('');
  const [openedOnly, setOpenedOnly] = useState(false);

  const load = async () => {
    if (!apiToken) return;
    setLoading(true);
    setError(null);
    try {
      // Walk the cursor page-by-page until next_cursor is null. The
      // dashboard wants the full set so the rep can scan / filter
      // client-side without round-tripping per filter change.
      const collected: SequenceRow[] = [];
      let cursor: string | null = null;
      // Hard cap on iterations so a runaway dataset can't pin the
      // browser. 50 pages * 200/page = 10k rows; well above the real
      // working set.
      for (let i = 0; i < 50; i += 1) {
        const url = new URL('/api/chatgtm/prospects', window.location.origin);
        url.searchParams.set('include', 'opens');
        url.searchParams.set('limit', '200');
        if (cursor) url.searchParams.set('cursor', cursor);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiToken}` },
          cache: 'no-store',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 401) setError('Token rejected.');
          else setError(body?.detail || `Load failed (${res.status}).`);
          return;
        }
        const data = await res.json();
        for (const p of data.prospects as SequenceRow[]) collected.push(p);
        cursor = data.next_cursor ?? null;
        if (!cursor) break;
      }
      setRows(collected);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiToken]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(r.company_name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (companyFilter && r.company_name !== companyFilter) return false;
      if (statusFilter && statusOf(r) !== statusFilter) return false;
      if (openedOnly && (r.unlocked_view_count ?? 0) === 0) return false;
      if (!q) return true;
      const hay = [
        r.name,
        r.email || '',
        r.company_name,
        r.company_domain,
        r.thread_id || '',
        r.team || '',
        r.classified_level || '',
      ]
        .join('\u0001')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, companyFilter, statusFilter, openedOnly]);

  const counts = useMemo(() => {
    const c = { total: rows.length, not_started: 0, active: 0, complete: 0, replied: 0, opened: 0 };
    for (const r of rows) {
      c[statusOf(r)] += 1;
      if ((r.unlocked_view_count ?? 0) > 0) c.opened += 1;
    }
    return c;
  }, [rows]);

  return (
    <div>
      {/* Top-level counts strip — gives the rep a 2-second read on
          the state of every account before they touch any filter. */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <CountTile label="Prospects" value={counts.total} icon={<Inbox className="w-3.5 h-3.5" />} />
        <CountTile label="Not started" value={counts.not_started} icon={<Circle className="w-3.5 h-3.5" />} tone="muted" />
        <CountTile label="In sequence" value={counts.active} icon={<Send className="w-3.5 h-3.5" />} tone="blue" />
        <CountTile label="Replied" value={counts.replied} icon={<Reply className="w-3.5 h-3.5" />} tone="green" />
        <CountTile label="Opened demo" value={counts.opened} icon={<MailOpen className="w-3.5 h-3.5" />} tone="amber" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[260px] flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
          <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company, thread id…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-0.5 text-text-tertiary hover:text-text-primary" aria-label="Clear">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none transition-colors min-w-[160px]"
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SequenceStatus | '')}
          className="px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none transition-colors min-w-[160px]"
        >
          <option value="">Any status</option>
          <option value="not_started">Not started</option>
          <option value="active">In sequence</option>
          <option value="complete">Sequence complete</option>
          <option value="replied">Replied</option>
        </select>

        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={openedOnly}
            onChange={(e) => setOpenedOnly(e.target.checked)}
            className="accent-accent-amber"
          />
          Opened only
        </label>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-dark-border hover:bg-dark-surface transition-colors disabled:opacity-50"
          title="Reload"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Reload
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red mb-4">
          {error}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
          <p className="text-sm text-text-secondary">
            No prospects yet. Once ChatGTM pushes records (or you create one in the Prospects tab), the email-sequence state will land here.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-dark-border bg-dark-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-[11px] uppercase tracking-wider font-mono text-text-tertiary">
                <th className="text-left px-4 py-3">Prospect</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Step</th>
                <th className="text-left px-4 py-3">Last sent</th>
                <th className="text-left px-4 py-3">Next send</th>
                <th className="text-left px-4 py-3">Thread</th>
                <th className="text-left px-4 py-3">Demo opened</th>
                <th className="text-right px-4 py-3">Demo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <SequenceRowView key={p.id} p={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
          <p className="text-sm text-text-secondary">No matches for the current filters.</p>
        </div>
      )}
    </div>
  );
}

function SequenceRowView({ p }: { p: SequenceRow }) {
  const status = statusOf(p);
  const opened = (p.unlocked_view_count ?? 0) > 0;
  const lastOpenedShort = opened && p.last_unlocked_at
    ? new Date(p.last_unlocked_at).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  // The "next send" cell paints overdue (next ≤ today and we have a
  // last-send) in red so the rep knows the sequence has slipped.
  const today = new Date().toISOString().slice(0, 10);
  const nextDate = p.next_email_send_date;
  const overdue = nextDate != null && status === 'active' && nextDate <= today;
  const readyToSend = nextDate != null && status === 'not_started';

  return (
    <tr className="border-b border-dark-border/60 hover:bg-dark-surface-hover transition-colors">
      <td className="px-4 py-3 align-top">
        <p className="text-text-primary font-medium">{p.name}</p>
        <p className="text-[11px] text-text-tertiary">
          {p.email || <span className="italic">no email</span>}
        </p>
        <p className="text-[10px] text-text-tertiary">
          {p.company_name}
          {p.team && <span> · {p.team}</span>}
        </p>
      </td>
      <td className="px-4 py-3 align-top">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${STATUS_BADGE_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </td>
      <td className="px-4 py-3 align-top">
        <StepIndicator step={p.last_sequence_sent} replied={p.replied} />
      </td>
      <td className="px-4 py-3 align-top text-[12px] tabular-nums text-text-secondary">
        {p.last_email_send_date || <span className="text-text-tertiary">—</span>}
      </td>
      <td className="px-4 py-3 align-top text-[12px] tabular-nums">
        {nextDate ? (
          <span
            className={
              overdue
                ? 'text-accent-red font-medium'
                : readyToSend
                ? 'text-accent-blue'
                : 'text-text-secondary'
            }
            title={
              overdue
                ? 'Past due — sequence has slipped'
                : readyToSend
                ? 'Ready to send Email 1'
                : ''
            }
          >
            {nextDate}
          </span>
        ) : (
          <span className="text-text-tertiary">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        {p.thread_id ? (
          <ThreadIdCell value={p.thread_id} />
        ) : (
          <span className="text-text-tertiary text-[11px] italic">none</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        {opened ? (
          <div className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber" />
            <div>
              <p className="text-[11px] text-text-primary leading-tight">
                Opened
                {p.unlocked_view_count != null && p.unlocked_view_count > 1 && (
                  <span className="text-text-tertiary"> ({p.unlocked_view_count}×)</span>
                )}
              </p>
              {lastOpenedShort && (
                <p className="text-[10px] text-text-tertiary leading-tight">{lastOpenedShort}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-text-tertiary text-[11px]">
            <Mail className="w-3.5 h-3.5" />
            Unread
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top text-right">
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
    </tr>
  );
}

function StepIndicator({ step, replied }: { step: number | null; replied: boolean }) {
  // Render N out of 6 dots filled. When the prospect replied we show
  // a single "Replied" pip instead of the dot row to make that state
  // visually impossible to miss.
  if (replied) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-accent-green font-mono">
        <Reply className="w-3 h-3" />
        REPLIED
      </span>
    );
  }
  const filled = step ?? 0;
  return (
    <div className="inline-flex items-center gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          aria-hidden
          className={`block h-1.5 w-3 rounded-full ${
            i <= filled ? 'bg-accent-blue' : 'bg-dark-border'
          }`}
        />
      ))}
      <span className="text-[11px] tabular-nums text-text-tertiary ml-1 font-mono">
        {filled}/6
      </span>
    </div>
  );
}

function ThreadIdCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  // Truncate long thread ids with a middle ellipsis so the table
  // doesn't blow out on Gmail's 24-char hex ids.
  const display = value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore clipboard restrictions
    }
  };
  return (
    <button
      onClick={onCopy}
      title={copied ? 'Copied!' : `Copy thread id: ${value}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] text-text-secondary hover:text-text-primary hover:bg-dark-surface-hover border border-dark-border transition-colors"
    >
      {display}
      {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3 text-text-tertiary" />}
    </button>
  );
}

function CountTile({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: 'default' | 'muted' | 'blue' | 'green' | 'amber';
}) {
  const toneClass =
    tone === 'blue'
      ? 'text-accent-blue'
      : tone === 'green'
      ? 'text-accent-green'
      : tone === 'amber'
      ? 'text-accent-amber'
      : tone === 'muted'
      ? 'text-text-tertiary'
      : 'text-text-primary';
  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-3">
      <p className={`text-[10px] uppercase tracking-wider font-mono inline-flex items-center gap-1.5 ${toneClass}`}>
        {icon}
        {label}
      </p>
      <p className="text-2xl font-semibold text-text-primary tabular-nums mt-1">{value}</p>
    </div>
  );
}
