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

Base URL: `https://cursorpartners.omarsimon.com` (or the preview URL in PRs).

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
| `technologies`            | string[]  |          | Free-form Sumble strings. Normalized to vendor IDs (`datadog`, `snowflake`, etc.). Real automation targets that don't match (`Terraform`, `Kubernetes`, …) render as SDK fallback cards. Programming languages and frontend libraries (`React`, `TypeScript`, `Tailwind`, …) are silently filtered and surfaced as `filtered_technologies` for audit. |
| `mcp_relevant`            | bool      |          | ChatGTM's flag: did Sumble find an MCP-marketplace tool in the stack?   |
| `sdk_workflow`            | string    |          | Optional handle of an SDK preset to lead with.                          |
| `gmail_draft_link`        | string    |          | Stored for the audit trail.                                             |
| `linkedin_message_link`   | string    |          | Stored for the audit trail.                                             |
| `notion_page_id`          | string    |          | If ChatGTM has a Notion page id, store it for cross-reference.          |
| `metadata`                | object    |          | Free-form JSONB, persisted as-is.                                       |
| `linkedin_draft`          | string    |          | Personalized LinkedIn connect-request copy (Prospecting Blitz writes; ≤ 300-char target — LinkedIn truncates connection notes past 300). The rep pastes this into LinkedIn's compose box manually via the Sequences-tab `Send LI` button, so write it as if it were going straight into the LinkedIn UI. |
| `mcp_detail`              | string    |          | Two-sentence "how Cursor MCP/SDK applies to this person's role" blurb.  |
| `team`                    | string    |          | Classified functional team. See enum values below.                       |
| `classified_level`        | string    |          | Classified seniority bucket: `Executive` / `Leader (Dir/VP+)` / `Manager` / `IC`. Distinct from the raw title in `level`. |

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
      "url": "https://cursorpartners.omarsimon.com/p/ZlHiS8eq3M",
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
  "url": "https://cursorpartners.omarsimon.com/p/i9Eyvj8me5",
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
| `unmatched_technologies` | Real automation targets that didn't match a vendor. Each renders as an SDK automation card on the demo. |
| `filtered_technologies`  | Programming languages and frontend libraries that were silently dropped (`React`, `TypeScript`, etc.). Audit only — never surfaced on the demo. |
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

### `GET /api/chatgtm/prospects`

Lists prospects with optional filters. Three callers today:

| Caller | Query | Purpose |
| --- | --- | --- |
| Prospecting Blitz | `?company_domain=unisys.com` | The dedup query — pull every existing row for a target account so the Blitz can skip duplicates. |
| Sequence Orchestrator | `?company_domain=unisys.com&replied=false&last_sequence_sent_lt=6` | "Active sequence" pull — every prospect whose 6-step email sequence isn't done and who hasn't replied. |
| Admin UI / monitoring | (no params) | Recent rows, ordered by `created_at DESC`. |

Pagination is **cursor-based**: callers iterate by passing `cursor` from a previous response's `next_cursor` until `next_cursor` is null. There is no fixed row cap on filtered queries — the Blitz dedup query needs the entire set.

| Query param                | Notes |
| -------------------------- | ----- |
| `company_domain`           | Exact lowercase match. The dedup key for the Blitz. |
| `replied`                  | `true` / `false`. Filters by the replied flag. |
| `last_sequence_sent_lt`    | Integer 1-7. Includes NULL ("never started"). Pass 6 to select every "not-yet-complete" prospect. |
| `limit`                    | 1-500. Defaults to 200. |
| `cursor`                   | Opaque cursor from a previous page's `next_cursor`. Resumes strictly after that row. |
| `include`                  | Comma-separated. Currently supports `opens` — joins `prospect_views` and adds `unlocked_view_count` / `first_unlocked_at` / `last_unlocked_at` to every row. Used by the Sequences dashboard to compute the read/unread badge. |

**Response shape** (per prospect):

```json
{
  "id": "uuid",
  "slug": "string",
  "name": "string",
  "email": "string | null",
  "level_raw": "string | null",
  "level_normalized": "team_lead | manager | director | vp | svp | executive | c_level | unknown",
  "linkedin_url": "string | null",
  "company_name": "string",
  "company_domain": "string",
  "company_accent": "string | null",
  "technologies_raw": ["string"],
  "vendor_ids": ["string"],
  "unmatched_technologies": ["string"],
  "mcp_relevant": "boolean",
  "sdk_workflow": "string | null",
  "show_roi_calculator": "boolean",
  "source": "string",
  "metadata": {},
  "category": "string",

  "linkedin_draft": "string | null",
  "linkedin_sent": "boolean",
  "mcp_detail": "string | null",
  "team": "string | null",
  "classified_level": "string | null",
  "last_sequence_sent": "integer | null",
  "last_email_send_date": "YYYY-MM-DD | null",
  "replied": "boolean",
  "thread_id": "string | null",

  "demo_url": "https://<host>/p/<slug> | null",
  "demo_password": "string | null",
  "next_email_send_date": "YYYY-MM-DD | null",

  "reached_out_at": "ISO datetime | null",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime"
}
```

`next_email_send_date` is computed server-side from
`last_sequence_sent` + `last_email_send_date` + the per-step cadence
in `src/lib/setup-config.ts` (`sequenceCadenceDays`). Semantics:

- `last_sequence_sent = null` and `replied = false` → today's date
  (UTC), meaning Email 1 is ready to send.
- `last_sequence_sent ∈ [1..5]` and `replied = false` →
  `last_email_send_date + sequenceCadenceDays[step - 1]`.
- `last_sequence_sent = 6` or `replied = true` → `null` (no further
  send is expected).

When `?include=opens` is passed, each prospect also carries:

```json
{
  "unlocked_view_count": 0,
  "first_unlocked_at": "ISO datetime | null",
  "last_unlocked_at":  "ISO datetime | null"
}
```

`unlocked_view_count > 0` is the canonical "demo opened" / "read"
signal — locked views (drive-by URL hits without a successful
password unlock) are excluded so crawlers don't flip the read/unread
badge.

Top-level body:

```json
{ "ok": true, "count": N, "next_cursor": "..." | null, "prospects": [...] }
```

### `GET /api/chatgtm/prospects/:id`

Looks up a prospect by either UUID or slug. Returns the same shape as
`GET /api/chatgtm/prospects` (one row instead of a list).

### `PATCH /api/chatgtm/prospects/:id`

Partial update for outreach tracking. Used by the Sequence
Orchestrator after each email send and by the Reply Detector when a
prospect replies.

The `:id` param accepts either a UUID or a 10-char slug. Body is a
partial — only provided fields are updated. `updated_at` is auto-set
to `now()`. Validation is strict: unknown fields, wrong shapes, and
out-of-range values return `{error: "invalid_field", field, message}`
with status 400.

| Field                  | Type                | Notes |
| ---------------------- | ------------------- | ----- |
| `last_sequence_sent`   | integer (1-6)       | Which step of the 6-step sequence was last sent. |
| `last_email_send_date` | "YYYY-MM-DD"        | Date the last email went out. The `next_email_send_date` field on the GET response is computed from this + the cadence in `setup-config.ts`. |
| `thread_id`            | string              | Gmail thread id (captured after Email 1). |
| `replied`              | boolean             | Reply Detector flips this. |
| `linkedin_sent`        | boolean             | Whether the LinkedIn message went out. |
| `linkedin_draft`       | string              | Update the draft copy. |
| `reached_out_at`       | ISO datetime        | Stamps when the rep reached out. |
| `mcp_detail`           | string              | |
| `team`                 | string              | See enum values below. |
| `classified_level`     | string              | `Executive` / `Leader (Dir/VP+)` / `Manager` / `IC`. |
| `email`                | string              | Correct a bad email. |
| `linkedin_url`         | string              | Correct a bad LinkedIn URL. |

**Response (200)**: `{ ok: true, prospect: {...} }` (full updated row in
the GET shape above).

**Errors**:

| Status | Body                                                                                | When |
| ------ | ----------------------------------------------------------------------------------- | ---- |
| 400    | `{error: "invalid_field", field: "last_sequence_sent", message: "Must be 1-6."}`    | Validation failure on a known field. |
| 400    | `{error: "invalid_field", field: "linkedin_sent", message: "Must be a boolean."}`   | Wrong type. |
| 400    | `{error: "invalid_body"}`                                                           | Body wasn't a JSON object. |
| 401    | `{error: "unauthorized"}`                                                           | Bearer token missing or wrong. |
| 404    | `{error: "not_found"}`                                                              | No prospect with that id/slug. |

**Note on the legacy admin path**: this same route still accepts the
admin-edit-modal payload (`name`, `vendor_ids`, `tagline`, `level`
(=raw title), `metadata`, …) for backwards compatibility. The router
picks the path by inspecting which fields are present in the body —
if every key is in the outreach set above, the strict validator runs;
otherwise the legacy whitelist runs (silently dropping unknown keys).

### `PATCH /api/chatgtm/prospects` (batch)

Batch outreach update. The Sequence Orchestrator typically updates
5-15 prospects per run (one per email it just sent); sending one
HTTP call instead of N keeps both the Vercel function and the Neon
pool happy.

```json
{
  "updates": [
    { "id": "<uuid|slug>", "last_sequence_sent": 1, "last_email_send_date": "2026-05-14", "thread_id": "18f3a2..." },
    { "id": "<uuid|slug>", "replied": true }
  ]
}
```

Each `updates[i]` is validated independently — a bad row never aborts
the batch; instead it lands in the response as `{ok:false, error,
field, message}` while the rest are still applied. Hard cap: 100
updates per request.

**Response (200 when every row succeeded; 207 multi-status otherwise)**:

```json
{
  "ok": true,
  "count": 2,
  "succeeded": 2,
  "failed": 0,
  "results": [
    { "ok": true,  "input_index": 0, "id": "...", "prospect": { /* full row */ } },
    { "ok": false, "input_index": 1, "id": "...", "error": "invalid_field", "field": "last_sequence_sent", "message": "Must be 1-6." }
  ]
}
```

### Sequences dashboard

The `/prospect-builder/admin` page has a **Sequences** tab that
reads this same `GET /api/chatgtm/prospects?include=opens` endpoint
and surfaces the email-tracking state ChatGTM's Sequence
Orchestrator reads/writes:

- Thread ID (copy-on-click chip)
- Last email send date
- Next email send date (computed; rendered red when overdue)
- 6-step progress indicator
- Demo opened / unread (from `prospect_views.unlocked = true`)
- Replied / In sequence / Sequence complete / Not started status

Filters: company, sequence status, opened-only, free-text search.
The dashboard walks the full cursor-paginated set on load so all
filtering happens client-side, which keeps the experience snappy
even as the working set grows.

**Inline edits** — every row exposes:

- A blue `Send LI` button that opens a focused **LinkedIn outreach
  dialog**. The dialog shows the connection-request draft (editable
  in-place, with a 300-char counter), copies it to the clipboard +
  opens the prospect's LinkedIn profile in a new tab in a single
  click, and after the rep confirms they actually pasted-and-sent,
  flips `linkedin_sent` automatically. When `linkedin_sent` is
  already `true` the button renders as a green "Sent ✓" pill that
  re-opens the same dialog (re-send copy, mark-as-unsent, or save
  draft edits). When `linkedin_url` is missing the button is
  disabled with a tooltip that points the rep at the prospect Edit
  modal.
- A `Replied` pill that toggles the flag in one click. Flipping it
  off un-archives the prospect (the Sequence Orchestrator stops
  skipping them).
- A `LinkedIn` pill (in the Flags column) that toggles `linkedin_sent`
  manually — useful for backfill when the rep already sent the
  message outside the dialog flow.
- A `+1 ›` advance button that bumps `last_sequence_sent` by 1 and
  stamps `last_email_send_date` with today (UTC). Disabled when the
  prospect replied or the sequence is complete.
- A pencil icon that opens the **Edit sequence state** modal.

A clickable **LI pending** count tile (top-right of the counts strip)
mirrors the `LI pending` filter chip — toggling either one filters
the table to prospects with a LinkedIn URL whose connection request
hasn't been sent yet (and who haven't replied). This is the
canonical batch-outreach loop: filter → for each row click `Send LI`
→ paste in LinkedIn → confirm sent.

**Edit sequence state** modal — focused per-prospect editor for the
outreach fields the Orchestrator + Reply Detector own:
`last_sequence_sent`, `last_email_send_date`, `thread_id`, `replied`,
`linkedin_sent`, `linkedin_draft`, `mcp_detail`, `team`,
`classified_level`, `email`, `linkedin_url`. Includes a live
"Computed next send" preview that runs the same
`computeNextEmailSendDate()` helper the server uses, so the UI never
disagrees with the stored value. Server validation errors come back
as `{error, field, message}` and are rendered inline next to the
offending input. Only changed fields are sent in the PATCH body.

### Outreach enum values

The enum-shaped TEXT columns (`team`, `classified_level`) are
validated at the application layer so new values can be added
without DB migrations.

`team` values:
`Cloud & Infrastructure`, `Cybersecurity`, `Platform`, `AI/ML`,
`Software Engineering`, `Data Engineering`, `DevOps`, `Security`,
`QA`, `Cloud`, `IT/Infrastructure`, `Product`, `Design`,
`Embedded Systems`, `Computer Vision`, `Other`.

`classified_level` values: `Executive`, `Leader (Dir/VP+)`,
`Manager`, `IC`.

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
