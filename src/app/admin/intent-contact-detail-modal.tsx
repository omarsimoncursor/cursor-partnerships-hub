'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, X } from 'lucide-react';
import type { OutreachContactResponse } from '@/lib/outreach-store/presentation';

type SignalRow = NonNullable<OutreachContactResponse['signals']>[number];

type Props = {
  contactId: string;
  apiToken: string;
  onClose: () => void;
};

export function IntentContactDetailModal({ contactId, apiToken, onClose }: Props) {
  const [contact, setContact] = useState<OutreachContactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/outreach/contacts/${contactId}?include=signals`, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(body?.message || body?.detail || `Load failed (${res.status})`);
          }
          return;
        }
        if (!cancelled) setContact(body.contact as OutreachContactResponse);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contactId, apiToken]);

  return (
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
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">Intent contact</p>
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
              Loading contact…
            </div>
          )}
          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-sm text-accent-red">
              {error}
            </div>
          )}
          {contact && (
            <>
              <Section title="Emails">
                <Field label="Work email" value={contact.work_email} />
                <Field label="Signup email (personal)" value={contact.signup_email} />
                <Field label="Email draft status" value={contact.email_status} />
              </Section>

              <Section title="Priority & signals">
                <Field label="Priority tier" value={contact.priority_tier_value} />
                <Field label="Rationale" value={contact.priority_rationale} multiline />
                <Field label="Signal types" value={contact.signal_types?.join(', ')} />
                <Field label="First seen" value={formatDt(contact.signal_first_seen_at)} />
                <Field label="Latest signal" value={formatDt(contact.signal_latest_at)} />
                {contact.signals && contact.signals.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
                      Signal detail rows
                    </p>
                    {contact.signals.map((s) => (
                      <SignalCard key={s.id} signal={s} />
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Contact">
                <Field label="Full name" value={contact.full_name} />
                <Field label="First / last" value={[contact.first_name, contact.last_name].filter(Boolean).join(' ') || null} />
                <Field label="Title" value={contact.title} />
                <Field label="Function" value={contact.function_value} />
                <Field label="Seniority" value={contact.seniority_tier_value} />
                <LinkField label="LinkedIn" href={contact.linkedin_url} />
                <Field label="Headline" value={contact.linkedin_headline} multiline />
                <Field label="About" value={contact.linkedin_about} multiline />
                <Field
                  label="Location"
                  value={[contact.location_city, contact.location_state, contact.location_country]
                    .filter(Boolean)
                    .join(', ') || null}
                />
                <Field label="Tenure (months)" value={contact.tenure_months_at_company} />
                <Field
                  label="Previously at Cursor customers"
                  value={
                    contact.previously_at_cursor_customers?.length
                      ? contact.previously_at_cursor_customers.join(', ')
                      : null
                  }
                />
                <Field label="Prior employer matches" value={contact.prior_employer_match_count} />
              </Section>

              <Section title="Account">
                <Field label="Display name" value={contact.account_display_name} />
                <Field label="Entity name" value={contact.account_name} />
                <Field label="Domain" value={contact.account_domain} />
                <Field label="Segment" value={contact.account_segment} />
                <Field label="Type" value={contact.account_type_value} />
                <Field label="Owner email" value={contact.account_owner_email} />
                <Field label="Subsidiary" value={contact.is_subsidiary ? 'yes' : 'no'} />
                <Field label="MAU" value={contact.account_mau} />
                <Field label="MAU WoW %" value={contact.account_mau_wow_change_pct} />
                <Field label="ARR" value={contact.account_current_arr} />
                <Field label="Health score" value={contact.account_health_score} />
                <Field label="Open opps" value={contact.open_opp_count} />
                <Field label="Open opp ARR" value={contact.open_opp_arr} />
                <Field label="Primary opp stage" value={contact.primary_opp_stage} />
                <Field label="Signals L7D (account)" value={contact.account_signal_count_l7d} />
                <Field label="Claude Code users" value={contact.claude_code_user_count} />
                <Field label="Copilot users" value={contact.copilot_user_count} />
                <LinkField label="SFDC account" href={contact.account_sfdc_url} />
              </Section>

              <Section title="Cursor usage">
                <Field label="User ID" value={contact.cursor_user_id} />
                <Field label="Plan" value={contact.plan_type_value} />
                <Field label="Power user" value={contact.is_power_user ? 'yes' : 'no'} />
                <Field label="Team admin" value={contact.is_team_admin ? 'yes' : 'no'} />
                <Field label="Team" value={contact.cursor_team_name} />
                <Field label="Signed up" value={formatDt(contact.user_created_at)} />
                <Field label="Last active" value={formatDt(contact.last_active_at)} />
                <Field label="Days / weeks active" value={`${contact.total_days_active ?? '—'} / ${contact.weeks_active ?? '—'}`} />
                <Field label="Agent requests (L30d)" value={contact.agent_requests_l30d} />
                <Field label="CC requests (L30d)" value={contact.cc_requests_l30d} />
                <Field label="Tab accepts (L30d)" value={contact.tab_accepts_l30d} />
                <Field label="Paid personally" value={contact.paid_personally ? 'yes' : 'no'} />
              </Section>

              <Section title="Outreach drafts">
                <Field label="LinkedIn sent" value={contact.linkedin_sent ? 'yes' : 'no'} />
                <Field label="LinkedIn message" value={contact.linkedin_message} multiline />
                <Field label="Email subject" value={contact.email_subject} />
                <Field label="Email body" value={contact.email_body} multiline />
                <Field label="Flagged to send" value={contact.email_flagged_to_send ? 'yes' : 'no'} />
                <Field label="Email sent at" value={formatDt(contact.email_sent_at)} />
              </Section>

              <Section title="SFDC & Gong">
                <Field label="In SFDC" value={contact.exists_in_sfdc ? 'yes' : 'no'} />
                <LinkField label="SFDC contact" href={contact.sfdc_contact_url} />
                <Field label="Last SFDC activity" value={formatDt(contact.last_sfdc_activity_at)} />
                <Field label="SFDC activity owner" value={contact.last_sfdc_activity_owner_email} />
                <Field label="Gong calls (L90d)" value={contact.gong_call_count_l90d} />
                <Field label="Last Gong call" value={formatDt(contact.last_gong_call_at)} />
                <LinkField label="Last Gong URL" href={contact.last_gong_call_url} />
                <Field label="Outreach sequence active" value={contact.outreach_sequence_active ? 'yes' : 'no'} />
              </Section>

              <Section title="System">
                <Field label="External key" value={contact.external_key} mono />
                <Field label="Run ID" value={contact.run_id} mono />
                <Field label="Contact ID" value={contact.id} mono />
                <Field label="Created" value={formatDt(contact.created_at)} />
                <Field label="Updated" value={formatDt(contact.updated_at)} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary mb-3 border-b border-dark-border pb-1">
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
          {href}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      </dd>
    </div>
  );
}

function SignalCard({ signal }: { signal: SignalRow }) {
  return (
    <div className="rounded-lg border border-dark-border bg-dark-surface px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="font-mono uppercase text-accent-amber">{signal.signal_type.replace(/_/g, ' ')}</span>
        <span className="text-text-tertiary">{formatDt(signal.detected_at)}</span>
      </div>
      {signal.raw && Object.keys(signal.raw).length > 0 && (
        <pre className="mt-2 text-[10px] font-mono text-text-secondary whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
          {JSON.stringify(signal.raw, null, 2)}
        </pre>
      )}
    </div>
  );
}

function formatDt(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
