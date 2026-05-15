'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Linkedin,
  Loader2,
  MessageSquare,
  Pencil,
  Sparkles,
  StickyNote,
  Undo2,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import type {
  OutreachConnectionStatus,
  OutreachContactRow,
  OutreachPriorityTier,
  OutreachSeniorityTier,
} from '@/lib/outreach-store/types';
import type { OutreachContactResponse } from '@/lib/outreach-store/presentation';

// The card props deliberately mirror the wire shape so a parent can
// pass the API response straight through. `apiToken` is needed for
// the PATCH (Mark sent / Mark replied) and the promote POST.
export type ContactCardProps = {
  contact: OutreachContactResponse;
  apiToken: string;
  // Called whenever the card mutates the contact (PATCH lifecycle,
  // promote, Save notes). The parent can patch it into local state
  // without a full refetch.
  onUpdated?: (next: OutreachContactRow) => void;
};

const PRIORITY_BADGE: Record<OutreachPriorityTier, { class: string; label: string }> = {
  hot: {
    class: 'bg-accent-red/10 text-accent-red border-accent-red/30',
    label: 'HOT',
  },
  warm: {
    class: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    label: 'WARM',
  },
  nurture: {
    class: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/30',
    label: 'NURTURE',
  },
};

const SENIORITY_BADGE: Record<OutreachSeniorityTier, string> = {
  IC: 'bg-text-tertiary/10 text-text-secondary border-text-tertiary/25',
  Executive: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  Leader: 'bg-accent-blue/5 text-accent-blue/90 border-accent-blue/20',
  Manager: 'bg-text-tertiary/10 text-text-secondary border-text-tertiary/30',
};

const STATUS_LABEL: Record<OutreachConnectionStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  accepted: 'Accepted',
  replied: 'Replied',
  closed_no_reply: 'Closed (no reply)',
  disqualified: 'Disqualified',
};

const STATUS_BADGE: Record<OutreachConnectionStatus, string> = {
  pending: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/30',
  sent: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  accepted: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
  replied: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  closed_no_reply: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/30',
  disqualified: 'bg-accent-red/10 text-accent-red border-accent-red/30',
};

export function OutreachContactCard({ contact, apiToken, onUpdated }: ContactCardProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesValue, setNotesValue] = useState(contact.omar_notes ?? '');
  const [copied, setCopied] = useState<string | null>(null);

  // Reset notes input if the prop changes (e.g. parent merged a
  // server response that updated omar_notes elsewhere).
  const lastNotesRef = useRef(contact.omar_notes ?? '');
  useEffect(() => {
    if ((contact.omar_notes ?? '') !== lastNotesRef.current) {
      setNotesValue(contact.omar_notes ?? '');
      lastNotesRef.current = contact.omar_notes ?? '';
    }
  }, [contact.omar_notes]);

  const patch = async (
    body: Record<string, unknown>,
    busyKey: string,
  ): Promise<boolean> => {
    setBusy(busyKey);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fieldHint = typeof data?.field === 'string' ? `${data.field}: ` : '';
        setError(fieldHint + (data?.message || data?.detail || `Save failed (${res.status})`));
        return false;
      }
      if (data?.contact && onUpdated) onUpdated(data.contact);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const promote = async () => {
    setBusy('promote');
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${contact.id}/promote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.detail || data?.message || `Promote failed (${res.status})`);
        return;
      }
      if (data?.contact && onUpdated) onUpdated(data.contact);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore clipboard restrictions
      }
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const isSubsidiaryNote =
    contact.is_subsidiary && contact.account_name !== contact.account_display_name
      ? contact.account_name
      : null;
  const status = contact.connection_status_value;
  const priority = contact.priority_tier_value;
  const seniority = contact.seniority_tier_value;
  const isPromoted = !!contact.promoted_to_prospect_id;
  const isPowerUser = contact.is_power_user;
  const hasPriorCustomer = (contact.previously_at_cursor_customers ?? []).length > 0;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-4 space-y-3">
      {/* Header: name / title / company / signal chips */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-text-primary font-semibold truncate">
              {contact.full_name}
            </p>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${PRIORITY_BADGE[priority].class}`}
            >
              {PRIORITY_BADGE[priority].label}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${SENIORITY_BADGE[seniority]}`}
            >
              {seniority}
            </span>
            {isPowerUser && (
              <span
                title={`Power user — ${contact.agent_requests_l30d ?? '?'} agent requests in the last 30d, plan: ${contact.plan_type_value ?? 'unknown'}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border bg-accent-blue/10 text-accent-blue border-accent-blue/30"
              >
                <Zap className="w-3 h-3" />
                POWER
              </span>
            )}
            {hasPriorCustomer && (
              <span
                title={`Previously at: ${(contact.previously_at_cursor_customers ?? []).join(', ')}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border bg-accent-amber/10 text-accent-amber border-accent-amber/30"
              >
                <Sparkles className="w-3 h-3" />
                ALUMNI
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1">{contact.title}</p>
          <p className="text-[11px] text-text-tertiary mt-0.5 inline-flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span className="font-medium text-text-secondary">
              {contact.account_display_name}
            </span>
            {isSubsidiaryNote && (
              <span className="text-text-tertiary/70"> ({isSubsidiaryNote})</span>
            )}
            {contact.location_city && (
              <span className="ml-2">
                · {contact.location_city}
                {contact.location_state ? `, ${contact.location_state}` : ''}
              </span>
            )}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${STATUS_BADGE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Signal chips + priority rationale */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {(contact.signal_types ?? []).map((t) => (
          <span
            key={t}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-dark-bg text-text-secondary border border-dark-border"
          >
            {t}
          </span>
        ))}
        {contact.account_signal_count_l7d > 0 && (
          <span
            title="Account-level signal density in the last 7 days"
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-dark-bg text-text-tertiary border border-dark-border"
          >
            {contact.account_signal_count_l7d}× / 7d
          </span>
        )}
      </div>
      {contact.priority_rationale && (
        <p className="text-[12px] text-text-secondary leading-snug bg-dark-bg/50 rounded-md px-3 py-2 border border-dark-border/50">
          {contact.priority_rationale}
        </p>
      )}

      {/* LinkedIn message preview + copy */}
      {contact.linkedin_message ? (
        <div className="rounded-md border border-dark-border bg-dark-bg/30 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <Linkedin className="w-3 h-3 text-[#9ec5f1]" />
              LinkedIn message ({contact.linkedin_char_count ?? contact.linkedin_message.length} chars)
            </p>
            <button
              type="button"
              onClick={() => copyToClipboard(contact.linkedin_message ?? '', 'linkedin')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-text-secondary hover:text-text-primary hover:bg-dark-surface-hover transition-colors"
              title="Copy the full message (prose + URL + password) to clipboard"
            >
              {copied === 'linkedin' ? (
                <Check className="w-3 h-3 text-accent-green" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied === 'linkedin' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-[12px] text-text-primary whitespace-pre-wrap break-words font-sans max-h-32 overflow-y-auto leading-snug">
            {contact.linkedin_message}
          </pre>
        </div>
      ) : (
        <div className="rounded-md border border-accent-amber/30 bg-accent-amber/5 p-3 text-[12px] text-accent-amber inline-flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            No LinkedIn message — demo session failed or skipped. Draft your own from the contact&apos;s
            LinkedIn URL below.
          </span>
        </div>
      )}

      {/* Inline meta: linkedin url, email, demo link, cross-link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
        {contact.linkedin_url && (
          <CopyChip
            label="LinkedIn"
            value={contact.linkedin_url}
            display={contact.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}
            href={contact.linkedin_url}
            copyKey="li-url"
            copied={copied === 'li-url'}
            onCopy={() => copyToClipboard(contact.linkedin_url!, 'li-url')}
          />
        )}
        {contact.work_email && (
          <CopyChip
            label="Email"
            value={contact.work_email}
            display={contact.work_email}
            copyKey="email"
            copied={copied === 'email'}
            onCopy={() => copyToClipboard(contact.work_email!, 'email')}
          />
        )}
        {contact.demo_url && (
          <CopyChip
            label="Demo URL"
            value={contact.demo_url}
            display={contact.demo_url.replace(/^https?:\/\/(www\.)?/, '')}
            href={contact.demo_url}
            copyKey="demo-url"
            copied={copied === 'demo-url'}
            onCopy={() => copyToClipboard(contact.demo_url!, 'demo-url')}
          />
        )}
        {contact.demo_password && (
          <CopyChip
            label="Demo password"
            value={contact.demo_password}
            display={contact.demo_password}
            copyKey="demo-pwd"
            copied={copied === 'demo-pwd'}
            onCopy={() => copyToClipboard(contact.demo_password!, 'demo-pwd')}
          />
        )}
        {contact.sfdc_contact_url && (
          <CopyChip
            label="SFDC"
            value={contact.sfdc_contact_url}
            display="Open in Salesforce"
            href={contact.sfdc_contact_url}
            copyKey="sfdc"
            copied={copied === 'sfdc'}
            onCopy={() => copyToClipboard(contact.sfdc_contact_url!, 'sfdc')}
          />
        )}
        {contact.last_gong_call_url && (
          <CopyChip
            label="Last Gong call"
            value={contact.last_gong_call_url}
            display={
              contact.last_gong_call_at
                ? new Date(contact.last_gong_call_at).toLocaleDateString()
                : 'Open in Gong'
            }
            href={contact.last_gong_call_url}
            copyKey="gong"
            copied={copied === 'gong'}
            onCopy={() => copyToClipboard(contact.last_gong_call_url!, 'gong')}
          />
        )}
      </div>

      {/* Cross-tab link to the cold sequence */}
      {contact.linked_prospect && (
        <div className="rounded-md border border-accent-blue/30 bg-accent-blue/5 px-3 py-2 text-[11px] text-accent-blue inline-flex items-center justify-between gap-2 w-full">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {contact.linked_prospect.via === 'promoted'
              ? 'Enrolled in cold sequence'
              : 'Already in cold sequence'}
            {contact.linked_prospect.last_sequence_sent != null && (
              <span className="text-text-secondary">
                · Step {contact.linked_prospect.last_sequence_sent}/6
              </span>
            )}
            {contact.linked_prospect.replied && (
              <span className="text-accent-green">· Replied</span>
            )}
          </span>
          <a
            href={`/p/${contact.linked_prospect.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            View demo
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Notes editor (collapsed by default) */}
      {notesOpen ? (
        <div className="rounded-md border border-dark-border bg-dark-bg/40 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <StickyNote className="w-3 h-3" />
              Notes
            </p>
            <button
              type="button"
              onClick={() => setNotesOpen(false)}
              className="p-0.5 text-text-tertiary hover:text-text-primary"
              aria-label="Close notes"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md bg-dark-bg border border-dark-border focus:border-accent-blue text-[12px] text-text-primary outline-none transition-colors resize-y"
            placeholder="Notes for yourself…"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={async () => {
                const trimmed = notesValue.trim();
                const ok = await patch(
                  { omar_notes: trimmed.length === 0 ? null : trimmed },
                  'notes',
                );
                if (ok) setNotesOpen(false);
              }}
              disabled={busy === 'notes'}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-accent-blue text-dark-bg disabled:opacity-50"
            >
              {busy === 'notes' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setNotesValue(contact.omar_notes ?? '');
                setNotesOpen(false);
              }}
              className="px-3 py-1.5 rounded-md text-xs text-text-secondary border border-dark-border hover:bg-dark-surface-hover"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : contact.omar_notes ? (
        <button
          type="button"
          onClick={() => setNotesOpen(true)}
          className="w-full text-left rounded-md border border-dark-border bg-dark-bg/30 px-3 py-2 text-[12px] text-text-secondary hover:bg-dark-surface-hover transition-colors inline-flex items-start gap-2"
        >
          <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-text-tertiary" />
          <span className="whitespace-pre-wrap">{contact.omar_notes}</span>
        </button>
      ) : null}

      {error && (
        <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red inline-flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {status === 'pending' && (
          <ActionBtn
            onClick={() => patch({ connection_status_value: 'sent' }, 'sent')}
            disabled={busy != null}
            busy={busy === 'sent'}
            tone="primary"
            icon={<Linkedin className="w-3.5 h-3.5" />}
            label="Mark sent"
          />
        )}
        {status === 'sent' && (
          <ActionBtn
            onClick={() => patch({ connection_status_value: 'accepted' }, 'accepted')}
            disabled={busy != null}
            busy={busy === 'accepted'}
            tone="amber"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            label="Mark accepted"
          />
        )}
        {(status === 'sent' || status === 'accepted') && (
          <ActionBtn
            onClick={() => patch({ connection_status_value: 'replied' }, 'replied')}
            disabled={busy != null}
            busy={busy === 'replied'}
            tone="green"
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Mark replied"
          />
        )}
        {status !== 'pending' && status !== 'replied' && status !== 'closed_no_reply' && (
          <ActionBtn
            onClick={() => patch({ connection_status_value: 'pending' }, 'undo')}
            disabled={busy != null}
            busy={busy === 'undo'}
            tone="muted"
            icon={<Undo2 className="w-3.5 h-3.5" />}
            label="Undo"
          />
        )}
        {(status === 'pending' || status === 'sent' || status === 'accepted') && (
          <ActionBtn
            onClick={() => patch({ connection_status_value: 'closed_no_reply' }, 'close')}
            disabled={busy != null}
            busy={busy === 'close'}
            tone="muted"
            icon={<X className="w-3.5 h-3.5" />}
            label="Close, no reply"
          />
        )}
        <ActionBtn
          onClick={() => patch({ connection_status_value: 'disqualified' }, 'dq')}
          disabled={busy != null || status === 'disqualified'}
          busy={busy === 'dq'}
          tone="muted"
          icon={<X className="w-3.5 h-3.5" />}
          label="DQ"
          title="Mark disqualified — wrong contact, role mismatch, etc."
        />

        <span className="flex-1" />

        <ActionBtn
          onClick={() => setNotesOpen(true)}
          disabled={busy != null || notesOpen}
          tone="muted"
          icon={<Pencil className="w-3.5 h-3.5" />}
          label={contact.omar_notes ? 'Edit notes' : 'Add notes'}
        />

        <ActionBtn
          onClick={() => promote()}
          disabled={busy != null || isPromoted}
          busy={busy === 'promote'}
          tone={isPromoted ? 'muted' : 'amber'}
          icon={<UserPlus className="w-3.5 h-3.5" />}
          label={isPromoted ? 'Enrolled' : 'Enroll in sequence'}
          title={
            isPromoted
              ? 'Already enrolled in the cold email sequence.'
              : 'Create a row in the cold-outbound prospects table so the email sequence orchestrator picks them up.'
          }
        />
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  disabled,
  busy = false,
  tone,
  icon,
  label,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  tone: 'primary' | 'green' | 'amber' | 'muted';
  icon: React.ReactNode;
  label: string;
  title?: string;
}) {
  const toneClass =
    tone === 'primary'
      ? 'bg-accent-blue text-dark-bg hover:opacity-90'
      : tone === 'green'
      ? 'bg-accent-green text-dark-bg hover:opacity-90'
      : tone === 'amber'
      ? 'bg-accent-amber text-dark-bg hover:opacity-90'
      : 'border border-dark-border text-text-secondary hover:bg-dark-surface-hover';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${toneClass}`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}

function CopyChip({
  label,
  value,
  display,
  href,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  display: string;
  href?: string;
  copyKey: string;
  copied: boolean;
  onCopy: () => void;
}) {
  void copyKey;
  void value;
  return (
    <div className="flex items-center gap-1.5 min-w-0 px-2 py-1 rounded-md bg-dark-bg/30 border border-dark-border/50">
      <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary shrink-0">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex-1 min-w-0 text-text-secondary truncate hover:text-text-primary inline-flex items-center gap-1"
          title={display}
        >
          {display}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <span className="flex-1 min-w-0 text-text-secondary truncate" title={display}>
          {display}
        </span>
      )}
      <button
        type="button"
        onClick={onCopy}
        className="p-0.5 text-text-tertiary hover:text-text-primary"
        aria-label={`Copy ${label}`}
        title={copied ? 'Copied!' : `Copy ${label}`}
      >
        {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}
