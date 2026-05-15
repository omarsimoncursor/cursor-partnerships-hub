import { query } from './db';
import type { OutreachContactSignalInput, OutreachContactSignalRow } from './types';

/**
 * Idempotent batch insert. The (contact_id, signal_type, detected_at)
 * unique constraint on outreach_contact_signals lets us safely
 * re-emit the same signal on partial-batch retries without piling up
 * duplicate rows.
 */
export async function insertSignals(args: {
  signals: Array<OutreachContactSignalInput & { contact_id: string }>;
}): Promise<{ inserted: number }> {
  let inserted = 0;
  // Sequential insert keeps it simple. The signal volume per run is
  // single-digit-per-contact * up-to-100-contacts = a few hundred
  // rows max — well below anything that would warrant a multi-row
  // VALUES insert.
  for (const s of args.signals) {
    const { rowCount } = await query(
      `INSERT INTO outreach_contact_signals (contact_id, signal_type, detected_at, raw)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (contact_id, signal_type, detected_at) DO NOTHING`,
      [s.contact_id, s.signal_type, s.detected_at, JSON.stringify(s.raw ?? null)],
    );
    inserted += rowCount ?? 0;
  }
  return { inserted };
}

export async function getSignalsForContact(
  contactId: string,
): Promise<OutreachContactSignalRow[]> {
  const { rows } = await query<OutreachContactSignalRow>(
    `SELECT * FROM outreach_contact_signals
       WHERE contact_id = $1
       ORDER BY detected_at DESC`,
    [contactId],
  );
  return rows;
}

export async function getSignalsForRun(
  runId: string,
): Promise<Map<string, OutreachContactSignalRow[]>> {
  const { rows } = await query<OutreachContactSignalRow>(
    `SELECT s.* FROM outreach_contact_signals s
       JOIN outreach_contacts c ON c.id = s.contact_id
       WHERE c.run_id = $1
       ORDER BY s.detected_at DESC`,
    [runId],
  );
  const map = new Map<string, OutreachContactSignalRow[]>();
  for (const r of rows) {
    const list = map.get(r.contact_id);
    if (list) list.push(r);
    else map.set(r.contact_id, [r]);
  }
  return map;
}
