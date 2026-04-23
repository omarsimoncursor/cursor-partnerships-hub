'use client';

import { ChevronRight, FileText, GitPullRequest, Globe, Phone } from 'lucide-react';

export type Artifact = 'pagerduty' | 'statuspage' | 'pr' | 'postmortem';

interface ArtifactCardsProps {
  onOpen: (artifact: Artifact) => void;
}

export function ArtifactCards({ onOpen }: ArtifactCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-accent-green uppercase tracking-[0.2em] mb-1">
          Run complete · 4m 12s · 0 humans paged
        </p>
        <h3 className="text-lg font-semibold text-text-primary">
          Four artifacts are ready for the on-call to audit.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <ArtifactCard
          icon={<Phone className="w-4 h-4" fill="currentColor" />}
          iconBg="bg-[#06AC38]/15"
          iconBorder="border-[#06AC38]/35"
          iconColor="text-[#57D990]"
          label="PagerDuty Incident"
          refLabel="INC-21487"
          summary="Auto-resolved · 10-event timeline."
          onClick={() => onOpen('pagerduty')}
          primary
        />
        <ArtifactCard
          icon={<Globe className="w-4 h-4" />}
          iconBg="bg-[#3DB46D]/10"
          iconBorder="border-[#3DB46D]/30"
          iconColor="text-[#3DB46D]"
          label="Statuspage update"
          refLabel="status.acme.com/payments-api"
          summary="Investigating → Identified → Resolved."
          onClick={() => onOpen('statuspage')}
        />
        <ArtifactCard
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-accent-blue/10"
          iconBorder="border-accent-blue/30"
          iconColor="text-accent-blue"
          label="Revert PR"
          refLabel="#318 · revert/v1.43.0-bank-transfer"
          summary="Pure subtraction. CI green. Codex approved."
          onClick={() => onOpen('pr')}
        />
        <ArtifactCard
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-accent-amber/10"
          iconBorder="border-accent-amber/20"
          iconColor="text-accent-amber"
          label="Postmortem"
          refLabel="2026-04-23-INC-21487.md"
          summary="Auto-drafted. Open follow-ups assigned to humans."
          onClick={() => onOpen('postmortem')}
        />
      </div>
    </div>
  );
}

function ArtifactCard({
  icon,
  iconBg,
  iconBorder,
  iconColor,
  label,
  refLabel,
  summary,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  label: string;
  refLabel: string;
  summary: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group text-left p-4 rounded-xl border ${
        primary
          ? 'border-[#06AC38]/40 bg-[#06AC38]/5 hover:border-[#06AC38]/60 hover:bg-[#06AC38]/10'
          : 'border-dark-border bg-dark-surface hover:border-dark-border-hover hover:bg-dark-surface-hover'
      } transition-all duration-200 cursor-pointer flex flex-col gap-3 h-full`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg ${iconBg} border ${iconBorder} ${iconColor} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-sm font-medium text-text-primary truncate">{refLabel}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{summary}</p>
    </button>
  );
}
