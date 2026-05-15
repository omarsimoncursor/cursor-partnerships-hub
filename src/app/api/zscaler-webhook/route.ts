import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Zscaler ZPA / ZIA risk events and triggers a Cursor Background Agent
 * to scope down the offending application policy automatically.
 *
 * Setup:
 * 1. Create a Zscaler webhook (ZPA Policy Engine notifications) pointing at
 *    https://cursor.omarsimon.com/api/zscaler-webhook
 * 2. Set the webhook signing secret (shared HMAC) in ZSCALER_WEBHOOK_SECRET.
 *    Zscaler signs the payload with `X-Zscaler-Signature: sha256=<hex>`.
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifyZscalerSignature(
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

interface ZscalerPayload {
  event_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  state?: 'open' | 'acknowledged' | 'resolved';
  risk_event_id?: string;
  policy_id?: string;
  application_segment?: string;
  endpoint?: string;
  scope?: {
    in_scope_users?: number;
    intent_users?: number;
    risk_score?: number;
  };
  posture?: {
    unmanaged_pct?: number;
    managed_noncompliant_pct?: number;
    managed_compliant_pct?: number;
  };
  actor?: {
    idp?: string;
    location?: string;
  };
  alert_url?: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.ZSCALER_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-zscaler-signature');

  if (!verifyZscalerSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: ZscalerPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only trigger on active high/critical violations.
  if (payload.state === 'resolved') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'resolved' });
  }
  if (payload.severity && !['high', 'critical'].includes(payload.severity)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `severity=${payload.severity}`,
    });
  }

  const riskEventId = payload.risk_event_id ?? 'unknown';
  const policyId = payload.policy_id ?? 'unknown';
  const appSegment = payload.application_segment ?? 'unknown';
  const endpoint = payload.endpoint ?? 'unknown';
  const inScope = payload.scope?.in_scope_users ?? null;
  const intent = payload.scope?.intent_users ?? null;
  const riskScore = payload.scope?.risk_score ?? null;
  const alertUrl =
    payload.alert_url ?? `https://admin.zscaler.net/zpa/policy/${policyId}/risk/${riskEventId}`;

  const agentPrompt = buildAgentPrompt({
    riskEventId,
    policyId,
    appSegment,
    endpoint,
    inScope,
    intent,
    riskScore,
    alertUrl,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[zscaler-webhook] CURSOR_API_KEY not set — cannot trigger agent');
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
      console.error('[zscaler-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[zscaler-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      riskEventId,
      alertUrl,
    });
  } catch (err) {
    console.error('[zscaler-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  riskEventId,
  policyId,
  appSegment,
  endpoint,
  inScope,
  intent,
  riskScore,
  alertUrl,
}: {
  riskEventId: string;
  policyId: string;
  appSegment: string;
  endpoint: string;
  inScope: number | null;
  intent: number | null;
  riskScore: number | null;
  alertUrl: string;
}): string {
  const scopeLine =
    inScope != null && intent != null
      ? `- Scope: ${inScope.toLocaleString()} users in scope vs intent ${intent} (${(inScope / Math.max(intent, 1)).toFixed(1)}x over)`
      : `- Scope: in-scope/intent unavailable in payload — fetch via zscaler-mcp in Step 1`;
  const riskLine =
    riskScore != null
      ? `- Risk score: ${riskScore} / 100`
      : `- Risk score: unavailable in payload — fetch via zscaler-mcp in Step 1`;

  return `You are the orchestration layer between Zscaler, Okta, GitHub, Jira, and the codebase.
A Zscaler ZPA Zero Trust violation was reported. Coordinate across Zscaler MCP, Okta MCP, GitHub MCP,
Jira MCP, and the shell to ship a tested security PR — with zero human intervention until the review step.

## Incoming risk event
- Risk event: ${riskEventId}
- Policy: ${policyId}
- App segment: ${appSegment}
- Affected endpoint: ${endpoint}
- Alert URL: ${alertUrl}
${scopeLine}
${riskLine}

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the PR body.

### Step 1 — Zscaler MCP intake
- Fetch the ZPA risk event detail: severity, state, risk score, posture distribution, in-scope vs intent.
- Fetch the ZIA web log slice for the affected app segment (last 60 minutes by default).
- Identify the affected app, endpoint, deployment marker, and which policy ID governs it.
- Record: in-scope user count, intent user count, posture compliance %, regression deploy SHA.

### Step 2 — Identity context (Okta MCP, optional but preferred)
- Reconcile the policy's role list against actual Okta group membership.
- Compute the smallest role set that satisfies the least-privilege intent.
- Record: which groups should retain access; which should not.

### Step 3 — Regression hunt (GitHub MCP)
- List the last 10 commits touching the policy file or any caller in the slow path.
- Identify the most recent commit that widened scope.
- Record SHA, author, date, message — cite in the PR body.

### Step 4 — Read affected code (shell)
- Read the policy file, the evaluator, and any callers / type definitions.
- Form a written hypothesis before patching:
  - What fields are over-permissive? (wildcard roles, posture skip, wildcard locations/IdPs)
  - What is the minimal correct change?

### Step 5 — Patch (shell + edit)
- Apply the minimal correct security fix. Prefer in order:
  1. Replace wildcard roles with an explicit allow-list derived from Step 2.
  2. Set \`postureRequired: true\` and any other gate that was disabled.
  3. Restrict locations and IdPs to known-safe values.
- Preserve the evaluator and existing types. Do NOT widen contracts.
- Do NOT add narrative comments explaining the change.

### Step 6 — Static + policy-conformance verify (shell)
- \`npm run lint\` — fix any new errors your patch introduced.
- \`npx tsc --noEmit\` — must be clean.
- Run a small policy conformance probe (4 simulated requests):
  - admin-role + managed-compliant + corporate-location + primary-IdP → allow
  - admin-role + managed-noncompliant → deny
  - employee-role + managed-compliant → deny
  - anonymous + unmanaged → deny
- If any check fails, return to Step 5.

### Step 7 — Open the PR via GitHub MCP
- Create a branch: \`sec/<slug-from-app-segment>\`.
- Commit with message:
  \`\`\`
  sec: <one-line description> (<before> → <after> users in scope, resolves Sec-P1)

  Resolves ${alertUrl}
  \`\`\`
- Push the branch.
- Open a PR with this body structure (every section must be filled with evidence from the steps above):

  ## Summary
  One sentence describing what changed and why.

  ## Before / after scope
  A markdown table:
  | Metric | Before | After | Δ |
  | --- | ---: | ---: | ---: |
  | Users in scope | <pre> | <post> | <delta>% |
  | Risk score | <before>/100 | <after>/100 | resolved |
  | Posture compliance | <before>% | 100% | restored |
  | Unmanaged paths | <n> | 0 | closed |

  ## Root cause
  - Offending policy fields (cite file:line from Step 4)
  - Regression commit (cite SHA from Step 3)
  - ZPA risk event ${riskEventId} observation (Step 1)

  ## Fix
  - Bullet-point diff of what you changed and where

  ## Evidence
  - Zscaler ZPA event: ${alertUrl}
  - Risk event: ${riskEventId}
  - Typecheck: ✓
  - Lint: ✓
  - Policy conformance probe: ✓ (4 simulated requests, deny-by-default restored)

  ## Risk assessment
  - Blast radius (files, lines changed, type-surface impact)
  - Rollback plan (no SCIM, no IdP, no infra changes)

### Step 8 — Jira update (Jira MCP)
- Move the security incident ticket to \`In Review\`.
- Link the PR URL.
- Post a comment that cites the before/after scope and links the Zscaler risk event.
`;
}
