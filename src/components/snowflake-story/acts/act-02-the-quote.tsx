'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Database,
  GitBranch,
  GitPullRequest,
  Layers,
} from 'lucide-react';
import { ChapterStage, ChapterHeader } from '../chapter-stage';
import { CursorLogo } from '../cursor-logo';
import { AccelerationTile } from '../acceleration-tile';
import { CalendarWidget } from '../time/calendar-widget';
import { IdiomConstellation } from '../idiom-constellation';
import { ACTS, type ActComponentProps } from '../story-types';
import { IDIOMS } from '../story-data';
import { ACT_TIMING } from '../data/script';

/**
 * Act 2 · Discover.
 *
 * Cursor scans the 911-asset legacy ELT repo and lays out an "atlas" of every
 * dialect quirk it finds. The viewer sees findings appear in real time, then
 * Cursor recommends a starting asset.
 *
 * Mirrors AWS journey Act 2&rsquo;s 3-column layout: findings rail, focal viz,
 * recommendation card with the act-advance button.
 */
export function Act02TheQuote({ onAdvance }: ActComponentProps) {
  const act = ACTS[1];
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const total = IDIOMS.length;
    const stepMs = ACT_TIMING.act2ScanDurationMs / total;
    let i = 0;
    const tick = () => {
      i += 1;
      setRevealed(Math.min(total, i));
      if (i < total) id = window.setTimeout(tick, stepMs);
    };
    let id = window.setTimeout(tick, 600);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <ChapterStage
      act={act}
      topRight={
        <CalendarWidget
          currentDay={1}
          contextLabel="Discover"
          accent="#7DD3F5"
          darkMode
        />
      }
    >
      <ChapterHeader
        act={act}
        eyebrow="Cursor Cloud Agent reads 63,180 lines of BTEQ, T-SQL and Informatica before the team finishes a coffee. One right answer for the starting asset."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_320px]">
        {/* Left rail: findings */}
        <aside
          className="flex flex-col gap-3 rounded-xl border p-4"
          style={{
            background: 'rgba(125, 211, 245, 0.04)',
            borderColor: 'rgba(125, 211, 245, 0.18)',
          }}
        >
          <div className="flex items-center gap-2">
            <CursorLogo size={16} tone="dark" />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#7DD3F5' }}
            >
              Cursor Cloud Agent · Discovery
            </span>
          </div>

          <ul className="space-y-3">
            <Finding n="911" label="legacy ELT scripts indexed" icon={<Layers className="h-4 w-4" />} />
            <Finding
              n="63,180"
              label="lines of code parsed"
              icon={<Database className="h-4 w-4" />}
            />
            <Finding
              n={`${IDIOMS.length}`}
              label="dialect quirks mapped to Snowflake"
              icon={<GitBranch className="h-4 w-4" />}
            />
            <Finding
              n="2,417"
              label="cross-dialect dependency edges"
              icon={<Clock className="h-4 w-4" />}
            />
            <Finding
              n="4"
              label="silent bugs in the legacy logic"
              icon={<AlertTriangle className="h-4 w-4" />}
              accent="#EF4444"
            />
          </ul>

          <AccelerationTile taskId="codebase-scan" tone="dark" variant="card" />

          <div
            className="rounded-md border px-3 py-2 font-mono text-[10px] leading-relaxed"
            style={{
              background: 'rgba(125, 211, 245, 0.05)',
              borderColor: 'rgba(125, 211, 245, 0.2)',
              color: 'rgba(229,231,235,0.7)',
            }}
          >
            Cursor Cloud Agent + Snowflake Cortex
            <br />4 minutes wall-clock · <span style={{ color: '#7EE787' }}>$0</span> additional cost
          </div>
        </aside>

        {/* Center: idiom constellation */}
        <div
          className="relative overflow-hidden rounded-xl border"
          style={{
            minHeight: 540,
            background:
              'radial-gradient(ellipse at center, rgba(125,211,245,0.06) 0%, transparent 60%)',
            borderColor: 'rgba(125,211,245,0.18)',
          }}
        >
          <div
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-md border bg-[#0B1220]/85 px-2.5 py-1.5"
            style={{ borderColor: 'rgba(125,211,245,0.2)' }}
          >
            <CursorLogo size={14} tone="dark" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7DD3F5]">
              Cursor reading repo · {revealed} / {IDIOMS.length} quirks mapped
            </span>
          </div>

          <div className="px-4 py-12">
            <IdiomConstellation revealed={revealed} />
          </div>
        </div>

        {/* Right: Cursor's recommendation */}
        <aside
          className="flex h-fit flex-col gap-4 rounded-xl border p-5"
          style={{
            background:
              'linear-gradient(180deg, rgba(41,181,232,0.10) 0%, rgba(41,181,232,0.02) 100%)',
            borderColor: 'rgba(41,181,232,0.3)',
          }}
        >
          <div
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#29B5E8' }}
          >
            <CursorLogo size={14} tone="dark" />
            Cursor recommends
          </div>

          <div>
            <div
              className="mb-1 text-[10px] uppercase tracking-wider"
              style={{ color: 'rgba(229,231,235,0.55)' }}
            >
              Start with
            </div>
            <h3 className="font-mono text-2xl font-bold leading-tight" style={{ color: '#29B5E8' }}>
              daily_revenue_rollup.bteq
            </h3>
          </div>

          <ul
            className="space-y-2 text-[12px] leading-relaxed"
            style={{ color: 'rgba(229,231,235,0.85)' }}
          >
            <li className="flex gap-2">
              <span className="mt-0.5 font-mono text-[10px]" style={{ color: '#7DD3F5' }}>
                ▸
              </span>
              Tier 0 · feeds <span className="font-semibold text-white">17 of 38</span> Q-close
              rollups
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 font-mono text-[10px]" style={{ color: '#7DD3F5' }}>
                ▸
              </span>
              Only <span className="font-semibold text-white">214 LOC</span> · highest leverage,
              lowest blast radius
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 font-mono text-[10px]" style={{ color: '#7DD3F5' }}>
                ▸
              </span>
              Pattern shared by <span className="font-semibold text-white">37 BTEQ rollups</span> —
              wins compound
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 font-mono text-[10px]" style={{ color: '#EF4444' }}>
                ▸
              </span>
              1 silent bug found: deprecated XOF FX rate dropping rows
            </li>
          </ul>

          <div
            className="rounded-md border-l-2 px-3 py-2 text-[11px] italic leading-relaxed"
            style={{
              background: 'rgba(41,181,232,0.05)',
              borderColor: '#29B5E8',
              color: 'rgba(229,231,235,0.8)',
            }}
          >
            Highest-ROI starting asset. The translation pattern carries to 36 sibling rollups in
            wave 2.
          </div>

          <button
            type="button"
            onClick={onAdvance}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ background: '#29B5E8', color: '#0B1220' }}
          >
            <GitPullRequest className="h-4 w-4" />
            Plan the migration
            <span>→</span>
          </button>
        </aside>
      </div>
    </ChapterStage>
  );
}

function Finding({
  n,
  label,
  icon,
  accent = '#7DD3F5',
}: {
  n: string;
  label: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ background: `${accent}12`, color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className="text-xl font-bold leading-none tabular-nums"
          style={{ color: accent }}
        >
          {n}
        </div>
        <div
          className="mt-0.5 text-[11px] leading-snug"
          style={{ color: 'rgba(229,231,235,0.7)' }}
        >
          {label}
        </div>
      </div>
    </li>
  );
}
