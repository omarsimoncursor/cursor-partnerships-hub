# ChatGTM ↔ Personalized prospect demos

This app is the destination for ChatGTM's outbound automation. ChatGTM (Cursor's internal Sumble → Notion → Gmail / LinkedIn orchestration) calls into this app to mint a per-prospect, password-gated demo URL. The URL is written back into the Notion table and embedded in the auto-drafted prospecting messages.

## Pipeline overview

```
Sumble ──▶ ChatGTM ──▶  POST /api/chatgtm/prospects  ──▶  Neon Postgres
                                  │
                                  ▼
                  { url, password } returned in body
                                  │
                                  ▼
       ChatGTM writes URL + password into the Notion table
                  & inlines them in the Gmail / LinkedIn drafts
```

The prospect opens the URL, hits a password gate, enters the password from
their LinkedIn message or email, and lands on a personalized version of the
existing co-sell demo (vendor demo cards + SDK composer + optional ROI
calculator).

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

Creates a new prospect, persists it to Neon, and returns the demo URL +
auto-generated password.

**Request body** (`application/json`):

```json
{
  "name": "Jane Smith",
  "company": "Unisys",
  "email": "jane.smith@unisys.com",
  "level": "VP of Engineering",
  "linkedin_url": "https://www.linkedin.com/in/janesmith",
  "company_domain": "unisys.com",
  "company_accent": "#FFB81C",
  "technologies": ["Datadog", "Snowflake", "GitHub", "Slack", "Atlassian Jira", "Terraform"],
  "mcp_relevant": true,
  "sdk_workflow": "datadog-slo-breach",
  "gmail_draft_link": "https://mail.google.com/mail/u/0/#drafts/abc123",
  "linkedin_message_link": "https://www.linkedin.com/messaging/thread/xyz",
  "notion_page_id": "abc123",
  "metadata": { "sumble_id": "sumble_42" }
}
```

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

**Response 201**:

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

**Errors**:

| Status | `error`                | Meaning                                              |
| ------ | ---------------------- | ---------------------------------------------------- |
| 400    | `invalid_json`         | Body wasn't valid JSON.                              |
| 400    | `validation_error`     | Required field missing — see `detail`.                |
| 401    | `unauthorized`         | Bearer token missing or wrong.                       |
| 503    | `db_not_configured`    | `DATABASE_URL` isn't set on the deployment.          |
| 500    | `internal_error`       | Anything else — see `detail` and server logs.        |

### `GET /api/chatgtm/prospects?limit=N`

Lists recent prospects. Used by the `/prospect-builder/admin` UI and any
internal monitoring. Same auth.

### `GET /api/chatgtm/prospects/:id`

Looks up a prospect by either UUID or slug. Useful for ChatGTM to
double-check state after a create.

### `POST /api/db/init`

Idempotent bootstrap — creates tables and upserts the company seed list
(`Unisys`, `Cognizant`, `Concentrix`, `KLA`, `Globant`). Auth uses
`DB_INIT_TOKEN` (separate from the ChatGTM token so the deploy step can
have its own scope).

## Persistence model

Three tables, all in the `public` schema (see `src/lib/prospect-store/schema.sql`):

- **`companies`** — seeded list of target accounts with their default accent + tech stack.
- **`prospects`** — one row per ChatGTM call. Stores the password (cleartext — the threat model is "drive-by URL discovery", not "DB compromise"; the demo content is sales material, not customer data).
- **`prospect_views`** — append-only audit log of every page hit (locked + unlocked) with IP and user agent.

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

npm run dev
curl -X POST http://localhost:3000/api/db/init -H "Authorization: Bearer $DB_INIT_TOKEN"

# Create a test prospect:
curl -X POST http://localhost:3000/api/chatgtm/prospects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHATGTM_API_TOKEN" \
  -d '{ "name": "Jane Smith", "company": "Unisys", "level": "VP",
        "technologies": ["Datadog","Snowflake","GitHub"] }'
```

The response includes the URL + password — open it in a browser, paste the
password into the gate, and you should see the personalized demo render.

The `/prospect-builder/admin` page in the same browser (after entering the
token) shows the live list of every prospect created via this endpoint.
