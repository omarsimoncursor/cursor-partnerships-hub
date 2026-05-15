import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import { listRecentContacts } from '@/lib/outreach-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/outreach/contacts/recent?since_days=30&user_email=<rep>
 *
 * Returns dedup tuples for every contact whose latest-signal date
 * falls inside the window (default 30 days for L30D backfills).
 * Filters by the rep email on the parent run, not account_owner_email.
 *
 * Auth: same `CHATGTM_API_TOKEN`.
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const sinceDaysParam = req.nextUrl.searchParams.get('since_days');
  let sinceDays = 30;
  if (sinceDaysParam !== null) {
    const parsed = Number(sinceDaysParam);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      return NextResponse.json(
        {
          error: 'invalid_field',
          field: 'since_days',
          message: '`since_days` must be an integer in 1..90.',
        },
        { status: 400 },
      );
    }
    sinceDays = parsed;
  }
  const userEmail = req.nextUrl.searchParams.get('user_email');

  try {
    await ensureSchema();
    const contacts = await listRecentContacts({
      sinceDays,
      userEmail: userEmail || null,
    });
    return NextResponse.json({
      ok: true,
      since_days: sinceDays,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    console.error('[outreach/contacts/recent GET] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
