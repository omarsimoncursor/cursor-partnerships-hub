'use client';

import { Globe, Search, FileSearch, Database, AlertTriangle } from 'lucide-react';

/**
 * Chapter 2 — Tracing the path.
 *
 * Four boxes in a horizontal row connected by a line. A red pulse travels
 * along the line, lighting each box as it passes. The last box fades to
 * "exposed" red. Plain English: "the bad input goes from the request all
 * the way to the database".
 */

const NODES = [
  { icon: Globe,      label: 'Request',  sub: 'username' },
  { icon: Search,     label: 'Lookup',   sub: 'function' },
  { icon: FileSearch, label: 'Selector', sub: 'pattern' },
  { icon: Database,   label: 'Database', sub: 'records' },
];

export function PathScene() {
  return (
    <div className="relative w-full h-full flex items-center px-12">
      <style jsx>{`
        @keyframes pathLineFill {
          0% { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseTravel {
          0% { offset-distance: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 1; }
        }
        @keyframes nodePop {
          0%, 50% { transform: scale(1); }
          60% { transform: scale(1.18); box-shadow: 0 0 0 8px rgba(225,29,72,0.18); }
          100% { transform: scale(1); }
        }
        @keyframes badgeArrive {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes labelFlash {
          0%, 100% { color: #C9C9E5; }
          50% { color: #FB7185; }
        }
      `}</style>

      {/* Connecting line behind the nodes */}
      <svg
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full pointer-events-none"
        height="40"
        viewBox="0 0 1000 40"
        preserveAspectRatio="none"
      >
        {/* Base line */}
        <line x1="80" x2="920" y1="20" y2="20" stroke="#23264F" strokeWidth="2" strokeDasharray="6 6" />
        {/* Animated red line that fills as the pulse travels */}
        <line
          x1="80"
          x2="920"
          y1="20"
          y2="20"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: 800,
            strokeDashoffset: 800,
            animation: 'pathLineFill 3200ms ease-out forwards',
          }}
        />
        <defs>
          <linearGradient id="pathGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pulse traveling along the line */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none"
        style={{ height: 0 }}
      >
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{
            background: '#FB7185',
            boxShadow: '0 0 20px 4px rgba(251,113,133,0.7)',
            offsetPath: 'path("M 80 0 L 920 0")',
            animation: 'pulseTravel 3200ms cubic-bezier(0.4, 0, 0.6, 1) forwards',
            opacity: 0,
            top: 0,
          }}
        />
      </div>

      {/* Nodes */}
      <div className="relative w-full flex items-center justify-between">
        {NODES.map((node, i) => {
          const Icon = node.icon;
          const popDelay = 200 + i * 800;
          const isLast = i === NODES.length - 1;
          return (
            <div key={node.label} className="relative flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center border-2"
                style={{
                  background: '#0A0B23',
                  borderColor: '#23264F',
                  animation: `nodePop 600ms ease-out ${popDelay}ms backwards`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: i === 0 ? '#FB7185' : '#9F98FF' }} />
              </div>
              <div className="text-center">
                <p
                  className="text-[12px] font-medium"
                  style={{
                    animation: `labelFlash 600ms ease-in-out ${popDelay}ms`,
                    color: '#C9C9E5',
                  }}
                >
                  {node.label}
                </p>
                <p className="text-[10px] font-mono" style={{ color: '#7C7CA0' }}>
                  {node.sub}
                </p>
              </div>

              {/* Source badge over the first node */}
              {i === 0 && (
                <span
                  className="absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider whitespace-nowrap"
                  style={{
                    background: 'rgba(225,29,72,0.15)',
                    border: '1px solid rgba(225,29,72,0.40)',
                    color: '#FB7185',
                    animation: 'badgeArrive 400ms ease-out 100ms backwards',
                  }}
                >
                  bad input
                </span>
              )}

              {/* Sink badge over the last node, arrives at the end */}
              {isLast && (
                <span
                  className="absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1"
                  style={{
                    background: 'rgba(225,29,72,0.15)',
                    border: '1px solid rgba(225,29,72,0.40)',
                    color: '#FB7185',
                    animation: 'badgeArrive 400ms ease-out 3000ms backwards',
                    opacity: 0,
                    animationFillMode: 'forwards',
                  }}
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  exposed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
