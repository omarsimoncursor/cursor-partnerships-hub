import { query } from './db';

// Aggregate + per-prospect engagement queries used by the admin
// analytics tab and the ChatGTM daily digest endpoint.
//
// The "opened" signal we use is `prospect_views.unlocked = true` —
// i.e. the prospect entered the password and the personalized demo
// rendered. We deliberately ignore locked views (someone hitting the
// URL but not unlocking) so the rep isn't pinged for accidental
// crawlers / link-checkers.

export type CompanyCount = {
  company_name: string;
  company_domain: string;
  total: number;
  opened: number;
};

export type AnalyticsTotals = {
  total_prospects: number;
  total_opened: number;
  total_companies: number;
};

export type OpenedProspect = {
  id: string;
  slug: string;
  name: string;
  email: string | null;
  linkedin_url: string | null;
  company_name: string;
  company_domain: string;
  level_normalized: string;
  level_raw: string | null;
  reached_out_at: string | null;
  first_unlocked_at: string;
  last_unlocked_at: string;
  unlocked_view_count: number;
  // Per-prospect detail fields the admin Analytics tab now surfaces
  // alongside the open-tracking columns. Mirrors what the Prospects
  // tab shows so the rep doesn't need to switch tabs to see vendor
  // coverage, ROI status, build state, or the demo password.
  vendor_ids: string[];
  unmatched_technologies: string[];
  show_roi_calculator: boolean;
  mcp_relevant: boolean;
  build_status: string;
  build_error: string | null;
  // The existing internal `password` column. Exposed on the wire as
  // `demo_password` (consistent with the ChatGTM API surface) once
  // the route serializes the row.
  password: string;
  created_at: string;
};

/**
 * High-level totals + per-company counts. Used by the admin
 * analytics tab to render the top-line summary.
 */
export async function getAnalyticsTotals(): Promise<{
  totals: AnalyticsTotals;
  companies: CompanyCount[];
}> {
  const totalsResult = await query<{
    total_prospects: string;
    total_opened: string;
    total_companies: string;
  }>(
    `SELECT
       COUNT(*)::text AS total_prospects,
       COUNT(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM prospect_views v
          WHERE v.prospect_id = prospects.id AND v.unlocked = true
       ))::text AS total_opened,
       COUNT(DISTINCT company_name)::text AS total_companies
     FROM prospects`,
  );
  const t = totalsResult.rows[0];

  const companyResult = await query<{
    company_name: string;
    company_domain: string;
    total: string;
    opened: string;
  }>(
    `SELECT
       company_name,
       MIN(company_domain) AS company_domain,
       COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM prospect_views v
          WHERE v.prospect_id = prospects.id AND v.unlocked = true
       ))::text AS opened
     FROM prospects
     GROUP BY company_name
     ORDER BY company_name`,
  );

  return {
    totals: {
      total_prospects: Number(t?.total_prospects || 0),
      total_opened: Number(t?.total_opened || 0),
      total_companies: Number(t?.total_companies || 0),
    },
    companies: companyResult.rows.map((r) => ({
      company_name: r.company_name,
      company_domain: r.company_domain,
      total: Number(r.total),
      opened: Number(r.opened),
    })),
  };
}

/**
 * Every prospect who has unlocked their demo at least once. Optional
 * `sinceMs` filter restricts to prospects whose most recent unlock
 * landed within the last N milliseconds — used by the daily-digest
 * endpoint that ChatGTM consumes for Slack.
 *
 * Sorted by `last_unlocked_at DESC` so the most-recent opener appears
 * first.
 */
export async function listOpenedProspects(opts: { sinceMs?: number; limit?: number } = {}): Promise<OpenedProspect[]> {
  const params: unknown[] = [];
  let whereClause = '';
  if (typeof opts.sinceMs === 'number' && opts.sinceMs > 0) {
    params.push(`${opts.sinceMs} milliseconds`);
    whereClause = `WHERE v.last_unlocked_at >= now() - $${params.length}::interval`;
  }
  const limit = Math.min(opts.limit ?? 1000, 5000);
  params.push(limit);
  const limitParam = `$${params.length}`;

  const { rows } = await query<OpenedProspect>(
    `SELECT
       p.id, p.slug, p.name, p.email, p.linkedin_url,
       p.company_name, p.company_domain,
       p.level_normalized, p.level_raw,
       p.reached_out_at::text,
       v.first_unlocked_at::text,
       v.last_unlocked_at::text,
       v.unlocked_view_count,
       p.vendor_ids,
       p.unmatched_technologies,
       p.show_roi_calculator,
       p.mcp_relevant,
       p.build_status,
       p.build_error,
       p.password,
       p.created_at::text
     FROM prospects p
     JOIN (
       SELECT
         prospect_id,
         MIN(viewed_at) AS first_unlocked_at,
         MAX(viewed_at) AS last_unlocked_at,
         COUNT(*)::int AS unlocked_view_count
       FROM prospect_views
       WHERE unlocked = true
       GROUP BY prospect_id
     ) v ON v.prospect_id = p.id
     ${whereClause}
     ORDER BY v.last_unlocked_at DESC
     LIMIT ${limitParam}`,
    params,
  );
  return rows;
}

/**
 * Toggle the per-prospect "I've reached out to them on LinkedIn"
 * flag. Stored as a timestamp so the admin can sort by recency.
 */
export async function setReachedOut(prospectId: string, reached: boolean): Promise<string | null> {
  const { rows } = await query<{ reached_out_at: string | null }>(
    `UPDATE prospects
        SET reached_out_at = ${reached ? 'now()' : 'NULL'},
            updated_at = now()
        WHERE id = $1
        RETURNING reached_out_at::text`,
    [prospectId],
  );
  return rows[0]?.reached_out_at ?? null;
}

/**
 * Parse a "since" duration query param like "24h", "7d", "1h", or a
 * raw integer of milliseconds. Returns the millisecond count or
 * `null` if the string is unparseable. Caps the window at 30 days.
 */
export function parseSinceWindowMs(input: string | null | undefined): number | null {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const m = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(trimmed);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2] || 'ms';
  const multiplier =
    unit === 'ms' ? 1 :
    unit === 's' ? 1_000 :
    unit === 'm' ? 60_000 :
    unit === 'h' ? 60 * 60_000 :
    unit === 'd' ? 24 * 60 * 60_000 :
    NaN;
  if (!isFinite(multiplier)) return null;
  const ms = n * multiplier;
  if (!isFinite(ms) || ms <= 0) return null;
  return Math.min(ms, 30 * 24 * 60 * 60_000);
}
