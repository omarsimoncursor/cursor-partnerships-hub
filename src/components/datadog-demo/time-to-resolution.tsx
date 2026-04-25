'use client';

import { Clock, TrendingDown, UserCheck } from 'lucide-react';

interface Step {
  label: string;
  minutes: number;
  display: string;
}

const HUMAN_FLOW: Step[] = [
  { label: 'PagerDuty page acked',         minutes: 5,  display: '5m' },
  { label: 'Open Datadog, scan trace',     minutes: 10, display: '10m' },
  { label: 'Find regression commit',       minutes: 15, display: '15m' },
  { label: 'Write the fix',                minutes: 10, display: '10m' },
  { label: 'Run tests locally',            minutes: 5,  display: '5m' },
  { label: 'Open the PR',                  minutes: 2,  display: '2m' },
];

const CURSOR_FLOW: Step[] = [
  { label: 'Cursor agent triages, fixes, tests, opens PR', minutes: 2.23, display: '2m 14s' },
  { label: 'Engineer reviews and merges',                  minutes: 5,    display: '5m' },
];

const HUMAN_TOTAL_MIN = HUMAN_FLOW.reduce((s, x) => s + x.minutes, 0);   // 47
const CURSOR_TOTAL_MIN = CURSOR_FLOW.reduce((s, x) => s + x.minutes, 0); // 7.23

const SAVED_MIN = Math.round(HUMAN_TOTAL_MIN - CURSOR_TOTAL_MIN);              // 40
const REDUCTION_PCT = Math.round((1 - CURSOR_TOTAL_MIN / HUMAN_TOTAL_MIN) * 100); // 85

export function TimeToResolution() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-5">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.2em] mb-1">
          Reduction in time to resolution
        </p>
        <h3 className="text-lg md:text-xl font-semibold text-text-primary">
          Same incident. Same fix. The engineer just reviews and merges.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* WITHOUT CURSOR */}
        <FlowColumn
          tone="amber"
          subtitle="Without Cursor"
          subtitleHint="engineer paged at 2:14 a.m."
          totalLabel={`${HUMAN_TOTAL_MIN}m`}
          totalSub="median, engineer-paged"
          steps={HUMAN_FLOW}
          totalMinutes={HUMAN_TOTAL_MIN}
        />

        {/* WITH CURSOR */}
        <FlowColumn
          tone="purple"
          subtitle="With Cursor"
          subtitleHint="agent reacts instantly"
          totalLabel={`~${Math.ceil(CURSOR_TOTAL_MIN)}m`}
          totalSub="agent + human review"
          steps={CURSOR_FLOW}
          totalMinutes={HUMAN_TOTAL_MIN /* normalize bar against the same scale */}
          highlightHumanRow
        />
      </div>

      {/* Footer headline */}
      <div className="mt-4 rounded-xl border border-accent-green/25 bg-accent-green/5 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-green/15 border border-accent-green/30 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-accent-green" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-accent-green leading-none">
              −{REDUCTION_PCT}%
            </p>
            <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mt-1">
              time to resolution, per incident
            </p>
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-sm font-medium text-text-primary">
            About {SAVED_MIN} minutes saved every time an SLO breaks.
          </p>
          <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5 md:justify-end">
            <UserCheck className="w-3.5 h-3.5 text-accent-green" />
            The human reviews the PR. That is it.
          </p>
        </div>
      </div>
    </div>
  );
}

function FlowColumn({
  tone,
  subtitle,
  subtitleHint,
  totalLabel,
  totalSub,
  steps,
  totalMinutes,
  highlightHumanRow,
}: {
  tone: 'amber' | 'purple';
  subtitle: string;
  subtitleHint: string;
  totalLabel: string;
  totalSub: string;
  steps: Step[];
  totalMinutes: number;
  highlightHumanRow?: boolean;
}) {
  const accent = tone === 'purple' ? '#A689D4' : '#F5A623';
  const accentBorder = tone === 'purple' ? 'border-[#632CA6]/30' : 'border-accent-amber/25';
  const accentBg = tone === 'purple' ? 'bg-[#632CA6]/[0.04]' : 'bg-accent-amber/[0.03]';

  return (
    <div className={`rounded-xl border ${accentBorder} ${accentBg} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-dark-border flex items-center justify-between">
        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {subtitle}
          </p>
          <p className="text-[11px] text-text-tertiary mt-0.5">{subtitleHint}</p>
        </div>
        <div className="text-right">
          <p
            className="text-xl font-bold font-mono leading-none"
            style={{ color: accent }}
          >
            {totalLabel}
          </p>
          <p className="text-[10px] text-text-tertiary mt-1">{totalSub}</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="px-5 pt-4">
        <div className="h-2 w-full rounded-full overflow-hidden bg-dark-bg flex">
          {steps.map((s, i) => {
            const pct = (s.minutes / totalMinutes) * 100;
            const isCursor = highlightHumanRow && i === 0;
            const color = isCursor ? '#A689D4' : tone === 'purple' ? '#4ADE80' : '#F5A623';
            return (
              <div
                key={s.label}
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: color,
                  opacity: isCursor ? 1 : 0.85,
                  borderRight: i < steps.length - 1 ? '1px solid rgba(0,0,0,0.35)' : undefined,
                }}
                title={`${s.label} · ${s.display}`}
              />
            );
          })}
        </div>
      </div>

      {/* Steps */}
      <ul className="px-5 py-4 space-y-2 flex-1">
        {steps.map((s, i) => {
          const isCursorAgent = highlightHumanRow && i === 0;
          return (
            <li
              key={s.label}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isCursorAgent
                      ? '#A689D4'
                      : tone === 'purple'
                      ? '#4ADE80'
                      : '#F5A623',
                  }}
                />
                <span className="text-[12.5px] text-text-primary truncate">{s.label}</span>
              </div>
              <span
                className="shrink-0 text-[12px] font-mono"
                style={{
                  color: isCursorAgent
                    ? '#A689D4'
                    : tone === 'purple'
                    ? '#4ADE80'
                    : '#F5A623',
                  fontWeight: isCursorAgent ? 600 : 500,
                }}
              >
                {s.display}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer marker */}
      <div className="px-5 py-2.5 border-t border-dark-border flex items-center gap-2 bg-dark-bg/40">
        <Clock className="w-3 h-3 text-text-tertiary" />
        <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
          {tone === 'purple' ? 'Cursor in the loop' : 'Human-only path'}
        </p>
      </div>
    </div>
  );
}
