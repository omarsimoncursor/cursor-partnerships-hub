# Snyk Live Vulnerability Sweep & Fix Demo — Build Brief

> **Purpose of this document:** Self-contained spec for a new Cursor agent to build an interactive demo at `/partnerships/snyk/demo`. Patterned on the Sentry/Datadog demos but with a different "AHA" angle — this demo is about turning a **CVE landing in your supply chain** into a **safely tested, version-pinned, scope-aware fix PR** in under three minutes, across multiple repositories simultaneously.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Snyk + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/snyk/demo`. The hero is a pixel-perfect **Snyk projects dashboard** for a fake org with 6 repositories (`payments-api`, `customer-web`, `marketing-site`, `internal-tools`, `data-pipelines`, `mobile-rn`). All projects show "No new high-severity issues today."
2. A blinking "Snyk monitoring" indicator. The user clicks **"Simulate CVE disclosure"**. A toast slides in: *"CVE-2026-31415 · Critical (9.8) · Remote code execution in `axios@<1.7.4` · disclosed by Snyk · 2 minutes ago."* The dashboard re-scans live: 4 of the 6 repos light up red ("Affected"), 1 amber ("Direct dep, version pinned safely"), 1 green ("Not affected").
3. The screen pivots to a full-screen takeover: **Snyk vulnerability detail page** for CVE-2026-31415, showing the impact path through each affected repo's dependency tree.
4. The user clicks **"Watch Cursor remediate across the org"**. Split screen: live Snyk projects table on the left (each repo's status ticks from `Vulnerable → Patching → Verifying → Fixed (PR open)` in lockstep with the agent), agent console on the right with **4 parallel lanes** (one per affected repo).
5. The agent: per repo, reads the dep graph, picks the minimum safe version bump (or applies a backport patch where the safe version requires a major bump), runs the test suite, opens a PR, links it back to the Snyk issue. For the one repo where the safe upgrade is a major version (`mobile-rn`), the agent **explicitly stops** and opens a draft PR with a written migration plan rather than auto-merging.
6. When complete, four artifacts are clickable: **Snyk vulnerability detail (with all 4 PRs auto-linked)**, **Per-repo PR overview** (a single artifact summarizing all 4 PRs), **Migration plan** (the artifact for the one repo that requires human review), and **SBOM diff** showing the org-wide dependency tree before/after.
7. Reset returns to clean state. `scripts/reset-snyk-demo.sh` re-seeds the vulnerable versions.

**The "AHA":** *"That CVE just landed and Cursor patched 4 of my 6 repos in 3 minutes — and *correctly* held the 5th for review."* Security and platform engineering buyers feel this immediately. Manual cross-repo CVE remediation is one of the most universally hated chores in the industry.

---

## 1. Why this demo, why this angle

Snyk's enterprise pitch is "find vulns across your whole stack." The unfilled half is "fix them across your whole stack." The most impactful agentic story for Snyk is **org-scale remediation**: the moment a critical CVE drops, every affected repo gets a PR within minutes, with calibrated decisions about minimum-safe-bump vs major-version migration.

Why this beats a single-repo CVE-fix demo:

- **Scale is the credibility moment.** "Fixed across 4 repos in parallel" is what a security team actually needs and is exactly what humans can't do at speed.
- **Calibrated escalation.** The one repo Cursor declines to auto-fix (major-version migration) is the part that proves the agent is trustworthy at scale.
- **Real supply-chain workflow.** Every affected enterprise has a CVE-response runbook. The demo is a vivid drop-in for that runbook.

---

## 2. Required reading

- `src/app/partnerships/datadog/demo/page.tsx` — closest pattern.
- `src/components/datadog-demo/agent-console.tsx` — fork target.
- `docs/partner-demos/linear-demo.md` — for the **parallel-lane agent console mechanic**, which Snyk needs even more than Linear does.
- `src/components/sentry-demo/artifacts/{macbook-frame,github-pr-preview}.tsx`.

---

## 3. The demo — concept & story

### Trigger UI (idle phase)

A pixel-perfect **Snyk projects dashboard** for the fake org `acme-eng`:

- Top nav: Snyk logo (purple `#4C4A73`/magenta `#FF005C`), org switcher, search.
- Header tabs: `Projects · Issues · Reports · Integrations · Settings`.
- Default tab = **Projects**. A table of the 6 repos with columns:
  - Project name + small repo icon.
  - Source (`github.com/acme-eng/...`).
  - Critical / High / Medium / Low severity issue counts (mostly zeros for the demo's clean baseline).
  - Last scanned (`14 minutes ago` for all).
  - Status pill (`Monitored`, green).
- Top-right: a "Snyk monitoring" pulse indicator (subtle pulse, calming).
- Bottom-right floating CTA: `[ Simulate CVE disclosure ]`.

Below the fold:

- **Remediation-time comparison card** (analog of `cost-comparison.tsx`):
  - Without Cursor: Snyk discloses → 4 separate engineers paged → 4 separate PRs over 2–4 days, manual coordination, incomplete coverage, often blocked on the major-version migration nobody wants to take on.
  - With Cursor agent: 4 PRs opened in 3 minutes, 3 auto-merge after CI, 1 explicitly held for human review with a written migration plan attached.
  - Subhead: "From disclosure to coverage in minutes, not days. With calibrated escalation, not blind upgrades."
- **Guardrails panel** specific to Snyk/security:
  - "Always picks the **minimum safe version bump**. Major versions never auto-merged."
  - "Runs the full test suite per repo before opening any PR."
  - "If a fix requires a backport patch, agent applies the patch in `patches/` rather than upgrading."
  - "Lockfiles always regenerated cleanly; no manual edits."
  - "All PRs link the Snyk issue ID and CVE number for audit trail."

### The disclosure (error-equivalent phase)

When the user clicks **Simulate CVE disclosure**:

1. A toast slides in from the top-right: *"CVE-2026-31415 · Critical (9.8) · Remote code execution in `axios@<1.7.4` · disclosed by Snyk · 2 minutes ago."*
2. The dashboard's "Snyk monitoring" indicator changes from calm pulse to active scan ("Scanning all projects against new disclosure…").
3. Over ~3 seconds, the projects table re-paints:
   - 4 rows light up red with `Critical: 1` and an animated "Affected" pill.
   - 1 row lights up amber with "Direct dep, but version-pinned to safe range" (good calibration moment).
   - 1 row stays green ("Not affected").
4. A new severity banner appears at the top: `4 projects affected by CVE-2026-31415 · Patch available: axios@1.7.4 / 1.8.0 / 2.0.0`.

Then pivot to a full-screen **Snyk vulnerability detail takeover**:

- Top: Snyk logo, "Critical · 9.8" CVSS pill (red).
- Big header: `CVE-2026-31415 · Remote code execution in axios`.
- Subhead: `Disclosed: 2 minutes ago · Affected versions: <1.7.4 · Fix available: 1.7.4, 1.8.0, 2.0.0`.
- Body grid:
  - Left: vulnerability description (technical, plausible — RCE via prototype pollution in URL parsing).
  - Middle: **dependency-path visualizer** — a mini-graph for each affected repo showing the path from root → vulnerable axios. Each node clickable.
  - Right: org impact panel:
    - 4 projects affected.
    - For each: severity, fix path (`Direct upgrade · 1.6.2 → 1.7.4`, `Transitive via @acme/internal-http · upgrade @acme/internal-http to 4.2.1`, `Direct upgrade requires major bump · 0.27 → 1.7.4 BREAKING`, etc.).
    - One-click "Auto-fix all" (this is the demo's CTA).
- CTAs at bottom: **`[ Watch Cursor remediate across the org ]`** (primary, magenta) and **`[ Reset ]`**.

### The orchestration (running phase)

Split screen:

- **Left:** the **live Snyk projects table** (back to the dashboard view), filtered to the 4 affected repos. Each row has an expanded sub-status that ticks: `Vulnerable → Patching → Verifying → PR open`. The 5th repo (the major-version-bump one) has its own track: `Vulnerable → Analyzing → Drafting migration plan → Draft PR open`. Each row's pill color animates: red → amber (mid-fix) → green (PR open) for the 4 auto-fixable; red → amber → blue (`Awaiting human review`) for the 5th.
- **Right:** scripted agent console with **4 parallel lanes** (one per auto-fixable repo) plus a 5th lane for the migration-plan repo, color-banded like the Linear demo. Header: `Agents: 5 running · per-repo lanes`.

### Channels

| Channel        | Label                  | Hex accent | Role                                                |
| -------------- | ---------------------- | ---------- | --------------------------------------------------- |
| `snyk`         | `snyk-mcp`             | `#FF005C`  | Read CVE detail, project status, fix advice         |
| `github`       | `github-mcp`           | (white)    | Per-repo branch, PR, link Snyk issue                |
| `npm`          | `npm-mcp`              | `#CB3837`  | Read registry metadata, lockfile updates            |
| `composer`     | `composer · bump`      | blue       | Lockfile + manifest edits per repo                  |
| `opus`         | `opus · plan`          | `#D97757`  | Org-wide plan + migration-plan drafting             |
| `codex`        | `codex · review`       | `#10a37f`  | Pre-PR review                                       |
| `shell`        | `shell`                | green      | `npm install`, `pnpm test`, lockfile regeneration   |
| `slack`        | `slack-mcp`            | `#4A154B`  | `#secops` channel summary                           |
| `siem`         | `siem-mcp`             | `#0F172A`  | Audit-trail entries                                 |
| `done`         | `complete`             | green      | Terminal step                                       |

### Target script arc (~36 steps total across 5 lanes, ~25s real, scaled to ~5m displayed)

**Phase A — Org-wide plan (single-lane):**

1. `snyk` — fetch CVE detail, fetch all affected projects, fetch fix advice per project.
2. `opus` — read the fix advice + each repo's `package.json` and lockfile (via github-mcp). Output a per-repo plan:
   - 4 repos: minimum safe bump.
   - 1 repo (`mobile-rn`): safe upgrade requires major axios bump (0.27 → 1.7.4) with breaking API changes; agent decides to draft migration plan instead of auto-fixing.
3. `slack` — single planning message to `#secops`.

**Phase B — Auto-remediate (4 lanes in parallel):**

For each auto-fixable repo:

- `github` → branch `security/cve-2026-31415-axios`.
- `npm` → check registry for the safe version metadata.
- `composer` → bump `axios` in `package.json` to the minimum safe version. Update lockfile via shell.
- `shell` → `pnpm install` (or npm/yarn per the repo) to regenerate lockfile cleanly.
- `shell` → run the repo's test suite. Note timing per repo (some are slow).
- `codex` → review the lockfile diff, confirm only axios + transitive children changed.
- `github` → commit, push, open PR. Title: `security(CVE-2026-31415): bump axios to 1.7.4`. Body links the Snyk issue. CI badge auto-attaches.
- `snyk` → mark the Snyk issue as "PR opened: #<N>" via Snyk MCP.

**Phase C — Migration plan lane (single):**

For `mobile-rn`:

- `opus` → read the breaking-change diff from axios 0.x → 1.x. Identify every call site in the codebase that needs updating (request config, response interceptors, etc.).
- `composer` → draft a structured migration plan to `docs/security/cve-2026-31415-mobile-rn-migration.md`.
- `github` → open a **draft PR** with the migration plan attached and a `security · awaiting human review` label. Body explicitly says: *"Auto-fix declined: requires axios 0.27 → 1.7.4 (major). 14 call sites need API updates. Migration plan attached. Recommended owner: @mobile-leads."*

**Phase D — Org wrap-up:**

- `slack` → final summary message to `#secops`: *"4 PRs opened (3 auto-merging after CI), 1 draft awaiting human review, 0 repos still vulnerable after merges."*
- `siem` → audit entries for every action.
- `done`.

### The four artifact modals

All MacBook-framed.

1. **Snyk vulnerability detail (`snyk-vuln-detail.tsx`)** — pixel-perfect Snyk vuln page, after-state. The dependency-path visualizer now shows each affected repo with a "Fix in PR #N" annotation and a green/amber pill. The org-impact panel shows: `4 projects · 4 PRs open · 3 auto-mergeable · 1 awaiting human review · 0 still vulnerable post-merge`. Audit-log tab shows the agent's per-action trail.

2. **Per-repo PR overview (`pr-overview.tsx`)** — a single artifact summarizing all 4 PRs in a table (repo, PR title, author = `cursor-agent`, CI status, axios version delta, lockfile lines changed, "Auto-mergeable" or "Draft" badge). Each row clickable to expand a PR preview inline. This is the demo's most novel artifact — a bird's-eye view of org-wide remediation that no other demo has.

3. **Migration plan (`migration-plan-doc.tsx`)** — markdown modal showing the full migration plan for `mobile-rn`. Sections:
   - Why we declined the auto-fix (with cited breaking-change diff).
   - All 14 call sites enumerated, file:line, with the old and new API signature.
   - Suggested batching (4 small PRs, with dependency order).
   - Risk assessment per call site.
   - Test coverage gap analysis.
   - Recommended owner & timeline.
   This artifact is the demo's credibility crown jewel — read like a senior engineer wrote it.

4. **SBOM diff (`sbom-diff.tsx`)** — a side-by-side JSON view of the org-wide SBOM (just the affected packages), pre- and post-remediation. Highlight the axios version changes, the transitive-dep ripple, and the lockfile checksums. Below the diff, a small summary: `4 repos · 1 direct dep updated · 7 transitive deps refreshed · 0 unintended package changes`.

### Branding

- **Primary accent:** Snyk magenta `#FF005C` for the CVE-severity pill, primary CTAs, and the vuln-detail header.
- **Snyk dark-purple secondary:** `#4C4A73` for the projects-table chrome (matches Snyk's actual UI).
- **Severity colors:** Red (critical/9.8), orange (high), yellow (medium), gray (low). Match Snyk's actual scheme.
- **Status colors:** Vulnerable red, Patching amber, Verifying blue, PR open green, Awaiting human review purple.
- **Vocabulary:** "vulnerability", "CVE", "advisory", "fix advice", "transitive dependency", "lockfile", "SBOM", "advisory database". Avoid PD's "incident".
- **Avoid:** Sentry purple, Datadog purple, Cloudflare orange. Snyk's identity is magenta + dark-purple.

---

## 4. Files to create

```
src/app/partnerships/snyk/page.tsx                                       NEW
src/app/partnerships/snyk/demo/page.tsx                                  NEW
src/app/api/snyk-webhook/route.ts                                        NEW

src/components/snyk-demo/projects-dashboard.tsx                          NEW (idle: 6-repo Snyk projects view)
src/components/snyk-demo/cve-disclosure-toast.tsx                        NEW (the slide-in toast + live re-scan animation)
src/components/snyk-demo/full-vuln-page.tsx                              NEW (full-screen Snyk vuln detail takeover)
src/components/snyk-demo/live-projects-table.tsx                         NEW (split-screen left: per-repo status ticks)
src/components/snyk-demo/agent-console.tsx                               NEW (forked, parallel-lane support, 5 lanes)
src/components/snyk-demo/artifact-cards.tsx                              NEW
src/components/snyk-demo/remediation-time-card.tsx                       NEW
src/components/snyk-demo/guardrails-panel.tsx                            NEW or shared
src/components/snyk-demo/artifacts/snyk-vuln-detail.tsx                  NEW
src/components/snyk-demo/artifacts/snyk-modal.tsx                        NEW
src/components/snyk-demo/artifacts/pr-overview.tsx                       NEW (the org-bird's-eye-view artifact)
src/components/snyk-demo/artifacts/pr-overview-modal.tsx                 NEW
src/components/snyk-demo/artifacts/migration-plan-doc.tsx                NEW (markdown modal)
src/components/snyk-demo/artifacts/migration-plan-modal.tsx              NEW
src/components/snyk-demo/artifacts/sbom-diff.tsx                         NEW
src/components/snyk-demo/artifacts/sbom-diff-modal.tsx                   NEW

src/lib/demo/snyk-cve-fixture.ts                                         NEW (the 6-repo dataset, per-repo fix advice + lane scripts)
scripts/reset-snyk-demo.sh                                               NEW
```

**Also:**

- Add `Snyk` to `src/lib/constants.ts` (likely under `devtools`).
- Add `public/logos/snyk.svg`.
- Update README.

---

## 5. Implementation order

1. Build the 6-repo + per-repo fix-advice fixture **first**. Each repo has: package manager (npm/pnpm/yarn), current axios version, fix path (direct/transitive/major-bump), test-suite duration, lockfile size. The agent console and the live projects table both read from this.
2. Scaffold the route + four-phase state machine.
3. Build the projects dashboard. Snyk's UI is reasonably distinctive — match it (the projects table, the severity pills, the org sidebar).
4. Build the CVE-disclosure toast + live re-scan animation. The 6 repos lighting up sequentially is a powerful 3-second moment.
5. Build the full-screen vuln page with the dependency-path visualizer. The visualizer is the hardest single component — invest here.
6. Build the live projects table for the running phase. Per-repo status pills animating in lockstep with the agent script is the demo's hero.
7. Build the parallel-lane agent console (re-use the Linear demo's mechanic if shipped, otherwise build fresh).
8. Artifacts in this order: Migration plan (markdown, cheap) → SBOM diff → Snyk vuln detail → PR overview (the novel artifact, do it last).
9. Side content + webhook + reset.
10. Typecheck, walk through twice, screenshots.

---

## 6. Acceptance criteria

- `/partnerships/snyk/demo` loads with the 6-repo projects dashboard.
- Clicking **Simulate CVE disclosure** shows the toast + live re-scan animation, then pivots to the full-screen vuln page.
- The dependency-path visualizer shows all 4 affected repos' paths to vulnerable axios.
- Clicking **Watch Cursor remediate across the org** opens the split screen with synchronized live projects table (left) and 5-lane agent console (right).
- Each affected repo's status visibly ticks through `Vulnerable → Patching → Verifying → PR open` (4 repos) or `→ Drafting migration plan → Draft PR open` (1 repo).
- All 4 artifacts open and look pixel-correct for Snyk's chrome.
- The migration-plan artifact reads like a senior engineer wrote it (must explicitly enumerate the 14 call sites with file:line + API signature deltas).
- The PR overview shows 4 PRs with correct auto-mergeable / draft labels.
- Reset returns to clean idle.
- `tsc --noEmit` and `lint` pass.
- Twice-run identical playback.

---

## 7. Anti-patterns

- ❌ **Don't make the demo about a single repo.** The cross-repo parallelism is the entire AHA. A single-repo Snyk demo isn't differentiating.
- ❌ **Don't auto-fix the major-version repo.** The whole point is calibrated escalation. The 5th repo getting a *plan* not a *fix* is what makes the demo trustworthy.
- ❌ **Don't have the agent edit lockfiles by hand.** Always regenerate via the package manager. Show the `pnpm install` (or npm/yarn) shell row prominently.
- ❌ **Don't skip the SBOM-diff artifact.** Security teams care deeply about provenance and audit trails. This artifact closes the loop.
- ❌ **Don't recolor a Datadog dashboard.** Snyk's UI is genuinely different (project-centric not service-centric, magenta accent, dependency-graph visualizer is signature).
- ❌ **Don't show the agent skipping tests.** Per-repo full test run before any PR. This is the credibility floor.

---

## 8. Webhook prompt (`buildAgentPrompt`)

Fork the Sentry/Datadog webhook shape. Required steps in order:

1. **Snyk intake.** Fetch the CVE, fetch all affected projects, fetch per-project fix advice and dependency paths.
2. **Org-wide plan.** For each affected repo, classify the fix:
   - `auto-fixable`: minimum safe bump is patch- or minor-level, transitive or direct, no breaking-API risk.
   - `auto-fixable via patch`: safe version unavailable, but a backport patch can be applied to `patches/`.
   - `migration-required`: safe version requires major bump; auto-fix declined; draft migration plan.
3. **Spawn parallel sub-agents** per `auto-fixable` repo. Each runs:
   - Branch `security/cve-<id>-<package>`.
   - Bump version in manifest.
   - Regenerate lockfile via the repo's package manager (never hand-edit).
   - Run the full test suite.
   - Open PR linking the Snyk issue + CVE.
   - Report Snyk issue status as "PR opened".
4. **Migration sub-agent** for any `migration-required` repo. Draft a structured migration plan with all call sites enumerated, batching, risks, owners. Open as **draft PR** with `security · awaiting human review` label.
5. **Communicate.** Slack `#secops` summary, SIEM audit entries.
6. **Verify.** Re-scan via Snyk MCP; confirm all auto-mergeable PRs zero out the issue post-merge.

The prompt must enforce: **never auto-merge a major-version bump**, **always regenerate lockfiles via the package manager**, **always run the full test suite per repo before opening a PR**, **always link the Snyk issue ID and CVE number in the PR body**, **all actions audited to SIEM**.
