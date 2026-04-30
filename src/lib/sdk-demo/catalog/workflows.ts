import type { Workflow } from '../types';

export interface CuratedWorkflow {
  id: string;
  title: string;
  description: string;
  workflow: Workflow;
}

export const CURATED_WORKFLOWS: CuratedWorkflow[] = [
  {
    id: 'starter-gg',
    title: 'Leaked AWS + Stripe credential, full containment',
    description: 'GitGuardian detects, Cursor rotates AWS, rolls Stripe, publishes to Vault, opens cleanup PR + draft history-purge PR, files Jira, posts Slack, emits Splunk audit event.',
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
