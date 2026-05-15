import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import { listContacts, toContactResponse } from '@/lib/outreach-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/outreach/contacts
 *
 * List intent-signal contacts for the Intent Data admin tab and for
 * the one-time email send worker (Sequence Orchestrator add-on).
 *
 * Query params:
 *   email_flagged_to_send=true  — rows Omar flagged; email_sent_at IS NULL
 *   email_sent=true|false
 *   linkedin_sent=true|false
 *   run_id=<uuid>
 *   account=<display_name>
 *   priority=hot|warm|nurture
 *   since_days=<1..90> (default 30 for the admin tab)
 *   limit, offset
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const sp = req.nextUrl.searchParams;
  const parseBool = (key: string): boolean | undefined => {
    const v = sp.get(key);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
  };

  const sinceRaw = sp.get('since_days');
  const sinceDays = sinceRaw ? Number(sinceRaw) : 30;
  const limitRaw = sp.get('limit');
  const offsetRaw = sp.get('offset');

  try {
    await ensureSchema();
    const { contacts, total } = await listContacts({
      emailFlaggedToSend: parseBool('email_flagged_to_send'),
      emailSent: parseBool('email_sent'),
      linkedinSent: parseBool('linkedin_sent'),
      runId: sp.get('run_id') ?? undefined,
      accountDisplayName: sp.get('account') ?? undefined,
      priorityTier: sp.get('priority') ?? undefined,
      sinceDays: Number.isFinite(sinceDays) && sinceDays > 0 ? sinceDays : 30,
      limit: limitRaw ? Number(limitRaw) : 500,
      offset: offsetRaw ? Number(offsetRaw) : 0,
    });

    return NextResponse.json({
      ok: true,
      count: contacts.length,
      total,
      contacts: contacts.map((c) => toContactResponse(c)),
    });
  } catch (err) {
    console.error('[outreach/contacts GET] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
