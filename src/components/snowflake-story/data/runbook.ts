/**
 * The cutover runbook Cursor authors overnight and the data-reliability lead
 * approves before the first canary step. Used by Act 6.
 */
export interface RunbookItem {
  id: string;
  label: string;
  /** Which canary step unlocks this item (the percentage). */
  unlockAt: 0 | 1 | 10 | 50 | 100;
}

export const CUTOVER_RUNBOOK: RunbookItem[] = [
  { id: 'snapshot', label: 'Snapshot the legacy mart (point-in-time)', unlockAt: 0 },
  { id: 'parity-baseline', label: 'Run baseline parity diff (legacy ⇄ new)', unlockAt: 0 },
  { id: 'feature-flag', label: 'Feature-flag readers behind canary percentage', unlockAt: 0 },
  { id: 'canary-1', label: '1% of read traffic on the new mart', unlockAt: 1 },
  { id: 'parity-1', label: 'Verify p99 + parity at 1%', unlockAt: 1 },
  { id: 'canary-10', label: '10% of read traffic on the new mart', unlockAt: 10 },
  { id: 'cortex-watch', label: 'Cortex live-watch on top-100 rank drift', unlockAt: 10 },
  { id: 'canary-50', label: '50% of read traffic on the new mart', unlockAt: 50 },
  { id: 'parity-50', label: 'Verify finance-grade reconciliation at 50%', unlockAt: 50 },
  { id: 'canary-100', label: 'Cut all read traffic to the new mart', unlockAt: 100 },
  { id: 'cold-legacy', label: 'Mark legacy reader path cold', unlockAt: 100 },
  { id: 'hypercare', label: 'Open 48h hyper-care window', unlockAt: 100 },
];
