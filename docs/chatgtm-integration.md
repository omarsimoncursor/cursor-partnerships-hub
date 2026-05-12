# ChatGTM ↔ Personalized prospect demos

This app is the destination for ChatGTM's outbound automation. ChatGTM (Cursor's internal Sumble → Notion → Gmail / LinkedIn orchestration) sends a batch of prospects to this app and receives the demo URL + password for each one **synchronously**, so it can write them straight into the Notion table and inline them in the auto-drafted Gmail / LinkedIn messages without waiting for the build.

## Pipeline overview

```
Sumble ──▶ ChatGTM ──▶  POST /api/chatgtm/prospects  ──▶  Neon Postgres
                       (batch of N prospects)              │
                                                           │
                                                           ▼
                       { prospects: [{url, password, ...}, ...] }
                                returned synchronously
                                          │
                                          ▼
                    ChatGTM writes URL + password into Notion
                       & inlines them in the email / LinkedIn
                                  message drafts
                                          │
                                          ▼
        Personalized demo build runs in the background (logo
        prefetch, brand-color match, etc.) via Next.js `after()`
        and a lazy-on-first-view fallback. Prospects who click
        the URL before the build completes see a "preparing
        your demo" page that auto-redirects when ready.
```

The prospect opens the URL, hits a password gate, enters the password from
their LinkedIn message or email, and lands on a personalized version of the
existing co-sell demo (vendor demo cards + SDK composer + optional ROI
calculator). If the background build hasn't completed yet, the password gate
is followed by a brief "preparing your demo" page that polls every 1.5s and
flips to the demo as soon as the build finishes.

## API contract

Base URL: `https://cursor.omarsimon.com` (or the preview URL in PRs).

### Authentication

All `/api/chatgtm/*` endpoints require:

```
Authorization: Bearer <CHATGTM_API_TOKEN>
```

The token is a shared secret — generate with `openssl rand -hex 32` and store
in Vercel env / Cursor Cloud Secrets.

### `POST /api/chatgtm/prospects`

Creates one or many prospects, persists them to Neon, and returns the demo
URL + auto-generated password for each one **synchronously**. Background
builds are scheduled via Next.js `after()` so ChatGTM never has to wait for
them.

**Batch request body** (`application/json`) — preferred for ChatGTM:

```json
{
  "prospects": [
    {
      "name": "Jane Smith",
      "company": "Unisys",
      "email": "jane.smith@unisys.com",
      "level": "VP of Engineering",
      "linkedin_url": "https://www.linkedin.com/in/janesmith",
      "company_domain": "unisys.com",
      "company_accent": "#FFB81C",
      "technologies": ["Datadog","Snowflake","GitHub","Slack","Atlassian Jira","Terraform"],
      "mcp_relevant": true,
      "gmail_draft_link": "https://mail.google.com/mail/u/0/#drafts/abc123",
      "linkedin_message_link": "https://www.linkedin.com/messaging/thread/xyz",
      "notion_page_id": "abc123",
      "metadata": { "sumble_id": "sumble_42" }
    },
    { "name": "Mark Lee", "company": "KLA", "level": "Engineering Manager",
      "technologies": ["AWS","Databricks","Datadog"] },
    { "name": "Diego Lopez", "company": "Globant", "level": "Chief Technology Officer" }
  ]
}
```

A bare array (`[{...}, {...}]`) is also accepted, as is the legacy single-object form (`{name, company, ...}`) for backwards compatibility.

Hard limit: **100 prospects per request** (`413 batch_too_large` past that). Sequential inserts inside the request, typical wall time is ~50 ms / row against Neon.

| Field                     | Type      | Required | Notes                                                                   |
| ------------------------- | --------- | -------- | ----------------------------------------------------------------------- |
| `name`                    | string    | yes      | Prospect's full name. Used for the password and the hero copy.          |
| `company`                 | string    | yes      | Display name. Falls back to seed-data accent / domain when others empty.|
| `email`                   | string    |          | Stored for the audit trail. Not surfaced to the prospect.               |
| `level`                   | string    |          | Free-form. Normalized to `team_lead`/`manager`/`director`/`vp`/`svp`/`executive`/`c_level`/`unknown`. ROI calculator is gated to leadership levels (director and above). |
| `linkedin_url`            | string    |          |                                                                         |
| `company_domain`          | string    |          | Drives the auto-pulled logo. Falls back to seed data, then to a guess.  |
| `company_accent`          | string    |          | Hex color (`#RRGGBB`). Falls back to seed data.                         |
| `technologies`            | string[]  |          | Free-form Sumble strings. Normalized to vendor IDs (`datadog`, `snowflake`, etc.). Anything that doesn't match is rendered as an SDK fallback card. |
| `mcp_relevant`            | bool      |          | ChatGTM's flag: did Sumble find an MCP-marketplace tool in the stack?   |
| `sdk_workflow`            | string    |          | Optional handle of an SDK preset to lead with.                          |
| `gmail_draft_link`        | string    |          | Stored for the audit trail.                                             |
| `linkedin_message_link`   | string    |          | Stored for the audit trail.                                             |
| `notion_page_id`          | string    |          | If ChatGTM has a Notion page id, store it for cross-reference.          |
| `metadata`                | object    |          | Free-form JSONB, persisted as-is.                                       |

**Batch response**:

- `201 Created` when every row succeeded.
- `207 Multi-Status` when some rows failed validation (the rest still got created).

```json
{
  "ok": true,
  "count": 3,
  "succeeded": 3,
  "failed": 0,
  "prospects": [
    {
      "ok": true,
      "input_index": 0,
      "id": "435f3d87-9921-4d17-8297-efaa98796999",
      "slug": "ZlHiS8eq3M",
      "url": "https://cursor.omarsimon.com/p/ZlHiS8eq3M",
      "password": "Jane3146",
      "level": "vp",
      "show_roi_calculator": true,
      "vendor_ids": ["datadog","snowflake","github","slack","jira"],
      "unmatched_technologies": ["Terraform"],
      "build_status": "queued",
      "company": { "name": "Unisys", "domain": "unisys.com", "accent": "#FFB81C" }
    },
    {
      "ok": true,
      "input_index": 1,
      "id": "...",
      "slug": "...",
      "url": "...",
      "password": "Mark9277",
      "level": "manager",
      "show_roi_calculator": false,
      "vendor_ids": ["aws","databricks","datadog"],
      "unmatched_technologies": [],
      "build_status": "queued",
      "company": { "name": "KLA", "domain": "kla.com", "accent": "#0099D8" }
    },
    {
      "ok": false,
      "input_index": 2,
      "error": "validation_error",
      "detail": "Missing required field: name"
    }
  ]
}
```

Each successful row carries an `input_index` so ChatGTM can correlate the result back to the input order, even when a subset failed.

**Single-object response** (legacy):

```json
{
  "ok": true,
  "id": "87ed9e1c-71bb-4d9a-a1dc-4fe961a4aed2",
  "slug": "i9Eyvj8me5",
  "url": "https://cursor.omarsimon.com/p/i9Eyvj8me5",
  "password": "Jane3146",
  "level": "vp",
  "show_roi_calculator": true,
  "vendor_ids": ["datadog","snowflake","github","slack","jira"],
  "unmatched_technologies": ["Terraform"],
  "build_status": "queued",
  "company": {
    "name": "Unisys",
    "domain": "unisys.com",
    "accent": "#FFB81C"
  }
}
```

| Field                    | Notes                                                                          |
| ------------------------ | ------------------------------------------------------------------------------ |
| `url`                    | Paste verbatim into the LinkedIn / Gmail draft.                                |
| `password`               | Format: first name + 4 digits (e.g. `Jane3146`). Paste into the same drafts.   |
| `level`                  | Normalized seniority enum.                                                     |
| `show_roi_calculator`    | True for leadership; controls whether the demo page renders the ROI section.  |
| `vendor_ids`             | Subset of the catalog ids that matched the input technologies.                 |
| `unmatched_technologies` | Original strings that didn't match. Each renders as an SDK automation card.   |
| `build_status`           | Always `"queued"` in the response — the demo is built in the background.       |

**Errors**:

| Status | `error`                | Meaning                                                     |
| ------ | ---------------------- | ----------------------------------------------------------- |
| 400    | `invalid_json`         | Body wasn't valid JSON.                                     |
| 400    | `invalid_body`         | Body was JSON but the wrong shape.                          |
| 400    | `empty_batch`          | `prospects: []` was empty.                                  |
| 400    | `validation_error`     | Required field missing on a single-object request.          |
| 401    | `unauthorized`         | Bearer token missing or wrong.                              |
| 413    | `batch_too_large`      | More than 100 prospects in the request.                     |
| 503    | `db_not_configured`    | `DATABASE_URL` isn't set on the deployment.                 |
| 500    | `internal_error`       | Anything else — see `detail` and server logs.               |
| 207    | (per-row in body)      | At least one row in a batch failed; check `prospects[].ok`. |

Validation errors on individual rows in a batch never fail the whole batch — the row gets `{ok:false, error, detail}` and the rest are still created.

### `GET /api/chatgtm/prospects?limit=N`

Lists recent prospects. Used by the `/prospect-builder/admin` UI and any
internal monitoring. Same auth.

### `GET /api/chatgtm/prospects/:id`

Looks up a prospect by either UUID or slug. Useful for ChatGTM to
double-check state after a create.

### `GET /api/p/[slug]/status`

Lightweight polling endpoint used by the "preparing your demo" page. No
auth — only returns the build status (never the password).

```json
{ "ok": true, "slug": "ZlHiS8eq3M", "build_status": "ready",
  "build_started_at": "2026-05-12T03:08:03.057Z",
  "build_completed_at": "2026-05-12T03:08:18.257Z",
  "build_error": null, "is_ready": true }
```

If the build is still `queued` or `failed` when polled, the endpoint
re-kicks the builder via `after()` so a stuck row eventually completes
even when the original create-time build was killed (cold start, function
timeout, etc.).

### `POST /api/db/init`

Idempotent bootstrap — creates tables and upserts the company seed list
(`Unisys`, `Cognizant`, `Concentrix`, `KLA`, `Globant`). Auth uses
`DB_INIT_TOKEN` (separate from the ChatGTM token so the deploy step can
have its own scope).

## Persistence model

Three tables, all in the `public` schema (see `src/lib/prospect-store/schema.sql`):

- **`companies`** — seeded list of target accounts with their default accent + tech stack.
- **`prospects`** — one row per ChatGTM call. Stores the password (cleartext — the threat model is "drive-by URL discovery", not "DB compromise"; the demo content is sales material, not customer data) plus the build state (`build_status`, `build_started_at`, `build_completed_at`, `build_error`, `build_artifacts`).
- **`prospect_views`** — append-only audit log of every page hit (locked + unlocked) with IP and user agent.

## Build state machine

```
                 POST /api/chatgtm/prospects
                            │
                            ▼
                       ┌─────────┐
                       │ queued  │  ← row inserted, URL+password returned
                       └────┬────┘
                            │  (Next.js after() fires runBuild)
                            ▼
                       ┌─────────┐
                       │building │  ← build worker claimed the row
                       └────┬────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
       ┌─────────┐                     ┌─────────┐
       │  ready  │                     │ failed  │
       └─────────┘                     └────┬────┘
                                            │  (any subsequent
                                            │   GET /api/p/[slug]/status
                                            │   re-kicks the builder)
                                            ▼
                                       ┌─────────┐
                                       │building │
                                       └─────────┘
```

Transitions are atomic via `UPDATE ... WHERE build_status IN ('queued','failed')`. A per-process `inFlight` map prevents duplicate work within one Node instance; the DB transition is the cross-instance lock.

The "build" today is intentionally lightweight: a single `/api/logo` prefetch so the prospect's first paint is instant. The state machine and `build_artifacts` JSONB column are the place to layer in heavier work later (LLM-generated tagline, OG image rendering, slack/email previews) without changing the public API.

## Password gate

- Format: `{FirstName}{4 digits}`, e.g. `Jane3146`. Generated server-side at create time with `crypto.randomInt`. Stored in `prospects.password`.
- The prospect submits it via `POST /api/p/:slug/auth`. On success, the server sets a 30-day, HttpOnly, HMAC-signed cookie `pdemo_<slug>` (signed with `DEMO_GATE_SECRET`). The demo page (`/p/[slug]`) verifies the cookie server-side on every request.
- Three failed attempts in a row aren't currently rate-limited — the keyspace is small but the URL is private, so this is acceptable for a sales tool. Add IP-based throttling here if that ever changes.

## ROI calculator gating

The demo page renders the ROI calculator only when the prospect's normalized
level is one of `director`, `vp`, `svp`, `executive`, or `c_level`. ICs and
managers see a workflow-focused page without the budget-shaped argument.
Implementation: `shouldShowRoiCalculator()` in `src/lib/prospect-store/levels.ts`.

## Technology normalization

Sumble emits free-form strings (`"Datadog APM"`, `"GH Enterprise"`,
`"Snowflake Cortex"`). The `normalizeTechnologies()` helper maps them to
catalog vendor ids using a curated alias list (`src/lib/prospect-store/technologies.ts`).

Anything that doesn't match becomes an SDK-automation card on the demo page,
so the rep always has a thread to pull on for tools we don't yet have an MCP
integration for.

## Local dev

```bash
# Spin up Postgres locally, or use a Neon dev project.
export DATABASE_URL=postgresql://localhost:5432/cursor_prospects
export CHATGTM_API_TOKEN=$(openssl rand -hex 32)
export DB_INIT_TOKEN=$(openssl rand -hex 32)
export DEMO_GATE_SECRET=$(openssl rand -hex 32)
# Optional — adds an artificial delay to the build so the building
# UI is observable when manually testing. Defaults to 0 in production.
export PROSPECT_BUILD_DELAY_MS=8000

npm run dev
curl -X POST http://localhost:3000/api/db/init -H "Authorization: Bearer $DB_INIT_TOKEN"

# Create a batch of test prospects:
curl -X POST http://localhost:3000/api/chatgtm/prospects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHATGTM_API_TOKEN" \
  -d '{
    "prospects": [
      { "name": "Jane Smith", "company": "Unisys", "level": "VP",
        "technologies": ["Datadog","Snowflake","GitHub"] },
      { "name": "Mark Lee",   "company": "KLA",    "level": "Engineering Manager",
        "technologies": ["AWS","Databricks","Datadog"] }
    ]
  }'
```

Each `prospects[i]` response includes the URL + password — paste them into
the Gmail / LinkedIn drafts, open the URL in a browser, paste the password
into the gate, and you should see the personalized demo render (or the
"preparing your demo" page first if the build hasn't finished).

The `/prospect-builder/admin` page in the same browser (after entering the
token) shows the live list of every prospect created via this endpoint,
along with their build status.
