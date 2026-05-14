'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CornerDownRight,
  Mail,
  PenTool,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { CursorLogo } from '../cursor-logo';
import { JOURNEY_CONSTANTS } from '../data/script';

interface Act1Props {
  onAdvance: () => void;
}

/* ------------------------------------------------------------------ *
 * Intro phase machine
 *
 * Act 1 used to drop all three cards + the choice matrix on screen at
 * once, which was overwhelming. The new opening tells the story in
 * ordered beats:
 *
 *   1. outage-flash     — full-bleed red SEV-1 banner, ~1.4s
 *   2. outage-shrink    — banner scales down into the incident-ticket slot
 *   3. ticket-revealed  — the rest of the incident ticket lands
 *   4. email-header     — CEO email header types in char-by-char
 *   5. email-body       — CEO email paragraphs reveal one at a time
 *   6. replies          — two reply emails slide in below the CEO message
 *   7. gsi-revealed     — Statement of Work card slides in from the right
 *   8. matrix-revealed  — three-option ChoiceMatrix fades in
 *   9. ready            — CTA enables
 *
 * Each beat has its own ms offset so the timing can be tuned in one
 * place. A "Skip intro" affordance jumps straight to `ready`.
 * ------------------------------------------------------------------ */

type Phase =
  | 'outage-flash'
  | 'outage-shrink'
  | 'ticket-revealed'
  | 'email-header'
  | 'email-body'
  | 'replies'
  | 'gsi-revealed'
  | 'matrix-revealed'
  | 'ready';

const PHASE_AT: Record<Phase, number> = {
  'outage-flash':    0,
  'outage-shrink':   1_400,
  'ticket-revealed': 2_000,
  'email-header':    2_400,
  'email-body':      3_300,
  'replies':         8_300,
  'gsi-revealed':    9_700,
  'matrix-revealed': 10_700,
  'ready':           11_500,
};

const PHASE_ORDER: Phase[] = [
  'outage-flash',
  'outage-shrink',
  'ticket-revealed',
  'email-header',
  'email-body',
  'replies',
  'gsi-revealed',
  'matrix-revealed',
  'ready',
];

function phaseIndex(p: Phase) {
  return PHASE_ORDER.indexOf(p);
}

function reached(current: Phase, target: Phase) {
  return phaseIndex(current) >= phaseIndex(target);
}

function useOracleCountdownText() {
  const [text, setText] = useState('14 months, 03 days');
  useEffect(() => {
    const compute = () => {
      const diff = Math.max(0, JOURNEY_CONSTANTS.oracleContractEnd.getTime() - Date.now());
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const months = Math.floor(totalDays / 30);
      const days = totalDays - months * 30;
      setText(`${months} months, ${String(days).padStart(2, '0')} days`);
    };
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, []);
  return text;
}

/* Typewriter that resolves a string char-by-char on a fixed cadence. */
function useTypewriter(text: string, active: boolean, charsPerSec = 32) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!active) {
      setOut('');
      return;
    }
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setOut(text.slice(0, i));
      if (i < text.length) setTimeout(tick, 1000 / charsPerSec);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [text, active, charsPerSec]);
  return out;
}

export function Act1Room({ onAdvance }: Act1Props) {
  const countdown = useOracleCountdownText();
  const [phase, setPhase] = useState<Phase>('outage-flash');
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = PHASE_ORDER.slice(1).map((p) =>
      setTimeout(() => setPhase(p), PHASE_AT[p]),
    );
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  const skipIntro = () => {
    timerRefs.current.forEach(clearTimeout);
    setPhase('ready');
  };

  const isReady = phase === 'ready';

  return (
    <ActShell act={1}>
      {/* Full-bleed outage flash that morphs into the incident ticket slot */}
      <OutageFlash phase={phase} />

      <ActHeader
        act={1}
        eyebrow="A four-hour outage on Monday. The fourth in 18 months. Oracle support expires in 14 months — and the GSI says it'll take five years to migrate. The board wants an answer in nine days."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CeoEmail phase={phase} />
        <IncidentTicketSlot phase={phase} />
        <GsiQuoteCard phase={phase} countdown={countdown} />
      </div>

      <ChoiceMatrix phase={phase} />

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          onClick={onAdvance}
          disabled={!isReady}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-xl transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: '#FF9900', color: '#0F1521' }}
        >
          <CursorLogo size={16} tone="light" />
          Deploy Cursor Cloud Agents
          <span>→</span>
        </button>
        <p className="text-[13px]" style={{ color: 'rgba(243,244,246,0.6)' }}>
          Watch the same team use Cursor to ship a real production cutover in{' '}
          <strong className="text-white">22 days</strong>, not 14 months.
        </p>
      </div>

      {/* Skip intro pill — only visible during the intro */}
      {!isReady && (
        <button
          type="button"
          onClick={skipIntro}
          className="fixed bottom-6 left-6 z-30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition-colors hover:bg-white/10"
          style={{
            borderColor: 'rgba(255,255,255,0.15)',
            background: 'rgba(15,21,33,0.65)',
            color: 'rgba(243,244,246,0.7)',
          }}
        >
          Skip intro →
        </button>
      )}
    </ActShell>
  );
}

/* ------------------------------------------------------------------ *
 * OutageFlash — the full-bleed banner that opens the act and then
 * shrinks into the incident-ticket slot.
 * ------------------------------------------------------------------ */
function OutageFlash({ phase }: { phase: Phase }) {
  // Hide once the rest of the ticket has been revealed.
  if (reached(phase, 'ticket-revealed')) return null;

  const shrinking = reached(phase, 'outage-shrink');

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-4"
      aria-hidden
    >
      <div
        className="origin-center transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          transform: shrinking ? 'scale(0.18) translateY(-160px)' : 'scale(1)',
          opacity: shrinking ? 0 : 1,
          width: 'min(720px, 92vw)',
        }}
      >
        <div
          className="flex items-center gap-4 rounded-2xl border-2 px-6 py-5 shadow-[0_30px_80px_-20px_rgba(127,29,29,0.7)]"
          style={{
            background: 'linear-gradient(180deg, #7F1D1D 0%, #450A0A 100%)',
            borderColor: '#EF4444',
            color: '#FECACA',
            animation: shrinking ? undefined : 'outagePulse 0.9s ease-in-out infinite',
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{
              background: '#7F1D1D',
              border: '2px solid #FECACA',
            }}
          >
            <AlertTriangle className="h-6 w-6 text-[#FECACA]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#FCA5A5]">
              Production · SEV-1 · OrdersService
            </div>
            <div className="mt-0.5 text-[24px] font-extrabold leading-tight text-white">
              OUTAGE — service down at peak load
            </div>
            <div className="mt-1 font-mono text-[12px] text-[#FECACA] opacity-90">
              Mon, Apr 19 · 14:08 UTC · 1,400+ orders rejected · paging on-call
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes outagePulse {
          0%, 100% { box-shadow: 0 30px 80px -20px rgba(127,29,29,0.7), 0 0 0 0 rgba(239,68,68,0.5); }
          50%      { box-shadow: 0 30px 80px -20px rgba(127,29,29,0.7), 0 0 0 18px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Incident ticket — placeholder during outage flash, then the real
 * ticket cross-fades in once `ticket-revealed`.
 * ------------------------------------------------------------------ */
function IncidentTicketSlot({ phase }: { phase: Phase }) {
  const visible = reached(phase, 'ticket-revealed');
  return (
    <div
      className="transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <IncidentTicket />
    </div>
  );
}

function IncidentTicket() {
  const priorIncidents = [
    { id: 'INC-2024-0418', when: 'Apr 2024', cost: '$0.6M', dur: '2h 51m' },
    { id: 'INC-2025-0214', when: 'Feb 2025', cost: '$0.9M', dur: '3h 18m' },
    { id: 'INC-2025-1107', when: 'Nov 2025', cost: '$1.1M', dur: '5h 02m' },
  ];

  return (
    <article
      className="relative overflow-hidden rounded-xl border shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
      style={{
        background: '#0F172A',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        color: '#F3F4F6',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider"
        style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239,68,68,0.25)', color: '#FCA5A5' }}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Incident · INC-2026-1013</span>
        <span
          className="ml-auto rounded px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.16em]"
          style={{ background: '#7F1D1D', color: '#FECACA' }}
        >
          SEV-1
        </span>
      </header>

      <div className="px-4 py-3.5 space-y-3 text-[13px] leading-snug">
        <div>
          <div className="text-[14px] font-semibold text-white">
            OrdersService — thread-pool exhaustion at peak load
          </div>
          <div className="mt-0.5 text-[11.5px]" style={{ color: 'rgba(243,244,246,0.65)' }}>
            Mon, Apr 19 · resolved after 4h 12m · 1,400+ orders rejected
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Missed revenue" value="$1.2M" tone="warn" />
          <Stat label="Time to resolve" value="4h 12m" tone="warn" />
          <Stat label="Customers paged" value="4 escalations" />
          <Stat label="Service maintainer" value="None since 2019" tone="muted" small />
        </div>

        {/* Recurrence — the 'this isn't new' story */}
        <div
          className="rounded-md border p-2.5"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#FCA5A5' }}>
            <TrendingDown className="h-3 w-3" />
            Recurrence — same root cause, 4th time in 18 months
          </div>
          <ul className="space-y-1">
            {priorIncidents.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                <span className="font-mono opacity-70">{p.id}</span>
                <span className="opacity-65">{p.when}</span>
                <span className="font-mono opacity-80">{p.dur}</span>
                <span className="font-mono font-semibold" style={{ color: '#FCA5A5' }}>{p.cost}</span>
              </li>
            ))}
            <li className="mt-1 flex items-baseline justify-between gap-2 border-t pt-1.5 text-[11.5px]" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              <span className="font-semibold uppercase tracking-wider" style={{ color: '#FCA5A5' }}>18-mo total</span>
              <span className="font-mono font-bold" style={{ color: '#FCA5A5' }}>$3.8M lost</span>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string;
  tone?: 'warn' | 'muted';
  small?: boolean;
}) {
  const valueColor = tone === 'warn' ? '#FCA5A5' : tone === 'muted' ? 'rgba(243,244,246,0.65)' : '#F3F4F6';
  return (
    <div
      className="rounded-md border px-2.5 py-1.5"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
        {label}
      </div>
      <div
        className={`${small ? 'text-[12px]' : 'text-[14px]'} font-semibold leading-tight`}
        style={{ color: valueColor }}
      >
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * CEO email — header types in, then paragraphs reveal one at a time.
 * Once typing finishes, two reply emails stack underneath in the same
 * Gmail thread.
 * ------------------------------------------------------------------ */

const CEO_HEADLINE = 'We can’t kick this down the road again.';

const CEO_PARAGRAPHS: Array<React.ReactNode> = [
  <>Miguel,</>,
  <>
    Yesterday&rsquo;s outage cost us <strong>$1.2M in missed orders</strong> and four customer escalations.
    That&rsquo;s the <strong>fourth</strong> Sev-1 on OrdersService in 18 months. Same root cause every
    time — a 20-year-old WebSphere monolith on Oracle 12c that no one on the team has touched in years.
  </>,
  <>
    We&rsquo;ve been deferring this migration for two budget cycles. Now the deadline is on top of us:{' '}
    <strong>Oracle Database EE goes out of support Dec 31, 2027.</strong> After that, no patches, no
    security fixes — anything left on Oracle becomes an open audit finding.
  </>,
  <>
    The GSI&rsquo;s answer is <strong>$14M and five years</strong>. That finishes <em>after</em> Oracle support
    ends — meaning we&rsquo;d also owe Oracle{' '}
    <strong style={{ color: '#B91C1C' }}>~$8M for a 3-year Sustaining Support extension</strong> just to
    keep the lights on while the GSI catches up. Dana won&rsquo;t sign that.
  </>,
  <span className="font-semibold" style={{ color: '#111827' }}>
    I need a real plan by the Dec 15 board meeting. Not a deck — a plan that finishes before
    Dec 31, 2027.
  </span>,
  <span style={{ color: '#6B7280' }}>— Priya</span>,
];

/** Per-paragraph reveal cadence after the header finishes typing. */
const PARAGRAPH_DELAY_MS = 320;

function CeoEmail({ phase }: { phase: Phase }) {
  const headerActive = reached(phase, 'email-header');
  const bodyActive = reached(phase, 'email-body');
  const repliesActive = reached(phase, 'replies');

  // Once we're at email-body or beyond, all paragraphs are visible. We tick
  // them in over PARAGRAPH_DELAY_MS each so the body fills in line by line.
  const [paragraphsShown, setParagraphsShown] = useState(0);
  useEffect(() => {
    if (!bodyActive) {
      setParagraphsShown(0);
      return;
    }
    let i = 0;
    setParagraphsShown(0);
    const tick = () => {
      i += 1;
      setParagraphsShown(i);
      if (i < CEO_PARAGRAPHS.length) setTimeout(tick, PARAGRAPH_DELAY_MS);
    };
    setTimeout(tick, 200);
  }, [bodyActive]);

  const headlineTyped = useTypewriter(CEO_HEADLINE, headerActive, 36);

  return (
    <div className="flex flex-col gap-2.5">
      <article
        className="relative overflow-hidden rounded-xl border shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
        style={{
          background: '#F9FAFB',
          borderColor: 'rgba(17, 24, 39, 0.12)',
          color: '#111827',
          opacity: headerActive ? 1 : 0,
          transition: 'opacity 350ms',
        }}
      >
        <header
          className="flex items-center gap-2 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
          style={{ background: '#F3F4F6', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
        >
          <Mail className="h-3.5 w-3.5" /> Gmail · Inbox
          <span className="ml-auto text-[10px] font-mono font-normal">just now</span>
        </header>

        <div className="space-y-2.5 px-4 py-3.5 text-[13px] leading-[1.55]">
          <div className="space-y-0.5 border-b pb-2 text-[11.5px]" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
            <div><span className="font-semibold">From:</span> Priya N., CEO</div>
            <div><span className="font-semibold">To:</span> Miguel R., VP Engineering</div>
            <div><span className="font-semibold">Cc:</span> Dana L., CFO · Sam K., GC</div>
            <div className="pt-1 text-[13px] font-semibold" style={{ color: '#111827' }}>
              {headlineTyped}
              {headerActive && headlineTyped.length < CEO_HEADLINE.length && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[1px] animate-pulse bg-[#111827] align-middle" />
              )}
            </div>
          </div>

          {CEO_PARAGRAPHS.map((p, i) => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                opacity: i < paragraphsShown ? 1 : 0,
                transform: i < paragraphsShown ? 'translateY(0)' : 'translateY(4px)',
              }}
            >
              <p>{p}</p>
            </div>
          ))}
        </div>
      </article>

      {/* Reply chain — slides in below the original after typing completes */}
      <ReplyEmail
        visible={repliesActive}
        delayMs={0}
        from="Miguel R."
        role="VP Engineering"
        when="2 min later"
        body={
          <>
            Confirmed. We have to do this <strong>now</strong>. Pulling the team into a war room this afternoon.
          </>
        }
      />
      <ReplyEmail
        visible={repliesActive}
        delayMs={550}
        from="Dana L."
        role="CFO"
        when="9 min later"
        body={
          <>
            Hard <strong>no</strong> on the GSI quote at $14M — and zero on a 3-year Oracle Sustaining
            Support extension on top of it. Find me an option that finishes <em>before</em> Dec 31, 2027.
          </>
        }
      />
    </div>
  );
}

function ReplyEmail({
  visible,
  delayMs,
  from,
  role,
  when,
  body,
}: {
  visible: boolean;
  delayMs: number;
  from: string;
  role: string;
  when: string;
  body: React.ReactNode;
}) {
  return (
    <article
      className="relative overflow-hidden rounded-xl border ml-3 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-500"
      style={{
        background: '#FFFFFF',
        borderColor: 'rgba(17, 24, 39, 0.12)',
        color: '#111827',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <div className="flex items-center gap-2 border-b px-3.5 py-1.5 text-[11px]" style={{ borderColor: 'rgba(17,24,39,0.06)', color: '#6B7280' }}>
        <CornerDownRight className="h-3 w-3" />
        <span className="font-semibold text-[#111827]">{from}</span>
        <span className="text-[10.5px]">· {role}</span>
        <span className="ml-auto text-[10px] font-mono">{when}</span>
      </div>
      <div className="px-3.5 py-2.5 text-[12.5px] leading-[1.5]">{body}</div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * GSI quote — slides in from the right when phase reaches gsi-revealed
 * ------------------------------------------------------------------ */
function GsiQuoteCard({ phase, countdown }: { phase: Phase; countdown: string }) {
  const visible = reached(phase, 'gsi-revealed');
  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(28px)',
      }}
    >
      <GsiQuoteCardInner countdown={countdown} />
    </div>
  );
}

function GsiQuoteCardInner({ countdown }: { countdown: string }) {
  return (
    <article
      className="relative overflow-hidden rounded-xl border"
      style={{
        background: '#FAF8F3',
        borderColor: 'rgba(17, 24, 39, 0.15)',
        color: '#1F2937',
      }}
    >
      {/* The "FINAL" red rubber stamp */}
      <div
        className="pointer-events-none absolute right-4 top-6 rotate-[-14deg] rounded border-[3px] px-2.5 py-1 text-center text-[11px] font-black uppercase tracking-[0.18em]"
        style={{
          borderColor: '#B91C1C',
          color: '#B91C1C',
          opacity: 0.82,
          fontFamily: 'ui-monospace, monospace',
          boxShadow: 'inset 0 0 0 2px rgba(185,28,28,0.2)',
        }}
      >
        FINAL
        <div className="text-[9px] font-bold opacity-85">signature due Dec 15</div>
      </div>

      <header
        className="border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ background: '#F3F0E7', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
      >
        <PenTool className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom" />
        Statement of Work · Hyperscale GSI
      </header>

      <div className="space-y-3 px-4 py-3.5">
        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold tabular-nums leading-none" style={{ color: '#111827' }}>$14M</div>
            <div className="text-[13px] font-semibold" style={{ color: '#6B7280' }}>fixed bid</div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px]" style={{ color: '#4B5563' }}>
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> 5-year program</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> 40 consultants</span>
            <span>· 38 services · 4 waves</span>
          </div>
        </div>

        {/* The timing trap — visual */}
        <div className="rounded-md border p-2.5" style={{ borderColor: 'rgba(17,24,39,0.1)', background: '#FFFFFF' }}>
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#6B7280' }}>
            Timeline vs. Oracle deadline
          </div>
          <TimingTrap />
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11.5px]" style={{ color: '#374151' }}>
            <span>First cutover · <strong>Month 14</strong></span>
            <span>Portfolio finish · <strong>May 2030</strong></span>
            <span>
              Oracle EoL ·{' '}
              <strong style={{ color: '#B91C1C' }}>Dec 31, 2027</strong>
            </span>
            <span style={{ color: '#B91C1C' }}>
              <strong>30 months</strong> past the deadline
            </span>
          </div>
        </div>

        <div
          className="rounded-md border-l-[3px] px-3 py-2 text-[12.5px] leading-snug"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <AlertTriangle className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
          <strong>Hidden cost: ~$8M Oracle Sustaining Support</strong> for the 3-year bridge while the GSI catches up.
          <span className="mt-1 block opacity-90">
            Real all-in: <strong>~$22M</strong> · {countdown} until Oracle EoL.
          </span>
        </div>
      </div>
    </article>
  );
}

/**
 * Visual timeline showing the GSI's projected finish stretching well past
 * the Oracle EoL date — a single-bar diagram, not numbers in a table.
 */
function TimingTrap() {
  // Bar represents Today → May 2030 (~50 months). Oracle EoL at ~14/50.
  const eolPct = 0.30;
  return (
    <div className="relative h-9">
      {/* Track */}
      <div
        className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full"
        style={{ background: 'linear-gradient(90deg, #FCA5A5 0%, #FCA5A5 ' + (eolPct * 100) + '%, #DC2626 ' + (eolPct * 100) + '%, #7F1D1D 100%)' }}
      />
      {/* Today marker */}
      <div className="absolute left-0 top-0 flex h-full flex-col items-center">
        <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#374151' }}>Today</div>
        <div className="mt-auto h-2 w-2 rounded-full border-2" style={{ background: '#FFFFFF', borderColor: '#374151' }} />
      </div>
      {/* Oracle EoL marker */}
      <div className="absolute top-0 flex h-full flex-col items-center" style={{ left: `${eolPct * 100}%`, transform: 'translateX(-50%)' }}>
        <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#B91C1C' }}>Oracle EoL</div>
        <div className="mt-auto h-3.5 w-[3px]" style={{ background: '#B91C1C' }} />
      </div>
      {/* GSI finish marker */}
      <div className="absolute right-0 top-0 flex h-full flex-col items-center">
        <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#7F1D1D' }}>GSI finish</div>
        <div className="mt-auto h-2 w-2 rounded-full" style={{ background: '#7F1D1D' }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The "three options" comparison row — fades in once `matrix-revealed`.
 * ------------------------------------------------------------------ */
function ChoiceMatrix({ phase }: { phase: Phase }) {
  const visible = reached(phase, 'matrix-revealed');
  return (
    <section
      className="mt-6 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="mb-2 flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'rgba(243,244,246,0.5)' }}
      >
        <span>The three options on the table</span>
        <span style={{ color: 'rgba(243,244,246,0.4)' }}>
          Same destination · same Oracle deadline
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <OptionCard
          tone="bad"
          tag="Option A"
          title="Extend Oracle support"
          cost="≈ $8M"
          time="3-yr Sustaining Support"
          delivers="Nothing migrated"
          bullets={[
            'Buys time, doesn’t solve the problem',
            'Audit-finding risk grows every quarter',
            'Defers — doesn’t kill — the $14M GSI bill',
          ]}
        />
        <OptionCard
          tone="bad"
          tag="Option B"
          title="Sign the GSI quote"
          cost="$14M + $8M"
          costNote="quote + Oracle bridge"
          time="60 months"
          delivers="Done May 2030 · 30 mo late"
          bullets={[
            'First cutover lands Month 14 — already too late',
            'Still owes Oracle for the 3-yr support gap',
            '40 consultants spun up, then spun down',
          ]}
        />
        <OptionCard
          tone="good"
          tag="Option C"
          title="Cursor Cloud Agents on AWS"
          cost="≈ $1.4M"
          costNote="agent compute + AWS"
          time="22 days, first cutover"
          delivers="Whole portfolio by Feb 2028"
          bullets={[
            '10 months ahead of the Oracle deadline',
            'Senior reviewers still sign every gate',
            'Same 4-person team — no new headcount, no SOW',
          ]}
        />
      </div>
    </section>
  );
}

function OptionCard({
  tone,
  tag,
  title,
  cost,
  costNote,
  time,
  delivers,
  bullets,
}: {
  tone: 'good' | 'bad';
  tag: string;
  title: string;
  cost: string;
  costNote?: string;
  time: string;
  delivers: string;
  bullets: string[];
}) {
  const isGood = tone === 'good';
  return (
    <article
      className="relative overflow-hidden rounded-xl border p-4"
      style={{
        background: isGood
          ? 'linear-gradient(180deg, rgba(255,153,0,0.10) 0%, rgba(255,153,0,0.02) 100%)'
          : 'rgba(255,255,255,0.02)',
        borderColor: isGood ? 'rgba(255,153,0,0.4)' : 'rgba(255,255,255,0.08)',
        color: '#F3F4F6',
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{
            borderColor: isGood ? 'rgba(255,153,0,0.5)' : 'rgba(255,255,255,0.18)',
            color: isGood ? '#FFC66D' : 'rgba(243,244,246,0.6)',
          }}
        >
          {tag}
        </span>
        {isGood && (
          <span
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(255,153,0,0.2)', color: '#FFC66D' }}
          >
            <Zap className="h-3 w-3" />
            Recommended
          </span>
        )}
      </div>

      <div
        className="text-[16px] font-bold leading-tight"
        style={{ color: isGood ? '#FFFFFF' : 'rgba(243,244,246,0.92)' }}
      >
        {title}
      </div>

      {isGood && (
        <div
          className="mt-1.5 text-[11.5px] font-semibold leading-snug"
          style={{ color: '#FFC66D' }}
        >
          The only option that finishes before Oracle EoL.
        </div>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
            All-in cost
          </div>
          <div
            className="text-[16px] font-bold tabular-nums leading-tight"
            style={{ color: isGood ? '#34D399' : '#FCA5A5' }}
          >
            {cost}
          </div>
          {costNote && (
            <div className="text-[10px]" style={{ color: 'rgba(243,244,246,0.5)' }}>
              {costNote}
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>
            Timeline
          </div>
          <div
            className="text-[14px] font-semibold leading-tight"
            style={{ color: isGood ? '#FFFFFF' : 'rgba(243,244,246,0.85)' }}
          >
            {time}
          </div>
          <div
            className="text-[10.5px]"
            style={{ color: isGood ? '#34D399' : '#FCA5A5' }}
          >
            {delivers}
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1 border-t pt-2.5 text-[11.5px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(243,244,246,0.75)' }}>
        {bullets.map((b) => (
          <li key={b} className="flex gap-1.5">
            <span aria-hidden style={{ color: isGood ? '#FF9900' : 'rgba(243,244,246,0.35)' }}>
              {isGood ? '+' : '·'}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
