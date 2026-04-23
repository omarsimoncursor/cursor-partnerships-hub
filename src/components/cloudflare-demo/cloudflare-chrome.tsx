'use client';

/**
 * Shared chrome bits for the Cloudflare demo dashboards.
 * Pixel-tuned to evoke the real Cloudflare dashboard (cloudflare.com/dashboard):
 *   - top nav: orange logo + org/zone selector + global search
 *   - sub-nav: Overview / Security / Caching / Workers / Logs / Bots
 *   - dark theme: deep slate body, hairline borders, generous padding
 */

import { Search, Bell, HelpCircle, ChevronDown, Plus, Cloud } from 'lucide-react';

export const CF_BG = '#101720';
export const CF_PANEL = '#16202B';
export const CF_PANEL_LIGHT = '#1B2734';
export const CF_BORDER = '#1E2935';
export const CF_BORDER_HARD = '#27313D';
export const CF_TEXT_PRIMARY = '#E5ECF4';
export const CF_TEXT_SECONDARY = '#A0AEC0';
export const CF_TEXT_TERTIARY = '#6F7E94';
export const CF_ORANGE = '#F38020';
export const CF_ORANGE_BRIGHT = '#FAAE40';
export const CF_RED = '#DC2626';
export const CF_AMBER = '#F59E0B';
export const CF_GREEN = '#10B981';
export const CF_BLUE = '#4493F8';
export const CF_VIOLET = '#A78BFA';

export function CloudflareLogoMark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded"
      style={{ width: size, height: size, background: CF_ORANGE }}
    >
      <Cloud className="text-white" style={{ width: size * 0.65, height: size * 0.65 }} />
    </span>
  );
}

export function CloudflareTopNav() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-4 border-b shrink-0"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <div className="flex items-center gap-2">
        <CloudflareLogoMark />
        <span className="text-[13px] font-semibold text-white">Cloudflare</span>
      </div>
      <div className="h-5 w-px" style={{ background: CF_BORDER_HARD }} />
      <button
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[12.5px] hover:bg-white/5"
        style={{ color: CF_TEXT_PRIMARY }}
      >
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: CF_ORANGE }}
        >
          A
        </span>
        Acme Corp
        <ChevronDown className="w-3 h-3" style={{ color: CF_TEXT_TERTIARY }} />
      </button>
      <span style={{ color: CF_TEXT_TERTIARY }}>/</span>
      <button
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[12.5px] font-mono hover:bg-white/5"
        style={{ color: CF_TEXT_PRIMARY }}
      >
        acme-app.com
        <ChevronDown className="w-3 h-3" style={{ color: CF_TEXT_TERTIARY }} />
      </button>

      <div className="flex-1 max-w-2xl">
        <div
          className="flex items-center gap-2 px-3 h-7 rounded"
          style={{ background: CF_BG, border: `1px solid ${CF_BORDER_HARD}` }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: CF_TEXT_TERTIARY }} />
          <span
            className="text-[12px]"
            style={{ color: CF_TEXT_TERTIARY }}
          >
            Search resources, settings, docs…
          </span>
          <span
            className="ml-auto text-[10px] font-mono"
            style={{ color: CF_TEXT_TERTIARY }}
          >
            ⌘K
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <CfNavIcon icon={<Plus className="w-4 h-4" />} />
        <CfNavIcon icon={<HelpCircle className="w-4 h-4" />} />
        <CfNavIcon icon={<Bell className="w-4 h-4" />} />
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: '#3B82F6' }}
        >
          OS
        </div>
      </div>
    </header>
  );
}

function CfNavIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5"
      style={{ color: CF_TEXT_SECONDARY }}
    >
      {icon}
    </button>
  );
}

const TABS: { label: string; key: string }[] = [
  { label: 'Overview', key: 'overview' },
  { label: 'Security', key: 'security' },
  { label: 'Caching', key: 'caching' },
  { label: 'Workers', key: 'workers' },
  { label: 'Logs', key: 'logs' },
  { label: 'Bots', key: 'bots' },
];

export function CloudflareSubNav({ active = 'overview' }: { active?: string }) {
  return (
    <div
      className="flex items-center gap-0 px-4 border-b text-[13px] shrink-0"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      {TABS.map(t => (
        <button
          key={t.key}
          className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
            t.key === active
              ? 'font-medium'
              : 'border-transparent hover:text-white'
          }`}
          style={{
            color: t.key === active ? '#fff' : CF_TEXT_SECONDARY,
            borderColor: t.key === active ? CF_ORANGE : 'transparent',
          }}
        >
          {t.label}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2 py-1.5">
        <span className="text-[11px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
          Last 30 minutes
        </span>
        <button
          className="px-2 h-7 rounded text-[11.5px] flex items-center gap-1 border"
          style={{ background: CF_BG, borderColor: CF_BORDER_HARD, color: CF_TEXT_PRIMARY }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
