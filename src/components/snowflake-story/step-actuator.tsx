'use client';

import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Loader2, MousePointerClick } from 'lucide-react';

export type ActuatorStatus = 'idle' | 'running' | 'done';

interface StepActuatorProps {
  /**
   * The current state of the step:
   *  - `idle` → button is the focal point, nudges the viewer to click.
   *  - `running` → spinner + a subtle "what Cursor is doing right now" note.
   *  - `done` → green check + a Continue button (when `onContinue` is passed).
   */
  status: ActuatorStatus;
  /**
   * Label shown on the idle button — e.g. "Send Cursor in to read the repo".
   * Optional because some `done`-only actuators are pure result/continue rows.
   */
  runLabel?: string;
  /** Optional sub-label rendered under the run button to set expectations. */
  runSub?: string;
  /** Plain-English description of what Cursor is doing while running. */
  runningLabel?: string;
  /** Plain-English label shown when the step is done. */
  doneLabel?: string;
  /** Continue label — when present, a secondary button appears once done. */
  continueLabel?: string;
  /** Per-act accent. */
  accent?: string;
  /** Light or dark surface tint. */
  tone?: 'dark' | 'light';
  /** Click handler for the run button (only fires when `status === 'idle'`). */
  onRun?: () => void;
  /** Click handler for the continue button (only fires when `status === 'done'`). */
  onContinue?: () => void;
  /** Optional extra content rendered to the right of the button row. */
  trailing?: ReactNode;
}

/**
 * Big actuator row that turns each step into "click → see what Cursor does →
 * read the result". The whole point is to make the viewer pull the lever, so
 * the idle state has an animated nudge chip and a glowing button.
 */
export function StepActuator({
  status,
  runLabel,
  runSub,
  runningLabel,
  doneLabel,
  continueLabel,
  accent = '#29B5E8',
  tone = 'dark',
  onRun,
  onContinue,
  trailing,
}: StepActuatorProps) {
  const isDark = tone === 'dark';

  if (status === 'idle') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRun}
          className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13.5px] font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer"
          style={{
            background: accent,
            color: isDark ? '#0A1419' : '#0F172A',
            boxShadow: `0 0 36px ${accent}55`,
          }}
        >
          <MousePointerClick className="h-4 w-4" />
          {runLabel ?? 'Run Cursor'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        {runSub && (
          <span
            className="text-[11.5px]"
            style={{ color: isDark ? 'rgba(245,245,247,0.55)' : 'rgba(15,23,42,0.55)' }}
          >
            {runSub}
          </span>
        )}
        {trailing}
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold"
          style={{
            background: `${accent}12`,
            borderColor: `${accent}55`,
            color: accent,
          }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {runningLabel ?? 'Cursor is working…'}
        </div>
        {trailing}
      </div>
    );
  }

  // done
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold"
        style={{
          background: 'rgba(74,222,128,0.12)',
          borderColor: 'rgba(74,222,128,0.45)',
          color: '#4ADE80',
        }}
      >
        <CheckCircle2 className="h-4 w-4" />
        {doneLabel ?? 'Done'}
      </div>
      {continueLabel && onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors cursor-pointer"
          style={{
            borderColor: `${accent}55`,
            color: isDark ? '#F5F5F7' : '#0F172A',
            background: `${accent}10`,
          }}
        >
          {continueLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
      {trailing}
    </div>
  );
}
