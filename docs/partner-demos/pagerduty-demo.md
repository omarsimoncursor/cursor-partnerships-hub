# PagerDuty Live Auto-Resolve Demo — Build Brief

> **Purpose of this document:** Self-contained prompt/spec for a new Cursor agent to build an interactive demo at `/partnerships/pagerduty/demo`. Patterned on the existing Sentry demo at `/partnerships/sentry/demo` and Datadog demo at `/partnerships/datadog/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes PagerDuty + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/pagerduty/demo`. The hero is a glanceable "on-call status board" for a fake `payments-api` service. The local time on the board is `03:14 AM`.
2. The user clicks **"Simulate bad deploy"**. After ~5s of deploy progress, a full-screen takeover renders a **PagerDuty incident page** ("P1 · payments-api 5xx error budget burned in 3 min") that mimics the real page-paging experience — pulsing red header, on-call rotation, escalation policy.
3. The user clicks **"Watch Cursor handle this page"**. The screen splits: a live "auto-pilot" PagerDuty incident timeline on the left, the scripted agent console on the right.
4. The agent: ack's the page within 12 seconds, fetches incident + recent change events via PagerDuty MCP, correlates to the offending deploy via GitHub MCP, runs a triage loop (revert vs fix-forward decision), executes a revert PR + redeploy via the GitHub + AWS/Vercel MCPs, posts Statuspage update, posts Slack update to `#ops`, and resolves the incident.
5. When the run completes, four artifacts are clickable: **PagerDuty incident detail** (with the full auto-resolve timeline), **Statuspage update**, **Revert PR**, and **Postmortem doc**. A side card shows a counterfactual "what would have happened without Cursor" timeline (47 min mean time to resolve, 1 human paged, 1 escalation).
6. Reset returns the demo to clean state. `scripts/reset-pagerduty-demo.sh` re-seeds the simulated bad deploy.

**The demo must behave identically every time.** All agent work is scripted playback. The point of difference vs the Sentry/Datadog demos: this is an **incident-lifecycle** story, not a code-bug story. The "AHA" is *"the page got resolved without paging a human."*

---

## 1. Why this demo, why this angle

Existing partnership pages cover the upstream signal (Sentry = crash, Datadog = SLO breach). PagerDuty is downstream of every signal source — it's where humans actually wake up. The most impactful agentic story for PD is **page suppression**: an incident fires, Cursor ack's and remediates before a human is interrupted. This is a vivid, deeply-felt enterprise pain point (3am pages, alert fatigue, on-call burnout) that converts the moment a prospect sees it.

We deliberately separate this from the Datadog demo so each demo has its own crisp thesis:

- **Datadog demo:** *"Latency root cause → tested PR."*
- **PagerDuty demo:** *"P1 page → resolved + revert PR, no human paged."*

---

## 2. Required reading (in this repo, in order)

Study the Sentry demo first — it's the canonical pattern. Then study the Datadog demo for how to fork that pattern with new vocabulary, channels, and artifacts.

**Page + state machine:**

- `src/app/partnerships/sentry/demo/page.tsx` — the four-phase state machine.
- `src/app/partnerships/datadog/demo/page.tsx` — the same pattern, re-skinned. Closer to what you'll build.

**Components to study:**

- `src/components/sentry-demo/agent-console.tsx` — **most important file**. Scripted playback, channel-coded rows, `TIME_SCALE`, `Step` shape, `onComplete`.
- `src/components/datadog-demo/agent-console.tsx` — fork target.
- `src/components/sentry-demo/full-error-page.tsx` and `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeovers.
- `src/components/sentry-demo/error-fallback.tsx` and `src/components/datadog-demo/slo-summary.tsx` — compact split-screen panels.
- `src/components/sentry-demo/artifacts/macbook-frame.tsx` — promote/share if not already done. Use it for every artifact modal.
- `src/components/sentry-demo/artifacts/{sentry,jira,pr}-{issue,modal,ticket,preview}.tsx` — artifact patterns.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — pixel-perfect external-tool UI pattern; mirror this fidelity for the PagerDuty incident page.

**Trigger code (real bug):**

- `src/lib/demo/aggregate-orders.ts`, `src/lib/demo/region-store.ts` — Datadog's two-file real-perf-bug pattern.

**Webhook + reset:**

- `src/app/api/datadog-webhook/route.ts`, `scripts/reset-datadog-demo.sh`.

**Existing PagerDuty surface:** none yet. You're creating both `/partnerships/pagerduty` (narrative) and `/partnerships/pagerduty/demo` (interactive). Create a minimal narrative page; spend the bulk of effort on the demo.

---

## 3. The demo — concept & story

### Trigger UI (idle phase)

A glanceable on-call status board:

- Top: `payments-api` service card with green "Operational" pill, P99 = 124ms, on-call name "Alex Chen · 03:14 AM PT".
- Middle: a "Recent deploys" timeline with three entries: `v1.42.0`, `v1.42.1`, and a pending `v1.43.0 — feat: bank-transfer support · awaiting traffic ramp`.
- Bottom: a single CTA `[ Simulate deploy of v1.43.0 ]`.

Below the fold, a **Page-suppression value comparison** card (the analog of `cost-comparison.tsx` and `latency-comparison.tsx`):

- Left column: "Without Cursor — manual on-call response" — wall-clock 47 min MTTR, 1 page fired, 1 escalation, 2 humans interrupted.
- Right column: "With Cursor — agent auto-resolve" — wall-clock 4m 12s, 0 humans paged, 1 PR auto-merged.
- Numbers driven by constants in the file. No animation needed; this is a stat card.

And a **Guardrails panel** (re-use shared component, list PD-specific guardrails: confidence threshold for revert vs fix-forward, deploy-window awareness, change-freeze respect, human-in-the-loop trigger).

### The incident (error phase)

When the user clicks **Simulate deploy**, the deploy progress bar fills for ~5s ("Building image", "Rolling out to canary", "Promoting to 100%"), then the screen pivots to a **full-screen PagerDuty incident takeover**:

- Top bar: PagerDuty green logo (`#06AC38`), org/team selector, search.
- Big incident header (red `#DC3545` accent): `INC-21487 · payments-api 5xx burst · P1 · TRIGGERED`.
- Subline: `Service: payments-api · Escalation policy: Payments-Pri · 03:14:22 AM`.
- Body grid:
  - Left: alert source: `Datadog monitor #42971 — 5xx error rate > 5% for 3min`.
  - Middle: incident timeline (currently just one entry, 03:14:22 TRIGGERED).
  - Right: who's on-call (Alex Chen primary, Jordan secondary), escalation policy steps.
- CTAs at the bottom: **`[ Watch Cursor handle this page ]`** (primary, filled green) and **`[ Reset ]`** (secondary).

This page is the PagerDuty equivalent of `FullErrorPage` / `FullSloBreachPage`. It MUST feel like the real PagerDuty paging experience — pulsing red header, mono timestamps, "Acknowledge / Resolve" buttons in the chrome (greyed out unless you're on-call).

### The orchestration (running phase)

Split screen, just like Datadog:

- Left: a **live PagerDuty incident timeline** that ticks new entries as the agent acts. This is the visual centerpiece. Each agent step that changes incident state writes a new timeline row in real time:
  - `03:14:22 TRIGGERED · alert from Datadog monitor #42971`
  - `03:14:34 ACKNOWLEDGED by cursor-agent (12s after trigger)`
  - `03:14:38 NOTE · "Triaging via Datadog APM + GitHub commit history"`
  - `03:15:02 NOTE · "Hypothesis: regression in v1.43.0 commit a4f2e1b"`
  - `03:15:48 NOTE · "Decision: revert. Confidence 0.93. Forward fix would require schema migration."`
  - `03:16:11 NOTE · "Revert PR #318 opened, deploying"`
  - `03:17:54 NOTE · "Canary green · promoting to 100%"`
  - `03:18:34 RESOLVED by cursor-agent (4m 12s total)`
  - Footer: `0 humans paged · 1 revert PR · 1 Statuspage update`
- Right: scripted agent console (same shape as Datadog, new channels — see below).

### The script — channels

Extend the existing `Channel` union with PD-specific channels. Re-use `opus`, `composer`, `codex`, `shell`, `github`, `jira`, `done`.

| Channel       | Label                | Hex accent | Role                                                     |
| ------------- | -------------------- | ---------- | -------------------------------------------------------- |
| `pagerduty`   | `pagerduty-mcp`      | `#06AC38`  | Incident ack, notes, resolve, change-event reads         |
| `datadog`     | `datadog-mcp`        | `#632CA6`  | Confirm alert source, fetch APM trace                    |
| `github`      | `github-mcp`         | (white)    | Commit history, branch, revert PR                        |
| `statuspage`  | `statuspage-mcp`     | `#3DB46D`  | Public status update                                     |
| `slack`       | `slack-mcp`          | `#4A154B`  | `#ops` channel update                                    |
| `aws` / `vercel` | `deploy-mcp`      | `#FF9900`  | Roll back the bad deploy / promote the revert            |
| `opus`        | `opus · triage`      | `#D97757`  | Long-context reasoning over alert + commits + change log |
| `composer`    | `composer · revert`  | blue       | Generate the revert commit                               |
| `codex`       | `codex · review`     | `#10a37f`  | Sanity-check the revert                                  |
| `done`        | `complete`           | green      | Terminal step                                            |

### Target script arc (~28 steps, ~20s real, scaled to ~4m displayed)

1. **Intake (pagerduty):** Webhook received → fetch incident → fetch alert payload → fetch escalation policy → ack incident (write timeline note: "ACK by cursor-agent").
2. **Correlate signal (datadog):** Pull APM trace for the failing endpoint. Note the deploy marker that immediately precedes the error spike.
3. **Regression hunt (github):** `git log` for commits since the deploy marker. Identify `v1.43.0` and the single commit that introduced it.
4. **Opus triage:** Reason over the trace, the commit diff, the change-freeze calendar, and the deploy-window state. Output a structured decision: *revert vs fix-forward*. This is the demo's most important moment — surface the decision rationale clearly. (e.g., *"Revert. Confidence 0.93. Fix-forward would require schema migration; revert is mechanical and reversible."*)
5. **Composer · revert:** Generate the revert commit (`git revert a4f2e1b`).
6. **Codex · review:** Confirm the revert is purely subtractive, doesn't touch unrelated files, no semver bumps.
7. **Shell verify:** `tsc`, lint, unit tests.
8. **Deploy (deploy-mcp):** Push branch → CI → canary at 5% → SLO check → promote to 100%. Each substep a separate row.
9. **PagerDuty notes:** Each material decision is mirrored to the incident as a NOTE so on-call can audit later.
10. **Statuspage:** Push public update — "Investigating", "Identified", "Resolved" — with timestamps.
11. **Slack:** Single message to `#ops` summarizing the auto-resolve with links.
12. **Resolve (pagerduty):** Mark INC-21487 RESOLVED. Final timeline note.
13. **Done:** All artifacts ready.

### Counterfactual side card (key emotional beat)

After the run completes, render a small comparison card *next to* the artifact cards, titled **"What would have happened without Cursor"**:

- Two columns of timeline entries, side-by-side, scaled to the same vertical axis:
  - **Without:** 03:14 page → 03:16 phone rings → 03:19 Alex acks groggy → 03:24 finds laptop → 03:31 reads runbook → 03:42 identifies suspect commit → 03:51 manual revert → 04:01 redeploys → 04:01 RESOLVED. Total: **47m**, 2 humans woken.
  - **With Cursor:** Same start, ends 03:18:34. Total: **4m 12s**, 0 humans paged.
- Bottom strip: cost lever — `47m × $X engineering opportunity cost × N pages/year = $Y saved`. Use plausible illustrative numbers; don't hardcode customer-specific amounts.

### The four artifact modals

All in `MacBook` frame.

1. **PagerDuty incident detail (`pagerduty-incident.tsx`)** — pixel-perfect PagerDuty UI:
   - Top nav with PD logo (green), incident title, status pill (green RESOLVED).
   - Tabs: `Timeline · Alerts · Notes · Postmortem`.
   - Default tab = **Timeline** with the full ~10-entry auto-resolve timeline. Each row has an actor (`cursor-agent` with bot icon) and a timestamp.
   - Right sidebar: service, urgency, escalation policy, responders (only `cursor-agent`), linked alerts (Datadog #42971), linked artifacts (PR #318, Statuspage incident, Slack thread).
   - Footer banner: `Auto-resolved by Cursor · 0 humans paged · 4m 12s`.

2. **Statuspage update (`statuspage-update.tsx`)** — pixel-perfect Statuspage public component:
   - Site header: `Acme Status · payments-api`.
   - One incident card with three updates: `Investigating · 03:15:00`, `Identified · 03:15:48`, `Resolved · 03:18:34`. Resolution copy must be human-readable, not robot-generated: *"A regression introduced in v1.43.0 was reverted. All payments traffic restored. Postmortem to follow."*
   - Subscribers count, RSS link, last-updated timestamp.

3. **Revert PR (`pr-modal.tsx`)** — wrapped in MacBook, mirrors Sentry/Datadog. PR #318. Title: `revert: roll back v1.43.0 (resolves INC-21487)`. Body must include:
   - The PD incident ID and Datadog monitor ID.
   - Confidence-and-rationale block from Opus triage.
   - Diff: pure subtractive (the inverse of `a4f2e1b`).
   - CI checks all green, plus a "Cursor agent verified" reviewer banner.

4. **Postmortem doc (`postmortem.tsx`)** — markdown modal (re-use `react-markdown` + `remark-gfm` from triage report). Structure:
   - Incident summary (timing, blast radius, customer impact).
   - Root cause (one paragraph from the regression diff).
   - **What went well / what didn't** — note that Cursor handled detection through resolution; flag the actions still pending human review (the long-term fix-forward, the schema migration, customer comms).
   - Action items with owners (some `cursor-agent`, most human SRE).
   - Append a "Recovery telemetry" section with the before/after error rate sparkline.

### Branding

- **Primary accent:** PagerDuty green `#06AC38` (logo, ack/resolve buttons, success state).
- **Incident accent:** Red `#DC3545` (the pulsing TRIGGERED state, the full-screen header).
- **Resolved accent:** PD green `#06AC38` once the incident is closed.
- **Vocabulary:** "trigger", "ack", "resolve", "escalation policy", "on-call", "responder", "MTTA / MTTR", "Statuspage", "runbook", "change event", "service".
- **Avoid:** Datadog purple, Sentry purple, Sentry's mascot, the word "issue" (use "incident").

---

## 4. Files to create

```
src/app/partnerships/pagerduty/page.tsx                                  NEW (narrative; minimal — link prominently to /demo)
src/app/partnerships/pagerduty/demo/page.tsx                             NEW
src/app/api/pagerduty-webhook/route.ts                                   NEW

src/components/pagerduty-demo/oncall-board.tsx                           NEW (idle-phase trigger, the "Simulate deploy" surface)
src/components/pagerduty-demo/demo-deploy-boundary.tsx                   NEW (intercepts the simulated bad deploy → error phase)
src/components/pagerduty-demo/full-incident-page.tsx                     NEW (full-screen PD incident takeover)
src/components/pagerduty-demo/incident-summary.tsx                       NEW (split-screen left panel: live timeline)
src/components/pagerduty-demo/agent-console.tsx                          NEW (fork of datadog console with PD channels + script)
src/components/pagerduty-demo/artifact-cards.tsx                         NEW
src/components/pagerduty-demo/counterfactual-card.tsx                    NEW (the "without Cursor" comparison)
src/components/pagerduty-demo/page-suppression-stats.tsx                 NEW (idle-phase value card)
src/components/pagerduty-demo/guardrails-panel.tsx                       NEW or reuse shared
src/components/pagerduty-demo/artifacts/pagerduty-incident.tsx           NEW (pixel-perfect PD incident page)
src/components/pagerduty-demo/artifacts/pagerduty-modal.tsx              NEW (wraps in MacBook)
src/components/pagerduty-demo/artifacts/statuspage-update.tsx            NEW
src/components/pagerduty-demo/artifacts/statuspage-modal.tsx             NEW
src/components/pagerduty-demo/artifacts/postmortem.tsx                   NEW (markdown modal)
src/components/pagerduty-demo/artifacts/github-pr-preview.tsx            NEW (revert-PR specific copy)
src/components/pagerduty-demo/artifacts/pr-modal.tsx                     NEW

src/lib/demo/payments-deploy.ts                                          NEW (the simulated deploy + revert; real timing)
scripts/reset-pagerduty-demo.sh                                          NEW
```

**Also:**

- Add `PagerDuty` card to `src/lib/constants.ts` if not present.
- Add a logo to `public/logos/pagerduty.svg`.
- Promote `MacBook` frame to `src/components/shared/macbook-frame.tsx` if not already done. Don't break existing imports.
- Update README's partner table.

---

## 5. Implementation order

1. Scaffold the route + four-phase state machine (copy from `datadog/demo/page.tsx`).
2. Build the on-call board + simulated deploy. Wire `Simulate deploy` to flip phase to `error` after a real ~5s delay.
3. Build the full-screen incident takeover. Don't skimp on the PD chrome — it must look real.
4. Build the live left-panel incident timeline. Each row appears in time with the corresponding agent-console step (pass the current step index down via props or a shared state).
5. Build the agent console (fork Datadog's). Write the ~28-step script. Tune `TIME_SCALE` so displayed timestamps scale to ~4 min (real runtime ~20s).
6. Build artifacts in this order: PR (cheapest, copy from Datadog) → Postmortem (markdown) → Statuspage update → PagerDuty incident detail (the new/hard one).
7. Build the counterfactual card.
8. Side-content: page-suppression stats, guardrails.
9. Webhook route + reset script.
10. Typecheck, walk through twice, screenshot for PR.

---

## 6. Acceptance criteria

- `/partnerships/pagerduty/demo` loads with the on-call board, page-suppression stats, and guardrails.
- Clicking **Simulate deploy** runs a realistic ~5s deploy progress, then pivots to the full-screen PagerDuty incident page.
- Clicking **Watch Cursor handle this page** starts the split-screen with both the live timeline (left) and agent console (right) ticking together in lockstep.
- Console + timeline complete in ~20s real time (~4 min displayed). No real network calls, no `Math.random()` in playback.
- Four artifact cards open correctly: PD incident detail, Statuspage, Revert PR, Postmortem. All MacBook-framed.
- Counterfactual card appears in the `complete` phase showing the "without Cursor" comparison.
- Reset returns to clean `idle` state across all phases.
- `npx tsc --noEmit` passes.
- `npm run lint` passes.
- Running the demo twice produces identical output.
- The PagerDuty incident detail modal looks like a real PD incident page, not a generic table.

---

## 7. Anti-patterns

- ❌ Don't make this a "second Datadog demo." The story here is **incident lifecycle suppression**, not perf root-cause. The hero metric is **0 humans paged**, not "12× faster." Lead with the hour, the on-call name, the page that didn't fire.
- ❌ Don't use PagerDuty red as the resolved-state color. PD green = resolved.
- ❌ Don't show the agent making destructive changes to live infra without a guardrail step. The script should explicitly call out the canary check + SLO gate before promoting the revert.
- ❌ Don't omit the counterfactual. It's the strongest emotional beat for SRE/EM buyers.
- ❌ Don't fake the deploy timing. Use a real ~5s setTimeout chain so the prospect feels the deploy roll out before the page fires.

---

## 8. Webhook prompt (`buildAgentPrompt`)

Fork `src/app/api/datadog-webhook/route.ts`. Replace vocabulary. Required steps in order:

1. **PagerDuty intake.** Fetch incident, alerts, escalation policy, recent change events. ACK the incident immediately with a note that triage has begun.
2. **Correlate signal.** Use Datadog (or whatever monitor source the alert names) to pull the affected endpoint's APM trace and the deploy markers around the trigger time.
3. **Regression hunt.** GitHub MCP: `git log` since the most recent deploy marker. Identify the offending commit.
4. **Decide revert vs fix-forward.** Output a structured decision with confidence and rationale. Default to **revert** unless the offending change is non-revertible (e.g., contains a schema migration).
5. **Execute.** Open a revert PR, deploy through canary → SLO gate → promote.
6. **Communicate.** Statuspage update (Investigating → Identified → Resolved), Slack to `#ops`, PD incident NOTEs at every material step.
7. **Resolve.** Mark the PD incident RESOLVED only after the SLO is back inside budget for ≥2 minutes.
8. **Postmortem.** Auto-draft to `docs/postmortems/<date>-<incident-id>.md` and link from the PD incident.

The prompt must enforce: **never resolve the incident without verifying SLO recovery**. **Never roll forward a fix in production without canary success**. **Always page a human if confidence < 0.7**. These guardrails are the demo's contract.
