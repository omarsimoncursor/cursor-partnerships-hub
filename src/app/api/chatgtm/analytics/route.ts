import { NextRequest, NextResponse } from 'next/server';
import {
  ensureSchema,
  getAnalyticsTotals,
  isDatabaseConfigured,
  listOpenedProspects,
} from '@/lib/prospect-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chatgtm/analytics
 *
 * Returns aggregates + the full list of opened prospects for the
 * admin Analytics tab. Bearer-auth via CHATGTM_API_TOKEN.
 *
 * Shape:
 *   {
 *     ok: true,
 *     totals: { total_prospects, total_opened, total_companies },
 *     companies: [{ company_name, company_domain, total, opened }, ...],
 *     opened: [{
 *       id, slug, name, email, linkedin_url, company_name, company_domain,
 *       level_normalized, level_raw, reached_out_at,
 *       first_unlocked_at, last_unlocked_at, unlocked_view_count,
 *       url
 *     }, ...]
 *   }
 *
 * `opened` is sorted by last_unlocked_at DESC. The admin UI does
 * client-side sort/filter on top of this single payload.
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  try {
    await ensureSchema();
    const [{ totals, companies }, openedRaw] = await Promise.all([
      getAnalyticsTotals(),
      listOpenedProspects({ limit: 5_000 }),
    ]);
    const origin = originFromRequest(req);
    const opened = openedRaw.map((row) => ({
      ...row,
      url: `${origin.replace(/\/$/, '')}/p/${row.slug}`,
    }));
    return NextResponse.json({ ok: true, totals, companies, opened });
  } catch (err: unknown) {
    console.error('[chatgtm/analytics] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
