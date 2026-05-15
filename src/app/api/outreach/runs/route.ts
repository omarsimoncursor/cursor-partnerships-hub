import { NextRequest, NextResponse } from 'next/server';
import {
  ensureSchema,
  isDatabaseConfigured,
} from '@/lib/prospect-store';
import {
  OutreachValidationError,
  upsertRun,
  validateRunInput,
} from '@/lib/outreach-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/outreach/runs
 *
 * Idempotent on `automation_run_id`. Re-POSTing with the same id
 * upserts the summary counters (last-write-wins).
 *
 * Auth: same `CHATGTM_API_TOKEN` as the existing prospects endpoints.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'db_not_configured' },
      { status: 503 },
    );
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  let input;
  try {
    input = validateRunInput(body);
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

  try {
    await ensureSchema();
    const run = await upsertRun(input);
    return NextResponse.json({ ok: true, run_id: run.id, run });
  } catch (err) {
    console.error('[outreach/runs POST] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
