import { NextRequest, NextResponse } from 'next/server';
import {
  ensureSchema,
  isDatabaseConfigured,
  listOpenedProspects,
  parseSinceWindowMs,
} from '@/lib/prospect-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chatgtm/digest/opened?since=24h
 *
 * Returns the list of prospects whose personalized demo had at least
 * one unlocked view in the time window. Designed for ChatGTM's daily
 * Slack automation: "who opened in the last day, with their LinkedIn
 * URL, so I can DM them."
 *
 * Auth: Bearer CHATGTM_API_TOKEN (same as the rest of the integration).
 *
 * Query params:
 *   ?since=24h    Time window. Accepts "Nh" / "Nm" / "Nd" / "Ns" /
 *                 raw milliseconds. Defaults to 24h. Capped at 30d.
 *
 * Response:
 *   {
 *     ok: true,
 *     since: "24h",
 *     since_ts: "2026-05-12T03:18:00.000Z",
 *     count: 3,
 *     prospects: [
 *       {
 *         id, slug, url, name, email, linkedin_url,
 *         company_name, company_domain, level_normalized, level_raw,
 *         first_unlocked_at, last_unlocked_at, unlocked_view_count,
 *         reached_out_at
 *       },
 *       ...
 *     ]
 *   }
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const sinceParam = req.nextUrl.searchParams.get('since') || '24h';
  const sinceMs = parseSinceWindowMs(sinceParam) ?? 24 * 60 * 60 * 1_000;
  const sinceTs = new Date(Date.now() - sinceMs).toISOString();

  try {
    await ensureSchema();
    const rows = await listOpenedProspects({ sinceMs, limit: 1000 });
    const origin = originFromRequest(req);
    const prospects = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      url: `${origin.replace(/\/$/, '')}/p/${r.slug}`,
      name: r.name,
      email: r.email,
      linkedin_url: r.linkedin_url,
      company_name: r.company_name,
      company_domain: r.company_domain,
      level_normalized: r.level_normalized,
      level_raw: r.level_raw,
      first_unlocked_at: r.first_unlocked_at,
      last_unlocked_at: r.last_unlocked_at,
      unlocked_view_count: r.unlocked_view_count,
      reached_out_at: r.reached_out_at,
    }));
    return NextResponse.json({
      ok: true,
      since: sinceParam,
      since_ts: sinceTs,
      count: prospects.length,
      prospects,
    });
  } catch (err: unknown) {
    console.error('[chatgtm/digest/opened] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
