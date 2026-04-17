'use client';

import {
  X,
  Link2,
  MoreHorizontal,
  Paperclip,
  ThumbsUp,
  MessageCircle,
  Database,
  Check,
} from 'lucide-react';

interface JiraTicketProps {
  onClose: () => void;
}

const JIRA_COMMENTS = [
  {
    author: 'Cursor Agent',
    time: 'Day 0 · 09:55',
    avatarBg: 'bg-accent-blue/20',
    avatarColor: 'text-accent-blue',
    avatarInitial: 'C',
    body: 'Picked up from migration queue (1/312). PL/SQL stored proc + Informatica mapping transpiled to DLT + SQL model in ~40 min agent compute. Row-equivalence harness on 1% Oracle sample: row delta 0, monetary Σ delta $0.00. PR #241 opened. 2 minor concerns flagged for human review.',
    pill: 'Automation',
  },
  {
    author: 'Maria Rodriguez',
    time: 'Day 2 · 11:00',
    avatarBg: 'bg-[#E2B36A]/15',
    avatarColor: 'text-[#E2B36A]',
    avatarInitial: 'M',
    body: 'Code review approved. 3 review comments resolved (recursive CTE depth assertion + monetary Σ expectation + tier rollup edge case). Cleared to deploy to staging for parallel run. Estimated cutover: ~Day 18.',
    pill: 'Code review',
  },
  {
    author: 'Databricks',
    time: 'Day 16 · 03:15',
    avatarBg: 'bg-[#FF3621]/25',
    avatarColor: 'text-[#FF6B55]',
    avatarInitial: 'D',
    body: 'Parallel run #2 complete (week 2 of shadow mode). 2/2 weekly refreshes pass row-equivalence harness vs Oracle. Workspace acme-dw-prod · staging pipeline customer_rfm_pipeline · 14.2M input rows · 42.7s · DBU 0.08 ($0.42). Cleared for stakeholder sign-off.',
    pill: 'Parallel run',
  },
  {
    author: 'Sam Koh',
    time: 'Day 17 · 16:00',
    avatarBg: 'bg-[#E2B36A]/15',
    avatarColor: 'text-[#E2B36A]',
    avatarInitial: 'S',
    body: 'Data governance sign-off. Unity Catalog grants reviewed (analytics_reader, marketing_ops · OWNER data-platform). Classifications preserved. Audit trail complete. CAB notified for Day 18 03:00 PDT cutover window.',
    pill: 'Sign-off',
  },
];

const TIMELINE: Array<{ time: string; status: string; by: string; tone: 'neutral' | 'amber' | 'blue' | 'green' }> = [
  { time: 'Day 0 · 09:14',  status: 'To Do',         by: 'Migration queue ingest',                tone: 'neutral' },
  { time: 'Day 0 · 09:18',  status: 'In Progress',   by: 'Cursor Agent · agent compute',          tone: 'amber'   },
  { time: 'Day 0 · 09:55',  status: 'Code Review',   by: 'PR #241 → @maria.rodriguez',            tone: 'blue'    },
  { time: 'Day 2 · 14:00',  status: 'Parallel Run',  by: 'DLT shadow vs Oracle (2 weeks)',        tone: 'amber'   },
  { time: 'Day 16 · 10:30', status: 'Sign-off',      by: '3 stakeholders · marketing/BI/gov',     tone: 'blue'    },
  { time: 'Day 18 · 03:00', status: 'Cutover',       by: 'CAB-approved window · prod promoted',   tone: 'amber'   },
  { time: 'Day 18 · 04:00', status: 'Done',          by: 'Cutover successful · workflow 1/312',   tone: 'green'   },
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
            <span className="text-[13px] text-[#9FADBC]">CUR-5102</span>
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
            <Database className="w-3.5 h-3.5 text-[#FF6B55]" />
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">
              CUR-5102
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF3621]/15 border border-[#FF3621]/35 text-[#FF6B55] font-medium">
              Migration Task
            </span>
            <span className="text-[10px] text-[#7C8A99]">· epic</span>
            <span className="text-[11px] text-[#4C9AFF] hover:underline cursor-pointer">
              CUR-5101 Legacy Platform Migration
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
            Migrate customer_rfm_segmentation — Oracle PL/SQL + Informatica → Databricks DLT (1/312)
          </h1>
        </div>

        {/* Action row */}
        <div className="px-8 py-3 border-b border-[#2C333A] flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F845A] text-white text-[12px] font-medium hover:bg-[#216E4E]">
            <span>Done</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Description
                </h3>
                <div className="text-[13.5px] text-[#B6C2CF] leading-relaxed space-y-3">
                  <p>
                    First migration task from the{' '}
                    <strong className="font-semibold text-[#B6C2CF]">ACME legacy data platform</strong> migration epic.
                    The source is the weekly RFM segmentation pipeline — an Oracle 19c PL/SQL stored procedure
                    (<code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#FF6B55] font-mono">acme_dw.customer_rfm_segmentation</code>)
                    and its companion Informatica PowerCenter mapping{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#FF6B55] font-mono">wf_m_customer_rfm.xml</code>.
                  </p>
                  <p>
                    Target shape: a Databricks{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">@dlt.table</code>{' '}
                    pipeline + SQL model + Unity Catalog bronze/silver/gold, running on Photon-enabled DBR 14.3 LTS with DBU-based cost accounting. 2 explicit cursors, 1 global temp table, and a CONNECT BY rollup replaced with window functions, DLT tables, and a recursive CTE respectively.
                  </p>
                  <p>
                    Portfolio context: <strong className="font-semibold text-[#57D9A3]">1 of 312</strong> Informatica workflows migrated end-to-end. Calendar time per workflow ≈{' '}
                    <strong className="font-semibold text-[#57D9A3]">18 days</strong> (agent compute ~40 min · code review 1–2 days · 2-week DLT shadow / parallel run · stakeholder sign-off · CAB-approved cutover). With ~12 workflows in flight at any time, the portfolio finishes in{' '}
                    <strong className="font-semibold text-[#57D9A3]">~18 months</strong> — vs the incumbent GSI&apos;s <strong className="font-semibold text-[#FFB98E]">5-year / $22M</strong> fixed-bid plan.
                  </p>
                </div>
              </section>

              {/* Timeline */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Migration timeline
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
                    type="child of"
                    refLabel="CUR-5101"
                    title="Legacy Platform Migration · Epic"
                    status="In Progress"
                    statusColor="bg-[#0052CC]"
                  />
                  <LinkRow
                    type="blocks"
                    refLabel="PR #241"
                    title="feat(migration): customer RFM segmentation — Oracle PL/SQL → Databricks DLT (1/312)"
                    status="Open"
                    statusColor="bg-[#1F845A]"
                  />
                  <LinkRow
                    type="relates to"
                    refLabel="Databricks pipeline"
                    title="acme-dw-prod · customer_rfm_pipeline · DLT (dev)"
                    status="Running"
                    statusColor="bg-[#1F845A]"
                  />
                  <LinkRow
                    type="replaces"
                    refLabel="wf_m_customer_rfm.xml"
                    title="Informatica PowerCenter mapping · weekly scheduler"
                    status="Legacy"
                    statusColor="bg-[#8590A2]"
                  />
                  <LinkRow
                    type="replaces"
                    refLabel="ACME_DW.customer_rfm_segmentation"
                    title="Oracle 19c PL/SQL stored procedure"
                    status="Legacy"
                    statusColor="bg-[#8590A2]"
                  />
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
                  {JIRA_COMMENTS.map(c => (
                    <div key={c.author} className="flex gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${c.avatarBg}`}
                      >
                        <span className={`text-xs font-semibold ${c.avatarColor}`}>{c.avatarInitial}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[#B6C2CF]">{c.author}</span>
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
                    value="Migration queue (ACME_DW)"
                    avatar="D"
                    avatarBg="bg-[#FF3621]/30"
                    avatarColor="text-[#FF6B55]"
                  />
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Priority</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C9372C]" />
                      <span className="text-[#B6C2CF]">P1 / Highest</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Type</dt>
                    <dd className="flex items-center gap-1.5 text-[#B6C2CF]">
                      <Database className="w-3 h-3 text-[#FF6B55]" />
                      Migration Task
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Components</dt>
                    <dd className="text-[#B6C2CF]">Data/DW · Lakehouse migration</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Labels</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        migration
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        oracle-to-databricks
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        auto-triaged
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Databricks pipeline</dt>
                    <dd className="text-[#4C9AFF] hover:underline cursor-pointer">
                      customer_rfm_pipeline
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Portfolio progress</dt>
                    <dd className="text-[#B6C2CF] font-mono text-[12px]">
                      1 / 312 workflows migrated
                    </dd>
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
                    <span className="font-mono text-[11.5px]">databricks-webhook / migration-queue</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Agent compute </span>
                    <span className="font-mono text-[#57D9A3]">~40 min</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">End-to-end calendar </span>
                    <span className="font-mono text-[#57D9A3]">18 days</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Human checkpoints </span>
                    <span className="font-mono text-[#E2B36A]">4 (1 reviewer + 3 sign-offs)</span>
                  </p>
                  <p className="pt-2 border-t border-[#2C333A] mt-2">
                    <span className="text-[#7C8A99]">Verified </span>
                    <Check className="w-3 h-3 text-[#57D9A3] inline -mt-0.5 mx-1" />
                    <span className="text-[#57D9A3]">row delta 0 · 2/2 parallel runs · 34× faster</span>
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
