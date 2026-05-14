'use client';

import type { ReactNode } from 'react';

interface FigmaActTransitionProps {
  actKey: string;
  children: ReactNode;
}

export function FigmaActTransition({ actKey, children }: FigmaActTransitionProps) {
  return (
    <div key={actKey} className="figma-act-enter" aria-live="polite">
      {children}
      <style jsx>{`
        .figma-act-enter {
          animation: figmaActEnter 500ms ease-out both;
        }
        @keyframes figmaActEnter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
