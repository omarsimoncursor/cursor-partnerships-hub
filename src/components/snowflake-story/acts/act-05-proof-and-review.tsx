'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CortexEquivalenceViz } from '../cortex-equivalence-viz';
import { PrReviewThread } from '../pr-review-thread';
import { CharacterAvatar } from '../character-avatar';
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
      <div className="relative z-10 px-6 md:px-12 pb-32 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-4 h-4 text-[#29B5E8]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7DD3F5]">
                Friday 12:22pm · 1% row-equivalence + Cortex semantic diff
              </span>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-semibold text-text-primary leading-tight mb-2">
              Two data streams flow in. One verdict comes out.
            </h2>
            <p className="text-[14px] text-text-secondary mb-5 max-w-2xl leading-relaxed">
              Teradata&apos;s output and the new Snowflake dbt model run in parallel over a 1%
              sample. Every row, every currency conversion, every top-10 rank is compared.
              Cortex AI reads both model descriptions and looks for semantic drift that
              row-level diffs can&apos;t catch.
            </p>
            <CortexEquivalenceViz progress={progress} />

            <div className="mt-5 rounded-xl border border-white/10 bg-[#0A1221]/70 backdrop-blur p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7DD3F5] mb-2">
                Proof artifacts
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <ProofTile label="Row Δ" value="0" active={progress > 0.4} />
                <ProofTile label="ΣUSD Δ" value="$0.00" active={progress > 0.6} />
                <ProofTile label="Cortex" value="no drift" active={progress > 0.88} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <CharacterAvatar character="jordan" size="sm" />
              <div>
                <p className="text-[11.5px] text-text-secondary">
                  <span className="text-[#A78BFA] font-semibold">Jordan Park</span> opens PR #318
                  from Raleigh. He&apos;s shipped 40+ reviews this quarter.
                </p>
              </div>
            </div>

            <PrReviewThread autoplay onOpenPr={() => onOpenArtifact('pr')} />

            <div className="rounded-xl border border-[#0052CC]/30 bg-[#0052CC]/5 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#0052CC] flex items-center justify-center text-white font-bold text-[12px]">
                J
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#82B1FF] mb-0.5">
                  Jira · CUR-5202
                </p>
                <p className="text-[13px] text-text-primary">
                  Ticket timeline shows every review cycle, comment, and iteration.
                </p>
              </div>
              <button
                onClick={() => onOpenArtifact('jira')}
                className="px-3 py-1.5 rounded-full bg-[#0052CC] text-white text-[11.5px] font-semibold hover:bg-[#0A6DDE] cursor-pointer"
              >
                Open Jira ticket
              </button>
            </div>
          </div>
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
