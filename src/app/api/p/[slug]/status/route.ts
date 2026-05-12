import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import {
  getBuildStatus,
  getProspectBySlug,
  isDatabaseConfigured,
  isValidSlug,
  runBuild,
} from '@/lib/prospect-store';
import { originFromRequest } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/p/[slug]/status
 *
 * Lightweight polling endpoint for the building UI. Returns the
 * current build state. If the build is still queued / failed, this
 * call also re-kicks the builder via `after()` so a stuck row
 * eventually completes — independent of the original create call.
 */
export async function GET(
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

  const status = await getBuildStatus(slug);
  if (!status) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // If the build is queued (the create-time `after()` task didn't run
  // or got terminated), nudge it from the polling path. Builds are
  // claimed atomically in the DB so this is safe to call repeatedly.
  if (status.build_status === 'queued' || status.build_status === 'failed') {
    const prospect = await getProspectBySlug(slug);
    if (prospect) {
      const origin = originFromRequest(req);
      after(async () => {
        await runBuild(prospect.id, origin).catch((err) => {
          console.error('[p/status] background build failed:', err);
        });
      });
    }
  }

  return NextResponse.json({
    ok: true,
    slug,
    build_status: status.build_status,
    build_started_at: status.build_started_at,
    build_completed_at: status.build_completed_at,
    build_error: status.build_error,
    is_ready: status.build_status === 'ready',
  });
}
