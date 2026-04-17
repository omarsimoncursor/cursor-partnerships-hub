# AWS Journey — Interactive Modernization Story (v2)

> **Purpose of this document.** This is a complete, self-contained build brief for a new Cursor agent. You are building v2 of the AWS partner demo: a **7-act interactive story** at `/partnerships/aws/journey` that dramatizes a real Java EE → AWS Lambda + Aurora modernization with named human reviewers, explicit AI-gets-overridden moments, and environment-changing scene transitions. v1 lives at `/partnerships/aws/demo` and must be left untouched. Read this entire file before writing a line of code.

---

## 0. TL;DR for the implementing agent

Build a multi-stage, environment-changing narrative at `/partnerships/aws/journey` that takes the viewer through a realistic 22-calendar-day modernization of one bounded context (OrdersService) from a Java EE monolith to AWS Lambda + Aurora Serverless v2. **The viewer is an AWS sales rep or a customer architect.** They should finish the demo convinced that (a) Cursor can actually do this, (b) humans stay in the loop at the critical gates, and (c) the cadence is 5× faster than the GSI baseline — not 5,000×.

The demo is not a logstream. It is a **seven-scene journey** with distinct environments, persistent chrome, named characters, one scripted AI-override moment, and calendar/week visualizations that let the viewer *feel* the 22 days without having to read timestamps.

---

## 1. Why v2 exists — what's wrong with v1

v1 (`/partnerships/aws/demo`) built an honest 22-day timeline into a split-screen agent console with human review gates as row items. The problems with v1 that v2 must solve:

1. **Logstream, not story.** One screen, one direction. Everything is a text row scrolling into a console. The viewer watches a log; they don't travel anywhere.
2. **No characters.** The "4 human review gates" are bullet points with no authors. J. Park, M. Chen, R. Davis, S. Kim appear as signatures in artifact cards at the *end* — never during the work.
3. **No disagreement.** Every AI proposal is accepted. That's disqualifying to anyone who's run a migration. A single scripted AI-override moment is the highest-ROI credibility move we can make.
4. **Time as text.** `+1d 16:30` is a label, not an experience. 22 days compressed into 20 real seconds requires a visual metaphor, not a numeric stamp.

v2 replaces *every* one of these failures. v1 stays on the branch for comparison purposes and because AWS reps may still want the "fast" version as a 30-second teaser.

---

## 2. Ground truth

| Parameter                  | Value                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Branch                     | `partner-demos-aws-journey` from `origin/main` (clean cut, no rebase on v1)           |
| Route                      | `/partnerships/aws/journey`                                                           |
| v1 route (leave untouched) | `/partnerships/aws/demo`                                                              |
| Dev port                   | `3103` (`PORT=3103 npm run dev`) — same port v1 used                                  |
| Brand colors               | AWS orange `#FF9900`, squid-ink `#232F3E`, plus per-act accent palettes (see §7)      |
| Font stack                 | App default (Inter / system). No new font dependencies.                               |
| Reset script               | Reuse `scripts/reset-aws-demo.sh` — extend if any new seeded files are added          |
| Partnership page CTA       | `/partnerships/aws` hero gets a **second** CTA pill linking to `/journey` (keep v1's) |

Do **not** delete, rename, or modify any file under `src/components/aws-live-demo/`, `src/app/partnerships/aws/demo/`, `src/app/api/aws-assess/`, `src/app/api/aws-webhook/`, `src/lib/demo/legacy-monolith/`. v2 may *import from* `src/lib/demo/legacy-monolith/` (the Java EE source + reader) — everything else lives under a new `src/components/aws-journey/` folder.

---

## 3. The product, in one paragraph

The viewer lands on `/partnerships/aws/journey` and sees a dark, tense opening scene — the Monolith Room — with a CEO email, an outage post-mortem, a GSI quote, and an Oracle contract countdown clock. They click "Bring in Cursor" and the page **transitions** (scene change, not a tab flip) into the Atlas: a living dependency map where AI has mapped the 4.2M-LOC monolith and highlighted OrdersService as the right starting point. They click "Start with OrdersService" and the page transitions again into the Whiteboard, where AI draws an architecture and J. Park — a named Principal Architect with an avatar and a voice — **overrides AI on the dual-write window**. The viewer sees AI absorb the correction and redraw. They advance through the Build (split IDE), the Crucible (load test telemetry), the Cutover (mission control traffic dial), and finally the Portfolio (38-node graph showing the finish date vs. the Oracle contract expiry). A persistent story spine at the top shows where they are in the journey. A persistent stakes HUD at the bottom shows Oracle countdown, dollars saved, gates passed. At the end, the same four artifact modals from v1 (AWS Console, triage report, Jira, GitHub PR) are available as **receipts** — not as the main event.

---

## 4. Persistent chrome

Two components are fixed on screen across all seven acts:

### 4.1 Story spine (top)

Fixed at top of viewport, 48px tall, squid-ink background, AWS-orange active node.

```
●━━━━●━━━━●━━━━●━━━━●━━━━●━━━━●
Room  Atlas  Plan  Build  Crucible  Cutover  Portfolio
```

- 7 dots connected by rails. Current act's dot is AWS orange + larger + pulsing. Completed acts are filled squid-ink. Upcoming are hollow gray.
- Each dot is clickable to **jump back** to a completed act (forward jump disabled until unlocked).
- Label under each dot is 10px uppercase tracking-wide. Shrinks to icon-only below 768px.

### 4.2 Stakes HUD (bottom-right)

Fixed bottom-right, semi-translucent squid-ink card, 320px wide, updates live as the viewer advances.

```
Oracle contract      14mo 03d  [countdown ticks]
Pulled-forward ARR   $0  →  $11M  [animates during Act 3]
Run-cost swing       —  →  $6.3M/yr  [animates during Act 5]
Gates passed         0 / 4  [increments in Acts 3, 4, 5, 6]
```

- Countdown uses a real `setInterval` against a fixed target date (Dec 31, 2027). No server time.
- Dollar values animate when their originating act opens — use a short lerp (600ms, ease-out).
- On Act 7 the card grows to reveal a "Finish date: Feb 2028 · 10mo before expiry" footer.

---

## 5. Characters

Four named humans appear during the journey. Each has: name, role, 1-line bio, avatar image (generated — see §5.1), and a single scripted voice moment.

| Name       | Role                           | Bio                                                        | Where they appear                                                       |
| ---------- | ------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| J. Park    | Principal Architect (customer) | 12 yrs at Acme. Led the 2019 Oracle upgrade.               | Act 3 — **overrides AI** on dual-write window                           |
| M. Chen    | Security Engineering Lead      | Ex-AWS, CISSP. Owns Acme's IAM baseline.                   | Act 4 — approves Codex's automatic IAM + VPC flags (no override, agrees) |
| R. Davis   | FinOps Lead                    | AWS Financial Management certified. Cut \$4M/yr last year. | Act 5 — approves the provisioned-concurrency trade-off                   |
| S. Kim     | SRE Lead                       | On-call for the outage last Tuesday.                       | Act 6 — runs the cutover go/no-go checklist                              |

**Critical rule: exactly one AI-override moment.** Only J. Park (Act 3) overrides AI. M. Chen, R. Davis, S. Kim each have a character moment but they *agree* with AI or approve a trade-off. This keeps the story honest without making AI look perpetually wrong.

### 5.1 Avatar generation

Use the `GenerateImage` tool to produce four avatar PNGs. Save to `public/images/aws-journey/avatars/`:

- `park.png` — "Flat professional illustration portrait of a software architect in their 40s, Asian heritage, short dark hair, round tortoise-shell glasses, collared shirt in muted sage green, neutral warm-gray background with a faint whiteboard grid pattern, 3/4 angle, confident expression, corporate-illustration style similar to Notion or Linear marketing art, soft shading, no gradients, square 512x512"
- `chen.png` — "Flat professional illustration portrait of a security engineer in their 30s, East Asian heritage, shoulder-length black hair, dark rectangular glasses, black crew-neck top, neutral cool-gray background with a faint padlock-icon pattern, 3/4 angle, focused expression, corporate-illustration style similar to Notion or Linear marketing art, soft shading, no gradients, square 512x512"
- `davis.png` — "Flat professional illustration portrait of a finance operations leader in their 40s, Black heritage, close-cropped hair, no glasses, navy collared shirt, neutral blue-gray background with a faint line-chart pattern, 3/4 angle, warm confident expression, corporate-illustration style similar to Notion or Linear marketing art, soft shading, no gradients, square 512x512"
- `kim.png` — "Flat professional illustration portrait of a site reliability engineer in their 30s, Korean heritage, short dark hair, wireless earbuds visible, gray hoodie over collared shirt, neutral warm-gray background with a faint terminal-cursor pattern, 3/4 angle, calm focused expression, corporate-illustration style similar to Notion or Linear marketing art, soft shading, no gradients, square 512x512"

Generate all four in one turn if possible. Verify the images land and render on a test `<img>` before proceeding. If any image fails or looks off, regenerate once with a more specific prompt; if it still fails, fall back to initial-in-a-circle (two-letter monogram over an act-colored gradient) for that character only.

A shared `<Character>` component (`src/components/aws-journey/character.tsx`) takes a character key and renders: avatar (48px circle) + name + role + optional bio tooltip on hover. Used wherever a character speaks.

---

## 6. The seven acts

Each act is a full-viewport scene below the story spine and above the stakes HUD. Transitions between acts are **animated** — not route changes. The page stays at `/partnerships/aws/journey` the whole time; act state is a React state machine. Scene transitions use a 400–600ms crossfade + vertical pan (e.g., scene A slides up 16px as it fades out, scene B slides from 16px down as it fades in). No Next.js route nav.

Each act below is specified in this shape: **Goal · Visual · Content · AI moment · Human moment · Exit.**

### Act 1 — The Monolith Room (the problem)

- **Goal.** Make the stakes real. The viewer should feel the pressure the CTO is under.
- **Visual.** Dark squid-ink background (`#0F1521`). Red-orange accent (`#E55300`). Terminal-green for code snippets. Sparse layout, generous whitespace. No charts yet — this act is about tension.
- **Content.** Three cards arranged in a "wall" layout:
  1. **CEO email** (rendered as a Gmail-style card): From CEO, to VP Engineering, subject "Tuesday's outage — what's the plan?". Body: 3 short paragraphs ending "This cannot happen again. What's our modernization path?" Dated 6 days ago.
  2. **Incident post-mortem summary**: 4h 12m outage · \$1.2M missed orders · root cause "WebSphere thread-pool exhaustion under normal peak load — 3rd time in 18 months" · "Owner: nobody (OrdersService's last maintainer left in 2019)".
  3. **The GSI quote**: \$14M · 5 years · 40 consultants · "MAP-accelerated" · signed with red-lined "FINAL — signature needed by Dec 15" stamp.
- **Footer strip** above the CTA: "Oracle Database Enterprise Edition support ends **Dec 31, 2027.** 14 months and 3 days from today."
- **AI moment.** None yet. This is the problem scene.
- **Human moment.** None on screen; the CEO and the (absent) 2019 architect are present only by implication.
- **CTA (exits act).** A single large AWS-orange pill: "Bring in Cursor →". On click, the spine advances to Atlas and the scene transitions.

### Act 2 — The Atlas (discovery)

- **Goal.** Show what 3 calendar days of AI-powered discovery produces. Let the viewer explore the monolith themselves.
- **Visual.** Deep blue (`#0B1220`) background. Cyan accent (`#4DD4FF`). Data-dense. Monospace labels. A large central dependency map dominates; a narrow left rail shows AI's summary findings.
- **Content.**
  - **Left rail (AI findings panel)** — 5 rows, each with a small icon and a number:
    - `38` bounded contexts mapped
    - `8` boundary violations found
    - `17` orphaned cron jobs (no owner)
    - `4` dead-code subsystems (0 calls in 90d)
    - `3` tables with cross-context write contention
    - Under the rows: "Scanned by Cursor + AWS Knowledge MCP + Bedrock · 3 calendar days · $0 additional cost"
  - **Center (dependency map)** — an SVG force-directed graph of ~40 nodes (38 bounded contexts + 2 infra clusters). Nodes are sized by LOC. Colored by domain (orders, catalog, billing, identity, etc.). 5 edges glow red for boundary violations. One node — **OrdersService** — is highlighted with a pulsing AWS-orange ring.
  - Hovering a node shows a small popover: LOC · external callers · owner · tier · recommended modernization wave. (Use mock data from a seeded JSON.)
  - **Right panel** — a "Cursor's recommendation" card:
    - "**Start with OrdersService.**"
    - "Tier 0 · 63% of revenue flows through it · 180k LOC (only 4.3% of monolith) · 4 external callers · unblocks 6 downstream contexts · 2 active boundary violations (resolvable during extraction)."
    - "Highest ROI, lowest blast radius. Recommended starting context in 100% of comparable MAP engagements."
- **AI moment.** The whole scene is AI's output. Annotate each finding with "Cursor + AWS Knowledge MCP" footprint.
- **Human moment.** None — discovery is AI-dominant work. This is intentional.
- **CTA (exits act).** Button under the right panel: "Start with OrdersService →". On click, spine advances to Plan, stakes HUD animates "Pulled-forward ARR" from \$0 toward \$11M.

### Act 3 — The Whiteboard (the plan, with the AI override)

- **Goal.** Show AI authoring a full target architecture, then — critically — **being overridden by a named human**, then absorbing the correction visibly.
- **Visual.** Whiteboard aesthetic. Off-white (`#FAF8F3`) background with faint gray grid lines. Hand-drawn-style arrows (dashed, slightly wavy). Sticky notes in AWS orange, blue, and yellow. Architect-sketch font for handwritten annotations (use a lightweight cursive web font or style Inter italic with slight rotation). Keep main copy in Inter for legibility.
- **Calendar widget** (see §8.1) visible in the top-right corner, showing a mini page-flip animation from Day 1 through Day 3 as the scene loads.
- **Content.**
  - **Main area** — the architecture diagram, drawn in:
    - Legacy (left) → Gateway (center top) → Lambda Handlers (center) → Aurora Serverless v2 (center bottom) → Dual-write bridge (right, dashed arrows back to the legacy Oracle DB).
    - Labels: API Gateway (private), 6 Lambda functions named (createOrder, getOrder, listOrders, updateStatus, cancelOrder, reconcile), Aurora cluster `orders-prod`, Secrets Manager, VPC endpoints for S3 + Secrets Manager + CloudWatch Logs.
  - **Sticky note (AWS orange)**: "Strangler fig pattern. Route via API Gateway. Dual-write for **7 days**. Monolith keeps serving reads until parity verified."
  - **Sticky note (blue)**: "Target p99 < 400ms (current monolith p99: 1,240ms). Target cost: \$527/mo (current: \$70k/mo allocated)."
- **The override moment.** After 1.2s of the sticky notes settling, a Slack-style comment card slides in from the right edge over the whiteboard:
  ```
  [J. Park avatar] J. Park · Principal Architect · just now
  ─────────────────────────────────────────────
  Push back on the 7-day dual-write window.
  Last cutover (InventoryService, 2023) we rolled
  back on day 9 because a batch job only ran on
  the 1st and 15th of the month — didn't surface
  until after we'd cut over. 14-day minimum, and
  I want an automated parity diff that fails the
  cutover if drift > 0.01%.
  Ask Raj if you need the 2023 post-mortem.
  ```
- After 800ms, AI responds inline below J. Park's comment, with a small Cursor logo:
  ```
  Cursor · just now
  ─────────────────────────────────────────────
  Updating plan. Extending dual-write to 14 days
  and adding a parity-diff Lambda that runs every
  15 minutes against both DBs; cutover workflow
  will fail-closed on drift > 0.01%.

  Referenced 2023 InventoryService post-mortem
  (GitHub: acme/inventory-postmortem-2023-09).
  Cost impact: +$12/mo for parity-diff Lambda.
  Schedule impact: +7 calendar days.
  ```
- The AWS-orange sticky note animates — the "7 days" text crosses out, "14 days" writes in above it. A new sticky note appears: "Parity-diff Lambda · every 15min · fail-closed @ 0.01%".
- **Human moment.** J. Park's override. They remain visible on screen (avatar stays docked at the top-right of the whiteboard) until the scene exits.
- **AI moment.** Initial plan authorship + visible absorption of correction. This is the whole point of Act 3.
- **CTA (exits act).** "Approve architecture (gate 1/4) →". On click: stakes HUD "Gates passed" increments to 1/4. Calendar widget flips to Day 3. Scene transitions to Act 4.

### Act 4 — The Build (split IDE)

- **Goal.** Show Cursor Composer doing the actual code transform — Java EE to TypeScript Lambda + CDK — with concrete, legible moments. Codex reviews in the margin. M. Chen approves.
- **Visual.** Dark IDE-style (`#0D1117`). Gutter line numbers. Monaco-style syntax highlighting. Three horizontal panes: left = Java EE source, right = TS/CDK being authored, bottom = test runner terminal (30% height).
- **Calendar widget** visible top-right, animating Day 3 → Day 11.
- **Content.**
  - **Left pane** — `OrdersService.java` (read from `src/lib/demo/legacy-monolith/OrdersService.java`). Highlight specific lines as Composer operates on them (fade a yellow flag on the gutter for ~1.2s, then move on).
  - **Right pane** — a new file `orders-stack.ts` (CDK) authors itself top-down. Chars appear in bursts of 8–20. Total ~80 lines. Focus on concrete moments:
    1. **Line 14** (~2s after scene open): `// @Stateless @EJB OrdersServiceBean → Lambda handler factory` comment writes in.
    2. **Line 22**: a `new lambda.Function(this, 'CreateOrderFn', ...)` block writes in; left pane highlights `@Stateless public class OrdersServiceBean`.
    3. **Line 34**: `// REF_CURSOR Oracle PL/SQL → Postgres procedure` comment; a `orders.createOrderProc` SQL file referenced.
    4. **Line 48**: a `new rds.DatabaseCluster(this, 'Orders', { engine: rds.DatabaseClusterEngine.auroraPostgres(...), serverlessV2MinCapacity: 0.5, serverlessV2MaxCapacity: 4 })` block writes in.
    5. **Line 62**: a Secrets Manager secret + IAM role-statement.
  - **Bottom pane (terminal)** — at ~7s, an integration-test run starts, and 47 tests tick green one by one (one every ~180ms; at test 23, fail briefly, AI patches, retry passes — adds realism).
  - **Codex review margin** — at ~11s, 2 Codex comments appear on the right pane, each on a specific line:
    - Line 62: "`iam.PolicyStatement` allows `dynamodb:*` on the whole table family. Scope to `arn:aws:dynamodb:*:*:table/orders-prod` only. Auto-patching…"
    - Line 48: "Aurora cluster has no VPC endpoint for Secrets Manager — routes via NAT. Add `ec2.InterfaceVpcEndpoint` for SecretsManager + RDS. Auto-patching…"
  - Both patches apply (animate the relevant lines) within ~2s.
- **M. Chen moment.** After patches, a comment card slides in from the right:
  ```
  [M. Chen avatar] M. Chen · Security Engineering Lead · just now
  ─────────────────────────────────────────────
  Both Codex catches match our IAM baseline and
  VPC pattern (CIS AWS Foundations §3.1, §4.2).
  Approved. Also running Access Analyzer on the
  staging deploy — expect 0 findings.
  ```
  Access Analyzer tile animates with "0 over-privileged · 0 public · least-priv ✓".
- **AI moment.** The whole Composer edit + Codex auto-patches.
- **Human moment.** M. Chen agreeing with Codex and citing the CIS Benchmark controls. **Not an override** — an approval with grounded reasoning.
- **CTA (exits act).** "Approve security (gate 2/4) →". Gates 2/4. Calendar flips to Day 11. Scene transitions to Act 5.

### Act 5 — The Crucible (staging + load test)

- **Goal.** Show the system under stress. Surface a real trade-off (cold starts vs. cost). R. Davis decides.
- **Visual.** Dark ops-center (`#060A12`). Cyan + red alert accents. Live-animating sparklines. A big traffic-ramp gauge in the center.
- **Week-bar widget** (see §8.2) replaces the calendar widget, top-right. Scene opens on Day 11 of a 7-day staging window (Days 11–17). Week bar visualizes progress.
- **Content.**
  - **Top strip** — 4 metric tiles, live-animating:
    - p99 latency (ms): start 340, ends stable around 350. Turn red briefly at the cold-start spike.
    - Invocations/hr: 0 → 12,000 ramping over scene.
    - Error rate: 0.00% flat.
    - Aurora ACU: 0.5 → 2.8 → 1.4.
  - **Center** — a load-test traffic dial rising 0 → 12,000 rps over ~8s of real time. A k6 terminal at the bottom echoes `checks: 100.00% · http_req_duration: avg=87ms, p(95)=245ms, p(99)=342ms`.
  - **The cold-start spike.** At ~6s into scene, p99 latency tile spikes to 1,140ms for ~2s. A Cursor alert banner appears:
    ```
    Cursor · cold-start spike detected (11.8k rps, p99 1.14s)
    Proposal: enable provisioned concurrency on CreateOrderFn (2 instances)
    Impact: +$180/mo · p99 steady-state stays under 400ms
    ```
- **R. Davis moment.** Card slides in:
  ```
  [R. Davis avatar] R. Davis · FinOps Lead · just now
  ─────────────────────────────────────────────
  $180/mo against $47k/hr in downtime risk —
  approve. Flagging CreateOrderFn in the
  Compute Optimizer dashboard so we revisit
  post-hypercare.
  ```
- p99 latency tile drops back to 350ms after the alert resolves. Stakes HUD "Run-cost swing" animates from 0 toward \$6.3M/yr.
- **AI moment.** Detected the spike, proposed the fix with a cost delta, surfaced the trade-off honestly.
- **Human moment.** R. Davis makes the call with grounded reasoning (downtime cost > \$180/mo).
- **CTA (exits act).** "Approve FinOps trade-off (gate 3/4) →". Gates 3/4. Week bar fills to Day 17. Scene transitions to Act 6.

### Act 6 — The Cutover (mission control)

- **Goal.** Make the cutover feel like a real production event. Show the runbook ticking. Show S. Kim's go/no-go.
- **Visual.** Mission-control aesthetic. Near-black background. AWS-orange accent for the traffic dial. Green/red lights for health checks. Monospace labels.
- **Week-bar widget** at top-right, Days 17–21.
- **Content.**
  - **Center** — large circular traffic-dial gauge. Shows percent of production traffic on the new Lambda path. Animates 0% → 1% → 10% → 50% → 100% across ~12s of real time (displayed calendar: Days 17 → 18 → 19 → 20 → 21, one advance per click on "Next canary step" or automatic on a 3s tick).
  - **Left rail — cutover runbook.** 12 checklist items, ticking green as traffic advances. Examples:
    - ☑ Pre-cutover: parity-diff report clean (0 drift over 14d)
    - ☑ Pre-cutover: load test at 12k rps passed
    - ☑ Canary 1%: p99 steady, error rate 0.00%
    - ☑ Canary 10%: Aurora ACU 1.2, within headroom
    - ☑ Canary 50%: dual-write bridge under 10ms lag
    - ☑ 100% live: monolith OrdersService decommissioned
    - ☑ Dual-write window: closed Day 21, drift 0.003%
    - ☑ Hyper-care window: 48h, 0 P1, 0 P2
  - **Right rail — CloudWatch live tiles.** p99: 340ms. Errors: 0. Invocations: 12.8k/hr. Aurora ACU: 0.62.
- **S. Kim moment.** Before the dial starts moving, card slides in:
  ```
  [S. Kim avatar] S. Kim · SRE Lead · just now
  ─────────────────────────────────────────────
  Runbook clean. Parity report green for 14
  straight days. Go for 1% canary. I'll hold
  the rollback lever until we're past 50% and
  the monolith path is cold.
  ```
- At 100%, S. Kim returns: "Cutover complete. Monolith OrdersService cold since 14:02 UTC. Hyper-care closes in 48h."
- **AI moment.** Runs the checklist, surfaces the metrics, executes the traffic shifts.
- **Human moment.** S. Kim runs the gate. No override, but a felt, human hand on the rollback lever.
- **CTA (exits act).** "Approve cutover (gate 4/4) →". Gates 4/4. Scene transitions to Act 7.

### Act 7 — The Portfolio (the future)

- **Goal.** Pull the camera back. Show the win, show what remains, close with the Oracle-contract punchline.
- **Visual.** Bright (`#FAFBFC` → `#EEF2F6` gradient). Forward-looking. AWS orange for the completed context. Muted grayscale for upcoming waves, colored by wave number.
- **Content.**
  - **Top strip — the close.** One big headline:
    ```
    OrdersService live on AWS · 22 calendar days · 4 / 4 gates passed
    Oracle contract expires Dec 31, 2027.
    At this cadence, you finish Feb 15, 2028.
    You're 10 months ahead of the deadline.
    At the GSI's cadence, you finish May 2030. 30 months late.
    ```
  - **Center — portfolio graph.** All 38 bounded contexts as nodes. OrdersService is green (done). 37 remain, colored by wave: Wave 1 (4, AWS-orange), Wave 2 (9, blue), Wave 3 (14, purple), Wave 4 (11, gray).
  - **Right panel — "What happens next"**:
    - Wave 1 starts Day 23: 4 contexts × ~22 days parallelized = ~30 days.
    - Wave 2 starts Day 53: 9 contexts parallelized across 3 pods = ~70 days.
    - Wave 3 starts Day 123: the long tail.
    - Wave 4 Q4 2027: the final stragglers.
    - "Projected portfolio finish: Feb 15, 2028. 10 months before Oracle support expires."
  - **Artifact receipts strip (bottom).** Four buttons — one per v1 artifact modal: AWS Console · Triage report · Jira · GitHub PR. Open as modals. These are the same components as v1 but imported/reused from `src/components/aws-live-demo/artifacts/` (don't duplicate).
- **AI moment.** The whole act is AI-projected portfolio math.
- **Human moment.** None explicit; the story is done. The four characters appear as small avatar stack at the bottom with "Reviewed by: J. Park · M. Chen · R. Davis · S. Kim" — a quiet curtain call.
- **CTAs (final).** Three pills at the bottom, side by side:
  - "Start your own assessment" (anchor-scrolls to a contact form or links `/partnerships/aws`)
  - "Talk to your AWS rep" (opens mailto with a prefilled subject)
  - "Replay the story" (resets to Act 1, keeps acts unlocked for jump-around)

---

## 7. Per-act color + typography system

Each act has a distinct palette. Define in `src/components/aws-journey/acts/act-theme.ts`:

| Act        | BG                 | Primary accent | Secondary accent | Text             | Mood          |
| ---------- | ------------------ | -------------- | ---------------- | ---------------- | ------------- |
| 1 Room     | `#0F1521`          | `#E55300`      | `#9CA3AF`        | `#F3F4F6`        | tense, dark   |
| 2 Atlas    | `#0B1220`          | `#4DD4FF`      | `#FF9900`        | `#E5E7EB`        | exploratory   |
| 3 Whiteboard | `#FAF8F3`        | `#FF9900`      | `#2563EB`        | `#111827`        | sketchy, warm |
| 4 Build    | `#0D1117`          | `#FF9900`      | `#7EE787`        | `#E6EDF3`        | IDE           |
| 5 Crucible | `#060A12`          | `#4DD4FF`      | `#EF4444`        | `#F3F4F6`        | ops, tense    |
| 6 Cutover  | `#030712`          | `#FF9900`      | `#10B981`        | `#F9FAFB`        | mission-control |
| 7 Portfolio | `#FAFBFC → #EEF2F6` | `#FF9900`     | `#16A34A`        | `#0F172A`        | bright, forward |

Typography is constant (app's Inter stack). Act 3 adds `font-style: italic; letter-spacing: 0.02em;` for sticky-note copy to simulate handwritten labels (cheap, effective).

---

## 8. Visual time widgets

### 8.1 Calendar widget (Acts 3–4)

Component: `src/components/aws-journey/time/calendar-widget.tsx`. Renders a small (140px wide) calendar page showing the current displayed date (e.g., "Day 3 · Oct 19, 2026"). On `onAdvance(nDays)`, plays a **page-flip animation**: the current page rotates on its Y-axis 180° with a slight curl, revealing the new date. Stack of "past pages" slightly visible behind the current page grows as days pass. Uses plain CSS transforms; no lib.

Accepts props: `currentDay: number`, `targetDay: number`, `startDate: Date`, `animateTo(day: number): void`. Animate duration per day ≈ 90ms so a 7-day flip takes ~600ms.

### 8.2 Week-bar widget (Acts 5–6)

Component: `src/components/aws-journey/time/week-bar-widget.tsx`. A horizontal bar divided into 7 segments (one per calendar day of the scene's window). Filled segments = elapsed days (AWS-orange). Current day = a vertical pulse marker. Label above: "Staging: Day 3 of 7" or "Cutover: Day 2 of 5". Used in Acts 5 (Days 11–17) and 6 (Days 17–21).

Accepts props: `startDay`, `endDay`, `currentDay`. No lib.

---

## 9. File layout

Create exactly these files. Do not create additional abstractions or utility layers unless a second component genuinely needs them.

```
src/app/partnerships/aws/journey/
├── page.tsx                          # top-level route; hosts state machine + spine + HUD + act renderer
└── layout.tsx                        # optional; only if spine/HUD rendering requires it

src/components/aws-journey/
├── story-spine.tsx                   # persistent top spine
├── stakes-hud.tsx                    # persistent bottom-right HUD
├── character.tsx                     # <Character name="park" /> → avatar + name + role + tooltip
├── override-card.tsx                 # the sliding comment card pattern (Slack-style)
├── act-transition.tsx                # wrapper that crossfades children on act change
├── acts/
│   ├── act-theme.ts                  # palette constants per act
│   ├── act-1-room.tsx                # Monolith Room
│   ├── act-2-atlas.tsx               # dependency map + AI findings
│   ├── act-3-whiteboard.tsx          # plan + J. Park override
│   ├── act-4-build.tsx               # split IDE + Codex + M. Chen
│   ├── act-5-crucible.tsx            # load test + R. Davis
│   ├── act-6-cutover.tsx             # mission control + S. Kim
│   └── act-7-portfolio.tsx           # future graph + artifact receipts
├── time/
│   ├── calendar-widget.tsx
│   └── week-bar-widget.tsx
└── data/
    ├── characters.ts                 # name, role, bio, avatar path per char
    ├── bounded-contexts.ts           # 38-node list for Acts 2 and 7
    ├── runbook.ts                    # 12-item cutover runbook for Act 6
    └── script.ts                     # timing constants, step delays, scripted text

public/images/aws-journey/avatars/
├── park.png
├── chen.png
├── davis.png
└── kim.png
```

Reused from v1 (import, do not copy):

```
src/components/aws-live-demo/artifacts/aws-console.tsx
src/components/aws-live-demo/artifacts/triage-report.tsx
src/components/aws-live-demo/artifacts/jira-ticket.tsx
src/components/aws-live-demo/artifacts/github-pr-preview.tsx
src/lib/demo/legacy-monolith/*                 # Java EE source files used in Act 4
```

No new API routes. The whole journey is client-state only. (If an integration with the existing `/api/aws-assess/run` would enrich Act 2's "3 calendar days of discovery" framing — e.g., showing a brief spinner that really hits the API before the Atlas reveals — do that; otherwise skip.)

---

## 10. State machine

Single top-level state at `src/app/partnerships/aws/journey/page.tsx`:

```ts
type Act = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type GateIdx = 0 | 1 | 2 | 3 | 4;
interface JourneyState {
  currentAct: Act;
  unlockedActs: Set<Act>;    // max completed + 1
  gatesPassed: GateIdx;      // increments at Acts 3, 4, 5, 6 exits
  startedAt: Date;
}
```

Transitions:

- Each act's exit CTA calls `advanceTo(act + 1)`. This:
  1. Adds the new act to `unlockedActs`.
  2. If the exiting act is 3/4/5/6, increments `gatesPassed`.
  3. Sets `currentAct = act + 1`.
- Spine clicks on an unlocked act call `jumpTo(act)` — sets `currentAct`, does NOT re-increment gates. (Gates already counted.)
- Act 7's "Replay the story" resets `currentAct = 1`, `gatesPassed = 0`, `unlockedActs = {1}` (keep avatars etc. warm).

Persist nothing. Refresh resets to Act 1. This is a linear demo, not an app.

---

## 11. Reset script

No new files are seeded by the journey demo — it doesn't modify any on-disk state. The existing `scripts/reset-aws-demo.sh` handles the legacy files imported by Act 4 and already works for v1; leave it alone. **Do not add anything to it.**

---

## 12. Partnership page integration

Modify `src/app/partnerships/aws/page.tsx` **minimally**: in the hero, next to v1's "Run the live modernization demo" CTA pill, add a second pill linking to `/partnerships/aws/journey` labeled "Walk the modernization journey". Match the orange styling but make it slightly different visually so the two CTAs don't look accidentally duplicated — e.g., outline variant vs. filled variant.

Do not touch anything else on that page.

---

## 13. Acceptance criteria

Before opening the PR, verify each of these manually on `http://localhost:3103/partnerships/aws/journey`:

- [ ] Story spine renders with 7 dots, current dot is AWS orange + pulsing, only Act 1 is clickable on load
- [ ] Stakes HUD visible bottom-right; Oracle countdown ticks in real time; other values start at 0/—
- [ ] Act 1 shows all three cards (CEO email, post-mortem, GSI quote) + Oracle-contract footer strip
- [ ] "Bring in Cursor" transitions to Act 2 with a visible crossfade
- [ ] Act 2 shows the 5 findings + dependency map with OrdersService pulsing orange; hover on a node shows popover; right panel recommends OrdersService
- [ ] "Start with OrdersService" transitions to Act 3; HUD "Pulled-forward ARR" animates toward \$11M
- [ ] Act 3 shows the whiteboard, 2 sticky notes, the dashed arrows; calendar widget top-right shows Day 1 → Day 3
- [ ] At ~1.2s into Act 3, J. Park's override card slides in from the right with the avatar + full dialog text
- [ ] At ~2s later, AI response slides in below, the "7 days" sticky note crosses out, "14 days" replaces it, parity-diff sticky appears
- [ ] "Approve architecture (gate 1/4)" increments HUD Gates to 1/4 and transitions to Act 4
- [ ] Act 4 shows left Java EE pane, right CDK pane writing itself top-down (~8s total), bottom terminal running 47 tests (one fail + retry)
- [ ] 2 Codex margin comments appear on lines 62 and 48; both auto-patches animate
- [ ] M. Chen's approval card slides in after patches complete
- [ ] Gates → 2/4, Calendar flips to Day 11, transitions to Act 5
- [ ] Act 5 shows live-animating metric tiles, traffic dial ramping, cold-start spike at ~6s, R. Davis approval
- [ ] Gates → 3/4, Week bar visible top-right, transitions to Act 6
- [ ] Act 6 shows runbook checklist ticking green, traffic dial 0→100%, S. Kim before + after messages
- [ ] Gates → 4/4, transitions to Act 7
- [ ] Act 7 shows the close headline, 38-node portfolio graph (1 green, 37 by-wave), 4 artifact modal buttons, character curtain call, 3 final CTAs
- [ ] Artifact modals open correctly and are the same v1 components (AWS Console, triage, Jira, PR)
- [ ] Spine back-jump works: click Act 2 from Act 5, lands on Act 2 without losing gate count
- [ ] "Replay the story" resets to Act 1 with gates back to 0
- [ ] `/partnerships/aws` hero shows both CTA pills; both navigate correctly
- [ ] `/partnerships/aws/demo` (v1) still works unchanged
- [ ] `npx tsc --noEmit` passes clean
- [ ] Desktop layout (1440px) looks correct; mobile/tablet (768px) degrades reasonably — spine becomes icons, HUD collapses to a single line

---

## 14. Kickoff sequence (for the implementing agent)

Execute in this order:

1. **Branch off main.** `git fetch origin && git checkout -b partner-demos-aws-journey origin/main`. Do **not** branch off `partner-demos-aws` (v1's branch) — we want a clean PR.
2. **Preserve this spec as the first commit.** The file `docs/partner-demos/aws-journey.md` is already present in the working tree (untracked — it travels across branches). `git add docs/partner-demos/aws-journey.md && git commit -m "docs(aws): add journey v2 build spec"`.
3. **Generate the four avatars.** Use `GenerateImage` with the four prompts in §5.1. Save to `public/images/aws-journey/avatars/`. Verify each renders in a browser `<img>` before continuing. Commit.
4. **Build the chrome.** Story spine + stakes HUD + act transition wrapper + character component + override card pattern. Stand them up in an empty `/partnerships/aws/journey/page.tsx` that renders placeholder acts 1–7 (just act name + number). Verify spine navigation + HUD ticking. Commit.
5. **Build acts in order: 1 → 7.** One commit per act. After each act, click through it on `http://localhost:3103` and screenshot for your own verification. Each act should be complete — content, styling, animation, character moments — before moving to the next.
6. **Wire the partnership page CTA** (minimal change, §12). Commit.
7. **Run the full acceptance checklist** (§13). Fix anything that fails.
8. **Run `npx tsc --noEmit`.** Fix all new errors. Do not touch v1 files.
9. **Open the PR.** Base `main`, head `partner-demos-aws-journey`, draft, title `feat: AWS journey — interactive modernization story (v2 demo)`. Body should:
   - Link to `/partnerships/aws/demo` (v1) and `/partnerships/aws/journey` (v2) in the preview.
   - List the 7 acts with a screenshot of each (use the browser MCP to capture).
   - Call out the single override moment (Act 3) and explain the design rationale in 2–3 sentences.
   - Include the full acceptance checklist for the reviewer to tick.

**Do not** delete v1. **Do not** merge v1's branch into this one. **Do not** modify anything under `src/components/aws-live-demo/` except to import the four artifact components from Act 7.

---

## 15. Things that are out of scope for this build

- Real API work (no new routes needed; the v1 `/api/aws-assess/run` may be optionally called from Act 2 but the journey works fully client-side).
- A11y keyboard navigation for spine (add `role="button"` + `tabIndex={0}` + Enter/Space handlers — that's it; don't build a full a11y audit).
- Analytics instrumentation.
- Internationalization.
- Tests. This is a demo page; one manual walkthrough per act + typecheck is the test plan.
- Real video of characters speaking. Avatars + text dialog only.
- A real 3D force-directed graph in Act 2 — SVG force layout is fine. If you need a minimal helper, `d3-force` is already a common choice but check the package.json first; if it's not there, hand-roll a simple radial layout. Do not add heavy deps.

---

## 16. Quality bar

When a senior AWS SA and a customer architect watch this demo back-to-back with the Snowflake and Databricks demos on the same page, they should be able to say:

- "That's actually what the work looks like."
- "That's actually what the review cadence feels like."
- "The AI got overridden once. Good. That's more honest than the other two."
- "I'd send this to my CTO."

If any of those four sentences doesn't feel earned by the final build, the demo isn't done. Iterate.
