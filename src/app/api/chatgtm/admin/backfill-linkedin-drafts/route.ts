import { NextRequest, NextResponse } from 'next/server';
import { backfillLinkedinDrafts, isDatabaseConfigured } from '@/lib/prospect-store';
import { checkBearerToken } from '@/lib/prospect-store/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chatgtm/admin/backfill-linkedin-drafts[?dry_run=1][&overwrite=1]
 *
 * Maintenance endpoint that fills in `linkedin_draft` on every
 * prospect that doesn't already have one, using the shared default
 * template (see `linkedin-draft-template.ts`). The rep triggers this
 * from the Sequences-tab toolbar when ChatGTM's Prospecting Blitz
 * landed a batch without drafts — so every row has at least the
 * template prose for the "Send LI" dialog to copy.
 *
 * Auth: Bearer CHATGTM_API_TOKEN.
 *
 * Query params:
 *   ?dry_run=1   Return the diff without writing anything.
 *   ?overwrite=1 Reset every prospect's draft to the template,
 *                including rows that already have a non-empty draft.
 *                Defaults to false (fill-only).
 *
 * Response:
 *   {
 *     ok: true,
 *     dry_run: false,
 *     overwrite: false,
 *     scanned: 47,
 *     changed: 12,
 *     skipped: 35,
 *     changes: [
 *       { id, slug, name, company_name,
 *         old_draft: null, new_draft: "Anindya - i put together…" },
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
  const overwrite = req.nextUrl.searchParams.get('overwrite') === '1';
  try {
    const result = await backfillLinkedinDrafts({ dryRun, overwrite });
    return NextResponse.json({ ok: true, dry_run: dryRun, overwrite, ...result });
  } catch (err: unknown) {
    console.error('[admin/backfill-linkedin-drafts] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}

// GET = safe dry-run preview. Useful for the rep to see "what would
// change" without writing anything; mirrors the renormalize-levels
// endpoint's GET semantics.
export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }
  const authError = checkBearerToken(req, 'CHATGTM_API_TOKEN');
  if (authError) return authError;

  const overwrite = req.nextUrl.searchParams.get('overwrite') === '1';
  try {
    const result = await backfillLinkedinDrafts({ dryRun: true, overwrite });
    return NextResponse.json({ ok: true, dry_run: true, overwrite, ...result });
  } catch (err: unknown) {
    console.error('[admin/backfill-linkedin-drafts GET] failed:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: (err as Error).message },
      { status: 500 },
    );
  }
}
