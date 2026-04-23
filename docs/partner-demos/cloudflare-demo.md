# Cloudflare Live Edge-Threat Auto-Mitigation Demo — Build Brief

> **Purpose of this document:** Self-contained spec for a new Cursor agent to build an interactive demo at `/partnerships/cloudflare/demo`. Patterned on the existing Sentry/Datadog demos but with a different "AHA" angle — this is a **security + edge-platform** story: a credential-stuffing attack hits the edge, Cursor reads Cloudflare's signal, ships a WAF rule + a code-side rate-limit + a Worker patch, all in under three minutes.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Cloudflare + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/cloudflare/demo`. The hero is a real-time-feeling **Cloudflare Analytics dashboard** for `acme-app.com`. Traffic looks normal: 12k req/s, 99.4% cache hit, low error rate, a quiet world map with the usual hotspots.
2. The user clicks **"Simulate credential-stuffing wave"**. The dashboard animates over ~5 seconds — req/s spikes from 12k to 84k, a cluster of source IPs from a single ASN lights up red on the world map, the `/api/auth/login` endpoint sees a 412× spike, error rate climbs, the Bot Score histogram shifts hard left.
3. The screen pivots to a full-screen takeover: **Cloudflare attack-detail view** ("Credential-stuffing attack in progress · ASN 14618 · 4.3M auth attempts in 90s · 0.4% success rate"). Two CTAs: **`Watch Cursor mitigate`** and **`Reset`**.
4. The user clicks **Watch Cursor mitigate**. Split screen: live Cloudflare dashboard on the left (the spike subsides in real time as mitigations land), agent console on the right.
5. The agent: reads the attack signal via Cloudflare MCP (Analytics + Logpush + Bot Management), correlates source IPs against threat intel, drafts a 3-layer mitigation plan, applies a **WAF custom rule** via Cloudflare API, ships a **Worker-side rate-limit patch** as a PR (deployed via Wrangler), updates the **app-side credential-stuffing detector** as a PR, and posts a Statuspage update. Each layer's effect is visible on the live dashboard within seconds.
6. When complete, four artifacts are clickable: **Cloudflare attack-detail view (with the auto-applied mitigations annotated)**, **WAF rule diff**, **Worker rate-limit PR**, and **Postmortem**.
7. Reset returns to clean state. `scripts/reset-cloudflare-demo.sh` re-seeds the simulated attack.

**The "AHA":** *"Cursor stopped a credential-stuffing attack faster than my SOC noticed it."* Security and platform buyers immediately get it: Cursor is the **action layer** Cloudflare's signal layer has needed.

---

## 1. Why this demo, why this angle

Cloudflare's enterprise pitch is "sees the whole internet." The corresponding Cursor pitch is "acts on what Cloudflare sees." Three reasons for the credential-stuffing scenario:

- **Visceral and visual.** A traffic graph spike + a world-map lit up red is the most immediately legible enterprise threat, even to non-security execs.
- **Three-layer mitigation = real expertise.** A toy demo would just block an IP. A credible demo applies a WAF rule (immediate), a Worker rate-limit (next-request), AND a code-side detector improvement (long-term). This shows Cursor can reason across edge config and application code in a single workflow.
- **No overlap with PD/Datadog.** The trigger isn't an SLO breach or a runtime crash — it's an attack pattern. The mitigations aren't reverts or perf fixes — they're security controls.

---

## 2. Required reading

- `src/app/partnerships/datadog/demo/page.tsx` — closest existing pattern. Fork.
- `src/components/datadog-demo/agent-console.tsx` — fork for the console.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — pixel-perfect external-tool UI pattern. Match the fidelity for the Cloudflare dashboard.
- `src/components/sentry-demo/artifacts/macbook-frame.tsx` — promote/share if not done.
- `src/components/sentry-demo/artifacts/github-pr-preview.tsx` — PR pattern.

---

## 3. The demo — concept & story

### Trigger UI (idle phase)

A pixel-perfect **Cloudflare Analytics dashboard** for `acme-app.com`:

- Top nav: Cloudflare logo (orange `#F38020`), org/zone selector, search.
- Header tabs: `Overview · Security · Caching · Workers · Logs · Bots`.
- Default tab = **Overview**. Components:
  - Big `Requests / Cached / Uncached` line chart (last 30 min, normal-looking).
  - `Status codes` stacked bar chart (mostly 2xx).
  - `Top countries` table.
  - `Top user agents` table.
  - `Bot score` histogram (looks normal — most traffic is human).
  - Zone-level summary cards: `Requests · 12k/s`, `Bandwidth · 480 Mbps`, `Cache hit · 99.4%`, `Threats blocked · 412 (last hr)`.
- World map widget (centerpiece): subtle orange dots on US/EU/JP, gentle pulse animation. Realistic feeling.
- Bottom-right floating CTA: `[ Simulate credential-stuffing wave ]`.

Below the fold:

- **Mitigation-time comparison card** (analog of `latency-comparison.tsx`):
  - Without Cursor: SOC paged at T+8min → triage 12min → first WAF rule deployed T+24min → app-side fix shipped T+3 days.
  - With Cursor: Cloudflare signal at T+0 → first WAF rule live T+45s → Worker rate-limit live T+90s → app-side PR T+2m 30s.
  - Subhead: "First mitigation in <1 minute. Three defense layers in under 3."
- **Guardrails panel** specific to Cloudflare/security:
  - "WAF rules deploy as `Log` mode for 60 seconds before promoting to `Block`. Auto-rollback if false-positive rate exceeds threshold."
  - "Worker patches deploy to canary route first; promoted only after error budget unaffected."
  - "Agent never blocks an entire ASN without human approval."
  - "All actions logged to SIEM (Cloudflare Logpush → S3 → SIEM)."
  - "Human-in-the-loop required for any rule scoped to entire countries or ASNs."

### The attack (error-equivalent phase)

When the user clicks **Simulate credential-stuffing wave**, animate the dashboard for ~5 seconds:

- Req/s line shoots from 12k to 84k.
- Bot score histogram shifts hard left (most new traffic = high-bot-likelihood).
- World map: dozens of new red dots cluster around a single region; the dots pulse aggressively.
- A new red banner appears at the top: `Active threat detected · Bot Management score < 5 on 87% of new traffic · ASN 14618`.
- Status codes: 4xx and 5xx surge for `/api/auth/login`.

Then pivot to a full-screen **Cloudflare Security takeover**:

- Top: Cloudflare orange logo, "Active Attack" red pill.
- Big header: `Credential-stuffing attack in progress`.
- Subline: `Target: /api/auth/login · Source: ASN 14618 · 4.3M auth attempts in last 90s · 0.4% success rate · Top user-agent: curl/7.81.0`.
- Body grid:
  - Left: attack signal — bot-score histogram, request-rate spark, top source IPs (10 rows).
  - Middle: blast-radius indicator — `12 customer accounts now in lockout · 3 customer-success tickets opened`.
  - Right: defense-status panel showing 0 mitigations applied yet (WAF: default rules only, Bot Management: scoring but not blocking, Rate limiting: at default 100 req/s/IP).
- CTAs at bottom: **`[ Watch Cursor mitigate ]`** (primary, orange) and **`[ Reset ]`**.

### The orchestration (running phase)

Split screen:

- **Left:** the **live Cloudflare dashboard** (back to the Overview tab), with the attack still in progress. As the agent applies mitigations, you can *see* the dashboard respond:
  - WAF rule deploys → req/s drops by ~40% within 5 seconds (the bot traffic gets blocked at the edge).
  - Worker rate-limit deploys → req/s drops further; the remaining attack traffic gets 429s.
  - App-side detector PR — this one doesn't move the dashboard immediately; show a "Pending deploy after PR merge" annotation.
  - World map: the red cluster gradually fades to amber, then green, as the WAF rule absorbs the traffic.
  - A new "Mitigation timeline" panel appears in the dashboard chrome, ticking new entries as the agent acts.
- **Right:** scripted agent console.

### Channels

| Channel        | Label                | Hex accent | Role                                              |
| -------------- | -------------------- | ---------- | ------------------------------------------------- |
| `cloudflare`   | `cloudflare-mcp`     | `#F38020`  | Read analytics, deploy WAF rule, deploy Worker    |
| `threatintel`  | `threat-intel-mcp`   | `#7F1D1D`  | Cross-reference source IPs/ASN against intel      |
| `github`       | `github-mcp`         | (white)    | Branch + PRs (Worker + app-side)                  |
| `wrangler`     | `wrangler · deploy`  | `#FFAE6B`  | Cloudflare Workers deploys                        |
| `statuspage`   | `statuspage-mcp`     | `#3DB46D`  | Public update                                     |
| `slack`        | `slack-mcp`          | `#4A154B`  | `#sec-ops` channel update                         |
| `siem`         | `siem-mcp`           | `#0F172A`  | Audit-trail entries                               |
| `opus`         | `opus · plan`        | `#D97757`  | Decide the 3-layer mitigation                     |
| `composer`     | `composer · patch`   | blue       | Generate WAF rule + Worker patch + app-side patch |
| `codex`        | `codex · review`     | `#10a37f`  | Review each patch                                 |
| `shell`        | `shell`              | green      | tsc, lint, dev verify                             |
| `done`         | `complete`           | green      | Terminal step                                     |

### Target script arc (~30 steps, ~22s real, scaled to ~3m displayed)

1. **Intake (cloudflare):** Fetch Analytics for the spike window, fetch Bot Management scores, fetch Logpush for `/api/auth/login` failures, fetch top source IPs/ASN.
2. **Threat intel correlation (threatintel):** Score the offending ASN against known credential-stuffing botnets. ("ASN 14618 known credential-stuffing infra · 87% confidence.")
3. **Plan (opus):** Three-layer plan with cited rationale:
   - Layer 1 (immediate, edge): WAF custom rule blocking the matching ASN + user-agent on `/api/auth/login` only. Deploy in `Log` mode for 60s.
   - Layer 2 (next-request, edge): Tighten Worker-side rate limit on `/api/auth/login` from 100 → 5 req/min/IP for any IP whose Bot Management score < 5.
   - Layer 3 (long-term, app): Add account-level lockout for sustained failed attempts; add per-user CAPTCHA on suspicious-IP signals.
4. **Composer · WAF rule (composer):** Generate the WAF rule expression. Show the actual Cloudflare-rule syntax in the console.
5. **Codex review:** Confirm the rule is narrowly scoped to one endpoint + one ASN + one UA. Confirm no broad blocking.
6. **Cloudflare deploy (cloudflare):** Deploy WAF rule in Log mode. ✓
7. **Wait + verify:** Poll Analytics for 10s. False-positive rate = 0%. (Show this row prominently — this is the guardrail.)
8. **Cloudflare promote (cloudflare):** Promote rule to Block. The dashboard left-panel shows req/s drop by ~40% within seconds.
9. **Composer · Worker patch:** Patch the Worker (`workers/auth-rate-limit.ts`) to tighten the rate limit. Push to a new branch.
10. **Shell verify:** `wrangler deploy --env preview`. Hit the preview URL with a load script. ✓
11. **Wrangler deploy:** `wrangler deploy --env production`. The dashboard's req/s drops further.
12. **Composer · app-side patch:** Open a PR adjusting the credential-stuffing detector + lockout policy. Don't auto-merge — flag for security-team review.
13. **Codex review:** Pre-PR sanity check on the app-side patch.
14. **Statuspage:** Public update — "Investigating · Mitigated · Monitoring."
15. **Slack:** Single message to `#sec-ops` summarizing the 3 layers + linked PRs.
16. **SIEM:** Audit-trail entries for each action.
17. **Done:** Recap.

### The four artifact modals

All MacBook-framed.

1. **Cloudflare attack-detail view (`cloudflare-attack-detail.tsx`)** — pixel-perfect Cloudflare Security view, after-state. The same takeover layout but with mitigations annotated:
   - Red "Active Attack" pill is now amber "Mitigated · Monitoring".
   - Defense-status panel shows: `WAF rule live (auto-deployed by cursor-agent · 45s after detection) · Worker rate-limit tightened (90s) · App-side PR awaiting human review`.
   - Mitigation timeline tab with all the agent's actions, each with a `cursor-agent` actor label.
   - Bottom: "Auto-mitigated by Cursor · 0 humans paged · attack absorbed at edge in 2m 30s".

2. **WAF rule diff (`waf-rule-diff.tsx`)** — a side-by-side view showing the old rule set vs. the new one, with the new custom rule highlighted. Show the actual Cloudflare rule expression syntax. Include the deploy log (`Log mode · 60s observation · 0 false positives · promoted to Block`).

3. **Worker rate-limit PR (`pr-modal.tsx`)** — wraps `github-pr-preview.tsx` in MacBook. PR for `workers/auth-rate-limit.ts`. Title: `security: tighten /api/auth/login rate limit during credential-stuffing event`. Body must include:
   - Linked attack signal (Cloudflare event ID).
   - Before/after deploy timing chart showing req/s drop.
   - CI: tsc, lint, miniflare unit tests, all green.
   - "Auto-deployed via wrangler" annotation.

4. **Postmortem (`postmortem.tsx`)** — markdown modal. Structure:
   - Attack summary (timing, vector, blast radius, accounts impacted).
   - Defense narrative (3 layers, timing, residual exposure).
   - **What's automatic vs what needs human follow-up** — explicitly flag the app-side PR as awaiting security-team review.
   - Action items with owners.
   - "Detection-to-mitigation telemetry" with the live req/s chart pre/post-fix.

### Branding

- **Primary accent:** Cloudflare orange `#F38020` (logo, primary CTAs, "Active mitigation" pills).
- **Threat accent:** Red `#DC2626` (attack-active state).
- **Mitigated accent:** Amber `#F59E0B` then green `#10B981` once stable.
- **Vocabulary:** "WAF rule", "Bot Management score", "ASN", "Logpush", "Wrangler", "Workers", "edge", "rate limit", "challenge", "Bot Fight Mode". Avoid PagerDuty's "incident" — use "attack" or "event" or "threat".
- **Avoid:** Sentry/Datadog purple. Cloudflare's identity is orange + dark slate; don't drift.

---

## 4. Files to create

```
src/app/partnerships/cloudflare/page.tsx                                 NEW
src/app/partnerships/cloudflare/demo/page.tsx                            NEW
src/app/api/cloudflare-webhook/route.ts                                  NEW

src/components/cloudflare-demo/analytics-dashboard.tsx                   NEW (idle-phase Cloudflare Analytics view)
src/components/cloudflare-demo/attack-simulator.tsx                      NEW (the 5s spike animation)
src/components/cloudflare-demo/full-attack-page.tsx                      NEW (full-screen Security takeover)
src/components/cloudflare-demo/live-dashboard.tsx                        NEW (split-screen left: dashboard that recovers in real time)
src/components/cloudflare-demo/agent-console.tsx                         NEW (forked, Cloudflare channels)
src/components/cloudflare-demo/artifact-cards.tsx                        NEW
src/components/cloudflare-demo/mitigation-time-card.tsx                  NEW
src/components/cloudflare-demo/guardrails-panel.tsx                      NEW or shared
src/components/cloudflare-demo/artifacts/cloudflare-attack-detail.tsx    NEW
src/components/cloudflare-demo/artifacts/cloudflare-modal.tsx            NEW
src/components/cloudflare-demo/artifacts/waf-rule-diff.tsx               NEW
src/components/cloudflare-demo/artifacts/waf-modal.tsx                   NEW
src/components/cloudflare-demo/artifacts/github-pr-preview.tsx           NEW
src/components/cloudflare-demo/artifacts/pr-modal.tsx                    NEW
src/components/cloudflare-demo/artifacts/postmortem.tsx                  NEW
src/components/cloudflare-demo/artifacts/postmortem-modal.tsx            NEW

src/lib/demo/cloudflare-attack-fixture.ts                                NEW (the attack timeline + mitigation effect curves)
scripts/reset-cloudflare-demo.sh                                         NEW
```

**Also:**

- Add `Cloudflare` to `src/lib/constants.ts` (already listed in `cloud` category but not as a demo).
- Confirm `public/logos/cloudflare.svg` exists.
- Update README.

---

## 5. Implementation order

1. Build the attack timeline + mitigation effect curves fixture **first**. Each agent step has a corresponding effect on the dashboard (req/s, error rate, world-map intensity). Encode this as a single source of truth so the dashboard, the live timeline, and the agent console can all read it without drifting.
2. Build the analytics dashboard. Spend serious time on the world-map widget — it's the demo's hero visual. Use SVG with a small set of clustered points; animate radius + opacity for "intensity".
3. Build the full-screen attack takeover.
4. Build the live left-panel dashboard. The req/s line responding to mitigations is the most powerful moment in the demo. Wire it to the fixture timeline so the curve actually drops at the right moments.
5. Build the agent console (fork Datadog's). Write the ~30-step script.
6. Artifacts in this order: PR (cheap) → WAF rule diff → Cloudflare attack detail → Postmortem.
7. Side content + webhook + reset.
8. Typecheck, walk through twice, screenshots.

---

## 6. Acceptance criteria

- `/partnerships/cloudflare/demo` loads with the analytics dashboard visible.
- Clicking **Simulate credential-stuffing wave** runs a realistic ~5s spike animation, then pivots to the full-screen Security takeover.
- Clicking **Watch Cursor mitigate** opens the split screen with the live dashboard (left) and agent console (right) ticking together.
- The dashboard's req/s line visibly drops in two stages as the WAF rule and Worker rate-limit deploy.
- The script clearly shows the **Log mode → 60s observation → Block** WAF guardrail.
- All 4 artifacts open and look pixel-correct for Cloudflare's chrome.
- The WAF rule diff uses real Cloudflare rule expression syntax.
- Reset returns to clean idle.
- `tsc --noEmit` and `lint` pass.
- Twice-run identical playback.

---

## 7. Anti-patterns

- ❌ **Don't make Cursor block the entire ASN as the first action.** That would be wrong (collateral damage) and unsafe. The script must scope the WAF rule narrowly: ASN + user-agent + endpoint, in Log mode first. Make the guardrail visible.
- ❌ **Don't skip the Log-mode observation step.** This is the guardrail that distinguishes a credible security agent from a reckless one. Show the 60s observation row prominently.
- ❌ **Don't ship the app-side patch as auto-mergeable.** Security-sensitive code changes are draft-PR-for-human-review. Mark it as such.
- ❌ **Don't reuse Datadog purple, Sentry purple, or PagerDuty green.** Cloudflare orange is non-negotiable.
- ❌ **Don't make the dashboard static during the running phase.** The dashboard responding in real time to the agent's mitigations is the demo's emotional payoff.

---

## 8. Webhook prompt (`buildAgentPrompt`)

Fork the Datadog webhook shape. Required steps in order:

1. **Cloudflare intake.** Fetch Analytics for the event window, fetch Bot Management scores, fetch top source IPs/ASN, fetch Logpush for failed-auth events.
2. **Threat correlation.** Cross-reference source ASN/IPs against known threat intel. Output a written threat assessment.
3. **Plan.** Write a 3-layer mitigation plan (edge-immediate / edge-rate-limit / app-long-term) with cited scope and rollback criteria for each.
4. **Layer 1 — WAF.** Deploy a narrowly-scoped custom rule in **Log mode**. Observe for 60s. Promote to **Block** only if false-positive rate is 0.
5. **Layer 2 — Worker.** Patch the Worker with a tightened rate-limit. Deploy to canary first. Promote after canary green.
6. **Layer 3 — App.** Open a PR (draft, awaiting human review) for app-side detection improvements.
7. **Communicate.** Statuspage update, Slack `#sec-ops`, SIEM audit entries.
8. **Done.** Final report listing all 3 mitigations, residual exposure (the time before app-side PR merges), and recommended human follow-ups.

The prompt must enforce: **WAF rules always deploy in Log mode first**, **never block entire countries/ASNs without human approval**, **all actions audited to SIEM**, **app-side security PRs always require human review**.
