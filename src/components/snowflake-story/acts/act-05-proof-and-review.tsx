'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CortexEquivalenceViz } from '../cortex-equivalence-viz';
import { PrReviewThread } from '../pr-review-thread';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { Disclosure } from '../disclosure';

export function Act05ProofAndReview({ onOpenArtifact }: ActComponentProps) {
  const act = ACTS[4];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 1) return;
    const t = setTimeout(() => setProgress((p) => Math.min(1, p + 0.08)), 420);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <ChapterStage act={act}>
      <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-white/70">
        Teradata&rsquo;s output and the new Snowflake model run in parallel over a 1% sample.
        Every row, every currency, every top-10 rank is compared. Then Cortex reads both model
        descriptions for semantic drift a row diff can&rsquo;t catch.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
        <div className="flex flex-col gap-4">
          <CortexEquivalenceViz progress={progress} />

          <div className="grid grid-cols-3 gap-2 text-center">
            <ProofTile label="Row Δ" value="0" active={progress > 0.4} />
            <ProofTile label="ΣUSD Δ" value="$0.00" active={progress > 0.6} />
            <ProofTile label="Cortex" value="no drift" active={progress > 0.88} />
          </div>

          <CursorValueCallout
            accent="#A78BFA"
            label="Why review is the whole point"
            headline="Cursor ships to your reviewer, not to production."
            body="Cortex-grade semantic diff, full row-equivalence, every iteration logged in one auditable PR. Your reviewer is the last word, just like any other merge."
          />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <PrReviewThread autoplay onOpenPr={() => onOpenArtifact('pr')} />

          <Disclosure
            label="Read the leadership thread"
            meta="2 messages · reviewer → VP → CFO"
            icon={<Mail className="h-3 w-3" />}
            accent="#A78BFA"
          >
            <div className="pt-1">
              <EmailThread
                label="Inbox · Acme · Leadership"
                tone="dark"
                messages={[
                  {
                    from: 'reviewer',
                    to: 'Principal Data Engineer',
                    cc: ['VP Data & Analytics'],
                    time: 'Fri 3:47pm',
                    subject: 'PR #318 · approved, queued for change window',
                    body: (
                      <p>
                        Two review rounds. Cursor caught a deprecated FX rate the legacy BTEQ had
                        been silently dropping for two years. Row-equivalence is zero, Cortex
                        says no drift. Queuing for the Friday 05:00 PT change window.
                      </p>
                    ),
                  },
                  {
                    from: 'vp',
                    to: 'CFO',
                    time: 'Fri 4:06pm',
                    subject: 'FW: PR #318 · approved, queued for change window',
                    body: (
                      <p>
                        Asset #1 of 911 is real. Our reviewer stamped it. If the Friday change
                        window lands clean, I&rsquo;ll bring a 15-month roadmap to the board
                        meeting — team on the keyboard, Cursor doing the mechanical work,
                        reviewer gates on every merge.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </Disclosure>

          <button
            onClick={() => onOpenArtifact('jira')}
            className="flex items-center gap-3 rounded-xl border border-[#0052CC]/30 bg-[#0052CC]/5 px-4 py-3 text-left transition-colors hover:bg-[#0052CC]/10 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0052CC] text-[12px] font-bold text-white">
              J
            </div>
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-[11px] uppercase tracking-wider text-[#82B1FF]">
                Jira · CUR-5202
              </p>
              <p className="text-[13px] text-white">Open the full workflow timeline →</p>
            </div>
          </button>
        </div>
      </div>
    </ChapterStage>
  );
}

function ProofTile({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{
        borderColor: active ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)',
        background: active ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-wider"
        style={{ color: active ? '#4ADE80' : 'rgba(237,236,236,0.35)' }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 font-mono text-[18px] font-semibold"
        style={{ color: active ? '#4ADE80' : 'rgba(237,236,236,0.45)' }}
      >
        {value}
      </p>
    </div>
  );
}
