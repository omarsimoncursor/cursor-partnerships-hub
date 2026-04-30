'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  domain: string;
  account: string;
  accent: string;
  size?: number;
  className?: string;
  // When true, render the logo on a white card (better for dark themes that
  // need the brand to "pop"). Default true.
  whiteBackdrop?: boolean;
};

type LogoResult =
  | { url: string; format: 'svg'; source: 'inline'; svg: string }
  | { url: string; format: string; source: 'remote'; svg?: undefined };

const cache = new Map<string, LogoResult | null>();
const inflight = new Map<string, Promise<LogoResult | null>>();

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
  // Remove XML declarations / DOCTYPE which can break inline insertion.
  svg = svg.replace(/<\?xml[^?]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '').trim();
  // Drop <script> elements as a safety hardening (we are inserting raw SVG
  // that came from the prospect's own domain, which we trust about as much
  // as we trust their own homepage; still, nuke active content).
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove on* event handlers.
  svg = svg.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  svg = svg.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
  // Strip width/height on the root svg so CSS sizing wins.
  svg = svg.replace(/<svg([^>]*?)\s+width=("[^"]*"|'[^']*')/i, '<svg$1');
  svg = svg.replace(/<svg([^>]*?)\s+height=("[^"]*"|'[^']*')/i, '<svg$1');
  return svg;
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
    fetchLogo(cleanedDomain).then(result => {
      if (requestedRef.current !== cleanedDomain) return; // stale response
      setLogo(result);
    });
  }, [cleanedDomain]);

  const showRemoteImg = logo && logo !== 'pending' && logo.source === 'remote' && !imgErrored;
  const showInlineSvg = logo && logo !== 'pending' && logo.source === 'inline' && !!logo.svg;
  const showFallback = !showRemoteImg && !showInlineSvg;

  const backdrop = showFallback || !whiteBackdrop ? `${accent}25` : '#ffffffee';

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden ${className || ''}`}
      style={{
        width: size,
        height: size,
        background: backdrop,
        color: accent,
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
          referrerPolicy="no-referrer"
          onError={() => setImgErrored(true)}
          className="absolute inset-0 w-full h-full object-contain p-[6%]"
        />
      )}
    </span>
  );
}
