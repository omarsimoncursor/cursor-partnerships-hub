import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Sentry issue webhooks and triggers a Cursor Background Agent
 * to triage and fix the error automatically.
 *
 * Setup:
 * 1. Create a Sentry Internal Integration with "issue" webhook
 * 2. Set the webhook URL to https://cursorpartners.omarsimon.com/api/sentry-webhook
 * 3. Copy the webhook signing secret to SENTRY_WEBHOOK_SECRET env var
 * 4. Set CURSOR_API_KEY for triggering Background Agents
 */

function verifySentrySignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  const secret = process.env.SENTRY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('sentry-hook-signature');

  if (!verifySentrySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const resource = request.headers.get('sentry-hook-resource');

  if (resource === 'installation') {
    return NextResponse.json({ ok: true });
  }

  if (resource !== 'issue') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const payload = JSON.parse(body);
  const action = payload.action;

  if (action !== 'created') {
    return NextResponse.json({ ok: true, skipped: true, reason: `action=${action}` });
  }

  const issue = payload.data?.issue;
  if (!issue) {
    return NextResponse.json({ error: 'No issue data in payload' }, { status: 400 });
  }

  const issueUrl = issue.permalink || `https://sentry.io/issues/${issue.id}/`;
  const errorTitle = issue.title || 'Unknown error';
  const culprit = issue.culprit || 'unknown';

  const agentPrompt = buildAgentPrompt({ issueUrl, errorTitle, culprit });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[sentry-webhook] CURSOR_API_KEY not set — cannot trigger agent');
    return NextResponse.json({ error: 'Cursor API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.cursor.com/v1/agents/background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cursorApiKey}`,
      },
      body: JSON.stringify({
        repository: 'cursor/partnerships-hub',
        branch: 'main',
        prompt: agentPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[sentry-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[sentry-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      issueUrl,
    });
  } catch (err) {
    console.error('[sentry-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  issueUrl,
  errorTitle,
  culprit,
}: {
  issueUrl: string;
  errorTitle: string;
  culprit: string;
}): string {
  return `You are the orchestration layer between Sentry, GitHub, and the codebase.
A new Sentry error was reported. Coordinate across Sentry MCP, GitHub MCP, and the
shell to ship a tested PR — with zero human intervention until the review step.

## Incoming alert
- Sentry URL: ${issueUrl}
- Error: ${errorTitle}
- Culprit: ${culprit}

## Required sequence

You MUST execute every step. Do not skip steps. Each step documents which tool to use.

### Step 1 — Triage via Sentry MCP
- Call Sentry MCP to fetch full issue: stack trace, breadcrumbs, tags, affected user count.
- Extract the full stack trace. Note every frame and its file/line.
- Record the error signature and affected user count — you will cite these in the PR body.

### Step 2 — Regression hunt via GitHub MCP
- Call GitHub MCP to list the last 10 commits touching any file in the stack trace.
- Identify the most recent commit that likely introduced the regression.
- Note the commit SHA, author, and date — you will cite these in the PR body.

### Step 3 — Read the affected code via shell
- Read every file in the stack trace (this bug spans at least two files).
- Read any related type definitions referenced by those files.
- Form a hypothesis in writing before patching: what is the root cause, and which files need to change?

### Step 4 — Patch
- Apply the minimal correct fix across every affected file.
- Preserve existing types and function contracts where possible. Widen types only where the data model genuinely requires it.
- Do NOT add narrative comments explaining the change. Code should be self-explanatory.

### Step 5 — Static verification via shell
- Run \`npm run lint\` if configured. Fix any new lint errors introduced by your patch.
- Run \`npx tsc --noEmit\` to confirm no type errors.
- If either fails, return to Step 4.

### Step 6 — Live reproduction via shell
- Start the dev server: \`npm run dev\`.
- Wait for "Ready" in the output.
- Use a headless browser or curl to hit http://localhost:3000/partnerships/sentry/demo and click "Process Order" (or invoke processOrder() directly with the failing payload).
- Confirm the order succeeds without throwing. If it still throws, return to Step 4.
- Stop the dev server.

### Step 7 — Open the PR via GitHub MCP
- Create a branch: \`fix/sentry-<slug-from-error-signature>\`.
- Commit with message:
  \`\`\`
  fix: handle undefined payment details in order processor

  Resolves ${issueUrl}
  \`\`\`
- Push the branch.
- Open a PR with this body structure (fill in every section with evidence from the steps above):

  ## Summary
  One sentence describing what changed and why.

  ## Root cause
  - What was broken (cite the file:line from Step 1)
  - Why it broke (cite the regression commit from Step 2)

  ## Fix
  - Bullet-point diff of what you changed and where

  ## Evidence
  - Sentry issue: ${issueUrl} (${errorTitle})
  - Affected users: <number from Step 1>
  - Regression commit: <SHA from Step 2>
  - Typecheck: ✓
  - Live reproduction: ✓ (dev server + click Process Order succeeded)

  ## Risk assessment
  - Blast radius (lines changed, files touched)
  - Rollback plan
`;
}
