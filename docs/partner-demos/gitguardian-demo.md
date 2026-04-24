# GitGuardian Live Secret Containment & Cleanup Demo — Build Brief

> **Purpose of this document:** This is a self-contained prompt/spec for a new Cursor agent to build an interactive live-fix demo at `/partnerships/gitguardian/demo`, patterned on the existing Sentry demo at `/partnerships/sentry/demo`. Read it end-to-end before writing any code. For the strategic context (why this is the first security demo on the hub), see `docs/partner-demos/security-demos.md`.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes **GitGuardian + Cursor** orchestration end-to-end. The star of the show is a real leaked-credential incident the agent contains, rotates, and cleans up across 6+ tools in under a minute of displayed time:

1. A user lands on `/partnerships/gitguardian/demo` and clicks a button to **push a commit** to a mock service repo (`payments-service`).
2. The commit is intentionally bad: it adds a hardcoded AWS access key + secret and a Stripe restricted key into a config file. Real code, real-looking literals, **never valid in any account**.
3. The push triggers a mocked GitGuardian detection that fires a webhook; the UI pivots to a full-screen **"Active credential exposure"** takeover (red/amber, not Sentry-purple, not Datadog-purple).
4. A scripted agent console plays on the right half of the screen showing Cursor orchestrating: GitGuardian MCP → Opus triage → AWS MCP (rotate IAM key) → Stripe MCP (roll restricted key) → Vault MCP (publish replacements) → GitHub MCP (open cleanup PR + history-purge PR) → Slack MCP (post incident summary) → Jira MCP (open + transition CUR-SEC-2118) → Splunk MCP (write audit event) → done.
5. When the run completes, the user can click through five pixel-perfect artifact modals: **GitGuardian incident**, **Audit timeline**, **Jira ticket**, **GitHub cleanup PR**, and **Slack incident thread** (each in a MacBook frame).
6. A reset button returns the demo to clean state. `scripts/reset-gitguardian-demo.sh` re-seeds the leaked-credential commit fixture after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying fixture and reset are real.

> **Run the local dev server on port `3104`** (`PORT=3104 npm run dev`) during development and verification. The main app runs on `3000`; Sentry/Datadog/Figma assume `3000`; Databricks uses `3101`; Snowflake uses `3102`; AWS Live uses `3103`. Keeping GitGuardian on `3104` avoids collisions with other partner-demo agents working in parallel.

---

## 1. Partner-rep positioning (audience #1 — read this first)

**This demo is being built so GitGuardian and Cursor account executives can co-sell to security teams.** The primary viewer is a CISO, a Director of AppSec, or a Head of SecOps. The secondary viewer is the GitGuardian or Cursor AE running the demo. Every piece of copy, every metric, every artifact must reinforce the **"GitGuardian detects, Cursor remediates"** narrative.

### The customer's problem

GitGuardian (and every secrets scanner) is excellent at detection but stops at **"a secret was leaked, here's the incident."** What happens next is brutal manual work:

- An on-call engineer is paged.
- They find the offending commit, identify which service the secret belongs to, and manually rotate it at the issuer (AWS console, Stripe dashboard, Datadog, Snowflake, etc.).
- They publish the replacement to whatever secrets manager the org uses (Vault, AWS Secrets Manager, Doppler, 1Password).
- They open a PR removing the literals from the codebase.
- They run `git filter-repo` or `bfg` against a clone, force-push a clean history to a new branch, open a second PR for cleanup.
- They write up the incident in Jira, post it in Slack, file the audit event with the SIEM team, and update the GitGuardian incident state.

A typical response takes **2–4 hours of skilled engineer time per leak**, the org has multiple leaks per week, and during those 2–4 hours the credential is **in the wild**. Industry data says exposed cloud credentials get exploited in ~60 seconds. The current human process is not just slow — it's structurally too slow to be safe.

### What Cursor unlocks for the GitGuardian AE

The pitch the demo must make to the GitGuardian AE (and to the customer):

1. **Containment in seconds, not hours.** Cursor takes the GitGuardian incident as input and executes the full response sequence in under a minute. The window of exposure collapses from hours to seconds.
2. **Every leak gets the same gold-standard response.** Today, the response quality depends on which engineer got paged. With Cursor, every incident gets the same complete workflow (rotate + publish + cleanup PR + history purge + Jira + Slack + SIEM event), every time.
3. **The audit trail is pristine.** The "audit timeline" artifact is what GRC and the customer's auditor need to demonstrate compliance with SOC 2 CC7.1, ISO 27001 A.16, and PCI 10.2.1. Cursor produces it as a byproduct.
4. **GitGuardian's value-per-detection goes up.** Every detection now ends in containment, not just a ticket. That's the difference between a tool a customer renews because they have to and a tool they renew because it actively closes loops.

### How the demo reinforces this

- The **Full-screen "Active credential exposure"** page surfaces the live exposure clock and the breadth of the response (6 tools, 1 minute, 1 PR awaiting review).
- The **agent console** narrates containment in security vocabulary (rotate, revoke, propagate, scrub, contain, audit) so the AE's prospect hears their own platform.
- The **artifact set** centers on the **audit timeline** — the new artifact unique to this demo. It's the artifact a CISO will photograph and forward.
- A dedicated **"For the GitGuardian AE"** card on the idle page spells out the partner-rep value in three bullets (containment SLA collapse, gold-standard response per incident, audit-grade evidence by default).

If you find yourself writing copy that sounds like it's aimed at a developer audience, rewrite it. **The buyer in this demo is a security leader.**

---

## 2. Why this is being built

There is no `/partnerships/gitguardian` scroll page yet — this is the first security partnership surface on the hub. The strategic context lives in `docs/partner-demos/security-demos.md`; the short version is that security teams are an untouched stakeholder for Cursor and the **leaked-credential workflow is the highest-emotional-impact entry point**.

The story is different from every other partner demo on the hub:

- Sentry = **runtime crash**, fix via null-guards.
- Datadog = **performance regression**, fix via parallelism.
- Figma = **visual fidelity drift**, fix via token substitution.
- Databricks = **platform migration** (Informatica/Oracle → Databricks DLT).
- Snowflake = **ELT modernization** (BTEQ + T-SQL → dbt + Cortex AI).
- AWS = **monolith decomposition** (multi-week, multi-act).
- **GitGuardian = active security incident**, response via cross-tool containment + cleanup.

The surface must feel on-brand for GitGuardian (their teal/blue `#1F8FFF` and the accompanying "GG" wordmark feel), but the dominant color is **red/amber** because this is an **active incident** demo — not a code-review demo, not a migration demo. Containment color discipline is non-negotiable: red for active exposure, amber for in-progress containment, green for contained.

---

## 3. Required reading (in this repo, in order)

Before you write any code, study the reference demos and the strategy doc.

**Strategy:**

- `docs/partner-demos/security-demos.md` — the conventions section (§6) is binding for this demo.

**Page + state machine (primary reference):**

- `src/app/partnerships/sentry/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`), three conditional regions, artifact modal dispatch.
- `src/app/partnerships/datadog/demo/page.tsx` — the same machine adapted to a non-crash story. Closest shape to this brief.

**Components:**

- `src/components/sentry-demo/agent-console.tsx` — **single most important file**. Scripted step playback with channel-coded rows, timestamps, `delayMs`, `TIME_SCALE`, `onComplete`.
- `src/components/datadog-demo/agent-console.tsx` — fork with non-crash channels; pattern your channel palette after this.
- `src/components/sentry-demo/checkout-card.tsx` + `src/components/datadog-demo/reports-card.tsx` — trigger UI patterns. Yours is `commit-push-card.tsx`.
- `src/components/sentry-demo/demo-error-boundary.tsx` + `src/components/datadog-demo/demo-perf-boundary.tsx` — phase-transition wiring.
- `src/components/sentry-demo/full-error-page.tsx` + `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeover pattern.
- `src/components/sentry-demo/error-fallback.tsx` + `src/components/datadog-demo/slo-summary.tsx` — split-screen left-panel pattern.
- `src/components/sentry-demo/artifact-cards.tsx` + `src/components/datadog-demo/artifact-cards.tsx` — 4-tile CTA strip; yours is 5 tiles.
- `src/components/sentry-demo/artifacts/{macbook-frame,github-pr-preview,pr-modal,jira-ticket,triage-report}.tsx` — reusable artifact scaffolding.
- `src/components/datadog-demo/artifacts/datadog-trace.tsx` — **the benchmark for pixel-perfect partner-native UI.** Your GitGuardian incident modal must match this level of detail.

**Trigger code (the real files):**

- `src/lib/demo/order-processor.ts` + `src/lib/demo/format-payment.ts` (Sentry).
- `src/lib/demo/aggregate-orders.ts` + `src/lib/demo/region-store.ts` (Datadog).

**Webhook + reset:**

- `src/app/api/sentry-webhook/route.ts` and `src/app/api/datadog-webhook/route.ts` — signature verification, Cursor Background Agent trigger, `buildAgentPrompt`.
- `scripts/reset-sentry-demo.sh` and `scripts/reset-datadog-demo.sh` — pattern for re-seeding the starting state.

---

## 4. What the Sentry/Datadog demos do (pattern summary)

| Phase      | What renders                                                                     |
| ---------- | -------------------------------------------------------------------------------- |
| `idle`     | Hero + CTA pill + trigger card + rep-value card + comparison + guardrails.       |
| `error`    | Full-screen takeover with "Watch Cursor contain it" + "Reset". Hides everything. |
| `running`  | Split screen: compact summary left, `AgentConsole` right. Scripted steps stream. |
| `complete` | Same split screen + 5-tile `ArtifactCards` strip. Top banner flips to success.   |

Artifact modals are overlays, closable, self-contained, all wrapped in `MacbookFrame`.

Agent console `SCRIPT` is a `Step[]` with `channel`, `label`, `detail`, `delayMs`. Real time ~22s, scaled to ~60s displayed via `TIME_SCALE = 2.7` (this is *much* tighter than other demos because the *whole pitch* is sub-minute response).

**Replicate this pattern exactly. Only change vocabulary, visuals, and the trigger files.**

---

## 5. The GitGuardian demo — concept & story

### The trigger scenario

**Surface UI:** A "Push to `payments-service`" mini-app on the demo page. The hero card looks like:

> **Push commit `feat: enable Stripe production charges` to `payments-service`**
> Author: `dev@acme-fintech.com`
> Branch: `main`
> Files: `src/config/payments.ts` (modified), `src/lib/stripe-client.ts` (new)
> `[ Push to remote ]`

Below the button, render a tabbed "diff viewer" with two tabs:

1. `src/config/payments.ts` — shows the addition of an `AWS_ACCESS_KEY_ID = 'AKIA...'` literal and an `AWS_SECRET_ACCESS_KEY = '...'` literal **on the diff**.
2. `src/lib/stripe-client.ts` — shows a `STRIPE_RESTRICTED_KEY = 'rk_live_...'` literal in a `new Stripe(...)` constructor call.

When clicked, the card shows a ~3s loading state ("Pushing to origin/main…", "GitGuardian scanner attached…", "Scanning diff…"), then pivots to the full-screen **Active credential exposure** takeover.

### The fixtures (real files, reset-able)

These files are *checked into the repo* in their leaked state. The user really sees the secrets in the diff viewer. The literals must be **plausibly-shaped but provably-invalid**.

`**src/lib/demo/payments-service/config/payments.ts**` (the leaked file):

```ts
export const PAYMENT_CONFIG = {
  region: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',                                  // GitGuardian: AWS Access Key ID
  AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',           // GitGuardian: AWS Secret Access Key
  enableProductionCharges: true,
};
```

> Use the **AWS-published example credentials** from the AWS docs. They are explicitly documented as "never valid in any account" and are the canonical placeholder used by every AWS sample.

`**src/lib/demo/payments-service/lib/stripe-client.ts**` (the second leaked file):

The implementing agent should add a hardcoded `STRIPE_RESTRICTED_KEY` constant assigned to a placeholder string, then pass that constant to the `Stripe(...)` constructor. The placeholder string must have the **shape** Stripe restricted keys use (the `rk_live_` prefix, ~32 characters of base62) but must end in the literal token `EXAMPLE` so no scanner mistakes it for a real key. **Do not** include the literal in this brief; construct it in code. Suggested approach for the placeholder value:

```ts
const STRIPE_RESTRICTED_KEY = ['rk', 'live', 'X'.repeat(28), 'EXAMPLE'].join('_');
```

The diff viewer should render the assembled string verbatim so the prospect sees a believable-looking literal in the diff, while the source file itself contains no scanner-tripping substring.

> Do **not** check in a real-looking-but-random Stripe key. GitHub Push Protection (and every downstream scanner) will treat any literal that matches Stripe's published format as a real leak and block the push. The `EXAMPLE` suffix and the constructed-at-runtime pattern above are what keep this fixture safe.

`**src/lib/demo/payments-service/__after__/payments.ts**` and `**stripe-client.ts**` (the post-fix versions, used only by the diff renderer in the GitHub PR artifact, not by the runtime):

```ts
// payments.ts
import { getSecret } from '@acme/secrets';

export const PAYMENT_CONFIG = {
  region: 'us-east-1',
  AWS_ACCESS_KEY_ID: getSecret('payments-service/aws-access-key-id'),
  AWS_SECRET_ACCESS_KEY: getSecret('payments-service/aws-secret-access-key'),
  enableProductionCharges: true,
};
```

```ts
// stripe-client.ts
import Stripe from 'stripe';
import { getSecret } from '@acme/secrets';

const STRIPE_RESTRICTED_KEY = getSecret('payments-service/stripe-restricted-key');

export const stripe = new Stripe(STRIPE_RESTRICTED_KEY, { apiVersion: '2024-11-20.acacia' });
```

The diff in the PR modal is rendered from these `__before__` / `__after__` pairs.

`**src/lib/demo/payments-service/.gitleaks.toml**` (the post-fix new file the agent adds):

```toml
[allowlist]
description = "AWS-published example credentials used in tests are never valid"
regexes = [
  '''AKIAIOSFODNN7EXAMPLE''',
]
```

> Adding a `.gitleaks.toml` (or `.git-guardian-config.yml`) is the kind of tail-end hardening a real responder would do. Including it in the PR makes the artifact feel complete.

### The full-screen "Active credential exposure" takeover

Datadog/Sentry equivalent of `FullErrorPage`. Required content:

- Massive **"⚠ ACTIVE CREDENTIAL EXPOSURE"** heading. Red `#EF4444`. Pulsing.
- Top-right: a **live counter** of seconds since the secret hit `origin/main`. Starts at "00:00:03" and ticks until the user clicks the CTA. This is what tells the prospect "every second matters."
- Identity card: who pushed (`dev@acme-fintech.com`), when (now), where (`origin/main`), what files (`src/config/payments.ts`, `src/lib/stripe-client.ts`).
- Three-row "What's exposed" table:
  - `AWS Access Key` — `AKIAIO…AMPLE` — *Active in payments-prod IAM* — Severity: **P0**
  - `AWS Secret Key` — `wJalrX…EKEY` — *Paired with above* — Severity: **P0**
  - `Stripe Restricted Key` — `rk_live_…AMPLE` — *Charges scope* — Severity: **P0**
- "Detected by GitGuardian" attribution chip (GG logo, link disabled).
- Two buttons: **"Watch Cursor contain this"** (→ running phase) and **"Reset"**.

The right-hand "what would happen without Cursor" panel (small, secondary): three lines —
- *Median human response (industry):* 2h 14m
- *Time to first exploit attempt (median, AWS keys):* 60s
- *Your current exposure window:* `[live timer]`

This is the moment the prospect *feels* the gap.

### The agent console — orchestration arc

Channels your `SCRIPT` needs:

| Channel        | Label              | Hex accent   | Role in the story                                                  |
| -------------- | ------------------ | ------------ | ------------------------------------------------------------------ |
| `gitguardian`  | `gitguardian-mcp`  | `#1F8FFF`    | Fetching incident, scoring severity, fetching matched literals      |
| `aws`          | `aws-mcp`          | `#FF9900`    | IAM key rotation: mint replacement, deactivate leaked, attach deny  |
| `stripe`       | `stripe-mcp`       | `#635BFF`    | Roll restricted key, propagate new key                              |
| `vault`        | `vault-mcp`        | `#FFEC6E`    | Publish new secrets at the org's secrets manager (HashiCorp Vault)  |
| `github`       | `github-mcp`       | (white)      | Branch + commit + PR (cleanup) + branch + commit + PR (history-purge)|
| `slack`        | `slack-mcp`        | `#4A154B`    | Post in `#security-incidents`                                        |
| `jira`         | `jira-mcp`         | `#4C9AFF`    | Open + transition `CUR-SEC-2118`                                     |
| `splunk`       | `splunk-mcp`       | `#00A4E4`    | Write a structured audit event for the SIEM                          |
| `opus`         | `opus · triage`    | `#D97757`    | Long-context root-cause + response-plan reasoning                    |
| `composer`     | `composer · edit`  | accent-blue  | Scoped code edits (cleanup PR)                                       |
| `codex`        | `codex · review`   | `#10a37f`    | Patch + history-purge plan review                                    |
| `shell`        | `shell`            | accent-green | `git filter-repo`, `tsc`, `npm run lint`, `gh pr create`            |
| `done`         | `complete`         | accent-green | Terminal step                                                        |

**Target script arc (~30–34 steps, ~22s real, scaled to ~60s displayed via `TIME_SCALE = 2.7`):**

The arc must obey the conventions in `security-demos.md` §6 — specifically: **containment first, fix second.** Order:

1. **Intake (`gitguardian`):** Webhook received → fetch incident → fetch matched literals + severities → identify owning service via Asset Graph → owner = `payments-service` team.
2. **Triage (`opus`):** Model selected for long-context reasoning over the incident + repo metadata + IAM context. Forms response plan.
3. **Containment, parallel fan-out (≈ 7s of console real time, looks like ~20s displayed):**
   - `aws`: STS get-caller-identity to confirm key is the real one in the IAM Asset Graph.
   - `aws`: `aws iam create-access-key --user-name payments-service-deploy` → new keys minted.
   - `aws`: `aws iam update-access-key --access-key-id AKIAIO… --status Inactive` → leaked key inactive.
   - `aws`: Attach explicit deny SCP at the org level for the leaked key ID (belt and braces).
   - `stripe`: Roll restricted key via Stripe API (`POST /v1/api_keys/.../roll`) → new `rk_live_…` minted.
   - `vault`: Write `payments-service/aws-access-key-id`, `aws-secret-access-key`, and `stripe-restricted-key` into Vault → version 23.
4. **Propagate (`vault` → deployment):** A nudge to the Argo / Spinnaker / Kubernetes layer to roll the running pods so they pick up the new secret values from Vault. (Display only — the demo doesn't actually do this.)
5. **Code cleanup (`github` + `composer` + `codex`):**
   - `github`: Fetch repo, identify offending commit SHA, identify branch.
   - `composer`: Patch `payments.ts` and `stripe-client.ts` to read from `getSecret(...)` (the `__after__` files).
   - `composer`: Add `.gitleaks.toml` allowlist for the AWS docs example credential (so future scans don't flag it again).
   - `codex`: Review the patch — confirms no behavioral change, types preserved.
   - `shell`: `npx tsc --noEmit` ✓, `npm run lint` ✓.
   - `github`: Branch `cleanup/secret-purge-payments-service` → commit → push → PR `#3142` open (cleanup).
6. **History purge (separate, second PR — never auto-merged):**
   - `shell`: `git filter-repo --replace-text` on a workspace clone, against the leaked literals.
   - `shell`: Force-push the cleaned history to a `cleanup/history-purge-payments-service` branch (not `main`).
   - `github`: Open PR `#3143` for the history-purge, marked as **DRAFT, requires manual review and force-push approval**.
   - `codex`: Annotate the PR with "history-purge requires team consensus, do not merge without coordination" — the agent **explicitly does not execute** the dangerous step.
7. **Audit trail + ticketing fan-out (≈ 4s real):**
   - `jira`: Create `CUR-SEC-2118` (P0, Type: Security incident, Components: payments-service, IAM, Stripe).
   - `jira`: Link both PRs + the GG incident.
   - `jira`: Transition `To Triage → In Progress → Awaiting Review` (since the PRs aren't merged).
   - `slack`: Post in `#security-incidents` with a structured summary and links to all artifacts.
   - `splunk`: Index a structured event (`event_type: secret_leak.contained`, with all artifact references).
8. **Done:** Artifacts ready.

The total displayed time should land near **00:58–01:04**. The hero pitch ("under a minute") needs to be visible to the audience. Tune `TIME_SCALE` until the final timestamp lands in that band.

### The five artifact modals

All five render in a MacBook frame using the existing `src/components/sentry-demo/artifacts/macbook-frame.tsx` (or the promoted `src/components/shared/macbook-frame.tsx` if it has been extracted by the time you build this).

#### 1. GitGuardian incident modal — `gitguardian-incident.tsx`

The benchmark: `src/components/datadog-demo/artifacts/datadog-trace.tsx`. Pixel-perfect GG incident detail page. Must include:

- Top nav: GitGuardian wordmark (teal/blue `#1F8FFF`), workspace selector (`acme-fintech`), search bar, "Incidents · Sources · Policies" tabs.
- Incident header: `Incident #41822 · 3 secrets exposed in payments-service`, status pill `Resolved` (green), severity pill `Critical` (red).
- Three "Secret" rows in a stacked list:
  - `AWS IAM Access Key` — masked literal — first seen `now - 22s` — `Resolved · Rotated` chip.
  - `AWS IAM Secret Key` — masked literal — first seen `now - 22s` — `Resolved · Rotated` chip.
  - `Stripe Restricted Key` — masked literal — first seen `now - 21s` — `Resolved · Rotated` chip.
- Right sidebar:
  - **Source:** `acme-fintech/payments-service` (GitHub).
  - **Author:** `dev@acme-fintech.com`.
  - **Commit:** `f4e9a1c2` (clickable, opens nothing).
  - **First seen:** `Apr 24, 2026 14:18:03 UTC`.
  - **Resolved at:** `Apr 24, 2026 14:19:01 UTC`.
  - **MTTR:** `00:00:58`.
  - **Resolved by:** `cursor-agent` chip.
- "Activity" timeline (Datadog-style, vertical):
  - `14:18:03 · Detected · GitGuardian scanner`
  - `14:18:05 · Acknowledged · cursor-agent`
  - `14:18:11 · AWS keys rotated · cursor-agent · IAM`
  - `14:18:13 · Stripe key rolled · cursor-agent`
  - `14:18:18 · Replacements published · cursor-agent · Vault v23`
  - `14:18:42 · Cleanup PR opened · cursor-agent · #3142`
  - `14:18:55 · History-purge PR opened (draft) · cursor-agent · #3143`
  - `14:19:01 · Incident resolved · cursor-agent`
- GitGuardian dark-mode aesthetic: deep navy background, white text, blue accent on actionable elements, thin 1px borders.

#### 2. Audit timeline modal — `audit-timeline.tsx`

This artifact does not exist on any other demo. It is the **CISO-facing artifact** and the most important deliverable in this demo. Render style: a vertical chronological timeline in a clean, document-like UI (think Datadog's incident timeline, or Notion's audit log). Must include, for each step:

- Timestamp (UTC, with sub-second precision).
- Tool called (icon + name).
- Action taken (single sentence, plain English).
- Actor (`cursor-agent` chip).
- Evidence link (PR number, Jira ticket, Vault version, IAM key ID, etc.).

Header: `Audit timeline · Incident #41822 · MTTR 00:00:58`.

Footer: `Generated by Cursor agent · Cryptographically signed · SOC 2 CC7.1 evidence-grade`. (Decorative; we are not actually signing anything.)

This artifact must be the visual centerpiece of the "complete" phase. Make it look like the kind of document a security team would forward to their auditor unedited.

#### 3. Jira ticket modal — `jira-ticket.tsx`

Pixel-perfect Jira, same style as Sentry's. Ticket `CUR-SEC-2118`, P0, Type: **Security incident**. Include:

- "Description" field with a mini-summary, plus links to the GG incident and both PRs.
- "Components": `payments-service`, `IAM`, `Stripe`, `Vault`.
- "Linked PRs": `#3142` (cleanup, ready to merge), `#3143` (history-purge, draft).
- "Incident timeline" subsection mirroring the audit timeline (compressed to 6–7 rows).
- Status timeline at the top: `To Triage → In Progress → Awaiting Review` (rendered as a horizontal pill chain).
- Assignee: `cursor-agent` chip; reviewers: `@security-team`, `@payments-eng-leads`.

#### 4. GitHub cleanup PR modal — `github-pr-preview.tsx` + `pr-modal.tsx`

PR `#3142` in `acme-fintech/payments-service`. Wrapped in MacBook frame. Include:

- Title: `chore(security): remove leaked credentials, source from Vault (resolves GG #41822)`
- Body with:
  - **Summary**: one paragraph.
  - **Containment evidence**: bulleted list of all containment actions, each linking to its artifact.
  - **Files changed**: 3 (`payments.ts`, `stripe-client.ts`, `.gitleaks.toml`).
  - **Verification**: `tsc ✓`, `lint ✓`, `gitleaks scan ✓ (allowlist applied)`.
  - **Risk assessment**: blast radius (3 files, +12 −6), rollback plan, type surface unchanged.
  - **Companion PR**: `#3143` (history-purge, draft, requires team approval).
  - **Reviewer banner**: "Verified by Cursor agent".
- Files-changed tab with the diff between `__before__` and `__after__` files.
- CI: `tsc ✓`, `lint ✓`, `unit ✓`, `gitleaks ✓`, `dependency review ✓`.

#### 5. Slack incident thread modal — `slack-thread.tsx`

Pixel-perfect Slack `#security-incidents` thread. Include:

- Channel header: `#security-incidents · Live security alerts and response`.
- Top message: posted by `Cursor Agent` (with a Cursor avatar).
  - Title block: `🔒 Secret leak contained · Incident #41822 · MTTR 00:00:58`.
  - Fields:
    - **Service**: `payments-service`
    - **Author of leak**: `dev@acme-fintech.com`
    - **Severity**: P0
    - **Containment**: ✅ AWS keys rotated · ✅ Stripe key rolled · ✅ Vault v23 published
    - **Cleanup**: 📝 PR #3142 (ready) · 📝 PR #3143 (history-purge, draft)
    - **Audit**: 📋 CUR-SEC-2118 · 📊 Splunk event `8a3f…`
- Thread reply (1, posted 3s later) by `Sarah Park` (mock identity, security on-call):
  > Thanks Cursor — reviewing #3142 now. Holding #3143 until we coordinate the force-push window with payments-eng on Monday.
- Decorative "✓ Acknowledged by Sarah Park" reaction on the parent message.

The thread must look like a real Slack thread the on-call would screenshot and forward. Use Slack's exact dark-mode palette.

### Branding

- **Primary security accent (the demo dominant):** Red `#EF4444` for active exposure, Amber `#F59E0B` for in-progress containment, Green `#22C55E` for contained.
- **GitGuardian accent:** `#1F8FFF` — only on GG-attributed UI (incident modal chrome, GG logo chips on the idle page).
- **Dark glass cards** match the rest of the hub.
- **Fonts / vocabulary:** mono for credential strings, IAM ARNs, commit SHAs, and timestamps. Sans for prose.
- **Avoid:** Sentry purple, Datadog purple, Snowflake blue. The visual identity is *security-incident chic*: red/amber/green over dark, GG blue only as accent.

---

## 6. Files to create

Mirror the Sentry/Datadog structure under new directories. Keep all existing files untouched.

```
src/app/partnerships/gitguardian/page.tsx                              NEW  (CTA-only landing, hero + run-the-demo pill + rep-value bullets + guardrails summary)
src/app/partnerships/gitguardian/demo/page.tsx                         NEW  (the demo route)

src/app/api/gitguardian-webhook/route.ts                               NEW  (HMAC verify + Cursor Background Agent trigger)

src/components/gitguardian-demo/commit-push-card.tsx                   NEW  (trigger UI, the "push commit" button + diff viewer)
src/components/gitguardian-demo/demo-leak-boundary.tsx                 NEW  (intercepts the leak event)
src/components/gitguardian-demo/full-exposure-page.tsx                 NEW  (red/amber active-exposure takeover, with the live timer)
src/components/gitguardian-demo/exposure-summary.tsx                   NEW  (split-screen left panel)
src/components/gitguardian-demo/agent-console.tsx                      NEW  (fork of sentry-demo/agent-console.tsx with security channels + script)
src/components/gitguardian-demo/artifact-cards.tsx                     NEW  (5-tile CTA strip)
src/components/gitguardian-demo/mttr-comparison.tsx                    NEW  (CostComparison equivalent — human MTTR vs Cursor MTTR)
src/components/gitguardian-demo/guardrails-panel.tsx                   NEW  (containment-first, no-auto-merge, audit-grade evidence callouts)
src/components/gitguardian-demo/rep-value-card.tsx                     NEW  (the GitGuardian-AE-facing card)
src/components/gitguardian-demo/artifacts/gitguardian-incident.tsx     NEW  (pixel-perfect GG incident detail)
src/components/gitguardian-demo/artifacts/gitguardian-modal.tsx        NEW  (wraps GG incident in MacBook)
src/components/gitguardian-demo/artifacts/audit-timeline.tsx           NEW  (the new CISO-facing artifact)
src/components/gitguardian-demo/artifacts/audit-timeline-modal.tsx     NEW  (wraps audit timeline in MacBook)
src/components/gitguardian-demo/artifacts/jira-ticket.tsx              NEW  (CUR-SEC-2118 content)
src/components/gitguardian-demo/artifacts/github-pr-preview.tsx        NEW  (cleanup PR content)
src/components/gitguardian-demo/artifacts/pr-modal.tsx                 NEW
src/components/gitguardian-demo/artifacts/slack-thread.tsx             NEW  (pixel-perfect Slack thread)
src/components/gitguardian-demo/artifacts/slack-modal.tsx              NEW  (wraps Slack thread in MacBook)

src/lib/demo/payments-service/config/payments.ts                       NEW  (the leaked file — checked in in its leaked state, AWS docs example creds)
src/lib/demo/payments-service/lib/stripe-client.ts                     NEW  (the leaked file — checked in with EXAMPLE-suffixed Stripe key)
src/lib/demo/payments-service/__after__/payments.ts                    NEW  (the post-fix version, used only by the diff renderer)
src/lib/demo/payments-service/__after__/stripe-client.ts               NEW
src/lib/demo/payments-service/__after__/.gitleaks.toml                 NEW

scripts/reset-gitguardian-demo.sh                                      NEW  (re-seeds the leaked-credential fixtures)
```

**Also:**

- Add the new `security` category to `src/lib/constants.ts` (see `security-demos.md` §7).
- Add a `Shield` icon mapping for `security` in `src/components/sections/partnerships.tsx`.
- Add the GitGuardian card to the **Partnership Demo Showcase** grid in `src/components/sections/partnerships.tsx` with brand color `#1F8FFF`.
- Add `gitguardian.svg` to `public/logos/` (use the official GG wordmark).
- Update the **Partners live today** table in `README.md`.
- Update `.env.example` with `GITGUARDIAN_WEBHOOK_SECRET`.

---

## 7. Implementation order (recommended)

1. **Scaffold the route** — `src/app/partnerships/gitguardian/demo/page.tsx` with the four-phase state machine, copy-pasted from the Datadog demo as a starting skeleton.
2. **Ship the trigger path first** — `commit-push-card.tsx` + the leaked fixture files. Verify the diff viewer shows the literals on click.
3. **Wire the boundary + full-screen takeover** — make sure clicking "Push to remote" flips phase to `error` and lands on the `FullExposurePage` with the live timer.
4. **Build the agent console** — fork Datadog's, add the security channels, write the 30–34-step SCRIPT. Tune `TIME_SCALE` so the final displayed timestamp lands at 00:58–01:04.
5. **Build artifact modals in this order:** PR (cheapest, reuse Sentry/Datadog pattern) → Jira (cheapest after PR) → Slack thread → GitGuardian incident → **audit timeline** (highest-effort, biggest visual payoff). The audit timeline is the artifact the prospect will photograph; ship it last but spend the most polish on it.
6. **Side content** — MTTR comparison (Cursor 58s vs human 2h 14m), guardrails panel (containment-first, never auto-merge, audit-grade evidence), rep-value card.
7. **Webhook route** — GitGuardian signature verification, background agent trigger, `buildAgentPrompt` enforcing the containment-first sequence.
8. **Reset script + docs** — `scripts/reset-gitguardian-demo.sh` with `git checkout -- src/lib/demo/payments-service/`, then `git add + commit`. Update `README.md` partners table.
9. **Hub integration** — new `security` category in `constants.ts`, new `Shield` icon, new showcase card.
10. **Typecheck + manual walkthrough** — click through all 4 phases + all 5 modals + reset. Confirm the demo is *visually indistinguishable* between run 1 and run 2.

---

## 8. Design requirements (non-negotiable)

- **Repeatability:** Same click, same visible result, every time. No real network calls in the scripted console. No `Math.random()` in the displayed playback. Timestamps are derived from the cumulative `delayMs × TIME_SCALE` just like the other demos.
- **Containment first, fix second.** Per `security-demos.md` §6, the first 5+ steps in the script must be containment (rotate, revoke, propagate). Code edits do not start until containment is complete.
- **Never auto-merge.** Both the cleanup PR and the history-purge PR must be visibly marked as awaiting human review. The history-purge PR must be **draft** in the artifact modal. The agent console must explicitly call out that the dangerous force-push step is *not* executed by the agent.
- **The live timer is the secret weapon.** The timer on the full-screen takeover and on the GG incident modal is what makes the prospect *feel* the time-criticality. Render it as a real `setInterval` on the takeover page. Freeze it at `00:00:58` on the GG incident modal (resolved time).
- **No real secrets, ever.** Use AWS-published example credentials and the `EXAMPLE`-suffixed Stripe pattern. CI scanners will be running on this repo; do not check in anything that could be flagged as a real leak.
- **On-brand language:** "containment", "rotate", "revoke", "propagate", "scrub", "purge history", "MTTR", "blast radius", "audit-grade evidence", "compensating control". Avoid developer-vocabulary words like "bug", "crash", "patch" on the security surfaces.
- **Single-page, no auth:** Don't require login. Don't require API keys client-side. The webhook route is the only place env vars are read.
- **Safety-by-default in the prompt:** Exactly like the Sentry/Datadog `buildAgentPrompt`, the GG webhook prompt must enforce the step sequence (intake → containment → propagate → cleanup → history-purge-as-draft → ticketing → audit) and require evidence for every step in the PR body.

---

## 9. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

Fork the shape of `src/app/api/datadog-webhook/route.ts` exactly. Replace Datadog vocabulary with GitGuardian vocabulary. Required steps in order:

1. **GitGuardian MCP intake.** Fetch incident detail, list of matched literals (with redaction), source repo, owning team, severity. Record the incident ID — it goes in every downstream artifact.
2. **Containment fan-out.** In **parallel**:
   - **AWS MCP**: `aws iam create-access-key` for the affected user/role; `aws iam update-access-key --status Inactive` for the leaked key; attach an explicit deny SCP for the leaked key ID.
   - **Stripe MCP** (or Stripe REST API): roll the restricted key.
   - **Vault MCP** (or Vault REST API): write the new credentials at the canonical paths the service expects.
3. **Code cleanup (GitHub MCP + shell).** Read the offending commit. Read the offending files. Patch each occurrence to read from `getSecret(...)`. Add a `.gitleaks.toml` allowlist for any AWS-published example credentials in tests. Open a cleanup PR.
4. **History purge plan (GitHub MCP + shell, never executed against `main`).** In a workspace clone, run `git filter-repo --replace-text` against the leaked literals. Force-push to a *new* branch, never to `main`. Open a draft PR titled `chore(security): purge leaked credentials from history (REQUIRES TEAM APPROVAL)`.
5. **Static verification.** `npm run lint`, `npx tsc --noEmit`, `gitleaks detect`. Iterate until clean.
6. **Ticketing + audit fan-out.** In parallel: open Jira, link both PRs and the GG incident; post Slack summary; emit Splunk audit event.
7. **Mark GitGuardian incident resolved.** GG MCP — set incident state to `Resolved`, attach the cleanup PR URL.
8. **Generate the audit timeline document.** Write to `docs/security-incidents/<incident-id>.md`. Attach it to the cleanup PR.

Make the prompt explicit that the agent **must** hit every step and cite evidence in the PR body from each step. Make the prompt explicit that **the history-purge PR must remain draft and must not be merged by the agent under any circumstances.** This is the contract that keeps behavior safe across real runs.

---

## 10. Acceptance criteria

Demo is ready to ship when:

- `/partnerships/gitguardian/demo` loads with hero + CTA pill + commit-push card + diff viewer.
- Clicking **Push to remote** shows a realistic ~3s loading state, then pivots to the full-screen exposure page with the live ticking timer.
- Clicking **Watch Cursor contain this** starts the scripted console which plays ~30 channel-coded steps in ~22s real time with displayed timestamps landing at 00:58–01:04.
- Console completion transitions to `complete` phase and reveals five artifact cards.
- Each artifact modal opens, renders pixel-perfect, and closes without leaking state.
- The audit timeline modal looks like a document a CISO would forward to their auditor.
- The history-purge PR is visibly marked as draft and requires manual review.
- **Reset** in the nav returns the demo to clean `idle` across all phases.
- Running the demo twice in a row produces identical output.
- `npx tsc --noEmit` passes.
- `gitleaks detect` (or whatever the repo's secret scanner is) does not flag any of the demo fixtures (the AWS docs example credentials and the `EXAMPLE`-suffixed Stripe key are explicitly safe).
- No external links leak out of any modal.
- `scripts/reset-gitguardian-demo.sh` restores the leaked-credential state after a real PR merge.
- The new `security` category renders on the homepage with the GitGuardian partner card and the matching showcase tile.

---

## 11. Anti-patterns / things to avoid

- ❌ **Don't** use real-looking but random secrets. Use AWS-published example credentials and the `EXAMPLE`-suffixed Stripe pattern. A real-looking-but-random Stripe key is the kind of thing that *looks* like a real leak to a downstream scanner.
- ❌ **Don't** auto-execute the history purge. The agent must open a draft PR, then stop. Force-pushing to `main` is the kind of thing that ends a security demo's credibility instantly.
- ❌ **Don't** make the agent console non-deterministic.
- ❌ **Don't** show a generic "error" page. This is a **security incident**, not a crash. Use security vocabulary, security colors (red → amber → green), and a live exposure clock.
- ❌ **Don't** put the audit timeline in a tiny font or buried tab. It is *the* artifact this demo is selling. Make it the visual centerpiece of the complete phase.
- ❌ **Don't** reuse Sentry/Datadog/Snowflake purple. The dominant color is red/amber/green; GG blue is *accent only*.
- ❌ **Don't** skip the MacBook frame for any artifact modal. It's the visual signature of every demo on the hub and must be consistent here.
- ❌ **Don't** delete or modify any other partner's demo files.
- ❌ **Don't** hardcode any real credential anywhere in client *or* server code. Webhook secret is env-driven, server-side only.

---

## 12. Quick reference — Datadog-demo files → GitGuardian-demo files

| Datadog                                  | GitGuardian                                                |
| ---------------------------------------- | ---------------------------------------------------------- |
| `reports-card.tsx`                       | `commit-push-card.tsx`                                     |
| `demo-perf-boundary.tsx`                 | `demo-leak-boundary.tsx`                                   |
| `full-slo-breach-page.tsx`               | `full-exposure-page.tsx` (with the live timer)             |
| `slo-summary.tsx`                        | `exposure-summary.tsx`                                     |
| `agent-console.tsx`                      | `agent-console.tsx` (security channels + script)           |
| `artifact-cards.tsx`                     | `artifact-cards.tsx` (5 tiles, not 4)                      |
| `artifacts/datadog-trace.tsx`            | `artifacts/gitguardian-incident.tsx`                       |
| `artifacts/datadog-modal.tsx`            | `artifacts/gitguardian-modal.tsx`                          |
| `artifacts/triage-report.tsx`            | `artifacts/audit-timeline.tsx` (different shape, see §5.2) |
| —                                        | `artifacts/audit-timeline-modal.tsx`                       |
| `artifacts/jira-ticket.tsx`              | `artifacts/jira-ticket.tsx` (CUR-SEC-2118)                 |
| `artifacts/github-pr-preview.tsx`        | `artifacts/github-pr-preview.tsx` (cleanup PR)             |
| `artifacts/pr-modal.tsx`                 | `artifacts/pr-modal.tsx`                                   |
| —                                        | `artifacts/slack-thread.tsx`                               |
| —                                        | `artifacts/slack-modal.tsx`                                |
| `latency-comparison.tsx`                 | `mttr-comparison.tsx`                                      |
| `guardrails-panel.tsx`                   | `guardrails-panel.tsx` (different content)                 |
| `src/lib/demo/aggregate-orders.ts` +     | `src/lib/demo/payments-service/config/payments.ts` +       |
| `src/lib/demo/region-store.ts`           | `src/lib/demo/payments-service/lib/stripe-client.ts`       |
| `src/app/api/datadog-webhook/route.ts`   | `src/app/api/gitguardian-webhook/route.ts`                 |
| `scripts/reset-datadog-demo.sh`          | `scripts/reset-gitguardian-demo.sh`                        |

---

## 13. Ship it

Build the demo. Typecheck clean. Manually click through all four phases and all five modals twice in a row. Commit on the existing security-demo branch (or a new `partner-demos-gitguardian` branch). Open a draft PR against `main` titled **"feat: GitGuardian live containment + cleanup demo"** with a body matching the Datadog PR's structure. Include screenshots of: (1) full-screen exposure page mid-timer, (2) running split-screen with agent console mid-fan-out, (3) completed state with all five artifact cards visible, (4) each of the five modals open — especially the audit timeline.
