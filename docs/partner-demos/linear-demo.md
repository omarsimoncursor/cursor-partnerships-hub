# Linear Live Backlog-to-PR Demo — Build Brief

> **Purpose of this document:** Self-contained spec for a new Cursor agent to build an interactive demo at `/partnerships/linear/demo`. Patterned on the Sentry/Datadog demos but with a different "AHA" angle — this one is about turning **product backlog** into **shipping work**, not reacting to incidents.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Linear + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/linear/demo`. The hero is a pixel-perfect Linear "My Issues" view for a fake `WEB` team. There are 6 small-to-medium issues triaged this morning, ranging from a CSS bug to a small feature behind a flag.
2. The user clicks **"Run weekly grooming"**. The list briefly shows a "Cursor agent reviewing 6 issues…" indicator (~3s), then pivots to a full-screen takeover: a **prioritized work plan** showing which issues Cursor will execute autonomously, which it will draft a PR for and stop for review, and which it bounces back as under-specified.
3. The user clicks **"Watch Cursor work the queue"**. Split screen: Linear "current cycle" board on the left (with the 6 issues moving through `Backlog → In Progress → In Review → Done` in lockstep with the agent), agent console on the right.
4. The agent works the queue end-to-end: spawns 4 parallel Cursor agents (one per issue), each with its own scoped MCP context, each opens a PR. Two issues are "draft for human review" (more risky), four are "auto-mergeable behind feature flag" (low-risk, well-specified).
5. When complete, four artifact modals are clickable: **Linear issue (with auto-attached PR)**, **Cycle board (after-state)**, **GitHub PR (one of the auto-merged ones)**, and **Spec-clarification reply** (the under-specified issue Cursor bounced back to the PM with a structured question).
6. Reset returns to clean state. `scripts/reset-linear-demo.sh` re-seeds the cycle.

**The "AHA":** *"Cursor processed half my sprint while I was at lunch."* This demo positions Cursor as a **backlog operator**, not a code completer. It's the most natural Linear story.

---

## 1. Why this demo, why this angle

Linear's audience is high-velocity product engineering teams that already think in cycles, scopes, and labels. Their pain isn't crashes; it's **the long tail of small-but-real issues that linger because every dev's bandwidth is spent on the high-leverage 20%**. The most impactful agentic story for Linear is **autonomous queue-clearing**: at the start of a cycle, Cursor reads the backlog, picks the issues it can confidently complete, ships PRs for them in parallel, leaves the rest for humans, and asks structured clarifying questions on the under-specified ones.

This is fundamentally different from PD/Sentry/Datadog: it's a **proactive batch** demo, not a reactive incident demo. Don't shoehorn it into the same shape.

---

## 2. Required reading

**Page + state machine:**

- `src/app/partnerships/sentry/demo/page.tsx` — canonical state machine.
- `src/app/partnerships/datadog/demo/page.tsx` — same, re-skinned.

**Components:**

- `src/components/sentry-demo/agent-console.tsx` — scripted-playback pattern. Note: for Linear, you'll need to extend this to support **parallel lanes** (multiple agents working concurrently). Plan that early.
- `src/components/datadog-demo/agent-console.tsx` — fork target.
- `src/components/sentry-demo/artifacts/macbook-frame.tsx` — promote to `shared/` if not already done.
- `src/components/sentry-demo/artifacts/jira-ticket.tsx` — pixel-perfect ticket pattern. Use as inspiration for the Linear issue modal, but Linear's chrome is *different* (Linear is famously minimalist, fast, monospace-leaning, gradient accents). Do not just re-color a Jira modal.

**Trigger code:** none in the strict sense — this demo doesn't trigger a runtime error. The "trigger" is a click on **Run weekly grooming**.

**Webhook + reset:** `src/app/api/datadog-webhook/route.ts`, `scripts/reset-datadog-demo.sh` for shape.

---

## 3. The demo — concept & story

### Trigger UI (idle phase)

A pixel-perfect **Linear inbox / "My Issues" view** for the fake `WEB` team. Linear's chrome:

- Left rail: workspace switcher, team list (`WEB`, `MOBILE`, `INFRA`), "Inbox · 12", "My Issues · 6", "Active · 23", "Backlog · 41", and a "Cycles" section with the current cycle highlighted.
- Top bar: cycle name (`Cycle 47 · Apr 14 → Apr 21`), filters, sort, view-options.
- Main area: a list of 6 issues. Each row has the issue ID (`WEB-832`), priority chip, title, assignee avatar, status, label chips, and a sub-tasks count. Realistic mix:
  - `WEB-832 · P2 · Fix focus-ring color on dark mode for primary CTA · Frontend, Bug · No estimate`
  - `WEB-841 · P1 · Add empty-state illustration to Reports page · Design, Frontend · M`
  - `WEB-845 · P2 · Migrate /settings/api to new useTRPC hook · Frontend, Refactor · S`
  - `WEB-847 · P3 · Add aria-label to nav item icons · A11y · XS`
  - `WEB-851 · P2 · Implement /api/v2/exports CSV endpoint behind flag · Backend, Feature-flag · M`
  - `WEB-853 · P1 · Fix off-by-one pagination on the Customers table · Frontend, Bug · S`
- Bottom-right: a single CTA `[ Run weekly grooming ]` styled as a Linear command-palette button (purple gradient).

Below the fold, a **Throughput card** (the analog of `cost-comparison.tsx`):

- Left column: "Without Cursor — typical week" — 6 issues triaged, 1.5 average shipped, 4.5 carried over.
- Right column: "With Cursor agent — same week" — 6 issues triaged, 4 shipped (2 auto-merged behind flag, 2 awaiting human review), 1 PM clarification requested, 1 bounced back as out-of-scope.
- Subhead: "Numbers from the demo cycle. Real customers report a 2.5–3.5× lift on triaged-to-shipped within 2 sprints."

And a **Guardrails panel** specific to Linear:

- "Auto-merge only if labeled `auto-mergeable` AND scope ≤ S AND CI green AND test coverage ≥ existing."
- "Always open a draft PR for human review; never push to main."
- "Refuses to estimate; only PMs can re-prioritize."
- "Spec-clarification responses are routed to the issue creator, never the team."

### The plan (error-equivalent phase — call it `planned`)

When the user clicks **Run weekly grooming**, briefly show a "Cursor agent reviewing 6 issues…" overlay (~3s, purple gradient progress bar), then pivot to a **full-screen "Cycle 47 work plan" takeover**. This is the Linear analog of `FullErrorPage`, but it's a *plan*, not a fault. Layout:

- Top: the WEB team logo + "Cycle 47 · 6 issues triaged · plan ready".
- Three columns:
  1. **Auto-execute (4)** — list of 4 issues Cursor will work in parallel. Each has a confidence score and an estimated wall-clock time. Tag: "behind feature flag" where applicable.
  2. **Draft for human review (1)** — 1 issue Cursor will produce a draft PR for, but not auto-merge. Reason shown.
  3. **Bounce back (1)** — the under-specified issue. Reason shown ("Acceptance criteria missing: which user role can export?"). The action will be a structured clarifying comment back to the PM.
- Bottom: **`[ Watch Cursor work the queue ]`** (primary, Linear gradient) and **`[ Reset ]`**.

### The orchestration (running phase)

Split screen:

- **Left:** a **live Linear cycle board** (Kanban-style: `Backlog · Todo · In Progress · In Review · Done` columns). The 6 issue cards literally **move across columns** as the agent works them. Each card has a tiny avatar — a `cursor-agent` avatar with a colored ring (green = auto, yellow = draft for review, red = bounced). Smooth animations as cards slide. This is the demo's hero visual.
- **Right:** scripted agent console. Critically, this console must support **parallel lanes**. Render 4 sub-streams (one per auto-execute issue) interleaved by timestamp. Use a left-edge color band to identify which issue each row belongs to (e.g., `WEB-832` blue, `WEB-845` green, `WEB-847` purple, `WEB-853` amber). Add an "Agents: 4 running · 2 standby" stat in the console header.

### Channels

| Channel       | Label                | Hex accent | Role                                            |
| ------------- | -------------------- | ---------- | ----------------------------------------------- |
| `linear`      | `linear-mcp`         | `#5E6AD2`  | Read issue, transition status, post comment     |
| `github`      | `github-mcp`         | (white)    | Branch, PR, CI                                  |
| `figma`       | `figma-mcp`          | `#A259FF`  | Read design tokens for the empty-state issue    |
| `slack`       | `slack-mcp`          | `#4A154B`  | Notify the PM of the bounced clarification      |
| `shell`       | `shell`              | green      | tsc, lint, test, dev server                     |
| `composer`    | `composer · scoped`  | blue       | Per-issue scoped edits (4 parallel instances)   |
| `opus`        | `opus · plan`        | `#D97757`  | Cycle planning + spec-clarification drafting    |
| `codex`       | `codex · review`     | `#10a37f`  | Pre-PR review                                   |
| `done`        | `complete`           | green      | Terminal step                                   |

### Target script arc (~32 steps total across 4 lanes, ~22s real, scaled to ~6m displayed)

**Phase A — Plan (single-lane):**

1. Linear MCP: fetch all 6 issues with full metadata + comment threads.
2. Opus: triage. Score each issue on `clarity`, `scope`, `risk`. Output the 4/1/1 split shown in the plan screen.
3. Linear MCP: post a single planning comment on the cycle.

**Phase B — Auto-execute (4 lanes in parallel):**

For each of the 4 auto-execute issues, the lane runs:

- `linear` → mark `In Progress`, assign `cursor-agent`.
- `composer` → read affected files, write the patch.
- `figma` (only for `WEB-841`) → fetch the empty-state illustration variants, pick the one matching the existing design system.
- `shell` → tsc, lint, unit tests for the touched modules.
- `codex` → review the patch (cite specific concerns or none).
- `github` → branch, commit, push, open PR (auto-merge label if confidence ≥ 0.9).
- `linear` → transition `In Review`, link PR, drop a one-line summary.

**Phase C — Draft for human review (1 lane):**

- Same as auto-execute but PR is opened as `draft`, not labeled `auto-mergeable`. Linear comment explicitly says "left for human review because: <reason>".

**Phase D — Bounce back (1 lane, single agent):**

- `opus` → identify the missing acceptance criteria.
- `linear` → post a structured comment back to the PM with 3 clarifying questions, transition status to `Needs Specification`.
- `slack` → DM the PM with a one-liner.

**Phase E — Done:**

- Single `done` row summarizing: 4 PRs opened, 2 auto-merged behind flag, 2 awaiting human review, 1 PM clarification requested.

### The four artifact modals

All MacBook-framed.

1. **Linear issue detail (`linear-issue.tsx`)** — pixel-perfect Linear issue view for `WEB-851` (the CSV endpoint). Linear's chrome:
   - Top breadcrumb: `WEB / Cycle 47 / WEB-851`.
   - Title with priority chip and status pill.
   - Right rail: status, priority, assignee (`cursor-agent` avatar), labels, cycle, project, estimate.
   - Body: original description from the PM, then a thread:
     - PM's original comment.
     - **`cursor-agent`'s plan comment** (a clean structured plan with 4 bullets: spec read, files to touch, behind-flag rollout, test coverage).
     - **`cursor-agent`'s implementation comment** linking to PR, with a 4-line summary.
     - GitHub bot's "PR merged" comment.
   - Linear's signature gradient accent on the agent avatar; subtle "AI" badge.

2. **Cycle board (`cycle-board.tsx`)** — pixel-perfect Linear cycle board, after-state. All 6 cards in their final columns, with the `cursor-agent` avatar on the 4 it shipped.

3. **GitHub PR (`pr-modal.tsx`)** — wraps `github-pr-preview.tsx` in MacBook. PR for `WEB-851`. Title: `feat(WEB-851): /api/v2/exports CSV endpoint behind feature flag`. Body must include:
   - Linked Linear issue.
   - Behind-flag rollout plan.
   - CI checks all green.
   - "Auto-mergeable: confidence 0.94" badge in PR description.
   - Files changed: 3 (route, flag config, test).

4. **Spec-clarification reply (`spec-clarification.tsx`)** — pixel-perfect Linear comment view for the bounced issue. Show:
   - Original PM ticket (under-specified).
   - `cursor-agent`'s structured reply: 3 clarifying questions in markdown, plus a "What I'd do once these are answered" section showing the agent has thought it through but is correctly refusing to guess. This is the most differentiating artifact in the demo — a great agent that knows when to **stop**.

### Branding

- **Primary accent:** Linear purple/violet gradient `#5E6AD2 → #8B5CF6`. Use sparingly on CTAs and the cursor-agent avatar ring.
- **Status colors:** Linear's actual scheme (Backlog gray, Todo gray, In Progress yellow, In Review purple, Done green).
- **Typography:** Linear is Inter + a touch of mono. Match.
- **Vocabulary:** "issue" (not "ticket"), "cycle" (not "sprint"), "triage" (not "groom"), "labels" (not "tags"), "estimate", "project", "team".
- **Avoid:** Jira blue, Atlassian chrome. Linear is intentionally not Jira.

---

## 4. Files to create

```
src/app/partnerships/linear/page.tsx                                     NEW
src/app/partnerships/linear/demo/page.tsx                                NEW
src/app/api/linear-webhook/route.ts                                      NEW

src/components/linear-demo/inbox-board.tsx                               NEW (idle: Linear "My Issues" view + CTA)
src/components/linear-demo/grooming-overlay.tsx                          NEW (the brief "reviewing 6 issues…" indicator)
src/components/linear-demo/work-plan-page.tsx                            NEW (the full-screen plan takeover)
src/components/linear-demo/live-cycle-board.tsx                          NEW (split-screen left: live Kanban that ticks)
src/components/linear-demo/agent-console.tsx                             NEW (forked, parallel-lane support)
src/components/linear-demo/artifact-cards.tsx                            NEW
src/components/linear-demo/throughput-card.tsx                           NEW (idle-phase value card)
src/components/linear-demo/guardrails-panel.tsx                          NEW or reuse shared
src/components/linear-demo/artifacts/linear-issue.tsx                    NEW
src/components/linear-demo/artifacts/linear-modal.tsx                    NEW
src/components/linear-demo/artifacts/cycle-board.tsx                     NEW (after-state board, framed)
src/components/linear-demo/artifacts/cycle-board-modal.tsx               NEW
src/components/linear-demo/artifacts/spec-clarification.tsx              NEW (the "knows when to stop" artifact)
src/components/linear-demo/artifacts/spec-clarification-modal.tsx        NEW
src/components/linear-demo/artifacts/github-pr-preview.tsx               NEW (per-issue specific copy)
src/components/linear-demo/artifacts/pr-modal.tsx                        NEW

src/lib/demo/linear-cycle-fixture.ts                                     NEW (the 6-issue dataset)
scripts/reset-linear-demo.sh                                             NEW
```

**Also:**

- Add `Linear` to `src/lib/constants.ts`.
- Add `public/logos/linear.svg`.
- Update README.

---

## 5. Implementation order

1. Define the 6-issue fixture in `linear-cycle-fixture.ts`. **Do this first** — every component reads from it.
2. Scaffold the route with the four-phase state machine (`idle` → `planned` → `running` → `complete`).
3. Build the Linear inbox board. Spend real time on chrome fidelity. Linear users will instantly know if you cheated.
4. Build the work-plan takeover. The 4/1/1 visual is the demo's clearest articulation of "agent that knows its limits".
5. Build the live cycle board. The animated card movement across columns is the centerpiece — invest here.
6. Build the parallel-lane agent console. New mechanic; build it carefully and write a small dev fixture to test the lane-coloring before wiring it to the script.
7. Build the script. Get pacing right: the parallel lanes should *feel* parallel.
8. Artifacts in this order: GitHub PR (cheap), Cycle board (re-uses your live-board component), Linear issue (chrome-heavy), Spec clarification (high signal, must read like a real engineer wrote it).
9. Side content + webhook + reset.
10. Typecheck, walk through twice, screenshots.

---

## 6. Acceptance criteria

- `/partnerships/linear/demo` loads with the 6-issue inbox view.
- Clicking **Run weekly grooming** transitions through the planning overlay (~3s) into the work-plan page.
- Clicking **Watch Cursor work the queue** opens the split screen with synchronized cycle-board (left) and parallel-lane agent console (right).
- The console clearly shows 4 lanes interleaving by timestamp, with per-lane color bands.
- Issues physically move across the Kanban columns in lockstep with the script.
- All 4 artifacts open and look pixel-correct for Linear's chrome (especially the issue detail page).
- The "spec clarification" artifact reads like real PM-engineer dialogue, not a robot transcript.
- Reset returns to clean idle.
- `npx tsc --noEmit` and `npm run lint` pass.
- Twice-run identical playback.

---

## 7. Anti-patterns

- ❌ **Don't recolor a Jira modal and call it Linear.** Linear's chrome is genuinely different (rail layout, gradient accents, mono-leaning, far less padding). Pixel parity is non-negotiable for this demo's audience.
- ❌ **Don't make the agent ship all 6 issues.** The demo's most credible moment is when it **declines** to work two of them. That's the calibration story enterprises need to see.
- ❌ **Don't skip the spec-clarification artifact.** It's the differentiating artifact. Every other agent demo on the internet shows agents shipping; few show agents *correctly refusing*.
- ❌ **Don't cram all 4 parallel lanes into a single console column.** The visual mechanic of interleaved-but-clearly-parallel rows is what makes "4 agents at once" land.
- ❌ **Don't put the cycle board in a static after-state.** The movement of cards across columns is the demo's emotional payoff.

---

## 8. Webhook prompt (`buildAgentPrompt`)

Fork the shape of the Sentry/Datadog webhook. Required steps in order:

1. **Linear MCP intake.** Fetch the cycle, all open issues, all labels, all priorities, all comment threads.
2. **Plan.** Score every issue on `clarity`, `scope`, `risk`. Bucket into:
   - `auto-execute`: clarity ≥ 0.85, scope ≤ S, no schema changes, CI required.
   - `draft for review`: medium clarity OR medium scope OR touches sensitive areas.
   - `bounce`: clarity < 0.6 OR missing acceptance criteria.
3. **Spawn parallel sub-agents** (one per `auto-execute` issue). Each runs the standard scoped fix loop (read → patch → static verify → live verify → PR). Each PR must link the Linear issue and include a "behind feature flag if applicable" rollout plan.
4. **Draft sub-agent.** Same loop but PR opened as `draft` and labeled `human-review-required`.
5. **Bounce sub-agent.** Generate a structured 3-question clarifying comment, post it to the issue, transition status to `Needs Specification`, DM the PM in Slack with a 1-liner.
6. **Summarize.** Post a single cycle-level comment with the day's results.

The prompt must enforce: **never push to main**, **never auto-merge without the `auto-mergeable` label and CI green**, **always link Linear ↔ PR ↔ Slack**.
