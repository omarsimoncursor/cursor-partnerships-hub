// Simulates the rollout of v1.43.0 to the payments-api service.
// The "bad deploy" flag is the seed for the demo: when true, the rollout
// completes successfully (so the engineer experiences the calm-before-storm)
// and then the post-deploy 5xx burst kicks the incident off.
//
// scripts/reset-pagerduty-demo.sh restores BAD_DEPLOY = true so the demo
// is repeatable after a real "fix" PR merges and flips this to false.
export const BAD_DEPLOY = true;

export type DeployStage =
  | 'building-image'
  | 'pushing-canary'
  | 'canary-traffic'
  | 'promoting-100'
  | 'observing'
  | 'complete';

export interface DeployStageInfo {
  id: DeployStage;
  label: string;
  detail: string;
  durationMs: number;
}

// Total ~5.0s — the prospect feels the deploy roll out before the page fires.
export const DEPLOY_TIMELINE: DeployStageInfo[] = [
  {
    id: 'building-image',
    label: 'Building image',
    detail: 'docker buildx · payments-api:v1.43.0 · 712MB',
    durationMs: 1100,
  },
  {
    id: 'pushing-canary',
    label: 'Rolling out to canary',
    detail: '5% traffic · us-west-2 · 2/2 pods healthy',
    durationMs: 1000,
  },
  {
    id: 'canary-traffic',
    label: 'Canary observing',
    detail: 'p99 124ms · 5xx rate 0.0% · SLO clean',
    durationMs: 950,
  },
  {
    id: 'promoting-100',
    label: 'Promoting to 100%',
    detail: 'fleet-wide rollout · 18/18 pods live · v1.43.0',
    durationMs: 950,
  },
  {
    id: 'observing',
    label: 'Post-deploy observation',
    detail: 'awaiting traffic ramp · monitor-id 42971',
    durationMs: 1050,
  },
];

export interface PaymentsIncidentSeed {
  incidentId: string;
  service: string;
  errorRate: number;
  monitorId: string;
  monitorName: string;
  errorBudgetBurnRate: number;
  triggeredAtIso: string;
  badCommitSha: string;
  deployVersion: string;
  affectedRegions: string[];
}

export const INCIDENT_SEED: PaymentsIncidentSeed = {
  incidentId: 'INC-21487',
  service: 'payments-api',
  errorRate: 7.4,
  monitorId: '42971',
  monitorName: 'payments-api 5xx error rate',
  errorBudgetBurnRate: 36,
  triggeredAtIso: '2026-04-23T03:14:22-07:00',
  badCommitSha: 'a4f2e1b',
  deployVersion: 'v1.43.0',
  affectedRegions: ['us-west-2', 'us-east-1', 'eu-west-1'],
};

export interface DeployResult {
  ok: boolean;
  version: string;
  badDeploy: boolean;
  stages: DeployStage[];
  elapsedMs: number;
}
