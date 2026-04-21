'use client';

import { useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { CursorValueCallout } from '../cursor-value-callout';
import { StoryStep } from '../story-step';
import { StepActuator } from '../step-actuator';

export function Act01TheWall({ onAdvance }: ActComponentProps) {
  const act = ACTS[0];
  const [hovered, setHovered] = useState(false);

  return (
    <ChapterStage act={act}>
      <StoryStep
        step="The setup · 1 of 1"
        setting="Tuesday 9:42pm · Acme Analytics"
        accent="#F59E0B"
        question={
          <>
            A retailer&rsquo;s data team has{' '}
            <span className="text-[#F59E0B]">911 legacy data scripts</span> they need to move to
            Snowflake. <span className="text-white/70">Two people on the team can still read them.</span>
          </>
        }
        actuator={
          <StepActuator
            status={hovered ? 'done' : 'idle'}
            accent="#F59E0B"
            runLabel="Hover any tile to inspect a script"
            runSub="Each square is one script. Grey = legacy. The lit one is where the team will start."
            doneLabel="You&rsquo;ve seen the wall"
            continueLabel="Continue · meet the GSI quote"
            onContinue={onAdvance}
            onRun={() => setHovered(true)}
          />
        }
        rail={
          <CursorValueCallout
            accent="#29B5E8"
            label="Why this is the moment for Cursor"
            headline="Cursor multiplies the two people who actually understand the legacy code."
            body="They&rsquo;re not the bottleneck — they&rsquo;re the asset. Cursor reads, drafts, and writes in their dialect; they keep the keyboard."
          />
        }
      >
        <div
          className="rounded-2xl border border-white/10 bg-[#0A1221]/80 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)]"
          onMouseEnter={() => setHovered(true)}
        >
          <AssetWall
            modernizedThrough={0}
            heroBrickId={0}
            interactive={true}
            onBrickHover={(b) => {
              if (b) setHovered(true);
            }}
          />
          <p className="mt-4 text-center text-[11.5px] text-white/55">
            <span className="text-[#29B5E8]">The lit square</span> is the asset Cursor will tackle
            on Friday. Hover any other square to see what one script looks like.
          </p>
        </div>
      </StoryStep>
    </ChapterStage>
  );
}
