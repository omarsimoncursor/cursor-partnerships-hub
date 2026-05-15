import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Cloudflare security webhooks (Bot Management score collapse, WAF
 * spike, anomaly detection) and triggers a Cursor Background Agent to ship a
 * 3-layer mitigation (WAF custom rule + Worker rate-limit + app-side detector PR).
 *
 * Setup:
 * 1. Create a Cloudflare Notifications webhook destination pointing at
 *    https://cursor.omarsimon.com/api/cloudflare-webhook
 * 2. Set the webhook signing secret in CLOUDFLARE_WEBHOOK_SECRET. Cloudflare
 *    signs the payload with `cf-webhook-auth: <hex>` (HMAC-SHA256 over the
 *    request body).
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 *
 * Safety:
 * - Only triggers on credential-stuffing / bot-spike events. Recovery /
 *   informational notifications are skipped.
 * - The Cursor agent prompt enforces: WAF rules deploy in Log mode first,
 *   never block whole countries/ASNs, all actions audited to SIEM, app-side
 *   security PRs always require human review.
 */

function verifyCloudflareSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const hex = signature.startsWith('sha256=') ? signature.slice('sha256='.length) : signature;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hex, 'hex'), Buffer.from(digest, 'hex'));
  } catch {
    return false;
  }
}

interface CloudflarePayload {
  event_id?: string;
  event_type?: string;
  alert_type?: 'attack' | 'recovery' | 'info' | 'warning';
  zone?: string;
  zone_id?: string;
  endpoint?: string;
  monitor?: {
    id?: string;
    name?: string;
  };
  signal?: {
    bot_score_below_5_pct?: number;
    requests_per_second?: number;
    distinct_source_ips?: number;
    top_asn?: number | string;
    top_user_agent?: string;
    auth_attempts_in_window?: number;
    success_rate_pct?: number;
  };
  attack_url?: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLOUDFLARE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature =
    request.headers.get('cf-webhook-auth') || request.headers.get('x-cloudflare-signature');

  if (!verifyCloudflareSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: CloudflarePayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.alert_type === 'recovery') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'recovery' });
  }
  if (payload.alert_type === 'info') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'info' });
  }

  const eventId = payload.event_id || `cf-${Date.now()}`;
  const zone = payload.zone || 'unknown-zone';
  const endpoint = payload.endpoint || '/api/auth/login';
  const monitorName = payload.monitor?.name || payload.event_type || 'Cloudflare anomaly';
  const attackUrl =
    payload.attack_url || `https://dash.cloudflare.com/security/events/${eventId}`;
  const topAsn = payload.signal?.top_asn ?? 'unknown';
  const topUa = payload.signal?.top_user_agent ?? 'unknown';
  const botPct = payload.signal?.bot_score_below_5_pct ?? null;
  const reqPerSec = payload.signal?.requests_per_second ?? null;
  const distinctIps = payload.signal?.distinct_source_ips ?? null;
  const authAttempts = payload.signal?.auth_attempts_in_window ?? null;
  const successPct = payload.signal?.success_rate_pct ?? null;

  const agentPrompt = buildAgentPrompt({
    eventId,
    zone,
    endpoint,
    monitorName,
    attackUrl,
    topAsn,
    topUa,
    botPct,
    reqPerSec,
    distinctIps,
    authAttempts,
    successPct,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[cloudflare-webhook] CURSOR_API_KEY not set — cannot trigger agent');
    return NextResponse.json({ error: 'Cursor API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.cursor.com/v1/agents/background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cursorApiKey}`,
      },
      body: JSON.stringify({
        repository: 'cursor/partnerships-hub',
        branch: 'main',
        prompt: agentPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[cloudflare-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[cloudflare-webhook] Cursor agent triggered:', result);
    return NextResponse.json({ ok: true, agentTriggered: true, eventId, attackUrl });
  } catch (err) {
    console.error('[cloudflare-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  eventId,
  zone,
  endpoint,
  monitorName,
  attackUrl,
  topAsn,
  topUa,
  botPct,
  reqPerSec,
  distinctIps,
  authAttempts,
  successPct,
}: {
  eventId: string;
  zone: string;
  endpoint: string;
  monitorName: string;
  attackUrl: string;
  topAsn: number | string;
  topUa: string;
  botPct: number | null;
  reqPerSec: number | null;
  distinctIps: number | null;
  authAttempts: number | null;
  successPct: number | null;
}): string {
  const signalLine = [
    botPct != null ? `bot-score < 5 share ${botPct}%` : null,
    reqPerSec != null ? `req/s ${reqPerSec.toLocaleString()}` : null,
    distinctIps != null ? `${distinctIps.toLocaleString()} distinct source IPs` : null,
    authAttempts != null ? `${authAttempts.toLocaleString()} auth attempts` : null,
    successPct != null ? `${successPct}% success rate` : null,
  ]
    .filter(Boolean)
    .join(' · ') || 'signal details unavailable in payload — fetch via cloudflare-mcp';

  return `You are the orchestration layer between Cloudflare, GitHub, threat-intel, Wrangler,
Statuspage, Slack, and the codebase. A Cloudflare attack signal was received.
Coordinate across cloudflare-mcp, threat-intel-mcp, github-mcp, wrangler, statuspage-mcp,
slack-mcp, and siem-mcp to ship a 3-layer mitigation — with zero human intervention until the
app-side review step.

## Incoming event
- Cloudflare event: ${eventId}
- Zone: ${zone}
- Affected endpoint: ${endpoint}
- Monitor: ${monitorName}
- Source ASN: ${topAsn}
- Top user-agent: ${topUa}
- Signal: ${signalLine}
- Attack URL: ${attackUrl}

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the
PR body and the postmortem.

### Step 1 — Cloudflare MCP intake
- Fetch Analytics for the event window (req/s, status codes, cache hit, threat-blocked counters).
- Fetch Bot Management scores and the score histogram for the affected endpoint.
- Fetch Logpush for failed-auth events (top source IPs, ASN distribution, UA strings).
- Record: top source IPs, distinct-IP count, top ASN, attack vector, target endpoint.

### Step 2 — Threat correlation (threat-intel-mcp)
- Cross-reference the source ASN and IPs against known threat-intel feeds
  (Spamhaus, AbuseIPDB, CF Radar). Output a written threat assessment with confidence score.

### Step 3 — Plan (Opus)
Write a 3-layer mitigation plan with cited scope and rollback criteria for each layer:
- **Layer 1 (edge-immediate)**: WAF custom rule, narrowly scoped to the offending ASN +
  user-agent + endpoint. Deploy in **Log mode**.
- **Layer 2 (edge-rate-limit)**: Tighten the Worker-side rate-limit on the affected endpoint
  for low-bot-score traffic.
- **Layer 3 (app-long-term)**: App-side detector improvement (CAPTCHA on suspicious-IP
  signals, lockout-threshold tightening). **Open as DRAFT only** — security-team review required.

### Step 4 — Layer 1: WAF rule (cloudflare-mcp)
- Generate the WAF rule expression in Cloudflare Rules language. Scope MUST be:
  ASN + UA family + endpoint. Never country-wide. Never ASN-wide without UA scoping.
- Deploy the rule with action=log via PUT /zones/<zone>/firewall/rules.
- Poll Analytics for 60 seconds to measure log-mode false-positive rate.
- If false-positive rate is **0**, promote the rule to action=block via PATCH.
- If non-zero, ROLLBACK by deleting the rule and escalate to a human. Do NOT iterate
  on the rule scope without human input.

### Step 5 — Layer 2: Worker rate-limit (composer + wrangler)
- Patch the affected Worker (e.g. \`workers/auth-rate-limit.ts\`) to tighten the rate-limit
  for IPs with bot-score < 5. Default to 5 req/min/IP.
- \`wrangler dev\` smoke test locally.
- \`wrangler deploy --env preview\` to a canary route (1% traffic) for 30s. If error budget
  unaffected, \`wrangler deploy --env production\`.
- If the canary route shows any new 5xx, ROLLBACK with \`wrangler rollback\`.

### Step 6 — Layer 3: App-side detector PR (composer)
- Open a PR against the application repository for the app-side detector improvements.
- **Mark this PR as DRAFT.** Do NOT auto-merge. Add the security team as required reviewers.
- The PR body must include the linked Cloudflare event ID, before/after edge metrics,
  and a clear "awaiting human review" callout.

### Step 7 — Communicate
- Statuspage public update: status="Mitigated · Monitoring", body cites the 3 layers.
- Slack #sec-ops: single message summarising the 3 layers + linked PRs + linked Cloudflare event.
- SIEM: flush an audit-trail entry for every action (Cloudflare API calls, Wrangler deploys,
  PR opens) via Cloudflare Logpush → S3 → SIEM.

### Step 8 — Postmortem
- Write \`docs/postmortems/<date>-cf-credential-stuffing.md\` with:
  - Attack summary (timing, vector, blast radius, accounts impacted).
  - Defense narrative (3 layers, timing, residual exposure).
  - "What's automatic vs what needs human follow-up" — explicitly flag the app-side PR.
  - Action items with owners.
  - Detection-to-mitigation telemetry (the live req/s pre/post chart).

## Hard constraints (enforce)

1. WAF rules ALWAYS deploy in Log mode first.
2. NEVER block entire countries or entire ASNs without human approval.
3. App-side authentication code is ALWAYS draft-PR for human review — never auto-merge.
4. Workers ALWAYS deploy via canary first. If canary fails, rollback before promoting.
5. Every action MUST be flushed to SIEM via Cloudflare Logpush.
6. If any signal contradicts the threat-intel correlation in Step 2 (false-positive risk),
   stop and escalate to a human. Do NOT proceed with a rule that risks legitimate-user impact.
`;
}
