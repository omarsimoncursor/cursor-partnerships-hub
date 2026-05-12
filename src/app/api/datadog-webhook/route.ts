import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Datadog SLO/monitor webhooks and triggers a Cursor Background Agent
 * to triage and fix the performance regression automatically.
 *
 * Setup:
 * 1. Create a Datadog webhook integration pointing at
 *    https://cursorpartners.omarsimon.com/api/datadog-webhook
 * 2. Set the webhook signing secret (shared HMAC) in DATADOG_WEBHOOK_SECRET.
 *    Datadog signs the payload with `X-Datadog-Signature: sha256=<hex>`.
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifyDatadogSignature(
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

interface DatadogPayload {
  event_type?: string;
  alert_type?: 'error' | 'warning' | 'recovery' | 'info';
  alert_transition?: string;
  monitor_id?: string | number;
  monitor_name?: string;
  monitor_query?: string;
  alert_title?: string;
  alert_url?: string;
  snapshot_url?: string;
  trace_id?: string;
  service?: string;
  env?: string;
  endpoint?: string;
  slo?: {
    id?: string;
    name?: string;
    target?: number;
    current?: number;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.DATADOG_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-datadog-signature');

  if (!verifyDatadogSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: DatadogPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only trigger on active breaches — ignore recoveries, warnings without trigger, info.
  const alertType = payload.alert_type;
  const transition = payload.alert_transition;
  if (alertType === 'recovery') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'recovery' });
  }
  if (alertType === 'info') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'info' });
  }
  if (transition && !['Triggered', 'Re-Triggered', 'Alert', 'Warning'].includes(transition)) {
    return NextResponse.json({ ok: true, skipped: true, reason: `transition=${transition}` });
  }

  const monitorId = String(payload.monitor_id ?? 'unknown');
  const monitorName = payload.monitor_name || payload.alert_title || 'Unknown Datadog monitor';
  const alertUrl =
    payload.alert_url ||
    payload.snapshot_url ||
    `https://app.datadoghq.com/monitors/${monitorId}`;
  const traceId = payload.trace_id || 'unknown';
  const service = payload.service || 'unknown';
  const env = payload.env || 'unknown';
  const endpoint = payload.endpoint || 'unknown';
  const sloTarget = payload.slo?.target ?? null;
  const sloCurrent = payload.slo?.current ?? null;

  const agentPrompt = buildAgentPrompt({
    monitorId,
    monitorName,
    alertUrl,
    traceId,
    service,
    env,
    endpoint,
    sloTarget,
    sloCurrent,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[datadog-webhook] CURSOR_API_KEY not set — cannot trigger agent');
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
      console.error('[datadog-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[datadog-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      monitorId,
      alertUrl,
    });
  } catch (err) {
    console.error('[datadog-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  monitorId,
  monitorName,
  alertUrl,
  traceId,
  service,
  env,
  endpoint,
  sloTarget,
  sloCurrent,
}: {
  monitorId: string;
  monitorName: string;
  alertUrl: string;
  traceId: string;
  service: string;
  env: string;
  endpoint: string;
  sloTarget: number | null;
  sloCurrent: number | null;
}): string {
  const sloLine =
    sloTarget != null && sloCurrent != null
      ? `- SLO: target ${sloTarget}ms · current P99 ${sloCurrent}ms · ${(sloCurrent / sloTarget).toFixed(1)}× over budget`
      : `- SLO: target/current unavailable in payload — fetch via datadog-mcp in Step 1`;

  return `You are the orchestration layer between Datadog, GitHub, PagerDuty, Jira, and the codebase.
A Datadog SLO breach was reported. Coordinate across Datadog MCP, GitHub MCP, PagerDuty MCP, Jira MCP,
and the shell to ship a tested performance PR — with zero human intervention until the review step.

## Incoming alert
- Datadog monitor: ${monitorName} (ID ${monitorId})
- Alert URL: ${alertUrl}
- APM trace: ${traceId}
- Service: ${service} · env: ${env}
- Affected endpoint: ${endpoint}
${sloLine}

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the PR body.

### Step 1 — Datadog MCP intake
- Fetch monitor detail, current P99/P95 latency, error budget burn rate, and the triggering condition.
- Fetch the APM trace (trace_id ${traceId}) and enumerate every span with its service, name, and duration.
- Identify the critical path — the deepest serial chain contributing to wall time.
- Read the deployment marker: which deploy / commit precedes the regression in the sparkline.
- Record: slow-span stack, deployment SHA, service/version, host/container, affected endpoint.

### Step 2 — Regression hunt via GitHub MCP
- Call GitHub MCP to list the last 10 commits touching any file in the slow-span stack.
- Focus on the most recent commit that could plausibly change the shape of the hot path (new callers,
  new data, new iteration).
- Record SHA, author, date, and message — cite these in the PR body.

### Step 3 — Read the affected code (shell)
- Read every file in the slow-span stack and the type definitions they reference.
- Form a written hypothesis before patching:
  - What is the shape of the slow path? (serial vs parallel, blocking vs non-blocking, n+1 vs batched)
  - What is the minimal correct change?

### Step 4 — Patch
- Apply the minimal correct performance fix. Prefer in order:
  1. Parallelize independent awaits with \`Promise.all\`.
  2. Batch or memoize repeated calls.
  3. Add a targeted cache if safe.
- Preserve existing types and function contracts. Do NOT widen types unless the data model requires it.
- Do NOT add narrative comments explaining the change.

### Step 5 — Static verify (shell)
- \`npm run lint\` — fix any new errors your patch introduced.
- \`npx tsc --noEmit\` — must be clean.
- If either fails, return to Step 4.

### Step 6 — Live perf verify (shell)
- Start the dev server: \`npm run dev\`. Wait for "Ready".
- Measure wall time: \`curl -w "%{time_total}" -o /dev/null -s http://localhost:3000${endpoint}\`.
- Record before and after wall-time. The after-time MUST be under the SLO target.
- If it is not, return to Step 4 and iterate.
- Stop the dev server.

### Step 7 — Open the PR via GitHub MCP
- Create a branch: \`perf/<slug-from-endpoint>\`.
- Commit with message:
  \`\`\`
  perf: <one-line description> (Nx faster, resolves P1 SLO breach)

  Resolves ${alertUrl}
  \`\`\`
- Push the branch.
- Open a PR with this body structure (every section must be filled with evidence from the steps above):

  ## Summary
  One sentence describing what changed and why.

  ## Before / after latency
  A markdown table:
  | Metric | Before | After | Δ |
  | --- | ---: | ---: | ---: |
  | P99 latency | <pre>ms | <post>ms | <delta>% |
  | SLO headroom | <Nx over> | <Nx under> | resolved |
  | Serial spans | <n> | <m> | — |

  ## Root cause
  - Shape of the slow path (cite file:line from Step 3)
  - Regression commit (cite SHA from Step 2)
  - APM trace ${traceId} observation (Step 1)

  ## Fix
  - Bullet-point diff of what you changed and where

  ## Evidence
  - Datadog monitor: ${alertUrl}
  - APM trace: ${traceId}
  - Typecheck: ✓
  - Lint: ✓
  - Live reproduction: ✓ (<before>s → <after>s)

  ## Risk assessment
  - Blast radius (files, lines changed, type-surface impact)
  - Rollback plan

### Step 8 — Jira update (Jira MCP)
- Move the incident ticket to \`In Review\`.
- Link the PR URL.
- Post a comment that cites the before/after latency and links the Datadog trace.
`;
}
