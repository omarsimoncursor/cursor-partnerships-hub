import type { ActionId, ToolId, Workflow } from '../types';

export interface CuratedWorkflow {
  id: string;
  title: string;
  description: string;
  /** One-sentence layman description of what's actually happening / went wrong. */
  scenarioPlain: string;
  /** One-sentence layman description of what the agent does about it. */
  remediationPlain: string;
  workflow: Workflow;
}

/**
 * For each tool, the response actions a real responder would reach for first.
 * Surfaces in the action picker as a "Recommended" pill so a presenter can
 * point an audience at the right combinations without clicking blind.
 *
 * Sourced from the curated workflows above plus extensions for tools that
 * don't have a curated workflow yet.
 */
export const RECOMMENDED_ACTIONS_BY_TOOL: Record<ToolId, ActionId[]> = {
  gitguardian: [
    'rotate-aws-key',
    'roll-stripe-key',
    'publish-to-vault',
    'open-cleanup-pr',
    'open-history-purge-pr-draft',
    'file-jira',
    'post-to-slack',
    'emit-splunk-audit-event',
  ],
  wiz: [
    'enable-bucket-block',
    'narrow-iam-policy',
    'open-cleanup-pr',
    'file-jira',
    'post-to-slack',
  ],
  snyk: [
    'bump-dependency',
    'open-cleanup-pr',
    'file-jira',
    'post-to-slack',
  ],
  crowdstrike: [
    'quarantine-host',
    'open-cleanup-pr',
    'file-jira',
    'emit-splunk-audit-event',
    'post-to-slack',
  ],
  okta: [
    'revoke-okta-sessions',
    'file-jira',
    'emit-splunk-audit-event',
    'post-to-slack',
  ],
  splunk: [
    'file-jira',
    'post-to-slack',
    'emit-splunk-audit-event',
  ],
  zscaler: [
    'block-egress',
    'file-jira',
    'post-to-slack',
    'emit-splunk-audit-event',
  ],
  vanta: [
    'enable-bucket-block',
    'narrow-iam-policy',
    'open-cleanup-pr',
    'file-jira',
  ],
};

export function getRecommendedActions(toolId: ToolId | null): ActionId[] {
  if (!toolId) return [];
  return RECOMMENDED_ACTIONS_BY_TOOL[toolId] ?? [];
}

export const CURATED_WORKFLOWS: CuratedWorkflow[] = [
  {
    id: 'starter-gg',
    title: 'Leaked AWS + Stripe credential, full containment',
    description: 'GitGuardian detects, Cursor rotates AWS, rolls Stripe, publishes to Vault, opens cleanup PR + draft history-purge PR, files Jira, posts Slack, emits Splunk audit event.',
    scenarioPlain:
      'A developer accidentally pasted a real AWS key and a real Stripe key into a config file and pushed it to GitHub. Attackers scrape public repos for keys like these in under a minute.',
    remediationPlain:
      'The agent immediately turns off the leaked keys with the cloud providers, mints replacements into the company\u2019s secret manager so the running app keeps working, opens a code change request that scrubs the bad code, and notifies the security team in Slack and Jira with a complete audit trail.',
    workflow: {
      toolId: 'gitguardian',
      eventId: 'gg-secret-exposed',
      actionIds: [
        'rotate-aws-key',
        'roll-stripe-key',
        'publish-to-vault',
        'open-cleanup-pr',
        'open-history-purge-pr-draft',
        'file-jira',
        'post-to-slack',
        'emit-splunk-audit-event',
      ],
      mcpIds: [
        'gitguardian-mcp',
        'aws-mcp',
        'stripe-mcp',
        'vault-mcp',
        'github-mcp',
        'jira-mcp',
        'slack-mcp',
        'splunk-mcp',
      ],
    },
  },
  {
    id: 'starter-wiz',
    title: 'Public S3 bucket holding PII, locked down via IaC PR',
    description: 'Wiz fires CRITICAL, Cursor toggles PublicAccessBlock, narrows IAM, rewrites the Terraform module, opens PR, files Jira, posts Slack.',
    scenarioPlain:
      'Wiz noticed an Amazon S3 storage bucket holding 1.4 GB of customer data is misconfigured and readable by anyone on the internet.',
    remediationPlain:
      'The agent flips the bucket private right now, then opens a code change request that fixes the underlying infrastructure code so the bucket can\u2019t drift back to public, plus a Jira ticket and Slack post for the security team.',
    workflow: {
      toolId: 'wiz',
      eventId: 'wiz-issue-critical',
      actionIds: [
        'enable-bucket-block',
        'narrow-iam-policy',
        'open-cleanup-pr',
        'file-jira',
        'post-to-slack',
      ],
      mcpIds: ['wiz-mcp', 'aws-mcp', 'github-mcp', 'jira-mcp', 'slack-mcp'],
    },
  },
  {
    id: 'starter-okta',
    title: 'Identity-compromise pattern, contained + audited',
    description: 'Okta fires impossible-travel auth.anomaly, Cursor revokes sessions, audits last 24h of commits, tightens main branch protection, files Jira, indexes Splunk audit event, posts Slack.',
    scenarioPlain:
      'An employee\u2019s account just signed in from Berlin and Mumbai inside seven minutes. That\u2019s physically impossible \u2014 likely a stolen account.',
    remediationPlain:
      'The agent signs the user out of every app immediately, audits everything they pushed to GitHub in the last day to make sure nothing malicious slipped in, tightens the main branch so attackers can\u2019t merge code while triage is happening, and files a P0 Jira for the security team to verify before reactivating.',
    workflow: {
      toolId: 'okta',
      eventId: 'okta-auth-anomaly',
      actionIds: [
        'revoke-okta-sessions',
        'file-jira',
        'emit-splunk-audit-event',
        'post-to-slack',
      ],
      mcpIds: ['okta-mcp', 'github-mcp', 'jira-mcp', 'splunk-mcp', 'slack-mcp'],
    },
  },
  {
    id: 'starter-snyk',
    title: 'CRITICAL CVE in dependency, bumped + verified',
    description: 'Snyk fires CVE-2026-1428, Cursor bumps the version, runs the test suite, opens cleanup PR, files Jira, posts Slack.',
    scenarioPlain:
      'A library the company\u2019s payments code depends on was just disclosed to have a critical security flaw an attacker could use to take over the server.',
    remediationPlain:
      'The agent upgrades the library to the safe version, runs the entire test suite to prove nothing broke, runs Snyk again to prove the issue is gone, then opens a code change request a human just needs to click Merge on.',
    workflow: {
      toolId: 'snyk',
      eventId: 'snyk-vuln-critical',
      actionIds: ['bump-dependency', 'open-cleanup-pr', 'file-jira', 'post-to-slack'],
      mcpIds: ['snyk-mcp', 'github-mcp', 'jira-mcp', 'slack-mcp'],
    },
  },
  {
    id: 'starter-cs',
    title: 'Endpoint detection traced to a typosquat, contained + reverted',
    description: 'CrowdStrike fires HIGH detection, Cursor contains the host, audits the developer\u2019s recent commits, removes the typosquatted package, opens PR, files Jira, indexes Splunk, posts Slack.',
    scenarioPlain:
      'CrowdStrike caught a developer\u2019s laptop running suspicious code right after they installed what looked like a normal open-source package \u2014 actually a fake lookalike name.',
    remediationPlain:
      'The agent isolates the laptop from the network, traces it back to the bad package the developer added in their last commit, removes the package, locks down the affected branch so it can\u2019t be merged, and writes the whole story into Jira and Splunk for the security team.',
    workflow: {
      toolId: 'crowdstrike',
      eventId: 'cs-detection-high',
      actionIds: [
        'quarantine-host',
        'open-cleanup-pr',
        'file-jira',
        'emit-splunk-audit-event',
        'post-to-slack',
      ],
      mcpIds: [
        'crowdstrike-mcp',
        'github-mcp',
        'jira-mcp',
        'splunk-mcp',
        'slack-mcp',
      ],
    },
  },
];
