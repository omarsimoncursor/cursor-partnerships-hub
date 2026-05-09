'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  FileText,
  Search,
  Tag,
  Users,
  GitBranch,
  AlertCircle,
  Lightbulb,
  Library,
} from 'lucide-react';
import { ActHeader, ChapterStage } from '../chapter-stage';
import {
  ACTS,
  VAULT_COLOR,
  VAULT_NOTES,
  type ActComponentProps,
  type VaultNote,
} from '../story-types';

const ACT = ACTS[3];

export function Act04Vault({ onAdvance }: ActComponentProps) {
  const [activeFile, setActiveFile] = useState(VAULT_NOTES[0].filename);
  const [filter, setFilter] = useState<string>('');

  const filtered = useMemo(() => {
    if (!filter) return VAULT_NOTES;
    const f = filter.toLowerCase();
    return VAULT_NOTES.filter(
      (n) =>
        n.filename.toLowerCase().includes(f) ||
        n.topic.toLowerCase().includes(f) ||
        n.tags.some((t) => t.toLowerCase().includes(f)) ||
        n.repo.toLowerCase().includes(f)
    );
  }, [filter]);

  // Make sure activeFile stays valid when filter narrows
  useEffect(() => {
    if (!filtered.find((n) => n.filename === activeFile) && filtered.length > 0) {
      setActiveFile(filtered[0].filename);
    }
  }, [filtered, activeFile]);

  const note = VAULT_NOTES.find((n) => n.filename === activeFile)!;

  // Repo distribution sidebar
  const repos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of VAULT_NOTES) counts.set(n.repo, (counts.get(n.repo) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  // Tag cloud
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of VAULT_NOTES) for (const t of n.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, []);

  return (
    <ChapterStage act={ACT}>
      <ActHeader
        number={ACT.number}
        title="Your team's collective brain. Distilled into markdown."
        kicker="The vault"
        moodColor={ACT.moodColor}
      />
      <p className="px-6 max-w-3xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-8">
        Every closed agent session writes one structured note. The vault lives in git, opens in Obsidian, and is fed back into future sessions by the <code className="font-mono text-[#C7B5FF] bg-[#A78BFA]/10 px-1.5 py-0.5 rounded">vault-reader</code> subagent. Click any file to read what was learned.
      </p>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          {/* Vault chrome */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Library className="w-3.5 h-3.5" style={{ color: VAULT_COLOR }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-text-secondary">
                ~/team-vault · {VAULT_NOTES.length} notes · last 30 days
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter notes by topic, repo, tag…"
                className="w-72 pl-8 pr-3 py-1.5 rounded-md bg-white/[0.04] border border-white/8 text-[11.5px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[#A78BFA]/55"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[640px]">
            {/* Sidebar: file tree */}
            <aside className="border-r border-white/8 bg-white/[0.012] py-2 overflow-y-auto max-h-[640px]">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary">
                notes/
              </div>
              <ul className="px-1.5">
                {filtered.map((n) => (
                  <li key={n.filename}>
                    <button
                      onClick={() => setActiveFile(n.filename)}
                      className={`group w-full text-left px-2.5 py-2 rounded-md flex items-start gap-2 transition-colors ${
                        n.filename === activeFile
                          ? 'bg-[#A78BFA]/12 text-text-primary'
                          : 'hover:bg-white/[0.04] text-text-secondary'
                      }`}
                      title={n.topic}
                    >
                      <FileText
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{
                          color: n.filename === activeFile ? VAULT_COLOR : 'rgba(237,236,236,0.5)',
                        }}
                      />
                      <span className="text-[11.5px] font-mono leading-tight truncate">
                        {n.filename}
                      </span>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="px-3 py-3 text-[11.5px] text-text-tertiary">No notes match.</li>
                )}
              </ul>
              <div className="mt-4 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary border-t border-white/8 pt-3">
                repos
              </div>
              <ul className="px-3 space-y-1.5 text-[11.5px] text-text-secondary">
                {repos.map(([repo, count]) => (
                  <li key={repo} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <GitBranch className="w-3 h-3 text-text-tertiary" />
                      <span className="truncate">{repo}</span>
                    </span>
                    <span className="text-text-tertiary tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary border-t border-white/8 pt-3">
                tags
              </div>
              <div className="px-3 flex flex-wrap gap-1.5 pb-3">
                {tags.map(([tag]) => (
                  <button
                    key={tag}
                    onClick={() => setFilter(tag)}
                    className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/8 text-[10.5px] font-mono text-text-secondary hover:text-text-primary hover:bg-[#A78BFA]/12 hover:border-[#A78BFA]/40 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main note pane */}
            <main className="px-6 py-6 overflow-y-auto max-h-[640px]">
              <NoteRender note={note} />
            </main>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onAdvance}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#A78BFA] text-[#0F0A24] font-semibold text-sm hover:bg-[#C7B5FF] transition-colors shadow-[0_0_24px_rgba(167,139,250,0.45)] cursor-pointer"
          >
            See how a note gets written
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </ChapterStage>
  );
}

function NoteRender({ note }: { note: VaultNote }) {
  return (
    <article>
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1">
        {note.filename}
      </p>
      <h3 className="text-2xl font-semibold text-text-primary leading-tight tracking-tight mb-3">
        {note.topic}
      </h3>

      {/* Frontmatter */}
      <div
        className="rounded-lg px-3.5 py-3 mb-5 text-[11.5px] font-mono leading-relaxed"
        style={{
          backgroundColor: `${VAULT_COLOR}08`,
          border: `1px solid ${VAULT_COLOR}30`,
          color: 'rgba(237,236,236,0.78)',
        }}
      >
        <p>
          <span className="text-text-tertiary">date:</span> {note.date}
        </p>
        <p>
          <span className="text-text-tertiary">agent:</span> {note.agent}
        </p>
        <p>
          <span className="text-text-tertiary">model:</span> {note.model}
        </p>
        <p>
          <span className="text-text-tertiary">repo:</span> {note.repo}
        </p>
        <p>
          <span className="text-text-tertiary">tags:</span> [{note.tags.map((t) => `'${t}'`).join(', ')}]
        </p>
      </div>

      <Section icon={Lightbulb} accent="#FBBF24" title="What was worked on">
        <p className="text-[14px] text-text-secondary leading-relaxed">{note.summary}</p>
      </Section>

      <Section icon={Tag} accent="#60A5FA" title="What was learned">
        <p className="text-[14px] text-text-secondary leading-relaxed">{note.learned}</p>
      </Section>

      <Section icon={AlertCircle} accent="#F87171" title="Do not do this">
        <p className="text-[14px] text-text-secondary leading-relaxed">{note.doNotDoThis}</p>
      </Section>

      <Section icon={FileText} accent="#A78BFA" title="Files touched">
        <ul className="space-y-1">
          {note.filesTouched.map((f) => (
            <li key={f} className="font-mono text-[12.5px] text-text-secondary">
              <span className="text-text-tertiary">└─</span> {f}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Users} accent="#4ADE80" title="Follow-ups">
        <ul className="space-y-1">
          {note.followUps.map((f) => (
            <li key={f} className="text-[13.5px] text-text-secondary leading-relaxed">
              <span className="text-text-tertiary">·</span> {f}
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
}

function Section({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        <h4
          className="text-[11px] font-mono uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {title}
        </h4>
      </div>
      <div className="pl-5">{children}</div>
    </section>
  );
}
