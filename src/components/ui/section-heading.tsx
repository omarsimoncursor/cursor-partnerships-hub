'use client';

import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({ badge, title, subtitle, className, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={cn(
      'mb-16',
      align === 'center' && 'text-center',
      className
    )}>
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-widest uppercase rounded-full bg-cta-bg text-text-secondary border border-dark-border">
          {badge}
        </span>
      )}
      <h2 className={cn(
        'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary',
        subtitle && 'mb-4'
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'text-lg text-text-secondary max-w-2xl',
          align === 'center' && 'mx-auto'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
