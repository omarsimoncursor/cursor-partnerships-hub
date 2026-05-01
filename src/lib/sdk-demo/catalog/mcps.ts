import type { Mcp, McpId } from '../types';

export const MCPS: Mcp[] = [
  {
    id: 'aws-mcp',
    name: 'aws-mcp',
    color: '#FF9900',
    pkg: '@aws/mcp',
    envVar: 'AWS_PROFILE',
    category: 'cloud',
  },
  {
    id: 'stripe-mcp',
    name: 'stripe-mcp',
    color: '#635BFF',
    pkg: '@stripe/mcp',
    envVar: 'STRIPE_API_KEY',
    category: 'devtools',
  },
  {
    id: 'vault-mcp',
    name: 'vault-mcp',
    color: '#FFEC6E',
    pkg: '@hashicorp/vault-mcp',
    envVar: 'VAULT_TOKEN',
    category: 'secrets',
  },
  {
    id: 'github-mcp',
    name: 'github-mcp',
    color: '#FFFFFF',
    pkg: '@github/mcp',
    envVar: 'GITHUB_TOKEN',
    category: 'devtools',
  },
  {
    id: 'slack-mcp',
    name: 'slack-mcp',
    color: '#4A154B',
    pkg: '@slack/mcp',
    envVar: 'SLACK_BOT_TOKEN',
    category: 'comms',
  },
  {
    id: 'jira-mcp',
    name: 'jira-mcp',
    color: '#4C9AFF',
    pkg: '@atlassian/jira-mcp',
    envVar: 'JIRA_API_TOKEN',
    category: 'comms',
  },
  {
    id: 'splunk-mcp',
    name: 'splunk-mcp',
    color: '#65A637',
    pkg: '@splunk/mcp',
    envVar: 'SPLUNK_HEC_TOKEN',
    category: 'security',
  },
  {
    id: 'okta-mcp',
    name: 'okta-mcp',
    color: '#1C82E1',
    pkg: '@okta/mcp',
    envVar: 'OKTA_API_TOKEN',
    category: 'identity',
  },
  {
    id: 'zscaler-mcp',
    name: 'zscaler-mcp',
    color: '#0099CC',
    pkg: '@zscaler/mcp',
    envVar: 'ZSCALER_API_KEY',
    category: 'network',
  },
  {
    id: 'crowdstrike-mcp',
    name: 'crowdstrike-mcp',
    color: '#FF0033',
    pkg: '@crowdstrike/falcon-mcp',
    envVar: 'FALCON_CLIENT_SECRET',
    category: 'security',
  },
  {
    id: 'wiz-mcp',
    name: 'wiz-mcp',
    color: '#3F2EFF',
    pkg: '@wiz/mcp',
    envVar: 'WIZ_CLIENT_SECRET',
    category: 'security',
  },
  {
    id: 'snyk-mcp',
    name: 'snyk-mcp',
    color: '#A06CD5',
    pkg: '@snyk/mcp',
    envVar: 'SNYK_TOKEN',
    category: 'security',
  },
  {
    id: 'gitguardian-mcp',
    name: 'gitguardian-mcp',
    color: '#1F8FFF',
    pkg: '@gitguardian/mcp',
    envVar: 'GG_API_TOKEN',
    category: 'security',
  },
];

export function getMcp(id: McpId): Mcp | null {
  return MCPS.find((m) => m.id === id) ?? null;
}

/**
 * Canonical MCP ordering used by the code panel and runtime so toggling
 * actions produces stable, diff-friendly output.
 */
const MCP_ORDER: McpId[] = [
  'aws-mcp',
  'stripe-mcp',
  'vault-mcp',
  'okta-mcp',
  'crowdstrike-mcp',
  'zscaler-mcp',
  'wiz-mcp',
  'snyk-mcp',
  'gitguardian-mcp',
  'github-mcp',
  'jira-mcp',
  'slack-mcp',
  'splunk-mcp',
];

/**
 * Effective MCP set: union of action-derived MCPs and user-pinned
 * MCPs, minus MCPs the user has explicitly excluded.
 *
 * This is the single source of truth for "which MCPs does this
 * workflow hand to the agent". Computed whenever any of the inputs
 * change so toggling an action off immediately removes its MCPs
 * from the code panel (unless the user has also pinned them
 * manually).
 */
export function computeEffectiveMcps(
  derivedFromActions: McpId[],
  pinned: McpId[],
  excluded: McpId[],
): McpId[] {
  const include = new Set<McpId>([...derivedFromActions, ...pinned]);
  for (const e of excluded) include.delete(e);
  return MCP_ORDER.filter((id) => include.has(id));
}
