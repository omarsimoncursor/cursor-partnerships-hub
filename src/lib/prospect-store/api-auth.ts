import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

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

export function originFromRequest(req: NextRequest): string {
  const envOrigin = process.env.PUBLIC_APP_ORIGIN;
  if (envOrigin) return envOrigin.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  return `${proto}://${host}`;
}
