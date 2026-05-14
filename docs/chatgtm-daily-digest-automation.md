# ChatGTM daily digest: who opened the demo

A short reference for the ChatGTM automation that posts a daily Slack digest of every prospect who unlocked their personalized Cursor demo in the last 24 hours.

## Endpoint

`GET https://cursor.omarsimon.com/api/chatgtm/digest/opened?since=24h`

> The legacy `cursorpartners.omarsimon.com` host still resolves to the same Vercel project, so an automation that hasn't been updated yet won't break — but new automations should target `cursor.omarsimon.com`.

| | |
| --- | --- |
| **Auth** | `Authorization: Bearer ${CHATGTM_API_TOKEN}` (same token as the rest of the integration) |
| **Window** | `?since=24h`. Other accepted values: `12h`, `7d`, `1h`. Capped at 30d. |
| **Cap** | 1000 prospects per response (more than enough for daily volume) |

### Response shape

```json
{
  "ok": true,
  "since": "24h",
  "since_ts": "2026-05-12T03:18:00.000Z",
  "count": 3,
  "prospects": [
    {
      "id": "uuid",
      "slug": "abc123XYZ0",
      "url": "https://cursor.omarsimon.com/p/abc123XYZ0",
      "name": "Maria Rodriguez",
      "email": "maria@globant.com",
      "linkedin_url": "https://linkedin.com/in/mariarodriguez",
      "company_name": "Globant",
      "company_domain": "globant.com",
      "level_normalized": "director",
      "level_raw": "Director of Delivery",
      "first_unlocked_at": "2026-05-12T18:42:11.000Z",
      "last_unlocked_at":  "2026-05-12T22:07:50.000Z",
      "unlocked_view_count": 2,
      "reached_out_at": null
    }
  ]
}
```

`prospects` is sorted by `last_unlocked_at` DESC. `reached_out_at` is non-null when the rep has already checked the "I reached out" box on the admin Analytics tab — useful if ChatGTM wants to skip those rows.

## Prompt to paste into ChatGTM's automation builder

```
Goal: every weekday morning at 9:00 AM PT, post a Slack message in
#prospect-demo-opens summarizing who opened their personalized
Cursor demo in the prior 24 hours, so I can DM each one on LinkedIn.

Step 1 — Fetch the digest

Make a GET request to:
  https://cursor.omarsimon.com/api/chatgtm/digest/opened?since=24h

Headers:
  Authorization: Bearer {{CHATGTM_API_TOKEN}}
  Content-Type: application/json

Parse the JSON response. The interesting fields are:
  response.count                       — number of opens in the window
  response.prospects[].name            — full name
  response.prospects[].company_name    — e.g. "Globant"
  response.prospects[].level_raw       — full title from Sumble
  response.prospects[].linkedin_url    — DM target
  response.prospects[].url             — their personalized demo URL
  response.prospects[].last_unlocked_at  — ISO-8601 timestamp
  response.prospects[].unlocked_view_count — how many times they opened it
  response.prospects[].reached_out_at  — null = haven't DM'd yet, ISO = already done

Step 2 — Post a Slack message

If response.count == 0, post:
  > :sleeping: No prospects opened their Cursor demos in the last 24 hours.

Otherwise, post (block-kit-style):
  > *:bell: {{response.count}} prospect{{s if response.count != 1 else ""}}
  > opened their Cursor demo in the last 24 hours.*
  >
  > For each row in response.prospects (skipping any with reached_out_at != null):
  >   • <linkedin_url|*name*> — *company_name*, level_raw
  >     opened {{relative time of last_unlocked_at}} ({{unlocked_view_count}}
  >     view{{s if count != 1}})  ·  <url|view their demo>
  >
  > Reply in-thread once you've sent the LinkedIn message. The admin
  > Analytics tab updates the moment you check the "reached out" box.

Step 3 — (Optional) Skip "already reached out" rows

If you want the digest to only mention people I haven't DM'd yet,
filter response.prospects on the client side:

  response.prospects.filter(p => p.reached_out_at == null)

Step 4 — On error

If the GET returns non-200, post:
  > :warning: Demo-digest fetch failed: {{response.status}}
  > {{response.body.error || response.body.detail || "unknown"}}
  > (Endpoint: /api/chatgtm/digest/opened, token rotation may be needed.)
```

## Tuning

- **Different schedule**: change `?since=24h` to `?since=12h` for a midday digest, `?since=1h` for a near-realtime channel.
- **Per-company digests**: the digest endpoint doesn't filter by company, but the same data is available via `GET /api/chatgtm/analytics` which has per-company aggregates plus the same `opened` list. Filter client-side on `prospect.company_name`.
- **Token rotation**: rotating `CHATGTM_API_TOKEN` requires updating the value in both the Vercel env and ChatGTM's automation. The endpoint will respond `401 unauthorized` until ChatGTM is updated.

## Why this endpoint vs. the existing `/api/chatgtm/prospects` list

The existing `GET /api/chatgtm/prospects` returns every prospect ChatGTM has ever pushed, regardless of whether they've opened their demo. To answer "who opened in the last 24h" from that endpoint, ChatGTM would need to either:

1. Hit `/api/chatgtm/prospects/:id/events` for every row and filter client-side (N+1 round trips), or
2. Pull engagement events from the prospect-views table itself (no public endpoint for that).

The new `digest/opened` endpoint is purpose-built for this Slack flow: one round trip, filtered + aggregated server-side, sorted by recency, with the LinkedIn URL inlined in every row. The existing `prospects` listing is unchanged.
