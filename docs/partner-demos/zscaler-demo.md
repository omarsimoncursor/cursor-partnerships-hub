# Zscaler Live Zero-Trust Triage & Fix Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/zscaler/demo`, patterned on the existing Datadog demo at `/partnerships/datadog/demo`. Read it end-to-end before writing any code.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Zscaler + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/zscaler/demo` and clicks a button to open an internal admin endpoint ("Open audit logs", "Run workforce report").
2. The endpoint succeeds, but it should not have. The application's access-policy file in the repo contains an overly permissive rule (`roles: ['*']`, `posture: skip`, `locations: ['*']`). The UI immediately pivots to a full-screen **Zero Trust violation** takeover.
3. Zscaler (mocked) detects the broad-scope access in real time. ZPA Policy Engine fires a webhook to Cursor.
4. A scripted "agent console" plays on the right half of the screen showing Cursor orchestrating: Zscaler MCP → Opus triage → GitHub MCP → Composer edit → Codex review → shell verification → PR opened → Jira ticket updated.
5. When the run completes, the user can click through four pixel-perfect artifact modals: **Zscaler ZPA console**, **Triage report**, **Jira ticket**, and **GitHub PR** (inside a MacBook frame).
6. Reset button returns the demo to clean state. A `scripts/reset-zscaler-demo.sh` script re-seeds the bug after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying bug and reset are real.

---

## 1. Why this is being built

The Datadog demo dramatizes a *performance* incident (SLO breach → parallel fix). The Sentry demo dramatizes a *crash* (null-ref → patch). Zscaler's story is different again: it is a **security posture / zero-trust policy** story. The bug is not a crash and not a slowdown, it is an over-permissive access rule that lets the wrong people read a sensitive endpoint. Zscaler's ZPA Policy Engine catches the broad-scope traffic, fires a webhook, and Cursor closes the policy in code.

This demo proves Cursor can act as the orchestration layer between a security control plane and the source of truth (the codebase), not just observability and the codebase.

---

## 2. Required reading (in this repo, in order)

Before you write any code, study the Datadog demo. This is the pattern you are replicating most closely (the Datadog demo is the most recent and the cleanest reference for the orchestration scaffolding).

**Page + state machine:**

- `src/app/partnerships/datadog/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`), three conditional regions, artifact modal dispatch.

**Components:**

- `src/components/datadog-demo/reports-card.tsx` — the trigger UI.
- `src/components/datadog-demo/demo-perf-boundary.tsx` — error interception via React Error Boundary.
- `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeover with "Watch the fix" CTA.
- `src/components/datadog-demo/slo-summary.tsx` — compact summary for split-screen (left panel while agent runs).
- `src/components/datadog-demo/agent-console.tsx` — **the single most important file to study**. Scripted step playback with channel-coded rows, timestamps, delays, and `onComplete` callback.
- `src/components/datadog-demo/artifact-cards.tsx` — the four CTA tiles after the run completes.
- `src/components/datadog-demo/artifacts/triage-report.tsx` — markdown modal.
- `src/components/datadog-demo/artifacts/jira-ticket.tsx` — pixel-perfect Jira ticket modal.
- `src/components/datadog-demo/artifacts/macbook-frame.tsx` — photorealistic MacBook chrome.
- `src/components/datadog-demo/artifacts/github-pr-preview.tsx` — pixel-perfect GitHub PR.
- `src/components/datadog-demo/artifacts/pr-modal.tsx` — wraps GitHub PR in MacBook.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` + `datadog-modal.tsx` — pixel-perfect Datadog APM trace detail in MacBook.
- `src/components/datadog-demo/latency-comparison.tsx`, `guardrails-panel.tsx` — supporting cards on the idle page.

**Trigger code (the real bug):**

- `src/lib/demo/aggregate-orders.ts` + `src/lib/demo/region-store.ts` — two-file performance bug.

**Webhook + reset:**

- `src/app/api/datadog-webhook/route.ts` — webhook signature verification + background agent trigger + `buildAgentPrompt`.
- `scripts/reset-datadog-demo.sh` — re-seeds the bug after a real PR merges.

---

## 3. What the Datadog demo does (pattern summary)

The demo is a state machine rendered on one route. Phases:

| Phase      | What renders                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + trigger card inside an Error Boundary + comparison/guardrails sections below the fold.  |
| `error`    | Full-screen takeover with "Watch the fix" and "Reset" CTAs. Hides everything else.                        |
| `running`  | Split screen: incident summary left, `AgentConsole` right. Scripted steps stream in. Reset in nav.        |
| `complete` | Same split screen, plus `ArtifactCards` strip with 4 tiles. Top banner flips to green "Run complete".     |

Artifact modals (triage, jira, pr, partner-specific) are overlays opened from either the summary panel or `ArtifactCards`, closable, self-contained.

The AgentConsole `SCRIPT` is an array of `Step` objects with `channel`, a `label`, a one-line `detail`, and a `delayMs`. Real runtime is ~19s; displayed timestamps are scaled by `TIME_SCALE = 6.9` to show a realistic ~2 min of "agent work".

**This scripted-playback pattern is the whole trick.** Replicate it faithfully.

---

## 4. The Zscaler demo — concept & story

### The trigger scenario

**Surface UI:** A "Workforce Admin" mini-app card on the demo page. The hero card is something like:

> **Open employee audit logs**
> Read the access log for the last 24 hours.
> `[ Open audit logs ]`

When clicked, the card calls `/api/admin/audit-logs`. The endpoint's access policy is wrong — it uses a wildcard role and skips the device-posture check — so it returns the sensitive data even when no role / posture is presented. The card detects the broad-scope success and immediately throws a `ZeroTrustViolationError`, pivoting to a full-screen **Zero Trust violation** takeover.

**The full-screen violation page (Zscaler equivalent of `FullSloBreachPage`):**

- Big "Zero Trust violation" heading (not a 500, not a perf metric, this is a *posture* breach).
- Zscaler blue accent (`#0079D5` primary, `#0E5DA8` deeper, `#65B5F2` light text on dark).
- Line: `/api/admin/audit-logs · 4,287 users in scope · least-privilege intent: 18 users · 238× over scope`.
- Subtext naming the cause in Zscaler vocabulary: "ZPA Policy Engine flagged broad-scope access. The application policy in `src/lib/demo/access-policy.ts` uses `roles: ['*']` and skips device posture."
- Two buttons: **"Watch Cursor close this policy"** (→ running phase) and **"Reset"**.

### The underlying bug (real code, reset-able)

Create two cooperating files. The bug must typecheck and run, but the resulting policy is over-permissive.

**`src/lib/demo/access-policy.ts`** (buggy):

```ts
import { lookupUser, type AccessRequest, type AccessDecision } from './identity-store';

export interface AccessPolicy {
  app: string;
  roles: string[];          // wildcard "*" means any role
  postureRequired: boolean; // skips device-posture check when false
  allowedLocations: string[];
  allowedIdps: string[];
}

export const ADMIN_AUDIT_LOG_POLICY: AccessPolicy = {
  app: 'workforce-admin/audit-logs',
  roles: ['*'],             // overly permissive
  postureRequired: false,   // device posture not enforced
  allowedLocations: ['*'],  // any geography
  allowedIdps: ['*'],       // any IdP
};

export async function evaluateAccess(req: AccessRequest): Promise<AccessDecision> {
  const user = await lookupUser(req.userId);
  const roleOk = ADMIN_AUDIT_LOG_POLICY.roles.includes('*') ||
                 user.roles.some(r => ADMIN_AUDIT_LOG_POLICY.roles.includes(r));
  const locationOk = ADMIN_AUDIT_LOG_POLICY.allowedLocations.includes('*') ||
                     ADMIN_AUDIT_LOG_POLICY.allowedLocations.includes(req.location);
  const postureOk = !ADMIN_AUDIT_LOG_POLICY.postureRequired || req.devicePosture === 'managed-compliant';
  return { allow: roleOk && locationOk && postureOk, user, evaluatedAt: Date.now() };
}
```

**`src/lib/demo/identity-store.ts`** (simulates ~80–120ms per call so traffic feels real, but not a perf demo):

```ts
export type Location = 'sf-hq' | 'remote' | 'kiosk' | 'unknown';
export type DevicePosture = 'managed-compliant' | 'managed-noncompliant' | 'unmanaged';

export interface AccessRequest {
  userId: string;
  location: Location;
  devicePosture: DevicePosture;
  idp: string;
}

export interface User {
  id: string;
  name: string;
  roles: string[];
  department: string;
}

export interface AccessDecision {
  allow: boolean;
  user: User;
  evaluatedAt: number;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function lookupUser(userId: string): Promise<User> {
  await sleep(95);
  // Deterministic user fixture used by the demo trigger
  return { id: userId, name: 'Demo Visitor', roles: ['employee'], department: 'unknown' };
}
```

> Use this exact bug or one structurally equivalent. The point is it must be real, typechecks, and produces a *visible policy violation* the prospect can feel.

**The fix** (what the agent "produces"): scope down to explicit `roles: ['security-admin', 'compliance-officer']`, set `postureRequired: true`, restrict `allowedLocations` and `allowedIdps`. Same evaluator. Result: 4,287 users → 18 users in scope.

### The orchestration (scripted console playback)

Channels your `SCRIPT` needs (extend the channel union, keep Opus/Composer/Codex):

| Channel    | Label              | Hex accent   | Role in the story                                        |
| ---------- | ------------------ | ------------ | -------------------------------------------------------- |
| `zscaler`  | `zscaler-mcp`      | `#0079D5`    | ZPA Policy Engine + ZIA traffic intake                   |
| `okta`     | `okta-mcp`         | `#007DC1`    | *Optional* IdP context: actual user roles, group claims  |
| `github`   | `github-mcp`       | (white)      | Commit history, branch, PR                               |
| `jira`     | `jira-mcp`         | `#4C9AFF`    | Sec incident ticket creation + state transitions         |
| `shell`    | `shell`            | green        | `tsc`, lint, integration test, git                       |
| `opus`     | `opus · triage`    | `#D97757`    | Long-context root-cause reasoning across logs + policy   |
| `composer` | `composer · edit`  | blue         | Scoped policy edits                                      |
| `codex`    | `codex · review`   | `#10a37f`    | Patch review / least-privilege check                     |
| `codegen`  | `codegen`          | blue         | Triage report generation                                 |
| `done`     | `complete`         | green        | Terminal step                                            |

`okta` is optional. Default to the core set with `zscaler` replacing `datadog` and `pagerduty` removed (security incidents do not page; they ticket).

**Target script arc (~25–28 steps, ~19s real, scaled to ~2min displayed via `TIME_SCALE`):**

1. **Intake (zscaler):** ZPA Policy Engine event → ZIA web log slice → identify endpoint → enumerate user / device / location dimensions in scope.
2. **Identity context (okta — optional):** Pull group claims to confirm 18 users *should* have access vs the 4,287 currently allowed.
3. **Incident management (jira):** Ticket `CUR-5712` created (Sec-P1, Zero Trust violation). No PagerDuty — Zscaler routes through Risk Operations.
4. **Opus triage:** Model selected for long-context reasoning over policy + traffic logs. Pulls commit history (github-mcp). Identifies regression commit. Forms hypothesis: "ADMIN_AUDIT_LOG_POLICY uses wildcard roles and skips posture check; should be explicit role list + posture-required."
5. **Codegen:** Triage report written to `docs/triage/2026-04-23-zerotrust-violation-audit-logs.md`.
6. **Composer edit:** Reads `access-policy.ts`. Replaces wildcards with explicit role list, sets `postureRequired: true`, restricts locations and IdPs.
7. **Codex review:** Confirms least-privilege, no contract change to `evaluateAccess`, no callers broken.
8. **Shell verification:**
   - `npx tsc --noEmit` → ✓
   - `npm run lint` → ✓
   - Integration test: simulate four access requests (admin/posture-ok, admin/posture-bad, employee/posture-ok, anonymous) → asserts deny-by-default behavior is restored.
   - Recompute scope: `4,287 → 18 users · 238.2× narrower · 0 unmanaged-device access paths`.
9. **PR (github):** Branch `sec/scope-down-audit-log-policy` → commit → push → PR #213 opened. Title: `sec: scope down audit-log policy (4,287 → 18 users in scope, resolves Sec-P1)`.
10. **Jira update:** `CUR-5712 → In Review`.
11. **Done:** Artifacts ready.

### The four artifact modals

All four render in a MacBook frame using the existing MacBook chrome (copy `src/components/datadog-demo/artifacts/macbook-frame.tsx` as `src/components/zscaler-demo/artifacts/macbook-frame.tsx` — do not delete the Datadog one).

1. **Zscaler ZPA console modal** (equivalent of `DatadogModal`) — pixel-perfect Zscaler **Zero Trust Exchange Admin Portal** policy violation page. Must include:
   - Top nav with Zscaler logo (blue), org/cloud selector, search bar.
   - Page title: `Policy Violation — workforce-admin/audit-logs`.
   - Risk score widget showing `Critical · 92/100` with sparkline.
   - Scope card: `4,287 users in scope · intent: 18 · 238× over scope`.
   - Tabs: `Overview`, `Affected users`, `Traffic`, `Policy diff`, `Activity`.
   - Default tab = **Overview**: a "Posture compliance" donut chart (e.g. 12% managed-compliant, 38% managed-noncompliant, 50% unmanaged), an "Access events (last 1h)" sparkline, and an "Affected app" panel showing the policy fields with the bad ones highlighted in amber.
   - Right sidebar: ZPA application segment, Policy ID, last evaluated time, related risk events, deployment marker.
   - Use Zscaler's portal aesthetic: deep navy `#0A1F3F`-ish background, white-blue text, sharp 1px borders, blue primary actions.
2. **Triage report modal** — same as Datadog's (`react-markdown` + `remark-gfm`), Zscaler-specific content. Format:
   ```md
   # Triage — Zero Trust violation on /api/admin/audit-logs

   **Status:** Fix proposed · PR #213 · CUR-5712

   ## Incident
   - Endpoint: /api/admin/audit-logs
   - Users in scope: 4,287 (intent: 18 · 238× over)
   - Posture: 50% unmanaged, 38% managed-noncompliant, 12% managed-compliant
   - Window: rolling 60 minutes

   ## Root cause
   | Layer | Observation |
   | --- | --- |
   | Policy | `roles: ['*']`, `postureRequired: false`, `allowedLocations: ['*']` |
   | Logs | 312 ZIA web hits in last hour from 4 unmanaged devices |
   | Regression | Commit `b7c91d2` — "wip: open audit logs for QA"  (3 days ago) |

   ## Fix
   - Replace wildcard roles with explicit allow-list
   - Set `postureRequired: true`
   - Restrict `allowedLocations` to corporate egress
   - Restrict `allowedIdps` to primary IdP

   ## Verification
   - Static: `tsc --noEmit` ✓, `eslint` ✓
   - Integration: 4 simulated requests — deny-by-default restored
   - Scope: 4,287 → 18 users · 0 unmanaged-device paths

   ## Risk
   - Blast radius: 1 file, +14 −5
   - Rollback: `git revert HEAD`
   - Type surface unchanged
   ```
3. **Jira ticket modal** — pixel-perfect Jira, same style as Datadog's. Ticket `CUR-5712`, Sec-P1, Zero Trust Violation type. Include the "linked PR", "Zscaler trace", "assignee", "components" fields. Status moves through `To Triage → In Progress → In Review` (render as a timeline).
4. **GitHub PR modal** — wrapped in MacBook, mirrors the Datadog PR pattern. PR #213. Include:
   - Title: `sec: scope down audit-log policy (4,287 → 18 users in scope)`
   - Body with before/after scope table, CI checks (all green), "Verified by Cursor agent" reviewer banner.
   - Files changed: 1 (`access-policy.ts`).
   - Diff excerpt in modal preview.
   - CI: `tsc ✓`, `lint ✓`, `unit ✓`, `policy-conformance suite ✓`.

### Branding

- **Primary accent:** Zscaler blue `#0079D5` (hero glyph, badges, CTA emphasis).
- **Secondary:** `#0E5DA8` (deeper) and `#65B5F2` (light text on dark).
- **Risk / violation color:** Amber `#F5A623` for "broad scope" and "policy violation" chips. Reserve red `#FF4757` for "Critical risk score".
- **Success:** Green `#4ADE80` (after-fix, artifacts, Jira "In Review").
- **Avoid:** Don't reuse Datadog purple. Don't reuse Sentry purple. Don't reuse the Datadog flame-graph metaphor — Zscaler is a posture and policy story, not a span/trace story.

---

## 5. Files to create

Mirror Datadog structure under new directories. Keep Datadog files untouched.

```
src/app/partnerships/zscaler/page.tsx                                 NEW  (narrative thesis page)
src/app/partnerships/zscaler/demo/page.tsx                            NEW
src/app/api/zscaler-webhook/route.ts                                  NEW

src/components/zscaler-demo/audit-card.tsx                            NEW  (the trigger UI, analogous to ReportsCard)
src/components/zscaler-demo/demo-zerotrust-boundary.tsx               NEW  (intercepts violation thrown from audit-card)
src/components/zscaler-demo/full-violation-page.tsx                   NEW  (FullSloBreachPage equivalent, Zscaler-blue)
src/components/zscaler-demo/violation-summary.tsx                     NEW  (SloSummary equivalent, compact split-screen panel)
src/components/zscaler-demo/agent-console.tsx                         NEW  (fork of datadog-demo/agent-console.tsx)
src/components/zscaler-demo/artifact-cards.tsx                        NEW
src/components/zscaler-demo/risk-comparison.tsx                       NEW  (LatencyComparison equivalent — before/after scope)
src/components/zscaler-demo/guardrails-panel.tsx                      NEW
src/components/zscaler-demo/artifacts/macbook-frame.tsx               NEW  (copy from datadog-demo)
src/components/zscaler-demo/artifacts/zscaler-console.tsx             NEW  (pixel-perfect ZPA Admin Portal)
src/components/zscaler-demo/artifacts/zscaler-modal.tsx               NEW  (wraps console in MacBook)
src/components/zscaler-demo/artifacts/triage-report.tsx               NEW  (Zscaler-specific content)
src/components/zscaler-demo/artifacts/jira-ticket.tsx                 NEW  (CUR-5712 content)
src/components/zscaler-demo/artifacts/github-pr-preview.tsx           NEW  (sec PR content)
src/components/zscaler-demo/artifacts/pr-modal.tsx                    NEW

src/lib/demo/access-policy.ts                                         NEW  (the buggy code)
src/lib/demo/identity-store.ts                                        NEW  (simulated identity lookup)
src/app/api/admin/audit-logs/route.ts                                 NEW  (calls evaluateAccess)

scripts/reset-zscaler-demo.sh                                         NEW  (re-seeds the wildcard policy)
public/logos/zscaler.svg                                              NEW  (wordmark)
```

**Also:**

- Add a new "security" category to `PARTNER_CATEGORIES` in `src/lib/constants.ts` (or add Zscaler to the `devtools` category — your call). Register the partner card.
- Add a Zscaler entry to the partnerships demo showcase grid in `src/components/sections/partnerships.tsx`.
- Update `README.md` partner table to include Zscaler.

---

## 6. Implementation order (recommended)

1. **Scaffold the route** — `src/app/partnerships/zscaler/demo/page.tsx` with the four-phase state machine, copy-pasted from the Datadog demo page as a skeleton.
2. **Ship the trigger path first** — `audit-card.tsx` + `access-policy.ts` + `identity-store.ts` + the API route. Verify the button fires the violation immediately.
3. **Wire the boundary + full-screen takeover** — make sure a thrown `ZeroTrustViolationError` flips phase to `error`.
4. **Build the agent console** — fork Datadog's, swap channels, write the 25–28-step Zscaler SCRIPT. Tune `TIME_SCALE` for ~2-min displayed runtime.
5. **Build artifact modals in this order:** PR (reuse MacBook frame) → Jira → Zscaler ZPA console → Triage report. PR and Jira are cheapest to adapt from Datadog; Zscaler ZPA is the new/hard one.
6. **Side content** — risk comparison, guardrails panel, CTA pill.
7. **Webhook route** — Zscaler signature verification, background agent trigger, `buildAgentPrompt` explaining the Zscaler-specific 7-step sequence.
8. **Reset script + docs** — `scripts/reset-zscaler-demo.sh` with `git add + commit`. Update README and add narrative page.
9. **Typecheck + manual walkthrough** — click through all 4 phases + all 4 modals + reset. Confirm the demo is *visually indistinguishable* between run 1 and run 2.

---

## 7. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result, every time. No real network calls in the scripted console. No `Math.random()` in the displayed playback. Timestamps are derived from cumulative `delayMs × TIME_SCALE`.
- **Trigger is real:** `/api/admin/audit-logs` must actually evaluate the buggy policy and return data. The fix changes the policy contents, not the evaluator.
- **Artifacts are fully self-contained:** No external links out to zscaler.com or github.com. Everything opens in-modal. Prospects without Zscaler accounts must get the full experience.
- **On-brand language:** "Zero Trust Exchange", "ZPA Policy Engine", "ZIA web log", "posture", "least-privilege intent", "policy segment", "scope". Avoid Datadog vocabulary ("SLO", "P99", "flame graph", "spans").
- **Single-page, no auth:** Don't require login. Don't require API keys client-side. The webhook route is the only place env vars are read.
- **Safety-by-default:** Exactly like Datadog's `buildAgentPrompt`, the Zscaler webhook's prompt must enforce the step sequence (intake → regression hunt → read → patch → static verify → policy verify → open PR) and require evidence in the PR body.

---

## 8. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/datadog-webhook/route.ts` exactly. Replace Datadog vocabulary with Zscaler vocabulary. Required steps in order:

1. **Zscaler MCP intake.** Fetch the ZPA Policy Engine event, the ZIA traffic slice, the affected app segment, and the in-scope vs intent user counts.
2. **Identity context (Okta MCP, optional).** Reconcile group/role claims against the policy's role list to surface the over-permission delta.
3. **Regression hunt (GitHub MCP).** List the last 10 commits touching `src/lib/demo/access-policy.ts` (or whichever policy file is implicated). Identify the most recent commit that widened scope.
4. **Read affected code (shell).** Read the policy file, the evaluator, and any callers. Form a written hypothesis before patching.
5. **Patch (shell + edit).** Minimal correct fix. Replace wildcards with explicit lists, enable posture/IdP/location restrictions. Do not widen contracts.
6. **Static + policy-conformance verify.** `npm run lint`, `npx tsc --noEmit`, then a small policy conformance probe (4 simulated requests asserting deny-by-default). Iterate until clean.
7. **Open PR (GitHub MCP).** Branch `sec/<slug>`. PR body must include a **before/after scope table**, the regression commit SHA, the triage report path, and a risk assessment.
8. **Jira update (Jira MCP).** Move ticket to `In Review`, link the PR.

Make the prompt explicit that the agent **must** hit every step and cite evidence in the PR body from that step. This is the contract that keeps behavior deterministic across real runs.

---

## 9. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/zscaler/demo` loads with hero + CTA pill + audit card.
- Clicking **Open audit logs** returns immediately and pivots to the full-screen Zero Trust violation page.
- Clicking **Watch Cursor close this policy** starts the scripted console which plays ~25 channel-coded steps in ~19s real time with displayed timestamps scaling to ~2 minutes.
- Console completion transitions to `complete` phase and reveals four artifact cards.
- Each artifact modal opens, renders pixel-perfect, and closes without leaking state.
- The Zscaler ZPA console modal shows a believable Admin Portal with risk score, scope, posture donut, and policy diff.
- **Reset** in the nav returns the demo to clean `idle` across all phases.
- Running the demo twice in a row produces identical output.
- `npx tsc --noEmit` passes.
- No external links leak out of any modal.
- `scripts/reset-zscaler-demo.sh` restores the wildcard policy after a real PR merge.
- The narrative page `/partnerships/zscaler` exists with a CTA link to `/demo`.

---

## 10. Anti-patterns / things to avoid

- **Don't** reuse Datadog purple, Sentry purple, or any other partner's accent. The demos must feel distinct.
- **Don't** make the agent console non-deterministic. No `setTimeout(…, Math.random()…)`. No real HTTP calls during playback.
- **Don't** show a generic "error" page. This is a **policy / posture** story, not a crash and not a slowdown — the vocabulary and visuals must reflect Zero Trust scope and posture.
- **Don't** put the policy comparison in pure HTML table form only. Use side-by-side "before" and "after" cards with the offending fields highlighted, plus a scope counter that reads `4,287 → 18`.
- **Don't** skip the MacBook frame for artifact modals — it is the visual signature and must be consistent.
- **Don't** delete or modify other partner directories. Fork via copy, do not share state unless you deliberately extract into `shared/`.
- **Don't** hardcode API keys or secrets anywhere in client code. Everything env-driven, server-side only.

---

## 11. Quick reference — Datadog-demo files → Zscaler-demo files

| Datadog                                       | Zscaler                                                |
| --------------------------------------------- | ------------------------------------------------------ |
| `reports-card.tsx`                            | `audit-card.tsx`                                       |
| `demo-perf-boundary.tsx`                      | `demo-zerotrust-boundary.tsx`                          |
| `full-slo-breach-page.tsx`                    | `full-violation-page.tsx`                              |
| `slo-summary.tsx`                             | `violation-summary.tsx`                                |
| `agent-console.tsx`                           | `agent-console.tsx` (different channels + script)      |
| `artifact-cards.tsx`                          | `artifact-cards.tsx`                                   |
| `artifacts/datadog-trace.tsx`                 | `artifacts/zscaler-console.tsx`                        |
| `artifacts/datadog-modal.tsx`                 | `artifacts/zscaler-modal.tsx`                          |
| `artifacts/triage-report.tsx`                 | `artifacts/triage-report.tsx` (Zscaler content)        |
| `artifacts/jira-ticket.tsx`                   | `artifacts/jira-ticket.tsx` (CUR-5712)                 |
| `artifacts/github-pr-preview.tsx`             | `artifacts/github-pr-preview.tsx` (sec PR)             |
| `artifacts/pr-modal.tsx`                      | `artifacts/pr-modal.tsx`                               |
| `artifacts/macbook-frame.tsx`                 | Same file copied                                       |
| `latency-comparison.tsx`                      | `risk-comparison.tsx`                                  |
| `src/lib/demo/aggregate-orders.ts` +          | `src/lib/demo/access-policy.ts` +                      |
| `src/lib/demo/region-store.ts`                | `src/lib/demo/identity-store.ts`                       |
| `src/app/api/datadog-webhook/route.ts`        | `src/app/api/zscaler-webhook/route.ts`                 |
| `scripts/reset-datadog-demo.sh`               | `scripts/reset-zscaler-demo.sh`                        |

---

## 12. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all four modals twice in a row. Commit on a new branch. Open a draft PR against `main` titled **"feat: Zscaler live zero-trust triage + fix demo"** with a body matching the Datadog PR's structure.
