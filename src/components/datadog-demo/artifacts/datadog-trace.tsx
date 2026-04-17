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
  Clock,
  Server,
  Tag,
  Package,
  Gauge,
  Eye,
  Layers,
  Database,
  AlertTriangle,
  Activity,
  Flame,
  List as ListIcon,
  Terminal,
  Network,
  Zap,
} from 'lucide-react';

// ------------------------------------------------------------------
// Datadog APM Trace Detail — pixel-perfect mock
// Primary brand: #632CA6 (Datadog purple), bone logo represented as mark.
// Colors tuned to match Datadog's dark-mode APM trace detail page.
// ------------------------------------------------------------------

const TRACE_ID = '8b2e19f4c3d74a9f';
const SPAN_ID = 'd1f80e3a2b4c9e67';
const TOTAL_MS = 7412;

// 6 regions × 2 sequential calls = 12 serial spans. Each child stacks end-to-end
// starting at the parent's offset. These add up to ~7,350ms of parent time.
const REGIONS = [
  { region: 'us-east', ordersMs: 602, taxMs: 558 },
  { region: 'us-west', ordersMs: 608, taxMs: 552 },
  { region: 'eu',      ordersMs: 611, taxMs: 557 },
  { region: 'apac',    ordersMs: 615, taxMs: 561 },
  { region: 'latam',   ordersMs: 604, taxMs: 553 },
  { region: 'uk',      ordersMs: 609, taxMs: 560 },
];

// Build flat list of child spans with cumulative offsets.
function buildSpans() {
  const spans: Array<{
    name: string;
    service: string;
    kind: 'orders' | 'tax';
    region: string;
    startMs: number;
    durationMs: number;
    color: string;
  }> = [];
  let cursor = 20; // small startup offset within the parent
  for (const r of REGIONS) {
    spans.push({
      name: `fetchRegionOrders`,
      service: 'region-store',
      kind: 'orders',
      region: r.region,
      startMs: cursor,
      durationMs: r.ordersMs,
      color: '#7C3AED',
    });
    cursor += r.ordersMs;
    spans.push({
      name: `fetchRegionTax`,
      service: 'region-store',
      kind: 'tax',
      region: r.region,
      startMs: cursor,
      durationMs: r.taxMs,
      color: '#4C9AFF',
    });
    cursor += r.taxMs;
  }
  return spans;
}

const CHILD_SPANS = buildSpans();

export function DatadogTrace() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#17171F', color: '#E8E8F0' }}
    >
      <TopNav />
      <SubNav />
      <TraceHeader />
      <StatusBar />
      <TabBar />

      {/* Main grid: flame graph + right sidebar */}
      <div className="grid grid-cols-[1fr_320px] gap-0">
        <div className="min-w-0 border-r" style={{ borderColor: '#2A2A3A' }}>
          <FlameGraphHeader />
          <FlameGraph />
        </div>
        <TraceSidebar />
      </div>

      <BottomTimelineSummary />
    </div>
  );
}

// ---------------- Top navigation ----------------

function TopNav() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-3 border-b"
      style={{ background: '#12121A', borderColor: '#2A2A3A' }}
    >
      {/* Datadog bone logo */}
      <div className="flex items-center gap-2.5 px-2">
        <DatadogLogo />
        <span className="text-[13px] font-semibold text-white">cursor-demos</span>
        <ChevronDown className="w-3 h-3 text-[#8B8BA0]" />
      </div>

      <div className="h-5 w-px bg-[#2A2A3A]" />

      {/* Env selector */}
      <button
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] text-[#CDCDE0] hover:bg-[#22223A]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
        env: <span className="font-mono">prod</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div
          className="flex items-center gap-2 px-3 h-7 rounded"
          style={{ background: '#1F1F2D', border: '1px solid #2A2A3A' }}
        >
          <Search className="w-3.5 h-3.5 text-[#8B8BA0]" />
          <span className="text-[12px] text-[#8B8BA0] font-mono">
            service:region-store env:prod @trace_id:{TRACE_ID}
          </span>
          <span className="ml-auto text-[10px] text-[#6A6A80] font-mono">⌘K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NavIconButton icon={<Bell className="w-4 h-4" />} />
        <NavIconButton icon={<HelpCircle className="w-4 h-4" />} />
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: '#632CA6' }}
        >
          O
        </div>
      </div>
    </header>
  );
}

function NavIconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-7 h-7 rounded flex items-center justify-center text-[#8B8BA0] hover:bg-[#22223A] hover:text-white">
      {icon}
    </button>
  );
}

function DatadogLogo() {
  // Stylised "dog" mark (purple bone-ish) — evokes the real Datadog logo
  // without reproducing it verbatim.
  return (
    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#632CA6' }}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
        <path d="M19.5 4.5c-.5-.5-1.3-.6-1.9-.1l-4.6 3.7c-.4.3-.9.3-1.3 0L7 4.4c-.6-.5-1.4-.4-1.9.1-.5.5-.6 1.3-.1 1.9l3.7 4.6c.3.4.3.9 0 1.3l-3.7 4.6c-.5.6-.4 1.4.1 1.9.5.5 1.3.6 1.9.1l4.7-3.7c.4-.3.9-.3 1.3 0l4.6 3.7c.6.5 1.4.4 1.9-.1.5-.5.6-1.3.1-1.9l-3.7-4.6c-.3-.4-.3-.9 0-1.3l3.7-4.6c.5-.6.4-1.4-.1-1.9z" />
      </svg>
    </div>
  );
}

// ---------------- Sub navigation ----------------

function SubNav() {
  return (
    <div
      className="h-10 flex items-center gap-0 px-3 text-[12px] border-b"
      style={{ background: '#17171F', borderColor: '#2A2A3A' }}
    >
      <Crumb label="APM" />
      <Chevron />
      <Crumb label="Traces" />
      <Chevron />
      <span className="px-2 text-[#8B8BA0] font-mono">
        {TRACE_ID}
      </span>

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
    <button className="px-2 py-1 rounded text-[#CDCDE0] hover:bg-[#22223A]">
      {label}
    </button>
  );
}

function Chevron() {
  return <ChevronRight className="w-3 h-3 text-[#6A6A80]" />;
}

function SmallButton({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <button
      className="h-6 px-2 rounded text-[11.5px] text-[#CDCDE0] flex items-center gap-1 border hover:bg-[#22223A]"
      style={{ background: '#1F1F2D', borderColor: '#2A2A3A' }}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------- Trace header ----------------

function TraceHeader() {
  return (
    <div className="px-6 pt-5 pb-3" style={{ background: '#17171F' }}>
      {/* Service + endpoint */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-semibold text-white"
          style={{ background: '#7C3AED' }}
        >
          R
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] text-[#8B8BA0] mb-0.5">
            <span className="font-mono">region-store</span>
            <span>·</span>
            <span className="font-mono">prod</span>
            <span>·</span>
            <span className="font-mono">v4.7.2</span>
            <span>·</span>
            <Clock className="w-3 h-3" />
            <span>Today · 14:23:04 PDT</span>
          </div>
          <h1 className="text-[20px] font-semibold text-white leading-tight flex items-center gap-2">
            <span className="font-mono text-[#A689D4]">web.request</span>
            <span className="text-[#6A6A80]">—</span>
            <span>GET /api/reports/generate</span>
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="h-7 px-2.5 rounded text-[11.5px] text-[#CDCDE0] flex items-center gap-1 border"
            style={{ background: '#1F1F2D', borderColor: '#2A2A3A' }}
          >
            <Copy className="w-3 h-3" />
            <span className="font-mono">trace_id {TRACE_ID}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="grid grid-cols-5 border-y"
      style={{ background: '#17171F', borderColor: '#2A2A3A' }}
    >
      <StatusCell
        label="Status"
        value={
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
            <span className="text-[#F5A623] font-medium">SLO breach</span>
          </span>
        }
      />
      <StatusCell label="Duration" value={<span className="text-[#F5A623] font-mono font-semibold">7.41s</span>} />
      <StatusCell label="Spans" value={<span className="font-mono">13</span>} mono />
      <StatusCell label="Errors" value={<span className="font-mono text-[#CDCDE0]">0</span>} mono />
      <StatusCell
        label="P99 trend"
        value={<MiniSparkline />}
      />
    </div>
  );
}

function StatusCell({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div
      className="px-5 py-3 border-r"
      style={{ borderColor: '#2A2A3A' }}
    >
      <p className="text-[10.5px] text-[#8B8BA0] uppercase tracking-wider mb-1">{label}</p>
      <div className={`text-[13px] text-white ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function MiniSparkline() {
  const pts = [180, 195, 188, 210, 200, 220, 260, 320, 540, 980, 2200, 4400, 6400, 7412];
  const w = 160;
  const h = 24;
  const maxY = 7500;
  const stepX = w / (pts.length - 1);
  const coords = pts.map((v, i) => ({
    x: i * stepX,
    y: h - (v / maxY) * (h - 2) - 1,
  }));
  const d = coords
    .map((c, i) => (i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`))
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="#F5A623" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2" fill="#F5A623" />
    </svg>
  );
}

// ---------------- Tabs ----------------

function TabBar() {
  const tabs: Array<{ label: string; icon: React.ReactNode; count?: string; active?: boolean }> = [
    { label: 'Flame graph', icon: <Flame className="w-3.5 h-3.5" />, active: true },
    { label: 'Span list', icon: <ListIcon className="w-3.5 h-3.5" />, count: '13' },
    { label: 'Logs', icon: <Terminal className="w-3.5 h-3.5" />, count: '4' },
    { label: 'Infrastructure', icon: <Server className="w-3.5 h-3.5" /> },
    { label: 'Analytics', icon: <Activity className="w-3.5 h-3.5" /> },
    { label: 'Network', icon: <Network className="w-3.5 h-3.5" /> },
    { label: 'Related', icon: <Zap className="w-3.5 h-3.5" /> },
  ];
  return (
    <div
      className="flex items-center px-5 gap-0 border-b text-[12.5px]"
      style={{ background: '#17171F', borderColor: '#2A2A3A' }}
    >
      {tabs.map(t => (
        <button
          key={t.label}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap ${
            t.active
              ? 'border-[#A689D4] text-white font-medium'
              : 'border-transparent text-[#8B8BA0] hover:text-[#CDCDE0]'
          }`}
        >
          {t.icon}
          {t.label}
          {t.count && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#22223A] text-[#8B8BA0]">
              {t.count}
            </span>
          )}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2 py-2">
        <button
          className="h-6 px-2 rounded text-[11px] text-[#CDCDE0] flex items-center gap-1 border"
          style={{ background: '#1F1F2D', borderColor: '#2A2A3A' }}
        >
          <Eye className="w-3 h-3" />
          View options
        </button>
      </div>
    </div>
  );
}

// ---------------- Flame graph ----------------

function FlameGraphHeader() {
  // Time ruler with tick marks
  const ticks = 8;
  const tickStep = TOTAL_MS / ticks;

  return (
    <div
      className="relative h-8 border-b text-[10px] font-mono text-[#8B8BA0] select-none"
      style={{ background: '#12121A', borderColor: '#2A2A3A' }}
    >
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const pct = (i / ticks) * 100;
        const ms = Math.round(tickStep * i);
        return (
          <div key={i} className="absolute top-0 bottom-0" style={{ left: `${pct}%` }}>
            <div className="w-px h-full bg-[#2A2A3A]" />
            <span
              className="absolute top-1 -translate-x-1/2"
              style={{ left: 0 }}
            >
              {ms === 0 ? '0ms' : ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`}
            </span>
          </div>
        );
      })}
      {/* SLO marker at 500ms */}
      <div
        className="absolute top-0 bottom-0 border-l border-dashed border-[#4ADE80]/70 pointer-events-none"
        style={{ left: `${(500 / TOTAL_MS) * 100}%` }}
      >
        <span
          className="absolute bottom-1 left-1.5 text-[#4ADE80] text-[9.5px] font-medium whitespace-nowrap px-1 rounded"
          style={{ background: '#12121A', letterSpacing: '0.02em' }}
        >
          SLO 500ms
        </span>
      </div>
    </div>
  );
}

function FlameGraph() {
  // Each row is 22px. Parent span + 12 children stacked.
  const rowH = 22;
  const parentStart = 0;
  const parentDuration = TOTAL_MS;

  return (
    <div className="relative" style={{ background: '#12121A' }}>
      {/* Parent row */}
      <FlameRow
        indent={0}
        left={parentStart}
        width={parentDuration}
        label="aggregateOrdersByRegion"
        sub="server.request · api"
        duration={`${(parentDuration / 1000).toFixed(2)}s`}
        rowH={rowH}
        color="#632CA6"
        bold
      />

      {/* Child: the for-loop itself (informational) */}
      <FlameRow
        indent={1}
        left={10}
        width={TOTAL_MS - 40}
        label="for (region of REGIONS) — sequential"
        sub="aggregate-orders.ts:6"
        duration={`${((TOTAL_MS - 40) / 1000).toFixed(2)}s`}
        rowH={rowH}
        color="#4A2A73"
        dashed
      />

      {/* 12 serial child spans */}
      {CHILD_SPANS.map((span, i) => (
        <FlameRow
          key={i}
          indent={2}
          left={span.startMs}
          width={span.durationMs}
          label={`${span.name}("${span.region}")`}
          sub={`${span.service} · ${span.kind === 'orders' ? 'db.query' : 'db.compute'}`}
          duration={`${span.durationMs}ms`}
          rowH={rowH}
          color={span.color}
        />
      ))}

      {/* Empty footer row to lock height */}
      <div style={{ height: rowH }} />
    </div>
  );
}

function FlameRow({
  indent,
  left,
  width,
  label,
  sub,
  duration,
  rowH,
  color,
  bold,
  dashed,
}: {
  indent: number;
  left: number;
  width: number;
  label: string;
  sub: string;
  duration: string;
  rowH: number;
  color: string;
  bold?: boolean;
  dashed?: boolean;
}) {
  const leftPct = (left / TOTAL_MS) * 100;
  const widthPct = (width / TOTAL_MS) * 100;

  return (
    <div
      className="relative flex items-stretch border-b"
      style={{ height: rowH, borderColor: '#1E1E2E' }}
    >
      {/* Label column with indent guide */}
      <div
        className="shrink-0 flex items-center gap-1.5 pr-2 border-r"
        style={{ width: 260, paddingLeft: 8 + indent * 12, background: '#141420', borderColor: '#2A2A3A' }}
      >
        {indent > 0 && (
          <span
            className="inline-block w-2 h-2 rounded-sm"
            style={{ background: color, opacity: 0.7 }}
          />
        )}
        <span
          className={`truncate text-[11.5px] ${bold ? 'font-semibold text-white' : 'text-[#CDCDE0]'}`}
        >
          {label}
        </span>
      </div>

      {/* Bar track */}
      <div className="flex-1 relative">
        {/* Alternating row bg for readability */}
        <div className="absolute inset-0" style={{ background: indent === 2 ? '#141420' : '#15151F' }} />

        <div
          className="absolute top-1 bottom-1 rounded-[2px] flex items-center px-1.5 text-[10px] font-mono whitespace-nowrap overflow-hidden"
          style={{
            left: `${leftPct}%`,
            width: `calc(${widthPct}% - 0px)`,
            background: dashed ? `${color}55` : color,
            border: dashed ? `1px dashed ${color}` : `1px solid ${color}`,
            color: '#FFFFFF',
          }}
          title={`${label} · ${duration} · ${sub}`}
        >
          <span className="truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            {widthPct > 4 ? `${label.split('(')[0]}` : ''}
          </span>
          <span className="ml-auto opacity-90 pl-2">
            {widthPct > 3 ? duration : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------- Right sidebar ----------------

function TraceSidebar() {
  return (
    <aside
      className="min-w-0 text-[12px]"
      style={{ background: '#17171F', color: '#CDCDE0' }}
    >
      <SidebarHeader />

      <SidebarSection title="Trace info" icon={<Layers className="w-3.5 h-3.5" />}>
        <KV k="trace_id" v={TRACE_ID} mono />
        <KV k="span_id" v={SPAN_ID} mono />
        <KV k="start" v="14:23:04.312 PDT" mono />
        <KV k="duration" v="7.41s" mono highlight />
        <KV k="samples" v="full" />
      </SidebarSection>

      <SidebarSection title="Service" icon={<Package className="w-3.5 h-3.5" />}>
        <KV k="service" v="region-store" mono />
        <KV k="env" v="prod" />
        <KV k="version" v="v4.7.2" mono />
        <KV k="host" v="i-0c92ae4b1f" mono />
        <KV k="container" v="ord-agg-7f4d9c8" mono />
        <KV k="region" v="us-west-2" />
      </SidebarSection>

      <SidebarSection title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
        <div className="flex flex-wrap gap-1.5">
          <TagPill label="team:checkout" />
          <TagPill label="owner:platform" />
          <TagPill label="runtime:node-20" />
          <TagPill label="framework:next" />
          <TagPill label="deploy:4412" />
          <TagPill label="slo:reports-p99" tone="amber" />
        </div>
      </SidebarSection>

      <SidebarSection title="Deployment" icon={<Gauge className="w-3.5 h-3.5" />}>
        <DeploymentMarker />
      </SidebarSection>

      <SidebarSection title="Related" icon={<AlertTriangle className="w-3.5 h-3.5 text-[#F5A623]" />}>
        <RelatedRow
          kind="Monitor"
          title="SLO reports-p99 (breach)"
          status="Triggered"
          tone="amber"
        />
        <RelatedRow
          kind="Incident"
          title="INC-8421"
          status="Ack'd"
          tone="green"
        />
        <RelatedRow
          kind="Log pattern"
          title="slow db query · region-store"
          status="14 matches"
          tone="neutral"
        />
      </SidebarSection>

      <SidebarSection title="Database" icon={<Database className="w-3.5 h-3.5" />}>
        <div className="space-y-1.5">
          <p className="text-[11px] text-[#8B8BA0]">12 queries · 0 errors · P99 612ms</p>
          <p className="font-mono text-[11px] text-[#A689D4] break-words">
            SELECT orders WHERE region = $1
          </p>
          <p className="text-[10.5px] text-[#8B8BA0]">6 regions · serial · no pooling evidence</p>
        </div>
      </SidebarSection>
    </aside>
  );
}

function SidebarHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={{ borderColor: '#2A2A3A' }}
    >
      <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
        Trace details
      </p>
      <button className="text-[#8B8BA0] hover:text-white">
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
    <section
      className="px-4 py-3.5 border-b"
      style={{ borderColor: '#2A2A3A' }}
    >
      <div className="flex items-center gap-1.5 mb-2 text-[#8B8BA0]">
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
      <span className="text-[#8B8BA0] shrink-0 w-20">{k}</span>
      <span
        className={`truncate ${mono ? 'font-mono' : ''} ${highlight ? 'text-[#F5A623] font-semibold' : 'text-white'}`}
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
      : 'text-[#CDCDE0] bg-[#22223A] border-[#2A2A3A]';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10.5px] font-mono border ${styles}`}>{label}</span>
  );
}

function DeploymentMarker() {
  return (
    <div
      className="p-2 rounded border text-[11px]"
      style={{ background: '#12121A', borderColor: '#2A2A3A' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#632CA6]" />
        <span className="font-semibold text-white">deploy-4412</span>
        <span className="ml-auto text-[10.5px] text-[#8B8BA0]">4d ago</span>
      </div>
      <div className="text-[10.5px] text-[#8B8BA0] font-mono mb-1">
        commit a4f2e1b · by alex.chen
      </div>
      <div className="text-[10.5px] text-[#F5A623]">
        ↑ P99 latency began climbing after this deploy
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
  tone: 'amber' | 'green' | 'neutral';
}) {
  const statusColor =
    tone === 'amber' ? 'text-[#F5A623]' : tone === 'green' ? 'text-[#4ADE80]' : 'text-[#8B8BA0]';
  const statusBg =
    tone === 'amber' ? 'bg-[#F5A623]/10' : tone === 'green' ? 'bg-[#4ADE80]/10' : 'bg-[#22223A]';
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] text-[#8B8BA0] uppercase tracking-wider">{kind}</p>
        <p className="text-[12px] text-white truncate">{title}</p>
      </div>
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor} ${statusBg}`}
      >
        {status}
      </span>
    </div>
  );
}

// ---------------- Bottom timeline summary strip ----------------

function BottomTimelineSummary() {
  return (
    <div
      className="px-6 py-3 text-[11.5px] text-[#8B8BA0] flex items-center gap-6 border-t"
      style={{ background: '#12121A', borderColor: '#2A2A3A' }}
    >
      <span>
        <span className="text-white font-mono">13</span> spans ·
        <span className="text-white font-mono"> 12</span> serial ·
        <span className="text-[#F5A623] font-mono"> 0</span> parallel
      </span>
      <span>
        Critical path: <span className="text-[#A689D4] font-mono">aggregate-orders.ts → region-store.fetchRegionOrders → region-store.fetchRegionTax</span>
      </span>
      <span className="ml-auto font-mono">
        DBM · APM · Profile · Analytics
      </span>
    </div>
  );
}
