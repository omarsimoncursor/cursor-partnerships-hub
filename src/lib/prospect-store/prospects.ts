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
