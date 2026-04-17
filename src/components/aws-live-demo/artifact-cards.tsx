'use client';

import { Cloud, FileText, GitPullRequest, ChevronRight } from 'lucide-react';

interface ArtifactCardsProps {
  onOpen: (artifact: 'pr' | 'triage' | 'jira' | 'aws') => void;
}

export function ArtifactCards({ onOpen }: ArtifactCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-[#00A86B] uppercase tracking-[0.2em] mb-1">
          Shipped to prod · 22 calendar days · 4 / 4 review gates · 1 / 38 bounded contexts
        </p>
        <h3 className="text-lg font-semibold text-text-primary">
          Four artifacts the AWS SA can take straight into the QBR.
        </h3>
        <p className="text-[11px] text-text-tertiary mt-1.5 max-w-xl mx-auto">
          Each artifact references the same 22-day audit trail — agent work, review approvals, deploy windows, and cutover timing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <ArtifactCard
          icon={<Cloud className="w-4 h-4" />}
          iconBg="bg-[#FF9900]/15"
          iconBorder="border-[#FF9900]/35"
          iconColor="text-[#FF9900]"
          label="AWS Console"
          refLabel="orders-prod · post-cutover"
          summary="22-day audit trail · CW · CDK map · IAM advisor."
          onClick={() => onOpen('aws')}
        />
        <ArtifactCard
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-[#0972D3]/15"
          iconBorder="border-[#0972D3]/35"
          iconColor="text-[#4C9AFF]"
          label="Triage Report"
          refLabel="2026-04-17-orders-service.md"
          summary="Day-by-day timeline · 4 review gates · Well-Arch."
          onClick={() => onOpen('triage')}
        />
        <ArtifactCard
          icon={<span className="text-[#4C9AFF] text-sm font-bold leading-none">J</span>}
          iconBg="bg-[#0052CC]/15"
          iconBorder="border-[#4C9AFF]/30"
          iconColor="text-[#4C9AFF]"
          label="Jira Ticket"
          refLabel="CUR-5302"
          summary="Done · 22-day audit log · 4 review-gate comments."
          onClick={() => onOpen('jira')}
        />
        <ArtifactCard
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-[#00A86B]/10"
          iconBorder="border-[#00A86B]/30"
          iconColor="text-[#00A86B]"
          label="Pull Request"
          refLabel="#482 · modernize-orders-service"
          summary="Merged Day 22 · 17 commits · 4 review gates."
          onClick={() => onOpen('pr')}
          primary
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
          ? 'border-[#FF9900]/40 bg-[#FF9900]/5 hover:border-[#FF9900]/60 hover:bg-[#FF9900]/10'
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
