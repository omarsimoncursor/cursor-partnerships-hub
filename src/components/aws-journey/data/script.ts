export const JOURNEY_CONSTANTS = {
  oracleContractEnd: new Date('2027-12-31T23:59:59Z'),
  journeyStart: new Date('2026-10-17T00:00:00Z'), // Day 1
  pulledForwardArrTarget: 11_000_000,
  runCostSwingTarget: 6_300_000,
  projectedFinishLabel: 'Feb 15, 2028',
  projectedFinishMonthsAhead: 10,
  gsiFinishLabel: 'May 2030',
  gsiMonthsLate: 30,
} as const;

export const ACT_TIMING = {
  transitionMs: 500,
  act3OverrideDelayMs: 1200,
  act3AiReplyDelayMs: 2000,
  act4CdkStartDelayMs: 300,
  act4TerminalStartMs: 7000,
  act4CodexCommentsMs: 11_000,
  act4ChenApprovalMs: 14_500,
  act5ColdStartSpikeMs: 6000,
  act5DavisApprovalMs: 8500,
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
