'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, FileWarning, Mail, PenTool } from 'lucide-react';
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
        eyebrow="It’s Tuesday morning, after a four-hour outage on Monday. Oracle support expires in 14 months. The board wants an answer in nine days."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CeoEmail />
        <PostMortemCard />
        <GsiQuoteCard />
      </div>

      <div className="mt-7 flex flex-col items-center gap-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px]"
          style={{ borderColor: 'rgba(229,83,0,0.35)', background: 'rgba(229,83,0,0.08)', color: '#F3F4F6' }}
        >
          <Clock className="h-3.5 w-3.5" style={{ color: '#E55300' }} />
          <span><span className="font-semibold">Oracle support ends Dec 31, 2027</span> — {countdown} from today.</span>
        </div>

        <p className="max-w-3xl text-[15px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.85)' }}>
          Acme <strong className="text-white">has to migrate off Oracle</strong> before the contract expires — extending it isn&rsquo;t an option finance will sign.
          The GSI&rsquo;s plan delivers the first cutover in <strong className="text-white">14 months</strong> and finishes the whole portfolio
          in <strong style={{ color: '#FCA5A5' }}>5 years</strong> — almost <strong style={{ color: '#FCA5A5' }}>three years</strong> after Oracle support ends.
        </p>

        <p className="max-w-3xl text-[15px] leading-relaxed" style={{ color: 'rgba(243,244,246,0.85)' }}>
          The math doesn&rsquo;t work with humans alone. The only way to hit the deadline is to put{' '}
          <strong style={{ color: '#FF9900' }}>AI agents on the work</strong> — drafting, porting, testing, and cutting over —
          while a small team of senior reviewers signs every gate.
        </p>

        <button
          type="button"
          onClick={onAdvance}
          className="mt-1 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#FF9900', color: '#0F1521' }}
        >
          <CursorLogo size={16} tone="light" />
          Deploy Cursor Cloud Agents
          <span>→</span>
        </button>
        <p className="text-[13px]" style={{ color: 'rgba(243,244,246,0.6)' }}>
          You&rsquo;re about to watch the same team use Cursor to ship a real production cutover in <strong className="text-white">22 days</strong>, not 14 months.
        </p>
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

      <div className="space-y-2.5 px-4 py-3.5 text-[13px] leading-relaxed">
        <div className="space-y-0.5 border-b pb-2 text-[11.5px]" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
          <div><span className="font-semibold">From:</span> Priya N., CEO</div>
          <div><span className="font-semibold">To:</span> Miguel R., VP Engineering</div>
          <div className="pt-1 text-[13px] font-semibold" style={{ color: '#111827' }}>
            Tuesday&rsquo;s outage — what&rsquo;s the plan?
          </div>
        </div>

        <p>Miguel,</p>
        <p>
          Fourth-quarter close was supposed to be quiet. Instead we spent 4h 12m yesterday with the orders
          pipeline on the floor. <em>Again.</em>
        </p>
        <p>
          Finance says the GSI wants <strong>$14M over 5 years</strong>. That gets us off Oracle{' '}
          <strong style={{ color: '#B91C1C' }}>after</strong> support expires — which means we&rsquo;d still be paying
          Oracle for a renewal we shouldn&rsquo;t need.
        </p>
        <p className="font-semibold" style={{ color: '#111827' }}>
          We need a real plan by Dec 15. This cannot happen again.
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

      <dl className="space-y-2.5 px-4 py-3.5 text-[13px]">
        <Kv label="Duration"      value="4h 12m"     tone="warn" />
        <Kv label="Missed orders" value="$1.2M"      tone="warn" />
        <Kv label="Root cause"    value="Thread-pool exhaustion at normal peak load" mono small />
        <Kv label="Recurrence"    value="3rd time in 18 months" tone="warn" />
        <Kv label="Maintainer"    value="None since 2019" mono small tone="muted" />
      </dl>
    </article>
  );
}

function Kv({ label, value, mono, small, tone }: { label: string; value: string; mono?: boolean; small?: boolean; tone?: 'warn' | 'muted' }) {
  const valueColor = tone === 'warn' ? '#FCA5A5' : tone === 'muted' ? 'rgba(243,244,246,0.6)' : '#F3F4F6';
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11.5px] uppercase tracking-wider" style={{ color: 'rgba(243,244,246,0.6)' }}>{label}</dt>
      <dd
        className={`${mono ? 'font-mono' : ''} ${small ? 'text-[12.5px]' : 'text-[14px]'} font-semibold text-right`}
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
        className="border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ background: '#F3F0E7', borderColor: 'rgba(17,24,39,0.08)', color: '#6B7280' }}
      >
        <PenTool className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom" />
        Statement of Work · Hyperscale GSI
      </header>

      <div className="space-y-3 px-4 py-3.5">
        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold tabular-nums leading-none" style={{ color: '#111827' }}>$14M</div>
            <div className="text-[13px] font-semibold" style={{ color: '#6B7280' }}>over 5 years</div>
          </div>
          <div className="mt-1 text-[12.5px]" style={{ color: '#6B7280' }}>
            40 consultants · 38 services · 4 modernization waves
          </div>
        </div>

        <dl className="space-y-1.5 text-[13px]" style={{ color: '#1F2937' }}>
          <div className="flex items-baseline justify-between gap-2 border-t pt-1.5" style={{ borderColor: 'rgba(17,24,39,0.06)' }}>
            <dt className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>First cutover</dt>
            <dd className="font-semibold">Month 14</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Portfolio finish</dt>
            <dd className="font-semibold">May 2030</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Oracle EoL</dt>
            <dd className="font-semibold" style={{ color: '#B91C1C' }}>Dec 31, 2027</dd>
          </div>
        </dl>

        <div
          className="rounded-md border-l-[3px] px-3 py-2 text-[12.5px] leading-snug"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <FileWarning className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
          <strong>Finishes 30 months after Oracle support ends.</strong>
          <span className="mt-0.5 block opacity-90">
            Acme would owe a multi-year Oracle extension just to keep the lights on while the GSI catches up.
          </span>
        </div>
      </div>
    </article>
  );
}
