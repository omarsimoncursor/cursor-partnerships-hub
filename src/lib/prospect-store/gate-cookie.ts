import crypto from 'crypto';

// HMAC-signed unlock cookie used by the password gate. The cookie
// is `<slug>.<timestamp>.<sig>` where:
//   - sig = HMAC-SHA256(slug + '.' + timestamp, secret)
//   - timestamp is millis since epoch; cookies older than MAX_AGE_MS
//     are rejected even when the signature is valid (defense in
//     depth in case the cookie is exfiltrated).
//
// We use a per-slug cookie name (`pdemo_<slug>`) so that different
// prospects unlocked in the same browser don't shadow each other.

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const COOKIE_PREFIX = 'pdemo_';

function getSecret(): string {
  // Use a stable fallback for local dev so reps don't have to set the
  // env var to test locally. Production must override this.
  return process.env.DEMO_GATE_SECRET || 'cursor-prospect-demo-dev-secret-do-not-use-in-prod';
}

export function gateCookieName(slug: string): string {
  return `${COOKIE_PREFIX}${slug.replace(/[^A-Za-z0-9]/g, '')}`;
}

export function signGateCookie(slug: string): string {
  const ts = Date.now().toString(36);
  const payload = `${slug}.${ts}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyGateCookie(slug: string, cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 3) return false;
  const [cookieSlug, ts, sig] = parts;
  if (cookieSlug !== slug) return false;
  const now = Date.now();
  let issuedAt: number;
  try {
    issuedAt = parseInt(ts, 36);
  } catch {
    return false;
  }
  if (!Number.isFinite(issuedAt) || now - issuedAt > MAX_AGE_MS || issuedAt > now + 60_000) {
    return false;
  }
  const expected = crypto.createHmac('sha256', getSecret()).update(`${cookieSlug}.${ts}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function gateCookieMaxAgeSeconds(): number {
  return Math.floor(MAX_AGE_MS / 1000);
}
