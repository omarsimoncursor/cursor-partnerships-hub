'use client';

import Link from 'next/link';
import { ArrowRight, Home, ExternalLink } from 'lucide-react';

interface NextStrategyProps {
  href: string;
  label: string;
  description: string;
  color: string;
  isHome?: boolean;
  example?: {
    href: string;
    label: string;
    color: string;
  };
}

export function NextStrategy({ href, label, description, color, isHome, example }: NextStrategyProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-12">
      {example && (
        <Link
          href={example.href}
          className="group flex items-center justify-between gap-4 rounded-xl border-2 border-dashed p-5 sm:p-6 mb-4 transition-all duration-300 hover:scale-[1.01]"
          style={{
            borderColor: `${example.color}40`,
            backgroundColor: `${example.color}08`,
          }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: example.color }}>
              Before you continue
            </p>
            <p className="text-base sm:text-lg font-semibold text-text-primary">
              {example.label}
            </p>
          </div>
          <div
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: `${example.color}20` }}
          >
            <ExternalLink className="w-5 h-5" style={{ color: example.color }} />
          </div>
        </Link>
      )}
      <Link
        href={href}
        className="group flex items-center justify-between gap-6 rounded-xl border p-6 sm:p-8 transition-all duration-300 hover:scale-[1.01]"
        style={{
          borderColor: `${color}30`,
          backgroundColor: `${color}08`,
        }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color }}>
            {isHome ? 'Back to Overview' : 'Next Strategy'}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
            {label}
          </h3>
          <p className="text-sm text-text-primary/60">
            {description}
          </p>
        </div>
        <div
          className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300"
          style={{ backgroundColor: `${color}20` }}
        >
          {isHome ? (
            <Home className="w-6 h-6" style={{ color }} />
          ) : (
            <ArrowRight className="w-6 h-6" style={{ color }} />
          )}
        </div>
      </Link>
    </div>
  );
}
