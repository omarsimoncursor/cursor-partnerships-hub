'use client';

import {
  GitMerge,
  GitPullRequest,
  Check,
  MessageSquare,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Book,
} from 'lucide-react';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      {/* Top header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">cursor-demos</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">cursor-for-enterprise</span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">Public</span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">12</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">341</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" />
          <NavTab label="Issues" count="5" />
          <NavTab label="Pull requests" count="3" active />
          <NavTab label="Actions" />
          <NavTab label="Projects" />
          <NavTab label="Wiki" />
          <NavTab label="Security" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      {/* PR header */}
      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[24px] font-normal text-[#e6edf3] leading-tight">
            feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt (1/247)
            <span className="text-[#7d8590] ml-2 font-light">#318</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f6feb] text-white text-[13px] font-medium">
            <GitPullRequest className="w-4 h-4" />
            Open
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">cursor-agent</span> wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">1 commit</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">main</span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">feat/modernize-daily-revenue-rollup</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="4" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="1" />
          <PrTab label="Checks" count="5" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="5" />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="4 hours ago · last updated 7m ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  Modernize the{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">daily_revenue_rollup.bteq</code>{' '}
                  Teradata batch + the companion{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">usp_enrich_customers_360</code>{' '}
                  T-SQL stored proc into a Snowflake-native dbt DAG. Staging CTE replaces the{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">MULTISET VOLATILE</code> table;
                  QUALIFY stays native; <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">OPENJSON</code> → <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">PARSE_JSON + FLATTEN</code>; MERGE behavior preserved via a dbt incremental model with a unique key. Cortex semantic diff + a 1% row-level harness verify equivalence to the Teradata source.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Portfolio progress</h3>
                <div className="rounded-md border border-[#30363d] bg-[#151b23] p-3 text-[13px] space-y-1">
                  <div>
                    <span className="text-[#7d8590]">BTEQ:</span>{' '}
                    <span className="font-mono text-[#e6edf3]">1 / 247</span> · 0.4%
                  </div>
                  <div>
                    <span className="text-[#7d8590]">T-SQL:</span>{' '}
                    <span className="font-mono text-[#e6edf3]">1 / 412</span> · 0.2%
                  </div>
                  <div>
                    <span className="text-[#7d8590]">Est. portfolio finish:</span>{' '}
                    <span className="font-mono text-[#3fb950]">15 months</span>{' '}
                    <span className="text-[#7d8590]">(vs GSI baseline 4 years) · constraint is reviewer queue, not agent compute</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Wall-clock breakdown</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Phase</th>
                        <th className="px-3 py-2 text-right font-semibold">Duration</th>
                        <th className="px-3 py-2 text-left font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d] text-[12.5px]">
                      <tr>
                        <td className="px-3 py-2">Snowflake intake + Opus triage</td>
                        <td className="px-3 py-2 text-right font-mono">36 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">account / Cortex entitlement / idiom tagging</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Triage report drafted</td>
                        <td className="px-3 py-2 text-right font-mono">6 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">312-line plan to <code className="text-[#7DD3F5]">docs/modernization/</code></td>
                      </tr>
                      <tr className="bg-[#FFAB00]/5">
                        <td className="px-3 py-2 font-semibold text-[#FFAB00]">Plan review (human · @m.alfaro)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#FFAB00]">32 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">25 min queue · 4 min comments · 4 min revision</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Composer modernization</td>
                        <td className="px-3 py-2 text-right font-mono">30 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">5 files · dbt + Snowpark + snapshot + tests + macros</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Static + first dbt run</td>
                        <td className="px-3 py-2 text-right font-mono">4 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">dbt compile · tsc · lint</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Iteration 1 — XOF NULL fix</td>
                        <td className="px-3 py-2 text-right font-mono">12 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">Opus diagnose · Composer patch · re-run</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Iteration 2 — relationships test</td>
                        <td className="px-3 py-2 text-right font-mono">6 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">seed update + warn-only severity</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Cortex diff + row equivalence</td>
                        <td className="px-3 py-2 text-right font-mono">22 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">Cortex COMPLETE · 1% sample (n = 14,237)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">PR draft + Jira</td>
                        <td className="px-3 py-2 text-right font-mono">8 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">branch + push + draft + linked Jira</td>
                      </tr>
                      <tr className="bg-[#FFAB00]/5">
                        <td className="px-3 py-2 font-semibold text-[#FFAB00]">PR review (human · @j.park)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#FFAB00]">75 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">50 min queue · 6 min comments · 14 min revision · 2 min re-verify · 3 min approval</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Final approval + ready-to-merge</td>
                        <td className="px-3 py-2 text-right font-mono">6 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">@j.park LGTM · CHG-44218 scheduled</td>
                      </tr>
                      <tr className="bg-[#0d1117]">
                        <td className="px-3 py-2 font-semibold text-[#e6edf3]">Total</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-[#3fb950]">4h 03m</td>
                        <td className="px-3 py-2 text-[#7d8590]"><span className="font-mono text-[#3fb950]">2h 16m</span> agent · <span className="font-mono text-[#FFAB00]">1h 47m</span> human review</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Credits & latency</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Metric</th>
                        <th className="px-3 py-2 text-right font-semibold">Teradata + Informatica</th>
                        <th className="px-3 py-2 text-right font-semibold">Snowflake + dbt</th>
                        <th className="px-3 py-2 text-right font-semibold">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Wall time</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">3,412s</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">12.8s</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">266× faster</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Compute cost (this run)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">~$38.20</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">$0.0084</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−99.97%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Engineer time (this asset)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">2 weeks · $58,000</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">1h 47m review · ~$360</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−99.4%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Snowflake credits</td>
                        <td className="px-3 py-2 text-right font-mono">—</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0.0042</td>
                        <td className="px-3 py-2 text-right font-mono text-[#7d8590]">XS WH</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Annual run-rate</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">$8.2M</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">$2.3M</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−$5.9M/yr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Idiom mapping</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Legacy idiom</th>
                        <th className="px-3 py-2 text-left font-semibold">Snowflake equivalent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">MULTISET VOLATILE … ON COMMIT PRESERVE ROWS</td><td className="px-3 py-2 font-mono text-[#3fb950]">staging CTE / transient table in dbt model</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">QUALIFY ROW_NUMBER() OVER(…)</td><td className="px-3 py-2 font-mono text-[#3fb950]">QUALIFY ROW_NUMBER() OVER(…) (native)</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">COLLECT STATISTICS</td><td className="px-3 py-2 font-mono text-[#3fb950]">auto micro-partition stats (no-op)</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">MERGE (Teradata / T-SQL)</td><td className="px-3 py-2 font-mono text-[#3fb950]">dbt incremental + unique_key</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">CROSS APPLY</td><td className="px-3 py-2 font-mono text-[#3fb950]">LATERAL FLATTEN(INPUT =&gt; …)</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">OPENJSON WITH (…)</td><td className="px-3 py-2 font-mono text-[#3fb950]">PARSE_JSON(…) + FLATTEN</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">FOR JSON PATH</td><td className="px-3 py-2 font-mono text-[#3fb950]">OBJECT_CONSTRUCT / ARRAY_AGG</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#F5A623]">Teradata date math (DATE − 1), ADD_MONTHS</td><td className="px-3 py-2 font-mono text-[#3fb950]">DATEADD / DATE_TRUNC</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Files changed (5)</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 font-mono text-[12.5px]">
                  <li><span className="text-[#4493f8]">models/staging/stg_revenue_events.sql</span> <span className="text-[#7d8590]">(new · 84 lines)</span></li>
                  <li><span className="text-[#4493f8]">models/marts/fct_daily_revenue.sql</span> <span className="text-[#7d8590]">(new · 112 lines)</span></li>
                  <li><span className="text-[#4493f8]">tests/fct_daily_revenue.yml</span> <span className="text-[#7d8590]">(new · 42 lines · 14 tests)</span></li>
                  <li><span className="text-[#4493f8]">macros/cortex_semantic_diff.sql</span> <span className="text-[#7d8590]">(new · 38 lines)</span></li>
                  <li><span className="text-[#4493f8]">snowflake_procs/usp_enrich_customers_360.py</span> <span className="text-[#7d8590]">(new · 154 lines · Snowpark Python)</span></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview — BTEQ → dbt model</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span className="bg-[#301216] text-[#f85149]">{`- CREATE MULTISET VOLATILE TABLE tmp_order_lines AS (
-   SELECT ol.order_id, ol.line_number, ol.product_id, ol.quantity,
-          ol.unit_price_local, ol.line_discount_local, ol.tax_local,
-          o.customer_id, o.region_code, o.currency_code, o.order_date
-     FROM stg_order_lines ol
-     JOIN tmp_orders_raw o ON ol.order_id = o.order_id
-   QUALIFY ROW_NUMBER() OVER (
-       PARTITION BY ol.order_id, ol.line_number
-       ORDER BY ol.updated_ts DESC
-   ) = 1
- ) WITH DATA PRIMARY INDEX (order_id, line_number)
-   ON COMMIT PRESERVE ROWS;
- COLLECT STATISTICS ON tmp_order_lines COLUMN (order_id);
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+ -- models/marts/fct_daily_revenue.sql
+ {{ config(
+     materialized = 'incremental',
+     unique_key = ['order_date','region_code','category_name'],
+     on_schema_change = 'fail'
+ ) }}
+
+ with order_lines as (
+     select ol.order_id, ol.line_number, ol.product_id, ol.quantity,
+            ol.unit_price_local, ol.line_discount_local, ol.tax_local,
+            o.customer_id, o.region_code, o.currency_code, o.order_date
+       from {{ ref('stg_order_lines') }} ol
+       join {{ ref('stg_orders') }}       o  on ol.order_id = o.order_id
+      qualify row_number() over (
+          partition by ol.order_id, ol.line_number
+          order by ol.updated_ts desc
+      ) = 1
+ )
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Verification</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Cortex semantic diff (<code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">SNOWFLAKE.CORTEX.COMPLETE(&apos;mistral-large&apos;, …)</code>): <span className="text-[#3fb950]">no drift</span>
                  </li>
                  <li>
                    Row-level equivalence (1% sample, Teradata snapshot vs Snowflake fct): <span className="text-[#3fb950]">row Δ = 0 · Σ revenue Δ = $0.00 · top-10 customer rank Δ = 0</span>
                  </li>
                  <li>
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">dbt compile</code> ✓ ·{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">dbt run --select fct_daily_revenue</code> <span className="text-[#3fb950]">12.8s SUCCESS</span> ·{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">dbt test</code> 14 passed
                  </li>
                  <li>Latency: Teradata 3,412s → Snowflake XS WH 12.8s (<span className="text-[#3fb950]">266× faster</span>)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 5 files · +430 −0 (new dbt project footprint; no prod change until reviewer merges)</li>
                  <li>Schema surface: <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">fct_daily_revenue</code> columns unchanged; unique_key enforced by dbt test</li>
                  <li>Rollback: revert the PR; Teradata source remains authoritative until cutover run</li>
                  <li>Warehouse sizing: <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">XS_MODERNIZATION_WH</code> with auto-suspend 60s — no creep</li>
                </ul>
              </section>
            </div>
          </PrComment>

          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· just now</span>
            </p>
          </div>

          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">All checks have passed (after 2 iterations)</span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">Show iteration log</button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="dbt compile" detail="1 model · 0 errors" duration="3s" />
              <CheckRow name="dbt run" detail="12.8s · 1.4M rows · iter 2 of 2 ✓" duration="13s" />
              <CheckRow name="dbt test" detail="14 / 14 passed · iter 2 of 2 ✓" duration="11s" />
              <CheckRow name="cortex semantic diff" detail="mistral-large · no drift" duration="4s" />
              <CheckRow name="row-equivalence harness" detail="1% sample · n=14,237 · Δ = 0" duration="6s" />
              <CheckRow name="tsc --noEmit" detail="Snowpark TS glue clean" duration="2s" />
              <CheckRow name="reviewer-approved" detail="@m.alfaro (plan) · @j.park (PR)" duration="—" />
            </div>
          </PrComment>

          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#3fb950]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  Approved by @j.park · scheduled for Friday change window (CHG-44218)
                </p>
                <p className="text-[12.5px] text-[#7d8590]">
                  Verified by Cursor agent + Cortex AI · staging soak in progress · cutover Monday · BTEQ retired Wednesday.
                </p>
              </div>
              <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium">
                Merge pull request
              </button>
            </div>
          </PrComment>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Assignees">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <span className="text-[#e6edf3]">cursor-agent</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="#29B5E8" label="snowflake" />
              <Label color="#7CC5DC" label="cortex-verified" />
              <Label color="#FF694A" label="dbt" />
              <Label color="#A371F7" label="modernization" />
              <Label color="#7D8590" label="portfolio-1-of-247" />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-5202 (Jira)</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-5201 epic</p>
            </div>
          </SidebarSection>
          <SidebarSection title="Milestone">
            <p className="text-[#e6edf3]">ELT modernization Q2</p>
          </SidebarSection>
          <SidebarSection title="2 participants">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrTab({
  label,
  count,
  active,
  icon,
}: {
  label: string;
  count?: string;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`px-4 py-3 flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrComment({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      {children}
    </div>
  );
}

function PrCommentHeader({
  author,
  bot,
  label,
  time,
}: {
  author: string;
  bot?: boolean;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#151b23]">
      <div className="flex items-center gap-2 text-[13px]">
        <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-[10px] font-bold">{author[0].toUpperCase()}</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">{author}</span>
        {bot && <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">bot</span>}
        <span className="text-[#7d8590]">{label} · {time}</span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({ name, detail, duration }: { name: string; detail: string; duration: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Check className="w-4 h-4 text-[#3fb950] shrink-0" />
      <span className="font-mono text-[12.5px] text-[#e6edf3] font-medium">{name}</span>
      <span className="text-[#7d8590] truncate">{detail}</span>
      <span className="ml-auto text-[#7d8590] font-mono text-[11.5px]">{duration}</span>
      <span className="text-[#4493f8] text-[11.5px] hover:underline cursor-pointer">Details</span>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#30363d] pb-4">
      <div className="flex items-center justify-between mb-2 text-[#7d8590]">
        <span className="font-semibold">{title}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
}

function SidebarRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[13px]">{children}</div>;
}

function Label({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {label}
    </span>
  );
}
