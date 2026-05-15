'use client';

import { Package, Check, ArrowRight } from 'lucide-react';

/**
 * Chapter 4 — Bumping the dependency.
 *
 * A package "box" with the library name. The bad version (5.13.7) sits in a
 * red pill, an arrow appears, the new version (5.13.20) types in a green
 * pill on the right. A "+ secure" badge lands at the end. Plain English:
 * the agent also fixed the underlying library, not just the call site.
 */

export function UpgradeScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-10">
      <style jsx>{`
        @keyframes packageRise {
          0% { opacity: 0; transform: translateY(12px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badPulse {
          0%, 70% { transform: scale(1); }
          85% { transform: scale(0.92); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes arrowSlide {
          0% { opacity: 0; transform: translateX(-8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes goodLand {
          0% { opacity: 0; transform: translateX(8px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes badgeStamp {
          0% { opacity: 0; transform: scale(0.4) rotate(-12deg); }
          70% { opacity: 1; transform: scale(1.12) rotate(-12deg); }
          100% { opacity: 1; transform: scale(1) rotate(-12deg); }
        }
      `}</style>

      <div
        className="relative w-full max-w-2xl rounded-2xl border p-8"
        style={{
          background: '#0A0B23',
          borderColor: '#23264F',
          animation: 'packageRise 500ms ease-out',
        }}
      >
        {/* Package label */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(76,68,203,0.15)', border: '1px solid rgba(76,68,203,0.30)' }}
          >
            <Package className="w-6 h-6" style={{ color: '#9F98FF' }} />
          </div>
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-wider mb-0.5" style={{ color: '#7C7CA0' }}>
              Vulnerable library
            </p>
            <p className="text-lg font-semibold font-mono text-text-primary">mongoose</p>
          </div>
        </div>

        {/* Version morph row */}
        <div className="flex items-center justify-center gap-6">
          {/* Bad version */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="px-5 py-3 rounded-lg border-2 font-mono text-base"
              style={{
                background: 'rgba(225,29,72,0.10)',
                borderColor: 'rgba(225,29,72,0.50)',
                color: '#FB7185',
                animation: 'badPulse 1500ms ease-in-out 1100ms forwards',
              }}
            >
              5.13.7
            </div>
            <p className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: '#FB7185' }}>
              vulnerable
            </p>
          </div>

          {/* Arrow */}
          <ArrowRight
            className="w-7 h-7"
            style={{
              color: '#9F98FF',
              animation: 'arrowSlide 400ms ease-out 800ms backwards',
            }}
          />

          {/* Good version */}
          <div className="flex flex-col items-center gap-2 relative">
            <div
              className="px-5 py-3 rounded-lg border-2 font-mono text-base"
              style={{
                background: 'rgba(74,222,128,0.10)',
                borderColor: 'rgba(74,222,128,0.50)',
                color: '#4ADE80',
                animation: 'goodLand 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 1400ms backwards',
              }}
            >
              5.13.20
            </div>
            <p className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: '#4ADE80' }}>
              patched
            </p>
            {/* Stamp */}
            <span
              className="absolute -top-3 -right-8 px-2 py-1 rounded inline-flex items-center gap-1 text-[10.5px] font-bold font-mono uppercase tracking-wider"
              style={{
                background: '#4ADE80',
                color: '#04200E',
                animation: 'badgeStamp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 2000ms backwards',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              <Check className="w-2.5 h-2.5" /> secure
            </span>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-[11.5px] mt-6" style={{ color: '#7C7CA0' }}>
          Snyk Open Source flagged this on the same code path. The agent fixed both at once.
        </p>
      </div>
    </div>
  );
}
