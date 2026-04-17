'use client';

import { cn } from '@/lib/utils';

interface LanguageSegment {
  name: string;
  percentage: number;
  color: string;
}

interface LanguageBarProps {
  segments: LanguageSegment[];
  className?: string;
}

export function LanguageBar({ segments, className }: LanguageBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-dark-bg border border-dark-border">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full transition-all duration-700"
            style={{
              width: `${seg.percentage}%`,
              backgroundColor: seg.color,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-text-secondary">
              {seg.name} <span className="text-text-tertiary">{seg.percentage}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
