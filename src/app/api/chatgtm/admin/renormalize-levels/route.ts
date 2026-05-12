import { NextRequest, NextResponse } from 'next/server';
import { backfillLevelNormalization, isDatabaseConfigured } from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chatgtm/admin/renormalize-levels[?dry_run=1]
 *
 * Maintenance endpoint that re-runs the level normalizer against every
 * existing prospect's stored `level_raw` value and updates rows whose
 * `level_normalized` no longer matches. Idempotent.
 *
 * Used to repair ChatGTM batches that landed before the normalizer
 * understood "Vice President" / "AVP" / "EVP" inside longer titles
 * (these previously fell through to `unknown` and got ROI=false).
 *
 * Auth: Bearer CHATGTM_API_TOKEN.
 *
 * `?dry_run=1` returns the diff without writing anything — useful for
 * the admin to preview before pulling the trigger.
 *
 * Response:
 *   {
 *     ok: true,
 *     dry_run: false,
 *     scanned: 47,
 *     changed: 4,
 *     changes: [
 *       { id, slug, name, company_name, level_raw,
 *         old_level: "unknown", new_level: "vp", roi_changed: true },
 *       ...
 *     ]
 *   }
 */
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const dryRun = req.nextUrl.searchParams.get('dry_run') === '1';
  try {
    const result = await backfillLevelNormalization({ dryRun });
    return NextResponse.json({ ok: true, dry_run: dryRun, ...result });
  } catch (err: unknown) {
    console.error('[admin/renormalize-levels] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

// Allow a GET that simply runs in dry-run mode for safe inspection.
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  try {
    const result = await backfillLevelNormalization({ dryRun: true });
    return NextResponse.json({ ok: true, dry_run: true, ...result });
  } catch (err: unknown) {
    console.error('[admin/renormalize-levels GET] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
