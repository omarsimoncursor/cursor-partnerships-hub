'use client';

import { ACTIONS, getActionsByPhase } from '@/lib/sdk-demo/catalog/actions';
import type { ActionId, ActionPhase } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';
import { Plus, Check } from 'lucide-react';

interface ActionPickerProps {
  selectedActionIds: ActionId[];
  enabled: boolean;
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

export function ActionPicker({ selectedActionIds, enabled, onToggle }: ActionPickerProps) {
  const phases: ActionPhase[] = ['containment', 'remediation', 'audit'];
  const selected = new Set(selectedActionIds);

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
                    return (
                      <button
                        key={action.id}
                        onClick={() => onToggle(action.id)}
                        className={cn(
                          'group text-left rounded-lg border px-3 py-2 transition-all duration-150 cursor-pointer flex items-start gap-2.5',
                          isSelected
                            ? 'border-accent-green/40 bg-accent-green/5'
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
                          <p className="text-sm font-medium text-text-primary truncate">
                            {action.label}
                          </p>
                          <p className="text-[11px] text-text-tertiary leading-snug mt-0.5">
                            {action.blurb}
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
