# Databricks Live Migration & Modernization Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/databricks/demo`, patterned on the existing Sentry demo at `/partnerships/sentry/demo` and the companion Datadog demo at `/partnerships/datadog/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes **Databricks + Cursor** orchestration end-to-end. The star of the show is a real legacy-platform migration that Cursor compresses from years into minutes:

1. A user lands on `/partnerships/databricks/demo` and clicks a button to run a realistic workflow ("Migrate this Informatica workflow" / "Convert this Oracle PL/SQL to Databricks").
2. The workflow is intentionally heavy — a real, working piece of legacy Oracle PL/SQL that gets "analyzed" for ~5s. The UI then pivots to a full-screen **Migration Scope Reality** takeover showing the size of the customer's problem and the incumbent GSI's 5-year, $22M quote.
3. A mocked Databricks workspace fires a webhook (via the CLI/workspace-event mock) and a scripted "agent console" plays on the right half of the screen showing Cursor orchestrating: Databricks MCP → Opus triage → GitHub MCP → Composer edit (PL/SQL → PySpark / Delta Live Tables) → Codex review → shell verification in a dev workspace → PR opened → Jira ticket updated.
4. When the run completes, the user can click through four pixel-perfect artifact modals: **Databricks workspace** (notebook + job run + Unity Catalog + DLT DAG), **Migration triage report**, **Jira ticket**, and **GitHub PR** (inside a MacBook frame).
5. A reset button returns the demo to clean state. `scripts/reset-databricks-demo.sh` re-seeds the legacy file after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying legacy file and the reset are real.

> **Run the local dev server on port `3101`** (`PORT=3101 npm run dev`) during development and verification. The main app runs on `3000`; the Sentry/Datadog/Figma demos assume `3000`. Keeping Databricks on `3101` avoids collisions with the other partner-demo build agents working in parallel.

---

## 1. Partner-rep positioning (audience #1 — read this first)

**This demo is being built so Databricks Account Executives can hand it to their customers.** The primary viewer is a Databricks AE. The secondary viewer is the customer the AE plays it for. Every piece of copy, every metric, every artifact must reinforce the Databricks AE's narrative.

### The AE's problem (what keeps them from making their number)

Large enterprise customers — healthcare, financial services, insurance, manufacturing — are stuck on a decade+ of Informatica mappings, Oracle DB, Teradata, and in-house ETL orchestration. A representative account:

- **$15M+ per year** in Oracle licensing + Informatica licensing + on-prem data-center costs.
- **20+ years** of PL/SQL stored procedures, Informatica workflows, and homegrown scheduler jobs that nobody fully understands anymore.
- **A $20M, 5-year migration quote** from a GSI (Accenture/Deloitte/Cognizant) that the customer can't budget and doesn't trust.
- An in-house data team that wants to move to Databricks but doesn't have the bandwidth to hand-port tens of thousands of lines of PL/SQL.

**Result:** the deal stalls. The AE can't close a committed-use agreement because the customer can't migrate. **No migration = no consumption = no quota retirement.**

### What Cursor unlocks for the Databricks AE

The pitch the demo must make to the AE is blunt:

1. **Consumption revenue brought forward.** Every quarter of migration compressed is a quarter of Databricks consumption earlier. At a $15M/yr target spend, compressing a 5-year plan to 18 months is worth **~$45M in pulled-forward ARR per account**.
2. **Lower migration cost unlocks deal viability.** If Cursor drops the migration bill from $20M to $4–6M, the customer CFO can actually approve it. Deals move from "blocked on budget" to "in execution".
3. **Customer's own team stays on the keyboard.** No GSI middleman. The account stays clean for account expansion, Genie adoption, Unity Catalog, Mosaic AI / Foundation Models — the whole Databricks platform story.
4. **Defensive against Snowflake/BigQuery.** Customers who can migrate *fast* don't bake off. Cursor helps Databricks be the faster path.

### How the demo reinforces this

- The **Full-screen "Migration Scope Reality"** page surfaces the GSI baseline (years, millions) vs the Cursor baseline (months, a fraction) in literal numbers the AE can quote.
- The **agent console** narrates the migration in Databricks vocabulary (Unity Catalog, DLT, Lakeflow, Delta, Photon, DBR 14.x, Mosaic) so the AE's prospect hears their own platform.
- The **artifact PR** includes a before/after cost table (Oracle CPU + Informatica agent licensing → Databricks DBU consumption) that the AE can screenshot into a QBR deck.
- A dedicated **"For the Databricks AE"** card on the idle page spells out the partner-rep value in three bullets (pulled-forward ARR, unblocked deals, clean account) so the rep knows *why* they're playing this.

If you find yourself writing copy that sounds like it's aimed at Cursor's own buyer, rewrite it. **The buyer in this demo is the Databricks customer, being sold to by a Databricks AE.**

---

## 2. Why this is being built

There is no `/partnerships/databricks` scroll page yet — this is the first surface. Unlike Sentry/Datadog/Figma (which had a passive scroll-driven narrative and we added a demo *underneath*), Databricks gets an interactive demo as its flagship partner surface. A simple CTA page at `/partnerships/databricks` (hero + "Run the live migration demo" pill + the three partner-rep value bullets) suffices; the meat is in the demo.

The story is also different from Sentry/Datadog/Figma:

- Sentry = **runtime crash**, fix via null-guards.
- Datadog = **performance regression**, fix via parallelism.
- Figma = **visual fidelity drift**, fix via token substitution.
- **Databricks = platform migration**, fix via dialect/engine transpilation (Oracle PL/SQL + Informatica → Spark SQL + PySpark + Delta Live Tables).

The surface must feel on-brand for Databricks (brick-red `#FF3621`, deep teal `#1B3139`, Delta Lake iconography, Unity Catalog language) — not a reskin of another partner demo.

---

## 3. Required reading (in this repo, in order)

Before you write any code, study the two reference demos.

**Page + state machine (primary reference):**

- `src/app/partnerships/sentry/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`), three conditional regions, artifact modal dispatch.
- `src/app/partnerships/datadog/demo/page.tsx` — the same machine adapted to a non-crash (performance) story. Closer to your brief than Sentry because this demo is also not a crash.

**Components:**

- `src/components/sentry-demo/agent-console.tsx` — **single most important file**. Scripted step playback with channel-coded rows, timestamps, `delayMs`, `TIME_SCALE`, `onComplete`.
- `src/components/datadog-demo/agent-console.tsx` — a recent fork with non-crash channels; pattern your channel palette after this.
- `src/components/sentry-demo/checkout-card.tsx` + `src/components/datadog-demo/reports-card.tsx` — the trigger UI patterns.
- `src/components/sentry-demo/demo-error-boundary.tsx` + `src/components/datadog-demo/demo-perf-boundary.tsx` — how the thrown signal becomes a phase transition.
- `src/components/sentry-demo/full-error-page.tsx` + `src/components/datadog-demo/full-slo-breach-page.tsx` — the full-screen takeover pattern.
- `src/components/sentry-demo/error-fallback.tsx` + `src/components/datadog-demo/slo-summary.tsx` — the split-screen left panel pattern.
- `src/components/sentry-demo/artifact-cards.tsx` + `src/components/datadog-demo/artifact-cards.tsx` — the three/four-tile CTA strip.
- `src/components/sentry-demo/artifacts/{macbook-frame,github-pr-preview,pr-modal,jira-ticket,triage-report}.tsx` — reusable artifact scaffolding.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — the benchmark for pixel-perfect partner-native UI. **The Databricks workspace modal must be at least this detailed.**

**Trigger code (the real files):**

- `src/lib/demo/order-processor.ts` + `src/lib/demo/format-payment.ts` (Sentry) — two-file bug pattern.
- `src/lib/demo/aggregate-orders.ts` + `src/lib/demo/region-store.ts` (Datadog) — closer pattern: a real piece of code that causes a visible outcome.

**Webhook + reset:**

- `src/app/api/sentry-webhook/route.ts` and `src/app/api/datadog-webhook/route.ts` — signature verification, Cursor Background Agent trigger, `buildAgentPrompt`.
- `scripts/reset-sentry-demo.sh` and `scripts/reset-datadog-demo.sh` — pattern for re-seeding the starting state.

---

## 4. What the Sentry/Datadog demos do (pattern summary)

| Phase      | What renders                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + trigger card + supporting cards (rep value, cost/time comparison, guardrails). |
| `error`    | Full-screen takeover with "Watch Cursor do it" + "Reset" CTAs. Hides everything else.             |
| `running`  | Split screen: compact summary left, `AgentConsole` right. Scripted steps stream in.              |
| `complete` | Same split screen + 4-tile `ArtifactCards` strip. Top banner flips to success.                    |

Artifact modals are overlays, closable, self-contained, all wrapped in `MacbookFrame`.

Agent console `SCRIPT` is a `Step[]` with `channel`, `label`, `detail`, `delayMs`. Real time ~19s, scaled to ~2 min displayed via `TIME_SCALE = 6.9`.

**Replicate this pattern exactly. Only change vocabulary, visuals, and the trigger file.**

---

## 5. The Databricks demo — concept & story

### The trigger scenario

**Surface UI:** A "Legacy Platform Migration" mini-app on the demo page. The hero card looks like:

> **Migrate this Informatica workflow**
> Source: Oracle 19c · PL/SQL stored procedure `CUSTOMER_RFM_SEGMENTATION`
> Target: Databricks · Unity Catalog · Delta Live Tables
> `[ Run migration analysis ]`

Below the button, render a **syntax-highlighted Oracle PL/SQL snippet** so the prospect can *see* the legacy code (cursors, loops, temp tables, vendor-specific idioms). The snippet sits in a tabbed "editor" with two tabs: `customer_rfm_segmentation.sql` (the stored proc) and `wf_m_customer_rfm.xml` (an Informatica mapping stub).

When clicked, the card shows a ~5s loading state ("Parsing PL/SQL…", "Scanning Informatica repository…", "Estimating migration scope…"), then pivots to the full-screen **Migration Scope Reality** takeover.

### The real legacy file

Create `src/lib/demo/legacy-oracle/customer_rfm_segmentation.sql` — **a real, working Oracle PL/SQL stored procedure** computing RFM (Recency/Frequency/Monetary) customer segmentation. It must:

- Use cursors (`DECLARE CURSOR ... FOR SELECT ... OPEN ... FETCH ... CLOSE`).
- Use a global temp table (`CREATE GLOBAL TEMPORARY TABLE tmp_rfm_scores ... ON COMMIT PRESERVE ROWS`).
- Use vendor-specific idioms Databricks devs will recognize as "classic migration pain": `NVL`, `DECODE`, `ROWNUM`, `CONNECT BY`, `MERGE ... USING ... WHEN MATCHED`, `TO_CHAR(date, 'YYYYMM')`, `SYSDATE - INTERVAL`.
- Be ~180–240 lines. Long enough to look real, short enough to skim.
- Be annotated with `-- LEGACY:` comments marking the 4–6 idioms the migration will target.

Also create `src/lib/demo/legacy-oracle/wf_m_customer_rfm.xml` — a ~60-line Informatica Designer `MAPPING` XML stub (Source Qualifier → Expression → Aggregator → Target) so the demo can show that Cursor understands *both* assets.

### The mock "scan" API

`src/app/api/migration/analyze/route.ts` — reads the two legacy files from disk (server-side, `node:fs`), counts lines, tags idioms, simulates ~4–5s of work with real `await`/`setTimeout`, returns a JSON with:

```ts
{
  legacyLoc: 47_412,                  // project-scale number, scripted
  filesAnalyzed: { plsql: 312, informatica: 184, other: 97 },
  dialectIdioms: ['cursor loops', 'MERGE', 'CONNECT BY', 'ROWNUM', 'NVL/DECODE', 'global temp tables'],
  gsiBaseline: { years: 5, usd: 22_000_000 },
  cursorBaseline: { months: 18, usd: 6_800_000 },
  annualOnPremCost: 14_700_000,
  proposedAnnualDatabricksCost: 3_900_000,
  firstWorkflowToMigrate: 'customer_rfm_segmentation',
}
```

The trigger card then `throws new MigrationScopeError(payload)` which the `DemoMigrationBoundary` catches to flip phase → `error`. Exactly like Datadog's `SloBreachError`.

### Full-screen Migration Scope Reality (FullErrorPage equivalent)

Brand it:

- Databricks brick-red `#FF3621` accent (logo-scale glyph + CTA).
- Deep teal `#1B3139` panel backgrounds.
- Warm cream/off-white text for hero copy; mono for metrics.

Content:

- **Heading:** `Migration scope detected: 5 years, $22M with incumbent GSI`
- **Subhead:** `47,412 lines of Oracle PL/SQL · 312 Informatica workflows · 18 TB Oracle · $14.7M/yr on-prem run cost`
- **Grid of 4 metric tiles:**
  1. GSI baseline (5 years / $22M)
  2. Cursor-accelerated baseline (18 months / $6.8M)
  3. Pulled-forward ARR for the Databricks AE (`$45M+ in consumption, 42 months earlier`)
  4. Annual run cost swing ($14.7M on-prem → $3.9M on Databricks)
- **Callout strip:** `Proof: watch Cursor migrate one stored proc in ~2 minutes, end-to-end, with output equivalence verified against the Oracle snapshot.`
- **CTAs:** `[ ▶ Watch Cursor migrate this ]`   `[ ↺ Reset ]`

### The orchestration (scripted console playback)

Channels your `SCRIPT` needs (extend the Sentry/Datadog `Channel` union):

| Channel       | Label                   | Hex accent | Role in the story                                                          |
| ------------- | ----------------------- | ---------- | -------------------------------------------------------------------------- |
| `databricks`  | `databricks-mcp`        | `#FF3621`  | Fetch workspace, Unity Catalog schemas, warehouse, cluster, DLT pipelines  |
| `unity`       | `unity-catalog`         | `#00A1C9`  | Register tables, assign grants, lineage                                    |
| `github`      | `github-mcp`            | (white)    | Commit history, branch, PR                                                 |
| `jira`        | `jira-mcp`              | `#4C9AFF`  | Migration epic + subtask                                                   |
| `shell`       | `shell`                 | green      | `databricks bundle validate`, `databricks jobs run`, `tsc`, `git`          |
| `opus`        | `opus · triage`         | `#D97757`  | Long-context reasoning over PL/SQL + Informatica XML                       |
| `composer`    | `composer · migrate`    | blue       | PL/SQL → Spark SQL / PySpark, Informatica mapping → DLT pipeline rewrite   |
| `codex`       | `codex · review`        | `#10a37f`  | Output equivalence harness, row-level diff vs Oracle snapshot              |
| `codegen`     | `codegen`               | blue       | Triage / migration report generation                                       |
| `done`        | `complete`              | green      | Terminal step                                                              |

**Target script arc (~27–32 steps, ~19–22s real, scaled via `TIME_SCALE` to ~2 min displayed):**

1. **Intake (databricks):** Connect to workspace `acme-dw-prod` → read Unity Catalog `main.legacy_migration` schema → list target warehouses (`serverless-sql-large`) → list existing DLT pipelines.
2. **Scope (databricks):** Inventory source: 47,412 PL/SQL LOC, 312 Informatica workflows, 18 TB Oracle data. Pick first workflow: `customer_rfm_segmentation`.
3. **Opus triage (opus):** Reads the stored proc end-to-end. Identifies idioms: 2 explicit cursors, 1 global temp table, `MERGE`, `CONNECT BY`, `NVL/DECODE`, `TO_CHAR(date, 'YYYYMM')`. Maps each to a Spark SQL / PySpark idiom. Forms a written migration plan.
4. **Github history hunt (github):** Last PR touching the proc is 3 years old. Original author no longer at the company. Commit SHA cited.
5. **Triage report (codegen):** Writes `docs/migration/2026-04-17-customer-rfm-segmentation.md` with the idiom-by-idiom plan and the verification approach (row-level diff on a 1% Oracle sample).
6. **Composer edit — PL/SQL → Spark SQL (composer):** Rewrites cursors → `SELECT` with window functions; temp table → DataFrame; `MERGE` → `MERGE INTO delta.customers`; `CONNECT BY` → recursive CTE. Writes a parallel `.sql` model + a PySpark DLT pipeline definition.
7. **Composer edit — Informatica mapping → DLT (composer):** Parses the `wf_m_customer_rfm.xml`, extracts the Source Qualifier / Expression / Aggregator semantics, emits a Delta Live Tables pipeline in Python (`@dlt.table` decorators).
8. **Unity Catalog registration (unity):** Registers `main.customer_analytics.rfm_scores_silver` + `rfm_scores_gold` tables. Applies grants. Records lineage.
9. **Codex review (codex):** Runs a diff harness: same inputs against the fixed Oracle extract → both compute the same quintiles. Reports `row delta: 0 · monetary Σ delta: $0.00 · quintile drift: 0%`.
10. **Shell verify (shell):**
    - `databricks bundle validate` → ✓
    - `databricks jobs create --json-file job.json` → job id
    - `databricks jobs run-now <id> --synchronous` → SUCCESS in 42.7s
    - Photon query latency on 1% sample: `Oracle: 8m 12s · Databricks Photon: 14.3s · 34× faster`
11. **PR (github):** Branch `feat/migrate-customer-rfm-segmentation`. Commit. PR #241 opened. Title: `feat(migration): customer RFM segmentation — Oracle PL/SQL → Databricks DLT (1/312)`.
12. **Jira update (jira):** Epic `CUR-5101` (Legacy Migration) + subtask `CUR-5102` → `In Review`.
13. **Done:** Artifacts ready.

### The four artifact modals

All four render in a MacBook frame. Prefer importing from `src/components/sentry-demo/artifacts/macbook-frame.tsx` (or a promoted `src/components/shared/macbook-frame.tsx` if you extract one — preserve Sentry/Datadog imports if you do).

1. **Databricks workspace modal** (equivalent of `SentryModal`/`DatadogModal`) — **pixel-perfect Databricks workspace chrome**. Must include:
   - Top nav with Databricks logo (brick-red flame on deep teal), workspace selector (`acme-dw-prod`), cluster status dot, profile avatar.
   - **Left sidebar:** Workspace browser with folder tree (`/Shared/migration/customer_rfm` expanded), "Workflows", "SQL Editor", "Data" (Unity Catalog), "Compute", "Mosaic AI" icons. Visually distinct from VSCode — use the correct Databricks iconography density.
   - **Main pane tabs (above the editor):** `Notebook`, `SQL Editor`, `Job run`, `DLT pipeline`, `Unity Catalog`. Default tab: **DLT pipeline**.
     - DLT pipeline tab shows the **Delta Live Tables DAG** (bronze → silver → gold tables) as inline SVG. Nodes labeled `orders_bronze`, `customers_bronze`, `rfm_scores_silver`, `rfm_scores_gold`. Edges show dependencies. One node pulsing "success" green.
     - Above the DAG: pipeline status banner `Pipeline: customer_rfm_pipeline · Running · Photon enabled · DBR 14.3 LTS`.
   - **Right sidebar:** "Run details" with `Started 2m ago · Duration 42.7s · Records processed 14.2M · Rows written 3.1M`. Also a "Cost" line: `DBU consumed: 0.08 · est. $0.42`.
   - **Bottom strip:** "Unity Catalog lineage" mini-graph showing `oracle.acme.customers → bronze.customers → silver.rfm_scores → gold.rfm_scores`.
   - Use Databricks' actual chrome palette: deep teal `#1B3139` panels, red `#FF3621` accents, light grey `#F9F7F4` canvases for notebook body (if shown), mono for code, sans for labels.
2. **Migration triage report modal** — `react-markdown` + `remark-gfm`, Databricks content:
   ```md
   # Migration triage — customer_rfm_segmentation (1/312)

   **Status:** Fix proposed · PR #241 · CUR-5102

   ## Scope (this workflow)
   - Source: Oracle 19c PL/SQL · 214 LOC · 2 cursors · 1 global temp table
   - Companion: Informatica mapping `wf_m_customer_rfm.xml` · 6 transforms
   - Target: Databricks DLT pipeline + Unity Catalog tables (bronze/silver/gold)

   ## Idiom mapping
   | Oracle idiom | Databricks equivalent |
   | --- | --- |
   | Explicit cursor + FETCH loop | `SELECT ... ROW_NUMBER() OVER (...)` |
   | Global temp table | Spark DataFrame / DLT intermediate table |
   | `MERGE INTO tgt USING src ...` | `MERGE INTO delta.tgt USING src` |
   | `CONNECT BY PRIOR` | recursive CTE |
   | `NVL`, `DECODE` | `COALESCE`, `CASE WHEN` |
   | `TO_CHAR(date, 'YYYYMM')` | `DATE_FORMAT(date, 'yyyyMM')` |

   ## Verification
   - Row delta (1% Oracle sample vs Databricks Photon): 0
   - Monetary Σ delta: $0.00
   - Quintile drift: 0%
   - Latency: Oracle 8m 12s → Databricks Photon 14.3s (**34× faster**)

   ## Economics (this workflow only)
   - GSI line-item: $71,200 · 3 weeks
   - Cursor: $0 license · 2 minutes compute · $0.42 DBU

   ## Portfolio context
   - 1 of 312 Informatica workflows mapped.
   - At this rate: 312 workflows × ~2 min ≈ 10.4 hours of agent time.
   - GSI equivalent: 5 years, $22M.
   ```
3. **Jira ticket modal** — pixel-perfect Jira, ticket `CUR-5102`, type "Migration Task", parent epic `CUR-5101 Legacy Platform Migration`, P1. Include `linked PR`, `linked Databricks pipeline URL` (rendered as text, non-functional), `components: Data/DW`, assignee, status timeline `To Do → In Progress → In Review`.
4. **GitHub PR modal** — wrapped in MacBook. PR #241. Title: `feat(migration): customer RFM segmentation — Oracle PL/SQL → Databricks DLT (1/312)`. Body must include:
   - A before/after cost/latency table (Oracle on-prem → Databricks Photon).
   - A `Portfolio progress` line: `1 / 312 Informatica workflows migrated. Est. portfolio finish: 18 months (vs GSI baseline 5 years).`
   - Files changed (4): `customer_rfm_pipeline.py` (DLT), `customer_rfm.sql` (SQL model), `unity_catalog_grants.sql`, `databricks.yml` (asset bundle).
   - Diff excerpt showing the PL/SQL cursor loop → PySpark DataFrame transformation side-by-side.
   - CI checks: `tsc ✓`, `databricks bundle validate ✓`, `row-delta harness ✓`, `photon perf vs oracle ✓`.
   - Reviewer banner: "Verified by Cursor agent · output-equivalent to Oracle source".

### Branding

- **Primary accent:** Databricks brick-red `#FF3621` — hero glyph, CTA emphasis, workspace-logo bone.
- **Surface:** Deep teal `#1B3139` for panels. Warm cream `#FFEFD0`-ish for soft text blocks (optional).
- **Success:** Photon green `#00A972` (distinct from Snowflake's lighter green).
- **Typography:** Match existing dark theme — sans for prose, mono for code / metrics / DBU numbers.
- **Avoid:**
  - Don't copy Snowflake blue `#29B5E8`, AWS orange `#FF9900`, Datadog purple `#632CA6`, Sentry purple `#362D59`.
  - Don't use a generic "notebook" visual — it must read unmistakably as *Databricks* (DLT DAG, Unity Catalog, Photon).

---

## 6. Files to create

```
src/app/partnerships/databricks/page.tsx                              NEW  (minimal CTA page — hero + "Run live migration demo" pill + 3 rep-value bullets + guardrails summary)
src/app/partnerships/databricks/demo/page.tsx                         NEW  (the state machine)
src/app/api/databricks-webhook/route.ts                               NEW
src/app/api/migration/analyze/route.ts                                NEW  (the ~5s scope-analysis endpoint)

src/components/databricks-demo/migration-card.tsx                     NEW  (trigger UI — tabbed editor with PL/SQL + Informatica XML + Run button)
src/components/databricks-demo/demo-migration-boundary.tsx            NEW
src/components/databricks-demo/full-migration-scope-page.tsx          NEW  (FullErrorPage equivalent)
src/components/databricks-demo/migration-summary.tsx                  NEW  (ErrorFallback equivalent, split-screen left)
src/components/databricks-demo/agent-console.tsx                      NEW  (Databricks channels + script)
src/components/databricks-demo/artifact-cards.tsx                     NEW
src/components/databricks-demo/economics-panel.tsx                    NEW  (CostComparison equivalent — Oracle/Informatica TCO vs Databricks DBU, pulled-forward ARR for the AE)
src/components/databricks-demo/rep-value-card.tsx                     NEW  (three-bullet "For the Databricks AE" card)
src/components/databricks-demo/guardrails-panel.tsx                   NEW  (row-equivalence, lineage preserved, no schema widening, human-approved PR)
src/components/databricks-demo/artifacts/databricks-workspace.tsx     NEW  (pixel-perfect Databricks workspace chrome + DLT DAG)
src/components/databricks-demo/artifacts/databricks-modal.tsx         NEW  (wraps the workspace in MacBook)
src/components/databricks-demo/artifacts/triage-report.tsx            NEW
src/components/databricks-demo/artifacts/jira-ticket.tsx              NEW  (CUR-5102)
src/components/databricks-demo/artifacts/github-pr-preview.tsx        NEW
src/components/databricks-demo/artifacts/pr-modal.tsx                 NEW
src/components/databricks-demo/artifacts/macbook-frame.tsx            NEW  (fork; or import from shared/ if you promote)

src/lib/demo/legacy-oracle/customer_rfm_segmentation.sql              NEW  (the real, working PL/SQL)
src/lib/demo/legacy-oracle/wf_m_customer_rfm.xml                      NEW  (Informatica mapping stub)
src/lib/demo/legacy-oracle/index.ts                                   NEW  (fs reader + idiom tagger used by the analyze route)

scripts/reset-databricks-demo.sh                                      NEW  (re-seeds the legacy files + verifies they parse)
```

**Also:**

- Update the top-level `src/app/partnerships/page.tsx` partnership grid (see `src/components/sections/partnerships.tsx`) to include a Databricks tile linking to `/partnerships/databricks`. Mirror existing Sentry/Datadog/Figma tiles.
- Consider promoting `src/components/sentry-demo/artifacts/macbook-frame.tsx` into `src/components/shared/macbook-frame.tsx` if not done. If you do, preserve Sentry/Datadog/Figma imports.

---

## 7. Implementation order (recommended)

1. **Scaffold the CTA page + demo route** — `src/app/partnerships/databricks/page.tsx` (minimal) and `src/app/partnerships/databricks/demo/page.tsx` (state machine cloned from Datadog as skeleton).
2. **Ship the legacy files + analyze API** — real PL/SQL + Informatica XML + `/api/migration/analyze`. Verify the button really takes ~5s and returns the scoped payload.
3. **Wire the boundary + full-screen Migration Scope page** — four metric tiles, rep value framing, CTAs.
4. **Build the agent console** — fork Datadog's, add Databricks channels, write the ~30-step SCRIPT. Tune `TIME_SCALE` for ~2-min displayed runtime.
5. **Build artifact modals in this order:** PR (cheapest; reuse MacBook + existing PR shell) → Jira → Triage report → **Databricks workspace** (hardest; save for last; budget real time here — it's the hero artifact).
6. **Side content** — economics panel (Oracle+Informatica TCO → Databricks DBU + pulled-forward ARR), rep-value card, guardrails panel, CTA pill.
7. **Webhook route** — Databricks signature verification (workspace webhook uses an HMAC shared-secret in the `X-Databricks-Signature` header; fall back to a passcode if you need to for the mock). `buildAgentPrompt` enforces the 8-step migration sequence.
8. **Reset script + docs** — `scripts/reset-databricks-demo.sh` restores the legacy files by checking them out from `HEAD`. Update `docs/partner-demos/README.md` if one exists.
9. **Typecheck + manual walkthrough on port `3101`** — `PORT=3101 npm run dev`, click through all phases + all modals + reset twice. Confirm visually identical across runs.

---

## 8. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result. No real network calls during scripted playback. No `Math.random()` in displayed values.
- **Latency is real before the fix:** `/api/migration/analyze` must actually take ~5s via real `setTimeout`, so the prospect experiences the scope.
- **Artifacts are fully self-contained:** No external links to databricks.com or github.com. Everything opens in-modal.
- **On-brand language:** "Unity Catalog", "Delta Live Tables", "DLT pipeline", "Photon", "DBU", "Lakeflow", "Mosaic AI", "Databricks SQL Warehouse", "workspace", "asset bundle". Avoid Snowflake terms ("warehouse" is safe but prefer "SQL Warehouse" when ambiguous; avoid "Snowpark", "Cortex"), AWS terms, Sentry terms, Datadog terms.
- **Single-page, no auth, no client-side API keys.**
- **Partner-rep framing is explicit** on the idle page. If a Databricks AE can't tell this demo is built for them within 10 seconds, the copy has failed.
- **Safety-by-default:** `buildAgentPrompt` enforces row-equivalence verification before PR open. No schema widening, no silent type changes, no dropping columns without a migration note.
- **Dev server port:** **3101**. If you find another local server on this port, kill it before starting. Do NOT run your dev server on `3000` — the other partner demos use it.

---

## 9. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/datadog-webhook/route.ts`. Replace with Databricks vocabulary. Required steps, in order:

1. **Databricks MCP intake.** Connect to the workspace. Read Unity Catalog schema, target SQL Warehouse sizing, available DLT pipelines, asset bundles. Identify the first workflow to migrate from the migration queue.
2. **Legacy source read (shell).** Read the PL/SQL stored proc and any linked Informatica mapping XML end-to-end. Enumerate vendor-specific idioms (cursors, MERGE, CONNECT BY, NVL, DECODE, global temp tables, ROWNUM, TO_CHAR date formatting).
3. **Regression / provenance hunt (GitHub MCP).** Identify the last commit touching the legacy file and the original author. Note in the PR body (useful context for reviewers).
4. **Write migration plan (codegen).** Produce `docs/migration/<date>-<slug>.md` with the idiom mapping table, target DLT/SQL model shape, and verification approach.
5. **Patch (shell + edit).** Emit four files: a DLT pipeline (`*_pipeline.py`), a SQL model (`*.sql`), a Unity Catalog grants file, and an asset bundle entry in `databricks.yml`. Minimal diff. No behavioral widening.
6. **Static verify.** `databricks bundle validate`, `tsc --noEmit` (for the TS glue), `npm run lint`. Iterate until clean.
7. **Live verify (shell).** Submit a one-shot job against a dev workspace. Run a row-equivalence harness against a 1% Oracle sample: same rows in, same rows out. Record `row delta`, monetary sums, latency vs Oracle. Must be `row delta = 0` and latency ≤ Oracle. If not, iterate on step 5.
   - Local smoke must happen on `http://localhost:3101` (this demo's port), not `:3000`.
8. **Open PR (GitHub MCP).** Branch `feat/migrate-<slug>`. PR body must include the idiom mapping table, the row-equivalence harness result, latency comparison, cost comparison (DBU vs Oracle CPU + Informatica license line-item), the portfolio progress line (`N / 312 workflows migrated`), and a risk assessment.
9. **Jira update (Jira MCP).** Move the migration-task subtask to `In Review`. Keep the epic open.

Be explicit that the agent **must** hit every step and cite evidence in the PR body. This is the contract that keeps behavior deterministic across real runs.

---

## 10. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/databricks/demo` loads with hero + CTA pill + migration card showing visible legacy PL/SQL.
- Clicking **Run migration analysis** shows ~5s of scanning, then pivots to the full-screen Migration Scope Reality page.
- The Scope page clearly communicates the GSI baseline vs Cursor-accelerated baseline and the Databricks-AE upside (pulled-forward ARR, lower migration cost, account stays clean).
- Clicking **Watch Cursor migrate this** starts the scripted console which plays ~30 channel-coded steps in ~19–22s real time with displayed timestamps scaling to ~2 minutes.
- Console completion transitions to `complete` and reveals four artifact cards.
- Each modal opens pixel-perfect and closes cleanly.
- The Databricks workspace modal includes the DLT DAG, Unity Catalog grants, and DBU cost line — it must feel indistinguishable from the real Databricks workspace at a glance.
- **Reset** returns the demo to clean `idle`.
- Two consecutive runs produce visually identical output.
- `npx tsc --noEmit` passes.
- No external links leak out of any modal.
- `scripts/reset-databricks-demo.sh` restores the legacy PL/SQL + Informatica XML after a real PR merge.
- Demo dev server runs cleanly on `http://localhost:3101` and does not interfere with `:3000`.

---

## 11. Anti-patterns / things to avoid

- ❌ **Don't** frame this as "Cursor fixes Oracle bugs". It's a **migration**, not a bug fix. The vocabulary must be platform-migration, not bug-triage.
- ❌ **Don't** copy Snowflake blue, AWS orange, Datadog purple, or Sentry purple into the hero. Databricks brick-red only.
- ❌ **Don't** make the agent console non-deterministic. No `setTimeout(…, Math.random())`. No real HTTP calls during playback.
- ❌ **Don't** cheapen the workspace modal. The DLT DAG must be inline SVG or positioned divs, not a screenshot. If you can't make it feel like Databricks, budget more time — this is the signature artifact.
- ❌ **Don't** delete or modify `src/components/{sentry-demo,datadog-demo,figma-demo}/`. Fork via copy.
- ❌ **Don't** skip the partner-rep framing. If the rep-value card isn't on the idle page, the brief hasn't shipped.
- ❌ **Don't** hardcode API keys or DSNs anywhere in client code. All env vars are server-side.
- ❌ **Don't** run your dev server on `:3000`. You share the repo with three other partner demos; use `:3101` as assigned.
- ❌ **Don't** make the PL/SQL a toy. A rep who actually knows Oracle will spot it in 3 seconds. Use real idioms and annotate them.

---

## 12. Quick reference — Sentry/Datadog-demo files → Databricks-demo files

| Sentry/Datadog                                  | Databricks                                              |
| ----------------------------------------------- | ------------------------------------------------------- |
| `checkout-card.tsx` / `reports-card.tsx`        | `migration-card.tsx`                                    |
| `demo-error-boundary.tsx` / `demo-perf-boundary.tsx` | `demo-migration-boundary.tsx`                      |
| `full-error-page.tsx` / `full-slo-breach-page.tsx` | `full-migration-scope-page.tsx`                      |
| `error-fallback.tsx` / `slo-summary.tsx`        | `migration-summary.tsx`                                 |
| `agent-console.tsx`                             | `agent-console.tsx` (Databricks channels + script)      |
| `artifact-cards.tsx`                            | `artifact-cards.tsx`                                    |
| `artifacts/sentry-issue.tsx` / `artifacts/datadog-trace.tsx` | `artifacts/databricks-workspace.tsx`       |
| `artifacts/sentry-modal.tsx` / `artifacts/datadog-modal.tsx` | `artifacts/databricks-modal.tsx`           |
| `artifacts/triage-report.tsx`                   | `artifacts/triage-report.tsx` (migration content)       |
| `artifacts/jira-ticket.tsx`                     | `artifacts/jira-ticket.tsx` (CUR-5102)                  |
| `artifacts/github-pr-preview.tsx`               | `artifacts/github-pr-preview.tsx` (migration PR)        |
| `artifacts/pr-modal.tsx`                        | `artifacts/pr-modal.tsx`                                |
| `artifacts/macbook-frame.tsx`                   | Same file, forked, or promoted to `shared/`            |
| `cost-comparison.tsx` / `latency-comparison.tsx` | `economics-panel.tsx`                                  |
| `src/lib/demo/order-processor.ts` + `format-payment.ts` | `src/lib/demo/legacy-oracle/customer_rfm_segmentation.sql` + `wf_m_customer_rfm.xml` + `index.ts` |
| `src/app/api/sentry-webhook/route.ts`           | `src/app/api/databricks-webhook/route.ts`               |
| `scripts/reset-sentry-demo.sh`                  | `scripts/reset-databricks-demo.sh`                      |

---

## 13. Databricks-specific wrinkles

- **Databricks webhooks** (workspace event webhooks, registered via `databricks workspace webhooks create`) sign payloads with an HMAC-SHA256 of the raw body using a shared secret, delivered via `X-Databricks-Signature`. Verify against `process.env.DATABRICKS_WEBHOOK_SECRET`. If the real signature scheme differs at build time, fall back to a passcode-style verification like the Figma route — the mock is what matters for the demo.
- **Databricks CLI + asset bundles are real.** The scripted console shows `databricks bundle validate` and `databricks jobs run-now`. The actual agent (invoked via webhook in a real environment) should use the Databricks CLI or Databricks MCP (if available in the repo's MCP inventory). The scripted playback just names them.
- **DBU cost math:** When citing DBU consumption in the workspace modal / PR body / economics panel, use defensible public unit prices (e.g. serverless SQL Warehouse large ≈ $0.70/DBU-hour) so numbers survive scrutiny by a real Databricks SE. Round generously; flag as "est."
- **Unity Catalog is non-negotiable.** Even if the in-page demo doesn't fully illustrate the three-level namespace, every artifact should name it (`catalog.schema.table`, not `schema.table`). This is how the rep knows you know what you're doing.
- **Photon / DBR versions:** Use `DBR 14.3 LTS` or `DBR 15.x` — current-enough to look credible, old enough to be LTS. Avoid bleeding-edge version numbers the rep might not recognize.

---

## 14. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all four modals twice in a row on `http://localhost:3101`. Commit on a new branch `partner-demos-databricks`. Open a draft PR against `main` titled **"feat: Databricks live migration + fix demo"**. Include screenshots of: (1) idle page with rep-value card + legacy PL/SQL visible, (2) full-screen Migration Scope Reality, (3) running split-screen with agent console mid-run, (4) completed state with all four artifact cards, (5) the Databricks workspace modal with the DLT DAG.
