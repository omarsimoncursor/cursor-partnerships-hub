# AGENTS.md — Setup playbook for this template

This file is the contract between a **Cursor agent** and the user who just cloned this repo. If a user opens this repo in Cursor and says **"set this up for me"**, follow the playbook below from top to bottom. The user is almost certainly a Cursor partnerships rep who wants their own instance of this prospect-demo automation, hosted at their own domain, talking to their own Neon database, called from their own ChatGTM automation.

> **For humans reading this:** you can follow the same steps by hand. Each step says exactly what to do.

---

## 0. What you (the agent) are setting up

This repo is a Next.js webapp that:

1. Receives **batches of prospect records** from the rep's ChatGTM automation via `POST /api/chatgtm/prospects` and stores them in a Neon Postgres DB.
2. Returns each prospect a **personalized, password-gated demo URL** at `/p/<slug>` with their company logo, accent color, vendor demo cards, and (for leadership prospects) an ROI calculator.
3. Exposes an **admin panel** at `/prospect-builder/admin` (password-gated, separately from the prospect demos) for the rep to manage demos, edit / delete, see analytics, and create demos by hand.
4. Exposes `GET /api/chatgtm/digest/opened?since=24h` so ChatGTM can post a daily Slack digest of prospects who opened their demo.

The end-state after setup:

- The repo is **forked into the user's GitHub** and deployed to **their Vercel** at **their subdomain**.
- Their **Neon** database is wired up via the Vercel integration.
- Their **ChatGTM** automation points at their subdomain with a token they generated.
- Their **5–10 target accounts** are in the company seed list (replacing the template defaults).
- Their **Calendly URL** is in the demo's "Book a 30-minute Demo" CTA.

---

## 1. Pre-flight: what to ask the user

Open with this exact summary and questionnaire. Don't proceed until you have answers to every required field.

> *"I'll set up your own instance of the personalized prospect-demo automation. I need a few things up front. We can do this in a single back-and-forth, or one at a time:*
>
> 1. *What's your **Calendly URL** (or other booking link)? This goes on the "Book a 30-minute Demo" button at the bottom of every personalized demo.*
> 2. *Which **subdomain / domain** will you host this at? (e.g. `prospects.your-team.com` or `john-demos.vercel.app`)*
> 3. *Which **5–10 target accounts** do you sell to? For each I'll need: company name, public domain (e.g. `unisys.com`), brand accent color in hex, and the rough tech stack they're known to use (e.g. AWS, Datadog, GitHub).*
> 4. *Pick an **admin password** for `/prospect-builder/admin`. I'll generate one for you if you don't have a preference.*
> 5. *Do you already have a **Vercel account + GitHub access** ready? You'll need both. If not I'll pause while you set them up.*
> 6. *(Optional) Do you want **Sentry** error monitoring wired up? We'll leave it off if not."*

For each target account, the bare minimum the user must provide is **name + domain + accent**. The default tech stack and notes are nice-to-haves; if the user doesn't give them, infer reasonable defaults from the company's public presence (AWS / Datadog / GitHub is a safe default for any tech-services firm).

> **Brand accent tip:** if the user doesn't know the hex, ask them to paste a logo URL and you can sample it, or default to a brand-similar color (e.g. red `#DC2626` for fire/energy brands, blue `#2563EB` for banks, green `#16A34A` for fintech/eco).

---

## 2. Personalize the codebase

There are exactly **two files** you need to edit. Both have `AGENT-EDITED` comment headers so you can locate them with `grep AGENT-EDITED`.

### 2a. `src/lib/setup-config.ts`

Set `bookDemoUrl` to the user's Calendly URL. Set `prospectTeamName` to their team name (defaults to "Cursor Partnerships" — usually fine to leave).

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
| `PUBLIC_APP_ORIGIN` | `https://<their-domain>` | Production |
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

1. Open `https://<their-domain>/prospect-builder/admin`.
2. Enter the admin password (`ADMIN_PASSWORD` from step 3).
3. Enter the API token (`CHATGTM_API_TOKEN` from step 3).
4. Confirm the smoke-test prospect appears.

Delete the test prospect via the trash icon. Setup is done.

---

## 9. Hand off the ChatGTM integration

The ChatGTM automation is **outside** this repo and is shared publicly by the original author. The user replicates that automation on their side and points its outbound HTTP step at **their** domain + **their** token.

Print this for the user, with their values filled in:

```
ChatGTM HTTP step:
  URL:     https://<their-domain>/api/chatgtm/prospects
  Method:  POST
  Auth:    Authorization: Bearer <CHATGTM_API_TOKEN>

Payload shape: see docs/chatgtm-integration.md in this repo.

Daily Slack digest (separate automation):
  URL:     https://<their-domain>/api/chatgtm/digest/opened?since=24h
  Method:  GET
  Auth:    Authorization: Bearer <CHATGTM_API_TOKEN>

Prompt to paste into the digest automation builder:
  see docs/chatgtm-daily-digest-automation.md
```

Both docs are in this repo. Don't rewrite them — just point the user to them and remind them to substitute their domain + token wherever they see `cursor.omarsimon.com` (or the legacy `cursorpartners.omarsimon.com`) or `$CHATGTM_API_TOKEN`.

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
- [ ] `/prospect-builder/admin` requires the admin password; once entered, the prospect list shows the test prospect.
- [ ] Test prospect deleted; the admin shows the table empty (or only the user's real prospects).
- [ ] ChatGTM's outbound HTTP step is updated with the new URL + token; one real test record flows through.

If all eight tick, the user is live. Congratulate them.

---

## Files / commands cheat-sheet

| What | Where |
| --- | --- |
| Calendly + branding | `src/lib/setup-config.ts` |
| Target accounts | `src/lib/prospect-store/company-seeds.ts` |
| Env vars | Vercel **Project Settings → Environment Variables** |
| Schema init | `POST /api/db/init` with `DB_INIT_TOKEN` |
| Admin sign-in | `https://<domain>/prospect-builder/admin` (password = `ADMIN_PASSWORD`) |
| ChatGTM contract | `docs/chatgtm-integration.md` |
| Daily digest prompt | `docs/chatgtm-daily-digest-automation.md` |
| API token rotation | Change env in Vercel + redeploy + update ChatGTM stored token |
| ChatGTM-agent playbook | `docs/chatgtm-agent-instructions.md` (paste-into-ChatGTM instructions for the three automations) |

## When something goes wrong

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Admin page says "Admin password isn't configured" | `ADMIN_PASSWORD` env var missing in Production | Set it in Vercel + redeploy |
| Admin password rejects the value you set | Whitespace in the env var, or you forgot to redeploy after setting it | Re-check Vercel value (trim spaces) + redeploy without build cache |
| `/api/db/init` returns `db_not_configured` | Neon integration didn't inject env vars into Production scope | In Vercel env vars list, find a `*_DATABASE_URL` value, copy it to a plain `DATABASE_URL` (Production), redeploy |
| `POST /api/chatgtm/prospects` returns 401 | Bearer token mismatch | Make sure ChatGTM and Vercel both have the same `CHATGTM_API_TOKEN` value |
| Prospect demo loads but logo is missing | Logo.dev couldn't find the domain | Add the logo file to `public/logos/` and reference it from the vendor catalog |
| Demo URLs use `localhost` or wrong host | `PUBLIC_APP_ORIGIN` missing or wrong | Set it to `https://<your-domain>` in Vercel, redeploy |

Every other failure should produce a JSON error body with a `detail` field. Read it before guessing.
