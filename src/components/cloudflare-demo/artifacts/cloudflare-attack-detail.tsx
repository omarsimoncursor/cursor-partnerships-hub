'use client';

/**
 * Cloudflare Security event-detail page (after state). Mirrors the layout of
 * the full-attack takeover but the pill is amber "Mitigated · Monitoring" and
 * the defense panel shows the 3 layers landed by cursor-agent. A "Mitigation
 * timeline" tab on the right shows every action with the cursor-agent actor
 * label. Bottom: "Auto-mitigated by Cursor · 0 humans paged · attack absorbed
 * at edge in 2m 30s".
 */

import {
  Activity,
  ChevronDown,
  Shield,
  ShieldCheck,
  Users,
  Cpu,
  Globe2,
  Clock,
  TerminalSquare,
} from 'lucide-react';
import {
  CF_BG,
  CF_PANEL,
  CF_BORDER,
  CF_BORDER_HARD,
  CF_TEXT_PRIMARY,
  CF_TEXT_SECONDARY,
  CF_TEXT_TERTIARY,
  CF_ORANGE,
  CF_GREEN,
  CF_AMBER,
  CF_RED,
  CloudflareTopNav,
} from '../cloudflare-chrome';
import { WorldMap } from '../world-map';

const TIMELINE = [
  {
    t: 'T+0 s',
    actor: 'cloudflare',
    label: 'Bot Management score collapse · webhook fired',
    detail: '/api/auth/login · 87% bot · ASN 14618',
    tone: 'attack' as const,
  },
  {
    t: 'T+1 s',
    actor: 'cursor-agent',
    label: 'Webhook received · agent picked up event',
    detail: 'Cloudflare MCP · Threat Intel MCP · GitHub MCP',
    tone: 'mitigating' as const,
  },
  {
    t: 'T+12 s',
    actor: 'cursor-agent',
    label: 'Threat-intel correlation complete',
    detail: 'ASN 14618 known · 87% confidence credential-stuffing infra',
    tone: 'mitigating' as const,
  },
  {
    t: 'T+28 s',
    actor: 'cursor-agent',
    label: '3-layer mitigation plan drafted (Opus)',
    detail: 'edge-immediate · edge-rate-limit · app-long-term',
    tone: 'mitigating' as const,
  },
  {
    t: 'T+45 s',
    actor: 'cursor-agent',
    label: 'Layer 1 · WAF rule waf-2c8a4f live (Log mode)',
    detail: 'Narrow scope · ASN 14618 + curl/7.81 + /api/auth/login · 60s observation',
    tone: 'mitigating' as const,
  },
  {
    t: 'T+1 m 22 s',
    actor: 'cursor-agent',
    label: 'Layer 1 promoted to Block · 0 false positives',
    detail: 'req/s −55% within 5 s · 1.92M log-mode matches reviewed',
    tone: 'mitigating' as const,
  },
  {
    t: 'T+2 m 12 s',
    actor: 'cursor-agent',
    label: 'Layer 2 · Worker rate-limit live in production',
    detail: 'wrangler deploy · canary 1% (30s, 0 errors) → 100%',
    tone: 'mitigating' as const,
  },
  {
    t: 'T+2 m 30 s',
    actor: 'cursor-agent',
    label: 'Layer 3 · app-side detector PR #319 (DRAFT) opened',
    detail: 'CAPTCHA on suspicious-IP · awaiting security-team review',
    tone: 'recovered' as const,
  },
  {
    t: 'T+2 m 33 s',
    actor: 'cursor-agent',
    label: 'Statuspage · Slack #sec-ops · SIEM updated',
    detail: 'Public statuspage published · audit-trail flushed',
    tone: 'recovered' as const,
  },
  {
    t: 'T+2 m 48 s',
    actor: 'cursor-agent',
    label: 'Verified · req/s back to baseline · monitoring',
    detail: 'Bot-score distribution restored · 0 customer accounts in lockout',
    tone: 'recovered' as const,
  },
];

const TOP_IPS = [
  '185.220.101.42',
  '185.220.101.51',
  '185.220.102.7',
  '185.220.102.18',
  '185.220.103.94',
  '185.220.103.121',
  '193.32.162.8',
  '193.32.162.39',
];

export function CloudflareAttackDetail() {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: CF_BG, color: CF_TEXT_PRIMARY }}
    >
      <CloudflareTopNav />

      {/* Sub-breadcrumb */}
      <div
        className="px-4 py-2.5 border-b text-[12px] flex items-center gap-2"
        style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD, color: CF_TEXT_SECONDARY }}
      >
        <span>Security</span>
        <span style={{ color: CF_TEXT_TERTIARY }}>/</span>
        <span>Events</span>
        <span style={{ color: CF_TEXT_TERTIARY }}>/</span>
        <span className="text-white font-medium font-mono">cf-2026-04-23-2342</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
            Auto-refresh
          </span>
          <ChevronDown className="w-3 h-3" style={{ color: CF_TEXT_TERTIARY }} />
        </span>
      </div>

      {/* Event header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: CF_BORDER_HARD, background: '#0E141C' }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-mono uppercase tracking-wider mb-1"
              style={{ color: CF_TEXT_TERTIARY }}
            >
              Security event · credential-stuffing
            </p>
            <h1 className="text-[22px] font-semibold text-white leading-tight mb-2">
              Credential-stuffing wave on /api/auth/login
            </h1>
            <p className="text-[12.5px]" style={{ color: CF_TEXT_SECONDARY }}>
              ASN 14618 · 4.3M auth attempts in 90 s · top UA{' '}
              <span className="font-mono text-white">curl/7.81.0</span> · 8.4k distinct source IPs
            </p>
          </div>
          <span
            className="shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
            style={{
              background: 'rgba(245,158,11,0.15)',
              color: '#FCD34D',
              border: '1px solid rgba(245,158,11,0.4)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CF_AMBER }} />
            Mitigated · Monitoring
          </span>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-5 gap-3">
          <Stat label="Detection" value="T+0 s" tone="info" />
          <Stat label="First mitigation" value="T+45 s" tone="ok" />
          <Stat label="Recovered" value="T+2 m 48 s" tone="ok" />
          <Stat label="Humans paged" value="0" tone="ok" />
          <Stat label="Layers landed" value="3" tone="ok" />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center px-5 gap-0 border-b text-[12.5px] shrink-0"
        style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
      >
        <Tab label="Overview" icon={<Activity className="w-3.5 h-3.5" />} active />
        <Tab label="Mitigation timeline" icon={<Clock className="w-3.5 h-3.5" />} count="10" />
        <Tab label="Source IPs" icon={<Globe2 className="w-3.5 h-3.5" />} count="8.4k" />
        <Tab label="Logpush" icon={<TerminalSquare className="w-3.5 h-3.5" />} count="1.92M" />
        <Tab label="Related rules" icon={<Shield className="w-3.5 h-3.5" />} count="4" />
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* 2-col body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Left: defense status + timeline */}
          <div className="min-w-0 space-y-4">
            <DefenseStatus />
            <MitigationTimeline />
          </div>

          {/* Right: signal + map sidebar */}
          <div className="space-y-4">
            <SignalSidebar />
            <SidebarCard title="Top source IPs" subtitle="ASN 14618 · all blocked at edge">
              <ul className="space-y-1">
                {TOP_IPS.map(ip => (
                  <li key={ip} className="flex items-center justify-between text-[11.5px]">
                    <span className="font-mono" style={{ color: CF_TEXT_PRIMARY }}>{ip}</span>
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(220,38,38,0.18)', color: '#FCA5A5' }}
                    >
                      blocked
                    </span>
                  </li>
                ))}
              </ul>
            </SidebarCard>
          </div>
        </div>

        {/* World map at bottom */}
        <div className="mt-4">
          <div
            className="rounded-lg border p-4"
            style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
          >
            <WorldMap
              intensity={0.08}
              paused
              heading="Edge traffic post-mitigation"
              subheading="Cluster contained · req/s back to 12.2k baseline"
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-4 rounded-lg border px-5 py-4 text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(243,128,32,0.06) 0%, rgba(16,185,129,0.06) 100%)',
            borderColor: CF_BORDER_HARD,
          }}
        >
          <p className="text-[12.5px] font-medium text-white">
            Auto-mitigated by Cursor · 0 humans paged · attack absorbed at edge in 2m 30s
          </p>
          <p className="text-[11px] mt-1" style={{ color: CF_TEXT_TERTIARY }}>
            Three defense layers shipped via Cloudflare API + Wrangler. App-side patch awaiting human review.
          </p>
        </div>
      </div>
    </div>
  );
}

function Tab({
  label,
  icon,
  count,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  count?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap`}
      style={{
        color: active ? '#fff' : CF_TEXT_SECONDARY,
        borderColor: active ? CF_ORANGE : 'transparent',
        fontWeight: active ? 600 : 400,
      }}
    >
      {icon}
      {label}
      {count && (
        <span
          className="px-1.5 py-0.5 rounded text-[10px]"
          style={{ background: '#1F2A37', color: CF_TEXT_TERTIARY }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'info' | 'attack' }) {
  const color =
    tone === 'ok' ? '#6EE7B7' : tone === 'attack' ? '#FCA5A5' : '#E5ECF4';
  return (
    <div className="rounded-md border px-3 py-2.5" style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}>
      <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: CF_TEXT_TERTIARY }}>
        {label}
      </p>
      <p className="text-[16px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

// ---- Defense status ----

function DefenseStatus() {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}>
      <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: CF_BORDER_HARD }}>
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: CF_GREEN }} />
        <p className="text-[11px] font-semibold text-white uppercase tracking-wider">Defense status</p>
        <span className="ml-auto text-[10.5px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
          3 layers active · auto-deployed
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: CF_BORDER }}>
        <DefenseRow
          icon={<Shield className="w-3.5 h-3.5" />}
          name="Layer 1 · WAF rule waf-2c8a4f"
          status="LIVE · BLOCK"
          detail="Auto-deployed by cursor-agent · 45s after detection · Log mode → 60s observe → Block · 0 false positives"
        />
        <DefenseRow
          icon={<Cpu className="w-3.5 h-3.5" />}
          name="Layer 2 · Worker rate-limit (auth-rate-limit.ts)"
          status="LIVE · 5/min/IP"
          detail="Wrangler deploy build d4f2a · canary route 1% (30s, 0 errors) → production 100% · 90s after detection"
        />
        <DefenseRow
          icon={<Users className="w-3.5 h-3.5" />}
          name="Layer 3 · App-side detector (PR #319)"
          status="DRAFT · awaiting human review"
          detail="CAPTCHA on suspicious-IP · lockout-threshold tightened · awaiting security-team review per agent guardrail"
          tone="amber"
        />
      </div>
    </div>
  );
}

function DefenseRow({
  icon,
  name,
  status,
  detail,
  tone = 'green',
}: {
  icon: React.ReactNode;
  name: string;
  status: string;
  detail: string;
  tone?: 'green' | 'amber';
}) {
  const statusColor = tone === 'amber' ? '#FCD34D' : '#6EE7B7';
  const statusBg = tone === 'amber' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)';
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#0E141C', color: tone === 'amber' ? CF_AMBER : CF_GREEN, border: `1px solid ${CF_BORDER_HARD}` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[12.5px] text-white">{name}</p>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
            style={{ background: statusBg, color: statusColor }}
          >
            {status}
          </span>
        </div>
        <p className="text-[11.5px]" style={{ color: CF_TEXT_TERTIARY }}>
          {detail}
        </p>
      </div>
    </div>
  );
}

// ---- Mitigation timeline ----

function MitigationTimeline() {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}>
      <div className="px-4 py-2.5 border-b flex items-center" style={{ borderColor: CF_BORDER_HARD }}>
        <Clock className="w-3.5 h-3.5 mr-2" style={{ color: CF_TEXT_TERTIARY }} />
        <p className="text-[11px] font-semibold text-white uppercase tracking-wider">Mitigation timeline</p>
        <span className="ml-auto text-[10.5px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>
          all signed by cursor-agent
        </span>
      </div>
      <ol className="divide-y" style={{ borderColor: CF_BORDER }}>
        {TIMELINE.map((e, i) => {
          const dotColor =
            e.tone === 'attack' ? CF_RED : e.tone === 'recovered' ? CF_GREEN : CF_ORANGE;
          return (
            <li key={i} className="px-4 py-2.5 flex items-start gap-3">
              <span
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: dotColor }}
              />
              <span
                className="text-[11px] font-mono shrink-0 w-[90px]"
                style={{ color: CF_TEXT_TERTIARY }}
              >
                {e.t}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[12.5px] text-white">{e.label}</p>
                  <span
                    className="text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded"
                    style={{
                      background: e.actor === 'cursor-agent' ? 'rgba(96,165,250,0.18)' : 'rgba(243,128,32,0.18)',
                      color: e.actor === 'cursor-agent' ? '#93C5FD' : '#FAAE40',
                    }}
                  >
                    {e.actor}
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: CF_TEXT_TERTIARY }}>
                  {e.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---- Signal sidebar ----

function SignalSidebar() {
  return (
    <SidebarCard
      title="Attack signal"
      subtitle="Bot Management · ASN 14618"
      icon={<Activity className="w-3.5 h-3.5" />}
    >
      <div className="space-y-3">
        <KV k="Source ASN" v="AS14618 · KnownBotnet-Co" highlight />
        <KV k="Distinct IPs" v="8,400" />
        <KV k="Top user-agent" v="curl/7.81.0" mono />
        <KV k="Targeted endpoint" v="/api/auth/login" mono />
        <KV k="Auth attempts" v="4,300,000 in 90 s" />
        <KV k="Success rate" v="0.4%" />
        <KV k="Bot-score share" v="87% scored < 5 (high-bot)" />
        <KV k="Threat-intel match" v="Spamhaus + AbuseIPDB · 87% confidence" />
      </div>
    </SidebarCard>
  );
}

function SidebarCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: CF_PANEL, borderColor: CF_BORDER_HARD }}
    >
      <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: CF_BORDER_HARD }}>
        {icon && <span style={{ color: CF_TEXT_TERTIARY }}>{icon}</span>}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white uppercase tracking-wider leading-none">{title}</p>
          {subtitle && (
            <p className="text-[10.5px] font-mono" style={{ color: CF_TEXT_TERTIARY }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-4 text-[12px]">{children}</div>
    </div>
  );
}

function KV({ k, v, mono, highlight }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 text-[11.5px]">
      <span className="shrink-0 w-24" style={{ color: CF_TEXT_TERTIARY }}>{k}</span>
      <span
        className={`flex-1 ${mono ? 'font-mono' : ''}`}
        style={{ color: highlight ? '#FCA5A5' : CF_TEXT_PRIMARY }}
      >
        {v}
      </span>
    </div>
  );
}
