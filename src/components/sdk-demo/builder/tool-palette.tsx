'use client';

import { TOOLS } from '@/lib/sdk-demo/catalog/tools';
import type { ToolId } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';

interface ToolPaletteProps {
  selectedToolId: ToolId | null;
  onSelect: (id: ToolId) => void;
}

export function ToolPalette({ selectedToolId, onSelect }: ToolPaletteProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-tertiary">
            Step 1
          </span>
          <h3 className="text-sm font-semibold text-text-primary">Pick a security tool</h3>
        </div>
        <span className="text-[11px] text-text-tertiary font-mono">{TOOLS.length} tools</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TOOLS.map((tool) => {
          const isSelected = selectedToolId === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className={cn(
                'group text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'border-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                  : 'border border-dark-border hover:border-dark-border-hover bg-dark-surface hover:bg-dark-surface-hover',
              )}
              style={
                isSelected
                  ? {
                      borderColor: tool.color,
                      backgroundColor: `${tool.color}14`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: `${tool.color}20`,
                    color: tool.color,
                    border: `1px solid ${tool.color}40`,
                  }}
                >
                  {tool.letter}
                </div>
                <span className="text-sm font-medium text-text-primary truncate">{tool.name}</span>
              </div>
              <p className="text-[11px] leading-snug text-text-tertiary line-clamp-2">{tool.blurb}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
