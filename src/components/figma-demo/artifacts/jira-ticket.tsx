'use client';

import { X, Link2, MoreHorizontal, Paperclip, ThumbsUp, MessageCircle, Palette } from 'lucide-react';

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
    body: 'Auto-opened from Figma file_key zk2N…M9pq (Marketing/Shop/ProductCard@2.3). Triage report attached. Token-only fix proposed in PR #163, awaiting human review. Visual regression: 4 → 0 violations.',
    pill: 'Automation',
  },
  {
    author: 'Figma',
    time: 'a few seconds ago',
    avatarBg: 'bg-[#A259FF]/20',
    avatarColor: 'text-[#D6BBFF]',
    avatarInitial: 'F',
    body: 'New event: FILE_UPDATE on Marketing/Shop/ProductCard@2.3 — variable collection design-system/tokens@v2.3 published. 4 components flagged as drifted on import.',
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
            <span className="text-[13px] text-[#9FADBC]">CUR-4409</span>
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
            <Palette className="w-3.5 h-3.5 text-[#A259FF]" />
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">CUR-4409</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
            Design drift on ProductCard v2.3 — 4 token violations vs Figma spec
          </h1>
        </div>

        {/* Action row */}
        <div className="px-8 py-3 border-b border-[#2C333A] flex items-center gap-2 shrink-0 flex-wrap">
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

        {/* Body */}
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
                    The shipped <code className="mx-1 px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A259FF] font-mono">ProductCard v2.3</code>{' '}
                    component has drifted from the Figma frame{' '}
                    <code className="mx-1 px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A259FF] font-mono">Marketing/Shop/ProductCard@2.3</code>.
                    Four design-token violations exceed the <strong className="font-semibold text-[#B6C2CF]">±2 px / ΔE &gt; 4</strong> threshold.
                  </p>
                  <p>
                    Drift introduced in commit{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">3ef91a2</code>{' '}
                    (&quot;revert: product card restyle&quot;), which re-inlined hardcoded literals previously migrated to
                    <code className="mx-1 px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A259FF] font-mono">design-system/tokens@v2.3</code>.
                  </p>
                </div>
              </section>

              {/* Violations table */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Violations
                </h3>
                <div className="rounded-md border border-[#2C333A] overflow-hidden">
                  <table className="w-full text-[12.5px]">
                    <thead className="bg-[#161A1D] text-[#7C8A99]">
                      <tr>
                        <th className="text-left px-3 py-1.5 font-normal w-[40px]">#</th>
                        <th className="text-left px-3 py-1.5 font-normal">Variable</th>
                        <th className="text-left px-3 py-1.5 font-normal">Figma</th>
                        <th className="text-left px-3 py-1.5 font-normal">Shipped</th>
                        <th className="text-left px-3 py-1.5 font-normal">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#B6C2CF] font-mono">
                      <ViolationRow n="1" v="radius/md"           f="16 px"     s="12 px"     d="−4 px" />
                      <ViolationRow n="2" v="space/6"             f="24 px"     s="20 px"     d="−4 px" />
                      <ViolationRow n="3" v="font.title"          f="600 / 18"  s="700 / 17"  d="+100 / −1" />
                      <ViolationRow n="4" v="color/brand/accent"  f="#A259FF"   s="#9A4FFF"   d="ΔE 6.2" />
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Steps */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Steps to reproduce
                </h3>
                <ol className="text-[13.5px] text-[#B6C2CF] leading-relaxed list-decimal list-inside space-y-1.5">
                  <li>Open <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">/storefront/featherweight-runner</code></li>
                  <li>Inspect the <strong className="font-semibold">ProductCard</strong> component</li>
                  <li>Compare against Figma frame <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A259FF] font-mono">ProductCard@2.3</code></li>
                  <li>Observe radius, padding, title, and CTA color drift</li>
                </ol>
              </section>

              {/* Linked */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Linked
                </h3>
                <div className="space-y-1.5">
                  <LinkRow type="blocks"     refLabel="PR #163"           title="fix(ui): restore token references on ProductCard v2.3" status="Open"     statusColor="bg-[#1F845A]" />
                  <LinkRow type="relates to" refLabel="Figma · zk2N…M9pq" title="Marketing/Shop/ProductCard@2.3"                       status="Updated"  statusColor="bg-[#A259FF]" />
                  <LinkRow type="caused by"  refLabel="Commit 3ef91a2"    title="revert: product card restyle"                          status="Merged"   statusColor="bg-[#8590A2]" />
                </div>
              </section>

              {/* Activity */}
              <section>
                <div className="flex items-center gap-6 border-b border-[#2C333A] mb-4">
                  <button className="pb-2 text-[13px] font-medium text-[#B6C2CF] border-b-2 border-[#4C9AFF]">
                    Comments
                  </button>
                  <button className="pb-2 text-[13px] text-[#7C8A99] hover:text-[#9FADBC]">History</button>
                  <button className="pb-2 text-[13px] text-[#7C8A99] hover:text-[#9FADBC]">Work log</button>
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

            {/* Right column */}
            <aside className="min-w-0">
              <div className="rounded-lg border border-[#2C333A] bg-[#161A1D] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#2C333A]">
                  <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">Details</p>
                </div>
                <dl className="p-4 space-y-3 text-[12.5px]">
                  <DetailRow label="Assignee" value="Cursor Agent" avatar="C" avatarBg="bg-accent-blue/20" avatarColor="text-accent-blue" />
                  <DetailRow label="Reporter" value="Figma Integration" avatar="F" avatarBg="bg-[#A259FF]/20" avatarColor="text-[#D6BBFF]" />
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Type</dt>
                    <dd className="flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-[#A259FF]" />
                      <span className="text-[#B6C2CF]">Design QA</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Priority</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
                      <span className="text-[#B6C2CF]">P2 / Medium</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Labels</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">design-drift</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">storefront</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">auto-triaged</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Components</dt>
                    <dd className="text-[#B6C2CF]">UI/Storefront · ProductCard</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Affects version</dt>
                    <dd className="text-[#B6C2CF]">v4.7.2</dd>
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
                    <span className="font-mono text-[11.5px]">figma-webhook / FILE_UPDATE</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Resolution time </span>
                    <span className="font-mono text-[#57D9A3]">2m 10s</span>
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

function ViolationRow({ n, v, f, s, d }: { n: string; v: string; f: string; s: string; d: string }) {
  return (
    <tr className="border-t border-[#2C333A]">
      <td className="px-3 py-1.5 text-[#7C8A99]">{n}</td>
      <td className="px-3 py-1.5">{v}</td>
      <td className="px-3 py-1.5 text-[#57D9A3]">{f}</td>
      <td className="px-3 py-1.5 text-[#7C8A99] line-through">{s}</td>
      <td className="px-3 py-1.5 text-[#F5A623]">{d}</td>
    </tr>
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
  type, refLabel, title, status, statusColor,
}: {
  type: string; refLabel: string; title: string; status: string; statusColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[13px]">
      <span className="text-[11px] text-[#7C8A99] w-20 shrink-0">{type}</span>
      <span className="text-[#4C9AFF] font-mono text-[12px] hover:underline cursor-pointer shrink-0">{refLabel}</span>
      <span className="text-[#B6C2CF] truncate flex-1 min-w-0">{title}</span>
      <span className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded ${statusColor} shrink-0`}>
        {status}
      </span>
    </div>
  );
}
