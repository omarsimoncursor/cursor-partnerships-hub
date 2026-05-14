'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { computeNextEmailSendDate } from '@/lib/prospect-store/sequence-cadence';

// Single source of truth for the enum-shaped TEXT columns. Mirrors
// the spec in `docs/chatgtm-integration.md` and the SQL comments in
// `schema.sql`. Keep these in sync manually (the store validates at
// the application layer, not the DB, so adding a value here doesn't
// require a migration).
export const TEAM_OPTIONS = [
  'Cloud & Infrastructure',
  'Cybersecurity',
  'Platform',
  'AI/ML',
  'Software Engineering',
  'Data Engineering',
  'DevOps',
  'Security',
  'QA',
  'Cloud',
  'IT/Infrastructure',
  'Product',
  'Design',
  'Embedded Systems',
  'Computer Vision',
  'Other',
] as const;

export const CLASSIFIED_LEVEL_OPTIONS = [
  'Executive',
  'Leader (Dir/VP+)',
  'Manager',
  'IC',
] as const;

// The fields the SequenceEditModal mutates. Mirrors `OutreachPatch`
// in `src/lib/prospect-store/prospects.ts` so the wire shape lines up
// with the strict PATCH validator on the server.
export type EditableSequenceProspect = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  company_name: string;
  linkedin_url: string | null;
  team: string | null;
  classified_level: string | null;
  last_sequence_sent: number | null;
  last_email_send_date: string | null;
  thread_id: string | null;
  replied: boolean;
  linkedin_sent: boolean;
  linkedin_draft: string | null;
  mcp_detail: string | null;
};

type Props = {
  prospect: EditableSequenceProspect;
  apiToken: string;
  onClose: () => void;
  onSaved: () => void;
};

export function SequenceEditModal({ prospect, apiToken, onClose, onSaved }: Props) {
  // "Not started" is represented as null on the wire, but the <select>
  // can't hold null — encode null as the empty string and decode on
  // submit.
  const [step, setStep] = useState<string>(
    prospect.last_sequence_sent != null ? String(prospect.last_sequence_sent) : '',
  );
  const [lastSendDate, setLastSendDate] = useState(prospect.last_email_send_date || '');
  const [threadId, setThreadId] = useState(prospect.thread_id || '');
  const [replied, setReplied] = useState(prospect.replied);
  const [linkedinSent, setLinkedinSent] = useState(prospect.linkedin_sent);
  const [linkedinDraft, setLinkedinDraft] = useState(prospect.linkedin_draft || '');
  const [mcpDetail, setMcpDetail] = useState(prospect.mcp_detail || '');
  const [team, setTeam] = useState(prospect.team || '');
  const [classifiedLevel, setClassifiedLevel] = useState(prospect.classified_level || '');
  const [email, setEmail] = useState(prospect.email || '');
  const [linkedinUrl, setLinkedinUrl] = useState(prospect.linkedin_url || '');

  const [saving, setSaving] = useState(false);
  // The strict outreach PATCH returns `{error, field, message}` — keep
  // both the field and the message so we can highlight the offending
  // input + render the message inline.
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Live preview of next_email_send_date — recomputed from the same
  // helper the server uses, so the UI never disagrees with the
  // actual stored value after save.
  const nextSendPreview = useMemo(() => {
    const stepNum = step === '' ? null : Number(step);
    return computeNextEmailSendDate({
      last_sequence_sent: stepNum,
      last_email_send_date: lastSendDate || null,
      replied,
    });
  }, [step, lastSendDate, replied]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Build the patch with only the fields that actually changed.
      // Sending an unchanged value would still work (the server
      // validates and writes through), but a smaller patch keeps the
      // updated_at semantics meaningful and makes the request easier
      // to read in the network tab when debugging.
      const patch: Record<string, unknown> = {};
      const stepNum = step === '' ? null : Number(step);
      if (stepNum !== prospect.last_sequence_sent) patch.last_sequence_sent = stepNum;
      const trimmedDate = lastSendDate.trim() || null;
      if (trimmedDate !== prospect.last_email_send_date) patch.last_email_send_date = trimmedDate;
      const trimmedThread = threadId.trim() || null;
      if (trimmedThread !== prospect.thread_id) patch.thread_id = trimmedThread;
      if (replied !== prospect.replied) patch.replied = replied;
      if (linkedinSent !== prospect.linkedin_sent) patch.linkedin_sent = linkedinSent;
      const trimmedDraft = linkedinDraft.trim() || null;
      if (trimmedDraft !== prospect.linkedin_draft) patch.linkedin_draft = trimmedDraft;
      const trimmedMcp = mcpDetail.trim() || null;
      if (trimmedMcp !== prospect.mcp_detail) patch.mcp_detail = trimmedMcp;
      const trimmedTeam = team.trim() || null;
      if (trimmedTeam !== prospect.team) patch.team = trimmedTeam;
      const trimmedLevel = classifiedLevel.trim() || null;
      if (trimmedLevel !== prospect.classified_level) patch.classified_level = trimmedLevel;
      const trimmedEmail = email.trim() || null;
      if (trimmedEmail !== prospect.email) patch.email = trimmedEmail;
      const trimmedLi = linkedinUrl.trim() || null;
      if (trimmedLi !== prospect.linkedin_url) patch.linkedin_url = trimmedLi;

      if (Object.keys(patch).length === 0) {
        // Nothing to save; just dismiss. Avoid the round-trip — saves
        // a Vercel function invocation on a fast click.
        onClose();
        return;
      }

      const res = await fetch(`/api/chatgtm/prospects/${prospect.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError({
          field: typeof body?.field === 'string' ? body.field : undefined,
          message: body?.message || body?.detail || `Save failed (${res.status})`,
        });
        return;
      }
      onSaved();
      onClose();
    } catch (err) {
      setError({ message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const fieldHasError = (name: string): boolean => error?.field === name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-2xl border border-dark-border bg-dark-bg shadow-2xl"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
              Edit sequence state
            </p>
            <h2 className="text-base font-semibold text-text-primary">
              {prospect.name}{' '}
              <span className="text-text-tertiary">— {prospect.company_name}</span>
            </h2>
            <p className="text-[11px] text-text-tertiary font-mono mt-0.5">/p/{prospect.slug}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-tertiary hover:text-text-primary"
            aria-label="Close edit modal"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <Section title="Email sequence">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Last sequence step" hint="Which of the 6 emails was last sent. Leave blank for not-started.">
                <div className="flex items-center gap-2">
                  <select
                    value={step}
                    onChange={(e) => setStep(e.target.value)}
                    className={inputClass + ' flex-1' + (fieldHasError('last_sequence_sent') ? errorBorder : '')}
                  >
                    <option value="">— Not started</option>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        Email {n} of 6
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      // One-click "advance to next step" — bumps the
                      // step select by 1 (capped at 6) and stamps
                      // today (UTC) into the date field. Equivalent
                      // to the inline +1 affordance that used to live
                      // on the row, just inside the modal so the row
                      // can stay focused on the LinkedIn flow. The
                      // rep clicks Save to commit.
                      const current = step === '' ? 0 : Number(step);
                      const next = Math.min(6, current + 1);
                      setStep(String(next));
                      setLastSendDate(new Date().toISOString().slice(0, 10));
                    }}
                    disabled={step === '6'}
                    title={
                      step === '6'
                        ? 'Sequence already complete'
                        : 'Advance to the next step and stamp today as the send date'
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-dark-border hover:border-accent-blue hover:text-accent-blue text-text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    +1 today
                  </button>
                </div>
              </Field>
              <Field label="Last send date" hint="Date the last email went out (UTC).">
                <input
                  type="date"
                  value={lastSendDate}
                  onChange={(e) => setLastSendDate(e.target.value)}
                  className={inputClass + (fieldHasError('last_email_send_date') ? errorBorder : '')}
                />
              </Field>
              <Field label="Thread ID" hint="Gmail thread id (captured after Email 1; reused for replies).">
                <input
                  value={threadId}
                  onChange={(e) => setThreadId(e.target.value)}
                  spellCheck={false}
                  className={inputClass + ' font-mono' + (fieldHasError('thread_id') ? errorBorder : '')}
                  placeholder="18f3a2b4c5d6e7f8"
                />
              </Field>
              <Field label="Computed next send" hint="Read-only. Driven by sequenceCadenceDays in setup-config.ts.">
                <div className={inputClass + ' tabular-nums opacity-80 select-text'} aria-readonly>
                  {nextSendPreview ?? <span className="text-text-tertiary">— (sequence done or replied)</span>}
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Status flags">
            <div className="grid sm:grid-cols-2 gap-3">
              <Toggle
                label="Replied"
                hint="When on, the Sequence Orchestrator skips this prospect. Reply Detector flips this."
                checked={replied}
                onChange={setReplied}
                accent="green"
              />
              <Toggle
                label="LinkedIn message sent"
                hint="Tracks the LinkedIn connection request, separately from the email sequence."
                checked={linkedinSent}
                onChange={setLinkedinSent}
                accent="blue"
              />
            </div>
          </Section>

          <Section title="Identity & contact">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" hint="Use this to correct a bad email mid-sequence.">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass + (fieldHasError('email') ? errorBorder : '')}
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  spellCheck={false}
                  className={inputClass + ' font-mono' + (fieldHasError('linkedin_url') ? errorBorder : '')}
                />
              </Field>
              <Field label="Team" hint="Functional team. Validated client-side.">
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className={inputClass + (fieldHasError('team') ? errorBorder : '')}
                >
                  <option value="">— None</option>
                  {TEAM_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Classified level" hint="Distinct from level_normalized (the regex-normalized raw title).">
                <select
                  value={classifiedLevel}
                  onChange={(e) => setClassifiedLevel(e.target.value)}
                  className={inputClass + (fieldHasError('classified_level') ? errorBorder : '')}
                >
                  <option value="">— None</option>
                  {CLASSIFIED_LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Drafts">
            <div className="space-y-3">
              <Field label="LinkedIn draft" hint="Personalized connection-request copy (~300 char target).">
                <textarea
                  value={linkedinDraft}
                  onChange={(e) => setLinkedinDraft(e.target.value)}
                  rows={3}
                  className={inputClass + ' resize-y' + (fieldHasError('linkedin_draft') ? errorBorder : '')}
                />
              </Field>
              <Field label="MCP/SDK detail" hint='Two-sentence "how Cursor MCP/SDK applies to this person" blurb.'>
                <textarea
                  value={mcpDetail}
                  onChange={(e) => setMcpDetail(e.target.value)}
                  rows={3}
                  className={inputClass + ' resize-y' + (fieldHasError('mcp_detail') ? errorBorder : '')}
                />
              </Field>
            </div>
          </Section>

          {error && (
            <div className="rounded-md border border-accent-red/40 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
              {error.field ? (
                <span>
                  <span className="font-mono">{error.field}</span>: {error.message}
                </span>
              ) : (
                error.message
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-text-secondary border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent-blue text-dark-bg disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving\u2026' : 'Save changes'}
          </button>
        </footer>
      </form>
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2 rounded-md bg-dark-surface border border-dark-border focus:border-accent-blue text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors';

const errorBorder = ' !border-accent-red focus:!border-accent-red';

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-2">{title}</h3>
      {hint && <p className="text-[11px] text-text-tertiary mb-2 leading-snug">{hint}</p>}
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-text-secondary mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-text-tertiary mt-1">{hint}</span>}
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  accent,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  accent: 'green' | 'blue';
}) {
  const accentBg = accent === 'green' ? 'bg-accent-green' : 'bg-accent-blue';
  return (
    <label className="flex items-start gap-3 px-3 py-2 rounded-md border border-dark-border bg-dark-surface cursor-pointer hover:border-dark-border-hover transition-colors">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors mt-0.5 ${
          checked ? accentBg : 'bg-dark-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      <div className="min-w-0">
        <p className="text-sm text-text-primary leading-tight">{label}</p>
        {hint && <p className="text-[11px] text-text-tertiary mt-1 leading-snug">{hint}</p>}
      </div>
    </label>
  );
}
