'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import type { RuntimeStep, SdkEventType } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';

interface SdkEventStreamProps {
  steps: RuntimeStep[];
  script: ResolvedScript;
  finished: boolean;
}

const EVENT_STYLE: Record<SdkEventType, string> = {
  'agent.create':   'text-accent-blue',
  'agent.send':     'text-accent-blue',
  'status.change':  'text-accent-amber',
  'tool.call':      'text-[#A689D4]',
  'tool.result':    'text-accent-green',
  'step.complete':  'text-text-primary',
  'assistant':      'text-[#D97757]',
  'agent.wait':     'text-accent-green',
};

function formatTime(ms: number): string {
  const total = ms / 1000;
  const mins = Math.floor(total / 60);
  const s = Math.floor(total) % 60;
  const millis = Math.floor(ms) % 1000;
  if (mins > 0) {
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function SdkEventStream({ steps, script, finished }: SdkEventStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps.length]);

  let cumulative = 0;
  const events: Array<{ time: number; step: RuntimeStep }> = [];
  for (const step of script.steps.slice(0, steps.length)) {
    cumulative += step.delayMs;
    events.push({ time: cumulative, step });
  }

  const totalEvents = events.filter((e) => e.step.sdkEvent).length;
  const billed = (cumulative * 2.6) / 1000;

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">
              SDK Run Events
            </p>
            <p className="text-[10px] text-text-tertiary leading-snug">
              The structured stream your code receives from <span className="font-mono text-accent-blue">run.stream()</span>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse',
            )}
          />
          <span className="text-[11px] text-text-tertiary font-mono">
            {totalEvents} events
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[280px]">
        {events.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2 text-[11px] font-mono">
            agent.send() pending…
          </p>
        )}
        {events.map(({ time, step }, i) => {
          const ev = step.sdkEvent;
          if (!ev) return null;
          const style = EVENT_STYLE[ev.type] ?? 'text-text-secondary';
          return (
            <div
              key={i}
              className="flex items-start gap-2 leading-snug font-mono text-[11px]"
              style={{ animation: 'sdkFadeIn 0.18s ease-out' }}
            >
              <span className="text-text-tertiary/60 shrink-0 w-[60px]">
                {formatTime(time)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={cn('shrink-0 font-semibold truncate max-w-[120px]', style)}>
                    {ev.type}
                  </span>
                  <span className="text-text-secondary truncate flex-1 min-w-0">
                    {ev.payload}
                  </span>
                </div>
                {step.plainEnglish && (
                  <p className="font-sans text-[10.5px] text-text-tertiary leading-snug mt-0.5 pl-0.5">
                    {step.plainEnglish}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes sdkFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
