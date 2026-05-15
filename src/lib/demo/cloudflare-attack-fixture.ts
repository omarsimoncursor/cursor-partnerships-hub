/**
 * Single source of truth for the Cloudflare credential-stuffing demo.
 *
 * The agent console, the live left-panel dashboard, the world map, and the
 * full-screen attack takeover all read from this fixture so they cannot drift.
 *
 * Time bases
 * - `realMs`: real wall-clock milliseconds within the running phase.
 *   The agent console fires its scripted steps at these offsets.
 * - `displayedSeconds`: how many demo-seconds have elapsed in the story
 *   (the live dashboard's mitigation timeline + clock are in this units).
 *
 * Mitigation effect curves
 * - Each "stage" provides a target req/s, error rate, and bot-score profile.
 *   The dashboard interpolates between stages.
 *
 * Repeatability
 * - No randomness. No real network. Two runs produce identical output.
 */

export type StageId =
  | 'baseline'
  | 'attack-cresting'
  | 'attack-peak'
  | 'waf-log-mode'
  | 'waf-blocking'
  | 'worker-rate-limit'
  | 'recovered';

export interface MitigationStage {
  id: StageId;
  /** Real ms into the running phase when the dashboard should arrive at this stage. */
  realMs: number;
  /** Displayed demo seconds (story-time, scaled). */
  displayedSeconds: number;
  /** Target requests per second on the dashboard. */
  reqPerSec: number;
  /** Target % of new traffic that is bot-scored < 5 (high-bot-likelihood). */
  botPct: number;
  /** Target 4xx error rate (%) on /api/auth/login. */
  errorPct: number;
  /** World-map cluster intensity, 0..1. 0 = green/calm, 1 = red/blazing. */
  threatIntensity: number;
  /** Human-friendly status pill on the dashboard. */
  statusLabel: string;
  /** Tone for the status pill. */
  statusTone: 'normal' | 'attack' | 'mitigating' | 'recovered';
  /** Optional one-line annotation rendered in the dashboard's mitigation timeline. */
  timelineLine?: string;
}

export const ATTACK_STAGES: MitigationStage[] = [
  {
    id: 'baseline',
    realMs: 0,
    displayedSeconds: 0,
    reqPerSec: 12000,
    botPct: 4,
    errorPct: 0.6,
    threatIntensity: 0,
    statusLabel: 'All systems normal',
    statusTone: 'normal',
  },
  {
    id: 'attack-cresting',
    realMs: 1500,
    displayedSeconds: 12,
    reqPerSec: 41000,
    botPct: 52,
    errorPct: 6,
    threatIntensity: 0.55,
    statusLabel: 'Anomaly detected · ASN 14618',
    statusTone: 'attack',
    timelineLine: 'T+0s · Bot Management score collapse on /api/auth/login',
  },
  {
    id: 'attack-peak',
    realMs: 3500,
    displayedSeconds: 28,
    reqPerSec: 84000,
    botPct: 87,
    errorPct: 11.4,
    threatIntensity: 1,
    statusLabel: 'Active attack · credential-stuffing in progress',
    statusTone: 'attack',
    timelineLine: 'T+28s · 4.3M auth attempts in 90s · 0.4% success',
  },
  {
    id: 'waf-log-mode',
    realMs: 8500,
    displayedSeconds: 65,
    reqPerSec: 84000,
    botPct: 87,
    errorPct: 11.4,
    threatIntensity: 0.95,
    statusLabel: 'WAF rule deployed in Log mode · observing',
    statusTone: 'mitigating',
    timelineLine: 'T+45s · Layer 1 WAF rule deployed (Log mode · narrow scope)',
  },
  {
    id: 'waf-blocking',
    realMs: 11000,
    displayedSeconds: 82,
    reqPerSec: 38000,
    botPct: 41,
    errorPct: 6.2,
    threatIntensity: 0.55,
    statusLabel: 'WAF rule promoted to Block · −55% req/s',
    statusTone: 'mitigating',
    timelineLine: 'T+82s · Promoted WAF rule to Block · 0 false positives in 60s window',
  },
  {
    id: 'worker-rate-limit',
    realMs: 15000,
    displayedSeconds: 132,
    reqPerSec: 16500,
    botPct: 12,
    errorPct: 1.4,
    threatIntensity: 0.18,
    statusLabel: 'Worker rate-limit deployed · −80% req/s',
    statusTone: 'mitigating',
    timelineLine: 'T+132s · Layer 2 Worker rate-limit promoted to production · canary green',
  },
  {
    id: 'recovered',
    realMs: 19500,
    displayedSeconds: 168,
    reqPerSec: 12200,
    botPct: 5,
    errorPct: 0.7,
    threatIntensity: 0.05,
    statusLabel: 'Mitigated · monitoring · app-side PR awaiting review',
    statusTone: 'recovered',
    timelineLine: 'T+168s · Layer 3 app-side PR opened (draft · human review required)',
  },
];

/** Pre-attack baseline used by the idle dashboard. */
export const IDLE_STAGE = ATTACK_STAGES[0];

/** Total real-time runtime of the running phase, used by the agent console. */
export const RUNNING_PHASE_REAL_MS =
  ATTACK_STAGES[ATTACK_STAGES.length - 1].realMs + 1500;

/** Displayed total demo time when the run completes (used for "Run complete · 2m 48s"). */
export const RUNNING_PHASE_DISPLAYED_SECONDS =
  ATTACK_STAGES[ATTACK_STAGES.length - 1].displayedSeconds;

/** Time scaling factor between real-time and displayed-time (~ 8.6×). */
export const TIME_SCALE =
  RUNNING_PHASE_DISPLAYED_SECONDS / (RUNNING_PHASE_REAL_MS / 1000);

/**
 * Linear-interpolate the dashboard state at a given real-time offset.
 * Used by the live dashboard to animate every component in lockstep.
 */
export interface InterpolatedState {
  reqPerSec: number;
  botPct: number;
  errorPct: number;
  threatIntensity: number;
  statusLabel: string;
  statusTone: MitigationStage['statusTone'];
  /** Stages whose timeline annotation has unlocked by this point. */
  timelineEntries: { displayedSeconds: number; line: string; tone: MitigationStage['statusTone'] }[];
  /** Currently most-recent fully-reached stage (the "active" mitigation). */
  currentStage: MitigationStage;
  /** Progress through the running phase 0..1. */
  progress: number;
}

export function interpolateAt(realMs: number): InterpolatedState {
  const clamped = Math.max(0, Math.min(realMs, RUNNING_PHASE_REAL_MS));

  let prev = ATTACK_STAGES[0];
  let next = ATTACK_STAGES[ATTACK_STAGES.length - 1];
  for (let i = 0; i < ATTACK_STAGES.length - 1; i++) {
    if (clamped >= ATTACK_STAGES[i].realMs && clamped <= ATTACK_STAGES[i + 1].realMs) {
      prev = ATTACK_STAGES[i];
      next = ATTACK_STAGES[i + 1];
      break;
    }
    if (clamped > ATTACK_STAGES[i + 1].realMs && i === ATTACK_STAGES.length - 2) {
      prev = ATTACK_STAGES[i + 1];
      next = ATTACK_STAGES[i + 1];
    }
  }

  const span = Math.max(1, next.realMs - prev.realMs);
  const t = (clamped - prev.realMs) / span;
  const lerp = (a: number, b: number) => a + (b - a) * t;

  // Use the more "advanced" stage's status label/tone as soon as we cross
  // halfway, so the pill flips meaningfully mid-transition.
  const currentStage = t > 0.55 ? next : prev;

  const timelineEntries = ATTACK_STAGES
    .filter(s => s.timelineLine && clamped >= s.realMs)
    .map(s => ({
      displayedSeconds: s.displayedSeconds,
      line: s.timelineLine!,
      tone: s.statusTone,
    }));

  return {
    reqPerSec: lerp(prev.reqPerSec, next.reqPerSec),
    botPct: lerp(prev.botPct, next.botPct),
    errorPct: lerp(prev.errorPct, next.errorPct),
    threatIntensity: lerp(prev.threatIntensity, next.threatIntensity),
    statusLabel: currentStage.statusLabel,
    statusTone: currentStage.statusTone,
    timelineEntries,
    currentStage,
    progress: clamped / RUNNING_PHASE_REAL_MS,
  };
}

/** Format helper used by every dashboard-style component for consistency. */
export function formatReqPerSec(v: number): string {
  if (v >= 10000) return `${(v / 1000).toFixed(1)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(2)}k`;
  return `${Math.round(v)}`;
}

export function formatDisplayedClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
