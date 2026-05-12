import {
  claimForBuild,
  getProspectById,
  markBuildFailed,
  markBuildReady,
} from './prospects';

// Per-process in-flight set so concurrent triggers (eager build from the
// API call + lazy build from the first /p/[slug] view) don't double-run.
// On serverless, this is a per-instance guard; the DB transition in
// `claimForBuild` is the authoritative cross-instance lock.
const inFlight = new Map<string, Promise<BuildResult>>();

export type BuildResult = {
  ok: boolean;
  status: 'ready' | 'failed';
  durationMs: number;
  artifacts: Record<string, unknown>;
  error?: string;
};

/**
 * Run the personalized-demo build for one prospect. Idempotent: safe to
 * call concurrently and from both the API and lazy-on-view paths.
 *
 * The "build" today is intentionally lightweight — it just pre-warms the
 * company logo through `/api/logo` so the demo's first paint doesn't have
 * to wait for the upstream lookup. The state machine and artifact JSONB
 * column are the place to layer in heavier work later (LLM-generated
 * tagline, OG image generation, slack/email previews) without changing
 * the API contract.
 */
export async function runBuild(prospectId: string, origin: string): Promise<BuildResult> {
  const existing = inFlight.get(prospectId);
  if (existing) return existing;

  const promise = (async (): Promise<BuildResult> => {
    const startedAt = Date.now();
    const claimed = await claimForBuild(prospectId);
    if (!claimed) {
      // Another worker already claimed (or the row is already `ready` /
      // `building`). Read the current row and report it back.
      const row = await getProspectById(prospectId);
      const status = (row?.build_status as 'ready' | 'failed' | 'building' | 'queued') || 'queued';
      return {
        ok: status === 'ready',
        status: status === 'ready' ? 'ready' : 'failed',
        durationMs: Date.now() - startedAt,
        artifacts: row?.build_artifacts || {},
        error: row?.build_error || (status !== 'ready' ? `build_status=${status}` : undefined),
      };
    }

    try {
      const artifacts = await runBuildSteps(claimed.company_domain, origin);
      await markBuildReady(prospectId, artifacts);
      return {
        ok: true,
        status: 'ready',
        durationMs: Date.now() - startedAt,
        artifacts,
      };
    } catch (err) {
      const message = (err as Error).message || 'unknown build error';
      await markBuildFailed(prospectId, message);
      return {
        ok: false,
        status: 'failed',
        durationMs: Date.now() - startedAt,
        artifacts: {},
        error: message,
      };
    }
  })();

  inFlight.set(prospectId, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(prospectId);
  }
}

async function runBuildSteps(domain: string, origin: string): Promise<Record<string, unknown>> {
  const artifacts: Record<string, unknown> = {};
  artifacts.steps = [];
  const steps = artifacts.steps as Array<Record<string, unknown>>;

  // 1) Pre-warm the company logo. The /api/logo endpoint caches the
  //    result so the first prospect view paints instantly.
  const logoStart = Date.now();
  try {
    const logoUrl = `${origin.replace(/\/$/, '')}/api/logo?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(logoUrl, {
      headers: { 'user-agent': 'cursor-prospect-builder/1.0' },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      const data = await res.json();
      steps.push({
        step: 'logo_prefetch',
        ok: true,
        ms: Date.now() - logoStart,
        via: data?.via,
        format: data?.format,
      });
      artifacts.logo = { url: data?.url, format: data?.format, via: data?.via };
    } else {
      steps.push({
        step: 'logo_prefetch',
        ok: false,
        ms: Date.now() - logoStart,
        status: res.status,
      });
    }
  } catch (err) {
    steps.push({
      step: 'logo_prefetch',
      ok: false,
      ms: Date.now() - logoStart,
      error: (err as Error).message,
    });
  }

  // Add an artificial brief delay so the building UI is observable and
  // so this scaffolding is easy to extend with heavier work later (LLM
  // tagline generation, OG image rendering, etc.) without changing the
  // public API.
  if (process.env.PROSPECT_BUILD_DELAY_MS) {
    const delay = Math.max(0, Math.min(15_000, Number(process.env.PROSPECT_BUILD_DELAY_MS) || 0));
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  }

  artifacts.completed_at = new Date().toISOString();
  return artifacts;
}
