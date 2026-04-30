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
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] rounded-full blur-[120px] opacity-60"
          style={{
            background: `radial-gradient(closest-side, ${accent}3a 0%, ${accent}14 40%, transparent 75%)`,
            animation: `aurora-${id} 18s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute top-1/4 -left-32 w-[60vw] h-[60vh] rounded-full blur-[120px] opacity-40"
          style={{
            background: `radial-gradient(closest-side, ${accent}28 0%, transparent 70%)`,
            animation: `aurora-${id}-b 24s ease-in-out infinite`,
          }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[55vw] h-[55vh] rounded-full blur-[120px] opacity-40"
          style={{
            background: `radial-gradient(closest-side, ${accent}22 0%, transparent 70%)`,
            animation: `aurora-${id}-c 26s ease-in-out infinite`,
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
