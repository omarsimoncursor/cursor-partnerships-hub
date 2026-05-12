import { NextRequest, NextResponse } from 'next/server';
import {
  getProspectById,
  getProspectBySlug,
  isDatabaseConfigured,
  toPublic,
} from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chatgtm/prospects/:id?include=password
 *
 * Lookup a single prospect by either UUID or slug. ChatGTM uses this
 * to confirm state after `POST /api/chatgtm/prospects` returns.
 *
 * `?include=password` opts in to including the demo password in the
 * response (used by the admin UI and ChatGTM resync flows). Always
 * Bearer-authed; the explicit opt-in is a second layer of defense.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const { id } = await context.params;
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  const row = isUuid ? await getProspectById(id) : await getProspectBySlug(id);
  if (!row) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const include = (req.nextUrl.searchParams.get('include') || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return NextResponse.json({
    ok: true,
    prospect: include.includes('password') ? row : toPublic(row),
  });
}
