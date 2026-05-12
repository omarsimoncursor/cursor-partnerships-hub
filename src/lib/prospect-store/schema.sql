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

CREATE INDEX IF NOT EXISTS prospects_company_domain_idx ON prospects(company_domain);
CREATE INDEX IF NOT EXISTS prospects_email_idx           ON prospects(email);
CREATE INDEX IF NOT EXISTS prospects_created_at_idx      ON prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS prospects_build_status_idx    ON prospects(build_status);
CREATE INDEX IF NOT EXISTS prospects_category_idx        ON prospects(category);

CREATE TABLE IF NOT EXISTS prospect_views (
  id          BIGSERIAL PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip          TEXT,
  user_agent  TEXT,
  unlocked    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS prospect_views_prospect_idx ON prospect_views(prospect_id, viewed_at DESC);
