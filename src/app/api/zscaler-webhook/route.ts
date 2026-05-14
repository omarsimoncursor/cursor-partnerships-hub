import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Zscaler ZPA / ZIA risk events and triggers a Cursor Background Agent
 * to scope down the offending application access rule in the right source of truth.
 *
 * Setup:
 * 1. Create a Zscaler webhook (ZPA Policy Engine notifications) pointing at
 *    https://cursor.omarsimon.com/api/zscaler-webhook
 * 2. Set the webhook signing secret (shared HMAC) in ZSCALER_WEBHOOK_SECRET.
 *    Zscaler signs the payload with `X-Zscaler-Signature: sha256=<hex>`.
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 * 4. The agent expects the customer's Terraform module to live in
 *    `infrastructure/zscaler/` (override via the iac_path payload field).
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
  iac_path?: string;
  iac_resource?: string;
  source_of_truth?: 'terraform' | 'zpa-api' | 'servicenow-change';
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
  const inScope = payload.scope?.in_scope_users ?? null;
  const intent = payload.scope?.intent_users ?? null;
  const riskScore = payload.scope?.risk_score ?? null;
  const iacPath = payload.iac_path ?? 'infrastructure/zscaler/';
  const iacResource = payload.iac_resource ?? null;
  const sourceOfTruth = payload.source_of_truth ?? 'terraform';
  const alertUrl =
    payload.alert_url ?? `https://admin.zscaler.net/zpa/policy/${policyId}/risk/${riskEventId}`;

  const agentPrompt = buildAgentPrompt({
    riskEventId,
    policyId,
    appSegment,
    iacPath,
    iacResource,
    sourceOfTruth,
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
  iacPath,
  iacResource,
  sourceOfTruth,
  inScope,
  intent,
  riskScore,
  alertUrl,
}: {
  riskEventId: string;
  policyId: string;
  appSegment: string;
  iacPath: string;
  iacResource: string | null;
  sourceOfTruth: 'terraform' | 'zpa-api' | 'servicenow-change';
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
  const resourceLine = iacResource
    ? `- Likely Terraform resource: ${iacResource}`
    : `- Terraform resource: not provided — locate via Step 1 (segment tag) and Step 4 (file scan)`;
  const routeLine =
    sourceOfTruth === 'terraform'
      ? `- Source of truth route: Terraform PR (${iacPath})`
      : sourceOfTruth === 'zpa-api'
        ? `- Source of truth route: direct ZPA Admin/API change request (no GitHub PR unless IaC owner is discovered)`
        : `- Source of truth route: ServiceNow change request for policy-owner approval`;

  return `You are the orchestration layer between Zscaler, Okta, GitHub, ServiceNow, and the customer's
system of record that manages ZPA policy. A Zscaler ZPA Zero Trust violation was reported.
Coordinate across Zscaler MCP, Okta MCP, GitHub MCP, ServiceNow MCP, and the shell to ship a tested
Terraform PR — with zero human intervention until the security review step.

CRITICAL: First identify the policy source of truth. If the segment is tagged iac:terraform,
the fix is HCL (.tf), not TypeScript. The application code under src/ is unrelated to this
incident. Do not edit application code. If the policy is not Terraform-managed, do not invent
a GitHub PR; draft a ZPA API/Admin change request and attach it to ServiceNow for approval.

## Incoming risk event
- Risk event: ${riskEventId}
- ZPA policy id: ${policyId}
- App segment: ${appSegment}
- Alert URL: ${alertUrl}
- IaC root: ${iacPath}
${resourceLine}
${routeLine}
${scopeLine}
${riskLine}

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the PR body.

### Step 1 — Zscaler MCP intake
- Fetch the ZPA risk event detail: severity, state, risk score, posture distribution, in-scope vs intent.
- Fetch the ZIA web log slice for the affected app segment (last 60 minutes by default).
- Identify the IaC owner via segment tags (e.g. \`iac:terraform\`, \`repo:<name>\`, \`module:<path>\`).
- If no IaC owner exists, route to a ServiceNow ZPA change request instead of a GitHub PR.
- Record: in-scope user count, intent user count, posture compliance %, regression deploy SHA, IaC path.

### Step 2 — Identity context (Okta MCP)
- Resolve the SCIM groups that should retain access (typically the intent set: e.g. security-admin, compliance-officer).
- Compute the smallest justifiable allow-list. Cite group IDs and member counts in the PR body.

### Step 3 — Regression hunt (GitHub MCP, only for Terraform-managed policy)
- \`git log\` the IaC path: \`git log --since=14.days -- ${iacPath}\`.
- Identify the most recent commit that widened scope (stripped conditions, added wildcard, switched ALLOW operator).
- Record SHA, author, date, message — cite in the PR body.

### Step 4 — Read the source of truth and form a hypothesis
- Locate the access rule resource. If \`iac_resource\` was provided, read that file directly. Otherwise grep the IaC path for \`zpa_policy_access_rule\` resources and match by app segment name.
- Read the resource. Enumerate which condition object_types are present and which are missing.
- Form a written hypothesis BEFORE patching:
  - Which object_types are missing? (typical answer: SCIM_GROUP, POSTURE, TRUSTED_NETWORK, CLIENT_TYPE)
  - Which data sources already exist in the module that you can reference? (e.g. \`data.zpa_idp_controller\`, \`data.zpa_scim_groups\`, \`data.zpa_posture_profile\`, \`data.zpa_trusted_network\`)
  - If a needed data source does not exist, define it in the same module.

### Step 5 — Patch the Terraform
- Add the missing condition blocks to the access rule resource.
- Use the existing data sources (do NOT hard-code IDs).
- Preserve the resource's name, description, action, and the existing \`APP\` condition. The plan must be in-place-only.
- Do NOT touch the application segment, server groups, or app connector groups.
- Do NOT edit application code under src/.
- Do NOT add narrative comments explaining the change.

### Step 6 — Static + plan + conformance verify (shell)
- \`terraform fmt -check -recursive ${iacPath}\` — must be clean.
- \`terraform validate\` against the IaC root — must succeed.
- \`terraform plan -out=tfplan\` — output MUST be \`Plan: 0 to add, N to change, 0 to destroy\` (in-place update only). If destroy or recreate appears, return to Step 5.
- \`tfsec\` or \`checkov\` against the IaC root — the broad-scope finding (e.g. \`AVD-ZPA-001\`) must be resolved; no new high or medium findings.
- Run the policy conformance probe (4 simulated requests against the rule via the customer's probe endpoint or local simulator):
  - sec-admin + managed-compliant + corp-egress + zpa-client → ALLOW
  - sec-admin + managed-noncompliant → DENY
  - employee + managed-compliant → DENY
  - anon + unmanaged + public + exporter → DENY
- If any check fails, return to Step 5.

### Step 7 — Open the PR via GitHub MCP (Terraform route) OR draft ServiceNow change (non-IaC route)
- Create a branch: \`sec/scope-down-<segment-slug>-zpa\`.
- Commit message:
  \`\`\`
  sec(zpa): scope down <segment> ALLOW rule (<before> → <after> in scope, resolves Sec-P1)

  Resolves ${alertUrl}
  \`\`\`
- Push the branch.
- Open a PR with this body structure (every section must be filled with evidence from the steps above):

  ## Summary
  One sentence describing which conditions were added and why.

  ## Before / after scope
  | Metric | Before | After | Δ |
  | --- | ---: | ---: | ---: |
  | Users in scope | <pre> | <post> | <delta>% |
  | Risk score | <before>/100 | <after>/100 | resolved |
  | Conformance probes | <n>/4 | 4/4 | restored |
  | Unmanaged-device paths | <n> | 0 | closed |

  ## Root cause
  - Which object_types were missing (cite file:line from Step 4)
  - Regression commit (cite SHA from Step 3)
  - ZPA risk event ${riskEventId} observation (Step 1)

  ## Fix
  - HCL diff bullet list (which conditions were added, against which data sources)

  ## terraform plan
  - Paste the (truncated, in-place-only) plan output

  ## Conformance probe (replayed)
  - 4-row table: request → expected → got → result

  ## Evidence
  - Zscaler ZPA event: ${alertUrl}
  - Risk event: ${riskEventId}
  - terraform validate: ✓
  - terraform plan: ~N / +0 / -0
  - tfsec/checkov: AVD-ZPA-001 resolved
  - Conformance probe: ✓ 4 / 4 passed

  ## Risk assessment
  - Blast radius (file count, line count)
  - Plan shape (in-place vs destroy/recreate)
  - Rollback plan (\`git revert HEAD && terraform apply\`)

### Step 8 — ServiceNow update
- Move the ServiceNow Security Incident to \`Awaiting Security Review\`.
- Link the PR URL.
- Post a comment that cites the before/after scope, the terraform plan summary, and the Zscaler risk event.
`;
}
