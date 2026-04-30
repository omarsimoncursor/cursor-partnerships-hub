import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cache for 24h on Vercel's edge so repeat lookups are instant.
export const revalidate = 86_400;

type LogoResult = {
  // Public URL the browser can load directly.
  url: string;
  // 'svg' | 'png' | 'jpeg' | 'gif' | 'ico'
  format: string;
  // 'inline' = svg inline string returned in `svg` field (for clean re-coloring),
  // 'remote' = url is fetched separately by the browser.
  source: 'inline' | 'remote';
  // Inline SVG markup when available, so the client can render it directly
  // (avoids hotlink restrictions and CORS issues).
  svg?: string;
};

function normalizeDomain(input: string | null): string | null {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleaned)) return null;
  return cleaned;
}

const FETCH_TIMEOUT_MS = 4000;
const MAX_BYTES = 512 * 1024; // 512KB cap per asset

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; CursorPartnershipsHub/1.0; +https://cursor.com)',
        accept: 'image/svg+xml,image/png,image/*;q=0.9,*/*;q=0.5',
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
  // Many CDNs serve SVG as text/plain or octet-stream. Sniff the head.
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

// Try a list of well-known SVG/PNG asset paths on the domain itself.
async function tryDirectAssets(domain: string): Promise<LogoResult | null> {
  const origin = `https://${domain}`;
  const candidates = [
    '/favicon.svg',
    '/logo.svg',
    '/assets/logo.svg',
    '/static/logo.svg',
    '/images/logo.svg',
    '/img/logo.svg',
    '/icon.svg',
    '/apple-touch-icon.png',
  ];
  for (const path of candidates) {
    const url = origin + path;
    const got = await fetchBytes(url);
    if (!got) continue;
    if (bytesLookLikeSvg(got.bytes, got.contentType)) {
      return { url, format: 'svg', source: 'inline', svg: bytesToText(got.bytes) };
    }
    if (got.contentType.includes('png')) {
      return { url, format: 'png', source: 'remote' };
    }
  }
  return null;
}

// Parse the homepage <head> for <link rel="icon" ...> and <meta property="og:image">,
// preferring SVG mime types.
async function tryHomepageHead(domain: string): Promise<LogoResult | null> {
  const origin = `https://${domain}`;
  const homepage = await safeFetch(origin);
  if (!homepage || !homepage.ok) return null;
  const html = await homepage.text();
  const $ = cheerio.load(html);

  type Link = { href: string; type?: string; rel?: string; sizesScore: number };
  const links: Link[] = [];

  $('link[rel*="icon"], link[rel="mask-icon"]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const type = ($(el).attr('type') || '').toLowerCase();
    const rel = ($(el).attr('rel') || '').toLowerCase();
    const sizes = $(el).attr('sizes') || '';
    const sizesScore = (() => {
      const m = sizes.match(/(\d+)/g);
      if (!m) return 0;
      return Math.max(...m.map(s => Number(s)));
    })();
    links.push({ href: absolutize(href, origin), type, rel, sizesScore });
  });

  $('meta[property="og:image"], meta[name="twitter:image"]').each((_i, el) => {
    const content = $(el).attr('content');
    if (!content) return;
    links.push({ href: absolutize(content, origin), type: '', rel: 'og', sizesScore: 0 });
  });

  // Sort: prefer svg type, then mask-icon, then largest png.
  links.sort((a, b) => {
    const aType = a.type || '';
    const bType = b.type || '';
    const aSvg = aType.includes('svg') || a.href.endsWith('.svg') || a.rel === 'mask-icon';
    const bSvg = bType.includes('svg') || b.href.endsWith('.svg') || b.rel === 'mask-icon';
    if (aSvg !== bSvg) return aSvg ? -1 : 1;
    return b.sizesScore - a.sizesScore;
  });

  for (const link of links) {
    const got = await fetchBytes(link.href);
    if (!got) continue;
    const ct = got.contentType || '';
    if (bytesLookLikeSvg(got.bytes, ct)) {
      return { url: link.href, format: 'svg', source: 'inline', svg: bytesToText(got.bytes) };
    }
    if (ct.includes('png')) {
      return { url: link.href, format: 'png', source: 'remote' };
    }
    if (ct.includes('jpeg') || ct.includes('jpg')) {
      return { url: link.href, format: 'jpeg', source: 'remote' };
    }
  }
  return null;
}

// Last-resort: Clearbit Logo API. Returns a PNG.
function clearbitFallback(domain: string): LogoResult {
  return {
    url: `https://logo.clearbit.com/${encodeURIComponent(domain)}`,
    format: 'png',
    source: 'remote',
  };
}

export async function GET(req: NextRequest) {
  const domain = normalizeDomain(req.nextUrl.searchParams.get('domain'));
  if (!domain) {
    return NextResponse.json({ error: 'invalid domain' }, { status: 400 });
  }

  // Try in order: direct asset paths, homepage <head>, Clearbit.
  const direct = await tryDirectAssets(domain);
  if (direct) {
    return NextResponse.json({ domain, ...direct });
  }

  const fromHead = await tryHomepageHead(domain);
  if (fromHead) {
    return NextResponse.json({ domain, ...fromHead });
  }

  return NextResponse.json({ domain, ...clearbitFallback(domain) });
}
