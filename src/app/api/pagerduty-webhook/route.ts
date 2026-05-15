import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives PagerDuty incident webhooks (V3) and triggers a Cursor Background
 * Agent to ack, triage, revert (or fix-forward), and resolve the incident
 * before any human is paged.
 *
 * Setup:
 * 1. Create a PagerDuty webhook subscription (V3) on the relevant service,
 *    pointing at https://cursor.omarsimon.com/api/pagerduty-webhook
 * 2. Set the webhook secret (shared HMAC) in PAGERDUTY_WEBHOOK_SECRET.
 *    PagerDuty signs the payload with `X-PagerDuty-Signature: v1=<hex>,v1=<hex>`.
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifyPagerdutySignature(
  body: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const expected = hmac.digest('hex');

  // Header format: "v1=<hex>,v1=<hex>" (multiple sigs during rotation)
  const candidates = signatureHeader
    .split(',')
    .map(part => part.trim())
    .map(part => (part.startsWith('v1=') ? part.slice('v1='.length) : part));

  for (const candidate of candidates) {
    try {
      if (
        candidate.length === expected.length &&
        crypto.timingSafeEqual(
          Buffer.from(candidate, 'hex'),
          Buffer.from(expected, 'hex'),
        )
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

interface PagerdutyEvent {
  event?: {
    event_type?: string;
    occurred_at?: string;
    data?: {
      id?: string;
      type?: string;
      self?: string;
      html_url?: string;
      title?: string;
      service?: { id?: string; summary?: string; html_url?: string };
      priority?: { id?: string; summary?: string };
      urgency?: 'high' | 'low';
      status?: string;
      escalation_policy?: { id?: string; summary?: string };
      assignees?: Array<{ id?: string; summary?: string }>;
    };
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.PAGERDUTY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get('x-pagerduty-signature');

  if (!verifyPagerdutySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: PagerdutyEvent;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = payload.event;
  const eventType = event?.event_type ?? '';
  // Only act on incident.triggered. Skip ack/resolve/etc — those are outcomes,
  // not triggers, and acting on them would loop.
  if (eventType !== 'incident.triggered') {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `event=${eventType}`,
    });
  }

  // Skip low-urgency incidents (page-suppression policy: only auto-handle high).
  if (event?.data?.urgency && event.data.urgency !== 'high') {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `urgency=${event.data.urgency}`,
    });
  }

  const incidentId = event?.data?.id ?? 'unknown';
  const incidentTitle = event?.data?.title ?? 'Unknown PagerDuty incident';
  const incidentUrl = event?.data?.html_url ?? `https://acme.pagerduty.com/incidents/${incidentId}`;
  const serviceName = event?.data?.service?.summary ?? 'unknown';
  const escalationPolicy = event?.data?.escalation_policy?.summary ?? 'unknown';
  const priority = event?.data?.priority?.summary ?? 'unknown';
  const occurredAt = event?.occurred_at ?? new Date().toISOString();

  const agentPrompt = buildAgentPrompt({
    incidentId,
    incidentTitle,
    incidentUrl,
    serviceName,
    escalationPolicy,
    priority,
    occurredAt,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[pagerduty-webhook] CURSOR_API_KEY not set — cannot trigger agent');
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
      console.error('[pagerduty-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[pagerduty-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      incidentId,
      incidentUrl,
    });
  } catch (err) {
    console.error('[pagerduty-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  incidentId,
  incidentTitle,
  incidentUrl,
  serviceName,
  escalationPolicy,
  priority,
  occurredAt,
}: {
  incidentId: string;
  incidentTitle: string;
  incidentUrl: string;
  serviceName: string;
  escalationPolicy: string;
  priority: string;
  occurredAt: string;
}): string {
  return `You are the on-call auto-pilot orchestrating PagerDuty, Datadog, GitHub,
Statuspage, Slack, and the codebase. A P1 incident was just triggered. Your job
is to ack, triage, revert (or fix-forward), validate, and resolve the incident
WITHOUT paging a human — unless your confidence drops below the policy floor.

## Incoming page
- PagerDuty incident: ${incidentTitle} (id ${incidentId})
- Incident URL: ${incidentUrl}
- Service: ${serviceName}
- Escalation policy: ${escalationPolicy}
- Priority: ${priority}
- Occurred at: ${occurredAt}

## Required sequence

You MUST execute every step in order. Cite evidence from each step in the
revert PR body and in the PD incident NOTEs.

### Step 1 — PagerDuty intake + ACK
- Fetch the incident, alerts, escalation policy, and recent change events for
  the service via the PagerDuty MCP.
- ACK the incident immediately with a NOTE: "Triage initiated by cursor-agent.
  Suppressing escalation while triage is in progress."
- Re-confirm: the on-call's phone has NOT been rung yet.

### Step 2 — Correlate the alert source
- The alert in this incident names a monitor (Datadog or otherwise). Pull:
  - APM trace(s) for the affected endpoint
  - Deploy markers within the 10 minutes preceding the trigger
  - Error rate / latency sparkline for the affected service

### Step 3 — Regression hunt (GitHub MCP)
- \`git log\` since the most recent deploy marker named in Step 2.
- Identify the offending commit. Capture SHA, author, date, message, blast.

### Step 4 — Decide revert vs fix-forward
- Output a STRUCTURED decision:
  \`\`\`
  decision: revert | fix-forward
  confidence: 0.0–1.0
  rationale: <one paragraph>
  blocked-by-schema-migration: yes|no
  blast-radius: <files, lines>
  \`\`\`
- Default to **revert** unless the offending change cannot be cleanly reverted
  (e.g., contains a forward-only schema migration). Mirror this decision to the
  PD incident as a NOTE.
- If confidence < 0.7, STOP and escalate to a human via the PD escalation
  policy. Do NOT proceed silently.

### Step 5 — Execute
- Open a revert PR via the GitHub MCP. Branch \`revert/<slug>\`.
- The PR body MUST include:
  - The PD incident ID and URL
  - The Datadog monitor / APM trace ID
  - The Opus triage decision block from Step 4
  - A before/after recovery telemetry table
  - A risk assessment with rollback steps
- Push branch → CI → canary at 5% → SLO gate (must hold for ≥60s sustained) →
  promote to 100%. If the canary fails the SLO gate, revert the canary and
  re-evaluate fix-forward.

### Step 6 — Communicate
- Statuspage: post three updates (Investigating → Identified → Resolved). Keep
  copy in the brand-voice template. Do NOT publish raw stack traces or
  customer data.
- Slack: post a single \`#ops\` summary with links to the PD incident, PR,
  Statuspage update, and postmortem doc.
- PD: mirror every material decision to the incident as a NOTE so the on-call
  can audit the run later.

### Step 7 — Resolve
- Mark the PD incident RESOLVED only after the affected SLO has stayed inside
  budget for at least 2 minutes. Otherwise iterate on Step 4–5.

### Step 8 — Postmortem
- Auto-draft a postmortem to \`docs/postmortems/<date>-<incident-id>.md\` and
  link it from the PD incident. The doc must include:
  - Customer impact estimate (numbers, not adjectives)
  - Root cause (one paragraph)
  - "What went well / what didn't"
  - Action items with explicit owners (some \`cursor-agent\`, most human SREs)
  - Recovery telemetry section with the before/after error-rate sparkline
- Mark the postmortem status \`Draft\` until a human signs off.

## Hard guardrails (never violate)

- NEVER resolve the incident without verifying SLO recovery (≥2 min sustained).
- NEVER roll a fix-forward into production without canary success (60s SLO).
- ALWAYS page a human if confidence < 0.7.
- ALWAYS honor change-freeze windows. If active, escalate immediately.
- NEVER touch infra, IAM, or migrations from this auto-pilot. Open a follow-up
  task for a human owner instead.
- NEVER publish customer PII to Statuspage or Slack.
`;
}
