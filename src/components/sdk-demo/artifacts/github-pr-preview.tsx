'use client';

import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';

interface GithubPrPreviewProps {
  script: ResolvedScript;
}

export function GithubPrPreview({ script }: GithubPrPreviewProps) {
  const meta = script.meta;
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      <div className="border-b border-[#30363d] px-6 py-3 flex items-center gap-3">
        <span className="text-[13px] text-[#7d8590]">{meta.prRepo}</span>
        <span className="text-[#7d8590]">·</span>
        <span className="text-[13px] text-[#e6edf3]">Pull Request</span>
        <span className="text-[13px] text-[#7d8590] font-mono">
          #{meta.prNumber > 0 ? meta.prNumber : '—'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1f6feb] text-white font-semibold">
            Open
          </span>
        </div>
      </div>

      <div className="px-6 py-5 max-w-[920px]">
        <h1 className="text-[20px] font-semibold text-[#e6edf3] mb-1.5">{meta.prTitle}</h1>
        <p className="text-[12px] text-[#7d8590] mb-5">
          <span className="font-medium text-[#e6edf3]">cursor-agent</span> wants to merge{' '}
          <span className="font-mono">{meta.prBranch}</span> into{' '}
          <span className="font-mono">main</span> · 32 seconds ago
        </p>

        <div className="border border-[#30363d] rounded-md mb-5">
          <div className="px-4 py-2 border-b border-[#30363d] bg-[#161b22] text-[11px] text-[#7d8590] uppercase tracking-wider font-semibold">
            Description
          </div>
          <div className="px-4 py-3 text-[13px] leading-relaxed text-[#e6edf3] space-y-3">
            <div>
              <Heading>Summary</Heading>
              <p>{meta.incidentSummary}</p>
            </div>
            <div>
              <Heading>Containment evidence</Heading>
              <ul className="list-disc list-inside space-y-0.5 text-[12px]">
                {meta.evidenceLinks.map((link, i) => (
                  <li key={i}>
                    <span className="font-medium">{link.label}:</span>{' '}
                    <span className="font-mono text-[#7d8590]">{link.ref}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Heading>Root cause</Heading>
              <p>{meta.rootCause}</p>
            </div>
            <div>
              <Heading>Verification</Heading>
              <ul className="list-disc list-inside space-y-0.5 text-[12px]">
                <li>
                  <span className="font-mono">tsc --noEmit</span>:{' '}
                  <span className="text-[#3fb950]">passed</span>
                </li>
                <li>
                  <span className="font-mono">npm run lint</span>:{' '}
                  <span className="text-[#3fb950]">passed</span>
                </li>
                <li>
                  <span className="font-mono">npm test</span>:{' '}
                  <span className="text-[#3fb950]">287 passed · 0 failed</span>
                </li>
              </ul>
            </div>
            <div>
              <Heading>Risk assessment</Heading>
              <ul className="list-disc list-inside space-y-0.5 text-[12px]">
                <li>Blast radius: small (≤ 3 files)</li>
                <li>
                  Rollback plan: <span className="font-mono">git revert HEAD</span>
                </li>
                <li>Type surface unchanged · all callers preserved</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-[#30363d] rounded-md mb-5">
          <div className="px-4 py-2 border-b border-[#30363d] bg-[#161b22] text-[11px] text-[#7d8590] uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Checks · all required passing</span>
            <span className="text-[#3fb950]">5 / 5 ✓</span>
          </div>
          <div className="px-4 py-2 grid grid-cols-2 gap-y-1 text-[12px]">
            <Check label="tsc" />
            <Check label="lint" />
            <Check label="unit-tests" />
            <Check label="dependency-review" />
            <Check label="gitleaks" />
          </div>
        </div>

        <div className="border border-[#30363d] rounded-md p-4 flex items-center gap-3 bg-[#0f1d2c]">
          <span className="text-[#3fb950] text-[18px]">✓</span>
          <div className="flex-1">
            <p className="text-[12px] text-[#e6edf3]">
              <span className="font-semibold">Verified by Cursor agent</span> ·{' '}
              <span className="font-mono text-[11px] text-[#7d8590]">{meta.agentId}</span>
            </p>
            <p className="text-[11px] text-[#7d8590]">
              Reviewer must approve before merge. Cursor agents do not auto-merge to main.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7d8590] mb-1">{children}</p>
  );
}

function Check({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#3fb950] text-[12px]">✓</span>
      <span className="text-[#e6edf3] font-mono">{label}</span>
    </div>
  );
}
