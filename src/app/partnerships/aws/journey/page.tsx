'use client';

import { useCallback, useMemo, useState } from 'react';
import { StorySpine } from '@/components/aws-journey/story-spine';
import { StakesHud } from '@/components/aws-journey/stakes-hud';
import { ActTransition } from '@/components/aws-journey/act-transition';
import { Prologue } from '@/components/aws-journey/prologue';
import { Act1Room } from '@/components/aws-journey/acts/act-1-room';
import { Act2Atlas } from '@/components/aws-journey/acts/act-2-atlas';
import { Act3Whiteboard } from '@/components/aws-journey/acts/act-3-whiteboard';
import { Act4Build } from '@/components/aws-journey/acts/act-4-build';
import { Act5Crucible } from '@/components/aws-journey/acts/act-5-crucible';
import { Act6Cutover } from '@/components/aws-journey/acts/act-6-cutover';
import { Act7Portfolio } from '@/components/aws-journey/acts/act-7-portfolio';
import type { ActId } from '@/components/aws-journey/acts/act-theme';

/**
 * `Stage` represents the page's outer state machine. The journey opens on a
 * calm `prologue` that sets the table, then transitions into the seven-act
 * journey. The spine + Stakes HUD only appear once the user has begun, so
 * the prologue feels like the cover of the demo, not a numbered scene.
 */
type Stage = 'prologue' | { act: ActId };

export default function AwsJourneyPage() {
  const [stage, setStage] = useState<Stage>('prologue');
  const [unlockedActs, setUnlockedActs] = useState<Set<ActId>>(() => new Set<ActId>([1]));
  const [gatesPassed, setGatesPassed] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [arrRevealed, setArrRevealed] = useState(false);
  const [runCostRevealed, setRunCostRevealed] = useState(false);

  const inJourney = stage !== 'prologue';
  const currentAct: ActId = inJourney ? stage.act : 1;

  const beginJourney = useCallback(() => {
    setStage({ act: 1 });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

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
    setStage({ act: next });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const jumpTo = useCallback(
    (act: ActId) => {
      if (!unlockedActs.has(act)) return;
      setStage({ act });
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [unlockedActs],
  );

  const replay = useCallback(() => {
    setGatesPassed(0);
    setArrRevealed(false);
    setRunCostRevealed(false);
    setUnlockedActs(new Set<ActId>([1]));
    setStage('prologue');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scene = useMemo(() => {
    if (!inJourney) return <Prologue onBegin={beginJourney} />;
    switch (stage.act) {
      case 1: return <Act1Room onAdvance={() => advanceTo(2)} />;
      case 2: return <Act2Atlas onAdvance={() => advanceTo(3, { reveal: 'arr' })} />;
      case 3: return <Act3Whiteboard onAdvance={() => advanceTo(4, { gate: true })} />;
      case 4: return <Act4Build onAdvance={() => advanceTo(5, { gate: true })} />;
      case 5: return <Act5Crucible onAdvance={() => advanceTo(6, { gate: true, reveal: 'runcost' })} />;
      case 6: return <Act6Cutover onAdvance={() => advanceTo(7, { gate: true })} />;
      case 7: return <Act7Portfolio onReplay={replay} />;
    }
  }, [inJourney, stage, advanceTo, replay, beginJourney]);

  const sceneKey = inJourney ? `act-${stage.act}` : 'prologue';

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/*
       * Spine + Stakes HUD only appear once the user has begun the journey.
       * The prologue is the cover of the demo — no progress dots, no live
       * countdown, just orientation.
       */}
      {inJourney && (
        <StorySpine currentAct={currentAct} unlockedActs={unlockedActs} onJump={jumpTo} />
      )}

      <main>
        <ActTransition actKey={sceneKey}>{scene}</ActTransition>
      </main>

      {inJourney && (
        <StakesHud
          currentAct={currentAct}
          gatesPassed={gatesPassed}
          arrRevealed={arrRevealed}
          runCostRevealed={runCostRevealed}
        />
      )}
    </div>
  );
}
