'use client';

import {
  AlertTriangle,
  Bell,
  Bot,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  HelpCircle,
  Layers,
  Link2,
  MoreHorizontal,
  Phone,
  Search,
  Tag,
  Users,
  Zap,
} from 'lucide-react';

// ----------------------------------------------------------------
// PagerDuty incident detail (RESOLVED) — pixel-perfect mock
// Brand: PagerDuty green #06AC38, Auto-resolve banner.
// Mirrors the look of a real PD incident page.
// ----------------------------------------------------------------

const INCIDENT_ID = 'INC-21487';
const SERVICE = 'payments-api';

interface TimelineRow {
  time: string;
  label: string;
  detail?: string;
  actor: 'cursor-agent' | 'datadog' | 'pagerduty' | 'github' | 'statuspage';
  tone: 'triggered' | 'ack' | 'note' | 'resolved' | 'integration';
}

const TIMELINE: TimelineRow[] = [
  { time: '03:14:22', actor: 'datadog', tone: 'triggered',
    label: 'TRIGGERED · Datadog monitor #42971', detail: '5xx error rate 7.4% > 5% threshold for 3 min · burn rate 36×' },
  { time: '03:14:34', actor: 'cursor-agent', tone: 'ack',
    label: 'ACKNOWLEDGED by cursor-agent', detail: 'Auto-pilot ack · 12s after trigger · primary on-call (Alex Chen) NOT paged' },
  { time: '03:14:38', actor: 'cursor-agent', tone: 'note',
    label: 'NOTE · Triage initiated', detail: '"Pulling APM trace + GitHub commit history in parallel."' },
  { time: '03:15:04', actor: 'datadog', tone: 'integration',
    label: 'APM trace fetched', detail: 'trace_id 9c1e447d2b8f3a55 · 5xx burst started 03:14:18 (4s after v1.43.0 promoted)' },
  { time: '03:15:31', actor: 'github', tone: 'integration',
    label: 'Commit history scanned', detail: 'git log v1.42.1..v1.43.0 → 1 commit · a4f2e1b "feat: bank-transfer support"' },
  { time: '03:15:48', actor: 'cursor-agent', tone: 'note',
    label: 'NOTE · Hypothesis: regression in v1.43.0', detail: '"Decision: revert. Confidence 0.93. Forward fix would require schema migration."' },
  { time: '03:16:11', actor: 'cursor-agent', tone: 'note',
    label: 'NOTE · Revert PR #318 opened', detail: 'branch revert/v1.43.0-bank-transfer · CI green · Codex approved' },
  { time: '03:17:54', actor: 'cursor-agent', tone: 'note',
    label: 'NOTE · Canary green · promoting to 100%', detail: '5% canary 0.0% 5xx for 60s · SLO gate passed · fleet-wide rollout starting' },
  { time: '03:18:12', actor: 'statuspage', tone: 'integration',
    label: 'Statuspage updated · Resolved', detail: 'public update · payments-api operational · postmortem to follow' },
  { time: '03:18:34', actor: 'cursor-agent', tone: 'resolved',
    label: 'RESOLVED by cursor-agent', detail: '4m 12s total · SLO inside budget for 2 min · safe close' },
];

export function PagerdutyIncident() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#F5F7FA', color: '#1A2433' }}
    >
      <PdTopBar />
      <PdSubBar />
      <ResolvedHeader />

      <div className="grid grid-cols-[1fr_320px] gap-0">
        <div className="border-r" style={{ borderColor: '#E1E5EA' }}>
          <PdTabs />
          <TimelinePanel />
        </div>
        <PdSidebar />
      </div>

      <AutoResolveFooter />
    </div>
  );
}

// ---------------- Top bar ----------------

function PdTopBar() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-4 border-b"
      style={{ background: '#06AC38', borderColor: '#048C2C' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-white/15 flex items-center justify-center">
          <Phone className="w-3.5 h-3.5 text-white" fill="currentColor" />
        </div>
        <span className="text-[14px] font-bold text-white">PagerDuty</span>
      </div>

      <div className="h-5 w-px bg-white/25" />

      <button className="flex items-center gap-1.5 text-[12px] text-white/95 hover:text-white">
        <span className="font-semibold">acme-eng</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      <div className="flex-1 max-w-2xl">
        <div className="flex items-center gap-2 px-3 h-7 rounded bg-white/15 text-white/95">
          <Search className="w-3.5 h-3.5" />
          <span className="text-[12px] font-mono">incident:{INCIDENT_ID}</span>
          <span className="ml-auto text-[10px] text-white/65 font-mono">⌘K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 text-white/95">
        <Bell className="w-4 h-4" />
        <HelpCircle className="w-4 h-4" />
        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-[11px] font-bold">
          AC
        </div>
      </div>
    </header>
  );
}

function PdSubBar() {
  return (
    <div
      className="h-10 flex items-center px-4 text-[12px] border-b"
      style={{ background: '#FFFFFF', borderColor: '#E1E5EA', color: '#5A6B7C' }}
    >
      <button className="px-2 py-1 hover:text-[#1A2433]">Services</button>
      <span className="px-1 text-[#9AA7B5]">/</span>
      <button className="px-2 py-1 hover:text-[#1A2433] font-medium">{SERVICE}</button>
      <span className="px-1 text-[#9AA7B5]">/</span>
      <span className="px-2 py-1 font-mono">{INCIDENT_ID}</span>

      <div className="ml-auto flex items-center gap-2">
        <SmallButton label="Open in PagerDuty" icon={<ExternalLink className="w-3 h-3" />} />
        <button className="h-6 w-6 rounded hover:bg-[#F5F7FA] text-[#5A6B7C]">
          <MoreHorizontal className="w-3.5 h-3.5 mx-auto" />
        </button>
      </div>
    </div>
  );
}

function SmallButton({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button
      className="h-6 px-2 rounded text-[11.5px] flex items-center gap-1 border hover:bg-[#F5F7FA]"
      style={{ background: '#FFFFFF', borderColor: '#D1D7DD', color: '#1A2433' }}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------- Resolved header ----------------

function ResolvedHeader() {
  return (
    <div
      className="px-6 pt-5 pb-4 border-b"
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)', borderColor: '#E1E5EA' }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#06AC38', color: 'white' }}
        >
          <Check className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10.5px] font-mono uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
              style={{ background: '#06AC38', color: 'white' }}
            >
              Resolved
            </span>
            <span className="text-[11px] text-[#5A6B7C] font-mono">
              · P1 · Auto-resolved by cursor-agent
            </span>
          </div>
          <h1 className="text-[22px] font-semibold leading-tight" style={{ color: '#1A2433' }}>
            {INCIDENT_ID} · {SERVICE} 5xx burst
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: '#5A6B7C' }}>
            Service:{' '}
            <span className="font-mono" style={{ color: '#1A2433' }}>
              {SERVICE}
            </span>{' '}
            · Escalation policy:{' '}
            <span className="font-mono" style={{ color: '#1A2433' }}>
              Payments-Pri
            </span>{' '}
            · Created:{' '}
            <span className="font-mono">03:14:22 PT</span>{' '}
            · Resolved:{' '}
            <span className="font-mono" style={{ color: '#06AC38' }}>
              03:18:34 PT
            </span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 rounded-md text-[12.5px] font-medium border hover:bg-[#F5F7FA]"
            style={{ borderColor: '#D1D7DD', color: '#1A2433', background: '#FFFFFF' }}
          >
            Reopen
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-white text-[12.5px] font-medium"
            style={{ background: '#06AC38' }}
          >
            View runbook
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        <Stat label="MTTA" value="12s" tone="green" />
        <Stat label="MTTR" value="4m 12s" tone="green" />
        <Stat label="Humans paged" value="0" tone="green" />
        <Stat label="Auto-resolved" value="100%" tone="green" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'green' }) {
  const color = tone === 'green' ? '#06AC38' : '#1A2433';
  return (
    <div
      className="px-3 py-2.5 rounded-md border"
      style={{ background: '#FFFFFF', borderColor: '#E1E5EA' }}
    >
      <p
        className="text-[10px] uppercase tracking-wider font-mono mb-0.5"
        style={{ color: '#5A6B7C' }}
      >
        {label}
      </p>
      <p className="text-[18px] font-bold font-mono" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

// ---------------- Tabs + Timeline ----------------

function PdTabs() {
  const tabs = [
    { label: 'Timeline', count: '10', active: true },
    { label: 'Alerts', count: '1' },
    { label: 'Notes', count: '5' },
    { label: 'Postmortem', count: '1' },
    { label: 'Status updates', count: '3' },
  ];
  return (
    <div
      className="flex items-center px-4 border-b text-[13px]"
      style={{ background: '#FFFFFF', borderColor: '#E1E5EA' }}
    >
      {tabs.map(t => (
        <button
          key={t.label}
          className={`flex items-center gap-1.5 px-3 py-3 border-b-2 ${
            t.active
              ? 'border-[#06AC38] text-[#1A2433] font-semibold'
              : 'border-transparent text-[#5A6B7C] hover:text-[#1A2433]'
          }`}
        >
          {t.label}
          <span
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ background: '#F0F2F5', color: '#5A6B7C' }}
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function TimelinePanel() {
  return (
    <div className="px-6 py-5" style={{ background: '#FFFFFF' }}>
      <ol className="relative border-l-2 ml-2 space-y-4" style={{ borderColor: '#E1E5EA' }}>
        {TIMELINE.map((row, i) => (
          <TimelineRow key={i} row={row} />
        ))}
      </ol>
    </div>
  );
}

function TimelineRow({ row }: { row: TimelineRow }) {
  const tone = TONE_BY_KIND[row.tone];
  const actorMeta = ACTOR_META[row.actor];
  return (
    <li className="ml-4">
      <span
        className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full ring-2 ring-white"
        style={{ background: tone.dot }}
      />
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span
          className="text-[10.5px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border"
          style={{ background: tone.bg, color: tone.text, borderColor: tone.border }}
        >
          {tone.label}
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: actorMeta.color }}
          >
            {actorMeta.initial}
          </div>
          <span className="text-[12px]" style={{ color: '#1A2433' }}>
            {actorMeta.label}
          </span>
        </div>
        <span
          className="text-[11px] font-mono ml-auto"
          style={{ color: '#5A6B7C' }}
        >
          {row.time} PT
        </span>
      </div>
      <p className="text-[13.5px] font-medium leading-snug" style={{ color: '#1A2433' }}>
        {row.label}
      </p>
      {row.detail && (
        <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: '#5A6B7C' }}>
          {row.detail}
        </p>
      )}
    </li>
  );
}

const TONE_BY_KIND: Record<
  TimelineRow['tone'],
  { dot: string; bg: string; text: string; border: string; label: string }
> = {
  triggered: { dot: '#DC3545', bg: '#FBE9EB', text: '#B82332', border: '#F2C7CC', label: 'Triggered' },
  ack:       { dot: '#F5A623', bg: '#FEF6E7', text: '#A66B00', border: '#F8E0B0', label: 'Acknowledged' },
  note:      { dot: '#5A6B7C', bg: '#F0F2F5', text: '#1A2433', border: '#D1D7DD', label: 'Note' },
  resolved:  { dot: '#06AC38', bg: '#E8F8EE', text: '#057A28', border: '#B7E5C7', label: 'Resolved' },
  integration: { dot: '#5A6B7C', bg: '#F0F2F5', text: '#5A6B7C', border: '#D1D7DD', label: 'Integration' },
};

const ACTOR_META: Record<
  TimelineRow['actor'],
  { label: string; initial: string; color: string }
> = {
  'cursor-agent': { label: 'cursor-agent', initial: 'C', color: '#3B82F6' },
  datadog:        { label: 'Datadog',     initial: 'D', color: '#632CA6' },
  pagerduty:      { label: 'PagerDuty',   initial: 'P', color: '#06AC38' },
  github:         { label: 'GitHub',      initial: 'G', color: '#1A2433' },
  statuspage:     { label: 'Statuspage',  initial: 'S', color: '#3DB46D' },
};

// ---------------- Sidebar ----------------

function PdSidebar() {
  return (
    <aside
      className="text-[12px]"
      style={{ background: '#F8FAFC', color: '#1A2433' }}
    >
      <SidebarHeader />

      <SidebarSection title="Service" icon={<Layers className="w-3.5 h-3.5" />}>
        <KV k="Service" v={SERVICE} mono />
        <KV k="Team" v="Payments" />
        <KV k="Owner" v="payments-platform" />
        <KV k="Tier" v="Tier 1 · Customer-facing" />
      </SidebarSection>

      <SidebarSection title="Urgency" icon={<Zap className="w-3.5 h-3.5" />}>
        <KV k="Priority" v="P1" highlight />
        <KV k="Severity" v="Major" />
        <KV k="Escalation" v="Payments-Pri" />
      </SidebarSection>

      <SidebarSection title="Responders" icon={<Users className="w-3.5 h-3.5" />}>
        <ResponderRow
          name="cursor-agent"
          role="Auto-pilot"
          status="Resolved · 4m 12s"
          tone="green"
          icon={<Bot className="w-3 h-3 text-white" />}
        />
        <ResponderRow
          name="Alex Chen"
          role="Primary on-call"
          status="Not paged"
          tone="muted"
          initial="AC"
        />
      </SidebarSection>

      <SidebarSection title="Linked alerts" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
        <LinkedRow
          label="Datadog monitor #42971"
          detail="payments-api 5xx error rate"
          status="Resolved"
          tone="green"
        />
      </SidebarSection>

      <SidebarSection title="Linked artifacts" icon={<Link2 className="w-3.5 h-3.5" />}>
        <LinkedRow
          label="PR #318"
          detail="revert: roll back v1.43.0"
          status="Open"
          tone="blue"
        />
        <LinkedRow
          label="Statuspage incident"
          detail="status.acme.com/payments-api"
          status="Resolved"
          tone="green"
        />
        <LinkedRow
          label="Slack thread"
          detail="#ops · 1 message"
          status="Posted"
          tone="muted"
        />
        <LinkedRow
          label="Postmortem doc"
          detail="2026-04-23-INC-21487.md"
          status="Draft"
          tone="amber"
        />
      </SidebarSection>

      <SidebarSection title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
        <div className="flex flex-wrap gap-1.5">
          <Pill label="auto-resolved" tone="green" />
          <Pill label="page-suppressed" tone="green" />
          <Pill label="revert" tone="muted" />
          <Pill label="payments" tone="muted" />
          <Pill label="v1.43.0" tone="muted" />
        </div>
      </SidebarSection>
    </aside>
  );
}

function SidebarHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={{ borderColor: '#E1E5EA' }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: '#1A2433' }}
      >
        Incident details
      </p>
      <Clock className="w-3.5 h-3.5" style={{ color: '#5A6B7C' }} />
    </div>
  );
}

function SidebarSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-3.5 border-b" style={{ borderColor: '#E1E5EA' }}>
      <div className="flex items-center gap-1.5 mb-2" style={{ color: '#5A6B7C' }}>
        {icon}
        <p className="text-[10.5px] font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function KV({ k, v, mono, highlight }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 text-[11.5px]">
      <span style={{ color: '#5A6B7C' }} className="shrink-0 w-20">
        {k}
      </span>
      <span
        className={`truncate ${mono ? 'font-mono' : ''}`}
        style={{ color: highlight ? '#DC3545' : '#1A2433', fontWeight: highlight ? 600 : 400 }}
      >
        {v}
      </span>
    </div>
  );
}

function ResponderRow({
  name,
  role,
  status,
  tone,
  icon,
  initial,
}: {
  name: string;
  role: string;
  status: string;
  tone: 'green' | 'muted';
  icon?: React.ReactNode;
  initial?: string;
}) {
  const statusColor = tone === 'green' ? '#06AC38' : '#5A6B7C';
  return (
    <div className="flex items-center gap-2 py-1">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ background: tone === 'green' ? '#3B82F6' : '#9AA7B5', color: 'white' }}
      >
        {icon ?? <span className="text-[10px] font-bold">{initial}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium truncate" style={{ color: '#1A2433' }}>
          {name}
        </p>
        <p className="text-[10.5px]" style={{ color: '#5A6B7C' }}>
          {role}
        </p>
      </div>
      <span className="text-[10.5px] font-mono shrink-0" style={{ color: statusColor }}>
        {status}
      </span>
    </div>
  );
}

function LinkedRow({
  label,
  detail,
  status,
  tone,
}: {
  label: string;
  detail: string;
  status: string;
  tone: 'green' | 'blue' | 'amber' | 'muted';
}) {
  const map: Record<typeof tone, { bg: string; text: string }> = {
    green: { bg: '#E8F8EE', text: '#057A28' },
    blue: { bg: '#E5EFFF', text: '#1F4FB8' },
    amber: { bg: '#FEF6E7', text: '#A66B00' },
    muted: { bg: '#F0F2F5', text: '#5A6B7C' },
  };
  const styles = map[tone];
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-medium truncate" style={{ color: '#1A2433' }}>
          {label}
        </p>
        <p className="text-[10.5px] truncate" style={{ color: '#5A6B7C' }}>
          {detail}
        </p>
      </div>
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
        style={{ background: styles.bg, color: styles.text }}
      >
        {status}
      </span>
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone: 'green' | 'muted' }) {
  const map: Record<typeof tone, { bg: string; text: string; border: string }> = {
    green: { bg: '#E8F8EE', text: '#057A28', border: '#B7E5C7' },
    muted: { bg: '#F0F2F5', text: '#5A6B7C', border: '#D1D7DD' },
  };
  const styles = map[tone];
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10.5px] font-mono border"
      style={{ background: styles.bg, color: styles.text, borderColor: styles.border }}
    >
      {label}
    </span>
  );
}

// ---------------- Footer ----------------

function AutoResolveFooter() {
  return (
    <div
      className="px-6 py-3 text-[12px] flex items-center gap-4 border-t"
      style={{ background: '#06AC38', color: 'white' }}
    >
      <Bot className="w-4 h-4" />
      <span className="font-semibold">Auto-resolved by Cursor</span>
      <span className="text-white/85">·</span>
      <span className="font-mono">0 humans paged</span>
      <span className="text-white/85">·</span>
      <span className="font-mono">4m 12s MTTR</span>
      <span className="text-white/85">·</span>
      <span className="font-mono">10 timeline events</span>
      <span className="ml-auto font-mono text-white/85">
        Postmortem auto-drafted · awaiting human review
      </span>
    </div>
  );
}
