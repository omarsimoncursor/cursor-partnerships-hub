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
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospects_company_domain_idx ON prospects(company_domain);
CREATE INDEX IF NOT EXISTS prospects_email_idx           ON prospects(email);
CREATE INDEX IF NOT EXISTS prospects_created_at_idx      ON prospects(created_at DESC);

CREATE TABLE IF NOT EXISTS prospect_views (
  id          BIGSERIAL PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip          TEXT,
  user_agent  TEXT,
  unlocked    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS prospect_views_prospect_idx ON prospect_views(prospect_id, viewed_at DESC);
