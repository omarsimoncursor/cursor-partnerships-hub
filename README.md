# Cursor Partnerships Hub

**Live site:** [cursor.omarsimon.com](https://cursor.omarsimon.com)

A collection of interactive co-sell demos that show, concretely, how Cursor transforms the tools enterprises already use into automated, agentic workflows. Every demo is built on a realistic scenario, dramatizes a full workflow from incident/signal to merged PR, and exposes artifacts (Jira tickets, Snowsight / Databricks workspaces, GitHub PRs, triage reports) that make the value legible to both technical and non-technical buyers.

Each partner gets two routes:

- `/partnerships/<partner>` — a narrative partner page framing the co-sell thesis
- `/partnerships/<partner>/demo` — an interactive demo of the workflow itself

## Partners live today

| Partner | Narrative page | Demo page |
| --- | --- | --- |
| AWS | [/partnerships/aws](https://cursor.omarsimon.com/partnerships/aws) | [/partnerships/aws/demo](https://cursor.omarsimon.com/partnerships/aws/demo) and [/partnerships/aws/journey](https://cursor.omarsimon.com/partnerships/aws/journey) (7-act) |
| Databricks | [/partnerships/databricks](https://cursor.omarsimon.com/partnerships/databricks) | [/partnerships/databricks/demo](https://cursor.omarsimon.com/partnerships/databricks/demo) |
| Datadog | [/partnerships/datadog](https://cursor.omarsimon.com/partnerships/datadog) | [/partnerships/datadog/demo](https://cursor.omarsimon.com/partnerships/datadog/demo) |
| Figma | [/partnerships/figma](https://cursor.omarsimon.com/partnerships/figma) | [/partnerships/figma/demo](https://cursor.omarsimon.com/partnerships/figma/demo) |
| Sentry | [/partnerships/sentry](https://cursor.omarsimon.com/partnerships/sentry) | [/partnerships/sentry/demo](https://cursor.omarsimon.com/partnerships/sentry/demo) |
| Snowflake | [/partnerships/snowflake](https://cursor.omarsimon.com/partnerships/snowflake) | [/partnerships/snowflake/demo](https://cursor.omarsimon.com/partnerships/snowflake/demo) (7-act cinematic) |
| Zscaler | [/partnerships/zscaler](https://cursor.omarsimon.com/partnerships/zscaler) | [/partnerships/zscaler/demo](https://cursor.omarsimon.com/partnerships/zscaler/demo) |
| GitHub, GitLab | Coming soon | — |

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript 5.9)
- **TailwindCSS 4** with inline theme configuration in `src/app/globals.css`
- **GSAP + ScrollTrigger** for scroll-triggered animations, **Lenis** for smooth scrolling
- **Sentry** for error + performance monitoring
- **Vercel** for hosting, preview deploys, and webhook endpoints

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

## Adding a new partner demo

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the scaffolding pattern. At a glance:

1. Create `src/app/partnerships/<name>/page.tsx` (narrative) and `src/app/partnerships/<name>/demo/page.tsx` (interactive demo).
2. Build demo components under `src/components/<name>-demo/` (mirror the existing partners for structure).
3. Add the partner's logo to `public/logos/` and register the card in `src/lib/constants.ts` so it appears on the hub homepage.
4. If the demo needs webhook ingress, add `src/app/api/<name>-webhook/route.ts` and document any new env vars in `.env.example`.

## Deployment

Every push to `main` auto-deploys to Vercel at [cursor.omarsimon.com](https://cursor.omarsimon.com). Every PR gets a preview URL on its own subdomain for review.

## Repository conventions

- **Copy voice:** neutral team voice, no first-person references. Every demo should read as if authored by the Cursor Partnerships team.
- **No em dashes** in partner-facing copy. Use commas, periods, or restructure the sentence.
- **Realistic timelines.** Enterprise modernizations take months, not minutes. Demo narratives should include human review checkpoints, iteration cycles, and plausible wall-clock times.
- **Artifacts, not just animations.** Each demo should expose at least one artifact modal (Jira, PR, workspace, triage report) so viewers can inspect the work product, not just the storyboard.
