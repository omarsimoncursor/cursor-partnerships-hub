'use client';

import { Code2, FileText, GitPullRequest, MessageSquare, ChevronRight } from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import { cn } from '@/lib/utils';

export type SdkArtifact = 'sdk-trace' | 'audit' | 'jira' | 'pr' | 'slack';

interface ArtifactStripProps {
  script: ResolvedScript;
  onOpen: (artifact: SdkArtifact) => void;
}

export function ArtifactStrip({ script, onOpen }: ArtifactStripProps) {
  const meta = script.meta;
  const prRef = meta.prNumber > 0 ? `#${meta.prNumber}` : 'no PR';
  return (
    <div className="w-full max-w-6xl mx-auto mt-6">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-accent-green uppercase tracking-[0.2em] mb-1">
          Run complete · status FINISHED
        </p>
        <h3 className="text-lg font-semibold text-text-primary">
          Five artifacts ready for the reviewer.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <ArtifactCard
          icon={<Code2 className="w-4 h-4" />}
          iconBg="bg-accent-blue/10"
          iconBorder="border-accent-blue/30"
          iconColor="text-accent-blue"
          label="SDK Call Trace"
          refLabel={`agent-${meta.agentId}`}
          summary="Every SDK + MCP call · timing · status."
          onClick={() => onOpen('sdk-trace')}
          primary
        />
        <ArtifactCard
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-[#0F62FE]/10"
          iconBorder="border-[#0F62FE]/30"
          iconColor="text-[#0F62FE]"
          label="Audit Timeline"
          refLabel={`${meta.jiraId}.md`}
          summary="CISO-facing chronological evidence document."
          onClick={() => onOpen('audit')}
        />
        <ArtifactCard
          icon={<span className="text-[#4C9AFF] text-sm font-bold leading-none">J</span>}
          iconBg="bg-[#0052CC]/15"
          iconBorder="border-[#4C9AFF]/30"
          iconColor="text-[#4C9AFF]"
          label="Jira Ticket"
          refLabel={meta.jiraId}
          summary="Awaiting Review · linked to every artifact."
          onClick={() => onOpen('jira')}
        />
        <ArtifactCard
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-accent-green/10"
          iconBorder="border-accent-green/20"
          iconColor="text-accent-green"
          label="GitHub PR"
          refLabel={`${prRef} · ${meta.prRepo}`}
          summary={meta.prNumber > 0 ? 'All checks passed. Awaiting approval.' : 'No PR · containment-only run.'}
          onClick={() => onOpen('pr')}
        />
        <ArtifactCard
          icon={<MessageSquare className="w-4 h-4" />}
          iconBg="bg-[#4A154B]/15"
          iconBorder="border-[#4A154B]/40"
          iconColor="text-[#E4A6E0]"
          label="Slack Thread"
          refLabel={meta.slackChannel}
          summary="On-call paged. Sarah Park ack'd in 12s."
          onClick={() => onOpen('slack')}
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
      className={cn(
        'group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-3 h-full',
        primary
          ? 'border-accent-blue/40 bg-accent-blue/5 hover:border-accent-blue/60 hover:bg-accent-blue/10'
          : 'border-dark-border bg-dark-surface hover:border-dark-border-hover hover:bg-dark-surface-hover',
      )}
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
