'use client';

import { ACTIONS, getActionsByPhase } from '@/lib/sdk-demo/catalog/actions';
import { getRecommendedActions } from '@/lib/sdk-demo/catalog/workflows';
import { getTool } from '@/lib/sdk-demo/catalog/tools';
import type { ActionId, ActionPhase, ToolId } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';
import { Check, Plus, Sparkles } from 'lucide-react';

interface ActionPickerProps {
  selectedActionIds: ActionId[];
  enabled: boolean;
  toolId: ToolId | null;
  onToggle: (id: ActionId) => void;
}

const PHASE_META: Record<ActionPhase, { label: string; color: string; chip: string }> = {
  containment: {
    label: 'Containment',
    color: 'text-accent-amber',
    chip: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
  },
  remediation: {
    label: 'Remediation',
    color: 'text-accent-blue',
    chip: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  },
  audit: {
    label: 'Audit',
    color: 'text-accent-green',
    chip: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  },
};

export function ActionPicker({
  selectedActionIds,
  enabled,
  toolId,
  onToggle,
}: ActionPickerProps) {
  const phases: ActionPhase[] = ['containment', 'remediation', 'audit'];
  const selected = new Set(selectedActionIds);
  const recommended = new Set(getRecommendedActions(toolId));
  const tool = getTool(toolId);

  return (
    <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-tertiary">
            Step 3
          </span>
          <h3 className="text-sm font-semibold text-text-primary">Pick response actions</h3>
        </div>
        <span className="text-[11px] text-text-tertiary font-mono">
          {ACTIONS.length} actions · {selectedActionIds.length} picked
        </span>
      </div>

      {!enabled && (
        <p className="text-xs text-text-tertiary italic px-3 py-6 bg-dark-surface rounded-lg border border-dashed border-dark-border mb-3">
          Pick a tool and event first.
        </p>
      )}

      {enabled && tool && recommended.size > 0 && (
        <div
          className="mb-4 rounded-lg border border-dark-border bg-dark-surface px-4 py-3 flex items-start gap-3 border-l-[3px]"
          style={{ borderLeftColor: tool.color }}
        >
          <div className="w-7 h-7 rounded-md bg-accent-amber/15 border border-accent-amber/30 text-accent-amber flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1 text-accent-amber">
              Recommended for{' '}
              <span style={{ color: tool.color }}>{tool.name}</span>
            </p>
            <p className="text-[12.5px] text-text-primary leading-relaxed">
              The {recommended.size} actions tagged{' '}
              <span className="inline-flex items-center gap-1 px-1 rounded bg-accent-amber/15 border border-accent-amber/30 text-accent-amber font-mono text-[10px] uppercase tracking-wider align-middle">
                <Sparkles className="w-2.5 h-2.5" />
                rec
              </span>{' '}
              below are what a real responder reaches for first when {tool.name} fires this kind of
              alert. You can still pick anything you want.
            </p>
          </div>
        </div>
      )}

      {enabled && (
        <div className="space-y-3">
          {phases.map((phase) => {
            const meta = PHASE_META[phase];
            return (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={cn(
                      'inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border',
                      meta.chip,
                    )}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider">
                    {phase === 'containment'
                      ? 'do these first'
                      : phase === 'remediation'
                        ? 'code-level fix'
                        : 'audit + comms'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {getActionsByPhase(phase).map((action) => {
                    const isSelected = selected.has(action.id);
                    const isRecommended = recommended.has(action.id);
                    return (
                      <button
                        key={action.id}
                        onClick={() => onToggle(action.id)}
                        className={cn(
                          'group text-left rounded-lg border px-3 py-2 transition-all duration-150 cursor-pointer flex items-start gap-2.5',
                          isSelected
                            ? 'border-accent-green/40 bg-accent-green/5'
                            : isRecommended
                              ? 'border-accent-amber/35 bg-accent-amber/[0.04] hover:border-accent-amber/55 hover:bg-accent-amber/[0.07] shadow-[0_0_18px_rgba(251,191,36,0.06)]'
                              : 'border-dark-border bg-dark-surface hover:border-dark-border-hover hover:bg-dark-surface-hover',
                        )}
                      >
                        <div
                          className={cn(
                            'shrink-0 w-5 h-5 rounded border flex items-center justify-center mt-0.5',
                            isSelected
                              ? 'border-accent-green/50 bg-accent-green/15'
                              : 'border-dark-border bg-dark-bg',
                          )}
                        >
                          {isSelected ? (
                            <Check className="w-3 h-3 text-accent-green" />
                          ) : (
                            <Plus className="w-3 h-3 text-text-tertiary group-hover:text-text-secondary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {action.label}
                            </p>
                            {isRecommended && !isSelected && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-accent-amber/15 text-accent-amber border border-accent-amber/30 shrink-0"
                                title={`Recommended for ${tool?.name ?? ''}`}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                Rec
                              </span>
                            )}
                          </div>
                          <p className="text-[12.5px] text-text-secondary leading-relaxed mt-1">
                            {action.plainEnglish}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
