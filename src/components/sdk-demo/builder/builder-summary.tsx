'use client';

import { Play, RotateCcw } from 'lucide-react';
import { getEvent } from '@/lib/sdk-demo/catalog/events';
import { getTool } from '@/lib/sdk-demo/catalog/tools';
import type { Workflow } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';

interface BuilderSummaryProps {
  workflow: Workflow;
  onRun: () => void;
  onReset: () => void;
}

export function BuilderSummary({ workflow, onRun, onReset }: BuilderSummaryProps) {
  const tool = getTool(workflow.toolId);
  const event = getEvent(workflow.eventId);
  const isValid = !!tool && !!event && workflow.actionIds.length > 0;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
          <SummaryStat label="Tool" value={tool?.name ?? '—'} />
          <Divider />
          <SummaryStat label="Event" value={event?.name ?? '—'} mono />
          <Divider />
          <SummaryStat label="Actions" value={String(workflow.actionIds.length)} />
          <Divider />
          <SummaryStat label="MCPs" value={String(workflow.mcpIds.length)} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={onRun}
            disabled={!isValid}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
              isValid
                ? 'bg-accent-blue text-dark-bg hover:bg-accent-blue/90 cursor-pointer shadow-[0_0_0_1px_rgba(96,165,250,0.4),0_8px_24px_rgba(96,165,250,0.25)]'
                : 'bg-dark-surface-hover text-text-tertiary cursor-not-allowed border border-dark-border',
            )}
          >
            <Play className="w-3.5 h-3.5" />
            Run automation
          </button>
        </div>
      </div>

      {!isValid && (
        <p className="text-[11px] text-text-tertiary mt-2">
          Pick a tool, an event, and at least one action to enable Run.
        </p>
      )}
    </div>
  );
}

function SummaryStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-mono">
        {label}
      </span>
      <span className={cn('text-text-primary', mono && 'font-mono text-[12px]')}>{value}</span>
    </div>
  );
}

function Divider() {
  return <span className="hidden md:inline text-text-tertiary/30">·</span>;
}
