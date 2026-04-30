# Cursor SDK Live Workflow Builder Demo — Build Brief & Plan

> **Purpose of this document:** Architecture + execution plan for a new interactive demo at `/partnerships/cursor-sdk` (and `/partnerships/cursor-sdk/demo`) that lets a presenter build, in front of a live audience, a security automation using Cursor's SDK — and then watch it execute. Read end-to-end before writing any code.

---

## 0. The pitch in one sentence

**"In 90 seconds, build a real production security automation using Cursor's SDK — then watch it run."**

This demo extends the security-team thesis (see `security-demos.md`) with a new angle: **the SDK is the substrate** that makes every workflow in `security-demos.md` not just possible but reproducible inside a customer's own VPC, on their own schedule, in their own SIEM.

---

## 1. Why this demo (and why now)

The existing partner demos (Datadog, Sentry, GitGuardian-as-spec) all answer **"what can Cursor do for one tool?"** This demo answers **"how do we put Cursor in production across many tools?"** — which is the question every CISO and platform-eng leader asks 90 seconds into the GitGuardian demo.

Cursor's SDK (`@cursor/february` / `cursor-agent-sdk`) is the answer. It exposes the same Background Agent that powers the partner demos as a programmable primitive a customer's own engineers can call from:

- A **webhook handler** in the customer's existing API.
- A **scheduled job** in Airflow / Temporal / GitHub Actions.
- A **SOAR playbook step** in Splunk / Tines / Torq.
- A **Slack slash command** for ad-hoc triage.

This demo is the visual proof of that. It is also a deliberate **flexibility flex**: the audience picks the tool combination and watches the SDK code update live, then runs it. No two run-throughs of the demo need to look identical.

---

## 2. The audience experience (what the presenter does live)

A typical 3-minute walkthrough in front of customers:

1. **Picks a security tool** from a palette of 8 (GitGuardian, Wiz, Snyk, CrowdStrike, Okta, Splunk, Zscaler, Vanta). The tool's logo + a short "what it does" card lights up.
2. **Picks an event** that tool fires (e.g. for GitGuardian: `secret.exposed`; for Wiz: `issue.opened`; for Okta: `auth.anomaly`). A list of plausible events shows; the presenter chooses one with one click.
3. **Picks one or more response actions** the agent should take. Each action is a chip the presenter clicks — `rotate-aws-key`, `roll-stripe-key`, `publish-to-vault`, `open-cleanup-pr`, `open-history-purge-pr-draft`, `post-to-slack`, `file-jira`, `emit-splunk-audit-event`. Order matters; the presenter can drag to reorder.
4. **Picks MCPs** that the agent will have access to during the run — chips for `aws-mcp`, `stripe-mcp`, `vault-mcp`, `github-mcp`, `slack-mcp`, `jira-mcp`, `splunk-mcp`, etc. (Some are auto-checked based on the actions chosen, with the presenter able to add or remove.)
5. **The right-hand SDK code panel updates live** as the presenter clicks. Real, copy-pasteable TypeScript that calls `Agent.create({...})` with their picks. The TypeScript is colored, monospaced, and feels like a real editor pane.
6. **The presenter clicks "Run automation"**. The route flips to a runtime view that mirrors the existing Datadog demo: split-screen with a live SDK event stream on the left and the agent-console step playback on the right. The events are derived from the workflow the presenter just built, so the audience sees their picks reflected back.
7. **When the run completes**, a strip of artifact cards appears: the **SDK call trace** (a new artifact unique to this demo — every SDK + MCP call, with timing and status), the **audit timeline**, the **Jira ticket**, the **GitHub PR**, and the **Slack thread**. The first artifact is the new one; the rest reuse the GitGuardian artifact pattern.
8. **Reset** returns the presenter to the empty builder. Total wall time per cycle: under 4 minutes. The demo is **inherently rehearseable** because reset returns it to a known state.

The whole pitch lands in three beats:

- *Beat 1: "Look how few clicks this took."* (Builder phase.)
- *Beat 2: "And here's the actual code that ships."* (SDK panel.)
- *Beat 3: "And here's it executing across six of your existing tools, with an audit trail an auditor would accept."* (Runtime + artifacts.)

---

## 3. Why this is interactive (not scripted)

Every other demo on the hub has **one** trigger button. The demo has been pre-staged. The agent-console script is canned.

This demo is different: **the audience sees the input space**. They see the eight tools, the dozens of events, the dozens of actions. They watch the presenter click choices the audience might not have predicted. The TypeScript panel changes as they click. That moment of *"oh, this is actually configurable"* is the demo's emotional payload — it differentiates from "demo magic" and lands the message that the SDK is real, programmable, and fits in their stack.

The runtime scripts are still canned (the audience is not actually rotating an AWS key on stage), but each combination of tool + event + actions maps to a different pre-authored script. Switching the workflow before clicking Run produces a visibly different runtime.

---

## 4. Architecture

### 4.1 Routes

```
src/app/partnerships/cursor-sdk/page.tsx          NEW  Narrative landing page (hero + pitch + "Open the live builder" CTA)
src/app/partnerships/cursor-sdk/demo/page.tsx     NEW  The interactive builder + runtime
```

### 4.2 State machine on the demo page

```
draft     → presenter is building the workflow (picking tool, event, actions, MCPs)
ready     → workflow is valid (tool + event + ≥1 action picked); "Run automation" CTA active
running   → split-screen with live SDK event stream + agent console
complete  → same split-screen + 5 artifact cards
```

The draft → ready transition is automatic (no button), driven by validation. ready → running is a single button click. running → complete fires when the agent console emits its terminal `done` step.

### 4.3 Components (under `src/components/sdk-demo/`)

```
sdk-demo/
  builder/
    workflow-builder.tsx          Top-level layout for the builder phase
    tool-palette.tsx              Grid of 8 tools (logo + short description); click selects
    event-picker.tsx              Lists events for the selected tool; click selects
    action-picker.tsx             Lists available actions; click toggles into the workflow
    action-list.tsx               Ordered list of selected actions, with drag-to-reorder
    mcp-picker.tsx                Chips for available MCPs; some auto-on based on actions
    sdk-code-panel.tsx            Live TypeScript code preview (read-only, syntax-tinted)
    builder-summary.tsx           "1 tool · 1 event · 4 actions · 5 MCPs" + Run CTA
  runtime/
    runtime-split.tsx             Split-screen layout for running + complete phases
    sdk-event-stream.tsx          Left panel: live SDK event stream (typed Run events)
    agent-console.tsx             Right panel: scripted step playback (forked from datadog-demo)
    artifact-strip.tsx            Bottom strip of artifact cards (5 tiles)
  artifacts/
    sdk-call-trace.tsx            NEW artifact: timeline of every SDK + MCP call w/ timing
    sdk-call-trace-modal.tsx      Wraps it in MacBook frame
    audit-timeline.tsx            Same shape as the GitGuardian audit timeline (forked)
    audit-timeline-modal.tsx
    jira-ticket.tsx               Forked from datadog-demo, content adapted to selected workflow
    github-pr-preview.tsx         Forked, content adapted
    pr-modal.tsx
    slack-thread.tsx              Forked, content adapted
    slack-modal.tsx
  guardrails-panel.tsx            "What the SDK enforces" panel for the landing page
  rep-value-card.tsx              "Why this matters for the security AE" card
```

### 4.4 Data layer (under `src/lib/sdk-demo/`)

```
sdk-demo/
  catalog/
    tools.ts                      Tool metadata (id, name, color, blurb, logo path)
    events.ts                     events[toolId] = list of plausible events
    actions.ts                    Action metadata (id, name, mcpsRequired, codeSnippet)
    mcps.ts                       MCP metadata (id, name, color, npm package, env var)
    workflows.ts                  Pre-authored complete workflows (the runtime mappings)
  codegen/
    generate-sdk-code.ts          Pure fn: workflow → TypeScript string
    generate-prompt.ts            Pure fn: workflow → agent prompt body
  scripts/
    gitguardian-secret.ts         Step[] for the GG secret-leak runtime
    wiz-public-bucket.ts          Step[] for the Wiz S3-bucket runtime
    okta-anomaly.ts               Step[] for the Okta auth-anomaly runtime
    snyk-vuln.ts                  Step[] for the Snyk vulnerability runtime
    crowdstrike-detection.ts      Step[] for the CrowdStrike endpoint detection runtime
    pick-script.ts                Pure fn: workflow → Step[] (best-fit script)
  types.ts                        Shared types: Tool, Event, Action, Mcp, Workflow, Step
```

### 4.5 No webhook route (for now)

This demo does **not** receive real partner events. The whole runtime is scripted from the user's builder picks. We do **not** add a `/api/sdk-demo-webhook` route — there's no real partner to verify a signature against, and adding a fake one would be misleading. If a future iteration of this demo wires up a *real* customer webhook for live presentations against a fake-tool console, that comes later.

Do add `.env.example` entries for `CURSOR_API_KEY` (already present, this demo just documents it) — the SDK code in the live preview reads it from `process.env`.

---

## 5. The tool, event, action, and MCP catalog

These are the building blocks the presenter picks from. Numbers are deliberate — small enough that the palette fits on screen, large enough that no two demo combinations need to look the same.

### 5.1 Tools (8)

| ID            | Name           | Color     | Blurb                                                          |
| ------------- | -------------- | --------- | -------------------------------------------------------------- |
| `gitguardian` | GitGuardian    | `#1F8FFF` | Secret detection across every commit, PR, and Slack message.   |
| `wiz`         | Wiz            | `#3F2EFF` | CSPM + CNAPP across AWS, Azure, GCP.                           |
| `snyk`        | Snyk           | `#4C4A73` | SAST + SCA + container + IaC.                                  |
| `crowdstrike` | CrowdStrike    | `#FF0033` | Endpoint detection + response (Falcon).                        |
| `okta`        | Okta           | `#007DC1` | Identity + access. System Log streams every auth.              |
| `splunk`      | Splunk         | `#00A4E4` | SIEM + SOAR (Phantom).                                         |
| `zscaler`     | Zscaler        | `#0099CC` | Zero-trust + DLP across egress traffic.                        |
| `vanta`       | Vanta          | `#0F62FE` | GRC + continuous-control monitoring.                           |

### 5.2 Events (per tool, 2–4 each)

Examples (full list lives in `src/lib/sdk-demo/catalog/events.ts`):

- **gitguardian:** `secret.exposed`, `incident.created`, `incident.resolved`
- **wiz:** `issue.opened` (CRITICAL), `issue.opened` (HIGH), `policy.violation`
- **snyk:** `vulnerability.new` (CRITICAL), `license.violation`, `iac.misconfiguration`
- **crowdstrike:** `detection.high-severity`, `prevention.blocked`, `host.contained`
- **okta:** `auth.anomaly`, `mfa.bypass`, `policy.evaluation.failed`
- **splunk:** `correlation.matched`, `notable.event`, `playbook.requested`
- **zscaler:** `dlp.policy.fired`, `tunnel.health.degraded`, `unsanctioned.app.detected`
- **vanta:** `control.failed`, `evidence.expiring`, `policy.drift`

### 5.3 Actions (~14 across all tools, several reusable across tools)

Each action has an `id`, a human label, the MCPs it depends on, and a short TypeScript snippet that gets composed into the live SDK code panel. Actions are bucketed by phase so the action picker can group them visually:

**Containment (do these first):**

- `rotate-aws-key` — AWS MCP. Deactivate the leaked key, mint a replacement.
- `roll-stripe-key` — Stripe MCP. Roll the restricted key.
- `publish-to-vault` — Vault MCP. Write the new secret at the canonical path.
- `revoke-okta-sessions` — Okta MCP. Force-revoke sessions for the user.
- `quarantine-host` — CrowdStrike MCP. Network-contain the device via Falcon.
- `block-egress` — Zscaler MCP. Add a temporary DLP block for the suspect destination.
- `narrow-iam-policy` — AWS MCP. Replace `*` with least-privilege scope.
- `enable-bucket-block` — AWS MCP. Toggle public-access-block on the offending bucket.

**Code remediation:**

- `open-cleanup-pr` — GitHub MCP. Open a PR removing the literal / fixing the IaC / bumping the dep.
- `open-history-purge-pr-draft` — GitHub MCP. Draft PR for `git filter-repo` cleanup.
- `bump-dependency` — GitHub MCP. Bump `package.json` + lockfile to the patched version.

**Audit + comms:**

- `file-jira` — Jira MCP. Open `CUR-SEC-XXXX`, link every artifact.
- `post-to-slack` — Slack MCP. Post structured incident summary to `#security-incidents`.
- `emit-splunk-audit-event` — Splunk MCP. Index a structured event the SIEM can correlate on.

The action picker auto-sorts the user's picks into containment → remediation → audit on add (so even an audience member who picks "post to Slack" first sees Slack land at the bottom of the list, modeling the "containment first" convention from `security-demos.md` §6).

### 5.4 MCPs (~10)

`aws-mcp`, `stripe-mcp`, `vault-mcp`, `github-mcp`, `slack-mcp`, `jira-mcp`, `splunk-mcp`, `okta-mcp`, `zscaler-mcp`, `crowdstrike-mcp`. Each has a name, brand color, npm package, and env var. The MCP picker is **derived** from the chosen actions (each action declares its dependencies), but the presenter can also explicitly add MCPs to demonstrate that the agent gets the tool but doesn't have to use it ("the agent has Splunk available but only writes to it if the audit action is selected").

### 5.5 Pre-authored runtime workflows (5)

Each maps one well-known shape of workflow to a runtime script. The runtime "best-fit" picker (`pick-script.ts`) chooses one based on the dominant tool + event in the workflow:

1. **`gitguardian-secret`** — GitGuardian `secret.exposed` + AWS rotate + Stripe roll + Vault publish + GitHub cleanup PR + Slack + Jira + Splunk audit.
2. **`wiz-public-bucket`** — Wiz `issue.opened (CRITICAL)` + AWS bucket block + AWS narrow IAM + GitHub Terraform PR + Jira + Slack.
3. **`okta-anomaly`** — Okta `auth.anomaly` + Okta session revoke + Splunk audit + Jira + Slack.
4. **`snyk-vuln`** — Snyk `vulnerability.new (CRITICAL)` + GitHub bump + GitHub cleanup PR + Jira + Slack.
5. **`crowdstrike-detection`** — CrowdStrike `detection.high-severity` + CrowdStrike contain + GitHub revert + Jira + Slack + Splunk audit.

`pick-script.ts` matches the user's workflow to one of these by tool + event, falling back to GitGuardian if nothing matches cleanly. Each script is ~24–34 steps in the same `Step[]` shape as the existing Datadog/Sentry demos. The agent-console renders the chosen script verbatim; the SDK event stream on the left renders a *parallel* event log (typed `Run` events: `assistant`, `step.complete`, `delta`, etc.) that maps roughly 1:1 with the agent-console steps.

---

## 6. The SDK code generator

`src/lib/sdk-demo/codegen/generate-sdk-code.ts` is a pure function that takes a `Workflow` and returns a multi-line TypeScript string. The output is real code that, with a real API key and real MCP servers configured, would actually run.

Output shape (illustrative — exact code is in the implementation):

```ts
import { Agent } from '@cursor/february/agent';
import express from 'express';

const app = express();

app.post('/webhooks/gitguardian', express.json(), async (req, res) => {
  if (!verifyGitGuardianSignature(req)) return res.sendStatus(401);

  const { incident } = req.body;

  const agent = Agent.create({
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: 'composer-2' },
    cloud: { repos: [{ url: 'https://github.com/acme/payments-service', startingRef: 'main' }] },
    mcps: [
      { name: 'gitguardian-mcp', package: '@gitguardian/mcp' },
      { name: 'aws-mcp',         package: '@aws/mcp' },
      { name: 'vault-mcp',       package: '@hashicorp/vault-mcp' },
      { name: 'github-mcp',      package: '@github/mcp' },
      { name: 'jira-mcp',        package: '@atlassian/jira-mcp' },
      { name: 'slack-mcp',       package: '@slack/mcp' },
      { name: 'splunk-mcp',      package: '@splunk/mcp' },
    ],
  });

  const run = await agent.send(`
    Incoming GitGuardian incident ${incident.id}. Execute the response sequence:
      1. Rotate the AWS access key at the issuer.
      2. Publish the replacement to Vault at payments-service/aws-access-key-id.
      3. Open a cleanup PR removing the literal from src/config/payments.ts.
      4. File Jira CUR-SEC-${incident.id}, link every artifact.
      5. Post a structured summary in #security-incidents.
      6. Emit a contained.event to Splunk.
    Containment first. Never auto-merge. History-purge as a draft PR only.
  `, {
    onStep: ({ step }) => {
      pushToWebhook(step);
    },
  });

  const result = await run.wait();
  res.json({ ok: true, agentId: agent.id, status: result.status });
});

app.listen(3000);
```

The generator should:

- Always import from `@cursor/february/agent` (the official SDK package documented in 2026).
- Conditionally import `express` when the trigger is "webhook" (the only trigger this demo offers; future iterations could add `cron` and `slack-slash-command`).
- Conditionally include each MCP from the workflow's MCP list (in stable order so the diff between picks is small and the audience can follow it).
- Compose the agent prompt from the workflow's actions, using each action's pre-written prompt fragment.
- Always include the safety footer: "Containment first. Never auto-merge. History-purge as a draft PR only."
- Always fit in ~50–80 lines so the panel never scrolls during a live demo.

A second generator, `generate-prompt.ts`, returns just the agent prompt string (used for both the live preview and the runtime).

---

## 7. The runtime — split screen

When the presenter clicks **Run automation**, the page transitions to a Datadog-style split layout:

| Left panel: SDK event stream                                         | Right panel: Agent console                              |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| Renders typed Run events as they "stream" from the SDK.              | Renders the canned `Step[]` script.                     |
| Header: `agent-bc-29f4… · status RUNNING · model composer-2`         | Header: `Cursor Background Agent · acme/payments-service` |
| Each row: `event.type · timestamp · payload preview`                 | Each row: timestamp · channel chip · label · detail     |
| Final row: `{ status: 'FINISHED', summary: { ... } }`                | Final row: `complete · Artifacts ready for review`      |

The two streams advance together — every agent-console step pushes a corresponding SDK event into the left stream. The audience sees the agent doing work on the right, *and* the structured SDK callbacks the customer's code would receive on the left.

This is the visual that ties "build the SDK code" (act 1) to "run the SDK" (act 2): the customer sees the events they'd receive in their own webhook handler, in the same shape the SDK actually emits them.

The event types are real Cursor SDK Run event types (`assistant`, `delta`, `step.complete`, `tool.call`, `tool.result`, `status.change`) so a developer in the audience can recognize them.

---

## 8. The artifact strip (5 tiles)

When the runtime completes, the artifact strip appears:

1. **SDK Call Trace** — the new artifact for this demo. A document-style modal listing every SDK + MCP call the run made, with timestamps, durations, and statuses. Looks like the kind of trace a developer would attach to a support ticket. (See §9.)
2. **Audit Timeline** — same shape as the GitGuardian audit timeline (CISO-facing chronological log).
3. **Jira Ticket** — `CUR-SEC-XXXX` adapted to the chosen workflow.
4. **GitHub PR** — adapted to the chosen workflow.
5. **Slack Thread** — adapted to the chosen workflow.

All in MacBook frames using the existing `src/components/shared/macbook-frame.tsx`.

---

## 9. The new artifact: SDK Call Trace

This is the artifact that uniquely sells *the SDK* (not the workflow). It looks like a developer-facing trace report:

```
agent-bc-29f4d… · status FINISHED · 28 SDK events · 6 MCP servers · 22.4s wall · 58.0s billed

┌─ 14:18:03.421  agent.create()
│   model: composer-2
│   mcps:  [aws-mcp, vault-mcp, github-mcp, slack-mcp, jira-mcp, splunk-mcp]
│
├─ 14:18:03.612  agent.send(prompt: 412 chars)
│
├─ 14:18:04.108  status.change            → RUNNING
├─ 14:18:04.291  tool.call    aws-mcp     → iam.create_access_key()
├─ 14:18:04.844  tool.result  aws-mcp     → 200 OK · 553ms
├─ 14:18:04.877  tool.call    aws-mcp     → iam.update_access_key(status=Inactive)
├─ 14:18:05.191  tool.result  aws-mcp     → 200 OK · 314ms
├─ 14:18:05.220  tool.call    vault-mcp   → kv.write('payments-service/aws-access-key-id')
├─ 14:18:05.602  tool.result  vault-mcp   → version: 23 · 382ms
├─ 14:18:05.661  tool.call    github-mcp  → branch.create('cleanup/secret-purge-payments-service')
│
... 18 more events ...
│
├─ 14:19:01.107  step.complete            → 'Open Slack incident summary'
├─ 14:19:01.244  status.change            → FINISHED
└─ 14:19:01.244  agent.wait()             → { status: 'FINISHED', summary: {...} }
```

This is the artifact that lets a platform-engineer in the audience say *"yes, my logging system can index that"*. It is the strongest "this is real code" signal in the demo and should be the first artifact card (leftmost in the strip).

---

## 10. Files to create

```
src/app/partnerships/cursor-sdk/page.tsx                              NEW  Narrative landing
src/app/partnerships/cursor-sdk/demo/page.tsx                         NEW  Builder + runtime

src/components/sdk-demo/builder/workflow-builder.tsx                  NEW
src/components/sdk-demo/builder/tool-palette.tsx                      NEW
src/components/sdk-demo/builder/event-picker.tsx                      NEW
src/components/sdk-demo/builder/action-picker.tsx                     NEW
src/components/sdk-demo/builder/action-list.tsx                       NEW
src/components/sdk-demo/builder/mcp-picker.tsx                        NEW
src/components/sdk-demo/builder/sdk-code-panel.tsx                    NEW
src/components/sdk-demo/builder/builder-summary.tsx                   NEW
src/components/sdk-demo/runtime/runtime-split.tsx                     NEW
src/components/sdk-demo/runtime/sdk-event-stream.tsx                  NEW
src/components/sdk-demo/runtime/agent-console.tsx                     NEW  (fork of datadog-demo agent-console with security channels)
src/components/sdk-demo/runtime/artifact-strip.tsx                    NEW
src/components/sdk-demo/artifacts/sdk-call-trace.tsx                  NEW
src/components/sdk-demo/artifacts/sdk-call-trace-modal.tsx            NEW
src/components/sdk-demo/artifacts/audit-timeline.tsx                  NEW
src/components/sdk-demo/artifacts/audit-timeline-modal.tsx            NEW
src/components/sdk-demo/artifacts/jira-ticket.tsx                     NEW
src/components/sdk-demo/artifacts/github-pr-preview.tsx               NEW
src/components/sdk-demo/artifacts/pr-modal.tsx                        NEW
src/components/sdk-demo/artifacts/slack-thread.tsx                    NEW
src/components/sdk-demo/artifacts/slack-modal.tsx                     NEW
src/components/sdk-demo/guardrails-panel.tsx                          NEW
src/components/sdk-demo/rep-value-card.tsx                            NEW

src/lib/sdk-demo/types.ts                                             NEW
src/lib/sdk-demo/catalog/tools.ts                                     NEW
src/lib/sdk-demo/catalog/events.ts                                    NEW
src/lib/sdk-demo/catalog/actions.ts                                   NEW
src/lib/sdk-demo/catalog/mcps.ts                                      NEW
src/lib/sdk-demo/catalog/workflows.ts                                 NEW
src/lib/sdk-demo/codegen/generate-sdk-code.ts                         NEW
src/lib/sdk-demo/codegen/generate-prompt.ts                           NEW
src/lib/sdk-demo/scripts/gitguardian-secret.ts                        NEW
src/lib/sdk-demo/scripts/wiz-public-bucket.ts                         NEW
src/lib/sdk-demo/scripts/okta-anomaly.ts                              NEW
src/lib/sdk-demo/scripts/snyk-vuln.ts                                 NEW
src/lib/sdk-demo/scripts/crowdstrike-detection.ts                     NEW
src/lib/sdk-demo/scripts/pick-script.ts                               NEW
```

**Also:**

- Add a `Cursor SDK + Security Automation` card to the **Partnership Demo Showcase** grid in `src/components/sections/partnerships.tsx`.
- Update the **Partners live today** table in `README.md` with the new route.
- No changes to `src/lib/constants.ts` (this isn't a partner; it's a Cursor-product surface).

---

## 11. Implementation order

1. **Types + catalog data** (`src/lib/sdk-demo/types.ts` + `catalog/*`). Pure data, no UI. Establishes the contract everything else binds to.
2. **Codegen** (`generate-sdk-code.ts`, `generate-prompt.ts`). Pure functions. Easy to verify in isolation.
3. **Runtime scripts** (`scripts/*`). Pure data. Each script is a `Step[]` like the existing Datadog/Sentry scripts.
4. **Builder UI** (`builder/*`) — without runtime wiring. Click-to-pick + live code panel. Verify in isolation that picking a tool updates the code panel.
5. **Runtime UI** (`runtime/*`) — fork `datadog-demo/agent-console.tsx`, build the SDK event stream, build the artifact strip.
6. **Artifacts** (`artifacts/*`) — SDK call trace first (the new one), then the GG-style fork of audit timeline, then content adaptations of jira/pr/slack.
7. **Wire `/cursor-sdk/demo/page.tsx`** with the four-phase state machine and reset.
8. **Landing page `/cursor-sdk/page.tsx`** — short narrative + CTA.
9. **Hub integration** — showcase card + README update.
10. **Smoke test** — `npx tsc --noEmit` clean. `npm run build` clean. Click through five different workflows; confirm SDK code panel updates correctly each time and runtime renders a different script for each.

---

## 12. Design requirements (non-negotiable for live use)

- **Repeatable.** Same picks → same runtime → same artifacts, every time. No `Math.random()` in the playback.
- **Fast feedback.** The SDK code panel must update within one render frame of any pick. The audience sees the cause-effect immediately.
- **Dense but readable.** The builder fits on a single 1440×900 screen without scrolling. The runtime split also fits on the same screen.
- **Color discipline.** Same as `security-demos.md` §6 — red/amber/green for incident state, GG/Wiz/etc. brand colors only on tool-attributed UI.
- **No crashed states.** A presenter clicking "Run automation" with zero actions should be a no-op, not a runtime error. Validation lives in `builder-summary.tsx`.
- **Order matters.** The action list models containment-first. Reordering an action so containment lands after audit should *visibly warn* (amber chip on the card). It still runs, but the warning teaches the audience the convention.
- **Reset is one click and instant.** No animation gating. The presenter must be able to rerun the demo within 5 seconds of finishing.

---

## 13. Anti-patterns

- ❌ **Don't** render every Cursor model name. The model is `composer-2` — fixed, real, simple. No model-picker in the builder.
- ❌ **Don't** make the SDK code panel a real editor (Monaco etc.). A read-only `<pre>` with token-tinted spans is enough and avoids 200 KB of JS.
- ❌ **Don't** reach for `react-flow` / `xyflow`. The builder is a list, not a canvas. We ship a list.
- ❌ **Don't** simulate real partner API calls. Everything in the runtime is scripted playback.
- ❌ **Don't** allow the runtime to render before the builder is valid. Disable "Run automation" until tool + event + ≥1 action are picked.
- ❌ **Don't** auto-merge in any artifact. The PR card must say "Awaiting review" and the prompt footer must say "Never auto-merge."

---

## 14. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/cursor-sdk/demo` loads with the empty builder visible.
- Picking any of the 8 tools surfaces 2–4 events for that tool.
- Picking an event makes the action picker active.
- Picking actions appends them to the action list, in containment → remediation → audit order, with reorder-to-warn behavior.
- The SDK code panel updates within one render frame of any pick, and the rendered TypeScript always typechecks against the documented `@cursor/february` shape.
- "Run automation" CTA is disabled until the workflow is valid; enabled the moment it is.
- Clicking "Run automation" transitions the page to the split-screen runtime within 200ms.
- The SDK event stream and the agent console advance roughly together; the run completes in ~22s real time, ~60s displayed.
- Artifact strip appears after the run; all 5 modals open and close cleanly.
- Reset returns the page to an empty builder.
- Running the demo end-to-end with five different tool combinations produces five different runtimes (verified by spotting the dominant tool/event in the SDK call trace).
- `npx tsc --noEmit` passes.
- `npm run build` passes.

---

## 15. Quick reference — Datadog demo file → SDK demo file

| Datadog                                  | SDK demo                                                  |
| ---------------------------------------- | --------------------------------------------------------- |
| `reports-card.tsx`                       | `builder/workflow-builder.tsx` (different shape)          |
| `demo-perf-boundary.tsx`                 | (n/a — no thrown error)                                   |
| `full-slo-breach-page.tsx`               | (n/a — no full takeover; the builder is the home)         |
| `slo-summary.tsx`                        | (n/a; the SDK event stream replaces it)                   |
| `agent-console.tsx`                      | `runtime/agent-console.tsx` (different scripts per pick)  |
| `artifact-cards.tsx`                     | `runtime/artifact-strip.tsx`                              |
| `artifacts/datadog-trace.tsx`            | `artifacts/sdk-call-trace.tsx`                            |
| `artifacts/datadog-modal.tsx`            | `artifacts/sdk-call-trace-modal.tsx`                      |
| `artifacts/triage-report.tsx`            | `artifacts/audit-timeline.tsx`                            |
| —                                        | `artifacts/audit-timeline-modal.tsx`                      |
| `artifacts/jira-ticket.tsx`              | `artifacts/jira-ticket.tsx` (workflow-adapted)            |
| `artifacts/github-pr-preview.tsx`        | `artifacts/github-pr-preview.tsx` (workflow-adapted)      |
| `artifacts/pr-modal.tsx`                 | `artifacts/pr-modal.tsx`                                  |
| —                                        | `artifacts/slack-thread.tsx`                              |
| —                                        | `artifacts/slack-modal.tsx`                               |
| `latency-comparison.tsx`                 | (n/a)                                                     |
| `guardrails-panel.tsx`                   | `guardrails-panel.tsx` (SDK-flavored)                     |
| `src/lib/demo/aggregate-orders.ts` etc.  | (n/a — no real trigger code)                              |
| `src/app/api/datadog-webhook/route.ts`   | (n/a — see §4.5)                                          |
