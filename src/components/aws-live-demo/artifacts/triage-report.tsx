'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Modernization triage — OrdersService (1/38)

| Field | Value |
| --- | --- |
| **Status** | Shipped to prod · 22 calendar days · PR #482 · CUR-5302 |
| **MAP phase** | Assess ✓ · Mobilize ✓ · Migrate & Modernize ✓ (1 of 38 contexts) |
| **Source** | Java EE 7 \`@Stateless\` EJB · 14.2K LOC |
| **Companion** | Oracle 12c PL/SQL \`SP_RESERVE_INVENTORY\` |
| **Target** | Lambda (Node.js 20, TypeScript) + Aurora Serverless v2 + CDK |
| **Human review gates** | 4 of 4 passed (Architecture · Security · FinOps · Cutover) + senior code review at merge |
| **Authored by** | Cursor Background Agent + acme-platform-eng team |
| **Models used** | Bedrock · Opus (triage) · Composer (extract) · Codex (review) |

## Scope (this bounded context)

- 1 of 38 bounded contexts. GSI baseline: 5 years / $14M. Cursor estimate: 18 months / $3.8M.
- Target architecture (CDK constructs):
  - \`Function\` (Lambda, Node.js 20, Powertools)
  - \`DatabaseCluster\` (Aurora Serverless v2, PostgreSQL 15)
  - \`Secret\` (Secrets Manager, auto-rotation 30d)
  - \`VpcEndpoint\` for Secrets Manager + RDS Data API
  - \`RestApi\` → \`LambdaIntegration\`
- Region: \`us-east-1\` · multi-region deployable.

## Boundary violations collapsed

| Violation | Resolution |
| --- | --- |
| Shared Oracle connection pool | Isolated Aurora cluster per bounded context |
| JNDI lookup from request handler | IAM role + AWS SDK v3 client |
| Synchronous cross-service stored proc | Lambda + Step Functions (async where safe) |
| WebSphere-specific EclipseLink properties | RDS Data API + PostgreSQL dialect |
| Checked-exception leakage (NamingException, SQLException) | Powertools structured error handling |
| Oracle \`REF_CURSOR\` out-parameter | \`SETOF\` stored function \`pg_reserve_inventory\` |
| Oracle \`SEQUENCE.NEXTVAL\` primary keys | PG identity columns |
| \`SYSDATE\` / session-NLS dependencies | UTC-normalized, timezone-aware columns |

## Well-Architected citations

- **OPS 05** · automated deployment (CDK synth + CloudFormation change sets)
- **SEC 02** · identity & access (IAM least-priv, Secrets Manager, private Aurora)
- **REL 09** · automated recovery (Lambda retries, Aurora multi-AZ)
- **PERF 04** · right-sized compute (Aurora Serverless v2 autoscaling 0.5 → 8 ACU)
- **COST 06** · usage-based (Lambda per-invocation, Aurora ACUs, CW log retention 30d)
- **SUS 03** · managed services over idle on-prem capacity

## Realistic timeline (22 calendar days)

| Day | What happened | Channel |
| --- | --- | --- |
| Day 1 | AWS Knowledge MCP intake · Bedrock decomposition plan · Composer drafts handler + CDK + PG migration | agent |
| Day 2 | Codex IAM/VPC/cost audit (3 tightenings filed) · Composer iteration v2 · \`cdk synth\` + \`diff\` clean | agent |
| **Day 2 PM** | **Architecture review (gate 1/4)** — AWS SA + customer architect approve decomposition plan | **human** |
| Day 3 | \`cdk deploy --profile dev\` (3m 47s) · sam local + integration tests · 4h CW soak | agent |
| **Day 4** | **Security review (gate 2/4)** — SecOps confirms IAM least-priv, Secrets Manager rotation, KMS, no public Aurora | **human** |
| **Day 6** | **FinOps review (gate 3/4)** — $6.3K/yr steady-state approved; reserved capacity deferred to wave 3 | **human** |
| Day 7 | \`cdk deploy --profile stage\` (4m 12s, multi-AZ, provisioned concurrency 10) | agent |
| Day 8 | k6 load test at 2× peak prod (1.4M req · p99 412ms · error 0.001%) | agent |
| Day 9–11 | 3-day stage soak (p99 408ms 99th-pct · 0 alarms · replication lag 12ms) | agent |
| **Day 11** | **Cutover review (gate 4/4)** — joint go/no-go approves 5d dual-write + 36h traffic shift 5/25/50/100 | **human** |
| Day 12 | Dual-write enabled · drift sentinel armed · monolith stays source of truth | agent |
| Day 13–15 | Dual-write parity soak (3 days) — 100% reservation parity, 100% revenue parity, 0 DLQ | agent |
| Day 17 | Traffic shift 5 → 25 → 50 → 100% over 36h · monolith reads disabled · cutover passed | agent |
| Day 18–21 | Hyper-care window · CW alarms quiet · on-call uneventful | agent |
| Day 21 | PR #482 marked Ready for review | agent |
| **Day 22 AM** | **Senior code review** — 2 reviewers, 4 inline comments resolved, approved | **human** |
| Day 22 AM | PR merged · Jira CUR-5302 → Done · 1 of 38 contexts shipped to prod | agent |

## Verification artifacts

- \`tsc --noEmit\` ✓ · \`npm run lint\` ✓
- \`cdk synth\` ✓ · \`cdk diff\` ✓ (+14 resources, 0 destroyed, IAM unchanged)
- \`sam local invoke\` ✓ (200 · 412ms · reservation_id 1001)
- \`cdk deploy --profile dev\` ✓ (stack \`orders-dev\` CREATE_COMPLETE in 3m 47s)
- \`cdk deploy --profile stage\` ✓ (4m 12s, multi-AZ, provisioned concurrency 10)
- k6 load test ✓ (2× peak prod, 1.4M req, p99 412ms, error 0.001%)
- 3-day stage soak ✓ (0 high-sev alarms, replication lag 12ms p99)
- Dual-write parity soak ✓ (100% reservation + revenue parity, 0 DLQ)
- Cutover ✓ (36h traffic shift 5/25/50/100%)
- IAM Access Analyzer: 0 over-privileged actions · 0 public resources · least-privilege ✓

## Economics (this bounded context only)

| Line | GSI baseline | Cursor + customer team |
| --- | ---: | ---: |
| Engagement timeline | ~16 weeks | ~22 calendar days |
| Engagement cost | $340,000 (GSI labor) | ~$48,000 (in-house labor across 4 review gates + senior code review) |
| Dev / stage AWS spend during build | n/a | ~$190 |
| Steady-state annual AWS | ~$6,340 | ~$6,340 |
| Oracle + WebSphere slice replaced | ~$220,000/yr | eliminated

## Portfolio context

- 1 of 38 bounded contexts extracted.
- Est. portfolio finish: **18 months** (vs GSI baseline **5 years**).
- Pulled-forward managed-service ARR: **~$11M**, 42 months earlier.

## Risk & rollback

- Blast radius at merge: 1 bounded context · 6 files · +742 −0 (net-new services tree).
- Legacy EJB stayed deployed on WebSphere through the dual-write window (Day 12–17) and was disabled at cutover.
- Rollback during dual-write: flip \`orders.dual_write = false\` (instant, zero data loss).
- Rollback after cutover: traffic shift back to monolith via the same flag (rehearsed in Cutover review on Day 11).
- No data loss path: Aurora ledger replays from monolith via the parity sentinel (3-day soak on Day 13–15 confirmed parity).

## Why this isn't a 2-minute demo

Real Java EE → Lambda + Aurora extractions don't compress past wall-clock realities. A k6 load test still has to run to completion. A multi-AZ stage soak still has to observe 3 days of traffic. A dual-write parity check still has to wait for end-of-day batches. A FinOps review still has to wait for the next FinOps office hours. Cursor compresses everything that *can* be compressed — discovery, plan, IaC drafts, IAM/cost audits, PG translation, integration test seeds — and surfaces every gate that *cannot* be compressed so the AWS SA and the customer architect see the actual workflow.
`;

interface TriageReportProps {
  onClose: () => void;
}

export function TriageReport({ onClose }: TriageReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/modernization/2026-04-17-orders-service.md
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-md hover:bg-dark-surface-hover text-text-tertiary hover:text-text-primary transition-colors"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-dark-surface-hover text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-7">
          <article className="markdown-body text-text-primary">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-text-primary mb-4 mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-text-primary mb-3 mt-6 border-t border-dark-border pt-5">
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="text-sm text-text-secondary space-y-1.5 mb-4 list-disc list-inside ml-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-sm text-text-secondary space-y-1.5 mb-4 list-decimal list-inside ml-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-text-primary">{children}</strong>
                ),
                table: ({ children }) => (
                  <div className="my-5 overflow-x-auto rounded-lg border border-dark-border">
                    <table className="w-full text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-dark-bg">{children}</thead>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-[11px] font-mono uppercase tracking-wider text-text-tertiary border-b border-dark-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-text-secondary border-b border-dark-border last:border-b-0">
                    {children}
                  </td>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) return <code className={className}>{children}</code>;
                  return (
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#FF9900]">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="my-4 p-4 rounded-lg bg-dark-bg border border-dark-border overflow-x-auto text-[12px] text-text-secondary font-mono leading-relaxed">
                    {children}
                  </pre>
                ),
              }}
            >
              {REPORT_MARKDOWN}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
