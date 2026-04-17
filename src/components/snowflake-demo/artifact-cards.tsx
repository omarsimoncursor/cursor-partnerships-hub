'use client';

import { FileText, GitPullRequest, ChevronRight, Snowflake } from 'lucide-react';

interface ArtifactCardsProps {
  onOpen: (artifact: 'pr' | 'triage' | 'jira' | 'snowflake') => void;
}

export function ArtifactCards({ onOpen }: ArtifactCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-accent-green uppercase tracking-[0.2em] mb-1">
          Approved · 4h 03m wall clock · 2h 16m agent · 1h 47m human review · 2 dbt iterations · 2 reviewer cycles
        </p>
        <h3 className="text-lg font-semibold text-text-primary">
          One asset modernized. 246 BTEQ + 411 T-SQL queued behind it.
        </h3>
        <p className="text-xs text-text-tertiary mt-1.5 max-w-2xl mx-auto">
          GSI line-item for the same asset:{' '}
          <span className="font-mono text-accent-amber">2 weeks · $58,000</span> · Cursor:{' '}
          <span className="font-mono text-[#7DD3F5]">4h 03m · $0.0084 in Snowflake credits</span>{' '}
          · query latency: <span className="font-mono text-accent-green">3,412s → 12.8s</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <ArtifactCard
          icon={<Snowflake className="w-4 h-4" />}
          iconBg="bg-[#29B5E8]/15"
          iconBorder="border-[#29B5E8]/40"
          iconColor="text-[#7DD3F5]"
          label="Snowsight Workspace"
          refLabel="fct_daily_revenue · dbt run"
          summary="Warehouse · Cortex review · query history."
          onClick={() => onOpen('snowflake')}
        />
        <ArtifactCard
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-accent-amber/10"
          iconBorder="border-accent-amber/20"
          iconColor="text-accent-amber"
          label="Triage Report"
          refLabel="daily-revenue-rollup.md"
          summary="Idiom map, Cortex diff, row-equiv, economics."
          onClick={() => onOpen('triage')}
        />
        <ArtifactCard
          icon={<span className="text-[#4C9AFF] text-sm font-bold leading-none">J</span>}
          iconBg="bg-[#0052CC]/15"
          iconBorder="border-[#4C9AFF]/30"
          iconColor="text-[#4C9AFF]"
          label="Jira Ticket"
          refLabel="CUR-5202"
          summary="In Review · Epic CUR-5201 · linked PR #318."
          onClick={() => onOpen('jira')}
        />
        <ArtifactCard
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-accent-green/10"
          iconBorder="border-accent-green/20"
          iconColor="text-accent-green"
          label="Pull Request"
          refLabel="#318 · modernize-daily-revenue-rollup"
          summary="2 review cycles · approved · awaiting Friday merge."
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
          ? 'border-accent-blue/40 bg-accent-blue/5 hover:border-accent-blue/60 hover:bg-accent-blue/10'
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
