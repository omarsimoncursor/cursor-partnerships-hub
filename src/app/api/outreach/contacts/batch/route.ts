import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import {
  getRunById,
  OutreachValidationError,
  upsertContact,
  validateContactInput,
} from '@/lib/outreach-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BATCH = 100;

/**
 * POST /api/outreach/contacts/batch
 *
 * Body: { run_id: <uuid>, contacts: [<OutreachContactInput>...] }
 *
 * Idempotent on (run_id, external_key). Re-POSTing the same row
 * preserves the UI-managed lifecycle columns
 * (connection_status_value / connection_*_at / omar_notes).
 *
 * Server side effects:
 * - Generates / reuses a demo URL + password from the prospects
 *   table for each contact (when demo_ok != false).
 * - Appends the demo URL + password to the LinkedIn message prose so
 *   the dashboard can render the full clipboard string.
 *
 * Auth: same `CHATGTM_API_TOKEN` as the existing prospects endpoints.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const obj = body as Record<string, unknown>;
  const runId = typeof obj.run_id === 'string' ? obj.run_id.trim() : '';
  if (!runId) {
    return NextResponse.json(
      { error: 'invalid_field', field: 'run_id', message: '`run_id` is required.' },
      { status: 400 },
    );
  }
  const contactsRaw = obj.contacts;
  if (!Array.isArray(contactsRaw)) {
    return NextResponse.json(
      { error: 'invalid_field', field: 'contacts', message: '`contacts` must be an array.' },
      { status: 400 },
    );
  }
  if (contactsRaw.length === 0) {
    return NextResponse.json({ error: 'empty_batch' }, { status: 400 });
  }
  if (contactsRaw.length > MAX_BATCH) {
    return NextResponse.json(
      {
        error: 'batch_too_large',
        detail: `Max ${MAX_BATCH} contacts per request, got ${contactsRaw.length}.`,
      },
      { status: 413 },
    );
  }

  try {
    await ensureSchema();
    const run = await getRunById(runId);
    if (!run) {
      return NextResponse.json(
        {
          error: 'not_found',
          field: 'run_id',
          message: `No run with id "${runId}". POST /api/outreach/runs first.`,
        },
        { status: 404 },
      );
    }

    const origin = originFromRequest(req);

    let inserted = 0;
    let updated = 0;
    const results: Array<
      | { ok: true; input_index: number; id: string; external_key: string; status: 'inserted' | 'updated' }
      | { ok: false; input_index: number; external_key: string | null; error: string; field?: string; message: string }
    > = [];

    // Sequential per-contact upsert — each contact's demo resolution
    // path may itself touch the prospects table, so parallelizing
    // here would multiply pool pressure unnecessarily.
    for (let i = 0; i < contactsRaw.length; i += 1) {
      let validated;
      try {
        validated = validateContactInput(contactsRaw[i], i);
      } catch (err) {
        if (err instanceof OutreachValidationError) {
          results.push({
            ok: false,
            input_index: i,
            external_key:
              typeof (contactsRaw[i] as { external_key?: unknown })?.external_key === 'string'
                ? ((contactsRaw[i] as { external_key: string }).external_key)
                : null,
            error: 'invalid_field',
            field: err.field,
            message: err.message,
          });
          continue;
        }
        results.push({
          ok: false,
          input_index: i,
          external_key: null,
          error: 'invalid_body',
          message: (err as Error).message,
        });
        continue;
      }

      try {
        const r = await upsertContact(runId, validated, origin);
        if (r.status === 'inserted') inserted += 1;
        else updated += 1;
        results.push({
          ok: true,
          input_index: i,
          id: r.contact.id,
          external_key: r.contact.external_key,
          status: r.status,
        });
      } catch (err) {
        results.push({
          ok: false,
          input_index: i,
          external_key: validated.external_key,
          error: 'internal_error',
          message: (err as Error).message,
        });
      }
    }

    const failed = results.filter((r) => !r.ok).length;
    const status = failed === 0 ? 200 : 207;
    return NextResponse.json(
      {
        ok: failed === 0,
        inserted,
        updated,
        skipped_duplicate: 0,
        contacts: results,
      },
      { status },
    );
  } catch (err) {
    console.error('[outreach/contacts/batch POST] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
