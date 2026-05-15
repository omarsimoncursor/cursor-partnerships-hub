import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Snyk webhooks (project_snapshot / new_issue / issue_severity_change)
 * and triggers a Cursor Background Agent to triage and patch the vulnerability
 * automatically.
 *
 * Setup:
 * 1. Create a Snyk webhook integration pointing at
 *    https://cursor.omarsimon.com/api/snyk-webhook
 * 2. Set the webhook signing secret (shared HMAC) in SNYK_WEBHOOK_SECRET.
 *    Snyk signs the payload with `X-Hub-Signature: sha256=<hex>` (compatible
 *    with the GitHub-style HMAC scheme).
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifySnykSignature(
  body: string,
  signature: string | null,
  secret: string,
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

interface SnykIssue {
  id?: string;
  issueId?: string;
  title?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  cvssScore?: number;
  cwe?: string[];
  url?: string;
  filePath?: string;
  introducedThrough?: string;
  fixedIn?: string;
  exploitMaturity?: string;
}

interface SnykPayload {
  event?: string;
  org?: { id?: string; name?: string };
  project?: {
    id?: string;
    name?: string;
    branch?: string;
    origin?: string;
  };
  newIssues?: SnykIssue[];
  removedIssues?: SnykIssue[];
  issue?: SnykIssue;
}

export async function POST(request: NextRequest) {
  const secret = process.env.SNYK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature =
    request.headers.get('x-hub-signature') ||
    request.headers.get('x-snyk-signature') ||
    request.headers.get('x-snyk-webhook-signature');

  if (!verifySnykSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: SnykPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = payload.event ?? 'unknown';
  if (event === 'ping') {
    return NextResponse.json({ ok: true, pong: true });
  }

  // Only trigger on net-new criticals/highs to avoid runaway agent invocations.
  const triggerIssue = pickTriggerIssue(payload);
  if (!triggerIssue) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no triggerable issue' });
  }

  const issueId = triggerIssue.issueId || triggerIssue.id || 'unknown';
  const issueTitle = triggerIssue.title || 'Unknown Snyk issue';
  const severity = triggerIssue.severity || 'high';
  const cvss = triggerIssue.cvssScore ?? null;
  const cwe = triggerIssue.cwe?.join(', ') ?? 'unknown';
  const filePath = triggerIssue.filePath ?? 'unknown';
  const fixedIn = triggerIssue.fixedIn ?? 'unknown';
  const introducedThrough = triggerIssue.introducedThrough ?? 'unknown';
  const projectName = payload.project?.name ?? 'unknown';
  const projectBranch = payload.project?.branch ?? 'main';
  const orgName = payload.org?.name ?? 'unknown';
  const issueUrl =
    triggerIssue.url ||
    `https://app.snyk.io/org/${orgName}/project/${payload.project?.id ?? 'unknown'}/issue/${issueId}`;

  const agentPrompt = buildAgentPrompt({
    issueId,
    issueTitle,
    severity,
    cvss,
    cwe,
    filePath,
    fixedIn,
    introducedThrough,
    projectName,
    projectBranch,
    orgName,
    issueUrl,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[snyk-webhook] CURSOR_API_KEY not set — cannot trigger agent');
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
      console.error('[snyk-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[snyk-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      issueId,
      issueUrl,
    });
  } catch (err) {
    console.error('[snyk-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function pickTriggerIssue(payload: SnykPayload): SnykIssue | null {
  const candidates: SnykIssue[] = [];
  if (payload.issue) candidates.push(payload.issue);
  if (Array.isArray(payload.newIssues)) candidates.push(...payload.newIssues);

  const ranked = candidates
    .filter(i => i.severity === 'critical' || i.severity === 'high')
    .sort((a, b) => (b.cvssScore ?? 0) - (a.cvssScore ?? 0));
  return ranked[0] ?? null;
}

function buildAgentPrompt(args: {
  issueId: string;
  issueTitle: string;
  severity: string;
  cvss: number | null;
  cwe: string;
  filePath: string;
  fixedIn: string;
  introducedThrough: string;
  projectName: string;
  projectBranch: string;
  orgName: string;
  issueUrl: string;
}): string {
  const cvssLine =
    args.cvss != null
      ? `- CVSS: ${args.cvss.toFixed(1)} (${args.severity})`
      : `- CVSS: unavailable in payload — fetch via snyk-mcp in Step 1`;

  return `You are the orchestration layer between Snyk, GitHub, Jira, and the codebase.
A Snyk finding requires a verified patch. Coordinate across Snyk MCP, GitHub MCP,
Jira MCP, and the shell to ship a tested security PR — with zero human
intervention until the review step.

## Incoming finding
- Snyk issue: ${args.issueTitle} (${args.issueId})
- Issue URL: ${args.issueUrl}
- Severity: ${args.severity}
${cvssLine}
- CWE: ${args.cwe}
- File: ${args.filePath}
- Introduced through: ${args.introducedThrough}
- Fixed in (upstream advisory): ${args.fixedIn}
- Project: ${args.projectName} · branch ${args.projectBranch} · org ${args.orgName}

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in
the PR body.

### Step 1 — Snyk MCP intake
- Fetch the issue detail: severity, CVSS, CWE, OWASP class, exploit maturity.
- Fetch the data flow: every hop from tainted source to sink, with file:line.
- Fetch any companion findings on the same code path (especially Snyk Open
  Source upgrades that line up with the SAST fix).
- Fetch the upstream fix advisory (preferred patch shape, safe upgrade target).
- Record: the source, sink, every hop, the exploit maturity, and the advisory.

### Step 2 — Regression hunt via GitHub MCP
- Call GitHub MCP to list the last 20 commits touching the affected file or
  the data-flow stack.
- Identify the most recent commit that introduced the tainted-input flow.
- Cite SHA, author, date, and commit message in the PR body.

### Step 3 — Read the affected code (shell)
- Read every file in the data flow and the type definitions they reference.
- Form a written hypothesis before patching:
  - Where is the tainted source?
  - Where is the sink?
  - What is the minimal correct change that closes the flow?

### Step 4 — Patch
- Apply the minimal correct security fix. Prefer in order:
  1. Parameterize the call site so user input is never concatenated into a
     query/predicate/command.
  2. Add an allowlist (regex or schema) and reject anything else with a typed
     \`ValidationError\`. Never use a denylist.
  3. Apply any companion SCA upgrade in package.json + lockfile.
- Preserve existing types and function contracts. Do NOT widen types unless the
  data model requires it.
- Do NOT add narrative comments explaining the change.

### Step 5 — Static verify (shell)
- \`npm run lint\` — fix any new errors your patch introduced (especially
  eslint-plugin-security warnings).
- \`npx tsc --noEmit\` — must be clean.
- If either fails, return to Step 4.

### Step 6 — Live verify (shell)
- \`npx vitest run\` against any test files touching the affected code.
- \`node scripts/reproduce-snyk-injection.mjs\` (or the equivalent reproducer):
  - Before-fix baseline must reproduce the exploit. After-fix must reject the
    payload with a \`ValidationError\` and leak zero records.
- \`snyk test --severity-threshold=medium\` — must report 0 issues at the
  threshold.
- If any of those fail, return to Step 4.

### Step 7 — Open the PR via GitHub MCP
- Create a branch: \`security/<slug-from-issue>\`.
- Commit with message:
  \`\`\`
  security: <one-line description> (resolves ${args.issueId}, CVSS ${args.cvss?.toFixed(1) ?? 'N/A'})

  Resolves ${args.issueUrl}
  \`\`\`
- Push the branch.
- Open a PR with this body structure (every section filled with evidence from
  the steps above):

  ## Summary
  One sentence describing what changed and why.

  ## Exploit replay
  | Metric | Before | After | Δ |
  | --- | ---: | ---: | ---: |
  | Records leaked | <pre> | 0 | fully blocked |
  | snyk test (medium+) | <pre> | 0 critical · 0 high | cleared |
  | CVSS (highest) | <pre> | — | resolved |
  | Validation errors raised | 0 | 100% of bad payloads | +gate |

  ## Root cause
  - Source → sink (cite file:line from Step 3)
  - Regression commit (cite SHA from Step 2)
  - Snyk finding ${args.issueId} observation (Step 1)

  ## Fix
  - Bullet-point diff of what you changed and where

  ## Evidence
  - Snyk issue: ${args.issueUrl}
  - CWE: ${args.cwe}
  - Typecheck: ✓
  - Lint: ✓
  - Vitest: ✓
  - Live exploit replay: ✓ (<before> leaked → 0 leaked)
  - snyk test: ✓ 0 critical · 0 high · 0 medium

  ## Risk assessment
  - Blast radius (files, lines changed, type-surface impact)
  - Rollback plan

### Step 8 — Jira update (Jira MCP)
- Move the security ticket to \`In Review\`.
- Link the PR URL.
- Post a comment that cites the exploit-replay table and links the Snyk issue.
`;
}
