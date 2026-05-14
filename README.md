# Cursor Partnerships Hub

**Reference deployment:** [cursor.omarsimon.com](https://cursor.omarsimon.com)

> The legacy origin `cursorpartners.omarsimon.com` is still attached to the same Vercel project, so any demo URL that was already shared with a prospect keeps resolving. Newly-generated URLs use the new canonical domain.

A collection of interactive co-sell demos that show, concretely, how Cursor transforms the tools enterprises already use into automated, agentic workflows. The headline feature is a **per-prospect personalized demo automation**: a ChatGTM workflow pushes a prospect's name + company + tech stack into this app's API, the app generates a password-gated demo branded for that account, and the URL + password come back synchronously for ChatGTM to paste into the outreach.

## Use this as your own template

This repo is the **template every Cursor partnerships rep can fork**. You'll deploy your own copy to your own Vercel project at your own subdomain, point it at your own Neon database, and connect it to your own ChatGTM automation. The original author's deployment at `cursor.omarsimon.com` is one instance — yours will be different.

The fastest path:

1. **Fork this repo** (GitHub → "Use this template" → create your own repo from it).
2. Clone your fork locally and open it in Cursor.
3. Send a Cursor agent this prompt: *"Set this repo up for me. Read AGENTS.md and walk me through it."*
4. The agent will ask ~6 questions (Calendly URL, your target accounts, admin password, …) and drive the rest — editing the personalization files, generating Bearer tokens, walking you through Vercel + Neon clicks, and verifying with a smoke-test prospect.

If you'd rather do it yourself, [`AGENTS.md`](./AGENTS.md) is also a perfectly readable manual setup guide.

Each partner gets two routes:

- `/partnerships/<partner>` — a narrative partner page framing the co-sell thesis
- `/partnerships/<partner>/demo` — an interactive demo of the workflow itself

## Partners live today

| Partner | Narrative page | Demo page |
| --- | --- | --- |
| ChatGTM personalized prospect demos | (internal) | [/p/<slug>](https://cursor.omarsimon.com/p/) — password-gated, per-prospect, branded demo. See [docs/chatgtm-integration.md](docs/chatgtm-integration.md). |
| Cursor SDK (security) | [/partnerships/cursor-sdk](https://cursor.omarsimon.com/partnerships/cursor-sdk) | [/partnerships/cursor-sdk/demo](https://cursor.omarsimon.com/partnerships/cursor-sdk/demo) (interactive builder) |
| AWS | [/partnerships/aws](https://cursor.omarsimon.com/partnerships/aws) | [/partnerships/aws/demo](https://cursor.omarsimon.com/partnerships/aws/demo) and [/partnerships/aws/journey](https://cursor.omarsimon.com/partnerships/aws/journey) (7-act) |
| Databricks | [/partnerships/databricks](https://cursor.omarsimon.com/partnerships/databricks) | [/partnerships/databricks/demo](https://cursor.omarsimon.com/partnerships/databricks/demo) |
| Datadog | [/partnerships/datadog](https://cursor.omarsimon.com/partnerships/datadog) | [/partnerships/datadog/demo](https://cursor.omarsimon.com/partnerships/datadog/demo) |
| Figma | [/partnerships/figma](https://cursor.omarsimon.com/partnerships/figma) | [/partnerships/figma/demo](https://cursor.omarsimon.com/partnerships/figma/demo) |
| Sentry | [/partnerships/sentry](https://cursor.omarsimon.com/partnerships/sentry) | [/partnerships/sentry/demo](https://cursor.omarsimon.com/partnerships/sentry/demo) |
| Snowflake | [/partnerships/snowflake](https://cursor.omarsimon.com/partnerships/snowflake) | [/partnerships/snowflake/demo](https://cursor.omarsimon.com/partnerships/snowflake/demo) (7-act cinematic) |
| GitHub, GitLab | Coming soon | — |

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript 5.9)
- **TailwindCSS 4** with inline theme configuration in `src/app/globals.css`
- **GSAP + ScrollTrigger** for scroll-triggered animations, **Lenis** for smooth scrolling
- **Sentry** for error + performance monitoring
- **Vercel** for hosting, preview deploys, and webhook endpoints
- **Neon Postgres** (via `pg`) for the ChatGTM-driven personalized prospect demos

## Local development

```bash
npm install
cp .env.example .env.local   # fill in partner API keys / webhook secrets
npm run dev                  # Next.js on http://localhost:3000
```

The dev server serves all demos with mocked data by default. To wire a demo against a real partner integration, fill in the corresponding env vars in `.env.local` (see `.env.example`).

## Scripts

```bash
npm run dev      # local dev server on port 3000
npm run build    # production build
npm run start    # serve a production build
npm run lint     # next lint
```

Each partner demo also has a reset script under `scripts/` that rewinds any in-repo demo fixtures (e.g., `scripts/reset-datadog-demo.sh`) — useful for rehearsing a demo twice in a row.

## ChatGTM personalized prospect demos

ChatGTM (Cursor's internal Sumble → Notion → Gmail / LinkedIn orchestration) sends batches of prospects to this app and gets the demo URL + password for each one back **synchronously**, so it can write them straight to Notion + the auto-drafted messages. The personalized demo build happens in the background. See [docs/chatgtm-integration.md](docs/chatgtm-integration.md) for the full API contract.

At a glance:

```bash
# 1. Configure DATABASE_URL + CHATGTM_API_TOKEN + DB_INIT_TOKEN + DEMO_GATE_SECRET
# 2. Bootstrap the schema:
curl -X POST $APP_ORIGIN/api/db/init -H "Authorization: Bearer $DB_INIT_TOKEN"
# 3. ChatGTM sends a batch:
curl -X POST $APP_ORIGIN/api/chatgtm/prospects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHATGTM_API_TOKEN" \
  -d '{"prospects":[
    {"name":"Jane Smith","company":"Unisys","level":"VP","technologies":["Datadog","Snowflake","GitHub"]},
    {"name":"Mark Lee","company":"KLA","level":"Engineering Manager"}
  ]}'
# Response (synchronous):
# { "ok": true, "count": 2, "prospects": [
#     { "url": "https://cursor.omarsimon.com/p/<slug>", "password": "Jane3146", "build_status": "queued", ... },
#     { "url": "...", "password": "Mark9277", "build_status": "queued", ... }
# ] }
# Background: the demo build (logo prefetch, brand-color match, ...) runs via Next.js after().
# Lazy fallback: any prospect view triggers the build if it hasn't completed.
```

Internal admin UI: [/prospect-builder](src/app/prospect-builder/page.tsx) (the existing builder, plus a "Save personalized demo" panel) and [/prospect-builder/admin](src/app/prospect-builder/admin/page.tsx) (a list of every prospect ChatGTM has pushed, with build status badges).

## Adding a new partner demo

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the scaffolding pattern. At a glance:

1. Create `src/app/partnerships/<name>/page.tsx` (narrative) and `src/app/partnerships/<name>/demo/page.tsx` (interactive demo).
2. Build demo components under `src/components/<name>-demo/` (mirror the existing partners for structure).
3. Add the partner's logo to `public/logos/` and register the card in `src/lib/constants.ts` so it appears on the hub homepage.
4. If the demo needs webhook ingress, add `src/app/api/<name>-webhook/route.ts` and document any new env vars in `.env.example`.

## Deployment

Every push to `main` auto-deploys to Vercel at [cursor.omarsimon.com](https://cursor.omarsimon.com) (the legacy [cursorpartners.omarsimon.com](https://cursorpartners.omarsimon.com) domain is still attached to the same project so older shared URLs keep resolving). Every PR gets a preview URL on its own subdomain for review.

## Repository conventions

- **Copy voice:** neutral team voice, no first-person references. Every demo should read as if authored by the Cursor Partnerships team.
- **No em dashes** in partner-facing copy. Use commas, periods, or restructure the sentence.
- **Realistic timelines.** Enterprise modernizations take months, not minutes. Demo narratives should include human review checkpoints, iteration cycles, and plausible wall-clock times.
- **Artifacts, not just animations.** Each demo should expose at least one artifact modal (Jira, PR, workspace, triage report) so viewers can inspect the work product, not just the storyboard.
