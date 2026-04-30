# Security Partner Demos — Strategy & Candidate Landscape

> **Purpose of this document:** A planning brief for the next wave of partner demos on the Cursor Partnerships Hub, focused on **enterprise security teams**. It covers the strategic thesis (why security is the next stakeholder Cursor should be selling to), the partner candidate landscape (organized by integration surface — MCP, webhook, API), and concrete example workflows. One of these workflows (GitGuardian) is fully spec'd as a separate build brief at `docs/partner-demos/gitguardian-demo.md` and is the recommended "ship first" demo. The rest are scoped at the level of a half-page per partner so a future agent can pick whichever ones are most strategic and turn them into full briefs in the same shape.

---

## 0. The thesis

Every partner demo currently on the hub sells Cursor to **engineering buyers**: SREs (Datadog, Sentry), platform/data engineers (Snowflake, Databricks), application developers (GitHub, GitLab), designers + frontend engineers (Figma), and infrastructure/migration leads (AWS). That covers most of the people who already write code.

The largest **untouched** stakeholder in an enterprise is the **security team** — and they are uniquely starved for the exact thing Cursor is best at:

1. **Tons of disparate tools that don't talk to each other.** A typical Fortune 500 security org runs 60–130 separate vendors: SAST, SCA, secrets scanners, DAST, ASPM, CSPM, CNAPP, EDR, XDR, SIEM, SOAR, CASB, ZTNA, IDP, IGA, vuln scanners, threat intel, attack surface management, third-party risk, GRC, ticketing. Most pairs of these have no native integration.
2. **A backlog of alerts that humans cannot triage.** SOCs routinely sit on 10k–100k open findings. Mean time to triage (MTTT) for non-critical findings is measured in weeks. The signal-to-noise ratio is so bad that real incidents get buried.
3. **Root cause lives in code.** A leaked secret, a vulnerable dependency, an over-permissive IAM role, a misconfigured S3 bucket, an injection sink — the *fix* almost always lives in a repo the security team doesn't own and can't touch directly. That ownership boundary is where most security tools stop and where a coding agent starts.
4. **They already pay for the data.** Cursor doesn't have to sell the underlying detection — that's already a line item. Cursor sells the **automated response** that closes the loop the customer is currently closing manually (or not at all).

**The pitch to a CISO is the same pitch we make to a VP Eng, recolored:** "You already pay $X million a year for tools that produce findings. Cursor turns those findings into merged PRs, automatically, with audit-grade evidence. Your tools become 5–10× more effective without changing a single line item in your budget."

**The pitch to a security partner (Wiz, CrowdStrike, Snyk, GitGuardian, etc.) is even cleaner:** "Your product currently stops at 'we found something'. Cursor extends your product to 'and we fixed it'. That's a feature your competitors can't ship, and we'll co-sell into your installed base to prove it."

**The pitch to Cursor's GTM:** every security tool we plug into is a new co-sell motion into a stakeholder (the CISO) who controls a budget that **does not currently fund developer tooling**. That's net-new ARR, not cannibalized ARR.

---

## 1. Why agents are uniquely good at security response

Security response shares four properties that make it the highest-leverage agentic-workflow surface in the enterprise:

| Property                         | Why it matters for an agent                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pattern-rich, repetitive         | A leaked AWS key, a vulnerable `lodash` version, a missing CORS check, a public S3 bucket — the same shape recurs across thousands of repos. Models pattern-match these trivially. |
| Cross-tool correlation required  | Real root cause requires data from 3–8 systems (alert + repo + IDP + cloud + ticketing + comms). Humans context-switch slowly. Agents fan out across MCPs in parallel.            |
| Time-sensitive                   | A leaked secret is exploited in **~60 seconds** on average. Containment that takes hours is functionally a breach.                                                                |
| Low ambiguity in remediation     | "Rotate this credential", "bump this version", "add this null check", "narrow this IAM policy" — the *space of correct fixes* is small and verifiable.                            |

A human SOC analyst is bottlenecked by the speed of context-switching across browser tabs. A Cursor agent is bottlenecked by network round-trips. The speedup is 100–1000×, and the agent never gets paged at 3am.

---

## 2. Integration surfaces (how Cursor talks to the partner)

Each candidate partner is reachable through one or more of these surfaces. The choice of surface dictates how the demo is staged.

### 2.1 MCP (Model Context Protocol)
The agent calls the partner's MCP server during its run to fetch findings, repo context, asset graphs, identity context, etc. Best surface for **read-heavy, cross-tool reasoning**.
- Examples that already exist publicly: GitHub, GitLab, Sentry, Datadog, PagerDuty, Slack, Jira, Linear, Notion.
- Examples we should expect to see ship: Wiz, Snyk, CrowdStrike Falcon, Splunk, Okta, GitGuardian, 1Password, HashiCorp Vault.

### 2.2 Webhook (push)
The partner POSTs to a Cursor-hosted endpoint when something happens; the endpoint kicks off a Cursor Background Agent. Best surface for **event-driven response**.
- Pattern already shipped in this repo: `src/app/api/sentry-webhook/route.ts`, `src/app/api/datadog-webhook/route.ts` — both verify HMAC, normalize payload, call `https://api.cursor.com/v1/agents/background`.
- All major security vendors emit webhooks: Wiz, Snyk, CrowdStrike, GitGuardian, Okta System Log streams, AWS GuardDuty (via EventBridge), Cloudflare, Zscaler.

### 2.3 REST API (poll/pull or batch)
For partners without an MCP server **and** without good webhooks (or with rate-limited webhooks), Cursor agents can call the partner's REST API directly during their run. Less elegant than MCP but works for any vendor that exposes JSON.
- Useful as a **bridge** while waiting for a real MCP integration.
- Useful for **batch backlog burn-down** ("triage every Wiz finding older than 30 days") where push doesn't make sense.

### 2.4 SIEM / SOAR (the chassis)
Splunk, Chronicle, Sentinel, Panther, Tines, Torq — the orchestration layer most security teams already use. Cursor doesn't replace these; it **becomes a step in their playbook**. The pitch: their SOAR routes the alert and gathers context; Cursor is the one playbook step that *writes the code change*.

### 2.5 Source-of-truth pull (read-only repo + cloud access)
The agent reads from GitHub/GitLab and the cloud provider directly. Necessary for almost every demo because the **fix** is a repo PR (or an IaC PR or a policy PR), not a SaaS API call.

---

## 3. Partner candidates (by category)

These are organized by the **kind of finding** the partner produces. For each, the table notes the integration surface and a one-sentence "what Cursor automates" pitch. Boldface partners are the ones recommended for full build briefs after the GitGuardian flagship ships.

### 3.1 Secrets scanning & credential exposure
The cleanest agentic story in security: a leaked credential is a single, atomic, time-critical event with a small set of correct responses (rotate + revoke + remove from history + close the leak path). Detection-to-merged-PR can be sub-minute end-to-end.

| Partner          | Surface         | Workflow Cursor automates                                                                                                       |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **GitGuardian**  | Webhook + API   | Push event triggers GG → GG webhooks Cursor → agent rotates the credential at the issuer, opens PR removing the literal, scrubs git history, links the GG incident, files Jira, posts in Slack. **(See `gitguardian-demo.md` for the full build brief.)** |
| TruffleHog       | API + CLI       | Same shape as GitGuardian, optimized for self-hosted teams.                                                                     |
| Doppler / 1Password Secrets / HashiCorp Vault | MCP + API | Agent reads the leaked secret name from GG/TruffleHog, mints a replacement in the secrets manager, rolls it into CI + the running deployment, then opens the cleanup PR. |

### 3.2 SAST / SCA / ASPM (vulnerabilities in code & dependencies)
Highest **volume** surface — these tools produce thousands of findings per scan. Cursor's job is backlog burn-down: cluster, prioritize, and ship PRs in batches.

| Partner          | Surface         | Workflow Cursor automates                                                                                                       |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Snyk**         | MCP + Webhook + API | New vuln in `lodash@4.17.20` → Cursor reads the lockfile, plans the upgrade path (including the breaking change in `_.merge`), runs the test suite, opens a PR with the diff + Snyk advisory + risk classification. |
| **Semgrep**      | API + CLI       | A new rule firing across 47 files → Cursor reads each match, applies the auto-fix where one exists, requests review where it doesn't, opens **one** umbrella PR with per-file commits. |
| GitHub Dependabot / Advanced Security | MCP | Cursor handles the long-tail Dependabot PRs Dependabot itself can't merge (test failures, breaking changes); turns them into ready-to-merge PRs. |
| Veracode / Checkmarx / Sonatype | API   | Same backlog-burn-down play, larger and more enterprise. Customer's existing Veracode contract becomes a Cursor land. |
| **Endor Labs** / Apiiro / Arnica | MCP + Webhook | ASPM tools rank findings by reachability + exploitability. Cursor takes the ranked queue and ships PRs in priority order, citing the exploit chain. |
| Socket.dev       | Webhook + API   | A typosquatted dependency lands in a PR → Socket alerts → Cursor's agent comments on the PR with the safer alternative, optionally rewrites the import. |

### 3.3 Cloud security (CSPM / CNAPP / CWPP)
The "Wiz / Orca / Lacework / Prisma Cloud" tier. Findings are about **runtime cloud configuration** — public buckets, over-permissive IAM, exposed databases, misconfigured security groups. The fix is almost always a Terraform/CloudFormation/Pulumi PR.

| Partner          | Surface         | Workflow Cursor automates                                                                                                       |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Wiz**          | Webhook + API + (forthcoming MCP) | Wiz finds a public S3 bucket holding PII → Cursor reads the IaC repo, locates the resource definition, generates a least-privilege policy PR + a public-access-block PR + a Jira ticket linked to the Wiz issue, and posts a containment note in Slack. |
| Orca / Lacework / Prisma Cloud | API | Same shape as Wiz with vendor-specific severity scoring.                                                                       |
| AWS Security Hub / GuardDuty | EventBridge | A GuardDuty `UnauthorizedAccess:IAMUser/InstanceCredentialExfiltrationOutsideAWS` finding → Cursor revokes the instance role's session token, attaches an explicit deny, opens a Terraform PR to delete the role, and files an incident. |
| Defender for Cloud (Azure) / SCC (GCP) | API | Equivalent for the other two clouds.                                                                                           |
| Tenable / Qualys / Rapid7 | API     | Long-running vuln scanners. Cursor's job is batch ticket triage: cluster duplicate findings, attach owning team, generate the upgrade PR.|

### 3.4 IAM / Identity / Access (IDP, IGA, PAM)
Findings here are about *who can do what*. The fix is usually a policy diff, an SCIM change, or a group-membership change.

| Partner          | Surface         | Workflow Cursor automates                                                                                                       |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Okta**         | System Log webhook + API | Anomalous auth pattern (impossible-travel, MFA fatigue) → Cursor reads the System Log, correlates with the user's recent commits + cloud activity, force-revokes sessions, files a P1 ticket, and (if the anomaly looks like a compromise) generates a "rotate everything this user touched in the last 24h" remediation plan. |
| Microsoft Entra / Auth0 | API     | Equivalent.                                                                                                                    |
| **CyberArk / BeyondTrust / Teleport** | API | A privileged-access just-in-time request landed without the right approver chain → Cursor builds the approval chain, requests it via Slack, audits the resulting session.|
| Sailpoint / Saviynt | API        | Quarterly access reviews. Cursor reads the IGA report and produces a PR to the IaC that enforces the recertified entitlements. |

### 3.5 EDR / XDR (endpoint + extended detection)
Endpoints are far from Cursor's home turf, but the **enrichment + ticketing + post-incident hardening** parts are still in scope.

| Partner            | Surface         | Workflow Cursor automates                                                                                                     |
| ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **CrowdStrike Falcon** | API (Falcon) + Webhook (Stream) | A detection on a developer laptop → Cursor pulls the process tree from CrowdStrike, correlates against the code that developer pushed in the last 24h, opens a PR removing the suspicious dependency, and updates the Falcon detection metadata with the fix link. |
| SentinelOne / Defender for Endpoint / Huntress | API | Equivalent.                                                                                                                  |

### 3.6 Network / Zero-trust / Edge
The "Zscaler" tier the user originally asked about. Findings here are about **traffic** — DLP violations, sanctioned/unsanctioned SaaS, egress to bad infra, WAF blocks, bot traffic.

| Partner            | Surface         | Workflow Cursor automates                                                                                                     |
| ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Zscaler**        | API (ZIA + ZPA) + Webhook | A DLP policy fires on a large file egress from a developer laptop → Cursor pulls the file metadata, reads the repo it came from, identifies whether it was a real leak or a false positive, and either opens a Zscaler exception ticket (with cited evidence) or files a P1 incident. |
| Cloudflare (WAF / Access / Zero Trust) | API + MCP | A spike in WAF blocks on an API endpoint → Cursor reads the endpoint's code, identifies the input validation gap, opens a PR adding the missing validation + a corresponding WAF rule update.|
| Palo Alto Prisma Access / Netskope | API | Equivalent.                                                                                                                  |

### 3.7 SIEM / SOAR / Detection-as-Code
The "chassis" partners. Cursor doesn't replace these; it becomes the playbook step that closes the loop.

| Partner            | Surface         | Workflow Cursor automates                                                                                                     |
| ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Splunk** (incl. SOAR / Phantom) | API + Webhook | A correlation search fires → Splunk SOAR routes it → one of the playbook steps is "POST to Cursor's `/api/cursor-respond` with the Splunk event" → Cursor takes the structured event, runs the agent, posts a structured response back into Splunk SOAR for audit. |
| Chronicle (Google) / Microsoft Sentinel / Panther | API | Equivalent — Cursor lives as a SOAR-callable step.                                                                            |
| Tines / Torq / Swimlane | API + Webhook | Pure-orchestration partners. Easiest integration: drop a "Run Cursor agent" action into their connector library.              |
| **Detection-as-code** repos (Sigma / YARA-L) | GitHub MCP | Cursor agents author *new* detections from a written incident description; this becomes a first-class workflow for security engineering teams (analogous to TDD). |

### 3.8 GRC / Compliance / Audit
The slowest-moving, most paperwork-heavy corner of security. High latent value: each audit finding is an open ticket sitting in Vanta/Drata for weeks.

| Partner          | Surface         | Workflow Cursor automates                                                                                                     |
| ---------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Vanta / Drata / Secureframe** | Webhook + API | An automated control fails (e.g. "S3 bucket without server-side encryption") → Cursor reads the IaC, opens a PR enabling SSE-KMS, links the PR to the control test, and marks the control as remediated when the PR merges. |
| AuditBoard / OneTrust | API     | Higher-end GRC. Cursor's role is to take findings from the underlying scanners and convert them into evidence packets the GRC tool can attach to a control.|

### 3.9 Email / phishing / fraud
Less of a code-fix surface, more of an **enrichment + response** surface.

| Partner            | Surface         | Workflow Cursor automates                                                                                                     |
| ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Abnormal Security / Material Security / Proofpoint | API | A spear-phishing detection on a developer's account → Cursor correlates with the developer's recent commits/PRs, identifies any commits that may have been pushed under coercion, and locks them behind required-review.|

---

## 4. Two cross-cutting "force-multiplier" demos

These don't have a single partner — they tie *several* of the above together. They are the strongest demos in this whole document for selling the **"agents that close the loop across tools that don't currently integrate"** thesis.

### 4.1 The "60-second secret" demo (recommended flagship)

**Trigger:** A developer accidentally commits an AWS access key + a Stripe restricted key in the same commit. They `git push`.

**T+0s** GitGuardian (or TruffleHog) detects the leak, fires its webhook to Cursor.
**T+5s** Cursor agent fans out: AWS MCP / IAM API → mint a replacement access key, mark the leaked one inactive. Stripe MCP/API → roll the restricted key, propagate the new one into Vault. Vault MCP → update the secret + bump the version.
**T+18s** Cursor agent reads the offending commit, opens a PR that removes the literals, swaps in `process.env.AWS_ACCESS_KEY_ID` references, and adds a pre-commit hook reference.
**T+22s** Cursor agent runs `git filter-repo` (or `bfg`) in a workspace clone, force-pushes a clean history to a `cleanup/secret-purge-<sha>` branch (never to `main`), opens the cleanup PR.
**T+30s** Slack message in `#security-incidents` summarizing what happened, with links to: the GitGuardian incident, the AWS key rotation, the Stripe key rotation, the Vault version bump, the code-cleanup PR, the history-purge PR, the Jira ticket, and the SIEM event.

**Total wall time:** under a minute. **Human intervention:** review and approve the PRs (Cursor can't merge to `main` without human review by design).

This is the demo that has the **single highest emotional impact** on a CISO. We should ship it first. Full build brief at `docs/partner-demos/gitguardian-demo.md`.

### 4.2 The "noisy CSPM backlog burn-down" demo

**Trigger:** A "Run weekly cloud posture review" button. The mock Wiz console shows 1,247 open findings, mostly stale — the kind of backlog every customer of every CSPM has.

**T+0s** Cursor agent pulls all 1,247 findings via Wiz API.
**T+8s** Agent buckets findings: 412 are dupes of 23 root issues; 188 are already remediated but the finding never closed; 67 are about resources that no longer exist; 580 are real and remediable; the rest need human review.
**T+25s** For the 580 real findings, agent identifies the IaC repo of record (Terraform module + path), groups by module, generates **23 PRs** — one per module — each PR fixes a cluster of findings and links each finding it closes.
**T+45s** Agent posts a single Slack thread: "1,247 → 23 PRs · 580 findings will close on merge · 467 findings auto-archived as duplicate/stale/no-longer-applicable · 200 require human review (linked here)."

**The selling moment:** the AE shows the prospect their *own* dashboard count, then the Cursor "after" screenshot of 23 PRs. The story sells itself.

This is a clean **second** demo to ship. It complements the GitGuardian flagship by showing the **batch / backlog** side of the same value prop. The flagship sells the **time-critical / event-driven** side.

---

## 5. Recommended sequencing

Build briefs to write in order, given finite agent attention:

1. **GitGuardian (60-second secret) — `docs/partner-demos/gitguardian-demo.md` (already written).** Highest-emotional-impact, cleanest narrative, smallest surface area. Ship this first.
2. **Wiz (CSPM batch burn-down).** Highest-revenue partner in the security space, biggest "unblocks an installed base" story.
3. **Snyk (vulnerability remediation).** Closest analog to the existing Sentry/Datadog demos so it's the cheapest to scaffold; great for the developer-focused security buyer (AppSec).
4. **CrowdStrike (endpoint → repo correlation).** Hardest visual, biggest brand. Save for when the demo pattern is well-rehearsed; this one wants a custom artifact (Falcon process-tree visualization).
5. **Splunk SOAR (Cursor as a playbook step).** Strategic; sells Cursor into a *category* (every SOAR's customer base) rather than into a single partner. Good third or fourth.
6. **Okta (identity anomaly response).** Great if/when there's an account-exec ask; the workflow is compelling but the visual story is harder to dramatize than a code PR.

---

## 6. Conventions for any new security demo

Every security demo on the hub should hit these consistency bars (in addition to the existing `CONTRIBUTING.md` rules):

- **Containment first, fix second.** The agent's first 3–5 console steps must always be containment (rotate / revoke / quarantine), *before* any code edit. This mirrors how a real security responder works and is what a CISO will be looking for when evaluating the demo.
- **Evidence-grade audit trail.** Every action the agent takes must show up in a "audit timeline" artifact — a chronological list with timestamps, the tool called, the change made, and the actor (`cursor-agent`). This is what a security team will hand to their auditor. Reuse the `triage-report.tsx` pattern but render it as a timeline.
- **Never auto-merge.** Security demos must visibly stop at "PR opened, awaiting human review". Auto-merge to `main` is a non-starter for any security buyer; the demo must reinforce that the agent's job is to do all the work *up to* the human-judgment moment, not past it.
- **Cite the regression source where applicable.** When the root cause is a developer commit (leaked secret, bad dependency bump, IaC change), the artifact must call out the commit SHA and author so the customer's incident review can use it directly.
- **Show the cross-tool fan-out.** A single-partner demo undersells the agent. The most compelling moment is when the console rapidly fires `wiz-mcp` → `aws-mcp` → `vault-mcp` → `github-mcp` → `slack-mcp` in 5 seconds, doing what would take a human responder an hour of tab-switching. Every demo's `SCRIPT` should have at least one such fan-out burst.
- **CISO-friendly hero copy.** The hero of every security demo should answer one question in one sentence: *"What is this demo claiming Cursor will let my team stop doing?"* Avoid Cursor-internal vocabulary on these surfaces; use the security buyer's vocabulary (containment, MTTR, mean time to remediate, blast radius, attack surface, posture, compensating control, etc.).
- **Color discipline.** Reserve **red** for active incidents only — a finding mid-triage is **amber**, a contained finding is **green**, a closed finding is **slate/text-tertiary**. This matches every SOC console the prospect has ever used and makes the demo feel native.
- **Reset script.** Same convention as the rest of the hub: every demo that mutates a fixture file ships with `scripts/reset-<partner>-demo.sh` so the demo is rehearsable twice in a row.

---

## 7. Hub integration (when these ship)

When a security demo ships:

1. Add the partner to `src/lib/constants.ts` under a **new `security` category** (alongside `cloud`, `devtools`, `consulting`). Add the corresponding icon mapping in `src/components/sections/partnerships.tsx` (`Shield` from `lucide-react`).
2. Add the partner's logo to `public/logos/`.
3. Add a card to the **Partnership Demo Showcase** grid in `src/components/sections/partnerships.tsx` with the partner's brand color and a one-line description.
4. Update the **Partners live today** table in `README.md`.
5. Update `src/components/sections/partnerships.tsx`'s 3-way benefit copy (or add a "for security teams" benefit panel) so the homepage hero reflects that security is now a first-class buyer of Cursor.

The new `security` category is what makes this thesis legible at a glance on the homepage. Without it, security partners get lost in the existing `devtools` bucket and the strategic story (a new stakeholder, a new budget) is invisible.
