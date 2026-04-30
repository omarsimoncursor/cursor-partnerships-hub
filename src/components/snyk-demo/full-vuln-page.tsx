'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, ShieldAlert } from 'lucide-react';
import type { VulnerabilityExposureError } from './customer-profile-card';

interface FullVulnPageProps {
  error: Error;
  onGo: () => void;
  onReset: () => void;
}

function asVulnError(error: Error): VulnerabilityExposureError | null {
  if (error.name === 'VulnerabilityExposureError') return error as VulnerabilityExposureError;
  return null;
}

/**
 * Full-screen "we caught it" takeover. Stripped down to the absolute
 * minimum: one icon, one number, one sentence, two buttons. Everything
 * v2 had (CVE codes, file paths, payload strings, SDK provenance footer)
 * is gone — those facts live in the artifact modals.
 */
export function FullVulnPage({ error, onGo, onReset }: FullVulnPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const vuln = asVulnError(error);
  const leaked = vuln?.leakedRows ?? 12;

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg">
      <div className="h-1 w-full bg-[#4C44CB] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center">
          {/* Icon */}
          <div
            className="mx-auto mb-8 w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: 'rgba(225,29,72,0.10)',
              border: '2px solid rgba(225,29,72,0.45)',
              boxShadow: '0 0 48px rgba(225,29,72,0.25)',
            }}
          >
            <ShieldAlert className="w-12 h-12" style={{ color: '#FB7185' }} />
          </div>

          {/* Big number */}
          <p className="text-7xl md:text-8xl font-bold font-mono mb-1" style={{ color: '#FB7185' }}>
            {leaked}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] mb-6" style={{ color: '#FB7185' }}>
            customer records leaked
          </p>

          {/* Headline */}
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-tight">
            Snyk found a critical vulnerability.
          </h1>

          <p className="text-base text-text-secondary mb-10 max-w-md mx-auto">
            One crafted request just returned every customer in the database. The pull request
            cannot merge until the agent ships a verified fix.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#4C44CB] text-white font-semibold text-base
                         hover:bg-[#5C54E0] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(76,68,203,0.4)] hover:shadow-[0_0_48px_rgba(76,68,203,0.55)]
                         cursor-pointer"
            >
              Watch the agent fix it
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
