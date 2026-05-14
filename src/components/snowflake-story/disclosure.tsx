'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DisclosureProps {
  /** Label shown on the trigger row, e.g. "See Cursor's reasoning log". */
  label: string;
  /** Optional meta shown to the right of the label, e.g. "13 steps · 4 min". */
  meta?: string;
  /** Optional icon rendered left of the label. */
  icon?: ReactNode;
  /** Accent color (defaults to Snowflake cyan). */
  accent?: string;
  /** "dark" theme uses translucent white surfaces; "light" uses cream surfaces. */
  tone?: 'dark' | 'light';
  /** Whether to start expanded. Defaults to collapsed, which is the whole point. */
  defaultOpen?: boolean;
  /** The heavy content that goes behind the disclosure. */
  children: ReactNode;
  className?: string;
}

/**
 * Progressive-disclosure wrapper. Use this to hide secondary content (reasoning
 * logs, ledgers, full email threads) behind a single trigger row so every act
 * shows at most one hero artifact on first paint. Reader can open what they
 * want without having to scroll past it.
 */
export function Disclosure({
  label,
  meta,
  icon,
  accent = '#29B5E8',
  tone = 'dark',
  defaultOpen = false,
  children,
  className = '',
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isDark = tone === 'dark';

  return (
    <div
      className={`overflow-hidden rounded-xl border ${className}`}
      style={{
        background: isDark ? 'rgba(10,18,33,0.45)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left cursor-pointer"
        aria-expanded={open}
      >
        {icon && (
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-md"
            style={{
              background: `${accent}18`,
              color: accent,
              border: `1px solid ${accent}40`,
            }}
          >
            {icon}
          </span>
        )}
        <span
          className="text-[12.5px] font-medium"
          style={{ color: isDark ? '#E6EDF3' : '#0F172A' }}
        >
          {label}
        </span>
        {meta && (
          <span
            className="ml-2 text-[10.5px] font-mono"
            style={{ color: isDark ? 'rgba(230,237,243,0.55)' : 'rgba(15,23,42,0.55)' }}
          >
            {meta}
          </span>
        )}
        <ChevronDown
          className="ml-auto h-4 w-4 shrink-0 transition-transform"
          style={{
            color: accent,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && (
        <div
          className="px-4 pb-4 pt-1 disclosure-enter"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'}` }}
        >
          {children}
        </div>
      )}

      <style jsx>{`
        :global(.disclosure-enter) {
          animation: disclosureEnter 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes disclosureEnter {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
