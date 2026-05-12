import { NextRequest, NextResponse } from 'next/server';
import {
  ensureSchema,
  isDatabaseConfigured,
  seedCompanies,
} from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/db/init
 *
 * Idempotent. Creates tables (`companies`, `prospects`,
 * `prospect_views`) if missing and upserts the seed company list.
 *
 * Auth: `Authorization: Bearer ${DB_INIT_TOKEN}`. Use a separate
 * token from `CHATGTM_API_TOKEN` so deploy automation can run this
 * without re-using the integration token.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'DB_INIT_TOKEN');
  if (authError) return authError;

  try {
    await ensureSchema();
    const seedResult = await seedCompanies();
    return NextResponse.json({ ok: true, ...seedResult });
  } catch (err: unknown) {
    console.error('[db/init] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
