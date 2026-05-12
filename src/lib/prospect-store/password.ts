import crypto from 'crypto';

// We generate a short, human-friendly password (first name + 4-digit
// number) so the rep can speak it on a call without spelling out a
// hash. The password is stored in plain text in the DB because:
//   1) the demo content behind it is sales material, not customer
//      data, so the threat model is "drive-by URL discovery", not
//      "compromise of our DB".
//   2) the rep needs to surface the password in the LinkedIn / Gmail
//      drafts ChatGTM auto-creates.
// If the threat model ever expands, swap this for a bcrypt hash and
// store the cleartext only on the response from the create endpoint.

const FIRST_NAME_FALLBACK = 'Demo';

export function generatePassword(name: string): string {
  const first = (deriveFirstName(name) || FIRST_NAME_FALLBACK).slice(0, 32);
  const digits = String(crypto.randomInt(0, 10_000)).padStart(4, '0');
  return `${first}${digits}`;
}

export function deriveFirstName(fullName: string): string {
  if (!fullName) return '';
  const cleaned = fullName.trim().split(/\s+/)[0] || '';
  // Title-case the first letter so "jane" -> "Jane" — the password is
  // typed by the prospect and we want it visually friendly.
  if (!cleaned) return '';
  // Strip non-letters; the password is meant to be typed.
  const stripped = cleaned.replace(/[^A-Za-z\u00C0-\u017F]/g, '');
  if (!stripped) return '';
  return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
}

// Constant-time-ish password check. Inputs are short and the
// timing-attack risk is negligible, but using a constant-time compare
// is the right default.
export function passwordsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  try {
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}
