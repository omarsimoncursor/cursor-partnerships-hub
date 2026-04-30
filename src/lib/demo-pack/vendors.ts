export type DemoVendorKind = 'live_demo' | 'narrative' | 'sdk_only';

export type DemoVendor = {
  id: string;
  name: string;
  kind: DemoVendorKind;
  /** Internal partnership demo path when available */
  demoHref?: string;
  narrativeHref?: string;
  color: string;
  letter: string;
  blurb: string;
};

export const DEMO_VENDORS: DemoVendor[] = [
  {
    id: 'datadog',
    name: 'Datadog',
    kind: 'live_demo',
    demoHref: '/partnerships/datadog/demo',
    narrativeHref: '/partnerships/datadog',
    color: '#632CA6',
    letter: 'D',
    blurb: 'Observability signals drive agentic triage, code changes, and PRs via MCP.',
  },
  {
    id: 'databricks',
    name: 'Databricks',
    kind: 'live_demo',
    demoHref: '/partnerships/databricks/demo',
    narrativeHref: '/partnerships/databricks',
    color: '#FF3621',
    letter: 'D',
    blurb: 'Lakehouse migration and data platform work automated end-to-end.',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    kind: 'live_demo',
    demoHref: '/partnerships/sentry/demo',
    narrativeHref: '/partnerships/sentry',
    color: '#362D59',
    letter: 'S',
    blurb: 'Production errors become scoped fixes and tests without context switching.',
  },
  {
    id: 'figma',
    name: 'Figma',
    kind: 'live_demo',
    demoHref: '/partnerships/figma/demo',
    narrativeHref: '/partnerships/figma',
    color: '#F24E1E',
    letter: 'F',
    blurb: 'Design handoff and component workflows through agent-accessible design context.',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    kind: 'live_demo',
    demoHref: '/partnerships/snowflake/demo',
    narrativeHref: '/partnerships/snowflake',
    color: '#29B5E8',
    letter: 'S',
    blurb: 'Data platform and Snowflake-native artifacts orchestrated by the agent.',
  },
  {
    id: 'aws',
    name: 'AWS',
    kind: 'live_demo',
    demoHref: '/partnerships/aws/demo',
    narrativeHref: '/partnerships/aws',
    color: '#FF9900',
    letter: 'A',
    blurb: 'Modernization, infra, and cloud operations as repeatable agent playbooks.',
  },
  {
    id: 'github',
    name: 'GitHub',
    kind: 'narrative',
    narrativeHref: '/partnerships/github',
    color: '#238636',
    letter: 'G',
    blurb: 'PRs, reviews, and repo context as first-class agent inputs (narrative co-sell).',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    kind: 'narrative',
    narrativeHref: '/partnerships/gitlab',
    color: '#FC6D26',
    letter: 'G',
    blurb: 'Single DevOps platform flows pair naturally with agent-driven delivery.',
  },
  {
    id: 'notion',
    name: 'Notion',
    kind: 'sdk_only',
    color: '#000000',
    letter: 'N',
    blurb: 'Docs, specs, and runbooks as MCP-connected context for planning and execution.',
  },
  {
    id: 'snyk',
    name: 'Snyk',
    kind: 'sdk_only',
    color: '#4C49F3',
    letter: 'S',
    blurb: 'Security findings and dependency issues triaged with repo-local fixes via the agent.',
  },
  {
    id: 'zscaler',
    name: 'Zscaler',
    kind: 'sdk_only',
    color: '#0066CC',
    letter: 'Z',
    blurb: 'Policy and access patterns can be reflected in app config and automation using the SDK.',
  },
];

const byId = new Map(DEMO_VENDORS.map(v => [v.id, v]));

export function getVendor(id: string): DemoVendor | undefined {
  return byId.get(id);
}

export function listVendorsByIds(ids: string[]): DemoVendor[] {
  return ids.map(id => byId.get(id)).filter(Boolean) as DemoVendor[];
}
