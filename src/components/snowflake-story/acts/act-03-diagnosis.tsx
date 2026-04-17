'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { OpusReasoningPane } from '../opus-reasoning-pane';
import { IdiomConstellation } from '../idiom-constellation';
import { CharacterDialogue } from '../character-dialogue';
import { IDIOMS } from '../story-data';

export function Act03Diagnosis(_: ActComponentProps) {
  const act = ACTS[2];
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setRevealed(Math.min(IDIOMS.length, i));
      if (i < IDIOMS.length) id = window.setTimeout(tick, 700);
    };
    let id = window.setTimeout(tick, 2200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <ChapterStage act={act}>
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7DD3F5]">
                  Friday 8:04am · Cursor indexes the repo
                </span>
              </div>
              <h2 className="text-[24px] md:text-[30px] font-semibold text-text-primary leading-tight mb-2">
                Every dialect idiom surfaces. Every one has a Snowflake equivalent.
              </h2>
              <p className="text-[14px] text-text-secondary mb-6 max-w-2xl leading-relaxed">
                Opus reads 63,180 lines of BTEQ, T-SQL, and Informatica XML in the time it takes
                Maya to pour coffee. The constellation below is the full idiom surface area for
                the 911-asset portfolio. Click a node to see the Snowflake equivalent.
              </p>
              <IdiomConstellation revealed={revealed} />
            </div>

            <OpusReasoningPane autoplay />
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <CharacterDialogue
              autoplay
              maxVisible={4}
              lines={[
                {
                  character: 'cursor',
                  time: '8:04am',
                  holdMs: 2800,
                  text: "Indexing acme-analytics/legacy-elt/ at HEAD. 911 assets · 63,180 LOC · 4 dialects · 2,417 dependency edges.",
                },
                {
                  character: 'cursor',
                  time: '8:08am',
                  holdMs: 3600,
                  text: "Seven dialect idioms cover 94% of the BTEQ and T-SQL footprint. 37 BTEQ scripts share the revenue-rollup shape — template reuse will compound.",
                },
                {
                  character: 'maya',
                  time: '8:12am',
                  holdMs: 3400,
                  text: "Four minutes. Apex's discovery phase was six months. I'm just going to sit with that for a second.",
                },
                {
                  character: 'samira',
                  time: '8:13am',
                  holdMs: 3200,
                  text: "This is the part I couldn't demo in a deck. Cursor hasn't touched a line of code yet — it's earned the right to.",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </ChapterStage>
  );
}
