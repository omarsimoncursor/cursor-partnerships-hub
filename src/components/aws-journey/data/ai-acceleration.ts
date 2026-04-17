/**
 * Every task Cursor Cloud Agents accelerated across the 22-day OrdersService
 * modernization. Used by per-act `AccelerationTile`s and the Act 7 ledger.
 *
 * Durations are human-rough: baseline is what a typical GSI pod (2–3 seniors,
 * tools from the 2024 era) would book against the same scope. Cursor durations
 * are actual agent wall-clock from the project.
 */

export type JourneyAct = 2 | 3 | 4 | 5 | 6;

export interface AiTask {
  id: string;
  act: JourneyAct;
  /** Short verb-phrase, shown as title. */
  title: string;
  /** One-liner detail about what Cursor actually produced. */
  detail: string;
  /** Baseline duration as a GSI would book it. */
  baselineHours: number;
  /** Actual Cursor Cloud Agent duration. */
  cursorHours: number;
  /** Human-readable baseline label, e.g. "4 weeks". */
  baselineLabel: string;
  /** Human-readable Cursor duration, e.g. "3 days". */
  cursorLabel: string;
  /** Category used for ledger grouping. */
  category: 'discover' | 'design' | 'build' | 'verify' | 'operate';
}

export const AI_TASKS: readonly AiTask[] = [
  // Act 2 — Discovery
  {
    id: 'codebase-scan',
    act: 2,
    title: 'Scan 4.2M-LOC monolith',
    detail: '38 bounded contexts mapped, 8 boundary violations flagged, 17 orphan cron jobs surfaced.',
    baselineHours: 160, // 4 weeks @ 40h
    cursorHours: 5,
    baselineLabel: '4 weeks',
    cursorLabel: '5 hours',
    category: 'discover',
  },
  {
    id: 'dead-code',
    act: 2,
    title: 'Dead-code sweep',
    detail: '4 subsystems with 0 calls in 90d identified + retirement plan drafted.',
    baselineHours: 40,
    cursorHours: 1,
    baselineLabel: '1 week',
    cursorLabel: '1 hour',
    category: 'discover',
  },
  {
    id: 'starting-context',
    act: 2,
    title: 'Starting-context recommendation',
    detail: 'Ranked 38 contexts by ROI × blast-radius. Recommended OrdersService with rationale.',
    baselineHours: 24,
    cursorHours: 0.5,
    baselineLabel: '3 days',
    cursorLabel: '30 min',
    category: 'discover',
  },

  // Act 3 — Architecture
  {
    id: 'target-arch',
    act: 3,
    title: 'Draft target architecture',
    detail: 'API Gateway → 6 Lambdas → Aurora Serverless v2, with strangler-fig + dual-write bridge.',
    baselineHours: 40, // 5 × 8h whiteboard sessions
    cursorHours: 0.75,
    baselineLabel: '5 days',
    cursorLabel: '45 min',
    category: 'design',
  },
  {
    id: 'override-absorb',
    act: 3,
    title: 'Absorb J. Park’s override',
    detail: '7→14 day dual-write window + parity-diff Lambda spec, grounded in 2023 post-mortem.',
    baselineHours: 16,
    cursorHours: 0.1,
    baselineLabel: '2 days',
    cursorLabel: '6 min',
    category: 'design',
  },

  // Act 4 — Build
  {
    id: 'java-to-cdk',
    act: 4,
    title: 'Port Java EE → AWS CDK',
    detail: 'OrdersService.ejb (2.8k LOC) → 6 TypeScript Lambda handlers + Aurora CDK stack.',
    baselineHours: 480, // 12 weeks
    cursorHours: 72,
    baselineLabel: '12 weeks',
    cursorLabel: '9 days',
    category: 'build',
  },
  {
    id: 'integration-tests',
    act: 4,
    title: 'Generate 47 integration tests',
    detail: 'Behavioral parity suite — Oracle PL/SQL procs → Postgres + Lambda equivalents.',
    baselineHours: 80, // 2 weeks
    cursorHours: 1.5,
    baselineLabel: '2 weeks',
    cursorLabel: '90 min',
    category: 'build',
  },
  {
    id: 'codex-patches',
    act: 4,
    title: 'Security auto-patches',
    detail: 'IAM scope reduction + VPC endpoints for SecretsManager & RDS, before M. Chen’s review.',
    baselineHours: 16,
    cursorHours: 0.2,
    baselineLabel: '2 days',
    cursorLabel: '12 min',
    category: 'build',
  },

  // Act 5 — Verify
  {
    id: 'load-test',
    act: 5,
    title: 'Author k6 load-test suite',
    detail: '12k rps ramp, 4 SLO tiles, prod-realistic traffic mix seeded from CloudFront logs.',
    baselineHours: 24, // 3 days
    cursorHours: 0.33,
    baselineLabel: '3 days',
    cursorLabel: '20 min',
    category: 'verify',
  },
  {
    id: 'cold-start-fix',
    act: 5,
    title: 'Cold-start diagnosis + fix',
    detail: 'Spotted p99 spike, proposed provisioned concurrency on CreateOrderFn with cost delta.',
    baselineHours: 24, // 3 days of eng time
    cursorHours: 0.05, // 3 minutes live during test
    baselineLabel: '3 days',
    cursorLabel: '3 min',
    category: 'verify',
  },

  // Act 6 — Operate
  {
    id: 'runbook',
    act: 6,
    title: 'Write cutover runbook',
    detail: '12-item checklist, rollback triggers per canary step, CloudWatch alarms pre-wired.',
    baselineHours: 32, // 4 days
    cursorHours: 0.5,
    baselineLabel: '4 days',
    cursorLabel: '30 min',
    category: 'operate',
  },
  {
    id: 'canary-orchestration',
    act: 6,
    title: 'Orchestrate canary 0→100%',
    detail: 'Step-function driven 0 → 1 → 10 → 50 → 100% traffic shift with auto-rollback.',
    baselineHours: 40, // 5 days
    cursorHours: 0.4,
    baselineLabel: '5 days',
    cursorLabel: '25 min',
    category: 'operate',
  },
  {
    id: 'live-watch',
    act: 6,
    title: 'Live SLO watchdog',
    detail: 'Tailed CloudWatch through all 4 canary steps; no threshold breaches; paged nobody.',
    baselineHours: 16, // ~2 eng-days of vigilance
    cursorHours: 0.1,
    baselineLabel: '2 days',
    cursorLabel: '6 min',
    category: 'operate',
  },
] as const;

export const AI_TOTALS = (() => {
  const sumBaseline = AI_TASKS.reduce((a, t) => a + t.baselineHours, 0);
  const sumCursor = AI_TASKS.reduce((a, t) => a + t.cursorHours, 0);
  return {
    baselineHours: sumBaseline,
    cursorHours: sumCursor,
    speedup: sumBaseline / sumCursor,
    baselineLabel: `${Math.round(sumBaseline / 8)} person-days`,
    cursorLabel: `${sumCursor.toFixed(1)} agent-hours`,
  };
})();

export const CATEGORY_META: Record<AiTask['category'], { label: string; act: JourneyAct; color: string }> = {
  discover: { label: 'Discover', act: 2, color: '#4DD4FF' },
  design:   { label: 'Design',   act: 3, color: '#F59E0B' },
  build:    { label: 'Build',    act: 4, color: '#FF9900' },
  verify:   { label: 'Verify',   act: 5, color: '#A78BFA' },
  operate:  { label: 'Operate',  act: 6, color: '#10B981' },
};
