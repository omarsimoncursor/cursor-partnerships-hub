'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { OpusReasoningPane } from '../opus-reasoning-pane';
import { IdiomConstellation } from '../idiom-constellation';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-[22px] font-semibold leading-tight text-white md:text-[26px]">
              Cursor reads ten years of dialect in four minutes. Every quirk has a Snowflake answer.
            </h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-white/70">
              The GSI&apos;s discovery phase is six months of interviews and a 400-page PDF.
              Cursor does the same mechanical work — reading 63,180 lines of Teradata BTEQ,
              T-SQL, and Informatica XML — before the team finishes a second coffee. Every dialect
              idiom the legacy code leans on shows up in the constellation below, already mapped
              to its Snowflake equivalent.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A1221]/70 p-5">
            <IdiomConstellation revealed={revealed} />
          </div>

          <OpusReasoningPane autoplay />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <EmailThread
            label="Internal thread · #data-platform"
            tone="dark"
            messages={[
              {
                from: 'principal',
                to: 'VP Data & Analytics; Senior Data Engineer',
                time: 'Fri 8:14am',
                subject: 'Cursor finished indexing the legacy repo',
                body: (
                  <>
                    <p>
                      Four minutes. 63,180 lines across Teradata, SQL Server and Informatica, with
                      the full cross-dialect dependency graph. The GSI&apos;s discovery phase was
                      quoted at six months.
                    </p>
                    <p className="mt-2">
                      More importantly: it found that 37 of the BTEQ scripts share the same
                      revenue-rollup shape. If the first one translates cleanly, we get the next
                      36 nearly for free. That changes the shape of the roadmap, not just the
                      speed.
                    </p>
                  </>
                ),
                attachments: [{ label: 'idiom-surface-area.pdf' }],
              },
              {
                from: 'reviewer',
                to: 'Principal Data Engineer',
                time: 'Fri 8:26am',
                subject: 'Cursor finished indexing the legacy repo',
                body: (
                  <>
                    <p>
                      I looked at the idiom map. Nothing surprising — QUALIFY stays native,
                      MULTISET VOLATILE collapses to a CTE, COLLECT STATS disappears because
                      Snowflake maintains micro-partition stats automatically. That&apos;s the
                      translation I&apos;d have written by hand.
                    </p>
                    <p className="mt-2">
                      The part that matters to me: it hasn&apos;t touched a line of code yet. I
                      want to review the plan for the first asset before any commits land.
                    </p>
                  </>
                ),
              },
              {
                from: 'vp',
                to: 'Principal Data Engineer',
                time: 'Fri 8:48am',
                subject: 'Cursor finished indexing the legacy repo',
                body: (
                  <p>
                    Good. Draft the plan. Reviewer signs off on the plan before Cursor writes any
                    code. That&apos;s the gate we walk into the board meeting with.
                  </p>
                ),
              },
            ]}
          />

          <CursorValueCallout
            accent="#29B5E8"
            label="Why Cursor changes the discovery phase"
            headline="Cursor turns the most expensive six months of any migration into a morning of reading."
            body="Codebase-wide indexing plus reasoning across every file collapses the discovery phase the GSI was going to bill for — and hands your team a map of every dialect-specific construct, already paired with its Snowflake equivalent."
          />
        </div>
      </div>
    </ChapterStage>
  );
}
