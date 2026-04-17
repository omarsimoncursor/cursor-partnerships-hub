'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, href, className, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)';
    setTimeout(() => {
      if (el) el.style.transition = '';
    }, 500);
  }, []);

  const sharedProps = {
    className: cn(
      'inline-flex items-center gap-2 px-8 py-4 rounded-full',
      'bg-text-primary text-dark-bg font-semibold text-base',
      'hover:bg-brand-light transition-colors duration-200',
      'will-change-transform',
      className
    ),
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...sharedProps}>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} onClick={onClick} {...sharedProps}>
      {children}
    </button>
  );
}
