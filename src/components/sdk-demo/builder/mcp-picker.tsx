'use client';

import { MCPS, getMcp } from '@/lib/sdk-demo/catalog/mcps';
import type { McpId } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';

interface McpPickerProps {
  selectedMcpIds: McpId[];
  derivedMcpIds: McpId[];
  onToggle: (id: McpId) => void;
}

export function McpPicker({ selectedMcpIds, derivedMcpIds, onToggle }: McpPickerProps) {
  const selected = new Set(selectedMcpIds);
  const derived = new Set(derivedMcpIds);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-tertiary">
            Step 4
          </span>
          <h3 className="text-sm font-semibold text-text-primary">MCPs the agent will have</h3>
        </div>
        <span className="text-[11px] text-text-tertiary font-mono">
          {selectedMcpIds.length} of {MCPS.length} configured
        </span>
      </div>

      <p className="text-[12.5px] text-text-secondary mb-3 leading-relaxed">
        Auto-derived from your actions. Add or remove individual MCPs to grant or restrict tools.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {MCPS.map((mcp) => {
          const isSelected = selected.has(mcp.id);
          const isDerived = derived.has(mcp.id);
          return (
            <button
              key={mcp.id}
              onClick={() => onToggle(mcp.id)}
              className={cn(
                'group inline-flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-150 cursor-pointer text-[11px] font-mono',
                isSelected
                  ? ''
                  : 'border-dark-border bg-dark-surface hover:border-dark-border-hover hover:bg-dark-surface-hover text-text-tertiary',
              )}
              style={
                isSelected
                  ? {
                      borderColor: `${mcp.color}66`,
                      backgroundColor: `${mcp.color}14`,
                      color: mcp.color,
                    }
                  : undefined
              }
              title={`${mcp.pkg} · env.${mcp.envVar}`}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSelected ? mcp.color : 'rgba(237,236,236,0.2)' }}
              />
              {mcp.name}
              {isDerived && isSelected && (
                <span className="text-[9px] uppercase tracking-wider opacity-60">auto</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getDerivedMcps(actionMcpIds: Iterable<McpId>): McpId[] {
  const set = new Set<McpId>();
  for (const id of actionMcpIds) {
    if (getMcp(id)) set.add(id);
  }
  return Array.from(set);
}
