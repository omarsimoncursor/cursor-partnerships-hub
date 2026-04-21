/**
 * Story-wide constants for the Snowflake modernization journey. The shape
 * mirrors the AWS journey&rsquo;s `script.ts` so per-act components have the same
 * vocabulary (timing constants, day formatting, headline numbers).
 */

export const JOURNEY_CONSTANTS = {
  /** When the legacy Teradata Enterprise Edition contract is up for renewal. */
  teradataContractEnd: new Date('2027-06-30T23:59:59Z'),
  /** Day 1 of the journey — the morning Cursor is sent into the repo. */
  journeyStart: new Date('2026-11-06T00:00:00Z'),
  /** Total credits Cursor pulls forward versus the GSI baseline. */
  pulledForwardCreditsTarget: 16_000_000,
  /** Annual TCO swing once Teradata is decommissioned. */
  runCostSwingTarget: 5_900_000,
  projectedFinishLabel: 'Feb 6, 2028',
  projectedFinishMonthsAhead: 4,
  gsiFinishLabel: 'Oct 2030',
  gsiMonthsLate: 28,
} as const;

export const ACT_TIMING = {
  transitionMs: 500,
  /** Act 2 — how long Cursor's repo scan takes to play out. */
  act2ScanDurationMs: 6500,
  /** Act 3 — when the reviewer override card slides in. */
  act3OverrideDelayMs: 1400,
  act3AiReplyDelayMs: 2400,
  /** Act 4 — translation playback. */
  act4TerminalStartMs: 7000,
  act4PatchCommentsMs: 11_000,
  act4ReviewerApprovalMs: 14_500,
  /** Act 5 — verification. */
  act5VerifyDurationMs: 6000,
  act5FinopsApprovalMs: 8500,
  /** Act 6 — cutover canary cadence. */
  act6KimBeforeMs: 700,
  act6KimAfterMs: 11_500,
} as const;

export function dayToDate(day: number): Date {
  const start = new Date(JOURNEY_CONSTANTS.journeyStart);
  start.setUTCDate(start.getUTCDate() + (day - 1));
  return start;
}

export function formatDay(day: number): string {
  const d = dayToDate(day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
