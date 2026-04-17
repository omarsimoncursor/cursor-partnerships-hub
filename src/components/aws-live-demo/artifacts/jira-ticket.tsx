'use client';

import {
  X,
  Link2,
  MoreHorizontal,
  Paperclip,
  ThumbsUp,
  MessageCircle,
  Zap,
  Check,
} from 'lucide-react';

interface JiraTicketProps {
  onClose: () => void;
}

const JIRA_COMMENTS = [
  {
    author: 'Cursor Agent',
    time: 'just now',
    avatarBg: 'bg-accent-blue/20',
    avatarColor: 'text-accent-blue',
    avatarInitial: 'C',
    body: 'Done. PR #482 merged at 09:30 PDT. OrdersService (@Stateless EJB) is live on AWS — 22 calendar days from EventBridge fire to prod cutover, 4 / 4 human review gates passed (Architecture Day 2, Security Day 4, FinOps Day 6, Cutover Day 11) plus senior code review at merge. 1 / 38 bounded contexts shipped to prod. Portfolio est: 18 months.',
    pill: 'Automation',
  },
  {
    author: 'AWS SA · J. Park',
    time: '17 days ago',
    avatarBg: 'bg-[#FF9900]/20',
    avatarColor: 'text-[#FF9900]',
    avatarInitial: 'J',
    body: 'Cutover review (gate 4/4) approved on Day 11. Joint go/no-go with customer architect: 5d dual-write window, traffic shift 5/25/50/100 over 36h. Reviewed parity sentinel design; happy with the rollback plan (flip orders.dual_write = false).',
    pill: 'Human review',
  },
  {
    author: 'FinOps · M. Chen',
    time: '16 days ago',
    avatarBg: 'bg-[#0972D3]/20',
    avatarColor: 'text-[#4C9AFF]',
    avatarInitial: 'M',
    body: 'FinOps review (gate 3/4) approved on Day 6. Steady-state estimate $6,340/yr (Lambda + Aurora ACU + CW + SM) is defensible. Reserved Aurora capacity model deferred to wave 3 — re-evaluate after 6 contexts in prod.',
    pill: 'Human review',
  },
  {
    author: 'SecOps · R. Davis',
    time: '18 days ago',
    avatarBg: 'bg-[#10a37f]/20',
    avatarColor: 'text-[#10a37f]',
    avatarInitial: 'R',
    body: 'Security review (gate 2/4) approved on Day 4. Codex-pre-screened policy held up: 0 over-privileged actions, scoped ARNs, Secrets Manager rotation 30d, KMS CMK, no public Aurora endpoint. One follow-up filed: enforce CloudTrail S3 bucket policy (CUR-5310, Sev-3, no blocker).',
    pill: 'Human review',
  },
  {
    author: 'Customer architect · S. Kim',
    time: '20 days ago',
    avatarBg: 'bg-[#A689D4]/20',
    avatarColor: 'text-[#A689D4]',
    avatarInitial: 'S',
    body: 'Architecture review (gate 1/4) approved on Day 2. Decomposition plan is clean. One nit: prefer RDS Data API over RDS Proxy for wave 1 — keeps the Lambda VPC story simple. Revisit at wave 5 when concurrency grows.',
    pill: 'Human review',
  },
  {
    author: 'AWS EventBridge',
    time: '22 days ago',
    avatarBg: 'bg-[#FF9900]/20',
    avatarColor: 'text-[#FF9900]',
    avatarInitial: 'A',
    body: 'Modernization-orders-service rule fired. Detail: bounded context = OrdersService, target = Lambda + Aurora Serverless v2, MAP engagement = MAP-2026-ACME-0173. Cursor Background Agent triggered.',
    pill: 'Integration',
  },
];

const TIMELINE: Array<{
  time: string;
  status: string;
  by: string;
  tone: 'neutral' | 'amber' | 'blue' | 'green' | 'orange';
}> = [
  { time: 'Day 1 · 09:00', status: 'To Do', by: 'EventBridge rule fired', tone: 'neutral' },
  { time: 'Day 1 · 09:02', status: 'In Progress', by: 'Cursor Agent (intake + Bedrock plan)', tone: 'amber' },
  { time: 'Day 2 · 16:30', status: 'Architecture review ✓', by: 'AWS SA + customer architect (gate 1/4)', tone: 'orange' },
  { time: 'Day 4 · 11:00', status: 'Security review ✓', by: 'SecOps (gate 2/4)', tone: 'orange' },
  { time: 'Day 6 · 14:00', status: 'FinOps review ✓', by: 'FinOps (gate 3/4)', tone: 'orange' },
  { time: 'Day 11 · 11:00', status: 'Cutover review ✓', by: 'Joint go/no-go (gate 4/4)', tone: 'orange' },
  { time: 'Day 17 · 22:00', status: 'Cutover complete', by: '36h traffic shift 5/25/50/100', tone: 'amber' },
  { time: 'Day 21 · 17:30', status: 'In Review', by: 'PR #482 marked Ready for review', tone: 'blue' },
  { time: 'Day 22 · 09:30', status: 'Done', by: 'Senior code review approved · merged', tone: 'green' },
];

export function JiraTicket({ onClose }: JiraTicketProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-lg border border-[#2C333A] bg-[#1D2125] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2C333A] bg-[#161A1D] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#0052CC]">
              <span className="text-white text-[11px] font-bold">J</span>
            </div>
            <span className="text-[13px] text-[#9FADBC] font-medium">Jira</span>
            <span className="text-[#7C8A99] text-xs">/</span>
            <span className="text-[13px] text-[#9FADBC]">cursor-for-enterprise</span>
            <span className="text-[#7C8A99] text-xs">/</span>
            <span className="text-[13px] text-[#9FADBC]">CUR-5302</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#2C333A] text-[#7C8A99] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 pt-5 pb-2 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-[#FF9900]" />
            <span className="text-[12px] text-[#7C8A99] hover:text-[#9FADBC] cursor-pointer">CUR-5302</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF9900]/15 border border-[#FF9900]/30 text-[#FF9900] font-medium">
              Modernization Task
            </span>
            <span className="text-[11px] text-[#7C8A99]">parent</span>
            <span className="text-[12px] text-[#4C9AFF] hover:underline cursor-pointer">
              CUR-5301 · AWS Modernization
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#B6C2CF] leading-tight">
            Modernize OrdersService (@Stateless EJB) → Lambda + Aurora Serverless v2 + CDK
          </h1>
        </div>

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

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[1fr_280px] gap-8 px-8 py-6">
            <div className="min-w-0">
              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Description
                </h3>
                <div className="text-[13.5px] text-[#B6C2CF] leading-relaxed space-y-3">
                  <p>
                    First bounded context extraction in the <strong>AWS Modernization (CUR-5301)</strong> epic. Source is a{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#FF9900] font-mono">@Stateless</code>{' '}
                    EJB class{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#FF9900] font-mono">OrdersService</code>{' '}
                    deployed on WebSphere 8.5 against Oracle 12c (14.2K LOC). Target is Lambda + Aurora Serverless v2 managed by CDK in{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">us-east-1</code>.
                  </p>
                  <p>
                    Eight boundary violations collapsed (shared Oracle pool, JNDI in hot path,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A689D4] font-mono">REF_CURSOR</code>{' '}
                    out-parameter, WebSphere-pinned EclipseLink properties, checked-exception leakage, Oracle{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A689D4] font-mono">SEQUENCE.NEXTVAL</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#A689D4] font-mono">SYSDATE</code>{' '}
                    session NLS, synchronous cross-service stored procs).
                  </p>
                  <p>
                    IAM least-privilege verified by Codex: 0 over-privileged actions, 0 public Aurora endpoints. Secrets live in{' '}
                    <strong>Secrets Manager</strong>; the subnet avoids NAT via VPC endpoints for{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">secretsmanager</code>{' '}
                    and{' '}
                    <code className="px-1 py-0.5 rounded bg-[#161A1D] border border-[#2C333A] text-[12px] text-[#4C9AFF] font-mono">rds-data</code>.
                  </p>
                </div>
              </section>

              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Timeline · 22 calendar days · 4 human review gates
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
                              : t.tone === 'orange'
                                ? 'bg-[#FF9900]'
                                : 'bg-[#8590A2]';
                      const toneBg =
                        t.tone === 'amber'
                          ? 'bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]'
                          : t.tone === 'blue'
                            ? 'bg-[#0052CC]/15 border-[#4C9AFF]/30 text-[#4C9AFF]'
                            : t.tone === 'green'
                              ? 'bg-[#1F845A]/20 border-[#57D9A3]/30 text-[#57D9A3]'
                              : t.tone === 'orange'
                                ? 'bg-[#FF9900]/15 border-[#FF9900]/40 text-[#FF9900]'
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

              <section className="mb-7">
                <h3 className="text-[11px] font-semibold text-[#9FADBC] uppercase tracking-wider mb-3">
                  Linked
                </h3>
                <div className="space-y-1.5">
                  <LinkRow
                    type="is child of"
                    refLabel="CUR-5301"
                    title="Epic · AWS Modernization (38 bounded contexts)"
                    status="In Progress"
                    statusColor="bg-[#0052CC]"
                  />
                  <LinkRow
                    type="implements"
                    refLabel="PR #482"
                    title="feat(modernize): extract OrdersService → Lambda + Aurora Serverless v2 (1/38)"
                    status="Merged"
                    statusColor="bg-[#A371F7]"
                  />
                  <LinkRow
                    type="deploys to"
                    refLabel="orders-prod"
                    title="CloudFormation stack · us-east-1 · cutover Day 17 · hyper-care closed"
                    status="Live"
                    statusColor="bg-[#1F845A]"
                  />
                  <LinkRow
                    type="relates to"
                    refLabel="MAP credit"
                    title="Migration Acceleration Program · Modernize phase"
                    status="Eligible"
                    statusColor="bg-[#FF9900]"
                  />
                </div>
              </section>

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
                    value="AWS EventBridge"
                    avatar="A"
                    avatarBg="bg-[#FF9900]/20"
                    avatarColor="text-[#FF9900]"
                  />
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Priority</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C9372C]" />
                      <span className="text-[#B6C2CF]">P1 / Modernization track</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Type</dt>
                    <dd className="flex items-center gap-1.5 text-[#B6C2CF]">
                      <Zap className="w-3 h-3 text-[#FF9900]" />
                      Modernization Task
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Labels</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        modernize
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        lambda
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        aurora
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2C333A] text-[#B6C2CF] text-[11px]">
                        map-credit
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Components</dt>
                    <dd className="text-[#B6C2CF]">Platform/Backend · orders</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">Region</dt>
                    <dd className="text-[#B6C2CF] font-mono">us-east-1</dd>
                  </div>
                  <div>
                    <dt className="text-[#7C8A99] mb-1">CloudFormation</dt>
                    <dd className="text-[#4C9AFF] font-mono text-[11px] hover:underline cursor-pointer">
                      orders-dev
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
                    <span className="text-[#7C8A99]">Triggered by </span>
                    <span className="font-mono text-[11.5px]">eventbridge / modernization-orders</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">End-to-end timeline </span>
                    <span className="font-mono text-[#FF9900]">22 calendar days</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Human review gates </span>
                    <span className="font-mono text-[#57D9A3]">4 / 4 passed</span>
                    <span className="text-[#7C8A99]"> + senior code review</span>
                  </p>
                  <p>
                    <span className="text-[#7C8A99]">Portfolio progress </span>
                    <span className="font-mono text-[#FF9900]">1 / 38 shipped to prod</span>
                  </p>
                  <p className="pt-2 border-t border-[#2C333A] mt-2">
                    <span className="text-[#7C8A99]">IAM least-priv </span>
                    <Check className="w-3 h-3 text-[#57D9A3] inline -mt-0.5 mx-1" />
                    <span className="text-[#57D9A3]">verified by Codex + SecOps</span>
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
