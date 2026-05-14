import { NextRequest, NextResponse } from 'next/server';

/**
 * Receives Figma webhooks (FILE_UPDATE, LIBRARY_PUBLISH) and triggers a
 * Cursor Background Agent to detect, triage, and ship a token-only fix
 * for any visual drift between the Figma frame and the shipped component.
 *
 * Setup:
 * 1. Create a Figma webhook (POST https://api.figma.com/v2/webhooks):
 *      event_type: "FILE_UPDATE" (or LIBRARY_PUBLISH)
 *      team_id:    <your team id>
 *      endpoint:   https://cursor.omarsimon.com/api/figma-webhook
 *      passcode:   <random secret>
 * 2. Set FIGMA_WEBHOOK_PASSCODE to the same value.
 * 3. Set CURSOR_API_KEY to trigger Background Agents.
 *
 * Figma webhook auth: Figma echoes the `passcode` you set at registration
 * time on every event payload. Verify it server-side. (No HMAC.)
 *
 * Reference: https://www.figma.com/developers/api#webhooks-v2
 */

const ACCEPTED_EVENTS = new Set(['FILE_UPDATE', 'LIBRARY_PUBLISH']);

interface FigmaWebhookPayload {
  event_type?: string;
  passcode?: string;
  file_key?: string;
  file_name?: string;
  triggered_by?: { id?: string; handle?: string };
  webhook_id?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  const expectedPasscode = process.env.FIGMA_WEBHOOK_PASSCODE;
  if (!expectedPasscode) {
    return NextResponse.json(
      { error: 'Webhook passcode not configured (FIGMA_WEBHOOK_PASSCODE)' },
      { status: 500 },
    );
  }

  let payload: FigmaWebhookPayload;
  try {
    payload = (await request.json()) as FigmaWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Constant-time-ish equality on a byte-length-matched buffer.
  if (
    typeof payload.passcode !== 'string' ||
    payload.passcode.length !== expectedPasscode.length ||
    payload.passcode !== expectedPasscode
  ) {
    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
  }

  const eventType = payload.event_type ?? '';

  // Figma sends a synthetic PING when registering — ack it.
  if (eventType === 'PING') {
    return NextResponse.json({ ok: true, ping: true });
  }

  if (!ACCEPTED_EVENTS.has(eventType)) {
    return NextResponse.json({ ok: true, skipped: true, reason: `event_type=${eventType}` });
  }

  const fileKey = payload.file_key ?? 'unknown';
  const fileName = payload.file_name ?? 'unknown';
  const fileUrl = `https://www.figma.com/file/${fileKey}/${encodeURIComponent(fileName)}`;
  const triggeredBy = payload.triggered_by?.handle ?? 'unknown';

  const agentPrompt = buildAgentPrompt({ fileKey, fileName, fileUrl, eventType, triggeredBy });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[figma-webhook] CURSOR_API_KEY not set — cannot trigger agent');
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
      console.error('[figma-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[figma-webhook] Cursor agent triggered:', result);

    return NextResponse.json({ ok: true, agentTriggered: true, fileKey, fileName });
  } catch (err) {
    console.error('[figma-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  fileKey,
  fileName,
  fileUrl,
  eventType,
  triggeredBy,
}: {
  fileKey: string;
  fileName: string;
  fileUrl: string;
  eventType: string;
  triggeredBy: string;
}): string {
  return `You are the orchestration layer between Figma, GitHub, and the codebase.
A Figma file changed. Detect any visual drift between the updated Figma frames
and the shipped components, then coordinate a token-only fix via Figma MCP,
GitHub MCP, and the shell — with zero human intervention until the review step.

## Incoming event
- Figma event: ${eventType}
- File: ${fileName} (key: ${fileKey})
- File URL: ${fileUrl}
- Triggered by: ${triggeredBy}

## Required sequence

You MUST execute every step in order. Do not skip steps. Each step documents
which tool to use and what evidence you must gather.

### Step 1 — Figma MCP intake
- Call the Figma MCP to fetch the file, the affected component(s)/instance(s),
  and the current variable collection (e.g. \`design-system/tokens@vX.Y\`).
- Diff the declared variables against the actual code usage in the
  corresponding React component(s).

### Step 2 — Enumerate violations
- Produce a structured list: { element, property, expected (Figma), actual
  (code), delta }. Cite the EXACT variable path for each violation
  (e.g. \`color/brand/accent\`, \`radius/md\`, \`space/6\`).
- A violation is anything exceeding the **±2 px / ΔE > 4** threshold.
- Stop early if the diff is empty.

### Step 3 — Regression hunt via GitHub MCP
- List the last 14 days of commits touching the affected component file(s)
  AND the design-tokens module.
- Identify the most likely drift-introducing commit. Note SHA, author, date.

### Step 4 — Read affected code via shell
- Read the drifted component file(s) AND \`src/lib/demo/design-tokens.ts\`
  (or the project's tokens module).
- Form a written hypothesis BEFORE patching: which literals correspond to
  which token paths, and why does the drift exist.

### Step 5 — Patch (token-only substitution)
- Replace EVERY hardcoded literal with the corresponding \`tokens.*\`
  reference. Examples:
    \`borderRadius: 12\`     → \`borderRadius: tokens.radius.button\`
    \`padding: 20\`          → \`padding: tokens.space.cardPadding\`
    \`background: '#9A4FFF'\` → \`background: tokens.color.brandAccent\`
- **Do NOT** rewrite layout, change semantics, restructure JSX, rename
  props, add new components, or touch unrelated styling.
- Keep the diff minimal: ideally one file, +N −N where N matches the
  violation count.

### Step 6 — Static verification via shell
- \`npx tsc --noEmit\` — must pass.
- \`npm run lint\` — must pass.
- If either fails, return to Step 5.

### Step 7 — Visual + accessibility verification
- Run the project's visual regression suite (Chromatic / Percy /
  Playwright snapshot) if present. Compare the component snapshot against
  the Figma frame export at 1× and 2× DPR.
- For EVERY color that changed, compute WCAG contrast on the affected
  surface. The fix MUST maintain or improve AA. If contrast regresses,
  return to Step 5 with a different token choice.
- Required result: 0 pixel violations · ΔE < 1 mean · WCAG AA preserved.

### Step 8 — Open the PR via GitHub MCP
- Branch: \`fix/<component-slug>-token-drift\`.
- Commit message:
  \`\`\`
  fix(ui): restore token references on <ComponentName> (100% Figma match)

  Resolves design drift detected on ${fileName} (${fileKey}).
  \`\`\`
- PR body MUST include all of the following sections, populated with real
  evidence from Steps 1–7:

  ## Summary
  One sentence: what changed, why.

  ## Violations resolved
  Markdown table — one row per violation. Columns: #, Element, Variable,
  Figma spec, Was, Δ.

  ## Before / after
  Embed before/after screenshots (or inline React renders) of the affected
  component.

  ## Root cause
  Cite the regression commit SHA from Step 3 and explain why the drift
  appeared.

  ## Evidence
  - Figma file: ${fileUrl}
  - Regression commit: <SHA>
  - Typecheck: ✓
  - Lint: ✓
  - WCAG AA contrast: <before-ratio> → <after-ratio>
  - Visual regression: <N> violations → 0 · mean ΔE <a> → <b>
  - Triage report: docs/triage/<date>-design-drift-<component>.md

  ## Risk assessment
  - Blast radius: <files> file(s) · +N −N · token-only
  - Rollback: revert this PR — no migrations or downstream consumers

### Step 9 — Jira MCP update
- Move the linked Jira ticket to \`In Review\`.
- Attach the PR URL and the Figma file URL to the ticket.
- Post a brief comment summarizing the violations, the regression commit,
  and the visual regression result.
`;
}
