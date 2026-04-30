'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ActionId, McpId, ToolId, Workflow } from '@/lib/sdk-demo/types';
import { getAction, sortActionsByPhase } from '@/lib/sdk-demo/catalog/actions';
import { CURATED_WORKFLOWS } from '@/lib/sdk-demo/catalog/workflows';
import { getEventsForTool } from '@/lib/sdk-demo/catalog/events';
import { ToolPalette } from './tool-palette';
import { EventPicker } from './event-picker';
import { ActionPicker } from './action-picker';
import { ActionList } from './action-list';
import { McpPicker } from './mcp-picker';
import { SdkCodePanel } from './sdk-code-panel';
import { BuilderSummary } from './builder-summary';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowBuilderProps {
  workflow: Workflow;
  onChange: (next: Workflow) => void;
  onRun: () => void;
}

export function WorkflowBuilder({ workflow, onChange, onRun }: WorkflowBuilderProps) {
  const [activeStarter, setActiveStarter] = useState<string | null>(null);

  function setTool(id: ToolId) {
    const events = getEventsForTool(id);
    const sameTool = workflow.toolId === id;
    onChange({
      toolId: id,
      eventId: sameTool ? workflow.eventId : events.length > 0 ? events[0].id : null,
      actionIds: sameTool ? workflow.actionIds : [],
      mcpIds: sameTool ? workflow.mcpIds : [],
    });
    setActiveStarter(null);
  }

  function setEvent(id: string) {
    onChange({ ...workflow, eventId: id });
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

    const action = getAction(id);
    const derived = new Set<McpId>(workflow.mcpIds);
    if (action) {
      for (const m of action.mcpsRequired) {
        if (current.has(id)) derived.add(m);
      }
    }

    onChange({ ...workflow, actionIds: nextActions, mcpIds: Array.from(derived) });
    setActiveStarter(null);
  }

  function removeAction(id: ActionId) {
    const next = workflow.actionIds.filter((a) => a !== id);
    onChange({ ...workflow, actionIds: next });
    setActiveStarter(null);
  }

  function toggleMcp(id: McpId) {
    const current = new Set(workflow.mcpIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    onChange({ ...workflow, mcpIds: Array.from(current) });
  }

  function applyStarter(id: string) {
    const starter = CURATED_WORKFLOWS.find((c) => c.id === id);
    if (!starter) return;
    onChange(starter.workflow);
    setActiveStarter(id);
  }

  function clear() {
    onChange({ toolId: null, eventId: null, actionIds: [], mcpIds: [] });
    setActiveStarter(null);
  }

  const eventEnabled = !!workflow.toolId;
  const actionEnabled = !!workflow.toolId && !!workflow.eventId;

  const derivedMcps = useMemo<McpId[]>(() => {
    const set = new Set<McpId>();
    for (const id of workflow.actionIds) {
      const a = getAction(id);
      if (!a) continue;
      for (const m of a.mcpsRequired) set.add(m);
    }
    return Array.from(set);
  }, [workflow.actionIds]);

  useEffect(() => {
    const set = new Set(workflow.mcpIds);
    let changed = false;
    for (const m of derivedMcps) {
      if (!set.has(m)) {
        set.add(m);
        changed = true;
      }
    }
    if (changed) {
      onChange({ ...workflow, mcpIds: Array.from(set) });
    }
  }, [derivedMcps, workflow, onChange]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dark-border bg-dark-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-tertiary">
            Starter workflows
          </span>
          <span className="text-[10px] text-text-tertiary">
            (one click loads a curated workflow you can edit)
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CURATED_WORKFLOWS.map((c) => (
            <button
              key={c.id}
              onClick={() => applyStarter(c.id)}
              className={cn(
                'text-left text-[11px] px-2.5 py-1.5 rounded border transition-all duration-150 cursor-pointer max-w-xs',
                activeStarter === c.id
                  ? 'border-accent-amber/60 bg-accent-amber/10 text-text-primary'
                  : 'border-dark-border bg-dark-bg hover:border-dark-border-hover hover:bg-dark-surface-hover text-text-secondary',
              )}
              title={c.description}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-4">
        <div className="space-y-4">
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
              onToggle={toggleAction}
            />
          )}
          {workflow.actionIds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
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
