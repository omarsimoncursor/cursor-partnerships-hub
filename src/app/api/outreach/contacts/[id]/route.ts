import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import {
  getContactById,
  OutreachValidationError,
  patchContact,
  toContactResponse,
  validateContactPatch,
} from '@/lib/outreach-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/outreach/contacts/:id
 * PATCH /api/outreach/contacts/:id
 *
 * The PATCH body is restricted to UI-managed fields:
 *   - linkedin_message, linkedin_sent
 *   - email_subject, email_body, email_flagged_to_send, email_sent_at
 *   - legacy: connection_status_*, omar_notes
 *
 * Anything else returns 400 invalid_field. The agent's batch upsert
 * route is the only path that can write data fields; this route is
 * the only path that can flip lifecycle. That separation is what
 * keeps the agent's daily re-POSTs from clobbering Omar's manual
 * dashboard work.
 *
 * Auth: same `CHATGTM_API_TOKEN`.
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
  const row = await getContactById(id);
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, contact: toContactResponse(row) });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  let patch;
  try {
    patch = validateContactPatch(body);
  } catch (err) {
    if (err instanceof OutreachValidationError) {
      return NextResponse.json(
        { error: 'invalid_field', field: err.field, message: err.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'invalid_body', detail: (err as Error).message },
      { status: 400 },
    );
  }

  // Auto-stamp `connection_sent_at = now()` when the caller flips
  // status to "sent" without providing a timestamp. Same convenience
  // for accepted / replied so the dashboard's "Mark sent" /
  // "Mark replied" buttons can hit the endpoint with a single field.
  if (patch.connection_status_value === 'sent' && patch.connection_sent_at === undefined) {
    patch.connection_sent_at = new Date().toISOString();
  }
  if (
    patch.connection_status_value === 'accepted' &&
    patch.connection_accepted_at === undefined
  ) {
    patch.connection_accepted_at = new Date().toISOString();
  }
  if (
    patch.connection_status_value === 'replied' &&
    patch.reply_received_at === undefined
  ) {
    patch.reply_received_at = new Date().toISOString();
  }

  try {
    await ensureSchema();
    const updated = await patchContact(id, patch);
    if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, contact: toContactResponse(updated) });
  } catch (err) {
    console.error('[outreach/contacts/:id PATCH] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
