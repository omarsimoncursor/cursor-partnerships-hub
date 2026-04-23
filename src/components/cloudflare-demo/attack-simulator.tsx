'use client';

/**
 * Wraps the AnalyticsDashboard during the idle phase and animates the attack
 * progress 0..1 over ~5 seconds when the user clicks "Simulate credential-stuffing wave".
 * When the animation reaches 1.0, calls onComplete which the demo page uses to
 * pivot to the full-screen attack takeover.
 *
 * No real network. The "attack" is a deterministic local clock animation.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalyticsDashboard } from './analytics-dashboard';

const ATTACK_RAMP_MS = 5000;

interface AttackSimulatorProps {
  onComplete: () => void;
}

export function AttackSimulator({ onComplete }: AttackSimulatorProps) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startRef.current;
      const t = Math.min(1, elapsed / ATTACK_RAMP_MS);
      // Ease out so the spike feels punchy at the start, plateau at the end.
      const eased = 1 - Math.pow(1 - t, 2.4);
      setProgress(eased);
      if (t >= 1) {
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, onComplete]);

  const handleSimulate = useCallback(() => {
    setRunning(true);
  }, []);

  return (
    <div className="relative w-full" style={{ height: 720 }}>
      <AnalyticsDashboard
        attackProgress={progress}
        onSimulate={running ? undefined : handleSimulate}
      />
      {running && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-[#DC2626]/15 border border-[#DC2626]/40 text-[#FCA5A5] text-[11px] font-mono flex items-center gap-2 shadow-lg backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          Active attack ramping · {Math.round(progress * 100)}%
        </div>
      )}
    </div>
  );
}
