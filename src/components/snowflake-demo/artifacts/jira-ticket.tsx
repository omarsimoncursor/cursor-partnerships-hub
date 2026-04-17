'use client';

import {
  X,
  Link2,
  MoreHorizontal,
  Paperclip,
  ThumbsUp,
  MessageCircle,
  Layers,
  Check,
} from 'lucide-react';

interface JiraTicketProps {
  onClose: () => void;
}

const JIRA_COMMENTS = [
  {
    author: 'Snowflake',
    time: '4 hours ago',
    avatarBg: 'bg-[#29B5E8]/20',
    avatarColor: 'text-[#7DD3F5]',
    avatarInitial: 'S',
    body: 'ELT freshness audit on fct_daily_revenue: last successful run 14h 22m ago. 4 downstream pipelines blocked. Legacy run cost $8.2M/yr · proposed steady-state Snowflake spend $2.3M/yr.',
    pill: 'Integration',
  },
  {
    author: 'Cursor Agent',
    time: '3h 24m ago',
    avatarBg: 'bg-accent-blue/20',
    avatarColor: 'text-accent-blue',
    avatarInitial: 'C',
    body: 'Modernization plan posted to docs/modernization/2026-04-17-daily-revenue-rollup.md. Idiom map: 5 BTEQ idioms (QUALIFY, MULTISET VOLATILE, COLLECT STATS, MERGE, Teradata date math) + 4 T-SQL idioms (MERGE, CROSS APPLY, OPENJSON, FOR JSON PATH). Awaiting plan review from @analytics-leads before composer iteration.',
    pill: 'Automation',
  },
  {
    author: 'm.alfaro',
    time: '2h 56m ago',
    avatarBg: 'bg-[#FFAB00]/15',
    avatarColor: 'text-[#FFAB00]',
    avatarInitial: 'M',
    body: 'Plan looks good overall. Three things to address before composer ships: (1) revenue rounding — confirm we use half-up, not banker\u2019s rounding; the Teradata BTEQ is implicit half-up. (2) Late-arriving FX rows — the original lookup is effective-dated; we need a 24h lookback CTE so backfills don\u2019t blow up. (3) Drop the transient table — the staging CTE is cleaner.',
    pill: 'Reviewer',
  },
  {
    author: 'Cortex AI',
    time: '1h 38m ago',
    avatarBg: 'bg-[#7CC5DC]/20',
    avatarColor: 'text-[#B8E3F4]',
    avatarInitial: 'X',
    body: 'SNOWFLAKE.CORTEX.COMPLETE(\'mistral-large\', before_spec, after_spec): "No semantic drift detected. Date grain unchanged. Currency and category hierarchies preserved. MERGE upsert semantics equivalent to WHEN MATCHED / WHEN NOT MATCHED. Row-equivalence harness (1% sample, n = 14,237): row \u0394 0 · \u03A3 revenue \u0394 $0.00 · top-10 customer rank \u0394 0."',
    pill: 'Integration',
  },
  {
    author: 'Cursor Agent',
    time: '1h 18m ago',
    avatarBg: 'bg-accent-blue/20',
    avatarColor: 'text-accent-blue',
    avatarInitial: 'C',
    body: 'PR #318 opened (DRAFT). 7 files staged: 2 dbt models + 14 tests + 2 macros (cortex_semantic_diff, exclude_deprecated_fx) + 1 Snowpark proc + 2 seeds (deprecated_currencies, dim_currency). Iteration history: dbt run failed once on NULL currency_code (XOF deprecated 2023, 4 dormant orders); resolved with seed exclusion macro. dbt test failed once on relationships(dim_currency); resolved with seed update + warn-only severity for dormant codes.',
    pill: 'Automation',
  },
  {
    author: 'j.park',
    time: '7m ago',
    avatarBg: 'bg-[#1F845A]/20',
    avatarColor: 'text-[#57D9A3]',
    avatarInitial: 'J',
    body: 'LGTM after the renames + backfill macro went in. Merge in the Friday change window — change record CHG-44218 is on the calendar. Ping me when staging soak finishes; we\u2019ll cut over read traffic on Monday and retire the BTEQ on Wednesday.',
    pill: 'Reviewer',
  },
];

const TIMELINE: Array<{ time: string; status: string; by: string; tone: 'neutral' | 'amber' | 'blue' | 'green' }> = [
  { time: '14:23', status: 'To Do',             by: 'Snowflake ELT freshness audit',     tone: 'neutral' },
  { time: '14:24', status: 'In Progress',       by: 'Cursor Agent · CUR-5202',           tone: 'amber'   },
  { time: '15:00', status: 'Plan Review',       by: '@m.alfaro requested · 3 comments',  tone: 'amber'   },
  { time: '15:32', status: 'Plan Approved',     by: '@m.alfaro · composer resumed',       tone: 'blue'    },
  { time: '17:00', status: 'In Review',         by: 'PR #318 opened (DRAFT)',             tone: 'blue'    },
  { time: '18:21', status: 'Changes Requested', by: '@j.park · 4 comments',               tone: 'amber'   },
  { time: '18:50', status: 'Re-review',         by: 'Cursor Agent · 2 commits pushed',    tone: 'amber'   },
  { time: '18:53', status: 'Approved',          by: '@j.park · awaiting Friday merge',    tone: 'green'   },
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
            <span className="text-[13px] text-[#9FADBC]">CUR-5202</span>
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
            <Layers className="w-3.5 h-3.5 text-[#29B5E8]" />
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">CUR-5201</span>
            <span className="text-[#7C8A99]">/</span>
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">CUR-5202</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#29B5E8]/15 border border-[#29B5E8]/30 text-[#7DD3F5] font-medium">
              Modernization Task
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
            Modernize daily_revenue_rollup (Teradata BTEQ) + usp_enrich_customers_360 (T-SQL) → Snowflake + dbt
          </h1>
        </div>

        {/* Action row */}
        <div className="px-8 py-3 border-b border-[#2C333A] flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0052CC] text-white text-[12px] font-medium hover:bg-[#0065FF]">
            <span>In Review</span>
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
              {/* Description */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Description
                </h3>
                <div className="text-[13.5px] text-[#B6C2CF] leading-relaxed space-y-3">
                  <p>
                    First asset in the portfolio-scale modernization from Acme Analytics&apos; legacy Teradata + Informatica stack to Snowflake + dbt + Cortex AI. The{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#7DD3F5] font-mono">daily_revenue_rollup.bteq</code>{' '}
                    batch has been stale <strong className="font-semibold text-[#F5A623]">14h 22m</strong> — 4 downstream pipelines are blocked and the finance team&apos;s Q2 projections are running off yesterday&apos;s data.
                  </p>
                  <p>
                    The GSI quote (Accenture) is <strong>4 years · $18M</strong>. Cursor compresses that to <strong className="text-[#7DD3F5]">15 months · $5.4M</strong> — ~$16M in pulled-forward Snowflake credits and 33 months earlier against the AE&apos;s quota.
                  </p>
                  <p>
                    Source A: Teradata 17 BTEQ ·{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#7DD3F5] font-mono">daily_revenue_rollup.bteq</code>{' '}
                    — <strong>214 LOC</strong>, 3 dialect idioms (<code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">QUALIFY</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">MULTISET VOLATILE</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">COLLECT STATISTICS</code>).
                  </p>
                  <p>
                    Source B: SQL Server 2019 · dbo.usp_enrich_customers_360 — <strong>156 LOC</strong>, 4 dialect idioms (<code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">MERGE</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">CROSS APPLY</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">OPENJSON</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#F5A623] font-mono">FOR JSON PATH</code>).
                  </p>
                  <p>
                    Companion: Informatica mapping{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">wf_customers_360.xml</code>{' '}
                    — 6 transforms (Source Qualifier → Expression → Aggregator → Lookup → Update Strategy → Target).
                  </p>
                </div>
              </section>

              {/* Timeline */}
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Modernization timeline
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
                    type="parent epic"
                    refLabel="CUR-5201"
                    title="ELT Modernization (Teradata + Informatica → Snowflake + dbt + Cortex)"
                    status="In Progress"
                    statusColor="bg-[#F5A623]"
                  />
                  <LinkRow
                    type="blocks"
                    refLabel="PR #318"
                    title="feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt (1/247)"
                    status="Open"
                    statusColor="bg-[#1F845A]"
                  />
                  <LinkRow
                    type="relates to"
                    refLabel="Snowsight · dbt run"
                    title="prod_analytics.marts.fct_daily_revenue · XS_MODERNIZATION_WH · 12.8s"
                    status="SUCCESS"
                    statusColor="bg-[#1F845A]"
                  />
                  <LinkRow
                    type="depends on"
                    refLabel="wf_customers_360.xml"
                    title="Informatica mapping · 6 transforms · dbt snapshot target"
                    status="Mapped"
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
                  <p className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider">Details</p>
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
                    value="Snowflake Integration"
                    avatar="S"
                    avatarBg="bg-[#29B5E8]/20"
                    avatarColor="text-[#7DD3F5]"
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
                      <Layers className="w-3 h-3 text-[#29B5E8]" />
                      Modernization Task
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Labels</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        snowflake
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        dbt
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        cortex-verified
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        portfolio-1-of-247
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Components</dt>
                    <dd className="text-[#B6C2CF]">Data · Analytics</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Target</dt>
                    <dd className="text-[#B6C2CF] font-mono text-[11.5px]">
                      prod_analytics.marts.fct_daily_revenue
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Warehouse</dt>
                    <dd className="text-[#B6C2CF] font-mono text-[11.5px]">XS_MODERNIZATION_WH</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Affects version</dt>
                    <dd className="text-[#B6C2CF]">analytics-platform 2026.Q2</dd>
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
                    <span className="font-mono text-[11.5px]">snowflake-webhook / elt-audit</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Wall-clock </span>
                    <span className="font-mono text-[#57D9A3]">4h 03m</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">  └─ agent </span>
                    <span className="font-mono text-[#B6C2CF]">2h 16m</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">  └─ human review </span>
                    <span className="font-mono text-[#FFAB00]">1h 47m</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Iteration cycles </span>
                    <span className="font-mono text-[#B6C2CF]">2 dbt · 2 reviewer</span>
                  </p>
                  <p className="pt-2 border-t border-[#2C333A] mt-2">
                    <span className="text-[#7C8A99]">Verified </span>
                    <Check className="w-3 h-3 text-[#57D9A3] inline -mt-0.5 mx-1" />
                    <span className="text-[#57D9A3]">3,412s → 12.8s · row Δ 0</span>
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
      <span className="text-[11px] text-[#7C8A99] w-24 shrink-0">{type}</span>
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
