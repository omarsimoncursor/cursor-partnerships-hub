import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  runProspectDedupAndPersonalizationBackfill,
} from '@/lib/prospect-store';
import { ensureSchema } from '@/lib/prospect-store/prospects';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chatgtm/admin/dedup-prospects[?company_domain=kla.com&dry_run=1]
 *
 * One-time (idempotent) email dedup + personalization backfill. Survivor
 * rule: earliest created_at, tiebreak slug ASC. Losers are hard-deleted
 * after merging thread/sequence fields onto the survivor.
 *
 * `classified_level` / `mcp_detail` are inferred server-side when null —
 * there is no cron; see `personalization.ts` module header.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const sp = req.nextUrl.searchParams;
  const companyDomain = sp.get('company_domain')?.trim().toLowerCase() || null;
  const dryRun = sp.get('dry_run') === '1';

  try {
    await ensureSchema();
    const result = await runProspectDedupAndPersonalizationBackfill({
      companyDomain,
      dryRun,
    });
    return NextResponse.json({ ok: true, dry_run: dryRun, company_domain: companyDomain, ...result });
  } catch (err: unknown) {
    console.error('[admin/dedup-prospects] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const sp = req.nextUrl.searchParams;
  const companyDomain = sp.get('company_domain')?.trim().toLowerCase() || null;

  try {
    await ensureSchema();
    const result = await runProspectDedupAndPersonalizationBackfill({
      companyDomain,
      dryRun: true,
    });
    return NextResponse.json({
      ok: true,
      dry_run: true,
      company_domain: companyDomain,
      ...result,
    });
  } catch (err: unknown) {
    console.error('[admin/dedup-prospects GET] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
