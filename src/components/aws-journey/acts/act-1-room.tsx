'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, FileWarning, Mail, PenTool, Zap } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { CursorLogo } from '../cursor-logo';
import { JOURNEY_CONSTANTS } from '../data/script';

interface Act1Props {
  onAdvance: () => void;
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

export function Act1Room({ onAdvance }: Act1Props) {
  const countdown = useOracleCountdownText();

  return (
    <ActShell act={1}>
      <ActHeader
        act={1}
        eyebrow="A Tuesday, 6 days after a production outage. The CTO has a board meeting in nine days."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <CeoEmail />
        <PostMortemCard />
        <GsiQuoteCard />
      </div>

      {/* Footer strip */}
      <div
        className="mt-10 flex items-center gap-3 rounded-lg border px-5 py-4"
        style={{
          background: 'rgba(229, 83, 0, 0.08)',
          borderColor: 'rgba(229, 83, 0, 0.35)',
        }}
      >
        <Clock className="h-4 w-4 shrink-0" style={{ color: '#E55300' }} />
        <div className="flex-1 text-sm" style={{ color: '#F3F4F6' }}>
          <span className="font-semibold">Oracle Database Enterprise Edition support ends Dec 31, 2027.</span>{' '}
          <span style={{ color: 'rgba(243,244,246,0.7)' }}>{countdown} from today.</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-5 pt-2 text-center">
        <p className="max-w-xl text-sm" style={{ color: 'rgba(243,244,246,0.65)' }}>
          The GSI will take 5 years. The support contract is gone in 14 months. You need a third option.
        </p>

        {/* Third-option card */}
        <div
          className="flex w-full max-w-xl flex-col gap-3 rounded-xl border px-5 py-4 text-left shadow-xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,153,0,0.12) 0%, rgba(255,153,0,0.04) 100%)',
            borderColor: 'rgba(255,153,0,0.35)',
            color: '#F9FAFB',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CursorLogo size={22} tone="dark" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#FF9900' }}>
                  The third option
                </span>
                <span className="text-base font-bold leading-tight">Cursor Cloud Agents + AWS</span>
              </div>
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(255,153,0,0.18)', color: '#FFC66D' }}
            >
              <Zap className="h-3 w-3" /> 5× faster than GSI
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.8)' }}>
            Cursor Cloud Agents work alongside your own engineers — scanning the monolith, drafting
            architecture, authoring CDK, writing tests, and driving the cutover. Every gate still goes
            through a named human reviewer. First production cutover in <strong>22 days</strong>,
            not 14 months.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#FF9900', color: '#0F1521' }}
        >
          <CursorLogo size={16} tone="light" />
          Deploy Cursor Cloud Agents
          <span>→</span>
        </button>
      </div>
    </ActShell>
  );
}

function CeoEmail() {
  return (
    <article
      className="relative overflow-hidden rounded-xl border shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
      style={{
        background: '#F9FAFB',
        borderColor: 'rgba(17, 24, 39, 0.12)',
        color: '#111827',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ background: '#F3F4F6', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
      >
        <Mail className="h-3.5 w-3.5" /> Gmail · Inbox
        <span className="ml-auto text-[10px] font-mono font-normal">6 days ago</span>
      </header>

      <div className="space-y-3 px-5 py-4 text-[13px] leading-relaxed">
        <div className="space-y-0.5 border-b pb-3 text-[12px]" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
          <div>
            <span className="font-semibold">From:</span> Priya N., CEO
            &lt;priya@acme.com&gt;
          </div>
          <div>
            <span className="font-semibold">To:</span> Miguel R., VP Engineering
          </div>
          <div className="text-[13px] font-semibold" style={{ color: '#111827' }}>
            Tuesday’s outage — what’s the plan?
          </div>
        </div>

        <p>Miguel,</p>
        <p>
          Fourth-quarter close was supposed to be quiet. Instead we spent 4 hours and 12 minutes yesterday with
          the orders pipeline on the floor. Again. Sales is asking how many times we can apologize to the same
          three customers before one of them leaves.
        </p>
        <p>
          Finance says the GSI wants $14M over 5 years to take us off WebSphere. The board will say yes on Dec 15
          unless we come back with a credible alternative. A real one — not a deck.
        </p>
        <p className="font-semibold" style={{ color: '#111827' }}>
          This cannot happen again. What’s our modernization path?
        </p>
        <p style={{ color: '#6B7280' }}>— Priya</p>
      </div>
    </article>
  );
}

function PostMortemCard() {
  return (
    <article
      className="relative overflow-hidden rounded-xl border"
      style={{
        background: '#111827',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        color: '#F3F4F6',
      }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider"
        style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#FCA5A5' }}
      >
        <AlertTriangle className="h-3.5 w-3.5" /> INC-2026-1013 · SEV-1 post-mortem
      </header>

      <dl className="space-y-3 px-5 py-4 text-[13px]">
        <Kv label="Duration"     value="4h 12m"     tone="warn" />
        <Kv label="Missed orders"value="$1.2M"      tone="warn" />
        <Kv label="Root cause"   value="WebSphere thread-pool exhaustion under normal peak load" mono small />
        <Kv label="Recurrence"   value="3rd time in 18 months" tone="warn" />
        <Kv label="Owner"        value="nobody — last OrdersService maintainer left in 2019" mono small tone="muted" />

        <div className="mt-3 rounded-md border px-3 py-2 text-[11px]" style={{ borderColor: 'rgba(252,165,165,0.25)', background: 'rgba(239,68,68,0.06)', color: '#FCA5A5' }}>
          <code className="font-mono">
            thread-pool-default: 512 / 512 · queue-depth: 8,193 · oldest-request: 3m 47s
          </code>
        </div>
      </dl>
    </article>
  );
}

function Kv({ label, value, mono, small, tone }: { label: string; value: string; mono?: boolean; small?: boolean; tone?: 'warn' | 'muted' }) {
  const valueColor = tone === 'warn' ? '#FCA5A5' : tone === 'muted' ? 'rgba(243,244,246,0.6)' : '#F3F4F6';
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.55)' }}>{label}</dt>
      <dd
        className={`${mono ? 'font-mono' : ''} ${small ? 'text-[12px]' : 'text-sm'} font-semibold text-right`}
        style={{ color: valueColor, maxWidth: '60%' }}
      >
        {value}
      </dd>
    </div>
  );
}

function GsiQuoteCard() {
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
        className="border-b px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ background: '#F3F0E7', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
      >
        <PenTool className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom" />
        Statement of Work · Hyperscale GSI
      </header>

      <div className="space-y-3 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold tabular-nums" style={{ color: '#111827' }}>$14M</div>
          <div className="text-[12px]" style={{ color: '#6B7280' }}>· 5 years · 40 consultants</div>
        </div>

        <ul className="space-y-1 text-[12px]" style={{ color: '#374151' }}>
          <li>• MAP-accelerated monolith decomposition engagement</li>
          <li>• 38 bounded contexts, 4 modernization waves</li>
          <li>• Projected first production cutover: <span className="font-semibold">Month 14</span></li>
          <li>• Projected portfolio finish: <span className="font-semibold">May 2030</span></li>
        </ul>

        <div
          className="rounded border-l-2 px-3 py-2 text-[11px] font-mono"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <FileWarning className="mr-1 inline h-3 w-3 align-text-bottom" />
          Oracle support ends Dec 31, 2027. At this cadence, 30 months late.
        </div>
      </div>
    </article>
  );
}
