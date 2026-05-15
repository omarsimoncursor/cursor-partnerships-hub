import type { ProspectLevel } from './levels';
import type { Category } from './presentation';

export type BuildStatus = 'queued' | 'building' | 'ready' | 'failed';

export type ProspectRow = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  level_raw: string | null;
  level_normalized: ProspectLevel;
  linkedin_url: string | null;
  company_name: string;
  company_domain: string;
  company_accent: string | null;
  technologies_raw: string[];
  vendor_ids: string[];
  unmatched_technologies: string[];
  mcp_relevant: boolean;
  sdk_workflow: string | null;
  show_roi_calculator: boolean;
  password: string;
  gmail_draft_link: string | null;
  linkedin_message_link: string | null;
  notion_page_id: string | null;
  source: string;
  metadata: Record<string, unknown>;
  category: Category;
  reached_out_at: string | null;
  build_status: BuildStatus;
  build_started_at: string | null;
  build_completed_at: string | null;
  build_error: string | null;
  build_artifacts: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // ChatGTM outreach-tracking columns. See `schema.sql` for the
  // per-column write-owner. All are nullable / default-FALSE so
  // pre-migration rows just look "not started" to the automations.
  linkedin_draft: string | null;
  linkedin_sent: boolean;
  mcp_detail: string | null;
  team: string | null;
  // Classified seniority bucket (Executive / Leader (Dir/VP+) /
  // Manager / IC). Distinct from `level_normalized`, which is the
  // lowercase regex normalization of the raw title.
  classified_level: string | null;
  last_sequence_sent: number | null;
  last_email_send_date: string | null;
  replied: boolean;
  thread_id: string | null;
  preferred_first_name: string | null;
};

// Public view of the prospect — never exposes the password to the
// browser in the normal demo render.
export type ProspectPublic = Omit<ProspectRow, 'password'>;

// Payload accepted from ChatGTM. All fields are validated at the API
// boundary; this type doubles as documentation for the integration.
export type ChatgtmProspectInput = {
  // Required
  name: string;
  company: string;
  // Recommended
  email?: string | null;
  // Free-form full job title (e.g. "Senior Engineering Manager").
  // Normalized into `level_normalized` server-side.
  level?: string | null;
  linkedin_url?: string | null;
  company_domain?: string | null;
  company_accent?: string | null;
  technologies?: string[] | null;
  // Flags ChatGTM (or its upstream Sumble step) sets
  mcp_relevant?: boolean | null;
  sdk_workflow?: string | null;
  // Drafts created upstream — we store them so the demo page can link
  // back to them and the admin view can audit each prospect.
  gmail_draft_link?: string | null;
  linkedin_message_link?: string | null;
  notion_page_id?: string | null;
  // Free-form additional metadata; stored as JSONB.
  metadata?: Record<string, unknown> | null;
  // ChatGTM outreach-tracking inputs. The Prospecting Blitz writes
  // these on create; the rest of the lifecycle (linkedin_sent /
  // last_sequence_sent / ...) is updated via PATCH.
  linkedin_draft?: string | null;
  mcp_detail?: string | null;
  team?: string | null;
  // The Executive/Leader/Manager/IC bucket. Named distinctly from
  // `level` (the raw title) so the API contract is unambiguous.
  classified_level?: string | null;
  preferred_first_name?: string | null;
  // Discriminator for list filters. `chatgtm` = cold outbound (Sequences).
  // `outreach` = intent-demo shadow row (Intent Data only). `outreach_promote`
  // = deliberately enrolled from Intent Data.
  source?: string | null;
};
