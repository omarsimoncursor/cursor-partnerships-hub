'use client';

import { useEffect, useState } from 'react';
import { Loader2, ScanLine } from 'lucide-react';
import { ProductCardDrifted } from './product-card-drifted';
import { QASweepOverlay } from './qa-sweep-overlay';

interface DesignQACardProps {
  /** Fired once the QA sweep finishes — page advances to the drift takeover */
  onDriftDetected: () => void;
}

const CARD_WIDTH = 320;

/**
 * Trigger surface for the demo. Renders the (visibly drifted) product card
 * and a "Run design QA" button. On click, runs a deterministic 3s QA-sweep
 * animation over the card and then fires `onDriftDetected`.
 */
export function DesignQACard({ onDriftDetected }: DesignQACardProps) {
  const [scanning, setScanning] = useState(false);
  const [sweepDone, setSweepDone] = useState(false);

  useEffect(() => {
    if (!sweepDone) return;
    const t = setTimeout(onDriftDetected, 350);
    return () => clearTimeout(t);
  }, [sweepDone, onDriftDetected]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                background: 'rgba(162,89,255,0.12)',
                borderColor: 'rgba(162,89,255,0.35)',
              }}
            >
              <ScanLine className="w-4 h-4" style={{ color: '#A259FF' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary leading-none mb-1">
                Design QA · Product card v2.3
              </p>
              <p className="text-xs text-text-tertiary font-mono truncate">
                Marketing/Shop/ProductCard@2.3
              </p>
            </div>
          </div>
        </div>

        {/* Card preview */}
        <div className="p-6 flex flex-col items-center gap-4">
          <p className="text-xs text-text-tertiary text-center max-w-xs leading-relaxed">
            Compare the shipped component against the Figma spec and flag any
            drift from <span className="font-mono text-text-secondary">design-system/tokens@v2.3</span>.
          </p>

          <div className="relative" style={{ width: CARD_WIDTH }}>
            <ProductCardDrifted />
            {scanning && (
              <QASweepOverlay
                width={CARD_WIDTH}
                onComplete={() => setSweepDone(true)}
              />
            )}
          </div>

          <button
            onClick={() => setScanning(true)}
            disabled={scanning}
            className="mt-2 w-full py-3 px-4 rounded-lg font-medium text-sm
                       transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-80 disabled:cursor-wait cursor-pointer"
            style={{
              background: scanning
                ? 'rgba(162,89,255,0.18)'
                : 'linear-gradient(135deg, #A259FF 0%, #6C3CE0 100%)',
              color: scanning ? '#A259FF' : '#FFFFFF',
              border: scanning ? '1px solid rgba(162,89,255,0.35)' : 'none',
              boxShadow: scanning ? 'none' : '0 8px 32px -8px rgba(162,89,255,0.55)',
            }}
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running design QA…
              </>
            ) : (
              <>
                <ScanLine className="w-4 h-4" />
                Run design QA
              </>
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            Threshold: ±2px / ΔE &gt; 4 against Figma variables
          </p>
        </div>
      </div>
    </div>
  );
}
