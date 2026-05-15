import { NextRequest, NextResponse } from 'next/server';
import {
  backfillOutreachProspectSources,
  ensureSchema,
  isDatabaseConfigured,
} from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chatgtm/admin/tag-outreach-sources
 *
 * One-time repair: set source='outreach' on demo-shadow prospect rows
 * created for Intent Data so they drop out of Sequences / orchestrator.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  try {
    await ensureSchema();
    const result = await backfillOutreachProspectSources();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    console.error('[chatgtm/admin/tag-outreach-sources] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
