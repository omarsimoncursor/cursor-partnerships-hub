'use client';

import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Share2,
  MoreHorizontal,
  Copy,
  Server,
  Tag,
  Package,
  Eye,
  Layers,
  ShieldAlert,
  ShieldCheck,
  ScrollText,
  Activity,
  Users,
  Globe,
  Smartphone,
  AlertTriangle,
  Network,
  KeyRound,
} from 'lucide-react';

// ------------------------------------------------------------------
// Zscaler Zero Trust Exchange Admin Portal — pixel-perfect mock
// Primary brand: #0079D5 (Zscaler blue), deep navy backgrounds.
// ------------------------------------------------------------------

const RISK_EVT = 'evt-21794';
const POLICY_ID = 'ZTA-pol-9921';
const APP_SEGMENT = 'workforce-admin/audit-logs';
const RISK_SCORE = 92;

export function ZscalerConsole() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#0A1426', color: '#E2E8F0' }}
    >
      <TopNav />
      <SubNav />
      <PolicyHeader />
      <StatusBar />
      <TabBar />

      {/* Main grid: overview + sidebar */}
      <div className="grid grid-cols-[1fr_320px] gap-0">
        <div className="min-w-0 border-r" style={{ borderColor: '#1A2A45' }}>
          <Overview />
        </div>
        <ConsoleSidebar />
      </div>

      <BottomFooter />
    </div>
  );
}

// ---------------- Top navigation ----------------

function TopNav() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-3 border-b"
      style={{ background: '#06101F', borderColor: '#1A2A45' }}
    >
      {/* Zscaler logo */}
      <div className="flex items-center gap-2.5 px-2">
        <ZscalerLogo />
        <span className="text-[13px] font-semibold text-white">cursor-demos · cloud-1</span>
        <ChevronDown className="w-3 h-3 text-[#7E94B4]" />
      </div>

      <div className="h-5 w-px bg-[#1A2A45]" />

      {/* Cloud / region selector */}
      <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] text-[#C7D2E1] hover:bg-[#11203A]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#65B5F2]" />
        zscaler.net · <span className="font-mono">zscalerthree</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div
          className="flex items-center gap-2 px-3 h-7 rounded"
          style={{ background: '#0E1B30', border: '1px solid #1A2A45' }}
        >
          <Search className="w-3.5 h-3.5 text-[#7E94B4]" />
          <span className="text-[12px] text-[#7E94B4] font-mono">
            policy:{POLICY_ID} app:{APP_SEGMENT} event:{RISK_EVT}
          </span>
          <span className="ml-auto text-[10px] text-[#5E7290] font-mono">⌘K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NavIconButton icon={<Bell className="w-4 h-4" />} />
        <NavIconButton icon={<HelpCircle className="w-4 h-4" />} />
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: '#0079D5' }}
        >
          O
        </div>
      </div>
    </header>
  );
}

function NavIconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-7 h-7 rounded flex items-center justify-center text-[#7E94B4] hover:bg-[#11203A] hover:text-white">
      {icon}
    </button>
  );
}

function ZscalerLogo() {
  return (
    <div
      className="w-6 h-6 rounded flex items-center justify-center"
      style={{ background: '#0079D5' }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
        <path d="M5 5h14v3.2L9 18h10v3H5v-3.2L15 8H5z" />
      </svg>
    </div>
  );
}

// ---------------- Sub navigation ----------------

function SubNav() {
  return (
    <div
      className="h-10 flex items-center gap-0 px-3 text-[12px] border-b"
      style={{ background: '#0A1426', borderColor: '#1A2A45' }}
    >
      <Crumb label="Zero Trust Exchange" />
      <Chevron />
      <Crumb label="Policy" />
      <Chevron />
      <Crumb label="ZPA" />
      <Chevron />
      <span className="px-2 text-[#7E94B4] font-mono">{POLICY_ID}</span>

      <div className="ml-auto flex items-center gap-1.5">
        <SmallButton icon={<Star className="w-3.5 h-3.5" />} label="Save view" />
        <SmallButton icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
        <SmallButton icon={<MoreHorizontal className="w-3.5 h-3.5" />} />
      </div>
    </div>
  );
}

function Crumb({ label }: { label: string }) {
  return (
    <button className="px-2 py-1 rounded text-[#C7D2E1] hover:bg-[#11203A]">{label}</button>
  );
}

function Chevron() {
  return <ChevronRight className="w-3 h-3 text-[#5E7290]" />;
}

function SmallButton({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <button
      className="h-6 px-2 rounded text-[11.5px] text-[#C7D2E1] flex items-center gap-1 border hover:bg-[#11203A]"
      style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------- Policy header ----------------

function PolicyHeader() {
  return (
    <div className="px-6 pt-5 pb-3" style={{ background: '#0A1426' }}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-semibold text-white"
          style={{ background: '#0079D5' }}
        >
          W
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] text-[#7E94B4] mb-0.5">
            <span className="font-mono">{APP_SEGMENT}</span>
            <span>·</span>
            <span className="font-mono">prod</span>
            <span>·</span>
            <span className="font-mono">{POLICY_ID}</span>
            <span>·</span>
            <span>Today · 14:21:43 PDT</span>
          </div>
          <h1 className="text-[20px] font-semibold text-white leading-tight flex items-center gap-2">
            <span className="font-mono text-[#65B5F2]">Policy Violation</span>
            <span className="text-[#5E7290]">—</span>
            <span>workforce-admin / audit-logs</span>
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="h-7 px-2.5 rounded text-[11.5px] text-[#C7D2E1] flex items-center gap-1 border"
            style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
          >
            <Copy className="w-3 h-3" />
            <span className="font-mono">risk_evt {RISK_EVT}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="grid grid-cols-5 border-y" style={{ background: '#0A1426', borderColor: '#1A2A45' }}>
      <StatusCell
        label="Status"
        value={
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4757]" />
            <span className="text-[#FF4757] font-medium">Critical</span>
          </span>
        }
      />
      <StatusCell
        label="Risk score"
        value={<span className="text-[#FF4757] font-mono font-semibold">{RISK_SCORE}/100</span>}
      />
      <StatusCell label="In scope" value={<span className="font-mono text-[#F5A623]">4,287</span>} mono />
      <StatusCell label="Intent" value={<span className="font-mono">18</span>} mono />
      <StatusCell label="Risk trend (1h)" value={<MiniSparkline />} />
    </div>
  );
}

function StatusCell({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="px-5 py-3 border-r" style={{ borderColor: '#1A2A45' }}>
      <p className="text-[10.5px] text-[#7E94B4] uppercase tracking-wider mb-1">{label}</p>
      <div className={`text-[13px] text-white ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function MiniSparkline() {
  const pts = [12, 14, 13, 18, 22, 28, 36, 48, 60, 72, 78, 84, 88, 92];
  const w = 160;
  const h = 24;
  const maxY = 100;
  const stepX = w / (pts.length - 1);
  const coords = pts.map((v, i) => ({
    x: i * stepX,
    y: h - (v / maxY) * (h - 2) - 1,
  }));
  const d = coords
    .map((c, i) =>
      i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
    )
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="#FF4757" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2" fill="#FF4757" />
    </svg>
  );
}

// ---------------- Tabs ----------------

function TabBar() {
  const tabs: Array<{ label: string; icon: React.ReactNode; count?: string; active?: boolean }> = [
    { label: 'Overview', icon: <Activity className="w-3.5 h-3.5" />, active: true },
    { label: 'Affected users', icon: <Users className="w-3.5 h-3.5" />, count: '4,287' },
    { label: 'Traffic', icon: <Network className="w-3.5 h-3.5" />, count: '312' },
    { label: 'Policy diff', icon: <ScrollText className="w-3.5 h-3.5" /> },
    { label: 'Activity', icon: <ShieldAlert className="w-3.5 h-3.5" />, count: '14' },
    { label: 'Posture', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { label: 'Related', icon: <KeyRound className="w-3.5 h-3.5" /> },
  ];
  return (
    <div
      className="flex items-center px-5 gap-0 border-b text-[12.5px]"
      style={{ background: '#0A1426', borderColor: '#1A2A45' }}
    >
      {tabs.map(t => (
        <button
          key={t.label}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap ${
            t.active
              ? 'border-[#65B5F2] text-white font-medium'
              : 'border-transparent text-[#7E94B4] hover:text-[#C7D2E1]'
          }`}
        >
          {t.icon}
          {t.label}
          {t.count && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#11203A] text-[#7E94B4]">
              {t.count}
            </span>
          )}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2 py-2">
        <button
          className="h-6 px-2 rounded text-[11px] text-[#C7D2E1] flex items-center gap-1 border"
          style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
        >
          <Eye className="w-3 h-3" />
          View options
        </button>
      </div>
    </div>
  );
}

// ---------------- Overview content ----------------

function Overview() {
  return (
    <div className="p-5 space-y-5" style={{ background: '#06101F' }}>
      <div className="grid grid-cols-2 gap-4">
        <ScopeCard />
        <PostureCard />
      </div>

      <PolicyDiffCard />

      <AccessEventsCard />
    </div>
  );
}

function ScopeCard() {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-[#65B5F2]" />
        <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
          Scope vs intent
        </p>
      </div>

      <div className="flex items-end gap-6 mb-3">
        <div>
          <p className="text-[10px] text-[#7E94B4] uppercase tracking-wider mb-1">In scope</p>
          <p className="text-[28px] font-bold font-mono text-[#F5A623] leading-none">4,287</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[#5E7290] mb-1" />
        <div>
          <p className="text-[10px] text-[#7E94B4] uppercase tracking-wider mb-1">Intent</p>
          <p className="text-[28px] font-bold font-mono text-[#65B5F2] leading-none">18</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[12px] text-[#C7D2E1] pt-3 border-t" style={{ borderColor: '#1A2A45' }}>
        <span>Over scope</span>
        <span className="font-mono text-[#F5A623] font-semibold">238.2x</span>
      </div>
      <p className="text-[11px] text-[#7E94B4] mt-1.5">
        Intent: <span className="font-mono">security-admin</span> (12) +{' '}
        <span className="font-mono">compliance-officer</span> (6)
      </p>
    </div>
  );
}

function PostureCard() {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Smartphone className="w-3.5 h-3.5 text-[#65B5F2]" />
        <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
          Posture compliance · in-scope users
        </p>
      </div>

      <div className="flex items-center gap-4">
        <PostureDonut />
        <div className="text-[12px] space-y-1.5">
          <PostureLegend color="#FF4757" label="Unmanaged" pct="50%" count="2,143" />
          <PostureLegend color="#F5A623" label="Mgd-noncompliant" pct="38%" count="1,629" />
          <PostureLegend color="#4ADE80" label="Mgd-compliant" pct="12%" count="515" />
        </div>
      </div>

      <p className="text-[11px] text-[#FF4757] mt-3 pt-3 border-t" style={{ borderColor: '#1A2A45' }}>
        ⚠ Posture check is currently <span className="font-mono">disabled</span> in policy
      </p>
    </div>
  );
}

function PostureLegend({ color, label, pct, count }: { color: string; label: string; pct: string; count: string }) {
  return (
    <div className="flex items-center gap-2 text-[#C7D2E1]">
      <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
      <span className="font-medium">{label}</span>
      <span className="text-[#7E94B4] font-mono">{pct}</span>
      <span className="text-[#7E94B4] font-mono">({count})</span>
    </div>
  );
}

function PostureDonut() {
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = 38;
  const stroke = 16;
  const c = 2 * Math.PI * r;

  const segments = [
    { color: '#FF4757', pct: 0.5 },
    { color: '#F5A623', pct: 0.38 },
    { color: '#4ADE80', pct: 0.12 },
  ];

  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A2A45" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const dash = c * s.pct;
        const offset = -c * acc;
        acc += s.pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        className="fill-white"
        style={{ font: '13px ui-sans-serif, system-ui', fontWeight: 600 }}
      >
        92
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        className="fill-[#7E94B4]"
        style={{ font: '9px ui-sans-serif', fontWeight: 500 }}
      >
        risk score
      </text>
    </svg>
  );
}

function PolicyDiffCard() {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
    >
      <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#1A2A45' }}>
        <ScrollText className="w-3.5 h-3.5 text-[#65B5F2]" />
        <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
          Rule conditions · infrastructure/zscaler/workforce-admin.tf
        </p>
        <span className="ml-auto text-[10px] font-mono text-[#5E7290]">{POLICY_ID}</span>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 font-mono text-[12px]">
        <div>
          <p className="text-[10px] text-[#FF4757] uppercase tracking-wider mb-2 font-semibold">
            ✗ Current rule (under-conditioned)
          </p>
          <div className="space-y-1 text-[#C7D2E1]">
            <PolicyLine k="action" v={`"ALLOW"`} />
            <PolicyLine k="operator" v={`"AND"`} />
            <PolicyLine k="APP" v="present" />
            <PolicyLine k="SCIM_GROUP" v="missing" warn />
            <PolicyLine k="POSTURE" v="missing" warn />
            <PolicyLine k="TRUSTED_NETWORK" v="missing" warn />
            <PolicyLine k="CLIENT_TYPE" v="missing" warn />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#4ADE80] uppercase tracking-wider mb-2 font-semibold">
            ✓ Recommended (least-privilege)
          </p>
          <div className="space-y-1 text-[#C7D2E1]">
            <PolicyLine k="action" v={`"ALLOW"`} />
            <PolicyLine k="operator" v={`"AND"`} />
            <PolicyLine k="APP" v="present" good />
            <PolicyLine k="SCIM_GROUP" v="security-admin OR compliance-officer" good />
            <PolicyLine k="POSTURE" v="managed-compliant-corp" good />
            <PolicyLine k="TRUSTED_NETWORK" v="corp-egress" good />
            <PolicyLine k="CLIENT_TYPE" v="zpn_client_type_zapp" good />
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyLine({ k, v, warn, good }: { k: string; v: string; warn?: boolean; good?: boolean }) {
  const valueColor = warn ? 'text-[#F5A623]' : good ? 'text-[#4ADE80]' : 'text-[#C7D2E1]';
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[#65B5F2] shrink-0">{k}:</span>
      <span className={`${valueColor} break-all`}>{v}</span>
    </div>
  );
}

function AccessEventsCard() {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: '#0E1B30', borderColor: '#1A2A45' }}
    >
      <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: '#1A2A45' }}>
        <Activity className="w-3.5 h-3.5 text-[#65B5F2]" />
        <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
          Access events (last 60 minutes) · ZIA
        </p>
        <span className="ml-auto text-[10px] font-mono text-[#5E7290]">312 hits</span>
      </div>

      <div className="p-4">
        <AccessSparkline />
      </div>

      <div className="border-t px-4 py-3 grid grid-cols-4 gap-2 text-[11px]" style={{ borderColor: '#1A2A45' }}>
        <Mini label="Total hits" value="312" />
        <Mini label="Unique users" value="51" />
        <Mini label="Unmanaged sessions" value="4" tone="amber" />
        <Mini label="Lobby kiosks" value="2" tone="amber" />
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: 'amber' }) {
  const color = tone === 'amber' ? 'text-[#F5A623]' : 'text-white';
  return (
    <div>
      <p className="text-[10px] text-[#7E94B4] uppercase tracking-wider">{label}</p>
      <p className={`text-[14px] font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function AccessSparkline() {
  const points = [
    4, 6, 5, 8, 7, 9, 10, 11, 13, 12, 14, 15, 18, 22, 24, 21, 19, 22, 26, 28,
    31, 28, 26, 30, 33, 36, 40, 38, 42, 45,
  ];
  const width = 720;
  const height = 70;
  const maxY = 50;
  const stepX = width / (points.length - 1);

  const coords = points.map((v, i) => ({
    x: i * stepX,
    y: height - (v / maxY) * (height - 4) - 2,
    v,
  }));

  const path = coords
    .map((c, i) =>
      i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
    )
    .join(' ');

  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="block">
      <defs>
        <linearGradient id="zsAccessFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0079D5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0079D5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#zsAccessFill)" />
      <path
        d={path}
        fill="none"
        stroke="#65B5F2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill="#65B5F2" />
    </svg>
  );
}

// ---------------- Right sidebar ----------------

function ConsoleSidebar() {
  return (
    <aside className="min-w-0 text-[12px]" style={{ background: '#0A1426', color: '#C7D2E1' }}>
      <SidebarHeader />

      <SidebarSection title="App segment" icon={<Layers className="w-3.5 h-3.5" />}>
        <KV k="app" v={APP_SEGMENT} mono />
        <KV k="policy_id" v={POLICY_ID} mono />
        <KV k="evt_id" v={RISK_EVT} mono highlight />
        <KV k="started" v="14:21:43 PDT" mono />
        <KV k="severity" v="Critical · 92" highlight />
      </SidebarSection>

      <SidebarSection title="Application" icon={<Package className="w-3.5 h-3.5" />}>
        <KV k="service" v="workforce-admin" mono />
        <KV k="env" v="prod" />
        <KV k="version" v="v3.4.1" mono />
        <KV k="cluster" v="zpa-us-east-2" mono />
        <KV k="connector" v="zpa-conn-7f4d9c8" mono />
        <KV k="region" v="us-east-2" />
      </SidebarSection>

      <SidebarSection title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
        <div className="flex flex-wrap gap-1.5">
          <TagPill label="team:platform-sec" />
          <TagPill label="owner:risk-ops" />
          <TagPill label="data-class:sensitive" />
          <TagPill label="iac:terraform" />
          <TagPill label="repo:cursor-for-enterprise" />
          <TagPill label="trust:zero" tone="amber" />
        </div>
      </SidebarSection>

      <SidebarSection title="IaC source" icon={<Layers className="w-3.5 h-3.5" />}>
        <div className="space-y-1.5">
          <p className="text-[11px] text-[#7E94B4]">Managed by</p>
          <p className="font-mono text-[11px] text-[#65B5F2] break-words">
            zscaler/zpa ~&gt; 4.4
          </p>
          <p className="text-[11px] text-[#7E94B4] mt-1.5">File</p>
          <p className="font-mono text-[11px] text-white break-words">
            infrastructure/zscaler/workforce-admin.tf
          </p>
          <p className="text-[10.5px] text-[#7E94B4] mt-1.5">
            Drift state: <span className="text-[#4ADE80] font-mono">none</span>
          </p>
        </div>
      </SidebarSection>

      <SidebarSection title="Deployment" icon={<Server className="w-3.5 h-3.5" />}>
        <DeploymentMarker />
      </SidebarSection>

      <SidebarSection title="Related" icon={<AlertTriangle className="w-3.5 h-3.5 text-[#F5A623]" />}>
        <RelatedRow kind="Risk event" title={RISK_EVT} status="Critical" tone="red" />
        <RelatedRow kind="SecOps case" title="SIR0005712 (ServiceNow)" status="In Review" tone="blue" />
        <RelatedRow kind="Okta" title="Group reconciliation · 18 users" status="OK" tone="green" />
      </SidebarSection>

      <SidebarSection title="Identity" icon={<Globe className="w-3.5 h-3.5" />}>
        <div className="space-y-1.5">
          <p className="text-[11px] text-[#7E94B4]">Allowed IdPs (current)</p>
          <p className="font-mono text-[11px] text-[#F5A623] break-words">[*] · wildcard</p>
          <p className="text-[10.5px] text-[#7E94B4] mt-1.5">
            Recommended: <span className="text-[#4ADE80] font-mono">[okta-prod]</span>
          </p>
        </div>
      </SidebarSection>
    </aside>
  );
}

function SidebarHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={{ borderColor: '#1A2A45' }}
    >
      <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
        Risk event details
      </p>
      <button className="text-[#7E94B4] hover:text-white">
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
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
    <section className="px-4 py-3.5 border-b" style={{ borderColor: '#1A2A45' }}>
      <div className="flex items-center gap-1.5 mb-2 text-[#7E94B4]">
        {icon}
        <p className="text-[10.5px] font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function KV({ k, v, mono, highlight }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 text-[11.5px]">
      <span className="text-[#7E94B4] shrink-0 w-20">{k}</span>
      <span
        className={`truncate ${mono ? 'font-mono' : ''} ${
          highlight ? 'text-[#F5A623] font-semibold' : 'text-white'
        }`}
      >
        {v}
      </span>
    </div>
  );
}

function TagPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'amber' }) {
  const styles =
    tone === 'amber'
      ? 'text-[#F5A623] bg-[#F5A623]/10 border-[#F5A623]/30'
      : 'text-[#C7D2E1] bg-[#11203A] border-[#1A2A45]';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono border ${styles}`}>{label}</span>
  );
}

function DeploymentMarker() {
  return (
    <div className="p-2 rounded border text-[11px]" style={{ background: '#06101F', borderColor: '#1A2A45' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0079D5]" />
        <span className="font-semibold text-white">deploy-7821</span>
        <span className="ml-auto text-[10.5px] text-[#7E94B4]">3d ago</span>
      </div>
      <div className="text-[10.5px] text-[#7E94B4] font-mono mb-1">
        commit b7c91d2 · by qa-bot
      </div>
      <div className="text-[10.5px] text-[#F5A623]">
        ↑ Risk score climbed from 12 → 92 after this deploy
      </div>
    </div>
  );
}

function RelatedRow({
  kind,
  title,
  status,
  tone,
}: {
  kind: string;
  title: string;
  status: string;
  tone: 'red' | 'amber' | 'green' | 'blue' | 'neutral';
}) {
  const statusColor =
    tone === 'red'
      ? 'text-[#FF4757]'
      : tone === 'amber'
        ? 'text-[#F5A623]'
        : tone === 'green'
          ? 'text-[#4ADE80]'
          : tone === 'blue'
            ? 'text-[#65B5F2]'
            : 'text-[#7E94B4]';
  const statusBg =
    tone === 'red'
      ? 'bg-[#FF4757]/10'
      : tone === 'amber'
        ? 'bg-[#F5A623]/10'
        : tone === 'green'
          ? 'bg-[#4ADE80]/10'
          : tone === 'blue'
            ? 'bg-[#0079D5]/15'
            : 'bg-[#11203A]';
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] text-[#7E94B4] uppercase tracking-wider">{kind}</p>
        <p className="text-[12px] text-white truncate">{title}</p>
      </div>
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor} ${statusBg}`}>
        {status}
      </span>
    </div>
  );
}

// ---------------- Bottom footer ----------------

function BottomFooter() {
  return (
    <div
      className="px-6 py-3 text-[11.5px] text-[#7E94B4] flex items-center gap-6 border-t"
      style={{ background: '#06101F', borderColor: '#1A2A45' }}
    >
      <span>
        <span className="text-white font-mono">312</span> hits ·
        <span className="text-[#F5A623] font-mono"> 4</span> unmanaged ·
        <span className="text-white font-mono"> 51</span> unique users
      </span>
      <span>
        Critical path:{' '}
        <span className="text-[#65B5F2] font-mono">
          ADMIN_AUDIT_LOG_POLICY → evaluateAccess → /api/admin/audit-logs
        </span>
      </span>
      <span className="ml-auto font-mono flex items-center gap-1.5">
        <ShieldCheck className="w-3 h-3" /> ZPA · ZIA · ZDX · Posture
      </span>
    </div>
  );
}
