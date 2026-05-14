'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  ExternalLink,
  Inbox,
  Linkedin,
  Loader2,
  Mail,
  MailOpen,
  Pencil,
  RefreshCw,
  Reply,
  Search,
  Send,
  X,
} from 'lucide-react';
import { SequenceEditModal, type EditableSequenceProspect } from './sequence-edit-modal';
import { LinkedinSendDialog, type LinkedinSendTarget } from './linkedin-send-dialog';

// Row shape returned by GET /api/chatgtm/prospects?include=opens.
// Only the columns the dashboard actually renders or sends back via
// PATCH are typed here; extra fields on the wire are tolerated.
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
  linkedin_url: string | null;
  linkedin_draft: string | null;
  mcp_detail: string | null;
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
  // "LinkedIn outreach pending" filter — drives the dashboard's
  // primary manual-workflow loop. The rep filters to "everyone who
  // has a draft + URL but hasn't been DM'd yet" and works through
  // them with the Send LI button.
  const [liPendingOnly, setLiPendingOnly] = useState(false);
  const [editTarget, setEditTarget] = useState<SequenceRow | null>(null);
  // The LinkedIn send dialog targets a single row at a time. We
  // capture the row by id so we can re-derive the latest data on
  // every render (in case the row is mutated by the inline toggle
  // while the dialog is open).
  const [liTargetId, setLiTargetId] = useState<string | null>(null);
  // Per-row "operation in flight" lock. Drives the spinner on the
  // inline toggles + advance button so the rep can't double-click and
  // create a race on the same row.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Apply a partial update to a single row in local state. Used after
  // a successful PATCH so the UI reflects the change without
  // re-fetching the whole list.
  const mergeRow = (id: string, patch: Partial<SequenceRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  // Inline PATCH driver. Sends the patch via the strict outreach
  // endpoint and merges the returned prospect into local state. Any
  // server validation error gets surfaced via the inline-error
  // banner above the table.
  const patchProspect = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    setInlineError(null);
    try {
      const res = await fetch(`/api/chatgtm/prospects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(patch),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fieldHint = typeof body?.field === 'string' ? `${body.field}: ` : '';
        setInlineError(fieldHint + (body?.message || body?.detail || `Save failed (${res.status})`));
        return;
      }
      const updated = body?.prospect as Partial<SequenceRow> | undefined;
      if (updated) {
        mergeRow(id, updated);
      } else {
        // The single-prospect PATCH always echoes the row back, but
        // be defensive: drop straight to the local merge so the UI
        // still reflects the user's intent.
        mergeRow(id, patch as Partial<SequenceRow>);
      }
    } catch (err) {
      setInlineError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const todayUtc = () => new Date().toISOString().slice(0, 10);

  // Toggle the replied flag. When turning replied on we also clear the
  // would-be next-send (the API derives that anyway from
  // last_sequence_sent + replied, so no extra payload needed).
  const toggleReplied = (p: SequenceRow) => patchProspect(p.id, { replied: !p.replied });

  const toggleLinkedinSent = (p: SequenceRow) =>
    patchProspect(p.id, { linkedin_sent: !p.linkedin_sent });

  // "Advance to next email" button: bumps last_sequence_sent by 1
  // (capped at 6) and stamps last_email_send_date with today (UTC).
  // This is the single most common action a rep takes on this tab,
  // so a one-click affordance saves a lot of modal-clicking.
  const advanceStep = (p: SequenceRow) => {
    const next = Math.min(6, (p.last_sequence_sent ?? 0) + 1);
    return patchProspect(p.id, {
      last_sequence_sent: next,
      last_email_send_date: todayUtc(),
    });
  };

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

  // A row "needs LinkedIn outreach" when there's a profile URL to
  // open, the message hasn't been sent yet, and the prospect hasn't
  // already replied (sending after a reply is just noise).
  const needsLinkedinOutreach = (r: SequenceRow): boolean =>
    Boolean(r.linkedin_url) && !r.linkedin_sent && !r.replied;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (companyFilter && r.company_name !== companyFilter) return false;
      if (statusFilter && statusOf(r) !== statusFilter) return false;
      if (openedOnly && (r.unlocked_view_count ?? 0) === 0) return false;
      if (liPendingOnly && !needsLinkedinOutreach(r)) return false;
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
  }, [rows, search, companyFilter, statusFilter, openedOnly, liPendingOnly]);

  const counts = useMemo(() => {
    const c = {
      total: rows.length,
      not_started: 0,
      active: 0,
      complete: 0,
      replied: 0,
      opened: 0,
      li_pending: 0,
    };
    for (const r of rows) {
      c[statusOf(r)] += 1;
      if ((r.unlocked_view_count ?? 0) > 0) c.opened += 1;
      if (needsLinkedinOutreach(r)) c.li_pending += 1;
    }
    return c;
  }, [rows]);

  // Re-derive the LinkedIn dialog target from the canonical rows
  // array on every render, so any inline pill toggle / batch update
  // that mutates the row is reflected inside the open dialog.
  const liTarget = liTargetId ? rows.find((r) => r.id === liTargetId) ?? null : null;

  return (
    <div>
      {/* Top-level counts strip — gives the rep a 2-second read on
          the state of every account before they touch any filter.
          The LI tile is clickable: it toggles the same filter as the
          "LI pending" filter chip below. */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <CountTile label="Prospects" value={counts.total} icon={<Inbox className="w-3.5 h-3.5" />} />
        <CountTile label="Not started" value={counts.not_started} icon={<Circle className="w-3.5 h-3.5" />} tone="muted" />
        <CountTile label="In sequence" value={counts.active} icon={<Send className="w-3.5 h-3.5" />} tone="blue" />
        <CountTile label="Replied" value={counts.replied} icon={<Reply className="w-3.5 h-3.5" />} tone="green" />
        <CountTile label="Opened demo" value={counts.opened} icon={<MailOpen className="w-3.5 h-3.5" />} tone="amber" />
        <CountTile
          label="LI pending"
          value={counts.li_pending}
          icon={<Linkedin className="w-3.5 h-3.5" />}
          tone="linkedin"
          active={liPendingOnly}
          onClick={() => setLiPendingOnly((v) => !v)}
        />
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

        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors ${
            liPendingOnly
              ? 'bg-[#0a66c2]/15 border-[#0a66c2]/40 text-[#9ec5f1]'
              : 'bg-dark-surface border-dark-border text-text-secondary hover:border-dark-border-hover'
          }`}
          title="Show only prospects with a LinkedIn URL whose connection request hasn't been sent yet (and who haven't replied)."
        >
          <Linkedin className="w-3.5 h-3.5" />
          <input
            type="checkbox"
            checked={liPendingOnly}
            onChange={(e) => setLiPendingOnly(e.target.checked)}
            className="accent-[#0a66c2]"
          />
          LI pending
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

      {inlineError && (
        <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red mb-4 flex items-start justify-between gap-2">
          <span>{inlineError}</span>
          <button
            onClick={() => setInlineError(null)}
            className="p-0.5 text-accent-red hover:opacity-80"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {editTarget && (
        <SequenceEditModal
          prospect={editTarget as EditableSequenceProspect}
          apiToken={apiToken}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}

      {liTarget && (
        <LinkedinSendDialog
          prospect={liTarget as LinkedinSendTarget}
          apiToken={apiToken}
          onClose={() => setLiTargetId(null)}
          onUpdated={(patch) => mergeRow(liTarget.id, patch as Partial<SequenceRow>)}
        />
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
                <th className="text-left px-4 py-3">Flags</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <SequenceRowView
                  key={p.id}
                  p={p}
                  busy={busyId === p.id}
                  onAdvance={() => advanceStep(p)}
                  onToggleReplied={() => toggleReplied(p)}
                  onToggleLinkedinSent={() => toggleLinkedinSent(p)}
                  onEdit={() => setEditTarget(p)}
                  onLinkedinSend={() => setLiTargetId(p.id)}
                />
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

function SequenceRowView({
  p,
  busy,
  onAdvance,
  onToggleReplied,
  onToggleLinkedinSent,
  onEdit,
  onLinkedinSend,
}: {
  p: SequenceRow;
  busy: boolean;
  onAdvance: () => void;
  onToggleReplied: () => void;
  onToggleLinkedinSent: () => void;
  onEdit: () => void;
  onLinkedinSend: () => void;
}) {
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

  // The "advance" button is only useful when a next email is actually
  // due. Disable it for replied / sequence-complete prospects so the
  // affordance can't accidentally jump the state machine.
  const canAdvance = !p.replied && (p.last_sequence_sent ?? 0) < 6;

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
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-1.5">
          <InlineToggle
            label="Replied"
            on={p.replied}
            disabled={busy}
            onClick={onToggleReplied}
            accent="green"
            icon={<Reply className="w-3 h-3" />}
          />
          <InlineToggle
            label="LinkedIn"
            on={p.linkedin_sent}
            disabled={busy}
            onClick={onToggleLinkedinSent}
            accent="blue"
            icon={<Linkedin className="w-3 h-3" />}
          />
        </div>
      </td>
      <td className="px-4 py-3 align-top text-right">
        <div className="inline-flex items-center gap-1 justify-end">
          <LinkedinSendButton p={p} busy={busy} onClick={onLinkedinSend} />
          <button
            type="button"
            onClick={onAdvance}
            disabled={busy || !canAdvance}
            title={
              canAdvance
                ? `Mark Email ${(p.last_sequence_sent ?? 0) + 1} sent today`
                : p.replied
                ? 'Prospect already replied'
                : 'Sequence complete'
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-dark-border hover:border-accent-blue hover:text-accent-blue text-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            +1<ChevronRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            title="Edit sequence state"
            className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors disabled:opacity-40"
            aria-label="Edit sequence state"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <a
            href={`/p/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Open the personalized demo"
            className="p-1.5 rounded text-text-tertiary hover:text-accent-blue transition-colors"
            aria-label="Open demo"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </td>
    </tr>
  );
}

// Per-row LinkedIn outreach affordance. Three visual states:
//
//   - "Send LI" (primary blue, LinkedIn icon) — when the row has a
//     URL, no send yet, no reply. This is the canonical CTA: clicking
//     it opens LinkedinSendDialog where the rep can preview / edit
//     the draft, copy + open LinkedIn, and confirm-as-sent.
//
//   - "Sent" (muted, with check) — when linkedin_sent = true. Still
//     clickable so the rep can re-open the dialog, re-send, or
//     mark-as-unsent. The dialog renders a "already sent" banner.
//
//   - Disabled with tooltip — when linkedin_url is missing. The rep
//     needs to open the prospect Edit modal to add the URL first.
//
// Tooltips on every variant explain the state so the rep doesn't
// need to guess why a button is disabled.
function LinkedinSendButton({
  p,
  busy,
  onClick,
}: {
  p: SequenceRow;
  busy: boolean;
  onClick: () => void;
}) {
  const noUrl = !p.linkedin_url;
  if (p.linkedin_sent) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        title="LinkedIn message already sent. Click to re-open the dialog (re-send, edit draft, or undo)."
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-accent-green/30 text-accent-green hover:bg-accent-green/10 transition-colors disabled:opacity-40"
      >
        <Linkedin className="w-3 h-3" />
        Sent
        <Check className="w-3 h-3" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || noUrl}
      title={
        noUrl
          ? 'No LinkedIn URL on file. Add one via the prospect Edit modal first.'
          : 'Open the LinkedIn outreach dialog: preview/edit draft, copy to clipboard, and open LinkedIn in a new tab.'
      }
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-[#0a66c2] text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Linkedin className="w-3 h-3" />
      Send LI
    </button>
  );
}

function InlineToggle({
  label,
  on,
  disabled,
  onClick,
  accent,
  icon,
}: {
  label: string;
  on: boolean;
  disabled: boolean;
  onClick: () => void;
  accent: 'green' | 'blue';
  icon: React.ReactNode;
}) {
  // Visual: pill-shaped chip that's filled when on, outlined when
  // off. Click flips it. Disabled state suppresses the hover paint
  // so the rep doesn't think their click registered.
  const onClass =
    accent === 'green'
      ? 'bg-accent-green/15 border-accent-green/40 text-accent-green'
      : 'bg-accent-blue/15 border-accent-blue/40 text-accent-blue';
  const offClass =
    'border-dark-border text-text-tertiary hover:border-dark-border-hover hover:text-text-secondary';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        on ? onClass : offClass
      }`}
    >
      {icon}
      {label}
      {on && <Check className="w-3 h-3" />}
    </button>
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
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: 'default' | 'muted' | 'blue' | 'green' | 'amber' | 'linkedin';
  // When `onClick` is set the tile becomes a button that mirrors a
  // filter chip. `active` paints the border + label in the tone color
  // so it's obvious the filter is engaged.
  active?: boolean;
  onClick?: () => void;
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
      : tone === 'linkedin'
      ? 'text-[#9ec5f1]'
      : 'text-text-primary';
  const activeBorderClass =
    tone === 'linkedin'
      ? 'border-[#0a66c2]/60 bg-[#0a66c2]/10'
      : 'border-accent-blue/60 bg-accent-blue/10';
  const className = `rounded-xl border p-3 text-left w-full transition-colors ${
    active
      ? activeBorderClass
      : onClick
      ? 'border-dark-border bg-dark-surface hover:border-dark-border-hover'
      : 'border-dark-border bg-dark-surface'
  }`;
  const inner = (
    <>
      <p className={`text-[10px] uppercase tracking-wider font-mono inline-flex items-center gap-1.5 ${toneClass}`}>
        {icon}
        {label}
      </p>
      <p className="text-2xl font-semibold text-text-primary tabular-nums mt-1">{value}</p>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={className}>
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}
