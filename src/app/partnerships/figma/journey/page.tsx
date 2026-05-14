'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { FigmaStorySpine } from '@/components/figma-journey/story-spine';
import { FigmaStakesHud } from '@/components/figma-journey/stakes-hud';
import { FigmaActTransition } from '@/components/figma-journey/act-transition';
import { Act1Headline } from '@/components/figma-journey/acts/act-1-headline';
import { Act2Drift } from '@/components/figma-journey/acts/act-2-drift';
import { Act3Handshake } from '@/components/figma-journey/acts/act-3-handshake';
import { Act4DesignMode } from '@/components/figma-journey/acts/act-4-design-mode';
import { Act5Loop } from '@/components/figma-journey/acts/act-5-loop';
import { Act6Verdict } from '@/components/figma-journey/acts/act-6-verdict';
import type { FigmaActId } from '@/components/figma-journey/acts/act-theme';

export default function FigmaJourneyPage() {
  const [currentAct, setCurrentAct] = useState<FigmaActId>(1);
  const [unlockedActs, setUnlockedActs] = useState<Set<FigmaActId>>(() => new Set<FigmaActId>([1]));
  const [mcpCallsCompleted, setMcpCallsCompleted] = useState(0);
  const [designFidelityPct, setDesignFidelityPct] = useState(0);
  const [cycleTimeRevealed, setCycleTimeRevealed] = useState(false);

  const advanceTo = useCallback(
    (next: FigmaActId, opts?: { revealCycleTime?: boolean }) => {
      setUnlockedActs((prev) => {
        const copy = new Set(prev);
        copy.add(next);
        return copy;
      });
      if (opts?.revealCycleTime) setCycleTimeRevealed(true);
      setCurrentAct(next);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [],
  );

  const jumpTo = useCallback(
    (act: FigmaActId) => {
      if (!unlockedActs.has(act)) return;
      setCurrentAct(act);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [unlockedActs],
  );

  const replay = useCallback(() => {
    setCurrentAct(1);
    setMcpCallsCompleted(0);
    setDesignFidelityPct(0);
    setCycleTimeRevealed(false);
    setUnlockedActs(new Set<FigmaActId>([1]));
  }, []);

  const handleMcpCall = useCallback((n: number) => {
    setMcpCallsCompleted((curr) => Math.max(curr, n));
  }, []);
  const handleAct4Mcp = useCallback(() => {
    setMcpCallsCompleted((curr) => Math.min(3, Math.max(curr, 1) + 0));
  }, []);
  const handleFidelity = useCallback((pct: number) => {
    setDesignFidelityPct((curr) => Math.max(curr, pct));
  }, []);

  const scene = useMemo(() => {
    switch (currentAct) {
      case 1:
        return <Act1Headline onAdvance={() => advanceTo(2)} />;
      case 2:
        return <Act2Drift onAdvance={() => advanceTo(3)} />;
      case 3:
        return (
          <Act3Handshake
            onAdvance={() => advanceTo(4)}
            onMcpCall={handleMcpCall}
          />
        );
      case 4:
        return (
          <Act4DesignMode
            onAdvance={() => advanceTo(5, { revealCycleTime: true })}
            onMcpCall={handleAct4Mcp}
            onFidelity={handleFidelity}
          />
        );
      case 5:
        return <Act5Loop onAdvance={() => advanceTo(6)} />;
      case 6:
        return <Act6Verdict onReplay={replay} />;
    }
  }, [currentAct, advanceTo, replay, handleMcpCall, handleAct4Mcp, handleFidelity]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Tiny "back" link above the spine */}
      <Link
        href="/partnerships/figma"
        className="fixed left-4 top-[14px] z-50 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Figma
      </Link>

      <FigmaStorySpine currentAct={currentAct} unlockedActs={unlockedActs} onJump={jumpTo} />

      <main>
        <FigmaActTransition actKey={`figma-act-${currentAct}`}>{scene}</FigmaActTransition>
      </main>

      <FigmaStakesHud
        currentAct={currentAct}
        mcpCallsCompleted={mcpCallsCompleted}
        designFidelityPct={designFidelityPct}
        cycleTimeRevealed={cycleTimeRevealed}
      />
    </div>
  );
}
