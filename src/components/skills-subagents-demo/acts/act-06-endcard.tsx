'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Brain, RotateCcw, Sparkles } from 'lucide-react';
import { ActHeader, ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps, VAULT_NOTES } from '../story-types';

const ACT = ACTS[5];

interface ProjectedRow {
  weeks: number;
  sessions: number;
  notes: number;
  hoursSavedPerWeek: number;
  tokenSpendSavedPerWeek: number;
}

const ENGINEERS = 220;
const SESSIONS_PER_ENGINEER_PER_WEEK = 6;
const HOURS_SAVED_PER_BOOT = 0.18; // 11 mins of orientation
const COST_SAVED_PER_BOOT = 3.08; // $3.12 - $0.04 from Acts 1 vs 3

function project(weeks: number): ProjectedRow {
  const sessions = ENGINEERS * SESSIONS_PER_ENGINEER_PER_WEEK * weeks;
  const notes = sessions; // 1 note per session
  const hoursSavedPerWeek = ENGINEERS * SESSIONS_PER_ENGINEER_PER_WEEK * HOURS_SAVED_PER_BOOT;
  const tokenSpendSavedPerWeek = ENGINEERS * SESSIONS_PER_ENGINEER_PER_WEEK * COST_SAVED_PER_BOOT;
  return { weeks, sessions, notes, hoursSavedPerWeek, tokenSpendSavedPerWeek };
}

export function Act06EndCard({ onAdvance }: ActComponentProps) {
  const [weeks, setWeeks] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setWeeks((w) => (w >= 26 ? 1 : w + 1));
    }, 320);
    return () => window.clearInterval(id);
  }, []);

  const projected = project(weeks);

  return (
    <ChapterStage act={ACT}>
      <ActHeader
        number={ACT.number}
        title="Every session writes back. Every agent inherits the team."
        kicker="The compounding brain"
        moodColor={ACT.moodColor}
      />
      <p className="px-6 max-w-3xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-8">
        Skills and subagents are first-class primitives in Cursor. Built right, they make the team itself the coding agent&apos;s long-term memory. The cost curve flattens. The expertise compounds. New hires inherit it on day one.
      </p>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        {/* Side-by-side comparison */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F87171]/15 border border-[#F87171]/40">
                <Brain className="w-4 h-4 text-[#F87171]" />
              </span>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#F87171]">
                Without skills + subagents
              </p>
            </div>
            <ul className="space-y-2.5 text-[13.5px] text-text-secondary leading-relaxed">
              <BulletDot color="#F87171">
                Every agent boot consumes ~28K tokens of context just orienting.
              </BulletDot>
              <BulletDot color="#F87171">
                Every session pays Opus 4.7 input rates ($5/M) for codebase reading.
              </BulletDot>
              <BulletDot color="#F87171">
                Every teammate&apos;s lessons are lost the moment their session ends.
              </BulletDot>
              <BulletDot color="#F87171">
                Anti-patterns get rediscovered. Fixes get re-derived. Drift compounds.
              </BulletDot>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#4ADE80]/30 bg-[#4ADE80]/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-md flex items-center justify-center bg-[#4ADE80]/15 border border-[#4ADE80]/40">
                <Sparkles className="w-4 h-4 text-[#4ADE80]" />
              </span>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#4ADE80]">
                With skills + subagents
              </p>
            </div>
            <ul className="space-y-2.5 text-[13.5px] text-text-secondary leading-relaxed">
              <BulletDot color="#4ADE80">
                Boot costs the principal ~730 tokens. Subagents own the heavy reading.
              </BulletDot>
              <BulletDot color="#4ADE80">
                Composer 2 does the exploration at $0.50/M. Opus stays on reasoning.
              </BulletDot>
              <BulletDot color="#4ADE80">
                Every session ends with a structured note in the team&apos;s vault.
              </BulletDot>
              <BulletDot color="#4ADE80">
                Lessons compound. Anti-patterns get flagged before the next agent edits.
              </BulletDot>
            </ul>
          </div>
        </div>

        {/* Projection at scale */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm p-7 mb-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1">
                Projected at one mid-sized engineering org
              </p>
              <p className="text-base text-text-secondary">
                {ENGINEERS} engineers · {SESSIONS_PER_ENGINEER_PER_WEEK} agent sessions per engineer per week · 1 vault note per session
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-text-tertiary">
              <span>week</span>
              <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/8 tabular-nums text-text-primary">
                {String(projected.weeks).padStart(2, '0')}
              </span>
              <span className="opacity-60">/ 26</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <BigStat
              label="Vault notes"
              value={projected.notes.toLocaleString()}
              accent="#A78BFA"
              hint="institutional memory in markdown"
            />
            <BigStat
              label="Engineer hours saved"
              value={`${(projected.hoursSavedPerWeek * projected.weeks).toFixed(0)}h`}
              accent="#4ADE80"
              hint="orientation time reclaimed"
            />
            <BigStat
              label="Token spend avoided"
              value={`$${(projected.tokenSpendSavedPerWeek * projected.weeks).toLocaleString()}`}
              accent="#FBBF24"
              hint="vs cold-starting Opus on every session"
            />
            <BigStat
              label="Sessions completed"
              value={projected.sessions.toLocaleString()}
              accent="#7DD3F5"
              hint="each one writes back"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-white/8 text-[11px] text-text-tertiary leading-relaxed">
            Numbers based on the 28,471 → 730 token reduction shown in Acts 1 and 3, and the $3.12 → $0.04 boot cost. Vault grows from {VAULT_NOTES.length} starting notes.
          </div>
        </div>

        {/* CTA strip */}
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          <DocLink
            href="https://cursor.com/docs/skills"
            kicker="Skills"
            title="SKILL.md spec"
            blurb="Lowercase frontmatter. Project + user scope. Auto-invoked by description."
          />
          <DocLink
            href="https://cursor.com/docs/subagents"
            kicker="Subagents"
            title="Subagent file spec"
            blurb="Custom subagents under .cursor/agents/. Pin a model. Run readonly. Run in parallel."
          />
          <DocLink
            href="https://cursor.com/docs/agent/prompting"
            kicker="Context engineering"
            title="Context window breakdown"
            blurb="System, tools, rules, skills, MCP, subagents, and the conversation. Build for the budget."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onAdvance}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#A78BFA] text-[#0F0A24] font-semibold text-sm hover:bg-[#C7B5FF] transition-colors shadow-[0_0_24px_rgba(167,139,250,0.45)] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Replay the story
          </button>
          <a
            href="/skills-and-subagents"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/12 text-text-primary font-medium text-sm transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Back to overview
          </a>
        </div>
      </section>
    </ChapterStage>
  );
}

function BulletDot({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}aa` }}
      />
      <span>{children}</span>
    </li>
  );
}

function BigStat({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1.5">
        {label}
      </p>
      <p
        className="text-2xl font-semibold tabular-nums leading-none"
        style={{ color: accent }}
      >
        {value}
      </p>
      {hint && <p className="text-[10.5px] text-text-tertiary mt-1.5 leading-tight">{hint}</p>}
    </div>
  );
}

function DocLink({
  href,
  kicker,
  title,
  blurb,
}: {
  href: string;
  kicker: string;
  title: string;
  blurb: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm p-5 hover:border-[#A78BFA]/40 hover:-translate-y-0.5 transition-all"
    >
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C7B5FF] mb-2">
        {kicker}
      </p>
      <p className="text-base font-semibold text-text-primary mb-1.5 inline-flex items-center gap-1.5">
        {title}
        <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </p>
      <p className="text-[12.5px] text-text-secondary leading-relaxed">{blurb}</p>
    </a>
  );
}
