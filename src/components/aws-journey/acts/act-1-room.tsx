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
        eyebrow="A Tuesday morning. A four-hour outage on Monday. Oracle support expires in 14 months. The board wants an answer in nine days."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CeoEmail />
        <PostMortemCard />
        <GsiQuoteCard />
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px]"
          style={{ borderColor: 'rgba(229,83,0,0.35)', background: 'rgba(229,83,0,0.08)', color: 'rgba(243,244,246,0.85)' }}
        >
          <Clock className="h-3 w-3" style={{ color: '#E55300' }} />
          <span><span className="font-semibold">Oracle support ends Dec 31, 2027</span> · {countdown} from today</span>
        </div>

        <p className="max-w-2xl text-[13px]" style={{ color: 'rgba(243,244,246,0.7)' }}>
          The GSI quote takes 5 years. Oracle support is gone in 14 months. You need a third option —
          one that ships in <strong style={{ color: '#FF9900' }}>weeks</strong>, not years, and still passes every human review gate.
        </p>

        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
          style={{ background: '#FF9900', color: '#0F1521' }}
        >
          <CursorLogo size={16} tone="light" />
          Deploy Cursor Cloud Agents
          <span>→</span>
        </button>
        <p className="text-[11px]" style={{ color: 'rgba(243,244,246,0.45)' }}>
          You&rsquo;ll watch the same team use Cursor to ship a production cutover in 22 days.
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

      <div className="space-y-2.5 px-4 py-3 text-[12.5px] leading-relaxed">
        <div className="space-y-0.5 border-b pb-2 text-[11px]" style={{ borderColor: 'rgba(17,24,39,0.08)' }}>
          <div><span className="font-semibold">From:</span> Priya N., CEO</div>
          <div><span className="font-semibold">To:</span> Miguel R., VP Engineering</div>
          <div className="pt-0.5 text-[12.5px] font-semibold" style={{ color: '#111827' }}>
            Tuesday&rsquo;s outage — what&rsquo;s the plan?
          </div>
        </div>

        <p>Miguel,</p>
        <p>
          Fourth-quarter close was supposed to be quiet. Instead we spent 4h 12m yesterday with the orders
          pipeline on the floor. <em>Again.</em>
        </p>
        <p>
          Finance says the GSI wants $14M over 5 years. The board will say yes on Dec 15 unless we come back
          with a real alternative.
        </p>
        <p className="font-semibold" style={{ color: '#111827' }}>This cannot happen again.</p>
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

      <dl className="space-y-2 px-4 py-3 text-[12.5px]">
        <Kv label="Duration"     value="4h 12m"     tone="warn" />
        <Kv label="Missed orders"value="$1.2M"      tone="warn" />
        <Kv label="Root cause"   value="Thread-pool exhaustion at normal peak load" mono small />
        <Kv label="Recurrence"   value="3rd time in 18 months" tone="warn" />
        <Kv label="Maintainer"   value="None since 2019" mono small tone="muted" />
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

      <div className="space-y-2.5 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold tabular-nums" style={{ color: '#111827' }}>$14M</div>
          <div className="text-[12px]" style={{ color: '#6B7280' }}>· 5 years · 40 consultants</div>
        </div>

        <ul className="space-y-0.5 text-[12px]" style={{ color: '#374151' }}>
          <li>• First cutover: <span className="font-semibold">Month 14</span></li>
          <li>• Portfolio finish: <span className="font-semibold">May 2030</span></li>
        </ul>

        <div
          className="rounded border-l-2 px-2.5 py-1.5 text-[11px]"
          style={{ background: '#FEF3C7', color: '#78350F', borderColor: '#F59E0B' }}
        >
          <FileWarning className="mr-1 inline h-3 w-3 align-text-bottom" />
          Finishes <strong>30 months</strong> after Oracle support ends.
        </div>
      </div>
    </article>
  );
}
