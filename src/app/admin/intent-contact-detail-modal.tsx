'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  ExternalLink,
  Linkedin,
  Loader2,
  Mail,
  Pencil,
  Send,
  X,
} from 'lucide-react';
import { LinkedinSendDialog, type LinkedinSendTarget } from './linkedin-send-dialog';
import { IntentEmailEditModal, type IntentEmailTarget } from './intent-email-edit-modal';
import { outreachSendEmail, type OutreachContactResponse } from '@/lib/outreach-store/presentation';
import {
  formatEmailStatus,
  formatPriorityTier,
  formatSignalRawFieldLabel,
  formatSignalRawValue,
  formatSignalType,
  isUserFacingSignalField,
} from '@/lib/outreach-store/signal-labels';

type SignalRow = NonNullable<OutreachContactResponse['signals']>[number];

type Props = {
  contactId: string;
  apiToken: string;
  onClose: () => void;
  onContactUpdated?: (patch: Partial<OutreachContactResponse>) => void;
};

export function IntentContactDetailModal({
  contactId,
  apiToken,
  onClose,
  onContactUpdated,
}: Props) {
  const [contact, setContact] = useState<OutreachContactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLiDialog, setShowLiDialog] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${contactId}?include=signals`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message || body?.detail || `Load failed (${res.status})`);
        return;
      }
      setContact(body.contact as OutreachContactResponse);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [contactId, apiToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showLiDialog && !showEmailModal) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showLiDialog, showEmailModal]);

  useEffect(() => {
    void load();
  }, [load]);

  const mergeContact = (patch: Partial<OutreachContactResponse>) => {
    setContact((prev) => (prev ? { ...prev, ...patch } : prev));
    onContactUpdated?.(patch);
  };

  const patchContact = async (patch: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(patch),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message || body?.detail || `Save failed (${res.status})`);
        return false;
      }
      const updated = body?.contact as Partial<OutreachContactResponse> | undefined;
      if (updated) mergeContact(updated);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendEmail = contact ? outreachSendEmail(contact) : null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-dark-border bg-dark-bg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-4 border-b border-dark-border bg-dark-bg/95 backdrop-blur">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-text-tertiary">Intent contact</p>
              <h2 className="text-lg font-semibold text-text-primary truncate">
                {contact?.full_name ?? 'Loading…'}
              </h2>
              {contact && (
                <p className="text-sm text-text-secondary mt-0.5">
                  {contact.title} · {contact.account_display_name}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-dark-surface"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="px-6 py-5 space-y-6">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-text-secondary">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading…
              </div>
            )}
            {error && (
              <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red">
                {error}
              </div>
            )}
            {contact && (
              <>
                <Section title="Your outreach">
                  <div className="sm:col-span-2 space-y-4">
                    <div className="rounded-lg border border-dark-border bg-dark-surface p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-text-primary inline-flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                          LinkedIn message
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={busy || !contact.linkedin_url || !contact.linkedin_message}
                            onClick={() => setShowLiDialog(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0a66c2] text-white hover:opacity-90 disabled:opacity-40"
                          >
                            Copy & open LinkedIn
                          </button>
                          <label className="inline-flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={contact.linkedin_sent}
                              disabled={busy}
                              onChange={(e) => void patchContact({ linkedin_sent: e.target.checked })}
                              className="rounded border-dark-border"
                            />
                            Mark sent
                          </label>
                        </div>
                      </div>
                      <p className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {contact.linkedin_message || (
                          <span className="italic text-text-tertiary">No message drafted yet</span>
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg border border-dark-border bg-dark-surface p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-text-primary inline-flex items-center gap-2">
                          <Mail className="w-4 h-4 text-accent-blue" />
                          One-time email
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {sendEmail && !contact.email_sent_at && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setShowEmailModal(true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-dark-border hover:bg-dark-surface-hover disabled:opacity-40"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit draft
                            </button>
                          )}
                          {sendEmail && !contact.email_sent_at && (
                            <label className="inline-flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={contact.email_flagged_to_send}
                                disabled={busy}
                                onChange={(e) =>
                                  void patchContact({ email_flagged_to_send: e.target.checked })
                                }
                                className="rounded border-dark-border"
                              />
                              <Send className="w-3 h-3" />
                              Flag to send
                            </label>
                          )}
                          {contact.email_sent_at && (
                            <span className="text-xs text-accent-green inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Sent {formatDt(contact.email_sent_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-text-tertiary">
                        To: {sendEmail || <span className="italic">no email on file</span>}
                      </p>
                      {contact.email_subject || contact.email_body ? (
                        <div className="space-y-2">
                          <p className="text-[13px] font-medium text-text-primary">
                            {contact.email_subject || <span className="italic font-normal text-text-tertiary">(no subject)</span>}
                          </p>
                          <p className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed">
                            {contact.email_body}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[13px] italic text-text-tertiary">
                          {sendEmail
                            ? 'No email draft yet — click Edit draft to write one.'
                            : 'LinkedIn only — no email address on file.'}
                        </p>
                      )}
                    </div>

                    {contact.demo_url ? (
                      <div className="rounded-lg border border-dark-border bg-dark-surface p-4">
                        <p className="text-sm font-medium text-text-primary mb-2">Personalized demo</p>
                        <LinkField label="Demo link" href={contact.demo_url} />
                        <Field label="Password" value={contact.demo_password} />
                      </div>
                    ) : (
                      <p className="text-[12px] text-text-tertiary leading-relaxed">
                        No demo link for this contact. The intent automation is configured for
                        training-focused outreach (`demo_ok: false`). Set `demo.demo_ok: true` in
                        ChatGTM to generate demos on ingest.
                      </p>
                    )}
                  </div>
                </Section>

                <Section title="Why they&apos;re here">
                  <Field label="Priority" value={formatPriorityTier(contact.priority_tier_value)} />
                  <Field label="Summary" value={contact.priority_rationale} multiline />
                  <Field
                    label="Triggers"
                    value={contact.signal_types?.map(formatSignalType).join(' · ')}
                  />
                  <Field label="First activity" value={formatDt(contact.signal_first_seen_at)} />
                  <Field label="Latest activity" value={formatDt(contact.signal_latest_at)} />
                  {contact.signals && contact.signals.length > 0 && (
                    <div className="sm:col-span-2 mt-2 space-y-2">
                      {contact.signals.map((s) => (
                        <SignalCard key={s.id} signal={s} />
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Emails">
                  <Field label="Work email" value={contact.work_email} />
                  <Field label="Signup email" value={contact.signup_email} />
                  <Field label="Draft status" value={formatEmailStatus(contact.email_status)} />
                </Section>

                <Section title="Contact">
                  <Field label="Name" value={contact.full_name} />
                  <Field label="Title" value={contact.title} />
                  <Field label="Seniority" value={contact.seniority_tier_value} />
                  <LinkField label="LinkedIn profile" href={contact.linkedin_url} />
                  <Field label="Headline" value={contact.linkedin_headline} multiline />
                  <Field
                    label="Location"
                    value={[contact.location_city, contact.location_state, contact.location_country]
                      .filter(Boolean)
                      .join(', ') || null}
                  />
                  {contact.prior_employer_match_count > 0 && (
                    <Field label="Cursor customer alumni" value={`${contact.prior_employer_match_count} prior match(es)`} />
                  )}
                </Section>

                <Section title="Account">
                  <Field label="Account" value={contact.account_display_name} />
                  {contact.account_name !== contact.account_display_name && (
                    <Field label="Entity" value={contact.account_name} />
                  )}
                  <Field label="Domain" value={contact.account_domain} />
                  <Field label="Monthly active users" value={contact.account_mau} />
                  <Field label="Open opportunities" value={contact.open_opp_count} />
                  <LinkField label="Salesforce account" href={contact.account_sfdc_url} />
                </Section>

                <Section title="Cursor activity">
                  <Field label="Plan" value={contact.plan_type_value} />
                  <Field label="Signed up" value={formatDt(contact.user_created_at)} />
                  <Field label="Last active" value={formatDt(contact.last_active_at)} />
                  <Field label="Agent requests (30 days)" value={contact.agent_requests_l30d} />
                  <Field label="Power user" value={contact.is_power_user ? 'Yes' : 'No'} />
                </Section>

                <details className="text-text-tertiary">
                  <summary className="text-[11px] uppercase tracking-wider cursor-pointer hover:text-text-secondary">
                    Technical details
                  </summary>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                    <Field label="External key" value={contact.external_key} mono />
                    <Field label="Run ID" value={contact.run_id} mono />
                    <Field label="Contact ID" value={contact.id} mono />
                    <Field label="Created" value={formatDt(contact.created_at)} />
                  </dl>
                </details>
              </>
            )}
          </div>
        </div>
      </div>

      {contact && showLiDialog && (
        <LinkedinSendDialog
          mode="intent"
          prospect={{
            id: contact.id,
            name: contact.full_name,
            company_name: contact.account_display_name,
            linkedin_url: contact.linkedin_url,
            linkedin_message: contact.linkedin_message,
            linkedin_sent: contact.linkedin_sent,
          } satisfies LinkedinSendTarget}
          apiToken={apiToken}
          onClose={() => setShowLiDialog(false)}
          onUpdated={(patch) => {
            mergeContact(patch as Partial<OutreachContactResponse>);
            setShowLiDialog(false);
          }}
        />
      )}

      {contact && showEmailModal && (
        <IntentEmailEditModal
          contact={contact as IntentEmailTarget}
          apiToken={apiToken}
          onClose={() => setShowEmailModal(false)}
          onSaved={(patch) => {
            mergeContact(patch as Partial<OutreachContactResponse>);
            setShowEmailModal(false);
          }}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-wider text-text-tertiary mb-3 border-b border-dark-border pb-1">
        {title}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">{children}</dl>
    </section>
  );
}

function Field({
  label,
  value,
  multiline,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  multiline?: boolean;
  mono?: boolean;
}) {
  const empty = value === null || value === undefined || value === '';
  const display = empty ? '—' : String(value);
  return (
    <div className={multiline ? 'sm:col-span-2' : undefined}>
      <dt className="text-[10px] text-text-tertiary">{label}</dt>
      <dd
        className={`text-[13px] text-text-primary mt-0.5 ${mono ? 'font-mono text-[11px] break-all' : ''} ${
          multiline ? 'whitespace-pre-wrap leading-relaxed' : 'truncate'
        } ${empty ? 'italic text-text-tertiary' : ''}`}
      >
        {display}
      </dd>
    </div>
  );
}

function LinkField({ label, href }: { label: string; href: string | null }) {
  if (!href) return <Field label={label} value={null} />;
  return (
    <div>
      <dt className="text-[10px] text-text-tertiary">{label}</dt>
      <dd className="mt-0.5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[13px] text-accent-blue hover:underline break-all"
        >
          Open link
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      </dd>
    </div>
  );
}

function SignalCard({ signal }: { signal: SignalRow }) {
  const raw = signal.raw ?? {};
  const fields = Object.entries(raw).filter(([k]) => isUserFacingSignalField(k));

  return (
    <div className="rounded-lg border border-dark-border bg-dark-surface px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-[13px] font-medium text-text-primary">{formatSignalType(signal.signal_type)}</span>
        <span className="text-[11px] text-text-tertiary">{formatDt(signal.detected_at)}</span>
      </div>
      {fields.length > 0 ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {fields.map(([key, value]) => (
            <div key={key}>
              <dt className="text-[10px] text-text-tertiary">{formatSignalRawFieldLabel(key)}</dt>
              <dd className="text-[12px] text-text-secondary mt-0.5 break-all">
                {formatSignalRawValue(key, value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[12px] italic text-text-tertiary">No extra details</p>
      )}
    </div>
  );
}

function formatDt(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
