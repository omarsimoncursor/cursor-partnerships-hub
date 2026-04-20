'use client';

import { useCallback, useMemo, useState } from 'react';
import { StorySpine } from '@/components/aws-journey/story-spine';
import { StakesHud } from '@/components/aws-journey/stakes-hud';
import { ActTransition } from '@/components/aws-journey/act-transition';
import { Act1Room } from '@/components/aws-journey/acts/act-1-room';
import { Act2Atlas } from '@/components/aws-journey/acts/act-2-atlas';
import { Act3Whiteboard } from '@/components/aws-journey/acts/act-3-whiteboard';
import { Act4Build } from '@/components/aws-journey/acts/act-4-build';
import { Act5Crucible } from '@/components/aws-journey/acts/act-5-crucible';
import { Act6Cutover } from '@/components/aws-journey/acts/act-6-cutover';
import { Act7Portfolio } from '@/components/aws-journey/acts/act-7-portfolio';
import type { ActId } from '@/components/aws-journey/acts/act-theme';

export default function AwsJourneyPage() {
  const [currentAct, setCurrentAct] = useState<ActId>(1);
  const [unlockedActs, setUnlockedActs] = useState<Set<ActId>>(() => new Set<ActId>([1]));
  const [gatesPassed, setGatesPassed] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [arrRevealed, setArrRevealed] = useState(false);
  const [runCostRevealed, setRunCostRevealed] = useState(false);

  const advanceTo = useCallback((next: ActId, opts?: { gate?: boolean; reveal?: 'arr' | 'runcost' }) => {
    setUnlockedActs((prev) => {
      const copy = new Set(prev);
      copy.add(next);
      return copy;
    });
    if (opts?.gate) {
      setGatesPassed((g) => (Math.min(4, g + 1) as 0 | 1 | 2 | 3 | 4));
    }
    if (opts?.reveal === 'arr') setArrRevealed(true);
    if (opts?.reveal === 'runcost') setRunCostRevealed(true);
    setCurrentAct(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const jumpTo = useCallback(
    (act: ActId) => {
      if (!unlockedActs.has(act)) return;
      setCurrentAct(act);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [unlockedActs],
  );

  const replay = useCallback(() => {
    setCurrentAct(1);
    setGatesPassed(0);
    setArrRevealed(false);
    setRunCostRevealed(false);
    setUnlockedActs(new Set<ActId>([1]));
  }, []);

  const scene = useMemo(() => {
    switch (currentAct) {
      case 1: return <Act1Room onAdvance={() => advanceTo(2)} />;
      case 2: return <Act2Atlas onAdvance={() => advanceTo(3, { reveal: 'arr' })} />;
      case 3: return <Act3Whiteboard onAdvance={() => advanceTo(4, { gate: true })} />;
      case 4: return <Act4Build onAdvance={() => advanceTo(5, { gate: true })} />;
      case 5: return <Act5Crucible onAdvance={() => advanceTo(6, { gate: true, reveal: 'runcost' })} />;
      case 6: return <Act6Cutover onAdvance={() => advanceTo(7, { gate: true })} />;
      case 7: return <Act7Portfolio onReplay={replay} />;
    }
  }, [currentAct, advanceTo, replay]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <StorySpine currentAct={currentAct} unlockedActs={unlockedActs} onJump={jumpTo} />

      <main>
        <ActTransition actKey={`act-${currentAct}`}>{scene}</ActTransition>
      </main>

      <StakesHud
        currentAct={currentAct}
        gatesPassed={gatesPassed}
        arrRevealed={arrRevealed}
        runCostRevealed={runCostRevealed}
      />
    </div>
  );
}
