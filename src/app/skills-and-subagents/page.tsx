'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Compass,
  History,
  Library,
  PlayCircle,
  Save,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ACTS } from '@/components/skills-subagents-demo/story-types';

export default function SkillsAndSubagentsLanding() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Cursor primitives demo</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-28 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/40 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#A78BFA]" strokeWidth={2.2} />
            </div>
            <span className="text-text-tertiary text-2xl">+</span>
            <div className="w-11 h-11 rounded-xl bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-base font-bold text-accent-blue">
              C
            </div>
          </div>

          <span className="inline-block text-[11px] font-mono uppercase tracking-[0.25em] text-[#C7B5FF] mb-4">
            A 6-chapter story about enterprise context loss
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold text-text-primary mb-5 tracking-tight leading-[1.05]">
            AI coding agents start from zero.
            <br className="hidden md:block" />
            Enterprises cannot afford that.
          </h1>
          <p className="text-lg text-text-secondary mb-3 max-w-3xl mx-auto leading-relaxed">
            A staff engineer fires up Opus 4.7 on a service her team has shipped to for two years. The agent has never seen this repo. None of her teammates&apos; lessons live anywhere the agent can read. So it burns 28K tokens of premium context just orienting itself, and rediscovers a fix shipped last month.
          </p>
          <p className="text-base text-text-secondary mb-3 max-w-3xl mx-auto leading-relaxed">
            Skills and subagents are the answer. They turn the team&apos;s collective expertise into the agent&apos;s long-term memory.
          </p>
          <p className="text-sm text-text-tertiary mb-10 max-w-2xl mx-auto">
            Six interactive chapters. Click anything. Total runtime is about 7 minutes.
          </p>

          <div className="flex justify-center mb-12">
            <Link
              href="/skills-and-subagents/journey"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                         bg-[#A78BFA] text-[#0F0A24] font-semibold text-base
                         hover:bg-[#C7B5FF] transition-all duration-200
                         shadow-[0_0_32px_rgba(167,139,250,0.45)] hover:shadow-[0_0_48px_rgba(167,139,250,0.6)]"
            >
              <PlayCircle className="w-5 h-5" />
              Play the 6-chapter story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Act strip */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-12 max-w-5xl mx-auto">
            {ACTS.map((act) => (
              <div
                key={act.id}
                className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 text-left"
              >
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.22em] mb-1"
                  style={{ color: act.moodColor }}
                >
                  Act {String(act.number).padStart(2, '0')}
                </p>
                <p className="text-[13px] font-semibold text-text-primary leading-tight">
                  {act.title}
                </p>
                <p className="text-[10.5px] text-text-tertiary mt-1 leading-snug line-clamp-3">
                  {act.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* The pattern at a glance */}
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            The pattern, at a glance
          </h2>
          <p className="text-sm text-text-secondary mb-5 max-w-2xl mx-auto">
            Three skills. Two subagents on a cheaper model. One markdown vault that lives in git.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left mb-10">
            <PrimitiveCard
              icon={Compass}
              accent="#4ADE80"
              kicker="Skill"
              title="/orient"
              body="Delegate codebase exploration to a Composer 2 subagent. Returns a 412-token map. The principal never reads raw files."
            />
            <PrimitiveCard
              icon={History}
              accent="#4ADE80"
              kicker="Skill"
              title="/recall"
              body="Pull lessons from the team's markdown vault before changing code. Every prior session is one keyword search away."
            />
            <PrimitiveCard
              icon={Save}
              accent="#4ADE80"
              kicker="Skill"
              title="/closeout"
              body="Compress the session into a structured note and write it back to the vault. Task complete is not session complete."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left mb-10">
            <PrimitiveCard
              icon={Sparkles}
              accent="#7DD3F5"
              kicker="Subagent · composer-2"
              title="code-explorer"
              body="Read-only. Walks an area of the codebase. Returns a structured summary, never raw file contents."
            />
            <PrimitiveCard
              icon={Zap}
              accent="#7DD3F5"
              kicker="Subagent · composer-2"
              title="vault-reader"
              body="Read-only. Greps the team vault by keyword. Returns the four most relevant lessons in 320 tokens."
            />
            <PrimitiveCard
              icon={Library}
              accent="#7DD3F5"
              kicker="Subagent · composer-2"
              title="historian"
              body="Compresses the conversation into a single markdown note with frontmatter. Writes it to the vault."
            />
          </div>

          <div className="rounded-2xl border border-[#A78BFA]/25 bg-[#A78BFA]/5 p-6 text-left">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C7B5FF] mb-2">
              Why this matters in an enterprise
            </p>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              Large language models do not retain memory across sessions. In an enterprise with thousands of engineers and dozens of repos, that means every agent starts ignorant of the work the rest of the org has already done. Skills and subagents are how Cursor closes that gap, without consuming the principal agent&apos;s context window. The team becomes the agent&apos;s longest memory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PrimitiveCard({
  icon: Icon,
  accent,
  kicker,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: `${accent}0c`,
        border: `1px solid ${accent}33`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${accent}1a`, border: `1px solid ${accent}55` }}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
        <p
          className="text-[10px] font-mono uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {kicker}
        </p>
      </div>
      <p
        className="text-base font-semibold text-text-primary mb-1.5 font-mono"
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="text-[12.5px] text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}
