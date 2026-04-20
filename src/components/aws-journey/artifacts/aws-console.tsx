'use client';

import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Search,
  Settings,
  Star,
} from 'lucide-react';
import { MacBookFrame } from './macbook-frame';

/**
 * Pixel-leaning recreation of the AWS Console "Service home" view, scoped
 * to the OrdersService production stack. Wrapped in a MacBook + browser
 * chrome so the receipt reads as "this is the real console."
 */
export function AwsConsoleArtifact() {
  return (
    <MacBookFrame
      url="us-east-1.console.aws.amazon.com/console/home?region=us-east-1"
      tabTitle="AWS Console — orders-prod"
      browser="chrome"
    >
      <div className="bg-[#F2F3F3]">
        {/* Top dark navbar */}
        <div className="flex items-center gap-3 bg-[#232F3E] px-4 py-2 text-[12px] text-white">
          <AwsLogo />
          <span className="font-semibold">Console Home</span>
          <div className="ml-3 hidden items-center gap-1 text-white/70 md:flex">
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Search for services, features, blogs, docs, and more</span>
            <span className="ml-2 rounded-sm border border-white/30 px-1 py-0 font-mono text-[9.5px]">[Option+S]</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-white/85">
            <span className="hidden text-[11px] md:inline">m.chen @ acme-prod</span>
            <Bell className="h-3.5 w-3.5" />
            <span className="inline-flex items-center gap-1 rounded-sm border border-white/20 px-1.5 py-0.5 text-[10.5px]">
              <Globe className="h-3 w-3" /> N. Virginia <span className="opacity-60">us-east-1</span>
            </span>
            <Settings className="h-3.5 w-3.5" />
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Light secondary nav */}
        <div className="flex items-center gap-3 border-b border-[#D5DBDB] bg-white px-4 py-1.5 text-[11.5px] text-[#16191F]">
          <span className="opacity-70">Services</span>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <span className="opacity-70">Compute</span>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <span className="font-semibold">Lambda</span>
          <span className="ml-3 text-[#0073BB]">orders-prod</span>
          <Star className="ml-auto h-3.5 w-3.5 text-[#FF9900]" />
        </div>

        {/* Page body */}
        <div className="px-5 py-4">
          {/* Title + breadcrumb */}
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#536067]">orders-prod · us-east-1</div>
              <h1 className="text-[20px] font-bold text-[#16191F]">OrdersService — production</h1>
            </div>
            <div className="text-right text-[11px] text-[#536067]">
              <div>Stack ID</div>
              <code className="font-mono text-[11.5px] text-[#16191F]">orders-prod-001</code>
            </div>
          </div>

          {/* Resource tiles (real AWS service brand colors) */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ResourceTile
              service="Lambda"
              accent="#FF9900"
              metric="6 functions"
              sub="55 ms avg duration"
              status="Healthy"
            />
            <ResourceTile
              service="Aurora Serverless v2"
              accent="#3B48CC"
              metric="orders-prod"
              sub="0.5–4 ACU · encrypted"
              status="Available"
            />
            <ResourceTile
              service="API Gateway"
              accent="#A166FF"
              metric="orders-api"
              sub="PRIVATE · 12.8k req/hr"
              status="Healthy"
            />
            <ResourceTile
              service="Secrets Manager"
              accent="#DD344C"
              metric="2 secrets"
              sub="KMS · rotated 24h"
              status="OK"
            />
          </div>

          {/* Three info panels */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Panel title="CloudWatch · OrdersService" tag="last 24h">
              <MetricLine label="Invocations" value="324,018" />
              <MetricLine label="Errors" value="0" good />
              <MetricLine label="p99 latency" value="340 ms" good />
              <MetricLine label="Cold starts" value="2,401" sub="(prov-concurrency: 2)" />
              <MiniSparkline />
            </Panel>

            <Panel title="Cost Explorer · this month" tag="USD">
              <MetricLine label="Lambda" value="$124" />
              <MetricLine label="Aurora" value="$298" />
              <MetricLine label="API Gateway" value="$87" />
              <MetricLine label="Provisioned concurrency" value="$18" sub="R. Davis-approved" />
              <div className="mt-1.5 flex items-baseline justify-between border-t border-[#EAEDED] pt-1.5">
                <span className="text-[11.5px] font-semibold text-[#16191F]">Total</span>
                <span className="font-mono text-[14px] font-bold text-[#1A7F37]">$527 / mo</span>
              </div>
              <div className="text-[10.5px] text-[#536067]">vs $70k/mo monolith allocation</div>
            </Panel>

            <Panel title="Compliance · Security Hub" tag="CIS">
              <ComplianceRow label="IAM least-privilege" />
              <ComplianceRow label="VPC isolation" />
              <ComplianceRow label="Encryption at rest" />
              <ComplianceRow label="CIS AWS Foundations §3.1" />
              <ComplianceRow label="Access Analyzer" sub="0 findings" />
            </Panel>
          </div>

          {/* Footer banner — like the real Console's recently-visited strip */}
          <div className="mt-4 flex items-start gap-2 rounded-md border border-[#EAEDED] bg-[#F2F3F3] px-3 py-2 text-[11.5px] text-[#16191F]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0073BB]" />
            <div>
              <span className="font-semibold">No active alarms.</span> Last cutover at 14:02 UTC on Day 21. Hyper-care closed at Day 23 with 0 P1/P2 incidents.
            </div>
          </div>
        </div>
      </div>
    </MacBookFrame>
  );
}

function AwsLogo() {
  // Simplified AWS smile mark — readable at this size, stays on-brand.
  return (
    <span className="inline-flex items-center gap-1">
      <svg viewBox="0 0 80 48" className="h-5 w-9" aria-hidden>
        <text
          x="0"
          y="28"
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="22"
          fill="#FFFFFF"
        >
          aws
        </text>
        <path d="M2 42 Q40 50 78 42" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ResourceTile({
  service,
  accent,
  metric,
  sub,
  status,
}: {
  service: string;
  accent: string;
  metric: string;
  sub: string;
  status: string;
}) {
  return (
    <div className="rounded-md border border-[#D5DBDB] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center gap-2">
        <span
          className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm"
          style={{ background: accent }}
          aria-hidden
        />
        <span className="truncate text-[11.5px] font-semibold text-[#0073BB]">{service}</span>
      </div>
      <div className="text-[15px] font-bold text-[#16191F]">{metric}</div>
      <div className="text-[11px] text-[#536067]">{sub}</div>
      <div className="mt-1 inline-flex items-center gap-1 rounded-sm bg-[#E6F4EA] px-1.5 py-0.5 text-[10px] font-semibold text-[#1A7F37]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1A7F37]" /> {status}
      </div>
    </div>
  );
}

function Panel({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[#D5DBDB] bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between border-b border-[#EAEDED] pb-1.5">
        <span className="text-[11.5px] font-semibold text-[#16191F]">{title}</span>
        {tag && <span className="text-[10px] uppercase tracking-wider text-[#536067]">{tag}</span>}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MetricLine({
  label,
  value,
  good,
  sub,
}: {
  label: string;
  value: string;
  good?: boolean;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12px]">
      <span className="text-[#536067]">{label}</span>
      <span className={`font-mono font-semibold ${good ? 'text-[#1A7F37]' : 'text-[#16191F]'}`}>
        {value}
        {sub && <span className="ml-1 text-[10px] font-normal text-[#536067]">{sub}</span>}
      </span>
    </div>
  );
}

function ComplianceRow({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12px]">
      <span className="text-[#16191F]">{label}</span>
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1A7F37]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1A7F37]" /> Pass
        {sub && <span className="ml-1 font-normal text-[#536067]">· {sub}</span>}
      </span>
    </div>
  );
}

function MiniSparkline() {
  // Stylized p99 trace — green band with a gentle cold-start hump.
  return (
    <svg viewBox="0 0 200 40" className="mt-1 h-9 w-full">
      <defs>
        <linearGradient id="aws-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1A7F37" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1A7F37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 32 L20 30 L40 31 L60 28 L80 22 L90 14 L100 22 L120 28 L140 30 L160 29 L180 30 L200 31 L200 40 L0 40 Z"
        fill="url(#aws-spark)"
      />
      <path
        d="M0 32 L20 30 L40 31 L60 28 L80 22 L90 14 L100 22 L120 28 L140 30 L160 29 L180 30 L200 31"
        stroke="#1A7F37"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}
