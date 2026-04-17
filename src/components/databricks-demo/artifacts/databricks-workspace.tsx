'use client';

import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Flame,
  Database,
  Activity,
  Layers,
  Zap,
  Server,
  BrainCircuit,
  Workflow,
  GitBranch,
  Play,
  Clock,
  DollarSign,
  TrendingUp,
  Share2,
  Code2,
  type LucideIcon,
} from 'lucide-react';

// ------------------------------------------------------------------
// Databricks workspace chrome — pixel-perfect mock.
// Primary accent: #FF3621 · deep teal panels: #1B3139 · canvas: #F9F7F4.
// Left sidebar: workspace browser + platform tool icons.
// Center: tabbed pane, default tab = DLT pipeline DAG.
// Right: Run details · DBU cost · lineage.
// ------------------------------------------------------------------

export function DatabricksWorkspace() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#0F1B22', color: '#E7EEF1' }}
    >
      <TopNav />
      <SubNav />

      <div className="grid grid-cols-[220px_1fr_296px] gap-0">
        <LeftSidebar />
        <MainPane />
        <RightSidebar />
      </div>

      <UnityLineageStrip />
    </div>
  );
}

// ---------------- Top nav ----------------

function TopNav() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-3 border-b"
      style={{ background: '#0A1117', borderColor: '#1F2B33' }}
    >
      {/* Databricks flame logo */}
      <div className="flex items-center gap-2.5 px-2">
        <DatabricksLogo />
        <span className="text-[13.5px] font-semibold text-white tracking-tight">Databricks</span>
      </div>

      <div className="h-5 w-px" style={{ background: '#1F2B33' }} />

      {/* Workspace selector */}
      <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] text-[#BCC7CE] hover:bg-[#17232B]">
        <Server className="w-3.5 h-3.5 text-[#7DD3FC]" />
        <span className="font-mono">acme-dw-prod</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Env badge */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-[#FF9A8A] bg-[#FF3621]/10 border border-[#FF3621]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#57D9A3]" />
        prod · Photon
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div
          className="flex items-center gap-2 px-3 h-7 rounded"
          style={{ background: '#17232B', border: '1px solid #1F2B33' }}
        >
          <Search className="w-3.5 h-3.5 text-[#7A8A93]" />
          <span className="text-[12px] text-[#7A8A93] font-mono">
            catalog:main schema:customer_analytics · customer_rfm_pipeline
          </span>
          <span className="ml-auto text-[10px] text-[#556068] font-mono">⌘P</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NavIconButton icon={<Bell className="w-4 h-4" />} />
        <NavIconButton icon={<HelpCircle className="w-4 h-4" />} />
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: '#FF3621' }}
        >
          O
        </div>
      </div>
    </header>
  );
}

function NavIconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-7 h-7 rounded flex items-center justify-center text-[#7A8A93] hover:bg-[#17232B] hover:text-white">
      {icon}
    </button>
  );
}

function DatabricksLogo() {
  return (
    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#FF3621' }}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
        {/* Stylised Databricks "flame" — hand-drawn, not the real mark verbatim */}
        <path d="M12 2l5 3v3l-5 3-5-3V5l5-3zm0 8l5 3v3l-5 3-5-3v-3l5-3zm0 8l5 3v1H7v-1l5-3z" />
      </svg>
    </div>
  );
}

// ---------------- Sub nav (breadcrumb + actions) ----------------

function SubNav() {
  return (
    <div
      className="h-10 flex items-center gap-0 px-3 text-[12px] border-b"
      style={{ background: '#0F1B22', borderColor: '#1F2B33' }}
    >
      <Crumb label="Workspace" />
      <Chevron />
      <Crumb label="Shared" />
      <Chevron />
      <Crumb label="migration" />
      <Chevron />
      <Crumb label="customer_rfm" />
      <Chevron />
      <span className="px-2 text-white font-mono">customer_rfm_pipeline</span>

      <div className="ml-auto flex items-center gap-1.5">
        <SmallButton icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
        <SmallButton icon={<Code2 className="w-3.5 h-3.5" />} label="View as code" />
        <SmallButton icon={<Play className="w-3.5 h-3.5 text-[#57D9A3]" />} label="Start" accent />
      </div>
    </div>
  );
}

function Crumb({ label }: { label: string }) {
  return (
    <button className="px-2 py-1 rounded text-[#BCC7CE] hover:bg-[#17232B]">
      {label}
    </button>
  );
}

function Chevron() {
  return <ChevronRight className="w-3 h-3 text-[#556068]" />;
}

function SmallButton({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label?: string;
  accent?: boolean;
}) {
  return (
    <button
      className={`h-6 px-2 rounded text-[11.5px] flex items-center gap-1 border ${
        accent
          ? 'bg-[#17232B] border-[#57D9A3]/30 text-[#57D9A3] hover:bg-[#1B2E38]'
          : 'bg-[#17232B] border-[#1F2B33] text-[#BCC7CE] hover:bg-[#1B2832]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------- Left sidebar ----------------

function LeftSidebar() {
  return (
    <aside
      className="min-w-0 text-[12.5px] border-r"
      style={{ background: '#0B151B', color: '#BCC7CE', borderColor: '#1F2B33' }}
    >
      {/* Platform tool rail */}
      <div className="px-3 py-3 border-b" style={{ borderColor: '#1F2B33' }}>
        <PlatformLink icon={Workflow}    label="Workflows"     active={false} />
        <PlatformLink icon={Code2}       label="Notebooks"     active={false} />
        <PlatformLink icon={Layers}      label="DLT Pipelines" active={true} />
        <PlatformLink icon={Database}    label="Data"          subtitle="Unity Catalog" />
        <PlatformLink icon={Server}      label="Compute" />
        <PlatformLink icon={BrainCircuit} label="Mosaic AI"   subtitle="Foundation models" />
      </div>

      {/* Workspace browser */}
      <div className="py-2">
        <div className="px-3 py-1.5 flex items-center justify-between">
          <p className="text-[10px] text-[#7A8A93] uppercase font-semibold tracking-wider">
            Workspace
          </p>
          <ChevronDown className="w-3 h-3 text-[#7A8A93]" />
        </div>
        <div className="px-1 text-[12px]">
          <TreeItem icon={FolderOpen} label="Shared" indent={0} expanded />
          <TreeItem icon={FolderOpen} label="migration" indent={1} expanded />
          <TreeItem icon={FolderOpen} label="customer_rfm" indent={2} expanded />
          <TreeItem icon={FileText}   label="customer_rfm_pipeline.py" indent={3} active color="#FF6B55" />
          <TreeItem icon={FileText}   label="customer_rfm.sql"         indent={3} color="#7DD3FC" />
          <TreeItem icon={FileText}   label="unity_catalog_grants.sql" indent={3} color="#7DD3FC" />
          <TreeItem icon={FileText}   label="databricks.yml"           indent={3} color="#A3E635" />
          <TreeItem icon={Folder}     label="_legacy_reference" indent={2} />
          <TreeItem icon={Folder}     label="benchmarks"        indent={2} />
          <TreeItem icon={Folder}     label="reporting"         indent={1} />
          <TreeItem icon={Folder}     label="Users" indent={0} />
        </div>
      </div>

      {/* Compute status */}
      <div className="px-3 py-3 border-t" style={{ borderColor: '#1F2B33' }}>
        <p className="text-[10px] text-[#7A8A93] uppercase font-semibold tracking-wider mb-1.5">
          Compute
        </p>
        <div className="rounded-md px-2 py-1.5" style={{ background: '#11202A', border: '1px solid #1F2B33' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#57D9A3]" />
            <span className="text-[11.5px] text-white font-mono truncate">serverless-sql-large</span>
          </div>
          <p className="text-[10.5px] text-[#7A8A93] mt-0.5 font-mono">DBR 14.3 LTS · Photon</p>
        </div>
      </div>
    </aside>
  );
}

function PlatformLink({
  icon: Icon,
  label,
  subtitle,
  active,
}: {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] mb-0.5 ${
        active
          ? 'bg-[#FF3621]/10 text-[#FF6B55]'
          : 'text-[#BCC7CE] hover:bg-[#13212B] hover:text-white'
      }`}
      style={active ? { boxShadow: 'inset 0 0 0 1px rgba(255,54,33,0.25)' } : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left truncate">{label}</span>
      {subtitle && <span className="text-[10px] text-[#556068]">{subtitle}</span>}
    </button>
  );
}

function TreeItem({
  icon: Icon,
  label,
  indent,
  expanded,
  active,
  color,
}: {
  icon: LucideIcon;
  label: string;
  indent: number;
  expanded?: boolean;
  active?: boolean;
  color?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 py-0.5 rounded px-1.5 ${
        active ? 'bg-[#FF3621]/10 text-[#FF6B55]' : 'hover:bg-[#13212B]'
      }`}
      style={{ paddingLeft: 6 + indent * 12 }}
    >
      {expanded === undefined ? (
        <span className="w-3" />
      ) : (
        <ChevronDown className="w-3 h-3 text-[#556068] shrink-0" />
      )}
      <Icon className="w-3.5 h-3.5 shrink-0" style={color ? { color } : undefined} />
      <span className="truncate font-mono">{label}</span>
    </div>
  );
}

// ---------------- Main pane ----------------

function MainPane() {
  return (
    <div className="min-w-0 border-r" style={{ borderColor: '#1F2B33' }}>
      <TabBar />
      <PipelineHeader />
      <DltDag />
    </div>
  );
}

function TabBar() {
  const tabs = [
    { label: 'DLT pipeline', icon: Layers, active: true },
    { label: 'Notebook',     icon: Code2 },
    { label: 'SQL Editor',   icon: Database },
    { label: 'Job run',      icon: Play },
    { label: 'Unity Catalog',icon: Share2 },
  ];
  return (
    <div
      className="flex items-center px-3 gap-0 border-b text-[12.5px]"
      style={{ background: '#0F1B22', borderColor: '#1F2B33' }}
    >
      {tabs.map(t => (
        <button
          key={t.label}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap ${
            t.active
              ? 'border-[#FF3621] text-white font-medium'
              : 'border-transparent text-[#7A8A93] hover:text-[#BCC7CE]'
          }`}
        >
          <t.icon className="w-3.5 h-3.5" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function PipelineHeader() {
  return (
    <div className="px-5 py-3 border-b" style={{ borderColor: '#1F2B33', background: '#0F1B22' }}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: '#FF3621' }}
        >
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-[#7A8A93] font-mono mb-0.5">
            Pipeline · main.customer_analytics
          </p>
          <h2 className="text-[17px] font-semibold text-white leading-tight">
            customer_rfm_pipeline
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusPill />
        </div>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-[#7A8A93] font-mono">
        <span><Zap className="inline w-3 h-3 mr-1 text-[#FF6B55]" /> Photon enabled</span>
        <span>DBR 14.3 LTS</span>
        <span>Trigger: wk_monday_03_15_pst</span>
        <span className="text-[#57D9A3]">last update 2m ago</span>
      </div>
    </div>
  );
}

function StatusPill() {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#57D9A3]/10 border border-[#57D9A3]/30">
      <span className="w-1.5 h-1.5 rounded-full bg-[#57D9A3] animate-pulse" />
      <span className="text-[11.5px] text-[#57D9A3] font-medium">Running · Success</span>
    </div>
  );
}

// ---------------- DLT DAG ----------------

function DltDag() {
  // Layout: 4-node DAG, bronze → silver → gold with a parallel companion node.
  //
  //   orders_bronze    ─┐
  //                     ├─▶ rfm_scores_silver ─▶ rfm_scores_gold
  //   customers_bronze ─┘
  //
  // Coords are in the SVG viewBox so sizing is stable regardless of modal size.
  const W = 720;
  const H = 320;

  return (
    <div className="relative" style={{ background: '#F9F7F4', minHeight: 360 }}>
      {/* DAG SVG — the hero visual */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
        <defs>
          <linearGradient id="bronzeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9C59C" />
            <stop offset="100%" stopColor="#C69266" />
          </linearGradient>
          <linearGradient id="silverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E2E6EA" />
            <stop offset="100%" stopColor="#BFC7CE" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD466" />
            <stop offset="100%" stopColor="#E5A627" />
          </linearGradient>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7A81" />
          </marker>
        </defs>

        {/* Edges */}
        <path d="M 170 105 L 300 160" stroke="#6B7A81" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
        <path d="M 170 215 L 300 162" stroke="#6B7A81" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
        <path d="M 440 160 L 570 160" stroke="#6B7A81" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

        {/* Nodes */}
        <DagNode
          x={40}
          y={75}
          label="customers_bronze"
          sub="dlt.table"
          tint="bronze"
          rows="14.2M"
        />
        <DagNode
          x={40}
          y={185}
          label="orders_bronze"
          sub="dlt.table"
          tint="bronze"
          rows="42.8M"
        />
        <DagNode
          x={300}
          y={130}
          label="rfm_scores_silver"
          sub="dlt.table · materialized"
          tint="silver"
          rows="14.2M"
          running
        />
        <DagNode
          x={570}
          y={130}
          label="rfm_scores_gold"
          sub="dlt.table"
          tint="gold"
          rows="3.1M"
          success
        />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-5 right-5 flex items-center gap-4 text-[11px] text-[#384049]">
        <LegendDot color="linear-gradient(180deg, #E9C59C 0%, #C69266 100%)" label="bronze · raw" />
        <LegendDot color="linear-gradient(180deg, #E2E6EA 0%, #BFC7CE 100%)" label="silver · cleansed" />
        <LegendDot color="linear-gradient(180deg, #FFD466 0%, #E5A627 100%)" label="gold · business-ready" />
        <span className="ml-auto font-mono text-[#606971]">
          3 tables · 2 edges · ∅ schema drift · expectations ✓
        </span>
      </div>
    </div>
  );
}

function DagNode({
  x,
  y,
  label,
  sub,
  tint,
  rows,
  running,
  success,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  tint: 'bronze' | 'silver' | 'gold';
  rows?: string;
  running?: boolean;
  success?: boolean;
}) {
  const gradId = tint === 'bronze' ? 'bronzeGrad' : tint === 'silver' ? 'silverGrad' : 'goldGrad';
  const stroke = success ? '#057A55' : running ? '#FF3621' : '#2E3A42';
  const width = 130;
  const height = 60;

  return (
    <g>
      {/* Running pulse ring */}
      {running && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          rx={10}
          ry={10}
          fill="none"
          stroke="#FF3621"
          strokeOpacity="0.35"
          strokeWidth="2"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.35;0.1;0.35"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={`url(#${gradId})`}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Status dot */}
      <circle
        cx={x + width - 12}
        cy={y + 12}
        r={4}
        fill={success ? '#057A55' : running ? '#FF3621' : '#6B7A81'}
      />
      {/* Label */}
      <text x={x + 12} y={y + 24} fontSize="11.5" fontFamily="ui-monospace, Menlo, monospace" fill="#1B2A33" fontWeight="600">
        {label}
      </text>
      <text x={x + 12} y={y + 40} fontSize="10" fontFamily="ui-sans-serif" fill="#445260">
        {sub}
      </text>
      {rows && (
        <text x={x + 12} y={y + 54} fontSize="10" fontFamily="ui-monospace, Menlo, monospace" fill="#2F3A43">
          {rows} rows
        </text>
      )}
    </g>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-2.5 h-2.5 rounded-sm"
        style={{ background: color, border: '1px solid rgba(0,0,0,0.15)' }}
      />
      <span>{label}</span>
    </span>
  );
}

// ---------------- Right sidebar ----------------

function RightSidebar() {
  return (
    <aside
      className="min-w-0 text-[12px]"
      style={{ background: '#0F1B22', color: '#BCC7CE' }}
    >
      <SidebarHeader />

      <SidebarSection title="Run details" icon={<Activity className="w-3.5 h-3.5" />}>
        <KV k="Started"   v="2m ago" mono />
        <KV k="Duration"  v="42.7s" mono highlight />
        <KV k="Input"     v="14.2M rows" mono />
        <KV k="Output"    v="3.1M rows"  mono />
        <KV k="Photon"    v="enabled" mono />
        <KV k="Job id"    v="4472"    mono />
      </SidebarSection>

      <SidebarSection title="Cost" icon={<DollarSign className="w-3.5 h-3.5 text-[#FFB98E]" />}>
        <KV k="DBU used"   v="0.08 DBU" mono />
        <KV k="Est. cost"  v="$0.42"    mono highlight />
        <KV k="Rate"       v="SQL Large · $0.70/DBU-hr" mono />
      </SidebarSection>

      <SidebarSection title="Performance" icon={<TrendingUp className="w-3.5 h-3.5 text-[#57D9A3]" />}>
        <KV k="Oracle"    v="8m 12s" mono strike />
        <KV k="Photon"    v="14.3s"  mono greenBold />
        <KV k="Speedup"   v="34×"    mono greenBold />
        <KV k="Row delta" v="0"      mono greenBold />
      </SidebarSection>

      <SidebarSection title="Unity Catalog" icon={<Database className="w-3.5 h-3.5 text-[#7DD3FC]" />}>
        <div className="space-y-1.5 text-[11.5px] font-mono">
          <p className="text-white">main.customer_analytics</p>
          <p className="text-[#7DD3FC] pl-3">· rfm_scores_silver</p>
          <p className="text-[#FFD466] pl-3">· rfm_scores_gold</p>
          <p className="text-[#7A8A93] pl-3">· (grants: analytics_reader, marketing_ops)</p>
        </div>
      </SidebarSection>

      <SidebarSection title="Lineage" icon={<GitBranch className="w-3.5 h-3.5" />}>
        <LineageStep
          label="oracle.acme.customers"
          icon={<Database className="w-3 h-3" />}
          tone="legacy"
        />
        <LineageArrow />
        <LineageStep
          label="bronze.customers"
          icon={<Layers className="w-3 h-3" />}
          tone="bronze"
        />
        <LineageArrow />
        <LineageStep
          label="silver.rfm_scores"
          icon={<Layers className="w-3 h-3" />}
          tone="silver"
        />
        <LineageArrow />
        <LineageStep
          label="gold.rfm_scores"
          icon={<Flame className="w-3 h-3" />}
          tone="gold"
        />
      </SidebarSection>

      <SidebarSection title="Scheduler" icon={<Clock className="w-3.5 h-3.5" />}>
        <KV k="Trigger" v="wk_monday_03_15_pst" mono />
        <KV k="Next"    v="in 4d 7h"            mono />
        <KV k="Owner"   v="data-platform"       mono />
      </SidebarSection>
    </aside>
  );
}

function SidebarHeader() {
  return (
    <div
      className="px-4 py-3 border-b"
      style={{ borderColor: '#1F2B33' }}
    >
      <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
        Pipeline details
      </p>
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
      style={{ borderColor: '#1F2B33' }}
    >
      <div className="flex items-center gap-1.5 mb-2 text-[#7A8A93]">
        {icon}
        <p className="text-[10.5px] font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function KV({
  k,
  v,
  mono,
  highlight,
  strike,
  greenBold,
}: {
  k: string;
  v: string;
  mono?: boolean;
  highlight?: boolean;
  strike?: boolean;
  greenBold?: boolean;
}) {
  let cls = 'truncate';
  if (mono) cls += ' font-mono';
  if (highlight) cls += ' text-[#FF6B55] font-semibold';
  else if (greenBold) cls += ' text-[#57D9A3] font-semibold';
  else if (strike) cls += ' text-[#7A8A93] line-through';
  else cls += ' text-white';

  return (
    <div className="flex items-baseline gap-2 text-[11.5px]">
      <span className="text-[#7A8A93] shrink-0 w-20">{k}</span>
      <span className={cls}>{v}</span>
    </div>
  );
}

function LineageStep({
  label,
  icon,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  tone: 'legacy' | 'bronze' | 'silver' | 'gold';
}) {
  const toneCls = {
    legacy: 'bg-[#FF3621]/10 border-[#FF3621]/30 text-[#FF9A8A]',
    bronze: 'bg-[#C69266]/10 border-[#C69266]/30 text-[#E9C59C]',
    silver: 'bg-[#BFC7CE]/10 border-[#BFC7CE]/30 text-[#E2E6EA]',
    gold:   'bg-[#E5A627]/10 border-[#E5A627]/30 text-[#FFD466]',
  }[tone];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${toneCls} text-[11px] font-mono`}>
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function LineageArrow() {
  return (
    <div className="flex justify-center py-0.5">
      <ChevronDown className="w-3 h-3 text-[#556068]" />
    </div>
  );
}

// ---------------- Bottom strip: Unity Catalog lineage (horizontal) ----------------

function UnityLineageStrip() {
  return (
    <div
      className="border-t px-5 py-3 flex items-center gap-3 text-[11.5px]"
      style={{ background: '#0A1117', borderColor: '#1F2B33' }}
    >
      <Database className="w-3.5 h-3.5 text-[#7DD3FC]" />
      <span className="text-[#7A8A93] font-mono">Unity Catalog lineage</span>
      <span className="text-[#556068]">·</span>
      <span className="font-mono text-[#FF9A8A]">oracle.acme.customers</span>
      <ChevronRight className="w-3 h-3 text-[#556068]" />
      <span className="font-mono text-[#E9C59C]">bronze.customers</span>
      <ChevronRight className="w-3 h-3 text-[#556068]" />
      <span className="font-mono text-[#E2E6EA]">silver.rfm_scores</span>
      <ChevronRight className="w-3 h-3 text-[#556068]" />
      <span className="font-mono text-[#FFD466]">gold.rfm_scores</span>
      <span className="ml-auto text-[#556068] font-mono">
        Delta · Photon · DBU 0.08 · row delta 0
      </span>
    </div>
  );
}
