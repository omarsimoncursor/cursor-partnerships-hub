'use client';

import {
  AlertTriangle,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  Archive,
  UserPlus,
  Link2,
  Bell,
  MoreHorizontal,
  Star,
  ChevronDown,
  Code2,
  MessageSquare,
  Globe,
  Monitor,
  Tag,
  Search,
} from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

const BREADCRUMBS = [
  { time: '14:23:01.204', category: 'navigation', level: 'info', message: 'To: /checkout' },
  { time: '14:23:02.812', category: 'ui.click', level: 'info', message: 'div.order-summary > button#process-order' },
  { time: '14:23:02.813', category: 'state', level: 'info', message: 'processing=true, shouldFire=false' },
  { time: '14:23:04.310', category: 'state', level: 'info', message: 'shouldFire=true (setTimeout 1500ms elapsed)' },
  { time: '14:23:04.311', category: 'fetch', level: 'info', message: 'POST /api/payments/verify · 200 (85ms)' },
  { time: '14:23:04.396', category: 'exception', level: 'error', message: 'TypeError: Cannot read properties of undefined (reading \'brand\')' },
];

const STACK_FRAMES = [
  {
    filename: 'src/lib/demo/format-payment.ts',
    function: 'formatPaymentReceipt',
    lineno: 4,
    colno: 31,
    inApp: true,
    context: [
      { line: 2, code: '' },
      { line: 3, code: 'export function formatPaymentReceipt(payment: PaymentMethod): string {' },
      { line: 4, code: '  const brand = payment.details.brand.toUpperCase();', highlight: true },
      { line: 5, code: '  const masked = payment.details.last4;' },
      { line: 6, code: "  return `${brand} ending in ${masked}`;" },
      { line: 7, code: '}' },
    ],
  },
  {
    filename: 'src/lib/demo/order-processor.ts',
    function: 'processOrder',
    lineno: 22,
    colno: 19,
    inApp: true,
  },
  {
    filename: 'src/components/sentry-demo/checkout-card.tsx',
    function: 'CheckoutCard',
    lineno: 26,
    colno: 5,
    inApp: true,
  },
  {
    filename: 'node_modules/react-dom/cjs/react-dom.development.js',
    function: 'renderWithHooks',
    lineno: 14827,
    colno: 24,
    inApp: false,
  },
];

const TAGS: { key: string; value: string; secondary?: boolean }[] = [
  { key: 'environment', value: 'production' },
  { key: 'release', value: 'v4.7.2' },
  { key: 'browser', value: 'Chrome 132.0' },
  { key: 'os', value: 'macOS 15.2' },
  { key: 'runtime', value: 'Next.js 16.1.6' },
  { key: 'url', value: '/checkout' },
  { key: 'payment_type', value: 'bank_transfer' },
  { key: 'user.id', value: 'u_8a2f91' },
];

interface SentryIssueProps {
  eventId?: string;
}

export function SentryIssue({ eventId = 'a2f1e4b8d0c94f5a8e7c2d4f6b1e9a4c0e' }: SentryIssueProps) {
  const shortId = `${eventId.slice(0, 4)}…${eventId.slice(-4)}`;

  return (
    <div className="w-full h-full bg-[#1a1625] text-[#c6c2d2] overflow-y-auto font-sans">
      {/* Top organization bar */}
      <div className="h-10 bg-[#141020] border-b border-[#2a2440] flex items-center px-4 gap-3 text-[12px]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[#362D59]">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <span className="text-[#e6e3ef] font-semibold">cursor-demos</span>
          <ChevronDown className="w-3 h-3 text-[#8a84a5]" />
        </div>
        <div className="ml-auto flex items-center gap-4 text-[#8a84a5]">
          <Search className="w-3.5 h-3.5" />
          <Bell className="w-3.5 h-3.5" />
          <div className="w-6 h-6 rounded-full bg-accent-blue/30 flex items-center justify-center text-[10px] font-bold text-accent-blue">
            O
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr]">
        {/* Left nav */}
        <aside className="bg-[#141020] border-r border-[#2a2440] py-3 px-2 text-[13px] min-h-[680px]">
          <nav className="space-y-0.5">
            <NavSection title="Explore">
              <NavItem label="Issues" count="24" active />
              <NavItem label="Traces" />
              <NavItem label="Replays" />
              <NavItem label="Alerts" />
            </NavSection>
            <NavSection title="Insights">
              <NavItem label="Frontend" />
              <NavItem label="Backend" />
              <NavItem label="AI Agents" />
            </NavSection>
            <NavSection title="Projects">
              <NavItem label="cursor-for-enterprise" dot="#f87171" count="1" />
              <NavItem label="cursor-web" dot="#4ADE80" />
            </NavSection>
            <NavSection title="Codecov">
              <NavItem label="Tests" />
              <NavItem label="Prevent" />
            </NavSection>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 bg-[#1a1625]">
          {/* Breadcrumb */}
          <div className="px-6 py-2.5 border-b border-[#2a2440] text-[12px] text-[#8a84a5] flex items-center gap-1.5">
            <span className="hover:text-[#c6c2d2] cursor-pointer">Issues</span>
            <span>/</span>
            <span className="text-[#c6c2d2] font-mono">CURSOR-142</span>
          </div>

          {/* Issue header */}
          <div className="px-6 pt-5 pb-4 border-b border-[#2a2440]">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-[#f87171]/10 border border-[#f87171]/30 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-[#f87171]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-[#8a84a5]">CURSOR-142</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30">
                    ERROR
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/30">
                    UNRESOLVED
                  </span>
                </div>
                <h1 className="text-[20px] font-semibold text-white leading-tight mb-1">
                  <span className="text-[#f87171]">TypeError</span>{' '}
                  <span className="text-white/90">Cannot read properties of undefined (reading &apos;brand&apos;)</span>
                </h1>
                <p className="text-[13px] text-[#8a84a5] font-mono">
                  <span className="text-[#c6c2d2]">formatPaymentReceipt</span>
                  <span className="mx-1.5">·</span>
                  <span>src/lib/demo/format-payment.ts</span>
                </p>
              </div>
              <button className="p-1.5 rounded hover:bg-[#2a2440] text-[#8a84a5]">
                <Star className="w-4 h-4" />
              </button>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 mt-4">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4ADE80]/10 hover:bg-[#4ADE80]/15 text-[#4ADE80] text-[12.5px] font-medium border border-[#4ADE80]/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2a2440] hover:bg-[#362D59] text-[#c6c2d2] text-[12.5px] border border-[#2a2440]">
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2a2440] hover:bg-[#362D59] text-[#c6c2d2] text-[12.5px] border border-[#2a2440]">
                <UserPlus className="w-3.5 h-3.5" />
                Assign
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-[#2a2440] text-[#8a84a5] text-[12px]">
                  <Link2 className="w-3.5 h-3.5" />
                  Share
                </button>
                <button className="p-1.5 rounded hover:bg-[#2a2440] text-[#8a84a5]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid grid-cols-[1fr_240px] gap-5 px-6 py-5">
            {/* Left column */}
            <div className="min-w-0 space-y-5">
              {/* Stats strip */}
              <div className="grid grid-cols-4 gap-3">
                <StatCell icon={<Zap className="w-3.5 h-3.5 text-[#f87171]" />} label="Events" value="1,847" trend="+4,200%" trendColor="#f87171" />
                <StatCell icon={<Users className="w-3.5 h-3.5 text-[#c6c2d2]" />} label="Users" value="312" />
                <StatCell icon={<Clock className="w-3.5 h-3.5 text-[#c6c2d2]" />} label="First seen" value="47m ago" />
                <StatCell icon={<Clock className="w-3.5 h-3.5 text-[#c6c2d2]" />} label="Last seen" value="12s ago" />
              </div>

              {/* Frequency sparkline */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-mono text-[#8a84a5] uppercase tracking-wider">Event frequency · last 24h</p>
                  <span className="text-[11px] text-[#8a84a5] font-mono">1,847 events</span>
                </div>
                <div className="rounded-md bg-[#0f0b1a] border border-[#2a2440] p-3">
                  <div className="h-16 flex items-end gap-[2px]">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const isSpike = i > 36;
                      const normalHeight = 4 + (i % 5);
                      const rampHeight = 20 + ((i - 36) / 12) * 70;
                      const height = isSpike ? Math.min(rampHeight, 96) : normalHeight;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t-[1px]"
                          style={{
                            height: `${height}%`,
                            backgroundColor: isSpike ? '#f87171' : '#362D59',
                            opacity: isSpike ? 0.9 : 0.5,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-[#6b647e] font-mono">
                    <span>24h ago</span>
                    <span>12h ago</span>
                    <span>now</span>
                  </div>
                </div>
              </section>

              {/* Tabs */}
              <div className="flex items-center gap-5 border-b border-[#2a2440] text-[13px]">
                <Tab label="Details" active />
                <Tab label="Activity" count="2" />
                <Tab label="User Feedback" />
                <Tab label="Attachments" />
                <Tab label="Tags" />
                <Tab label="Similar Issues" count="0" />
              </div>

              {/* Stack trace */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-mono text-[#8a84a5] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3 h-3" />
                    Stack trace
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#8a84a5]">
                    <span>Full</span>
                    <span className="text-[#c6c2d2]">Relevant</span>
                    <span>Minified</span>
                  </div>
                </div>

                <div className="rounded-md border border-[#2a2440] bg-[#0f0b1a] overflow-hidden">
                  {STACK_FRAMES.map((frame, i) => (
                    <StackFrame key={i} frame={frame} expanded={i === 0} />
                  ))}
                </div>
              </section>

              {/* Breadcrumbs */}
              <section>
                <p className="text-[11px] font-mono text-[#8a84a5] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Breadcrumbs
                </p>
                <div className="rounded-md border border-[#2a2440] bg-[#0f0b1a]">
                  {BREADCRUMBS.map((c, i) => (
                    <div key={i} className={`px-3 py-2 flex items-start gap-2.5 text-[12px] ${i < BREADCRUMBS.length - 1 ? 'border-b border-[#2a2440]' : ''}`}>
                      <span className="text-[#6b647e] font-mono w-[76px] shrink-0">{c.time}</span>
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          c.level === 'error'
                            ? 'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]'
                            : 'bg-[#362D59]/20 border-[#362D59]/40 text-[#b8a6ff]'
                        }`}
                      >
                        {c.category}
                      </span>
                      <span className={`flex-1 min-w-0 font-mono break-words ${c.level === 'error' ? 'text-[#f87171]' : 'text-[#c6c2d2]'}`}>
                        {c.message}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right sidebar */}
            <aside className="space-y-4 text-[12.5px]">
              <SidebarSection title="Assignee">
                <div className="flex items-center gap-2 p-2 rounded bg-[#0f0b1a] border border-[#2a2440]">
                  <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <span className="text-accent-blue text-[10px] font-bold">C</span>
                  </div>
                  <span className="text-[#c6c2d2]">cursor-agent</span>
                  <span className="ml-auto text-[10px] text-[#4ADE80] bg-[#4ADE80]/10 px-1.5 py-0.5 rounded">auto</span>
                </div>
              </SidebarSection>

              <SidebarSection title="Linked Issues">
                <LinkRow color="#4C9AFF" label="CUR-4291" desc="Jira · In Review" />
                <LinkRow color="#4ADE80" label="PR #142" desc="GitHub · Open" />
              </SidebarSection>

              <SidebarSection title="Tags">
                <div className="space-y-1">
                  {TAGS.slice(0, 6).map((t) => (
                    <div key={t.key} className="flex items-center gap-2 py-1 text-[11.5px] font-mono">
                      <Tag className="w-2.5 h-2.5 text-[#6b647e] shrink-0" />
                      <span className="text-[#8a84a5] w-[88px] shrink-0 truncate">{t.key}</span>
                      <span className="text-[#c6c2d2] truncate">{t.value}</span>
                    </div>
                  ))}
                  <button className="text-[11px] text-[#b8a6ff] hover:underline pt-1">
                    Show {TAGS.length - 6} more
                  </button>
                </div>
              </SidebarSection>

              <SidebarSection title="Environment">
                <div className="space-y-1.5 text-[11.5px]">
                  <div className="flex items-center gap-2 text-[#c6c2d2]">
                    <Globe className="w-3 h-3 text-[#6b647e]" />
                    <span>production</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#c6c2d2]">
                    <Monitor className="w-3 h-3 text-[#6b647e]" />
                    <span>Chrome 132 · macOS</span>
                  </div>
                </div>
              </SidebarSection>

              <SidebarSection title="Event details">
                <div className="space-y-1.5 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a84a5]">event_id</span>
                    <span className="font-mono text-[#c6c2d2] text-[10px]">{shortId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a84a5]">type</span>
                    <span className="font-mono text-[#c6c2d2] text-[10px]">error</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a84a5]">platform</span>
                    <span className="font-mono text-[#c6c2d2] text-[10px]">javascript</span>
                  </div>
                </div>
              </SidebarSection>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b647e]">{title}</p>
      <div className="space-y-[1px]">{children}</div>
    </div>
  );
}

function NavItem({ label, count, active, dot }: { label: string; count?: string; active?: boolean; dot?: string }) {
  return (
    <button
      className={`w-full px-2 py-1.5 rounded flex items-center gap-2 text-[12.5px] ${
        active
          ? 'bg-[#362D59]/50 text-white'
          : 'text-[#8a84a5] hover:bg-[#2a2440] hover:text-[#c6c2d2]'
      }`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      <span>{label}</span>
      {count && (
        <span className="ml-auto text-[10px] bg-[#f87171]/15 text-[#f87171] px-1.5 py-0.5 rounded">{count}</span>
      )}
    </button>
  );
}

function StatCell({ icon, label, value, trend, trendColor }: { icon: React.ReactNode; label: string; value: string; trend?: string; trendColor?: string }) {
  return (
    <div className="rounded-md bg-[#0f0b1a] border border-[#2a2440] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider text-[#8a84a5]">{label}</p>
      </div>
      <p className="text-[18px] font-bold text-white leading-none">{value}</p>
      {trend && (
        <p className="text-[10px] font-mono mt-1" style={{ color: trendColor ?? '#8a84a5' }}>
          {trend}
        </p>
      )}
    </div>
  );
}

function Tab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={`pb-2 -mb-px border-b-2 flex items-center gap-1.5 text-[13px] ${
        active ? 'border-[#b8a6ff] text-white font-medium' : 'border-transparent text-[#8a84a5] hover:text-[#c6c2d2]'
      }`}
    >
      {label}
      {count && <span className="text-[10px] text-[#6b647e]">{count}</span>}
    </button>
  );
}

function StackFrame({ frame, expanded }: {
  frame: {
    filename: string;
    function: string;
    lineno: number;
    colno?: number;
    inApp: boolean;
    context?: { line: number; code: string; highlight?: boolean }[];
  };
  expanded: boolean;
}) {
  return (
    <div className={`${frame.inApp ? '' : 'opacity-60'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 text-[12px] ${expanded ? 'bg-[#f87171]/5 border-l-2 border-[#f87171]' : 'border-l-2 border-transparent'}`}>
        <ChevronDown className={`w-3 h-3 text-[#6b647e] shrink-0 ${expanded ? '' : '-rotate-90'}`} />
        <span className="font-mono text-[#c6c2d2] truncate">{frame.filename}</span>
        <span className="text-[#6b647e]">in</span>
        <span className="font-mono text-[#b8a6ff] truncate">{frame.function}</span>
        <span className="text-[#6b647e] ml-auto font-mono text-[11px] shrink-0">
          at line {frame.lineno}
          {frame.colno ? `:${frame.colno}` : ''}
        </span>
        {!frame.inApp && <span className="text-[10px] px-1 py-0.5 rounded bg-[#2a2440] text-[#6b647e]">vendor</span>}
      </div>
      {expanded && frame.context && (
        <div className="bg-[#080510] border-t border-[#2a2440] font-mono text-[11.5px] leading-relaxed">
          {frame.context.map((line, i) => (
            <div
              key={i}
              className={`px-3 py-0.5 flex items-start gap-3 ${
                line.highlight ? 'bg-[#f87171]/10 border-l-2 border-[#f87171]' : ''
              }`}
            >
              <span className="text-[#6b647e] w-8 text-right shrink-0 select-none">{line.line}</span>
              <span className={line.highlight ? 'text-[#fca5a5]' : 'text-[#a8a2bf]'}>
                {line.code || '\u00A0'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b647e] mb-1.5">{title}</p>
      {children}
    </div>
  );
}

function LinkRow({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[#2a2440] cursor-pointer text-[12px]">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="font-mono" style={{ color }}>{label}</span>
      <span className="text-[#8a84a5] truncate">· {desc}</span>
    </div>
  );
}
