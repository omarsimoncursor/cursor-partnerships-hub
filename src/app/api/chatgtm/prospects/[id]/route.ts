import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProspect,
  getProspectById,
  getProspectBySlug,
  isDatabaseConfigured,
  toChatgtmResponse,
  toPublic,
  updateProspect,
  updateProspectOutreach,
  validateOutreachPatch,
  type OutreachPatch,
  type ProspectPatch,
} from '@/lib/prospect-store';
import { checkBearerToken, originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chatgtm/prospects/:id
 *
 * Lookup a single prospect by either UUID or slug. ChatGTM uses this
 * to confirm state after `POST /api/chatgtm/prospects` returns. The
 * response shape is the same `ChatgtmProspectResponse` returned by
 * `GET /api/chatgtm/prospects` (includes outreach columns + demo_url
 * + demo_password) so callers can use either interchangeably.
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
  const origin = originFromRequest(req);
  return NextResponse.json({
    ok: true,
    prospect: toChatgtmResponse(row, origin),
  });
}

// Fields owned by the ChatGTM Sequence Orchestrator + Reply Detector.
// When ALL keys in the request body are in this set, we route the
// PATCH through the strict outreach validator (which surfaces
// field-level errors). When any key is outside this set, we fall back
// to the admin-edit-modal path (loose whitelist; silently drops
// unknown keys; backward-compatible with the existing `level` ->
// raw-title semantics).
const OUTREACH_PATCH_FIELDS = new Set([
  'last_sequence_sent',
  'last_email_send_date',
  'thread_id',
  'replied',
  'linkedin_sent',
  'linkedin_draft',
  'reached_out_at',
  'mcp_detail',
  'team',
  'classified_level',
  // `email` and `linkedin_url` overlap with the admin path. The
  // outreach validator's stricter shape matters when these are the
  // only fields in the body — that's a Sequence Orchestrator call to
  // correct a bad email — so list them here too.
  'email',
  'linkedin_url',
]);

/**
 * PATCH /api/chatgtm/prospects/:id
 *
 * Two callers, two semantics, one route:
 *
 *   1. Sequence Orchestrator + Reply Detector (the new path):
 *      Body is an OutreachPatch — `last_sequence_sent`, `replied`,
 *      `thread_id`, `linkedin_sent`, `linkedin_draft`, `mcp_detail`,
 *      `team`, `classified_level`, `last_email_send_date`,
 *      `reached_out_at`, `email`, `linkedin_url`. Every accepted
 *      field is strictly validated and bad shapes return
 *      `{error: "invalid_field", field: "...", message: "..."}`.
 *
 *   2. Admin edit modal (the legacy path):
 *      Body is a ProspectPatch — `name`, `email`, `linkedin_url`,
 *      `company_*`, `vendor_ids`, `mcp_relevant`, `sdk_workflow`,
 *      `show_roi_calculator`, `gmail_draft_link`,
 *      `linkedin_message_link`, `notion_page_id`, `tagline`,
 *      `metadata`, `reached_out` (stamps reached_out_at), and
 *      `level` (= raw title; re-normalized server-side). Anything
 *      outside the whitelist is silently dropped.
 *
 * The route picks the path by inspecting the request body's keys:
 * if every key is an outreach field, it goes through the strict
 * validator; otherwise the admin path runs. The slug, password, and
 * build state are immutable on both paths.
 *
 * The `:id` param accepts either a UUID or a 10-char slug.
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

  const bodyKeys = Object.keys(body as Record<string, unknown>);
  const isOutreachPatch =
    bodyKeys.length > 0 && bodyKeys.every((k) => OUTREACH_PATCH_FIELDS.has(k));

  try {
    if (isOutreachPatch) {
      const validated = validateOutreachPatch(body);
      if (!validated.ok) {
        return NextResponse.json(validated.error, { status: 400 });
      }
      const updated = await updateProspectOutreach(resolvedId, validated.patch as OutreachPatch);
      if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      const origin = originFromRequest(req);
      return NextResponse.json({ ok: true, prospect: toChatgtmResponse(updated, origin) });
    }

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
