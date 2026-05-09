'use client';

import { useCallback, useEffect, useState } from 'react';
import { ACTS } from './story-types';
import { ChapterNav } from './chapter-nav';
import { ChapterCurtain } from './chapter-curtain';
import { Act01ColdStart } from './acts/act-01-cold-start';
import { Act02Architecture } from './acts/act-02-architecture';
import { Act03Orient } from './acts/act-03-orient';
import { Act04Vault } from './acts/act-04-vault';
import { Act05Closeout } from './acts/act-05-closeout';
import { Act06EndCard } from './acts/act-06-endcard';

export function ChapterOrchestrator() {
  const [currentIndex, setCurrentIndex] = useState(0);
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
    goTo(0);
  }, [goTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
  }, [onNext, onPrev, onRestart]);

  const act = ACTS[currentIndex];
  const commonProps = { onAdvance: onNext, isActive: true };

  return (
    <div className="relative min-h-screen bg-[#05060B] text-text-primary">
      <ChapterNav
        currentIndex={currentIndex}
        onJump={goTo}
        onPrev={onPrev}
        onNext={onNext}
        onRestart={onRestart}
      />
      <ChapterCurtain triggerKey={transitionKey} />
      <div key={`act-${currentIndex}`} className="relative">
        {act.id === 'cold-start' && <Act01ColdStart {...commonProps} />}
        {act.id === 'architecture' && <Act02Architecture {...commonProps} />}
        {act.id === 'orient' && <Act03Orient {...commonProps} />}
        {act.id === 'vault' && <Act04Vault {...commonProps} />}
        {act.id === 'closeout' && <Act05Closeout {...commonProps} />}
        {act.id === 'endcard' && (
          <Act06EndCard {...commonProps} onAdvance={onRestart} />
        )}
      </div>
    </div>
  );
}
