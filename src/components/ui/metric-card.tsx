'use client';

import { AnimatedCounter } from './animated-counter';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function MetricCard({ value, label, prefix, suffix, className }: MetricCardProps) {
  return (
    <div className={cn('glass-card p-6 text-center', className)}>
      <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
        <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}
