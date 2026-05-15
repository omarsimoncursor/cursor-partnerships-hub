# Partner Demos — Build-Brief Index

Each `<partner>-demo.md` file is a **self-contained spec** that a fresh Cursor agent can pick up and build without prior context. They follow the canonical pattern of the Sentry and Datadog demos, but each one targets a deliberately different "AHA" moment so the suite as a whole illustrates **the breadth of agentic orchestration** Cursor enables across the enterprise toolchain — not a single repeated motif.

## Live demos (already shipped)

| Partner | Brief | "AHA" angle |
| --- | --- | --- |
| Sentry | (see code) | Crash → tested fix PR. The canonical pattern. |
| Datadog | `datadog-demo.md` | Latency SLO breach → root cause + parallelized fix PR. |
| Figma | `figma-demo.md` | Visual design drift → token substitution + visual-regression PR. |
| Snowflake | `snowflake-demo.md` | Cinematic data-warehouse modernization. |
| Databricks | `databricks-demo.md` | Lakehouse migration. |
| AWS | `aws-demo.md`, `aws-journey.md` | Legacy monolith → AWS-native modernization. |

## Enterprise next-six (in this folder, ready for build agents)

These six demos target large-enterprise buyers and are deliberately spread across **6 distinct "AHA" angles** so customers see Cursor as more than a fix-the-bug agent.

| Partner | Brief | One-line "AHA" | Demo shape |
| --- | --- | --- | --- |
| **PagerDuty** | `pagerduty-demo.md` | "The page got resolved without paging a human." | Reactive · incident-lifecycle · auto-revert + Statuspage + postmortem |
| **Linear** | `linear-demo.md` | "Cursor processed half my sprint while I was at lunch." | Proactive batch · backlog → 4 parallel PRs + 1 PM clarification |
| **CodeRabbit** | `coderabbit-demo.md` | "Cursor handled my whole CodeRabbit review while I was in standup." | Reactive · review-loop closure · 9 fixes + 3 *justified pushbacks* + 2 asks |
| **Cloudflare** | `cloudflare-demo.md` | "Cursor stopped a credential-stuffing attack faster than my SOC noticed it." | Reactive · security-platform · 3-layer mitigation across edge + Worker + app code |
| **Snyk** | `snyk-demo.md` | "Critical CVE landed; Cursor patched 4 of 6 repos in 3 minutes — and held the 5th for review." | Reactive · supply-chain · org-scale parallel remediation with calibrated escalation |
| **Zscaler** | `zscaler-demo.md` | "Cursor turned an English access request into a staged-and-validated zero-trust policy with simulated-user evidence." | Proactive intent · Policy-as-Code · stops short of production push, opens change-mgmt ticket |

### Why these six, in this order

The set is intentionally arranged so an enterprise buyer walking the suite sees Cursor in **five distinct operating modes**:

1. **Incident response** (Sentry, Datadog already; PagerDuty deepens this).
2. **Proactive batch backlog** (Linear — *new mode*).
3. **Conversation-shaped collaboration** (CodeRabbit — *new mode*).
4. **Security platform action layer** (Cloudflare, Snyk — *new mode, two complementary angles*).
5. **Policy authoring with change-management discipline** (Zscaler — *new mode, lands the most senior buyers*).

A demo champion can show any 3 of these to a customer in 12 minutes and credibly claim they've seen Cursor work across the breadth of an enterprise stack.

### Build conventions every brief enforces

- **Self-contained.** Each brief lists every file to create, every component to fork, every channel to add to the agent console, and every pixel-perfect artifact required.
- **Deterministic playback.** Scripted agent console with `TIME_SCALE` for displayed timing; no `Math.random()` and no real network calls during playback.
- **Real trigger where possible.** Where the demo needs a felt cause (latency, errors, traffic spikes), use real `setTimeout`-driven code so prospects experience the delay.
- **Calibrated escalation.** Every demo must include at least one moment where Cursor *correctly stops short* — refuses to auto-merge, asks a clarifying question, opens a change-management ticket. This is the credibility floor.
- **Pixel-perfect artifacts in MacBook frames.** Promote `MacBook` frame to `src/components/shared/macbook-frame.tsx` if not done; reuse across all demos.
- **Branding fidelity.** Each brief calls out the partner's exact brand accent and the colors to *avoid* (so the demos don't visually blur).
- **Guardrails-as-feature.** Each brief includes a Guardrails Panel on the idle-phase page; the script must surface those guardrails being respected (Log mode → Block, staging-first, draft PR for major bumps, never force-push, etc.).

### Per-demo dev port (recommended)

To keep parallel build agents from colliding on `npm run dev`, follow the existing convention:

| Demo | Port |
| --- | --- |
| Main app + Sentry/Datadog/Figma | 3000 |
| Databricks | 3101 |
| Snowflake | 3102 |
| AWS | 3103 |
| **PagerDuty** | **3104** |
| **Linear** | **3105** |
| **CodeRabbit** | **3106** |
| **Cloudflare** | **3107** |
| **Snyk** | **3108** |
| **Zscaler** | **3109** |

Each brief assumes the agent will export `PORT=<port>` when running `npm run dev` during development and verification.
