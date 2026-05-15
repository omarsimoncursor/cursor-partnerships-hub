# Outreach territory dashboard — API + UI reference

Companion to `docs/chatgtm-integration.md`. Documents the data
contract, schema, and UI for the **Intent Signal LinkedIn Outreach**
automation, which ingests warm-signal contacts (Cursor signups, job
changes, title changes, etc.) into the same webapp that powers the
cold-prospects pipeline.

The two surfaces share a database, an admin password, and a bearer
token (`CHATGTM_API_TOKEN`), but live in distinct tables and URL
spaces:

| Surface | URL | Backed by | Source automation |
|---|---|---|---|
| Cold prospects | `/admin/prospects` + `/admin/sequences` | `prospects` | Prospecting Blitz + Sequence Orchestrator |
| Outreach contacts | `/outreach/dashboard` + `/outreach/runs/<id>` | `outreach_runs` + `outreach_contacts` + `outreach_contact_signals` | Intent Signal LinkedIn Outreach |

Cross-link: `outreach_contacts.promoted_to_prospect_id → prospects(id)`.
The dashboard's `Enroll in sequence` button uses this to insert a
matching `prospects` row so the email orchestrator picks up the
contact for the 6-step sequence.

---

## Endpoints

All endpoints expect `Authorization: Bearer ${CHATGTM_API_TOKEN}`.
4xx errors return `{ "error": "<code>", "field": "<name>", "message": "<human>" }`.

### `POST /api/outreach/runs`

Logs a run's metadata + summary counters. Idempotent on
`automation_run_id` — re-POSTing with the same id does a
last-write-wins update of every column except `id` and `created_at`,
so a partial-batch retry leaves correct counters.

**Body:**
```json
{
  "automation_run_id": "<uuid>",
  "automation_revision_id": "<uuid>",
  "user_email": "omar.simon@anysphere.co",
  "run_date": "2026-05-15",
  "ran_at": "2026-05-15T15:02:17Z",
  "window_start": "2026-05-14T15:00:00Z",
  "window_end": "2026-05-15T15:00:00Z",
  "summary": {
    "total_contacts": 18,
    "total_emails_drafted": 14,
    "unique_accounts_signaled": 6,
    "unique_executives": 2,
    "unique_leaders": 7,
    "unique_managers": 9,
    "count_with_work_email": 14,
    "count_with_linkedin_url": 17,
    "accounts_with_activity": ["Cognizant", "Globant", "KLA"],
    "accounts_with_no_signals": ["Concentrix", "Unisys"]
  }
}
```

**Response:** `200 { "ok": true, "run_id": "<uuid>", "run": { ... } }`.

### `POST /api/outreach/contacts/batch`

Upserts the day's contacts. Body shape:

```json
{
  "run_id": "<uuid from POST /api/outreach/runs>",
  "contacts": [
    {
      "external_key": "linkedin:janedoe",
      "account": { ... },
      "contact": { ... },
      "cursor_usage": { ... } | null,
      "signals": { "first_seen_at": "...", "latest_at": "...", "types": [...] },
      "priority": { "tier": "hot" | "warm" | "nurture", "rationale": "..." },
      "demo": { "demo_ok": true | false, "show_roi_calculator": true | false, ... },
      "linkedin": { "message": "<prose only — see below>" },
      "email": { "subject": "...", "body": "...", "status": "drafted" }
    }
  ]
}
```

Up to **100 contacts per request**. Idempotent on `(run_id, external_key)`.

**Server side effects:**

1. **Demo URL + password are server-generated**, not taken from
   `demo.demo_url` / `demo.demo_password` in the agent's payload.
   When the contact's `linkedin_url` or `work_email` matches a row in
   `prospects`, the existing demo URL is reused. Otherwise a new
   `prospects` row is created (with `metadata.source = "outreach"`)
   and its slug-backed URL is used. The result is stored in
   `outreach_contacts.demo_url` / `demo_password`.

2. **The LinkedIn message stored on the row is the FULL message** —
   the agent's `linkedin.message` is treated as prose only, and the
   server appends `\n\n<demo_url>\nPassword: <demo_password>` to it
   before persisting. This dedupes naturally (skip-append when the
   prose already contains the URL or password). The dashboard renders
   the stored full message verbatim and copy-to-clipboard pastes it
   straight into LinkedIn.

3. **UI-managed lifecycle columns are preserved across re-POSTs.**
   The agent never sets `connection_status_value`,
   `connection_sent_at`, `connection_accepted_at`, `reply_received_at`,
   `omar_notes`, `promoted_to_prospect_id`, or `promoted_at`. Those are
   written only by the dashboard via `PATCH /api/outreach/contacts/:id`
   (and `POST /api/outreach/contacts/:id/promote`). On re-POST of the
   same `(run_id, external_key)` row, the upsert SQL explicitly omits
   those columns from the SET clause, so Omar's manual work is
   preserved.

**Response:** `200 / 207 multi-status`:

```json
{
  "ok": true,
  "inserted": 14,
  "updated": 4,
  "skipped_duplicate": 0,
  "contacts": [
    { "ok": true, "input_index": 0, "id": "<uuid>", "external_key": "linkedin:janedoe", "status": "inserted" },
    { "ok": false, "input_index": 7, "external_key": "linkedin:bad", "error": "invalid_field", "field": "contacts[7].contact.full_name", "message": "..." }
  ]
}
```

### `POST /api/outreach/contact-signals/batch`

Child rows for time-series filtering. Each entry references its
parent contact by `contact_external_key` (the same string as
`outreach_contacts.external_key` in the same run). Up to **1000
signals per request**. Idempotent on `(contact_id, signal_type, detected_at)`.

```json
{
  "run_id": "<uuid>",
  "signals": [
    { "contact_external_key": "linkedin:janedoe", "signal_type": "golden_signup",
      "detected_at": "2026-05-14T18:22:00Z", "raw": { ... } },
    { "contact_external_key": "linkedin:janedoe", "signal_type": "title_change",
      "detected_at": "2026-05-14T22:10:00Z",
      "raw": { "previous_title": "Senior Engineering Manager",
               "current_title": "Director of Platform Engineering" } }
  ]
}
```

**Response:** `200 / 207 { "ok": true, "inserted": N, "failed": 0, "results": [] }`.
A signal that references a `contact_external_key` not present in
this run returns `{ error: "not_found", field: "contact_external_key" }`.
**Always POST contacts before signals.**

### `GET /api/outreach/contacts/recent`

Dedup feed for the agent. Returns dedup tuples for every contact
whose latest-signal date falls inside the window.

**Query params:**

- `since_days` (1..90, default 14)
- `user_email` (optional — restrict to one rep's territory)

**Response:**

```json
{
  "ok": true,
  "since_days": 14,
  "count": 47,
  "contacts": [
    { "linkedin_url": "...", "work_email": "...", "external_key": "...", "last_run_date": "2026-05-15" }
  ]
}
```

The agent calls this at the top of every run, builds a dedup set on
`(linkedin_url || work_email || external_key)`, and skips any
candidate that's already there.

### `GET /api/outreach/contacts/:id`

Single-row fetch. Returns the contact row plus optional `signals` (when present) and `linked_prospect` (when matched).

### `PATCH /api/outreach/contacts/:id`

UI-managed lifecycle only. The body whitelist is exactly:
`connection_status_value`, `connection_sent_at`, `connection_accepted_at`, `reply_received_at`, `omar_notes`. Anything else returns 400.

When the caller sends `connection_status_value` without the
matching `_at` timestamp, the server stamps `now()` automatically:
- `sent` → `connection_sent_at = now()`
- `accepted` → `connection_accepted_at = now()`
- `replied` → `reply_received_at = now()`

This is the path the dashboard's "Mark sent" / "Mark accepted" /
"Mark replied" buttons hit.

### `POST /api/outreach/contacts/:id/promote`

"Enroll in sequence." Either:

- **Already promoted** (`promoted_to_prospect_id` is set): returns the linked prospect with `was_existing: true`.
- **Natural-key match exists** (a `prospects` row already has this `linkedin_url` or `work_email`): stamps the FK on the outreach row, returns `was_existing: true`.
- **Net-new**: creates a new `prospects` row from the outreach contact's mapped fields (`name`, `email`, `linkedin_url`, `level`, `classified_level`, plus inherits the agent's prose LinkedIn message as the new prospect's `linkedin_draft`, or falls back to the shared template). Stamps the FK and returns `was_existing: false`.

**Response:**

```json
{
  "ok": true,
  "contact": { ... },
  "prospect": {
    "id": "<uuid>",
    "slug": "...",
    "url": "https://cursor.omarsimon.com/p/...",
    "password": "Jane3146",
    "last_sequence_sent": null,
    "replied": false
  },
  "was_existing": false
}
```

The promoted prospect lands with `last_sequence_sent = null`, so the
next Sequence Orchestrator run picks them up at Email 1 (assuming
their `company_domain` matches one of the orchestrator's per-account
automations).

---

## UI

### `/outreach/dashboard` — territory rolling view

Five top cards (clickable as filter overlays):

| Card | Filter |
|---|---|
| Hot today | `priority_tier_value = 'hot'` |
| Power users, no SFDC activity | `is_power_user = true AND last_sfdc_activity_at IS NULL` |
| Cursor-customer alumni | `prior_employer_match_count > 0` |
| Stale sent (>7d) | `connection_status_value = 'sent' AND connection_accepted_at IS NULL AND connection_sent_at < now() - 7d` |
| Accounts at 3+ L7d signals | accounts where any contact has `account_signal_count_l7d >= 3` |

Filter row: search, date range, account, seniority, priority,
status, signal type. Toggle chips: "Cursor alumni only", "Power users
only", "Has work email". All filters compose.

Each contact card surfaces:

- Identity: name, title, account display name (with subsidiary note in muted text)
- Badges: priority, seniority, POWER (when `is_power_user`), ALUMNI (when prior employer matches)
- Signal chips + per-account L7d signal density
- Priority rationale text
- LinkedIn message preview with copy-to-clipboard
- Inline links: LinkedIn URL, work email, demo URL, demo password, SFDC contact, last Gong call
- Notes editor (collapsed by default)
- Action buttons: Mark sent / Mark accepted / Mark replied / Undo / Close, no reply / DQ / Edit notes / Enroll in sequence
- Cross-link badge when the contact is also in the cold sequence

### `/outreach/runs/:run_id` — single-day run view

Same contact card. Grouped by `account_display_name` with
collapsible account sections. Subsidiaries roll up to the parent
(Cognizant Softvision contacts appear under the Cognizant umbrella;
the actual `account_name` shows in muted text under the contact's
title).

The Slack DM the agent sends every weekday morning should deep-link
to `/outreach/runs/<id>` so Omar lands on the day's working set.

---

## Schema

See `src/lib/prospect-store/schema.sql`, section "Outreach territory
dashboard". The three tables and six enums are created idempotently
(IF NOT EXISTS / catch duplicate_object) so `/api/db/init` is safe to
re-run after a deploy.

| Table | Purpose |
|---|---|
| `outreach_runs` | Run metadata + summary counters. Idempotent on `automation_run_id`. |
| `outreach_contacts` | Per-contact-per-run row. Unique on `(run_id, external_key)`. |
| `outreach_contact_signals` | Per-signal child rows. Unique on `(contact_id, signal_type, detected_at)`. |

Cross-table: `outreach_contacts.promoted_to_prospect_id` references
`prospects(id)` with `ON DELETE SET NULL`.

---

## Cutover checklist

1. Deploy: schema migration runs automatically on first call to any
   outreach endpoint via `ensureSchema()`. No manual `/api/db/init`
   re-run required (but harmless).
2. Update the ChatGTM "Intent Signal LinkedIn Outreach" automation to
   call the new endpoints in order:
   1. `POST /api/outreach/runs` → capture `run_id`.
   2. `GET /api/outreach/contacts/recent?since_days=14` → build dedup set.
   3. `POST /api/outreach/contacts/batch` with `run_id` + the day's contacts (post-dedup).
   4. `POST /api/outreach/contact-signals/batch` with `run_id` + the per-signal child rows.
3. **Update the agent prompt to send `linkedin.message` as prose only**
   — no demo URL or password inline. The server appends them. Same
   convention as the existing `linkedin_draft` column in cold
   prospects (see `docs/chatgtm-integration.md` Section "Sequences").
4. Verify against the dashboard: `/outreach/dashboard` should show
   the day's contacts, and `/outreach/runs/<id>` should render the
   account-grouped view.
5. The Slack DM from the agent should link to `/outreach/runs/<id>`.
