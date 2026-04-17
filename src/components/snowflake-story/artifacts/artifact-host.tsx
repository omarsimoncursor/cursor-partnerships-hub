'use client';

import type { StoryArtifact } from '../story-types';
import { ArtifactFrame } from './artifact-frame';
import { SnowsightWorkspace } from './snowsight-workspace';
import { JiraTicket } from './jira-ticket';
import { GithubPrPreview } from './github-pr-preview';
import { TriageReport } from './triage-report';

interface ArtifactHostProps {
  artifact: StoryArtifact | null;
  onClose: () => void;
}

export function ArtifactHost({ artifact, onClose }: ArtifactHostProps) {
  if (!artifact) return null;

  if (artifact === 'snowsight') {
    return (
      <ArtifactFrame
        title="Snowsight · fct_daily_revenue"
        subtitle="acme-analytics · us-east-1.aws · XS_MODERNIZATION_WH"
        accent="#29B5E8"
        size="xl"
        onClose={onClose}
      >
        <SnowsightWorkspace />
      </ArtifactFrame>
    );
  }
  if (artifact === 'jira') {
    return (
      <ArtifactFrame
        title="CUR-5202 · Modernize daily_revenue_rollup"
        subtitle="Cursor Modernization · Epic CUR-5201 · P1"
        accent="#0052CC"
        size="lg"
        onClose={onClose}
      >
        <JiraTicket />
      </ArtifactFrame>
    );
  }
  if (artifact === 'pr') {
    return (
      <ArtifactFrame
        title="PR #318 · acme-analytics/data-platform"
        subtitle="feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt"
        accent="#2F81F7"
        size="xl"
        onClose={onClose}
      >
        <GithubPrPreview />
      </ArtifactFrame>
    );
  }
  if (artifact === 'triage') {
    return (
      <ArtifactFrame
        title="Modernization triage · daily_revenue_rollup"
        subtitle="Asset 1 of 911 · Snowflake + dbt · Cortex-verified"
        accent="#29B5E8"
        size="md"
        onClose={onClose}
      >
        <TriageReport />
      </ArtifactFrame>
    );
  }
  return null;
}
