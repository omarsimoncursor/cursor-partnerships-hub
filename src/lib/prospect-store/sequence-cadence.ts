// Pure helpers for the email-sequence cadence. Deliberately lives in
// its own file (no `pg` / `fs` imports) so the admin client modules
// can import `computeNextEmailSendDate` for the live "next send"
// preview without dragging the Postgres client into the browser
// bundle.

import { SETUP_CONFIG } from '../setup-config';

export function normalizeDateOnly(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string' && v.length > 0) return v.slice(0, 10);
  return null;
}

/**
 * Compute the date the next sequence email is due, from
 * `last_sequence_sent` + `last_email_send_date` + the configured
 * cadence. Returns null when the sequence is complete (step 6),
 * the prospect replied, or we don't have a base date to extrapolate
 * from.
 *
 * - last_sequence_sent = null, replied = false:
 *     "Email 1 hasn't been sent yet" — returns today (UTC) so the
 *     dashboard can surface "ready to send".
 * - last_sequence_sent in 1..5, replied = false, last_email_send_date set:
 *     last_email_send_date + cadence[step-1] days.
 * - last_sequence_sent = 6 OR replied = true:
 *     null (no further send is expected).
 */
export function computeNextEmailSendDate(args: {
  last_sequence_sent: number | null;
  last_email_send_date: string | Date | null;
  replied: boolean;
}): string | null {
  if (args.replied) return null;
  const step = args.last_sequence_sent;
  if (step != null && step >= 6) return null;
  if (step == null) {
    return new Date().toISOString().slice(0, 10);
  }
  if (step < 1 || step > 5) return null;
  const baseDateStr = normalizeDateOnly(args.last_email_send_date);
  if (!baseDateStr) return null;
  const base = new Date(`${baseDateStr}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return null;
  const gap = SETUP_CONFIG.sequenceCadenceDays[step - 1];
  if (typeof gap !== 'number' || !Number.isFinite(gap)) return null;
  base.setUTCDate(base.getUTCDate() + gap);
  return base.toISOString().slice(0, 10);
}
