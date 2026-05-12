// Catalog of vendors that have either an official MCP integration
// with Cursor or are reasonably automatable via the Cursor SDK / a
// thin agent harness on top of the SDK. Each entry powers the
// branded account demo: the vendor card, the SDK workflow composer
// step library, and the integration matrix.

export type IntegrationMode = 'mcp' | 'sdk' | 'both';

export type VendorWorkflowStep = {
  // Short imperative label shown in the timeline UI
  label: string;
  // Sentence describing what the agent / MCP call accomplishes
  detail: string;
  // Pseudo-code line shown in the code preview ("await sdk.tool(...)")
  code: string;
};

export type VendorDemoScenario = {
  // One-line narrative shown above the playback
  headline: string;
  // Sub-headline / framing
  subheadline: string;
  // Sequenced agent steps (4-7 items) that play back in the card
  steps: VendorWorkflowStep[];
  // Final artifact / outcome bullets
  outcomes: string[];
};

export type Vendor = {
  id: string;
  name: string;
  // Hex brand color; used as the card accent
  brand: string;
  // Optional logo path under /public/logos. Falls back to a colored
  // letter mark if missing.
  logo?: string;
  // What the agent can automate, in one short noun phrase
  category: string;
  // Cursor integration mode: official MCP, SDK-driven, or both
  mode: IntegrationMode;
  // Short label shown next to the integration badge
  modeNote: string;
  // Account-agnostic demo scenario (the {{ACCOUNT}} placeholder is
  // replaced with the prospect's brand at render time).
  scenario: VendorDemoScenario;
  // Reusable steps that can be dropped into the SDK workflow composer.
  // First entry is treated as the canonical "hero" action for the vendor.
  composerSteps: VendorWorkflowStep[];
};

const repl = (s: string) => s; // placeholder helper for future i18n

export const VENDORS: Vendor[] = [
  {
    id: 'figma',
    name: 'Figma',
    brand: '#A259FF',
    logo: '/logos/figma.png',
    category: 'Design system + product specs',
    mode: 'mcp',
    modeNote: 'Official Figma MCP server',
    scenario: {
      headline: repl('Figma designs become production code, no game of telephone.'),
      subheadline: repl(
        'Cursor reads {{ACCOUNT}} design files directly via Figma\'s MCP. Designers iterate with the agent, the agent emits typed components, and PMs see the diff.'
      ),
      steps: [
        { label: 'Fetch frame', detail: 'Pull the latest checkout redesign from {{ACCOUNT}}\'s Figma file', code: 'await figma.getFrame({ fileKey, nodeId: "checkout-v3" })' },
        { label: 'Resolve tokens', detail: 'Map design tokens to {{ACCOUNT}}\'s tailwind theme', code: 'const tokens = await figma.getTokens({ collection: "brand" })' },
        { label: 'Generate components', detail: 'Emit typed React components for every reusable node', code: 'await cursor.editor.applyEdits(plan.components)' },
        { label: 'Visual diff', detail: 'Run pixel diff against the production screenshot and flag drift', code: 'await figma.diff({ before: prodPng, after: previewPng })' },
        { label: 'Open PR', detail: 'Submit PR tagged with the Figma node, ready for design review', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        'Components match the spec down to spacing tokens',
        'Designers leave comments on the PR, not in a separate spec doc',
        'PM sees a single PR rather than three Slack threads',
      ],
    },
    composerSteps: [
      { label: 'Read Figma frame', detail: 'Pull a frame and resolve tokens', code: 'const frame = await figma.getFrame({ fileKey, nodeId })' },
      { label: 'Sync design tokens', detail: 'Diff token collection against the codebase', code: 'await figma.syncTokens({ collection: "brand" })' },
      { label: 'Pixel-diff against prod', detail: 'Detect visual drift before merge', code: 'await figma.diff({ before, after })' },
    ],
  },
  {
    id: 'datadog',
    name: 'Datadog',
    brand: '#632CA6',
    logo: '/logos/datadog.svg',
    category: 'Observability + incident response',
    mode: 'mcp',
    modeNote: 'Official Datadog MCP server',
    scenario: {
      headline: repl('SLO breach to merged fix in under five minutes.'),
      subheadline: repl(
        'Datadog catches the breach on a {{ACCOUNT}} service. A Cursor cloud agent triages the trace, edits the code, runs tests, and submits a PR. PagerDuty never pages.'
      ),
      steps: [
        { label: 'Ingest alert', detail: 'Datadog monitor fires on /api/checkout p99 > 800ms', code: 'datadog.on("monitor.triggered", handler)' },
        { label: 'Pull trace', detail: 'Fetch the slowest span and matching exemplar', code: 'await datadog.getTrace({ traceId })' },
        { label: 'Locate code', detail: 'Map span to {{ACCOUNT}} repo + line', code: 'await cursor.search({ query: spanOp })' },
        { label: 'Patch + test', detail: 'Cache lookups, add benchmark, run CI', code: 'await cursor.runTests({ pattern: "checkout" })' },
        { label: 'Open PR', detail: 'Tag the on-call, link the Datadog dashboard', code: 'await github.openPullRequest({ ...plan })' },
      ],
      outcomes: [
        'p99 drops from 812ms to 168ms in benchmark',
        'PR includes the exact Datadog trace link',
        'On-call reviewer approves in under five minutes',
      ],
    },
    composerSteps: [
      { label: 'Subscribe to monitor', detail: 'Trigger on a Datadog monitor or SLO breach', code: 'datadog.on("monitor.triggered", handler)' },
      { label: 'Pull trace + exemplar', detail: 'Get the slowest span for the alert', code: 'await datadog.getTrace({ traceId })' },
      { label: 'Open dashboard link in PR', detail: 'Cross-link the fix to the Datadog dashboard', code: 'plan.pr.body += datadog.dashboardLink(...)' },
    ],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    brand: '#362D59',
    logo: '/logos/sentry.svg',
    category: 'Error monitoring + crash analytics',
    mode: 'mcp',
    modeNote: 'Official Sentry MCP server',
    scenario: {
      headline: repl('Sentry issue becomes a targeted patch with a passing test.'),
      subheadline: repl(
        'Sentry surfaces a recurring exception on {{ACCOUNT}}\'s production service. Cursor reads the breadcrumb trail, locates the regression, and ships a patch with a regression test.'
      ),
      steps: [
        { label: 'Pull issue', detail: 'Grab the failing event + breadcrumbs', code: 'await sentry.getIssue({ id })' },
        { label: 'Reproduce', detail: 'Generate a failing test from the breadcrumb trail', code: 'await cursor.editor.write(plan.failingTest)' },
        { label: 'Locate regression', detail: 'Bisect against the last green commit', code: 'await cursor.git.bisect({ good, bad, command })' },
        { label: 'Patch', detail: 'Write the minimal fix that makes the test pass', code: 'await cursor.editor.applyEdits(plan.patch)' },
        { label: 'Open PR', detail: 'Cross-link the Sentry issue + failing test', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        'Targeted diff: one file, one method',
        'New regression test prevents the bug from re-firing',
        'Sentry issue auto-resolves on deploy',
      ],
    },
    composerSteps: [
      { label: 'Pull Sentry issue', detail: 'Get the failing event and breadcrumbs', code: 'await sentry.getIssue({ id })' },
      { label: 'Generate failing test', detail: 'Write a test that reproduces the issue', code: 'await cursor.editor.write(plan.failingTest)' },
    ],
  },
  {
    id: 'snyk',
    name: 'Snyk',
    brand: '#4C4A73',
    category: 'Vulnerability + license scanning',
    mode: 'sdk',
    modeNote: 'Snyk REST + Cursor SDK',
    scenario: {
      headline: repl('Critical CVEs patched and PR\'d before the morning standup.'),
      subheadline: repl(
        'Snyk surfaces a critical CVE in a {{ACCOUNT}} service. A nightly Cursor SDK job upgrades the dependency, runs the full test suite, and opens a PR for the security team to review.'
      ),
      steps: [
        { label: 'Fetch vulns', detail: 'Pull the critical/high CVEs across {{ACCOUNT}}\'s repos', code: 'const vulns = await snyk.listVulns({ severity: "critical" })' },
        { label: 'Plan upgrade', detail: 'Pick the lowest semver bump that resolves the CVE', code: 'const plan = await snyk.fixPlan({ vulns })' },
        { label: 'Apply patches', detail: 'Update lockfile + propagate breaking changes', code: 'await cursor.editor.applyEdits(plan.edits)' },
        { label: 'Run tests', detail: 'Full CI suite + Snyk re-scan to confirm', code: 'await cursor.runTests()' },
        { label: 'Open PR', detail: 'Tag the security team with severity + before/after', code: 'await github.openPullRequest({ ...plan.pr })' },
      ],
      outcomes: [
        'Critical CVE count drops to zero overnight',
        'PR includes Snyk diff + test evidence',
        'Security team reviews instead of triages',
      ],
    },
    composerSteps: [
      { label: 'List Snyk criticals', detail: 'Pull the critical/high CVEs for the org', code: 'await snyk.listVulns({ severity: "critical" })' },
      { label: 'Apply lowest-risk fix', detail: 'Choose the minimum semver bump', code: 'await snyk.fixPlan({ vulns })' },
    ],
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    brand: '#29B5E8',
    logo: '/logos/Snowflake_Logo.svg',
    category: 'Data warehouse + analytics',
    mode: 'mcp',
    modeNote: 'Official Snowflake MCP + Cortex',
    scenario: {
      headline: repl('Legacy stored procs modernized into a Cortex-verified dbt DAG.'),
      subheadline: repl(
        'Cursor reads {{ACCOUNT}}\'s legacy Teradata BTEQ + T-SQL procs, generates Snowflake-native dbt models, and validates row counts against production via Snowflake MCP.'
      ),
      steps: [
        { label: 'Read legacy SQL', detail: 'Parse the BTEQ + T-SQL into a dependency graph', code: 'await cursor.parse({ files: legacyGlob })' },
        { label: 'Generate dbt models', detail: 'Emit Snowflake-native dbt with refs + tests', code: 'await cursor.editor.write(plan.dbtModels)' },
        { label: 'Validate in Snowflake', detail: 'Run row-count + schema checks against prod', code: 'await snowflake.runQuery({ sql: validationSql })' },
        { label: 'Cortex verify', detail: 'Use Cortex to summarize + sanity-check the diff', code: 'await snowflake.cortex.summarize({ before, after })' },
        { label: 'Open PR', detail: 'Submit the dbt project for review', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        '4-year GSI scope compressed into a single sprint',
        'Row counts match prod to the row',
        'Cortex narrates the diff for the data team',
      ],
    },
    composerSteps: [
      { label: 'Run Snowflake query', detail: 'Validate dbt output against prod row counts', code: 'await snowflake.runQuery({ sql })' },
      { label: 'Cortex summarize diff', detail: 'Use Cortex to narrate the change', code: 'await snowflake.cortex.summarize({ before, after })' },
    ],
  },
  {
    id: 'databricks',
    name: 'Databricks',
    brand: '#FF3621',
    logo: '/logos/Databricks_Logo.png',
    category: 'Lakehouse + ML pipelines',
    mode: 'mcp',
    modeNote: 'Databricks MCP + Unity Catalog',
    scenario: {
      headline: repl('Oracle PL/SQL + Informatica retired into Databricks DLT.'),
      subheadline: repl(
        'Cursor migrates {{ACCOUNT}}\'s legacy Oracle PL/SQL and Informatica jobs into Databricks Delta Live Tables governed by Unity Catalog. Lineage and access controls survive the move.'
      ),
      steps: [
        { label: 'Inventory legacy jobs', detail: 'Catalog every PL/SQL package + Informatica mapping', code: 'await cursor.parse({ files: oracleGlob })' },
        { label: 'Generate DLT pipelines', detail: 'Emit Delta Live Tables with expectations', code: 'await cursor.editor.write(plan.dltPipelines)' },
        { label: 'Map Unity Catalog grants', detail: 'Translate Oracle roles into UC privileges', code: 'await databricks.uc.applyGrants(plan.grants)' },
        { label: 'Validate lineage', detail: 'Confirm column-level lineage matches legacy', code: 'await databricks.lineage.compare({ before, after })' },
        { label: 'Open PR', detail: 'Submit the migration plan + DLT job specs', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        'GSI quote of 5 years compressed to 18 months',
        'Lineage and grants validated, not re-implemented',
        'Engineering owns the migration end-to-end',
      ],
    },
    composerSteps: [
      { label: 'Inventory legacy jobs', detail: 'Catalog Oracle / Informatica for migration', code: 'await cursor.parse({ files })' },
      { label: 'Apply Unity Catalog grants', detail: 'Translate legacy roles to UC privileges', code: 'await databricks.uc.applyGrants(plan.grants)' },
    ],
  },
  {
    id: 'aws',
    name: 'AWS',
    brand: '#FF9900',
    logo: '/logos/aws_light.svg',
    category: 'Cloud infrastructure',
    mode: 'both',
    modeNote: 'AWS MCP + boto3 via SDK',
    scenario: {
      headline: repl('Monolith decomposed into AWS-native services with IaC.'),
      subheadline: repl(
        'Cursor analyzes {{ACCOUNT}}\'s WebSphere monolith, extracts bounded contexts, and emits CDK + Terraform for the first service to peel off (Lambda + Aurora Serverless v2).'
      ),
      steps: [
        { label: 'Scan monolith', detail: 'Map every package + DB call in the monolith', code: 'await cursor.scan({ language: "java" })' },
        { label: 'Infer contexts', detail: 'Group by data ownership + call graph', code: 'await cursor.plan.boundedContexts()' },
        { label: 'Generate CDK', detail: 'Emit CDK for the OrdersService extraction', code: 'await cursor.editor.write(plan.cdk)' },
        { label: 'Provision dev', detail: 'Apply CDK to a sandbox account, run smoke tests', code: 'await aws.cdk.deploy({ env: "dev" })' },
        { label: 'Open PR', detail: 'Submit the migration PR + TCO swing', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        '5-year GSI quote compressed to 18 months',
        'TCO swing of $6.3M annual on the first context',
        'MAP credits eligible from day one',
      ],
    },
    composerSteps: [
      { label: 'Scan repo for AWS calls', detail: 'Map every boto3 / SDK touchpoint', code: 'await cursor.scan({ matcher: /boto3|aws-sdk/ })' },
      { label: 'Deploy CDK to sandbox', detail: 'Spin up a dev environment for testing', code: 'await aws.cdk.deploy({ env: "dev" })' },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    brand: '#238636',
    logo: '/logos/github_wordmark_light.svg',
    category: 'Source control + PR review',
    mode: 'both',
    modeNote: 'GitHub MCP + Octokit via SDK',
    scenario: {
      headline: repl('PR review feedback executed as a multi-file refactor.'),
      subheadline: repl(
        'A reviewer leaves five comments on a {{ACCOUNT}} PR. Cursor reads each thread, executes the refactor across files, regenerates tests, and updates the pull request.'
      ),
      steps: [
        { label: 'Read review threads', detail: 'Pull every unresolved comment on the PR', code: 'await github.listReviewComments({ pr })' },
        { label: 'Plan refactor', detail: 'Group comments by file + intent', code: 'await cursor.plan.fromComments(comments)' },
        { label: 'Apply edits', detail: 'Multi-file edits, preserve formatting', code: 'await cursor.editor.applyEdits(plan.edits)' },
        { label: 'Regenerate tests', detail: 'Update tests, run them locally', code: 'await cursor.runTests({ pattern: plan.scope })' },
        { label: 'Update the pull request', detail: 'Reply inline + push the new commit to the PR for human review (Cursor never auto-merges)', code: 'await github.pushAndReply(plan.replies)' },
      ],
      outcomes: [
        'Reviewer\'s comments resolved in a single push',
        'No back-and-forth, no merge anxiety',
        'Tests updated alongside the refactor',
      ],
    },
    composerSteps: [
      { label: 'Open a pull request', detail: 'Final step in most automation flows', code: 'await github.openPullRequest(plan.pr)' },
      { label: 'Read review threads', detail: 'Pull every unresolved review comment', code: 'await github.listReviewComments({ pr })' },
    ],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    brand: '#FC6D26',
    logo: '/logos/gitlab.svg',
    category: 'Source control + CI/CD',
    mode: 'both',
    modeNote: 'GitLab MCP + REST via SDK',
    scenario: {
      headline: repl('Failing pipeline diagnosed and redeployed without a human page.'),
      subheadline: repl(
        '{{ACCOUNT}}\'s GitLab pipeline fails on a flaky migration. Cursor reads the job logs, isolates the root cause, patches the code, and triggers a fresh pipeline.'
      ),
      steps: [
        { label: 'Pull failing job', detail: 'Fetch the job log + artifact list', code: 'await gitlab.jobs.get({ id })' },
        { label: 'Diagnose', detail: 'Find the failing assertion + offending diff', code: 'await cursor.plan.fromJobLog(log)' },
        { label: 'Patch', detail: 'Apply the fix and stage the change', code: 'await cursor.editor.applyEdits(plan.edits)' },
        { label: 'Re-run pipeline', detail: 'Trigger a fresh pipeline on the same MR', code: 'await gitlab.pipelines.run({ ref })' },
        { label: 'Notify', detail: 'Post the green build link to the MR', code: 'await gitlab.mr.comment(plan.message)' },
      ],
      outcomes: [
        'Engineer is not paged for the flaky failure',
        'MR turns green within minutes',
        'Patch is captured for future flakes',
      ],
    },
    composerSteps: [
      { label: 'Pull failing job log', detail: 'Get the offending GitLab job log', code: 'await gitlab.jobs.get({ id })' },
      { label: 'Re-run pipeline', detail: 'Trigger a fresh GitLab pipeline', code: 'await gitlab.pipelines.run({ ref })' },
    ],
  },
  {
    id: 'zscaler',
    name: 'Zscaler',
    brand: '#0072BC',
    category: 'Zero-trust network + policy',
    mode: 'sdk',
    modeNote: 'Zscaler API via Cursor SDK',
    scenario: {
      headline: repl('Network policy drift caught and corrected as code.'),
      subheadline: repl(
        'A nightly Cursor SDK job audits {{ACCOUNT}}\'s Zscaler tenant for drift against the Git-stored policy baseline. Drift gets corrected with a PR, not a console click.'
      ),
      steps: [
        { label: 'Fetch tenant config', detail: 'Pull live policies from Zscaler', code: 'const live = await zscaler.policies.export()' },
        { label: 'Diff against baseline', detail: 'Compare to the Git-stored YAML baseline', code: 'const drift = diff(live, baseline)' },
        { label: 'Plan corrections', detail: 'Either revert console changes or codify them', code: 'await cursor.plan.fromDrift(drift)' },
        { label: 'Apply via API', detail: 'Push corrections through Zscaler\'s API', code: 'await zscaler.policies.apply(plan.changes)' },
        { label: 'Open PR', detail: 'Document the change set in Git', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        'Console clicks become reviewable PRs',
        'Drift caught nightly, not quarterly',
        'Audit-ready trail of every policy change',
      ],
    },
    composerSteps: [
      { label: 'Export Zscaler policies', detail: 'Snapshot live tenant for diffing', code: 'await zscaler.policies.export()' },
      { label: 'Apply policy changes', detail: 'Push corrected policies via API', code: 'await zscaler.policies.apply(plan.changes)' },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    brand: '#2684FF',
    category: 'Work tracking + tickets',
    mode: 'mcp',
    modeNote: 'Atlassian MCP server',
    scenario: {
      headline: repl('Tickets and PRs stay in sync without a status meeting.'),
      subheadline: repl(
        'Every {{ACCOUNT}} PR opened by the agent updates the linked Jira ticket. Reviewers see acceptance criteria inline; PMs see status without asking.'
      ),
      steps: [
        { label: 'Fetch ticket', detail: 'Pull the linked Jira ticket + ACs', code: 'await jira.getIssue({ key })' },
        { label: 'Plan work', detail: 'Translate ACs into a checklist of edits', code: 'await cursor.plan.fromAcceptanceCriteria(acs)' },
        { label: 'Execute', detail: 'Apply edits + run tests', code: 'await cursor.editor.applyEdits(plan.edits)' },
        { label: 'Open PR', detail: 'Cross-link the PR + Jira ticket', code: 'await github.openPullRequest(plan.pr)' },
        { label: 'Move ticket', detail: 'Transition Jira to "In Review" with the PR link', code: 'await jira.transition({ key, to: "In Review" })' },
      ],
      outcomes: [
        'Acceptance criteria appear in the PR description',
        'Jira status is always current',
        'PMs stop asking for status updates',
      ],
    },
    composerSteps: [
      { label: 'Fetch Jira issue', detail: 'Get the ticket + acceptance criteria', code: 'await jira.getIssue({ key })' },
      { label: 'Transition Jira ticket', detail: 'Move the ticket as work progresses', code: 'await jira.transition({ key, to })' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    brand: '#4A154B',
    category: 'Collaboration + notifications',
    mode: 'both',
    modeNote: 'Slack MCP + Bolt SDK',
    scenario: {
      headline: repl('The agent posts in-thread, not in a separate channel.'),
      subheadline: repl(
        'Whenever the agent ships a PR for {{ACCOUNT}}, it posts the diff summary inline in the right Slack thread. The team reviews where they already are.'
      ),
      steps: [
        { label: 'Resolve thread', detail: 'Find the Slack thread that triggered the work', code: 'await slack.findThread({ tag: "incident-1284" })' },
        { label: 'Post status', detail: 'Drop a starting message + ETA', code: 'await slack.postMessage({ thread, text })' },
        { label: 'Stream progress', detail: 'Update with each milestone (test green, PR open)', code: 'await slack.update({ ts, text })' },
        { label: 'Attach PR', detail: 'Link the PR + summary in-thread', code: 'await slack.postMessage({ thread, blocks: pr })' },
        { label: 'Resolve', detail: 'Mark the thread resolved when the PR merges', code: 'await slack.reactionAdd({ ts, name: "white_check_mark" })' },
      ],
      outcomes: [
        'No new channels, no broken context',
        'Reviewers join the thread already in flight',
        'On-call sees ETA + result in one place',
      ],
    },
    composerSteps: [
      { label: 'Post Slack update', detail: 'Notify the right thread with progress', code: 'await slack.postMessage({ thread, text })' },
    ],
  },
  {
    id: 'okta',
    name: 'Okta',
    brand: '#007DC1',
    category: 'Identity + SSO',
    mode: 'sdk',
    modeNote: 'Okta API via Cursor SDK',
    scenario: {
      headline: repl('Joiners, movers, leavers handled as PRs, not tickets.'),
      subheadline: repl(
        'A {{ACCOUNT}} hire-event lands on the Okta webhook. Cursor opens a PR adding the user to the right groups, the manager reviews, the change rolls out via API.'
      ),
      steps: [
        { label: 'Receive event', detail: 'Webhook fires on hire / mover / leaver', code: 'okta.on("user.lifecycle.create", handler)' },
        { label: 'Lookup mapping', detail: 'Find role-to-group mapping in the repo', code: 'await cursor.search({ file: "roles.yaml" })' },
        { label: 'Plan changes', detail: 'Diff intended state against current Okta state', code: 'await cursor.plan.fromMapping(map)' },
        { label: 'Open PR', detail: 'Manager reviews, approves the change', code: 'await github.openPullRequest(plan.pr)' },
        { label: 'Apply via API', detail: 'On merge, push the changes to Okta', code: 'await okta.groups.apply(plan.changes)' },
      ],
      outcomes: [
        'Access changes are reviewable PRs, not console clicks',
        'Audit trail in Git',
        'Manager-approved, not IT-bottlenecked',
      ],
    },
    composerSteps: [
      { label: 'Apply Okta group changes', detail: 'Push membership changes via API', code: 'await okta.groups.apply(plan.changes)' },
    ],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    brand: '#00ED64',
    logo: '/logos/mongodb-wordmark-light.svg',
    category: 'Operational data',
    mode: 'mcp',
    modeNote: 'MongoDB MCP server',
    scenario: {
      headline: repl('Indexes designed against the actual query workload.'),
      subheadline: repl(
        'Cursor reads {{ACCOUNT}}\'s slow-query profile through MongoDB MCP, proposes indexes, validates them against a representative sample, and ships a migration.'
      ),
      steps: [
        { label: 'Pull slow queries', detail: 'Sample the slowest queries from the profile', code: 'await mongo.getSlowQueries({ limit: 50 })' },
        { label: 'Propose indexes', detail: 'Pick covering indexes that minimize bloat', code: 'await cursor.plan.indexes(queries)' },
        { label: 'Validate', detail: 'Build indexes on a sample, measure swing', code: 'await mongo.benchmark({ before, after })' },
        { label: 'Ship migration', detail: 'Emit a migration script with rollback', code: 'await cursor.editor.write(plan.migration)' },
        { label: 'Open PR', detail: 'Submit the migration for DBA review', code: 'await github.openPullRequest(plan.pr)' },
      ],
      outcomes: [
        'Indexes match the real workload, not guesses',
        'Migration includes rollback',
        'p99 swings shown in the PR description',
      ],
    },
    composerSteps: [
      { label: 'Sample MongoDB profile', detail: 'Pull slow-query samples for analysis', code: 'await mongo.getSlowQueries({ limit: 50 })' },
    ],
  },
];

export const VENDOR_BY_ID: Record<string, Vendor> = Object.fromEntries(
  VENDORS.map(v => [v.id, v])
);

export function applyAccountName(text: string, account: string): string {
  return text.replaceAll('{{ACCOUNT}}', account);
}
