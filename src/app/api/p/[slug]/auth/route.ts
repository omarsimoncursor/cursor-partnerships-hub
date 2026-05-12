import { NextRequest, NextResponse } from 'next/server';
import {
  gateCookieMaxAgeSeconds,
  gateCookieName,
  getProspectBySlug,
  isDatabaseConfigured,
  passwordsMatch,
  recordView,
  signGateCookie,
} from '@/lib/prospect-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/p/[slug]/auth
 *
 * Password gate for personalized prospect demos. Body: { password: string }.
 * On success, sets an HMAC-signed `pdemo_<slug>` cookie that the
 * demo page (`/p/[slug]`) checks server-side.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const { slug } = await context.params;
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

  const prospect = await getProspectBySlug(slug);
  if (!prospect) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ok = passwordsMatch(password, prospect.password);

  // Record the attempt for the audit trail (helpful for the rep to
  // know when the prospect actually clicked the link).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const ua = req.headers.get('user-agent');
  await recordView(prospect.id, ip, ua, ok);

  if (!ok) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    redirect: `/p/${slug}`,
    prospect: {
      name: prospect.name,
      company: prospect.company_name,
    },
  });
  res.cookies.set({
    name: gateCookieName(slug),
    value: signGateCookie(slug),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: gateCookieMaxAgeSeconds(),
  });
  return res;
}

/** Clear the unlock cookie (used by the admin "preview as prospect" flow). */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: gateCookieName(slug),
    value: '',
    path: '/',
    maxAge: 0,
  });
  return res;
}
