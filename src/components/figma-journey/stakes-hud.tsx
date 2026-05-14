'use client';

import { useEffect, useState } from 'react';
import type { FigmaActId } from './acts/act-theme';

interface FigmaStakesHudProps {
  currentAct: FigmaActId;
  /** 0..3 — each time the agent uses the MCP successfully */
  mcpCallsCompleted: number;
  /** 0 → 100% revealed once Act 4 lands */
  designFidelityPct: number;
  /** Revealed in Act 5 */
  cycleTimeRevealed: boolean;
}

function useLerp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);
  return value;
}

export function FigmaStakesHud({
  currentAct,
  mcpCallsCompleted,
  designFidelityPct,
  cycleTimeRevealed,
}: FigmaStakesHudProps) {
  const fidelityValue = useLerp(designFidelityPct, designFidelityPct > 0, 1400);
  const cycleTimeValue = useLerp(78, cycleTimeRevealed, 1400);

  return (
    <aside
      className="fixed bottom-4 right-4 z-40 w-[320px] max-w-[calc(100vw-32px)] rounded-xl border p-4 text-white backdrop-blur-xl transition-all"
      style={{
        background: 'rgba(20, 17, 42, 0.85)',
        borderColor: 'rgba(162, 89, 255, 0.25)',
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.6), 0 0 40px -15px rgba(162,89,255,0.3)',
      }}
      aria-label="Figma stakes HUD"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
          Signal · Figma × Cursor
        </span>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#A259FF]" />
          live
        </span>
      </div>

      <div className="space-y-2.5 text-sm">
        <Row
          label="Designer worry score"
          value={
            currentAct >= 4
              ? 'resolved'
              : currentAct >= 3
                ? 'easing'
                : currentAct >= 2
                  ? 'high'
                  : 'critical'
          }
          valueColor={
            currentAct >= 4
              ? '#4ADE80'
              : currentAct >= 3
                ? '#A259FF'
                : currentAct >= 2
                  ? '#F59E0B'
                  : '#F87171'
          }
        />
        <Row
          label="Figma MCP calls"
          value={`${mcpCallsCompleted} / 3`}
          valueColor={mcpCallsCompleted > 0 ? '#A259FF' : 'rgba(255,255,255,0.55)'}
          mono
        />
        <Row
          label="Design fidelity"
          value={designFidelityPct > 0 ? `${Math.round(fidelityValue)}%` : '—'}
          valueColor={designFidelityPct >= 100 ? '#4ADE80' : '#A259FF'}
          mono
        />
        <Row
          label="Cycle-time saved"
          value={cycleTimeRevealed ? `${Math.round(cycleTimeValue)}%` : '—'}
          hint={cycleTimeRevealed ? '→ design-to-prod' : undefined}
          valueColor={cycleTimeRevealed ? '#4ADE80' : 'rgba(255,255,255,0.55)'}
          mono
        />
      </div>

      {currentAct === 6 && (
        <div className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/70">
          <span className="text-white/50">Gong signal:</span>{' '}
          <span className="font-semibold text-[#A259FF]">Figma MCP</span> is the
          #1 most-asked-about MCP on Cursor customer calls.
        </div>
      )}
    </aside>
  );
}

function Row({
  label,
  value,
  hint,
  valueColor,
  mono,
}: {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-white/55">{label}</span>
      <span
        className={`${mono ? 'font-mono' : ''} text-sm font-semibold tabular-nums`}
        style={{ color: valueColor }}
      >
        {value}
        {hint && <span className="ml-1 text-[10px] font-normal text-white/40">{hint}</span>}
      </span>
    </div>
  );
}
