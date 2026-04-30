import { VENDOR_BY_ID, VENDORS } from './vendors';

// Shape of an account-branded demo configuration. Encoded into the
// URL so links are completely stateless and shareable without a
// backend.
export type ProspectConfig = {
  // Account display name (e.g., "Cigna"). Falls back to a title-cased
  // form of the domain when missing.
  account: string;
  // Domain entered by the rep (e.g., "cigna.com"). Used for the slug
  // and to derive a logo URL.
  domain: string;
  // Hex accent color used to brand the page. Optional. If missing,
  // the page falls back to a neutral accent.
  accent?: string;
  // Selected vendor ids in the order the rep wants them shown.
  vendors: string[];
  // Optional rep-supplied tagline shown under the hero.
  tagline?: string;
  // Optional sales rep name shown as the demo author.
  rep?: string;
};

const DEFAULT_VENDORS = ['figma', 'datadog', 'snyk', 'snowflake', 'aws'];

export const DEFAULT_CONFIG: ProspectConfig = {
  account: 'Acme',
  domain: 'acme.com',
  accent: '#60a5fa',
  vendors: DEFAULT_VENDORS,
  tagline: '',
  rep: '',
};

const KNOWN_VENDOR_IDS = new Set(VENDORS.map(v => v.id));

function sanitizeAccent(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(trimmed)) return undefined;
  return trimmed;
}

function sanitizeText(input: string | undefined, max = 80): string {
  if (!input) return '';
  return input.trim().slice(0, max);
}

export function deriveAccountName(domain: string): string {
  const stem = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  const root = stem.split('.').slice(-2, -1)[0] || stem;
  if (!root) return 'Account';
  return root.charAt(0).toUpperCase() + root.slice(1);
}

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function clearbitLogoUrl(domain: string): string {
  const clean = normalizeDomain(domain);
  return `https://logo.clearbit.com/${encodeURIComponent(clean)}`;
}

export function encodeConfig(config: ProspectConfig): string {
  const safe: ProspectConfig = {
    account: sanitizeText(config.account, 60) || deriveAccountName(config.domain),
    domain: normalizeDomain(config.domain),
    accent: sanitizeAccent(config.accent),
    vendors: (config.vendors || []).filter(v => KNOWN_VENDOR_IDS.has(v)),
    tagline: sanitizeText(config.tagline, 160),
    rep: sanitizeText(config.rep, 60),
  };
  const json = JSON.stringify(safe);
  if (typeof window === 'undefined') {
    return Buffer.from(json, 'utf8').toString('base64url');
  }
  return base64urlEncode(json);
}

export function decodeConfig(input: string | null | undefined): ProspectConfig {
  if (!input) return DEFAULT_CONFIG;
  try {
    const json = typeof window === 'undefined'
      ? Buffer.from(input, 'base64url').toString('utf8')
      : base64urlDecode(input);
    const parsed = JSON.parse(json);
    return {
      account: sanitizeText(parsed.account, 60) || deriveAccountName(parsed.domain || ''),
      domain: normalizeDomain(parsed.domain || ''),
      accent: sanitizeAccent(parsed.accent),
      vendors: Array.isArray(parsed.vendors)
        ? parsed.vendors.filter((v: unknown): v is string => typeof v === 'string' && KNOWN_VENDOR_IDS.has(v))
        : DEFAULT_VENDORS,
      tagline: sanitizeText(parsed.tagline, 160),
      rep: sanitizeText(parsed.rep, 60),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// base64url <-> string helpers for the browser. Avoids pulling in
// `Buffer` polyfills while keeping the encoding URL-safe.
function base64urlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function resolvedAccent(config: ProspectConfig): string {
  return config.accent || '#60a5fa';
}

export function getVendorsFor(config: ProspectConfig) {
  return config.vendors
    .map(id => VENDOR_BY_ID[id])
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
}

export function buildShareUrl(config: ProspectConfig, origin: string): string {
  const slug = encodeURIComponent(normalizeDomain(config.domain) || 'demo');
  const c = encodeConfig(config);
  return `${origin.replace(/\/$/, '')}/prospect/${slug}?c=${c}`;
}
