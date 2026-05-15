// Persistence helpers for `outreach_runs`. Idempotent on
// `automation_run_id` — re-POSTing a run with the same id is a
// last-write-wins update of the summary counters (decision (3) at
// implementation time).

import { query } from './db';
import type { OutreachRunInput, OutreachRunRow } from './types';

export type UpsertRunResult = {
  run: OutreachRunRow;
  created: boolean;
};

export async function upsertRunWithMeta(input: OutreachRunInput): Promise<UpsertRunResult> {
  const s = input.summary;
  const { rows } = await query<OutreachRunRow & { __was_inserted: boolean }>(
    `INSERT INTO outreach_runs (
        automation_run_id, automation_revision_id, user_email,
        run_date, ran_at, window_start, window_end,
        total_contacts, total_emails_drafted, unique_accounts_signaled,
        unique_executives, unique_leaders, unique_managers, unique_ics,
        count_with_work_email, count_with_linkedin_url,
        accounts_with_activity, accounts_with_no_signals
      )
      VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16,
        $17, $18
      )
      ON CONFLICT (automation_run_id) DO UPDATE SET
        automation_revision_id   = EXCLUDED.automation_revision_id,
        user_email               = EXCLUDED.user_email,
        run_date                 = EXCLUDED.run_date,
        ran_at                   = EXCLUDED.ran_at,
        window_start             = EXCLUDED.window_start,
        window_end               = EXCLUDED.window_end,
        total_contacts           = EXCLUDED.total_contacts,
        total_emails_drafted     = EXCLUDED.total_emails_drafted,
        unique_accounts_signaled = EXCLUDED.unique_accounts_signaled,
        unique_executives        = EXCLUDED.unique_executives,
        unique_leaders           = EXCLUDED.unique_leaders,
        unique_managers          = EXCLUDED.unique_managers,
        unique_ics               = EXCLUDED.unique_ics,
        count_with_work_email    = EXCLUDED.count_with_work_email,
        count_with_linkedin_url  = EXCLUDED.count_with_linkedin_url,
        accounts_with_activity   = EXCLUDED.accounts_with_activity,
        accounts_with_no_signals = EXCLUDED.accounts_with_no_signals,
        updated_at               = now()
      RETURNING *, (xmax = 0) AS __was_inserted`,
    [
      input.automation_run_id,
      input.automation_revision_id,
      input.user_email,
      input.run_date,
      input.ran_at,
      input.window_start,
      input.window_end,
      s.total_contacts,
      s.total_emails_drafted,
      s.unique_accounts_signaled,
      s.unique_executives,
      s.unique_leaders,
      s.unique_managers,
      s.unique_ics,
      s.count_with_work_email,
      s.count_with_linkedin_url,
      s.accounts_with_activity,
      s.accounts_with_no_signals,
    ],
  );
  if (!rows[0]) throw new Error('upsertRun returned no row');
  const { __was_inserted, ...run } = rows[0];
  return { run, created: __was_inserted };
}

export async function upsertRun(input: OutreachRunInput): Promise<OutreachRunRow> {
  const { run } = await upsertRunWithMeta(input);
  return run;
}

export async function getRunByAutomationRunId(
  automationRunId: string,
): Promise<OutreachRunRow | null> {
  const { rows } = await query<OutreachRunRow>(
    `SELECT * FROM outreach_runs WHERE automation_run_id = $1 LIMIT 1`,
    [automationRunId],
  );
  return rows[0] ?? null;
}

export async function getRunById(id: string): Promise<OutreachRunRow | null> {
  const { rows } = await query<OutreachRunRow>(
    `SELECT * FROM outreach_runs WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getLatestRunByUser(
  userEmail: string,
): Promise<OutreachRunRow | null> {
  const { rows } = await query<OutreachRunRow>(
    `SELECT * FROM outreach_runs
       WHERE user_email = $1
       ORDER BY ran_at DESC LIMIT 1`,
    [userEmail],
  );
  return rows[0] ?? null;
}

export async function listRecentRuns(limit = 50): Promise<OutreachRunRow[]> {
  const { rows } = await query<OutreachRunRow>(
    `SELECT * FROM outreach_runs ORDER BY ran_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}
