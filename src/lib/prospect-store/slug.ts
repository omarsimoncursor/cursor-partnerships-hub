import { customAlphabet } from 'nanoid';

// 10-char base62 slug: ~62^10 = 8e17 keyspace, no ambiguity-prone
// characters (we use the standard alphanumeric set since they all
// render fine in URL bars and on copy/paste). Collisions are
// vanishingly unlikely at our scale; the create path retries on the
// unique-constraint violation just in case.
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_LENGTH = 10;

const make = customAlphabet(ALPHABET, SLUG_LENGTH);

export function generateSlug(): string {
  return make();
}

const SLUG_RE = /^[0-9A-Za-z]{6,32}$/;

export function isValidSlug(input: string): boolean {
  return SLUG_RE.test(input);
}
