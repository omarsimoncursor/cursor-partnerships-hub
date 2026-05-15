import { NextRequest, NextResponse } from 'next/server';
import {
  getProspectBySlug,
  isDatabaseConfigured,
  isValidSlug,
  recordEvent,
} from '@/lib/prospect-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Whitelist of event types we accept from the browser. Anything else
// returns 422 so a misbehaving client (or someone fuzzing the endpoint)
// can't pollute the events table.
const ALLOWED_EVENT_TYPES = new Set([
  'page.view',
  'page.unlocked',
  'unlock.attempt',
  'unlock.success',
  'unlock.failure',
  'cta.click',
  'vendor.run',
  'vendor.reset',
  'vendor.complete',
  'vendor.card.click',
  'vendor.modal.open',
  'vendor.modal.close',
  'sdk.starter_loaded',
  'sdk.run',
  'sdk.complete',
  'sdk.artifact_opened',
  'sdk.reset',
  'roi.changed',
  'roi.pricing_assumptions_viewed',
  'nav.section_anchor',
  'page.exit',
]);

type EventBody = {
  type?: string;
  data?: Record<string, unknown>;
  session_id?: string;
  events?: Array<{ type?: string; data?: Record<string, unknown>; session_id?: string }>;
};

/**
 * POST /api/p/[slug]/track
 *
 * Public engagement-event endpoint hit by the prospect's browser as
 * they interact with the personalized demo. No Bearer auth — the slug
 * is the implicit auth, and the events we accept are bounded by the
 * whitelist above.
 *
 * Accepts either a single event:
 *   { "type": "vendor.run", "data": { "vendor": "datadog" } }
 * or a batch (used by sendBeacon on unload):
 *   { "events": [{ "type": "...", "data": {...} }, ...] }
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const { slug } = await context.params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Lookup the prospect once; we'll use its id for every event in the
  // batch. If the slug isn't in the DB we still 204 (don't leak which
  // slugs are real to drive-by crawlers).
  const prospect = await getProspectBySlug(slug);
  if (!prospect) {
    return new NextResponse(null, { status: 204 });
  }

  let body: EventBody;
  try {
    body = (await req.json()) as EventBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const events =
    Array.isArray(body?.events) && body.events.length > 0
      ? body.events
      : body?.type
        ? [{ type: body.type, data: body.data, session_id: body.session_id }]
        : [];

  if (events.length === 0) {
    return NextResponse.json({ error: 'no_events' }, { status: 400 });
  }
  if (events.length > 50) {
    return NextResponse.json({ error: 'batch_too_large' }, { status: 413 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const userAgent = req.headers.get('user-agent');

  let accepted = 0;
  let rejected = 0;
  for (const ev of events) {
    const type = typeof ev?.type === 'string' ? ev.type.trim() : '';
    if (!type || !ALLOWED_EVENT_TYPES.has(type)) {
      rejected += 1;
      continue;
    }
    try {
      await recordEvent({
        prospectId: prospect.id,
        slug,
        eventType: type,
        eventData: ev?.data && typeof ev.data === 'object' ? ev.data : {},
        sessionId: typeof ev?.session_id === 'string' ? ev.session_id : null,
        ip,
        userAgent,
      });
      accepted += 1;
    } catch (err) {
      console.error('[p/track] recordEvent failed:', err);
      rejected += 1;
    }
  }

  return NextResponse.json({ ok: true, accepted, rejected });
}
