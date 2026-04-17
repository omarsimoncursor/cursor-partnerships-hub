'use client';

import type { ReactNode } from 'react';

interface ActTransitionProps {
  actKey: string;
  children: ReactNode;
}

/**
 * Each time `actKey` changes, the child subtree remounts (via React's key prop)
 * and runs the `journey-act-enter` animation: fades in from 16px below.
 * The outgoing subtree is simply unmounted — the spine/HUD provide continuity.
 */
export function ActTransition({ actKey, children }: ActTransitionProps) {
  return (
    <div key={actKey} className="journey-act-enter" aria-live="polite">
      {children}
      <style jsx>{`
        .journey-act-enter {
          animation: journeyActEnter 500ms ease-out both;
        }
        @keyframes journeyActEnter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
