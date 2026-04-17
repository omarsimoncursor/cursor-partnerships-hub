'use client';

import { cn } from '@/lib/utils';

interface ComparisonRow {
  dimension: string;
  competitor: string;
  cursor: string;
}

interface ComparisonTableProps {
  competitorName: string;
  rows: ComparisonRow[];
  className?: string;
}

export function ComparisonTable({ competitorName, rows, className }: ComparisonTableProps) {
  return (
    <div className={cn('rounded-xl border border-dark-border overflow-hidden', className)}>
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_1fr] bg-dark-bg">
        <div className="px-4 py-3 text-xs font-mono text-text-tertiary uppercase tracking-wider border-r border-dark-border" />
        <div className="px-4 py-3 text-xs font-mono text-text-tertiary uppercase tracking-wider text-center border-r border-dark-border">
          {competitorName}
        </div>
        <div className="px-4 py-3 text-xs font-mono uppercase tracking-wider text-center text-accent-blue">
          Cursor
        </div>
      </div>
      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_1fr_1fr] border-t border-dark-border"
        >
          <div className="px-4 py-4 text-sm font-medium text-text-primary border-r border-dark-border bg-dark-surface">
            {row.dimension}
          </div>
          <div className="px-4 py-4 text-sm text-text-secondary border-r border-dark-border">
            {row.competitor}
          </div>
          <div className="px-4 py-4 text-sm text-text-primary bg-accent-blue/5 border-l border-accent-blue/10">
            {row.cursor}
          </div>
        </div>
      ))}
    </div>
  );
}
