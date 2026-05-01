'use client';

import { useMemo, useState } from 'react';
import type { ActionId, McpId, ToolId, Workflow } from '@/lib/sdk-demo/types';
import { getAction, sortActionsByPhase } from '@/lib/sdk-demo/catalog/actions';
import { CURATED_WORKFLOWS } from '@/lib/sdk-demo/catalog/workflows';
import { getEventsForTool } from '@/lib/sdk-demo/catalog/events';
import { computeEffectiveMcps } from '@/lib/sdk-demo/catalog/mcps';
import { ToolPalette } from './tool-palette';
import { EventPicker } from './event-picker';
import { ActionPicker } from './action-picker';
import { ActionList } from './action-list';
import { McpPicker } from './mcp-picker';
import { SdkCodePanel } from './sdk-code-panel';
import { BuilderSummary } from './builder-summary';
import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowBuilderProps {
  workflow: Workflow;
  onChange: (next: Workflow) => void;
  onRun: () => void;
}

export function WorkflowBuilder({ workflow, onChange, onRun }: WorkflowBuilderProps) {
  const [activeStarter, setActiveStarter] = useState<string | null>(null);

  function deriveMcpsFromActions(actions: ActionId[]): McpId[] {
    const set = new Set<McpId>();
    for (const id of actions) {
      const a = getAction(id);
      if (!a) continue;
      for (const m of a.mcpsRequired) set.add(m);
    }
    return Array.from(set);
  }

  function recomputeMcpIds(next: Omit<Workflow, 'mcpIds'>): McpId[] {
    return computeEffectiveMcps(
      deriveMcpsFromActions(next.actionIds),
      next.pinnedMcpIds,
      next.excludedMcpIds,
    );
  }

  function emit(next: Omit<Workflow, 'mcpIds'>) {
    onChange({ ...next, mcpIds: recomputeMcpIds(next) });
  }

  function setTool(id: ToolId) {
    const events = getEventsForTool(id);
    const sameTool = workflow.toolId === id;
    emit({
      toolId: id,
      eventId: sameTool ? workflow.eventId : events.length > 0 ? events[0].id : null,
      actionIds: sameTool ? workflow.actionIds : [],
      pinnedMcpIds: sameTool ? workflow.pinnedMcpIds : [],
      excludedMcpIds: sameTool ? workflow.excludedMcpIds : [],
    });
    setActiveStarter(null);
  }

  function setEvent(id: string) {
    emit({ ...workflow, eventId: id });
    setActiveStarter(null);
  }

  function toggleAction(id: ActionId) {
    const current = new Set(workflow.actionIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    const nextActions = sortActionsByPhase(Array.from(current));
    emit({ ...workflow, actionIds: nextActions });
    setActiveStarter(null);
  }

  function removeAction(id: ActionId) {
    const next = workflow.actionIds.filter((a) => a !== id);
    emit({ ...workflow, actionIds: next });
    setActiveStarter(null);
  }

  function toggleMcp(id: McpId) {
    const isOn = workflow.mcpIds.includes(id);
    const actionDerived = new Set(deriveMcpsFromActions(workflow.actionIds));
    const pinned = new Set(workflow.pinnedMcpIds);
    const excluded = new Set(workflow.excludedMcpIds);

    if (isOn) {
      // Turn it off. Unpin if pinned; if the action derives it, add to excluded.
      pinned.delete(id);
      if (actionDerived.has(id)) {
        excluded.add(id);
      }
    } else {
      // Turn it on. Un-exclude it; if no action derives it, pin it.
      excluded.delete(id);
      if (!actionDerived.has(id)) {
        pinned.add(id);
      }
    }

    emit({
      ...workflow,
      pinnedMcpIds: Array.from(pinned),
      excludedMcpIds: Array.from(excluded),
    });
  }

  function applyStarter(id: string) {
    const starter = CURATED_WORKFLOWS.find((c) => c.id === id);
    if (!starter) return;
    emit({
      toolId: starter.workflow.toolId,
      eventId: starter.workflow.eventId,
      actionIds: starter.workflow.actionIds,
      pinnedMcpIds: starter.workflow.pinnedMcpIds ?? [],
      excludedMcpIds: starter.workflow.excludedMcpIds ?? [],
    });
    setActiveStarter(id);
  }

  function clear() {
    emit({
      toolId: null,
      eventId: null,
      actionIds: [],
      pinnedMcpIds: [],
      excludedMcpIds: [],
    });
    setActiveStarter(null);
  }

  const eventEnabled = !!workflow.toolId;
  const actionEnabled = !!workflow.toolId && !!workflow.eventId;

  const derivedMcps = useMemo<McpId[]>(
    () => deriveMcpsFromActions(workflow.actionIds),
    [workflow.actionIds],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <Sparkles className="w-4 h-4 text-accent-amber" />
          <span className="text-[13px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
            Starter workflows
          </span>
          <span className="text-[12px] text-text-tertiary">
            (one click loads a curated workflow you can edit)
          </span>
        </div>

        {(() => {
          const active = CURATED_WORKFLOWS.find((c) => c.id === activeStarter);
          return (
            <div
              className={cn(
                'grid gap-4',
                active ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : 'grid-cols-1',
              )}
            >
              <div className="flex flex-wrap gap-2 self-start">
                {CURATED_WORKFLOWS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => applyStarter(c.id)}
                    className={cn(
                      'text-left text-[13px] font-medium px-3 py-2 rounded-md border transition-all duration-150 cursor-pointer max-w-sm',
                      activeStarter === c.id
                        ? 'border-accent-amber/60 bg-accent-amber/10 text-text-primary'
                        : 'border-dark-border bg-dark-bg hover:border-dark-border-hover hover:bg-dark-surface-hover text-text-secondary hover:text-text-primary',
                    )}
                    title={c.description}
                  >
                    {c.title}
                  </button>
                ))}
              </div>

              {active && (
                <div
                  key={active.id}
                  className="rounded-lg border border-dark-border bg-dark-bg/40 p-3.5 space-y-3"
                  style={{ animation: 'starterFadeIn 0.25s ease-out' }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-accent-red/15 border border-accent-red/30 text-accent-red flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-accent-red mb-1">
                        What just happened
                      </p>
                      <p className="text-[13px] text-text-primary leading-relaxed">
                        {active.scenarioPlain}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-accent-green/15 border border-accent-green/30 text-accent-green flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-accent-green mb-1">
                        What the agent does
                      </p>
                      <p className="text-[13px] text-text-primary leading-relaxed">
                        {active.remediationPlain}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <style jsx>{`
          @keyframes starterFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6">
        <div className="space-y-8 divide-y divide-dark-border/40 [&>*:not(:first-child)]:pt-8">
          <ToolPalette selectedToolId={workflow.toolId} onSelect={setTool} />
          <EventPicker
            toolId={workflow.toolId}
            selectedEventId={workflow.eventId}
            onSelect={setEvent}
          />
          {eventEnabled && (
            <ActionPicker
              selectedActionIds={workflow.actionIds}
              enabled={actionEnabled}
              toolId={workflow.toolId}
              onToggle={toggleAction}
            />
          )}
          {workflow.actionIds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-tertiary">
                  Sequence
                </span>
                <span className="text-[11px] text-text-tertiary font-mono">
                  containment first, audit last
                </span>
              </div>
              <ActionList actionIds={workflow.actionIds} onRemove={removeAction} />
            </div>
          )}
          {actionEnabled && (
            <McpPicker
              selectedMcpIds={workflow.mcpIds}
              derivedMcpIds={derivedMcps}
              onToggle={toggleMcp}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start lg:h-[calc(100vh-180px)] flex flex-col gap-3 min-h-[420px]">
          <SdkCodePanel workflow={workflow} />
        </div>
      </div>

      <BuilderSummary workflow={workflow} onRun={onRun} onReset={clear} />
    </div>
  );
}
