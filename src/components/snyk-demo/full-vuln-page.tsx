'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, ShieldAlert, GitPullRequest } from 'lucide-react';
import type { VulnerabilityExposureError } from './customer-profile-card';
import { ShiftLeftStages } from './shift-left-stages';
import { DEMO_AGENT } from '@/lib/cursor-sdk/types';

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
      <div className="h-1 w-full bg-[#4C44CB] sticky top-0" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* Stage badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{ background: 'rgba(225,29,72,0.10)', border: '1px solid rgba(225,29,72,0.30)' }}>
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: '#FB7185' }} />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: '#FB7185' }}>
              Stage 3 · pre-merge security gate · merge blocked
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            Snyk × Cursor SDK blocked the merge.
          </h1>

          <p className="text-base text-text-secondary mb-6 max-w-2xl mx-auto">
            The pre-merge gate ran <code className="font-mono text-[#9F98FF]">Agent.create({'{'}cloud:{'{'}repos: [{'{'}url, prUrl{'}'}]{'}'}{'}'})</code>{' '}
            against PR #214. Snyk Code returned a critical NoSQL injection. The exploit replay confirmed
            it leaked the full customer table. PR #214 cannot merge until a verified fix lands.
          </p>

          {/* Shift-left strip */}
          <div className="mb-8">
            <ShiftLeftStages active="pr-gate" covered={['ide', 'commit']} variant="card" />
          </div>

          {/* Finding card */}
          <div className="mx-auto max-w-2xl rounded-xl border p-5 mb-8 text-left" style={{ background: '#13132B', borderColor: 'rgba(76,68,203,0.30)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
                Snyk Code · SAST · javascript · CRITICAL
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
              Tainted source: <span style={{ color: '#9F98FF' }}>request.query.username</span>{' '}
              flows into <span style={{ color: '#9F98FF' }}>{filePath}</span> selector via string interpolation.
            </p>
            <p className="font-mono text-[11px] text-text-tertiary mb-3">
              Reproducer payload: <span style={{ color: '#FB7185' }}>{payload}</span>
            </p>

            <div className="pt-3 border-t" style={{ borderColor: '#23264F' }}>
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
                Snyk Open Source · companion finding
              </p>
              <p className="font-mono text-[11px] text-text-secondary">
                <span style={{ color: '#FBBF24' }}>High</span> ·{' '}
                <span style={{ color: '#9F98FF' }}>mongoose@5.13.7</span>{' '}
                — <span style={{ color: '#7C7CA0' }}>SNYK-JS-MONGOOSE-2961688</span>{' '}
                (prototype pollution, CVSS 7.5). Fixed in <span style={{ color: '#4ADE80' }}>5.13.20</span>.
              </p>
            </div>

            {/* SDK provenance footer */}
            <div className="mt-4 pt-3 border-t flex items-center gap-2 text-[10.5px] font-mono" style={{ borderColor: '#23264F', color: '#7C7CA0' }}>
              <GitPullRequest className="w-3 h-3" style={{ color: '#9F98FF' }} />
              <span>Detected by</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: '#1A1C40', color: '#9F98FF' }}>
                @cursor/february v1.0.7
              </span>
              <span>·</span>
              <span>agent {DEMO_AGENT.agentId.slice(0, 12)}…</span>
              <span>·</span>
              <span>run {DEMO_AGENT.runId.slice(0, 12)}…</span>
            </div>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.25em]">
              Demo
            </span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <p className="text-base text-text-primary font-medium mb-5 max-w-md mx-auto">
            Watch the SDK orchestrate the patch, exploit replay, and PR &mdash; in under two minutes.
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
              Watch the SDK patch this
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
