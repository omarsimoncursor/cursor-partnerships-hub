# PagerDuty + Cursor SDK Auto-Resolve Demo — Build Brief (v2)

> **Purpose of this document:** This v2 spec **replaces v1**. The original
> shipped a generic webhook + scripted-console demo at
> `/partnerships/pagerduty/demo`. We are reimagining it as a demonstration of
> the **Cursor SDK** (`@cursor/sdk`, public beta as of Cursor 2.5) running
> inside an enterprise sandbox. The Datadog narrative page is now the
> structural template for the PagerDuty narrative page, and the interactive
> demo is rebuilt so that every visible action is an SDK call you can copy.
>
> **Old demo files are kept** (no breaking removals). The narrative page is
> rebuilt, the interactive demo's agent console is reframed as a literal
> `agent.stream()` event log, and a new "Cursor SDK in your VPC" panel
> appears alongside the live timeline.

---

## 0. TL;DR for the agent

Build two surfaces:

1. **`/partnerships/pagerduty`** — a Datadog-style **5-act scroll narrative**
   that argues the SDK thesis: "PagerDuty fires the page; the Cursor SDK,
   running in your own sandbox, turns the on-call rotation into a programmable
   auto-pilot you own and ship." Mirror the visualization vocabulary used by
   `src/components/datadog/` (the McpFlowDiagram, the multi-model pipeline,
   the PRReviewStation, the value-prop cards, the MTTR stat).
2. **`/partnerships/pagerduty/demo`** — keep the four-phase state machine, but
   **re-skin the right-hand console as an SDK runtime trace** that prints
   `sdk.run.start`, `sdk.subagent.spawn`, `sdk.tool.call`, `sdk.run.event`
   rows in real time. Add a third panel that shows the SDK source code for
   each step, with a copy-to-clipboard. The left-hand PagerDuty timeline and
   four artifact modals stay.

**The thesis to land in both surfaces:**

- The SDK is the **integration substrate** — same runtime, harness, and models
  that power Cursor desktop, but callable from your own webhook handler,
  cron job, or PD event subscription.
- Enterprises run it in a **sandbox they control** — admin-enforced network
  allowlists, self-hosted workers for data privacy, scoped repo access.
- Subagents make the workflow **legible and parallelizable** — a `triage`
  subagent (Opus, long context), a `revert` subagent (Composer, scoped edits),
  a `comms` subagent (light model, Statuspage + Slack writes) all spawned by
  a parent that owns the decision tree.
- The SDK is **token-billed** — finance can model it, security can audit it,
  SRE can trust it.

---

## 1. Why the redesign

The v1 demo did the right thing for the v1 era — webhook in, opaque cloud
agent out. With the SDK shipping (Cursor 2.5, Feb 17 2026), prospects no
longer want "we'll handle it." They want **a buildable contract** they can
own. The demo must now show *the code* and *the sandbox*, not just the
artifacts that come out the other side.

The Datadog scroll narrative is the right template because it:
- Walks the prospect through a 5-beat story (Detect → Orchestrate → Ship → Value)
- Already uses the visualization primitives we want to reuse: `McpFlowDiagram`,
  `PRReviewStation`, `FlowPipe`, `SystemNode`, `MacBookFrame`,
  `TypingAnimation`, `AnimatedCounter`
- Anchors each act with a glass card and a brand-color logo pair
- Funnels into the live demo at the bottom

We re-use **all** of that for PagerDuty, swapping vocabulary and brand.

---

## 2. Required reading (in this repo, in order)

**Narrative scroll pattern (the new template):**
- `src/app/partnerships/datadog/page.tsx` — five-act scroll page structure.
- `src/components/datadog/alert-scene.tsx` — Act 1 (dashboard takeover).
- `src/components/datadog/editor-scene.tsx` — Act 2 (`McpFlowDiagram`).
- `src/components/datadog/analysis-scene.tsx` — Act 3 (multi-model pipeline +
  `TypingAnimation` terminal).
- `src/components/datadog/fix-scene.tsx` — Act 4 (`PRReviewStation`).
- `src/components/datadog/value-prop-scene.tsx` — Act 5 (3 cards + MTTR
  `AnimatedCounter`).

**Shared visual primitives (reuse, don't fork):**
- `src/components/shared/mcp-flow-diagram.tsx`
- `src/components/shared/pr-review-station.tsx`
- `src/components/shared/flow-pipe.tsx`
- `src/components/shared/system-node.tsx`
- `src/components/shared/macbook-frame.tsx`
- `src/components/ui/typing-animation.tsx`
- `src/components/ui/animated-counter.tsx`

**Existing PagerDuty demo (keep, evolve, do not delete):**
- `src/app/partnerships/pagerduty/page.tsx` — REWRITE entirely.
- `src/app/partnerships/pagerduty/demo/page.tsx` — keep state machine, refresh
  copy + add SDK code panel.
- `src/components/pagerduty-demo/*` — keep all components, modify
  `agent-console.tsx` to render SDK events.

---

## 3. The Cursor SDK — what to render

These are the SDK shapes the demo needs to look credible. Use them verbatim
in code snippets (do not invent new APIs).

```ts
// 1. Create a session — runs in your sandbox / self-hosted worker
import { Agent } from '@cursor/sdk';

const agent = Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: 'composer-2' },
  cloud: {
    repos: ['github.com/acme/payments-api'],
  },
  sandbox: {
    network: 'allowlist',  // admin-enforced via Cursor 2.5 dashboard
    allowedDomains: [
      'api.pagerduty.com',
      'api.datadoghq.com',
      'api.github.com',
      'status.acme.com',
      'hooks.slack.com',
    ],
  },
});

// 2. Kick off a run from a webhook handler
const run = await agent.send(
  `Triage PagerDuty incident ${incident.id} on payments-api.
   Decide revert vs fix-forward. If confidence > 0.7, ship the change.`,
  {
    subagents: {
      triage: { model: { id: 'claude-opus-4-thinking' } },
      revert: { model: { id: 'composer-2' } },
      comms:  { model: { id: 'composer-2' } },
    },
    onEvent: (event) => publishToPagerdutyTimeline(event),
  },
);

// 3. Stream normalized events back into your incident timeline
for await (const event of run.stream()) {
  switch (event.type) {
    case 'subagent.spawn':       await pd.notes(incident.id, event); break;
    case 'tool.call':            await metrics.record(event); break;
    case 'decision':             await pd.notes(incident.id, event); break;
    case 'pull_request.opened':  await pd.notes(incident.id, event); break;
  }
}

const result = await run.wait();
```

**Critical SDK story-beats to land:**

- `Agent.create` is **declarative** — repos, model, sandbox policy.
- The runtime is the **same** runtime that powers desktop Cursor.
- `subagents` make the workflow **legible** — each one has its own model, its
  own scope, its own allowlist.
- `run.stream()` produces **normalized events** that an enterprise can route
  to PagerDuty, Statuspage, Slack, Datadog, OpenTelemetry — anywhere.
- `run.wait()` is **typed** — the result is a structured object, not free
  text.

---

## 4. The new narrative page — `/partnerships/pagerduty`

Rebuild end-to-end. The structure mirrors `src/app/partnerships/datadog/page.tsx`:

### Hero
- Same logo-pair pattern: `[ PD ] + [ C ]` with PagerDuty green (`#06AC38`)
  and Cursor blue.
- Headline: **"The page that didn't fire."**
- Subline: "PagerDuty triggers the incident. The Cursor SDK, running in your
  own sandbox, ack's, triages, reverts, and resolves — without paging a
  human."
- One CTA: → "Run the live demo".

### Act 1 — The Page Fires
Mirror `alert-scene.tsx` but render a **PagerDuty incident dashboard**, not a
Datadog APM dashboard. Pulsing red header, on-call card, escalation policy.

### Act 2 — The Cursor SDK Activates
Reuse `McpFlowDiagram` with these props:
- `sourceName="PagerDuty"`, `sourceColor="#06AC38"`
- `eventBadge={ label: 'priority', value: 'P1' }`
- `payloadLines` → a real PagerDuty V3 webhook payload preview
- `semanticResults` → 4 plausible payments-api files

The narrative copy under the diagram becomes the SDK pitch: "No engineer
needed. The PagerDuty webhook fires `Agent.create()` inside your sandboxed
worker. The agent queries the semantic index instantly to locate every
relevant code path."

Add a **second** card immediately below the diagram: a syntax-highlighted SDK
code snippet panel that shows `Agent.create({ ... })` with the sandbox
network policy. This is the new visual that v1 lacked.

### Act 3 — Multi-Subagent Orchestration via the SDK
Mirror `analysis-scene.tsx`, but the three pipeline stages are now **SDK
subagents**:

| # | Stage           | Model                     | Color    | Role                                    |
|---|-----------------|---------------------------|----------|-----------------------------------------|
| 1 | **triage**      | `claude-opus-4-thinking`  | `#A259FF`| Reads PD + Datadog + git history        |
| 2 | **revert**      | `composer-2`              | `#60A5FA`| Generates the revert commit             |
| 3 | **comms**       | `composer-2`              | `#3DB46D`| Posts Statuspage + Slack updates        |

Use the same glass-card pipeline layout with `FlowPipe` between cards. The
`TypingAnimation` terminal becomes a literal `for await (const event of
run.stream())` loop, printing real `sdk.subagent.spawn`, `sdk.tool.call`,
`sdk.decision` events.

### Act 4 — Ship It
Reuse `PRReviewStation` with revert PR copy:
- `prTitle="revert: roll back v1.43.0 (resolves INC-21487)"`
- `prNumber="#318"`
- `prFiles` → 1 file, +4 −218 (pure subtractive)
- `ciChecks` → `typecheck`, `lint`, `unit`, `canary-deploy`, `slo-gate`
- `accentColor="#06AC38"`, `sourceColor="#06AC38"`

Below the station, swap the Datadog "metrics + human-in-the-loop" callout for:
- Three stats: `MTTA 12s`, `MTTR 4m 12s`, `0 humans paged`
- A "What the SDK gave you" callout (own the runtime, own the policy, own
  the audit log).

### Act 5 — Better Together
Mirror `value-prop-scene.tsx` with three cards:

| Card | Title       | Subtitle                                | Color    |
|------|-------------|-----------------------------------------|----------|
| 1    | **Page**    | PagerDuty                               | `#06AC38`|
| 2    | **Build**   | Cursor SDK in your VPC                  | `#60A5FA`|
| 3    | **Resolve** | Programmable on-call auto-pilot         | `#4ADE80`|

Use `AnimatedCounter` for an `87%` MTTR-reduction stat, identical pattern.

End the page with a final, prominent CTA pill into the live demo, plus a
short SDK code block: `Agent.create({ cloud: { repos } })`.

---

## 5. The interactive demo — `/partnerships/pagerduty/demo`

Keep the four-phase state machine and the four artifact modals. Refresh:

### Idle phase
Add a **second card** below the on-call status board: a syntax-highlighted
SDK code panel titled **"This is what powers the auto-pilot."** Show the
exact `Agent.create({ ... })` from §3. Two-tab toggle: `Setup` (the
`Agent.create` call) and `Webhook handler` (the `agent.send` call).

Keep the existing `PageSuppressionStats` and `GuardrailsPanel` cards.

### Error phase
Unchanged.

### Running phase — the meaningful redesign
Same split-screen, but the **right panel becomes an SDK runtime trace**, not
free-form agent labels.

Each row now renders as:
```
[+12.4s] sdk.subagent.spawn   triage   model=claude-opus-4-thinking
[+12.6s] sdk.tool.call        triage   pagerduty.fetchIncident { id: 'INC-21487' }
[+15.0s] sdk.decision         triage   { decision: 'revert', confidence: 0.93 }
[+15.4s] sdk.subagent.spawn   revert   model=composer-2
[+17.1s] sdk.pull_request.opened  revert  github.com/acme/payments-api/pull/318
```

The row chrome stays (channel pill, timestamp, label, detail), but the
channel labels become SDK event types (`sdk.run.start`, `sdk.subagent.spawn`,
`sdk.tool.call`, `sdk.decision`, `sdk.pull_request.opened`,
`sdk.statuspage.update`, `sdk.run.complete`).

Add a small **"sandbox" header bar** at the top of the console showing:
- Worker hostname (`worker-cursor-sdk-7f4d.acme.internal`)
- Allowed-egress chips (`api.pagerduty.com`, `api.datadoghq.com`, …)
- Token budget (`tokens used: 12,440 / 50,000`)

This is the new enterprise-grade detail that wasn't in v1.

### Complete phase
Unchanged artifact cards + counterfactual.

Add **one more side card** under the artifacts: a small "Build this in your
infra" tile that opens the SDK code modal showing the full handler.

### New file
- `src/components/pagerduty-demo/sdk-runtime-trace.tsx` — replaces (or
  composes) the v1 console; renders the SDK events from the script.
- `src/components/pagerduty-demo/sdk-code-panel.tsx` — the syntax-highlighted
  code block with two tabs, used on idle phase + as a "build this" modal.

The existing `agent-console.tsx` SCRIPT can stay as the source of truth for
timing — only the rendering layer changes (each step becomes one SDK event).

---

## 6. Files to change / add

```
src/app/partnerships/pagerduty/page.tsx                                  REWRITE
src/components/pagerduty/page-fires-scene.tsx                            NEW (mirrors alert-scene)
src/components/pagerduty/sdk-activated-scene.tsx                         NEW (mirrors editor-scene)
src/components/pagerduty/sdk-orchestration-scene.tsx                     NEW (mirrors analysis-scene)
src/components/pagerduty/sdk-ships-pr-scene.tsx                          NEW (mirrors fix-scene)
src/components/pagerduty/sdk-value-scene.tsx                             NEW (mirrors value-prop-scene)
src/components/pagerduty/sdk-code-panel.tsx                              NEW (the syntax-highlighted SDK snippet block)
src/components/pagerduty-demo/sdk-runtime-trace.tsx                      NEW (re-skinned agent console with SDK event types)
src/app/partnerships/pagerduty/demo/page.tsx                             EDIT (use sdk-runtime-trace, add SDK code panel below on-call board)
src/lib/constants.ts                                                     EDIT (PD rationale leads with SDK)
docs/partner-demos/pagerduty-demo.md                                     REWRITE (this doc)
```

Do NOT delete:
- `src/components/pagerduty-demo/agent-console.tsx` — its SCRIPT export is
  the timing source for `sdk-runtime-trace.tsx`. Keep the file.
- Any artifact modal — they all still work.

---

## 7. Acceptance criteria

- `/partnerships/pagerduty` is a five-act scroll page that visually matches
  the Datadog narrative page in structure.
- Every Datadog visualization primitive (`McpFlowDiagram`, `PRReviewStation`,
  glass-card pipeline, MTTR `AnimatedCounter`, MacBook frame) appears at
  least once on the new PagerDuty narrative page.
- An SDK code block (`Agent.create({ ... })` and `agent.send({ ... })`)
  appears at least twice on the narrative page (Act 2 + final CTA strip) and
  at least once on the demo idle phase.
- The interactive demo's right-hand console renders rows that name SDK event
  types (`sdk.subagent.spawn`, `sdk.tool.call`, `sdk.decision`,
  `sdk.pull_request.opened`, `sdk.run.complete`) with a sandbox header bar
  showing the worker hostname, allowed egress, and token budget.
- The narrative page's CTA pill links to the demo. The demo's nav back link
  goes to the narrative page.
- Reset still returns the demo to clean idle state.
- `npx tsc --noEmit` passes; `next build --webpack` passes.
- `PARTNER_CATEGORIES.devtools` PagerDuty entry leads with the SDK pitch
  ("the SDK turns the on-call rotation into a programmable auto-pilot")
  rather than the webhook pitch.
- Running the demo twice produces identical output.
- All four artifact modals (PD incident, Statuspage, revert PR, postmortem)
  still open and render.

---

## 8. Anti-patterns

- ❌ Don't invent SDK methods that aren't in the public docs. Stick to
  `Agent.create`, `agent.send`, `run.stream`, `run.wait`, and the
  `subagents` config option. Anything else is fan-fiction and security
  reviewers will smell it.
- ❌ Don't drop the existing PD-incident takeover or the live timeline.
  They're the emotional spine of the demo. Re-skin, don't rip out.
- ❌ Don't make the new narrative page a literal copy of Datadog's. Re-use
  the components, but write Datadog out of every string.
- ❌ Don't let the SDK code panel scroll horizontally. Use word-wrap and
  small font sizes. Enterprise architects screenshot these.

---

## 9. Ship it

Update the existing PR (#11) on
`cursor/pagerduty-live-auto-resolve-demo-09f8`. Title can stay; rewrite the
body to match v2.
