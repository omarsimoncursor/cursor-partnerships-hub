'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Newspaper, TrendingDown, Coffee, ArrowRight } from 'lucide-react';
import { FigmaActShell, FigmaActHeader } from './act-shell';
import { FigmaGlyph, FigmaWordmark } from '../figma-glyph';
import { IPhoneFrame } from '@/components/figma-partner/iphone-frame';

interface Act1Props {
  onAdvance: () => void;
}

const HEADLINES = [
  {
    outlet: 'TechCrunch',
    time: '2h',
    title: '"Design tools are dead": why every Series-B CEO now asks AI to skip the mockup',
    snippet:
      'Investors are asking portfolio companies to cut design spend in half. One VC calls Figma "the new Adobe Illustrator" — necessary, but no longer in the critical path.',
  },
  {
    outlet: 'The Information',
    time: '5h',
    title: 'Inside the "vibe-coding" teams shipping without a single Figma file',
    snippet:
      'Three engineers, one prompt, one LLM. No specs. No tickets. No design review. Output: a checkout flow that shipped to 300k users this quarter. The designer has moved on.',
  },
  {
    outlet: 'LinkedIn',
    time: '1d',
    title: 'AI replaced our design system. We fired 8 designers last quarter.',
    snippet:
      'A founder posts the now-infamous "RIP design" thread. 14k reactions. 3k comments. The top one: "same here, we haven\'t opened Figma in 90 days."',
  },
];

export function Act1Headline({ onAdvance }: Act1Props) {
  return (
    <FigmaActShell act={1}>
      <FigmaActHeader
        act={1}
        eyebrow="A Tuesday, 7:14 AM. A senior product designer opens their phone before pouring coffee. The feed has thoughts."
      />

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* The designer's phone with the morning feed */}
        <div className="flex justify-center md:justify-start">
          <IPhoneFrame label="Morning, 7:14 AM" labelColor="#F87171">
            <NewsfeedScreen />
          </IPhoneFrame>
        </div>

        {/* The feed unpacked */}
        <div className="flex flex-col gap-4">
          <div
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{
              background: 'rgba(248, 113, 113, 0.07)',
              borderColor: 'rgba(248, 113, 113, 0.25)',
            }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#F87171' }} />
            <div className="text-[13px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.85)' }}>
              <strong style={{ color: '#F87171' }}>The narrative right now:</strong> AI will
              generate the app, the copy, the code, and the design. Designers are the first to go.
              Figma is a relic. This is what every designer and every Figma sales rep is reading
              over coffee.
            </div>
          </div>

          <ul className="space-y-3">
            {HEADLINES.map((h, i) => (
              <HeadlineCard key={i} {...h} />
            ))}
          </ul>

          <GongSignalStrip />
        </div>
      </div>

      {/* Footer: the real question */}
      <div className="mt-10 flex flex-col items-center gap-4 pt-2 text-center">
        <div
          className="max-w-2xl rounded-xl border px-6 py-5"
          style={{
            background:
              'linear-gradient(180deg, rgba(162,89,255,0.08) 0%, rgba(162,89,255,0.02) 100%)',
            borderColor: 'rgba(162, 89, 255, 0.3)',
          }}
        >
          <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#A259FF' }}>
            <FigmaGlyph size={10} /> the real question
          </div>
          <p className="text-base leading-relaxed md:text-lg" style={{ color: '#F3F4F6' }}>
            Does AI-native software development actually <em>need</em> a designer?
          </p>
          <p
            className="mt-2 text-[13px] leading-relaxed"
            style={{ color: 'rgba(243,244,246,0.65)' }}
          >
            Cursor&apos;s answer, in the next five acts, is: <strong>yes — and more than ever.</strong>{' '}
            Here&apos;s why Figma isn&apos;t getting replaced. It&apos;s getting installed, right in the middle of
            the AI-generated SDLC.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#A259FF', color: '#0F0A1F' }}
        >
          See what AI-without-Figma actually ships
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </FigmaActShell>
  );
}

/**
 * Minimal "morning feed" screen, shown inside the IPhoneFrame. Doom scrolling
 * in motion — the headlines the designer sees with bleary eyes.
 */
function NewsfeedScreen() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const feed = [
    '“AI will replace designers by end of 2026.”',
    'RIP design systems: one prompt > one component library',
    '@founder: we shipped without Figma. Ask me anything.',
    'Designers are becoming the new icon pack',
    '“Design tools are dead”',
    'Vibe-coding teams skip mockups entirely',
    'Figma’s moat is a nice UX, not AI',
  ];

  return (
    <div className="flex h-full flex-col px-3 pt-2 pb-3">
      <div className="mb-2 flex items-center gap-2">
        <Newspaper className="h-3.5 w-3.5 text-white/60" />
        <span className="text-[10px] font-semibold text-white/80">Morning Feed</span>
        <Coffee className="ml-auto h-3 w-3 text-white/40" />
        <span className="text-[9px] text-white/40">7:14</span>
      </div>
      <div className="relative flex-1 space-y-2 overflow-hidden">
        {feed.map((line, i) => {
          const idx = (i + tick) % feed.length;
          const opacity = 1 - i * 0.12;
          return (
            <div
              key={i}
              className="rounded-md border px-2.5 py-2 text-[10px] leading-snug transition-all"
              style={{
                background:
                  idx < 2
                    ? 'rgba(248, 113, 113, 0.12)'
                    : 'rgba(255,255,255,0.04)',
                borderColor:
                  idx < 2
                    ? 'rgba(248, 113, 113, 0.25)'
                    : 'rgba(255,255,255,0.08)',
                color:
                  idx < 2
                    ? '#FCA5A5'
                    : 'rgba(243, 244, 246, 0.75)',
                opacity: Math.max(0.35, opacity),
              }}
            >
              {feed[idx]}
            </div>
          );
        })}
        {/* Gradient fade at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, #000 100%)',
          }}
        />
      </div>
      <div
        className="mt-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[9px] font-mono"
        style={{
          background: 'rgba(248,113,113,0.08)',
          color: '#FCA5A5',
          border: '1px solid rgba(248,113,113,0.2)',
        }}
      >
        <TrendingDown className="h-2.5 w-2.5" />
        designer sentiment · trending down
      </div>
    </div>
  );
}

function HeadlineCard({
  outlet,
  time,
  title,
  snippet,
}: {
  outlet: string;
  time: string;
  title: string;
  snippet: string;
}) {
  return (
    <li
      className="rounded-lg border p-4 shadow-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-white/50">
        <Newspaper className="h-3 w-3" />
        <span>{outlet}</span>
        <span className="text-white/30">·</span>
        <span>{time}</span>
      </div>
      <h3 className="mb-1 text-[14px] font-semibold leading-snug text-white">
        {title}
      </h3>
      <p className="text-[12px] leading-relaxed text-white/55">{snippet}</p>
    </li>
  );
}

function GongSignalStrip() {
  return (
    <div
      className="relative mt-2 overflow-hidden rounded-xl border px-4 py-3"
      style={{
        background:
          'linear-gradient(90deg, rgba(162, 89, 255, 0.12) 0%, rgba(162, 89, 255, 0.03) 100%)',
        borderColor: 'rgba(162, 89, 255, 0.3)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ background: 'rgba(162, 89, 255, 0.2)' }}
        >
          <FigmaGlyph size={12} />
        </div>
        <div className="flex-1 text-[12px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.88)' }}>
          <span className="font-semibold" style={{ color: '#A259FF' }}>
            But here&apos;s what the Cursor call recordings say —
          </span>{' '}
          verified via Gong and confirmed by Account Managers directly:{' '}
          <strong className="text-white">the Figma MCP</strong> is the{' '}
          <strong className="text-white">#1 most-asked-about MCP</strong> on customer calls. Design
          is not getting quieter. It&apos;s getting louder.
        </div>
      </div>
      <div
        className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider"
        style={{ background: 'rgba(162, 89, 255, 0.25)', color: '#D4B5FF' }}
      >
        Gong · verified
      </div>
    </div>
  );
}
