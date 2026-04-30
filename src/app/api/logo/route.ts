import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cache for 24h on Vercel's edge so repeat lookups are instant.
export const revalidate = 86_400;

type LogoResult = {
  // Public URL the browser can load directly.
  url: string;
  // 'svg' | 'png' | 'jpeg' | 'gif' | 'ico' | 'webp'
  format: string;
  // 'inline' = svg inline string returned in `svg` field (for clean re-coloring),
  // 'remote' = url is fetched separately by the browser.
  source: 'inline' | 'remote';
  // Inline SVG markup when available, so the client can render it directly
  // (avoids hotlink restrictions and CORS issues).
  svg?: string;
  // Where the result came from, useful for debugging in the browser.
  via: 'logodev' | 'homepage' | 'direct' | 'duckduckgo' | 'fallback';
};

function normalizeDomain(input: string | null): string | null {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleaned)) return null;
  return cleaned;
}

const FETCH_TIMEOUT_MS = 4500;
const MAX_BYTES = 1024 * 1024; // 1MB cap per asset

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // A real-looking UA — many enterprise sites deny non-browser UAs.
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        accept: 'image/svg+xml,image/png,image/webp,image/*;q=0.9,text/html;q=0.8,*/*;q=0.5',
        ...((init && init.headers) || {}),
      },
    });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

async function fetchBytes(url: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const res = await safeFetch(url);
  if (!res || !res.ok) return null;
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const reader = res.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > MAX_BYTES) {
        try { reader.cancel(); } catch { /* noop */ }
        return null;
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.byteLength; }
  return { bytes, contentType };
}

function bytesLookLikeSvg(bytes: Uint8Array, contentType: string): boolean {
  if (contentType.includes('svg')) return true;
  const head = new TextDecoder().decode(bytes.slice(0, 256)).trim().toLowerCase();
  return head.startsWith('<?xml') || head.startsWith('<svg');
}

function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes);
}

function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

// safari-pinned-tab.svg and similar mask icons are intentionally
// single-color silhouettes designed for monochrome rendering. They
// look terrible against a dark page, so we explicitly skip them.
const SILHOUETTE_HINTS = ['safari-pinned-tab', 'mask-icon', 'pinned-tab'];

function looksLikeSilhouetteUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return SILHOUETTE_HINTS.some(h => lower.includes(h));
}

// LOGO.DEV: high-quality public logo CDN that returns brand-faithful
// wordmarks/marks for ~99% of public domains. Token below is the
// public demo token from their docs (see logo.dev). For internal
// sales tooling that's plenty; if traffic grows, swap in a private
// token via env.
const LOGODEV_TOKEN = process.env.LOGODEV_TOKEN || 'pk_X-1ZO13GSgeOoUrIuJ6GMQ';

async function tryLogoDev(domain: string): Promise<LogoResult | null> {
  // Probe first so we don't return a 404 URL to the browser.
  const url = `https://img.logo.dev/${encodeURIComponent(domain)}?token=${LOGODEV_TOKEN}&format=png&retina=true&size=256`;
  const got = await fetchBytes(url);
  if (!got) return null;
  const ct = got.contentType || '';
  // Reject the "default" generic gray placeholder (very small + similar bytes).
  if (got.bytes.byteLength < 1500) return null;
  const format = ct.includes('svg') ? 'svg' : ct.includes('webp') ? 'webp' : 'png';
  return { url, format, source: 'remote', via: 'logodev' };
}

type Candidate = { href: string; type: string; rel: string; score: number };

function scoreCandidate(href: string, type: string, rel: string, sizesAttr: string | null): number {
  let score = 0;
  const lower = href.toLowerCase();
  const lowerRel = rel.toLowerCase();
  const lowerType = type.toLowerCase();

  if (looksLikeSilhouetteUrl(lower)) score -= 100;
  if (lowerRel === 'mask-icon') score -= 100;

  if (lower.endsWith('.svg') || lowerType.includes('svg')) score += 30;
  else if (lower.endsWith('.png') || lowerType.includes('png')) score += 20;
  else if (lower.endsWith('.webp') || lowerType.includes('webp')) score += 18;
  else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lowerType.includes('jpeg')) score += 15;
  else if (lower.endsWith('.ico') || lowerType.includes('icon')) score += 5;

  if (lowerRel.includes('apple-touch')) score += 22;

  if (/(^|[\/_-])logo([\/_.-]|$)/.test(lower)) score += 15;
  if (lower.includes('wordmark')) score += 18;
  if (lower.includes('brandmark')) score += 12;
  if (lower.includes('android-chrome') || lower.includes('icon-512') || lower.includes('icon-192')) score += 10;

  const sizes = sizesAttr || '';
  if (sizes && sizes.toLowerCase() !== 'any') {
    const m = sizes.match(/(\d+)/g);
    if (m) {
      const max = Math.max(...m.map(Number));
      if (max >= 512) score += 12;
      else if (max >= 256) score += 8;
      else if (max >= 180) score += 6;
      else if (max >= 96) score += 4;
      else if (max >= 64) score += 2;
    }
  }

  return score;
}

async function findCandidatesFromHomepage(domain: string): Promise<Candidate[]> {
  const origin = `https://${domain}`;
  const homepage = await safeFetch(origin);
  if (!homepage || !homepage.ok) return [];
  const html = await homepage.text();
  const $ = cheerio.load(html);
  const out: Candidate[] = [];

  $('link[rel*="icon"], link[rel="mask-icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const rel = ($(el).attr('rel') || '').toLowerCase();
    const type = ($(el).attr('type') || '').toLowerCase();
    const sizes = $(el).attr('sizes') || null;
    out.push({
      href: absolutize(href, origin),
      type,
      rel,
      score: scoreCandidate(href, type, rel, sizes),
    });
  });

  $('meta[property="og:logo"], meta[itemprop="logo"]').each((_i, el) => {
    const content = $(el).attr('content');
    if (!content) return;
    out.push({ href: absolutize(content, origin), type: '', rel: 'og-logo', score: 35 });
  });

  $('script[type="application/ld+json"]').each((_i, el) => {
    const raw = $(el).contents().text();
    try {
      const parsed = JSON.parse(raw);
      const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const obj = item as Record<string, unknown>;
        const logo = obj.logo;
        let logoUrl: string | null = null;
        if (typeof logo === 'string') logoUrl = logo;
        else if (logo && typeof logo === 'object') {
          const lo = logo as Record<string, unknown>;
          if (typeof lo.url === 'string') logoUrl = lo.url;
        }
        if (logoUrl) {
          out.push({ href: absolutize(logoUrl, origin), type: '', rel: 'jsonld-logo', score: 40 });
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });

  return out;
}

const DIRECT_ASSETS = [
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/favicon.svg',
  '/icon.svg',
  '/logo.svg',
  '/assets/logo.svg',
  '/static/logo.svg',
  '/images/logo.svg',
  '/img/logo.svg',
];

function findDirectAssetCandidates(domain: string): Candidate[] {
  const origin = `https://${domain}`;
  return DIRECT_ASSETS.map(p => ({
    href: origin + p,
    type: p.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
    rel: 'guessed',
    score: scoreCandidate(p, '', 'guessed', null) - 5,
  }));
}

async function tryCandidate(c: Candidate, via: 'homepage' | 'direct'): Promise<LogoResult | null> {
  const got = await fetchBytes(c.href);
  if (!got) return null;
  const ct = got.contentType || '';
  if (bytesLookLikeSvg(got.bytes, ct)) {
    if (looksLikeSilhouetteUrl(c.href)) return null;
    const svg = bytesToText(got.bytes);
    return { url: c.href, format: 'svg', source: 'inline', svg, via };
  }
  if (got.bytes.byteLength < 200) return null;
  if (ct.includes('png')) return { url: c.href, format: 'png', source: 'remote', via };
  if (ct.includes('webp')) return { url: c.href, format: 'webp', source: 'remote', via };
  if (ct.includes('jpeg') || ct.includes('jpg')) return { url: c.href, format: 'jpeg', source: 'remote', via };
  if (ct.includes('icon') || ct.includes('image/x-icon')) return { url: c.href, format: 'ico', source: 'remote', via };
  return null;
}

function duckDuckGoFallback(domain: string): LogoResult {
  return {
    url: `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
    format: 'ico',
    source: 'remote',
    via: 'duckduckgo',
  };
}

export async function GET(req: NextRequest) {
  const domain = normalizeDomain(req.nextUrl.searchParams.get('domain'));
  if (!domain) {
    return NextResponse.json({ error: 'invalid domain' }, { status: 400 });
  }

  // 1) logo.dev — highest quality wordmark for ~99% of public domains.
  const logoDev = await tryLogoDev(domain);
  if (logoDev) {
    return NextResponse.json({ domain, ...logoDev });
  }

  // 2) Scrape the homepage <head> + try a few well-known asset paths.
  const [headCandidates, directCandidates] = await Promise.all([
    findCandidatesFromHomepage(domain),
    Promise.resolve(findDirectAssetCandidates(domain)),
  ]);

  const seen = new Set<string>();
  const all = [
    ...headCandidates.map(c => ({ ...c, _via: 'homepage' as const })),
    ...directCandidates.map(c => ({ ...c, _via: 'direct' as const })),
  ]
    .filter(c => {
      if (seen.has(c.href)) return false;
      seen.add(c.href);
      return true;
    })
    .sort((a, b) => b.score - a.score);

  for (const c of all.slice(0, 8)) {
    const result = await tryCandidate(c, c._via);
    if (result) {
      return NextResponse.json({ domain, ...result });
    }
  }

  // 3) Final fallback: DuckDuckGo's icon endpoint (always returns
  // *something* for a public domain, even if low-res).
  return NextResponse.json({ domain, ...duckDuckGoFallback(domain) });
}
