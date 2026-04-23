'use client';

import { Bot, Clock, PhoneOff, User2 } from 'lucide-react';

interface TimelineStep {
  time: string;
  label: string;
  detail?: string;
  tone: 'human' | 'agent' | 'critical' | 'resolved';
}

const WITHOUT_CURSOR: TimelineStep[] = [
  { time: '03:14', label: 'Datadog monitor fires', tone: 'critical' },
  { time: '03:16', label: 'PagerDuty calls Alex', detail: 'phone rings · house wakes up', tone: 'human' },
  { time: '03:19', label: 'Alex acks (groggy)', detail: '5 min mean ack delay overnight', tone: 'human' },
  { time: '03:24', label: 'Finds laptop, joins bridge', tone: 'human' },
  { time: '03:31', label: 'Reads runbook', detail: 'opens Datadog · PD · Slack tabs', tone: 'human' },
  { time: '03:42', label: 'Identifies suspect commit', detail: 'manually scans git log', tone: 'human' },
  { time: '03:51', label: 'Manually reverts', tone: 'human' },
  { time: '04:01', label: 'Redeploys, validates', tone: 'human' },
  { time: '04:01', label: 'INC-21487 RESOLVED', detail: '47m total · 2 humans woken', tone: 'resolved' },
];

const WITH_CURSOR: TimelineStep[] = [
  { time: '03:14', label: 'Datadog monitor fires', tone: 'critical' },
  { time: '03:14', label: 'Cursor agent ack\u2019s', detail: '12s after trigger · phone never rings', tone: 'agent' },
  { time: '03:14', label: 'Triages via Datadog APM', detail: 'pulls trace + commit history in parallel', tone: 'agent' },
  { time: '03:15', label: 'Decision: revert (0.93 conf)', detail: 'cites schema-migration risk', tone: 'agent' },
  { time: '03:16', label: 'Revert PR #318 opened', tone: 'agent' },
  { time: '03:17', label: 'Canary green, promoting', tone: 'agent' },
  { time: '03:18', label: 'Statuspage + Slack updated', tone: 'agent' },
  { time: '03:18', label: 'INC-21487 RESOLVED', detail: '4m 12s · 0 humans paged', tone: 'resolved' },
];

const TONE_STYLES: Record<TimelineStep['tone'], { dot: string; border: string; text: string }> = {
  human: { dot: 'bg-[#F5A623]', border: 'border-[#F5A623]/30', text: 'text-[#F5A623]' },
  critical: { dot: 'bg-[#DC3545]', border: 'border-[#DC3545]/30', text: 'text-[#FF6373]' },
  agent: { dot: 'bg-[#57D990]', border: 'border-[#06AC38]/30', text: 'text-[#57D990]' },
  resolved: { dot: 'bg-text-primary', border: 'border-dark-border', text: 'text-text-primary' },
};

export function CounterfactualCard() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <div className="rounded-2xl border border-dark-border bg-dark-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#06AC38]/10 border border-[#06AC38]/25 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-[#57D990]" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              What would have happened without Cursor
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              Same incident · two timelines, same vertical axis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-dark-border">
          {/* Without */}
          <CounterfactualColumn
            title="Without Cursor"
            subtitle="Manual on-call response"
            icon={<User2 className="w-3.5 h-3.5 text-[#F5A623]" />}
            footer={{ total: '47m', humans: '2 humans woken', tone: 'amber' }}
            steps={WITHOUT_CURSOR}
          />

          {/* With */}
          <CounterfactualColumn
            title="With Cursor"
            subtitle="Agent auto-resolve"
            icon={<Bot className="w-3.5 h-3.5 text-[#57D990]" />}
            footer={{ total: '4m 12s', humans: '0 humans paged', tone: 'green' }}
            steps={WITH_CURSOR}
            highlight
          />
        </div>

        {/* Cost lever footer */}
        <div className="px-6 py-4 border-t border-dark-border bg-dark-bg">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-text-tertiary">
              <PhoneOff className="w-3.5 h-3.5 text-[#57D990]" />
              <span className="text-[11.5px] font-mono">
                Per-page cost lever · illustrative figures
              </span>
            </div>
            <p className="text-[12.5px] text-text-secondary font-mono">
              <span className="text-[#F5A623]">47m</span> ×{' '}
              <span className="text-text-primary">$240/hr loaded engineer</span> ×{' '}
              <span className="text-text-primary">120 P1 pages/yr</span> ={' '}
              <span className="text-[#57D990] font-semibold">$22,560 reclaimed/yr</span>{' '}
              <span className="text-text-tertiary">— before counting incident blast radius.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CounterfactualColumn({
  title,
  subtitle,
  icon,
  steps,
  footer,
  highlight,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  steps: TimelineStep[];
  footer: { total: string; humans: string; tone: 'amber' | 'green' };
  highlight?: boolean;
}) {
  const footerColor = footer.tone === 'green' ? 'text-[#57D990]' : 'text-[#F5A623]';
  return (
    <div className={`p-5 ${highlight ? 'bg-[#06AC38]/[0.03]' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md bg-dark-bg border border-dark-border flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-none mb-0.5">
            {title}
          </p>
          <p className="text-[11px] text-text-tertiary font-mono">{subtitle}</p>
        </div>
      </div>

      <ol className="relative border-l border-dark-border ml-1.5 space-y-2.5 pb-3">
        {steps.map((s, i) => {
          const tone = TONE_STYLES[s.tone];
          return (
            <li key={i} className="ml-3">
              <span
                className={`absolute -left-[5px] mt-1.5 w-2 h-2 rounded-full ring-2 ring-dark-surface ${tone.dot}`}
              />
              <div className="flex items-baseline gap-2">
                <span className="text-[10.5px] text-text-tertiary font-mono shrink-0 w-9">
                  {s.time}
                </span>
                <span className={`text-[12.5px] ${tone.text} font-medium`}>{s.label}</span>
              </div>
              {s.detail && (
                <p className="text-[10.5px] text-text-tertiary font-mono ml-11 mt-0.5">
                  {s.detail}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">
              Total
            </p>
            <p className={`text-lg font-bold font-mono ${footerColor}`}>{footer.total}</p>
          </div>
          <p className={`text-[11.5px] font-mono ${footerColor}`}>{footer.humans}</p>
        </div>
      </div>
    </div>
  );
}
