'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export type WorkflowSceneComponent = ComponentType;

type VendorSceneEntry = {
  hasPartnershipScenes: boolean;
  scenes: WorkflowSceneComponent[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scene(loader: () => Promise<{ default: ComponentType<any> }>): WorkflowSceneComponent {
  return dynamic(loader, { ssr: false });
}

const VENDOR_SCENE_MAP: Record<string, VendorSceneEntry> = {
  datadog: {
    hasPartnershipScenes: true,
    scenes: [
      scene(() => import('@/components/datadog/alert-scene').then(m => ({ default: m.AlertScene }))),
      scene(() => import('@/components/datadog/editor-scene').then(m => ({ default: m.EditorScene }))),
      scene(() => import('@/components/datadog/analysis-scene').then(m => ({ default: m.AnalysisScene }))),
      scene(() => import('@/components/datadog/fix-scene').then(m => ({ default: m.FixScene }))),
      scene(() => import('@/components/datadog/value-prop-scene').then(m => ({ default: m.ValuePropScene }))),
    ],
  },
  figma: {
    hasPartnershipScenes: true,
    scenes: [
      scene(() => import('@/components/figma-partner/telephone-scene').then(m => ({ default: m.TelephoneScene }))),
      scene(() => import('@/components/figma-partner/mcp-bridge-scene').then(m => ({ default: m.McpBridgeScene }))),
      scene(() => import('@/components/figma-partner/design-mode-scene').then(m => ({ default: m.DesignModeScene }))),
      scene(() => import('@/components/figma-partner/orchestration-scene').then(m => ({ default: m.OrchestrationScene }))),
      scene(() => import('@/components/figma-partner/figma-value-scene').then(m => ({ default: m.FigmaValueScene }))),
    ],
  },
  sentry: {
    hasPartnershipScenes: true,
    scenes: [
      scene(() => import('@/components/sentry/error-scene').then(m => ({ default: m.ErrorScene }))),
      scene(() => import('@/components/sentry/trace-scene').then(m => ({ default: m.TraceScene }))),
      scene(() => import('@/components/sentry/rootcause-scene').then(m => ({ default: m.RootCauseScene }))),
      scene(() => import('@/components/sentry/patch-scene').then(m => ({ default: m.PatchScene }))),
      scene(() => import('@/components/sentry/sentry-value-scene').then(m => ({ default: m.SentryValueScene }))),
    ],
  },
  aws: {
    hasPartnershipScenes: true,
    scenes: [
      scene(() => import('@/components/aws-demo/monolith-scene').then(m => ({ default: m.MonolithScene }))),
      scene(() => import('@/components/aws-demo/analysis-scene').then(m => ({ default: m.AnalysisScene }))),
      scene(() => import('@/components/aws-demo/decompose-scene').then(m => ({ default: m.DecomposeScene }))),
      scene(() => import('@/components/aws-demo/infra-scene').then(m => ({ default: m.InfraScene }))),
      scene(() => import('@/components/aws-demo/aws-value-scene').then(m => ({ default: m.AWSValueScene }))),
    ],
  },
  github: {
    hasPartnershipScenes: true,
    scenes: [
      scene(() => import('@/components/github-demo/pr-scene').then(m => ({ default: m.PrScene }))),
      scene(() => import('@/components/github-demo/ingest-scene').then(m => ({ default: m.IngestScene }))),
      scene(() => import('@/components/github-demo/refactor-scene').then(m => ({ default: m.RefactorScene }))),
      scene(() => import('@/components/github-demo/tests-scene').then(m => ({ default: m.TestsScene }))),
      scene(() => import('@/components/github-demo/github-value-scene').then(m => ({ default: m.GithubValueScene }))),
    ],
  },
  gitlab: {
    hasPartnershipScenes: true,
    scenes: [
      scene(() => import('@/components/gitlab-demo/pipeline-scene').then(m => ({ default: m.PipelineScene }))),
      scene(() => import('@/components/gitlab-demo/diagnose-scene').then(m => ({ default: m.DiagnoseScene }))),
      scene(() => import('@/components/gitlab-demo/fix-scene').then(m => ({ default: m.FixScene }))),
      scene(() => import('@/components/gitlab-demo/deploy-scene').then(m => ({ default: m.DeployScene }))),
      scene(() => import('@/components/gitlab-demo/gitlab-value-scene').then(m => ({ default: m.GitLabValueScene }))),
    ],
  },
};

export function getVendorWorkflowScenes(vendorId: string): VendorSceneEntry | null {
  return VENDOR_SCENE_MAP[vendorId] ?? null;
}

export function vendorHasPartnershipScenes(vendorId: string): boolean {
  return VENDOR_SCENE_MAP[vendorId]?.hasPartnershipScenes ?? false;
}
