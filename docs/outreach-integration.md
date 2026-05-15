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

Logs run metadata. Idempotent on `automation_run_id`.

### `POST /api/outreach/contacts/batch`

Upserts contacts. Up to **100 per request**. Idempotent on `(run_id, external_key)`.

**Agent provides:**

- `linkedin.message` — full LinkedIn DM (thank-you + training offer). Stored verbatim.
- `email` — when `work_email` or `cursor_usage.signup_email` exists: `{ subject, body, status: "drafted" }`. When missing: `{ status: "no_work_email" }`.
- `cursor_usage.signup_email` — the email the user signed up to Cursor with (store always for enrolled users).
- `demo.demo_ok` — defaults to `true`; server generates demo URL + password on ingest.

**Server preserves on re-POST (UI-managed):**

`linkedin_sent`, `email_flagged_to_send`, `email_sent_at`, `linkedin_message`, `email_subject`, `email_body` (once set).

### `POST /api/outreach/contact-signals/batch`

Child signal rows. POST contacts before signals.

### `GET /api/outreach/contacts/recent`

Dedup feed for the agent (`since_days`, optional `user_email`).

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
| Intent | POWER, ALUMNI badges |
| LinkedIn | Sent toggle |
| Email | Subject snippet, Send flag, sent status |
| Signal | Latest signal date |
| Actions | Send LI (copy + open), Edit email |

**Send LI** reuses the Sequences copy-and-open LinkedIn dialog (intent mode — no demo append).

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
