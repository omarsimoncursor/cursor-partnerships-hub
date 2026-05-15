# ChatGTM agent instructions: switch from Notion to the Neon-backed API

Paste the relevant section into each ChatGTM automation builder. Each section is **self-contained** — you do not need to read the others or any external docs to update an automation. URLs, headers, payload shapes, and validation rules are spelled out below in the form ChatGTM agents expect.

---

## What changed (TL;DR)

You are migrating away from a Notion database and toward a Postgres-backed REST API hosted at:

```
https://cursor.omarsimon.com
```

> The previous host `https://cursorpartners.omarsimon.com` still resolves to the same backend, so anything you've already shipped won't break mid-migration. New writes and reads should use the new host.

Three automations need to update:

1. **Prospecting Blitz** — discovers + enriches prospects, drafts a LinkedIn message, drops them into the system. Was writing rows to Notion. **Now writes to `POST /api/chatgtm/prospects`** which both creates the row in Postgres _and_ generates a personalized password-gated demo URL synchronously.
2. **Sequence Orchestrator** — sends the 6-step email sequence. Was reading prospect rows + tracking state in Notion. **Now reads `GET /api/chatgtm/prospects?company_domain=…&replied=false&last_sequence_sent_lt=6` and PATCHes after each send.**
3. **Reply Detector** — flips a "replied" flag when a prospect replies. Was updating a Notion checkbox. **Now `PATCH /api/chatgtm/prospects/<id_or_slug>` with `{"replied": true}`.**

Common conventions for every automation:

- Authentication is a single shared bearer token. In every HTTP step, set:
  ```
  Authorization: Bearer {{CHATGTM_API_TOKEN}}
  ```
  This is the same token you have stored in ChatGTM's secret store today. If you rotate it, rotate it in both Vercel (`CHATGTM_API_TOKEN` env var) and ChatGTM at the same time, otherwise calls return `401 unauthorized`.
- All requests / responses are JSON. Set `Content-Type: application/json` on every body-bearing call.
- The `id` of every prospect is a UUID. There is also a 10-character alphanumeric `slug` per prospect. **Every endpoint that takes `:id` accepts either**, so if you only have a slug you can pass it directly.
- Date fields use either `YYYY-MM-DD` (date-only, e.g. `last_email_send_date`) or full ISO 8601 datetime (e.g. `reached_out_at`).
- All 4xx errors carry a `{"error": "<machine-readable code>", "field": "<which field, if applicable>", "message": "<human description>"}` shape. Surface `error` + `field` + `message` in your error logs — do not generic-catch.

---

## Automation 1: Prospecting Blitz → `POST /api/chatgtm/prospects`

**Goal**: After Sumble enrichment + LinkedIn-draft generation, create the prospect row in Postgres and receive the per-prospect demo URL + password back synchronously so you can inline them into the auto-drafted Gmail / LinkedIn messages.

### Before you write a row, dedup against existing prospects for the company

```
GET https://cursor.omarsimon.com/api/chatgtm/prospects?company_domain=<domain>
```

Headers:
```
Authorization: Bearer {{CHATGTM_API_TOKEN}}
```

Response shape:
```json
{
  "ok": true,
  "count": 12,
  "next_cursor": "MjAyNi0wNS0xNFQxNzox…",
  "prospects": [ /* full prospect rows, see "Response shape" below */ ]
}
```

Iterate using `next_cursor`: pass it back as `?cursor=…` until the response returns `"next_cursor": null`. Build a set of existing prospect emails / LinkedIn URLs / `(name, company_domain)` tuples and skip any candidate that's already in there.

> **Important**: do not skip pagination. If a company has more than 200 prospects you will miss rows on the first page and create duplicates. Always loop until `next_cursor` is null.

### Then create new prospects in batches

```
POST https://cursor.omarsimon.com/api/chatgtm/prospects
```

Headers:
```
Authorization: Bearer {{CHATGTM_API_TOKEN}}
Content-Type: application/json
```

Body — **batch form is preferred**, up to 100 prospects per request:

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
      "technologies": ["Datadog", "Snowflake", "GitHub", "Slack", "Atlassian Jira"],
      "mcp_relevant": true,

      "linkedin_draft": "Hi Jane, I noticed Unisys is investing in MCP-marketplace tools — would love to connect about how Cursor lets your platform team plug into them directly from the IDE.",
      "mcp_detail": "As VP of Engineering at Unisys, you can use the Cursor MCP marketplace to give your platform team direct IDE access to internal services. The SDK lets your engineers automate Datadog and GitHub workflows.",
      "team": "Platform",
      "classified_level": "Leader (Dir/VP+)",

      "metadata": { "sumble_id": "sumble_42" }
    }
  ]
}
```

#### Field-by-field instructions for the agent

| Field | Type | Required | What to put in it |
| --- | --- | --- | --- |
| `name` | string | **yes** | Full name. Used to generate the demo password (`{FirstName}{4 digits}`). |
| `company` | string | **yes** | Company display name. |
| `email` | string | recommended | Used by the Sequence Orchestrator. |
| `level` | string | recommended | The full job title from Sumble (e.g. `"VP of Engineering"`, not `"VP"`). The server normalizes this into `level_normalized` and gates the ROI calculator on it. |
| `linkedin_url` | string | recommended | |
| `company_domain` | string | recommended | Lowercase, no protocol, no path. e.g. `unisys.com`. The dedup key. |
| `company_accent` | string | optional | `#RRGGBB` brand hex. Falls back to a per-company seed list. |
| `technologies` | string[] | optional | Free-form Sumble strings — `"Datadog APM"`, `"GH Enterprise"`, etc. The server normalizes to vendor IDs. |
| `mcp_relevant` | boolean | optional | True when Sumble found an MCP-marketplace tool in the stack. |
| `linkedin_draft` | string | **NEW — required for sequence to work** | The personalized LinkedIn connect-request copy you drafted. Aim for ≤ 300 chars. |
| `mcp_detail` | string | **NEW — required for sequence to work** | Two-sentence "how Cursor MCP/SDK applies to this person's specific role". This will be substituted into email body templates downstream. |
| `team` | string | **NEW — required for sequence to work** | Classified functional team. Pick one of: `Cloud & Infrastructure`, `Cybersecurity`, `Platform`, `AI/ML`, `Software Engineering`, `Data Engineering`, `DevOps`, `Security`, `QA`, `Cloud`, `IT/Infrastructure`, `Product`, `Design`, `Embedded Systems`, `Computer Vision`, `Other`. |
| `classified_level` | string | **NEW — required for sequence to work** | Pick one of: `Executive`, `Leader (Dir/VP+)`, `Manager`, `IC`. Distinct from `level` (raw title) — this is your post-profile classification. |
| `metadata` | object | optional | Free-form JSONB. Pass `{ "sumble_id": "<id>" }` so we can cross-reference back. |

### Response

`201 Created` on full success, `207 Multi-Status` when some rows in a batch failed validation:

```json
{
  "ok": true,
  "count": 1,
  "succeeded": 1,
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
      "unmatched_technologies": [],
      "filtered_technologies": [],
      "build_status": "queued",
      "company": { "name": "Unisys", "domain": "unisys.com", "accent": "#FFB81C" }
    }
  ]
}
```

**For each successful row, persist into your own automation's working state:**
- `id` — UUID. Use this as the primary key in any later PATCH calls.
- `slug` — 10-char alphanumeric. Either `id` or `slug` works as `:id` in subsequent calls.
- `url` — paste verbatim into the LinkedIn / Gmail draft body.
- `password` — paste verbatim. Format: `{FirstName}{4 digits}`.

**For each failed row, log:**
- `input_index` — position in your input array.
- `error` (`validation_error`, `internal_error`).
- `detail` — human-readable reason.

A 207 response means some rows succeeded and some failed; the successful rows are still committed. Do **not** retry the whole batch; only retry the failed rows after fixing the validation issue.

### Errors to handle

| Status | Body | Cause |
| --- | --- | --- |
| 400 | `{"error":"invalid_json"}` | Body wasn't valid JSON. |
| 400 | `{"error":"invalid_body","detail":"…"}` | Body was JSON but the wrong shape. |
| 400 | `{"error":"empty_batch"}` | `prospects: []` was empty. |
| 400 | `{"error":"validation_error","detail":"…"}` | Required field missing on a single-object request. |
| 401 | `{"error":"unauthorized"}` | Bearer token missing or wrong. |
| 413 | `{"error":"batch_too_large","detail":"Max 100 prospects per request, got …"}` | Split the batch into chunks of ≤ 100. |
| 503 | `{"error":"db_not_configured"}` | Server-side env-var issue. Page the operator. |

---

## Automation 2: Sequence Orchestrator

**Goal**: Every run, fetch the prospects whose 6-step email sequence is in flight, decide which ones are due, send via Gmail, and PATCH back each row's progress so the next run knows where to pick up.

### Step A — pull the active-sequence working set

```
GET https://cursor.omarsimon.com/api/chatgtm/prospects?company_domain=<domain>&replied=false&last_sequence_sent_lt=6&include=opens
```

Headers:
```
Authorization: Bearer {{CHATGTM_API_TOKEN}}
```

Query parameters:
- `company_domain=<domain>` — restrict to one account at a time. Iterate over your target accounts and run the rest of this step per account.
- `replied=false` — drop prospects who replied; we don't want to email them again.
- `last_sequence_sent_lt=6` — drop prospects who finished the 6-step sequence. Includes prospects who never started (`last_sequence_sent IS NULL`).
- `include=opens` — opt in to demo-open stats so the orchestrator can decide whether to reference "you opened the demo" in the email body.

Iterate using `next_cursor` until null, just like in Automation 1.

### Step B — for each prospect, decide whether to send

The response includes a server-computed `next_email_send_date`:

```json
{
  "id": "uuid",
  "slug": "ZlHiS8eq3M",
  "name": "Jane Smith",
  "email": "jane.smith@unisys.com",
  "company_name": "Unisys",
  "level_normalized": "vp",
  "thread_id": "18f3a2b4c5d6e7f8",
  "last_sequence_sent": 2,
  "last_email_send_date": "2026-05-10",
  "next_email_send_date": "2026-05-14",
  "replied": false,
  "linkedin_sent": true,
  "linkedin_draft": "Hi Jane …",
  "mcp_detail": "As VP of Engineering …",
  "team": "Platform",
  "classified_level": "Leader (Dir/VP+)",
  "demo_url": "https://cursor.omarsimon.com/p/ZlHiS8eq3M",
  "demo_password": "Jane3146",
  "unlocked_view_count": 2,
  "first_unlocked_at": "2026-05-12T18:42:11.000Z",
  "last_unlocked_at":  "2026-05-12T22:07:50.000Z"
}
```

Send the email when **today (UTC) ≥ `next_email_send_date`**:

- If `last_sequence_sent` is `null` → send Email 1.
- If `last_sequence_sent` is `1..5` → send Email `last_sequence_sent + 1`.
- If `last_sequence_sent === 6` → the row was filtered out by the query above, you won't see it.

The email body composition uses these row fields:
- `name`, `company_name`, `level_normalized` for greeting / framing.
- `mcp_detail` for the "why this matters to you" paragraph.
- `demo_url` + `demo_password` to inline the personalized demo CTA.
- `unlocked_view_count > 0` to optionally reference "you opened the demo last week".
- `thread_id` — when set (i.e. for Email 2..6), reply **in-thread** to that Gmail thread instead of starting a new thread.

### Step C — after each successful Gmail send, PATCH the prospect

```
PATCH https://cursor.omarsimon.com/api/chatgtm/prospects/<id_or_slug>
```

Headers:
```
Authorization: Bearer {{CHATGTM_API_TOKEN}}
Content-Type: application/json
```

Body — for **Email 1** (the first send), capture the new Gmail thread id so subsequent emails can reply in-thread:

```json
{
  "last_sequence_sent": 1,
  "last_email_send_date": "2026-05-14",
  "thread_id": "18f3a2b4c5d6e7f8"
}
```

Body — for **Emails 2..6**, only bump the step + date (the thread id is already stored):

```json
{
  "last_sequence_sent": 2,
  "last_email_send_date": "2026-05-14"
}
```

The server writes through and echoes the full updated row in the response:

```json
{ "ok": true, "prospect": { /* full updated row */ } }
```

#### Validation rules to respect (the server enforces, but you should pre-check)

- `last_sequence_sent` must be an integer **between 1 and 6 inclusive**. Any other value returns `400 {"error":"invalid_field","field":"last_sequence_sent","message":"Must be 1-6."}`.
- `last_email_send_date` must be `YYYY-MM-DD`. `"2026-5-14"` will fail; pad to `"2026-05-14"`.
- `thread_id` is a free-form string — Gmail's `threadId` is fine to pass straight through.
- Sending an unchanged value still works; the server is idempotent.

### Step D (optional but recommended) — batch the writes

If you have 5+ prospects to update in one orchestrator run, send a single batch PATCH instead of N round-trips:

```
PATCH https://cursor.omarsimon.com/api/chatgtm/prospects
```

Body:

```json
{
  "updates": [
    { "id": "ZlHiS8eq3M", "last_sequence_sent": 2, "last_email_send_date": "2026-05-14" },
    { "id": "9b01ac15-a49f-429a-80c3-d5af646ea3ac", "last_sequence_sent": 1, "last_email_send_date": "2026-05-14", "thread_id": "18f3a2b4c5d6e7f8" }
  ]
}
```

Hard cap: 100 updates per batch. Each `id` in the batch can be either a UUID or a slug.

Response on full success: `200 OK`. On per-row mixed success: `207 Multi-Status`:

```json
{
  "ok": false,
  "count": 2,
  "succeeded": 1,
  "failed": 1,
  "results": [
    { "ok": true,  "input_index": 0, "id": "ZlHiS8eq3M", "prospect": { /* full row */ } },
    { "ok": false, "input_index": 1, "id": "9b01ac15-…", "error": "invalid_field", "field": "last_sequence_sent", "message": "Must be 1-6." }
  ]
}
```

A failed row never aborts the batch — successful rows are still committed. Retry **only the failed rows** after fixing the validation issue.

### Errors to handle in the orchestrator

| Status | When |
| --- | --- |
| `400 invalid_field` | A field is out of range or wrong type. Surface `field` + `message` in the error log; do not retry without fixing. |
| `404 not_found` | The `id` / `slug` doesn't exist (someone deleted the prospect mid-run). Skip the row and continue. |
| `401 unauthorized` | Token rotated. Halt the run and page the operator. |
| `5xx` | Server hiccup. Retry **idempotently** (PATCH is safe to retry; the same bump → same final state). |

---

## Automation 3: Reply Detector

**Goal**: When a prospect replies (Gmail thread receives an inbound message that isn't ours), flip the `replied` flag so the Sequence Orchestrator stops emailing them.

You already have the Gmail thread ID and the prospect's email address. There are two equivalent paths to find the prospect row:

**Path A — by Gmail thread id**: pull every active-sequence row for the company and find the one whose `thread_id` matches. Only useful when you already know the company; usually less convenient than path B.

**Path B — by company / email lookup**:

```
GET https://cursor.omarsimon.com/api/chatgtm/prospects?company_domain=<domain>
```

Walk the cursor and find the row where `email` matches the inbound sender (case-insensitive). That gives you `id` (or `slug`).

### Then PATCH the replied flag

```
PATCH https://cursor.omarsimon.com/api/chatgtm/prospects/<id_or_slug>
```

Headers:
```
Authorization: Bearer {{CHATGTM_API_TOKEN}}
Content-Type: application/json
```

Body:

```json
{ "replied": true }
```

Response on success: `200 OK { "ok": true, "prospect": { /* full row */ } }`.

That single PATCH causes:

- The Sequence Orchestrator's `replied=false` filter to drop the row on its next run, so they never get another sequence email.
- The dashboard's Sequences tab to switch the row's status badge to "REPLIED".
- The server's computed `next_email_send_date` to flip to `null` (so any caching layer downstream knows there's nothing more to send).

### Optional — also stamp `reached_out_at`

If your Reply Detector also functions as the "I had a real conversation with them" flag, you can stamp the timestamp the rep took action:

```json
{ "replied": true, "reached_out_at": "2026-05-14T15:30:00Z" }
```

`reached_out_at` is an ISO-8601 datetime string.

### Idempotency

PATCHing `{"replied": true}` against an already-replied row is a no-op (server overwrites with the same value, returns `200 OK`). Safe to retry as many times as you want.

---

## Automation 4: Intent Signal LinkedIn Outreach

**Goal**: Every weekday morning, scan the territory's intent signals (Cursor signups, job changes, title changes, team-admin signups, …) for the last 24h, enrich each contact, draft a brief LinkedIn thank-you + training offer, draft a one-time email when a work email exists, and POST the day's run to the outreach endpoints. Omar works the queue in the **Intent Data** tab at `/admin` — compact table view, copy-and-open LinkedIn, edit emails, flag rows to send.

This automation is **distinct from the cold-outbound flow** (Automations 1-3): warm-signal driven, one-time outreach (not a 6-step sequence), runs across all 23 accounts in a single pass.

### Step A — dedup against recent contacts

```
GET https://cursor.omarsimon.com/api/outreach/contacts/recent?since_days=30&user_email=omar.simon@anysphere.co
```

Build a set of `linkedin_url || work_email || signup_email || external_key` from the response. Skip any candidate already in that set.

Use `since_days=30` for L30D backfills (default on the server). Daily 24h runs can pass `since_days=14`.

### Step B — log the run

```
POST https://cursor.omarsimon.com/api/outreach/runs
```

Body (full reference in `docs/outreach-integration.md`):

```json
{
  "automation_run_id": "<uuid the agent generated for this run>",
  "automation_revision_id": "<uuid identifying the prompt revision>",
  "user_email": "omar.simon@anysphere.co",
  "run_date": "2026-05-15",
  "ran_at": "2026-05-15T15:02:17Z",
  "window_start": "2026-05-14T15:00:00Z",
  "window_end": "2026-05-15T15:00:00Z",
  "summary": { "total_contacts": 18, "...": "..." }
}
```

Capture `run_id` from the response — required for steps C + D. On retry with the same `automation_run_id`, the response returns the **same** `run_id` with `"created": false`. You may pass `automation_run_id` instead of `run_id` on steps C + D.

Idempotent on `automation_run_id`: a partial-batch retry with the same id last-write-wins-updates the summary counters.

### Step C — POST the contacts batch

```
POST https://cursor.omarsimon.com/api/outreach/contacts/batch
```

Body shape: `{ run_id | automation_run_id, contacts: [...] }`. Up to 100 contacts per request. Idempotent on `(run_id, external_key)`. Full schema documented in `docs/outreach-integration.md`.

**Critical agent behaviors:**

1. **`linkedin.message` is the full LinkedIn DM** — a brief thank-you for using Cursor plus an offer of training / office hours. 2-4 sentences, first-name personalized. Stored verbatim; the dashboard appends demo URL + password on copy (same as Sequences).
2. **When `work_email` or `cursor_usage.signup_email` is present, always include an `email` block** with `status: "drafted"`, a subject, and a body. Omar edits these in the Intent Data tab and flags rows to send; a separate orchestrator step sends flagged emails once. Send target is `work_email` if set, otherwise `signup_email`.
3. **When no email at all**, set `email.status: "no_work_email"` and omit subject/body.
4. **Always set `cursor_usage.signup_email`** for enrolled Cursor users — the email they signed up with (often personal Gmail). Store separately from `contact.work_email` when both exist. `work_email` accepts any email domain (personal Gmail/Outlook/Yahoo included) — it is the email of record for the contact.
5. **UI-managed columns are the dashboard's, not yours.** Do not set `linkedin_sent`, `email_flagged_to_send`, `email_sent_at`, `connection_status_value`, `connection_*_at`, or `omar_notes`. The upsert preserves them across your re-POSTs.
6. **`account_display_name` is the rollup key.** Cognizant + 18 subsidiaries should all set `account_display_name = "Cognizant"` even though `account_name` is the specific entity ("Cognizant Softvision"). The dashboard groups + filters by `account_display_name`.
7. **`demo.demo_ok`** — omit or set `true` (default). Server generates a personalized demo URL + password on ingest. The dashboard appends them to the LinkedIn copy (same as Sequences). Set `false` only to skip demo generation.

**Example `linkedin.message`:**

```
Hi Jane — saw you've been using Cursor at Cognizant Softvision. Thanks for being an early adopter! Happy to set up a quick training session for your team if useful — we run informal office hours for power users rolling this out org-wide.
```

**Example `email` block (when work_email present):**

```json
{
  "subject": "Cursor training for your team at Cognizant Softvision",
  "body": "Hi Jane,\n\nThanks for using Cursor...",
  "status": "drafted"
}
```

### Step D — POST the per-signal child rows

```
POST https://cursor.omarsimon.com/api/outreach/contact-signals/batch
```

Body: `{ run_id | automation_run_id, signals: [{ contact_external_key, signal_type, detected_at, raw }] }`. Up to 1000 per request. Idempotent on `(contact_id, signal_type, detected_at)`.

**POST contacts (Step C) BEFORE signals (Step D)** — the signals endpoint resolves `contact_external_key` against the contacts already in the run. Signals referencing an unknown external_key are returned as `{ error: "not_found", field: "contact_external_key" }`.

### Step E — Slack DM Omar

Post to Omar (Slack ID: `U0ASG70KCKX`):

```
🎯 Intent Outreach run complete · {run_date}
{total_contacts} contacts ({unique_executives} exec, {unique_leaders} leader, {unique_managers} mgr, {unique_ics} IC)
Hot: {count of priority_tier=hot}
Open Intent Data: https://cursor.omarsimon.com/admin
```

### One-time email sends (orchestrator add-on)

Omar flags rows in the Intent Data tab (`email_flagged_to_send = true`). Your Sequence Orchestrator (or a sibling automation) should add a step **before** the cold sequence loop:

```
GET https://cursor.omarsimon.com/api/outreach/contacts?email_flagged_to_send=true
```

For each returned contact with a send address (`work_email` or `signup_email`) and `email_subject` / `email_body`:

1. Send via `gmail_send` to `work_email` if set, else `signup_email`.
2. Stamp the row:

```
PATCH https://cursor.omarsimon.com/api/outreach/contacts/<id>
{ "email_sent_at": "<ISO datetime>", "email_flagged_to_send": false }
```

These are **one-time** sends to active Cursor users — do not enroll them in the 6-step cold sequence.

### Errors to handle

| Status | When | What to do |
| --- | --- | --- |
| 400 `invalid_field` | Body shape wrong (missing required field, bad enum value, bad ISO datetime, etc.) | Surface `field` + `message`, halt. Do not retry without fixing. |
| 404 `not_found` (Step D only) | `contact_external_key` references a contact you didn't include in Step C | Re-run Step C with the missing contact then retry Step D. |
| 401 `unauthorized` | Token rotated | Halt run, Slack-page Omar, do not retry. |
| 413 `batch_too_large` | >100 contacts or >1000 signals | Split into chunks. |
| 5xx | Server hiccup | Retry idempotently — every endpoint is safe to retry on natural keys. |

### Dashboard contract

Once the run lands, Omar works the queue at `https://cursor.omarsimon.com/admin` → **Intent Data** tab:

- Compact table (like Sequences): one row per contact with signal chips, priority, POWER/ALUMNI badges.
- **Send LI** — copy message + open LinkedIn (same flow as Sequences tab).
- **Email** — edit draft, toggle "Flag to send" for the orchestrator.
- No enroll-in-sequence — these are one-time touches, not cold outbound.

The full reference is `docs/outreach-integration.md` in the repo.

---

## Where to look when something doesn't work

- **Admin UI**: `https://cursor.omarsimon.com/admin` — four tabs:
  - **Prospects** — every row created via this API + the build status of the personalized demo.
  - **Sequences** — every row's email-tracking state (`last_sequence_sent` / `last_email_send_date` / `thread_id` / `replied` / demo opened) plus inline edits.
  - **Intent Data** — warm-signal contacts from Automation 4 (table view, LinkedIn + one-time email).
  - **Analytics** — aggregate opens.

  Sign in with the admin password; the rep paste-loads the same `CHATGTM_API_TOKEN` to view the data.

- **Daily Slack digest** of who opened their demo: `GET https://cursor.omarsimon.com/api/chatgtm/digest/opened?since=24h` (separate automation, see `docs/chatgtm-daily-digest-automation.md`). Same bearer token.

- **Field reference, full response shape, full enum values**: `docs/chatgtm-integration.md` in this repo.

- **Token rotation**: change `CHATGTM_API_TOKEN` in Vercel (Project Settings → Environment Variables) → redeploy → update the same token in ChatGTM's secret store. Until both are updated, calls return `401 unauthorized`.
