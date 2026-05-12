import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import {
  createProspect,
  ensureSchema,
  isDatabaseConfigured,
  listProspects,
  runBuild,
  toPublic,
  ValidationError,
} from '@/lib/prospect-store';
import type { ChatgtmProspectInput } from '@/lib/prospect-store';
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
 * GET /api/chatgtm/prospects?limit=N
 *
 * Lists recent prospects. Used by the admin UI and as a way for
 * ChatGTM to verify state.
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 100), 500);
  try {
    await ensureSchema();
    const rows = await listProspects(limit);
    return NextResponse.json({
      ok: true,
      count: rows.length,
      prospects: rows.map(toPublic),
    });
  } catch (err: unknown) {
    console.error('[chatgtm/prospects] list failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
