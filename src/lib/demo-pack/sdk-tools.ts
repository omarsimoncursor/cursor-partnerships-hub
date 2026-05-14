export type SdkToolDef = {
  id: string;
  label: string;
  category: 'cursor' | 'mcp' | 'integration';
  description: string;
};

/** Illustrative tool palette for the workflow composer (prospecting narrative). */
export const SDK_TOOL_CATALOG: SdkToolDef[] = [
  {
    id: 'read_file',
    label: 'read_file',
    category: 'cursor',
    description: 'Pull repository context into the agent context window.',
  },
  {
    id: 'edit_file',
    label: 'edit_file',
    category: 'cursor',
    description: 'Apply multi-hunk patches across the codebase.',
  },
  {
    id: 'run_terminal_cmd',
    label: 'run_terminal_cmd',
    category: 'cursor',
    description: 'Run tests, linters, and build steps in a sandboxed shell.',
  },
  {
    id: 'grep',
    label: 'grep',
    category: 'cursor',
    description: 'Fast ripgrep-style search across the workspace.',
  },
  {
    id: 'codebase_search',
    label: 'codebase_search',
    category: 'cursor',
    description: 'Semantic search to map behavior across modules.',
  },
  {
    id: 'mcp_datadog',
    label: 'MCP: Datadog',
    category: 'mcp',
    description: 'Query monitors, traces, and SLOs from the live stack.',
  },
  {
    id: 'mcp_figma',
    label: 'MCP: Figma',
    category: 'mcp',
    description: 'Read frames, components, and design tokens.',
  },
  {
    id: 'mcp_sentry',
    label: 'MCP: Sentry',
    category: 'mcp',
    description: 'Pull issue details, stack traces, and release metadata.',
  },
  {
    id: 'mcp_snowflake',
    label: 'MCP: Snowflake',
    category: 'mcp',
    description: 'Run governed SQL and inspect warehouse objects.',
  },
  {
    id: 'mcp_notion',
    label: 'MCP: Notion',
    category: 'mcp',
    description: 'Fetch specs, decision logs, and runbook pages.',
  },
  {
    id: 'web_fetch',
    label: 'web_fetch',
    category: 'integration',
    description: 'Retrieve internal docs portals or vendor status pages (allowlisted).',
  },
  {
    id: 'background_agent',
    label: 'Background Agent',
    category: 'cursor',
    description: 'Kick off long-running jobs with callbacks into the repo.',
  },
];

const toolById = new Map(SDK_TOOL_CATALOG.map(t => [t.id, t]));

export function getSdkTool(id: string): SdkToolDef | undefined {
  return toolById.get(id);
}
