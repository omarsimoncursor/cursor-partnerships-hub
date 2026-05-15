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
// URL it generates (e.g. ChatGTM's `url`, `demo_url`). The priority
// order is split by environment because the operator's expectations
// are different in production vs. staging/preview:
//
//   PRODUCTION (VERCEL_ENV === 'production'):
//     1. SETUP_CONFIG.canonicalOrigin (always wins — build-baked,
//        in-code, AGENT-EDITED, authoritative for this fork).
//     2. process.env.PUBLIC_APP_ORIGIN (legacy fallback, only used
//        when canonicalOrigin is somehow blank).
//     3. Request Host header (last-ditch fallback).
//
//   NON-PRODUCTION (preview / dev / staging):
//     1. process.env.PUBLIC_APP_ORIGIN (runtime override, used for
//        staging deploys and ad-hoc preview testing).
//     2. SETUP_CONFIG.canonicalOrigin.
//     3. Request Host header (so a preview at
//        <branch>-<project>.vercel.app self-links instead of pointing
//        at production).
//
// Why canonicalOrigin trumps the env var in production: the env var
// is easy to set and forget — and when it gets stale (e.g. it still
// points at the legacy `cursorpartners.omarsimon.com`), every URL
// the API hands ChatGTM is wrong. The build-baked `canonicalOrigin`
// requires editing source + redeploying, which is the right gate for
// "rename the user-facing canonical host". The env var stays useful
// for staging deploys where you do want a runtime override.
export function originFromRequest(req: NextRequest): string {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const canonical = SETUP_CONFIG.canonicalOrigin?.trim();
  const envOrigin = process.env.PUBLIC_APP_ORIGIN?.trim();

  if (isProduction) {
    if (canonical) return canonical.replace(/\/$/, '');
    if (envOrigin) return envOrigin.replace(/\/$/, '');
  } else {
    if (envOrigin) return envOrigin.replace(/\/$/, '');
    if (canonical) return canonical.replace(/\/$/, '');
  }

  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  return `${proto}://${host}`;
}
