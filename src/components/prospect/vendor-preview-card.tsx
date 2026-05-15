'use client';

import { ArrowRight, Play } from 'lucide-react';
import { applyAccountName, type Vendor } from '@/lib/prospect/vendors';

type Props = {
  vendor: Vendor;
  account: string;
  pageAccent: string;
  index: number;
  onOpen: () => void;
};

export function VendorPreviewCard({ vendor, account, pageAccent, index, onOpen }: Props) {
  const accent = vendor.brand;
  const headline = applyAccountName(vendor.scenario.headline, account);

  return (
    <button
      type="button"
      id={`vendor-${vendor.id}`}
      onClick={onOpen}
      className="group text-left rounded-2xl border overflow-hidden bg-dark-surface transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2"
      style={{
        borderColor: `${accent}38`,
        boxShadow: 'none',
      }}
      onFocus={e => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`;
      }}
      onBlur={e => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="px-5 py-4 border-b flex items-start gap-4"
        style={{
          borderColor: `${accent}26`,
          backgroundImage: `linear-gradient(180deg, ${accent}1c 0%, transparent 100%)`,
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
          style={{ background: `${accent}25`, color: accent }}
        >
          {vendor.logo ? (
            <img src={vendor.logo} alt={`${vendor.name} logo`} className="w-full h-full object-contain p-2" />
          ) : (
            vendor.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: accent }}>
            Demo {String(index + 1).padStart(2, '0')} {'\u2022'} {vendor.modeNote}
          </p>
          <h3 className="text-lg font-semibold text-text-primary mt-0.5">{vendor.name} + Cursor</h3>
          <p className="text-xs text-text-tertiary mt-0.5">{vendor.category}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-mono shrink-0"
          style={{
            background: `${vendor.mode === 'mcp' ? '#4ade80' : vendor.mode === 'sdk' ? pageAccent : '#fbbf24'}1f`,
            color: vendor.mode === 'mcp' ? '#4ade80' : vendor.mode === 'sdk' ? pageAccent : '#fbbf24',
          }}
        >
          {vendor.mode === 'mcp' ? 'MCP' : vendor.mode === 'sdk' ? 'SDK' : 'MCP + SDK'}
        </span>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2 mb-4">{headline}</p>
        <span
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors group-hover:gap-2.5"
          style={{ color: accent }}
        >
          <Play className="w-3.5 h-3.5" />
          View workflow
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
