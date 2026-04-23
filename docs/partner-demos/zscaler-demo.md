# Zscaler Live Zero-Trust Policy-as-Code Demo — Build Brief

> **Purpose of this document:** Self-contained spec for a new Cursor agent to build an interactive demo at `/partnerships/zscaler/demo`. Patterned on the Sentry/Datadog demos but with a distinctly different "AHA" angle — this demo is about closing the gap between a **security architect's intent** and **production zero-trust policy enforcement**, by having Cursor translate plain-English access requests into reviewed, tested, and rolled-out **Policy-as-Code** changes across Zscaler ZIA + ZPA + branch firewalls + the underlying Terraform.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes Zscaler + Cursor orchestration end-to-end:

1. A user lands on `/partnerships/zscaler/demo`. The hero is a **secure-access intake form**, styled as a security-team service-portal request: *"Engineering team Phoenix needs access to the new analytics warehouse (`warehouse.acme-internal.net:5439`) for 12 named members, source must be hardened laptops only, time-bound to 90 days, with audit-trail to SIEM."* This is the kind of ticket security teams get every week.
2. Below the form, a glanceable **Zscaler Admin Console** preview showing the org's current ZIA + ZPA posture: 312 active access policies, 47 application segments, 14 connector groups, last policy push 2h ago.
3. The user clicks **"Convert request to policy"**. ~3 seconds of "Cursor agent reviewing intent…" indicator. Then pivots to a full-screen takeover: a **policy-impact preview** showing exactly what will be created and modified across ZIA, ZPA, the branch firewall, the SCIM group, the Terraform IaC, and the audit-pipeline integrations — with affected user count, blast radius, conflict checks against existing policies, and a least-privilege analysis.
4. The user clicks **"Watch Cursor implement zero-trust"**. Split screen: live Zscaler Admin Console on the left (segments, policies, and connectors animating into place), agent console on the right.
5. The agent: pulls org context via Zscaler MCP (existing application segments, access policies, identity providers), drafts the ZPA application segment + access policy + posture profile in **Policy-as-Code** (Terraform + JSON), opens a PR against the IaC repo, runs `terraform plan` against staging, validates with conflict-detection + least-privilege analysis + lateral-movement simulation, applies to staging, runs an automated access-validation test (12 simulated user logins against the resource), opens a separate change-management ticket for production rollout (with the staging evidence attached), updates the SCIM group, and posts back to the requestor.
6. When complete, four artifact modals are clickable: **Zscaler Admin Console (after-state with the new ZPA policy)**, **Terraform PR (the Policy-as-Code change)**, **Access-validation report** (the simulated-login evidence), and **Change-management ticket** (the production-rollout request with all staging evidence attached).
7. Reset returns to clean state. `scripts/reset-zscaler-demo.sh` re-seeds the policy snapshot.

**The "AHA":** *"Cursor took an English access request and shipped a reviewable, audit-ready zero-trust policy with simulated-user evidence — and correctly stopped short of pushing to production without change-management approval."* This lands hard with security architects, who currently spend the bulk of their week translating intent → ZPA console clicks → IaC → review → change-management → push.

---

## 1. Why this demo, why this angle

Zscaler is the largest enterprise zero-trust player. Its enterprise customers are not buying "fix my crash" tooling. They're buying **policy enforcement, audit trail, and least-privilege at scale**. The most impactful agentic story for Zscaler is therefore very different from the Sentry/Datadog/PD/Cloudflare incident-response shape:

- **Intent → Policy-as-Code → review → simulate → change-management.** This is the actual zero-trust workflow.
- The "AHA" isn't speed alone; it's that an agent can be **trusted to draft policy** because it generates **evidence** (simulated-user logins, lateral-movement analysis, conflict checks, IaC diff) and **stops short of production push without change-management**.
- This demo positions Cursor as the **least-privilege policy authoring layer** Zscaler has needed.

Three deliberate constraints to lean into hard:

- **No production push from the agent.** Production rollout always requires change-management approval. The demo *must* show this. (This is the credibility floor for security architects.)
- **Always staging first, with simulated-user validation evidence.**
- **All policies authored as code, reviewed via PR, never via console clicks.**

---

## 2. Required reading

- `src/app/partnerships/datadog/demo/page.tsx` — closest existing pattern.
- `docs/partner-demos/cloudflare-demo.md` — for the security-flavored guardrails framing.
- `src/components/datadog-demo/agent-console.tsx` — fork target.
- `src/components/sentry-demo/artifacts/{macbook-frame,github-pr-preview}.tsx`.

---

## 3. The demo — concept & story

### Trigger UI (idle phase)

A **security-team service-portal request form**, pre-filled with the realistic intake:

- Form chrome: Acme security-team logo, "Access Request" header, request-ID `SEC-7821`.
- Pre-filled fields:
  - **Requesting team:** Phoenix (Engineering)
  - **Resource:** `warehouse.acme-internal.net:5439` (Snowflake replica)
  - **Justification:** "Q2 analytics workload; source: warehouse-eng@acme.com PR #4291."
  - **Members:** 12 named users (display 4, "+ 8 more").
  - **Source posture requirements:** Hardened laptops only (managed device, FIPS-validated disk encryption, current OS patches, sanctioned browser).
  - **Time-bound:** 90 days, auto-revoke.
  - **Audit:** SIEM ingest required.
  - **Approver:** `security-architects@acme` (already approved · pre-signed).
- Below the form: a glanceable **Zscaler Admin Console** preview with org posture stats (312 access policies, 47 application segments, 14 connector groups, last policy push 2h ago, 0 policy violations in 7d).
- Bottom-right CTA: `[ Convert request to policy ]` (Zscaler-blue gradient).

Below the fold:

- **Time-to-policy comparison card** (analog of `cost-comparison.tsx`):
  - Without Cursor: ticket lands → security architect reviews 1d → manual ZPA policy draft 4h → PR review 1d → staging push 0.5d → simulate 0.5d → change-management 1d → prod push 0.5d → **~5 business days, manual ZPA console clicks throughout**.
  - With Cursor agent: ticket lands → policy + IaC PR + simulated evidence in **6 minutes**. Change-management ticket auto-opens with all evidence attached. Human reviewer approves 1 ticket, prod push 1-click.
  - Subhead: "From access intent to staged-and-validated policy in minutes. Production push always still gated on change-management."
- **Guardrails panel** (this is the most important guardrails panel of any demo in this suite):
  - "Agent never authors policy via console clicks. **Policy-as-Code only**. Every change is a Terraform PR."
  - "Agent **never pushes to production**. Staging push only; change-management ticket auto-opens for prod."
  - "Default to **least privilege**. Agent flags any rule broader than the request, with explanation."
  - "Conflict detection: agent runs `terraform plan` + cross-policy diff before opening PR."
  - "Lateral-movement simulation: every new ZPA policy gets a simulated path analysis to flag privilege escalation."
  - "Identity binding: every policy maps to a SCIM group, never to individuals."
  - "Time-bound enforcement: every policy carries an `expires_at`. Agent sets calendar reminders + auto-revoke jobs."
  - "All actions audited to SIEM."

### The plan (planning takeover)

When the user clicks **Convert request to policy**, ~3s "Cursor agent reviewing intent…" indicator (with security-friendly steps animating: "Parsing access intent · Cross-checking existing policies · Computing blast radius · Running least-privilege analysis"). Then pivot to a full-screen **policy-impact preview**:

- Top: SEC-7821 request title.
- Body grid:
  - **What will be created:**
    - 1 new ZPA Application Segment: `warehouse-prod-readonly` (CIDR + port).
    - 1 new ZPA Access Policy: `phoenix-warehouse-90day` (SCIM group: `phoenix-q2-analytics`, posture: `hardened-laptop-v3`, action: `Allow`, expires: 90 days).
    - 1 new Posture Profile reference (use existing `hardened-laptop-v3`, no new profile created).
    - 1 new SCIM group: `phoenix-q2-analytics` (12 members).
    - 1 Terraform module update + lockfile update.
    - 1 Splunk index destination annotation (audit ingest).
  - **What will be modified:**
    - The `app-segments-warehouse.tf` file (+ lockfile).
    - The `access-policies-engineering.tf` file.
    - The branch-firewall whitelist for `warehouse.acme-internal.net` (Cisco-Meraki MCP touch).
  - **Blast radius:** 12 users gain access to 1 resource. 0 other policies affected. 0 conflicts detected.
  - **Least-privilege analysis:** PASS — request matches granted (no scope expansion).
  - **Lateral-movement check:** PASS — granted access does not enable any new path to higher-privilege resources.
- Two CTAs at bottom: **`[ Watch Cursor implement zero-trust ]`** (primary, Zscaler blue) and **`[ Reset ]`**.

### The orchestration (running phase)

Split screen:

- **Left:** the **live Zscaler Admin Console**. Tabs: `Application Segments · Access Policies · Posture Profiles · Connectors · Audit Log`. As the agent works, the console populates: a new application-segment row appears in the segments tab, then a new access-policy row appears in the policies tab, then the audit log ticks new entries. Each entry has a `cursor-agent` actor pill. Rows animate in with a subtle slide-from-right.
- **Right:** scripted agent console.

### Channels

| Channel        | Label                  | Hex accent | Role                                                           |
| -------------- | ---------------------- | ---------- | -------------------------------------------------------------- |
| `zscaler`      | `zscaler-mcp`          | `#0072CE`  | Read org segments, policies, posture; staging push             |
| `terraform`    | `terraform-mcp`        | `#7B42BC`  | Init/plan/apply against the IaC repo (staging workspace)       |
| `github`       | `github-mcp`           | (white)    | Branch + PR for the Terraform IaC                              |
| `okta` / `scim`| `scim-mcp`             | `#007DC1`  | Create + populate the SCIM group                               |
| `meraki`       | `branch-firewall-mcp`  | `#1BA0D7`  | Branch-firewall whitelist update                               |
| `siem`         | `splunk-mcp`           | `#65A637`  | Audit ingest annotation                                        |
| `change-mgmt`  | `servicenow-mcp`       | `#62D84E`  | Auto-open the production-rollout change request                |
| `slack`        | `slack-mcp`            | `#4A154B`  | DM the requestor with status                                   |
| `opus`         | `opus · plan`          | `#D97757`  | Intent parsing + least-privilege + lateral-movement reasoning  |
| `composer`     | `composer · author`    | blue       | Author the Terraform + JSON policy                             |
| `codex`        | `codex · review`       | `#10a37f`  | Pre-PR policy review                                           |
| `simulate`     | `simulate · 12 logins` | `#F59E0B`  | Run 12 simulated user logins against the staged resource       |
| `done`         | `complete`             | green      | Terminal step                                                  |

### Target script arc (~32 steps, ~24s real, scaled to ~6m displayed)

1. **Intake (zscaler):** Fetch org segments, policies, posture profiles, connector groups. Build context.
2. **Plan (opus):** Parse the intent. Compute the minimum policy surface that satisfies it. Output the plan shown on the takeover page (1 segment, 1 policy, 1 SCIM group, 1 firewall change). Cross-check against existing policies for conflicts. Run least-privilege analysis. Run lateral-movement simulation.
3. **Author (composer):**
   - Author the new application-segment Terraform block.
   - Author the new access-policy Terraform block (with `expires_at`, posture binding, SCIM group binding).
   - Update the lockfile.
4. **Review (codex):** Confirm `Allow` action is the minimum required, posture binding is correct, expires_at is 90 days from today, SCIM group binding is correct.
5. **Branch + PR (github):** Branch `policy/sec-7821-phoenix-warehouse`, commit, push, open PR. Title: `policy(SEC-7821): grant phoenix-q2-analytics 90d access to warehouse-prod-readonly`. PR body includes the full policy-impact preview, the lateral-movement analysis, the SCIM group spec, and the simulation plan.
6. **Terraform plan (terraform):** Run `terraform plan` against staging workspace. Show the plan summary inline.
7. **Apply (terraform):** Apply against staging only.
8. **SCIM (scim):** Create `phoenix-q2-analytics` group, populate with 12 members.
9. **Branch firewall (meraki):** Add `warehouse.acme-internal.net` to the engineering-branch firewall whitelist. (One row.)
10. **SIEM (splunk):** Annotate audit-ingest destination for the new policy.
11. **Simulate (simulate):** Run 12 simulated user logins against the staged resource. Each login a row in the console: `simulating · martinez@acme · hardened-laptop posture · ALLOW · 412ms`. 12 rows total. All ALLOW. Plus 2 negative-test rows (a non-member should be DENIED, a member on a non-hardened laptop should be DENIED) — these are the demo's most credible moments.
12. **Change-management (change-mgmt):** Auto-open ServiceNow CHG-94821 with all staging evidence attached: PR link, terraform plan, terraform apply log, 14 simulation results (12 allow + 2 expected deny). Set approver group to `security-architects@acme`.
13. **Slack (slack):** DM the requestor: "SEC-7821 staged + validated. Production push gated on CHG-94821 (auto-opened, awaiting `security-architects@acme` approval)."
14. **Done.** Recap.

### The four artifact modals

All MacBook-framed.

1. **Zscaler Admin Console (`zscaler-console.tsx`)** — pixel-perfect Zscaler ZPA admin UI, after-state. Tabs at the top, the new policy visible in the Access Policies list with the `cursor-agent` author pill and the `expires: 90d` annotation. Audit-log tab shows the agent's per-action trail. Right sidebar shows policy details, member list (12), posture binding, SIEM destination.

2. **Terraform PR (`pr-modal.tsx`)** — wraps `github-pr-preview.tsx` in MacBook. PR title: `policy(SEC-7821): grant phoenix-q2-analytics 90d access to warehouse-prod-readonly`. Body must include:
   - Linked SEC-7821 intake.
   - Full policy-impact preview (least-privilege analysis, lateral-movement check, blast radius).
   - `terraform plan` summary.
   - Diff: 2 files changed (one new app-segment block, one new access-policy block) + lockfile.
   - CI: `terraform fmt ✓`, `terraform validate ✓`, `tflint ✓`, `policy-as-code-tests ✓`.
   - "Staging applied · Awaiting CHG-94821 for production" banner at top.

3. **Access-validation report (`access-validation-report.tsx`)** — a structured table showing the 14 simulated logins (12 ALLOW + 2 expected DENY). Each row: simulated user, posture, source IP, decision, reason, latency. Below: a small chart of decision distribution. This is the demo's most novel artifact — it's the *evidence* security architects have always wanted but rarely get from automation.

4. **Change-management ticket (`change-mgmt-ticket.tsx`)** — pixel-perfect ServiceNow change-request page. Type: Standard, Risk: Low, Approval state: Pending, Approvers: `security-architects@acme`. Attachments: PR link, terraform plan, simulation report. Pre-implementation checklist auto-checked by `cursor-agent` (PR opened ✓, staging applied ✓, simulation passed ✓, SIEM annotated ✓). Post-implementation checklist (pending human): production apply, post-deploy validation, requester notification.

### Branding

- **Primary accent:** Zscaler blue `#0072CE`. Use for primary CTAs, the admin-console chrome, and the policy-impact preview header.
- **Audit/secondary:** Zscaler dark navy `#1A1F2E` for the console background.
- **Status colors:** Allow = green, Deny = red, Pending change-management = amber, Expired = gray.
- **Vocabulary:** "application segment", "access policy", "posture profile", "connector", "SCIM group", "least privilege", "lateral movement", "Policy-as-Code", "change-management", "audit trail", "ZIA / ZPA". Avoid PD's "incident", Sentry's "issue".
- **Avoid:** Cloudflare orange, Sentry/Datadog purple, magenta. Zscaler is blue + dark navy.

---

## 4. Files to create

```
src/app/partnerships/zscaler/page.tsx                                    NEW
src/app/partnerships/zscaler/demo/page.tsx                               NEW
src/app/api/zscaler-webhook/route.ts                                     NEW (note: less webhook-driven; this is intent-driven from a form)

src/components/zscaler-demo/access-request-form.tsx                      NEW (idle: pre-filled SEC-7821 intake)
src/components/zscaler-demo/admin-console-preview.tsx                    NEW (idle: glanceable Zscaler posture summary)
src/components/zscaler-demo/intent-review-overlay.tsx                    NEW (~3s "Cursor reviewing intent" indicator)
src/components/zscaler-demo/policy-impact-page.tsx                       NEW (full-screen policy-impact preview takeover)
src/components/zscaler-demo/live-admin-console.tsx                       NEW (split-screen left: console populating in real time)
src/components/zscaler-demo/agent-console.tsx                            NEW (forked, Zscaler channels)
src/components/zscaler-demo/artifact-cards.tsx                           NEW
src/components/zscaler-demo/time-to-policy-card.tsx                      NEW (idle-phase value card)
src/components/zscaler-demo/guardrails-panel.tsx                         NEW (the most-elaborate guardrails panel of the suite)
src/components/zscaler-demo/artifacts/zscaler-console.tsx                NEW (pixel-perfect ZPA admin)
src/components/zscaler-demo/artifacts/zscaler-modal.tsx                  NEW
src/components/zscaler-demo/artifacts/github-pr-preview.tsx              NEW (Terraform-PR-specific copy)
src/components/zscaler-demo/artifacts/pr-modal.tsx                       NEW
src/components/zscaler-demo/artifacts/access-validation-report.tsx       NEW (the 14-row simulation report)
src/components/zscaler-demo/artifacts/access-validation-modal.tsx        NEW
src/components/zscaler-demo/artifacts/change-mgmt-ticket.tsx             NEW (pixel-perfect ServiceNow change request)
src/components/zscaler-demo/artifacts/change-mgmt-modal.tsx              NEW

src/lib/demo/zscaler-policy-fixture.ts                                   NEW (the org context + access request + simulation results)
scripts/reset-zscaler-demo.sh                                            NEW
```

**Also:**

- Add `Zscaler` to `src/lib/constants.ts` (likely under `devtools` or a new `security` category).
- Add `public/logos/zscaler.svg`.
- Update README.

---

## 5. Implementation order

1. Build the policy fixture **first** — the org's existing 312 policies (just enough to render plausibly), the SEC-7821 access request, the intended new policy as Terraform + JSON, the 14 simulation results.
2. Scaffold the route + four-phase state machine.
3. Build the access-request form. This must look like a real internal security portal, not a generic form. Pre-filled fields, request-ID, signed approver.
4. Build the admin-console preview. Brief — just enough to look like Zscaler.
5. Build the policy-impact preview takeover. The blast-radius / least-privilege / lateral-movement panel is the most novel UI — invest here.
6. Build the live admin console for the running phase. Application segments and access policies populating in real time as the agent acts.
7. Build the agent console (fork Datadog's).
8. Artifacts in this order: PR (cheap, fork from existing) → Access-validation report (table-heavy, medium effort) → Change-mgmt ticket (ServiceNow chrome) → Zscaler Admin Console (the hardest pixel-perfect target).
9. Side content + webhook + reset.
10. Typecheck, walk through twice, screenshots.

---

## 6. Acceptance criteria

- `/partnerships/zscaler/demo` loads with the SEC-7821 form + admin-console preview + time-to-policy card + guardrails panel.
- Clicking **Convert request to policy** runs the ~3s intent-review indicator, then pivots to the full-screen policy-impact preview.
- The impact preview clearly shows: 1 segment, 1 policy, 1 SCIM group, 1 firewall change, blast radius, least-privilege PASS, lateral-movement PASS.
- Clicking **Watch Cursor implement zero-trust** opens the split screen.
- The live admin console populates: a new app-segment row, a new access-policy row, audit-log entries, all in lockstep with the agent script.
- The agent console clearly shows the simulation step running 14 rows (12 ALLOW + 2 expected DENY).
- The script clearly shows the agent **stopping at staging** and opening a change-management ticket for production.
- All 4 artifacts open and look pixel-correct.
- The change-mgmt ticket shows pre-impl checks auto-checked and post-impl checks pending human.
- Reset returns to clean idle.
- `tsc --noEmit` and `lint` pass.
- Twice-run identical playback.

---

## 7. Anti-patterns

- ❌ **Don't have the agent push to production.** This is the demo's credibility floor. Production push must always go through change-management. Show the auto-opened ticket as the *final* artifact.
- ❌ **Don't have the agent author policy via console clicks.** Always Policy-as-Code, always Terraform PR.
- ❌ **Don't skip the simulation step.** Simulated-user-login evidence is the most novel and credible thing in this demo. Don't shortchange it (12 + 2 rows minimum).
- ❌ **Don't bind the policy to individual user emails.** Always to a SCIM group. Always.
- ❌ **Don't forget `expires_at`.** Time-bound policies are a pillar of zero-trust; the demo collapses if Cursor's policy is open-ended.
- ❌ **Don't reuse a Cloudflare or Datadog dashboard chrome.** Zscaler's admin UI is genuinely distinctive — application-segment-centric, deep navy with blue accents, table-heavy.
- ❌ **Don't underbuild the guardrails panel.** Of all six demos, this is the one where the guardrails are the most strategically important. Read like a CISO would have written them.

---

## 8. Webhook prompt (`buildAgentPrompt`)

This demo is intent-driven (form-submitted), not webhook-driven, but the prompt structure is the same. Required steps in order:

1. **Intake.** Pull org context via Zscaler MCP: existing application segments, access policies, posture profiles, connector groups, identity-provider bindings.
2. **Parse intent.** Translate the access request into a minimum-policy surface (segment + policy + SCIM group + firewall change as needed). Always default to least privilege.
3. **Conflict + lateral-movement analysis.** Cross-check the proposed policy against existing policies. Run lateral-movement simulation. Block authoring if either fails.
4. **Author (Policy-as-Code).** Generate Terraform + JSON for the new resources. Bind to SCIM group, never individuals. Always include `expires_at`. Include posture binding.
5. **PR.** Open a PR in the IaC repo. PR body must include: full policy-impact preview, conflict-check results, lateral-movement analysis, simulation plan.
6. **Staging apply.** `terraform plan` then `terraform apply` against the staging workspace only.
7. **Validate.** Run simulated logins (positive + negative tests). Block change-management ticket if any unexpected result.
8. **Auxiliary updates.** SCIM group create + populate. Branch-firewall whitelist update. SIEM annotation.
9. **Change-management.** Auto-open a production-rollout change-request with all staging evidence attached. Set approver group; **never auto-approve**.
10. **Notify requester.** Slack DM with status + change-request link.

The prompt must enforce: **never push to production**, **never author via console clicks**, **always least privilege**, **always SCIM group binding**, **always `expires_at`**, **always staging-first with simulation evidence**, **always change-management for production**, **all actions audited to SIEM**.
