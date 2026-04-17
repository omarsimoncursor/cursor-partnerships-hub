'use client';

import { useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { CharacterDialogue } from '../character-dialogue';
import { AlertOctagon, Clock } from 'lucide-react';

export function Act01TheWall(_: ActComponentProps) {
  const act = ACTS[0];
  const [_hoveredCount, setHoveredCount] = useState(0);

  return (
    <ChapterStage act={act}>
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-8 items-start">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <AlertOctagon className="w-4 h-4 text-[#F59E0B]" />
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#F59E0B]">
                Acme Analytics · modernization debt
              </p>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-semibold text-text-primary leading-tight mb-2">
              Every grey brick is a script that only two people on the team still understand.
            </h2>
            <p className="text-[14px] text-text-secondary mb-6 max-w-2xl leading-relaxed">
              911 legacy ELT assets across Teradata BTEQ, SQL Server T-SQL, Informatica, and SSIS.
              Business logic accreted over a decade. The daily revenue rollup last succeeded
              14 hours ago. Q2 close starts Monday.
            </p>

            <div className="rounded-xl border border-white/10 bg-[#0A1221]/75 backdrop-blur p-5">
              <AssetWall
                modernizedThrough={0}
                heroBrickId={0}
                interactive={true}
                onBrickHover={(b) => setHoveredCount((n) => (b ? n + 1 : n))}
              />
              <p className="mt-4 text-[11px] text-text-tertiary font-mono text-center">
                Hover any brick to see the filename and when it was last touched.{' '}
                <span className="text-[#29B5E8]">
                  The one lit brick is where Cursor starts on Friday.
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-[#F59E0B]/25 bg-[#F59E0B]/5 px-4 py-3 flex items-start gap-3">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B] mt-1 shrink-0" />
              <div>
                <p className="text-[10.5px] font-mono uppercase tracking-wider text-[#F59E0B] mb-0.5">
                  Revenue mart staleness
                </p>
                <p className="text-[14px] font-semibold text-text-primary">
                  14h 22m since last success
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Finance is asking for the Q2 close in 3 days.
                </p>
              </div>
            </div>

            <CharacterDialogue
              autoplay
              maxVisible={4}
              lines={[
                {
                  character: 'maya',
                  time: '9:42pm',
                  meta: '#data-platform',
                  holdMs: 3600,
                  text: "It's the same wall I've been staring at for three years. Seventeen of these rollups feed the close. If one more fails I'm explaining it to the CFO on Monday.",
                },
                {
                  character: 'maya',
                  time: '9:43pm',
                  holdMs: 3400,
                  text: "Fifteen years of Teradata. Two of us can still read the BTEQ. Both of us already turned down the GSI's quote.",
                },
                {
                  character: 'samira',
                  time: '9:45pm',
                  meta: 'Snowflake AE',
                  holdMs: 3200,
                  text: "Maya — I know this is the fifth quarter in a row we've talked about modernization. I want to try something different on Friday. Can you give me four hours?",
                },
                {
                  character: 'maya',
                  time: '9:47pm',
                  holdMs: 3200,
                  text: "If it doesn't land the daily revenue rollup by end-of-day I'm not doing another pilot. I'm just buying more Teradata support.",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </ChapterStage>
  );
}
