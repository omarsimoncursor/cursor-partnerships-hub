'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Modernization triage — daily_revenue_rollup (1/247)

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · PR #318 · CUR-5202 |
| **Severity** | P1 · daily rollup stale 14h 22m |
| **Account** | acme-analytics · us-east-1.aws |
| **Warehouse** | XS_MODERNIZATION_WH (auto-suspend 60s) |
| **Target** | prod_analytics.marts.fct_daily_revenue |
| **Jira** | CUR-5202 · Epic CUR-5201 |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (modernize) · Codex (review) · Cortex (semantic diff) |

## Scope (this asset)

- Source A: Teradata 17 BTEQ · **214 LOC** · 3 dialect idioms
- Source B: SQL Server 2019 T-SQL stored proc · **156 LOC** · 4 dialect idioms
- Companion: Informatica mapping \`wf_customers_360.xml\` · 6 transforms
- Target: Snowflake + dbt (staging/fct + tests) + Cortex-verified semantics

## Idiom mapping

| Legacy idiom | Snowflake equivalent |
| --- | --- |
| \`QUALIFY ROW_NUMBER() OVER(...)\` (Teradata) | \`QUALIFY ROW_NUMBER() OVER(...)\` (Snowflake, native) |
| \`MULTISET VOLATILE ... ON COMMIT PRESERVE ROWS\` | staging CTE or transient temp table |
| \`COLLECT STATISTICS\` | automatic micro-partition stats |
| \`MERGE ... WHEN MATCHED BY TARGET\` (T-SQL) | \`MERGE INTO tgt USING src\` (Snowflake) |
| \`CROSS APPLY\` / \`OUTER APPLY\` | \`LATERAL FLATTEN(INPUT => ...)\` |
| \`OPENJSON ... WITH (...)\` | \`PARSE_JSON(...) + FLATTEN\` |
| \`FOR JSON PATH\` | \`OBJECT_CONSTRUCT\` / \`ARRAY_AGG\` |
| Teradata date math \`(DATE - 1)\`, \`ADD_MONTHS\` | \`DATEADD\`, \`DATE_TRUNC\` |

## Verification

- **Cortex semantic diff**: \`SNOWFLAKE.CORTEX.COMPLETE('mistral-large', before_spec, after_spec)\` → **no drift**
- **Row delta** (1% sample, n = 14,237): **0**
- **Σ revenue delta**: **$0.00**
- **Top-10 customer rank drift**: **0**
- **Latency**: Teradata 3,412s → Snowflake XS WH 12.8s (**266× faster**)
- **dbt**: \`dbt compile\` ✓ · \`dbt run --select fct_daily_revenue\` 12.8s ✓ · \`dbt test\` 14/14 passed (**after 2 iterations** — see Iteration log)

## Iteration log

1. **dbt run #1** failed on \`not_null(currency_code)\` — 4 dormant rows in legacy XOF (West African franc, deprecated 2023). Root-cause: missing FX rate, not a logic bug. Resolution: \`seeds/deprecated_currencies.csv\` + \`macros/exclude_deprecated_fx.sql\` documenting the exclusion in dbt docs. Re-run **passed in 12.8s**.
2. **dbt test #1** failed on \`relationships(dim_currency)\` — orphan in \`fx_rates\` not in seed. Resolution: +3 currencies in \`seeds/dim_currency.csv\`; severity downgraded to **warn** for dormant codes (cited in PR risk section). Re-run **14/14 passed**.
3. **Reviewer round 1** (@j.park, 4 comments): warehouse sizing rationale, 90-day backfill macro, dbt docs blocks, naming alignment to \`mart_*\` convention. Resolution: \`macros/backfill_fct_daily_revenue.sql\` (idempotent, CI-callable), 22 dbt doc blocks added, \`fct_daily_revenue\` → \`mart_daily_revenue\` rename + downstream refs patched.

## Wall-clock breakdown (this asset)

| Phase | Duration | Notes |
| --- | ---: | --- |
| Snowflake intake + Opus triage | 36 min | account / warehouse / Cortex entitlement / idiom tagging |
| Triage report + plan post | 6 min | 312-line plan to \`docs/modernization/\` |
| **Plan review** (human · @m.alfaro) | 32 min | 25 min queue · 4 min comments · 4 min Composer revision |
| Composer modernization (5 files) | 30 min | dbt models + Snowpark proc + dbt snapshot + tests + macros |
| Static + first dbt run | 4 min | dbt compile · tsc · lint |
| **Iteration 1** — fix NULL on XOF currency | 12 min | Opus diagnose · Composer patch · re-run |
| **Iteration 2** — fix relationships test | 6 min | seed update + warn-only severity |
| Cortex semantic diff + row equivalence | 22 min | Cortex COMPLETE · 1% sample (n = 14,237) · row Δ 0 |
| PR draft + Jira | 8 min | branch + push + draft PR + linked Jira |
| **PR review** (human · @j.park) | 75 min | 50 min queue · 6 min comments · 14 min Composer revision · 2 min re-verify |
| Final approval | 6 min | reviewer LGTM · Jira → Approved |
| **Total wall clock** | **4h 03m** | of which **1h 47m human review** + **2h 16m agent** |

## Economics (this asset)

- GSI line-item: **$58,000 · 2 weeks** (1 senior data engineer + 0.5 PM + warehouse + cutover testing)
- Cursor: **$0 license · 2h 16m of agent compute · 0.0042 credits ($0.0084)**
- Reviewer time: **1h 47m** of @m.alfaro + @j.park (~$360 fully-loaded · the same as a manual workflow would consume)
- Annualized run cost swing (this daily rollup): **Teradata CPU+license ~$310K/yr → Snowflake credits ~$1.6K/yr**

## Why this is realistic

This is **not** a 2-minute story. The agent compresses what was 2 weeks of a senior engineer\u2019s time into ~2h of agent compute, but the **human review steps stay** — that\u2019s the whole point of the guardrails. Everything Cursor changes about the workflow shows up in the **agent** lane; the **human review** lane stays as long as it would have been with a GSI in the loop. The win is that the agent doesn\u2019t block on the engineer\u2019s queue across **247 BTEQ + 412 T-SQL assets** — those run in parallel, with the engineer\u2019s queue as the only sequential constraint.

## Portfolio context

- 1 of **247** BTEQ scripts + **412** T-SQL procs + **184** Informatica mappings + **68** SSIS packages modernized.
- At this rate: agent time is the constraint, not GSI headcount.
- GSI equivalent: **4 years, $18M**.
- Cursor-accelerated baseline: **15 months, $5.4M** — ~$16M in pulled-forward Snowflake credits, 33 months earlier.

## Warehouse + Cortex usage

- \`XS_MODERNIZATION_WH\` · auto-suspend 60s · no warehouse-size creep (guardrail enforced).
- Cortex AI calls: \`COMPLETE\` (semantic diff) · \`SUMMARIZE\` (PR body draft).
- Snowpark Python procedure: \`usp_enrich_customers_360.py\` replaces the T-SQL proc with parameterized window logic.

## Guardrails honored

- ✓ Row-level equivalence before PR open.
- ✓ Cortex semantic diff logged in PR body.
- ✓ No silent schema changes (unique_key enforced by dbt test).
- ✓ No warehouse-size creep.
- ✓ Human-approved merge (agent never ships).
`;

interface TriageReportProps {
  onClose: () => void;
}

export function TriageReport({ onClose }: TriageReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        {/* Header: file chrome */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/modernization/2026-04-17-daily-revenue-rollup.md
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

        {/* Markdown body */}
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#7DD3F5]">
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
