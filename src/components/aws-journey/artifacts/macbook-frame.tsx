'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Lock, MoreHorizontal, RefreshCcw, Shield } from 'lucide-react';

/**
 * Wraps an "artifact" in a macOS-style window with a browser chrome (URL bar)
 * so the receipt looks like the real product as it would appear on a
 * MacBook screen. Used by every Act 7 receipt modal.
 *
 *   <MacBookFrame url="github.com/acme/orders/pull/247" tabTitle="PR #247">
 *     <GitHubPrArtifact />
 *   </MacBookFrame>
 */
export function MacBookFrame({
  url,
  tabTitle,
  browser = 'chrome',
  children,
}: {
  /** What appears in the URL bar — without scheme; we add the lock + https://. */
  url: string;
  /** What appears as the active browser tab label. */
  tabTitle: string;
  /** Visual browser style. Currently only Chrome-on-macOS is implemented. */
  browser?: 'chrome' | 'safari';
  children: ReactNode;
}) {
  return (
    <div
      className="flex flex-col bg-[#1A1B1F] text-[#1F2328]"
      style={{ borderRadius: 12 }}
    >
      {/* macOS title bar with traffic lights */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background: 'linear-gradient(180deg, #2C2D31 0%, #1F2024 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#FEBC2E' }} />
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <div className="flex-1" />
      </div>

      {/* Browser tab strip */}
      <div
        className="flex items-end gap-1 px-2 pt-1"
        style={{ background: '#2C2D31' }}
      >
        <div
          className="flex max-w-[260px] items-center gap-2 truncate rounded-t-md px-3 py-1.5 text-[11.5px]"
          style={{
            background: browser === 'chrome' ? '#3A3B40' : '#FFFFFF',
            color: browser === 'chrome' ? '#E5E7EB' : '#1F2328',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-sm"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-hidden
          />
          <span className="truncate">{tabTitle}</span>
        </div>
      </div>

      {/* URL / toolbar bar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background: '#3A3B40',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-1 text-white/55">
          <ArrowLeft className="h-3.5 w-3.5" />
          <ArrowRight className="h-3.5 w-3.5 opacity-50" />
          <RefreshCcw className="h-3.5 w-3.5" />
        </div>
        <div
          className="flex flex-1 items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px]"
          style={{ background: '#202124', color: '#E5E7EB' }}
        >
          <Lock className="h-3 w-3" style={{ color: '#34D399' }} />
          <span className="opacity-55">https://</span>
          <span className="truncate font-mono text-white">{url}</span>
        </div>
        <div className="flex items-center gap-1 text-white/55">
          <Shield className="h-3.5 w-3.5" />
          <MoreHorizontal className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Page viewport */}
      <div className="bg-white" style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        {children}
      </div>
    </div>
  );
}
