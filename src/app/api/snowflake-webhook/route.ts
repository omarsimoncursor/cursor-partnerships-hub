import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receives Snowflake Notification Integration webhooks and triggers a
 * Cursor Background Agent to modernize one legacy ELT asset (BTEQ / T-SQL /
 * Informatica) into a Snowflake + dbt + Cortex AI project automatically.
 *
 * Setup:
 * 1. Configure a Snowflake Notification Integration of TYPE = WEBHOOK with
 *    WEBHOOK_URL = https://cursorpartners.omarsimon.com/api/snowflake-webhook
 *    WEBHOOK_SECRET = <shared HMAC secret>
 * 2. Set SNOWFLAKE_WEBHOOK_SECRET to the same value.
 *    Snowflake signs the payload with HMAC-SHA256 — we accept either the
 *    x-snowflake-signature header (documented shape) or an x-webhook-signature
 *    fallback for self-hosted mocks.
 * 3. Set CURSOR_API_KEY for triggering Background Agents.
 */

function verifySnowflakeSignature(
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
    return crypto.timingSafeEqual(Buffer.from(hex, 'hex'), Buffer.from(digest, 'hex'));
  } catch {
    return false;
  }
}

interface SnowflakePayload {
  event_type?: string;
  account?: string;
  region?: string;
  role?: string;
  warehouse?: string;
  database?: string;
  schema?: string;
  target_object?: string;
  firstAssetToMigrate?: string;
  query_id?: string;
  webhook_url?: string;
  audit?: {
    bteq_count?: number;
    tsql_count?: number;
    informatica_count?: number;
    ssis_count?: number;
    broken_pipelines?: number;
    stalest_pipeline_hours?: number;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.SNOWFLAKE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature =
    request.headers.get('x-snowflake-signature') ||
    request.headers.get('x-webhook-signature');

  if (!verifySnowflakeSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: SnowflakePayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = payload.event_type || 'elt.audit';
  if (eventType === 'elt.audit.recovery') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'recovery' });
  }

  const account = payload.account || 'acme-analytics';
  const region = payload.region || 'us-east-1.aws';
  const role = payload.role || 'ANALYTICS_ENGINEER';
  const warehouse = payload.warehouse || 'XS_MODERNIZATION_WH';
  const database = payload.database || 'prod_analytics';
  const schema = payload.schema || 'marts';
  const targetObject = payload.target_object || 'fct_daily_revenue';
  const firstAsset = payload.firstAssetToMigrate || 'daily_revenue_rollup';

  const agentPrompt = buildAgentPrompt({
    account,
    region,
    role,
    warehouse,
    database,
    schema,
    targetObject,
    firstAsset,
    audit: payload.audit ?? {},
  });

  const cursorApiKey = process.env.CURSOR_API_KEY;
  if (!cursorApiKey) {
    console.error(
      '[snowflake-webhook] CURSOR_API_KEY not set — cannot trigger agent',
    );
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
        repository: 'cursor/partnerships-hub',
        branch: 'main',
        prompt: agentPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[snowflake-webhook] Failed to trigger Cursor agent:', err);
      return NextResponse.json(
        { error: 'Failed to trigger agent' },
        { status: 502 },
      );
    }

    const result = await response.json();
    console.log('[snowflake-webhook] Cursor agent triggered:', result);

    return NextResponse.json({
      ok: true,
      agentTriggered: true,
      account,
      firstAsset,
    });
  } catch (err) {
    console.error('[snowflake-webhook] Error triggering Cursor agent:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function buildAgentPrompt({
  account,
  region,
  role,
  warehouse,
  database,
  schema,
  targetObject,
  firstAsset,
  audit,
}: {
  account: string;
  region: string;
  role: string;
  warehouse: string;
  database: string;
  schema: string;
  targetObject: string;
  firstAsset: string;
  audit: NonNullable<SnowflakePayload['audit']>;
}): string {
  const bteqCount = audit.bteq_count ?? 247;
  const tsqlCount = audit.tsql_count ?? 412;
  const infaCount = audit.informatica_count ?? 184;
  const ssisCount = audit.ssis_count ?? 68;
  const portfolioTotal = bteqCount + tsqlCount + infaCount + ssisCount;

  return `You are the orchestration layer between Snowflake, GitHub, Jira, Cortex AI, and the codebase.
A Snowflake ELT freshness audit fired. Coordinate Snowflake MCP, Cortex AI, dbt, GitHub MCP,
Jira MCP, and the shell to modernize one legacy asset end-to-end — with zero human intervention
until the review step. Determinism across real runs is the goal.

## Incoming audit
- Snowflake account: ${account} · region ${region}
- Role: ${role} · warehouse: ${warehouse} (guardrail: X-Small, do NOT resize)
- Target mart: ${database}.${schema}.${targetObject}
- First asset: ${firstAsset}.bteq + usp_enrich_customers_360.sql + wf_customers_360.xml
- Legacy portfolio: ${bteqCount} BTEQ · ${tsqlCount} T-SQL · ${infaCount} Informatica · ${ssisCount} SSIS (${portfolioTotal.toLocaleString()} assets)

## Required sequence

You MUST execute every step. Do not skip steps. Cite evidence from each step in the PR body.

### Step 1 — Snowflake MCP intake
- Connect to \`${account}\` in \`${region}\`, assume role \`${role}\`.
- List databases, schemas, warehouses. Verify Cortex AI entitlement (\`SNOWFLAKE.CORTEX.COMPLETE\` / \`SUMMARIZE\` / \`SEARCH\`).
- Read recent query history for \`${database}.${schema}.${targetObject}\`. Record staleness and any downstream pipeline blockage.

### Step 2 — Legacy source read (shell)
- Read the following files end-to-end:
  - \`src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq\`
  - \`src/lib/demo/legacy-sqlserver/usp_enrich_customers_360.sql\`
  - \`src/lib/demo/legacy-informatica/wf_customers_360.xml\`
- Enumerate dialect idioms: QUALIFY, MULTISET VOLATILE, COLLECT STATISTICS, Teradata date math, MERGE, CROSS APPLY / OUTER APPLY, OPENJSON, FOR JSON PATH, DATETIME2, SYSDATETIMEOFFSET, Informatica Source Qualifier / Aggregator / Lookup / Update Strategy. Map each to a Snowflake-native / dbt / Snowpark equivalent.

### Step 3 — GitHub regression / provenance hunt (GitHub MCP)
- List the last 10 commits touching each legacy file. Note SHA + author + date + message.
- Cite this in the PR body so the reviewer sees the context.

### Step 4 — Write modernization plan (codegen)
- Produce \`docs/modernization/<date>-${firstAsset}.md\` with:
  - Source/target scope + LOC
  - Idiom mapping table
  - Verification approach (Cortex semantic diff + 1% row-level equivalence harness)
  - Economics (GSI line-item vs Cursor + Snowflake credits)
  - Portfolio context (N / ${portfolioTotal.toLocaleString()} assets)

### Step 5 — Patch (shell + edit)
Emit a minimal, dbt-native diff. Target files:
- \`models/staging/stg_revenue_events.sql\`
- \`models/marts/fct_daily_revenue.sql\` (incremental · unique_key = (order_date, region_code, category_name))
- \`tests/fct_daily_revenue.yml\` (not_null, unique, relationships — at least 10 tests)
- \`macros/cortex_semantic_diff.sql\` (reusable macro wrapping \`SNOWFLAKE.CORTEX.COMPLETE\`)
- \`snowflake_procs/usp_enrich_customers_360.py\` (Snowpark Python translating the T-SQL proc)

Constraints: no behavioral widening, no schema drops, no warehouse-size creep, no role grants beyond what the target already has.

### Step 6 — Static verify (shell)
- \`dbt compile\` → ✓
- \`dbt parse\` → ✓
- \`tsc --noEmit\` (glue TS) → ✓
- \`npm run lint\` → ✓
- Iterate on Step 5 until all four are clean.

### Step 7 — Semantic + data verify
- **Cortex semantic diff**: call \`SNOWFLAKE.CORTEX.COMPLETE('mistral-large', before_spec, after_spec)\` and require "no drift".
- **Row-equivalence harness**: against a 1% sample from the Teradata/SQL Server snapshot, assert:
  - \`row delta = 0\`
  - Σ revenue delta = \`$0.00\`
  - Top-10 customer rank drift = \`0\`
  - No column-type widening
- **dbt run + test** against \`${warehouse}\` with \`--target dev\`. Must be SUCCESS, 14+ tests passing.
- Local smoke must run on \`http://localhost:3102\` (this demo's port), not :3000.
- If any of these fails, iterate on Step 5.

### Step 8 — Open the PR via GitHub MCP
- Create branch \`feat/modernize-${firstAsset}\`.
- Commit with message:
  \`\`\`
  feat(dw): ${firstAsset.replace(/_/g, ' ')} — Teradata BTEQ → Snowflake + dbt (1/${bteqCount})

  Resolves the ELT freshness audit on ${database}.${schema}.${targetObject}
  \`\`\`
- Push the branch.
- Open a PR with this body structure (every section must be filled with evidence):

  ## Summary
  One sentence describing what changed and why.

  ## Portfolio progress
  \`1 / ${bteqCount}\` BTEQ + \`1 / ${tsqlCount}\` T-SQL assets modernized. Est. portfolio finish: 15 months (vs GSI baseline 4 years).

  ## Credits + latency
  Markdown table:
  | Metric | Teradata + Informatica | Snowflake + dbt | Δ |
  | --- | ---: | ---: | ---: |
  | Wall time | <legacy>s | <new>s | <multiplier>× faster |
  | Compute cost (this run) | ~$<legacy>$ | $<new> | <pct>% |
  | Snowflake credits | — | <credits> | XS WH |
  | Annual run-rate | $8.2M | $2.3M | −$5.9M/yr |

  ## Idiom mapping
  The full idiom mapping table from Step 2.

  ## Cortex semantic diff
  Verbatim output from \`SNOWFLAKE.CORTEX.COMPLETE(...)\` (Step 7).

  ## Row-equivalence harness
  Numbers from Step 7: row Δ, Σ revenue Δ, rank drift, sample size, seed.

  ## Files changed (5)
  The five files from Step 5.

  ## Risk assessment
  Blast radius, schema surface, rollback, warehouse sizing.

### Step 9 — Jira update (Jira MCP)
- Move CUR-5202 (or equivalent modernization subtask) to \`In Review\`.
- Link the PR URL + the Cortex COMPLETE result + the row-equivalence harness output.
- Leave Epic CUR-5201 (ELT Modernization) open.

Be explicit: the agent **must** hit every step and cite evidence in the PR body.`;
}
