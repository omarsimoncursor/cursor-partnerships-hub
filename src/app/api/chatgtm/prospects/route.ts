import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import {
  createProspect,
  ensureSchema,
  getProspectBySlug,
  isDatabaseConfigured,
  listProspectsFiltered,
  runBuild,
  toChatgtmResponse,
  updateProspectOutreach,
  validateOutreachPatch,
  ValidationError,
  type ChatgtmProspectInput,
} from '@/lib/prospect-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hard cap on batch size — protects the upstream Neon pool and keeps
// latency predictable for the synchronous response.
const MAX_BATCH = 100;

/**
 * POST /api/chatgtm/prospects
 *
 * Accepts either a single prospect object OR a batch.
 *
 * Single (legacy / convenience):
 *   { "name": "...", "company": "...", ... }
 *
 * Batch:
 *   { "prospects": [ {"name": "..."}, {"name": "..."}, ... ] }
 *
 * Bare array:
 *   [ {"name": "..."}, {"name": "..."} ]
 *
 * The endpoint inserts every row, returns the demo URL + password for
 * each one synchronously (so ChatGTM can write them straight to Notion
 * + the auto-drafted Gmail / LinkedIn messages), and schedules a
 * background build for every successfully created row via Next.js'
 * `after()` so the build keeps running after the response is sent.
 *
 * Auth: `Authorization: Bearer ${CHATGTM_API_TOKEN}`.
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'db_not_configured', detail: 'DATABASE_URL is not set on this deployment.' },
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

  const parsed = parsePayload(body);
  if ('error' in parsed) {
    return NextResponse.json(parsed, { status: 400 });
  }
  const { inputs, mode } = parsed;

  if (inputs.length === 0) {
    return NextResponse.json({ error: 'empty_batch' }, { status: 400 });
  }
  if (inputs.length > MAX_BATCH) {
    return NextResponse.json(
      { error: 'batch_too_large', detail: `Max ${MAX_BATCH} prospects per request, got ${inputs.length}.` },
      { status: 413 },
    );
  }

  try {
    await ensureSchema();
    const origin = originFromRequest(req);

    if (mode === 'single') {
      // Preserve the original single-prospect response shape so existing
      // callers that POSTed `{name, company, ...}` aren't broken.
      const result = await createProspect(inputs[0], origin);
      after(async () => {
        await runBuild(result.prospect.id, origin).catch((err) => {
          console.error('[chatgtm/prospects] background build failed:', err);
        });
      });
      return NextResponse.json(
        {
          ok: true,
          id: result.prospect.id,
          slug: result.prospect.slug,
          url: result.url,
          password: result.password,
          level: result.prospect.level_normalized,
          show_roi_calculator: result.prospect.show_roi_calculator,
          vendor_ids: result.prospect.vendor_ids,
          unmatched_technologies: result.prospect.unmatched_technologies,
          filtered_technologies:
            (result.prospect.metadata?.filtered_technologies as string[] | undefined) || [],
          build_status: result.prospect.build_status,
          company: {
            name: result.prospect.company_name,
            domain: result.prospect.company_domain,
            accent: result.prospect.company_accent,
          },
        },
        { status: 201 },
      );
    }

    // Batch: best-effort per row so a single bad payload doesn't fail
    // the whole batch.
    const results: Array<
      | {
          ok: true;
          input_index: number;
          id: string;
          slug: string;
          url: string;
          password: string;
          level: string;
          show_roi_calculator: boolean;
          vendor_ids: string[];
          unmatched_technologies: string[];
          filtered_technologies: string[];
          build_status: string;
          company: { name: string; domain: string; accent: string | null };
        }
      | {
          ok: false;
          input_index: number;
          error: string;
          detail: string;
        }
    > = [];

    const created: Array<{ id: string }> = [];
    for (let i = 0; i < inputs.length; i += 1) {
      try {
        const r = await createProspect(inputs[i], origin);
        created.push({ id: r.prospect.id });
        results.push({
          ok: true,
          input_index: i,
          id: r.prospect.id,
          slug: r.prospect.slug,
          url: r.url,
          password: r.password,
          level: r.prospect.level_normalized,
          show_roi_calculator: r.prospect.show_roi_calculator,
          vendor_ids: r.prospect.vendor_ids,
          unmatched_technologies: r.prospect.unmatched_technologies,
          filtered_technologies:
            (r.prospect.metadata?.filtered_technologies as string[] | undefined) || [],
          build_status: r.prospect.build_status,
          company: {
            name: r.prospect.company_name,
            domain: r.prospect.company_domain,
            accent: r.prospect.company_accent,
          },
        });
      } catch (err) {
        const isValidation = err instanceof ValidationError;
        results.push({
          ok: false,
          input_index: i,
          error: isValidation ? 'validation_error' : 'internal_error',
          detail: (err as Error).message,
        });
      }
    }

    // Schedule background builds *after* the response is sent. Next.js'
    // `after()` keeps the function alive on Vercel until the work finishes
    // (or hits the function timeout). Lazy-build on first /p/[slug] view
    // is the fallback when builds don't complete here.
    after(async () => {
      const concurrency = 4;
      let i = 0;
      const workers = Array.from({ length: Math.min(concurrency, created.length) }, async () => {
        while (i < created.length) {
          const idx = i;
          i += 1;
          try {
            await runBuild(created[idx].id, origin);
          } catch (err) {
            console.error('[chatgtm/prospects] background build failed:', err);
          }
        }
      });
      await Promise.all(workers);
    });

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.length - succeeded;
    return NextResponse.json(
      {
        ok: failed === 0,
        count: results.length,
        succeeded,
        failed,
        prospects: results,
      },
      { status: failed === 0 ? 201 : 207 /* multi-status */ },
    );
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: 'validation_error', detail: err.message }, { status: 400 });
    }
    console.error('[chatgtm/prospects] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

type ParsedPayload =
  | { mode: 'single' | 'batch'; inputs: ChatgtmProspectInput[] }
  | { error: string; detail?: string };

function parsePayload(body: unknown): ParsedPayload {
  if (Array.isArray(body)) {
    if (!body.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return { error: 'invalid_body', detail: 'Array must contain objects.' };
    }
    return { mode: 'batch', inputs: body as ChatgtmProspectInput[] };
  }
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (Array.isArray(obj.prospects)) {
      if (!obj.prospects.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
        return { error: 'invalid_body', detail: '`prospects` must be an array of objects.' };
      }
      return { mode: 'batch', inputs: obj.prospects as ChatgtmProspectInput[] };
    }
    return { mode: 'single', inputs: [obj as ChatgtmProspectInput] };
  }
  return { error: 'invalid_body', detail: 'Body must be an object or an array of objects.' };
}

/**
 * GET /api/chatgtm/prospects
 *
 * Lists prospects with optional filters. Used by:
 *   - The admin UI / monitoring (no params -> recent rows).
 *   - ChatGTM's Prospecting Blitz (?company_domain=unisys.com -> the
 *     dedup query: every existing row for one account).
 *   - The Sequence Orchestrator (?company_domain=&replied=false&
 *     last_sequence_sent_lt=6 -> the active-sequence pull).
 *
 * Pagination is cursor-based: pass `cursor` from a previous response's
 * `next_cursor` to resume strictly after that row. Callers iterate
 * until `next_cursor` is null.
 *
 * Query params:
 *   ?company_domain=unisys.com      Exact lowercase match (the dedup
 *                                   key for the Blitz).
 *   ?replied=false                  Filters by the replied flag.
 *   ?last_sequence_sent_lt=6        "< N" semantics that ALSO include
 *                                   NULL (never started). 6 selects
 *                                   every "not-yet-complete" prospect.
 *   ?limit=200                      1-500. Defaults to 200.
 *   ?cursor=...                     Opaque cursor from a previous
 *                                   page's `next_cursor`.
 *
 * Response:
 *   {
 *     ok: true,
 *     count: N,
 *     next_cursor: "..." | null,
 *     prospects: [ ChatgtmProspectResponse, ... ]
 *   }
 *
 * Each prospect carries the full new outreach-tracking column set
 * (linkedin_draft, linkedin_sent, mcp_detail, team, classified_level,
 * last_sequence_sent, last_email_send_date, replied, thread_id) plus
 * a computed `demo_url` and the existing demo password exposed as
 * `demo_password`.
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const params = req.nextUrl.searchParams;
  const companyDomain = params.get('company_domain')?.trim().toLowerCase() || null;

  let replied: boolean | null = null;
  const repliedParam = params.get('replied');
  if (repliedParam !== null) {
    if (repliedParam === 'true') replied = true;
    else if (repliedParam === 'false') replied = false;
    else {
      return NextResponse.json(
        {
          error: 'invalid_field',
          field: 'replied',
          message: '`replied` must be "true" or "false".',
        },
        { status: 400 },
      );
    }
  }

  let lastSequenceSentLt: number | null = null;
  const lastSeqParam = params.get('last_sequence_sent_lt');
  if (lastSeqParam !== null) {
    const parsed = Number(lastSeqParam);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 7) {
      return NextResponse.json(
        {
          error: 'invalid_field',
          field: 'last_sequence_sent_lt',
          message: '`last_sequence_sent_lt` must be an integer in 1..7.',
        },
        { status: 400 },
      );
    }
    lastSequenceSentLt = parsed;
  }

  const limitParam = params.get('limit');
  const limit = limitParam !== null ? Number(limitParam) : null;

  const cursor = params.get('cursor') || null;

  try {
    await ensureSchema();
    const origin = originFromRequest(req);
    const page = await listProspectsFiltered({
      companyDomain,
      replied,
      lastSequenceSentLt,
      cursor,
      limit,
    });
    return NextResponse.json({
      ok: true,
      count: page.rows.length,
      next_cursor: page.nextCursor,
      prospects: page.rows.map((row) => toChatgtmResponse(row, origin)),
    });
  } catch (err: unknown) {
    console.error('[chatgtm/prospects] list failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/chatgtm/prospects
 *
 * Batch outreach update. The Sequence Orchestrator typically updates
 * 5-15 prospects per run (one per email it just sent). Sending one
 * HTTP call instead of N keeps the Vercel function and the Neon pool
 * happy, and lets the orchestrator stamp `last_sequence_sent` /
 * `last_email_send_date` / `thread_id` for every prospect in lock-step
 * with its outbound Gmail send.
 *
 * Body:
 *   {
 *     "updates": [
 *       { "id": "<uuid|slug>", "last_sequence_sent": 1, ... },
 *       { "id": "<uuid|slug>", "replied": true },
 *       ...
 *     ]
 *   }
 *
 * Each `updates[i].id` accepts either a UUID or a 10-char slug. Each
 * row is validated independently — a single bad row never aborts the
 * batch; instead it lands in the response as `{ok:false, error,
 * field, message}` while the rest are still applied.
 */
export async function PATCH(req: NextRequest) {
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
    return NextResponse.json(
      { error: 'invalid_body', detail: 'Body must be `{updates: [...]}`.' },
      { status: 400 },
    );
  }
  const updates = (body as { updates?: unknown }).updates;
  if (!Array.isArray(updates)) {
    return NextResponse.json(
      { error: 'invalid_body', detail: '`updates` must be an array.' },
      { status: 400 },
    );
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: 'empty_batch' }, { status: 400 });
  }
  if (updates.length > MAX_BATCH) {
    return NextResponse.json(
      { error: 'batch_too_large', detail: `Max ${MAX_BATCH} updates per request, got ${updates.length}.` },
      { status: 413 },
    );
  }

  await ensureSchema();
  const origin = originFromRequest(req);

  type BatchResult =
    | {
        ok: true;
        input_index: number;
        id: string;
        prospect: ReturnType<typeof toChatgtmResponse>;
      }
    | {
        ok: false;
        input_index: number;
        id: string | null;
        error: string;
        field?: string;
        message: string;
      };

  const results: BatchResult[] = [];
  for (let i = 0; i < updates.length; i += 1) {
    const item = updates[i];
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      results.push({
        ok: false,
        input_index: i,
        id: null,
        error: 'invalid_body',
        message: `updates[${i}] must be an object.`,
      });
      continue;
    }
    const obj = item as Record<string, unknown>;
    const rawId = obj.id;
    if (typeof rawId !== 'string' || !rawId.trim()) {
      results.push({
        ok: false,
        input_index: i,
        id: null,
        error: 'invalid_field',
        field: 'id',
        message: '`id` is required (UUID or slug).',
      });
      continue;
    }
    const id = rawId.trim();

    // Resolve uuid vs slug -> uuid.
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
    let resolvedId: string;
    try {
      if (isUuid) {
        resolvedId = id;
      } else {
        const row = await getProspectBySlug(id);
        if (!row) {
          results.push({
            ok: false,
            input_index: i,
            id,
            error: 'not_found',
            message: `No prospect with id/slug "${id}".`,
          });
          continue;
        }
        resolvedId = row.id;
      }
    } catch (err) {
      results.push({
        ok: false,
        input_index: i,
        id,
        error: 'internal_error',
        message: (err as Error).message,
      });
      continue;
    }

    // Strip `id` before validating; the rest of the body is the patch.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _drop, ...patchBody } = obj;
    const validated = validateOutreachPatch(patchBody);
    if (!validated.ok) {
      results.push({
        ok: false,
        input_index: i,
        id,
        error: validated.error.error,
        field: validated.error.field,
        message: validated.error.message,
      });
      continue;
    }

    try {
      const updated = await updateProspectOutreach(resolvedId, validated.patch);
      if (!updated) {
        results.push({
          ok: false,
          input_index: i,
          id,
          error: 'not_found',
          message: `No prospect with id "${resolvedId}".`,
        });
        continue;
      }
      results.push({
        ok: true,
        input_index: i,
        id,
        prospect: toChatgtmResponse(updated, origin),
      });
    } catch (err) {
      results.push({
        ok: false,
        input_index: i,
        id,
        error: 'internal_error',
        message: (err as Error).message,
      });
    }
  }

  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.length - succeeded;
  return NextResponse.json(
    {
      ok: failed === 0,
      count: results.length,
      succeeded,
      failed,
      results,
    },
    { status: failed === 0 ? 200 : 207 },
  );
}
