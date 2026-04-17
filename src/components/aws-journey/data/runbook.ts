export interface RunbookItem {
  id: string;
  label: string;
  /** The canary percentage at which this item flips to green. 0 means pre-cutover. */
  unlockAt: 0 | 1 | 10 | 50 | 100;
  category: 'pre' | 'canary' | 'post';
}

export const CUTOVER_RUNBOOK: RunbookItem[] = [
  { id: 'pre-parity',    label: 'Pre-cutover: parity-diff report clean (0 drift over 14d)',  unlockAt: 0,   category: 'pre'    },
  { id: 'pre-loadtest',  label: 'Pre-cutover: load test at 12k rps passed',                  unlockAt: 0,   category: 'pre'    },
  { id: 'pre-iam',       label: 'Pre-cutover: IAM baseline (CIS §3.1, §4.2) ✓',              unlockAt: 0,   category: 'pre'    },
  { id: 'pre-rollback',  label: 'Pre-cutover: rollback runbook rehearsed',                   unlockAt: 0,   category: 'pre'    },
  { id: 'canary-1',      label: 'Canary 1%: p99 steady, error rate 0.00%',                   unlockAt: 1,   category: 'canary' },
  { id: 'canary-10',     label: 'Canary 10%: Aurora ACU 1.2, within headroom',               unlockAt: 10,  category: 'canary' },
  { id: 'canary-50',     label: 'Canary 50%: dual-write bridge under 10ms lag',              unlockAt: 50,  category: 'canary' },
  { id: 'canary-100',    label: '100% live: monolith OrdersService decommissioned',          unlockAt: 100, category: 'canary' },
  { id: 'post-dw',       label: 'Dual-write window: closed Day 21, drift 0.003%',            unlockAt: 100, category: 'post'   },
  { id: 'post-hc',       label: 'Hyper-care window: 48h, 0 P1, 0 P2',                        unlockAt: 100, category: 'post'   },
  { id: 'post-cost',     label: 'Cost validation: run-rate $527/mo vs $70k/mo budget',       unlockAt: 100, category: 'post'   },
  { id: 'post-signoff',  label: 'FinOps + SRE sign-off: tracked in Compute Optimizer',       unlockAt: 100, category: 'post'   },
];
