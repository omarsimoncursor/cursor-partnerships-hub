# Snowflake Live Migration & Modernization Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/snowflake/demo`, patterned on the existing Sentry demo at `/partnerships/sentry/demo` and the companion Datadog demo at `/partnerships/datadog/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes **Snowflake + Cursor** orchestration end-to-end. The star of the show is a real legacy-ELT modernization (Teradata BTEQ + Informatica → Snowflake + dbt + Cortex AI) that Cursor compresses from years of incumbent-GSI work into minutes:

1. A user lands on `/partnerships/snowflake/demo` and clicks a button to run a realistic workflow ("Run data freshness audit" on a mock Teradata warehouse).
2. The workflow is intentionally heavy — it actually reads a real Teradata BTEQ script and a SQL Server stored procedure from disk, simulates ~5s of analysis, then pivots to a full-screen **ELT Platform Risk** takeover surfacing the dialect-lock-in cost and the incumbent GSI's 4-year, $18M migration quote.
3. A mocked Snowflake event fires a webhook and a scripted agent console plays on the right half of the screen: Snowflake MCP → Opus triage (BTEQ + T-SQL idioms) → GitHub MCP → Composer edit (BTEQ → dbt model + Snowflake SQL) → Codex + Cortex AI review (output equivalence + semantic drift check) → shell verify (`dbt run --target dev` against a Snowflake dev database) → PR opened → Jira ticket updated.
4. When the run completes, the user can click through four pixel-perfect artifact modals: **Snowsight workspace** (Worksheets + query history + warehouse panel + Cortex AI), **Migration triage report**, **Jira ticket**, and **GitHub PR** (inside a MacBook frame).
5. A reset button returns the demo to clean state. `scripts/reset-snowflake-demo.sh` re-seeds the legacy files after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying legacy files and the reset are real.

> **Run the local dev server on port `3102`** (`PORT=3102 npm run dev`) during development and verification. The main app runs on `3000`; the Sentry/Datadog/Figma demos assume `3000`. The Databricks demo uses `3101`. Keeping Snowflake on `3102` avoids collisions with the other partner-demo build agents working in parallel.

---

## 1. Partner-rep positioning (audience #1 — read this first)

**This demo is being built so Snowflake Account Executives can hand it to their customers.** The primary viewer is a Snowflake AE. The secondary viewer is the customer the AE plays it for. Every piece of copy, every metric, every artifact must reinforce the Snowflake AE's narrative.

### The AE's problem (what keeps them from retiring quota)

Large enterprise customers — retail, CPG, telco, financial services — sit on top of a decade of Teradata BTEQ scripts, SQL Server stored procedures, Informatica mappings, and on-prem SSIS/DataStage ETL. A representative account:

- **$4–12M per year** on Teradata maintenance + Informatica licensing + on-prem hardware.
- **Thousands** of BTEQ scripts, T-SQL stored procs, and Informatica mappings encoding years of business logic that only two remaining team members can read.
- **A $15–20M, 4-year migration quote** from a GSI that the CFO won't sign and the data team can't staff.
- An analytics organization that *wants* Snowflake (Cortex AI, Horizon, Snowpark, secure data sharing) but can't get past the migration wall.

**Result:** the Snowflake AE has a warm account that can't close. Credits don't flow until workloads land. **No migration = no credits consumed = no quota retirement.**

### What Cursor unlocks for the Snowflake AE

The pitch the demo must make to the AE is:

1. **Credits start flowing sooner.** Every dialect-specific BTEQ or T-SQL asset Cursor modernizes into a dbt model + Snowflake SQL is a workload that can execute on Snowflake *now*. At a $6M/yr steady-state target, compressing a 4-year migration to ~~15 months is worth **~~$16M in pulled-forward credits per account**.
2. **Win-rate lift against Databricks and BigQuery.** Snowflake loses bake-offs when "speed of migration" is the decisive factor. Cursor changes the ground-truth on that axis.
3. **Cortex / Snowpark adoption accelerates.** Modernized code can immediately use Cortex AI functions, SEARCH/SUMMARIZE/COMPLETE, Snowpark Python, dynamic tables, streams & tasks — the native features that drive credit expansion.
4. **Customer's own team stays on the keyboard.** No GSI middleman. The account stays clean for account expansion and data-sharing listings in the Marketplace.

### How the demo reinforces this

- The **Full-screen "ELT Platform Risk"** page surfaces the GSI baseline (years / millions) vs the Cursor baseline (months / fraction) in numbers the AE can quote verbatim.
- The **agent console** narrates the migration in Snowflake vocabulary (Snowsight, warehouse, Cortex AI, Snowpark, dynamic tables, streams, tasks, dbt Cloud / dbt Core) so the AE's prospect hears their own platform.
- The **artifact PR** includes a before/after credits table (Teradata CPU + Informatica agent licensing → Snowflake credits) that the AE can drop straight into a QBR or ROI deck.
- A dedicated **"For the Snowflake AE"** card on the idle page spells out the partner-rep value in three bullets (pulled-forward credits, unblocked deals, Cortex adoption pull-through) so the rep knows *why* they're playing this.

If you find yourself writing copy that sounds like it's aimed at Cursor's own buyer, rewrite it. **The buyer in this demo is the Snowflake customer, being sold to by a Snowflake AE.**

---

## 2. Why this is being built

There is no `/partnerships/snowflake` scroll page yet — this is the first surface. Like Databricks, Snowflake gets an interactive demo as its flagship partner surface. A simple CTA page at `/partnerships/snowflake` (hero + "Run the live modernization demo" pill + rep-value bullets + guardrails summary) suffices; the meat is in the demo.

The story is different from the other partner demos:

- Sentry = **runtime crash**, fix via null-guards.
- Datadog = **performance regression**, fix via parallelism.
- Figma = **visual fidelity drift**, fix via token substitution.
- Databricks = **platform migration** (Informatica/Oracle → Databricks DLT).
- **Snowflake = ELT modernization** (Teradata BTEQ + SQL Server T-SQL + Informatica → Snowflake-native SQL + dbt + Cortex AI).

The surface must feel on-brand for Snowflake (Snowflake blue `#29B5E8`, navy `#11567F`, Snowsight chrome, Cortex AI terminology) — not a reskin of another partner demo.

---

## 3. Required reading (in this repo, in order)

Before you write any code, study the reference demos.

**Page + state machine (primary reference):**

- `src/app/partnerships/sentry/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`), three conditional regions, artifact modal dispatch.
- `src/app/partnerships/datadog/demo/page.tsx` — the same machine adapted to a non-crash story. Closest shape to this brief.

**Components:**

- `src/components/sentry-demo/agent-console.tsx` — **single most important file**. Scripted step playback with channel-coded rows, timestamps, `delayMs`, `TIME_SCALE`, `onComplete`.
- `src/components/datadog-demo/agent-console.tsx` — fork with non-crash channels; pattern your channel palette after this.
- `src/components/sentry-demo/checkout-card.tsx` + `src/components/datadog-demo/reports-card.tsx` — trigger UI patterns.
- `src/components/sentry-demo/demo-error-boundary.tsx` + `src/components/datadog-demo/demo-perf-boundary.tsx` — phase-transition wiring.
- `src/components/sentry-demo/full-error-page.tsx` + `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeover pattern.
- `src/components/sentry-demo/error-fallback.tsx` + `src/components/datadog-demo/slo-summary.tsx` — split-screen left-panel pattern.
- `src/components/sentry-demo/artifact-cards.tsx` + `src/components/datadog-demo/artifact-cards.tsx` — 4-tile CTA strip.
- `src/components/sentry-demo/artifacts/{macbook-frame,github-pr-preview,pr-modal,jira-ticket,triage-report}.tsx` — reusable artifact scaffolding.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — **the benchmark for pixel-perfect partner-native UI.** The Snowsight workspace modal must match this level of detail.

**Trigger code (the real files):**

- `src/lib/demo/order-processor.ts` + `src/lib/demo/format-payment.ts` (Sentry) — two-file pattern.
- `src/lib/demo/aggregate-orders.ts` + `src/lib/demo/region-store.ts` (Datadog) — closer shape: real code producing a visible outcome.

**Webhook + reset:**

- `src/app/api/sentry-webhook/route.ts` and `src/app/api/datadog-webhook/route.ts` — signature verification, Cursor Background Agent trigger, `buildAgentPrompt`.
- `scripts/reset-sentry-demo.sh` and `scripts/reset-datadog-demo.sh` — pattern for re-seeding the starting state.

---

## 4. What the Sentry/Datadog demos do (pattern summary)


| Phase      | What renders                                                                     |
| ---------- | -------------------------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + trigger card + rep-value card + cost comparison + guardrails.  |
| `error`    | Full-screen takeover with "Watch Cursor do it" + "Reset". Hides everything else. |
| `running`  | Split screen: compact summary left, `AgentConsole` right. Scripted steps stream. |
| `complete` | Same split screen + 4-tile `ArtifactCards` strip. Top banner flips to success.   |


Artifact modals are overlays, closable, self-contained, all wrapped in `MacbookFrame`.

Agent console `SCRIPT` is a `Step[]` with `channel`, `label`, `detail`, `delayMs`. Real time ~19s, scaled to ~2min displayed via `TIME_SCALE = 6.9`.

**Replicate this pattern exactly. Only change vocabulary, visuals, and the trigger files.**

---

## 5. The Snowflake demo — concept & story

### The trigger scenario

**Surface UI:** A "Data freshness audit" mini-app on the demo page. The hero card looks like:

> **Run ELT freshness audit**
> Source: Teradata 17 · BTEQ script `daily_revenue_rollup.bteq`
> Companion: SQL Server 2019 · stored proc `usp_enrich_customers_360`
> Target: Snowflake · dbt + Cortex AI · daily DAG
> `[ Run audit ]`

Below the button, render a tabbed "editor" with three tabs:

1. `daily_revenue_rollup.bteq` — real, vendor-specific Teradata syntax (QUALIFY, COLLECT STATS, TPT, recursive temp tables, MULTISET VOLATILE tables).
2. `usp_enrich_customers_360.sql` — real T-SQL stored proc with MERGE, CROSS APPLY, hierarchyid, OPENROWSET-style tricks.
3. `dataflow.ctl` — a short Informatica workflow stub (XML) or SSIS `.dtsx` fragment to complete the "three-headed legacy ELT" picture.

When clicked, the card shows a ~5s loading state ("Scanning BTEQ repository…", "Parsing T-SQL semantics…", "Correlating Informatica lineage…", "Estimating modernization scope…"), then pivots to the full-screen **ELT Platform Risk** takeover.

### The real legacy files

Create `src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq` — **a real, working Teradata BTEQ script** that computes a daily revenue rollup across regions, currencies, and product hierarchies. It must:

- Use BTEQ directives (`.LOGON`, `.SET`, `.IF ERRORCODE`, `.QUIT`).
- Use a `MULTISET VOLATILE TABLE ... ON COMMIT PRESERVE ROWS`.
- Use `QUALIFY ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...) = 1`.
- Use `COLLECT STATISTICS`.
- Use Teradata-style date math (`ADD_MONTHS`, `(DATE - 1)`).
- Be 180–240 lines, annotated with `-- LEGACY:` comments marking the 5–7 idioms Cursor will rewrite.

Create `src/lib/demo/legacy-sqlserver/usp_enrich_customers_360.sql` — **a real, working T-SQL stored procedure** that enriches a customer-360 view. It must use:

- `CREATE PROCEDURE ... AS BEGIN ... END`
- `MERGE INTO ... USING ... WHEN MATCHED ... WHEN NOT MATCHED BY TARGET`
- `CROSS APPLY`, `OUTER APPLY`
- `OPENJSON` / `FOR JSON PATH`
- `DATETIME2` + `SYSDATETIMEOFFSET()`
- Be 120–180 lines, annotated similarly.

Also create `src/lib/demo/legacy-informatica/wf_customers_360.xml` — a short (~40-line) Informatica mapping stub so the story can surface "and 184 of these" in the scope numbers.

### The mock "audit" API

`src/app/api/audit/run/route.ts` — reads the legacy files from disk (server-side, `node:fs`), counts lines, tags idioms, simulates ~5s of work with real `await`/`setTimeout`, returns a JSON scope payload:

```ts
{
  legacyLoc: 63_180,                      // project-scale, scripted
  filesAnalyzed: { bteq: 247, tsql: 412, informatica: 184, ssis: 68 },
  dialectIdioms: ['QUALIFY', 'COLLECT STATS', 'MULTISET VOLATILE', 'MERGE', 'CROSS APPLY', 'OPENJSON', 'Teradata date math'],
  gsiBaseline: { years: 4, usd: 18_000_000 },
  cursorBaseline: { months: 15, usd: 5_400_000 },
  annualLegacyCost: 8_200_000,            // Teradata + Informatica + SSIS ops
  proposedAnnualSnowflakeCost: 2_300_000, // Snowflake credits at steady state
  brokenPipelineCount: 4,
  stalestPipelineHours: 14,
  firstScriptToMigrate: 'daily_revenue_rollup',
}
```

The trigger card then `throws new EltRiskError(payload)` which `DemoEltBoundary` catches to flip phase → `error`. Exactly like Datadog's `SloBreachError`.

### Full-screen ELT Platform Risk (FullErrorPage equivalent)

Brand it:

- Snowflake blue `#29B5E8` accent (hero glyph, CTAs).
- Navy `#11567F` deep panels.
- Pale cyan `#E5F6FB` for soft info strips.

Content:

- **Heading:** `Legacy ELT risk: 4 broken pipelines, 14h stale revenue data, $8.2M/yr to keep it limping`
- **Subhead:** `63,180 lines across Teradata BTEQ (247), T-SQL (412), Informatica (184), SSIS (68) · last successful daily rollup: 14h 22m ago`
- **Grid of 4 metric tiles:**
  1. GSI baseline (4 years / $18M)
  2. Cursor-accelerated baseline (15 months / $5.4M)
  3. Pulled-forward credits for the Snowflake AE (`~$16M in credits, 33 months earlier`)
  4. Annual run cost swing ($8.2M legacy → $2.3M Snowflake credits)
- **Callout strip:** `Proof: watch Cursor modernize one BTEQ + one T-SQL proc into a Snowflake-native dbt DAG in ~2 minutes, with Cortex-verified output equivalence.`
- **CTAs:** `[ ▶ Watch Cursor modernize this ]`   `[ ↺ Reset ]`

### The orchestration (scripted console playback)

Channels your `SCRIPT` needs:


| Channel     | Label                  | Hex accent | Role in the story                                                       |
| ----------- | ---------------------- | ---------- | ----------------------------------------------------------------------- |
| `snowflake` | `snowflake-mcp`        | `#29B5E8`  | Fetch account, warehouses, databases, schemas, query history            |
| `cortex`    | `cortex · ai`          | `#7CC5DC`  | Semantic equivalence check, summary generation via Cortex AI            |
| `dbt`       | `dbt`                  | `#FF694A`  | dbt compile / run / test                                                |
| `github`    | `github-mcp`           | (white)    | Commit history, branch, PR                                              |
| `jira`      | `jira-mcp`             | `#4C9AFF`  | Modernization epic + subtask                                            |
| `shell`     | `shell`                | green      | `snow sql`, `dbt run`, `tsc`, `git`                                     |
| `opus`      | `opus · triage`        | `#D97757`  | Long-context reasoning over BTEQ + T-SQL + Informatica                  |
| `composer`  | `composer · modernize` | blue       | BTEQ → dbt model; T-SQL proc → Snowflake stored proc; Informatica → dbt |
| `codex`     | `codex · review`       | `#10a37f`  | Query plan diff, row-level diff, semantic drift review                  |
| `codegen`   | `codegen`              | blue       | Triage / modernization report generation                                |
| `done`      | `complete`             | green      | Terminal step                                                           |


**Target script arc (~27–32 steps, ~19–22s real, scaled via `TIME_SCALE` to ~2 min displayed):**

1. **Intake (snowflake):** Connect to account `acme-analytics` → list databases (`prod_analytics`, `dev_analytics`) → list warehouses (`XS_MODERNIZATION_WH`) → verify Cortex entitlement → fetch recent query history on the `fct_daily_revenue` surface.
2. **Scope (snowflake):** Inventory the legacy repo: 247 BTEQ, 412 T-SQL, 184 Informatica, 68 SSIS. Pick first asset: `daily_revenue_rollup.bteq`.
3. **Opus triage (opus):** Reads both legacy files. Identifies idioms: `QUALIFY`, `COLLECT STATS`, `MULTISET VOLATILE`, Teradata date math in BTEQ; `MERGE`, `CROSS APPLY`, `OPENJSON`, `DATETIME2` in T-SQL. Maps each to Snowflake-native / dbt equivalents. Writes a migration plan.
4. **Git history hunt (github):** Last BTEQ commit is 2.3 years old. T-SQL proc last touched 11 months ago. Commit SHAs cited.
5. **Triage report (codegen):** Writes `docs/modernization/2026-04-17-daily-revenue-rollup.md` with idiom-by-idiom plan and the verification approach (Cortex-AI semantic diff + row-level equivalence on a 1% sample).
6. **Composer edit — BTEQ → dbt model (composer):** Emits `models/fct_daily_revenue.sql` (staging + fct + tests), replacing `MULTISET VOLATILE` with CTEs, `QUALIFY` with Snowflake-native `QUALIFY ROW_NUMBER()`, `COLLECT STATS` with automatic Snowflake micro-partition stats.
7. **Composer edit — T-SQL proc → Snowflake stored proc (composer):** Emits a Snowflake JavaScript / Snowpark Python procedure replacing `MERGE` with Snowflake `MERGE INTO`, `CROSS APPLY` with `LATERAL FLATTEN`, `OPENJSON` with `PARSE_JSON` + `FLATTEN`.
8. **Composer edit — Informatica mapping → dbt (composer):** Parses the Informatica XML, emits an equivalent dbt model + snapshot.
9. **Cortex semantic review (cortex):** Cortex `COMPLETE` compares the BTEQ output semantics to the dbt model semantics. Reports "No semantic drift detected. Hierarchies preserved. Date grain unchanged."
10. **Codex review (codex):** Generates a row-level equivalence harness. Reports `row delta: 0 · revenue Σ delta: $0.00 · top-10 customer rank drift: 0`.
11. **Shell verify (shell):**
  - `dbt compile` → ✓
    - `dbt run --target dev --select fct_daily_revenue` → 1 model, 12.8s
    - `dbt test --select fct_daily_revenue` → 14 passed
    - Snowflake query cost: `Teradata CPU-equivalent: 3,412 seconds · Snowflake XS warehouse: 12.8s · est. credits: 0.0042 · est. $ 0.0084`.
12. **PR (github):** Branch `feat/modernize-daily-revenue-rollup`. PR #318 opened. Title: `feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt (1/247)`.
13. **Jira update (jira):** Epic `CUR-5201` (ELT modernization) + subtask `CUR-5202` → `In Review`.
14. **Done:** Artifacts ready.

### The four artifact modals

All four render in a MacBook frame.

1. **Snowsight workspace modal** — **pixel-perfect Snowsight chrome**. Must include:
  - Top nav with Snowflake logomark (blue snowflake), account selector (`acme-analytics.us-east-1.aws`), role selector (`ANALYTICS_ENGINEER`), profile avatar.
  - **Left sidebar:** Snowsight navigation (`Worksheets`, `Dashboards`, `Notebooks`, `Streamlit`, `Data` (with Databases/Schemas tree), `Admin`, `AI & ML` (Cortex)). Use the correct iconography; Snowsight has a distinct density from Databricks and Datadog.
  - **Main pane tabs:** `Worksheet`, `Query history`, `dbt run output`, `Cortex review`, `Warehouse`. Default tab: **dbt run output** showing a successful `dbt run --select fct_daily_revenue` with the 12.8s timer, model status chips (green), and a small "data freshness" widget ("Last successful run: 2m ago").
  - **Right sidebar:**
    - Warehouse panel: `XS_MODERNIZATION_WH · Running · Auto-suspend 60s · Credits (1h): 0.083`.
    - "Cortex review" card: 3-sentence semantic summary output from `SNOWFLAKE.CORTEX.COMPLETE('mistral-large', ...)` with an "AI-generated" badge.
    - "Query profile" mini-chart (fan-out of a recent query execution DAG as inline SVG).
  - Bottom strip: a "Query history" table with 4 rows showing `BTEQ (Teradata) · 3412s` vs `dbt model (Snowflake) · 12.8s` to drive the point home visually.
  - Use Snowsight's actual chrome palette: near-white canvas `#F5F7FA`, navy sidebar accents `#11567F`, blue `#29B5E8` highlights, mono for SQL, sans for UI. Dark-mode allowed if on-brand.
2. **Migration triage report modal** — `react-markdown` + `remark-gfm`, Snowflake content:
  ```md
   # Modernization triage — daily_revenue_rollup (1/247)

   **Status:** Fix proposed · PR #318 · CUR-5202

   ## Scope (this asset)
   - Source A: Teradata 17 BTEQ · 214 LOC · 3 dialect idioms
   - Source B: SQL Server 2019 T-SQL stored proc · 156 LOC · 4 dialect idioms
   - Companion: Informatica mapping `wf_customers_360.xml` · 6 transforms
   - Target: Snowflake + dbt (staging/fct + tests) + Cortex-verified semantics

   ## Idiom mapping
   | Legacy idiom | Snowflake equivalent |
   | --- | --- |
   | `QUALIFY ROW_NUMBER() OVER(...)` (Teradata) | `QUALIFY ROW_NUMBER() OVER(...)` (Snowflake, native) |
   | `MULTISET VOLATILE ... ON COMMIT PRESERVE ROWS` | CTE or transient temp table |
   | `COLLECT STATISTICS` | automatic micro-partition stats |
   | `MERGE ... WHEN MATCHED BY TARGET` (T-SQL) | `MERGE INTO target USING src` (Snowflake) |
   | `CROSS APPLY` | `LATERAL FLATTEN(INPUT => ...)` |
   | `OPENJSON` | `PARSE_JSON` + `FLATTEN` |
   | Teradata date math | `DATEADD`, `DATE_TRUNC` |

   ## Verification
   - Cortex semantic diff: no drift
   - Row delta (1% sample): 0
   - Revenue Σ delta: $0.00
   - Top-10 customer rank drift: 0
   - Latency: Teradata 3,412s → Snowflake XS WH 12.8s (**266× faster**)

   ## Economics (this asset only)
   - GSI line-item: $58,000 · 2 weeks
   - Cursor: $0 license · 2 minutes compute · 0.0042 credits ($0.0084)

   ## Portfolio context
   - 1 of 247 BTEQ scripts + 412 T-SQL procs modernized.
   - GSI equivalent: 4 years, $18M.
  ```
3. **Jira ticket modal** — pixel-perfect Jira, ticket `CUR-5202`, type "Modernization Task", parent epic `CUR-5201 ELT Modernization`, P1. Include `linked PR`, `linked Snowflake dbt run URL` (text, non-functional), `components: Data/Analytics`, assignee, status timeline `To Do → In Progress → In Review`.
4. **GitHub PR modal** — wrapped in MacBook. PR #318. Title: `feat(dw): daily revenue rollup — Teradata BTEQ → Snowflake + dbt (1/247)`. Body must include:
  - A before/after credits + latency table (Teradata + Informatica annual license line-item vs Snowflake credits).
  - A `Portfolio progress` line: `1 / 247 BTEQ + 412 T-SQL assets modernized. Est. portfolio finish: 15 months (vs GSI baseline 4 years).`
  - Files changed (5): `models/staging/stg_revenue_events.sql`, `models/marts/fct_daily_revenue.sql`, `tests/fct_daily_revenue.yml`, `macros/cortex_semantic_diff.sql`, `snowflake_procs/usp_enrich_customers_360.js`.
  - Diff excerpt showing the BTEQ `QUALIFY` + `MULTISET VOLATILE` block next to the dbt model replacement.
  - CI checks: `dbt compile ✓`, `dbt test (14) ✓`, `cortex semantic diff ✓`, `row-delta harness ✓`.
  - Reviewer banner: "Verified by Cursor agent + Cortex AI · semantically equivalent to Teradata source".

### Branding

- **Primary accent:** Snowflake blue `#29B5E8` — hero glyph, CTA emphasis, workspace logo.
- **Surface:** Navy `#11567F` deep panels; pale cyan `#E5F6FB` for soft info strips.
- **Success:** Green `#4ADE80` (keep it warm, not lime — Snowflake's success palette is cooler than Databricks Photon green).
- **Typography:** Match existing theme — sans for prose, mono for SQL / credit numbers.
- **Avoid:**
  - Don't copy Databricks brick-red `#FF3621`, AWS orange `#FF9900`, Datadog purple `#632CA6`, Sentry purple `#362D59`.
  - Don't use a generic "SQL editor" visual — it must read unmistakably as *Snowsight* (Warehouses, Cortex, dbt, Query history).

---

## 6. Files to create

```
src/app/partnerships/snowflake/page.tsx                               NEW  (minimal CTA page — hero + "Run live modernization demo" pill + 3 rep-value bullets + guardrails summary)
src/app/partnerships/snowflake/demo/page.tsx                          NEW  (state machine)
src/app/api/snowflake-webhook/route.ts                                NEW
src/app/api/audit/run/route.ts                                        NEW  (~5s scope-audit endpoint)

src/components/snowflake-demo/audit-card.tsx                          NEW  (trigger UI — tabbed editor w/ BTEQ + T-SQL + Informatica + Run button)
src/components/snowflake-demo/demo-elt-boundary.tsx                   NEW
src/components/snowflake-demo/full-elt-risk-page.tsx                  NEW  (FullErrorPage equivalent)
src/components/snowflake-demo/elt-summary.tsx                         NEW  (ErrorFallback equivalent, split-screen left)
src/components/snowflake-demo/agent-console.tsx                       NEW  (Snowflake channels + script)
src/components/snowflake-demo/artifact-cards.tsx                      NEW
src/components/snowflake-demo/credits-comparison.tsx                  NEW  (CostComparison equivalent — Teradata/Informatica TCO vs Snowflake credits + pulled-forward AE credits)
src/components/snowflake-demo/rep-value-card.tsx                      NEW  (three-bullet "For the Snowflake AE")
src/components/snowflake-demo/guardrails-panel.tsx                    NEW  (row-equivalence, Cortex semantic diff, no silent schema changes, human-approved PR)
src/components/snowflake-demo/artifacts/snowsight-workspace.tsx       NEW  (pixel-perfect Snowsight chrome)
src/components/snowflake-demo/artifacts/snowflake-modal.tsx           NEW  (wraps workspace in MacBook)
src/components/snowflake-demo/artifacts/triage-report.tsx             NEW
src/components/snowflake-demo/artifacts/jira-ticket.tsx               NEW  (CUR-5202)
src/components/snowflake-demo/artifacts/github-pr-preview.tsx         NEW
src/components/snowflake-demo/artifacts/pr-modal.tsx                  NEW
src/components/snowflake-demo/artifacts/macbook-frame.tsx             NEW  (fork; or import from shared/)

src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq                NEW  (real BTEQ)
src/lib/demo/legacy-sqlserver/usp_enrich_customers_360.sql            NEW  (real T-SQL proc)
src/lib/demo/legacy-informatica/wf_customers_360.xml                  NEW  (mapping stub)
src/lib/demo/legacy-teradata/index.ts                                 NEW  (fs reader + idiom tagger used by the audit route)

scripts/reset-snowflake-demo.sh                                       NEW  (re-seeds the legacy files + verifies they parse)
```

**Also:**

- Update the top-level partnership grid (`src/components/sections/partnerships.tsx`) to include a Snowflake tile linking to `/partnerships/snowflake`.
- Reuse the promoted `src/components/shared/macbook-frame.tsx` if it exists; otherwise fork the Sentry one.

---

## 7. Implementation order (recommended)

1. **Scaffold the CTA page + demo route** — `partnerships/snowflake/page.tsx` and `partnerships/snowflake/demo/page.tsx` (state machine cloned from Datadog).
2. **Ship the legacy files + audit API** — real BTEQ + real T-SQL + Informatica stub + `/api/audit/run`. Verify the button really takes ~5s.
3. **Wire the boundary + full-screen ELT Risk page** — four metric tiles, rep value framing, CTAs.
4. **Build the agent console** — fork Datadog's, add Snowflake channels (including `cortex` and `dbt`), write the ~30-step SCRIPT.
5. **Build artifact modals in this order:** PR → Jira → Triage report → **Snowsight workspace** (save for last; hero artifact; spend the time).
6. **Side content** — credits comparison (Teradata + Informatica TCO → Snowflake credits + pulled-forward AE credits), rep-value card, guardrails panel, CTA pill.
7. **Webhook route** — Snowflake webhook verification (Snowflake sends an HMAC-signed payload on Notification Integrations; fall back to a passcode-style scheme for the mock). `buildAgentPrompt` enforces the 9-step modernization sequence.
8. **Reset script + docs** — `scripts/reset-snowflake-demo.sh` restores legacy files from `HEAD`. Update `docs/partner-demos/README.md` if present.
9. **Typecheck + manual walkthrough on port `3102`** — `PORT=3102 npm run dev`, click through twice, confirm visual identity across runs.

---

## 8. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result. No real network calls during scripted playback. No `Math.random()` in displayed values.
- **Latency is real before the fix:** `/api/audit/run` must actually take ~5s.
- **Artifacts are fully self-contained:** No external links. Everything in-modal.
- **On-brand language:** "Snowsight", "Warehouse", "Cortex AI", "Snowpark", "dynamic tables", "streams & tasks", "dbt Cloud / dbt Core", "database.schema.table", "credits", "role", "secure data sharing", "Marketplace". Avoid Databricks terms ("Unity Catalog", "DLT", "Photon", "DBU"), AWS terms, Sentry/Datadog terms.
- **Single-page, no auth, no client-side API keys.**
- **Partner-rep framing is explicit** on the idle page.
- **Safety-by-default:** `buildAgentPrompt` enforces Cortex semantic diff + row-equivalence before PR open. No silent type changes. No warehouse-size creep. No dropping columns without a migration note.
- **Dev server port:** **3102**. If you find another local server on this port, kill it before starting. Do NOT run your dev server on `3000` (other demos) or `3101` (Databricks demo).

---

## 9. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/datadog-webhook/route.ts`. Replace with Snowflake vocabulary. Required steps, in order:

1. **Snowflake MCP intake.** Connect to the account. Read databases, schemas, warehouses, roles, Cortex entitlement, recent query history for the target mart.
2. **Legacy source read (shell).** Read the BTEQ script + T-SQL stored proc + any linked Informatica/SSIS companion end-to-end. Enumerate vendor-specific idioms (QUALIFY, MULTISET VOLATILE, COLLECT STATS, MERGE, CROSS APPLY, OPENJSON, Teradata/T-SQL date math).
3. **Regression / provenance hunt (GitHub MCP).** Identify the last commits touching the legacy files. Note in the PR body.
4. **Write modernization plan (codegen).** Produce `docs/modernization/<date>-<slug>.md` with the idiom mapping table, target dbt/Snowpark shape, and verification approach.
5. **Patch (shell + edit).** Emit dbt models (staging + fct + tests) + a Snowflake stored procedure (JS/Snowpark) + macros as needed + any Snowflake-native grants. Minimal diff. No behavioral widening.
6. **Static verify.** `dbt compile`, `dbt parse`, `tsc --noEmit` (for glue), `npm run lint`. Iterate until clean.
7. **Semantic + data verify.**
  - Cortex semantic diff via `SNOWFLAKE.CORTEX.COMPLETE` over the before/after model descriptions.
  - Row-equivalence harness against a 1% sample from the Teradata/SQL Server snapshot.
  - Must be `row delta = 0`, monetary sums match, no rank drift in top-N ordering, and Cortex semantic diff returns "no drift".
  - Local smoke must happen on `http://localhost:3102` (this demo's port), not `:3000`.
8. **Open PR (GitHub MCP).** Branch `feat/modernize-<slug>`. PR body must include the idiom mapping table, the Cortex semantic diff output, the row-equivalence harness result, latency + credits comparison, the portfolio progress line (`N / 659 assets modernized`), and a risk assessment.
9. **Jira update (Jira MCP).** Move the modernization-task subtask to `In Review`.

Be explicit: the agent **must** hit every step and cite evidence in the PR body. Determinism across real runs is the goal.

---

## 10. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/snowflake/demo` loads with hero + CTA pill + audit card showing visible legacy BTEQ/T-SQL.
- Clicking **Run audit** shows ~5s of scanning, then pivots to the full-screen ELT Platform Risk page.
- The Risk page clearly communicates the GSI baseline vs Cursor baseline and the Snowflake-AE upside (pulled-forward credits, unblocked deals, Cortex pull-through).
- Clicking **Watch Cursor modernize this** starts the scripted console playing ~30 channel-coded steps in ~19–22s real time with displayed timestamps scaling to ~2 minutes.
- Console completion transitions to `complete` and reveals four artifact cards.
- Each modal opens pixel-perfect and closes cleanly.
- The Snowsight workspace modal includes a credible Worksheet / dbt run / Cortex review / Warehouse panel — feels indistinguishable from real Snowsight at a glance.
- **Reset** returns the demo to clean `idle`.
- Two consecutive runs produce visually identical output.
- `npx tsc --noEmit` passes.
- No external links leak out of any modal.
- `scripts/reset-snowflake-demo.sh` restores the legacy BTEQ + T-SQL after a real PR merge.
- Demo dev server runs cleanly on `http://localhost:3102` and does not interfere with `:3000`, `:3101`, or `:3103`.

---

## 11. Anti-patterns / things to avoid

- ❌ **Don't** frame this as "fixing a bug". It's a **platform modernization**, not a bug-fix narrative.
- ❌ **Don't** reuse Databricks, AWS, Sentry, Datadog, or Figma accent colors in the hero. Snowflake blue only.
- ❌ **Don't** make the agent console non-deterministic. No `setTimeout(…, Math.random())`. No real HTTP during playback.
- ❌ **Don't** cheapen the Snowsight modal. Query history, Warehouse sizing, and Cortex review are the visual signatures.
- ❌ **Don't** delete or modify `src/components/{sentry-demo,datadog-demo,figma-demo,databricks-demo}/`. Fork via copy.
- ❌ **Don't** skip the partner-rep framing.
- ❌ **Don't** hardcode API keys or DSNs anywhere in client code.
- ❌ **Don't** run your dev server on `:3000`, `:3101`, or `:3103`. Use `:3102` as assigned.
- ❌ **Don't** make the BTEQ or T-SQL a toy. A Snowflake SE who knows those dialects must nod along.

---

## 12. Quick reference — Sentry/Datadog-demo files → Snowflake-demo files


| Sentry/Datadog                                               | Snowflake                                                                                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout-card.tsx` / `reports-card.tsx`                     | `audit-card.tsx`                                                                                                                                                    |
| `demo-error-boundary.tsx` / `demo-perf-boundary.tsx`         | `demo-elt-boundary.tsx`                                                                                                                                             |
| `full-error-page.tsx` / `full-slo-breach-page.tsx`           | `full-elt-risk-page.tsx`                                                                                                                                            |
| `error-fallback.tsx` / `slo-summary.tsx`                     | `elt-summary.tsx`                                                                                                                                                   |
| `agent-console.tsx`                                          | `agent-console.tsx` (Snowflake channels + script)                                                                                                                   |
| `artifact-cards.tsx`                                         | `artifact-cards.tsx`                                                                                                                                                |
| `artifacts/sentry-issue.tsx` / `artifacts/datadog-trace.tsx` | `artifacts/snowsight-workspace.tsx`                                                                                                                                 |
| `artifacts/sentry-modal.tsx` / `artifacts/datadog-modal.tsx` | `artifacts/snowflake-modal.tsx`                                                                                                                                     |
| `artifacts/triage-report.tsx`                                | `artifacts/triage-report.tsx` (modernization content)                                                                                                               |
| `artifacts/jira-ticket.tsx`                                  | `artifacts/jira-ticket.tsx` (CUR-5202)                                                                                                                              |
| `artifacts/github-pr-preview.tsx`                            | `artifacts/github-pr-preview.tsx` (modernization PR)                                                                                                                |
| `artifacts/pr-modal.tsx`                                     | `artifacts/pr-modal.tsx`                                                                                                                                            |
| `artifacts/macbook-frame.tsx`                                | Same or promoted to `shared/`                                                                                                                                       |
| `cost-comparison.tsx` / `latency-comparison.tsx`             | `credits-comparison.tsx`                                                                                                                                            |
| `src/lib/demo/order-processor.ts` + `format-payment.ts`      | `src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq` + `legacy-sqlserver/usp_enrich_customers_360.sql` + `legacy-informatica/wf_customers_360.xml` + `index.ts` |
| `src/app/api/sentry-webhook/route.ts`                        | `src/app/api/snowflake-webhook/route.ts`                                                                                                                            |
| `scripts/reset-sentry-demo.sh`                               | `scripts/reset-snowflake-demo.sh`                                                                                                                                   |


---

## 13. Snowflake-specific wrinkles

- **Snowflake webhooks** are typically configured via Notification Integrations (webhook targets with an HMAC-SHA256 signature header). Verify against `process.env.SNOWFLAKE_WEBHOOK_SECRET`. If the exact signing header varies at build time, fall back to a passcode-style verification — the mock is what matters for the demo.
- **Cortex AI is real.** Cortex functions (`SNOWFLAKE.CORTEX.COMPLETE`, `SNOWFLAKE.CORTEX.SUMMARIZE`, `SNOWFLAKE.CORTEX.SEARCH`) are available inside Snowflake SQL and drive the "semantic diff" in this demo. The scripted console just names "cortex · ai"; the real agent (invoked via webhook in a real environment) should actually call Cortex functions when verifying semantic equivalence.
- **dbt is the canonical modernization target.** The PR shape (`models/` + `tests/` + `macros/`) should look like an idiomatic dbt project, not an ad-hoc SQL dump. If a Snowflake SE inspects the PR diff, the dbt shape is what earns credibility.
- **Credits math:** When citing Snowflake credits in the workspace modal / PR / credits panel, use defensible public unit prices (Standard edition ≈ $2.00/credit; Enterprise ≈ $3.00/credit). Round generously and flag as "est."
- **Warehouse sizing:** Default to an `X-SMALL` warehouse for the modernization demo — it's the most cost-efficient shape and reinforces the "credits are cheap" story.
- **Databases / schemas namespace:** Always use the three-level `database.schema.table` form (e.g. `prod_analytics.marts.fct_daily_revenue`), never two-level. Data engineers will notice.

---

## 14. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all four modals twice in a row on `http://localhost:3102`. Commit on a new branch `partner-demos-snowflake`. Open a draft PR against `main` titled **"feat: Snowflake live modernization + fix demo"**. Include screenshots: (1) idle page with rep-value card + legacy BTEQ/T-SQL visible, (2) full-screen ELT Platform Risk page, (3) running split-screen with agent console mid-run, (4) completed state with all four artifact cards, (5) the Snowsight workspace modal with Warehouse + Cortex + dbt run visible.