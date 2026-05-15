'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, Save, X } from 'lucide-react';

export type IntentEmailTarget = {
  id: string;
  full_name: string;
  account_display_name: string;
  work_email: string | null;
  email_subject: string | null;
  email_body: string | null;
  email_flagged_to_send: boolean;
  email_sent_at: string | null;
};

type Props = {
  contact: IntentEmailTarget;
  apiToken: string;
  onClose: () => void;
  onSaved: (patch: Partial<IntentEmailTarget>) => void;
};

export function IntentEmailEditModal({ contact, apiToken, onClose, onSaved }: Props) {
  const [subject, setSubject] = useState(contact.email_subject ?? '');
  const [body, setBody] = useState(contact.email_body ?? '');
  const [flagged, setFlagged] = useState(contact.email_flagged_to_send);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          email_subject: subject.trim() || null,
          email_body: body.trim() || null,
          email_flagged_to_send: flagged,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fieldHint = typeof data?.field === 'string' ? `${data.field}: ` : '';
        setError(fieldHint + (data?.message || data?.detail || `Save failed (${res.status})`));
        return;
      }
      const updated = data?.contact;
      onSaved({
        email_subject: updated?.email_subject ?? (subject.trim() || null),
        email_body: updated?.email_body ?? (body.trim() || null),
        email_flagged_to_send: updated?.email_flagged_to_send ?? flagged,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const sent = contact.email_sent_at != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-dark-border bg-dark-bg shadow-2xl">
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary inline-flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              One-time email
            </p>
            <h2 className="text-base font-semibold text-text-primary truncate">
              {contact.full_name}{' '}
              <span className="text-text-tertiary">— {contact.account_display_name}</span>
            </h2>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              {contact.work_email || <span className="italic text-accent-red">no work email</span>}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-4">
          {sent && (
            <div className="rounded-lg border border-accent-green/30 bg-accent-green/5 px-3 py-2 text-[12px] text-accent-green">
              Sent {new Date(contact.email_sent_at!).toLocaleString()}
            </div>
          )}

          <div>
            <label htmlFor="email-subject" className="text-xs text-text-secondary block mb-1.5">
              Subject
            </label>
            <input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sent}
              className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="email-body" className="text-xs text-text-secondary block mb-1.5">
              Body
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={sent}
              rows={8}
              className="w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary outline-none transition-colors resize-y disabled:opacity-60"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={flagged}
              onChange={(e) => setFlagged(e.target.checked)}
              disabled={sent || !contact.work_email}
              className="rounded border-dark-border"
            />
            Flag to send (orchestrator picks this up on the next run)
          </label>

          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-text-secondary border border-dark-border hover:bg-dark-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || sent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent-blue text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
