'use client';

import { FileText, GitPullRequest, ChevronRight } from 'lucide-react';

interface ArtifactCardsProps {
  onOpen: (artifact: 'pr' | 'triage' | 'jira') => void;
}

export function ArtifactCards({ onOpen }: ArtifactCardsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-accent-green uppercase tracking-[0.2em] mb-1">
          Run complete · 2m 14s
        </p>
        <h3 className="text-lg font-semibold text-text-primary">
          Three artifacts are ready for the reviewer.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ArtifactCard
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-accent-amber/10"
          iconBorder="border-accent-amber/20"
          iconColor="text-accent-amber"
          label="Triage Report"
          ref="2026-04-16-typeerror-format-payment.md"
          summary="Root cause, stack trace, verification, risk."
          onClick={() => onOpen('triage')}
        />
        <ArtifactCard
          icon={<span className="text-[#4C9AFF] text-sm font-bold leading-none">J</span>}
          iconBg="bg-[#0052CC]/15"
          iconBorder="border-[#4C9AFF]/30"
          iconColor="text-[#4C9AFF]"
          label="Jira Ticket"
          ref="CUR-4291"
          summary="In Review · linked to Sentry + PR #142."
          onClick={() => onOpen('jira')}
        />
        <ArtifactCard
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-accent-green/10"
          iconBorder="border-accent-green/20"
          iconColor="text-accent-green"
          label="Pull Request"
          ref="#142 · fix/bank-transfer-null-ref"
          summary="All checks passed. Awaiting human approval."
          onClick={() => onOpen('pr')}
          primary
        />
      </div>
    </div>
  );
}

function ArtifactCard({
  icon, iconBg, iconBorder, iconColor, label, ref, summary, onClick, primary,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  label: string;
  ref: string;
  summary: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group text-left p-4 rounded-xl border ${
        primary
          ? 'border-accent-blue/40 bg-accent-blue/5 hover:border-accent-blue/60 hover:bg-accent-blue/10'
          : 'border-dark-border bg-dark-surface hover:border-dark-border-hover hover:bg-dark-surface-hover'
      } transition-all duration-200 cursor-pointer flex flex-col gap-3 h-full`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} border ${iconBorder} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-sm font-medium text-text-primary truncate">{ref}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{summary}</p>
    </button>
  );
}
