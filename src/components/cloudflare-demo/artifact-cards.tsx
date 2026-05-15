'use client';

import { ChevronRight, GitPullRequest, Shield, FileText, Activity } from 'lucide-react';

export type CloudflareArtifact = 'attack' | 'waf' | 'pr' | 'postmortem';

interface ArtifactCardsProps {
  onOpen: (artifact: CloudflareArtifact) => void;
}

export function ArtifactCards({ onOpen }: ArtifactCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-accent-green uppercase tracking-[0.2em] mb-1">
          Run complete · 2m 48s · 84k req/s → 12.2k req/s
        </p>
        <h3 className="text-lg font-semibold text-text-primary">
          Four artifacts are ready for the security reviewer.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <ArtifactCard
          icon={<Activity className="w-4 h-4" />}
          iconBg="bg-[#F38020]/15"
          iconBorder="border-[#F38020]/35"
          iconColor="text-[#FAAE40]"
          label="Cloudflare attack detail"
          refLabel="event cf-2026-04-23-2342"
          summary="3 layers annotated · auto-mitigated · 0 humans paged."
          onClick={() => onOpen('attack')}
        />
        <ArtifactCard
          icon={<Shield className="w-4 h-4" />}
          iconBg="bg-[#F38020]/10"
          iconBorder="border-[#F38020]/25"
          iconColor="text-[#FAAE40]"
          label="WAF rule diff"
          refLabel="waf-2c8a4f · /api/auth/login"
          summary="Log-mode → 60s observe → Block. 0 false positives."
          onClick={() => onOpen('waf')}
        />
        <ArtifactCard
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-accent-amber/10"
          iconBorder="border-accent-amber/20"
          iconColor="text-accent-amber"
          label="Postmortem"
          refLabel="cf-credential-stuffing-2026-04-23.md"
          summary="Attack summary, defense narrative, residual exposure."
          onClick={() => onOpen('postmortem')}
        />
        <ArtifactCard
          icon={<GitPullRequest className="w-4 h-4" />}
          iconBg="bg-accent-blue/10"
          iconBorder="border-accent-blue/30"
          iconColor="text-accent-blue"
          label="Pull Request"
          refLabel="#318 · auth-rate-limit-tighten"
          summary="Worker patch deployed via wrangler · app-side draft awaiting review."
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
