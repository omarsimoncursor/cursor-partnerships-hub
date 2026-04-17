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
          <NavTab label="Issues" count="3" />
          <NavTab label="Pull requests" count="2" active />
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
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            feat(migration): customer RFM segmentation — Oracle PL/SQL → Databricks DLT (1/312)
            <span className="text-[#7d8590] ml-2 font-light">#241</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8957e5] text-white text-[13px] font-medium">
            <GitMerge className="w-4 h-4" />
            Merged
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">maria-rodriguez</span> merged{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">2 commits</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">main</span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">feat/migrate-customer-rfm-segmentation</span>{' '}
            <span className="text-[#7d8590]">on Day 2 · cutover Day 18</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="3" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="1" />
          <PrTab label="Checks" count="4" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="4" />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="Day 0 · 09:55" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  First workflow migration off ACME&apos;s legacy data platform.
                  Translates the Oracle 19c stored procedure{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">acme_dw.customer_rfm_segmentation</code>{' '}
                  and its Informatica PowerCenter companion{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">wf_m_customer_rfm.xml</code>{' '}
                  into a Databricks DLT pipeline, a SQL model, and Unity Catalog grants — running on Photon-enabled DBR 14.3 LTS. Output is verified row-equivalent against the Oracle source on a 1% sample.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Before / after</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Metric</th>
                        <th className="px-3 py-2 text-right font-semibold">Oracle / Informatica</th>
                        <th className="px-3 py-2 text-right font-semibold">Databricks</th>
                        <th className="px-3 py-2 text-right font-semibold">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Full-refresh runtime</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">8m 12s</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">14.3s</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">34× faster</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Compute cost / refresh</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">~$1,400 Oracle CPU + Informatica</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">$0.42 DBU</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−99.97%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Engineering cost / workflow</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">$71,200 GSI fixed-bid</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">~$2,400 internal</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−97%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Calendar time / workflow</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">~12 weeks</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">~18 days</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−78%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Annual platform cost</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">$14.7M on-prem</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">$3.9M Databricks</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−73%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Row delta (1% sample)</td>
                        <td className="px-3 py-2 text-right font-mono">—</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">equivalent</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Monetary Σ delta</td>
                        <td className="px-3 py-2 text-right font-mono">—</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">$0.00</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">equivalent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Lifecycle (this workflow, end-to-end)</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Phase</th>
                        <th className="px-3 py-2 text-left font-semibold">Calendar</th>
                        <th className="px-3 py-2 text-left font-semibold">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2">Agent compute</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">Day 0 · ~40 min</td>
                        <td className="px-3 py-2 text-[#7d8590]">Cursor agent (autonomous)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Code review</td>
                        <td className="px-3 py-2 font-mono">Day 0–2</td>
                        <td className="px-3 py-2 text-[#7d8590]">@maria.rodriguez (data-platform)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">DLT shadow / parallel run</td>
                        <td className="px-3 py-2 font-mono">Day 2–16 (2 weekly refreshes)</td>
                        <td className="px-3 py-2 text-[#7d8590]">Pipeline (unattended)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Stakeholder sign-off</td>
                        <td className="px-3 py-2 font-mono">Day 16–17</td>
                        <td className="px-3 py-2 text-[#7d8590]">@derek.tan · @priya.iyer · @sam.koh</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">CAB-approved cutover</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">Day 18 · ~1 hour</td>
                        <td className="px-3 py-2 text-[#7d8590]">Data-platform on-call</td>
                      </tr>
                      <tr className="bg-[#0d1117]">
                        <td className="px-3 py-2 font-semibold">End-to-end</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950] font-semibold">~18 days</td>
                        <td className="px-3 py-2 text-[#7d8590]">vs GSI ~12 weeks per workflow</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[12.5px] text-[#7d8590] mt-2">
                  Cursor compresses the <em>engineering</em>; the change-management gates a regulated data platform requires (review, parallel run, sign-off, CAB) still happen.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Portfolio progress</h3>
                <p>
                  <strong className="font-semibold">1 / 312</strong> Informatica workflows migrated end-to-end. With ~12 workflows in flight at any time across 2 squads, the portfolio finishes in{' '}
                  <strong className="font-semibold text-[#3fb950]">~18 months</strong> (vs GSI baseline 5 years / $22M).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Idiom mapping</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Oracle idiom</th>
                        <th className="px-3 py-2 text-left font-semibold">Databricks equivalent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#f85149]">CURSOR ... FETCH LOOP</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">SELECT ... ROW_NUMBER() OVER (...)</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#f85149]">GLOBAL TEMPORARY TABLE</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">@dlt.table silver</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#f85149]">MERGE INTO ... USING</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">MERGE INTO delta.customers</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#f85149]">CONNECT BY PRIOR</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">WITH RECURSIVE CTE</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#f85149]">NVL / DECODE</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">COALESCE / CASE WHEN</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#f85149]">TO_CHAR(date, &apos;YYYYMM&apos;)</td>
                        <td className="px-3 py-2 font-mono text-[#3fb950]">DATE_FORMAT(date, &apos;yyyyMM&apos;)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span className="bg-[#301216] text-[#f85149]">{`- CURSOR c_customers IS
-   SELECT c.customer_id,
-          NVL(MAX(o.order_dt), DATE '1900-01-01'),
-          COUNT(o.order_id),
-          NVL(SUM(o.gross_amount), 0)
-     FROM acme_dw.customers c
-     LEFT JOIN acme_dw.orders o
-       ON o.customer_id = c.customer_id
-      AND o.order_dt   >= ADD_MONTHS(p_run_date, -24)
-    WHERE c.status_cd IN ('A','H')
-    ORDER BY c.customer_id;
- OPEN c_customers; LOOP
-   FETCH c_customers INTO r_cust.customer_id, ...
-   EXIT WHEN c_customers%NOTFOUND;
-   INSERT INTO tmp_rfm_scores VALUES (...);
- END LOOP; CLOSE c_customers;
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+ @dlt.table(
+     name="rfm_scores_silver",
+     comment="RFM staging — replaces Oracle tmp_rfm_scores + cursor loop",
+ )
+ def rfm_scores_silver() -> DataFrame:
+     customers = dlt.read("customers_bronze")
+     orders    = dlt.read("orders_bronze")
+     scored = (
+         customers.alias("c")
+             .join(orders.alias("o"),
+                   (col("o.customer_id") == col("c.customer_id"))
+                 & (col("o.order_dt")   >= add_months(lit(run_date), -24)),
+                   "left")
+             .filter(col("c.status_cd").isin("A", "H"))
+             .groupBy("c.customer_id")
+             .agg(
+                 coalesce(max("o.order_dt"), lit("1900-01-01")).alias("last_order_dt"),
+                 count("o.order_id").alias("order_count"),
+                 coalesce(spark_sum("o.gross_amount"), lit(0)).alias("gross_sales"),
+             )
+     )
+     return scored.withColumn(
+         "r_score", ntile(5).over(Window.orderBy(col("recency_days").asc()))
+     )
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Databricks job: <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">acme-dw-prod / job 4472</span> · SUCCESS in 42.7s · 14.2M input rows · 3.1M output rows
                  </li>
                  <li>
                    DLT pipeline: <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">customer_rfm_pipeline</span> · Photon enabled · DBR 14.3 LTS
                  </li>
                  <li>
                    Row-equivalence harness: <span className="text-[#3fb950]">row delta 0 · monetary Σ delta $0.00 · quintile drift 0%</span>
                  </li>
                  <li>
                    Photon vs Oracle (1% sample): <span className="text-[#3fb950]">Oracle 8m 12s → Databricks 14.3s (34× faster)</span>
                  </li>
                  <li>
                    Jira: <span className="text-[#4493f8] hover:underline cursor-pointer">CUR-5102</span> · Epic <span className="text-[#4493f8] hover:underline cursor-pointer">CUR-5101</span>
                  </li>
                  <li>
                    Typecheck: <span className="text-[#3fb950]">✓</span> · <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">databricks bundle validate</code>: <span className="text-[#3fb950]">✓</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 4 new files · 0 modifications to Oracle source during cutover window</li>
                  <li>Type surface: unchanged — same natural keys, same output columns, same DECODE segment map</li>
                  <li>Rollback: <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">git revert HEAD</code> · Oracle source remains authoritative until promotion</li>
                  <li>Watchlist: recursive CTE depth capped at 8 to match Oracle <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">CONNECT BY</code> semantics on ACME tier data</li>
                </ul>
              </section>
            </div>
          </PrComment>

          {/* Review */}
          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved — output-equivalent to Oracle source
              <span className="ml-1">· just now</span>
            </p>
          </div>

          {/* Checks */}
          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">All checks have passed</span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">Show all checks</button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="4s" />
              <CheckRow name="databricks-bundle-validate" detail="asset bundle v1.12.3" duration="7s" />
              <CheckRow name="row-delta-harness" detail="0 delta · 14.2M rows · 1% Oracle sample" duration="18s" />
              <CheckRow name="photon-perf-vs-oracle" detail="Oracle 8m 12s → Databricks 14.3s · 34× faster" duration="9s" />
            </div>
          </PrComment>

          {/* Merge box */}
          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#8957e5]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  Pull request successfully merged on Day 2 · cutover completed on Day 18
                </p>
                <p className="text-[12.5px] text-[#7d8590]">
                  Promoted dev → staging on merge. Promoted staging → prod on Day 18 03:15 PDT after 2-week DLT shadow run + 3 stakeholder sign-offs + CAB approval.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-md bg-[#8957e5]/20 border border-[#8957e5]/40 text-[#a371f7] text-[12.5px] font-medium">
                Cutover · Day 18
              </span>
            </div>
          </PrComment>
        </div>

        {/* Sidebar */}
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
              <Label color="#FF6B55" label="migration" />
              <Label color="#A371F7" label="oracle-to-databricks" />
              <Label color="#2188ff" label="dlt" />
              <Label color="#F5A623" label="unity-catalog" />
              <Label color="#7D8590" label="portfolio-1-of-312" />
            </div>
          </SidebarSection>
          <SidebarSection title="Files changed (4)">
            <div className="space-y-1.5 text-[12px] font-mono">
              <p className="text-[#3fb950]">+ databricks/customer_rfm_pipeline.py</p>
              <p className="text-[#3fb950]">+ databricks/customer_rfm.sql</p>
              <p className="text-[#3fb950]">+ databricks/unity_catalog_grants.sql</p>
              <p className="text-[#3fb950]">+ databricks.yml</p>
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to an issue</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-5102 (Jira)</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">customer_rfm_pipeline (Databricks)</p>
            </div>
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
