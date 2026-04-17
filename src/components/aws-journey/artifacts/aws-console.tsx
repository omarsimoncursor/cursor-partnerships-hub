'use client';

import { Activity, Database, Lock, Server, ShieldCheck } from 'lucide-react';

export function AwsConsoleArtifact() {
  return (
    <div className="bg-[#F3F4F6] p-5 text-[#232F3E]">
      <header className="mb-4 flex items-center justify-between rounded-md bg-[#232F3E] px-4 py-2 text-white">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#FF9900] text-xs font-bold text-[#232F3E]">
            aws
          </span>
          <span className="font-semibold">Console Home</span>
          <span className="opacity-60">· us-east-1 · acme-prod</span>
        </div>
        <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px]">orders-prod-001</span>
      </header>

      <div className="grid grid-cols-4 gap-3">
        <Tile icon={<Server className="h-4 w-4" />} name="Lambda" metric="6 functions" sub="55ms avg duration" accent="#FF9900" />
        <Tile icon={<Database className="h-4 w-4" />} name="Aurora Serverless v2" metric="1 cluster" sub="0.5–4 ACU · encrypted" accent="#16A34A" />
        <Tile icon={<Activity className="h-4 w-4" />} name="API Gateway" metric="orders-api" sub="PRIVATE endpoint · 12.8k req/hr" accent="#2563EB" />
        <Tile icon={<Lock className="h-4 w-4" />} name="Secrets Manager" metric="2 secrets" sub="KMS encrypted · rotated 24h" accent="#7E22CE" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Panel title="CloudWatch · OrdersService">
          <MetricLine label="Invocations (24h)" value="324,018" good />
          <MetricLine label="Errors (24h)" value="0" good />
          <MetricLine label="p99 latency" value="340 ms" good />
          <MetricLine label="Cold starts" value="2,401" sub="(prov-concurrency: 2)" />
        </Panel>

        <Panel title="Cost (this month)">
          <MetricLine label="Lambda" value="$124" />
          <MetricLine label="Aurora" value="$298" />
          <MetricLine label="API Gateway" value="$87" />
          <MetricLine label="Provisioned concurrency" value="$18" sub="R. Davis-approved" />
          <div className="mt-2 border-t pt-2 text-sm font-semibold text-[#16A34A]">Total: $527 / mo</div>
        </Panel>

        <Panel title="Compliance">
          <ComplianceRow label="IAM least-privilege" status="ok" />
          <ComplianceRow label="VPC isolation" status="ok" />
          <ComplianceRow label="Encryption at rest" status="ok" />
          <ComplianceRow label="CIS AWS Foundations" status="ok" />
          <ComplianceRow label="Access Analyzer" status="ok" sub="0 findings" />
        </Panel>
      </div>
    </div>
  );
}

function Tile({ icon, name, metric, sub, accent }: { icon: React.ReactNode; name: string; metric: string; sub: string; accent: string }) {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
        {icon}
        {name}
      </div>
      <div className="text-lg font-bold text-[#111827]">{metric}</div>
      <div className="text-[11px] text-[#6B7280]">{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MetricLine({ label, value, good, sub }: { label: string; value: string; good?: boolean; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12px]">
      <span className="text-[#6B7280]">{label}</span>
      <span className={`font-mono font-semibold ${good ? 'text-[#16A34A]' : 'text-[#111827]'}`}>
        {value}
        {sub && <span className="ml-1 text-[10px] font-normal text-[#6B7280]">{sub}</span>}
      </span>
    </div>
  );
}

function ComplianceRow({ label, status, sub }: { label: string; status: 'ok' | 'warn'; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12px]">
      <span className="flex items-center gap-1.5 text-[#111827]">
        <ShieldCheck className="h-3 w-3" style={{ color: status === 'ok' ? '#16A34A' : '#F59E0B' }} />
        {label}
      </span>
      <span className="text-[11px] text-[#16A34A]">
        ✓ {sub ?? 'pass'}
      </span>
    </div>
  );
}
