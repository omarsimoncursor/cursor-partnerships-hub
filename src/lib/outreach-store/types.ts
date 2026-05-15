// Mirrors the `outreach_runs` / `outreach_contacts` /
// `outreach_contact_signals` SQL schema. Ordering and naming are
// kept in lock-step with the schema so a future column addition is
// a single edit on each side.

export type OutreachSeniorityTier = 'Manager' | 'Leader' | 'Executive';
export type OutreachConnectionStatus =
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'replied'
  | 'closed_no_reply'
  | 'disqualified';
export type OutreachPriorityTier = 'hot' | 'warm' | 'nurture';
export type OutreachAccountType = 'Customer' | 'Prospect' | 'Disqualified' | 'Other';
export type OutreachPlanType =
  | 'Free'
  | 'Pro'
  | 'Pro+'
  | 'Ultra'
  | 'Team'
  | 'Enterprise'
  | 'None';
export type OutreachEmailDraftStatus =
  | 'drafted'
  | 'no_work_email'
  | 'skipped_no_demo_url';

export type OutreachRunRow = {
  id: string;
  automation_run_id: string;
  automation_revision_id: string;
  user_email: string;
  run_date: string;
  ran_at: string;
  window_start: string;
  window_end: string;
  total_contacts: number;
  total_emails_drafted: number;
  unique_accounts_signaled: number;
  unique_executives: number;
  unique_leaders: number;
  unique_managers: number;
  count_with_work_email: number;
  count_with_linkedin_url: number;
  accounts_with_activity: string[];
  accounts_with_no_signals: string[];
  created_at: string;
  updated_at: string;
};

// Mirrors `outreach_contacts` row. `string` for every TIMESTAMPTZ —
// `pg` gives us ISO strings with `types.setTypeParser` left at default,
// so we don't pull in a Date wrapper here.
export type OutreachContactRow = {
  id: string;
  run_id: string;
  external_key: string;

  // Account
  account_name: string;
  account_display_name: string;
  account_domain: string | null;
  account_sfdc_id: string | null;
  account_sfdc_url: string | null;
  parent_account_sfdc_id: string | null;
  is_subsidiary: boolean;
  account_segment: string | null;
  account_type_value: OutreachAccountType | null;
  account_owner_email: string | null;
  requires_coordination: boolean;
  account_health_score: number | null;
  account_current_arr: string | number | null;
  account_mau: number | null;
  account_mau_wow_change_pct: string | number | null;
  open_opp_count: number;
  open_opp_arr: string | number | null;
  primary_opp_stage: string | null;
  claude_code_user_count: number;
  copilot_user_count: number;
  competitor_user_share_pct: string | number | null;
  account_signal_count_l7d: number;

  // Identity
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  title: string;
  function_value: string | null;
  seniority_tier_value: OutreachSeniorityTier;
  linkedin_url: string | null;
  linkedin_headline: string | null;
  linkedin_about: string | null;
  work_email: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  tenure_months_at_company: number | null;
  previously_at_cursor_customers: string[];
  prior_employer_match_count: number;

  // SFDC
  sfdc_contact_id: string | null;
  sfdc_contact_url: string | null;
  exists_in_sfdc: boolean;
  last_sfdc_activity_at: string | null;
  last_sfdc_activity_owner_email: string | null;

  // Engagement
  gong_call_count_l90d: number;
  last_gong_call_at: string | null;
  last_gong_call_url: string | null;
  outreach_sequence_active: boolean;
  last_outreach_step_at: string | null;

  // Cursor product usage
  cursor_user_id: string | null;
  is_power_user: boolean;
  is_team_admin: boolean;
  is_blocked_by_rate_limit: boolean;
  user_created_at: string | null;
  last_active_at: string | null;
  total_days_active: number | null;
  weeks_active: number | null;
  agent_requests_l30d: number | null;
  cc_requests_l30d: number | null;
  tab_accepts_l30d: number | null;
  plan_type_value: OutreachPlanType | null;
  paid_personally: boolean;
  cursor_team_id: string | null;
  cursor_team_name: string | null;

  // Signal rollup
  signal_first_seen_at: string;
  signal_latest_at: string;
  signal_types: string[];

  // Priority
  priority_tier_value: OutreachPriorityTier;
  priority_rationale: string | null;

  // Demo
  demo_url: string | null;
  demo_password: string | null;
  show_roi_calculator: boolean;
  demo_ok: boolean;
  demo_session_id: string | null;
  demo_prospect_id: string | null;

  // LinkedIn
  linkedin_message: string | null;
  linkedin_char_count: number | null;

  // Email
  email_subject: string | null;
  email_body: string | null;
  email_status: OutreachEmailDraftStatus;
  gmail_action_id: string | null;

  // Lifecycle (UI-managed)
  connection_status_value: OutreachConnectionStatus;
  connection_sent_at: string | null;
  connection_accepted_at: string | null;
  reply_received_at: string | null;
  omar_notes: string | null;

  // Cross-table
  promoted_to_prospect_id: string | null;
  promoted_at: string | null;

  created_at: string;
  updated_at: string;
};

export type OutreachContactSignalRow = {
  id: string;
  contact_id: string;
  signal_type: string;
  detected_at: string;
  raw: Record<string, unknown> | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Input shapes (POST /api/outreach/...). Mirror the agent's payload structure.

export type OutreachRunInput = {
  automation_run_id: string;
  automation_revision_id: string;
  user_email: string;
  run_date: string;
  ran_at: string;
  window_start: string;
  window_end: string;
  summary: {
    total_contacts: number;
    total_emails_drafted: number;
    unique_accounts_signaled: number;
    unique_executives: number;
    unique_leaders: number;
    unique_managers: number;
    count_with_work_email: number;
    count_with_linkedin_url: number;
    accounts_with_activity: string[];
    accounts_with_no_signals: string[];
  };
};

export type OutreachContactInput = {
  external_key: string;
  account: {
    name: string;
    display_name: string;
    domain?: string | null;
    sfdc_id?: string | null;
    sfdc_url?: string | null;
    parent_sfdc_id?: string | null;
    is_subsidiary?: boolean;
    segment?: string | null;
    type?: OutreachAccountType | null;
    owner_email?: string | null;
    requires_coordination?: boolean;
    health_score?: number | null;
    current_arr?: number | null;
    mau?: number | null;
    mau_wow_change_pct?: number | null;
    open_opp_count?: number;
    open_opp_arr?: number | null;
    primary_opp_stage?: string | null;
    claude_code_user_count?: number;
    copilot_user_count?: number;
    competitor_user_share_pct?: number | null;
    account_signal_count_l7d?: number;
  };
  contact: {
    first_name?: string | null;
    last_name?: string | null;
    full_name: string;
    title: string;
    function?: string | null;
    seniority_tier: OutreachSeniorityTier;
    linkedin_url?: string | null;
    linkedin_headline?: string | null;
    linkedin_about?: string | null;
    work_email?: string | null;
    location_city?: string | null;
    location_state?: string | null;
    location_country?: string | null;
    tenure_months_at_company?: number | null;
    previously_at_cursor_customers?: string[];
    prior_employer_match_count?: number;
    sfdc_contact_id?: string | null;
    sfdc_contact_url?: string | null;
    exists_in_sfdc?: boolean;
    last_sfdc_activity_at?: string | null;
    last_sfdc_activity_owner_email?: string | null;
    gong_call_count_l90d?: number;
    last_gong_call_at?: string | null;
    last_gong_call_url?: string | null;
    outreach_sequence_active?: boolean;
    last_outreach_step_at?: string | null;
  };
  cursor_usage?: {
    cursor_user_id?: string | null;
    is_power_user?: boolean;
    is_team_admin?: boolean;
    is_blocked_by_rate_limit?: boolean;
    user_created_at?: string | null;
    last_active_at?: string | null;
    total_days_active?: number | null;
    weeks_active?: number | null;
    agent_requests_l30d?: number | null;
    cc_requests_l30d?: number | null;
    tab_accepts_l30d?: number | null;
    plan_type?: OutreachPlanType | null;
    paid_personally?: boolean;
    team_id?: string | null;
    team_name?: string | null;
  } | null;
  signals: {
    first_seen_at: string;
    latest_at: string;
    types: string[];
    raw?: Array<Record<string, unknown>>;
  };
  priority: {
    tier: OutreachPriorityTier;
    rationale?: string | null;
  };
  demo?: {
    demo_url?: string | null;
    demo_password?: string | null;
    show_roi_calculator?: boolean;
    demo_ok?: boolean;
    demo_session_id?: string | null;
  };
  linkedin?: {
    // Prose only; the server appends ` <url> (pw: <password>)` server-side
    // when persisting and uses the resulting full message in the response
    // and on the dashboard. char_count from the agent is informational.
    message?: string | null;
    char_count?: number | null;
  };
  email?: {
    subject?: string | null;
    body?: string | null;
    status?: OutreachEmailDraftStatus;
    gmail_action_id?: string | null;
  };
};

export type OutreachContactSignalInput = {
  contact_external_key: string;
  signal_type: string;
  detected_at: string;
  raw?: Record<string, unknown> | null;
};

// PATCH /api/outreach/contacts/:id — only the UI-managed lifecycle columns
// can be flipped via this endpoint. The agent's batch upsert preserves
// these columns on re-POST.
export type OutreachContactPatch = Partial<{
  connection_status_value: OutreachConnectionStatus;
  connection_sent_at: string | null;
  connection_accepted_at: string | null;
  reply_received_at: string | null;
  omar_notes: string | null;
}>;
