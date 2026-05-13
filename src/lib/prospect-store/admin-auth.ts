import crypto from 'crypto';

// Admin-page session cookie used by /prospect-builder/admin. Signed
// HMAC-SHA256 + a timestamp for expiry. Distinct from the prospect
// demo unlock cookie (`pdemo_<slug>`) so the two auth surfaces never
// shadow each other.
//
// IMPORTANT: this module is server-only. The admin password itself
// lives in `process.env.ADMIN_PASSWORD` (defaulting to a fixed value
// for ergonomic single-operator setup). It MUST never be referenced
// from a client component, so this file's only export shape is
// "verify this cookie / sign this cookie / check this password" —
// the password value never leaves the server.

const COOKIE_NAME = 'pb_admin_session';
// 30 days. The admin needs durable sign-in; rotation happens via
// the explicit Sign-out button, env var change, or password rotation.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_ADMIN_PASSWORD = 'Oliver1994Cursor';

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.DEMO_GATE_SECRET ||
    'cursor-prospect-builder-admin-dev-secret-do-not-use-in-prod'
  );
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export const adminCookieName = (): string => COOKIE_NAME;

export const adminCookieMaxAgeSeconds = (): number => Math.floor(MAX_AGE_MS / 1000);

/** Constant-time password compare. */
export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
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
