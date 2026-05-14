import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SETUP_CONFIG } from '../setup-config';

// All ChatGTM-facing endpoints share a single Bearer token, scoped to
// the integration. Set `CHATGTM_API_TOKEN` in the environment. Tokens
// are compared in constant time.

export function checkBearerToken(req: NextRequest, envName: string): NextResponse | null {
  const expected = process.env[envName];
  if (!expected) {
    return NextResponse.json(
      {
        error: 'auth_not_configured',
        detail: `Server is missing ${envName}. Configure it in the deployment environment.`,
      },
      { status: 503 },
    );
  }
  const header = req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/.exec(header.trim());
  const token = m?.[1] || '';
  if (!token) {
    return NextResponse.json(
      { error: 'unauthorized', detail: 'Missing Authorization: Bearer header.' },
      { status: 401 },
    );
  }
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'unauthorized', detail: 'Invalid token.' }, { status: 401 });
  }
  return null;
}

// Return the canonical origin every API response should embed in any
// URL it generates (e.g. ChatGTM's `url`, `demo_url`). Three layers,
// in priority order:
//
//   1. process.env.PUBLIC_APP_ORIGIN
//      Runtime override; wins everywhere when set. The operator pins
//      this in Vercel env vars to lock the canonical host, even on
//      traffic that lands via a legacy or preview domain.
//
//   2. SETUP_CONFIG.canonicalOrigin (production only)
//      Build-baked default. Picks up the canonical the fork was
//      deployed under without requiring an env var to be set, so a
//      fresh production deploy that forgets PUBLIC_APP_ORIGIN doesn't
//      regress to writing whatever Host header came in (which may be
//      a stale legacy domain — exactly the bug we just hit).
//
//      Gated on `VERCEL_ENV === 'production'` so preview deploys keep
//      using the request host: previews on
//      `<branch>-<project>.vercel.app` should self-link, otherwise
//      the URLs they generate would all point at production.
//
//   3. Request Host header
//      Fallback for previews + local dev. Same logic as before.
export function originFromRequest(req: NextRequest): string {
  const envOrigin = process.env.PUBLIC_APP_ORIGIN;
  if (envOrigin) return envOrigin.replace(/\/$/, '');

  const isProduction = process.env.VERCEL_ENV === 'production';
  const canonical = SETUP_CONFIG.canonicalOrigin?.trim();
  if (isProduction && canonical) {
    return canonical.replace(/\/$/, '');
  }

  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  return `${proto}://${host}`;
}
