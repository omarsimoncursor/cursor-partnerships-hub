'use client';

import { useEffect, useRef } from 'react';
import { AlertOctagon, ArrowRight, RotateCcw } from 'lucide-react';

interface FullErrorPageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
}

export function FullErrorPage({ error, onGo, onReset }: FullErrorPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      {/* Top red bar */}
      <div className="h-1 w-full bg-accent-red" />

      {/* Main error area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-dark-bg">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-red/10 border border-accent-red/20 mb-6">
            <AlertOctagon className="w-8 h-8 text-accent-red" />
          </div>

          {/* Error code */}
          <p className="text-xs font-mono text-accent-red uppercase tracking-[0.2em] mb-3">
            500 · Server Error · event_id a2f1…4c0e
          </p>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            Something went wrong processing your order.
          </h1>

          <p className="text-base text-text-secondary mb-8 max-w-lg mx-auto">
            An unexpected error occurred. Our team has been notified and is
            investigating. Please try again in a few minutes.
          </p>

          {/* Error detail card */}
          <div className="mx-auto max-w-lg rounded-lg border border-dark-border bg-dark-surface p-4 mb-12 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                Exception
              </span>
            </div>
            <p className="font-mono text-sm text-accent-red break-words">
              TypeError: {error.message}
            </p>
            <p className="font-mono text-[11px] text-text-tertiary mt-1">
              at formatPaymentReceipt · src/lib/demo/format-payment.ts:4
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* CTA */}
          <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
            Watch a Cursor agent automatically detect, triage, and fix this
            error in seconds.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-accent-blue text-dark-bg font-semibold text-base
                         hover:bg-accent-blue/90 transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(96,165,250,0.25)] hover:shadow-[0_0_48px_rgba(96,165,250,0.4)]
                         cursor-pointer"
            >
              Go
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onReset}
              className="px-5 py-3 rounded-full border border-dark-border text-text-secondary font-medium text-sm
                         hover:bg-dark-surface-hover hover:text-text-primary transition-colors cursor-pointer
                         flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
