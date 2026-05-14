import { NextRequest, NextResponse } from 'next/server';
import {
  adminCookieMaxAgeSeconds,
  adminCookieName,
  getAdminPassword,
  signAdminCookie,
  verifyAdminCookie,
  verifyAdminPassword,
} from '@/lib/prospect-store/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/auth
 * Body: { password: string }
 *
 * Server-side check against ADMIN_PASSWORD (env, defaulting to a
 * fixed value baked in for single-operator ergonomics). On success,
 * sets an HMAC-signed `pb_admin_session` cookie (HttpOnly, 30-day TTL)
 * that the admin server-component reads.
 *
 * Failure responds 401 with no detail so the rate of guesses is
 * uninteresting (the password isn't a high-security gate; it's a
 * "don't accidentally find this in someone's screen-share" one).
 */
export async function POST(req: NextRequest) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      {
        error: 'admin_password_not_configured',
        detail:
          'ADMIN_PASSWORD env var is not set. Configure it in the deployment environment (Vercel project settings or Cursor Cloud Secrets) and redeploy. See AGENTS.md.',
      },
      { status: 503 },
    );
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const password = (body?.password || '').toString();
  if (!password) {
    return NextResponse.json({ error: 'missing_password' }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: adminCookieName(),
    value: signAdminCookie(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: adminCookieMaxAgeSeconds(),
  });
  return res;
}

/** GET /api/admin/auth — returns whether the current request has a valid session cookie. */
export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(adminCookieName())?.value;
  return NextResponse.json({ ok: verifyAdminCookie(cookieValue) });
}

/** DELETE /api/admin/auth — clears the session cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: adminCookieName(),
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
