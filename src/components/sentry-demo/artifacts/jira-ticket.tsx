'use client';

import { X, Link2, MoreHorizontal, Paperclip, ThumbsUp, MessageCircle, Bug } from 'lucide-react';

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
    body: 'Automatically opened from Sentry event a2f1…4c0e. Triage report attached. Fix proposed in PR #142, awaiting human review.',
    pill: 'Automation',
  },
  {
    author: 'Sentry',
    time: 'a few seconds ago',
    avatarBg: 'bg-[#362D59]/40',
    avatarColor: 'text-[#b8a6ff]',
    avatarInitial: 'S',
    body: 'New alert: TypeError in formatPaymentReceipt — 1,847 events affecting 312 users in the last 47 minutes.',
    pill: 'Integration',
  },
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
            <span className="text-[13px] text-[#9FADBC]">CUR-4291</span>
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
            <Bug className="w-3.5 h-3.5 text-[#F87462]" />
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">CUR-4291</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
            TypeError in formatPaymentReceipt — bank transfer payment breaks checkout
          </h1>
        </div>

        {/* Action row */}
        <div className="px-8 py-3 border-b border-[#2C333A] flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0052CC] text-white text-[12px] font-medium hover:bg-[#0065FF]">
            <span>In Review</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
          <div className="grid grid-cols-[1fr_260px] gap-8 px-8 py-6">
            {/* Left column */}
            <div className="min-w-0">
              {/* Description */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Description
                </h3>
                <div className="text-[13.5px] text-[#B6C2CF] leading-relaxed space-y-3">
                  <p>
                    Customers are unable to complete checkout when selecting <strong className="font-semibold text-[#B6C2CF]">Bank Transfer</strong> as
                    their payment method. The order processing flow throws a
                    <code className="mx-1 px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F87462] font-mono">
                      TypeError: Cannot read properties of undefined (reading &apos;brand&apos;)
                    </code>
                    when <code className="mx-1 px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F87462] font-mono">formatPaymentReceipt</code> is called.
                  </p>
                  <p>
                    The regression was introduced in commit <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">a4f2e1b</code>{' '}
                    when the <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">bank_transfer</code> payment variant
                    was added without card details, but the consumer functions were not updated.
                  </p>
                </div>
              </section>

              {/* Reproduction */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Steps to reproduce
                </h3>
                <ol className="text-[13.5px] text-[#B6C2CF] leading-relaxed list-decimal list-inside space-y-1.5">
                  <li>Navigate to <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">/checkout</code></li>
                  <li>Select Bank Transfer as the payment method</li>
                  <li>Click <strong className="font-semibold">Process Order</strong></li>
                  <li>Observe the unhandled TypeError</li>
                </ol>
              </section>

              {/* Linked issues */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Linked
                </h3>
                <div className="space-y-1.5">
                  <LinkRow type="blocks" ref="PR #142" title="fix: handle undefined payment details in order processor" status="Open" statusColor="bg-[#1F845A]" />
                  <LinkRow type="relates to" ref="Sentry a2f1…4c0e" title="TypeError in formatPaymentReceipt (1,847 events)" status="Unresolved" statusColor="bg-[#C9372C]" />
                  <LinkRow type="caused by" ref="Commit a4f2e1b" title="feat: add bank_transfer payment type" status="Merged" statusColor="bg-[#8590A2]" />
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
                  {JIRA_COMMENTS.map((c) => (
                    <div key={c.author} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${c.avatarBg}`}>
                        <span className={`text-xs font-semibold ${c.avatarColor}`}>{c.avatarInitial}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[#B6C2CF]">{c.author}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#2C333A] text-[#9FADBC]">{c.pill}</span>
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
                  <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">Details</p>
                </div>
                <dl className="p-4 space-y-3 text-[12.5px]">
                  <DetailRow label="Assignee" value="Cursor Agent" avatar="C" avatarBg="bg-accent-blue/20" avatarColor="text-accent-blue" />
                  <DetailRow label="Reporter" value="Sentry Integration" avatar="S" avatarBg="bg-[#362D59]/40" avatarColor="text-[#b8a6ff]" />
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Priority</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C9372C]" />
                      <span className="text-[#B6C2CF]">P1 / Highest</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Labels</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">production</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">checkout</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">auto-triaged</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Affects version</dt>
                    <dd className="text-[#B6C2CF]">v4.7.2</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Components</dt>
                    <dd className="text-[#B6C2CF]">payments · checkout</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 rounded-lg border border-[#2C333A] bg-[#161A1D] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#2C333A]">
                  <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">Automation</p>
                </div>
                <div className="p-4 space-y-2 text-[12.5px] text-[#B6C2CF]">
                  <p>
                    <span className="text-[#7C8A99]">Created by </span>
                    <span className="font-medium">Cursor Background Agent</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Triggered by </span>
                    <span className="font-mono text-[11.5px]">sentry-webhook / new-issue</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Resolution time </span>
                    <span className="font-mono text-[#57D9A3]">2m 14s</span>
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
  label, value, avatar, avatarBg, avatarColor,
}: {
  label: string; value: string; avatar: string; avatarBg: string; avatarColor: string;
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
  type, ref, title, status, statusColor,
}: {
  type: string; ref: string; title: string; status: string; statusColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[13px]">
      <span className="text-[11px] text-[#7C8A99] w-20 shrink-0">{type}</span>
      <span className="text-[#4C9AFF] font-mono text-[12px] hover:underline cursor-pointer shrink-0">{ref}</span>
      <span className="text-[#B6C2CF] truncate flex-1 min-w-0">{title}</span>
      <span className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded ${statusColor} shrink-0`}>
        {status}
      </span>
    </div>
  );
}
