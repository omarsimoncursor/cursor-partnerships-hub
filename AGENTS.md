# AGENTS.md — Setup playbook for this template

This file is the contract between a **Cursor agent** and the user who just cloned this repo. If a user opens this repo in Cursor and says **"set this up for me"**, follow the playbook below from top to bottom. The user is almost certainly a Cursor partnerships rep who wants their own instance of this prospect-demo automation, hosted at their own domain, talking to their own Neon database, called from their own ChatGTM automation.

> **For humans reading this:** you can follow the same steps by hand. Each step says exactly what to do.

---

## 0. What you (the agent) are setting up

This repo is a Next.js **territory dashboard** that:

1. Receives **cold prospect batches** from ChatGTM via `POST /api/chatgtm/prospects`, stores them in Neon, and returns a **password-gated demo URL** at `/p/<slug>` synchronously (demo build runs in the background).
2. Tracks **6-step email sequences** and LinkedIn outreach state (`last_sequence_sent`, `replied`, `linkedin_draft`, …) for the Outreach Orchestrator and Reply Checker automations.
3. Ingests **Intent Data** warm-signal contacts via `/api/outreach/*` (separate from cold sequences; worked in the **Intent Data** admin tab).
4. Exposes **`/admin`** (password-gated) with four tabs: **Prospects**, **Sequences**, **Intent Data**, **Analytics**. Legacy `/prospect-builder/admin` redirects to `/admin`.
5. Optionally exposes `GET /api/chatgtm/digest/opened?since=24h` for a daily Slack digest of demo opens.

The end-state after setup:

- The repo is **forked into the user's GitHub** and deployed to **their Vercel** at **their subdomain**.
- Their **Neon** database is wired up via the Vercel integration.
- Their **four ChatGTM automations** (Prospecting Blitz, Outreach Orchestrator, Reply Checker, Intent Signal) point at their subdomain with a token they generated. Paste-in prompts: `docs/chatgtm-agent-instructions.md`.
- Their **5–10 target accounts** are in the company seed list (replacing the template defaults).
- Their **Calendly URL** is in the demo's "Book a 30-minute Demo" CTA.
- Optional: team provisioning via ChatGTM skill — `docs/rep-onboarding-chatgtm-skill.md`.

---

## 1. Pre-flight: what to ask the user

Open with this exact summary and questionnaire. Don't proceed until you have answers to every required field.

> *"I'll set up your own instance of the personalized prospect-demo automation. I need a few things up front. We can do this in a single back-and-forth, or one at a time:*
>
> 1. *What's your **Calendly URL** (or other booking link)? This goes on the "Book a 30-minute Demo" button at the bottom of every personalized demo.*
> 2. *Which **subdomain / domain** will you host this at? (e.g. `prospects.your-team.com` or `john-demos.vercel.app`)*
> 3. *Which **5–10 target accounts** do you sell to? For each I'll need: company name, public domain (e.g. `unisys.com`), brand accent color in hex, and the rough tech stack they're known to use (e.g. AWS, Datadog, GitHub).*
> 4. *Pick an **admin password** for `/admin`. I'll generate one for you if you don't have a preference.*
> 5. *Do you already have a **Vercel account + GitHub access** ready? You'll need both. If not I'll pause while you set them up.*
> 6. *(Optional) Do you want **Sentry** error monitoring wired up? We'll leave it off if not."*

For each target account, the bare minimum the user must provide is **name + domain + accent**. The default tech stack and notes are nice-to-haves; if the user doesn't give them, infer reasonable defaults from the company's public presence (AWS / Datadog / GitHub is a safe default for any tech-services firm).

> **Brand accent tip:** if the user doesn't know the hex, ask them to paste a logo URL and you can sample it, or default to a brand-similar color (e.g. red `#DC2626` for fire/energy brands, blue `#2563EB` for banks, green `#16A34A` for fintech/eco).

---

## 2. Personalize the codebase

There are exactly **two files** you need to edit. Both have `AGENT-EDITED` comment headers so you can locate them with `grep AGENT-EDITED`.

### 2a. `src/lib/setup-config.ts`

Set `bookDemoUrl` to the user's Calendly URL. Set `prospectTeamName` to their team name (defaults to "Cursor Partnerships" — usually fine to leave). Set `canonicalOrigin` to `https://<their-domain>` — this is the build-baked default for the URL embedded in every API response (`url`, `demo_url`, `og:url`). The default `https://cursor.omarsimon.com` is the original author's deployment; the user's deployment must override it.

### 2b. `src/lib/prospect-store/company-seeds.ts`

Replace the entire `COMPANY_SEEDS` array with the user's accounts. Keep the existing entry **shape** (name / domain / accent / defaultTechs / notes); the file's comment header documents each field. Validate:

- `domain` is lowercase, no protocol, no path.
- `accent` is a `#RRGGBB` 6-char hex.
- `defaultTechs` is an array of strings; aim for 5–7 entries.

After editing, run `npx tsc --noEmit` to make sure you didn't break the type.

### 2c. (Optional) Sales rep attribution

The demo's hero shows "Prepared by …" only when the rep field is passed in via ChatGTM. You don't have to edit anything here — if the user wants their name to always appear, tell them to add `"rep": "Their Name"` to ChatGTM's outbound payload.

---

## 3. Generate secrets

The user needs four secrets. Generate three of them yourself with `openssl rand -hex 32` and ask the user for the fourth (admin password).

| Env var | How to get it |
| --- | --- |
| `CHATGTM_API_TOKEN` | `openssl rand -hex 32` |
| `DB_INIT_TOKEN` | `openssl rand -hex 32` |
| `DEMO_GATE_SECRET` | `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Ask the user. If they say "generate one", use `openssl rand -base64 18` and tell them what you generated so they can save it. |

**Show the user every value as you generate it.** They need all four to paste into Vercel in step 5.

---

## 4. Vercel deploy

You can't auto-click Vercel buttons. Walk the user through these clicks; pause for confirmation between each.

1. **Push their fork to GitHub.** They probably already did this when they cloned. If not: `git remote add origin <their-fork-url>` + `git push -u origin main`.
2. **Vercel → New Project → Import from GitHub → their fork.** Default settings are fine (Next.js auto-detected). Don't deploy yet — wait until the env vars are in place. Cancel the auto-deploy or let it fail; either is fine.
3. **Project Settings → Domains → add their domain.** They can also use the default `.vercel.app` URL; the rest of the playbook works either way.

Pause. Ask the user to confirm the project is created in Vercel before moving on.

---

## 5. Neon Postgres via Vercel Storage

This is a 4-click flow that produces several `<DB-name>_DATABASE_URL`-prefixed env vars. The app's pool builder accepts any of those names (see `src/lib/prospect-store/db.ts`), so the user doesn't need to rename anything.

1. In Vercel: **Storage → Create → Neon Postgres**.
2. Name the database — something like `prospect_demos` is fine.
3. Connect to **all environments** (Production / Preview / Development).
4. Done. Vercel auto-injects ~10 env vars prefixed with the database name.

---

## 6. Add env vars + redeploy

In Vercel **Project → Settings → Environment Variables**, add the five secrets from step 3 + one optional:

| Var | Value | Scope |
| --- | --- | --- |
| `CHATGTM_API_TOKEN` | (from step 3) | Production + Preview |
| `DB_INIT_TOKEN` | (from step 3) | Production + Preview |
| `DEMO_GATE_SECRET` | (from step 3) | Production + Preview |
| `ADMIN_PASSWORD` | (from step 3) | Production + Preview |
| `PUBLIC_APP_ORIGIN` *(optional, non-production only)* | `https://staging.<their-domain>` | Preview only. **Production ignores this** — the build-baked `SETUP_CONFIG.canonicalOrigin` (from step 2a) is the source of truth in production. Set this var only when you need a runtime override for a staging deploy. |
| `ADMIN_SESSION_SECRET` *(optional)* | `openssl rand -hex 32` — only if they want to rotate the admin session independently from `DEMO_GATE_SECRET` | Production |

Then **Deployments → ⋯ on the latest deployment → Redeploy** **without** the build cache so the new env vars are baked into the build.

Wait ~60 seconds. Verify:

```bash
curl -sI https://<their-domain>/ | grep -i '^age:'
```

`age` should be small (<60). If it's larger, the redeploy didn't go through yet — wait and retry.

---

## 7. Initialize the schema

```bash
curl -X POST https://<their-domain>/api/db/init \
  -H "Authorization: Bearer $DB_INIT_TOKEN"
```

Expected response: `{"ok":true,"inserted":N,"updated":M}` where `N+M` equals the number of company seeds you put in step 2b.

If you get `db_not_configured`: the Neon integration didn't actually inject env vars to Production. Check Vercel env-vars list; tell the user to manually copy a `_DATABASE_URL` value to a plain `DATABASE_URL` var and redeploy.

---

## 8. Smoke-test end to end

Create a test prospect via the same API ChatGTM will use:

```bash
curl -X POST https://<their-domain>/api/chatgtm/prospects \
  -H "Authorization: Bearer $CHATGTM_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prospects": [{
      "name": "Smoke Test",
      "company": "<one of the user'\''s seeded companies>",
      "level": "Director",
      "technologies": ["AWS", "Datadog", "GitHub"]
    }]
  }'
```

Response will include `url` (something like `https://<their-domain>/p/<slug>`) and `password` (like `Smoke<4 digits>`). Open the URL in a browser, enter the password, confirm the demo renders with the company's brand color and 3 vendor cards.

Then sign into the admin:

1. Open `https://<their-domain>/admin`.
2. Enter the admin password (`ADMIN_PASSWORD` from step 3).
3. Enter the API token (`CHATGTM_API_TOKEN` from step 3).
4. Confirm the smoke-test prospect appears.

Delete the test prospect via the trash icon. Setup is done.

---

## 9. Hand off the ChatGTM integration

ChatGTM automations live **outside** this repo. The user either duplicated them via the provisioning skill (`docs/rep-onboarding-chatgtm-skill.md`) or copies sections from `docs/chatgtm-agent-instructions.md`. Every HTTP step uses **their** domain and **their** token.

Print this summary with their values filled in:

```
Production API base: https://<their-domain>
CHATGTM_API_TOKEN: <token>

Automations (paste instructions from docs/chatgtm-agent-instructions.md):
  1. Prospecting Blitz      → POST /api/chatgtm/prospects
  2. Outreach Orchestrator  → GET + PATCH /api/chatgtm/prospects
                              (+ optional GET /api/outreach/contacts?email_flagged_to_send=true)
  3. Reply Checker          → PATCH /api/chatgtm/prospects/:id  { "replied": true }
  4. Intent Signal          → /api/outreach/runs, /contacts/batch, /contact-signals/batch

API reference:
  Cold prospects — docs/chatgtm-integration.md
  Intent Data    — docs/outreach-integration.md

Optional fifth automation — demo-open Slack digest:
  GET https://<their-domain>/api/chatgtm/digest/opened?since=24h
  Prompt: docs/chatgtm-daily-digest-automation.md
```

Don't rewrite those docs — point the user to them and remind them to substitute their domain anywhere they see `cursor.omarsimon.com` (or legacy `cursorpartners.omarsimon.com`).

---

## 10. Optional: Sentry, Logo.dev, rotation hygiene

- **Sentry** — `next.config.ts` wires up `@sentry/nextjs`. If the user doesn't set `SENTRY_DSN` / `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN`, Sentry is a no-op and the app builds fine. Skip unless asked.
- **Logo.dev** — `src/app/api/logo/route.ts` uses a free public demo token (`LOGODEV_TOKEN`) that works for ~99% of public domains. If a target account's logo doesn't render, suggest they put their own logo file under `public/logos/` and reference it from `src/lib/prospect/vendors.ts`.
- **Rotating secrets later** — the user can rotate `CHATGTM_API_TOKEN` / `DB_INIT_TOKEN` / `ADMIN_PASSWORD` at any time by changing the env var in Vercel and redeploying. They also need to update ChatGTM's stored token for the first one. `DEMO_GATE_SECRET` rotation invalidates all existing unlocked-prospect cookies (prospects have to re-enter their passwords) — fine to rotate but mention the side effect.

---

## 11. Verification checklist (give this to the user at the end)

When you're done, run through this with the user:

- [ ] `curl https://<their-domain>/` returns 200 and renders the partnership-hub homepage.
- [ ] `curl -X POST https://<their-domain>/api/db/init -H "Authorization: Bearer $DB_INIT_TOKEN"` returns `{"ok":true}`.
- [ ] Creating a test prospect via `POST /api/chatgtm/prospects` returns a `url` + `password`.
- [ ] Opening that URL renders the gate; the password unlocks the demo.
- [ ] The unlocked demo shows the company's brand accent and vendor cards.
- [ ] `/admin` → **Prospects** tab shows the smoke-test row; **Sequences** tab lists it (cold outbound only).
- [ ] `/admin` → **Intent Data** tab loads (empty until Intent Signal automation runs).
- [ ] Test prospect deleted from Prospects tab.
- [ ] All four ChatGTM automations use `https://<their-domain>` and the same `CHATGTM_API_TOKEN`; at least one Prospecting Blitz test record flows through.

If all items tick, the user is live. Congratulate them.

---

## Files / commands cheat-sheet

| What | Where |
| --- | --- |
| Calendly + branding | `src/lib/setup-config.ts` |
| Target accounts | `src/lib/prospect-store/company-seeds.ts` |
| Env vars | Vercel **Project Settings → Environment Variables** |
| Schema init | `POST /api/db/init` with `DB_INIT_TOKEN` |
| Admin sign-in | `https://<domain>/admin` (password = `ADMIN_PASSWORD`) |
| ChatGTM contract | `docs/chatgtm-integration.md` |
| Daily digest prompt | `docs/chatgtm-daily-digest-automation.md` |
| API token rotation | Change env in Vercel + redeploy + update ChatGTM stored token |
| ChatGTM-agent playbook | `docs/chatgtm-agent-instructions.md` (four automations) |
| Intent Data API | `docs/outreach-integration.md` |
| Team provisioning skill | `docs/rep-onboarding-chatgtm-skill.md` |
| Architecture diagram | `docs/chatgtm-solution-architecture.html` |
| All docs index | `docs/README.md` |

## 12. Staying in sync with upstream (forked deployments)

Forks do **not** receive updates automatically. Tell the user:

```bash
git remote add upstream https://github.com/omarsimoncursor/cursor-partnerships-hub.git  # once
git fetch upstream && git merge upstream/main
```

Resolve conflicts by keeping **their** `setup-config.ts` and `company-seeds.ts`. Push to their fork; Vercel redeploys. Re-run `POST /api/db/init` after pulls that touch `schema.sql`.

## When something goes wrong

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Admin page says "Admin password isn't configured" | `ADMIN_PASSWORD` env var missing in Production | Set it in Vercel + redeploy |
| Admin password rejects the value you set | Whitespace in the env var, or you forgot to redeploy after setting it | Re-check Vercel value (trim spaces) + redeploy without build cache |
| `/api/db/init` returns `db_not_configured` | Neon integration didn't inject env vars into Production scope | In Vercel env vars list, find a `*_DATABASE_URL` value, copy it to a plain `DATABASE_URL` (Production), redeploy |
| `POST /api/chatgtm/prospects` returns 401 | Bearer token mismatch | Make sure ChatGTM and Vercel both have the same `CHATGTM_API_TOKEN` value |
| Prospect demo loads but logo is missing | Logo.dev couldn't find the domain | Add the logo file to `public/logos/` and reference it from the vendor catalog |
| Demo URLs use `localhost` or wrong host | `SETUP_CONFIG.canonicalOrigin` not pointing at the deployment domain | Update `canonicalOrigin` in `src/lib/setup-config.ts` to `https://<your-domain>` and redeploy. (Production ignores `PUBLIC_APP_ORIGIN`; `canonicalOrigin` is the source of truth.) |

Every other failure should produce a JSON error body with a `detail` field. Read it before guessing.
