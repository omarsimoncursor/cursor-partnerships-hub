# Zscaler Live Zero-Trust Triage & Fix Demo — Build Brief

> **Purpose of this document:** Self-contained spec for an interactive live-fix demo at `/partnerships/zscaler/demo`. Read it end-to-end before writing any code. The accuracy of this workflow is the whole point of the demo: this is what real Zscaler customers actually do.

---

## 0. TL;DR for the agent

Build a repeatable, click-to-run demo that dramatizes the **real** Zscaler + Cursor orchestration:

1. A user lands on `/partnerships/zscaler/demo` and clicks **Run policy conformance probe**.
2. The probe reads the customer's actual ZPA Terraform module (`infrastructure/zscaler/workforce-admin.tf`) from disk, parses the access rule, and replays four canonical access requests through it. Three of the four fail because the rule has only an APP condition — no SCIM_GROUP, POSTURE, TRUSTED_NETWORK, or CLIENT_TYPE blocks.
3. The UI pivots to a full-screen **Zero Trust violation** takeover.
4. Zscaler ZPA (mocked) detects the broad-scope segment in real time. ZPA Policy Engine fires a webhook to Cursor.
5. A scripted "agent console" plays on the right half of the screen showing Cursor orchestrating: Zscaler MCP → Okta MCP → ServiceNow MCP → GitHub MCP → Opus triage → Composer edit → Codex review → terraform fmt + validate + plan → tfsec/checkov → policy-conformance probe → PR opened → ServiceNow case updated.
6. When the run completes, the user can click through four pixel-perfect artifact modals: **Zscaler ZPA console**, **Triage report**, **ServiceNow Security Operations case**, and **GitHub PR with HCL diff + terraform plan + probe output** (inside a MacBook frame).
7. Reset button returns the demo to clean state. `scripts/reset-zscaler-demo.sh` re-seeds the .tf to the under-conditioned state after a real PR merges.

**The demo must behave identically every time it runs.** All agent work is scripted playback. Only the underlying .tf file and the conformance probe are real.

---

## 1. Why this is being built (and what we got wrong before)

The first cut of this demo (PR #10) used a TypeScript "policy" file with wildcards. **That was inaccurate.** Real ZPA access policies do not live in application code. They live in the Zscaler control plane and, for any mature enterprise, are managed via the **official `zscaler/zpa` Terraform provider**.

This rebuild reflects how a real Zscaler customer actually triages a Zero Trust violation:

1. ZPA Risk Operations gets paged.
2. The on-call security engineer cannot directly fix the rule because it is in code.
3. A ticket bounces to the platform team that owns the Terraform module.
4. A platform engineer opens the .tf, drafts the missing conditions, runs `terraform plan`, opens a PR.
5. Security reviews and approves the PR.
6. Atlantis runs `terraform apply` on merge.

That handoff takes **2 to 3 business days** in most organizations. Cursor compresses steps 2 to 5 to about two minutes without changing the human approval gate.

---

## 2. Required reading (in this repo, in order)

Before you write any code, study the Datadog demo. It is the closest pattern reference.

**Page + state machine:**

- `src/app/partnerships/datadog/demo/page.tsx` — state machine (`idle` → `error` → `running` → `complete`).

**Components:**

- `src/components/datadog-demo/reports-card.tsx` — trigger UI pattern.
- `src/components/datadog-demo/demo-perf-boundary.tsx` — error interception via React Error Boundary.
- `src/components/datadog-demo/full-slo-breach-page.tsx` — full-screen takeover pattern.
- `src/components/datadog-demo/slo-summary.tsx` — split-screen summary pattern.
- `src/components/datadog-demo/agent-console.tsx` — **the single most important file to study**. Scripted step playback.
- `src/components/datadog-demo/artifacts/*` — pixel-perfect artifact modals + MacBook frame.

**Webhook + reset:**

- `src/app/api/datadog-webhook/route.ts` — webhook signature verification + background agent trigger + `buildAgentPrompt`.
- `scripts/reset-datadog-demo.sh` — re-seeds the bug after a real PR merges.

---

## 3. The Zscaler workflow — concept & story

### 3.1 The customer's IaC reality

A real Zscaler customer has a Terraform module that looks roughly like this:

```
infrastructure/zscaler/
├── versions.tf       # required_providers { zpa = "zscaler/zpa" ~> 4.4 }
├── data.tf           # zpa_idp_controller, zpa_scim_groups, zpa_posture_profile, zpa_trusted_network
└── workforce-admin.tf  # zpa_application_segment + zpa_policy_access_rule resources
```

The buggy access rule looks like this (real `zscaler/zpa` provider syntax):

```hcl
resource "zpa_policy_access_rule" "workforce_admin_audit_logs_allow" {
  name        = "workforce-admin-audit-logs-allow"
  action      = "ALLOW"
  operator    = "AND"

  conditions {
    operator = "OR"
    operands {
      object_type = "APP"
      lhs         = "id"
      rhs         = zpa_application_segment.workforce_admin_audit_logs.id
    }
  }
}
```

The bug: the rule only declares an **APP** condition. ZPA evaluates a missing SCIM_GROUP, POSTURE, TRUSTED_NETWORK, or CLIENT_TYPE condition as "any". So any authenticated user from any device on any network using any client can reach the segment.

The fix adds the missing condition blocks (each as a separate `conditions { ... }` block, joined by the rule's top-level `operator = "AND"`):

```hcl
conditions {
  operator = "OR"
  operands {
    object_type = "SCIM_GROUP"
    lhs = data.zpa_idp_controller.okta_prod.id
    rhs = data.zpa_scim_groups.security_admin.id
  }
  operands {
    object_type = "SCIM_GROUP"
    lhs = data.zpa_idp_controller.okta_prod.id
    rhs = data.zpa_scim_groups.compliance_officer.id
  }
}

conditions {
  operator = "AND"
  operands {
    object_type = "POSTURE"
    lhs = data.zpa_posture_profile.managed_compliant.posture_udid
    rhs = "true"
  }
}

conditions {
  operator = "AND"
  operands {
    object_type = "TRUSTED_NETWORK"
    lhs = data.zpa_trusted_network.corp_egress.network_id
    rhs = "true"
  }
}

conditions {
  operator = "OR"
  operands {
    object_type = "CLIENT_TYPE"
    lhs = "id"
    rhs = "zpn_client_type_zapp"
  }
}
```

`terraform plan` against this change produces an **in-place update only** (no destroy, no recreate, no app-segment churn). That property is critical for the demo — the agent must verify it before opening the PR.

### 3.2 The trigger surface

**Card title:** "ZPA-as-Code · Conformance"
**CTA:** "Run policy conformance probe"

When clicked, the card calls `/api/zscaler/policy-conformance`. That route:

1. Reads `infrastructure/zscaler/workforce-admin.tf` from disk.
2. Parses the `zpa_policy_access_rule` resource using a small (just-enough) HCL subparser (`src/lib/demo/zpa-policy-conformance.ts`).
3. Replays four canonical access requests through the rule's conditions.
4. Returns `{ scope, probe, allPass: false }` and a 422.

The card detects the failure and immediately throws a `ZeroTrustViolationError`, pivoting to the full-screen Zero Trust violation takeover.

### 3.3 The full-screen violation page

- Big "ZPA access rule has no SCIM, posture, or network conditions." heading.
- Zscaler blue accent (`#0079D5` primary, `#65B5F2` light text on dark).
- Line: `infrastructure/zscaler/workforce-admin.tf` · resource `zpa_policy_access_rule.workforce_admin_audit_logs_allow`.
- Subtext: "The rule is `action = "ALLOW"` with only an APP condition. No SCIM_GROUP, no POSTURE, no TRUSTED_NETWORK, no CLIENT_TYPE."
- Two buttons: **"Watch Cursor scope this policy"** → running phase, and **"Reset"**.

### 3.4 The orchestration (scripted console playback)

Channels the SCRIPT needs:

| Channel     | Label              | Hex accent | Role in the story                                       |
| ----------- | ------------------ | ---------- | ------------------------------------------------------- |
| `zscaler`   | `zscaler-mcp`      | `#0079D5`  | ZPA Policy Engine + ZIA traffic + segment intake        |
| `okta`      | `okta-mcp`         | `#007DC1`  | SCIM group resolution for least-privilege allow-list    |
| `github`    | `github-mcp`       | (white)    | git log on the IaC path, PR creation                    |
| `servicenow`| `servicenow-mcp`   | `#81B5A1`  | SecOps case lifecycle, playbook state, review queue     |
| `shell`     | `shell`            | green      | git, file IO, conformance probe runner                  |
| `terraform` | `terraform`        | `#7B42BC`  | terraform fmt / validate / plan + tfsec/checkov         |
| `opus`      | `opus · triage`    | `#D97757`  | Long-context root-cause reasoning                       |
| `composer`  | `composer · edit`  | blue       | Scoped HCL edits                                        |
| `codex`     | `codex · review`   | `#10a37f`  | Patch review / least-privilege check                    |
| `codegen`   | `codegen`          | blue       | Triage report generation                                |
| `done`      | `complete`         | green      | Terminal step                                           |

**Target script arc (~30 steps, ~22s real, scaled to ~2:30 displayed via `TIME_SCALE = 6.9`):**

1. **Intake (zscaler):** ZPA risk event → ZIA web log slice → segment + IaC owner cross-reference.
2. **Identity (okta):** Resolve SCIM groups for the least-privilege allow-list.
3. **Incident (servicenow):** SecOps case `SIR0005712` created.
4. **Opus triage:** Pull commit history of the IaC path. Identify regression commit. Form hypothesis.
5. **Codegen:** Triage report written to `docs/triage/2026-04-23-zerotrust-violation-workforce-admin.md`.
6. **Composer edit:** Read `workforce-admin.tf`. Add SCIM_GROUP, POSTURE, TRUSTED_NETWORK, CLIENT_TYPE conditions.
7. **Codex review:** No destructive plan changes, operator AND across blocks, style + provider conventions OK.
8. **Verification:**
   - `terraform fmt -check` ✓
   - `terraform validate` ✓
   - `terraform plan -out=tfplan` → `~ 1 to change · 0 add · 0 destroy`
   - `tfsec` + `checkov` → AVD-ZPA-001 resolved
   - Conformance probe (4 simulated requests) → 4/4 pass
   - Scope recompute: `4,287 → 18 users · 238.2× narrower · 0 unmanaged-device paths`
9. **PR:** Branch `sec/scope-down-workforce-admin-zpa` → commit → push → PR #213.
10. **ServiceNow:** `SIR0005712 → Awaiting Security Review`.
11. **Done:** Artifacts ready.

### 3.5 The four artifact modals

All four render in a MacBook frame.

1. **Zscaler ZPA console modal** — pixel-perfect Zero Trust Exchange Admin Portal:
   - Top nav with Zscaler logo, cloud selector, search bar.
   - Page title: `Policy Violation — workforce-admin / audit-logs`.
   - Risk score `Critical · 92/100` with sparkline.
   - Scope card: `4,287 in scope · intent 18 · 238.2x over`.
   - Posture donut: 50% unmanaged / 38% noncompliant / 12% compliant.
   - **Rule conditions card** with side-by-side current vs recommended (APP-only vs APP + SCIM_GROUP + POSTURE + TRUSTED_NETWORK + CLIENT_TYPE).
   - Right sidebar: ZPA segment, policy ID, IaC source (`infrastructure/zscaler/workforce-admin.tf`, provider `zscaler/zpa ~> 4.4`, drift state), deployment marker, related risk events.
   - Deep navy background, white-blue text, blue primary actions.

2. **Triage report modal** — markdown via `react-markdown` + `remark-gfm`. Includes a "How this enterprise normally triages this" table that contrasts the 2-3 day human path with the 2m 14s agent run.

3. **ServiceNow Security Operations modal** — pixel-perfect ServiceNow Security Incident Response workspace. Case `SIR0005712`, Critical, ZPA Zero Trust Violation. Must include: ServiceNow top chrome, Security Operations Workspace nav, left rail, case header, summary metric cards, agent-generated evidence packet, playbook steps, assignment card, related records, and an activity stream with Cursor Agent, Zscaler ZPA, and Okta integration comments.

4. **GitHub PR modal** — pixel-perfect PR #213. Includes:
   - Title: `sec(zpa): scope down workforce-admin-audit-logs ALLOW rule (4,287 → 18 in scope)`
   - **HCL diff** (real `zscaler/zpa` provider syntax).
   - **`terraform plan` output** (in-place update only).
   - **Conformance probe output** (4-row table).
   - CI checks: `terraform-fmt`, `terraform-validate`, `terraform-plan`, `tfsec + checkov`, `zpa-policy-conformance`.
   - Reviewers: codex-bot (approved), @risk-ops (requested).
   - Labels: `zero-trust`, `terraform`, `sec-p1`, `auto-fix`, `zscaler-triage`.

### 3.6 Branding

- **Primary:** Zscaler blue `#0079D5`, deeper `#0E5DA8`, light `#65B5F2`.
- **Risk / violation:** Amber `#F5A623`.
- **Critical:** Red `#FF4757`.
- **Success:** Green `#4ADE80`.
- **Terraform channel accent:** `#7B42BC` (HashiCorp purple).
- **Avoid:** Don't reuse Datadog purple, Sentry purple, or any other partner accent.

---

## 4. Files

```
docs/partner-demos/zscaler-demo.md                                       (this file)

infrastructure/zscaler/versions.tf                                       NEW — provider pin
infrastructure/zscaler/data.tf                                           NEW — IdP / SCIM / posture / network data sources
infrastructure/zscaler/workforce-admin.tf                                NEW — buggy access rule + app segment

src/lib/demo/zpa-policy-conformance.ts                                   NEW — HCL subparser + evaluator + 4-request probe
src/app/api/zscaler/policy-conformance/route.ts                          NEW — runs the probe against the .tf
src/app/api/zscaler-webhook/route.ts                                     NEW — webhook + IaC-aware buildAgentPrompt

src/app/partnerships/zscaler/page.tsx                                    NEW — narrative thesis page (with the 6-step today-vs-Cursor table)
src/app/partnerships/zscaler/demo/page.tsx                               NEW — 4-phase state machine

src/components/zscaler-demo/audit-card.tsx                               NEW — trigger card
src/components/zscaler-demo/demo-zerotrust-boundary.tsx                  NEW — React Error Boundary
src/components/zscaler-demo/full-violation-page.tsx                      NEW — full-screen takeover
src/components/zscaler-demo/violation-summary.tsx                        NEW — split-screen left panel
src/components/zscaler-demo/agent-console.tsx                            NEW — scripted IaC playback
src/components/zscaler-demo/artifact-cards.tsx                           NEW — four-tile completion grid
src/components/zscaler-demo/risk-comparison.tsx                          NEW — before/after scope table
src/components/zscaler-demo/guardrails-panel.tsx                         NEW — IaC-specific guardrails
src/components/zscaler-demo/artifacts/macbook-frame.tsx                  NEW — MacBook chrome
src/components/zscaler-demo/artifacts/zscaler-console.tsx                NEW — pixel-perfect ZPA Admin Portal
src/components/zscaler-demo/artifacts/zscaler-modal.tsx                  NEW — wraps console in MacBook
src/components/zscaler-demo/artifacts/triage-report.tsx                  NEW — markdown report
src/components/zscaler-demo/artifacts/servicenow-case.tsx                NEW — SIR0005712
src/components/zscaler-demo/artifacts/github-pr-preview.tsx              NEW — PR #213 with HCL diff + plan + probe
src/components/zscaler-demo/artifacts/pr-modal.tsx                       NEW

scripts/reset-zscaler-demo.sh                                            NEW — re-seeds the under-conditioned .tf
public/logos/zscaler.svg                                                 NEW — wordmark
```

Also: register Zscaler in `src/lib/constants.ts`, `src/components/sections/partnerships.tsx`, and the README.

---

## 5. Webhook prompt (`buildAgentPrompt`) — what the real agent must do

The webhook prompt MUST make these things explicit:

1. **ZPA access rules live in Terraform**, NOT in application code. The agent's fix is HCL.
2. The agent must read the customer's IaC root (provided in the payload as `iac_path`, default `infrastructure/zscaler/`).
3. The agent must NOT touch application code under `src/`.
4. The 8-step sequence is non-negotiable:
   1. Zscaler MCP intake (risk event + ZIA log + segment + IaC owner)
   2. Okta MCP for SCIM group resolution
   3. GitHub MCP regression hunt on the IaC path
   4. Read the .tf, write a hypothesis
   5. Patch (add SCIM_GROUP / POSTURE / TRUSTED_NETWORK / CLIENT_TYPE conditions, wire to existing data sources)
   6. `terraform fmt -check` + `terraform validate` + `terraform plan` (must be in-place-only) + `tfsec`/`checkov` + conformance probe (4 simulated requests, deny-by-default restored)
   7. Open PR with HCL diff + plan + probe + evidence + risk assessment
   8. ServiceNow → Awaiting Security Review

If the app segment is not IaC-managed, Cursor should not invent a GitHub PR. The fallback path is: use Zscaler MCP to draft the ZPA policy delta, open or update the ServiceNow security case, attach the proposed ZPA API payload and evidence packet, and wait for human approval in the Zscaler control plane. This demo chooses the Terraform path because it is the strongest Cursor Agents showcase for mature enterprises.

---

## 6. Acceptance criteria

Demo is ready when:

- `/partnerships/zscaler/demo` loads with hero + CTA pill + audit card.
- Clicking **Run policy conformance probe** reads the real `.tf` from disk, parses it, runs the 4-request probe, and the failing probe pivots to the full-screen violation page.
- Clicking **Watch Cursor scope this policy** starts the scripted console which plays ~30 channel-coded steps in ~22s real time, displayed timestamps scaling to ~2:30.
- Console completion transitions to `complete` and reveals four artifact cards.
- Each artifact modal opens, renders pixel-perfect, and closes without leaking state.
- The Zscaler ZPA console modal shows the IaC source (Terraform-managed, file path, drift state) prominently.
- The GitHub PR modal shows real HCL diff, real `terraform plan` output (`~ 1 to change · 0 add · 0 destroy`), and the 4-row conformance probe output.
- **Reset** in the nav returns the demo to clean `idle`.
- Running the demo twice in a row produces identical output.
- `npx tsc --noEmit` passes; `npm run build` succeeds.
- No external links leak out of any modal.
- `scripts/reset-zscaler-demo.sh` restores the under-conditioned `.tf` after a real fix PR merges.

---

## 7. Anti-patterns / things to avoid

- **Don't** put the policy in application code. ZPA policies live in Terraform.
- **Don't** invent HCL syntax. The `zscaler/zpa` provider has a documented schema (`zpa_policy_access_rule` with `conditions { operands { object_type = ... } }` blocks). Use it accurately.
- **Don't** show a "destroy and recreate" plan. The fix must be in-place-only — that is what makes it safe to merge.
- **Don't** invent SCIM group names that don't justify the intent. Tie the allow-list to actual Okta groups (`security-admin`, `compliance-officer`).
- **Don't** make the agent console non-deterministic. No `setTimeout(…, Math.random()…)`. No real HTTP calls during playback.
- **Don't** reuse Datadog purple, Sentry purple, or any other partner accent.
- **Don't** skip the human approval gate. The agent proposes; the reviewer ships; Atlantis applies. That is the whole point.
- **Don't** edit application code in the agent script. The `src/` tree is unrelated to this incident.
