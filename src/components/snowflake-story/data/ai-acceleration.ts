/**
 * Every task Cursor accelerated across the modernization of the first asset
 * (and the portfolio rollout). Powers the per-act `AccelerationTile` and the
 * Act 7 `AccelerationLedger`.
 *
 * Baseline durations are what a typical GSI pod (2–3 senior data engineers,
 * tools from the 2024 era) would book against the same scope. Cursor durations
 * are agent wall-clock from the project.
 */

export type JourneyAct = 2 | 3 | 4 | 5 | 6;

export interface AiTask {
  id: string;
  act: JourneyAct;
  title: string;
  detail: string;
  baselineHours: number;
  cursorHours: number;
  baselineLabel: string;
  cursorLabel: string;
  category: 'discover' | 'design' | 'build' | 'verify' | 'operate';
}

export const AI_TASKS: readonly AiTask[] = [
  // Act 2 — Discover
  {
    id: 'codebase-scan',
    act: 2,
    title: 'Read the legacy ELT repo',
    detail:
      '911 scripts across Teradata BTEQ, T-SQL, Informatica and SSIS · 63,180 LOC · cross-dialect dependency graph.',
    baselineHours: 480, // 6 weeks @ 80h/week pod
    cursorHours: 0.07,
    baselineLabel: '6 months (GSI discovery phase)',
    cursorLabel: '4 minutes',
    category: 'discover',
  },
  {
    id: 'idiom-map',
    act: 2,
    title: 'Map every dialect quirk',
    detail:
      'QUALIFY, MULTISET VOLATILE, COLLECT STATS, MERGE, CROSS APPLY, OPENJSON · paired with Snowflake equivalents.',
    baselineHours: 80,
    cursorHours: 0.5,
    baselineLabel: '2 weeks',
    cursorLabel: '30 min',
    category: 'discover',
  },
  {
    id: 'starting-asset',
    act: 2,
    title: 'Recommend a starting asset',
    detail:
      'Ranked all 911 by staleness × business criticality. Picked daily_revenue_rollup with rationale.',
    baselineHours: 24,
    cursorHours: 0.25,
    baselineLabel: '3 days',
    cursorLabel: '15 min',
    category: 'discover',
  },

  // Act 3 — Design
  {
    id: 'plan-draft',
    act: 3,
    title: 'Draft the modernization plan',
    detail:
      'Staging CTE → fct grain · 14 dbt tests · Cortex semantic diff + 1% row-equivalence harness.',
    baselineHours: 40, // 5 × 8h whiteboard sessions
    cursorHours: 0.25,
    baselineLabel: '1 week',
    cursorLabel: '14 min',
    category: 'design',
  },
  {
    id: 'plan-override',
    act: 3,
    title: 'Absorb the rounding override',
    detail:
      'Banker&rsquo;s rounding macro + transient staging table swapped in. 1% sample re-verified.',
    baselineHours: 16,
    cursorHours: 0.1,
    baselineLabel: '2 days',
    cursorLabel: '6 min',
    category: 'design',
  },

  // Act 4 — Build
  {
    id: 'translate-bteq',
    act: 4,
    title: 'Rewrite BTEQ → dbt',
    detail:
      'daily_revenue_rollup.bteq (214 LOC) → fct_daily_revenue.sql (132 LOC) · transient staging · QUALIFY native.',
    baselineHours: 80, // 2 weeks of senior data eng
    cursorHours: 0.6,
    baselineLabel: '2 weeks',
    cursorLabel: '37 min',
    category: 'build',
  },
  {
    id: 'tests-generated',
    act: 4,
    title: 'Generate the test suite',
    detail:
      '14 dbt tests on grain, FX, top-100 rank, plus an exceptions audit table for deprecated currencies.',
    baselineHours: 40,
    cursorHours: 0.35,
    baselineLabel: '1 week',
    cursorLabel: '21 min',
    category: 'build',
  },
  {
    id: 'window-fix',
    act: 4,
    title: 'Absorb the QUALIFY tie-break fix',
    detail:
      'Reviewer flagged customer_id tie-break. Adjusted ORDER BY, re-ran the 1% sample. Drift = 0.',
    baselineHours: 8,
    cursorHours: 0.1,
    baselineLabel: '1 day',
    cursorLabel: '6 min',
    category: 'build',
  },

  // Act 5 — Verify
  {
    id: 'cortex-verify',
    act: 5,
    title: 'Verify equivalence on a 1% sample',
    detail:
      'Row-level diff + Snowflake Cortex semantic diff. Catches the deprecated XOF FX rate the BTEQ was silently dropping.',
    baselineHours: 24,
    cursorHours: 0.4,
    baselineLabel: '3 days',
    cursorLabel: '24 min',
    category: 'verify',
  },
  {
    id: 'finops-brief',
    act: 5,
    title: 'Compile the FinOps brief',
    detail:
      'Per-warehouse credit forecast, kill-switch thresholds, $5.9M/yr steady-state TCO swing.',
    baselineHours: 16,
    cursorHours: 0.15,
    baselineLabel: '2 days',
    cursorLabel: '9 min',
    category: 'verify',
  },

  // Act 6 — Operate
  {
    id: 'runbook',
    act: 6,
    title: 'Write the cutover runbook',
    detail:
      '12-step canary checklist · parity-diff threshold · CloudWatch + Snowsight alerting wired in.',
    baselineHours: 32,
    cursorHours: 0.5,
    baselineLabel: '4 days',
    cursorLabel: '30 min',
    category: 'operate',
  },
  {
    id: 'canary-orchestration',
    act: 6,
    title: 'Orchestrate the canary 0→100%',
    detail:
      'Step-function-driven 0 → 1 → 10 → 50 → 100% traffic shift across the legacy reader and the new mart.',
    baselineHours: 40,
    cursorHours: 0.4,
    baselineLabel: '5 days',
    cursorLabel: '25 min',
    category: 'operate',
  },
  {
    id: 'live-watch',
    act: 6,
    title: 'Live SLO watchdog',
    detail:
      'Tailed the parity diff through all four canary steps. No threshold breaches. Paged nobody.',
    baselineHours: 16,
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

export const CATEGORY_META: Record<
  AiTask['category'],
  { label: string; act: JourneyAct; color: string }
> = {
  discover: { label: 'Discover', act: 2, color: '#7DD3F5' },
  design: { label: 'Design', act: 3, color: '#F59E0B' },
  build: { label: 'Build', act: 4, color: '#29B5E8' },
  verify: { label: 'Verify', act: 5, color: '#A78BFA' },
  operate: { label: 'Operate', act: 6, color: '#10B981' },
};
