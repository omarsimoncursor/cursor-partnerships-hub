import crypto from 'crypto';

// Admin-page session cookie used by /prospect-builder/admin. Signed
// HMAC-SHA256 + a timestamp for expiry. Distinct from the prospect
// demo unlock cookie (`pdemo_<slug>`) so the two auth surfaces never
// shadow each other.
//
// IMPORTANT: this module is server-only. The admin password lives in
// `process.env.ADMIN_PASSWORD` and is **required** — there is no
// in-code default. This is on purpose for the public-template use
// case: a peer forking this repo without setting their own password
// must not inherit a hardcoded shared default. See AGENTS.md.
//
// The password value never gets serialized into a client bundle — it
// is read here, compared in `verifyAdminPassword`, and discarded.

const COOKIE_NAME = 'pb_admin_session';
// 30 days. The admin needs durable sign-in; rotation happens via
// the explicit Sign-out button, env var change, or password rotation.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.DEMO_GATE_SECRET ||
    'cursor-prospect-builder-admin-dev-secret-do-not-use-in-prod'
  );
}

/**
 * Returns the configured admin password or `null` if it isn't set.
 * Callers must surface a 503 (not 401) when this returns null so the
 * deploy operator sees a clear "you forgot to set the env var" signal
 * instead of a silent "wrong password" guess loop.
 */
export function getAdminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const adminCookieName = (): string => COOKIE_NAME;

export const adminCookieMaxAgeSeconds = (): number => Math.floor(MAX_AGE_MS / 1000);

/**
 * Constant-time password compare. Returns `false` (not throws) when
 * ADMIN_PASSWORD isn't set — the caller decides whether that's a 401
 * or a 503. We return false here so an attacker can't differentiate
 * "no password configured" from "wrong password" by timing.
 */
export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  const a = Buffer.from(input || '', 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signAdminCookie(): string {
  const ts = Date.now().toString(36);
  const sig = crypto.createHmac('sha256', getSecret()).update(`admin.${ts}`).digest('hex');
  return `${ts}.${sig}`;
}

export function verifyAdminCookie(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [ts, sig] = parts;
  let issuedAt: number;
  try {
    issuedAt = parseInt(ts, 36);
  } catch {
    return false;
  }
  const now = Date.now();
  if (!Number.isFinite(issuedAt) || now - issuedAt > MAX_AGE_MS || issuedAt > now + 60_000) {
    return false;
  }
  const expected = crypto.createHmac('sha256', getSecret()).update(`admin.${ts}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
