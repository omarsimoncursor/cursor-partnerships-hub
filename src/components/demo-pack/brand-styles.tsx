'use client';

import { useMemo } from 'react';

type Props = {
  primaryHex?: string;
  children: React.ReactNode;
};

/**
 * Applies CSS variables for prospect-specific accent (--prospect-accent) used by child panels.
 */
export function ProspectBrandStyles({ primaryHex, children }: Props) {
  const style = useMemo(() => {
    const accent = primaryHex && /^#[0-9A-Fa-f]{6}$/.test(primaryHex) ? primaryHex : '#60a5fa';
    return {
      '--prospect-accent': accent,
      '--prospect-accent-soft': `${accent}33`,
      '--prospect-accent-strong': `${accent}cc`,
    } as React.CSSProperties;
  }, [primaryHex]);

  return <div style={style}>{children}</div>;
}
