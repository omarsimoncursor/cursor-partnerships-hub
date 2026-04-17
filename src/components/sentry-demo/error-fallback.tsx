'use client';

import { AlertTriangle, ExternalLink, RotateCcw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  onReset: () => void;
  onViewSentry?: () => void;
}

export type { ErrorFallbackProps };

export function ErrorFallback({ error, onReset, onViewSentry }: ErrorFallbackProps) {
  return (
    <div className="w-full h-full rounded-xl border border-accent-red/20 bg-dark-surface overflow-hidden flex flex-col">
      {/* Error header */}
      <div className="px-4 py-3 border-b border-accent-red/20 bg-accent-red/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-accent-red" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-accent-red leading-none mb-0.5">
              Exception captured
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">sentry · event_id a2f1…4c0e</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Error message */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Error
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-accent-red break-words">
            {error.message}
          </div>
        </div>

        {/* Stack trace preview */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Stack trace
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5 max-h-36 overflow-y-auto">
            {error.stack?.split('\n').slice(0, 6).map((line, i) => (
              <div key={i} className={i === 0 ? 'text-accent-red font-medium' : ''}>
                {line.trim()}
              </div>
            ))}
          </div>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-md bg-dark-bg">
            <p className="text-[10px] text-text-tertiary uppercase mb-0.5">Users</p>
            <p className="text-sm font-bold text-text-primary">312</p>
          </div>
          <div className="p-2.5 rounded-md bg-dark-bg">
            <p className="text-[10px] text-text-tertiary uppercase mb-0.5">Events</p>
            <p className="text-sm font-bold text-accent-red">1,847</p>
          </div>
          <div className="p-2.5 rounded-md bg-dark-bg">
            <p className="text-[10px] text-text-tertiary uppercase mb-0.5">Level</p>
            <p className="text-sm font-bold text-accent-amber">P1</p>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewSentry}
          className="w-full py-2 px-3 rounded-lg bg-[#362D59] text-white font-medium text-sm
                     hover:bg-[#362D59]/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Sentry
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
