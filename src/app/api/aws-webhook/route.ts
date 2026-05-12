import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives AWS EventBridge (or API Destination) webhooks and triggers a Cursor
 * Background Agent to modernize one bounded context end-to-end.
 *
 * Setup:
 * 1. Create an EventBridge rule (or API Destination) targeted at
 *    https://cursorpartners.omarsimon.com/api/aws-webhook
 *    Events fire from CloudWatch alarms, CodeBuild, CloudFormation, or from
 *    a manual PutEvents call with detail-type "cursor.modernization.request".
 * 2. The API Destination signs payloads with AWS_WEBHOOK_SECRET; we verify
 *    X-Amz-Event-Signature: sha256=<hex>. For API Destinations that do not
 *    HMAC-sign, fall back to a shared passcode via X-Amz-Passcode.
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifyAwsSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const hex = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hex, 'hex'),
      Buffer.from(digest, 'hex'),
    );
  } catch {
    return false;
  }
}

function verifyPasscode(headerValue: string | null, secret: string): boolean {
  if (!headerValue) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerValue, 'utf8'),
      Buffer.from(secret, 'utf8'),
    );
  } catch {
    return false;
  }
}

interface EventBridgePayload {
  version?: string;
  id?: string;
  'detail-type'?: string;
  source?: string;
  account?: string;
  region?: string;
  resources?: string[];
  detail?: {
    boundedContext?: string;
    legacySourcePath?: string;
    repository?: string;
    baseBranch?: string;
    targetRuntime?: string;
    mapEngagementId?: string;
    portfolioProgress?: { extracted: number; total: number };
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.AWS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get('x-amz-event-signature');
  const passcode = request.headers.get('x-amz-passcode');

  const signatureOk =
    verifyAwsSignature(body, signature, secret) || verifyPasscode(passcode, secret);
  if (!signatureOk) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: EventBridgePayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const source = payload.source ?? 'unknown';
  const detailType = payload['detail-type'] ?? 'unknown';
  if (source === 'aws.events' && detailType === 'Scheduled Event') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'scheduled-probe' });
  }

  const detail = payload.detail ?? {};
  const boundedContext = detail.boundedContext ?? 'OrdersService';
  const legacySourcePath = detail.legacySourcePath ?? 'src/lib/demo/legacy-monolith';
  const repository = detail.repository ?? 'cursor/partnerships-hub';
  const baseBranch = detail.baseBranch ?? 'main';
  const targetRuntime = detail.targetRuntime ?? 'Lambda + Aurora Serverless v2';
  const mapEngagementId = detail.mapEngagementId ?? 'MAP-2026-ACME-0173';
  const progress = detail.portfolioProgress ?? { extracted: 0, total: 38 };
  const region = payload.region ?? 'us-east-1';
  const account = payload.account ?? '123456789012';

  const agentPrompt = buildAgentPrompt({
    boundedContext,
    legacySourcePath,
    targetRuntime,
    mapEngagementId,
    region,
    account,
    progress,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[aws-webhook] CURSOR_API_KEY not set — cannot trigger agent');
    return NextResponse.json(
      { error: 'Cursor API key not configured' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch('https://api.cursor.com/v1/agents/background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cursorApiKey}`,
      },
      body: JSON.stringify({
        repository,
        branch: baseBranch,
        prompt: agentPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[aws-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json(
        { error: 'Failed to trigger agent' },
        { status: 502 },
      );
    }

    const result = await response.json();
    console.log('[aws-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      boundedContext,
      region,
      portfolioProgress: progress,
    });
  } catch (err) {
    console.error('[aws-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  boundedContext,
  legacySourcePath,
  targetRuntime,
  mapEngagementId,
  region,
  account,
  progress,
}: {
  boundedContext: string;
  legacySourcePath: string;
  targetRuntime: string;
  mapEngagementId: string;
  region: string;
  account: string;
  progress: { extracted: number; total: number };
}): string {
  return `You are the orchestration layer between AWS Knowledge MCP, Bedrock, GitHub, Jira, and the codebase.
An AWS EventBridge rule fired requesting modernization of one bounded context from the customer's
Java EE + Oracle 12c monolith. Coordinate across aws-knowledge-mcp, bedrock reasoning, github-mcp,
jira-mcp, and the shell to ship a tested PR with IAM least-privilege, Well-Architected citations,
and portfolio progress — with zero human intervention until the review step.

## Incoming request
- Bounded context to extract: ${boundedContext}
- Legacy source path: ${legacySourcePath}
- Target runtime: ${targetRuntime}
- MAP engagement: ${mapEngagementId}
- Region: ${region}
- Account: ${account}
- Portfolio progress: ${progress.extracted} / ${progress.total} bounded contexts already extracted
- Local smoke test: http://localhost:3103 (this demo's port)

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the PR body.

### Step 1 — AWS Knowledge MCP intake
- Call \`aws___recommend\` with the query "Java EE monolith → Lambda + Aurora" and record the recommended SOP IDs.
- Call \`aws___search_documentation\` for each of the six Well-Architected pillars (OPS, SEC, REL, PERF, COST, SUS) and record the pillar-question IDs most relevant to this context.
- Call \`aws___retrieve_agent_sop\` for \`sop/java-ee-to-lambda\` and \`sop/oracle-to-aurora-pg\`.

### Step 2 — Legacy source read (shell)
- Read the Java EE class, persistence.xml, and Oracle DDL/PL/SQL end-to-end from ${legacySourcePath}.
- Enumerate boundary violations (shared Oracle connection pool, JNDI leakage, checked exceptions,
  vendor-specific JPA properties, REF_CURSOR out-parameters, SEQUENCE.NEXTVAL, SYSDATE, synchronous
  cross-service stored procs).

### Step 3 — Bedrock reasoning
- Use long-context Bedrock reasoning over the combined legacy source plus the AWS SOPs from Step 1.
- Produce a decomposition plan mapping each EJB method to a Lambda handler and each stored proc to
  an Aurora PG stored function.

### Step 4 — Provenance hunt (GitHub MCP)
- List the last commits touching the legacy files.
- Note SHAs and authors in the PR body.

### Step 5 — Write modernization triage report (codegen)
- Emit \`docs/modernization/<date>-${boundedContext.toLowerCase()}.md\` with MAP phase, boundary
  violations collapsed, Well-Architected citations (pillar question IDs), and verification approach.

### Step 6 — Patch (shell + edit)
- Emit the Lambda handler in \`services/${boundedContext.toLowerCase()}/src/handlers/\` (TypeScript, AWS
  SDK v3, Powertools for logging/tracing/metrics).
- Emit the CDK stack in \`services/${boundedContext.toLowerCase()}/infra/\` with Function,
  DatabaseCluster (Aurora Serverless v2), Secret (Secrets Manager, rotation 30d), VpcEndpoint for
  Secrets Manager and RDS Data API, and RestApi with LambdaIntegration.
- Emit the Aurora PG migration in \`services/${boundedContext.toLowerCase()}/db/migrations/\` translating
  each Oracle PL/SQL proc to PL/pgSQL.
- Emit at least one integration test under \`services/${boundedContext.toLowerCase()}/tests/integration/\`.
- Minimal diff. Preserve existing types and contracts. No narrative comments.

### Step 7 — Static verify (shell)
- \`npm run lint\` — fix any new errors your patch introduced.
- \`npx tsc --noEmit\` — must be clean.
- \`cdk synth\` and \`cdk diff\` — must be clean; iterate on Step 6 if either fails.

### Step 8 — Security + cost review (codex)
- IAM policy audit: no \`*\` resources, no \`iam:*\` actions, all resources scoped to specific ARNs.
  Emit the full policy JSON in the PR body.
- Confirm Lambda is in private subnets and Aurora is not publicly accessible.
- Confirm VPC endpoints exist for Secrets Manager + RDS Data API (so the subnet does not need a
  NAT gateway).
- Cost forecast using public unit prices: Lambda $0.20 per 1M requests + $0.0000166667 per GB-s,
  Aurora Serverless v2 $0.12 per ACU-hour, CloudWatch logs $0.50 per GB ingestion, Secrets Manager
  $0.40 per secret-month. Round generously and flag as "est."

### Step 9 — Live verify (shell)
- \`sam local invoke\` against a seed event. Record response time and status.
- \`cdk deploy --profile dev --require-approval=never\`. Record stack status, elapsed time, and
  stack outputs.
- CloudWatch smoke: p99 latency, error rate, cold-start duration. If any metric regresses, iterate
  on Step 6.
- Local smoke must happen on http://localhost:3103.

### Step 10 — Open the PR (GitHub MCP)
- Create a branch: \`feat/modernize-${boundedContext.toLowerCase()}\`.
- Commit with message:
  \`\`\`
  feat(modernize): extract ${boundedContext} → ${targetRuntime} (${progress.extracted + 1}/${progress.total})

  MAP engagement ${mapEngagementId} · region ${region}
  \`\`\`
- Push and open a PR. The body must include:
  - Summary (one sentence)
  - Before / after run cost table (on-prem slice → AWS managed services)
  - Boundary violations collapsed (table)
  - Well-Architected citations (pillar question IDs)
  - Diff preview of the Java EE @Stateless method next to the TypeScript Lambda handler
  - CDK stack excerpt
  - Evidence: AWS Knowledge MCP SOP IDs, CloudFormation stack, CloudWatch dashboard metrics,
    IAM Access Analyzer result, \`sam local invoke\` result, typecheck/lint/cdk synth/cdk diff
  - Portfolio progress line: \`${progress.extracted + 1} / ${progress.total} bounded contexts extracted\`
  - Risk assessment (blast radius, dual-write window, cutover gate, rollback)

### Step 11 — Jira update (Jira MCP)
- Move the modernization-task subtask (e.g. \`CUR-5302\`) to \`In Review\`.
- Link the PR URL and the CloudFormation stack URL.
- Post a comment citing the before/after run cost, the Well-Architected pillar question IDs, and
  the portfolio progress.
`;
}
