// Lightweight per-field validation for the outreach POST/PATCH bodies.
// We deliberately don't pull in zod here — the schemas are flat and
// validated only at the API boundary, and the rest of the codebase
// already uses inline `if (typeof x !== 'string') throw` patterns
// (see prospect-store/prospects.ts) which we mirror so the codebase
// has one validation idiom.

import type {
  OutreachContactInput,
  OutreachContactPatch,
  OutreachContactSignalInput,
  OutreachRunInput,
  OutreachAccountType,
  OutreachConnectionStatus,
  OutreachEmailDraftStatus,
  OutreachPlanType,
  OutreachPriorityTier,
  OutreachSeniorityTier,
} from './types';

export class OutreachValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'OutreachValidationError';
  }
}

const SENIORITY_VALUES: ReadonlySet<OutreachSeniorityTier> = new Set([
  'Manager',
  'Leader',
  'Executive',
]);
const PRIORITY_VALUES: ReadonlySet<OutreachPriorityTier> = new Set([
  'hot',
  'warm',
  'nurture',
]);
const ACCOUNT_TYPE_VALUES: ReadonlySet<OutreachAccountType> = new Set([
  'Customer',
  'Prospect',
  'Disqualified',
  'Other',
]);
const PLAN_TYPE_VALUES: ReadonlySet<OutreachPlanType> = new Set([
  'Free',
  'Pro',
  'Pro+',
  'Ultra',
  'Team',
  'Enterprise',
  'None',
]);
const CONNECTION_STATUS_VALUES: ReadonlySet<OutreachConnectionStatus> = new Set([
  'pending',
  'sent',
  'accepted',
  'replied',
  'closed_no_reply',
  'disqualified',
]);
const EMAIL_DRAFT_STATUS_VALUES: ReadonlySet<OutreachEmailDraftStatus> = new Set([
  'drafted',
  'no_work_email',
  'skipped_no_demo_url',
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requireObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new OutreachValidationError(field, `${field} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new OutreachValidationError(field, `${field} is required and must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new OutreachValidationError(field, `${field} must be a string or null.`);
  }
  const t = value.trim();
  return t.length > 0 ? t : null;
}

function optionalIsoDate(value: unknown, field: string): string | null {
  const s = optionalString(value, field);
  if (s === null) return null;
  if (!ISO_DATE.test(s)) {
    throw new OutreachValidationError(field, `${field} must be YYYY-MM-DD.`);
  }
  return s;
}

function requireIsoDate(value: unknown, field: string): string {
  const s = requireString(value, field);
  if (!ISO_DATE.test(s)) {
    throw new OutreachValidationError(field, `${field} must be YYYY-MM-DD.`);
  }
  return s;
}

function requireIsoDatetime(value: unknown, field: string): string {
  const s = requireString(value, field);
  if (Number.isNaN(Date.parse(s))) {
    throw new OutreachValidationError(field, `${field} must be a valid ISO 8601 datetime.`);
  }
  return s;
}

function optionalIsoDatetime(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new OutreachValidationError(field, `${field} must be a string or null.`);
  }
  if (Number.isNaN(Date.parse(value))) {
    throw new OutreachValidationError(field, `${field} must be a valid ISO 8601 datetime.`);
  }
  return value;
}

function optionalNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new OutreachValidationError(field, `${field} must be a finite number or null.`);
  }
  return value;
}

function optionalInt(value: unknown, field: string): number | null {
  const n = optionalNumber(value, field);
  if (n === null) return null;
  if (!Number.isInteger(n)) {
    throw new OutreachValidationError(field, `${field} must be an integer.`);
  }
  return n;
}

function optionalBoolean(value: unknown, field: string): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'boolean') {
    throw new OutreachValidationError(field, `${field} must be a boolean.`);
  }
  return value;
}

function optionalStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
    throw new OutreachValidationError(field, `${field} must be an array of strings.`);
  }
  return value as string[];
}

function requireEnum<T extends string>(
  value: unknown,
  field: string,
  set: ReadonlySet<T>,
): T {
  const s = requireString(value, field);
  if (!set.has(s as T)) {
    throw new OutreachValidationError(
      field,
      `${field} must be one of: ${Array.from(set).join(', ')}.`,
    );
  }
  return s as T;
}

function optionalEnum<T extends string>(
  value: unknown,
  field: string,
  set: ReadonlySet<T>,
): T | null {
  if (value === undefined || value === null || value === '') return null;
  return requireEnum(value, field, set);
}

// ---------------------------------------------------------------------------
// Run input

export function validateRunInput(body: unknown): OutreachRunInput {
  const obj = requireObject(body, 'body');
  const summary = requireObject(obj.summary, 'summary');
  return {
    automation_run_id: requireString(obj.automation_run_id, 'automation_run_id'),
    automation_revision_id: requireString(
      obj.automation_revision_id,
      'automation_revision_id',
    ),
    user_email: requireString(obj.user_email, 'user_email'),
    run_date: requireIsoDate(obj.run_date, 'run_date'),
    ran_at: requireIsoDatetime(obj.ran_at, 'ran_at'),
    window_start: requireIsoDatetime(obj.window_start, 'window_start'),
    window_end: requireIsoDatetime(obj.window_end, 'window_end'),
    summary: {
      total_contacts: optionalInt(summary.total_contacts, 'summary.total_contacts') ?? 0,
      total_emails_drafted:
        optionalInt(summary.total_emails_drafted, 'summary.total_emails_drafted') ?? 0,
      unique_accounts_signaled:
        optionalInt(summary.unique_accounts_signaled, 'summary.unique_accounts_signaled') ?? 0,
      unique_executives:
        optionalInt(summary.unique_executives, 'summary.unique_executives') ?? 0,
      unique_leaders: optionalInt(summary.unique_leaders, 'summary.unique_leaders') ?? 0,
      unique_managers: optionalInt(summary.unique_managers, 'summary.unique_managers') ?? 0,
      count_with_work_email:
        optionalInt(summary.count_with_work_email, 'summary.count_with_work_email') ?? 0,
      count_with_linkedin_url:
        optionalInt(summary.count_with_linkedin_url, 'summary.count_with_linkedin_url') ?? 0,
      accounts_with_activity: optionalStringArray(
        summary.accounts_with_activity,
        'summary.accounts_with_activity',
      ),
      accounts_with_no_signals: optionalStringArray(
        summary.accounts_with_no_signals,
        'summary.accounts_with_no_signals',
      ),
    },
  };
}

// ---------------------------------------------------------------------------
// Contact input (the meaty one)

export function validateContactInput(body: unknown, idx: number): OutreachContactInput {
  const root = requireObject(body, `contacts[${idx}]`);
  const account = requireObject(root.account, `contacts[${idx}].account`);
  const contact = requireObject(root.contact, `contacts[${idx}].contact`);
  const signals = requireObject(root.signals, `contacts[${idx}].signals`);
  const priority = requireObject(root.priority, `contacts[${idx}].priority`);
  const cursorUsageRaw = root.cursor_usage;
  const demoRaw = root.demo;
  const linkedinRaw = root.linkedin;
  const emailRaw = root.email;

  return {
    external_key: requireString(root.external_key, `contacts[${idx}].external_key`),
    account: {
      name: requireString(account.name, `contacts[${idx}].account.name`),
      display_name: requireString(
        account.display_name,
        `contacts[${idx}].account.display_name`,
      ),
      domain: optionalString(account.domain, `contacts[${idx}].account.domain`),
      sfdc_id: optionalString(account.sfdc_id, `contacts[${idx}].account.sfdc_id`),
      sfdc_url: optionalString(account.sfdc_url, `contacts[${idx}].account.sfdc_url`),
      parent_sfdc_id: optionalString(
        account.parent_sfdc_id,
        `contacts[${idx}].account.parent_sfdc_id`,
      ),
      is_subsidiary: optionalBoolean(
        account.is_subsidiary,
        `contacts[${idx}].account.is_subsidiary`,
      ),
      segment: optionalString(account.segment, `contacts[${idx}].account.segment`),
      type: optionalEnum(
        account.type,
        `contacts[${idx}].account.type`,
        ACCOUNT_TYPE_VALUES,
      ),
      owner_email: optionalString(
        account.owner_email,
        `contacts[${idx}].account.owner_email`,
      ),
      requires_coordination: optionalBoolean(
        account.requires_coordination,
        `contacts[${idx}].account.requires_coordination`,
      ),
      health_score: optionalInt(
        account.health_score,
        `contacts[${idx}].account.health_score`,
      ),
      current_arr: optionalNumber(
        account.current_arr,
        `contacts[${idx}].account.current_arr`,
      ),
      mau: optionalInt(account.mau, `contacts[${idx}].account.mau`),
      mau_wow_change_pct: optionalNumber(
        account.mau_wow_change_pct,
        `contacts[${idx}].account.mau_wow_change_pct`,
      ),
      open_opp_count:
        optionalInt(account.open_opp_count, `contacts[${idx}].account.open_opp_count`) ?? 0,
      open_opp_arr: optionalNumber(
        account.open_opp_arr,
        `contacts[${idx}].account.open_opp_arr`,
      ),
      primary_opp_stage: optionalString(
        account.primary_opp_stage,
        `contacts[${idx}].account.primary_opp_stage`,
      ),
      claude_code_user_count:
        optionalInt(
          account.claude_code_user_count,
          `contacts[${idx}].account.claude_code_user_count`,
        ) ?? 0,
      copilot_user_count:
        optionalInt(
          account.copilot_user_count,
          `contacts[${idx}].account.copilot_user_count`,
        ) ?? 0,
      competitor_user_share_pct: optionalNumber(
        account.competitor_user_share_pct,
        `contacts[${idx}].account.competitor_user_share_pct`,
      ),
      account_signal_count_l7d:
        optionalInt(
          account.account_signal_count_l7d,
          `contacts[${idx}].account.account_signal_count_l7d`,
        ) ?? 0,
    },
    contact: {
      first_name: optionalString(
        contact.first_name,
        `contacts[${idx}].contact.first_name`,
      ),
      last_name: optionalString(contact.last_name, `contacts[${idx}].contact.last_name`),
      full_name: requireString(contact.full_name, `contacts[${idx}].contact.full_name`),
      title: requireString(contact.title, `contacts[${idx}].contact.title`),
      function: optionalString(contact.function, `contacts[${idx}].contact.function`),
      seniority_tier: requireEnum(
        contact.seniority_tier,
        `contacts[${idx}].contact.seniority_tier`,
        SENIORITY_VALUES,
      ),
      linkedin_url: optionalString(
        contact.linkedin_url,
        `contacts[${idx}].contact.linkedin_url`,
      ),
      linkedin_headline: optionalString(
        contact.linkedin_headline,
        `contacts[${idx}].contact.linkedin_headline`,
      ),
      linkedin_about: optionalString(
        contact.linkedin_about,
        `contacts[${idx}].contact.linkedin_about`,
      ),
      work_email: optionalString(contact.work_email, `contacts[${idx}].contact.work_email`),
      location_city: optionalString(
        contact.location_city,
        `contacts[${idx}].contact.location_city`,
      ),
      location_state: optionalString(
        contact.location_state,
        `contacts[${idx}].contact.location_state`,
      ),
      location_country: optionalString(
        contact.location_country,
        `contacts[${idx}].contact.location_country`,
      ),
      tenure_months_at_company: optionalInt(
        contact.tenure_months_at_company,
        `contacts[${idx}].contact.tenure_months_at_company`,
      ),
      previously_at_cursor_customers: optionalStringArray(
        contact.previously_at_cursor_customers,
        `contacts[${idx}].contact.previously_at_cursor_customers`,
      ),
      prior_employer_match_count:
        optionalInt(
          contact.prior_employer_match_count,
          `contacts[${idx}].contact.prior_employer_match_count`,
        ) ?? 0,
      sfdc_contact_id: optionalString(
        contact.sfdc_contact_id,
        `contacts[${idx}].contact.sfdc_contact_id`,
      ),
      sfdc_contact_url: optionalString(
        contact.sfdc_contact_url,
        `contacts[${idx}].contact.sfdc_contact_url`,
      ),
      exists_in_sfdc: optionalBoolean(
        contact.exists_in_sfdc,
        `contacts[${idx}].contact.exists_in_sfdc`,
      ),
      last_sfdc_activity_at: optionalIsoDatetime(
        contact.last_sfdc_activity_at,
        `contacts[${idx}].contact.last_sfdc_activity_at`,
      ),
      last_sfdc_activity_owner_email: optionalString(
        contact.last_sfdc_activity_owner_email,
        `contacts[${idx}].contact.last_sfdc_activity_owner_email`,
      ),
      gong_call_count_l90d:
        optionalInt(
          contact.gong_call_count_l90d,
          `contacts[${idx}].contact.gong_call_count_l90d`,
        ) ?? 0,
      last_gong_call_at: optionalIsoDatetime(
        contact.last_gong_call_at,
        `contacts[${idx}].contact.last_gong_call_at`,
      ),
      last_gong_call_url: optionalString(
        contact.last_gong_call_url,
        `contacts[${idx}].contact.last_gong_call_url`,
      ),
      outreach_sequence_active: optionalBoolean(
        contact.outreach_sequence_active,
        `contacts[${idx}].contact.outreach_sequence_active`,
      ),
      last_outreach_step_at: optionalIsoDatetime(
        contact.last_outreach_step_at,
        `contacts[${idx}].contact.last_outreach_step_at`,
      ),
    },
    cursor_usage:
      cursorUsageRaw === undefined || cursorUsageRaw === null
        ? null
        : (() => {
            const u = requireObject(cursorUsageRaw, `contacts[${idx}].cursor_usage`);
            return {
              cursor_user_id: optionalString(u.cursor_user_id, `contacts[${idx}].cursor_usage.cursor_user_id`),
              signup_email: optionalString(u.signup_email, `contacts[${idx}].cursor_usage.signup_email`),
              is_power_user: optionalBoolean(u.is_power_user, `contacts[${idx}].cursor_usage.is_power_user`),
              is_team_admin: optionalBoolean(u.is_team_admin, `contacts[${idx}].cursor_usage.is_team_admin`),
              is_blocked_by_rate_limit: optionalBoolean(
                u.is_blocked_by_rate_limit,
                `contacts[${idx}].cursor_usage.is_blocked_by_rate_limit`,
              ),
              user_created_at: optionalIsoDatetime(u.user_created_at, `contacts[${idx}].cursor_usage.user_created_at`),
              last_active_at: optionalIsoDatetime(u.last_active_at, `contacts[${idx}].cursor_usage.last_active_at`),
              total_days_active: optionalInt(u.total_days_active, `contacts[${idx}].cursor_usage.total_days_active`),
              weeks_active: optionalInt(u.weeks_active, `contacts[${idx}].cursor_usage.weeks_active`),
              agent_requests_l30d: optionalInt(
                u.agent_requests_l30d,
                `contacts[${idx}].cursor_usage.agent_requests_l30d`,
              ),
              cc_requests_l30d: optionalInt(u.cc_requests_l30d, `contacts[${idx}].cursor_usage.cc_requests_l30d`),
              tab_accepts_l30d: optionalInt(u.tab_accepts_l30d, `contacts[${idx}].cursor_usage.tab_accepts_l30d`),
              plan_type: optionalEnum(u.plan_type, `contacts[${idx}].cursor_usage.plan_type`, PLAN_TYPE_VALUES),
              paid_personally: optionalBoolean(u.paid_personally, `contacts[${idx}].cursor_usage.paid_personally`),
              team_id: optionalString(u.team_id, `contacts[${idx}].cursor_usage.team_id`),
              team_name: optionalString(u.team_name, `contacts[${idx}].cursor_usage.team_name`),
            };
          })(),
    signals: {
      first_seen_at: requireIsoDatetime(
        signals.first_seen_at,
        `contacts[${idx}].signals.first_seen_at`,
      ),
      latest_at: requireIsoDatetime(
        signals.latest_at,
        `contacts[${idx}].signals.latest_at`,
      ),
      types: optionalStringArray(signals.types, `contacts[${idx}].signals.types`),
      raw: Array.isArray(signals.raw)
        ? (signals.raw as Array<Record<string, unknown>>)
        : undefined,
    },
    priority: {
      tier: requireEnum(
        priority.tier,
        `contacts[${idx}].priority.tier`,
        PRIORITY_VALUES,
      ),
      rationale: optionalString(
        priority.rationale,
        `contacts[${idx}].priority.rationale`,
      ),
    },
    demo:
      demoRaw === undefined || demoRaw === null
        ? undefined
        : (() => {
            const d = requireObject(demoRaw, `contacts[${idx}].demo`);
            return {
              demo_url: optionalString(d.demo_url, `contacts[${idx}].demo.demo_url`),
              demo_password: optionalString(d.demo_password, `contacts[${idx}].demo.demo_password`),
              show_roi_calculator: optionalBoolean(
                d.show_roi_calculator,
                `contacts[${idx}].demo.show_roi_calculator`,
              ),
              demo_ok: optionalBoolean(d.demo_ok, `contacts[${idx}].demo.demo_ok`),
              demo_session_id: optionalString(
                d.demo_session_id,
                `contacts[${idx}].demo.demo_session_id`,
              ),
            };
          })(),
    linkedin:
      linkedinRaw === undefined || linkedinRaw === null
        ? undefined
        : (() => {
            const l = requireObject(linkedinRaw, `contacts[${idx}].linkedin`);
            return {
              message: optionalString(l.message, `contacts[${idx}].linkedin.message`),
              char_count: optionalInt(l.char_count, `contacts[${idx}].linkedin.char_count`),
            };
          })(),
    email:
      emailRaw === undefined || emailRaw === null
        ? undefined
        : (() => {
            const e = requireObject(emailRaw, `contacts[${idx}].email`);
            return {
              subject: optionalString(e.subject, `contacts[${idx}].email.subject`),
              body: optionalString(e.body, `contacts[${idx}].email.body`),
              status:
                optionalEnum(e.status, `contacts[${idx}].email.status`, EMAIL_DRAFT_STATUS_VALUES) ??
                undefined,
              gmail_action_id: optionalString(
                e.gmail_action_id,
                `contacts[${idx}].email.gmail_action_id`,
              ),
            };
          })(),
  };
}

// ---------------------------------------------------------------------------
// Signal input

export function validateSignalInput(
  body: unknown,
  idx: number,
): OutreachContactSignalInput {
  const obj = requireObject(body, `signals[${idx}]`);
  return {
    contact_external_key: requireString(
      obj.contact_external_key,
      `signals[${idx}].contact_external_key`,
    ),
    signal_type: requireString(obj.signal_type, `signals[${idx}].signal_type`),
    detected_at: requireIsoDatetime(obj.detected_at, `signals[${idx}].detected_at`),
    raw:
      obj.raw === undefined || obj.raw === null
        ? null
        : (requireObject(obj.raw, `signals[${idx}].raw`) as Record<string, unknown>),
  };
}

// ---------------------------------------------------------------------------
// Contact PATCH (UI-managed lifecycle)

const PATCHABLE_FIELDS: ReadonlySet<keyof OutreachContactPatch> = new Set([
  'linkedin_message',
  'linkedin_sent',
  'email_subject',
  'email_body',
  'email_flagged_to_send',
  'email_sent_at',
  'connection_status_value',
  'connection_sent_at',
  'connection_accepted_at',
  'reply_received_at',
  'omar_notes',
]);

export function validateContactPatch(body: unknown): OutreachContactPatch {
  const obj = requireObject(body, 'body');
  const out: OutreachContactPatch = {};
  for (const key of Object.keys(obj)) {
    if (!PATCHABLE_FIELDS.has(key as keyof OutreachContactPatch)) {
      throw new OutreachValidationError(
        key,
        `Field "${key}" is not patchable. Allowed: ${Array.from(PATCHABLE_FIELDS).join(', ')}.`,
      );
    }
  }
  if ('connection_status_value' in obj) {
    out.connection_status_value = requireEnum(
      obj.connection_status_value,
      'connection_status_value',
      CONNECTION_STATUS_VALUES,
    );
  }
  if ('linkedin_message' in obj) {
    out.linkedin_message = optionalString(obj.linkedin_message, 'linkedin_message');
  }
  if ('linkedin_sent' in obj) {
    out.linkedin_sent = optionalBoolean(obj.linkedin_sent, 'linkedin_sent');
  }
  if ('email_subject' in obj) {
    out.email_subject = optionalString(obj.email_subject, 'email_subject');
  }
  if ('email_body' in obj) {
    out.email_body = optionalString(obj.email_body, 'email_body');
  }
  if ('email_flagged_to_send' in obj) {
    out.email_flagged_to_send = optionalBoolean(
      obj.email_flagged_to_send,
      'email_flagged_to_send',
    );
  }
  if ('email_sent_at' in obj) {
    out.email_sent_at = optionalIsoDatetime(obj.email_sent_at, 'email_sent_at');
  }
  if ('connection_sent_at' in obj) {
    out.connection_sent_at = optionalIsoDatetime(
      obj.connection_sent_at,
      'connection_sent_at',
    );
  }
  if ('connection_accepted_at' in obj) {
    out.connection_accepted_at = optionalIsoDatetime(
      obj.connection_accepted_at,
      'connection_accepted_at',
    );
  }
  if ('reply_received_at' in obj) {
    out.reply_received_at = optionalIsoDatetime(
      obj.reply_received_at,
      'reply_received_at',
    );
  }
  if ('omar_notes' in obj) {
    out.omar_notes = optionalString(obj.omar_notes, 'omar_notes');
  }
  return out;
}
