'use client';

import { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Star,
  MoreVertical,
  Activity,
  Database,
  Cpu,
  Box,
  Lock,
  Key,
  ShieldCheck,
  BarChart3,
  Eye,
  FolderTree,
  Cloud,
  Workflow,
  Gauge,
  TrendingDown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// AWS Console — Cloudscape-styled mock for the OrdersService modernization demo.
// Palette:
//   Canvas            #F2F3F3
//   Nav (squid ink)   #232F3E
//   Primary accent    #FF9900
//   Link / metric     #0972D3
// ---------------------------------------------------------------------------

const ACCOUNT = 'acme-prod';
const ROLE = 'ModernizationEngineer';
const REGION_CODE = 'us-east-1';
const REGION_LABEL = 'N. Virginia';

type Tab = 'cw' | 'lambda' | 'aurora' | 'cfn' | 'iam';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'cw', label: 'CloudWatch dashboard' },
  { id: 'lambda', label: 'Lambda function' },
  { id: 'aurora', label: 'Aurora cluster' },
  { id: 'cfn', label: 'CloudFormation stack' },
  { id: 'iam', label: 'IAM policy' },
];

export function AwsConsole() {
  const [tab, setTab] = useState<Tab>('cw');

  return (
    <div
      className="w-full h-full flex flex-col font-sans overflow-hidden"
      style={{ background: '#F2F3F3', color: '#0F1B2A' }}
    >
      <TopNav />
      <ServiceBreadcrumb />

      <div className="flex-1 flex min-h-0">
        <LeftNav />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <PageHeader tab={tab} />
          <TabBar tab={tab} onChange={setTab} />

          <div className="px-6 py-5 space-y-5">
            {tab === 'cw' && <CloudWatchTab />}
            {tab === 'lambda' && <LambdaTab />}
            {tab === 'aurora' && <AuroraTab />}
            {tab === 'cfn' && <CfnTab />}
            {tab === 'iam' && <IamTab />}

            <PolicyAdvisorStrip />
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}

// -------------------- Top nav (squid ink) --------------------

function TopNav() {
  return (
    <div
      className="h-[44px] flex items-center px-3 gap-4 text-white text-[12.5px] shrink-0"
      style={{ background: '#232F3E' }}
    >
      {/* AWS logo */}
      <button className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded">
        <svg viewBox="0 0 96 57" className="w-11 h-5">
          <path
            fill="#FFFFFF"
            d="M27.4 21.7c0 1.2.1 2.2.4 2.9.3.7.7 1.5 1.2 2.3.2.3.3.6.3.8 0 .3-.2.6-.6.9l-1.8 1.2c-.3.2-.5.2-.7.2-.3 0-.6-.1-.9-.4-.4-.4-.7-.9-1-1.4-.3-.5-.6-1-.9-1.7-2.2 2.6-5 3.9-8.4 3.9-2.4 0-4.3-.7-5.7-2-1.4-1.4-2.1-3.2-2.1-5.4 0-2.4.8-4.3 2.5-5.8 1.7-1.5 3.9-2.2 6.8-2.2 1 0 2 .1 3 .2 1.1.2 2.2.4 3.3.7v-2.2c0-2.1-.4-3.5-1.3-4.4-.9-.8-2.3-1.2-4.5-1.2-1 0-2 .1-3 .3-1.1.3-2.1.6-3.1 1-.5.2-.8.3-1 .4-.2 0-.4.1-.5.1-.4 0-.7-.3-.7-.9v-1.4c0-.4.1-.8.2-1 .2-.2.4-.4.8-.6.9-.5 2.1-.9 3.3-1.2 1.3-.4 2.7-.5 4.1-.5 3.1 0 5.4.7 6.8 2.1 1.5 1.4 2.2 3.5 2.2 6.4v8.4zm-11.5 4.3c1 0 1.9-.2 2.9-.5 1-.4 1.9-1 2.7-1.9.5-.6.8-1.2 1-1.9.2-.7.3-1.6.3-2.6v-1.3c-.8-.2-1.7-.3-2.6-.5-.9-.1-1.8-.2-2.7-.2-1.9 0-3.3.4-4.2 1.1-1 .8-1.4 1.9-1.4 3.3 0 1.3.4 2.3 1.1 3 .7.7 1.7 1.1 3.1 1.1zm22.7 3c-.5 0-.8-.1-1-.3-.2-.2-.4-.5-.6-1.1L30.5 7.2c-.1-.3-.2-.6-.2-.8 0-.4.2-.6.6-.6h2.8c.5 0 .8.1 1 .3.2.2.4.6.5 1.1l5 19.5 4.6-19.5c.1-.5.2-.8.5-1 .2-.2.5-.3 1-.3H48c.5 0 .8.1 1 .3.2.2.4.6.5 1.1l4.7 19.8L59.4 7.2c.1-.5.3-.8.5-1 .2-.2.5-.3 1-.3h2.5c.4 0 .6.2.6.6v.3c0 .1-.1.3-.1.4L57 28.6c-.1.5-.3.8-.5 1-.2.2-.5.3-.9.3H53c-.5 0-.8-.1-1-.3-.2-.2-.4-.5-.5-1.1L47 10l-4.5 19.5c-.1.5-.3.8-.5 1.1-.2.2-.5.3-1 .3h-2.4zm36.3.8c-1.4 0-2.8-.2-4.1-.5-1.3-.3-2.4-.7-3.1-1.1-.4-.2-.7-.5-.8-.8-.1-.3-.2-.5-.2-.8v-1.4c0-.6.2-.9.7-.9.2 0 .3 0 .5.1.2 0 .4.1.7.2 1 .4 2 .8 3.1 1 1.1.2 2.2.3 3.3.3 1.7 0 3-.3 4-.9 1-.6 1.4-1.5 1.4-2.6 0-.8-.2-1.4-.7-1.9s-1.4-1-2.7-1.4l-3.9-1.2c-2-.6-3.4-1.5-4.3-2.7-.9-1.1-1.3-2.4-1.3-3.7 0-1.1.2-2 .7-2.8.5-.8 1.1-1.5 1.8-2.1.8-.6 1.7-1 2.7-1.3 1-.3 2.1-.5 3.3-.5.6 0 1.1 0 1.7.1.6.1 1.1.2 1.7.3.5.1 1 .3 1.5.4.5.2.8.3 1.1.5.4.2.6.4.8.7.2.2.3.6.3 1v1.3c0 .6-.2 1-.7 1-.2 0-.6-.1-1.1-.3-1.6-.7-3.4-1.1-5.4-1.1-1.5 0-2.7.2-3.6.7-.9.5-1.3 1.3-1.3 2.3 0 .7.3 1.4.8 1.9.5.5 1.5.9 3 1.4l3.8 1.2c2 .6 3.3 1.4 4.2 2.5.8 1.1 1.2 2.3 1.2 3.7 0 1.1-.2 2.1-.7 2.9-.4.9-1.1 1.6-1.9 2.2-.8.6-1.8 1.1-2.9 1.4-1.3.4-2.6.5-4 .5z"
          />
          <path
            fill="#FF9900"
            d="M85.4 44.8c-9.3 6.8-22.7 10.5-34.2 10.5-16.2 0-30.7-6-41.7-15.9-.9-.8-.1-1.9.9-1.3 11.9 6.9 26.6 11 41.8 11 10.3 0 21.5-2.1 31.9-6.5 1.6-.7 2.9.9 1.3 2.2z"
          />
          <path
            fill="#FF9900"
            d="M89.3 40.3c-1.2-1.5-7.9-.7-10.9-.4-.9.1-1.1-.7-.3-1.3 5.3-3.7 14-2.6 15.1-1.4 1 1.3-.3 10-5.3 14.1-.8.7-1.5.3-1.2-.6 1.1-2.9 3.8-9 2.6-10.4z"
          />
        </svg>
      </button>

      <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10">
        <span>Services</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div
          className="flex items-center gap-2 rounded px-2.5 py-1"
          style={{ background: '#2B3646' }}
        >
          <Search className="w-3.5 h-3.5 text-white/70" />
          <span className="text-white/70 text-[12px]">Search for services, features, blogs, docs, and more</span>
          <span className="ml-auto text-white/40 text-[10.5px] border border-white/20 px-1 rounded">
            [Alt+S]
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[12px] text-white/90 ml-auto">
        <button className="hover:underline">{ACCOUNT} / {ROLE}</button>
        <button className="flex items-center gap-1 hover:underline">
          {REGION_LABEL} <span className="text-white/60">({REGION_CODE})</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        <button className="p-1.5 rounded hover:bg-white/10">
          <Bell className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded hover:bg-white/10">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// -------------------- Service breadcrumb --------------------

function ServiceBreadcrumb() {
  return (
    <div
      className="h-[36px] flex items-center gap-2 px-5 text-[12px] border-b shrink-0"
      style={{ background: '#FFFFFF', borderColor: '#D5DBDB' }}
    >
      <span style={{ color: '#0972D3' }} className="hover:underline cursor-pointer">CloudWatch</span>
      <ChevronRight className="w-3 h-3 text-[#5F6B7A]" />
      <span style={{ color: '#0972D3' }} className="hover:underline cursor-pointer">Dashboards</span>
      <ChevronRight className="w-3 h-3 text-[#5F6B7A]" />
      <span style={{ color: '#414D5C' }}>orders-prod</span>
      <span className="ml-auto text-[11px] text-[#5F6B7A]">
        Cutover: 5 days ago · Hyper-care: closed ·{' '}
        <span style={{ color: '#037F0C' }}>Auto-refresh 1m</span>
      </span>
    </div>
  );
}

// -------------------- Left nav (Cloudscape side nav) --------------------

const LEFT_SECTIONS: Array<{
  label: string;
  icon: typeof Activity;
  items: string[];
  active?: number;
}> = [
  { label: 'CloudWatch', icon: Activity, items: ['Dashboards', 'Alarms', 'Metrics', 'Log groups', 'ServiceLens'], active: 0 },
  { label: 'Lambda', icon: Cpu, items: ['Functions', 'Layers', 'Event sources'] },
  { label: 'Aurora', icon: Database, items: ['Clusters', 'Instances', 'Parameter groups'] },
  { label: 'CloudFormation', icon: Box, items: ['Stacks', 'StackSets', 'Drift detection'] },
  { label: 'IAM', icon: Lock, items: ['Users', 'Roles', 'Policies', 'Access Analyzer'] },
  { label: 'Secrets Manager', icon: Key, items: ['Secrets', 'Rotation'] },
  { label: 'ECS', icon: Workflow, items: ['Clusters', 'Task definitions'] },
];

function LeftNav() {
  return (
    <nav
      className="w-[224px] border-r shrink-0 text-[12.5px]"
      style={{ background: '#FFFFFF', borderColor: '#D5DBDB', color: '#414D5C' }}
    >
      <div className="p-3 border-b" style={{ borderColor: '#EAEDED' }}>
        <p className="text-[10.5px] uppercase tracking-wider" style={{ color: '#5F6B7A' }}>
          Pinned
        </p>
        <p className="mt-1 font-medium" style={{ color: '#0972D3' }}>
          orders-dev dashboard
        </p>
      </div>
      <ul className="py-1">
        {LEFT_SECTIONS.map((sec, i) => {
          const Icon = sec.icon;
          const highlight = sec.active !== undefined;
          return (
            <li key={sec.label} className="mb-0.5">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 ${
                  highlight ? 'font-semibold' : ''
                }`}
                style={highlight ? { background: '#F2F8FD', color: '#0F1B2A' } : {}}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: '#0972D3' }} />
                <span>{sec.label}</span>
                <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
              </div>
              {i === 0 && (
                <ul className="pb-1">
                  {sec.items.map((it, j) => (
                    <li
                      key={it}
                      className={`pl-8 pr-3 py-1 text-[12px] ${
                        j === sec.active
                          ? 'font-semibold border-l-2'
                          : 'hover:underline cursor-pointer'
                      }`}
                      style={
                        j === sec.active
                          ? { color: '#0972D3', borderColor: '#0972D3' }
                          : { color: '#414D5C' }
                      }
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// -------------------- Page header --------------------

function PageHeader({ tab }: { tab: Tab }) {
  const titles: Record<Tab, { title: string; sub: string }> = {
    cw:     { title: 'orders-prod', sub: 'CloudWatch dashboard · cutover Day 17 · hyper-care closed Day 21 · 100% traffic on AWS' },
    lambda: { title: 'orders-create · CreateOrderFn', sub: 'Node.js 20 · arm64 · 512 MB · 10s timeout · Active tracing · provisioned concurrency 10' },
    aurora: { title: 'orders-cluster', sub: 'Aurora Serverless v2 · PostgreSQL 15.4 · 0.5 → 8 ACU autoscaling · multi-AZ' },
    cfn:    { title: 'orders-prod', sub: 'CloudFormation stack · UPDATE_COMPLETE · 5 days ago · 14 resources · 4 reviewer approvals' },
    iam:    { title: 'OrdersHandlerRole', sub: 'Customer-managed role · 3 inline policies · 0 over-privileged actions · SecOps approved Day 4' },
  };
  const t = titles[tab];
  return (
    <div className="px-6 pt-5 pb-3 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-3.5 h-3.5 text-[#5F6B7A]" />
            <h1 className="text-[22px] font-semibold" style={{ color: '#0F1B2A' }}>
              {t.title}
            </h1>
            <span
              className="ml-1 text-[10.5px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: '#F1FAEC', color: '#037F0C', border: '1px solid #B4DBA4' }}
            >
              HEALTHY
            </span>
          </div>
          <p className="text-[12.5px]" style={{ color: '#5F6B7A' }}>
            {t.sub}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HeaderButton>Actions ▾</HeaderButton>
          <HeaderButton primary>Deploy next bounded context</HeaderButton>
        </div>
      </div>
    </div>
  );
}

function HeaderButton({
  children,
  primary,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <button
        className="px-3 py-1.5 rounded text-[12.5px] font-semibold"
        style={{ background: '#FF9900', color: '#0F1B2A' }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      className="px-3 py-1.5 rounded text-[12.5px] border"
      style={{ background: '#FFFFFF', borderColor: '#7D8998', color: '#0F1B2A' }}
    >
      {children}
    </button>
  );
}

// -------------------- Tabs --------------------

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex items-center border-b px-6" style={{ background: '#FFFFFF', borderColor: '#D5DBDB' }}>
      {TABS.map(t => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="px-3 py-2.5 text-[12.5px] -mb-px cursor-pointer"
            style={{
              color: active ? '#0F1B2A' : '#414D5C',
              borderBottom: active ? '3px solid #0972D3' : '3px solid transparent',
              fontWeight: active ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-2 text-[11.5px]" style={{ color: '#5F6B7A' }}>
        <span>1h · 3h · 12h</span>
        <span
          className="px-1.5 py-0.5 rounded font-semibold"
          style={{ background: '#0972D3', color: '#FFFFFF' }}
        >
          1h
        </span>
      </div>
    </div>
  );
}

// -------------------- CloudWatch tab --------------------

function CloudWatchTab() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricTile
          label="p99 latency"
          value="340 ms"
          delta="−79% vs WebSphere baseline"
          deltaGood
          spark={<Sparkline series={[420, 398, 372, 360, 355, 344, 348, 342, 340, 338]} color="#0972D3" />}
        />
        <MetricTile
          label="invocations · 1h"
          value="12,847"
          delta="arm64 · cold starts 1.4%"
          spark={<Sparkline series={[1100, 1280, 1240, 1310, 1320, 1290, 1350, 1345, 1360, 1380]} color="#037F0C" />}
        />
        <MetricTile
          label="error rate · 1h"
          value="0.00%"
          delta="0 errors · SLO 99.9%"
          deltaGood
          spark={<Sparkline series={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]} color="#037F0C" flat />}
        />
        <MetricTile
          label="Aurora ACU util"
          value="0.62 ACU"
          delta="autoscale 0.5 → 8"
          spark={<Sparkline series={[0.5, 0.52, 0.58, 0.6, 0.62, 0.61, 0.63, 0.62, 0.6, 0.62]} color="#FF9900" />}
        />
      </div>

      <ResourceMap />
    </>
  );
}

function MetricTile({
  label,
  value,
  delta,
  deltaGood,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  deltaGood?: boolean;
  spark: React.ReactNode;
}) {
  return (
    <div className="rounded border bg-white p-3.5" style={{ borderColor: '#D5DBDB' }}>
      <p className="text-[11px] uppercase tracking-wider" style={{ color: '#5F6B7A' }}>
        {label}
      </p>
      <div className="flex items-baseline justify-between mt-1">
        <p className="text-[22px] font-semibold font-mono" style={{ color: '#0F1B2A' }}>
          {value}
        </p>
        <Gauge className="w-3.5 h-3.5" style={{ color: '#5F6B7A' }} />
      </div>
      <div className="mt-2 h-8">{spark}</div>
      <p
        className="text-[11px] mt-1.5 flex items-center gap-1"
        style={{ color: deltaGood ? '#037F0C' : '#5F6B7A' }}
      >
        {deltaGood && <TrendingDown className="w-3 h-3" />}
        {delta}
      </p>
    </div>
  );
}

function Sparkline({ series, color, flat }: { series: number[]; color: string; flat?: boolean }) {
  const width = 200;
  const height = 28;
  const max = flat ? 1 : Math.max(...series);
  const min = flat ? 0 : Math.min(...series);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);
  const coords = series.map((v, i) => {
    const x = i * stepX;
    const y = flat
      ? height - 2
      : height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  });
  const path = coords
    .map((c, i) => (i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`))
    .join(' ');
  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="block">
      <defs>
        <linearGradient id={`sparkFill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sparkFill-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// -------------------- Resource map --------------------

function ResourceMap() {
  return (
    <div className="rounded border bg-white" style={{ borderColor: '#D5DBDB' }}>
      <div
        className="px-4 py-2.5 border-b flex items-center justify-between"
        style={{ borderColor: '#EAEDED' }}
      >
        <div className="flex items-center gap-2">
          <FolderTree className="w-3.5 h-3.5" style={{ color: '#0972D3' }} />
          <p className="text-[13px] font-semibold" style={{ color: '#0F1B2A' }}>
            Architecture · CDK resource map
          </p>
          <span
            className="text-[10.5px] px-1.5 py-0.5 rounded"
            style={{ background: '#F2F8FD', color: '#0972D3', border: '1px solid #B5D6F4' }}
          >
            orders-dev
          </span>
        </div>
        <span className="text-[11.5px]" style={{ color: '#5F6B7A' }}>
          14 resources · 3 VPC endpoints · 0 NAT
        </span>
      </div>
      <div className="px-6 py-5 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-[820px]">
          <Node icon={<Cloud className="w-4 h-4" />} label="Amazon API Gateway" sub="RestApi · /orders" color="#FF9900" />
          <Arrow />
          <Node icon={<Cpu className="w-4 h-4" />} label="AWS Lambda" sub="CreateOrderFn · node20" color="#0972D3" primary />
          <Arrow />
          <Node icon={<Database className="w-4 h-4" />} label="Aurora Serverless v2" sub="orders · pg15.4 · 0.5 → 8 ACU" color="#A74B8E" />
        </div>
        <div className="flex items-center gap-3 min-w-[820px] mt-4">
          <div className="w-[120px]" />
          <div className="flex items-center gap-3">
            <Sidecar icon={<Key className="w-3.5 h-3.5" />} label="Secrets Manager" sub="OrdersDbSecret · rotate 30d" />
            <Sidecar icon={<Box className="w-3.5 h-3.5" />} label="VPC endpoint · secretsmanager" sub="com.amazonaws.us-east-1.secretsmanager" />
            <Sidecar icon={<Box className="w-3.5 h-3.5" />} label="VPC endpoint · rds-data" sub="com.amazonaws.us-east-1.rds-data" />
            <Sidecar icon={<Eye className="w-3.5 h-3.5" />} label="CloudWatch · Logs + X-Ray" sub="/aws/lambda/orders-create" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Node({
  icon,
  label,
  sub,
  color,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  primary?: boolean;
}) {
  return (
    <div
      className="rounded border p-3 min-w-[200px]"
      style={{
        background: primary ? '#FFF7E6' : '#FFFFFF',
        borderColor: primary ? '#FF9900' : '#D5DBDB',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded flex items-center justify-center"
          style={{ background: `${color}1F`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[12.5px] font-semibold" style={{ color: '#0F1B2A' }}>
            {label}
          </p>
          <p className="text-[11px] font-mono" style={{ color: '#5F6B7A' }}>
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

function Sidecar({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div
      className="rounded border px-2.5 py-1.5 flex items-center gap-2 min-w-[220px]"
      style={{ background: '#FFFFFF', borderColor: '#D5DBDB' }}
    >
      <div
        className="w-6 h-6 rounded flex items-center justify-center"
        style={{ background: '#F2F8FD', color: '#0972D3' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11.5px] font-medium" style={{ color: '#0F1B2A' }}>
          {label}
        </p>
        <p className="text-[10.5px] font-mono" style={{ color: '#5F6B7A' }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="26" height="14" viewBox="0 0 26 14" className="shrink-0">
      <path d="M0 7 H 20 M 14 1 L 20 7 L 14 13" stroke="#7D8998" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

// -------------------- Lambda tab --------------------

function LambdaTab() {
  return (
    <div className="space-y-4">
      <Panel title="Function overview">
        <div className="grid grid-cols-4 gap-4 text-[12.5px]">
          <KV label="ARN" value="arn:aws:lambda:us-east-1:123456789012:function:orders-create" mono />
          <KV label="Runtime" value="Node.js 20 · arm64" />
          <KV label="Memory" value="512 MB" />
          <KV label="Timeout" value="10 s" />
          <KV label="Tracing" value="Active · X-Ray" />
          <KV label="Concurrency" value="Reserved 50 · Provisioned 0" />
          <KV label="Last invocation" value="just now" />
          <KV label="Deployed from" value="cdk deploy --profile dev" />
        </div>
      </Panel>

      <Panel title="Environment (least-privilege · no secrets inline)">
        <div className="grid grid-cols-2 gap-2 text-[12px] font-mono" style={{ color: '#414D5C' }}>
          <div>ORDERS_CLUSTER_ARN</div>
          <div className="truncate">arn:aws:rds:us-east-1:123456789012:cluster:orders</div>
          <div>ORDERS_SECRET_ARN</div>
          <div className="truncate">arn:aws:secretsmanager:us-east-1:123456789012:secret:OrdersDbSecret-aX93z2</div>
          <div>POWERTOOLS_SERVICE_NAME</div>
          <div>orders</div>
          <div>LOG_LEVEL</div>
          <div>INFO</div>
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border bg-white" style={{ borderColor: '#D5DBDB' }}>
      <div
        className="px-4 py-2.5 border-b flex items-center justify-between"
        style={{ borderColor: '#EAEDED' }}
      >
        <p className="text-[13px] font-semibold" style={{ color: '#0F1B2A' }}>
          {title}
        </p>
        <MoreVertical className="w-3.5 h-3.5" style={{ color: '#5F6B7A' }} />
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wider mb-0.5" style={{ color: '#5F6B7A' }}>
        {label}
      </p>
      <p
        className={`text-[12.5px] ${mono ? 'font-mono break-all' : ''}`}
        style={{ color: '#0F1B2A' }}
      >
        {value}
      </p>
    </div>
  );
}

// -------------------- Aurora tab --------------------

function AuroraTab() {
  return (
    <div className="space-y-4">
      <Panel title="Aurora Serverless v2 · orders-cluster">
        <div className="grid grid-cols-4 gap-4 text-[12.5px]">
          <KV label="Engine" value="aurora-postgresql 15.4" />
          <KV label="Capacity" value="0.5 → 8 ACU · current 0.62" />
          <KV label="Endpoints" value="Writer · Reader · Data API" />
          <KV label="Public access" value="No" />
          <KV label="Encryption" value="KMS CMK · aws/rds" />
          <KV label="Backup retention" value="14 days · PITR ✓" />
          <KV label="Cluster ARN" value="arn:aws:rds:us-east-1:123456789012:cluster:orders" mono />
          <KV label="Multi-AZ" value="Yes · 3 AZs" />
        </div>
      </Panel>
      <Panel title="Stored functions (migrated from Oracle PL/SQL)">
        <table className="w-full text-[12.5px]">
          <thead style={{ color: '#5F6B7A' }}>
            <tr>
              <th className="text-left py-1.5">Function</th>
              <th className="text-left py-1.5">Replaces</th>
              <th className="text-left py-1.5">Return</th>
              <th className="text-left py-1.5">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono" style={{ color: '#0F1B2A' }}>
            <tr className="border-t" style={{ borderColor: '#EAEDED' }}>
              <td className="py-1.5">pg_reserve_inventory</td>
              <td className="py-1.5">SP_RESERVE_INVENTORY (REF_CURSOR)</td>
              <td className="py-1.5">SETOF reservation</td>
              <td className="py-1.5" style={{ color: '#037F0C' }}>Deployed ✓</td>
            </tr>
            <tr className="border-t" style={{ borderColor: '#EAEDED' }}>
              <td className="py-1.5">pg_capture_revenue</td>
              <td className="py-1.5">SP_CAPTURE_REVENUE</td>
              <td className="py-1.5">bigint</td>
              <td className="py-1.5" style={{ color: '#037F0C' }}>Deployed ✓</td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

// -------------------- CloudFormation tab --------------------

function CfnTab() {
  const events = [
    { time: '5d ago',  type: 'AWS::CloudFormation::Stack', id: 'orders-prod (cutover)', status: 'UPDATE_COMPLETE' },
    { time: '5d ago',  type: 'AWS::Lambda::Alias',         id: 'CreateOrderFn:live',    status: 'UPDATE_COMPLETE' },
    { time: '10d ago', type: 'AWS::Lambda::Function',      id: 'CreateOrderFn (dual-write)', status: 'UPDATE_COMPLETE' },
    { time: '15d ago', type: 'AWS::CloudFormation::Stack', id: 'orders-stage',          status: 'CREATE_COMPLETE' },
    { time: '19d ago', type: 'AWS::CloudFormation::Stack', id: 'orders-dev (initial)',  status: 'CREATE_COMPLETE' },
    { time: '19d ago', type: 'AWS::RDS::DBCluster',        id: 'OrdersCluster',         status: 'CREATE_COMPLETE' },
    { time: '19d ago', type: 'AWS::SecretsManager::Secret', id: 'OrdersDbSecret',       status: 'CREATE_COMPLETE' },
    { time: '19d ago', type: 'AWS::EC2::VPCEndpoint',      id: 'SecretsManagerEndpoint', status: 'CREATE_COMPLETE' },
    { time: '19d ago', type: 'AWS::EC2::VPCEndpoint',      id: 'RdsDataEndpoint',       status: 'CREATE_COMPLETE' },
    { time: '19d ago', type: 'AWS::ApiGateway::RestApi',   id: 'OrdersApi',             status: 'CREATE_COMPLETE' },
  ];
  return (
    <div className="space-y-4">
      <Panel title="Stack outputs">
        <div className="grid grid-cols-2 gap-4 text-[12.5px]">
          <KV label="OrdersApiUrl" value="https://d2a1b3.execute-api.us-east-1.amazonaws.com/prod/orders" mono />
          <KV label="OrdersClusterArn" value="arn:aws:rds:us-east-1:123456789012:cluster:orders" mono />
          <KV label="OrdersSecretArn" value="arn:aws:secretsmanager:us-east-1:123456789012:secret:OrdersDbSecret-aX93z2" mono />
          <KV label="OrdersHandlerRoleArn" value="arn:aws:iam::123456789012:role/OrdersHandlerRole" mono />
        </div>
      </Panel>
      <Panel title="Events (last 22 days)">
        <ul className="text-[12.5px] font-mono space-y-1">
          {events.map(e => (
            <li key={`${e.id}-${e.time}`} className="grid grid-cols-[90px_1fr_240px_160px] gap-2">
              <span style={{ color: '#5F6B7A' }}>{e.time}</span>
              <span style={{ color: '#414D5C' }}>{e.type}</span>
              <span style={{ color: '#0F1B2A' }}>{e.id}</span>
              <span style={{ color: '#037F0C' }}>{e.status}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

// -------------------- IAM tab --------------------

function IamTab() {
  return (
    <div className="space-y-4">
      <Panel title="OrdersHandlerRole · inline policy AllowOrdersCrud">
        <pre
          className="text-[11.5px] font-mono leading-[1.6] p-3 rounded overflow-x-auto"
          style={{ background: '#FAFBFC', color: '#0F1B2A', border: '1px solid #EAEDED' }}
        >
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RdsDataExecute",
      "Effect": "Allow",
      "Action": [
        "rds-data:ExecuteStatement",
        "rds-data:BatchExecuteStatement"
      ],
      "Resource": "arn:aws:rds:us-east-1:123456789012:cluster:orders"
    },
    {
      "Sid": "SecretRead",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:OrdersDbSecret-aX93z2"
    },
    {
      "Sid": "LogsAndTracing",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "xray:PutTraceSegments"
      ],
      "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/orders-create:*"
    }
  ]
}`}
        </pre>
      </Panel>
    </div>
  );
}

// -------------------- Bottom IAM policy advisor --------------------

function PolicyAdvisorStrip() {
  return (
    <div
      className="rounded border flex items-center gap-4 px-4 py-3"
      style={{ background: '#F1FAEC', borderColor: '#B4DBA4' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: '#037F0C', color: 'white' }}
      >
        <ShieldCheck className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: '#0F1B2A' }}>
          IAM Access Analyzer · OrdersHandlerRole
        </p>
        <p className="text-[11.5px]" style={{ color: '#414D5C' }}>
          0 over-privileged actions · 0 public resources · 0 cross-account exposure · least-privilege verified
        </p>
      </div>
      <span
        className="px-2 py-0.5 rounded text-[11px] font-semibold"
        style={{ background: '#037F0C', color: '#FFFFFF' }}
      >
        ✓ least-priv
      </span>
      <span
        className="px-2 py-0.5 rounded text-[11px] font-semibold"
        style={{ background: '#FF9900', color: '#0F1B2A' }}
      >
        Well-Architected 6-pillar
      </span>
    </div>
  );
}

// -------------------- Right sidebar --------------------

function RightSidebar() {
  return (
    <aside
      className="w-[280px] border-l shrink-0 p-3 space-y-3 overflow-y-auto"
      style={{ background: '#FFFFFF', borderColor: '#D5DBDB' }}
    >
      <SidebarCard title="Deployment">
        <dl className="text-[12px] space-y-1.5">
          <Row label="Stack">
            <span className="font-mono" style={{ color: '#0972D3' }}>orders-prod</span>
          </Row>
          <Row label="Status">
            <span
              className="px-1.5 py-0.5 rounded font-semibold"
              style={{ background: '#F1FAEC', color: '#037F0C', border: '1px solid #B4DBA4' }}
            >
              UPDATE_COMPLETE
            </span>
          </Row>
          <Row label="Cutover">Day 17 (5d ago)</Row>
          <Row label="Hyper-care">Closed (Day 21)</Row>
          <Row label="Review gates">
            <span style={{ color: '#FF9900' }}>4 / 4 passed</span>
          </Row>
        </dl>
      </SidebarCard>

      <SidebarCard title="Outputs">
        <dl className="text-[11.5px] font-mono space-y-1">
          <Out k="OrdersApiUrl" v="…execute-api…/prod/orders" />
          <Out k="OrdersClusterArn" v=":cluster:orders" />
          <Out k="OrdersSecretArn" v=":OrdersDbSecret-aX93z2" />
        </dl>
      </SidebarCard>

      <SidebarCard title="Cost Explorer · this stack">
        <p className="text-[11.5px]" style={{ color: '#5F6B7A' }}>
          Estimated monthly
        </p>
        <p className="text-[20px] font-semibold font-mono mt-0.5" style={{ color: '#0F1B2A' }}>
          $527
        </p>
        <p className="text-[11px]" style={{ color: '#037F0C' }}>
          vs on-prem slice ~$70,000 / mo
        </p>
        <div className="mt-2 h-2 rounded" style={{ background: '#EAEDED' }}>
          <div
            className="h-full rounded"
            style={{ width: '4%', background: '#FF9900' }}
          />
        </div>
        <p className="text-[11px] mt-1" style={{ color: '#5F6B7A' }}>
          4% of budget used
        </p>
      </SidebarCard>

      <SidebarCard title="Portfolio progress">
        <p className="text-[11.5px]" style={{ color: '#5F6B7A' }}>
          1 / 38 bounded contexts extracted
        </p>
        <div className="mt-2 h-2 rounded" style={{ background: '#EAEDED' }}>
          <div
            className="h-full rounded"
            style={{ width: '2.6%', background: '#FF9900' }}
          />
        </div>
        <p className="text-[11px] mt-2" style={{ color: '#414D5C' }}>
          Est. finish <strong>18 months</strong> · GSI baseline 5 years
        </p>
      </SidebarCard>

      <SidebarCard title="22-day audit trail">
        <ul className="text-[11.5px] space-y-1.5" style={{ color: '#414D5C' }}>
          <li>
            <span style={{ color: '#5F6B7A' }}>just now</span> · PR #482 merged (acme-platform-eng)
          </li>
          <li>
            <span style={{ color: '#5F6B7A' }}>5d ago</span> · prod cutover · 36h shift complete
          </li>
          <li>
            <span style={{ color: '#5F6B7A' }}>10d ago</span> · dual-write parity 100% · 0 DLQ
          </li>
          <li>
            <span style={{ color: '#FF9900' }}>11d ago</span> · cutover review (gate 4/4) ✓
          </li>
          <li>
            <span style={{ color: '#FF9900' }}>16d ago</span> · FinOps review (gate 3/4) ✓
          </li>
          <li>
            <span style={{ color: '#FF9900' }}>18d ago</span> · Security review (gate 2/4) ✓
          </li>
          <li>
            <span style={{ color: '#FF9900' }}>20d ago</span> · Architecture review (gate 1/4) ✓
          </li>
          <li>
            <span style={{ color: '#5F6B7A' }}>22d ago</span> · EventBridge fired · agent intake
          </li>
        </ul>
      </SidebarCard>
    </aside>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border" style={{ borderColor: '#D5DBDB' }}>
      <div
        className="px-3 py-2 border-b flex items-center justify-between"
        style={{ borderColor: '#EAEDED', background: '#FAFBFC' }}
      >
        <p className="text-[12px] font-semibold" style={{ color: '#0F1B2A' }}>
          {title}
        </p>
        <BarChart3 className="w-3 h-3" style={{ color: '#5F6B7A' }} />
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: '#5F6B7A' }}>{label}</span>
      <span style={{ color: '#0F1B2A' }}>{children}</span>
    </div>
  );
}

function Out({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: '#414D5C' }}>{k}</span>
      <span className="truncate" style={{ color: '#0972D3' }}>{v}</span>
    </div>
  );
}
