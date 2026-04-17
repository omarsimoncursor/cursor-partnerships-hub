import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Databricks workspace webhooks and triggers a Cursor Background Agent
 * to migrate the next queued workflow from Oracle PL/SQL + Informatica to
 * Databricks DLT + Unity Catalog.
 *
 * Setup:
 * 1. Register a Databricks workspace webhook pointing at
 *    https://cursor.omarsimon.com/api/databricks-webhook
 *    (e.g. `databricks workspace webhooks create --url ... --events pipelines.run`)
 * 2. Set the shared HMAC-SHA256 secret in DATABRICKS_WEBHOOK_SECRET.
 *    Databricks signs the raw body with `X-Databricks-Signature: sha256=<hex>`.
 *    (If the real scheme differs at build time, fall back to a passcode in the
 *    query string — the mock is what matters for the demo.)
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifyDatabricksSignature(
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

interface DatabricksPayload {
  event_type?: string;
  workspace_id?: string | number;
  workspace_url?: string;
  pipeline_id?: string;
  pipeline_name?: string;
  queue_item?: {
    workflow_slug?: string;
    workflow_index?: number;
    workflow_total?: number;
    legacy_source?: 'oracle-plsql' | 'informatica' | 'oracle-plsql+informatica';
  };
  target_schema?: string;
  target_warehouse?: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.DATABRICKS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-databricks-signature');

  if (!verifyDatabricksSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: DatabricksPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const workspaceUrl = payload.workspace_url || 'https://acme.cloud.databricks.com';
  const pipelineName = payload.pipeline_name || 'customer_rfm_pipeline';
  const workflowSlug = payload.queue_item?.workflow_slug || 'customer_rfm_segmentation';
  const workflowIndex = payload.queue_item?.workflow_index ?? 1;
  const workflowTotal = payload.queue_item?.workflow_total ?? 312;
  const legacySource = payload.queue_item?.legacy_source || 'oracle-plsql+informatica';
  const targetSchema = payload.target_schema || 'main.customer_analytics';
  const targetWarehouse = payload.target_warehouse || 'serverless-sql-large';

  const agentPrompt = buildAgentPrompt({
    workspaceUrl,
    pipelineName,
    workflowSlug,
    workflowIndex,
    workflowTotal,
    legacySource,
    targetSchema,
    targetWarehouse,
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error('[databricks-webhook] CURSOR_API_KEY not set — cannot trigger agent');
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
      console.error('[databricks-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 502 });
    }

    const result = await response.json();
    console.log('[databricks-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      pipelineName,
      workflowSlug,
      portfolio: `${workflowIndex}/${workflowTotal}`,
    });
  } catch (err) {
    console.error('[databricks-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  workspaceUrl,
  pipelineName,
  workflowSlug,
  workflowIndex,
  workflowTotal,
  legacySource,
  targetSchema,
  targetWarehouse,
}: {
  workspaceUrl: string;
  pipelineName: string;
  workflowSlug: string;
  workflowIndex: number;
  workflowTotal: number;
  legacySource: string;
  targetSchema: string;
  targetWarehouse: string;
}): string {
  return `You are the orchestration layer between Databricks, GitHub, Jira, and the
codebase. A Databricks workspace webhook fired: the next legacy workflow in
the migration queue is ready to be ported from Oracle PL/SQL + Informatica
to Databricks DLT. Coordinate across Databricks MCP (or the Databricks CLI),
GitHub MCP, Jira MCP, and the shell to ship a row-equivalence-verified
migration PR — with zero human intervention until the review step.

## Incoming migration task
- Databricks workspace: ${workspaceUrl}
- Target pipeline: ${pipelineName}
- Target schema (Unity Catalog): ${targetSchema}
- Target SQL Warehouse: ${targetWarehouse}
- Workflow to migrate: ${workflowSlug}
- Portfolio position: ${workflowIndex} / ${workflowTotal}
- Legacy source: ${legacySource}

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the PR body.

### Step 1 — Databricks MCP intake
- Connect to the workspace (${workspaceUrl}).
- Read Unity Catalog: the target catalog, schemas, and the three-level namespace
  for any tables you'll create or reference (\`catalog.schema.table\`).
- List SQL Warehouses (sizing + auto-stop) and Delta Live Tables pipelines.
- List asset bundles in the repo (\`databricks.yml\`).
- Record: cluster/warehouse sizing, existing DLT pipelines, catalog grants.

### Step 2 — Legacy source read (shell)
- Read the PL/SQL stored proc and the linked Informatica mapping XML end-to-end.
- Enumerate vendor-specific idioms: explicit cursors + FETCH loops,
  \`MERGE ... USING\`, \`CONNECT BY PRIOR\`, \`NVL\`, \`DECODE\`, \`ROWNUM\`,
  \`TO_CHAR(date, 'YYYYMM')\`, global temp tables.
- For the Informatica mapping, enumerate every \`TRANSFORMATION\` (Source Qualifier,
  Expression, Aggregator, etc.) and the \`CONNECTOR\` graph between them.

### Step 3 — Regression / provenance hunt (GitHub MCP)
- Call GitHub MCP to find the last commit touching the legacy file(s) and the
  original author. Note in the PR body for reviewer context.

### Step 4 — Migration plan (codegen)
- Produce \`docs/migration/<date>-${workflowSlug}.md\` with:
  - Idiom mapping table (Oracle idiom → Databricks equivalent)
  - Target DLT / SQL / Unity Catalog shape
  - Row-equivalence verification approach (1% Oracle sample)
  - Portfolio context (\`${workflowIndex} / ${workflowTotal}\` workflows)

### Step 5 — Patch (shell + edit)
- Emit exactly four files under \`databricks/\`:
  1. \`${workflowSlug}_pipeline.py\` — a DLT pipeline using \`@dlt.table\` decorators.
     - Cursor + FETCH loops → window functions.
     - Global temp tables → \`@dlt.table\` intermediate tables (bronze / silver / gold).
     - MERGE INTO → \`MERGE INTO delta.<table>\` with identical natural keys.
     - CONNECT BY → recursive CTE, depth-capped to match Oracle semantics.
     - NVL / DECODE → COALESCE / CASE WHEN (output column names preserved).
     - TO_CHAR(date,'YYYYMM') → DATE_FORMAT(date,'yyyyMM').
  2. \`${workflowSlug}.sql\` — a companion SQL model.
  3. \`unity_catalog_grants.sql\` — GRANTs on the new bronze/silver/gold tables.
     Owner = \`data-platform\`. Readers = \`analytics_reader\`, \`marketing_ops\`.
  4. \`databricks.yml\` entry — an asset bundle target for this pipeline.
- Preserve existing types and contracts. Do NOT widen types, drop columns, or
  silently change semantics without a migration note.
- Do NOT add narrative comments that only describe what the code does.

### Step 6 — Static verify (shell)
- \`databricks bundle validate\` — must be clean.
- \`npx tsc --noEmit\` — for any TS glue; must be clean.
- \`npm run lint\` — fix any new errors your patch introduced.
- If anything fails, return to Step 5.

### Step 7 — Live verify (shell)
- Start the demo dev server on port 3101: \`PORT=3101 npm run dev\`. Wait for "Ready".
  - NOTE: the local smoke must run on \`http://localhost:3101\` — not \`:3000\`,
    which is reserved for the other partner demos.
- Submit the pipeline against a dev workspace via the Databricks CLI:
  \`databricks bundle deploy --target dev\`
  \`databricks jobs run-now --job-id <id> --synchronous\`
- Run a row-equivalence harness against a 1% Oracle sample. Record:
  - \`row delta\` (must be **0**)
  - Monetary Σ delta per measure column (must be **$0.00**)
  - Latency comparison (Oracle total runtime vs Databricks Photon runtime).
- If row delta ≠ 0, return to Step 5 and iterate.
- Stop the dev server.

### Step 8 — Open PR (GitHub MCP)
- Create branch: \`feat/migrate-${workflowSlug}\`.
- Commit message:
  \`\`\`
  feat(migration): ${workflowSlug} — Oracle PL/SQL → Databricks DLT (${workflowIndex}/${workflowTotal})

  Row-equivalent to Oracle source. Verified via 1% sample harness.
  Pipeline: ${pipelineName} · schema: ${targetSchema} · warehouse: ${targetWarehouse}.
  \`\`\`
- Push the branch and open a PR. The PR body MUST include:
  1. **Summary** — one sentence on what was ported.
  2. **Before / after table** — Oracle runtime vs Databricks Photon runtime;
     Oracle+Informatica unit cost vs DBU cost; row delta; Σ delta.
  3. **Idiom mapping table** — every Oracle idiom → Databricks equivalent.
  4. **Portfolio progress line** — \`${workflowIndex} / ${workflowTotal} workflows migrated.
     Est. portfolio finish at this rate: N months (vs GSI baseline 5 years).\`
  5. **Evidence** — Databricks job id + link, DLT pipeline id, row-equivalence
     harness output, Photon vs Oracle timings, Jira ticket.
  6. **Risk assessment** — blast radius, type-surface delta, rollback plan,
     watchlist items (e.g. recursive CTE depth cap).
  7. **Reviewer banner** — "Verified by Cursor agent · output-equivalent to Oracle source".

### Step 9 — Jira update (Jira MCP)
- Move the matching migration-task subtask (e.g. \`CUR-5102\`) to \`In Review\`.
- Keep the migration epic (\`CUR-5101\`) open.
- Link the PR URL and the Databricks pipeline URL.
- Post a comment citing: row delta, monetary Σ delta, Photon vs Oracle latency,
  DBU cost.

## Non-negotiables
- Output equivalence beats stylistic parity. If the PR can't clear the
  row-equivalence harness, do NOT open it.
- No schema widening, no silent column drops, no type changes without a
  migration note in the PR body.
- Unity Catalog three-level naming everywhere (\`catalog.schema.table\`).
- The agent proposes; a human approves and merges.
`;
}
