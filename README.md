# Cursor Partnerships Hub

**Reference deployment:** [cursor.omarsimon.com](https://cursor.omarsimon.com)

A Next.js app with two jobs:

1. **Territory dashboard** — ChatGTM-driven cold outbound (personalized demos, 6-step email sequences, LinkedIn drafts) plus **Intent Data** warm-signal outreach. Each partnerships rep forks this repo, deploys to their own Vercel + Neon instance, and points ChatGTM at their domain.
2. **Partner co-sell demos** — interactive narrative + demo pages under `/partnerships/<partner>`.

> The legacy origin `cursorpartners.omarsimon.com` is still attached to the same Vercel project, so older shared demo URLs keep resolving. New deployments should set their own canonical domain in `src/lib/setup-config.ts`.

---

## Territory dashboard (fork this)

This repo is a **template every Cursor partnerships rep can fork**. You deploy your own copy to your own Vercel project, your own Neon database, and your own ChatGTM automations. Omar's deployment at `cursor.omarsimon.com` is one instance; yours will be separate.

### Fastest path

1. **Use this template** on GitHub (or fork), clone locally, open in Cursor.
2. Run the **ChatGTM Territory Dashboard Provisioning** skill (see [`docs/rep-onboarding-chatgtm-skill.md`](docs/rep-onboarding-chatgtm-skill.md)) **or** tell a Cursor agent: *"Set this repo up for me. Read AGENTS.md."*
3. The agent edits two config files, generates secrets, walks you through Vercel + Neon, and smoke-tests the API.

Manual setup: [`AGENTS.md`](./AGENTS.md).

### What you get

| Surface | URL | Data |
| --- | --- | --- |
| Personalized demos | `/p/<slug>` | `prospects` |
| Admin — Prospects | `/admin` | Build status, manual creates |
| Admin — Sequences | `/admin` | Cold 6-step sequence state, Send LI |
| Admin — Intent Data | `/admin` | Warm-signal contacts, one-time email |
| Admin — Analytics | `/admin` | Demo opens, reached-out tracking |

### ChatGTM automations (four + optional digest)

| Automation | API |
| --- | --- |
| Prospecting Blitz | `POST /api/chatgtm/prospects` |
| Outreach Orchestrator | `GET` + `PATCH /api/chatgtm/prospects`; optional `GET /api/outreach/contacts?email_flagged_to_send=true` |
| Reply Checker | `PATCH /api/chatgtm/prospects/:id` (`replied`) |
| Intent Signal | `/api/outreach/*` |
| Demo-open digest (optional) | `GET /api/chatgtm/digest/opened?since=24h` |

Docs: [`docs/README.md`](docs/README.md) · Architecture diagram: [`docs/chatgtm-solution-architecture.html`](docs/chatgtm-solution-architecture.html)

### Quick API smoke test

```bash
# After env vars + POST /api/db/init:
curl -X POST https://<your-domain>/api/chatgtm/prospects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHATGTM_API_TOKEN" \
  -d '{"prospects":[{"name":"Jane Smith","company":"Unisys","level":"VP","technologies":["Datadog","GitHub"]}]}'
```

Returns `url` + `password` synchronously; demo build runs in the background. Full contract: [`docs/chatgtm-integration.md`](docs/chatgtm-integration.md).

---

## Partner co-sell demos

Each partner gets two routes:

- `/partnerships/<partner>` — narrative partner page
- `/partnerships/<partner>/demo` — interactive workflow demo

### Partners live today

| Partner | Narrative | Demo |
| --- | --- | --- |
| ChatGTM prospect demos | (internal) | `/p/<slug>` — see docs above |
| Cursor SDK (security) | [/partnerships/cursor-sdk](https://cursor.omarsimon.com/partnerships/cursor-sdk) | [/demo](https://cursor.omarsimon.com/partnerships/cursor-sdk/demo) |
| AWS | [/partnerships/aws](https://cursor.omarsimon.com/partnerships/aws) | [/demo](https://cursor.omarsimon.com/partnerships/aws/demo), [/journey](https://cursor.omarsimon.com/partnerships/aws/journey) |
| Databricks | [/partnerships/databricks](https://cursor.omarsimon.com/partnerships/databricks) | [/demo](https://cursor.omarsimon.com/partnerships/databricks/demo) |
| Datadog | [/partnerships/datadog](https://cursor.omarsimon.com/partnerships/datadog) | [/demo](https://cursor.omarsimon.com/partnerships/datadog/demo) |
| Figma | [/partnerships/figma](https://cursor.omarsimon.com/partnerships/figma) | [/demo](https://cursor.omarsimon.com/partnerships/figma/demo) |
| Sentry | [/partnerships/sentry](https://cursor.omarsimon.com/partnerships/sentry) | [/demo](https://cursor.omarsimon.com/partnerships/sentry/demo) |
| Snowflake | [/partnerships/snowflake](https://cursor.omarsimon.com/partnerships/snowflake) | [/demo](https://cursor.omarsimon.com/partnerships/snowflake/demo) |
| GitHub, GitLab | Coming soon | — |

Adding a partner: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **TailwindCSS 4** — theme in `src/app/globals.css`
- **Neon Postgres** — prospects, sequences, intent outreach
- **Vercel** — hosting, preview deploys
- **Sentry** — optional error monitoring

## Local development

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, CHATGTM_API_TOKEN, etc.
npm run dev                  # http://localhost:3000
```

See `.env.example` for all variables. Bootstrap schema: `POST /api/db/init` with `DB_INIT_TOKEN`.

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

Partner demo reset scripts live under `scripts/` (e.g. `scripts/reset-datadog-demo.sh`).

## Deployment

Pushes to `main` deploy Omar's reference instance at [cursor.omarsimon.com](https://cursor.omarsimon.com). Forked repos deploy independently on each rep's Vercel project.

## Conventions

- **Copy voice:** neutral team voice on partner pages; no first-person.
- **No em dashes** in partner-facing copy.
- **Realistic timelines** in demo narratives.
- **Artifacts, not just animations** — each demo exposes inspectable work product (PR, ticket, report).
