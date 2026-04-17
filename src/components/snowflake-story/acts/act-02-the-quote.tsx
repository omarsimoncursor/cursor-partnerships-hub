'use client';

import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { GsiDeckFlipper } from '../gsi-deck-flipper';
import { CharacterDialogue } from '../character-dialogue';

export function Act02TheQuote(_: ActComponentProps) {
  const act = ACTS[1];
  return (
    <ChapterStage act={act}>
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#9CA3AF]">
                Conference room · Tuesday 4:12pm
              </span>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-semibold text-text-primary leading-tight mb-2">
              The incumbent GSI has a pitch deck. The CFO has a decision.
            </h2>
            <p className="text-[14px] text-text-secondary mb-6 max-w-2xl leading-relaxed">
              Apex Global Services has migrated Teradata shops before — on their timeline, on their
              margin, with their bench. It&apos;s a predictable, expensive, four-year path.
              Dana Whitaker doesn&apos;t like any of those three adjectives.
            </p>

            <GsiDeckFlipper />
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <CharacterDialogue
              autoplay
              maxVisible={4}
              lines={[
                {
                  character: 'gsi',
                  time: 'Tue 4:12pm',
                  meta: 'on-site presentation',
                  holdMs: 3600,
                  text: "Four years. $18 million. Fixed fee. Quarterly billing. We'll bring 14 engineers and your team provides subject-matter access. Predictable.",
                },
                {
                  character: 'cfo',
                  time: 'Tue 4:18pm',
                  meta: 'sticky note on the deck',
                  holdMs: 4000,
                  text: "We are not signing an $18M SOW for a 4-year engagement with this GSI. Find another path.",
                },
                {
                  character: 'samira',
                  time: 'Tue 4:31pm',
                  holdMs: 3400,
                  text: "The problem with the GSI pitch isn't the price. It's that Snowflake credits don't start flowing until year four. That's forty months I'm not retiring quota on this account.",
                },
                {
                  character: 'maya',
                  time: 'Tue 5:02pm',
                  holdMs: 3400,
                  text: "Their deck assumes my team is the bottleneck. If I can keep the keyboard — and lose the GSI middleman — I'll take the risk on Friday.",
                },
              ]}
            />

            <div className="rounded-xl border border-[#29B5E8]/25 bg-gradient-to-br from-[#0A1628]/90 to-[#071321]/90 px-5 py-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5] mb-1">
                What Cursor gets hired to prove on Friday
              </p>
              <p className="text-[14px] text-text-primary leading-relaxed">
                <strong>One asset, end-to-end, on Friday afternoon.</strong> If the daily revenue
                rollup lands on Snowflake with Cortex-verified equivalence and Jordan&apos;s
                approval, the 15-month roadmap becomes credible and the $18M SOW stays unsigned.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChapterStage>
  );
}
