import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import { backfillDemosForContacts } from '@/lib/outreach-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/outreach/admin/backfill-demos[?since_days=30&dry_run=1]
 *
 * Generates personalized demos for intent contacts missing demo_url.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const sp = req.nextUrl.searchParams;
  const sinceDays = Number(sp.get('since_days') ?? '30');
  const dryRun = sp.get('dry_run') === '1';

  try {
    await ensureSchema();
    const result = await backfillDemosForContacts({
      sinceDays: Number.isFinite(sinceDays) && sinceDays > 0 ? sinceDays : 30,
      dryRun,
      origin: originFromRequest(req),
    });
    return NextResponse.json({ ok: true, dry_run: dryRun, ...result });
  } catch (err: unknown) {
    console.error('[outreach/admin/backfill-demos] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
