# Intent Data — API + UI reference

Companion to `docs/chatgtm-integration.md`. Documents the data
contract, schema, and **Intent Data** admin tab for the **Intent Signal
LinkedIn Outreach** automation.

| Surface | URL | Backed by |
|---|---|---|
| Cold prospects | `/admin` → Prospects + Sequences | `prospects` |
| Intent contacts | `/admin` → **Intent Data** | `outreach_runs` + `outreach_contacts` + `outreach_contact_signals` |

Legacy `/outreach/*` URLs redirect to `/admin`.

---

## Endpoints

All endpoints expect `Authorization: Bearer ${CHATGTM_API_TOKEN}`.

### `POST /api/outreach/runs`

Logs run metadata. Idempotent on `automation_run_id`. Summary accepts `unique_ics` alongside `unique_executives`, `unique_leaders`, `unique_managers`. Response includes `created: true|false` and echoes `automation_run_id`.

### `GET /api/outreach/runs?limit=1`

Recent run summaries for the Intent Data dashboard header.

### `POST /api/outreach/contacts/batch`

Upserts contacts. Up to **100 per request**. Accepts `run_id` or `automation_run_id` (resolves to the same run row on retry). Idempotent on `(run_id, external_key)`.

**Agent provides:**

- `linkedin.message` — full LinkedIn DM (thank-you + training offer). Stored verbatim.
- `email` — when `work_email` or `cursor_usage.signup_email` exists: `{ subject, body, status: "drafted" }`. When missing: `{ status: "no_work_email" }`.
- `cursor_usage.signup_email` — the email the user signed up to Cursor with (store always for enrolled users).
- `contact.seniority_tier` — `IC` | `Manager` | `Leader` | `Executive`
- `contact.work_email` — email of record (work or personal; no domain restriction)

**Server preserves on re-POST (UI-managed):**

`linkedin_sent`, `email_flagged_to_send`, `email_sent_at`, `linkedin_message`, `email_subject`, `email_body` (once set).

### `POST /api/outreach/contact-signals/batch`

Child signal rows. POST contacts before signals.

### `GET /api/outreach/contacts/recent`

Dedup feed for the agent. Default `since_days=30` (use 30 for L30D backfills). Optional `user_email` filters on the parent run's rep email (`outreach_runs.user_email`), not `account_owner_email`. Returns one row per canonical identity (linkedin → work email → signup email → external_key), including `signup_email`.

### `GET /api/outreach/contacts`

List for the Intent Data tab and the one-time email send worker.

Query params:

| Param | Purpose |
|---|---|
| `email_flagged_to_send=true` | Rows Omar flagged; `email_sent_at IS NULL` |
| `email_sent=true\|false` | Filter by send state |
| `linkedin_sent=true\|false` | Filter by LinkedIn sent |
| `run_id` | Single run |
| `account` | `account_display_name` |
| `priority` | `hot\|warm\|nurture` |
| `seniority` | `IC\|Manager\|Leader\|Executive` |
| `since_days` | Default 30 |
| `limit`, `offset` | Pagination |

### `PATCH /api/outreach/contacts/:id`

UI-managed fields only:

- `linkedin_message`, `linkedin_sent`
- `email_subject`, `email_body`, `email_flagged_to_send`, `email_sent_at`
- Legacy: `connection_status_*`, `omar_notes`

### `GET /api/outreach/contacts/:id`

Single-row fetch.

---

## Intent Data tab (`/admin`)

Compact table (same density as Sequences):

| Column | Content |
|---|---|
| Contact | Name, title, work/signup email, account — **click row for full detail modal** |
| Signals | Signal type chips |
| Priority | hot / warm / nurture |
| Seniority | IC / Manager / Leader / Executive — filterable |
| Context | Priority rationale + usage badges |
| LinkedIn | Sent toggle |
| Email | Subject snippet, Send flag, sent status |
| Signal | Latest signal date |
| Actions | Send LI (copy + open), Edit email |

**Send LI** reuses the Sequences copy-and-open LinkedIn dialog — draft plus auto-appended demo URL/password when present.

**Email** — edit draft in modal, toggle "Flag to send". The orchestrator add-on sends flagged rows and stamps `email_sent_at`.

No enroll-in-sequence — one-time outreach to active users.

---

## One-time email orchestrator step

Add to Sequence Orchestrator (or a sibling automation) **before** the cold loop:

```
GET /api/outreach/contacts?email_flagged_to_send=true
```

For each contact: `gmail_send` to `work_email ?? signup_email` with `email_subject` / `email_body`, then:

```
PATCH /api/outreach/contacts/<id>
{ "email_sent_at": "<now ISO>", "email_flagged_to_send": false }
```

---

## Schema

See `src/lib/prospect-store/schema.sql` — outreach section.

Key UI columns on `outreach_contacts`:

- `linkedin_message`, `linkedin_sent`
- `email_subject`, `email_body`, `email_flagged_to_send`, `email_sent_at`
