'use client';

import { useEffect, useState } from 'react';
import { clearbitLogoUrl } from '@/lib/prospect/config';

type Props = {
  domain: string;
  account: string;
  accent: string;
  size?: number;
  className?: string;
};

// Renders the account's logo with a brand-letter fallback. The
// fallback is rendered first; the Clearbit image only swaps in once
// it has successfully loaded. If Clearbit doesn't have a logo for
// this domain (or the request errors / blocks), we never see a
// broken-image icon.
export function AccountLogo({ domain, account, accent, size = 48, className }: Props) {
  const [imgState, setImgState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    setImgState('loading');
  }, [domain]);

  const showImg = !!domain && imgState === 'ok';

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden ${className || ''}`}
      style={{
        width: size,
        height: size,
        background: showImg ? '#ffffffee' : `${accent}25`,
        color: accent,
      }}
    >
      {!showImg && (
        <span
          className="font-bold"
          style={{ fontSize: Math.round(size * 0.4) }}
        >
          {(account.charAt(0) || 'A').toUpperCase()}
        </span>
      )}
      {domain && imgState !== 'error' && (
        <img
          src={clearbitLogoUrl(domain)}
          alt={`${account} logo`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImgState('ok')}
          onError={() => setImgState('error')}
          className="absolute inset-0 w-full h-full object-contain p-1.5 transition-opacity"
          style={{ opacity: showImg ? 1 : 0 }}
        />
      )}
    </span>
  );
}
