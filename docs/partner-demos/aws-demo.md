# AWS Live Modernization & Migration Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/aws/demo`, patterned on the existing Sentry demo at `/partnerships/sentry/demo` and the companion Datadog demo at `/partnerships/datadog/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes **AWS + Cursor** orchestration end-to-end. The star of the show is a real legacy-monolith modernization — Java EE on WebSphere + Oracle on-prem → AWS Lambda + ECS Fargate + Aurora PostgreSQL — that Cursor compresses from a multi-year GSI engagement into minutes:

1. A user lands on `/partnerships/aws/demo` and clicks a button to run a realistic workflow ("Run AWS modernization readiness scan" on a mock Java EE monolith).
2. The workflow is intentionally heavy — it actually reads a real Java EE `OrdersService.java` (EJB annotations, JNDI lookups, Oracle PL/SQL via JDBC) and a `persistence.xml` from disk, simulates ~5s of analysis, then pivots to a full-screen **Modernization Scope Reality** takeover showing the on-prem run cost + the incumbent GSI's 5-year, $14M quote.
3. A mocked EventBridge rule fires a webhook and a scripted agent console plays on the right half of the screen: AWS Knowledge MCP + Bedrock reasoning → Opus triage (decompose bounded contexts) → GitHub MCP → Composer edit (EJB → TypeScript Lambda + CDK stack) → Codex review (IAM least-privilege, VPC endpoints, Secrets Manager) → shell verify (`cdk synth`, `cdk diff`, integration test) → PR opened → Jira ticket updated.
4. When the run completes, the user can click through four pixel-perfect artifact modals: **AWS Console** (CloudWatch + Lambda + ECS + CloudFormation + Aurora, Cloudscape chrome), **Modernization triage report** (MAP-flavored), **Jira ticket**, and **GitHub PR** (inside a MacBook frame).
5. A reset button returns the demo to clean state. `scripts/reset-aws-demo.sh` re-seeds the legacy files after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying legacy files and the reset are real.

> **Run the local dev server on port `3103`** (`PORT=3103 npm run dev`) during development and verification. The main app runs on `3000`; the Sentry/Datadog/Figma demos assume `3000`. Databricks uses `3101`, Snowflake uses `3102`. Keeping AWS on `3103` avoids collisions with the other partner-demo build agents working in parallel.

---

## 1. Partner-rep positioning (audience #1 — read this first)

**This demo is being built so AWS sales reps (AE, SA, PDM, ISV co-sell) can hand it to their customers.** The primary viewer is an AWS rep. The secondary viewer is the customer the rep plays it for. Every piece of copy, every metric, every artifact must reinforce the AWS rep's narrative.

### The AWS rep's problem

30%+ of Fortune 1000 workloads are still on-prem. "Lift-and-shift to EC2" happens, but that's the low-margin, low-stickiness motion — the real expansion story requires **modernization** into managed services (Lambda, Aurora, ECS Fargate, Step Functions, EventBridge, Bedrock, Amazon Q Developer). A representative account:

- **$6–12M per year** running a Java EE / .NET / mainframe monolith on-prem (WebSphere/WebLogic + Oracle + data center).
- **1–2M LOC** across dozens of EJBs, hundreds of stored procs, and brittle XML wiring nobody wants to touch.
- A **5-year / $14M MAP engagement** quoted by a GSI (Accenture / Deloitte / Capgemini) that the customer CFO won't sign.
- An in-house platform team that wants AWS managed services but has no path to decompose a decade of monolith without a rewrite from scratch.

**Result:** the customer "lifts and shifts" half the workload to EC2, the AWS rep gets some revenue but leaves 70% of the consumption-expansion story on the table. **No modernization = no managed-service ARR = no quota upside.**

### What Cursor unlocks for the AWS rep

The pitch the demo must make to the rep is:

1. **Managed-service ARR unlocked earlier.** Every EJB or stored proc Cursor modernizes into a Lambda + Aurora Serverless v2 + CDK stack is a workload that converts lift-and-shift revenue into managed-service revenue. At a $4M/yr target managed-service steady-state, compressing a 5-year modernization to ~~18 months is **~~$11M in pulled-forward managed-service ARR per account**.
2. **Win-rate lift on Migration Acceleration Program (MAP) deals.** MAP credits only pay out when workloads actually modernize. Cursor materially raises the probability that MAP-funded engagements finish on-plan and on-budget.
3. **Bedrock + Amazon Q Developer pull-through.** The modernized codebase is AI-ready: it can use Bedrock agents, Q Developer assists, and Q in QuickSight out of the box. Every Cursor-modernized account becomes a Bedrock/Q pipeline account.
4. **Customer's own team stays on the keyboard.** No GSI middleman. The account stays clean for AWS expansion: Outposts → Lambda, RDS → Aurora, EC2 → Fargate, S3 → Lake Formation, legacy data pipeline → Glue + EventBridge.

### How the demo reinforces this

- The **Full-screen "Modernization Scope Reality"** page surfaces the GSI baseline (years / millions) vs the Cursor baseline (months / fraction) + the **managed-service ARR upside** in a metric tile the rep can quote in a QBR.
- The **agent console** narrates the modernization in AWS vocabulary (Lambda, ECS Fargate, Aurora Serverless v2, Step Functions, EventBridge, CDK, CloudWatch, IAM, VPC endpoints, Secrets Manager, Cloudscape) so the rep's prospect hears their own platform.
- The **artifact PR** includes a before/after run cost table (WebSphere + Oracle + data center → Lambda invocations + Aurora ACUs + CloudWatch logs) that the rep can drop straight into a TCO deck.
- A dedicated **"For the AWS rep"** card on the idle page spells out the partner-rep value in three bullets (pulled-forward managed-service ARR, MAP success rate lift, Bedrock/Q pull-through) so the rep knows *why* they're playing this.

If you find yourself writing copy aimed at Cursor's own buyer, rewrite it. **The buyer in this demo is the AWS customer, being sold to by an AWS rep.**

---

## 2. Why this is being built

The existing `/partnerships/aws` page is a scroll-driven narrative (monolith → analysis → decompose → infra → value). It's beautiful but **passive** — prospects can't *feel* the decomposition happen. The Sentry demo (`/partnerships/sentry/demo`) solved this for error-handling; Datadog for performance; Databricks/Snowflake for data-platform migration. We need the same reflex for AWS modernization.

The story differs from every other partner demo:

- Sentry = runtime crash.
- Datadog = performance regression.
- Figma = visual fidelity drift.
- Databricks = data-platform migration.
- Snowflake = ELT modernization.
- **AWS = application modernization** — Java EE / .NET monolith + Oracle on-prem → Lambda/ECS + Aurora PG + CDK-managed infrastructure.

The surface must feel on-brand for AWS (Cloudscape design system, AWS orange `#FF9900`, squid-ink navy `#232F3E`, service icons the rep will recognize) — not a reskin of another partner demo.

This demo **augments** the existing `/partnerships/aws` page; it does not replace it. Add a prominent CTA on the existing page linking to `/partnerships/aws/demo`.

---

## 3. Required reading (in this repo, in order)

Before you write any code, study the reference demos.

**Page + state machine (primary reference):**

- `src/app/partnerships/sentry/demo/page.tsx` — state machine, conditional regions, artifact dispatch.
- `src/app/partnerships/datadog/demo/page.tsx` — closest shape: non-crash, scoped analysis, pivot to takeover.

**Components:**

- `src/components/sentry-demo/agent-console.tsx` — **single most important file**. Scripted step playback with channel-coded rows, timestamps, `delayMs`, `TIME_SCALE`, `onComplete`.
- `src/components/datadog-demo/agent-console.tsx` — fork with non-crash channels; pattern your channel palette after this.
- `src/components/sentry-demo/checkout-card.tsx` + `src/components/datadog-demo/reports-card.tsx` — trigger UI patterns.
- `src/components/sentry-demo/demo-error-boundary.tsx` + `src/components/datadog-demo/demo-perf-boundary.tsx` — phase-transition wiring.
- `src/components/sentry-demo/full-error-page.tsx` + `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeover pattern.
- `src/components/sentry-demo/error-fallback.tsx` + `src/components/datadog-demo/slo-summary.tsx` — split-screen left panel.
- `src/components/sentry-demo/artifact-cards.tsx` + `src/components/datadog-demo/artifact-cards.tsx` — 4-tile strip.
- `src/components/sentry-demo/artifacts/{macbook-frame,github-pr-preview,pr-modal,jira-ticket,triage-report}.tsx` — reusable scaffolding.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — **benchmark for partner-native UI fidelity.** The AWS Console modal must match.

**Existing AWS partner surface (extending, not replacing):**

- `src/app/partnerships/aws/page.tsx`
- `src/components/aws-demo/*.tsx` (`monolith-scene.tsx`, `analysis-scene.tsx`, `decompose-scene.tsx`, `infra-scene.tsx`, `aws-value-scene.tsx`). Reuse visuals and copy where natural; don't modify them.

**Trigger code (the real files):**

- `src/lib/demo/order-processor.ts` + `src/lib/demo/format-payment.ts` (Sentry) — two-file pattern.
- `src/lib/demo/aggregate-orders.ts` + `src/lib/demo/region-store.ts` (Datadog) — closer shape.

**Webhook + reset:**

- `src/app/api/sentry-webhook/route.ts` and `src/app/api/datadog-webhook/route.ts` — signature verification, Cursor Background Agent trigger, `buildAgentPrompt`.
- `scripts/reset-sentry-demo.sh` and `scripts/reset-datadog-demo.sh`.

**Available AWS MCP:**

- The repo ships `dashboard-team-1-Awsknowledge` with `aws___`* tools (`read_documentation`, `recommend`, `retrieve_agent_sop`, `search_documentation`). The real webhook-invoked agent should use these for citation-backed architecture guidance. The scripted playback just names `aws-knowledge-mcp`.

---

## 4. What the Sentry/Datadog demos do (pattern summary)


| Phase      | What renders                                                                     |
| ---------- | -------------------------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + trigger card + rep-value card + TCO comparison + guardrails.   |
| `error`    | Full-screen takeover with "Watch Cursor do it" + "Reset". Hides everything else. |
| `running`  | Split screen: compact summary left, `AgentConsole` right. Scripted steps stream. |
| `complete` | Same split screen + 4-tile `ArtifactCards` strip. Top banner flips to success.   |


Artifact modals are overlays, closable, self-contained, all wrapped in `MacbookFrame`.

Agent console `SCRIPT` is a `Step[]` with `channel`, `label`, `detail`, `delayMs`. Real time ~19s, scaled to ~2 min displayed via `TIME_SCALE = 6.9`.

**Replicate this pattern exactly. Only change vocabulary, visuals, and the trigger files.**

---

## 5. The AWS demo — concept & story

### The trigger scenario

**Surface UI:** A "Monolith Modernization Assessment" mini-app on the demo page. The hero card looks like:

> **Run AWS modernization readiness scan**
> Source: Java EE · WebSphere 8.5 · Oracle 12c · on-prem data center
> Candidate: `OrdersService` bounded context (EJB + Oracle PL/SQL)
> Target: AWS Lambda · Aurora Serverless v2 · CDK · ECS Fargate (for stateful services)
> `[ Run readiness scan ]`

Below the button, render a tabbed "editor" with three tabs:

1. `OrdersService.java` — real Java EE code with `@Stateless`, `@EJB`, `@PersistenceContext`, JNDI lookups, `try { … } catch (NamingException …)` boilerplate, direct JDBC calls to an Oracle stored proc.
2. `persistence.xml` — real JPA + WebSphere-specific properties.
3. `orders-ddl.sql` — the Oracle DDL + PL/SQL stored proc backing the service.

When clicked, the card shows a ~5s loading state ("Scanning monolith…", "Inferring bounded contexts…", "Matching to AWS managed services…", "Estimating TCO swing…"), then pivots to the full-screen **Modernization Scope Reality** takeover.

### The real legacy files

Create `src/lib/demo/legacy-monolith/OrdersService.java` — **a real, compilable** (Java EE 7) `@Stateless` EJB class with:

- `@PersistenceContext(unitName = "orders-pu")`
- JNDI lookups via `InitialContext().lookup("java:comp/env/jdbc/OracleDS")`
- 2–3 methods (`createOrder`, `reserveInventory`, `captureRevenue`)
- Direct `CallableStatement` invocations of Oracle stored procs
- Exception handling that leaks `NamingException` + `SQLException`
- Annotated with `// LEGACY:` comments marking the 5–6 boundary violations Cursor will unwind
- 180–250 lines

Create `src/lib/demo/legacy-monolith/persistence.xml` — a real `persistence.xml` with WebSphere-specific properties (`eclipselink.target-database`, `eclipselink.target-server=WebSphere`).

Create `src/lib/demo/legacy-monolith/orders-ddl.sql` — Oracle DDL + a PL/SQL stored proc (`SP_RESERVE_INVENTORY`) that takes a cursor out-parameter. 80–120 lines.

### The mock "readiness scan" API

`src/app/api/aws-assess/run/route.ts` — reads the legacy files from disk (server-side, `node:fs`), counts lines, tags bounded-context candidates, simulates ~5s of work with real `await`/`setTimeout`, returns:

```ts
{
  legacyLoc: 1_182_400,                    // project-scale, scripted
  filesAnalyzed: { java: 4_217, jsp: 612, xml: 418, plsql: 287 },
  boundedContexts: [
    { name: 'OrdersService',     loc: 14_200, target: 'Lambda + Aurora Serverless v2' },
    { name: 'InventoryService',  loc:  9_800, target: 'Lambda + DynamoDB' },
    { name: 'BillingService',    loc: 22_100, target: 'ECS Fargate + Aurora PG' },
    // … 35 more implied via count
  ],
  gsiBaseline: { years: 5, usd: 14_000_000 },
  cursorBaseline: { months: 18, usd: 3_800_000 },
  annualOnPremCost: 8_400_000,
  proposedAnnualAwsCost: 2_100_000,
  pulledForwardManagedServiceArrUsd: 11_000_000,
  firstBoundedContextToExtract: 'OrdersService',
}
```

The trigger card `throws new ModernizationScopeError(payload)` which `DemoModernizationBoundary` catches to flip phase → `error`.

### Full-screen Modernization Scope Reality (FullErrorPage equivalent)

Brand it:

- AWS orange `#FF9900` (hero glyph, primary CTAs).
- Squid-ink navy `#232F3E` for panel backgrounds.
- Cloudscape blue `#0972D3` for secondary accents, links, and metric deltas.

Content:

- **Heading:** `Modernization scope detected: 5 years, $14M with incumbent GSI`
- **Subhead:** `1.2M LOC Java EE · 38 bounded-context candidates · Oracle 12c + WebSphere 8.5 · $8.4M/yr on-prem run cost`
- **Grid of 4 metric tiles:**
  1. GSI baseline (5 years / $14M)
  2. Cursor-accelerated baseline (18 months / $3.8M)
  3. Pulled-forward managed-service ARR for the AWS rep (`~$11M, 42 months earlier`)
  4. Annual run cost swing (`$8.4M on-prem → $2.1M on AWS managed services`)
- **Callout strip:** `Proof: watch Cursor extract one bounded context (OrdersService) into Lambda + Aurora Serverless v2 + CDK, with IAM least-priv and VPC endpoints, in ~2 minutes.`
- **CTAs:** `[ ▶ Watch Cursor modernize this ]`   `[ ↺ Reset ]`

### The orchestration (scripted console playback)

Channels your `SCRIPT` needs:


| Channel      | Label                 | Hex accent | Role in the story                                                     |
| ------------ | --------------------- | ---------- | --------------------------------------------------------------------- |
| `aws`        | `aws-knowledge-mcp`   | `#FF9900`  | Architecture recommendations, Well-Architected citations              |
| `bedrock`    | `bedrock · reasoning` | `#01A88D`  | Long-context reasoning over the monolith (Claude on Bedrock or equiv) |
| `cdk`        | `cdk`                 | `#0972D3`  | `cdk synth`, `cdk diff`, `cdk deploy --hotswap`                       |
| `github`     | `github-mcp`          | (white)    | Commit history, branch, PR                                            |
| `jira`       | `jira-mcp`            | `#4C9AFF`  | Modernization epic + subtask                                          |
| `shell`      | `shell`               | green      | `mvn`, `npm`, `cdk`, `sam local`, `curl`                              |
| `opus`       | `opus · triage`       | `#D97757`  | Bounded-context decomposition, boundary violation analysis            |
| `composer`   | `composer · extract`  | blue       | Java EE → TS Lambda + CDK stack + IAM policies                        |
| `codex`      | `codex · review`      | `#10a37f`  | Security review (IAM least-priv, secrets, VPC), cost forecast         |
| `cloudwatch` | `cloudwatch`          | `#E7157B`  | Log + metric verification post-deploy                                 |
| `codegen`    | `codegen`             | blue       | Triage / modernization report generation                              |
| `done`       | `complete`            | green      | Terminal step                                                         |


**Target script arc (~28–34 steps, ~20–22s real, scaled via `TIME_SCALE` to ~2 min displayed):**

1. **Intake (aws):** Connect AWS Knowledge MCP → fetch recommended patterns for "Java EE monolith → Lambda + Aurora". Pull Well-Architected pillar citations (OPS 05, SEC 02, REL 09, PERF 04, COST 06, SUS 03) for later inclusion in the triage report.
2. **Scope (aws):** Inventory monolith: 1.2M LOC, 38 bounded-context candidates. Pick first: `OrdersService` (14.2K LOC). Target: Lambda + Aurora Serverless v2.
3. **Bedrock triage (bedrock):** Long-context reasoning over `OrdersService.java` + `persistence.xml` + `orders-ddl.sql`. Identifies boundary violations: shared Oracle connection pool, cross-cutting JNDI lookups, synchronous stored-proc calls. Outputs a decomposition plan with a target architecture diagram (CDK construct tree).
4. **Opus triage (opus):** Second pass — minimal-diff strategy. Map each Java method to a Lambda handler. Map Oracle PL/SQL proc to Aurora PG (`SP_RESERVE_INVENTORY` → `pg_reserve_inventory` stored function using Aurora Postgres).
5. **Git history hunt (github):** Last non-trivial commit on `OrdersService.java` is 18 months old. Original author left. Commit SHA cited.
6. **Triage report (codegen):** Writes `docs/modernization/2026-04-17-orders-service.md` citing the Well-Architected pillars, the decomposition plan, and the verification approach.
7. **Composer edit — Lambda handler (composer):** Emits `services/orders/src/handlers/create-order.ts` (TypeScript, AWS SDK v3, Powertools for logging/tracing/metrics) replacing the EJB method. ~120 lines.
8. **Composer edit — CDK stack (composer):** Emits `services/orders/infra/orders-stack.ts` with `Function` (Lambda), `DatabaseCluster` (Aurora Serverless v2), `Secret` (Secrets Manager), `VpcEndpoint` for Secrets Manager + RDS Data API, `RestApi` with `LambdaIntegration`.
9. **Composer edit — Aurora PG stored function (composer):** Emits `services/orders/db/migrations/001_orders.sql` translating the Oracle `SP_RESERVE_INVENTORY` PL/SQL into Aurora PG `pg_reserve_inventory` using `PL/pgSQL`.
10. **Codex review — IAM (codex):** Enumerates all IAM policies in the CDK stack. Confirms least-priv: `rds-data:ExecuteStatement` scoped to cluster ARN, `secretsmanager:GetSecretValue` scoped to specific secret ARN. No `*` resources. No `iam:`* actions.
11. **Codex review — VPC (codex):** Confirms Lambda is in the private subnets, Aurora has no public endpoint, VPC endpoints exist for Secrets Manager + RDS Data API so the subnet doesn't need a NAT gateway.
12. **Codex review — cost forecast (codex):** "Estimated annual cost at 10M invocations / 2M writes / 12M reads: Lambda $1,240 · Aurora Serverless v2 $3,800 · CloudWatch $820 · Secrets Manager $480 · Total ~$6,340 ≈ $0.52M/yr at 82× scale (vs $8.4M on-prem for equivalent footprint)."
13. **Shell verify — build (shell):** `npm run build` → ✓; `cdk synth` → ✓ (writes CFN to `cdk.out`); `cdk diff` → 4 resources to add, 0 to destroy.
14. **Shell verify — integration test (shell):** `sam local invoke CreateOrderFn -e events/create-order.json` → 200 response, 412ms local.
15. **Shell verify — deploy to dev (shell):** `cdk deploy --require-approval=never --profile dev` → CloudFormation stack `orders-dev` CREATE_COMPLETE in 3m 47s.
16. **CloudWatch verify (cloudwatch):** Post-deploy metrics — p99 latency 340ms, error rate 0%, cold start < 900ms. Logs clean.
17. **PR (github):** Branch `feat/modernize-orders-service`. PR #482 opened. Title: `feat(modernize): extract OrdersService → Lambda + Aurora Serverless v2 (1/38)`.
18. **Jira update (jira):** Epic `CUR-5301` (AWS Modernization) + subtask `CUR-5302` → `In Review`.
19. **Done.**

### The four artifact modals

All four render in a MacBook frame.

1. **AWS Console modal** — **pixel-perfect Cloudscape chrome**. Must include:
  - Top nav with AWS logo, region selector (`us-east-1`), account/role (`acme-prod / ModernizationEngineer`), search bar, bell/notifications, profile avatar. This is the AWS Console — not a generic cloud UI.
  - **Left sidebar:** Cloudscape side nav with service shortcuts (Lambda, API Gateway, Aurora, ECS, CloudWatch, CloudFormation, IAM, Secrets Manager). Use the correct service-icon density.
  - **Main pane tabs:** `CloudWatch dashboard`, `Lambda function`, `Aurora cluster`, `CloudFormation stack`, `IAM policy`. Default tab: **CloudWatch dashboard**.
    - CloudWatch dashboard tab shows 4 widgets (inline SVG): `p99 latency`, `invocations`, `error rate`, `Aurora ACU utilization`. Values annotated realistically (p99 340ms, 0 errors).
    - A secondary small widget: "Architecture" — a CDK construct tree rendered as horizontal boxes (API Gateway → Lambda → Aurora, with Secrets Manager + VPC endpoints sidecars). Feels like a Cloudscape "Resource map".
  - **Right sidebar:** "Deployment" panel with `Stack: orders-dev · CREATE_COMPLETE · 3m 47s ago`, outputs (`OrdersApiUrl`, `OrdersClusterArn`), last 3 CloudFormation events. A "Cost Explorer" mini-widget: `Estimated monthly: $527 · vs on-prem ~$70K/mo`.
  - **Bottom strip:** An IAM "Policy advisor" card showing "OrdersHandlerRole: 0 over-privileged actions · 0 public resources · least-privilege ✓" — the signature artifact for an AWS SA.
  - Use Cloudscape's actual palette: near-white canvas `#F2F3F3`, squid-ink navy `#232F3E` top nav, orange `#FF9900` highlights, Cloudscape blue `#0972D3` for links. Dark-mode allowed if on-brand.
2. **Modernization triage report modal** — `react-markdown` + `remark-gfm`, MAP-flavored content:
  ```md
   # Modernization triage — OrdersService (1/38)

   **Status:** Deployed to dev · PR #482 · CUR-5302

   ## MAP phase
   - Assess ✓  · Mobilize ✓  · Migrate & Modernize → in progress (1 of 38)

   ## Scope (this bounded context)
   - Source: Java EE 7 `@Stateless` EJB · 14.2K LOC
   - Companion: Oracle 12c PL/SQL stored proc `SP_RESERVE_INVENTORY`
   - Target: Lambda (Node.js 20, TypeScript) + Aurora Serverless v2 + CDK

   ## Boundary violations collapsed
   | Violation | Resolution |
   | --- | --- |
   | Shared Oracle connection pool | Isolated Aurora cluster per service |
   | JNDI lookup from handler | IAM role + AWS SDK v3 client |
   | Synchronous cross-service stored proc | Lambda + Step Functions (async where appropriate) |
   | WebSphere-specific JPA properties | RDS Data API + PostgreSQL dialect |
   | Checked-exception leakage | Powertools structured error handling |

   ## Well-Architected citations
   - OPS 05 · automated deployment (CDK + CloudFormation)
   - SEC 02 · identity & access (IAM least-priv, Secrets Manager, no public Aurora endpoint)
   - REL 09 · automated recovery (Lambda retries, Aurora multi-AZ)
   - PERF 04 · compute at the right size (Aurora Serverless v2 autoscaling)
   - COST 06 · usage-based (Lambda per-invocation, Aurora ACUs)
   - SUS 03 · managed services (Lambda + Aurora vs idle on-prem)

   ## Verification
   - `cdk synth` ✓ · `cdk diff` ✓ · `sam local invoke` 200 (412ms)
   - Dev deploy: stack CREATE_COMPLETE in 3m 47s
   - p99 latency (dev): 340ms · Error rate: 0%

   ## Economics (this bounded context only)
   - GSI line-item: $340,000 · 4 weeks
   - Cursor: $0 license · 2 minutes agent time · dev AWS spend ~$4
   - Annualized AWS cost at steady state: ~$6.3K · vs Oracle+WebSphere slice ~$220K

   ## Portfolio context
   - 1 of 38 bounded contexts extracted.
   - Est. portfolio finish: 18 months (vs GSI baseline 5 years).
  ```
3. **Jira ticket modal** — pixel-perfect Jira, ticket `CUR-5302`, type "Modernization Task", parent epic `CUR-5301 AWS Modernization`, P1. Include `linked PR`, `linked AWS CloudFormation stack URL` (text, non-functional), `components: Platform/Backend`, assignee, status timeline `To Do → In Progress → In Review`.
4. **GitHub PR modal** — wrapped in MacBook. PR #482. Title: `feat(modernize): extract OrdersService → Lambda + Aurora Serverless v2 (1/38)`. Body must include:
  - A before/after run cost table (WebSphere + Oracle + data center slice vs AWS managed services).
  - A `Portfolio progress` line: `1 / 38 bounded contexts extracted. Est. portfolio finish: 18 months.`
  - Files changed (6): `services/orders/src/handlers/create-order.ts`, `services/orders/infra/orders-stack.ts`, `services/orders/db/migrations/001_orders.sql`, `services/orders/tests/integration/create-order.test.ts`, `cdk.json`, `package.json`.
  - Diff excerpt showing the Java EE `@Stateless` `createOrder` method next to the TypeScript Lambda handler.
  - CI checks: `tsc ✓`, `lint ✓`, `cdk synth ✓`, `cdk diff (no drift) ✓`, `integration (sam local) ✓`, `IAM least-priv lint ✓`.
  - Reviewer banner: "Verified by Cursor agent · least-priv IAM · Well-Architected 6-pillar".

### Branding

- **Primary accent:** AWS orange `#FF9900` — hero glyph, CTA emphasis.
- **Surface:** Squid-ink navy `#232F3E` top nav + deep panels; near-white `#F2F3F3` main canvases where Cloudscape is simulated.
- **Secondary accent:** Cloudscape blue `#0972D3` for metric deltas, links, tabs.
- **Success:** Green `#00A86B` (slightly different from Databricks/Snowflake greens — AWS uses a cooler, flatter green).
- **Typography:** Match existing partner theme — sans for prose, mono for code / ARN / CFN outputs.
- **Avoid:**
  - Don't copy Databricks brick-red, Snowflake blue `#29B5E8`, Datadog purple, Sentry purple.
  - Don't use a generic "cloud console" visual — it must read unmistakably as *AWS Cloudscape* (the top-nav bar shape and service icons are the giveaway).

---

## 6. Files to create

```
src/app/partnerships/aws/demo/page.tsx                                NEW  (state machine)
src/app/api/aws-webhook/route.ts                                      NEW  (EventBridge-style webhook mock)
src/app/api/aws-assess/run/route.ts                                   NEW  (~5s scope scan)

src/components/aws-live-demo/assess-card.tsx                          NEW  (trigger UI — tabbed editor w/ Java + persistence.xml + DDL + Run button)
src/components/aws-live-demo/demo-modernization-boundary.tsx          NEW
src/components/aws-live-demo/full-modernization-scope-page.tsx        NEW  (FullErrorPage equivalent)
src/components/aws-live-demo/modernization-summary.tsx                NEW  (ErrorFallback equivalent, split-screen left)
src/components/aws-live-demo/agent-console.tsx                        NEW  (AWS channels + script)
src/components/aws-live-demo/artifact-cards.tsx                       NEW
src/components/aws-live-demo/tco-comparison.tsx                       NEW  (CostComparison equivalent — WebSphere/Oracle/DC → Lambda/Aurora/CW + pulled-forward managed-service ARR)
src/components/aws-live-demo/rep-value-card.tsx                       NEW  (three-bullet "For the AWS rep")
src/components/aws-live-demo/guardrails-panel.tsx                     NEW  (IAM least-priv, no public Aurora, secrets in Secrets Manager, Well-Architected cited)
src/components/aws-live-demo/artifacts/aws-console.tsx                NEW  (pixel-perfect Cloudscape chrome + CloudWatch dashboard)
src/components/aws-live-demo/artifacts/aws-modal.tsx                  NEW  (wraps AWS console in MacBook)
src/components/aws-live-demo/artifacts/triage-report.tsx              NEW
src/components/aws-live-demo/artifacts/jira-ticket.tsx                NEW  (CUR-5302)
src/components/aws-live-demo/artifacts/github-pr-preview.tsx          NEW
src/components/aws-live-demo/artifacts/pr-modal.tsx                   NEW
src/components/aws-live-demo/artifacts/macbook-frame.tsx              NEW  (fork; or import from shared/)

src/lib/demo/legacy-monolith/OrdersService.java                       NEW  (real Java EE class)
src/lib/demo/legacy-monolith/persistence.xml                          NEW  (real persistence.xml)
src/lib/demo/legacy-monolith/orders-ddl.sql                           NEW  (real Oracle DDL + PL/SQL)
src/lib/demo/legacy-monolith/index.ts                                 NEW  (fs reader + boundary-violation tagger used by the assess route)

scripts/reset-aws-demo.sh                                             NEW  (re-seeds legacy files + verifies they still parse)
```

> Use `aws-live-demo/` as the directory for new components so they do not collide with the existing `aws-demo/` scroll-page scenes. Do not modify anything under `aws-demo/`.

**Also:**

- Update existing `src/app/partnerships/aws/page.tsx` to add a prominent CTA pill (hero-area or ribbon) linking to `/partnerships/aws/demo`. Mirror how Datadog's partnership page links to its demo.
- Reuse the promoted `src/components/shared/macbook-frame.tsx` if it exists.

---

## 7. Implementation order (recommended)

1. **Scaffold the demo route** — `src/app/partnerships/aws/demo/page.tsx` (state machine cloned from Datadog skeleton).
2. **Ship the legacy files + assess API** — real Java EE + persistence.xml + Oracle DDL + `/api/aws-assess/run`. Verify the button takes ~5s.
3. **Wire the boundary + full-screen Modernization Scope page** — four metric tiles, rep value framing, CTAs.
4. **Build the agent console** — fork Datadog's, add AWS channels (`aws`, `bedrock`, `cdk`, `cloudwatch`, …), write the ~30-step SCRIPT.
5. **Build artifact modals in this order:** PR → Jira → Triage report → **AWS Console** (save for last; hero artifact; this is the demo's visual signature).
6. **Side content** — TCO comparison (WebSphere + Oracle + data center → Lambda + Aurora + CW + pulled-forward managed-service ARR), rep-value card, guardrails panel, CTA pill.
7. **Webhook route** — EventBridge-style webhook verification (HMAC shared-secret or passcode-style fallback). `buildAgentPrompt` enforces the 10-step modernization sequence and requires Well-Architected-pillar citations in the PR body.
8. **Reset script + docs** — `scripts/reset-aws-demo.sh` restores the legacy files. Update `docs/partner-demos/README.md` if present.
9. **Typecheck + manual walkthrough on port `3103`** — `PORT=3103 npm run dev`, click through twice, confirm visual identity across runs.

---

## 8. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result. No real network calls during scripted playback. No `Math.random()` in displayed values.
- **Latency is real before the fix:** `/api/aws-assess/run` must actually take ~5s.
- **Artifacts are fully self-contained:** No external links to aws.amazon.com, console.aws.amazon.com, or github.com. Everything in-modal.
- **On-brand language:** "Lambda", "Aurora Serverless v2", "ECS Fargate", "Step Functions", "EventBridge", "Bedrock", "Amazon Q Developer", "Cloudscape", "CDK", "CloudFormation", "Well-Architected", "Migration Acceleration Program / MAP", "RDS Data API", "Secrets Manager", "VPC endpoints", "ARN". Avoid Databricks/Snowflake/Sentry/Datadog terms on this demo.
- **Single-page, no auth, no client-side API keys.**
- **Partner-rep framing is explicit** on the idle page.
- **Safety-by-default:** `buildAgentPrompt` enforces IAM least-privilege, no public Aurora endpoint, secrets via Secrets Manager, VPC endpoints where a NAT would otherwise be required, and Well-Architected-pillar citations in the PR body.
- **Dev server port:** **3103**. If you find another local server on this port, kill it before starting. Do NOT run your dev server on `3000` (other demos), `3101` (Databricks), or `3102` (Snowflake).

---

## 9. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/datadog-webhook/route.ts`. Replace with AWS vocabulary. Required steps, in order:

1. **AWS Knowledge MCP intake.** Use the repo's `dashboard-team-1-Awsknowledge` MCP tools (`aws___recommend`, `aws___search_documentation`, `aws___retrieve_agent_sop`) to pull architecture patterns + Well-Architected citations for "Java EE monolith → Lambda + Aurora". Record the cited SOP IDs for the PR body.
2. **Legacy source read (shell).** Read the Java EE class + persistence.xml + Oracle DDL/PL/SQL end-to-end. Enumerate boundary violations (shared connection pool, JNDI leakage, checked exceptions, vendor-specific JPA properties, synchronous cross-service stored procs).
3. **Bedrock reasoning (bedrock).** Use long-context reasoning (Claude on Bedrock or local equivalent) to produce a decomposition plan: bounded context → AWS managed-service target.
4. **Regression / provenance hunt (GitHub MCP).** Identify last commits touching the legacy files. Note in the PR body.
5. **Write modernization plan (codegen).** Produce `docs/modernization/<date>-<slug>.md` with MAP phase, boundary violations collapsed, Well-Architected citations, verification approach.
6. **Patch (shell + edit).** Emit the Lambda handler (TS, AWS SDK v3, Powertools), the CDK stack (with Secrets Manager, VPC endpoints, least-priv IAM), the Aurora PG migration (PL/pgSQL translation of the Oracle stored proc), and at least one integration test. Minimal diff.
7. **Static verify.** `tsc --noEmit`, `npm run lint`, `cdk synth`, `cdk diff`. Iterate until clean.
8. **Security + cost verify (codex).**
  - IAM policy audit: no `*` resources, no `iam:`* actions, all resources scoped to specific ARNs.
  - No public Aurora endpoint.
  - Secrets in Secrets Manager; no hardcoded credentials; VPC endpoints for Secrets Manager + RDS Data API.
  - Cost forecast: Lambda + Aurora + CloudWatch + Secrets Manager steady-state estimate with public unit prices.
9. **Live verify (shell).** `sam local invoke` against a seed event, then `cdk deploy --profile dev --require-approval=never`. CloudWatch smoke: p99 latency, error rate, cold start. If any metric regresses, iterate on step 6.
  - Local smoke must happen on `http://localhost:3103` (this demo's port).
10. **Open PR (GitHub MCP).** Branch `feat/modernize-<slug>`. PR body must include the boundary-violation table, the Well-Architected citations, `cdk diff` output, the IAM least-priv summary, the cost forecast, the portfolio progress line (`N / 38 bounded contexts extracted`), and a risk assessment.
11. **Jira update (Jira MCP).** Move the modernization-task subtask to `In Review`.

Be explicit: the agent **must** hit every step and cite evidence in the PR body. Determinism across real runs is the goal.

---

## 10. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/aws/demo` loads with hero + CTA pill + assess card showing visible legacy Java EE + persistence.xml + DDL.
- Clicking **Run readiness scan** shows ~5s of scanning, then pivots to the full-screen Modernization Scope Reality page.
- The Scope page clearly communicates the GSI baseline vs Cursor baseline and the AWS-rep upside (pulled-forward managed-service ARR, MAP success-rate lift, Bedrock/Q pull-through).
- Clicking **Watch Cursor modernize this** starts the scripted console playing ~30 channel-coded steps in ~20–22s real time with displayed timestamps scaling to ~2 minutes.
- Console completion transitions to `complete` and reveals four artifact cards.
- Each modal opens pixel-perfect and closes cleanly.
- The AWS Console modal includes a credible CloudWatch dashboard, CDK resource map, IAM policy advisor, and Cost Explorer mini-widget — feels indistinguishable from Cloudscape at a glance.
- **Reset** returns the demo to clean `idle`.
- Two consecutive runs produce visually identical output.
- `npx tsc --noEmit` passes.
- No external links leak out of any modal.
- `scripts/reset-aws-demo.sh` restores the legacy files after a real PR merge.
- Existing `/partnerships/aws` scroll page is untouched except for the new CTA link.
- Demo dev server runs cleanly on `http://localhost:3103` and does not interfere with `:3000`, `:3101`, or `:3102`.

---

## 11. Anti-patterns / things to avoid

- ❌ **Don't** frame this as "fixing a bug". It's an **application modernization**, not a bug-fix narrative.
- ❌ **Don't** reuse Databricks, Snowflake, Sentry, or Datadog accent colors in the hero. AWS orange + squid-ink navy + Cloudscape blue only.
- ❌ **Don't** make the agent console non-deterministic. No `setTimeout(…, Math.random())`. No real HTTP during playback.
- ❌ **Don't** cheapen the AWS Console modal. CloudWatch widgets, CDK resource map, IAM policy advisor, and the Cost Explorer are the signatures. If you can't make it feel like Cloudscape, spend more time — this is the hero artifact.
- ❌ **Don't** delete or modify anything under `src/components/aws-demo/` (the existing scroll-page scenes). Use `src/components/aws-live-demo/` for the interactive demo.
- ❌ **Don't** delete or modify `src/components/{sentry-demo,datadog-demo,figma-demo,databricks-demo,snowflake-demo}/`. Fork via copy.
- ❌ **Don't** skip the partner-rep framing.
- ❌ **Don't** hardcode API keys, access keys, or ARNs tied to real accounts anywhere in client code. Use obvious mock ARNs (`arn:aws:iam::123456789012:role/OrdersHandlerRole`).
- ❌ **Don't** run your dev server on `:3000`, `:3101`, or `:3102`. Use `:3103` as assigned.
- ❌ **Don't** make the Java EE a toy. A developer who remembers J2EE must nod at `@Stateless`, `@PersistenceContext`, JNDI lookups, and the `CallableStatement` pattern.
- ❌ **Don't** omit Well-Architected citations — they're the signal to an AWS SA that you understand the partner motion.

---

## 12. Quick reference — Sentry/Datadog-demo files → AWS-demo files


| Sentry/Datadog                                               | AWS (`aws-live-demo/`)                                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `checkout-card.tsx` / `reports-card.tsx`                     | `assess-card.tsx`                                                                                     |
| `demo-error-boundary.tsx` / `demo-perf-boundary.tsx`         | `demo-modernization-boundary.tsx`                                                                     |
| `full-error-page.tsx` / `full-slo-breach-page.tsx`           | `full-modernization-scope-page.tsx`                                                                   |
| `error-fallback.tsx` / `slo-summary.tsx`                     | `modernization-summary.tsx`                                                                           |
| `agent-console.tsx`                                          | `agent-console.tsx` (AWS channels + script)                                                           |
| `artifact-cards.tsx`                                         | `artifact-cards.tsx`                                                                                  |
| `artifacts/sentry-issue.tsx` / `artifacts/datadog-trace.tsx` | `artifacts/aws-console.tsx`                                                                           |
| `artifacts/sentry-modal.tsx` / `artifacts/datadog-modal.tsx` | `artifacts/aws-modal.tsx`                                                                             |
| `artifacts/triage-report.tsx`                                | `artifacts/triage-report.tsx` (MAP + Well-Arch)                                                       |
| `artifacts/jira-ticket.tsx`                                  | `artifacts/jira-ticket.tsx` (CUR-5302)                                                                |
| `artifacts/github-pr-preview.tsx`                            | `artifacts/github-pr-preview.tsx` (modernization PR)                                                  |
| `artifacts/pr-modal.tsx`                                     | `artifacts/pr-modal.tsx`                                                                              |
| `artifacts/macbook-frame.tsx`                                | Same or promoted to `shared/`                                                                         |
| `cost-comparison.tsx` / `latency-comparison.tsx`             | `tco-comparison.tsx`                                                                                  |
| `src/lib/demo/order-processor.ts` + `format-payment.ts`      | `src/lib/demo/legacy-monolith/OrdersService.java` + `persistence.xml` + `orders-ddl.sql` + `index.ts` |
| `src/app/api/sentry-webhook/route.ts`                        | `src/app/api/aws-webhook/route.ts`                                                                    |
| `scripts/reset-sentry-demo.sh`                               | `scripts/reset-aws-demo.sh`                                                                           |


---

## 13. AWS-specific wrinkles

- **AWS webhooks** come from EventBridge (and SNS → HTTPS, and API Destinations) with an `X-Amz-Event-Signature` HMAC-SHA256 header derived from a shared secret configured on the API Destination. Verify against `process.env.AWS_WEBHOOK_SECRET`. If the exact signing scheme varies at build time, fall back to a passcode-style verification — the mock is what matters for the demo.
- **AWS Knowledge MCP is already in this repo.** `dashboard-team-1-Awsknowledge` exposes `aws___recommend`, `aws___read_documentation`, `aws___search_documentation`, `aws___retrieve_agent_sop`, `aws___list_regions`, `aws___get_regional_availability`. The real agent invoked via webhook should actually call these tools and cite their output in the PR body. The scripted playback just names "aws-knowledge-mcp".
- **CDK is the canonical modernization target.** Emit CDK (TypeScript) for infrastructure, not raw CloudFormation YAML, not Terraform, not SAM templates. This is the partner-preferred IaC shape — an AWS SA reading the PR expects CDK.
- **Well-Architected citations are the trust signal.** Every modernization PR body should cite at least 3 of the 6 pillars (OPS, SEC, REL, PERF, COST, SUS) with pillar question IDs where appropriate. This is how the rep knows you understand the partner motion.
- **Cost math:** When citing Lambda + Aurora Serverless v2 + CloudWatch costs in the Console modal / PR / TCO panel, use defensible public unit prices (Lambda $0.20 per 1M requests + $0.0000166667/GB-s; Aurora Serverless v2 $0.12/ACU-hour; CloudWatch logs $0.50/GB ingestion). Round generously and flag as "est."
- **ARN hygiene:** Always use the long form (`arn:aws:lambda:us-east-1:123456789012:function:orders-create`) in artifacts. Never use real account IDs — use the canonical public-docs placeholder `123456789012`.
- **Region convention:** Default everything to `us-east-1` for the demo, and mention "multi-region available" in the triage report to avoid looking parochial to enterprise customers.

---

## 14. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all four modals twice in a row on `http://localhost:3103`. Commit on a new branch `partner-demos-aws`. Open a draft PR against `main` titled **"feat: AWS live modernization + fix demo"**. Include screenshots: (1) idle page with rep-value card + legacy Java EE visible, (2) full-screen Modernization Scope Reality page, (3) running split-screen with agent console mid-run, (4) completed state with all four artifact cards, (5) the AWS Console modal with CloudWatch dashboard + CDK resource map + IAM policy advisor visible.