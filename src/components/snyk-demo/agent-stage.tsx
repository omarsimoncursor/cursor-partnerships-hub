'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { AgentAvatar } from './agent-avatar';
import { LeakScene } from './scenes/leak-scene';
import { PathScene } from './scenes/path-scene';
import { PatchScene } from './scenes/patch-scene';
import { UpgradeScene } from './scenes/upgrade-scene';
import { ReplayScene } from './scenes/replay-scene';
import { PrScene } from './scenes/pr-scene';

/**
 * AgentStage — single full-width animated surface that plays a 6-chapter
 * story of the agent's work. Replaces v2's SDKOrchestrationPanel +
 * SDKCodePanel + SDKRunSummary + VulnFlowGraph.
 *
 * Each chapter is a self-contained scene component that owns its own
 * animation. The stage is just the chapter clock + the chrome around the
 * scene + the bottom progress strip.
 */

export type ChapterId = 'leak' | 'path' | 'patch' | 'upgrade' | 'replay' | 'pr';

export interface Chapter {
  id: ChapterId;
  title: string;
  /** One short verb shown on the agent avatar. */
  verb: string;
  /** Caption shown under the scene. Single sentence, plain English. */
  caption: string;
  /** Real wall-time the scene plays for, in ms. */
  durationMs: number;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'leak',
    title: 'Looking at the leak',
    verb: 'Looking',
    caption:
      'A bad pattern in the code lets one request return every customer record in the database.',
    durationMs: 3800,
  },
  {
    id: 'path',
    title: 'Tracing the path',
    verb: 'Tracing',
    caption:
      'The agent follows the bad input from the request, through the code, all the way down to the database.',
    durationMs: 3600,
  },
  {
    id: 'patch',
    title: 'Writing the patch',
    verb: 'Patching',
    caption:
      'The agent rewrites the unsafe line with two safe lines: a check for valid input and a parameterised query.',
    durationMs: 4200,
  },
  {
    id: 'upgrade',
    title: 'Bumping the dependency',
    verb: 'Upgrading',
    caption:
      'The agent also upgrades a vulnerable library that was flagged on the same code path.',
    durationMs: 3000,
  },
  {
    id: 'replay',
    title: 'Re-running the exploit',
    verb: 'Replaying',
    caption:
      'The same attack is fired again. This time the request bounces off the new check, and zero records leak.',
    durationMs: 3800,
  },
  {
    id: 'pr',
    title: 'Opening the pull request',
    verb: 'Opening',
    caption:
      'A pull request lands with the patch, the proof, and a green tick from every check, ready for a human reviewer.',
    durationMs: 3800,
  },
];

interface AgentStageProps {
  onComplete?: () => void;
}

export function AgentStage({ onComplete }: AgentStageProps) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const chapter = CHAPTERS[chapterIdx];
    if (!chapter) return;
    const t = setTimeout(() => {
      if (chapterIdx + 1 >= CHAPTERS.length) {
        setDone(true);
        onComplete?.();
      } else {
        setChapterIdx(i => i + 1);
      }
    }, chapter.durationMs);
    return () => clearTimeout(t);
  }, [chapterIdx, done, onComplete]);

  const chapter = CHAPTERS[Math.min(chapterIdx, CHAPTERS.length - 1)];

  return (
    <div className="w-full">
      {/* Stage chrome */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(76,68,203,0.12), transparent 55%), radial-gradient(circle at 90% 100%, rgba(225,29,72,0.06), transparent 50%), #0E0F2C',
          borderColor: 'rgba(76,68,203,0.30)',
          boxShadow: '0 24px 64px -24px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header row: avatar + chapter heading */}
        <div className="relative flex items-start justify-between gap-4 px-6 pt-5">
          <div className="flex items-center gap-4 min-w-0">
            <AgentAvatar verb={done ? 'Done' : chapter.verb} done={done} />
            <div className="min-w-0">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-text-tertiary mb-0.5">
                Step {Math.min(chapterIdx + 1, CHAPTERS.length)} of {CHAPTERS.length}
              </p>
              <h3 className="text-xl md:text-2xl font-semibold text-text-primary leading-tight">
                {chapter.title}
              </h3>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              Powered by
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10.5px] font-mono"
              style={{ background: 'rgba(76,68,203,0.15)', color: '#9F98FF', border: '1px solid rgba(76,68,203,0.30)' }}
            >
              Cursor SDK
            </span>
          </div>
        </div>

        {/* Scene area — fixed height keeps the stage from jumping between chapters */}
        <div className="relative px-6 pt-6 pb-3">
          <SceneFrame>
            <SceneRouter chapterId={chapter.id} done={done} />
          </SceneFrame>
        </div>

        {/* Caption */}
        <div className="px-6 pb-4">
          <p className="text-sm md:text-base text-text-secondary leading-relaxed text-center max-w-2xl mx-auto min-h-[44px]">
            {done
              ? 'All six steps complete. Open any artifact card below to inspect what the agent produced.'
              : chapter.caption}
          </p>
        </div>

        {/* Bottom progress strip */}
        <ProgressStrip chapterIdx={chapterIdx} done={done} />
      </div>
    </div>
  );
}

function SceneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-full rounded-xl border overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), #13142F',
        borderColor: '#23264F',
        height: 360,
      }}
    >
      {children}
    </div>
  );
}

function SceneRouter({ chapterId, done }: { chapterId: ChapterId; done: boolean }) {
  if (done) return <PrScene done />;
  switch (chapterId) {
    case 'leak':    return <LeakScene />;
    case 'path':    return <PathScene />;
    case 'patch':   return <PatchScene />;
    case 'upgrade': return <UpgradeScene />;
    case 'replay':  return <ReplayScene />;
    case 'pr':      return <PrScene />;
  }
}

function ProgressStrip({ chapterIdx, done }: { chapterIdx: number; done: boolean }) {
  return (
    <div className="border-t" style={{ borderColor: 'rgba(76,68,203,0.20)' }}>
      <div className="grid grid-cols-6">
        {CHAPTERS.map((c, i) => {
          const past = done || i < chapterIdx;
          const current = !done && i === chapterIdx;
          return (
            <div
              key={c.id}
              className="px-3 py-3 flex items-center gap-2 border-r last:border-r-0"
              style={{ borderColor: 'rgba(76,68,203,0.20)' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: past ? '#16A34A' : current ? '#4C44CB' : '#1A1C40',
                  color: past || current ? '#FFFFFF' : '#7C7CA0',
                }}
              >
                {past ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </span>
              <span
                className="text-[10.5px] font-medium truncate"
                style={{ color: past ? '#4ADE80' : current ? '#FFFFFF' : '#7C7CA0' }}
              >
                {c.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
