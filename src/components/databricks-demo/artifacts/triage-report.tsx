'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Migration triage — customer_rfm_segmentation (1/312)

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · PR #241 · CUR-5102 |
| **Severity** | P0 · portfolio migration |
| **Workflow** | acme-dw-prod · migration queue item 1/312 |
| **Source** | Oracle 19c · PL/SQL · 214 LOC · 2 cursors · 1 global temp table |
| **Companion** | Informatica PowerCenter · \`wf_m_customer_rfm.xml\` · 6 transforms |
| **Target** | Databricks DLT (Python) + SQL model + Unity Catalog (bronze/silver/gold) |
| **Cluster** | Serverless SQL Warehouse Large · DBR 14.3 LTS · Photon |
| **Jira** | CUR-5102 (epic CUR-5101 Legacy Platform Migration) |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (migrate) · Codex (review) |

## Scope (this workflow)

- Oracle 19c PL/SQL stored procedure \`ACME_DW.customer_rfm_segmentation\`
- Recency / Frequency / Monetary quintile scoring for ~5M active customers
- Informatica companion mapping \`wf_m_customer_rfm.xml\` — Source Qualifier → Expression → Aggregator → Target
- Weekly refresh on the \`wk_monday_03_15_pst\` scheduler

## Idiom mapping

| Oracle idiom | Databricks equivalent |
| --- | --- |
| Explicit cursor + FETCH loop | \`SELECT ... ROW_NUMBER() OVER (...)\` / window functions |
| \`GLOBAL TEMPORARY TABLE\` | Spark DataFrame / DLT intermediate \`@dlt.table\` |
| \`MERGE INTO tgt USING src ...\` | \`MERGE INTO delta.tgt USING src ON ...\` |
| \`CONNECT BY PRIOR\` hierarchy walk | \`WITH RECURSIVE\` CTE |
| \`NVL\`, \`DECODE\` | \`COALESCE\`, \`CASE WHEN\` |
| \`TO_CHAR(date, 'YYYYMM')\` | \`DATE_FORMAT(date, 'yyyyMM')\` |
| \`ROWNUM <= N\` | \`LIMIT N\` / \`ROW_NUMBER() OVER (...) <= N\` |
| Informatica Source Qualifier | \`spark.read.format('jdbc')\` + DLT bronze table |
| Informatica Aggregator | \`groupBy().agg()\` / window functions in DLT |

## Verification

- **Row delta** (1% Oracle sample vs Databricks Photon, agent harness): **0**
- **Row delta** (full 14.2M-row weekly refresh, parallel-run weeks 1 + 2): **0 · 0**
- **Monetary Σ delta** (Day 0 sample, Day 9 refresh, Day 16 refresh): **$0.00 · $0.00 · $0.00**
- **Quintile drift** (R/F/M): **0%**
- **Latency**: Oracle 8m 12s → Databricks Photon 14.3s (**34× faster**)
- **DBU consumption** (Large SQL Warehouse): 0.08 DBU · **~$0.42 per run**
- **Run duration** (full refresh, 14.2M input rows): 42.7s

## Per-workflow enterprise lifecycle (calendar)

This is a real enterprise migration, not a coding sprint. The agent compresses
the *engineering* work, not the change-management gates a regulated
data platform requires.

| Phase | Duration | Owner | Output |
| --- | --- | --- | --- |
| **Day 0** · agent compute | ~40 min | Cursor agent | Triage doc · DLT pipeline · SQL model · Unity Catalog grants · \`databricks.yml\` · PR #241 opened · 1% Oracle sample passes harness |
| **Day 0–2** · code review | 1–2 days | Data-platform on-call (named) | 3 review comments resolved · 1 sign-off recorded · cleared to staging |
| **Day 2–16** · DLT shadow / parallel run | ~2 weeks (2 weekly refreshes) | Pipeline runs unattended | Weekly refresh-vs-Oracle comparison · row delta 0 across both · BI consumers untouched |
| **Day 16–17** · stakeholder sign-off | 1–2 days | 3 named stakeholders (downstream consumer · BI · governance) | 3 sign-offs · CAB notification · cutover scheduled |
| **Day 18** · CAB-approved cutover | ~1 hour | Data-platform on-call | Pipeline promoted dev → staging → prod · Oracle paused (kept as 30-day fallback) · first prod refresh succeeds |
| **End-to-end** | **~18 days** | — | Workflow 1/312 retired from Oracle · downstream BI repointed |

## Economics (this workflow only)

| Line-item | Incumbent GSI | Cursor + Databricks |
| --- | --- | --- |
| Engineering hours per workflow | ~120 hrs (3 dev-weeks) | ~40 min agent compute + ~6 hrs human review |
| Calendar time per workflow | ~12 weeks | ~18 days |
| Labor cost per workflow | $71,200 fixed-bid GSI line-item | ~$2,400 internal (8 review-hours @ $300/hr fully loaded) |
| Compute cost per refresh | N/A — runs on Oracle prod | ~$0.42 DBU |
| Cutover risk | High (fresh code, no parallel-run gate) | 2-week shadow run + 3 sign-offs + CAB approval |

## Portfolio context

- **1 of 312** Informatica workflows migrated end-to-end.
- **Concurrency:** ~12 workflows in flight at any time across 2 squads.
- **At this rate:** 312 workflows ÷ 12 in-flight × ~18 days ≈ **18 months** total portfolio finish.
- **GSI equivalent:** 5 years · $22M fixed-bid.
- **Pulled-forward Databricks ARR:** ~$45M at $15M/yr committed-use, **42 months earlier**.

> The 34× speedup is on the **runtime** (Photon vs Oracle CPU). The portfolio
> compression is on the **calendar** — and it survives because every workflow
> still walks through human review, parallel runs, and a CAB-approved cutover.

## Risk

- **Blast radius:** 4 new files, 0 Oracle-side changes during cutover window.
- **Type surface:** unchanged — same natural keys (\`customer_id\`, \`run_ym\`) and same output columns.
- **Rollback:** \`git revert HEAD\` + leave Oracle source running. No data migration to undo.
- **Watchlist:** \`mart_rfm_tier_rollup\` CONNECT BY rewrite — recursive CTE depth capped at 8 (matches Oracle semantics on ACME tier data).
`;

interface TriageReportProps {
  onClose: () => void;
}

export function TriageReport({ onClose }: TriageReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/migration/2026-04-17-customer-rfm-segmentation.md
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#FF6B55]">
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
