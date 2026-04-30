'use client';

import { getAction, sortActionsByPhase } from '@/lib/sdk-demo/catalog/actions';
import { getMcp } from '@/lib/sdk-demo/catalog/mcps';
import type { ActionId, McpId } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';
import { ArrowDown, X } from 'lucide-react';

interface ActionListProps {
  actionIds: ActionId[];
  onRemove: (id: ActionId) => void;
}

const PHASE_DOT: Record<string, string> = {
  containment: 'bg-accent-amber',
  remediation: 'bg-accent-blue',
  audit: 'bg-accent-green',
};

export function ActionList({ actionIds, onRemove }: ActionListProps) {
  if (actionIds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-dark-border bg-dark-surface px-3 py-6 text-center">
        <p className="text-xs text-text-tertiary italic">
          No actions yet. Picks appear here in containment-first order.
        </p>
      </div>
    );
  }

  const ordered = sortActionsByPhase(actionIds);

  return (
    <ol className="space-y-1.5">
      {ordered.map((id, idx) => {
        const action = getAction(id);
        if (!action) return null;
        const mcps = action.mcpsRequired
          .map((mcpId: McpId) => getMcp(mcpId))
          .filter((m): m is NonNullable<ReturnType<typeof getMcp>> => m !== null);
        const isLast = idx === ordered.length - 1;
        return (
          <li key={id} className="relative">
            <div className="flex items-start gap-2.5 rounded-lg border border-dark-border bg-dark-surface px-3 py-2">
              <div className="shrink-0 flex flex-col items-center">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full text-[11px] font-mono font-semibold flex items-center justify-center text-dark-bg',
                    PHASE_DOT[action.phase],
                  )}
                >
                  {idx + 1}
                </div>
                {!isLast && (
                  <ArrowDown className="w-3 h-3 text-text-tertiary mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary truncate">{action.label}</p>
                  <span
                    className={cn(
                      'shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border',
                      action.phase === 'containment' && 'border-accent-amber/30 text-accent-amber bg-accent-amber/5',
                      action.phase === 'remediation' && 'border-accent-blue/30 text-accent-blue bg-accent-blue/5',
                      action.phase === 'audit' && 'border-accent-green/30 text-accent-green bg-accent-green/5',
                    )}
                  >
                    {action.phase}
                  </span>
                </div>
                {mcps.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-[10px] text-text-tertiary font-mono">via</span>
                    {mcps.map((m) => (
                      <span
                        key={m.id}
                        className="px-1 py-0.5 rounded text-[9px] font-mono border"
                        style={{
                          color: m.color,
                          borderColor: `${m.color}55`,
                          backgroundColor: `${m.color}10`,
                        }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemove(id)}
                className="shrink-0 p-1 rounded hover:bg-dark-surface-hover text-text-tertiary hover:text-accent-red transition-colors cursor-pointer"
                aria-label={`Remove ${action.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
