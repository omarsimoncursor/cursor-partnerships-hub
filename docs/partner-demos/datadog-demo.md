# Datadog Live Triage & Fix Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/datadog/demo`, patterned on the existing Sentry demo at `/partnerships/sentry/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Datadog + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/datadog/demo` and clicks a button to run a realistic workflow ("Generate Q4 analytics report", "Run data pipeline", etc.).
2. The workflow is intentionally slow due to a real code bug (sequential awaits / N+1 pattern / blocking I/O). The UI takes ~7s and then shows a full-page SLO-breach error.
3. Datadog (mocked) detects the latency anomaly and fires a webhook.
4. A scripted "agent console" plays on the right half of the screen showing Cursor orchestrating: Datadog MCP → Opus triage → GitHub MCP → Composer edit → Codex review → shell verification → PR opened → Jira ticket updated.
5. When the run completes, the user can click through four pixel-perfect artifact modals: **Datadog issue**, **Triage report**, **Jira ticket**, and **GitHub PR** (inside a MacBook frame).
6. Reset button returns the demo to clean state. A `scripts/reset-datadog-demo.sh` script re-seeds the bug after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying bug and reset are real.

---

## 1. Why this is being built

The existing `/partnerships/datadog` page is a scroll-driven narrative across five acts. It's beautiful but **passive** — you can't *feel* the orchestration. The Sentry demo (`/partnerships/sentry/demo`) solved this by letting the prospect click a button, watch a real error happen, and then watch (simulated, scripted) agent work stream in real time.

We want the **same reflex** for Datadog: prospect clicks → observes a performance regression → watches Cursor catch and fix it. Datadog's story is different from Sentry's (performance/SLO vs hard crash), so this demo must feel on-brand for Datadog, not a Sentry reskin.

---

## 2. Required reading (in this repo, in order)

Before you write any code, study the Sentry demo. This is the pattern you are replicating.

**Page + state machine:**

- `src/app/partnerships/sentry/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`), three conditional regions, artifact modal dispatch.

**Components:**

- `src/components/sentry-demo/checkout-card.tsx` — the trigger UI.
- `src/components/sentry-demo/demo-error-boundary.tsx` — error interception.
- `src/components/sentry-demo/full-error-page.tsx` — full-screen error takeover with "Watch the fix" CTA.
- `src/components/sentry-demo/error-fallback.tsx` — compact error summary for split-screen (left panel while agent runs).
- `src/components/sentry-demo/agent-console.tsx` — **this is the single most important file to study**. Scripted step playback with channel-coded rows, timestamps, delays, and `onComplete` callback.
- `src/components/sentry-demo/artifact-cards.tsx` — the three CTA tiles after the run completes.
- `src/components/sentry-demo/artifacts/triage-report.tsx` — markdown modal.
- `src/components/sentry-demo/artifacts/jira-ticket.tsx` — pixel-perfect Jira ticket modal.
- `src/components/sentry-demo/artifacts/macbook-frame.tsx` — photorealistic MacBook chrome.
- `src/components/sentry-demo/artifacts/github-pr-preview.tsx` — pixel-perfect GitHub PR.
- `src/components/sentry-demo/artifacts/pr-modal.tsx` — wraps GitHub PR in MacBook.
- `src/components/sentry-demo/artifacts/sentry-issue.tsx` + `sentry-modal.tsx` — pixel-perfect Sentry issue detail in MacBook.
- `src/components/sentry-demo/cost-comparison.tsx`, `guardrails-panel.tsx` — supporting cards on the idle page.

**Trigger code (the real bug):**

- `src/lib/demo/order-processor.ts` + `src/lib/demo/format-payment.ts` — two-file null-ref bug.

**Webhook + reset:**

- `src/app/api/sentry-webhook/route.ts` — webhook signature verification + background agent trigger + `buildAgentPrompt`.
- `scripts/reset-sentry-demo.sh` — re-seeds the bug after a real PR merges.

**Existing Datadog partner page you are extending (not replacing):**

- `src/app/partnerships/datadog/page.tsx`
- `src/components/datadog/*.tsx` (alert / editor / analysis / fix / value-prop scenes)
- `src/components/shared/{mcp-flow-diagram,flow-pipe,pr-review-station}.tsx` — reuse where it makes sense.

---

## 3. What the Sentry demo does (pattern summary)

The Sentry demo is a state machine rendered on one route. Study the phases:


| Phase      | What renders                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + `CheckoutCard` inside `DemoErrorBoundary` + cost/guardrails sections below the fold.   |
| `error`    | Full-screen `FullErrorPage` takeover with "Watch the fix" and "Reset" CTAs. Hides everything else.       |
| `running`  | Split screen: `ErrorFallback` left, `AgentConsole` right. Scripted steps stream in. Reset button in nav. |
| `complete` | Same split screen, plus `ArtifactCards` strip with 3 tiles. Top banner flips to green "Run complete".    |


Artifact modals (triage, jira, pr, sentry) are overlays opened from either `ErrorFallback` or `ArtifactCards`, closable, self-contained.

The AgentConsole `SCRIPT` is an array of `Step` objects with `channel` (`sentry` / `github` / `jira` / `shell` / `opus` / `composer` / `codex` / `codegen` / `done`), a `label`, a one-line `detail`, and a `delayMs`. Real runtime is ~19s; displayed timestamps are scaled by `TIME_SCALE = 6.9` to show a realistic ~2 min of "agent work".

**This scripted-playback pattern is the whole trick.** Replicate it faithfully.

---

## 4. The Datadog demo — concept & story

### The trigger scenario

**Surface UI:** An "Analytics" or "Reports" mini-app on the demo page. The hero card is something like:

> **Generate Q4 revenue report**
> Aggregate orders across all regions and render the chart.
> `[ Run report ]`

When clicked, it shows a loading state ("Querying orders…", "Aggregating regions…") for ~7 seconds, then pivots to a full-screen **SLO Breach** takeover (not a crash — a performance incident).

**The full-screen error (Datadog equivalent of `FullErrorPage`):**

- Big "⚠ Latency SLO breach" heading (not a 500 number — this is *perf*, not a crash).
- Datadog-purple accent (`#632CA6`).
- Line: `/api/reports/generate · P99 · 7,412ms · SLO target 500ms · 14.8× over budget`.
- Subtext naming the cause in Datadog vocabulary: "APM trace reveals a sequential await chain in `aggregate-orders.ts`. 6 dependent DB calls serialized where parallelism was safe."
- Two buttons: **"Watch Cursor triage this"** (→ running phase) and **"Reset"**.

### The underlying bug (real code, reset-able)

Create two cooperating files. The bug must be *correct* (typechecks, runs) but performs poorly. The fix is parallelization + memoization.

`**src/lib/demo/aggregate-orders.ts`** (buggy):

```ts
import { fetchRegionOrders, fetchRegionTax, type Region } from './region-store';

const REGIONS: Region[] = ['us-east', 'us-west', 'eu', 'apac', 'latam', 'uk'];

export async function aggregateOrdersByRegion() {
  const byRegion: Record<string, { orders: number; tax: number }> = {};
  for (const region of REGIONS) {
    const orders = await fetchRegionOrders(region);   // sequential ❌
    const tax = await fetchRegionTax(region);         // sequential ❌
    byRegion[region] = { orders: orders.length, tax };
  }
  return byRegion;
}
```

`**src/lib/demo/region-store.ts**` (simulates ~600ms latency per call — real `setTimeout` so the user genuinely waits):

```ts
export type Region = 'us-east' | 'us-west' | 'eu' | 'apac' | 'latam' | 'uk';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function fetchRegionOrders(region: Region) {
  await sleep(600);
  return Array.from({ length: 120 + region.length * 3 }, (_, i) => ({ id: `${region}-${i}` }));
}

export async function fetchRegionTax(region: Region) {
  await sleep(550);
  return Math.round(Math.random() * 10_000);
}
```

Total elapsed: **6 regions × 2 sequential 600ms calls ≈ 7.0s–7.5s**. That's the SLO breach.

**The fix** (what the agent "produces"): `Promise.all` + `fetchAll` helper. Post-fix elapsed should be ~600ms.

> Use this exact bug or one structurally equivalent. The point is it must be real, typechecks, and produces visible latency the prospect can feel.

### The orchestration (scripted console playback)

Channels your `SCRIPT` needs (extend the Sentry `Channel` union, keep Opus/Composer/Codex):


| Channel     | Label             | Hex accent | Role in the story                                    |
| ----------- | ----------------- | ---------- | ---------------------------------------------------- |
| `datadog`   | `datadog-mcp`     | `#632CA6`  | Fetching trace, span, SLO, monitor context           |
| `github`    | `github-mcp`      | (white)    | Commit history, branch, PR                           |
| `jira`      | `jira-mcp`        | `#4C9AFF`  | Incident ticket creation + state transitions         |
| `shell`     | `shell`           | green      | `tsc`, dev server, curl/benchmark, git               |
| `opus`      | `opus · triage`   | `#D97757`  | Long-context root-cause reasoning                    |
| `composer`  | `composer · edit` | blue       | Scoped code edits                                    |
| `codex`     | `codex · review`  | `#10a37f`  | Patch review / regression check                      |
| `pagerduty` | `pagerduty-mcp`   | `#06AC38`  | *Optional* — silence/ack the paging (Datadog-native) |
| `codegen`   | `codegen`         | blue       | Triage report generation                             |
| `done`      | `complete`        | green      | Terminal step                                        |


Add `pagerduty` as an optional extra channel only if it lands cleanly in the script; otherwise stick to the Sentry set with `datadog` replacing `sentry`.

**Target script arc (~25–30 steps, ~19s real, scaled to ~2min displayed via `TIME_SCALE`):**

1. **Intake (datadog):** Fetch monitor → fetch APM trace → parse spans/flame chart → extract slow path.
2. **Incident management (pagerduty + jira):** PagerDuty incident ack'd → Jira ticket `CUR-4318` created (P1, SLO breach).
3. **Opus triage:** Model selected for long-context reasoning over trace + code. Pulls commit history (github-mcp). Identifies regression commit. Forms hypothesis: "sequential awaits across 6 regions × 2 calls = O(n) blocking".
4. **Codegen:** Triage report written to `docs/triage/2026-04-16-slo-breach-aggregate-orders.md`.
5. **Composer edit:** Reads `aggregate-orders.ts`. Converts the `for` loop to `Promise.all`. Adds a `fetchRegionSummary` helper that parallelizes the two inner awaits.
6. **Codex review:** Checks no behavioral change (same output shape), flags no semantics changes, confirms lint + style.
7. **Shell verification:**
  - `npx tsc --noEmit` → ✓
  - `npm run dev` → ready
  - `curl -w "%{time_total}" http://localhost:3000/api/reports/generate` → `0.612s` (✓ under SLO)
  - Compare to pre-fix baseline: `7.41s → 0.61s · 12.1× faster · SLO margin: 8.1×`
8. **PR (github):** Branch `fix/parallelize-region-aggregation` → commit → push → PR #157 opened. Title: `perf: parallelize region aggregation (12× faster, resolves P1 SLO breach)`.
9. **Jira update:** `CUR-4318 → In Review`.
10. **Done:** Artifacts ready.

### The four artifact modals

All four render in a MacBook frame using the existing `src/components/sentry-demo/artifacts/macbook-frame.tsx` (move/rename it to `src/components/shared/macbook-frame.tsx` if you want to share, but don't delete the Sentry one).

1. **Datadog issue modal** (equivalent of `SentryModal`) — pixel-perfect Datadog **APM trace detail page**. Must include:
  - Top nav with Datadog logo (purple bone `#632CA6`), org/env selector, search bar.
  - Monitor name header: `web.request - /api/reports/generate`.
  - Metric sparkline showing latency spike (inline SVG).
  - Tabs: `Flame graph`, `Span list`, `Logs`, `Infrastructure`, `Analytics`.
  - Default tab = **Flame graph**: horizontal bars showing `aggregate-orders.ts` at the top with 6 serial `fetchRegionOrders` / `fetchRegionTax` children stacked end-to-end. Each bar labeled with region + ~600ms.
  - Right sidebar: service tags, version, deployment marker, affected endpoints, related alerts.
  - Use Datadog's dark-mode aesthetic (deep slate `#1B1E3D`-ish, purple accent, thin 1px borders).
2. **Triage report modal** — same as Sentry's (`react-markdown` + `remark-gfm`), just different content. Format:
  ```md
   # Triage — Latency SLO breach on /api/reports/generate

   **Status:** Fix proposed · PR #157 · CUR-4318

   ## Incident
   - P99 latency: 7,412ms (SLO: 500ms)
   - Duration in breach: 6m 12s
   - Affected endpoint: /api/reports/generate
   - Blast: 1.4% of daily revenue-reporting users saw >5s waits

   ## Root cause
   | Layer | Observation |
   | --- | --- |
   | Code | Sequential `await` in `aggregate-orders.ts` for 6 regions × 2 calls |
   | Trace | 12 serial spans, 0 parallelism in flame graph |
   | Regression | Commit `a4f2e1b` — "add eu + latam regions" (4 days ago) |

   ## Fix
   - Parallelize outer region loop with `Promise.all`
   - Parallelize inner `orders`/`tax` fetch per region
   - Add `fetchRegionSummary` helper for clarity

   ## Verification
   - Static: `tsc --noEmit` ✓, `eslint` ✓
   - Live: curl against `/api/reports/generate` — 7.41s → 0.61s (12.1× faster, 8.1× under SLO)

   ## Risk
   - Blast radius: 1 file, +18 −11
   - Rollback: `git revert HEAD`
   - Type surface unchanged
  ```
3. **Jira ticket modal** — pixel-perfect Jira, same style as Sentry's. Ticket `CUR-4318`, P1, SLO Breach type. Include the "linked PR", "incident timeline", "assignee", "components" fields. Status moves through `To Triage → In Progress → In Review` (render as a timeline).
4. **GitHub PR modal** — wrapped in MacBook, mirrors the Sentry PR pattern. PR #157. Include:
  - Title: `perf: parallelize region aggregation (12× faster)`
  - Body with before/after latency table, CI checks (all green), "Verified by Cursor agent" reviewer banner.
  - Files changed: 2 (`aggregate-orders.ts`, `region-store.ts` if applicable).
  - Diff excerpt in modal preview.
  - CI: `tsc ✓`, `lint ✓`, `unit ✓`, `perf regression suite ✓`.

### Branding

- **Primary accent:** Datadog purple `#632CA6` (hero glyph, logo-sized badges, CTA emphasis). Already used in `src/components/datadog/`* — be consistent.
- **SLO / alert color:** Amber `#F5A623` for "Breach" and "Over budget" chips. Reserve red for "Down/outage" which is *not* what this demo shows.
- **Success:** Green `#4ADE80` (after-fix, artifacts, Jira "In Review").
- **Fonts / vocabulary:** Match the existing Datadog partner page — dark glass cards, mono for metrics and payloads, sans for prose.
- **Avoid:** Don't copy Sentry purple (`#362D59`). Don't reuse Sentry's mascot. Don't leak Sentry copy into Datadog artifacts.

---

## 5. Files to create

Mirror Sentry structure under new directories. Keep Sentry files untouched.

```
src/app/partnerships/datadog/demo/page.tsx                            NEW
src/app/api/datadog-webhook/route.ts                                  NEW

src/components/datadog-demo/reports-card.tsx                          NEW  (the trigger UI, analogous to CheckoutCard)
src/components/datadog-demo/demo-perf-boundary.tsx                    NEW  (intercepts SLO-breach thrown from reports-card)
src/components/datadog-demo/full-slo-breach-page.tsx                  NEW  (FullErrorPage equivalent, Datadog-purple)
src/components/datadog-demo/slo-summary.tsx                           NEW  (ErrorFallback equivalent, compact split-screen panel)
src/components/datadog-demo/agent-console.tsx                         NEW  (fork of sentry-demo/agent-console.tsx with Datadog channels + script)
src/components/datadog-demo/artifact-cards.tsx                        NEW
src/components/datadog-demo/latency-comparison.tsx                    NEW  (CostComparison equivalent — before/after latency, not $)
src/components/datadog-demo/guardrails-panel.tsx                      NEW  (or reuse shared one if extracted)
src/components/datadog-demo/artifacts/datadog-trace.tsx               NEW  (pixel-perfect APM flame graph page)
src/components/datadog-demo/artifacts/datadog-modal.tsx               NEW  (wraps DatadogTrace in MacBook)
src/components/datadog-demo/artifacts/triage-report.tsx               NEW  (Datadog-specific content)
src/components/datadog-demo/artifacts/jira-ticket.tsx                  NEW  (CUR-4318 content)
src/components/datadog-demo/artifacts/github-pr-preview.tsx           NEW  (perf PR content)
src/components/datadog-demo/artifacts/pr-modal.tsx                    NEW

src/lib/demo/aggregate-orders.ts                                      NEW  (the buggy code)
src/lib/demo/region-store.ts                                          NEW  (simulated slow I/O)
src/app/api/reports/generate/route.ts                                 NEW  (calls aggregateOrdersByRegion)

scripts/reset-datadog-demo.sh                                         NEW  (re-seeds the sequential-await bug)
```

**Also:**

- Update existing `src/app/partnerships/datadog/page.tsx` to add a prominent CTA linking to `/partnerships/datadog/demo` at the end of the hero or as a ribbon. Mirror how the Sentry partnership page links to its demo.
- Consider promoting `src/components/sentry-demo/artifacts/macbook-frame.tsx` into `src/components/shared/macbook-frame.tsx` and importing from both demos. If you do this, preserve Sentry's existing imports.
- Add the new bug files to any demo-file lint allowlist if one exists.

---

## 6. Implementation order (recommended)

1. **Scaffold the route** — `src/app/partnerships/datadog/demo/page.tsx` with the four-phase state machine, copy-pasted from the Sentry page as a starting skeleton.
2. **Ship the trigger path first** — `reports-card.tsx` + `aggregate-orders.ts` + `region-store.ts` + the API route. Verify the button really takes ~7 seconds.
3. **Wire the boundary + full-screen takeover** — make sure a thrown/returned SLO-breach flips phase to `error`.
4. **Build the agent console** — fork Sentry's, add Datadog channels, write the 25–30-step Datadog SCRIPT. Tune `TIME_SCALE` for ~2-min displayed runtime.
5. **Build artifact modals in this order:** PR (reuse MacBook frame) → Jira → Datadog APM trace → Triage report. PR and Jira are cheapest to adapt from Sentry; Datadog APM is the new/hard one.
6. **Side content** — latency comparison, guardrails panel, CTA pill.
7. **Webhook route** — Datadog signature verification, background agent trigger, `buildAgentPrompt` explaining the Datadog-specific 7-step sequence.
8. **Reset script + docs** — `scripts/reset-datadog-demo.sh` with `git add + commit`. Update the main README or add a `docs/partner-demos/README.md` entry.
9. **Typecheck + manual walkthrough** — click through all 4 phases + all 4 modals + reset. Confirm the demo is *visually indistinguishable* between run 1 and run 2.

---

## 7. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result, every time. No real network calls in the scripted console. No Math.random() in the displayed playback. Timestamps are derived from the cumulative `delayMs × TIME_SCALE` just like Sentry.
- **Latency is real before the fix:** `/api/reports/generate` must actually take ~7s so the prospect experiences the problem. Use real `setTimeout` in `region-store.ts`.
- **Latency is real after the fix** (optional but powerful): If you want the "verify the fix" story to be demonstrable on-site, keep the buggy file in `main` and add a `src/lib/demo/aggregate-orders.fixed.ts` the reset script can swap in when toggled — but **default to the buggy state**. Don't block the demo on this.
- **Artifacts are fully self-contained:** No external links out to datadog.com or github.com. Everything opens in-modal. Prospects without Datadog accounts must get the full experience.
- **On-brand language:** "SLO breach", "P99", "flame graph", "spans", "traces", "monitors", "PagerDuty ack'd" — Datadog's vocabulary. Avoid Sentry terms ("issue", "breadcrumb", "event") on this demo.
- **Single-page, no auth:** Don't require login. Don't require API keys client-side. The webhook route is the only place env vars are read.
- **Safety-by-default:** Exactly like Sentry's `buildAgentPrompt`, the Datadog webhook's prompt must enforce the step sequence (triage → regression hunt → read → patch → static verify → live verify → open PR) and require evidence in the PR body.

---

## 8. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/sentry-webhook/route.ts` exactly. Replace Sentry vocabulary with Datadog vocabulary. Required steps in order:

1. **Datadog MCP intake.** Fetch monitor detail, APM trace, slow spans, deployment markers, affected service/endpoint.
2. **Regression hunt (GitHub MCP).** List last 10 commits touching files in the slow spans' stack. Identify the most recent performance-relevant commit.
3. **Read affected code (shell).** Read every file in the slow span stack. Form a written hypothesis before patching.
4. **Patch (shell + edit).** Minimal correct fix. Parallelize, memoize, or cache — whichever the data dictates. Do not widen contracts unnecessarily.
5. **Static verify.** `npm run lint`, `npx tsc --noEmit`. Iterate until clean.
6. **Live perf verify.** `npm run dev`, hit the endpoint with `curl -w "%{time_total}"` (or a headless browser), record before/after. The fix must reduce wall time to the SLO target or better. If not, iterate on step 4.
7. **Open PR (GitHub MCP).** Branch `perf/<slug>`. PR body must include a **before/after latency table**, the regression commit SHA, the triage report path, and a risk assessment.
8. **Jira update (Jira MCP).** Move ticket to `In Review`, link the PR.

Make the prompt explicit that the agent **must** hit every step and cite evidence in the PR body from that step. This is the contract that keeps behavior deterministic across real runs.

---

## 9. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/datadog/demo` loads with hero + CTA pill + reports card.
- Clicking **Run report** shows a realistic loading state for ~7s, then pivots to the full-screen SLO-breach page.
- Clicking **Watch Cursor triage this** starts the scripted console which plays ~25 channel-coded steps in ~19s real time with displayed timestamps scaling to ~2 minutes.
- Console completion transitions to `complete` phase and reveals four artifact cards.
- Each artifact modal opens, renders pixel-perfect, and closes without leaking state.
- The Datadog APM trace modal shows a believable flame graph with 6 stacked serial spans.
- **Reset** in the nav returns the demo to clean `idle` across all phases.
- Running the demo twice in a row produces identical output.
- `npx tsc --noEmit` passes.
- No external links leak out of any modal.
- `scripts/reset-datadog-demo.sh` restores the buggy state after a real PR merge.
- Existing `/partnerships/datadog` scroll page is untouched except for a new CTA link to `/demo`.

---

## 10. Anti-patterns / things to avoid

- ❌ **Don't** reuse Sentry purple (`#362D59`) or Sentry's mascot. The demos must feel distinct.
- ❌ **Don't** make the agent console non-deterministic. No `setTimeout(…, Math.random()…)`. No real HTTP calls during playback.
- ❌ **Don't** show a generic "error" page. This is a **performance** story, not a crash — the vocabulary and visuals must reflect SLO/P99/latency, not stack traces.
- ❌ **Don't** put the APM flame graph in pure HTML table form. Use inline SVG or absolutely-positioned div bars with realistic widths keyed to real durations. Make it feel like Datadog.
- ❌ **Don't** skip the MacBook frame for artifact modals — it's the visual signature of the Sentry demo and must be consistent here.
- ❌ **Don't** delete or modify `src/components/sentry-demo/`**. Fork via copy, don't share state unless you deliberately extract into `shared/`.
- ❌ **Don't** hardcode API keys or DSNs anywhere in client code. Everything env-driven, server-side only.
- ❌ **Don't** break the existing scroll-driven Datadog partnership page. Add a CTA, not a rewrite.

---

## 11. Quick reference — Sentry-demo files → Datadog-demo files


| Sentry                                | Datadog                                             |
| ------------------------------------- | --------------------------------------------------- |
| `checkout-card.tsx`                   | `reports-card.tsx`                                  |
| `demo-error-boundary.tsx`             | `demo-perf-boundary.tsx`                            |
| `full-error-page.tsx`                 | `full-slo-breach-page.tsx`                          |
| `error-fallback.tsx`                  | `slo-summary.tsx`                                   |
| `agent-console.tsx`                   | `agent-console.tsx` (different channels + script)   |
| `artifact-cards.tsx`                  | `artifact-cards.tsx`                                |
| `artifacts/sentry-issue.tsx`          | `artifacts/datadog-trace.tsx`                       |
| `artifacts/sentry-modal.tsx`          | `artifacts/datadog-modal.tsx`                       |
| `artifacts/triage-report.tsx`         | `artifacts/triage-report.tsx` (Datadog content)     |
| `artifacts/jira-ticket.tsx`           | `artifacts/jira-ticket.tsx` (CUR-4318)              |
| `artifacts/github-pr-preview.tsx`     | `artifacts/github-pr-preview.tsx` (perf PR)         |
| `artifacts/pr-modal.tsx`              | `artifacts/pr-modal.tsx`                            |
| `artifacts/macbook-frame.tsx`         | Same file OR promoted to `shared/macbook-frame.tsx` |
| `cost-comparison.tsx`                 | `latency-comparison.tsx`                            |
| `src/lib/demo/order-processor.ts` +   | `src/lib/demo/aggregate-orders.ts` +                |
| `src/lib/demo/format-payment.ts`      | `src/lib/demo/region-store.ts`                      |
| `src/app/api/sentry-webhook/route.ts` | `src/app/api/datadog-webhook/route.ts`              |
| `scripts/reset-sentry-demo.sh`        | `scripts/reset-datadog-demo.sh`                     |


---

## 12. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all four modals twice in a row. Commit on a new branch `partner-demos-datadog`. Open a draft PR against `main` titled **"feat: Datadog live triage + fix demo"** with a body matching the Sentry PR's structure. Include screenshots of: (1) full-screen SLO breach page, (2) running split-screen with agent console mid-run, (3) completed state with all four artifact cards visible, (4) each of the four modals open.