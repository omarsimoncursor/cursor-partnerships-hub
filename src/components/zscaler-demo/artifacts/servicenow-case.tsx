'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  FileText,
  GitPullRequest,
  Globe2,
  History,
  Link2,
  LockKeyhole,
  MoreHorizontal,
  PanelLeft,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow,
  X,
} from 'lucide-react';

interface ServiceNowCaseProps {
  onClose: () => void;
}

const ACTIVITY = [
  {
    who: 'Cursor Background Agent',
    time: '14:23:57',
    body: 'Opened PR #213 with HCL diff, terraform plan (~1 / +0 / -0), tfsec/checkov output, and 4-row ZPA conformance probe. Assignment group moved to Platform Security for review.',
    tone: 'blue',
  },
  {
    who: 'Zscaler ZPA Integration',
    time: '14:21:43',
    body: 'Risk event evt-21794 created. workforce-admin-audit-logs access rule is missing SCIM_GROUP, POSTURE, TRUSTED_NETWORK, and CLIENT_TYPE conditions. Scope: 4,287 users vs intent 18.',
    tone: 'amber',
  },
  {
    who: 'Okta Integration',
    time: '14:21:49',
    body: 'Resolved least-privilege intent: security-admin (12 users) + compliance-officer (6 users). No other groups approved for audit-log access.',
    tone: 'green',
  },
] as const;

const PLAYBOOK = [
  { label: 'Validate ZPA risk event', status: 'complete' },
  { label: 'Resolve IaC owner from app-segment tags', status: 'complete' },
  { label: 'Reconcile Okta SCIM groups', status: 'complete' },
  { label: 'Generate Terraform remediation PR', status: 'complete' },
  { label: 'Security owner reviews PR', status: 'active' },
  { label: 'Atlantis apply on merge', status: 'pending' },
] as const;

export function ServiceNowCase({ onClose }: ServiceNowCaseProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-7xl max-h-[92vh] rounded-xl border border-[#243746] bg-[#0B1F2A] overflow-hidden flex flex-col shadow-2xl">
        <TopChrome onClose={onClose} />
        <WorkspaceShell />
      </div>
    </div>
  );
}

function TopChrome({ onClose }: { onClose: () => void }) {
  return (
    <div className="shrink-0">
      <div className="h-10 bg-[#032D42] border-b border-[#1B4658] flex items-center px-3 gap-3">
        <div className="w-7 h-7 rounded-md bg-[#81B5A1] flex items-center justify-center">
          <span className="text-[#032D42] text-[13px] font-black">N</span>
        </div>
        <span className="text-white text-[13px] font-semibold">ServiceNow</span>
        <span className="text-[#A8C3CE] text-xs">/</span>
        <span className="text-[#D7E4EA] text-xs font-medium">Security Operations Workspace</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-6 w-[300px] rounded bg-[#062437] border border-[#255064] flex items-center gap-2 px-2">
            <Search className="w-3.5 h-3.5 text-[#A8C3CE]" />
            <span className="text-[11px] text-[#A8C3CE] font-mono">
              Search incidents, observables, assets
            </span>
          </div>
          <button className="h-7 px-2 rounded text-[11px] text-[#D7E4EA] bg-[#0D3A4F] border border-[#255064]">
            Update set: zpa-remediation
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#0D3A4F] text-[#A8C3CE] hover:text-white transition-colors cursor-pointer"
            aria-label="Close ServiceNow workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="h-9 bg-[#082536] border-b border-[#1B4658] flex items-center px-4 gap-4 text-[12px] text-[#D7E4EA]">
        <NavItem active label="Security Incidents" />
        <NavItem label="Vulnerability Response" />
        <NavItem label="Threat Intelligence" />
        <NavItem label="Playbooks" />
        <NavItem label="Dashboards" />
        <NavItem label="Reports" />
      </div>
    </div>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`h-full px-1 border-b-2 ${
        active ? 'border-[#81B5A1] text-white font-semibold' : 'border-transparent text-[#A8C3CE]'
      }`}
    >
      {label}
    </button>
  );
}

function WorkspaceShell() {
  return (
    <div className="flex-1 min-h-0 grid grid-cols-[56px_1fr] overflow-hidden">
      <Rail />
      <div className="min-w-0 overflow-y-auto bg-[#F4F6F7] text-[#1F2A30]">
        <CaseHeader />
        <div className="px-6 pb-6 grid grid-cols-[1fr_340px] gap-5">
          <main className="min-w-0 space-y-5">
            <SummaryCards />
            <RiskAndEvidence />
            <ActivityStream />
          </main>
          <aside className="space-y-5">
            <AssignmentCard />
            <PlaybookCard />
            <RelatedRecords />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Rail() {
  const items = [
    PanelLeft,
    ShieldAlert,
    Activity,
    Workflow,
    FileText,
    History,
    UserRound,
  ];
  return (
    <div className="bg-[#062437] border-r border-[#1B4658] py-3 flex flex-col items-center gap-2">
      {items.map((Icon, i) => (
        <button
          key={i}
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            i === 1 ? 'bg-[#81B5A1] text-[#032D42]' : 'text-[#A8C3CE] hover:bg-[#0D3A4F]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

function CaseHeader() {
  return (
    <div className="bg-white border-b border-[#D6DDE2] px-6 py-5 mb-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F7D7D7] border border-[#F2B8B8] flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-[#B42318]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-[#31596B]">SIR0005712</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FDECEC] text-[#B42318] text-[11px] font-semibold border border-[#F2B8B8]">
              Critical
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E6F3EE] text-[#176B4D] text-[11px] font-semibold border border-[#BBDCCE]">
              In Review
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#1F2A30] leading-tight">
            ZPA access rule under-conditioned for workforce-admin-audit-logs
          </h1>
          <p className="text-[13px] text-[#5C6F7A] mt-1">
            Zscaler risk event evt-21794 identified a Terraform-managed ALLOW rule with only an APP condition.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded border border-[#C8D3DA] bg-white text-[12px] font-medium text-[#31596B] flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            Link record
          </button>
          <button className="h-8 px-3 rounded bg-[#0B5D7A] text-white text-[12px] font-semibold">
            Resolve after merge
          </button>
          <button className="h-8 w-8 rounded border border-[#C8D3DA] bg-white flex items-center justify-center text-[#5C6F7A]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCards() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Metric title="Risk score" value="92 / 100" sub="Critical" tone="red" />
      <Metric title="Users in scope" value="4,287" sub="Intent: 18" tone="amber" />
      <Metric title="Probe status" value="3 / 4 fail" sub="Deny-by-default broken" tone="red" />
      <Metric title="Cursor status" value="PR open" sub="#213 awaiting review" tone="green" />
    </div>
  );
}

function Metric({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  tone: 'red' | 'amber' | 'green';
}) {
  const toneStyles = {
    red: 'text-[#B42318] bg-[#FDECEC] border-[#F2B8B8]',
    amber: 'text-[#8A5A00] bg-[#FFF5DB] border-[#EBD59B]',
    green: 'text-[#176B4D] bg-[#E6F3EE] border-[#BBDCCE]',
  }[tone];
  return (
    <div className={`rounded-lg border bg-white p-4 ${toneStyles}`}>
      <p className="text-[11px] uppercase tracking-wider font-semibold opacity-80">{title}</p>
      <p className="text-[24px] font-bold mt-1 leading-none">{value}</p>
      <p className="text-[12px] mt-2 opacity-80">{sub}</p>
    </div>
  );
}

function RiskAndEvidence() {
  return (
    <div className="rounded-lg bg-white border border-[#D6DDE2] overflow-hidden">
      <SectionHeader icon={<Sparkles className="w-4 h-4" />} title="Agent-generated evidence packet" />
      <div className="p-5 grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          <EvidenceRow
            icon={<ShieldAlert className="w-4 h-4" />}
            label="Zscaler event"
            value="evt-21794 · workforce-admin-audit-logs · score 92"
          />
          <EvidenceRow
            icon={<Code2 className="w-4 h-4" />}
            label="IaC source"
            value="infrastructure/zscaler/workforce-admin.tf · zscaler/zpa ~> 4.4"
          />
          <EvidenceRow
            icon={<GitPullRequest className="w-4 h-4" />}
            label="Remediation PR"
            value="#213 · sec/scope-down-workforce-admin-zpa · terraform plan attached"
          />
          <EvidenceRow
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Verification"
            value="terraform validate ✓ · plan ~1/+0/-0 · conformance 4/4 after patch"
          />
        </div>
        <div className="rounded-lg bg-[#F7FAFB] border border-[#D6DDE2] p-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#5C6F7A] mb-3">
            Scope reduction
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[22px] font-bold text-[#B42318]">4,287</span>
            <ArrowRight className="w-5 h-5 text-[#8DA1AD]" />
            <span className="font-mono text-[22px] font-bold text-[#176B4D]">18</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#E7ECEF] overflow-hidden">
            <div className="h-full w-[8%] bg-[#81B5A1]" />
          </div>
          <p className="text-[12px] text-[#5C6F7A] mt-3">
            238.2x narrower. Unmanaged-device paths closed: 1 → 0.
          </p>
        </div>
      </div>
    </div>
  );
}

function EvidenceRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#EAF2F5] text-[#0B5D7A] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[#6C7F89] font-semibold">{label}</p>
        <p className="text-[13px] text-[#1F2A30] font-medium">{value}</p>
      </div>
    </div>
  );
}

function ActivityStream() {
  return (
    <div className="rounded-lg bg-white border border-[#D6DDE2] overflow-hidden">
      <SectionHeader icon={<History className="w-4 h-4" />} title="Activity stream" />
      <div className="divide-y divide-[#E2E8EC]">
        {ACTIVITY.map(item => (
          <div key={item.who} className="p-4 flex gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                item.tone === 'blue'
                  ? 'bg-[#EAF2F5] text-[#0B5D7A]'
                  : item.tone === 'amber'
                    ? 'bg-[#FFF5DB] text-[#8A5A00]'
                    : 'bg-[#E6F3EE] text-[#176B4D]'
              }`}
            >
              {item.tone === 'blue' ? <Sparkles className="w-4 h-4" /> : item.tone === 'amber' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-[#1F2A30]">{item.who}</span>
                <span className="text-[12px] text-[#7A8D97]">· {item.time} PDT</span>
              </div>
              <p className="text-[13px] text-[#4D626D] leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentCard() {
  return (
    <div className="rounded-lg bg-white border border-[#D6DDE2] overflow-hidden">
      <SectionHeader icon={<UserRound className="w-4 h-4" />} title="Assignment" compact />
      <div className="p-4 space-y-3 text-[13px]">
        <Field label="Assignment group" value="Platform Security" />
        <Field label="Assigned to" value="Cursor Background Agent" />
        <Field label="Business service" value="Workforce Admin" />
        <Field label="Configuration item" value="ZPA app segment · workforce-admin-audit-logs" />
        <Field label="State" value="In Review" pill="green" />
        <Field label="Priority" value="1 - Critical" pill="red" />
      </div>
    </div>
  );
}

function PlaybookCard() {
  return (
    <div className="rounded-lg bg-white border border-[#D6DDE2] overflow-hidden">
      <SectionHeader icon={<Workflow className="w-4 h-4" />} title="Response playbook" compact />
      <div className="p-4 space-y-3">
        {PLAYBOOK.map((step, i) => (
          <div key={step.label} className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.status === 'complete'
                  ? 'bg-[#E6F3EE] text-[#176B4D]'
                  : step.status === 'active'
                    ? 'bg-[#EAF2F5] text-[#0B5D7A] ring-2 ring-[#BFD7E2]'
                    : 'bg-[#EEF2F4] text-[#7A8D97]'
              }`}
            >
              {step.status === 'complete' ? '✓' : i + 1}
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#1F2A30]">{step.label}</p>
              <p className="text-[11px] text-[#7A8D97] capitalize">{step.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedRecords() {
  return (
    <div className="rounded-lg bg-white border border-[#D6DDE2] overflow-hidden">
      <SectionHeader icon={<Globe2 className="w-4 h-4" />} title="Related records" compact />
      <div className="p-4 space-y-2 text-[13px]">
        <Related label="ZPA risk event" value="evt-21794" tone="red" />
        <Related label="GitHub PR" value="#213 · scope-down-workforce-admin-zpa" tone="green" />
        <Related label="Terraform plan" value="tfplan · ~1 / +0 / -0" tone="green" />
        <Related label="Okta groups" value="security-admin, compliance-officer" tone="blue" />
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`border-b border-[#D6DDE2] bg-[#FBFCFD] flex items-center justify-between ${
        compact ? 'px-4 py-3' : 'px-5 py-3'
      }`}
    >
      <div className="flex items-center gap-2 text-[#31596B]">
        {icon}
        <p className="text-[12px] font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <ChevronDown className="w-3.5 h-3.5 text-[#7A8D97]" />
    </div>
  );
}

function Field({
  label,
  value,
  pill,
}: {
  label: string;
  value: string;
  pill?: 'green' | 'red';
}) {
  const pillClass =
    pill === 'green'
      ? 'bg-[#E6F3EE] text-[#176B4D] border-[#BBDCCE]'
      : pill === 'red'
        ? 'bg-[#FDECEC] text-[#B42318] border-[#F2B8B8]'
        : '';
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-[#7A8D97] font-semibold mb-1">
        {label}
      </p>
      {pill ? (
        <span className={`inline-flex px-2 py-1 rounded border text-[12px] font-semibold ${pillClass}`}>
          {value}
        </span>
      ) : (
        <p className="text-[#1F2A30] font-medium">{value}</p>
      )}
    </div>
  );
}

function Related({ label, value, tone }: { label: string; value: string; tone: 'red' | 'green' | 'blue' }) {
  const dot =
    tone === 'red' ? 'bg-[#B42318]' : tone === 'green' ? 'bg-[#176B4D]' : 'bg-[#0B5D7A]';
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <div className="min-w-0">
        <p className="text-[11px] text-[#7A8D97]">{label}</p>
        <p className="text-[13px] text-[#0B5D7A] font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
