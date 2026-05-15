# Documentation index

Territory dashboard (ChatGTM + Neon + `/admin`) and partner co-sell demos share this repo. Start here.

## Territory dashboard (per-rep deployments)

| Doc | Audience | Purpose |
| --- | --- | --- |
| [`AGENTS.md`](../AGENTS.md) | Cursor agent + rep | Fork → Vercel → Neon setup playbook |
| [`rep-onboarding-chatgtm-skill.md`](./rep-onboarding-chatgtm-skill.md) | ChatGTM skill builder | Provision a rep: duplicate automations + Cursor handoff prompt |
| [`chatgtm-agent-instructions.md`](./chatgtm-agent-instructions.md) | ChatGTM automation builder | Paste-in instructions for all four automations |
| [`chatgtm-integration.md`](./chatgtm-integration.md) | Engineers + ChatGTM | Cold-prospect API reference (`/api/chatgtm/*`) |
| [`outreach-integration.md`](./outreach-integration.md) | Engineers + ChatGTM | Intent Data API + UI (`/api/outreach/*`) |
| [`chatgtm-daily-digest-automation.md`](./chatgtm-daily-digest-automation.md) | ChatGTM | Optional Slack digest of demo opens |
| [`chatgtm-solution-architecture.html`](./chatgtm-solution-architecture.html) | Everyone | Visual: four automations → API → Neon |

### Four ChatGTM automations

1. **Prospecting Blitz** — cold discovery → `POST /api/chatgtm/prospects`
2. **Outreach Orchestrator** — 6-step cold email sequence + optional flagged intent emails
3. **Reply Checker** — Gmail scan → `PATCH replied`
4. **Intent Signal** — daily warm signals → `/api/outreach/*`

All use the same `CHATGTM_API_TOKEN`. Replace `cursor.omarsimon.com` with each rep's deployment domain.

## Partner co-sell demos

| Doc | Partner |
| --- | --- |
| [`partner-demos/aws-demo.md`](./partner-demos/aws-demo.md) | AWS |
| [`partner-demos/aws-journey.md`](./partner-demos/aws-journey.md) | AWS (7-act journey) |
| [`partner-demos/cursor-sdk-demo.md`](./partner-demos/cursor-sdk-demo.md) | Cursor SDK |
| [`partner-demos/datadog-demo.md`](./partner-demos/datadog-demo.md) | Datadog |
| [`partner-demos/databricks-demo.md`](./partner-demos/databricks-demo.md) | Databricks |
| [`partner-demos/figma-demo.md`](./partner-demos/figma-demo.md) | Figma |
| [`partner-demos/gitguardian-demo.md`](./partner-demos/gitguardian-demo.md) | GitGuardian |
| [`partner-demos/security-demos.md`](./partner-demos/security-demos.md) | Security (multi-vendor) |
| [`partner-demos/snowflake-demo.md`](./partner-demos/snowflake-demo.md) | Snowflake |

Scaffolding new partner pages: [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Staying current (forked deployments)

Forks do **not** auto-sync with upstream. After pulling `main` from `omarsimoncursor/cursor-partnerships-hub`, merge into your fork and redeploy. Re-run `POST /api/db/init` when `schema.sql` changes. Keep your edits in `setup-config.ts` and `company-seeds.ts` during merges.
