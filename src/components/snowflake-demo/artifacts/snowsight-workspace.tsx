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
  Play,
  Clock,
  Database,
  BarChart3,
  FileCode2,
  Cpu,
  Settings,
  Sparkles,
  Layers,
  Book,
  Rocket,
  Snowflake,
  Check,
  Zap,
  TerminalSquare,
} from 'lucide-react';

// ------------------------------------------------------------------
// Snowflake Snowsight Workspace — pixel-perfect mock
// Primary brand: #29B5E8 (Snowflake blue), deep navy #11567F for header.
// Colors tuned to match Snowsight light mode (canvas #F5F7FA).
// ------------------------------------------------------------------

export function SnowsightWorkspace() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#F5F7FA', color: '#1E2A33' }}
    >
      <TopNav />
      <div className="grid grid-cols-[220px_1fr_300px] gap-0" style={{ minHeight: 'calc(72vh - 48px)' }}>
        <LeftSidebar />
        <MainPane />
        <RightSidebar />
      </div>
      <BottomQueryHistory />
    </div>
  );
}

// ---------------- Top navigation ----------------

function TopNav() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-3 border-b text-white"
      style={{ background: '#11567F', borderColor: '#0E4666' }}
    >
      <div className="flex items-center gap-2.5 px-1.5">
        <SnowflakeLogo />
        <span className="text-[13px] font-semibold">Snowsight</span>
      </div>

      <div className="h-5 w-px bg-white/20" />

      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] hover:bg-white/10">
        <span className="font-mono">acme-analytics</span>
        <span className="text-white/60">·</span>
        <span className="text-white/80 text-[11px]">us-east-1.aws</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] hover:bg-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
        Role: <span className="font-mono">ANALYTICS_ENGINEER</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      <div className="flex-1 max-w-xl">
        <div className="flex items-center gap-2 px-3 h-7 rounded bg-white/10">
          <Search className="w-3.5 h-3.5 text-white/70" />
          <span className="text-[12px] text-white/70">
            Search databases, worksheets, dashboards, apps…
          </span>
          <span className="ml-auto text-[10px] text-white/50 font-mono">⌘K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <NavIconButton icon={<Sparkles className="w-4 h-4" />} />
        <NavIconButton icon={<HelpCircle className="w-4 h-4" />} />
        <NavIconButton icon={<Bell className="w-4 h-4" />} />
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-[#11567F] bg-white ml-1">
          O
        </div>
      </div>
    </header>
  );
}

function NavIconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-7 h-7 rounded flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white">
      {icon}
    </button>
  );
}

function SnowflakeLogo() {
  return (
    <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#29B5E8]">
      <Snowflake className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>
  );
}

// ---------------- Left sidebar ----------------

function LeftSidebar() {
  return (
    <aside
      className="border-r py-3 text-[13px]"
      style={{ background: '#FFFFFF', borderColor: '#E2E7EB' }}
    >
      {/* Primary nav */}
      <div className="px-2 space-y-0.5">
        <SideNavItem icon={<FileCode2 className="w-3.5 h-3.5" />} label="Worksheets" active />
        <SideNavItem icon={<BarChart3 className="w-3.5 h-3.5" />} label="Dashboards" />
        <SideNavItem icon={<Book className="w-3.5 h-3.5" />} label="Notebooks" count="4" />
        <SideNavItem icon={<Rocket className="w-3.5 h-3.5" />} label="Streamlit" />
        <SideNavItem icon={<Sparkles className="w-3.5 h-3.5" />} label="AI & ML · Cortex" badge="new" />
      </div>

      <div className="mt-4 mx-3 h-px bg-[#E2E7EB]" />

      {/* Data explorer */}
      <div className="px-2 mt-3">
        <p className="px-2 mb-1.5 text-[10px] font-semibold text-[#5A6872] uppercase tracking-wider">
          Data
        </p>
        <div className="space-y-0.5">
          <SideNavItem icon={<Database className="w-3.5 h-3.5" />} label="Databases" />
          <div className="pl-5 space-y-0.5">
            <DataTreeItem label="prod_analytics" expanded />
            <div className="pl-4 space-y-0.5">
              <DataTreeItem label="marts" expanded />
              <div className="pl-4 space-y-0.5">
                <DataTreeItem label="fct_daily_revenue" highlight table />
                <DataTreeItem label="fct_daily_orders" table />
                <DataTreeItem label="dim_customer" table />
                <DataTreeItem label="dim_product" table />
              </div>
              <DataTreeItem label="staging" />
            </div>
            <DataTreeItem label="dev_analytics" />
            <DataTreeItem label="raw_landing" />
            <DataTreeItem label="migration_staging" />
          </div>
        </div>
      </div>

      <div className="mt-4 mx-3 h-px bg-[#E2E7EB]" />

      {/* Admin / compute */}
      <div className="px-2 mt-3 space-y-0.5">
        <SideNavItem icon={<Cpu className="w-3.5 h-3.5" />} label="Warehouses" />
        <SideNavItem icon={<Settings className="w-3.5 h-3.5" />} label="Admin" />
      </div>
    </aside>
  );
}

function SideNavItem({
  icon,
  label,
  active,
  count,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: string;
  badge?: string;
}) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left ${
        active
          ? 'bg-[#29B5E8]/10 text-[#11567F] font-semibold'
          : 'text-[#1E2A33] hover:bg-[#F2F6F9]'
      }`}
    >
      <span className={active ? 'text-[#29B5E8]' : 'text-[#5A6872]'}>{icon}</span>
      <span>{label}</span>
      {count && (
        <span className="ml-auto text-[10px] font-mono text-[#5A6872] bg-[#F2F6F9] px-1.5 rounded">
          {count}
        </span>
      )}
      {badge && (
        <span className="ml-auto text-[9.5px] font-semibold uppercase tracking-wider text-white bg-[#29B5E8] px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </button>
  );
}

function DataTreeItem({
  label,
  expanded,
  highlight,
  table,
}: {
  label: string;
  expanded?: boolean;
  highlight?: boolean;
  table?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 px-1 py-0.5 rounded text-[12px] hover:bg-[#F2F6F9] cursor-pointer ${
        highlight ? 'bg-[#29B5E8]/10 text-[#11567F] font-semibold' : 'text-[#1E2A33]'
      }`}
    >
      {!table && (expanded ? <ChevronDown className="w-3 h-3 text-[#5A6872]" /> : <ChevronRight className="w-3 h-3 text-[#5A6872]" />)}
      {table && <span className="w-3 inline-block" />}
      <span className="truncate font-mono">{label}</span>
    </div>
  );
}

// ---------------- Main pane ----------------

function MainPane() {
  return (
    <div className="flex flex-col min-w-0 border-r" style={{ borderColor: '#E2E7EB' }}>
      {/* Tabs */}
      <div className="flex items-center border-b px-4 gap-0 bg-white" style={{ borderColor: '#E2E7EB' }}>
        <TopTab icon={<FileCode2 className="w-3.5 h-3.5" />} label="Worksheet" />
        <TopTab icon={<Clock className="w-3.5 h-3.5" />} label="Query history" count="47" />
        <TopTab icon={<TerminalSquare className="w-3.5 h-3.5" />} label="dbt run output" active />
        <TopTab icon={<Sparkles className="w-3.5 h-3.5" />} label="Cortex review" />
        <TopTab icon={<Cpu className="w-3.5 h-3.5" />} label="Warehouse" />
        <div className="ml-auto flex items-center gap-1.5 py-2">
          <button className="h-7 px-2.5 rounded text-[11.5px] text-[#11567F] bg-white border border-[#C3CCD3] hover:bg-[#F2F6F9] flex items-center gap-1 font-medium">
            <Star className="w-3 h-3" />
            Save view
          </button>
          <button className="h-7 px-2.5 rounded text-[11.5px] text-[#11567F] bg-white border border-[#C3CCD3] hover:bg-[#F2F6F9] flex items-center gap-1 font-medium">
            <Share2 className="w-3 h-3" />
            Share
          </button>
        </div>
      </div>

      {/* dbt run output header */}
      <div className="px-5 py-4 border-b bg-white" style={{ borderColor: '#E2E7EB' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: '#FF694A' }}>
            <span className="text-white font-bold text-[13px]">dbt</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11.5px] text-[#5A6872] font-mono mb-0.5">
              <span>dbt Cloud</span>
              <span>·</span>
              <span>acme-analytics</span>
              <span>·</span>
              <span>target: dev</span>
              <span>·</span>
              <span>profile: snowflake-xs</span>
            </div>
            <h1 className="text-[18px] font-semibold text-[#11567F]">
              <span className="font-mono">dbt run --select fct_daily_revenue</span>
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#0E7D3F] border border-[#86EFAC]">
              <Check className="w-3 h-3" /> SUCCESS
            </span>
            <button className="h-7 px-2.5 rounded text-[11.5px] text-[#11567F] bg-[#29B5E8]/10 border border-[#29B5E8]/40 hover:bg-[#29B5E8]/20 flex items-center gap-1 font-medium">
              <Play className="w-3 h-3" />
              Re-run
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-4 gap-0 mt-3 rounded-lg border overflow-hidden"
          style={{ borderColor: '#E2E7EB' }}
        >
          <StatusCell label="Wall time" value="12.8s" tone="green" mono />
          <StatusCell label="Models" value="1 / 1 ✓" tone="neutral" mono />
          <StatusCell label="Tests" value="14 passed" tone="green" mono />
          <StatusCell label="Credits" value="0.0042" tone="blue" mono />
        </div>
      </div>

      {/* Freshness widget + model status */}
      <div className="px-5 py-4 space-y-4" style={{ background: '#F5F7FA' }}>
        {/* Freshness */}
        <div
          className="rounded-lg border bg-white p-4"
          style={{ borderColor: '#E2E7EB' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded bg-[#DCFCE7] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#0E7D3F]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#11567F]">Data freshness</p>
              <p className="text-[11.5px] text-[#5A6872]">
                <span className="font-mono">prod_analytics.marts.fct_daily_revenue</span>
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[11px] text-[#5A6872] uppercase tracking-wider font-mono">
                Last successful run
              </p>
              <p className="text-[13px] font-semibold text-[#0E7D3F]">2m ago</p>
            </div>
          </div>

          {/* Latency bar compare */}
          <div className="space-y-2 mt-4">
            <LatencyBar label="Teradata baseline" value="3,412s" widthPct={100} tone="legacy" />
            <LatencyBar label="Snowflake XS WH" value="12.8s" widthPct={3.2} tone="snowflake" />
          </div>
          <p className="text-[11px] text-[#5A6872] mt-3">
            <span className="font-semibold text-[#0E7D3F]">266× faster</span> · same output shape,
            verified by Cortex semantic diff and a 1% row-equivalence harness.
          </p>
        </div>

        {/* Model pipeline */}
        <div
          className="rounded-lg border bg-white p-4"
          style={{ borderColor: '#E2E7EB' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12.5px] font-semibold text-[#11567F]">Model dependency graph</p>
            <span className="text-[10.5px] text-[#5A6872] font-mono">acme-dbt / models/marts</span>
          </div>
          <ModelDag />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ModelStatus name="stg_revenue_events" status="SUCCESS" time="3.1s" />
            <ModelStatus name="fct_daily_revenue" status="SUCCESS" time="12.8s" highlight />
            <ModelStatus name="fct_daily_revenue.yml" status="14 TESTS ✓" time="11.4s" />
          </div>
        </div>

        {/* Query profile mini */}
        <div
          className="rounded-lg border bg-white p-4"
          style={{ borderColor: '#E2E7EB' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-3.5 h-3.5 text-[#29B5E8]" />
            <p className="text-[12.5px] font-semibold text-[#11567F]">Query profile</p>
            <span className="text-[10.5px] text-[#5A6872] font-mono ml-auto">
              query_id 01c9f2d-0004-7b4a-0000-e3a9000a5082
            </span>
          </div>
          <QueryProfileFan />
          <p className="text-[10.5px] text-[#5A6872] mt-2">
            9 operators · local disk spill 0 MB · bytes scanned 142 MB ·{' '}
            <span className="font-mono">QUALIFY</span> pushed into the TableScan
          </p>
        </div>
      </div>
    </div>
  );
}

function TopTab({
  icon,
  label,
  active,
  count,
}: {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  count?: string;
}) {
  return (
    <button
      className={`px-3 py-2.5 flex items-center gap-1.5 text-[12.5px] border-b-2 whitespace-nowrap ${
        active
          ? 'border-[#29B5E8] text-[#11567F] font-semibold'
          : 'border-transparent text-[#5A6872] hover:text-[#11567F]'
      }`}
    >
      {icon}
      {label}
      {count && (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#F2F6F9] text-[#5A6872] font-mono">
          {count}
        </span>
      )}
    </button>
  );
}

function StatusCell({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone: 'green' | 'neutral' | 'blue';
  mono?: boolean;
}) {
  const color =
    tone === 'green'
      ? 'text-[#0E7D3F]'
      : tone === 'blue'
        ? 'text-[#11567F]'
        : 'text-[#1E2A33]';
  return (
    <div className="px-4 py-2.5 border-r last:border-r-0 bg-white" style={{ borderColor: '#E2E7EB' }}>
      <p className="text-[10px] text-[#5A6872] uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-[14px] font-semibold ${color} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function LatencyBar({
  label,
  value,
  widthPct,
  tone,
}: {
  label: string;
  value: string;
  widthPct: number;
  tone: 'legacy' | 'snowflake';
}) {
  const color = tone === 'snowflake' ? '#29B5E8' : '#F5A623';
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[11.5px] text-[#1E2A33]">{label}</span>
        <span className="text-[11.5px] font-mono font-semibold text-[#1E2A33]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#EEF2F5] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(widthPct, 1.5)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ModelDag() {
  return (
    <svg viewBox="0 0 560 100" className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="edgeFlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#29B5E8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#29B5E8" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      <path d="M 110 50 Q 180 50 220 50" stroke="url(#edgeFlow)" strokeWidth="2" fill="none" />
      <path d="M 330 50 Q 400 50 440 50" stroke="url(#edgeFlow)" strokeWidth="2" fill="none" />

      <DagNode x={20} y={20} w={90} h={58} label="source" sub="acme_crm.*" color="#5A6872" />
      <DagNode x={130} y={20} w={100} h={58} label="stg_revenue_events" sub="staging · CTE" color="#7DD3F5" />
      <DagNode x={240} y={8} w={100} h={84} label="fct_daily_revenue" sub="incremental · unique_key" color="#29B5E8" highlight />
      <DagNode x={360} y={20} w={100} h={58} label="tests (14)" sub="not_null · unique · relationships" color="#0E7D3F" />
      <DagNode x={470} y={20} w={80} h={58} label="dashboard" sub="revenue · daily" color="#7DD3F5" />

      <path d="M 440 50 Q 460 50 470 50" stroke="url(#edgeFlow)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function DagNode({
  x,
  y,
  w,
  h,
  label,
  sub,
  color,
  highlight,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={highlight ? color : '#FFFFFF'}
        stroke={color}
        strokeWidth={highlight ? 2 : 1.5}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - 4}
        textAnchor="middle"
        fontSize="10"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="600"
        fill={highlight ? '#FFFFFF' : '#11567F'}
      >
        {label}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 10}
        textAnchor="middle"
        fontSize="8.5"
        fontFamily="Inter, sans-serif"
        fill={highlight ? 'rgba(255,255,255,0.85)' : '#5A6872'}
      >
        {sub}
      </text>
    </g>
  );
}

function ModelStatus({
  name,
  status,
  time,
  highlight,
}: {
  name: string;
  status: string;
  time: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded border p-2 ${
        highlight ? 'bg-[#29B5E8]/10 border-[#29B5E8]/40' : 'bg-[#F5F7FA] border-[#E2E7EB]'
      }`}
    >
      <p className="text-[11px] font-mono text-[#11567F] font-semibold truncate">{name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-mono text-[#0E7D3F]">{status}</span>
        <span className="text-[10px] font-mono text-[#5A6872]">{time}</span>
      </div>
    </div>
  );
}

function QueryProfileFan() {
  return (
    <svg viewBox="0 0 540 80" className="w-full" preserveAspectRatio="xMidYMid meet">
      <path d="M 30 40 Q 80 40 120 20" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 30 40 Q 80 40 120 40" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 30 40 Q 80 40 120 60" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />

      <path d="M 150 20 Q 200 20 240 20" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 150 40 Q 200 40 240 40" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 150 60 Q 200 60 240 60" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />

      <path d="M 270 20 Q 320 20 360 40" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 270 40 Q 320 40 360 40" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 270 60 Q 320 60 360 40" stroke="#29B5E8" strokeWidth="1.5" fill="none" opacity="0.7" />

      <path d="M 390 40 Q 450 40 510 40" stroke="#29B5E8" strokeWidth="2" fill="none" />

      <ProfileOp x={0} y={30} label="TableScan" ms="1.4s" />
      <ProfileOp x={120} y={10} label="Join" ms="2.8s" />
      <ProfileOp x={120} y={30} label="Window" ms="3.1s" />
      <ProfileOp x={120} y={50} label="FLATTEN" ms="0.9s" />
      <ProfileOp x={240} y={10} label="Aggregate" ms="2.2s" />
      <ProfileOp x={240} y={30} label="Sort" ms="0.6s" />
      <ProfileOp x={240} y={50} label="QUALIFY" ms="0.4s" />
      <ProfileOp x={360} y={30} label="MERGE" ms="1.1s" />
      <ProfileOp x={480} y={30} label="Result" ms="0.3s" fill />
    </svg>
  );
}

function ProfileOp({
  x,
  y,
  label,
  ms,
  fill,
}: {
  x: number;
  y: number;
  label: string;
  ms: string;
  fill?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={30}
        height={20}
        rx={4}
        fill={fill ? '#29B5E8' : '#FFFFFF'}
        stroke="#29B5E8"
      />
      <text
        x={x + 15}
        y={y + 8}
        textAnchor="middle"
        fontSize="7"
        fontFamily="Inter, sans-serif"
        fill={fill ? '#FFFFFF' : '#11567F'}
        fontWeight="600"
      >
        {label}
      </text>
      <text
        x={x + 15}
        y={y + 16}
        textAnchor="middle"
        fontSize="6.5"
        fontFamily="JetBrains Mono, monospace"
        fill={fill ? 'rgba(255,255,255,0.85)' : '#5A6872'}
      >
        {ms}
      </text>
    </g>
  );
}

// ---------------- Right sidebar ----------------

function RightSidebar() {
  return (
    <aside className="bg-white" style={{ background: '#FFFFFF' }}>
      {/* Warehouse panel */}
      <SidebarSection
        title="Warehouse"
        icon={<Cpu className="w-3.5 h-3.5" />}
      >
        <div className="space-y-2">
          <KV k="Name" v="XS_MODERNIZATION_WH" mono />
          <KV k="State" v={<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" /> Running</span>} />
          <KV k="Size" v="X-Small" mono />
          <KV k="Auto-suspend" v="60s" mono />
          <KV k="Credits (1h)" v="0.083" mono highlight />
          <KV k="Queries · now" v="1" mono />
          <KV k="Queued" v="0" mono />
        </div>
      </SidebarSection>

      {/* Cortex review */}
      <SidebarSection
        title="Cortex AI review"
        icon={<Sparkles className="w-3.5 h-3.5 text-[#29B5E8]" />}
        badge="AI-generated"
      >
        <p className="text-[11.5px] font-mono text-[#5A6872] mb-2">
          SNOWFLAKE.CORTEX.COMPLETE(&apos;mistral-large&apos;, …)
        </p>
        <div className="rounded border p-2.5 text-[12px] text-[#1E2A33] leading-relaxed" style={{ borderColor: '#E2E7EB', background: '#F2F9FD' }}>
          <p className="mb-1.5">
            <strong>No semantic drift detected.</strong> The Snowflake dbt model preserves the
            (order_date, region, currency, category) grain from the Teradata BTEQ source.
          </p>
          <p className="mb-1.5">
            Currency conversion and product-hierarchy joins yield byte-identical USD sums on the
            1% sample; rank order of top-10 customers is unchanged.
          </p>
          <p>
            MERGE semantics are equivalent — <span className="font-mono">WHEN MATCHED</span> /{' '}
            <span className="font-mono">WHEN NOT MATCHED</span> paths map 1:1 to the
            incremental <span className="font-mono">unique_key</span> strategy.
          </p>
        </div>
      </SidebarSection>

      {/* Cost Explorer mini */}
      <SidebarSection
        title="Credits & cost"
        icon={<Zap className="w-3.5 h-3.5 text-[#F5A623]" />}
      >
        <div className="space-y-2">
          <KV k="This run" v="0.0042" mono highlight />
          <KV k="$ (est.)" v="$0.0084" mono />
          <KV k="Edition" v="Enterprise · $3/credit" />
          <KV k="Teradata CPU-eq" v="3,412s" mono />
          <KV k="vs GSI line-item" v="$58,000" mono highlight />
        </div>
        <p className="text-[10.5px] text-[#5A6872] mt-2">
          Est. portfolio steady-state: <span className="font-mono font-semibold text-[#11567F]">$2.3M/yr</span>{' '}
          vs legacy <span className="font-mono font-semibold text-[#F5A623]">$8.2M/yr</span>.
        </p>
      </SidebarSection>
    </aside>
  );
}

function SidebarSection({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-4 border-b" style={{ borderColor: '#E2E7EB' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[#5A6872]">{icon}</span>
        <p className="text-[11px] font-semibold text-[#11567F] uppercase tracking-wider">{title}</p>
        {badge && (
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase tracking-wider text-[#29B5E8] bg-[#29B5E8]/10 border border-[#29B5E8]/30">
            {badge}
          </span>
        )}
        <MoreHorizontal className={`w-3.5 h-3.5 text-[#5A6872] ${badge ? '' : 'ml-auto'}`} />
      </div>
      {children}
    </section>
  );
}

function KV({
  k,
  v,
  mono,
  highlight,
}: {
  k: string;
  v: string | React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 text-[11.5px]">
      <span className="text-[#5A6872] shrink-0 w-24">{k}</span>
      <span
        className={`truncate ${mono ? 'font-mono' : ''} ${highlight ? 'text-[#11567F] font-semibold' : 'text-[#1E2A33]'}`}
      >
        {v}
      </span>
    </div>
  );
}

// ---------------- Bottom query history ----------------

function BottomQueryHistory() {
  return (
    <div className="border-t bg-white" style={{ borderColor: '#E2E7EB' }}>
      <div className="px-5 py-3 flex items-center gap-3">
        <Clock className="w-3.5 h-3.5 text-[#5A6872]" />
        <p className="text-[12px] font-semibold text-[#11567F]">Query history · this modernization</p>
        <span className="text-[11px] text-[#5A6872] font-mono ml-auto">
          4 queries · 12.8s total · role ANALYTICS_ENGINEER
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="bg-[#F5F7FA] text-[10.5px] uppercase tracking-wider text-[#5A6872]">
            <tr>
              <th className="px-5 py-2 text-left font-semibold">Source</th>
              <th className="px-5 py-2 text-left font-semibold">Query</th>
              <th className="px-5 py-2 text-right font-semibold">Duration</th>
              <th className="px-5 py-2 text-right font-semibold">Rows</th>
              <th className="px-5 py-2 text-right font-semibold">Credits</th>
              <th className="px-5 py-2 text-right font-semibold">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#E2E7EB' }}>
            <tr>
              <td className="px-5 py-2 font-mono text-[#F5A623]">BTEQ (Teradata)</td>
              <td className="px-5 py-2 font-mono text-[#1E2A33] truncate">
                MERGE INTO fct_daily_revenue USING (…) — rollup
              </td>
              <td className="px-5 py-2 text-right font-mono text-[#F5A623]">3,412s</td>
              <td className="px-5 py-2 text-right font-mono">1.4M</td>
              <td className="px-5 py-2 text-right font-mono text-[#5A6872]">—</td>
              <td className="px-5 py-2 text-right text-[#5A6872]">pre-modernization</td>
            </tr>
            <tr>
              <td className="px-5 py-2 font-mono text-[#29B5E8]">dbt model (Snowflake)</td>
              <td className="px-5 py-2 font-mono text-[#1E2A33] truncate">
                dbt run --select fct_daily_revenue --target dev
              </td>
              <td className="px-5 py-2 text-right font-mono text-[#0E7D3F]">12.8s</td>
              <td className="px-5 py-2 text-right font-mono">1.4M</td>
              <td className="px-5 py-2 text-right font-mono text-[#11567F] font-semibold">0.0042</td>
              <td className="px-5 py-2 text-right">
                <span className="text-[#0E7D3F] font-semibold">SUCCESS</span>
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 font-mono text-[#B8E3F4]">Cortex AI</td>
              <td className="px-5 py-2 font-mono text-[#1E2A33] truncate">
                SELECT SNOWFLAKE.CORTEX.COMPLETE(&apos;mistral-large&apos;, …)
              </td>
              <td className="px-5 py-2 text-right font-mono text-[#0E7D3F]">3.1s</td>
              <td className="px-5 py-2 text-right font-mono">1</td>
              <td className="px-5 py-2 text-right font-mono text-[#11567F] font-semibold">0.0018</td>
              <td className="px-5 py-2 text-right">
                <span className="text-[#0E7D3F] font-semibold">no drift</span>
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 font-mono text-[#B8E3F4]">Row-equiv harness</td>
              <td className="px-5 py-2 font-mono text-[#1E2A33] truncate">
                SELECT COUNT(*) FROM diff_fct_daily_revenue WHERE delta &lt;&gt; 0
              </td>
              <td className="px-5 py-2 text-right font-mono text-[#0E7D3F]">0.6s</td>
              <td className="px-5 py-2 text-right font-mono">0</td>
              <td className="px-5 py-2 text-right font-mono text-[#11567F]">0.0003</td>
              <td className="px-5 py-2 text-right">
                <span className="text-[#0E7D3F] font-semibold">Δ = 0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
