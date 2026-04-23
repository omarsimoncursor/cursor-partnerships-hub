'use client';

import {
  X,
  Link2,
  MoreHorizontal,
  Paperclip,
  ThumbsUp,
  MessageCircle,
  ShieldAlert,
  Check,
} from 'lucide-react';

interface JiraTicketProps {
  onClose: () => void;
}

const JIRA_COMMENTS = [
  {
    author: 'Cursor Agent',
    time: 'a few seconds ago',
    avatarBg: 'bg-accent-blue/20',
    avatarColor: 'text-accent-blue',
    avatarInitial: 'C',
    body: 'Automatically opened from Zscaler ZPA risk event evt-21794. Triage report attached, PR #213 submitted — 4,287 → 18 users in scope, deny-by-default restored. Awaiting human review.',
    pill: 'Automation',
  },
  {
    author: 'Zscaler ZPA',
    time: 'a few seconds ago',
    avatarBg: 'bg-[#0079D5]/25',
    avatarColor: 'text-[#65B5F2]',
    avatarInitial: 'Z',
    body: 'Zero Trust violation — workforce-admin/audit-logs scopes 4,287 users vs intent 18 (238x over). Risk score Critical (92/100). 312 ZIA web hits in last 60m, including 4 unmanaged-device sessions.',
    pill: 'Integration',
  },
  {
    author: 'Okta',
    time: 'a few seconds ago',
    avatarBg: 'bg-[#007DC1]/15',
    avatarColor: 'text-[#5BB7E2]',
    avatarInitial: 'O',
    body: 'Reconciled group claims: sec-admin (12 users) + compliance-officer (6 users) = 18 users. Matches the proposed least-privilege intent.',
    pill: 'Integration',
  },
];

const TIMELINE: Array<{
  time: string;
  status: string;
  by: string;
  tone: 'neutral' | 'amber' | 'blue' | 'green';
}> = [
  { time: '14:21:43', status: 'To Triage', by: 'Zscaler webhook', tone: 'neutral' },
  { time: '14:21:48', status: 'In Progress', by: 'Cursor Agent', tone: 'amber' },
  { time: '14:23:57', status: 'In Review', by: 'PR #213 opened', tone: 'blue' },
];

export function JiraTicket({ onClose }: JiraTicketProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-lg border border-[#2C333A] bg-[#1D2125] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Jira bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2C333A] bg-[#161A1D] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#0052CC]">
              <span className="text-white text-[11px] font-bold">J</span>
            </div>
            <span className="text-[13px] text-[#9FADBC] font-medium">Jira</span>
            <span className="text-[#7C8A99] text-xs">/</span>
            <span className="text-[13px] text-[#9FADBC]">cursor-for-enterprise</span>
            <span className="text-[#7C8A99] text-xs">/</span>
            <span className="text-[13px] text-[#9FADBC]">CUR-5712</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#2C333A] text-[#7C8A99] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breadcrumb / issue key */}
        <div className="px-8 pt-5 pb-2 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">
              CUR-5712
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5A623]/15 border border-[#F5A623]/30 text-[#F5A623] font-medium">
              Sec-Incident
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
            Zero Trust violation on /api/admin/audit-logs — wildcard policy in access-policy.ts
          </h1>
        </div>

        {/* Action row */}
        <div className="px-8 py-3 border-b border-[#2C333A] flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0052CC] text-white text-[12px] font-medium hover:bg-[#0065FF]">
            <span>In Review</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#9FADBC] hover:bg-[#2C333A]">
            <ThumbsUp className="w-3 h-3" />
            Vote
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#9FADBC] hover:bg-[#2C333A]">
            <Paperclip className="w-3 h-3" />
            Attach
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] text-[#9FADBC] hover:bg-[#2C333A]">
            <Link2 className="w-3 h-3" />
            Link issue
          </button>
          <div className="ml-auto">
            <button className="p-1 rounded text-[#9FADBC] hover:bg-[#2C333A]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: two columns */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[1fr_280px] gap-8 px-8 py-6">
            {/* Left column */}
            <div className="min-w-0">
              {/* Description */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Description
                </h3>
                <div className="text-[13.5px] text-[#B6C2CF] leading-relaxed space-y-3">
                  <p>
                    Zscaler ZPA risk event{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#65B5F2] font-mono">
                      evt-21794
                    </code>{' '}
                    fired at <strong className="font-semibold">14:21 PDT</strong> when policy
                    conformance for{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#65B5F2] font-mono">
                      workforce-admin/audit-logs
                    </code>{' '}
                    measured 4,287 users in scope vs the least-privilege intent of{' '}
                    <strong className="font-semibold text-[#F5A623]">18 users</strong> — 238x over
                    scope. ZIA logged 312 hits in the last hour, including 4 unmanaged-device
                    sessions.
                  </p>
                  <p>
                    Root cause:{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F87462] font-mono">
                      ADMIN_AUDIT_LOG_POLICY
                    </code>{' '}
                    declares{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">
                      roles: [&apos;*&apos;]
                    </code>
                    , skips{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">
                      postureRequired
                    </code>
                    , and accepts wildcard locations and IdPs. Any authenticated employee on any
                    device can read the internal audit log.
                  </p>
                  <p>
                    Regression introduced in commit{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">
                      b7c91d2
                    </code>{' '}
                    — <em>&quot;wip: open audit logs for QA&quot;</em> (3 days ago, qa-bot). The
                    intent was a temporary widening for QA; it shipped to prod by accident.
                  </p>
                </div>
              </section>

              {/* Incident timeline */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Incident timeline
                </h3>
                <div className="rounded-lg border border-[#2C333A] bg-[#161A1D] p-4">
                  <ol className="relative border-l border-[#2C333A] ml-2 space-y-4">
                    {TIMELINE.map((t, i) => {
                      const toneDot =
                        t.tone === 'amber'
                          ? 'bg-[#F5A623]'
                          : t.tone === 'blue'
                            ? 'bg-[#4C9AFF]'
                            : t.tone === 'green'
                              ? 'bg-[#57D9A3]'
                              : 'bg-[#8590A2]';
                      const toneBg =
                        t.tone === 'amber'
                          ? 'bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]'
                          : t.tone === 'blue'
                            ? 'bg-[#0052CC]/15 border-[#4C9AFF]/30 text-[#4C9AFF]'
                            : t.tone === 'green'
                              ? 'bg-[#1F845A]/20 border-[#57D9A3]/30 text-[#57D9A3]'
                              : 'bg-[#2C333A] border-[#2C333A] text-[#9FADBC]';
                      return (
                        <li key={i} className="ml-4 last:mb-0">
                          <span
                            className={`absolute -left-[5px] mt-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#161A1D] ${toneDot}`}
                          />
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded border text-[11px] font-medium ${toneBg}`}
                            >
                              {t.status}
                            </span>
                            <span className="text-[12px] text-[#9FADBC]">{t.by}</span>
                            <span className="ml-auto text-[11px] text-[#7C8A99] font-mono">
                              {t.time} PDT
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>

              {/* Linked */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Linked
                </h3>
                <div className="space-y-1.5">
                  <LinkRow
                    type="blocks"
                    refLabel="PR #213"
                    title="sec: scope down audit-log policy (4,287 → 18 users in scope)"
                    status="Open"
                    statusColor="bg-[#1F845A]"
                  />
                  <LinkRow
                    type="relates to"
                    refLabel="ZPA risk evt-21794"
                    title="Zero Trust violation — workforce-admin/audit-logs · scope 238x over"
                    status="Critical"
                    statusColor="bg-[#C9372C]"
                  />
                  <LinkRow
                    type="caused by"
                    refLabel="Commit b7c91d2"
                    title="wip: open audit logs for QA"
                    status="Merged"
                    statusColor="bg-[#8590A2]"
                  />
                  <LinkRow
                    type="relates to"
                    refLabel="Okta group: sec-admin"
                    title="12 users · matches intent"
                    status="Reconciled"
                    statusColor="bg-[#1F845A]"
                  />
                </div>
              </section>

              {/* Activity */}
              <section>
                <div className="flex items-center gap-6 border-b border-[#2C333A] mb-4">
                  <button className="pb-2 text-[13px] font-medium text-[#B6C2CF] border-b-2 border-[#4C9AFF]">
                    Comments
                  </button>
                  <button className="pb-2 text-[13px] text-[#7C8A99] hover:text-[#9FADBC]">
                    History
                  </button>
                  <button className="pb-2 text-[13px] text-[#7C8A99] hover:text-[#9FADBC]">
                    Work log
                  </button>
                </div>

                <div className="space-y-4">
                  {JIRA_COMMENTS.map(c => (
                    <div key={c.author} className="flex gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${c.avatarBg}`}
                      >
                        <span className={`text-xs font-semibold ${c.avatarColor}`}>
                          {c.avatarInitial}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[#B6C2CF]">
                            {c.author}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#2C333A] text-[#9FADBC]">
                            {c.pill}
                          </span>
                          <span className="text-[12px] text-[#7C8A99]">· {c.time}</span>
                        </div>
                        <div className="rounded-md border border-[#2C333A] bg-[#161A1D] p-3 text-[13px] text-[#B6C2CF] leading-relaxed">
                          {c.body}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-[#7C8A99]">
                          <button className="hover:text-[#9FADBC] flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Reply
                          </button>
                          <button className="hover:text-[#9FADBC]">Edit</button>
                          <button className="hover:text-[#9FADBC]">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right column: details */}
            <aside className="min-w-0">
              <div className="rounded-lg border border-[#2C333A] bg-[#161A1D] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#2C333A]">
                  <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">
                    Details
                  </p>
                </div>
                <dl className="p-4 space-y-3 text-[12.5px]">
                  <DetailRow
                    label="Assignee"
                    value="Cursor Agent"
                    avatar="C"
                    avatarBg="bg-accent-blue/20"
                    avatarColor="text-accent-blue"
                  />
                  <DetailRow
                    label="Reporter"
                    value="Zscaler Integration"
                    avatar="Z"
                    avatarBg="bg-[#0079D5]/30"
                    avatarColor="text-[#65B5F2]"
                  />
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Priority</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C9372C]" />
                      <span className="text-[#B6C2CF]">Sec-P1 / Critical</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Type</dt>
                    <dd className="flex items-center gap-1.5 text-[#B6C2CF]">
                      <ShieldAlert className="w-3 h-3 text-[#F5A623]" />
                      Sec-Incident · Zero Trust
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Labels</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        production
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        zero-trust
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        auto-triaged
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">ZPA app segment</dt>
                    <dd className="text-[#B6C2CF]">workforce-admin/audit-logs</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Components</dt>
                    <dd className="text-[#B6C2CF]">workforce-admin · access-policy</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Risk score</dt>
                    <dd className="text-[#F5A623]">92 / 100 · Critical</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 rounded-lg border border-[#2C333A] bg-[#161A1D] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#2C333A]">
                  <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">
                    Automation
                  </p>
                </div>
                <div className="p-4 space-y-2 text-[12.5px] text-[#B6C2CF]">
                  <p>
                    <span className="text-[#7C8A99]">Created by </span>
                    <span className="font-medium">Cursor Background Agent</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Triggered by </span>
                    <span className="font-mono text-[11.5px]">zscaler-webhook / zerotrust-violation</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Resolution time </span>
                    <span className="font-mono text-[#57D9A3]">2m 14s</span>
                  </p>
                  <p className="pt-2 border-t border-[#2C333A] mt-2">
                    <span className="text-[#7C8A99]">Verified </span>
                    <Check className="w-3 h-3 text-[#57D9A3] inline -mt-0.5 mx-1" />
                    <span className="text-[#57D9A3]">4,287 → 18 users in scope</span>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  avatar,
  avatarBg,
  avatarColor,
}: {
  label: string;
  value: string;
  avatar: string;
  avatarBg: string;
  avatarColor: string;
}) {
  return (
    <div>
      <dt className="text-[#7C8A99] mb-1">{label}</dt>
      <dd className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${avatarBg}`}>
          <span className={`text-[10px] font-semibold ${avatarColor}`}>{avatar}</span>
        </div>
        <span className="text-[#B6C2CF]">{value}</span>
      </dd>
    </div>
  );
}

function LinkRow({
  type,
  refLabel,
  title,
  status,
  statusColor,
}: {
  type: string;
  refLabel: string;
  title: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[13px]">
      <span className="text-[11px] text-[#7C8A99] w-20 shrink-0">{type}</span>
      <span className="text-[#4C9AFF] font-mono text-[12px] hover:underline cursor-pointer shrink-0">
        {refLabel}
      </span>
      <span className="text-[#B6C2CF] truncate flex-1 min-w-0">{title}</span>
      <span
        className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded ${statusColor} shrink-0`}
      >
        {status}
      </span>
    </div>
  );
}
