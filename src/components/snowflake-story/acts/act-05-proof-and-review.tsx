'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CortexEquivalenceViz } from '../cortex-equivalence-viz';
import { PrReviewThread } from '../pr-review-thread';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { Sparkles } from 'lucide-react';

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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[#29B5E8]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5]">
              Friday 12:22pm · 1% row-equivalence + Cortex semantic diff
            </span>
          </div>
          <h2 className="text-[22px] md:text-[26px] font-semibold text-white leading-tight">
            Two data streams flow in. One verdict comes out.
          </h2>
          <p className="max-w-2xl text-[13.5px] text-white/70 leading-relaxed">
            Teradata&apos;s output and the new Snowflake model run in parallel over a 1% sample.
            Every row, every currency conversion, every top-10 rank is compared. Cortex reads both
            model descriptions and looks for semantic drift a row-level diff can&apos;t catch.
          </p>

          <CortexEquivalenceViz progress={progress} />

          <div className="rounded-2xl border border-white/10 bg-[#0A1221]/70 p-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5] mb-2">
              Proof artifacts
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <ProofTile label="Row Δ" value="0" active={progress > 0.4} />
              <ProofTile label="ΣUSD Δ" value="$0.00" active={progress > 0.6} />
              <ProofTile label="Cortex" value="no drift" active={progress > 0.88} />
            </div>
          </div>

          <EmailThread
            label="Internal thread · approval"
            tone="dark"
            messages={[
              {
                from: 'reviewer',
                to: 'Principal Data Engineer; VP Data & Analytics',
                time: 'Fri 3:47pm',
                subject: 'PR #318 · approved, queued for change window',
                body: (
                  <p>
                    Two review rounds. Cursor caught a deprecated FX rate the legacy BTEQ had
                    been silently dropping for two years — that alone would have been worth the
                    afternoon. Row-equivalence is zero, Cortex says no drift. Queuing for the
                    Friday 05:00 PT change window.
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
                    Asset #1 of 911 is real. Our reviewer stamped it. If the Friday change window
                    lands clean, I&apos;ll bring a 15-month roadmap to the board meeting — team
                    on the keyboard, Cursor doing the mechanical work, reviewer gates on every
                    merge.
                  </p>
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <PrReviewThread autoplay onOpenPr={() => onOpenArtifact('pr')} />

          <div className="flex items-center gap-3 rounded-xl border border-[#0052CC]/30 bg-[#0052CC]/5 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0052CC] text-[12px] font-bold text-white">
              J
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#82B1FF] mb-0.5">
                Jira · CUR-5202
              </p>
              <p className="text-[13px] text-white">
                Full workflow timeline — every review cycle, comment, and iteration.
              </p>
            </div>
            <button
              onClick={() => onOpenArtifact('jira')}
              className="px-3 py-1.5 rounded-full bg-[#0052CC] text-white text-[11.5px] font-semibold hover:bg-[#0A6DDE] cursor-pointer"
            >
              Open Jira ticket
            </button>
          </div>

          <CursorValueCallout
            accent="#A78BFA"
            label="Why review is the whole point"
            headline="Cursor ships to your reviewer, not to production. Your quality bar stays exactly where it is."
            body="Cortex-grade semantic diff, full row-equivalence, and every iteration — rounding, FX, the deprecated currency — logged in one auditable PR. Your reviewer is the last word, just like any other merge."
          />
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
        className="text-[10px] font-mono uppercase tracking-wider"
        style={{ color: active ? '#4ADE80' : 'rgba(237,236,236,0.35)' }}
      >
        {label}
      </p>
      <p
        className="text-[18px] font-mono font-semibold mt-0.5"
        style={{ color: active ? '#4ADE80' : 'rgba(237,236,236,0.45)' }}
      >
        {value}
      </p>
    </div>
  );
}
