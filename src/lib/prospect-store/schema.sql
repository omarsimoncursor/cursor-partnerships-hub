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
