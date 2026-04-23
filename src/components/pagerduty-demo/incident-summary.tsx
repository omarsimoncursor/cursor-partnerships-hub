'use client';

import { useEffect, useRef } from 'react';
import { AlertOctagon, ExternalLink, Phone, RotateCcw } from 'lucide-react';
import type { PdEvent } from './agent-console';

export interface TimelineEntry extends PdEvent {
  /** order in which we received it */
  seq: number;
}

interface IncidentSummaryProps {
  entries: TimelineEntry[];
  /** Whether the incident is closed (controls header tone) */
  resolved: boolean;
  onReset: () => void;
  onViewIncident: () => void;
}

const TONE_BY_KIND: Record<
  PdEvent['kind'],
  { dot: string; pill: string; pillText: string }
> = {
  triggered: { dot: 'bg-[#DC3545]', pill: 'bg-[#DC3545]/15 border-[#DC3545]/35', pillText: 'text-[#FF6373]' },
  ack:       { dot: 'bg-[#F5A623]', pill: 'bg-[#F5A623]/10 border-[#F5A623]/30', pillText: 'text-[#F5A623]' },
  note:      { dot: 'bg-text-tertiary', pill: 'bg-dark-bg border-dark-border', pillText: 'text-text-secondary' },
  resolved:  { dot: 'bg-[#57D990]', pill: 'bg-[#06AC38]/15 border-[#06AC38]/35', pillText: 'text-[#57D990]' },
};

const LABEL_BY_KIND: Record<PdEvent['kind'], string> = {
  triggered: 'Triggered',
  ack: 'Acknowledged',
  note: 'Note',
  resolved: 'Resolved',
};

const SEED_TRIGGER: TimelineEntry = {
  seq: -1,
  kind: 'triggered',
  title: 'TRIGGERED · Datadog monitor #42971',
  detail: '5xx error rate 7.4% > 5% for 3 min',
  displayTime: '03:14:22',
};

export function IncidentSummary({
  entries,
  resolved,
  onReset,
  onViewIncident,
}: IncidentSummaryProps) {
  const allEntries = [SEED_TRIGGER, ...entries];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allEntries.length]);

  const headerTone = resolved
    ? { border: 'border-[#06AC38]/30', bg: 'bg-[#06AC38]/5', text: 'text-[#57D990]', dot: 'bg-[#57D990]' }
    : { border: 'border-[#DC3545]/30', bg: 'bg-[#DC3545]/5', text: 'text-[#FF6373]', dot: 'bg-[#DC3545] animate-pulse' };

  return (
    <div className={`w-full h-full rounded-xl border ${headerTone.border} bg-dark-surface overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${headerTone.border} ${headerTone.bg} shrink-0`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${headerTone.bg} border ${headerTone.border}`}>
            {resolved ? (
              <Phone className={`w-3.5 h-3.5 ${headerTone.text}`} />
            ) : (
              <AlertOctagon className={`w-3.5 h-3.5 ${headerTone.text}`} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium leading-none mb-0.5 ${headerTone.text}`}>
              {resolved ? 'INC-21487 · Resolved' : 'INC-21487 · Triggered'}
            </p>
            <p className="text-[11px] text-text-tertiary font-mono truncate">
              pagerduty · payments-api · P1 · auto-pilot
            </p>
          </div>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${headerTone.dot}`} />
        </div>
      </div>

      {/* Body — live timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          Live incident timeline
        </p>

        <ol className="relative border-l border-dark-border ml-1.5 space-y-3">
          {allEntries.map((entry, i) => {
            const tone = TONE_BY_KIND[entry.kind];
            return (
              <li
                key={entry.seq}
                className="ml-3"
                style={{ animation: i > 0 ? 'pdTimelineFade 0.35s ease-out' : undefined }}
              >
                <span
                  className={`absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-dark-surface ${tone.dot}`}
                />
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase tracking-wider border ${tone.pill} ${tone.pillText}`}
                  >
                    {LABEL_BY_KIND[entry.kind]}
                  </span>
                  <span className="text-[10.5px] text-text-tertiary font-mono ml-auto">
                    {entry.displayTime} PT
                  </span>
                </div>
                <p className="text-[12px] text-text-primary leading-snug break-words">
                  {entry.title}
                </p>
                {entry.detail && (
                  <p className="text-[11px] text-text-tertiary mt-0.5 leading-snug break-words">
                    {entry.detail}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {/* Footer summary, only when resolved */}
        {resolved && (
          <div className="mt-5 pt-4 border-t border-dark-border">
            <div className="rounded-lg bg-[#06AC38]/8 border border-[#06AC38]/25 px-3 py-2.5 text-center">
              <p className="text-[10px] font-mono text-[#57D990] uppercase tracking-wider mb-1">
                Incident closed
              </p>
              <p className="text-[12px] text-text-primary font-medium">
                0 humans paged · 1 revert PR · 1 Statuspage update
              </p>
              <p className="text-[10.5px] text-text-tertiary font-mono mt-0.5">
                MTTA 12s · MTTR 4m 12s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewIncident}
          className="w-full py-2 px-3 rounded-lg bg-[#06AC38] text-white font-medium text-sm hover:bg-[#08C443] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in PagerDuty
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-3 rounded-lg border border-dark-border text-text-secondary font-medium text-sm hover:bg-dark-surface-hover hover:text-text-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset demo
        </button>
      </div>

      <style jsx>{`
        @keyframes pdTimelineFade {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
