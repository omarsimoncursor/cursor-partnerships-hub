'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Flame,
  Linkedin,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { LinkedinSendDialog, type LinkedinSendTarget } from './linkedin-send-dialog';
import { IntentEmailEditModal, type IntentEmailTarget } from './intent-email-edit-modal';
import { Pager, paginate } from './pager';

const PAGE_SIZE = 50;

export type IntentRow = {
  id: string;
  full_name: string;
  title: string;
  work_email: string | null;
  linkedin_url: string | null;
  account_display_name: string;
  account_name: string;
  account_mau: number | null;
  signal_types: string[];
  signal_latest_at: string;
  priority_tier_value: 'hot' | 'warm' | 'nurture';
  priority_rationale: string | null;
  is_power_user: boolean;
  prior_employer_match_count: number;
  cursor_user_id: string | null;
  agent_requests_l30d: number | null;
  plan_type_value: string | null;
  last_active_at: string | null;
  linkedin_message: string | null;
  linkedin_sent: boolean;
  email_subject: string | null;
  email_body: string | null;
  email_status: string;
  email_flagged_to_send: boolean;
  email_sent_at: string | null;
  run_date?: string;
};

const PRIORITY_CLASS: Record<IntentRow['priority_tier_value'], string> = {
  hot: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  warm: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  nurture: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
};

type Props = { apiToken: string };

export function IntentDataTab({ apiToken }: Props) {
  const [rows, setRows] = useState<IntentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [liPendingOnly, setLiPendingOnly] = useState(false);
  const [emailFlaggedOnly, setEmailFlaggedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [liTargetId, setLiTargetId] = useState<string | null>(null);
  const [emailTarget, setEmailTarget] = useState<IntentRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/outreach/contacts?since_days=30&limit=1000', {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message || body?.detail || `Load failed (${res.status})`);
        return;
      }
      setRows((body.contacts ?? []) as IntentRow[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(r.account_display_name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (companyFilter && r.account_display_name !== companyFilter) return false;
      if (priorityFilter && r.priority_tier_value !== priorityFilter) return false;
      if (liPendingOnly && (r.linkedin_sent || !r.linkedin_url || !r.linkedin_message)) return false;
      if (emailFlaggedOnly && (!r.email_flagged_to_send || r.email_sent_at)) return false;
      if (!q) return true;
      const hay = [
        r.full_name,
        r.work_email,
        r.title,
        r.account_display_name,
        r.account_name,
        r.priority_rationale,
        ...r.signal_types,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, companyFilter, priorityFilter, liPendingOnly, emailFlaggedOnly]);

  const { currentPage, totalPages, pageStart, visible } = paginate(filtered, page, PAGE_SIZE);

  const mergeRow = (id: string, patch: Partial<IntentRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const patchContact = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    setInlineError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${id}`, {
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
        return false;
      }
      const updated = body?.contact as Partial<IntentRow> | undefined;
      if (updated) mergeRow(id, updated);
      return true;
    } catch (err) {
      setInlineError((err as Error).message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const liTarget = liTargetId ? rows.find((r) => r.id === liTargetId) ?? null : null;

  const stats = useMemo(
    () => ({
      total: rows.length,
      hot: rows.filter((r) => r.priority_tier_value === 'hot').length,
      liPending: rows.filter((r) => r.linkedin_url && r.linkedin_message && !r.linkedin_sent).length,
      emailQueued: rows.filter((r) => r.email_flagged_to_send && !r.email_sent_at).length,
    }),
    [rows],
  );

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatTile label="Contacts (30d)" value={stats.total} />
        <StatTile label="Hot" value={stats.hot} tone="red" />
        <StatTile
          label="LI pending"
          value={stats.liPending}
          tone="linkedin"
          active={liPendingOnly}
          onClick={() => setLiPendingOnly((v) => !v)}
        />
        <StatTile
          label="Email queued"
          value={stats.emailQueued}
          tone="blue"
          active={emailFlaggedOnly}
          onClick={() => setEmailFlaggedOnly((v) => !v)}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus-within:border-accent-blue transition-colors">
          <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, account, signals…"
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
          className="px-3 py-2 rounded-md bg-dark-surface border border-dark-border text-sm text-text-primary outline-none min-w-[160px]"
        >
          <option value="">All accounts</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-md bg-dark-surface border border-dark-border text-sm text-text-primary outline-none min-w-[120px]"
        >
          <option value="">All priority</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="nurture">Nurture</option>
        </select>

        <button
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-dark-border hover:bg-dark-surface transition-colors disabled:opacity-50"
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
        <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red mb-4 flex justify-between gap-2">
          <span>{inlineError}</span>
          <button onClick={() => setInlineError(null)} className="text-accent-red" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {liTarget && (
        <LinkedinSendDialog
          mode="intent"
          prospect={{
            id: liTarget.id,
            name: liTarget.full_name,
            company_name: liTarget.account_display_name,
            linkedin_url: liTarget.linkedin_url,
            linkedin_message: liTarget.linkedin_message,
            linkedin_sent: liTarget.linkedin_sent,
          } satisfies LinkedinSendTarget}
          apiToken={apiToken}
          onClose={() => setLiTargetId(null)}
          onUpdated={(patch) => mergeRow(liTarget.id, patch as Partial<IntentRow>)}
        />
      )}

      {emailTarget && (
        <IntentEmailEditModal
          contact={emailTarget as IntentEmailTarget}
          apiToken={apiToken}
          onClose={() => setEmailTarget(null)}
          onSaved={(patch) => {
            mergeRow(emailTarget.id, patch);
            setEmailTarget(null);
          }}
        />
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-dark-border p-10 text-center">
          <p className="text-sm text-text-secondary">
            No intent contacts yet. Once the ChatGTM Intent Signal automation POSTs a run, contacts land here.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-dark-border bg-dark-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-[11px] uppercase tracking-wider font-mono text-text-tertiary">
                <th className="text-left px-3 py-2.5">Contact</th>
                <th className="text-left px-3 py-2.5">Signals</th>
                <th className="text-left px-3 py-2.5">Priority</th>
                <th className="text-left px-3 py-2.5 min-w-[200px]">Context</th>
                <th className="text-left px-3 py-2.5">LinkedIn</th>
                <th className="text-left px-3 py-2.5">Email</th>
                <th className="text-left px-3 py-2.5">Signal</th>
                <th className="text-right px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <IntentRowView
                  key={r.id}
                  r={r}
                  busy={busyId === r.id}
                  onToggleLinkedin={() => void patchContact(r.id, { linkedin_sent: !r.linkedin_sent })}
                  onToggleEmailFlag={() =>
                    void patchContact(r.id, { email_flagged_to_send: !r.email_flagged_to_send })
                  }
                  onLinkedinSend={() => setLiTargetId(r.id)}
                  onEditEmail={() => setEmailTarget(r)}
                />
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-3">
            <Pager
              page={currentPage}
              totalPages={totalPages}
              pageStart={pageStart}
              pageSize={PAGE_SIZE}
              totalItems={filtered.length}
              onPage={setPage}
            />
          </div>
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

function IntentRowView({
  r,
  busy,
  onToggleLinkedin,
  onToggleEmailFlag,
  onLinkedinSend,
  onEditEmail,
}: {
  r: IntentRow;
  busy: boolean;
  onToggleLinkedin: () => void;
  onToggleEmailFlag: () => void;
  onLinkedinSend: () => void;
  onEditEmail: () => void;
}) {
  const signalShort = new Date(r.signal_latest_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const hasWorkEmail = Boolean(r.work_email);
  const hasEmailDraft = Boolean(r.work_email && r.email_body);
  const emailSent = r.email_sent_at != null;
  const usageParts: string[] = [];
  if (r.cursor_user_id) usageParts.push('Cursor user');
  if (r.agent_requests_l30d != null && r.agent_requests_l30d > 0) {
    usageParts.push(`${r.agent_requests_l30d} agent req${r.agent_requests_l30d === 1 ? '' : 's'}`);
  }
  if (r.plan_type_value) usageParts.push(r.plan_type_value);
  if (r.last_active_at) {
    usageParts.push(
      `active ${new Date(r.last_active_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    );
  }
  if (r.account_mau != null) usageParts.push(`acct MAU ${r.account_mau}`);

  return (
    <tr className="border-b border-dark-border/60 hover:bg-dark-surface-hover transition-colors">
      <td className="px-3 py-2 align-top min-w-[180px]">
        <p className="text-text-primary font-medium text-[13px] leading-tight">{r.full_name}</p>
        <p className="text-[10px] text-text-tertiary leading-tight mt-0.5">{r.title}</p>
        <p className="text-[10px] text-text-tertiary truncate max-w-[220px]">
          {hasWorkEmail ? (
            r.work_email
          ) : (
            <span className="italic" title="No employer-matched work email — use LinkedIn outreach">
              no work email
            </span>
          )}
        </p>
        <p className="text-[10px] text-text-tertiary">
          {r.account_display_name}
          {r.account_name !== r.account_display_name && (
            <span className="opacity-70"> · {r.account_name}</span>
          )}
        </p>
        {usageParts.length > 0 && (
          <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{usageParts.join(' · ')}</p>
        )}
      </td>
      <td className="px-3 py-2 align-top max-w-[140px]">
        <div className="flex flex-wrap gap-1">
          {r.signal_types.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-dark-bg border border-dark-border text-text-tertiary"
            >
              {s.replace(/_/g, ' ')}
            </span>
          ))}
          {r.signal_types.length > 3 && (
            <span className="text-[9px] text-text-tertiary">+{r.signal_types.length - 3}</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 align-top">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${PRIORITY_CLASS[r.priority_tier_value]}`}
        >
          {r.priority_tier_value === 'hot' && <Flame className="w-3 h-3" />}
          {r.priority_tier_value}
        </span>
      </td>
      <td className="px-3 py-2 align-top max-w-[280px]">
        {r.priority_rationale ? (
          <p className="text-[10px] text-text-secondary leading-snug line-clamp-4" title={r.priority_rationale}>
            {r.priority_rationale}
          </p>
        ) : (
          <span className="text-[10px] text-text-tertiary italic">—</span>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {r.is_power_user && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-accent-amber/15 text-accent-amber border border-accent-amber/30 inline-flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />
              POWER
            </span>
          )}
          {r.prior_employer_match_count > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-accent-blue/15 text-accent-blue border border-accent-blue/30 inline-flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              ALUMNI
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 align-top">
        <FlagToggle
          label="Sent"
          on={r.linkedin_sent}
          disabled={busy}
          onClick={onToggleLinkedin}
          icon={<Linkedin className="w-3 h-3" />}
          accent="blue"
        />
      </td>
      <td className="px-3 py-2 align-top min-w-[120px]">
        {hasEmailDraft ? (
          <div className="space-y-1">
            <p className="text-[10px] text-text-secondary truncate max-w-[160px]" title={r.email_subject ?? ''}>
              {r.email_subject || <span className="italic text-text-tertiary">(no subject)</span>}
            </p>
            {emailSent ? (
              <span className="text-[10px] text-accent-green font-mono">SENT</span>
            ) : (
              <FlagToggle
                label="Send"
                on={r.email_flagged_to_send}
                disabled={busy}
                onClick={onToggleEmailFlag}
                icon={<Send className="w-3 h-3" />}
                accent="green"
              />
            )}
          </div>
        ) : (
          <span
            className="text-[10px] text-text-tertiary italic"
            title={r.email_status === 'no_work_email' ? 'ChatGTM found no employer-matched work email' : undefined}
          >
            {r.email_status === 'no_work_email' ? 'LI only' : '—'}
          </span>
        )}
      </td>
      <td className="px-3 py-2 align-top text-[11px] tabular-nums text-text-secondary whitespace-nowrap">
        {signalShort}
      </td>
      <td className="px-3 py-2 align-top text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          <LinkedinSendButton r={r} busy={busy} onClick={onLinkedinSend} />
          {hasEmailDraft && !emailSent && (
            <button
              type="button"
              onClick={onEditEmail}
              disabled={busy}
              title="Edit email draft"
              className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover disabled:opacity-40"
              aria-label="Edit email"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function LinkedinSendButton({
  r,
  busy,
  onClick,
}: {
  r: IntentRow;
  busy: boolean;
  onClick: () => void;
}) {
  const noUrl = !r.linkedin_url;
  const noDraft = !r.linkedin_message;
  if (r.linkedin_sent) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-accent-green/30 text-accent-green hover:bg-accent-green/10 disabled:opacity-40"
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
      disabled={busy || noUrl || noDraft}
      title={
        noUrl
          ? 'No LinkedIn URL'
          : noDraft
          ? 'No LinkedIn message from ChatGTM'
          : 'Copy message and open LinkedIn'
      }
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-[#0a66c2] text-white hover:opacity-90 disabled:opacity-30"
    >
      <Linkedin className="w-3 h-3" />
      Send LI
    </button>
  );
}

function FlagToggle({
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
  const onClass =
    accent === 'green'
      ? 'bg-accent-green/15 border-accent-green/40 text-accent-green'
      : 'bg-accent-blue/15 border-accent-blue/40 text-accent-blue';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors disabled:opacity-50 ${
        on ? onClass : 'border-dark-border text-text-tertiary hover:text-text-secondary'
      }`}
    >
      {icon}
      {label}
      {on && <Check className="w-2.5 h-2.5" />}
    </button>
  );
}

function StatTile({
  label,
  value,
  tone = 'default',
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'red' | 'blue' | 'linkedin';
  active?: boolean;
  onClick?: () => void;
}) {
  const toneClass =
    tone === 'red'
      ? 'text-accent-red'
      : tone === 'blue'
      ? 'text-accent-blue'
      : tone === 'linkedin'
      ? 'text-[#9ec5f1]'
      : 'text-text-primary';
  const className = `rounded-xl border p-3 text-left w-full transition-colors ${
    active ? 'border-accent-blue/60 bg-accent-blue/10' : 'border-dark-border bg-dark-surface hover:border-dark-border-hover'
  }`;
  const inner = (
    <>
      <p className={`text-[10px] uppercase tracking-wider font-mono ${toneClass}`}>{label}</p>
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
