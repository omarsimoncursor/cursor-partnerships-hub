import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProspect,
  getProspectById,
  getProspectBySlug,
  isDatabaseConfigured,
  toPublic,
  updateProspect,
  type ProspectPatch,
} from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chatgtm/prospects/:id?include=password
 *
 * Lookup a single prospect by either UUID or slug. ChatGTM uses this
 * to confirm state after `POST /api/chatgtm/prospects` returns.
 *
 * `?include=password` opts in to including the demo password in the
 * response (used by the admin UI and ChatGTM resync flows). Always
 * Bearer-authed; the explicit opt-in is a second layer of defense.
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
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  const row = isUuid ? await getProspectById(id) : await getProspectBySlug(id);
  if (!row) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const include = (req.nextUrl.searchParams.get('include') || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return NextResponse.json({
    ok: true,
    prospect: include.includes('password') ? row : toPublic(row),
  });
}

/**
 * PATCH /api/chatgtm/prospects/:id
 *
 * Partial update used by the admin edit modal. Body is a partial
 * ProspectPatch (see `src/lib/prospect-store/prospects.ts`). The store
 * silently drops any field that isn't on the editable whitelist, so
 * the slug, password, and build state are guaranteed immutable here.
 *
 * `level` is re-normalized server-side. `vendor_ids` is the primary
 * "add/remove components" knob (which vendor demo cards the page
 * renders, in order). A custom `tagline` lands in metadata.tagline and
 * is rendered by the prospect page's hero when set.
 */
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
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  // Resolve slug -> id first so the caller can PATCH by slug too.
  let resolvedId: string;
  if (isUuid) {
    resolvedId = id;
  } else {
    const row = await getProspectBySlug(id);
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    resolvedId = row.id;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    const updated = await updateProspect(resolvedId, body as ProspectPatch);
    if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, prospect: toPublic(updated) });
  } catch (err: unknown) {
    console.error('[chatgtm/prospects PATCH] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/chatgtm/prospects/:id
 *
 * Removes a prospect and (via FK cascade) all of its views + events.
 * Idempotent on the second call (returns 404 not_found).
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const { id } = await context.params;
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
  let resolvedId: string;
  if (isUuid) {
    resolvedId = id;
  } else {
    const row = await getProspectBySlug(id);
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    resolvedId = row.id;
  }

  const deleted = await deleteProspect(resolvedId);
  if (!deleted) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, id: resolvedId });
}
