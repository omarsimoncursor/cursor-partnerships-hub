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
  if (error.name === 'VulnerabilityExposureError') {
    return error as VulnerabilityExposureError;
  }
  return null;
}

export function FullVulnPage({ error, onGo, onReset }: FullVulnPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  const vuln = asVulnError(error);

  const cveId = vuln?.cveId ?? 'SNYK-JS-CUSTOMER-PROFILE-001';
  const cwe = vuln?.cwe ?? 'CWE-943';
  const cvss = vuln?.cvss ?? 9.8;
  const leaked = vuln?.leakedRows ?? 12;
  const filePath = vuln?.filePath ?? 'src/lib/demo/customer-profile.ts';
  const payload = vuln?.payload ?? `' || '1'=='1`;

  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-dark-bg">
      {/* Top indigo Snyk bar */}
      <div className="h-1 w-full bg-[#4C44CB] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E11D48]/15 border border-[#E11D48]/35 mb-6">
            <ShieldAlert className="w-8 h-8 text-[#FB7185]" />
          </div>

          {/* Severity label */}
          <p className="text-[11px] font-mono text-[#FB7185] uppercase tracking-[0.22em] mb-3">
            CRITICAL · {cveId} · CVSS {cvss.toFixed(1)} · {cwe}
          </p>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            NoSQL injection leaked the entire customer table.
          </h1>

          <p className="text-base text-text-secondary mb-8 max-w-xl mx-auto">
            Snyk Code flagged a tainted-input flow into the customer profile
            selector. The morning AppSec replay returned every customer record,
            including hashed credentials and admin role flags.
          </p>

          {/* Metric card */}
          <div className="mx-auto max-w-xl rounded-xl border border-[#4C44CB]/25 bg-[#13132B] p-5 mb-10 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185] animate-pulse" />
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                Snyk Code · SAST · javascript
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <Metric label="Severity" value="Critical" tone="red" big />
              <Metric label="CVSS" value={cvss.toFixed(1)} tone="red" />
              <Metric label="Records leaked" value={String(leaked)} tone="red" />
            </div>

            <p className="font-mono text-[12px] text-text-secondary break-words mb-1">
              {cveId}
              <span className="text-text-tertiary"> · {cwe} · OWASP A03:2021 · CVSS {cvss.toFixed(1)}</span>
            </p>
            <p className="font-mono text-[11px] text-text-tertiary mb-2">
              Tainted source: <span className="text-[#9F98FF]">request.query.username</span>
              {' '}flows into{' '}
              <span className="text-[#9F98FF]">{filePath}</span> selector via string interpolation.
            </p>
            <p className="font-mono text-[11px] text-text-tertiary">
              Reproducer payload: <span className="text-[#FB7185]">{payload}</span>
            </p>

            {/* SCA companion finding */}
            <div className="mt-4 pt-3 border-t border-[#23264F]">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
                Snyk Open Source · companion finding
              </p>
              <p className="font-mono text-[11px] text-text-secondary">
                <span className="text-[#FBBF24]">High</span> ·{' '}
                <span className="text-[#9F98FF]">mongoose@5.13.7</span>{' '}
                — <span className="text-text-tertiary">SNYK-JS-MONGOOSE-2961688</span>{' '}
                (prototype pollution, CVSS 7.5). Fixed in <span className="text-[#4ADE80]">5.13.20</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
            Watch a Cursor agent triage, patch, and verify the fix in under two minutes.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full bg-[#4C44CB] text-white font-semibold text-base
                         hover:bg-[#5C54E0] transition-all duration-200 flex items-center gap-2
                         shadow-[0_0_32px_rgba(76,68,203,0.4)] hover:shadow-[0_0_48px_rgba(76,68,203,0.55)]
                         cursor-pointer"
            >
              Watch Cursor patch this
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

function Metric({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone: 'red' | 'green' | 'amber';
  big?: boolean;
}) {
  const color =
    tone === 'red' ? 'text-[#FB7185]' : tone === 'green' ? 'text-accent-green' : 'text-accent-amber';
  return (
    <div>
      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`${big ? 'text-2xl' : 'text-lg'} font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
