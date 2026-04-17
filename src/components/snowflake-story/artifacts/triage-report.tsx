'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MARKDOWN = `# Modernization triage · daily_revenue_rollup
*Asset 1 of 911 · Snowflake + dbt · Cortex-verified · approved for Friday change window*

## Status

| Key | Value |
| --- | --- |
| Target | \`prod_analytics.marts.fct_daily_revenue\` |
| PR | #318 · acme-analytics/data-platform |
| Jira | CUR-5202 (epic CUR-5201) |
| Wall-clock | 4h 03m · agent 2h 16m · human review 1h 47m |
| Iterations | 2 review cycles · 1 dbt test-retry cycle |
| Verdict | **Approved · row-equivalent · Cortex no-drift** |

## Why this is realistic

This is one asset. Real enterprise modernizations do not happen in minutes. What Cursor changes
is the *inside of the loop*: the triage, the translation, the test harness, the iteration. The
outside of the loop — reviewer SLA, change-window discipline, CFO sign-off — stays exactly as
strict as it should be. What used to be a 2-week GSI-billed asset at $58K is now a 4-hour
collaboratively-reviewed asset at sub-$10 in compute credits.

## Scope (this asset)

- **Source A** · \`daily_revenue_rollup.bteq\` · Teradata 17 · 214 LOC · 3 dialect idioms
- **Source B** · \`usp_enrich_customers_360.sql\` · SQL Server 2019 · 156 LOC · 4 dialect idioms
- **Companion** · \`wf_customers_360.xml\` · Informatica PowerCenter · 6 transforms
- **Target** · Snowflake + dbt (staging / fct + 14 tests) + Cortex-verified semantics

## Idiom mapping

| Legacy idiom | Snowflake equivalent |
| --- | --- |
| \`QUALIFY ROW_NUMBER() OVER(...)\` (Teradata) | \`QUALIFY ROW_NUMBER() OVER(...)\` (Snowflake, native) |
| \`MULTISET VOLATILE ... ON COMMIT PRESERVE ROWS\` | CTE or transient temp table |
| \`COLLECT STATISTICS\` | automatic micro-partition stats |
| Teradata date math (\`ADD_MONTHS\`, \`DATE - 1\`) | \`DATEADD\`, \`DATE_TRUNC\` |
| \`MERGE ... WHEN MATCHED BY TARGET\` (T-SQL) | \`MERGE INTO target USING src\` (Snowflake) |
| \`CROSS APPLY\` | \`LATERAL FLATTEN(INPUT => ...)\` |
| \`OPENJSON\` | \`PARSE_JSON\` + \`FLATTEN\` |

## Iteration log

1. **Plan review (Maya)** — 3 comments: banker's rounding vs half-up, late-arriving FX retry
   window, \`ON COMMIT\` CTE scope was unclear. Cursor applied all three in one patch batch and
   re-ran the row-equivalence harness. **Δ still 0.**
2. **PR review iteration (Jordan)** — dbt \`not_null\` test failed on \`currency_code\` for 4
   rows. Root cause: XOF (CFA franc) FX rate deprecated in 2023; legacy BTEQ silently dropped
   them. Cursor added a \`seeds/deprecated_currencies.csv\` + explicit exception audit table
   (\`exceptions/deprecated_fx.sql\`) so finance can hand-review instead of data vanishing.
   14 / 14 tests pass after fix.

## Verification (this asset)

- Cortex semantic diff · \`SNOWFLAKE.CORTEX.COMPLETE('mistral-large', ...)\` — **no drift**
- Row-level equivalence (1% sample) · **Δ rows = 0**
- Revenue Σ delta · **$0.00**
- Top-10 customer rank drift · **0 positions**
- Latency · Teradata \`3,412s\` → Snowflake XS WH \`12.8s\` (**266× faster**)

## Wall-clock breakdown

| Phase | Time | Who |
| --- | --- | --- |
| Opus triage (reads BTEQ + T-SQL + Informatica) | 14m | agent |
| Plan drafted + posted | 6m | agent |
| Maya reviews plan | 20m | human |
| Composer edits · dbt models + Snowpark proc + macros | 37m | agent |
| dbt compile + first test run (iteration 1) | 12m | agent |
| Jordan PR review · round 1 | 28m | human |
| Cursor patches rounding + FX retry + transient | 28m | agent |
| Jordan PR review · round 2 (dbt XOF failure) | 35m | human |
| Cursor patches deprecated_currencies seed | 21m | agent |
| Cortex re-verify + row-equivalence harness | 24m | agent |
| Final reviewer approval · queued for change window | 24m | human |
| **Total wall-clock** | **4h 03m** | agent 2h 16m · human 1h 47m |

## Economics (this asset vs GSI line-item)

| Metric | GSI line-item | Cursor |
| --- | --- | --- |
| Duration | 2 weeks | 4h 03m |
| Cost | $58,000 | $0 license · 2h 16m compute (~$9.80 in credits) |
| Human touch | 2 consultants full-time | 1h 47m reviewer time |
| Tests shipped | "hand-verified" | 14 dbt tests + Cortex diff + row-equiv harness |

## Portfolio context

- 1 of 911 legacy assets modernized.
- GSI equivalent: 4 years, $18M, credits deferred to month 40.
- Cursor-accelerated: 15 months, $5.4M, **credits flowing now**.
`;

export function TriageReport() {
  return (
    <div className="w-full h-full bg-[#0B1220] text-[#E2E8F0] overflow-y-auto">
      <div className="max-w-[780px] mx-auto px-7 md:px-10 py-8 prose-cinematic">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{MARKDOWN}</ReactMarkdown>
      </div>
      <style jsx>{`
        :global(.prose-cinematic) { line-height: 1.65; font-size: 14px; }
        :global(.prose-cinematic h1) {
          font-size: 28px; font-weight: 600; letter-spacing: -0.01em;
          margin: 0 0 4px; color: #F8FAFC;
        }
        :global(.prose-cinematic h1 + p em) {
          color: #7DD3F5; font-style: normal; font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase;
        }
        :global(.prose-cinematic h2) {
          font-size: 17px; font-weight: 600; margin: 28px 0 12px; color: #F8FAFC;
          border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;
        }
        :global(.prose-cinematic p) { margin: 10px 0; color: #CBD5E1; }
        :global(.prose-cinematic ul), :global(.prose-cinematic ol) { margin: 10px 0; padding-left: 20px; }
        :global(.prose-cinematic li) { margin: 4px 0; color: #CBD5E1; }
        :global(.prose-cinematic code) {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #7DD3F5;
          background: rgba(41,181,232,0.08); border: 1px solid rgba(41,181,232,0.18);
          padding: 1px 5px; border-radius: 3px;
        }
        :global(.prose-cinematic strong) { color: #F8FAFC; font-weight: 600; }
        :global(.prose-cinematic table) {
          width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12.5px;
        }
        :global(.prose-cinematic th) {
          text-align: left; padding: 8px 12px; background: rgba(41,181,232,0.08);
          color: #7DD3F5; border: 1px solid rgba(41,181,232,0.18);
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 10.5px;
        }
        :global(.prose-cinematic td) {
          padding: 8px 12px; border: 1px solid rgba(255,255,255,0.06); color: #E2E8F0;
        }
        :global(.prose-cinematic tr:nth-child(even) td) { background: rgba(255,255,255,0.015); }
      `}</style>
    </div>
  );
}
