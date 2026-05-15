// Persistence helpers for `outreach_contacts`. The upsert path preserves
// UI-managed columns across agent re-POSTs and stores the agent's LinkedIn
// message verbatim (training thank-you copy — no server-side demo append).

import { createProspect, getProspectBySlug } from '../prospect-store/prospects';
import { buildDefaultLinkedinDraft } from '../prospect-store/linkedin-draft-template';
import { query, withClient } from './db';
import type {
  OutreachContactInput,
  OutreachContactPatch,
  OutreachContactRow,
} from './types';
import { mapSeniorityToClassifiedLevel } from './seniority';

export type UpsertContactResult = {
  contact: OutreachContactRow;
  status: 'inserted' | 'updated';
};

/**
 * Resolve a demo URL + password for a contact: reuse an existing
 * prospect's demo when the contact's email or LinkedIn URL matches
 * one we've already built, otherwise create a fresh prospect (which
 * also lazily generates the demo build).
 *
 * Returns null when we can't generate (no email + no linkedin_url +
 * agent didn't supply a fallback URL).
 */
async function resolveDemoForContact(
  input: OutreachContactInput,
  origin: string,
): Promise<{
  demo_url: string | null;
  demo_password: string | null;
  demo_prospect_id: string | null;
}> {
  // Reuse path: match on linkedin_url first (more stable across
  // company changes than email), then work_email. Both partial
  // indexes exist on the prospects table, so these queries are O(1)
  // lookups.
  const linkedinUrl = input.contact.linkedin_url ?? null;
  const workEmail = input.contact.work_email ?? null;
  if (linkedinUrl) {
    const { rows } = await query<{ id: string; slug: string; password: string }>(
      `SELECT id, slug, password FROM prospects
         WHERE linkedin_url = $1
         ORDER BY created_at DESC LIMIT 1`,
      [linkedinUrl],
    );
    if (rows[0]) {
      return {
        demo_url: `${origin.replace(/\/$/, '')}/p/${rows[0].slug}`,
        demo_password: rows[0].password,
        demo_prospect_id: rows[0].id,
      };
    }
  }
  if (workEmail) {
    const { rows } = await query<{ id: string; slug: string; password: string }>(
      `SELECT id, slug, password FROM prospects
         WHERE lower(email) = lower($1)
         ORDER BY created_at DESC LIMIT 1`,
      [workEmail],
    );
    if (rows[0]) {
      return {
        demo_url: `${origin.replace(/\/$/, '')}/p/${rows[0].slug}`,
        demo_password: rows[0].password,
        demo_prospect_id: rows[0].id,
      };
    }
  }

  // Create path: spin up a new prospect row sourced as 'outreach' so
  // the cold-outbound /admin/sequences tab can filter it out by
  // default. Reuses the existing createProspect() which handles slug
  // generation, password generation, and the after()-scheduled demo
  // build.
  try {
    // Inherit the agent's prose LinkedIn message as the linkedin_draft
    // when present — that draft is already personalized to this
    // contact's signal context. Fall back to the shared template
    // (same one the bulk-backfill toolbar uses) so every
    // outreach-sourced prospect lands with a usable draft from
    // minute one.
    const proseDraft = (input.linkedin?.message ?? '').trim();
    const created = await createProspect(
      {
        name: input.contact.full_name,
        company: input.account.display_name,
        company_domain: input.account.domain ?? undefined,
        email: workEmail ?? undefined,
        linkedin_url: linkedinUrl ?? undefined,
        level: input.contact.title,
        classified_level: mapSeniorityToClassifiedLevel(input.contact.seniority_tier),
        linkedin_draft:
          proseDraft.length > 0
            ? proseDraft
            : buildDefaultLinkedinDraft(input.contact.full_name),
        mcp_detail: input.priority.rationale ?? null,
        // Source discriminator so cold-outbound views can filter these
        // out and we can later attribute conversion back to the intent
        // surface that surfaced them.
        metadata: {
          source: 'outreach',
          outreach_external_key: input.external_key,
          outreach_signal_types: input.signals.types,
        },
      } as Parameters<typeof createProspect>[0],
      origin,
    );
    return {
      demo_url: created.url,
      demo_password: created.password,
      demo_prospect_id: created.prospect.id,
    };
  } catch {
    // Fall back to whatever the agent provided. Better to render the
    // contact card with a wonky URL than to drop the row entirely.
    return {
      demo_url: input.demo?.demo_url ?? null,
      demo_password: input.demo?.demo_password ?? null,
      demo_prospect_id: null,
    };
  }
}

/**
 * Compose the stored LinkedIn message: agent copy only.
 */
function storeLinkedinMessage(message: string | null | undefined): {
  text: string | null;
  charCount: number | null;
} {
  const trimmed = (message ?? '').trim();
  if (!trimmed) return { text: null, charCount: null };
  return { text: trimmed, charCount: trimmed.length };
}

export async function upsertContact(
  runId: string,
  input: OutreachContactInput,
  origin: string,
): Promise<UpsertContactResult> {
  // Demo URL/password resolution happens BEFORE the upsert so we can
  // include the appended LinkedIn message in the same INSERT. The
  // prospect lookup / creation is a separate transaction; that's
  // intentional — a transient demo-build failure shouldn't roll back
  // the contact row.
  let demoUrl: string | null = null;
  let demoPassword: string | null = null;
  let demoProspectId: string | null = null;
  const demoOk = input.demo?.demo_ok !== false;
  if (demoOk) {
    const resolved = await resolveDemoForContact(input, origin);
    demoUrl = resolved.demo_url;
    demoPassword = resolved.demo_password;
    demoProspectId = resolved.demo_prospect_id;
  }

  const linkedinStored = storeLinkedinMessage(input.linkedin?.message ?? null);
  const linkedinFull = linkedinStored.text;
  const linkedinCharCount = linkedinStored.charCount;

  const a = input.account;
  const c = input.contact;
  const u = input.cursor_usage ?? null;
  const sigs = input.signals;
  const p = input.priority;
  const e = input.email;

  // The CTE here does the heavy lifting of preserving UI-managed
  // columns. On INSERT, the new row gets whatever defaults we pass.
  // On UPDATE (re-POST), the SET clause writes every data column but
  // explicitly *omits* connection_status_value / connection_*_at /
  // omar_notes / promoted_to_prospect_id / promoted_at, so Omar's
  // dashboard work survives the agent's batched retry.
  const { rows } = await query<OutreachContactRow & { __was_inserted: boolean }>(
    `INSERT INTO outreach_contacts (
        run_id, external_key,
        account_name, account_display_name, account_domain, account_sfdc_id,
        account_sfdc_url, parent_account_sfdc_id, is_subsidiary, account_segment,
        account_type_value, account_owner_email, requires_coordination,
        account_health_score, account_current_arr, account_mau,
        account_mau_wow_change_pct, open_opp_count, open_opp_arr,
        primary_opp_stage, claude_code_user_count, copilot_user_count,
        competitor_user_share_pct, account_signal_count_l7d,

        first_name, last_name, full_name, title, function_value,
        seniority_tier_value, linkedin_url, linkedin_headline, linkedin_about,
        work_email, location_city, location_state, location_country,
        tenure_months_at_company, previously_at_cursor_customers,
        prior_employer_match_count,

        sfdc_contact_id, sfdc_contact_url, exists_in_sfdc,
        last_sfdc_activity_at, last_sfdc_activity_owner_email,

        gong_call_count_l90d, last_gong_call_at, last_gong_call_url,
        outreach_sequence_active, last_outreach_step_at,

        cursor_user_id, is_power_user, is_team_admin, is_blocked_by_rate_limit,
        user_created_at, last_active_at, total_days_active, weeks_active,
        agent_requests_l30d, cc_requests_l30d, tab_accepts_l30d,
        plan_type_value, paid_personally, cursor_team_id, cursor_team_name,

        signal_first_seen_at, signal_latest_at, signal_types,

        priority_tier_value, priority_rationale,

        demo_url, demo_password, show_roi_calculator, demo_ok, demo_session_id,
        demo_prospect_id,

        linkedin_message, linkedin_char_count,

        email_subject, email_body, email_status, gmail_action_id
      )
      VALUES (
        $1, $2,
        $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19,
        $20, $21, $22,
        $23, $24,

        $25, $26, $27, $28, $29,
        $30, $31, $32, $33,
        $34, $35, $36, $37,
        $38, $39,
        $40,

        $41, $42, $43,
        $44, $45,

        $46, $47, $48,
        $49, $50,

        $51, $52, $53, $54,
        $55, $56, $57, $58,
        $59, $60, $61,
        $62, $63, $64, $65,

        $66, $67, $68,

        $69, $70,

        $71, $72, $73, $74, $75,
        $76,

        $77, $78,

        $79, $80, $81, $82
      )
      ON CONFLICT (run_id, external_key) DO UPDATE SET
        account_name = EXCLUDED.account_name,
        account_display_name = EXCLUDED.account_display_name,
        account_domain = EXCLUDED.account_domain,
        account_sfdc_id = EXCLUDED.account_sfdc_id,
        account_sfdc_url = EXCLUDED.account_sfdc_url,
        parent_account_sfdc_id = EXCLUDED.parent_account_sfdc_id,
        is_subsidiary = EXCLUDED.is_subsidiary,
        account_segment = EXCLUDED.account_segment,
        account_type_value = EXCLUDED.account_type_value,
        account_owner_email = EXCLUDED.account_owner_email,
        requires_coordination = EXCLUDED.requires_coordination,
        account_health_score = EXCLUDED.account_health_score,
        account_current_arr = EXCLUDED.account_current_arr,
        account_mau = EXCLUDED.account_mau,
        account_mau_wow_change_pct = EXCLUDED.account_mau_wow_change_pct,
        open_opp_count = EXCLUDED.open_opp_count,
        open_opp_arr = EXCLUDED.open_opp_arr,
        primary_opp_stage = EXCLUDED.primary_opp_stage,
        claude_code_user_count = EXCLUDED.claude_code_user_count,
        copilot_user_count = EXCLUDED.copilot_user_count,
        competitor_user_share_pct = EXCLUDED.competitor_user_share_pct,
        account_signal_count_l7d = EXCLUDED.account_signal_count_l7d,

        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        title = EXCLUDED.title,
        function_value = EXCLUDED.function_value,
        seniority_tier_value = EXCLUDED.seniority_tier_value,
        linkedin_url = EXCLUDED.linkedin_url,
        linkedin_headline = EXCLUDED.linkedin_headline,
        linkedin_about = EXCLUDED.linkedin_about,
        work_email = EXCLUDED.work_email,
        location_city = EXCLUDED.location_city,
        location_state = EXCLUDED.location_state,
        location_country = EXCLUDED.location_country,
        tenure_months_at_company = EXCLUDED.tenure_months_at_company,
        previously_at_cursor_customers = EXCLUDED.previously_at_cursor_customers,
        prior_employer_match_count = EXCLUDED.prior_employer_match_count,

        sfdc_contact_id = EXCLUDED.sfdc_contact_id,
        sfdc_contact_url = EXCLUDED.sfdc_contact_url,
        exists_in_sfdc = EXCLUDED.exists_in_sfdc,
        last_sfdc_activity_at = EXCLUDED.last_sfdc_activity_at,
        last_sfdc_activity_owner_email = EXCLUDED.last_sfdc_activity_owner_email,

        gong_call_count_l90d = EXCLUDED.gong_call_count_l90d,
        last_gong_call_at = EXCLUDED.last_gong_call_at,
        last_gong_call_url = EXCLUDED.last_gong_call_url,
        outreach_sequence_active = EXCLUDED.outreach_sequence_active,
        last_outreach_step_at = EXCLUDED.last_outreach_step_at,

        cursor_user_id = EXCLUDED.cursor_user_id,
        is_power_user = EXCLUDED.is_power_user,
        is_team_admin = EXCLUDED.is_team_admin,
        is_blocked_by_rate_limit = EXCLUDED.is_blocked_by_rate_limit,
        user_created_at = EXCLUDED.user_created_at,
        last_active_at = EXCLUDED.last_active_at,
        total_days_active = EXCLUDED.total_days_active,
        weeks_active = EXCLUDED.weeks_active,
        agent_requests_l30d = EXCLUDED.agent_requests_l30d,
        cc_requests_l30d = EXCLUDED.cc_requests_l30d,
        tab_accepts_l30d = EXCLUDED.tab_accepts_l30d,
        plan_type_value = EXCLUDED.plan_type_value,
        paid_personally = EXCLUDED.paid_personally,
        cursor_team_id = EXCLUDED.cursor_team_id,
        cursor_team_name = EXCLUDED.cursor_team_name,

        signal_first_seen_at = EXCLUDED.signal_first_seen_at,
        signal_latest_at = EXCLUDED.signal_latest_at,
        signal_types = EXCLUDED.signal_types,

        priority_tier_value = EXCLUDED.priority_tier_value,
        priority_rationale = EXCLUDED.priority_rationale,

        -- Demo: keep the existing values when the upsert resolves to
        -- nothing (e.g. demo_ok went false on retry). When we have a
        -- new value, prefer it.
        demo_url        = COALESCE(EXCLUDED.demo_url, outreach_contacts.demo_url),
        demo_password   = COALESCE(EXCLUDED.demo_password, outreach_contacts.demo_password),
        show_roi_calculator = EXCLUDED.show_roi_calculator,
        demo_ok         = EXCLUDED.demo_ok,
        demo_session_id = EXCLUDED.demo_session_id,
        demo_prospect_id = COALESCE(EXCLUDED.demo_prospect_id, outreach_contacts.demo_prospect_id),

        linkedin_message    = COALESCE(outreach_contacts.linkedin_message, EXCLUDED.linkedin_message),
        linkedin_char_count = COALESCE(outreach_contacts.linkedin_char_count, EXCLUDED.linkedin_char_count),

        email_subject   = COALESCE(outreach_contacts.email_subject, EXCLUDED.email_subject),
        email_body      = COALESCE(outreach_contacts.email_body, EXCLUDED.email_body),
        email_status    = EXCLUDED.email_status,
        gmail_action_id = EXCLUDED.gmail_action_id,

        -- UI-managed columns INTENTIONALLY OMITTED:
        --   linkedin_sent, email_flagged_to_send, email_sent_at,
        --   connection_status_value, connection_sent_at,
        --   connection_accepted_at, reply_received_at, omar_notes,
        --   promoted_to_prospect_id, promoted_at

        updated_at = now()
      RETURNING *,
        (xmax = 0) AS __was_inserted`,
    [
      runId,
      input.external_key,

      a.name,
      a.display_name,
      a.domain ?? null,
      a.sfdc_id ?? null,
      a.sfdc_url ?? null,
      a.parent_sfdc_id ?? null,
      a.is_subsidiary ?? false,
      a.segment ?? null,
      a.type ?? null,
      a.owner_email ?? null,
      a.requires_coordination ?? false,
      a.health_score ?? null,
      a.current_arr ?? null,
      a.mau ?? null,
      a.mau_wow_change_pct ?? null,
      a.open_opp_count ?? 0,
      a.open_opp_arr ?? null,
      a.primary_opp_stage ?? null,
      a.claude_code_user_count ?? 0,
      a.copilot_user_count ?? 0,
      a.competitor_user_share_pct ?? null,
      a.account_signal_count_l7d ?? 0,

      c.first_name ?? null,
      c.last_name ?? null,
      c.full_name,
      c.title,
      c.function ?? null,
      c.seniority_tier,
      c.linkedin_url ?? null,
      c.linkedin_headline ?? null,
      c.linkedin_about ?? null,
      c.work_email ?? null,
      c.location_city ?? null,
      c.location_state ?? null,
      c.location_country ?? null,
      c.tenure_months_at_company ?? null,
      c.previously_at_cursor_customers ?? [],
      c.prior_employer_match_count ?? 0,

      c.sfdc_contact_id ?? null,
      c.sfdc_contact_url ?? null,
      c.exists_in_sfdc ?? false,
      c.last_sfdc_activity_at ?? null,
      c.last_sfdc_activity_owner_email ?? null,

      c.gong_call_count_l90d ?? 0,
      c.last_gong_call_at ?? null,
      c.last_gong_call_url ?? null,
      c.outreach_sequence_active ?? false,
      c.last_outreach_step_at ?? null,

      u?.cursor_user_id ?? null,
      u?.is_power_user ?? false,
      u?.is_team_admin ?? false,
      u?.is_blocked_by_rate_limit ?? false,
      u?.user_created_at ?? null,
      u?.last_active_at ?? null,
      u?.total_days_active ?? null,
      u?.weeks_active ?? null,
      u?.agent_requests_l30d ?? null,
      u?.cc_requests_l30d ?? null,
      u?.tab_accepts_l30d ?? null,
      u?.plan_type ?? null,
      u?.paid_personally ?? false,
      u?.team_id ?? null,
      u?.team_name ?? null,

      sigs.first_seen_at,
      sigs.latest_at,
      sigs.types,

      p.tier,
      p.rationale ?? null,

      demoUrl,
      demoPassword,
      input.demo?.show_roi_calculator ?? false,
      demoOk,
      input.demo?.demo_session_id ?? null,
      demoProspectId,

      linkedinFull,
      linkedinCharCount,

      e?.subject ?? null,
      e?.body ?? null,
      e?.status ?? 'drafted',
      e?.gmail_action_id ?? null,
    ],
  );
  if (!rows[0]) throw new Error('upsertContact returned no row');
  const { __was_inserted, ...row } = rows[0];
  return {
    contact: row as OutreachContactRow,
    status: __was_inserted ? 'inserted' : 'updated',
  };
}

export async function patchContact(
  id: string,
  patch: OutreachContactPatch,
): Promise<OutreachContactRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    sets.push(`${k} = $${sets.length + 1}`);
    values.push(v);
  }
  if (sets.length === 0) {
    return getContactById(id);
  }
  values.push(id);
  const { rows } = await query<OutreachContactRow>(
    `UPDATE outreach_contacts SET ${sets.join(', ')}, updated_at = now()
       WHERE id = $${values.length} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function getContactById(id: string): Promise<OutreachContactRow | null> {
  const { rows } = await query<OutreachContactRow>(
    `SELECT * FROM outreach_contacts WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getContactsByRunId(runId: string): Promise<OutreachContactRow[]> {
  const { rows } = await query<OutreachContactRow>(
    `SELECT * FROM outreach_contacts WHERE run_id = $1 ORDER BY signal_latest_at DESC`,
    [runId],
  );
  return rows;
}

export async function getContactByRunAndExternalKey(
  runId: string,
  externalKey: string,
): Promise<OutreachContactRow | null> {
  const { rows } = await query<OutreachContactRow>(
    `SELECT * FROM outreach_contacts WHERE run_id = $1 AND external_key = $2 LIMIT 1`,
    [runId, externalKey],
  );
  return rows[0] ?? null;
}

// Recent-contacts dedup feed for the agent. Returns the canonical
// dedup tuples for every contact whose latest-signal date falls
// inside the window — `since_days` defaults to 14 and matches the
// agent's prompt convention.
export async function listRecentContacts(args: {
  sinceDays: number;
  userEmail?: string | null;
}): Promise<
  Array<{
    linkedin_url: string | null;
    work_email: string | null;
    external_key: string;
    last_run_date: string;
  }>
> {
  const params: unknown[] = [args.sinceDays];
  let where = `signal_latest_at >= now() - ($1 || ' days')::interval`;
  if (args.userEmail) {
    params.push(args.userEmail);
    where += ` AND account_owner_email = $2`;
  }
  const { rows } = await query<{
    linkedin_url: string | null;
    work_email: string | null;
    external_key: string;
    last_run_date: string;
  }>(
    `SELECT DISTINCT ON (linkedin_url, work_email, external_key)
            linkedin_url, work_email, external_key,
            to_char(signal_latest_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS last_run_date
       FROM outreach_contacts
       WHERE ${where}
       ORDER BY linkedin_url, work_email, external_key, signal_latest_at DESC`,
    params,
  );
  return rows;
}

export type ListContactsFilters = {
  emailFlaggedToSend?: boolean;
  emailSent?: boolean;
  linkedinSent?: boolean;
  runId?: string;
  accountDisplayName?: string;
  priorityTier?: string;
  sinceDays?: number;
  limit?: number;
  offset?: number;
};

export async function listContacts(
  filters: ListContactsFilters = {},
): Promise<{ contacts: OutreachContactRow[]; total: number }> {
  const clauses: string[] = ['1=1'];
  const params: unknown[] = [];

  if (filters.emailFlaggedToSend === true) {
    clauses.push('email_flagged_to_send = TRUE');
    clauses.push('email_sent_at IS NULL');
  }
  if (filters.emailSent === true) {
    clauses.push('email_sent_at IS NOT NULL');
  } else if (filters.emailSent === false) {
    clauses.push('email_sent_at IS NULL');
  }
  if (filters.linkedinSent === true) {
    clauses.push('linkedin_sent = TRUE');
  } else if (filters.linkedinSent === false) {
    clauses.push('linkedin_sent = FALSE');
  }
  if (filters.runId) {
    params.push(filters.runId);
    clauses.push(`run_id = $${params.length}`);
  }
  if (filters.accountDisplayName) {
    params.push(filters.accountDisplayName);
    clauses.push(`account_display_name = $${params.length}`);
  }
  if (filters.priorityTier) {
    params.push(filters.priorityTier);
    clauses.push(`priority_tier_value = $${params.length}`);
  }
  if (filters.sinceDays != null && filters.sinceDays > 0) {
    params.push(filters.sinceDays);
    clauses.push(`signal_latest_at >= now() - ($${params.length} || ' days')::interval`);
  }

  const where = clauses.join(' AND ');
  const limit = Math.min(Math.max(filters.limit ?? 500, 1), 1000);
  const offset = Math.max(filters.offset ?? 0, 0);

  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM outreach_contacts WHERE ${where}`,
    params,
  );
  const total = Number(countRes.rows[0]?.count ?? 0);

  params.push(limit, offset);
  const { rows } = await query<OutreachContactRow>(
    `SELECT * FROM outreach_contacts
       WHERE ${where}
       ORDER BY signal_latest_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return { contacts: rows, total };
}
// Resolve external_key -> contact_id within a run, used by the
export async function mapExternalKeysToIds(
  runId: string,
  externalKeys: string[],
): Promise<Map<string, string>> {
  if (externalKeys.length === 0) return new Map();
  const { rows } = await query<{ id: string; external_key: string }>(
    `SELECT id, external_key FROM outreach_contacts
       WHERE run_id = $1 AND external_key = ANY($2::text[])`,
    [runId, externalKeys],
  );
  const map = new Map<string, string>();
  for (const r of rows) map.set(r.external_key, r.id);
  return map;
}

// Tiny helper so the /promote handler can stamp the FK on the
// outreach contact after creating the prospects row. Done outside
// the prospect-creation transaction because we want the prospect to
// exist regardless of whether the FK update succeeds (which it
// always will, but we don't want a hypothetical FK violation here
// to roll back the prospect).
export async function stampPromotedProspect(
  outreachContactId: string,
  prospectId: string,
): Promise<OutreachContactRow | null> {
  const { rows } = await query<OutreachContactRow>(
    `UPDATE outreach_contacts
        SET promoted_to_prospect_id = $2, promoted_at = now(), updated_at = now()
        WHERE id = $1
        RETURNING *`,
    [outreachContactId, prospectId],
  );
  return rows[0] ?? null;
}

// Suppress unused-import lint for withClient + getProspectBySlug —
// referenced from neighboring helpers (signals, promote) that import
// from this module.
export { withClient, getProspectBySlug };
