import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, isDatabaseConfigured } from '@/lib/prospect-store';
import {
  getRunById,
  insertSignals,
  mapExternalKeysToIds,
  OutreachValidationError,
  validateSignalInput,
} from '@/lib/outreach-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BATCH = 1000;

/**
 * POST /api/outreach/contact-signals/batch
 *
 * Child rows for time-series filtering. Each signal references its
 * parent contact by `contact_external_key` (the same external_key
 * used in the contacts batch); the server resolves it to the
 * matching contact_id within the same run.
 *
 * Idempotent on (contact_id, signal_type, detected_at) — re-POSTing
 * the same signal is a no-op.
 *
 * Auth: same `CHATGTM_API_TOKEN`.
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
  const signalsRaw = obj.signals;
  if (!Array.isArray(signalsRaw)) {
    return NextResponse.json(
      { error: 'invalid_field', field: 'signals', message: '`signals` must be an array.' },
      { status: 400 },
    );
  }
  if (signalsRaw.length === 0) {
    return NextResponse.json({ error: 'empty_batch' }, { status: 400 });
  }
  if (signalsRaw.length > MAX_BATCH) {
    return NextResponse.json(
      {
        error: 'batch_too_large',
        detail: `Max ${MAX_BATCH} signals per request, got ${signalsRaw.length}.`,
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
          message: `No run with id "${runId}".`,
        },
        { status: 404 },
      );
    }

    // Validate every signal first; collect external_keys for the
    // single map-lookup.
    const validated: Array<{
      idx: number;
      input: ReturnType<typeof validateSignalInput>;
    }> = [];
    const failures: Array<{
      input_index: number;
      error: string;
      field?: string;
      message: string;
    }> = [];
    for (let i = 0; i < signalsRaw.length; i += 1) {
      try {
        validated.push({ idx: i, input: validateSignalInput(signalsRaw[i], i) });
      } catch (err) {
        if (err instanceof OutreachValidationError) {
          failures.push({
            input_index: i,
            error: 'invalid_field',
            field: err.field,
            message: err.message,
          });
        } else {
          failures.push({
            input_index: i,
            error: 'invalid_body',
            message: (err as Error).message,
          });
        }
      }
    }

    const externalKeys = Array.from(
      new Set(validated.map((v) => v.input.contact_external_key)),
    );
    const idMap = await mapExternalKeysToIds(runId, externalKeys);
    const toInsert: Array<
      ReturnType<typeof validateSignalInput> & { contact_id: string }
    > = [];
    for (const v of validated) {
      const cid = idMap.get(v.input.contact_external_key);
      if (!cid) {
        failures.push({
          input_index: v.idx,
          error: 'not_found',
          field: 'contact_external_key',
          message: `No contact in run with external_key "${v.input.contact_external_key}". POST /api/outreach/contacts/batch first.`,
        });
        continue;
      }
      toInsert.push({ ...v.input, contact_id: cid });
    }

    const { inserted } = await insertSignals({ signals: toInsert });
    return NextResponse.json(
      {
        ok: failures.length === 0,
        inserted,
        failed: failures.length,
        results: failures,
      },
      { status: failures.length === 0 ? 200 : 207 },
    );
  } catch (err) {
    console.error('[outreach/contact-signals/batch POST] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
