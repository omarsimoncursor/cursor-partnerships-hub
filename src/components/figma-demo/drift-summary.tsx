'use client';

import { Layers, ExternalLink, RotateCcw } from 'lucide-react';

interface DriftSummaryProps {
  onReset: () => void;
  onViewFigma?: () => void;
}

const VIOLATIONS = [
  { token: 'radius/md',           expected: '16px',     shipped: '12px' },
  { token: 'space/6',             expected: '24px',     shipped: '20px' },
  { token: 'font.title',          expected: '600 / 18', shipped: '700 / 17' },
  { token: 'color/brand/accent',  expected: '#A259FF',  shipped: '#9A4FFF' },
];

export function DriftSummary({ onReset, onViewFigma }: DriftSummaryProps) {
  return (
    <div
      className="w-full h-full rounded-xl bg-dark-surface overflow-hidden flex flex-col"
      style={{ border: '1px solid rgba(162,89,255,0.22)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b shrink-0"
        style={{
          borderColor: 'rgba(162,89,255,0.22)',
          background: 'rgba(162,89,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center border"
            style={{
              background: 'rgba(162,89,255,0.10)',
              borderColor: 'rgba(162,89,255,0.30)',
            }}
          >
            <Layers className="w-3.5 h-3.5" style={{ color: '#A259FF' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none mb-0.5" style={{ color: '#D6BBFF' }}>
              Design drift captured
            </p>
            <p className="text-[11px] text-text-tertiary font-mono truncate">
              figma · file_key zk2N…M9pq · v2.3
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Component */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Component
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-text-secondary break-words">
            Marketing/Shop/ProductCard@2.3
          </div>
        </div>

        {/* Violations list */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Violations · 4
          </p>
          <div className="rounded-md bg-dark-bg overflow-hidden">
            {VIOLATIONS.map((v, i) => (
              <div
                key={v.token}
                className={`px-2.5 py-2 flex items-center gap-2 text-[11.5px] font-mono ${
                  i < VIOLATIONS.length - 1 ? 'border-b border-dark-border' : ''
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full text-[9.5px] font-bold flex items-center justify-center shrink-0"
                  style={{ background: '#F5A623', color: '#1a0d00' }}
                >
                  {i + 1}
                </span>
                <span className="text-text-primary truncate flex-1">{v.token}</span>
                <span className="text-text-tertiary shrink-0">{v.expected}</span>
                <span className="text-[#F5A623] shrink-0">→ {v.shipped}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-md bg-dark-bg">
            <p className="text-[10px] text-text-tertiary uppercase mb-0.5">Pixel diff</p>
            <p className="text-sm font-bold text-[#F5A623]">4</p>
          </div>
          <div className="p-2.5 rounded-md bg-dark-bg">
            <p className="text-[10px] text-text-tertiary uppercase mb-0.5">Mean ΔE</p>
            <p className="text-sm font-bold text-[#F5A623]">5.4</p>
          </div>
          <div className="p-2.5 rounded-md bg-dark-bg">
            <p className="text-[10px] text-text-tertiary uppercase mb-0.5">WCAG</p>
            <p className="text-sm font-bold text-text-primary">4.17:1</p>
          </div>
        </div>

        {/* Linked surfaces */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Linked
          </p>
          <div className="space-y-1.5 text-[11.5px] font-mono">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#A259FF' }} />
              <span>figma · </span>
              <span className="text-text-primary truncate">design-system/tokens@v2.3</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4C9AFF]" />
              <span>jira · </span>
              <span className="text-text-primary truncate">CUR-4409</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewFigma}
          className="w-full py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer text-white"
          style={{ background: 'linear-gradient(135deg, #A259FF 0%, #6C3CE0 100%)' }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Figma
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-3 rounded-lg border border-dark-border text-text-secondary
                     font-medium text-sm hover:bg-dark-surface-hover hover:text-text-primary
                     transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset demo
        </button>
      </div>
    </div>
  );
}
