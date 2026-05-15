-- Schema for the ChatGTM <-> personalized prospect demo automation.
-- Designed for Neon Postgres but compatible with any Postgres 13+.
--
-- Run via POST /api/db/init (with X-Init-Token) or psql directly.

CREATE TABLE IF NOT EXISTS companies (
  domain        TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  accent        TEXT,
  default_techs TEXT[],
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospects (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   TEXT NOT NULL UNIQUE,
  name                   TEXT NOT NULL,
  email                  TEXT,
  level_raw              TEXT,
  level_normalized       TEXT NOT NULL,
  linkedin_url           TEXT,
  company_name           TEXT NOT NULL,
  company_domain         TEXT NOT NULL,
  company_accent         TEXT,
  technologies_raw       TEXT[] NOT NULL DEFAULT '{}',
  vendor_ids             TEXT[] NOT NULL DEFAULT '{}',
  unmatched_technologies TEXT[] NOT NULL DEFAULT '{}',
  mcp_relevant           BOOLEAN NOT NULL DEFAULT FALSE,
  sdk_workflow           TEXT,
  show_roi_calculator    BOOLEAN NOT NULL DEFAULT FALSE,
  password               TEXT NOT NULL,
  gmail_draft_link       TEXT,
  linkedin_message_link  TEXT,
  notion_page_id         TEXT,
  source                 TEXT NOT NULL DEFAULT 'chatgtm',
  metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Build state: ChatGTM gets the URL + password back synchronously, but the
  -- demo build (logo prefetch, color match, etc.) runs in the background.
  -- 'queued'   = created, build hasn't started yet
  -- 'building' = build worker has picked it up
  -- 'ready'    = demo is fully built and renders normally
  -- 'failed'   = build hit an error; the demo still renders but with the fallback assets
  build_status           TEXT NOT NULL DEFAULT 'queued',
  build_started_at       TIMESTAMPTZ,
  build_completed_at     TIMESTAMPTZ,
  build_error            TEXT,
  build_artifacts        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backfill columns first so the indexes below can reference them when
-- the table was created by an older schema version.
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS build_status       TEXT NOT NULL DEFAULT 'queued';
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS build_started_at   TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS build_completed_at TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS build_error        TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS build_artifacts    JSONB NOT NULL DEFAULT '{}'::jsonb;
-- Promoted from metadata.category so the demo page can drive a category-
-- aware presentation (hero copy, vendor ordering, SDK composer preset).
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS category           TEXT NOT NULL DEFAULT 'unknown';
-- Per-prospect outreach tracker: timestamp the rep checked the
-- "I've reached out to them on LinkedIn" box on the analytics tab.
-- NULL means we have not yet contacted this prospect post-open.
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS reached_out_at     TIMESTAMPTZ;

-- ChatGTM outreach-tracking columns (Prospecting Blitz + Sequence
-- Orchestrator + Reply Detector). All nullable so existing rows are
-- unaffected. Enum-shaped TEXT columns (`team`, `classified_level`,
-- ...) are validated at the application layer so new values can be
-- added without DB migrations.
--
-- - linkedin_draft       Personalized LinkedIn connect request copy
--                        (Prospecting Blitz writes; ~300-char target).
-- - linkedin_sent        Whether the LinkedIn message went out.
-- - mcp_detail           Two-sentence "how Cursor MCP/SDK applies" blurb.
-- - team                 Classified functional team (e.g. "Platform").
-- - classified_level     Classified seniority bucket (Executive / Leader
--                        (Dir/VP+) / Manager / IC). Distinct from the
--                        existing `level_normalized` (lowercase regex
--                        normalization of the raw title).
-- - last_sequence_sent   Which step of the 6-step email sequence was
--                        last sent. NULL = not started; 6 = complete.
-- - last_email_send_date Date the last email was sent.
-- - replied              Toggled by Reply Detector; the Sequence
--                        Orchestrator skips replied prospects.
-- - thread_id            Gmail thread id, captured after Email 1 so the
--                        rest of the sequence replies in-thread.
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS linkedin_draft       TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS linkedin_sent        BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS mcp_detail           TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS team                 TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS classified_level     TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS last_sequence_sent   INTEGER;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS last_email_send_date DATE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS replied              BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS thread_id            TEXT;

-- The spec defines a CHECK (last_sequence_sent BETWEEN 1 AND 6).
-- Add it idempotently so re-running the migration is safe; we don't
-- have a clean IF NOT EXISTS for constraints in PG 16, so check
-- pg_constraint first.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'prospects_last_sequence_sent_range'
  ) THEN
    ALTER TABLE prospects
      ADD CONSTRAINT prospects_last_sequence_sent_range
      CHECK (last_sequence_sent IS NULL OR (last_sequence_sent BETWEEN 1 AND 6));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS prospects_company_domain_idx ON prospects(company_domain);
CREATE INDEX IF NOT EXISTS prospects_email_idx           ON prospects(email);
CREATE INDEX IF NOT EXISTS prospects_created_at_idx      ON prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS prospects_build_status_idx    ON prospects(build_status);
CREATE INDEX IF NOT EXISTS prospects_category_idx        ON prospects(category);
CREATE INDEX IF NOT EXISTS prospects_reached_out_at_idx  ON prospects(reached_out_at);
-- Outreach indexes — the Sequence Orchestrator filters
-- "company_domain = X AND replied = false AND last_sequence_sent < 6"
-- on every run. The single-column company_domain index already exists
-- above; partial index keeps the active-sequence subset hot.
CREATE INDEX IF NOT EXISTS prospects_active_sequence_idx
  ON prospects(company_domain, last_sequence_sent)
  WHERE replied = FALSE;

CREATE TABLE IF NOT EXISTS prospect_views (
  id          BIGSERIAL PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip          TEXT,
  user_agent  TEXT,
  unlocked    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS prospect_views_prospect_idx ON prospect_views(prospect_id, viewed_at DESC);

-- Fine-grained engagement events emitted by the prospect's browser
-- (vendor demo runs, SDK demo runs, artifact opens, ROI slider changes,
-- hero CTA clicks, ...). Used by the admin "Activity" view to see what
-- the prospect actually engaged with after opening their personalized
-- demo. Append-only; the client posts here from /p/[slug] and the slug
-- is the implicit auth.
CREATE TABLE IF NOT EXISTS prospect_events (
  id          BIGSERIAL PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  event_data  JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id  TEXT,
  ip          TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS prospect_events_prospect_idx ON prospect_events(prospect_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS prospect_events_slug_idx     ON prospect_events(slug, occurred_at DESC);
CREATE INDEX IF NOT EXISTS prospect_events_type_idx     ON prospect_events(event_type);

-- ===========================================================================
-- Outreach territory dashboard (intent-signal driven LinkedIn outreach)
-- ===========================================================================
--
-- Distinct from the cold-outbound `prospects` table above. The intent-signal
-- agent ('Intent Signal LinkedIn Outreach') runs every weekday morning, scans
-- 5 primary accounts + 18 Cognizant subsidiaries for signals from the last
-- 24h, and POSTs the day's contacts here. The dashboard at /outreach/runs/<id>
-- and /outreach/dashboard reads from these tables.
--
-- Cross-table link: `outreach_contacts.promoted_to_prospect_id` FKs into
-- `prospects(id)` when Omar clicks "Enroll in sequence" on a contact card,
-- so the cold sequence orchestrator picks them up. The reverse direction
-- (cold prospect tripped an intent signal) is computed via natural-key match
-- on `linkedin_url || work_email = prospects.linkedin_url || email`.

-- Enums. Created idempotently — Postgres lacks a built-in IF NOT EXISTS for
-- CREATE TYPE so we wrap each in a DO block that catches the duplicate-object
-- error.
DO $$ BEGIN
  CREATE TYPE outreach_seniority_tier AS ENUM ('Manager', 'Leader', 'Executive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outreach_email_draft_status AS ENUM ('drafted', 'no_work_email', 'skipped_no_demo_url');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outreach_connection_status AS ENUM ('pending', 'sent', 'accepted', 'replied', 'closed_no_reply', 'disqualified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outreach_priority_tier AS ENUM ('hot', 'warm', 'nurture');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outreach_account_type AS ENUM ('Customer', 'Prospect', 'Disqualified', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outreach_plan_type AS ENUM ('Free', 'Pro', 'Pro+', 'Ultra', 'Team', 'Enterprise', 'None');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS outreach_runs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The agent's own run id; idempotency anchor. Re-POSTing a run with the
  -- same automation_run_id last-write-wins-updates the summary counters.
  automation_run_id        TEXT NOT NULL UNIQUE,
  automation_revision_id   TEXT NOT NULL,
  user_email               TEXT NOT NULL,
  run_date                 DATE NOT NULL,
  ran_at                   TIMESTAMPTZ NOT NULL,
  window_start             TIMESTAMPTZ NOT NULL,
  window_end               TIMESTAMPTZ NOT NULL,
  total_contacts           INT NOT NULL DEFAULT 0,
  total_emails_drafted     INT NOT NULL DEFAULT 0,
  unique_accounts_signaled INT NOT NULL DEFAULT 0,
  unique_executives        INT NOT NULL DEFAULT 0,
  unique_leaders           INT NOT NULL DEFAULT 0,
  unique_managers          INT NOT NULL DEFAULT 0,
  count_with_work_email    INT NOT NULL DEFAULT 0,
  count_with_linkedin_url  INT NOT NULL DEFAULT 0,
  accounts_with_activity   TEXT[] NOT NULL DEFAULT '{}',
  accounts_with_no_signals TEXT[] NOT NULL DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outreach_runs_user_date_idx ON outreach_runs(user_email, run_date DESC);

CREATE TABLE IF NOT EXISTS outreach_contacts (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                          UUID NOT NULL REFERENCES outreach_runs(id) ON DELETE CASCADE,
  external_key                    TEXT NOT NULL,

  -- Account context (rolls up to account_display_name; account_name is the
  -- specific entity, e.g. "Cognizant Softvision" under display_name "Cognizant").
  account_name                    TEXT NOT NULL,
  account_display_name            TEXT NOT NULL,
  account_domain                  TEXT,
  account_sfdc_id                 TEXT,
  account_sfdc_url                TEXT,
  parent_account_sfdc_id          TEXT,
  is_subsidiary                   BOOLEAN NOT NULL DEFAULT FALSE,
  account_segment                 TEXT,
  account_type_value              outreach_account_type,
  account_owner_email             TEXT,
  requires_coordination           BOOLEAN NOT NULL DEFAULT FALSE,
  account_health_score            INT,
  account_current_arr             NUMERIC,
  account_mau                     INT,
  account_mau_wow_change_pct      NUMERIC,
  open_opp_count                  INT NOT NULL DEFAULT 0,
  open_opp_arr                    NUMERIC,
  primary_opp_stage               TEXT,
  claude_code_user_count          INT NOT NULL DEFAULT 0,
  copilot_user_count              INT NOT NULL DEFAULT 0,
  competitor_user_share_pct       NUMERIC,
  account_signal_count_l7d        INT NOT NULL DEFAULT 0,

  -- Contact identity.
  first_name                      TEXT,
  last_name                       TEXT,
  full_name                       TEXT NOT NULL,
  title                           TEXT NOT NULL,
  function_value                  TEXT,
  seniority_tier_value            outreach_seniority_tier NOT NULL,
  linkedin_url                    TEXT,
  linkedin_headline               TEXT,
  linkedin_about                  TEXT,
  work_email                      TEXT,
  location_city                   TEXT,
  location_state                  TEXT,
  location_country                TEXT,
  tenure_months_at_company        INT,
  previously_at_cursor_customers  TEXT[] NOT NULL DEFAULT '{}',
  prior_employer_match_count      INT NOT NULL DEFAULT 0,

  -- SFDC presence.
  sfdc_contact_id                 TEXT,
  sfdc_contact_url                TEXT,
  exists_in_sfdc                  BOOLEAN NOT NULL DEFAULT FALSE,
  last_sfdc_activity_at           TIMESTAMPTZ,
  last_sfdc_activity_owner_email  TEXT,

  -- Engagement history (Gong + existing email orchestrator).
  gong_call_count_l90d            INT NOT NULL DEFAULT 0,
  last_gong_call_at               TIMESTAMPTZ,
  last_gong_call_url              TEXT,
  outreach_sequence_active        BOOLEAN NOT NULL DEFAULT FALSE,
  last_outreach_step_at           TIMESTAMPTZ,

  -- Cursor product usage (entire block null when contact isn't a Cursor user).
  cursor_user_id                  TEXT,
  is_power_user                   BOOLEAN NOT NULL DEFAULT FALSE,
  is_team_admin                   BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked_by_rate_limit        BOOLEAN NOT NULL DEFAULT FALSE,
  user_created_at                 TIMESTAMPTZ,
  last_active_at                  TIMESTAMPTZ,
  total_days_active               INT,
  weeks_active                    INT,
  agent_requests_l30d             INT,
  cc_requests_l30d                INT,
  tab_accepts_l30d                INT,
  plan_type_value                 outreach_plan_type,
  paid_personally                 BOOLEAN NOT NULL DEFAULT FALSE,
  cursor_team_id                  TEXT,
  cursor_team_name                TEXT,

  -- Signal rollup (detail in outreach_contact_signals).
  signal_first_seen_at            TIMESTAMPTZ NOT NULL,
  signal_latest_at                TIMESTAMPTZ NOT NULL,
  signal_types                    TEXT[] NOT NULL,

  -- Priority (agent-computed).
  priority_tier_value             outreach_priority_tier NOT NULL DEFAULT 'warm',
  priority_rationale              TEXT,

  -- Demo personalization. Server-generated as a side effect of upsert when
  -- demo_ok is true and we don't already have one (joined by linkedin_url
  -- or work_email against the existing prospects table).
  demo_url                        TEXT,
  demo_password                   TEXT,
  show_roi_calculator             BOOLEAN NOT NULL DEFAULT FALSE,
  demo_ok                         BOOLEAN NOT NULL DEFAULT FALSE,
  demo_session_id                 TEXT,
  -- The prospects.id whose slug backs demo_url. Lets us pivot to the demo's
  -- engagement events without re-resolving via slug.
  demo_prospect_id                UUID REFERENCES prospects(id) ON DELETE SET NULL,

  -- LinkedIn message. Stored verbatim from the agent (brief thank-you +
  -- training offer). The dashboard's Send LI dialog copies this as-is.
  linkedin_message                TEXT,
  linkedin_char_count             INT,
  linkedin_sent                   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Email draft (agent-authored when work_email is present). Omar edits
  -- in the Intent Data tab and flags rows for the one-time send worker.
  email_subject                   TEXT,
  email_body                      TEXT,
  email_status                    outreach_email_draft_status NOT NULL,
  gmail_action_id                 TEXT,
  email_flagged_to_send           BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at                   TIMESTAMPTZ,

  -- Legacy lifecycle columns (kept for backwards compat; Intent Data tab
  -- uses linkedin_sent + email_flagged_to_send instead).
  connection_status_value         outreach_connection_status NOT NULL DEFAULT 'pending',
  connection_sent_at              TIMESTAMPTZ,
  connection_accepted_at          TIMESTAMPTZ,
  reply_received_at               TIMESTAMPTZ,
  omar_notes                      TEXT,

  -- Cross-table link: when Omar clicks "Enroll in sequence" on a contact
  -- card, we create a prospects row from the mapped fields and stamp the
  -- new prospect's id here so the link is durable across edits.
  promoted_to_prospect_id         UUID REFERENCES prospects(id) ON DELETE SET NULL,
  promoted_at                     TIMESTAMPTZ,

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (run_id, external_key)
);

-- Date filtering & dashboard top-cards.
CREATE INDEX IF NOT EXISTS outreach_contacts_signal_latest_idx       ON outreach_contacts(signal_latest_at DESC);
CREATE INDEX IF NOT EXISTS outreach_contacts_signal_first_idx        ON outreach_contacts(signal_first_seen_at DESC);
CREATE INDEX IF NOT EXISTS outreach_contacts_user_signal_latest_idx  ON outreach_contacts(account_owner_email, signal_latest_at DESC);

-- Common filters.
CREATE INDEX IF NOT EXISTS outreach_contacts_run_id_idx              ON outreach_contacts(run_id);
CREATE INDEX IF NOT EXISTS outreach_contacts_account_display_idx     ON outreach_contacts(account_display_name);
CREATE INDEX IF NOT EXISTS outreach_contacts_account_sfdc_idx        ON outreach_contacts(account_sfdc_id);
CREATE INDEX IF NOT EXISTS outreach_contacts_seniority_idx           ON outreach_contacts(seniority_tier_value);
CREATE INDEX IF NOT EXISTS outreach_contacts_priority_idx            ON outreach_contacts(priority_tier_value);
CREATE INDEX IF NOT EXISTS outreach_contacts_connection_status_idx   ON outreach_contacts(connection_status_value);
CREATE INDEX IF NOT EXISTS outreach_contacts_linkedin_url_idx        ON outreach_contacts(linkedin_url) WHERE linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS outreach_contacts_work_email_idx          ON outreach_contacts(work_email)   WHERE work_email   IS NOT NULL;
CREATE INDEX IF NOT EXISTS outreach_contacts_promoted_idx            ON outreach_contacts(promoted_to_prospect_id) WHERE promoted_to_prospect_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS outreach_contacts_signal_types_gin        ON outreach_contacts USING GIN (signal_types);
CREATE INDEX IF NOT EXISTS outreach_contacts_prior_employers_gin     ON outreach_contacts USING GIN (previously_at_cursor_customers);

CREATE TABLE IF NOT EXISTS outreach_contact_signals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID NOT NULL REFERENCES outreach_contacts(id) ON DELETE CASCADE,
  signal_type   TEXT NOT NULL,
  detected_at   TIMESTAMPTZ NOT NULL,
  raw           JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Idempotency: re-emission of the same signal on a partial-batch retry
  -- is server-deduped via this unique key (matches the contract documented
  -- in the agent prompt).
  UNIQUE (contact_id, signal_type, detected_at)
);

CREATE INDEX IF NOT EXISTS outreach_signals_detected_idx      ON outreach_contact_signals(detected_at DESC);
CREATE INDEX IF NOT EXISTS outreach_signals_type_detected_idx ON outreach_contact_signals(signal_type, detected_at DESC);
CREATE INDEX IF NOT EXISTS outreach_signals_contact_idx       ON outreach_contact_signals(contact_id);

-- Idempotent column adds for deployments that ran an earlier schema pass.
ALTER TABLE outreach_contacts ADD COLUMN IF NOT EXISTS linkedin_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE outreach_contacts ADD COLUMN IF NOT EXISTS email_flagged_to_send BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE outreach_contacts ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS outreach_contacts_email_flagged_idx
  ON outreach_contacts(email_flagged_to_send, email_sent_at)
  WHERE email_flagged_to_send = TRUE AND email_sent_at IS NULL;
