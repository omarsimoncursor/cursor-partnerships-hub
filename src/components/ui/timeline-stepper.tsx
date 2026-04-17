'use client';

import { cn } from '@/lib/utils';

interface TimelineStep {
  timeframe: string;
  title?: string;
  description: React.ReactNode;
}

interface TimelineStepperProps {
  steps: TimelineStep[];
  className?: string;
}

export function TimelineStepper({ steps, className }: TimelineStepperProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-accent-blue border-2 border-accent-blue/30 shrink-0 mt-1" />
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-dark-border min-h-[24px]" />
            )}
          </div>
          {/* Content */}
          <div className="pb-8">
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded mb-2">
              {step.timeframe}
            </span>
            {step.title && (
              <h4 className="text-sm font-semibold text-text-primary mb-1">{step.title}</h4>
            )}
            <div className="text-sm text-text-secondary leading-relaxed">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
