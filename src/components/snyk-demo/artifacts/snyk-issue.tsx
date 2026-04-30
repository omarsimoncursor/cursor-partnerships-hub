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
  Code as CodeIcon,
  Package,
  Box,
  Cloud,
  GitBranch,
  ShieldAlert,
  Tag,
  Eye,
  AlertTriangle,
  ArrowRight,
  Check,
  ExternalLink,
} from 'lucide-react';

const ISSUE_ID = 'SNYK-JS-CUSTOMER-PROFILE-001';

export function SnykIssue() {
  return (
    <div
      className="w-full h-full overflow-y-auto font-sans"
      style={{ background: '#0E0F2C', color: '#E5E5F5' }}
    >
      <TopNav />
      <SubNav />
      <div className="grid grid-cols-[200px_1fr_320px]">
        <LeftSidebar />
        <div className="min-w-0" style={{ borderLeft: '1px solid #23264F', borderRight: '1px solid #23264F' }}>
          <IssueHeader />
          <SeverityBar />
          <TabBar />
          <CodePathTab />
          <FixSection />
        </div>
        <RightSidebar />
      </div>

      <BottomBar />
    </div>
  );
}

// ---------------- Top nav ----------------

function TopNav() {
  return (
    <header
      className="h-12 flex items-center gap-3 px-3 border-b"
      style={{ background: '#0A0B23', borderColor: '#23264F' }}
    >
      <div className="flex items-center gap-2.5 px-2">
        <SnykMark />
        <span className="text-[13px] font-semibold text-white">cursor-demos</span>
        <ChevronDown className="w-3 h-3 text-[#9F98FF]" />
      </div>

      <div className="h-5 w-px" style={{ background: '#23264F' }} />

      <button
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] hover:bg-[#1A1C40]"
        style={{ color: '#C9C9E5' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#9F98FF]" />
        project: <span className="font-mono">cursor-for-enterprise</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      <div className="flex-1 max-w-2xl">
        <div
          className="flex items-center gap-2 px-3 h-7 rounded"
          style={{ background: '#13142F', border: '1px solid #23264F' }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: '#7C7CA0' }} />
          <span className="text-[12px] font-mono" style={{ color: '#7C7CA0' }}>
            severity:critical type:code @issue:{ISSUE_ID}
          </span>
          <span className="ml-auto text-[10px] font-mono" style={{ color: '#5A5A78' }}>⌘K</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NavIconButton icon={<Bell className="w-4 h-4" />} />
        <NavIconButton icon={<HelpCircle className="w-4 h-4" />} />
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: '#4C44CB' }}
        >
          O
        </div>
      </div>
    </header>
  );
}

function NavIconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1A1C40] hover:text-white" style={{ color: '#7C7CA0' }}>
      {icon}
    </button>
  );
}

function SnykMark() {
  // Stylized wolf-mark glyph evoking the Snyk logo without copying it.
  return (
    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#4C44CB' }}>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
        <path d="M12 2L4 7v6c0 4.42 3.04 8.5 8 9 4.96-.5 8-4.58 8-9V7l-8-5zm-2 7.5l2-1.25 2 1.25v3.5l-2 1.25-2-1.25V9.5z" />
      </svg>
    </div>
  );
}

// ---------------- Sub nav ----------------

function SubNav() {
  return (
    <div
      className="h-10 flex items-center gap-0 px-3 text-[12px] border-b"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      <Crumb label="Projects" />
      <Chevron />
      <Crumb label="cursor-for-enterprise" />
      <Chevron />
      <Crumb label="Issues" />
      <Chevron />
      <span className="px-2 font-mono" style={{ color: '#9F98FF' }}>{ISSUE_ID}</span>

      <div className="ml-auto flex items-center gap-1.5">
        <SmallButton icon={<Star className="w-3.5 h-3.5" />} label="Watch" />
        <SmallButton icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
        <SmallButton icon={<MoreHorizontal className="w-3.5 h-3.5" />} />
      </div>
    </div>
  );
}

function Crumb({ label }: { label: string }) {
  return (
    <button className="px-2 py-1 rounded hover:bg-[#1A1C40]" style={{ color: '#C9C9E5' }}>
      {label}
    </button>
  );
}

function Chevron() {
  return <ChevronRight className="w-3 h-3" style={{ color: '#5A5A78' }} />;
}

function SmallButton({ icon, label }: { icon: React.ReactNode; label?: string }) {
  return (
    <button
      className="h-6 px-2 rounded text-[11.5px] flex items-center gap-1 border hover:bg-[#1A1C40]"
      style={{ background: '#13142F', borderColor: '#23264F', color: '#C9C9E5' }}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------- Left sidebar ----------------

const LEFT_NAV: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; count?: string; active?: boolean }> = [
  { label: 'Snyk Code', icon: CodeIcon, count: '1', active: true },
  { label: 'Snyk Open Source', icon: Package, count: '1' },
  { label: 'Snyk Container', icon: Box, count: '0' },
  { label: 'Snyk IaC', icon: Cloud, count: '0' },
];

function LeftSidebar() {
  return (
    <aside className="text-[12.5px] py-3" style={{ background: '#0A0B23' }}>
      <div className="px-3 mb-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
          Test types
        </p>
      </div>
      <nav className="space-y-0.5 px-2">
        {LEFT_NAV.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                item.active ? 'text-white' : 'hover:bg-[#1A1C40]'
              }`}
              style={{
                background: item.active ? '#1A1C40' : 'transparent',
                color: item.active ? '#FFFFFF' : '#C9C9E5',
              }}
            >
              <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-[#9F98FF]' : ''}`} />
              <span className="flex-1 truncate">{item.label}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{
                  background: item.active ? '#4C44CB' : '#1A1C40',
                  color: item.active ? '#FFFFFF' : '#7C7CA0',
                }}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 px-3 mb-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
          Filters
        </p>
      </div>
      <div className="space-y-1 px-2 text-[11.5px]">
        <SidebarFilter label="Critical" count="1" tone="red" active />
        <SidebarFilter label="High" count="1" tone="orange" />
        <SidebarFilter label="Medium" count="0" tone="amber" />
        <SidebarFilter label="Low" count="2" tone="blue" />
      </div>

      <div className="mt-6 px-3 mb-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
          Branches
        </p>
      </div>
      <div className="space-y-1 px-2 text-[11.5px]" style={{ color: '#C9C9E5' }}>
        <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: '#1A1C40' }}>
          <GitBranch className="w-3 h-3" style={{ color: '#9F98FF' }} />
          <span className="truncate">main</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1">
          <GitBranch className="w-3 h-3" />
          <span className="truncate">security/patch-customer-…</span>
        </div>
      </div>
    </aside>
  );
}

function SidebarFilter({
  label,
  count,
  tone,
  active,
}: {
  label: string;
  count: string;
  tone: 'red' | 'orange' | 'amber' | 'blue';
  active?: boolean;
}) {
  const dot =
    tone === 'red' ? '#E11D48' : tone === 'orange' ? '#F97316' : tone === 'amber' ? '#F59E0B' : '#4C9AFF';
  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-1 rounded text-left"
      style={{
        background: active ? '#1A1C40' : 'transparent',
        color: '#C9C9E5',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      <span className="flex-1">{label}</span>
      <span className="text-[10.5px] font-mono" style={{ color: '#7C7CA0' }}>{count}</span>
    </button>
  );
}

// ---------------- Issue header ----------------

function IssueHeader() {
  return (
    <div className="px-6 pt-5 pb-4" style={{ background: '#0E0F2C' }}>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"
          style={{ background: '#E11D48', color: 'white' }}
        >
          <ShieldAlert className="w-3 h-3" />
          CRITICAL
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{ background: '#1A1C40', color: '#9F98FF' }}
        >
          CWE-943
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{ background: '#1A1C40', color: '#9F98FF' }}
        >
          OWASP A03:2021
        </span>
        <span className="text-[12px] font-mono" style={{ color: '#7C7CA0' }}>
          · {ISSUE_ID}
        </span>
      </div>

      <h1 className="text-[22px] font-semibold text-white leading-tight mb-2">
        NoSQL Injection in customer profile lookup
      </h1>

      <div className="flex items-center gap-3 text-[12px] flex-wrap" style={{ color: '#9FA0BC' }}>
        <span className="font-mono">javascript</span>
        <span>·</span>
        <span className="font-mono">src/lib/demo/customer-profile.ts:24</span>
        <span>·</span>
        <span>Introduced 11 days ago</span>
        <span>·</span>
        <span className="font-mono">commit 5e9d3c2</span>
        <span>·</span>
        <span
          className="px-1.5 py-0.5 rounded text-[10.5px] font-mono"
          style={{ background: 'rgba(76,68,203,0.15)', border: '1px solid rgba(76,68,203,0.30)', color: '#9F98FF' }}
        >
          fix from cursor-sdk run · run-9a4d3f17…
        </span>
        <button
          className="ml-auto h-7 px-3 rounded text-[11.5px] flex items-center gap-1 border"
          style={{ background: '#13142F', borderColor: '#23264F', color: '#C9C9E5' }}
        >
          <Copy className="w-3 h-3" />
          <span className="font-mono">copy issue id</span>
        </button>
      </div>
    </div>
  );
}

function SeverityBar() {
  return (
    <div
      className="grid grid-cols-5 border-y"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      <StatusCell
        label="Severity"
        value={
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E11D48' }} />
            <span style={{ color: '#FB7185' }} className="font-medium">Critical</span>
          </span>
        }
      />
      <StatusCell label="CVSS" value={<span className="font-mono font-semibold" style={{ color: '#FB7185' }}>9.8</span>} />
      <StatusCell label="Exploit" value={<span style={{ color: '#FBBF24' }} className="text-[12px]">Functional</span>} />
      <StatusCell label="Status" value={<span style={{ color: '#FBBF24' }} className="text-[12px]">Open · in review</span>} />
      <StatusCell
        label="Auto-fix"
        value={
          <span style={{ color: '#4ADE80' }} className="flex items-center gap-1 text-[12px]">
            <Check className="w-3 h-3" /> PR #214 ready
          </span>
        }
      />
    </div>
  );
}

function StatusCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="px-5 py-3 border-r"
      style={{ borderColor: '#23264F' }}
    >
      <p className="text-[10.5px] uppercase tracking-wider mb-1" style={{ color: '#7C7CA0' }}>{label}</p>
      <div className="text-[13px] text-white">{value}</div>
    </div>
  );
}

// ---------------- Tab bar ----------------

function TabBar() {
  const tabs: Array<{ label: string; count?: string; active?: boolean }> = [
    { label: 'Overview' },
    { label: 'Code path', active: true },
    { label: 'Fix' },
    { label: 'Activity', count: '6' },
    { label: 'Ignore' },
  ];
  return (
    <div
      className="flex items-center px-5 gap-0 border-b text-[12.5px]"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      {tabs.map(t => (
        <button
          key={t.label}
          className="flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap"
          style={{
            borderColor: t.active ? '#9F98FF' : 'transparent',
            color: t.active ? '#FFFFFF' : '#9FA0BC',
            fontWeight: t.active ? 500 : 400,
          }}
        >
          {t.label}
          {t.count && (
            <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: '#1A1C40', color: '#7C7CA0' }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2 py-2">
        <button
          className="h-6 px-2 rounded text-[11px] flex items-center gap-1 border"
          style={{ background: '#13142F', borderColor: '#23264F', color: '#C9C9E5' }}
        >
          <Eye className="w-3 h-3" />
          View options
        </button>
      </div>
    </div>
  );
}

// ---------------- Code path tab ----------------

const CODE_LINES: Array<{ lineNo: number; text: string; tone?: 'tainted' | 'sink' | 'normal' }> = [
  { lineNo: 16, text: 'export interface ProfileQuery {' },
  { lineNo: 17, text: '  username: string;' },
  { lineNo: 18, text: '}' },
  { lineNo: 19, text: '' },
  { lineNo: 20, text: 'export function lookupCustomerProfile(query: ProfileQuery): CustomerRecord[] {' },
  { lineNo: 21, text: '  // 🔴 tainted: query.username flows from user input', tone: 'normal' },
  { lineNo: 22, text: '  const tainted = `{ "username": "${query.username}" }`;', tone: 'tainted' },
  { lineNo: 23, text: '  const selector = parseSelector(tainted);', tone: 'normal' },
  { lineNo: 24, text: '  return CUSTOMERS.filter(record => matchesSelector(record, selector));', tone: 'sink' },
  { lineNo: 25, text: '}' },
];

const TAINT_FLOW: Array<{ step: number; label: string; location: string; kind: 'source' | 'flow' | 'sink' }> = [
  { step: 1, label: 'Tainted source', location: 'app/api/customer-profile/lookup/route.ts:14 — request.nextUrl.searchParams.get(\'username\')', kind: 'source' },
  { step: 2, label: 'Propagates into', location: 'lookupCustomerProfile({ username }) — typed as ProfileQuery', kind: 'flow' },
  { step: 3, label: 'String-interpolated into selector', location: 'src/lib/demo/customer-profile.ts:22 — `{ "username": "${query.username}" }`', kind: 'flow' },
  { step: 4, label: 'Sink: predicate evaluation', location: 'src/lib/demo/customer-profile.ts:24 — CUSTOMERS.filter(matchesSelector)', kind: 'sink' },
];

function CodePathTab() {
  return (
    <div className="px-6 py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
        {/* Code frame */}
        <div className="rounded-md border overflow-hidden" style={{ borderColor: '#23264F', background: '#0A0B23' }}>
          <div
            className="px-3 py-2 text-[11.5px] font-mono flex items-center justify-between border-b"
            style={{ background: '#13142F', borderColor: '#23264F', color: '#9FA0BC' }}
          >
            <span className="truncate">src/lib/demo/customer-profile.ts</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E11D48' }} />
              <span style={{ color: '#FB7185' }}>1 issue · line 22</span>
            </span>
          </div>
          <div className="font-mono text-[12px] leading-relaxed">
            {CODE_LINES.map(line => {
              const lineBg =
                line.tone === 'tainted'
                  ? 'bg-[#E11D48]/10 border-l-2 border-[#E11D48]'
                  : line.tone === 'sink'
                    ? 'bg-[#FBBF24]/5 border-l-2 border-[#FBBF24]'
                    : 'border-l-2 border-transparent';
              const text =
                line.tone === 'tainted' ? '#FB7185' : line.tone === 'sink' ? '#FBBF24' : '#C9C9E5';
              return (
                <div key={line.lineNo} className={`flex items-baseline ${lineBg} pr-3`}>
                  <span
                    className="w-10 shrink-0 text-right pr-3 select-none"
                    style={{ color: '#5A5A78' }}
                  >
                    {line.lineNo}
                  </span>
                  <span style={{ color: text }} className="whitespace-pre">
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Taint flow */}
        <div className="rounded-md border" style={{ borderColor: '#23264F', background: '#0A0B23' }}>
          <div
            className="px-3 py-2 text-[11.5px] font-medium uppercase tracking-wider border-b"
            style={{ background: '#13142F', borderColor: '#23264F', color: '#9F98FF' }}
          >
            Data flow · 4 steps
          </div>
          <div className="p-3 space-y-3">
            {TAINT_FLOW.map(t => {
              const dotBg =
                t.kind === 'source' ? '#E11D48' : t.kind === 'sink' ? '#FBBF24' : '#9F98FF';
              return (
                <div key={t.step} className="flex gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: dotBg }}
                  >
                    {t.step}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] text-white">{t.label}</p>
                    <p className="font-mono text-[10.5px] mt-0.5 break-words" style={{ color: '#9FA0BC' }}>
                      {t.location}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reproducer */}
      <div className="mt-5 rounded-md border overflow-hidden" style={{ borderColor: '#E11D48', background: '#1A0E1F' }}>
        <div
          className="px-3 py-2 text-[11.5px] font-medium flex items-center gap-1.5 border-b"
          style={{ background: '#E11D48', borderColor: '#E11D48', color: 'white' }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Reproducer · functional exploit
        </div>
        <pre className="px-3 py-2.5 text-[12px] font-mono overflow-x-auto" style={{ color: '#FBCFD8' }}>
{`# Returns the entire customer table including hashed credentials
curl 'http://localhost:3000/api/customer-profile/lookup?username='\\
'%27%20%7C%7C%20%271%27%3D%3D%271'`}
        </pre>
      </div>
    </div>
  );
}

// ---------------- Fix section ----------------

function FixSection() {
  return (
    <div
      className="px-6 py-5 border-t"
      style={{ borderColor: '#23264F', background: '#0E0F2C' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: '#9F98FF' }}>
          Recommended fix · auto-applied by Cursor
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FixCard
          step="1"
          title="Parameterize the selector"
          detail="Pass the username as a value into parseSelector instead of interpolating it into the selector string."
        />
        <FixCard
          step="2"
          title="Allowlist the input"
          detail="Reject anything outside /^[a-zA-Z0-9_.-]{1,64}$/ with a typed ValidationError before hitting the store."
        />
        <FixCard
          step="3"
          title="Bump mongoose 5.13.7 → 5.13.20"
          detail="Resolves SNYK-JS-MONGOOSE-2961688 (prototype pollution). No breaking changes per the upstream advisory."
        />
        <FixCard
          step="4"
          title="Add regression test"
          detail="customer-profile.test.ts now asserts ValidationError is thrown for the canonical injection payload."
        />
      </div>
    </div>
  );
}

function FixCard({ step, title, detail }: { step: string; title: string; detail: string }) {
  return (
    <div className="rounded-md border p-3" style={{ borderColor: '#23264F', background: '#0A0B23' }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: '#4C44CB' }}
        >
          {step}
        </span>
        <p className="text-[13px] font-medium text-white">{title}</p>
      </div>
      <p className="text-[11.5px] leading-relaxed" style={{ color: '#9FA0BC' }}>
        {detail}
      </p>
    </div>
  );
}

// ---------------- Right sidebar ----------------

function RightSidebar() {
  return (
    <aside
      className="min-w-0 text-[12px]"
      style={{ background: '#0E0F2C', color: '#C9C9E5' }}
    >
      <SidebarHeader />

      <SidebarSection title="Issue info" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
        <KV k="issue id" v={ISSUE_ID} mono />
        <KV k="severity" v="Critical" highlight />
        <KV k="cvss" v="9.8" mono highlight />
        <KV k="cwe" v="CWE-943" mono />
        <KV k="owasp" v="A03:2021" mono />
        <KV k="exploit" v="Functional" />
      </SidebarSection>

      <SidebarSection title="Project" icon={<Package className="w-3.5 h-3.5" />}>
        <KV k="project" v="cursor-for-enterprise" mono />
        <KV k="branch" v="main" mono />
        <KV k="commit" v="5e9d3c2" mono />
        <KV k="introduced" v="11 days ago" />
        <KV k="lang" v="javascript" />
      </SidebarSection>

      <SidebarSection title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
        <div className="flex flex-wrap gap-1.5">
          <TagPill label="team:appsec" />
          <TagPill label="owner:platform" />
          <TagPill label="env:staging" />
          <TagPill label="exploitable" tone="red" />
          <TagPill label="auto-fix-available" tone="indigo" />
        </div>
      </SidebarSection>

      <SidebarSection title="Companion finding" icon={<Package className="w-3.5 h-3.5" />}>
        <div
          className="p-2 rounded border text-[11px] space-y-1"
          style={{ background: '#0A0B23', borderColor: '#23264F' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FBBF24' }} />
            <span className="font-semibold text-white">High</span>
            <span className="ml-auto font-mono" style={{ color: '#9FA0BC' }}>CVSS 7.5</span>
          </div>
          <div className="text-white">Prototype pollution in mongoose</div>
          <div className="font-mono" style={{ color: '#9FA0BC' }}>
            SNYK-JS-MONGOOSE-2961688 · 5.13.7 → 5.13.20
          </div>
          <div className="flex items-center gap-1" style={{ color: '#4ADE80' }}>
            <Check className="w-3 h-3" /> upgrade applied in PR #214
          </div>
        </div>
      </SidebarSection>

      <SidebarSection title="CWE-943" icon={<AlertTriangle className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />}>
        <p className="text-[11px] leading-relaxed" style={{ color: '#9FA0BC' }}>
          Improper Neutralization of Special Elements in Data Query Logic.
          The application generates a query containing user-controllable input
          that is not sufficiently neutralized.
        </p>
      </SidebarSection>

      <div className="px-4 py-3 border-t" style={{ borderColor: '#23264F' }}>
        <button
          className="w-full py-2 rounded text-[12px] font-medium flex items-center justify-center gap-1.5"
          style={{ background: '#4C44CB', color: 'white' }}
        >
          <ArrowRight className="w-3 h-3" />
          Open Snyk fix PR #214
        </button>
        <button
          className="w-full mt-2 py-2 rounded text-[12px] flex items-center justify-center gap-1.5 border"
          style={{ borderColor: '#23264F', color: '#C9C9E5' }}
        >
          <ExternalLink className="w-3 h-3" />
          Export SARIF
        </button>
      </div>
    </aside>
  );
}

function SidebarHeader() {
  return (
    <div
      className="px-4 py-3 border-b flex items-center justify-between"
      style={{ borderColor: '#23264F' }}
    >
      <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
        Issue details
      </p>
      <button className="hover:text-white" style={{ color: '#7C7CA0' }}>
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
      style={{ borderColor: '#23264F' }}
    >
      <div className="flex items-center gap-1.5 mb-2" style={{ color: '#7C7CA0' }}>
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
      <span className="shrink-0 w-20" style={{ color: '#7C7CA0' }}>{k}</span>
      <span
        className={`truncate ${mono ? 'font-mono' : ''}`}
        style={{
          color: highlight ? '#FB7185' : '#FFFFFF',
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {v}
      </span>
    </div>
  );
}

function TagPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'red' | 'indigo' }) {
  const styles =
    tone === 'red'
      ? { color: '#FB7185', background: 'rgba(225,29,72,0.1)', borderColor: 'rgba(225,29,72,0.3)' }
      : tone === 'indigo'
        ? { color: '#9F98FF', background: 'rgba(76,68,203,0.1)', borderColor: 'rgba(76,68,203,0.3)' }
        : { color: '#C9C9E5', background: '#1A1C40', borderColor: '#23264F' };
  return (
    <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono border" style={styles}>
      {label}
    </span>
  );
}

// ---------------- Bottom bar ----------------

function BottomBar() {
  return (
    <div
      className="px-6 py-3 text-[11.5px] flex items-center gap-6 border-t"
      style={{ background: '#0A0B23', borderColor: '#23264F', color: '#7C7CA0' }}
    >
      <span>
        <span className="text-white font-mono">2</span> findings ·
        <span className="text-white font-mono"> 1</span> critical ·
        <span style={{ color: '#FBBF24' }} className="font-mono"> 1</span> high
      </span>
      <span>
        Critical path: <span className="font-mono" style={{ color: '#9F98FF' }}>request.query.username → lookupCustomerProfile → parseSelector → matchesSelector</span>
      </span>
      <span className="ml-auto font-mono">
        Snyk Code · Snyk Open Source · CLI · CI · IDE
      </span>
    </div>
  );
}
