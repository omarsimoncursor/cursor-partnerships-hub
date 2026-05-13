import fs from 'fs';
import path from 'path';
import { query, withClient } from './db';
import { generatePassword } from './password';
import { generateSlug } from './slug';
import { normalizeLevel, shouldShowRoiCalculator, type ProspectLevel } from './levels';
import { normalizeTechnologies } from './technologies';
import {
  COMPANY_SEEDS,
  resolveCompanyDefaults,
  type CompanyDefaults,
} from './company-seeds';
import type { BuildStatus, ChatgtmProspectInput, ProspectPublic, ProspectRow } from './types';

// ---------------------------------------------------------------------------
// Migrations

let migrationsRun = false;

export async function ensureSchema(): Promise<void> {
  if (migrationsRun) return;
  const schemaPath = path.join(process.cwd(), 'src/lib/prospect-store/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await withClient(async (client) => {
    await client.query(sql);
  });
  migrationsRun = true;
}

export async function seedCompanies(): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;
  for (const c of COMPANY_SEEDS) {
    const result = await query<{ inserted: boolean }>(
      `INSERT INTO companies (domain, name, accent, default_techs, notes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (domain) DO UPDATE SET
           name = EXCLUDED.name,
           accent = EXCLUDED.accent,
           default_techs = EXCLUDED.default_techs,
           notes = EXCLUDED.notes,
           updated_at = now()
         RETURNING (xmax = 0) AS inserted`,
      [c.domain, c.name, c.accent, c.defaultTechs, c.notes ?? null],
    );
    if (result.rows[0]?.inserted) inserted += 1;
    else updated += 1;
  }
  return { inserted, updated };
}

// ---------------------------------------------------------------------------
// Reads

export async function getProspectBySlug(slug: string): Promise<ProspectRow | null> {
  const { rows } = await query<ProspectRow>(
    `SELECT * FROM prospects WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function getProspectById(id: string): Promise<ProspectRow | null> {
  const { rows } = await query<ProspectRow>(
    `SELECT * FROM prospects WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function listProspects(limit = 100): Promise<ProspectRow[]> {
  const { rows } = await query<ProspectRow>(
    `SELECT * FROM prospects ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return rows;
}

export function toPublic(row: ProspectRow): ProspectPublic {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...rest } = row;
  return rest;
}

// ---------------------------------------------------------------------------
// Writes

export type CreateProspectResult = {
  prospect: ProspectRow;
  url: string;
  password: string;
};

const REQUIRED = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`Missing required field: ${field}`);
  }
  return value.trim();
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function createProspect(
  input: ChatgtmProspectInput,
  origin: string,
): Promise<CreateProspectResult> {
  const name = REQUIRED(input.name, 'name');
  const companyName = REQUIRED(input.company, 'company');

  const companyDomain = (input.company_domain && String(input.company_domain).trim().toLowerCase())
    || guessCompanyDomain(companyName);

  const seed: CompanyDefaults = resolveCompanyDefaults(companyName, companyDomain);
  const techsArray: string[] = Array.isArray(input.technologies) ? input.technologies : [];
  const techsForNormalization = techsArray.length > 0 ? techsArray : seed.defaultTechs;
  const tech = normalizeTechnologies(techsForNormalization);

  // Preserve filtered (non-automation-target) tech terms in metadata so the
  // rep can see them without surfacing them as awkward SDK cards.
  const incomingMeta = input.metadata && typeof input.metadata === 'object' ? input.metadata : {};
  const mergedMetadata: Record<string, unknown> = {
    ...incomingMeta,
    ...(tech.filtered.length > 0 ? { filtered_technologies: tech.filtered } : {}),
  };

  const level: ProspectLevel = normalizeLevel(input.level ?? null);
  const showRoi = shouldShowRoiCalculator(level);

  const password = generatePassword(name);
  const accent = sanitizeHex(input.company_accent) || seed.accent;

  // Retry slug generation on the off chance of a collision.
  let row: ProspectRow | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5 && !row; attempt += 1) {
    const slug = generateSlug();
    try {
      const result = await query<ProspectRow>(
        `INSERT INTO prospects (
            slug, name, email, level_raw, level_normalized, linkedin_url,
            company_name, company_domain, company_accent,
            technologies_raw, vendor_ids, unmatched_technologies,
            mcp_relevant, sdk_workflow, show_roi_calculator,
            password, gmail_draft_link, linkedin_message_link, notion_page_id,
            source, metadata
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9,
            $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18, $19,
            $20, $21
          )
          RETURNING *`,
        [
          slug,
          name,
          (input.email ?? '').toString().trim() || null,
          (input.level ?? '').toString().trim() || null,
          level,
          (input.linkedin_url ?? '').toString().trim() || null,
          companyName,
          companyDomain,
          accent,
          tech.raw,
          tech.vendorIds,
          tech.unmatched,
          Boolean(input.mcp_relevant),
          (input.sdk_workflow ?? '').toString().trim() || null,
          showRoi,
          password,
          (input.gmail_draft_link ?? '').toString().trim() || null,
          (input.linkedin_message_link ?? '').toString().trim() || null,
          (input.notion_page_id ?? '').toString().trim() || null,
          'chatgtm',
          mergedMetadata,
        ],
      );
      row = result.rows[0] ?? null;
    } catch (err: unknown) {
      lastError = err;
      const code = (err as { code?: string }).code;
      if (code !== '23505') throw err; // not a unique violation, rethrow
    }
  }
  if (!row) {
    throw lastError instanceof Error ? lastError : new Error('Failed to create prospect');
  }

  const url = `${origin.replace(/\/$/, '')}/p/${row.slug}`;
  return { prospect: row, url, password };
}

export async function createProspects(
  inputs: ChatgtmProspectInput[],
  origin: string,
): Promise<CreateProspectResult[]> {
  // We deliberately run sequentially instead of in parallel — a typical
  // ChatGTM batch is 5-50 rows and the Neon pool is small. Sequential
  // gives consistent ordering in the response and avoids contention on
  // the slug-uniqueness retry path.
  const out: CreateProspectResult[] = [];
  for (const input of inputs) {
    out.push(await createProspect(input, origin));
  }
  return out;
}

export async function recordView(
  prospectId: string,
  ip: string | null,
  userAgent: string | null,
  unlocked: boolean,
): Promise<void> {
  await query(
    `INSERT INTO prospect_views (prospect_id, ip, user_agent, unlocked) VALUES ($1, $2, $3, $4)`,
    [prospectId, ip, userAgent, unlocked],
  );
}

// ---------------------------------------------------------------------------
// Edit + delete

// Whitelist of fields the admin Edit modal can update. Anything outside
// this list is silently ignored so the API can't be coerced into
// changing the slug, password, build state, etc.
const EDITABLE_TEXT_FIELDS = new Set([
  'name',
  'email',
  'linkedin_url',
  'company_name',
  'company_domain',
  'company_accent',
  'sdk_workflow',
  'gmail_draft_link',
  'linkedin_message_link',
  'notion_page_id',
]);

const EDITABLE_BOOL_FIELDS = new Set([
  'mcp_relevant',
  'show_roi_calculator',
]);

export type ProspectPatch = Partial<{
  name: string;
  email: string | null;
  level: string | null;
  linkedin_url: string | null;
  company_name: string;
  company_domain: string;
  company_accent: string | null;
  vendor_ids: string[];
  unmatched_technologies: string[];
  mcp_relevant: boolean;
  sdk_workflow: string | null;
  show_roi_calculator: boolean;
  gmail_draft_link: string | null;
  linkedin_message_link: string | null;
  notion_page_id: string | null;
  tagline: string;
  metadata: Record<string, unknown>;
  // Analytics-tab toggle for "I've reached out to them on LinkedIn".
  // true sets reached_out_at = now(); false clears it. The actual
  // timestamp is stored server-side so the rep can sort by recency.
  reached_out: boolean;
}>;

export async function updateProspect(
  id: string,
  patch: ProspectPatch,
): Promise<ProspectRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  function set(column: string, value: unknown): void {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  }

  // Plain text + bool fields (the easy ones).
  for (const [field, value] of Object.entries(patch)) {
    if (EDITABLE_TEXT_FIELDS.has(field) && (typeof value === 'string' || value === null)) {
      const trimmed = typeof value === 'string' ? value.trim() : null;
      set(field, trimmed && trimmed.length > 0 ? trimmed : null);
    } else if (EDITABLE_BOOL_FIELDS.has(field) && typeof value === 'boolean') {
      set(field, value);
    }
  }

  // Special-cased fields.
  if (typeof patch.level === 'string') {
    set('level_raw', patch.level.trim() || null);
    set('level_normalized', normalizeLevel(patch.level));
    // Don't auto-toggle show_roi_calculator when level changes — let the
    // operator decide explicitly via the bool field. This is what the
    // edit modal hint promises.
  }
  if (Array.isArray(patch.vendor_ids)) {
    set('vendor_ids', patch.vendor_ids.filter((v) => typeof v === 'string'));
  }
  if (Array.isArray(patch.unmatched_technologies)) {
    set(
      'unmatched_technologies',
      patch.unmatched_technologies.filter((v) => typeof v === 'string'),
    );
  }

  // reached_out toggle. true => stamp now(), false => clear.
  if (typeof patch.reached_out === 'boolean') {
    if (patch.reached_out) {
      sets.push('reached_out_at = now()');
    } else {
      sets.push('reached_out_at = NULL');
    }
  }

  // metadata + tagline both live in / extend the metadata JSONB column.
  const metaPatch: Record<string, unknown> = {};
  if (patch.metadata && typeof patch.metadata === 'object') Object.assign(metaPatch, patch.metadata);
  if (typeof patch.tagline === 'string') metaPatch.tagline = patch.tagline.trim();
  if (Object.keys(metaPatch).length > 0) {
    values.push(JSON.stringify(metaPatch));
    sets.push(`metadata = metadata || $${values.length}::jsonb`);
  }

  if (sets.length === 0) {
    // Nothing to update; return the row as-is so the caller can show it.
    return getProspectById(id);
  }

  values.push(id);
  const { rows } = await query<ProspectRow>(
    `UPDATE prospects SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteProspect(id: string): Promise<boolean> {
  const { rowCount } = await query(
    `DELETE FROM prospects WHERE id = $1`,
    [id],
  );
  return rowCount > 0;
}

/**
 * One-shot maintenance: re-run normalizeLevel() against every
 * prospect's stored level_raw and persist the result when it differs
 * from level_normalized. Also upgrades show_roi_calculator to TRUE
 * for prospects whose level moved INTO a leadership tier (we never
 * downgrade — an admin who explicitly set show_roi_calculator=true
 * keeps it).
 *
 * Used to repair ChatGTM batches that landed before the level regex
 * set knew about Vice President / AVP / EVP variants in full titles.
 *
 * Returns a per-row diff so the caller can see exactly what changed.
 */
export type LevelBackfillChange = {
  id: string;
  slug: string;
  name: string;
  company_name: string;
  level_raw: string | null;
  old_level: string;
  new_level: string;
  roi_changed: boolean;
};

export async function backfillLevelNormalization(opts: { dryRun?: boolean } = {}): Promise<{
  scanned: number;
  changed: number;
  changes: LevelBackfillChange[];
}> {
  const { rows } = await query<{
    id: string;
    slug: string;
    name: string;
    company_name: string;
    level_raw: string | null;
    level_normalized: string;
    show_roi_calculator: boolean;
  }>(
    `SELECT id, slug, name, company_name, level_raw, level_normalized, show_roi_calculator
       FROM prospects
       WHERE level_raw IS NOT NULL AND length(trim(level_raw)) > 0`,
  );

  const changes: LevelBackfillChange[] = [];
  for (const row of rows) {
    const newLevel = normalizeLevel(row.level_raw);
    if (newLevel === row.level_normalized) continue;
    const newRoi = shouldShowRoiCalculator(newLevel);
    // Upgrade-only ROI: turn ROI on if the new level is leadership and
    // the row currently has ROI off. Never downgrade — admins can have
    // intentionally flipped ROI on, and we don't want to lose that.
    const nextShowRoi = newRoi && !row.show_roi_calculator ? true : row.show_roi_calculator;
    const roiChanged = nextShowRoi !== row.show_roi_calculator;

    changes.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      company_name: row.company_name,
      level_raw: row.level_raw,
      old_level: row.level_normalized,
      new_level: newLevel,
      roi_changed: roiChanged,
    });

    if (!opts.dryRun) {
      await query(
        `UPDATE prospects
            SET level_normalized = $2,
                show_roi_calculator = $3,
                updated_at = now()
            WHERE id = $1`,
        [row.id, newLevel, nextShowRoi],
      );
    }
  }

  return { scanned: rows.length, changed: changes.length, changes };
}

// ---------------------------------------------------------------------------
// Engagement events (clicks, runs, artifact opens, ...)

export type ProspectEventRow = {
  id: string;
  prospect_id: string;
  slug: string;
  event_type: string;
  event_data: Record<string, unknown>;
  occurred_at: string;
  session_id: string | null;
  ip: string | null;
  user_agent: string | null;
};

// Hard cap for event_data so a misbehaving client can't blow up the row.
const MAX_EVENT_DATA_BYTES = 4 * 1024;

export async function recordEvent(args: {
  prospectId: string;
  slug: string;
  eventType: string;
  eventData?: Record<string, unknown> | null;
  sessionId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const payload =
    args.eventData && typeof args.eventData === 'object'
      ? args.eventData
      : {};
  const serialized = JSON.stringify(payload);
  const safePayload = serialized.length > MAX_EVENT_DATA_BYTES ? '{"_truncated":true}' : serialized;
  await query(
    `INSERT INTO prospect_events (prospect_id, slug, event_type, event_data, session_id, ip, user_agent)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
    [
      args.prospectId,
      args.slug,
      String(args.eventType).slice(0, 64),
      safePayload,
      args.sessionId ? String(args.sessionId).slice(0, 128) : null,
      args.ip ?? null,
      args.userAgent ? String(args.userAgent).slice(0, 512) : null,
    ],
  );
}

export async function listEvents(
  prospectId: string,
  limit = 500,
): Promise<ProspectEventRow[]> {
  const { rows } = await query<ProspectEventRow>(
    `SELECT id::text, prospect_id, slug, event_type, event_data, occurred_at, session_id, ip, user_agent
       FROM prospect_events
       WHERE prospect_id = $1
       ORDER BY occurred_at DESC
       LIMIT $2`,
    [prospectId, limit],
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Build state machine

/**
 * Atomically transition a prospect from `queued` -> `building`.
 * Returns the locked row when the transition succeeded, or `null` when
 * another worker has already claimed the build (idempotent guard for
 * the lazy-build path).
 */
export async function claimForBuild(prospectId: string): Promise<ProspectRow | null> {
  const { rows } = await query<ProspectRow>(
    `UPDATE prospects
        SET build_status = 'building',
            build_started_at = now(),
            build_error = NULL,
            updated_at = now()
        WHERE id = $1 AND build_status IN ('queued', 'failed')
        RETURNING *`,
    [prospectId],
  );
  return rows[0] ?? null;
}

export async function markBuildReady(
  prospectId: string,
  artifacts: Record<string, unknown>,
): Promise<void> {
  await query(
    `UPDATE prospects
        SET build_status = 'ready',
            build_completed_at = now(),
            build_error = NULL,
            build_artifacts = $2::jsonb,
            updated_at = now()
        WHERE id = $1`,
    [prospectId, JSON.stringify(artifacts)],
  );
}

export async function markBuildFailed(prospectId: string, message: string): Promise<void> {
  await query(
    `UPDATE prospects
        SET build_status = 'failed',
            build_completed_at = now(),
            build_error = $2,
            updated_at = now()
        WHERE id = $1`,
    [prospectId, message.slice(0, 2000)],
  );
}

export async function getBuildStatus(slug: string): Promise<{
  build_status: BuildStatus;
  build_started_at: string | null;
  build_completed_at: string | null;
  build_error: string | null;
} | null> {
  const { rows } = await query<{
    build_status: BuildStatus;
    build_started_at: string | null;
    build_completed_at: string | null;
    build_error: string | null;
  }>(
    `SELECT build_status, build_started_at, build_completed_at, build_error
       FROM prospects WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Helpers

function sanitizeHex(input?: string | null): string | undefined {
  if (!input) return undefined;
  const trimmed = String(input).trim();
  if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(trimmed)) return undefined;
  return trimmed;
}

function guessCompanyDomain(companyName: string): string {
  const cleaned = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!cleaned) return 'example.com';
  return `${cleaned}.com`;
}
