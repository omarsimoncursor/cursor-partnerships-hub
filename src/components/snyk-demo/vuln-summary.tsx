'use client';

import { ExternalLink, RotateCcw, ShieldAlert } from 'lucide-react';
import type { VulnerabilityExposureError } from './customer-profile-card';

interface VulnSummaryProps {
  error: Error;
  onReset: () => void;
  onViewSnyk?: () => void;
}

function asVulnError(error: Error): VulnerabilityExposureError | null {
  if (error.name === 'VulnerabilityExposureError') {
    return error as VulnerabilityExposureError;
  }
  return null;
}

export function VulnSummary({ error, onReset, onViewSnyk }: VulnSummaryProps) {
  const vuln = asVulnError(error);
  const cveId = vuln?.cveId ?? 'SNYK-JS-CUSTOMER-PROFILE-001';
  const cwe = vuln?.cwe ?? 'CWE-943';
  const cvss = vuln?.cvss ?? 9.8;
  const leaked = vuln?.leakedRows ?? 12;
  const endpoint = vuln?.endpoint ?? '/api/customer-profile/lookup';
  const filePath = vuln?.filePath ?? 'src/lib/demo/customer-profile.ts';

  return (
    <div className="w-full h-full rounded-xl border border-[#4C44CB]/30 bg-dark-surface overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#4C44CB]/30 bg-[#4C44CB]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#E11D48]/15 border border-[#E11D48]/30 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FB7185]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#FB7185] leading-none mb-0.5">
              Critical vulnerability detected
            </p>
            <p className="text-[11px] text-text-tertiary font-mono truncate">
              snyk · project cursor-for-enterprise
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Affected endpoint
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-[#9F98FF] break-words">
            GET {endpoint}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Severity
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg overflow-hidden">
            <SeverityBar />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="CVSS" value={cvss.toFixed(1)} color="text-[#FB7185]" />
          <Stat label="Severity" value="Critical" color="text-[#FB7185]" />
          <Stat label="Leaked" value={String(leaked)} color="text-[#FB7185]" />
        </div>

        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Tainted flow
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="text-[#9F98FF]">{filePath}</div>
            <div>└─ request.query.username (tainted source)</div>
            <div>└─ string-interpolated into selector</div>
            <div className="text-text-tertiary">└─ predicate collapses to always-true</div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Findings
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg space-y-1.5">
            <FindingRow
              label="Snyk Code · NoSQL injection"
              detail={`${cveId} · ${cwe}`}
              tone="red"
            />
            <FindingRow
              label="Snyk Open Source · Prototype pollution"
              detail="mongoose@5.13.7 → 5.13.20"
              tone="amber"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewSnyk}
          className="w-full py-2 px-3 rounded-lg bg-[#4C44CB] text-white font-medium text-sm
                     hover:bg-[#5C54E0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Snyk
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

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2.5 rounded-md bg-dark-bg">
      <p className="text-[10px] text-text-tertiary uppercase mb-0.5">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function FindingRow({ label, detail, tone }: { label: string; detail: string; tone: 'red' | 'amber' }) {
  const dot = tone === 'red' ? 'bg-[#FB7185]' : 'bg-[#FBBF24]';
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <div className="min-w-0">
        <p className="text-text-primary truncate">{label}</p>
        <p className="text-text-tertiary font-mono truncate">{detail}</p>
      </div>
    </div>
  );
}

function SeverityBar() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary uppercase">
        <span>0</span>
        <span>3.9</span>
        <span>6.9</span>
        <span>8.9</span>
        <span>10</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex">
        <div style={{ width: '39%' }} className="bg-[#3FB950]/40" />
        <div style={{ width: '30%' }} className="bg-[#FBBF24]/40" />
        <div style={{ width: '20%' }} className="bg-[#F59E0B]/40" />
        <div style={{ width: '11%' }} className="bg-[#E11D48]" />
      </div>
      <div className="text-[10px] font-mono text-[#FB7185] flex justify-end pr-[1%]">
        ▲ 9.8 critical
      </div>
    </div>
  );
}
