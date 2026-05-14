'use client';

import { ArrowRight, Briefcase, Mail, Megaphone, RefreshCcw, Users } from 'lucide-react';
import { FigmaActShell, FigmaActHeader } from './act-shell';
import { FigmaGlyph } from '../figma-glyph';

interface Act6Props {
  onReplay: () => void;
}

export function Act6Verdict({ onReplay }: Act6Props) {
  return (
    <FigmaActShell act={6}>
      <FigmaActHeader
        act={6}
        eyebrow="One message, two audiences. Cursor is not a threat to Figma. It's the partnership that makes both products land harder, faster, and at higher altitude."
      />

      {/* The big alignment statement */}
      <section
        className="mb-8 rounded-2xl border bg-white p-6 shadow-sm"
        style={{ borderColor: 'rgba(108, 60, 224, 0.18)' }}
      >
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-3">
            <FigmaGlyph size={26} />
            <span className="text-3xl font-bold text-[#14112A]">×</span>
            <CursorWord />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#14112A] md:text-3xl">
              Cursor brings Figma into the AI-native SDLC.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#3F2E5C]">
              The Figma MCP is the wire that makes the design system the source of truth for every
              AI-generated change. It&apos;s the reason hallucinations don&apos;t reach production. It&apos;s the
              reason designers stay in Figma and still own the output. <strong>That&apos;s the message
              every Cursor seller can land — and every Figma seller should be co-pitching.</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill text="78% faster" sub="design-to-prod" color="#16A34A" />
            <Pill text="0 drift" sub="vs free-form AI" color="#6C3CE0" />
          </div>
        </div>
      </section>

      {/* Two seller plays */}
      <section className="grid gap-5 md:grid-cols-2">
        <SellerPlay
          for="Cursor sellers"
          color="#6C3CE0"
          icon={<Briefcase className="h-4 w-4" />}
          headline="Pull design into your POC."
          bullets={[
            'Open every POC by enabling the Figma MCP and pointing it at the customer\'s real Figma file.',
            'In the kickoff, get the design lead in the room. The MCP is your invitation.',
            'Use Design Mode in the demo — show a live edit in Figma → live patch in Cursor.',
            'Win rate moves up materially when Eng + Design + PM are all in the deal.',
          ]}
          ctaLabel="Run the live design-drift demo"
          ctaHref="/partnerships/figma/demo"
        />
        <SellerPlay
          for="Figma sellers"
          color="#A259FF"
          icon={<Megaphone className="h-4 w-4" />}
          headline="Bring Cursor into your accounts."
          bullets={[
            'When a customer asks "what about AI?", the answer is the Figma MCP — and Cursor is the agent that uses it.',
            'Position your design system as the only thing that prevents AI hallucination at scale.',
            'Co-sell with the Cursor field team — there\'s a named PM and AM pair on every account.',
            'Joint POCs land in days, not weeks. Both products show value on the same call.',
          ]}
          ctaLabel="Talk to the Cursor co-sell team"
          ctaHref="mailto:partnerships@cursor.com?subject=Figma%20%C3%97%20Cursor%20co-sell%20-%20account%20intro&body=Hi%20Cursor%20team%2C%20I%27m%20a%20Figma%20seller%20on%20%5Baccount%5D.%20Let%27s%20coordinate%20a%20joint%20pitch."
        />
      </section>

      {/* The "what NOT to fear" callout */}
      <section
        className="mt-8 rounded-xl border-l-4 bg-white p-5 shadow-sm"
        style={{
          borderColor: 'rgba(20,17,42,0.08)',
          borderLeftColor: '#A259FF',
          borderLeftWidth: 4,
        }}
      >
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6C3CE0]">
          <FigmaGlyph size={11} /> the alignment
        </div>
        <p className="text-[14px] leading-relaxed text-[#14112A]">
          <strong>Cursor does not pose a threat to Figma. We are aligned.</strong> Cursor brings
          Figma into the AI-driven SDLC and brings designers closer to code, improving the output
          on both sides. The Figma MCP is what makes certain that AI-generated code can&apos;t hallucinate
          components or deviate from design standards. <strong>That alignment is the partnership —
          and the partnership is the deal.</strong>
        </p>
      </section>

      {/* Final CTAs */}
      <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/partnerships/figma/demo"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #A259FF, #6C3CE0)',
            color: '#FFFFFF',
            boxShadow: '0 12px 28px -10px rgba(108,60,224,0.5)',
          }}
        >
          <Users className="h-4 w-4" />
          Try the live design-drift demo
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="mailto:partnerships@cursor.com?subject=Figma%20%C3%97%20Cursor%20co-sell"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'rgba(15,10,31,0.2)', color: '#14112A' }}
        >
          <Mail className="h-4 w-4" />
          Talk to your Figma rep
        </a>
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: 'rgba(15,10,31,0.2)', color: '#14112A' }}
        >
          <RefreshCcw className="h-4 w-4" />
          Replay the journey
        </button>
      </section>
    </FigmaActShell>
  );
}

function CursorWord() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#14112A] text-[12px] font-bold text-white"
      >
        C
      </span>
      <span className="text-2xl font-bold text-[#14112A]">Cursor</span>
    </div>
  );
}

function Pill({ text, sub, color }: { text: string; sub: string; color: string }) {
  return (
    <div
      className="rounded-xl border px-3 py-2 text-center"
      style={{
        background: `${color}10`,
        borderColor: `${color}45`,
      }}
    >
      <div className="text-base font-bold" style={{ color }}>
        {text}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[#3F2E5C]/70">
        {sub}
      </div>
    </div>
  );
}

function SellerPlay({
  for: who,
  color,
  icon,
  headline,
  bullets,
  ctaLabel,
  ctaHref,
}: {
  for: string;
  color: string;
  icon: React.ReactNode;
  headline: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <article
      className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color }}>
        {icon}
        <span>For {who}</span>
      </div>
      <h3 className="text-xl font-bold text-[#14112A]">{headline}</h3>
      <ul className="space-y-2 text-[13px] leading-relaxed text-[#3F2E5C]">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span
              className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
        style={{ background: color, color: '#FFFFFF' }}
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}
