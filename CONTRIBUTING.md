# Contributing a new partner demo

Every partner co-sell demo follows the same shape. The easiest path is to copy an existing partner (e.g., `datadog-demo` or `sentry-demo`) and rename it — the scaffolding below is what you'll end up with.

## 1. Routes

Two pages per partner, both under `src/app/partnerships/`:

```
src/app/partnerships/<partner>/
  page.tsx           # Narrative / thesis page
  demo/
    page.tsx         # Interactive demo
```

Optional: a 7-act journey-style narrative at `/partnerships/<partner>/journey/page.tsx` if the co-sell story warrants a cinematic, multi-chapter treatment (see `/partnerships/snowflake/demo` and `/partnerships/aws/journey` for reference implementations).

## 2. Components

Demo components live under `src/components/<partner>-demo/`. A typical demo has:

- `agent-console.tsx` — streaming log of the Cursor agent's actions
- `artifact-cards.tsx` — cards that launch each artifact modal
- `guardrails-panel.tsx` — the compliance / review checkpoints
- `rep-value-card.tsx` — the co-sell framing for an account exec
- `full-<signal>-page.tsx` — the initial "error boundary" that sets up the scenario
- `demo-<signal>-boundary.tsx` — the React Error Boundary that wraps the demo

Artifact modals live under `src/components/<partner>-demo/artifacts/`:

- `macbook-frame.tsx` — chrome wrapping full-screen artifact modals
- `jira-ticket.tsx`, `github-pr-preview.tsx`, `triage-report.tsx` — the near-universal artifact set
- One or more partner-specific artifacts (e.g. `datadog-trace.tsx`, `sentry-issue.tsx`, `snowsight-workspace.tsx`, `databricks-workspace.tsx`)

## 3. Webhook endpoint (optional)

If the demo needs to receive real events from the partner (e.g., a Datadog monitor alert, a Sentry issue), add:

```
src/app/api/<partner>-webhook/route.ts
```

Follow the existing pattern:
1. Verify a shared secret from `process.env.<PARTNER>_WEBHOOK_SECRET`
2. Normalize the partner's payload
3. Optionally forward to the Cursor agent using `process.env.CURSOR_API_KEY`

Register the env var(s) in `.env.example` with a comment explaining what they're for.

## 4. Hub integration

Surface the new partner on the homepage:

1. Add its logo to `public/logos/`.
2. Add an entry to `PARTNER_CATEGORIES` in [src/lib/constants.ts](src/lib/constants.ts) under the right category (cloud / devtools / consulting).
3. Add a demo-showcase card to the grid in [src/components/sections/partnerships.tsx](src/components/sections/partnerships.tsx) with the partner's color, title, and one-line description.

## 5. Reset script (optional but recommended)

For demos that mutate in-repo fixtures, add `scripts/reset-<partner>-demo.sh` that rewinds those files to their committed state. Useful for rehearsing a demo twice in a row.

## 6. Copy conventions

- **Neutral team voice** — no first-person references ("I", "me", "my"), no personal authorship attribution. Every demo reads as if authored by the Cursor Partnerships team.
- **Realistic timelines** — enterprise modernizations take months, not minutes. Include human review checkpoints, iteration cycles, and plausible wall-clock times.
- **Artifacts are the payoff** — the animation is the teaser. The artifact modals are what make the value legible to a technical buyer.
- **No em dashes** in partner-facing copy. Use commas, periods, or restructure.

## 7. Checklist before opening a PR

- [ ] `npx tsc --noEmit` is clean
- [ ] `npm run build` succeeds
- [ ] `npm run dev`, navigate to both `/partnerships/<partner>` and `/partnerships/<partner>/demo`, confirm they render and every artifact modal opens
- [ ] The partner appears on the homepage hub
- [ ] Any new env vars are documented in `.env.example`
- [ ] README updated if the list of live partners changed
