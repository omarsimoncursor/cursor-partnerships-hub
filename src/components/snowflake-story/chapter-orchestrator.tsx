'use client';

import { useCallback, useEffect, useState } from 'react';
import { ACTS, type StoryArtifact } from './story-types';
import { ChapterNav } from './chapter-nav';
import { ChapterCurtain } from './chapter-curtain';
import { Act01TheWall } from './acts/act-01-the-wall';
import { Act02TheQuote } from './acts/act-02-the-quote';
import { Act03Diagnosis } from './acts/act-03-diagnosis';
import { Act04FirstAsset } from './acts/act-04-first-asset';
import { Act05ProofAndReview } from './acts/act-05-proof-and-review';
import { Act06Scale } from './acts/act-06-scale';
import { Act07MorningAfter } from './acts/act-07-morning-after';
import { ArtifactHost } from './artifacts/artifact-host';

export function ChapterOrchestrator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [artifact, setArtifact] = useState<StoryArtifact | null>(null);
  const [transitionKey, setTransitionKey] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(ACTS.length - 1, next));
      if (clamped === currentIndex) return;
      setTransitionKey((k) => k + 1);
      setTimeout(() => {
        setCurrentIndex(clamped);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 280);
    },
    [currentIndex]
  );

  const onPrev = useCallback(() => {
    if (currentIndex === 0) return;
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const onNext = useCallback(() => {
    if (currentIndex >= ACTS.length - 1) {
      goTo(0);
      return;
    }
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const onRestart = useCallback(() => {
    setArtifact(null);
    goTo(0);
  }, [goTo]);

  const onOpenArtifact = useCallback((a: StoryArtifact) => setArtifact(a), []);
  const onCloseArtifact = useCallback(() => setArtifact(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (artifact) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCloseArtifact();
        }
        return;
      }
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [artifact, onNext, onPrev, onRestart, onCloseArtifact]);

  const act = ACTS[currentIndex];
  const commonProps = {
    onAdvance: onNext,
    onOpenArtifact,
    isActive: true,
  };

  return (
    <div className="relative min-h-screen bg-[#05080F] text-text-primary">
      <ChapterNav
        currentIndex={currentIndex}
        onJump={goTo}
        onPrev={onPrev}
        onNext={onNext}
        onRestart={onRestart}
      />
      <ChapterCurtain triggerKey={transitionKey} />
      <div key={`act-${currentIndex}`} className="relative">
        {act.id === 'the-wall' && <Act01TheWall {...commonProps} />}
        {act.id === 'the-quote' && <Act02TheQuote {...commonProps} />}
        {act.id === 'diagnosis' && <Act03Diagnosis {...commonProps} />}
        {act.id === 'first-asset' && <Act04FirstAsset {...commonProps} />}
        {act.id === 'proof-and-review' && <Act05ProofAndReview {...commonProps} />}
        {act.id === 'scale' && <Act06Scale {...commonProps} />}
        {act.id === 'morning-after' && (
          <Act07MorningAfter {...commonProps} onAdvance={onRestart} />
        )}
      </div>
      <ArtifactHost artifact={artifact} onClose={onCloseArtifact} />
    </div>
  );
}
