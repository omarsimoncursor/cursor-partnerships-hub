import { NextRequest, NextResponse } from 'next/server';
import {
  getProspectById,
  getProspectBySlug,
  isDatabaseConfigured,
  listEvents,
} from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chatgtm/prospects/:id/events?limit=N
 *
 * Returns the engagement timeline for one prospect (vendor demo runs,
 * SDK demo runs, artifact opens, ROI slider changes, ...). Used by the
 * admin Activity modal to see what the prospect actually clicked on
 * after opening their personalized demo.
 *
 * `:id` is a UUID or slug. Bearer-auth via CHATGTM_API_TOKEN.
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

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 500), 2000);
  const events = await listEvents(row.id, limit);

  return NextResponse.json({
    ok: true,
    prospect: { id: row.id, slug: row.slug, name: row.name, company: row.company_name },
    count: events.length,
    events,
  });
}
