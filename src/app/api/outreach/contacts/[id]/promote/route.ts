import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import { promoteContact, toContactResponse } from '@/lib/outreach-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/outreach/contacts/:id/promote
 *
 * "Enroll in sequence" action. Creates a `prospects` row from the
 * outreach contact's mapped fields (or links to an existing one
 * matched by linkedin_url || work_email), stamps the FK back on the
 * outreach contact, and returns both rows so the dashboard can
 * refresh in place.
 *
 * Idempotent — calling promote on an already-promoted contact
 * returns the existing prospect row with `was_existing: true`.
 *
 * Auth: same `CHATGTM_API_TOKEN`.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const { id } = await context.params;
  const origin = originFromRequest(req);

  try {
    await ensureSchema();
    const result = await promoteContact(id, origin);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      contact: toContactResponse(result.contact),
      prospect: {
        id: result.prospect.id,
        slug: result.prospect.slug,
        url: result.prospect_url,
        password: result.prospect_password,
        last_sequence_sent: result.prospect.last_sequence_sent ?? null,
        replied: result.prospect.replied,
      },
      was_existing: result.was_existing,
    });
  } catch (err) {
    console.error('[outreach/contacts/:id/promote POST] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
