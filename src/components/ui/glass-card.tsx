'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-6',
        hover && 'cursor-pointer',
        !hover && 'hover:transform-none hover:border-dark-border hover:bg-glass',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
