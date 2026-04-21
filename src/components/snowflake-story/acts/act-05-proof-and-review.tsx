'use client';

import { useEffect, useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { CortexEquivalenceViz } from '../cortex-equivalence-viz';
import { PrReviewThread } from '../pr-review-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';
import { StepResult } from '../step-result';

type Step = 'verify-idle' | 'verify-running' | 'verify-done' | 'review-idle' | 'review-running' | 'review-done';

export function Act05ProofAndReview({ onAdvance, onOpenArtifact }: ActComponentProps) {
  const act = ACTS[4];
  const [step, setStep] = useState<Step>('verify-idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step !== 'verify-running') return;
    if (progress >= 1) {
      setStep('verify-done');
      return;
    }
    const t = setTimeout(() => setProgress((p) => Math.min(1, p + 0.08)), 280);
    return () => clearTimeout(t);
  }, [step, progress]);

  if (step === 'verify-idle' || step === 'verify-running' || step === 'verify-done') {
    const status = step === 'verify-idle' ? 'idle' : step === 'verify-running' ? 'running' : 'done';
    return (
      <ChapterStage act={act}>
        <StepStrip currentStep={1} />

        <StoryStep
          accent="#29B5E8"
          step="Step 1 of 2 · Verify"
          setting="Friday 12:22pm"
          question={
            <>
              Before showing it to the reviewer, the team needs proof the new model is{' '}
              <span className="text-[#7DD3F5]">numerically identical</span> to the legacy one.
              Cursor runs both in parallel on a 1% sample.
            </>
          }
          actuator={
            <StepActuator
              accent="#29B5E8"
              status={status}
              runLabel="Verify equivalence on a 1% sample"
              runSub="Row-level diff + Cortex semantic diff. About 30 seconds in real time."
              runningLabel="Comparing every row, every currency, every rank…"
              doneLabel="Equivalence confirmed"
              onRun={() => {
                setStep('verify-running');
                setProgress(0);
              }}
            />
          }
          result={
            step === 'verify-done' ? (
              <StepResult
                accent="#29B5E8"
                headline="Numerically identical to the legacy script — and Cortex confirms no semantic drift."
                stats={[
                  { label: 'Row Δ', value: '0', hint: '14,017 rows compared' },
                  { label: 'ΣUSD Δ', value: '$0.00', hint: 'revenue sums match' },
                  { label: 'Cortex verdict', value: 'no drift', hint: 'AI-judged equivalence' },
                ]}
                continueLabel="Continue · ask the reviewer to approve"
                onContinue={() => setStep('review-idle')}
              />
            ) : null
          }
          rail={
            <CursorValueCallout
              accent="#29B5E8"
              headline="Cursor proves the new code, then waits for permission."
              body="Two independent verifications — row-level and AI semantic. The reviewer doesn’t have to take Cursor&rsquo;s word for anything."
            />
          }
        >
          <CortexEquivalenceViz progress={status === 'idle' ? 0 : progress} />
        </StoryStep>
      </ChapterStage>
    );
  }

  // review beat
  const reviewStatus = step === 'review-idle' ? 'idle' : step === 'review-running' ? 'running' : 'done';
  return (
    <ChapterStage act={act}>
      <StepStrip currentStep={2} />

      <StoryStep
        accent="#A78BFA"
        step="Step 2 of 2 · Review"
        setting="Friday 12:48pm"
        question={
          <>
            Cursor opens a pull request. The reviewer reads it like any other PR — and pushes
            back twice before approving.
          </>
        }
        actuator={
          <StepActuator
            accent="#A78BFA"
            status={reviewStatus}
            runLabel="Open the PR for human review"
            runSub="Watch the reviewer’s comments come in. Cursor responds to each one."
            runningLabel="Review thread playing… two iteration cycles."
            doneLabel="Reviewer approved"
            onRun={() => {
              setStep('review-running');
              setTimeout(() => setStep('review-done'), 18_000);
            }}
          />
        }
        result={
          reviewStatus === 'done' ? (
            <StepResult
              accent="#A78BFA"
              headline="Approved. Asset #1 is ready to merge through the team’s normal change window."
              stats={[
                { label: 'Iteration cycles', value: '2', hint: 'rounding + deprecated FX' },
                { label: 'Total wall-clock', value: '4h 03m', hint: 'agent 2h 16m + review 1h 47m' },
                { label: 'Review approval', value: '✓', hint: 'normal change window' },
              ]}
              continueLabel="Continue · do that 910 more times"
              onContinue={onAdvance}
            />
          ) : null
        }
        rail={
          <>
            <CursorValueCallout
              accent="#A78BFA"
              headline="Cursor ships to the reviewer, never to production."
              body="Every iteration is logged in a real PR. The team’s quality bar stays exactly where it is — Cursor just gets there faster."
            />
            <button
              onClick={() => onOpenArtifact('pr')}
              className="rounded-xl border border-[#A78BFA]/40 bg-[#A78BFA]/10 px-4 py-2 text-left text-[12.5px] text-white/85 hover:bg-[#A78BFA]/15 cursor-pointer"
            >
              <span className="block font-mono text-[10.5px] uppercase tracking-wider text-[#C4B5FD]">
                Artifact
              </span>
              <span className="block">Open PR #318 in GitHub →</span>
            </button>
            <button
              onClick={() => onOpenArtifact('jira')}
              className="rounded-xl border border-[#0052CC]/40 bg-[#0052CC]/10 px-4 py-2 text-left text-[12.5px] text-white/85 hover:bg-[#0052CC]/15 cursor-pointer"
            >
              <span className="block font-mono text-[10.5px] uppercase tracking-wider text-[#82B1FF]">
                Artifact
              </span>
              <span className="block">Open Jira CUR-5202 timeline →</span>
            </button>
          </>
        }
      >
        {reviewStatus === 'idle' ? (
          <ReviewIdleHint />
        ) : (
          <PrReviewThread autoplay onOpenPr={() => onOpenArtifact('pr')} />
        )}
      </StoryStep>
    </ChapterStage>
  );
}

function StepStrip({ currentStep }: { currentStep: 1 | 2 }) {
  const steps = [
    { id: 1, label: 'Verify', accent: '#29B5E8' },
    { id: 2, label: 'Review', accent: '#A78BFA' },
  ];
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {steps.map((s) => {
        const done = s.id < currentStep;
        const active = s.id === currentStep;
        return (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-mono"
            style={{
              borderColor: active
                ? `${s.accent}55`
                : done
                  ? 'rgba(74,222,128,0.45)'
                  : 'rgba(255,255,255,0.10)',
              background: active ? `${s.accent}12` : done ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)',
              color: active ? s.accent : done ? '#4ADE80' : 'rgba(255,255,255,0.45)',
            }}
          >
            <span className="font-semibold">{s.id}</span>
            <span>{s.label}</span>
            {done && <span>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function ReviewIdleHint() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0A1221]/70 p-8 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#A78BFA]/40 bg-[#A78BFA]/10">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#A78BFA]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 6v12M18 6v12M6 6l12 12M18 6L6 18" />
        </svg>
      </div>
      <p className="max-w-sm text-[14px] font-medium text-white/80">
        Press the button above to open PR #318 for the reviewer.
      </p>
      <p className="mt-1 max-w-sm text-[12px] text-white/50">
        You&rsquo;ll see the reviewer&rsquo;s comments arrive, Cursor patch the code, and a final
        approval — exactly like a normal review.
      </p>
    </div>
  );
}
