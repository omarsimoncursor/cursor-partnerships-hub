'use client';

import { getEventsForTool } from '@/lib/sdk-demo/catalog/events';
import { getTool } from '@/lib/sdk-demo/catalog/tools';
import type { ToolId } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';

interface EventPickerProps {
  toolId: ToolId | null;
  selectedEventId: string | null;
  onSelect: (id: string) => void;
}

const SEVERITY_STYLE: Record<string, string> = {
  P0: 'text-accent-red bg-accent-red/10 border-accent-red/30',
  P1: 'text-accent-amber bg-accent-amber/10 border-accent-amber/30',
  P2: 'text-accent-blue bg-accent-blue/10 border-accent-blue/30',
  INFO: 'text-text-tertiary bg-text-tertiary/10 border-text-tertiary/30',
};

export function EventPicker({ toolId, selectedEventId, onSelect }: EventPickerProps) {
  const tool = getTool(toolId);
  const events = getEventsForTool(toolId);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-tertiary">
            Step 2
          </span>
          <h3 className="text-sm font-semibold text-text-primary">Pick an event</h3>
        </div>
        {tool && (
          <span className="text-[11px] text-text-tertiary font-mono">
            {events.length} events from {tool.name}
          </span>
        )}
      </div>

      {!toolId && (
        <p className="text-xs text-text-tertiary italic px-3 py-6 bg-dark-surface rounded-lg border border-dashed border-dark-border">
          Pick a tool above to see the events it can fire.
        </p>
      )}

      {toolId && (
        <div className="space-y-1.5">
          {events.map((event) => {
            const isSelected = selectedEventId === event.id;
            return (
              <button
                key={event.id}
                onClick={() => onSelect(event.id)}
                className={cn(
                  'w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-150 cursor-pointer flex items-start gap-3',
                  isSelected
                    ? 'border-accent-blue/50 bg-accent-blue/10'
                    : 'border-dark-border bg-dark-surface hover:border-dark-border-hover hover:bg-dark-surface-hover',
                )}
              >
                <span
                  className={cn(
                    'shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border',
                    SEVERITY_STYLE[event.severity],
                  )}
                >
                  {event.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-text-primary truncate">{event.name}</p>
                  <p className="text-[11px] text-text-tertiary leading-snug mt-0.5">
                    {event.description}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-mono text-text-tertiary self-start mt-0.5 hidden md:inline">
                  {event.payloadType}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
