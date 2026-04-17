'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PartnerCardProps {
  name: string;
  webinar?: string;
  motion?: string;
  rationale: string;
  logo: string;
  className?: string;
}

export function PartnerCard({ name, webinar, motion, rationale, logo, className }: PartnerCardProps) {
  return (
    <div className={cn('glass-card p-6 group relative', className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-cta-bg flex items-center justify-center overflow-hidden shrink-0">
          <Image
            src={logo}
            alt={name}
            width={24}
            height={24}
            className="object-contain"
            unoptimized
          />
        </div>
        <h4 className="font-semibold text-text-primary text-base">{name}</h4>
      </div>
      {webinar && (
        <p className="text-xs text-accent-blue font-medium leading-relaxed">
          &quot;{webinar}&quot;
        </p>
      )}
      {motion && (
        <p className="text-xs text-accent-amber font-medium">
          {motion}
        </p>
      )}
      {/* Hover tooltip for rationale */}
      <div className="absolute left-0 right-0 bottom-full mb-2 px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-sm text-text-secondary leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-xl">
        {rationale}
      </div>
    </div>
  );
}
