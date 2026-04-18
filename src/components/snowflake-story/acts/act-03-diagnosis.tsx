'use client';

import { useEffect, useState } from 'react';
import { Activity, Sparkles } from 'lucide-react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { OpusReasoningPane } from '../opus-reasoning-pane';
import { IdiomConstellation } from '../idiom-constellation';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { Disclosure } from '../disclosure';
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
      <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-white/70">
        Cursor reads 63,180 lines of Teradata BTEQ, T-SQL, and Informatica XML before the team
        finishes a second coffee. Every dialect idiom the legacy code leans on shows up below —
        already mapped to its Snowflake equivalent.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <IdiomConstellation revealed={revealed} />

          <Disclosure
            label="See Cursor&rsquo;s reasoning log"
            meta="13 steps · under 4 minutes wall-clock"
            icon={<Activity className="h-3 w-3" />}
            accent="#7DD3F5"
          >
            <OpusReasoningPane autoplay />
          </Disclosure>
        </div>

        <div className="flex flex-col gap-4">
          <CursorValueCallout
            accent="#29B5E8"
            label="Why Cursor changes the discovery phase"
            headline="Six months of GSI discovery collapses into one morning of reading."
            body="Codebase-wide indexing plus reasoning across every file hands the team a map of every dialect-specific construct, already paired with its Snowflake equivalent."
          />

          <Disclosure
            label="Read the internal thread"
            meta="3 messages · principal → VP → reviewer"
            icon={<Sparkles className="h-3 w-3" />}
            accent="#7DD3F5"
            defaultOpen
          >
            <div className="pt-1">
              <EmailThread
                label="Inbox · Acme · #data-platform"
                tone="dark"
                messages={[
                  {
                    from: 'principal',
                    to: 'VP Data & Analytics',
                    cc: ['Senior Data Engineer'],
                    time: 'Fri 8:14am',
                    subject: 'Cursor finished indexing the legacy repo',
                    body: (
                      <>
                        <p>
                          Four minutes. 63,180 lines across Teradata, SQL Server and Informatica,
                          with the full cross-dialect dependency graph. The GSI quoted six months
                          for the same phase.
                        </p>
                        <p className="mt-2">
                          Better: it found 37 of the BTEQ scripts share the same
                          revenue-rollup shape. If asset #1 translates cleanly, the next 36 are
                          nearly free.
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
                      <p>
                        Idiom map looks right — QUALIFY stays native, MULTISET VOLATILE collapses
                        to a CTE, COLLECT STATS disappears. I want to review the plan for asset
                        #1 before any code lands.
                      </p>
                    ),
                  },
                  {
                    from: 'vp',
                    to: 'Principal Data Engineer',
                    time: 'Fri 8:48am',
                    subject: 'Cursor finished indexing the legacy repo',
                    body: (
                      <p>
                        Good. That&apos;s the gate we walk into the board meeting with: your
                        reviewer approves the plan before Cursor writes a line.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </Disclosure>
        </div>
      </div>
    </ChapterStage>
  );
}
