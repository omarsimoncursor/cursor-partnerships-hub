# Snyk Live Vulnerability Triage & Fix Demo — Build Brief

> **Purpose of this document:** Self-contained spec for building an interactive
> live security-fix demo at `/partnerships/snyk/demo`, patterned on the existing
> Sentry and Datadog demos. Read end-to-end before writing any code.

---

## 0. TL;DR

Build a repeatable, click-to-run demo that dramatizes Snyk + Cursor end-to-end:

1. A user lands on `/partnerships/snyk/demo` and clicks **Run check** on a
   "Customer Profile API" card.
2. The endpoint behind the card has a real, exploitable bug (NoSQL injection +
   a vulnerable dependency). Hitting the endpoint with a crafted username pulls
   back the entire user table.
3. The UI demonstrates the leak in ~6s and pivots to a full-screen
   **Critical Vulnerability** takeover (Snyk indigo, not Sentry purple, not
   Datadog purple).
4. Snyk (mocked) detects the SAST + SCA findings and fires a webhook.
5. A scripted "agent console" plays on the right half of the screen showing
   Cursor orchestrating: Snyk MCP -> Opus triage -> GitHub MCP -> Composer edit
   -> Codex review -> shell verify -> PR opened -> Jira updated.
6. When the run completes, the user can click into four pixel-perfect artifact
   modals: **Snyk issue**, **Triage report**, **Jira ticket**, **GitHub PR**.
7. Reset returns the demo to clean state. `scripts/reset-snyk-demo.sh` re-seeds
   the bug after a real PR merges.

The demo must behave identically every time it runs. All agent work is scripted
playback. Only the underlying bug and reset are real.

---

## 1. Why this is being built

Snyk is the obvious "shift left" partner for Cursor. The pitch is:

> Snyk finds the vulnerability. Cursor produces the verified fix.

The existing partnership hub does not yet showcase a security workflow. This
demo proves, in under two minutes, that Cursor can take a Snyk finding all the
way to a tested, evidence-backed PR — across SAST, SCA, container, and IaC.

---

## 2. Required reading (in this repo, in order)

Before you write any code, study the Datadog demo. This is the cleanest
reference implementation of the pattern.

**Page + state machine:**

- `src/app/partnerships/datadog/demo/page.tsx`

**Components:**

- `src/components/datadog-demo/agent-console.tsx` — scripted playback engine.
  Replicate the structure exactly; only the channels and SCRIPT change.
- `src/components/datadog-demo/reports-card.tsx` — trigger UI + custom Error.
- `src/components/datadog-demo/demo-perf-boundary.tsx` — error interception.
- `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeover.
- `src/components/datadog-demo/slo-summary.tsx` — split-screen left panel.
- `src/components/datadog-demo/artifact-cards.tsx`
- `src/components/datadog-demo/latency-comparison.tsx`
- `src/components/datadog-demo/guardrails-panel.tsx`
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — pixel-perfect
  product surface.
- `src/components/datadog-demo/artifacts/datadog-modal.tsx`
- `src/components/datadog-demo/artifacts/triage-report.tsx`
- `src/components/datadog-demo/artifacts/jira-ticket.tsx`
- `src/components/datadog-demo/artifacts/github-pr-preview.tsx`
- `src/components/datadog-demo/artifacts/pr-modal.tsx`
- `src/components/datadog-demo/artifacts/macbook-frame.tsx`

**Webhook + reset:**

- `src/app/api/datadog-webhook/route.ts`
- `scripts/reset-datadog-demo.sh`

---

## 3. The Snyk demo — concept & story

### Trigger scenario

**Surface UI:** A "Customer Profile API" mini-app on the demo page. The hero
card is something like:

> **Look up a customer profile**
> Search by username and return the public profile fields.
> `[ Run check ]`

The card fixes the username to `' || '1'=='1` (a NoSQL injection payload),
shown to the user as the literal "test query the security team is running this
morning". When **Run check** is clicked, the UI shows a loading state for
~3-4s, then renders the response: the raw JSON of the entire users table
(hashed-password fields, internal flags, all of it). After ~1.5s of "wait, the
endpoint just returned every customer", the demo pivots to a full-screen
**Critical Vulnerability** takeover.

The full-screen takeover (Snyk equivalent of `FullSloBreachPage`):

- Big **"Critical: NoSQL injection in customer profile lookup"** heading.
- Snyk-indigo accent (`#4C44CB`).
- One line: `SNYK-JS-CUSTOMER-PROFILE · CWE-943 · CVSS 9.8 · src/lib/demo/customer-profile.ts`.
- Subtext naming the cause in Snyk vocabulary: "Tainted input from
  request.query.username flows directly into a Mongo query selector without
  sanitization." Plus a second line for the SCA half of the story:
  "Project also depends on `mongoose@5.13.7` (SNYK-JS-MONGOOSE-2961688,
  prototype pollution, CVSS 7.5) — a fixed version exists upstream."
- Two buttons: **"Watch Cursor patch this"** and **"Reset"**.

### The underlying bug (real code, reset-able)

Two cooperating files. Both must typecheck. The bug must be real and the
exploit reproducible from the API route.

**`src/lib/demo/customer-profile.ts`** (vulnerable):

```ts
import { type CustomerRecord, CUSTOMERS } from './customer-store';

interface ProfileQuery {
  username: string;
}

// The "query" is a fake mini-Mongo selector that we evaluate against an
// in-memory array. It mimics the real-world bug: tainted input is interpolated
// into the selector without sanitization, so an attacker can craft a payload
// that matches every record.
export function lookupCustomerProfile(query: ProfileQuery): CustomerRecord[] {
  const tainted = `{ "username": "${query.username}" }`;
  const selector = parseSelector(tainted); // demo-only mini parser
  return CUSTOMERS.filter(record => matchesSelector(record, selector));
}
```

**`src/lib/demo/customer-store.ts`** seeds ~12 customer records with realistic
shapes (id, username, hashed_password, email, internal_role, mfa_enabled, …)
and exports the shared types + the trivial `parseSelector` / `matchesSelector`
helpers. The selector parser supports the literal `||` and `==` tokens that
the NoSQL-injection payload `' || '1'=='1` collapses to "always true".

The fix the agent produces:

1. Stop string-interpolating the username; pass it as a parameter into the
   selector.
2. Add an allowlist regex (`/^[a-zA-Z0-9_.-]{1,64}$/`) and reject anything else
   with a typed `ValidationError`.
3. Bump `mongoose` from `5.13.7` to `5.13.20` (the SCA finding).

Post-fix, the API route returns a 400 for the injected payload and a single
record (or 404) for valid usernames. Use this exact bug or one structurally
equivalent. The point is it must be real, typechecks, and produces a visible
data-leak the prospect can feel.

### The orchestration (scripted console playback)

Channels the SCRIPT needs (extend the Datadog `Channel` union; keep
Opus/Composer/Codex):

| Channel    | Label             | Hex accent | Role in the story                                     |
| ---------- | ----------------- | ---------- | ----------------------------------------------------- |
| `snyk`     | `snyk-mcp`        | `#4C44CB`  | Pull issue, CWE/CVSS, fix advisory, SCA upgrade path  |
| `github`   | `github-mcp`      | (white)    | Commit history, branch, PR                            |
| `jira`     | `jira-mcp`        | `#4C9AFF`  | Security ticket creation + state transitions          |
| `shell`    | `shell`           | green      | `tsc`, `npm test`, exploit replay, semgrep, git       |
| `opus`     | `opus · triage`   | `#D97757`  | Long-context reasoning over taint flow + advisory     |
| `composer` | `composer · edit` | blue       | Scoped fix application                                |
| `codex`    | `codex · review`  | `#10a37f`  | Patch review / regression check                       |
| `codegen`  | `codegen`         | blue       | Triage report generation                              |
| `done`     | `complete`        | green      | Terminal step                                         |

Target script arc (~26 steps, ~19s real, scaled to ~2 min displayed):

1. **Snyk intake (snyk):** Fetch project, fetch the SAST issue, fetch the SCA
   issue, fetch the upstream fix advisory, pull the relevant CWE detail.
2. **Jira (jira):** Open `CUR-7841` (Security · P1 · Critical), link Snyk
   project + both findings.
3. **Opus triage (opus, github):** Pull commits touching `customer-profile.ts`
   and `package.json`, identify regression commit, form the
   "tainted input -> selector" hypothesis with line-level citations.
4. **Codegen (codegen):** Write `docs/triage/2026-04-16-snyk-customer-profile.md`.
5. **Composer edit (composer, shell):** Read `customer-profile.ts`,
   parameterize the selector, add allowlist + `ValidationError`, bump
   `mongoose` in `package.json`/`package-lock.json`.
6. **Codex review (codex):** Confirm no behavior change for valid usernames,
   confirm contract preserved, confirm the type surface is unchanged.
7. **Shell verification (shell):**
   - `npx tsc --noEmit` -> ✓
   - `npm run lint` -> ✓
   - `npx vitest run customer-profile` -> 11 passed
   - `node scripts/reproduce-snyk-injection.mjs` -> baseline 12 leaked rows
   - same script post-fix -> `0 leaked rows · ValidationError thrown`
   - `snyk test` -> `0 critical · 0 high · 0 medium · 0 low`
8. **PR (github):** Branch `security/patch-customer-profile-injection` ->
   commit -> push -> PR #214 opened.
9. **Jira (jira):** `CUR-7841 → In Review`.
10. **Done:** Artifacts ready.

### Artifact modals

All four render in a MacBook frame (reuse the Datadog
`artifacts/macbook-frame.tsx` pattern; copy the file into the Snyk demo's
`artifacts/` folder so each demo stays self-contained, mirroring how the
other demos do it).

1. **Snyk issue modal** (`SnykIssue` + `SnykModal`) — pixel-perfect Snyk
   project issue detail page. Required:
   - Top nav with Snyk wolf-mark glyph (indigo `#4C44CB`), org/project selector,
     search.
   - Sidebar: "Snyk Code" / "Snyk Open Source" / "Snyk Container" / "Snyk IaC"
     navigation, with "Snyk Code" active.
   - Issue header: `NoSQL Injection in customer profile lookup` with red
     CRITICAL severity chip and CVSS `9.8`.
   - Tabs: `Overview`, `Code path`, `Fix`, `Activity`, `Ignore`.
   - Default tab = **Code path**: a small code-frame view showing the tainted
     input flow `request.query.username -> lookupCustomerProfile -> selector`
     with the dangerous line highlighted. Plus the data-flow steps as a
     numbered list.
   - Right sidebar: project metadata, CWE-943 description, owner team, branch,
     commit, "Snyk fix PR available" callout for the SCA upgrade.
   - Snyk dark aesthetic: deep navy `#0E0F2C` background, indigo accents,
     thin `#23264F` borders.
2. **Triage report modal** — same `react-markdown` shape as Datadog. Content
   pivots to: vulnerability summary, CWE + CVSS table, exploit reproduction,
   patch, verification (tsc + lint + vitest + exploit replay + `snyk test`),
   risk.
3. **Jira ticket modal** — pixel-perfect Jira, ticket `CUR-7841`, Type
   `Security`, Priority P1. Status moves through `Backlog → In Progress →
   In Review` (timeline). Comments from Snyk, Cursor agent, and the security
   team channel.
4. **GitHub PR modal** — wrapped in MacBook. PR #214,
   `security: parameterize customer profile lookup + bump mongoose`. PR body:
   exploit-replay table, CWE/CVSS row, files changed, CI: `tsc`, `lint`,
   `vitest`, `snyk test`, `semgrep`. Diff excerpt for `customer-profile.ts`
   AND a one-line `package.json` upgrade hunk.

### Branding

- **Primary accent:** Snyk indigo `#4C44CB`. Use for the wolf-mark badge,
  primary CTA, severity chip when the run completes successfully.
- **Critical / vulnerability color:** Red `#E11D48` for CRITICAL chips and the
  exposure metric. Reserve amber for "Medium / fix available".
- **Success:** Green `#4ADE80` for post-fix verification rows.
- **Avoid:** Datadog purple `#632CA6` and Sentry purple `#362D59`. The demos
  must feel distinct.

---

## 4. Files to create

```
src/app/partnerships/snyk/page.tsx                                    NEW (narrative + CTA)
src/app/partnerships/snyk/demo/page.tsx                               NEW (state machine)
src/app/api/snyk-webhook/route.ts                                     NEW (verify + trigger)
src/app/api/customer-profile/lookup/route.ts                          NEW (calls the bug)

src/components/snyk-demo/customer-profile-card.tsx                    NEW (trigger UI)
src/components/snyk-demo/demo-vuln-boundary.tsx                       NEW (error boundary)
src/components/snyk-demo/full-vuln-page.tsx                           NEW (full-screen takeover)
src/components/snyk-demo/vuln-summary.tsx                             NEW (split-screen left)
src/components/snyk-demo/agent-console.tsx                            NEW (forked, snyk channels)
src/components/snyk-demo/artifact-cards.tsx                           NEW
src/components/snyk-demo/severity-comparison.tsx                      NEW (before/after security posture)
src/components/snyk-demo/guardrails-panel.tsx                         NEW
src/components/snyk-demo/artifacts/snyk-issue.tsx                     NEW (pixel-perfect Snyk page)
src/components/snyk-demo/artifacts/snyk-modal.tsx                     NEW (wraps in MacBook)
src/components/snyk-demo/artifacts/triage-report.tsx                  NEW (snyk-specific markdown)
src/components/snyk-demo/artifacts/jira-ticket.tsx                    NEW (CUR-7841)
src/components/snyk-demo/artifacts/github-pr-preview.tsx              NEW (security PR content)
src/components/snyk-demo/artifacts/pr-modal.tsx                       NEW
src/components/snyk-demo/artifacts/macbook-frame.tsx                  NEW (copied from datadog-demo)

src/lib/demo/customer-profile.ts                                      NEW (vulnerable code)
src/lib/demo/customer-store.ts                                        NEW (in-memory data + parser helpers)

scripts/reset-snyk-demo.sh                                            NEW (re-seeds the bug)

public/logos/snyk.svg                                                 NEW (wolf-mark glyph)
```

Also:

- Register Snyk in `src/lib/constants.ts` under `devtools`.
- Add a Snyk demo card to the showcase grid in
  `src/components/sections/partnerships.tsx`.
- Add `SNYK_WEBHOOK_SECRET` to `.env.example` if a `.env.example` file exists
  (currently the repo does not check one in — skip if absent).
- Update `README.md` partner table to list Snyk.

---

## 5. Implementation order

1. Write the spec (this document).
2. Scaffold the route — `src/app/partnerships/snyk/demo/page.tsx` with the
   four-phase state machine.
3. Ship the trigger path — `customer-profile.ts`, `customer-store.ts`,
   `customer-profile-card.tsx`, the API route. Verify the exploit really
   leaks the table.
4. Wire the boundary + full-screen takeover.
5. Build the agent console — fork Datadog's, add `snyk` channel, write the
   ~26-step SCRIPT.
6. Build artifact modals: PR -> Jira -> Snyk issue -> Triage. PR and Jira are
   cheapest to adapt; Snyk issue is the new/hard surface.
7. Side content — severity comparison, guardrails panel, CTA pill.
8. Webhook route — Snyk signature verification, agent trigger,
   `buildAgentPrompt` enforcing the 8-step sequence.
9. Reset script + README update.
10. `npx tsc --noEmit` and a manual walkthrough.

---

## 6. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result, every time. No
  `Math.random()` in the playback. Timestamps derived from cumulative
  `delayMs * TIME_SCALE` exactly like Datadog.
- **The exploit is real before the fix:** Hitting
  `/api/customer-profile/lookup?username=' || '1'=='1` actually returns the
  full customer table.
- **Self-contained artifacts:** No external links out to snyk.io or github.com.
  Everything opens in-modal.
- **On-brand language:** "Snyk Code", "Snyk Open Source", "CWE-943", "CVSS",
  "Fix PR", "Issue ID `SNYK-JS-CUSTOMER-PROFILE-001`", "Project", "Org",
  "tainted input", "data flow". Avoid Sentry ("issue", "breadcrumb") and
  Datadog ("span", "monitor") vocab.
- **Single-page, no auth:** Don't require login. The webhook route is the only
  place env vars are read.

---

## 7. Webhook prompt — what the real agent must do

Required steps in order (enforced in `buildAgentPrompt`):

1. **Snyk MCP intake.** Fetch project, fetch the SAST issue (CWE, CVSS,
   data-flow steps), fetch any SCA issues on the same path, fetch the upstream
   fix advisory.
2. **Regression hunt (GitHub MCP).** Identify the commit that introduced the
   tainted-input flow. Cite SHA, author, date.
3. **Read affected code (shell).** Read every file in the data flow. Form a
   written hypothesis before patching.
4. **Patch (shell + edit).** Minimal correct fix:
   - parameterize the selector;
   - add an allowlist + `ValidationError`;
   - apply the SCA upgrade in `package.json` + lockfile.
5. **Static verify.** `npm run lint`, `npx tsc --noEmit`. Iterate to clean.
6. **Live verify.**
   - `npx vitest run customer-profile`
   - `node scripts/reproduce-snyk-injection.mjs` — must report `0 leaked rows`
     and a `ValidationError` thrown for the injected payload.
   - `snyk test --severity-threshold=medium` — must report 0 issues at the
     threshold.
7. **Open PR (GitHub MCP).** Branch `security/<slug>`. PR body must include
   the exploit-replay table (before/after rows leaked), the CWE/CVSS row, the
   regression commit SHA, the triage report path, and a risk assessment.
8. **Jira update (Jira MCP).** Move ticket to `In Review`, link the PR.

---

## 8. Acceptance criteria

- `/partnerships/snyk/demo` loads with hero + CTA pill + customer-profile card.
- Clicking **Run check** shows the leaked customer table for ~1.5s, then pivots
  to the full-screen vulnerability page.
- Clicking **Watch Cursor patch this** starts the scripted console which plays
  ~26 channel-coded steps in ~19s real time with timestamps scaled to ~2 min.
- Console completion transitions to the `complete` phase and reveals four
  artifact cards.
- Each artifact modal opens, renders pixel-perfect, and closes cleanly.
- The Snyk issue modal shows a believable code-path view, severity chip, and
  the SCA fix-PR callout.
- Reset returns the demo to clean `idle`.
- Two consecutive runs produce identical output.
- `npx tsc --noEmit` passes.
- No external links leak out.
- `scripts/reset-snyk-demo.sh` restores the buggy state after a real PR merges.
- The narrative `/partnerships/snyk` page links to the demo.
- The hub homepage shows Snyk in both the partner grid and the demo showcase.

---

## 9. Anti-patterns / things to avoid

- ❌ Don't reuse Datadog purple (`#632CA6`) or Sentry purple (`#362D59`).
- ❌ Don't make the agent console non-deterministic.
- ❌ Don't show a generic "error" page. This is a security exposure — the
  vocabulary and visuals must reflect CVE/CWE/CVSS/severity, not stack traces.
- ❌ Don't put the data-flow view as a plain bullet list. Show the call chain
  with line-level citations and a highlighted hot line.
- ❌ Don't skip the MacBook frame for artifact modals.
- ❌ Don't modify `src/components/datadog-demo/` or `src/components/sentry-demo/`.
- ❌ Don't hardcode API keys. Everything env-driven, server-side only.
- ❌ Don't break the existing partnership pages.

---

## 10. Quick reference — Datadog -> Snyk file map

| Datadog                                  | Snyk                                          |
| ---------------------------------------- | --------------------------------------------- |
| `reports-card.tsx`                       | `customer-profile-card.tsx`                   |
| `demo-perf-boundary.tsx`                 | `demo-vuln-boundary.tsx`                      |
| `full-slo-breach-page.tsx`               | `full-vuln-page.tsx`                          |
| `slo-summary.tsx`                        | `vuln-summary.tsx`                            |
| `agent-console.tsx`                      | `agent-console.tsx` (snyk channel + script)   |
| `artifact-cards.tsx`                     | `artifact-cards.tsx`                          |
| `latency-comparison.tsx`                 | `severity-comparison.tsx`                     |
| `artifacts/datadog-trace.tsx`            | `artifacts/snyk-issue.tsx`                    |
| `artifacts/datadog-modal.tsx`            | `artifacts/snyk-modal.tsx`                    |
| `artifacts/triage-report.tsx`            | `artifacts/triage-report.tsx`                 |
| `artifacts/jira-ticket.tsx`              | `artifacts/jira-ticket.tsx`                   |
| `artifacts/github-pr-preview.tsx`        | `artifacts/github-pr-preview.tsx`             |
| `artifacts/pr-modal.tsx`                 | `artifacts/pr-modal.tsx`                      |
| `artifacts/macbook-frame.tsx`            | `artifacts/macbook-frame.tsx` (copy)          |
| `src/lib/demo/aggregate-orders.ts` +     | `src/lib/demo/customer-profile.ts` +          |
| `src/lib/demo/region-store.ts`           | `src/lib/demo/customer-store.ts`              |
| `src/app/api/datadog-webhook/route.ts`   | `src/app/api/snyk-webhook/route.ts`           |
| `scripts/reset-datadog-demo.sh`          | `scripts/reset-snyk-demo.sh`                  |
