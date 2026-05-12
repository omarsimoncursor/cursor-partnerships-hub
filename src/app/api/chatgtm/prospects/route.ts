import { NextRequest, NextResponse } from 'next/server';
import {
  createProspect,
  ensureSchema,
  isDatabaseConfigured,
  listProspects,
  toPublic,
  ValidationError,
} from '@/lib/prospect-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chatgtm/prospects
 *
 * Receives a prospect record from ChatGTM, creates a personalized
 * demo, and returns the demo URL + password.
 *
 * Auth: `Authorization: Bearer ${CHATGTM_API_TOKEN}`.
 *
 * Request body (application/json):
 * {
 *   "name": "Jane Smith",                 // required
 *   "company": "Unisys",                  // required
 *   "email": "jane@unisys.com",
 *   "level": "VP",                        // director | vp | svp | executive | manager | team_lead | c_level
 *   "linkedin_url": "https://linkedin.com/in/janesmith",
 *   "company_domain": "unisys.com",
 *   "company_accent": "#FFB81C",
 *   "technologies": ["Datadog","Snowflake","GitHub"],
 *   "mcp_relevant": true,
 *   "sdk_workflow": "datadog-slo-breach",
 *   "gmail_draft_link": "https://mail.google.com/...",
 *   "linkedin_message_link": "https://linkedin.com/messages/...",
 *   "notion_page_id": "abc123",
 *   "metadata": { ... }
 * }
 *
 * Response 201:
 * {
 *   "ok": true,
 *   "id": "uuid",
 *   "slug": "abc123XYZ0",
 *   "url": "https://cursor.omarsimon.com/p/abc123XYZ0",
 *   "password": "Jane4827",
 *   "level": "vp",
 *   "show_roi_calculator": true,
 *   "vendor_ids": ["datadog","snowflake","github"],
 *   "unmatched_technologies": []
 * }
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error: 'db_not_configured',
        detail: 'DATABASE_URL is not set on this deployment.',
      },
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

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const origin = originFromRequest(req);
    const result = await createProspect(body as Parameters<typeof createProspect>[0], origin);

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
        company: {
          name: result.prospect.company_name,
          domain: result.prospect.company_domain,
          accent: result.prospect.company_accent,
        },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: 'validation_error', detail: err.message }, { status: 400 });
    }
    console.error('[chatgtm/prospects] create failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chatgtm/prospects?limit=50
 *
 * Lists recent prospects. Used by the admin UI and as a way for
 * ChatGTM to verify state.
 */
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'db_not_configured' },
      { status: 503 },
    );
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
