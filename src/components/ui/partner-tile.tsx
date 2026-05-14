'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface PartnerTileProps {
  href: string;
  partner: string;
  title: string;
  description: string;
  color: string;
  logo: string;
}

export function PartnerTile({ href, partner, title, description, color, logo }: PartnerTileProps) {
  return (
    <Link
      href={href}
      data-partner-tile
      className="group relative block overflow-hidden rounded-2xl border border-dark-border bg-dark-surface/40 backdrop-blur-sm transition-all duration-500 hover:border-dark-border-hover hover:-translate-y-1"
      style={{
        ['--tile-color' as string]: color,
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at 50% 0%, ${color}22, transparent 60%)`,
        }}
      />

      {/* Corner accent bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }}
      />

      <div className="relative flex h-full flex-col p-7">
        {/* Logo bar */}
        <div className="mb-8 flex h-12 items-center">
          <div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110"
            style={{
              backgroundColor: `${color}14`,
              boxShadow: `0 0 0 1px ${color}20`,
            }}
          >
            <Image
              src={logo}
              alt={`${partner} logo`}
              width={28}
              height={28}
              className="object-contain"
              unoptimized
            />
          </div>
          <span
            className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color }}
          >
            {partner} × Cursor
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[22px] font-bold leading-[1.2] tracking-tight text-text-primary">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          {description}
        </p>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300"
            style={{ color }}
          >
            View agentic workflow
            <span className="flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ backgroundColor: `${color}18` }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </span>
        </div>

        {/* Bottom glow accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at 50% 100%, ${color}1a, transparent 70%)`,
          }}
        />
      </div>
    </Link>
  );
}
