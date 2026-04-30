'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  domain: string;
  account: string;
  accent: string;
  size?: number;
  className?: string;
  // When true, render the logo on a card backdrop. The component
  // tries to color-match the backdrop to the logo's own background
  // (so square brand tiles like Cigna's blue square sit flush with
  // their badge); falls back to white if matching isn't safe.
  // Default true.
  whiteBackdrop?: boolean;
};

type LogoResult =
  | { url: string; format: 'svg'; source: 'inline'; svg: string }
  | { url: string; format: string; source: 'remote'; svg?: undefined };

const cache = new Map<string, LogoResult | null>();
const inflight = new Map<string, Promise<LogoResult | null>>();
// Per-URL cache of the sampled background color so we don't re-paint
// the canvas on every mount (the AccountLogo is rendered many times
// across a page).
const sampledColorCache = new Map<string, string | null>();

function fetchLogo(domain: string): Promise<LogoResult | null> {
  if (cache.has(domain)) return Promise.resolve(cache.get(domain) || null);
  const existing = inflight.get(domain);
  if (existing) return existing;
  const p = fetch(`/api/logo?domain=${encodeURIComponent(domain)}`)
    .then(r => (r.ok ? r.json() : null))
    .then((j: LogoResult | null) => {
      cache.set(domain, j);
      inflight.delete(domain);
      return j;
    })
    .catch(() => {
      cache.set(domain, null);
      inflight.delete(domain);
      return null;
    });
  inflight.set(domain, p);
  return p;
}

// Strip width/height attributes off the inline SVG so it scales to its
// container, and ensure it has a viewBox.
function sanitizeSvgForEmbed(raw: string): string {
  let svg = raw;
  svg = svg.replace(/<\?xml[^?]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '').trim();
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
  svg = svg.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  svg = svg.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
  svg = svg.replace(/<svg([^>]*?)\s+width=("[^"]*"|'[^']*')/i, '<svg$1');
  svg = svg.replace(/<svg([^>]*?)\s+height=("[^"]*"|'[^']*')/i, '<svg$1');
  return svg;
}

// Sample the dominant background color from a logo image by reading
// the four corners (most logos use a flat background tile). Returns
// `null` when the corners disagree (no clear background) or when the
// canvas read fails (CORS, transparent corners, etc.) — in those
// cases the caller should fall through to white / accent.
async function sampleLogoBackground(url: string): Promise<string | null> {
  if (sampledColorCache.has(url)) return sampledColorCache.get(url)!;

  const result = await new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    let settled = false;
    const settle = (v: string | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };

    // Hard timeout — never block the badge for more than a second.
    const timer = setTimeout(() => settle(null), 1500);

    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          clearTimeout(timer);
          return settle(null);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          clearTimeout(timer);
          return settle(null);
        }
        ctx.drawImage(img, 0, 0);

        // Sample 9 small patches around the perimeter (corners + edge midpoints +
        // a centroid); average each, then return the dominant color if
        // the perimeter samples mostly agree.
        const inset = Math.max(2, Math.round(Math.min(w, h) * 0.04));
        const patchSize = Math.max(2, Math.round(Math.min(w, h) * 0.05));
        const points: Array<[number, number]> = [
          [inset, inset],
          [w - inset - patchSize, inset],
          [inset, h - inset - patchSize],
          [w - inset - patchSize, h - inset - patchSize],
          [Math.round(w / 2 - patchSize / 2), inset],
          [inset, Math.round(h / 2 - patchSize / 2)],
          [w - inset - patchSize, Math.round(h / 2 - patchSize / 2)],
          [Math.round(w / 2 - patchSize / 2), h - inset - patchSize],
        ];

        const samples: Array<[number, number, number, number]> = [];
        for (const [x, y] of points) {
          try {
            const data = ctx.getImageData(x, y, patchSize, patchSize).data;
            let r = 0, g = 0, b = 0, a = 0, n = 0;
            for (let i = 0; i < data.length; i += 4) {
              const ai = data[i + 3];
              // Skip transparent pixels — they're not background, they're empty.
              if (ai < 200) continue;
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              a += ai;
              n += 1;
            }
            if (n < (patchSize * patchSize) / 4) continue; // too transparent
            samples.push([Math.round(r / n), Math.round(g / n), Math.round(b / n), Math.round(a / n)]);
          } catch {
            // tainted canvas, etc.
          }
        }

        clearTimeout(timer);
        if (samples.length < 4) return settle(null);

        // If the samples don't cluster around one color (saturation / lightness
        // varies a lot), the corners are part of the mark itself rather than a
        // background tile. Bail.
        const avg: [number, number, number] = [0, 0, 0];
        for (const [r, g, b] of samples) {
          avg[0] += r; avg[1] += g; avg[2] += b;
        }
        avg[0] = Math.round(avg[0] / samples.length);
        avg[1] = Math.round(avg[1] / samples.length);
        avg[2] = Math.round(avg[2] / samples.length);

        let agreeing = 0;
        for (const [r, g, b] of samples) {
          const d = Math.abs(r - avg[0]) + Math.abs(g - avg[1]) + Math.abs(b - avg[2]);
          if (d < 28) agreeing += 1;
        }
        // Need at least 6 of 8 samples to agree on the same color before we
        // call it a background tile.
        if (agreeing < 6) return settle(null);

        const hex = '#' + avg.map(v => v.toString(16).padStart(2, '0')).join('');
        return settle(hex);
      } catch {
        clearTimeout(timer);
        return settle(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      settle(null);
    };
    img.src = url;
  });

  sampledColorCache.set(url, result);
  return result;
}

export function AccountLogo({
  domain,
  account,
  accent,
  size = 48,
  className,
  whiteBackdrop = true,
}: Props) {
  const [logo, setLogo] = useState<LogoResult | null | 'pending'>('pending');
  const [imgErrored, setImgErrored] = useState(false);
  const [sampledBg, setSampledBg] = useState<string | null>(null);
  const cleanedDomain = domain?.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] || '';
  const requestedRef = useRef('');

  useEffect(() => {
    if (!cleanedDomain) {
      setLogo(null);
      return;
    }
    requestedRef.current = cleanedDomain;
    setLogo('pending');
    setImgErrored(false);
    setSampledBg(null);
    fetchLogo(cleanedDomain).then(result => {
      if (requestedRef.current !== cleanedDomain) return;
      setLogo(result);
    });
  }, [cleanedDomain]);

  // Once we know the remote URL, sample its background color.
  useEffect(() => {
    if (!logo || logo === 'pending' || logo.source !== 'remote') return;
    let cancelled = false;
    sampleLogoBackground(logo.url).then(c => {
      if (!cancelled) setSampledBg(c);
    });
    return () => {
      cancelled = true;
    };
  }, [logo]);

  const showRemoteImg = logo && logo !== 'pending' && logo.source === 'remote' && !imgErrored;
  const showInlineSvg = logo && logo !== 'pending' && logo.source === 'inline' && !!logo.svg;
  const showFallback = !showRemoteImg && !showInlineSvg;

  // Pick the badge backdrop:
  //  - Fallback (no logo): tinted accent so the letter mark reads.
  //  - Remote img with a clean sampled background: match it (kills the white halo).
  //  - Anything else with whiteBackdrop=true: white card.
  //  - whiteBackdrop=false: tinted accent.
  let backdrop: string;
  if (showFallback || !whiteBackdrop) {
    backdrop = `${accent}25`;
  } else if (showRemoteImg && sampledBg) {
    backdrop = sampledBg;
  } else {
    backdrop = '#ffffffee';
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden ${className || ''}`}
      style={{
        width: size,
        height: size,
        background: backdrop,
        color: accent,
        // Smooth the swap from white -> matched color so the badge
        // doesn't pop visibly on first paint.
        transition: 'background-color 200ms ease-out',
      }}
    >
      {showFallback && (
        <span
          className="font-bold select-none"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          {(account.charAt(0) || 'A').toUpperCase()}
        </span>
      )}
      {showInlineSvg && (
        <span
          aria-label={`${account} logo`}
          role="img"
          className="block w-full h-full p-[10%] [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
          dangerouslySetInnerHTML={{ __html: sanitizeSvgForEmbed(logo.svg!) }}
        />
      )}
      {showRemoteImg && (
        <img
          src={logo.url}
          alt={`${account} logo`}
          loading="eager"
          decoding="async"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setImgErrored(true)}
          className="absolute inset-0 w-full h-full object-contain p-[6%]"
        />
      )}
    </span>
  );
}
