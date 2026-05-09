'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  Compass,
  History,
  Save,
  Library,
  FileText,
  X,
} from 'lucide-react';
import { ActHeader, ChapterStage } from '../chapter-stage';
import {
  ACTS,
  PRINCIPAL_COLOR,
  SKILL_COLOR,
  SUBAGENT_COLOR,
  VAULT_COLOR,
  type ActComponentProps,
} from '../story-types';

const ACT = ACTS[1];

interface InspectorContent {
  filename: string;
  language: string;
  body: string;
  description: string;
  kind: 'skill' | 'subagent';
}

const SKILLS: Array<{
  id: 'orient' | 'recall' | 'closeout';
  name: string;
  slash: string;
  blurb: string;
  triggers: string;
  delegates: string;
  inspector: InspectorContent;
}> = [
  {
    id: 'orient',
    name: 'Codebase Cartographer',
    slash: '/orient',
    blurb: 'Hand off codebase exploration so the principal never reads raw files.',
    triggers: 'session start, "explore", "understand this repo"',
    delegates: 'code-explorer (Composer 2)',
    inspector: {
      kind: 'skill',
      filename: '.cursor/skills/orient/SKILL.md',
      language: 'markdown',
      description: 'A skill that delegates exploration to a Composer 2 subagent and never reads raw files in the principal context.',
      body: `---
name: orient
description: Map an unfamiliar repo or area before any edits. Use proactively at session start, or when the user asks to "understand", "explore", or "map" a feature, directory, or service.
paths:
  - "**/*"
metadata:
  delegates_to: code-explorer
---

# Orient

Goal: keep the principal agent's context small by offloading exploration to a cheaper subagent.

## When to Use
- The user opens a new repo, service, or unfamiliar area.
- You are about to edit code you haven't read yet.

## Instructions
1. Identify the target area (path, feature, or symbol) from the user.
2. Delegate to the \`/code-explorer\` subagent with one focused prompt:
   > "/code-explorer map the area: <target>. Return only the structured summary."
3. Do NOT read files yourself for orientation. Trust the summary.
4. Surface the structured summary verbatim, then ask which files to edit.
`,
    },
  },
  {
    id: 'recall',
    name: 'Institutional Memory',
    slash: '/recall',
    blurb: 'Read the team\'s vault of prior agent runs before doing the work.',
    triggers: 'session start, after /orient, "what have we tried"',
    delegates: 'vault-reader (Composer 2)',
    inspector: {
      kind: 'skill',
      filename: '.cursor/skills/recall/SKILL.md',
      language: 'markdown',
      description: 'A skill that pulls relevant prior agent run summaries from the team\'s markdown vault.',
      body: `---
name: recall
description: Pull lessons from the team's markdown vault before changing code. Use proactively after /orient, or when the user asks "have we tried this", "what's the pattern here", or "what should I avoid".
paths:
  - "**/*"
metadata:
  delegates_to: vault-reader
  vault_path: ~/team-vault/
---

# Recall

Goal: surface what teammates' agents already learned, without consuming tokens reading the vault yourself.

## When to Use
- A new repo, service, or feature is in scope.
- The user asks about prior work, lessons, or anti-patterns.

## Instructions
1. Identify keywords from the user's request: feature names, libraries, error patterns.
2. Delegate to \`/vault-reader\` with the keyword set:
   > "/vault-reader pull notes for: <keywords>. Return only the structured digest."
3. Always include the digest's "Do not do this" section in your reply.
4. If a note's follow-ups are unresolved, flag them as risks before editing.
`,
    },
  },
  {
    id: 'closeout',
    name: 'Closure',
    slash: '/closeout',
    blurb: 'End every session with a structured note the next agent can read.',
    triggers: 'session end, "wrap up", PR opened',
    delegates: 'historian (Composer 2)',
    inspector: {
      kind: 'skill',
      filename: '.cursor/skills/closeout/SKILL.md',
      language: 'markdown',
      description: 'A skill that compresses the conversation into a structured markdown note and writes it to the vault.',
      body: `---
name: closeout
description: Compress the current conversation into a structured note for the team's vault. Use proactively when a PR is opened, or when the user says "we're done", "wrap up", "summarize this".
paths:
  - "**/*"
metadata:
  delegates_to: historian
  vault_path: ~/team-vault/
---

# Closeout

Goal: a session is not over until a future agent can read what was learned.

## When to Use
- A PR has been opened or merged.
- The user signals the end of the task.
- The conversation has accumulated > 25K tokens of useful work.

## Instructions
1. Delegate to \`/historian\` with the chat transcript:
   > "/historian compress the session. Return a single markdown note with frontmatter."
2. Write the returned note to \`~/team-vault/YYYY-MM-DD-<slug>.md\`.
3. Confirm to the user with the new filename and tag list.
4. The note must include: what was worked on, what was learned, "do not do this", files touched, follow-ups.
`,
    },
  },
];

const SUBAGENTS: Array<{
  id: 'code-explorer' | 'vault-reader' | 'historian';
  name: string;
  model: string;
  role: string;
  inspector: InspectorContent;
}> = [
  {
    id: 'code-explorer',
    name: 'Code Explorer',
    model: 'composer-2',
    role: 'Searches and reads files. Returns a 400-token map.',
    inspector: {
      kind: 'subagent',
      filename: '.cursor/agents/code-explorer.md',
      language: 'markdown',
      description: 'A read-only subagent pinned to Composer 2 that walks an area of the codebase and returns a compressed structured summary.',
      body: `---
name: code-explorer
description: Searches and analyzes a region of the codebase. Use proactively when the parent needs to understand unfamiliar files before editing. Returns a compressed structured summary, never raw file dumps.
model: composer-2
readonly: true
---

You are a codebase explorer. The parent will give you a target area (path, feature, or symbol).

Procedure:
1. Run parallel searches across the target (semantic + grep).
2. Read only the files necessary to answer the parent's question.
3. Do NOT include raw file contents in your reply.

Always reply with this exact format (max ~400 tokens):

## Summary
<2 to 4 sentence overview>

## Key files
- \`path/to/file.ts\` — <one-line role>

## Key symbols
- \`ClassOrFn\` (\`path/to/file.ts:line\`) — <role>

## Conventions detected
- <framework, ORM, test runner, naming patterns>

## Open questions
- <questions the parent should answer before editing>
`,
    },
  },
  {
    id: 'vault-reader',
    name: 'Vault Reader',
    model: 'composer-2',
    role: 'Reads markdown notes. Returns a 320-token digest.',
    inspector: {
      kind: 'subagent',
      filename: '.cursor/agents/vault-reader.md',
      language: 'markdown',
      description: 'A read-only subagent that scans the team\'s markdown vault for keyword-relevant notes and returns a digest.',
      body: `---
name: vault-reader
description: Pulls relevant notes from the team's markdown vault. Use whenever the parent needs prior context on a feature, library, or anti-pattern. Returns only a digest, not raw files.
model: composer-2
readonly: true
---

You are a librarian for the team's agent-run vault at \`~/team-vault/\`.

Procedure:
1. Take the parent's keyword set.
2. Grep the vault frontmatter and tags. Pull at most the 5 most relevant notes.
3. Read each note. Compress into the digest format below.
4. Do NOT include raw note contents.

Always reply with this exact format (max ~320 tokens):

## Recent work
- <date> · <topic> — <one-line takeaway>

## Learned the hard way
- <pattern>

## Do not do this
- <anti-pattern + the symptom>

## Open follow-ups
- <unresolved threads worth knowing about>
`,
    },
  },
  {
    id: 'historian',
    name: 'Historian',
    model: 'composer-2',
    role: 'Writes notes. Compresses 47K tokens into a 580-token note.',
    inspector: {
      kind: 'subagent',
      filename: '.cursor/agents/historian.md',
      language: 'markdown',
      description: 'A subagent that compresses the parent\'s session into a structured markdown note for the team vault.',
      body: `---
name: historian
description: Compresses the parent's session transcript into a single structured markdown note. Use at the end of every meaningful session. Writes to ~/team-vault/.
model: composer-2
readonly: false
---

You are the historian. The parent will hand you the chat transcript.

Procedure:
1. Identify the session's core task and the model the parent used.
2. Extract the key files touched, the decisions made, and any anti-patterns discovered.
3. Compress into the format below. The output must fit in < 600 tokens.
4. Write the result to \`~/team-vault/<date>-<slug>.md\`.

Note format:

---
date: YYYY-MM-DD
agent: <user>
model: <parent model>
repo: <repo name>
tags: [...]
---

## What was worked on
## What was learned
## Do not do this
## Files touched
## Follow-ups

Return only the filename you wrote. The parent does not need the body.
`,
    },
  },
];

export function Act02Architecture({ onAdvance }: ActComponentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inspector, setInspector] = useState<InspectorContent | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Auto-show one card after a beat to seed the user's interaction
  useEffect(() => {
    const t = setTimeout(() => setHovered('orient'), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <ChapterStage act={ACT}>
      <ActHeader
        number={ACT.number}
        title="Three skills, two subagents, one shared brain."
        kicker="The pattern"
        moodColor={ACT.moodColor}
      />
      <p className="px-6 max-w-3xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-10">
        Click any card to inspect the real <code className="font-mono text-[#C7B5FF] bg-[#A78BFA]/10 px-1.5 py-0.5 rounded">SKILL.md</code> or subagent file. The principal stays small. The subagents do the reading and writing. The vault becomes the team&apos;s long-term memory.
      </p>

      <section ref={sectionRef} className="px-6 max-w-6xl mx-auto pb-32">
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B0A12]/85 via-[#0B0A12]/85 to-[#1A1428]/85 backdrop-blur-md p-8 md:p-12 shadow-[0_36px_120px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Connection lines (drawn under the nodes) */}
          <ArchitectureLines hovered={hovered} />

          {/* Layer 1: Principal */}
          <div className="relative z-10 flex justify-center mb-12">
            <PrincipalCard />
          </div>

          {/* Layer 2: Skills */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {SKILLS.map((s) => (
              <SkillCard
                key={s.id}
                id={s.id}
                name={s.name}
                slash={s.slash}
                blurb={s.blurb}
                triggers={s.triggers}
                delegates={s.delegates}
                onHover={setHovered}
                onClick={() => setInspector(s.inspector)}
              />
            ))}
          </div>

          {/* Layer 3: Subagents */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {SUBAGENTS.map((a) => (
              <SubagentCard
                key={a.id}
                id={a.id}
                name={a.name}
                model={a.model}
                role={a.role}
                onHover={setHovered}
                onClick={() => setInspector(a.inspector)}
              />
            ))}
          </div>

          {/* Layer 4: Vault */}
          <div className="relative z-10 flex justify-center">
            <VaultCard />
          </div>

          {/* Legend */}
          <div className="relative z-10 mt-10 pt-6 border-t border-white/8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-text-tertiary font-mono uppercase tracking-[0.18em]">
            <Legend dot={PRINCIPAL_COLOR}>Principal · Opus 4.7</Legend>
            <Legend dot={SKILL_COLOR}>Skills · SKILL.md</Legend>
            <Legend dot={SUBAGENT_COLOR}>Subagents · Composer 2</Legend>
            <Legend dot={VAULT_COLOR}>Vault · markdown notes</Legend>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onAdvance}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#A78BFA] text-[#0F0A24] font-semibold text-sm hover:bg-[#C7B5FF] transition-colors shadow-[0_0_24px_rgba(167,139,250,0.45)] cursor-pointer"
          >
            Watch it run
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {inspector && <FileInspector content={inspector} onClose={() => setInspector(null)} />}
    </ChapterStage>
  );
}

function PrincipalCard() {
  return (
    <div
      className="relative rounded-2xl px-6 py-5 flex items-center gap-4 max-w-md shadow-[0_24px_60px_rgba(245,166,35,0.18)]"
      style={{
        backgroundColor: `${PRINCIPAL_COLOR}10`,
        border: `1px solid ${PRINCIPAL_COLOR}55`,
      }}
      data-arch-node="principal"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: `${PRINCIPAL_COLOR}1f`,
          border: `1px solid ${PRINCIPAL_COLOR}55`,
        }}
      >
        <Brain className="w-6 h-6" style={{ color: PRINCIPAL_COLOR }} />
      </div>
      <div className="text-left">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.22em] mb-0.5"
          style={{ color: PRINCIPAL_COLOR }}
        >
          Principal Agent
        </p>
        <p className="text-base font-semibold text-text-primary leading-tight">
          Opus 4.7 · high thinking
        </p>
        <p className="text-[11.5px] text-text-tertiary leading-tight mt-0.5">
          200K context · $5/$25 per 1M tokens
        </p>
      </div>
    </div>
  );
}

function VaultCard() {
  return (
    <div
      className="relative rounded-2xl px-6 py-5 flex items-center gap-4 max-w-md shadow-[0_24px_60px_rgba(167,139,250,0.18)]"
      style={{
        backgroundColor: `${VAULT_COLOR}10`,
        border: `1px solid ${VAULT_COLOR}55`,
      }}
      data-arch-node="vault"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: `${VAULT_COLOR}1f`,
          border: `1px solid ${VAULT_COLOR}55`,
        }}
      >
        <Library className="w-6 h-6" style={{ color: VAULT_COLOR }} />
      </div>
      <div className="text-left">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.22em] mb-0.5"
          style={{ color: VAULT_COLOR }}
        >
          Team Vault
        </p>
        <p className="text-base font-semibold text-text-primary leading-tight">
          ~/team-vault · markdown
        </p>
        <p className="text-[11.5px] text-text-tertiary leading-tight mt-0.5">
          Obsidian-compatible · checked into git · grows per session
        </p>
      </div>
    </div>
  );
}

function SkillCard({
  id,
  name,
  slash,
  blurb,
  triggers,
  delegates,
  onHover,
  onClick,
}: {
  id: string;
  name: string;
  slash: string;
  blurb: string;
  triggers: string;
  delegates: string;
  onHover: (id: string | null) => void;
  onClick: () => void;
}) {
  const Icon = id === 'orient' ? Compass : id === 'recall' ? History : Save;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      data-arch-node={`skill-${id}`}
      className="group text-left rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      style={{
        backgroundColor: `${SKILL_COLOR}0c`,
        border: `1px solid ${SKILL_COLOR}33`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${SKILL_COLOR}1a`,
            border: `1px solid ${SKILL_COLOR}55`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: SKILL_COLOR }} />
        </div>
        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-[0.22em]"
            style={{ color: SKILL_COLOR }}
          >
            Skill
          </p>
          <p className="text-base font-semibold text-text-primary leading-tight">{name}</p>
        </div>
      </div>
      <p className="font-mono text-[12px] mb-2" style={{ color: SKILL_COLOR }}>
        {slash}
      </p>
      <p className="text-[13px] text-text-secondary leading-snug mb-3">{blurb}</p>
      <div className="space-y-1 text-[11px] text-text-tertiary">
        <p>
          <span className="text-text-secondary">Triggers:</span> {triggers}
        </p>
        <p>
          <span className="text-text-secondary">Delegates to:</span> {delegates}
        </p>
      </div>
      <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.22em] text-text-tertiary group-hover:text-text-secondary transition-colors">
        Inspect SKILL.md →
      </p>
    </button>
  );
}

function SubagentCard({
  id,
  name,
  model,
  role,
  onHover,
  onClick,
}: {
  id: string;
  name: string;
  model: string;
  role: string;
  onHover: (id: string | null) => void;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      data-arch-node={`subagent-${id}`}
      className="group text-left rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      style={{
        backgroundColor: `${SUBAGENT_COLOR}0c`,
        border: `1px solid ${SUBAGENT_COLOR}33`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${SUBAGENT_COLOR}1a`,
            border: `1px solid ${SUBAGENT_COLOR}55`,
          }}
        >
          <FileText className="w-4 h-4" style={{ color: SUBAGENT_COLOR }} />
        </div>
        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-[0.22em]"
            style={{ color: SUBAGENT_COLOR }}
          >
            Subagent
          </p>
          <p className="text-base font-semibold text-text-primary leading-tight">{name}</p>
        </div>
      </div>
      <p
        className="font-mono text-[12px] mb-2 inline-block px-2 py-0.5 rounded-md"
        style={{
          color: SUBAGENT_COLOR,
          backgroundColor: `${SUBAGENT_COLOR}10`,
          border: `1px solid ${SUBAGENT_COLOR}33`,
        }}
      >
        model: {model}
      </p>
      <p className="text-[13px] text-text-secondary leading-snug mt-3">{role}</p>
      <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.22em] text-text-tertiary group-hover:text-text-secondary transition-colors">
        Inspect agent file →
      </p>
    </button>
  );
}

function Legend({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ background: dot, boxShadow: `0 0 10px ${dot}aa` }} />
      <span>{children}</span>
    </span>
  );
}

function ArchitectureLines({ hovered }: { hovered: string | null }) {
  const baseLine = 'transition-opacity duration-300';
  const dim = hovered ? 'opacity-30' : 'opacity-90';
  const isHovered = (...ids: string[]) => (hovered && ids.includes(hovered) ? 'opacity-100' : dim);

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="g-orient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={PRINCIPAL_COLOR} stopOpacity="0.6" />
          <stop offset="100%" stopColor={SKILL_COLOR} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="g-skill-sub" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={SKILL_COLOR} stopOpacity="0.55" />
          <stop offset="100%" stopColor={SUBAGENT_COLOR} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="g-vault" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={SUBAGENT_COLOR} stopOpacity="0.55" />
          <stop offset="100%" stopColor={VAULT_COLOR} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* principal -> skills (3 fans) */}
      <line
        x1="50"
        y1="14"
        x2="22"
        y2="38"
        stroke="url(#g-orient)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('orient', 'code-explorer')}`}
      />
      <line
        x1="50"
        y1="14"
        x2="50"
        y2="38"
        stroke="url(#g-orient)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('recall', 'vault-reader')}`}
      />
      <line
        x1="50"
        y1="14"
        x2="78"
        y2="38"
        stroke="url(#g-orient)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('closeout', 'historian')}`}
      />
      {/* skills -> subagents (vertical) */}
      <line
        x1="22"
        y1="48"
        x2="22"
        y2="65"
        stroke="url(#g-skill-sub)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('orient', 'code-explorer')}`}
      />
      <line
        x1="50"
        y1="48"
        x2="50"
        y2="65"
        stroke="url(#g-skill-sub)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('recall', 'vault-reader')}`}
      />
      <line
        x1="78"
        y1="48"
        x2="78"
        y2="65"
        stroke="url(#g-skill-sub)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('closeout', 'historian')}`}
      />
      {/* subagents -> vault (3 lines, vault-reader reads, historian writes) */}
      <line
        x1="22"
        y1="75"
        x2="50"
        y2="92"
        stroke="url(#g-vault)"
        strokeWidth="0.14"
        strokeDasharray="0.6 0.6"
        className={`${baseLine} ${isHovered('code-explorer', 'orient')}`}
      />
      <line
        x1="50"
        y1="75"
        x2="50"
        y2="92"
        stroke="url(#g-vault)"
        strokeWidth="0.18"
        className={`${baseLine} ${isHovered('recall', 'vault-reader')}`}
      />
      <line
        x1="78"
        y1="75"
        x2="50"
        y2="92"
        stroke="url(#g-vault)"
        strokeWidth="0.22"
        className={`${baseLine} ${isHovered('closeout', 'historian')}`}
      />
    </svg>
  );
}

function FileInspector({
  content,
  onClose,
}: {
  content: InspectorContent;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accent = content.kind === 'skill' ? SKILL_COLOR : SUBAGENT_COLOR;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl border border-white/12 bg-[#0B0A12] shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${accent}1a`, border: `1px solid ${accent}55` }}
            >
              <FileText className="w-3.5 h-3.5" style={{ color: accent }} />
            </span>
            <div className="min-w-0">
              <p
                className="text-[10px] font-mono uppercase tracking-[0.22em]"
                style={{ color: accent }}
              >
                {content.kind === 'skill' ? 'Skill file' : 'Subagent file'}
              </p>
              <p className="text-[13px] font-mono text-text-primary truncate">
                {content.filename}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:bg-white/8 hover:text-text-primary transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-white/6 text-[12.5px] text-text-secondary bg-white/[0.015]">
          {content.description}
        </div>
        <pre className="flex-1 overflow-auto px-5 py-4 text-[12.5px] font-mono leading-relaxed text-text-secondary whitespace-pre-wrap">
          {content.body}
        </pre>
      </div>
    </div>
  );
}
