'use client';

// A subtle, animated aurora that pulses the prospect's brand color
// across the page. Pure CSS so it's free at runtime.

import { useId } from 'react';

type Props = {
  accent: string;
};

export function AuroraBackdrop({ accent }: Props) {
  const id = useId().replace(/:/g, '');

  return (
    <>
      {/* Aurora is intentionally subtle: it only colors the very top
          of the page so body content below stays high-contrast. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 -z-20 pointer-events-none overflow-hidden"
        style={{ height: '70vh' }}
      >
        <div
          className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] rounded-full blur-[140px] opacity-50"
          style={{
            background: `radial-gradient(closest-side, ${accent}33 0%, ${accent}10 40%, transparent 75%)`,
            animation: `aurora-${id} 22s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute -top-[20%] -left-24 w-[55vw] h-[55vh] rounded-full blur-[140px] opacity-25"
          style={{
            background: `radial-gradient(closest-side, ${accent}1f 0%, transparent 70%)`,
            animation: `aurora-${id}-b 28s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute -top-[20%] -right-24 w-[55vw] h-[55vh] rounded-full blur-[140px] opacity-25"
          style={{
            background: `radial-gradient(closest-side, ${accent}1f 0%, transparent 70%)`,
            animation: `aurora-${id}-c 30s ease-in-out infinite`,
          }}
        />
      </div>
      <style jsx global>{`
        @keyframes aurora-${id} {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.55; }
          50% { transform: translate(-50%, 4%) scale(1.06); opacity: 0.7; }
        }
        @keyframes aurora-${id}-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -4%) scale(1.08); }
        }
        @keyframes aurora-${id}-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-8%, 4%) scale(1.06); }
        }
      `}</style>
    </>
  );
}
