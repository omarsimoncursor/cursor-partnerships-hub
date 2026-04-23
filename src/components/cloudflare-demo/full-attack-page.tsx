'use client';

/**
 * Full-screen Cloudflare Security takeover that fires after the 5s spike.
 * Datadog-equivalent: FullSloBreachPage. Visual signature: Cloudflare orange
 * accents, "Active Attack" red pill, attack signal + blast radius + defense
 * status laid out in three columns. Two CTAs at the bottom:
 *   - Watch Cursor mitigate (primary, orange)
 *   - Reset
 */

import { useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, ShieldAlert, Activity, Users, ShieldOff } from 'lucide-react';
import {
  CF_BG,
  CF_PANEL,
  CF_BORDER_HARD,
  CF_TEXT_PRIMARY,
  CF_TEXT_SECONDARY,
  CF_TEXT_TERTIARY,
  CF_ORANGE,
  CF_RED,
  CloudflareLogoMark,
} from './cloudflare-chrome';

interface FullAttackPageProps {
  onGo: () => void;
  onReset: () => void;
}

const TOP_IPS = [
  '185.220.101.42',
  '185.220.101.51',
  '185.220.102.7',
  '185.220.102.18',
  '185.220.103.94',
  '185.220.103.121',
  '193.32.162.8',
  '193.32.162.39',
  '5.34.180.62',
  '5.34.180.117',
];

export function FullAttackPage({ onGo, onReset }: FullAttackPageProps) {
  const goRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const t = setTimeout(() => goRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto"
      style={{ background: CF_BG, color: CF_TEXT_PRIMARY }}
    >
      {/* Top orange Cloudflare bar */}
      <div className="h-1 w-full sticky top-0" style={{ background: CF_ORANGE }} />

      {/* Header */}
      <div
        className="px-6 py-3 flex items-center gap-3 border-b"
        style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
      >
        <CloudflareLogoMark />
        <span className="text-[13px] font-semibold text-white">Cloudflare</span>
        <span style={{ color: CF_TEXT_TERTIARY }}>·</span>
        <span className="text-[12.5px] font-mono" style={{ color: CF_TEXT_SECONDARY }}>
          Acme Corp / acme-app.com / Security / Events
        </span>
        <span
          className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.4)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          Active Attack
        </span>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Title block */}
        <div className="mb-6">
          <p
            className="text-[11px] font-mono uppercase tracking-[0.22em] mb-2"
            style={{ color: '#FCA5A5' }}
          >
            Bot Management · score &lt; 5 on 87% of new traffic
          </p>
          <h1 className="text-[34px] md:text-[42px] font-bold text-white leading-tight mb-3">
            Credential-stuffing attack in progress
          </h1>
          <p className="text-[14px] max-w-3xl" style={{ color: CF_TEXT_SECONDARY }}>
            Target:{' '}
            <span className="font-mono text-white">/api/auth/login</span> · Source:{' '}
            <span className="font-mono text-white">ASN 14618</span> · 4.3M auth attempts in
            the last 90s · 0.4% success rate · top user-agent:{' '}
            <span className="font-mono text-white">curl/7.81.0</span>
          </p>
        </div>

        {/* 3-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <SignalPanel />
          <BlastPanel />
          <DefensePanel />
        </div>

        {/* Mitigation horizon */}
        <div
          className="rounded-lg border p-5 mb-8"
          style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(243,128,32,0.15)', border: '1px solid rgba(243,128,32,0.4)' }}
            >
              <ShieldAlert className="w-5 h-5" style={{ color: CF_ORANGE }} />
            </div>
            <div className="flex-1">
              <p
                className="text-[11px] font-mono uppercase tracking-wider mb-1"
                style={{ color: CF_TEXT_TERTIARY }}
              >
                Without Cursor · estimated mitigation horizon
              </p>
              <p className="text-[14px] text-white">
                SOC paged at T+8min · first WAF rule deployed T+24min · app-side fix shipped T+3 days
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: CF_BORDER_HARD }} />
          <span
            className="text-[10px] font-mono uppercase tracking-[0.25em]"
            style={{ color: CF_TEXT_TERTIARY }}
          >
            Demo
          </span>
          <div className="flex-1 h-px" style={{ background: CF_BORDER_HARD }} />
        </div>

        {/* CTA block */}
        <div className="text-center">
          <p className="text-[15px] text-white font-medium mb-5 max-w-xl mx-auto">
            Watch a Cursor agent triage the attack and ship a 3-layer mitigation in under three minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              ref={goRef}
              onClick={onGo}
              className="group px-7 py-3 rounded-full text-white font-semibold text-base
                         transition-all duration-200 flex items-center gap-2 cursor-pointer"
              style={{
                background: CF_ORANGE,
                boxShadow: '0 0 32px rgba(243,128,32,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FAAE40';
                e.currentTarget.style.boxShadow = '0 0 48px rgba(243,128,32,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = CF_ORANGE;
                e.currentTarget.style.boxShadow = '0 0 32px rgba(243,128,32,0.4)';
              }}
            >
              Watch Cursor mitigate
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onReset}
              className="px-5 py-3 rounded-full text-[13px] font-medium border
                         transition-colors cursor-pointer flex items-center gap-2"
              style={{ borderColor: CF_BORDER_HARD, color: CF_TEXT_SECONDARY }}
              onMouseEnter={e => {
                e.currentTarget.style.background = CF_PANEL;
                e.currentTarget.style.color = CF_TEXT_PRIMARY;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = CF_TEXT_SECONDARY;
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Signal panel -----

function SignalPanel() {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <PanelHeader icon={<Activity className="w-3.5 h-3.5" />} title="Attack signal" />
      <div className="p-4 space-y-4">
        {/* Spike sparkline */}
        <div>
          <p className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: CF_TEXT_TERTIARY }}>
            req/s · last 5 min
          </p>
          <SpikeSparkline />
        </div>

        {/* Bot histogram (collapsed) */}
        <div>
          <p className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: CF_TEXT_TERTIARY }}>
            Bot Management score · current
          </p>
          <CollapsedBotBars />
        </div>

        {/* Top IPs */}
        <div>
          <p className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: CF_TEXT_TERTIARY }}>
            Top source IPs · ASN 14618
          </p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            {TOP_IPS.map(ip => (
              <li key={ip} className="text-[11px] font-mono" style={{ color: CF_TEXT_PRIMARY }}>
                {ip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SpikeSparkline() {
  const w = 280;
  const h = 64;
  const series: number[] = [];
  for (let i = 0; i < 30; i++) series.push(11500 + Math.sin(i / 3.5) * 800);
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    const eased = Math.pow(t, 1.4);
    series.push(11500 + eased * 72500);
  }
  const maxY = 90000;
  const stepX = w / (series.length - 1);
  const coords = series.map((v, i) => ({ x: i * stepX, y: h - (v / maxY) * (h - 4) - 2 }));
  const d = coords.map((c, i) => (i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)).join(' ');
  const fill = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cf-spike" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CF_RED} stopOpacity="0.45" />
          <stop offset="100%" stopColor={CF_RED} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#cf-spike)" />
      <path d={d} fill="none" stroke={CF_RED} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3" fill={CF_RED} />
    </svg>
  );
}

function CollapsedBotBars() {
  // 87% of new traffic in score 0..2.
  const buckets = [40, 28, 19, 4, 2, 1, 1, 1, 2, 2];
  const max = Math.max(...buckets);
  return (
    <div className="flex items-end gap-1 h-[44px]">
      {buckets.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: i <= 4 ? CF_RED : '#10B981',
            opacity: i <= 4 ? 0.95 : 0.55,
          }}
        />
      ))}
    </div>
  );
}

// ----- Blast panel -----

function BlastPanel() {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <PanelHeader icon={<Users className="w-3.5 h-3.5" />} title="Blast radius" />
      <div className="p-4 space-y-3">
        <BigStat label="Customer accounts in lockout" value="12" tone="amber" />
        <BigStat label="Auth attempts (last 90s)" value="4.3M" tone="red" />
        <BigStat label="Successful logins" value="0.4%" tone="amber" />
        <BigStat label="Customer-success tickets opened" value="3" tone="amber" />
        <p className="text-[11px] leading-relaxed pt-2 border-t" style={{ color: CF_TEXT_TERTIARY, borderColor: CF_BORDER_HARD }}>
          ~1.4M targeted accounts. Lockout policy threshold (5 failures / 10min)
          will trigger more lockouts in next 30s if traffic sustains.
        </p>
      </div>
    </div>
  );
}

function BigStat({ label, value, tone }: { label: string; value: string; tone: 'red' | 'amber' }) {
  const color = tone === 'red' ? '#FCA5A5' : '#FCD34D';
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12px]" style={{ color: CF_TEXT_SECONDARY }}>
        {label}
      </span>
      <span className="text-[18px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ----- Defense status -----

function DefensePanel() {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <PanelHeader icon={<ShieldOff className="w-3.5 h-3.5" />} title="Defense status" />
      <div className="p-4 space-y-3">
        <DefenseRow
          name="WAF"
          status="default rules only"
          detail="No custom rule matches /api/auth/login"
          tone="bad"
        />
        <DefenseRow
          name="Bot Management"
          status="scoring · not blocking"
          detail="Threshold action set to none (legacy)"
          tone="bad"
        />
        <DefenseRow
          name="Rate limiting"
          status="100 req/s/IP (default)"
          detail="Per-IP only · attacker rotates 8.4k IPs"
          tone="bad"
        />
        <DefenseRow
          name="App-side detector"
          status="lockout-only"
          detail="No CAPTCHA on suspicious-IP signals"
          tone="bad"
        />
        <p className="text-[11px] leading-relaxed pt-2 border-t" style={{ color: CF_TEXT_TERTIARY, borderColor: CF_BORDER_HARD }}>
          0 mitigations active. Cursor will deploy a 3-layer response next
          (edge-immediate → edge-rate-limit → app-long-term).
        </p>
      </div>
    </div>
  );
}

function DefenseRow({ name, status, detail, tone }: { name: string; status: string; detail: string; tone: 'bad' | 'ok' }) {
  const color = tone === 'bad' ? '#FCA5A5' : '#6EE7B7';
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: tone === 'bad' ? CF_RED : '#10B981' }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[12.5px] font-semibold text-white">{name}</span>
          <span className="text-[11px] font-mono" style={{ color }}>{status}</span>
        </div>
        <p className="text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>
          {detail}
        </p>
      </div>
    </div>
  );
}

// ----- Helpers -----

function PanelHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: CF_BORDER_HARD }}>
      <span style={{ color: CF_TEXT_TERTIARY }}>{icon}</span>
      <p className="text-[11px] font-semibold text-white uppercase tracking-wider">{title}</p>
    </div>
  );
}
