'use client';

import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';

interface JiraTicketProps {
  script: ResolvedScript;
}

export function JiraTicket({ script }: JiraTicketProps) {
  const meta = script.meta;
  return (
    <div className="w-full h-full bg-[#FAFBFC] text-[#172B4D] overflow-y-auto">
      <div className="border-b border-[#DFE1E6] bg-white px-6 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">
          J
        </div>
        <span className="text-[13px] text-[#5E6C84]">Projects / CUR-SEC / </span>
        <span className="text-[13px] font-semibold text-[#172B4D]">{meta.jiraId}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#FFEBE6] text-[#BF2600] font-semibold border border-[#FFBDAD]">
            P0
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#E3FCEF] text-[#006644] font-semibold border border-[#ABF5D1]">
            Awaiting Review
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 px-6 py-5 max-w-[1100px]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#172B4D] mb-1">{meta.jiraSummary}</h1>
          <p className="text-[12px] text-[#5E6C84] mb-5">
            <span className="font-mono">{meta.jiraId}</span> · Type: Security incident · Created by{' '}
            <span className="font-medium">cursor-agent</span> · 38 seconds ago
          </p>

          <SectionLabel>Status timeline</SectionLabel>
          <div className="flex items-center gap-2 mb-5">
            <Pill state="done">To Triage</Pill>
            <Arrow />
            <Pill state="done">In Progress</Pill>
            <Arrow />
            <Pill state="active">Awaiting Review</Pill>
            <Arrow />
            <Pill state="pending">Resolved</Pill>
          </div>

          <SectionLabel>Description</SectionLabel>
          <p className="text-[13px] leading-relaxed text-[#172B4D] mb-5">
            {meta.incidentSummary}
          </p>

          <SectionLabel>Root cause</SectionLabel>
          <p className="text-[13px] leading-relaxed text-[#172B4D] mb-5">{meta.rootCause}</p>

          <SectionLabel>Remediation</SectionLabel>
          <p className="text-[13px] leading-relaxed text-[#172B4D] mb-5">{meta.remediation}</p>

          <SectionLabel>Linked artifacts</SectionLabel>
          <ul className="space-y-1 mb-5">
            {meta.evidenceLinks.map((link, i) => (
              <li
                key={i}
                className="text-[13px] flex items-baseline gap-2 px-3 py-1.5 rounded bg-white border border-[#DFE1E6]"
              >
                <span className="text-[#0052CC]">›</span>
                <span className="font-medium text-[#172B4D]">{link.label}:</span>
                <span className="font-mono text-[12px] text-[#5E6C84]">{link.ref}</span>
              </li>
            ))}
          </ul>

          <SectionLabel>Activity</SectionLabel>
          <div className="space-y-2 mb-5">
            <Activity actor="cursor-agent" time="38s ago" body={`Created ticket ${meta.jiraId}, severity P0, components security`} />
            <Activity actor="cursor-agent" time="32s ago" body="Containment actions completed across MCPs" />
            <Activity actor="cursor-agent" time="14s ago" body={`Linked PR ${meta.prNumber > 0 ? `#${meta.prNumber}` : ''} ${meta.prRepo}`} />
            <Activity actor="cursor-agent" time="just now" body="Status → Awaiting Review" />
          </div>
        </div>

        <div>
          <SectionLabel>Details</SectionLabel>
          <DetailRow label="Assignee" value="cursor-agent" />
          <DetailRow label="Reporter" value="cursor-agent" />
          <DetailRow label="Reviewer" value="@security-team" />
          <DetailRow label="Priority" value="P0" />
          <DetailRow label="Components" value="security, payments-service, IAM" />
          <DetailRow label="Labels" value="cursor-sdk, mcp, automated" />
          <DetailRow label="Created" value="38s ago" />
          <DetailRow label="Updated" value="just now" />

          <SectionLabel className="mt-5">Linked PRs</SectionLabel>
          {meta.prNumber > 0 ? (
            <div className="text-[12px] text-[#172B4D] px-3 py-2 rounded bg-white border border-[#DFE1E6]">
              <p className="font-mono text-[11px] text-[#0052CC]">#{meta.prNumber}</p>
              <p className="leading-snug mt-0.5">{meta.prTitle}</p>
              <p className="text-[11px] text-[#5E6C84] mt-1">awaiting review · {meta.prRepo}</p>
            </div>
          ) : (
            <p className="text-[12px] text-[#5E6C84] italic">No PR opened (containment-only run)</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] mb-2 ${className ?? ''}`}>
      {children}
    </p>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-[12px] py-1.5 border-b border-[#F4F5F7]">
      <span className="text-[#5E6C84]">{label}</span>
      <span className="text-[#172B4D] font-medium text-right truncate ml-3">{value}</span>
    </div>
  );
}

function Pill({
  children,
  state,
}: {
  children: React.ReactNode;
  state: 'done' | 'active' | 'pending';
}) {
  const cls =
    state === 'done'
      ? 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]'
      : state === 'active'
        ? 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]'
        : 'bg-[#F4F5F7] text-[#5E6C84] border-[#DFE1E6]';
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function Arrow() {
  return <span className="text-[#5E6C84] text-[11px]">→</span>;
}

function Activity({ actor, time, body }: { actor: string; time: string; body: string }) {
  return (
    <div className="flex items-start gap-2 text-[12px]">
      <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
        ✦
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#172B4D]">
          <span className="font-medium">{actor}</span>{' '}
          <span className="text-[#5E6C84]">— {time}</span>
        </p>
        <p className="text-[#172B4D] leading-snug">{body}</p>
      </div>
    </div>
  );
}
