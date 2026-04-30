import type { McpId, Workflow } from '../types';
import { getMcp } from '../catalog/mcps';
import { getEvent } from '../catalog/events';
import { getTool } from '../catalog/tools';
import { generateAgentPrompt } from './generate-prompt';

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

function sortMcps(ids: McpId[]): McpId[] {
  const set = new Set(ids);
  return MCP_ORDER.filter((id) => set.has(id));
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s
    .split('\n')
    .map((line) => (line.length === 0 ? line : pad + line))
    .join('\n');
}

export function generateSdkCode(workflow: Workflow): string {
  const tool = getTool(workflow.toolId);
  const event = getEvent(workflow.eventId);

  if (!tool || !event) {
    return EMPTY_PLACEHOLDER;
  }

  const sortedMcps = sortMcps(workflow.mcpIds);
  const mcpLines = sortedMcps
    .map((id) => getMcp(id))
    .filter((m): m is NonNullable<ReturnType<typeof getMcp>> => m !== null)
    .map(
      (m) =>
        `    { name: '${m.name}', package: '${m.pkg}', env: { token: process.env.${m.envVar}! } },`,
    )
    .join('\n');

  const promptText = generateAgentPrompt(workflow);
  const promptLiteral = indent(promptText.trim(), 4);

  const handlerName = `handle${pascal(tool.id)}Webhook`;
  const route = `/webhooks/${tool.id}`;

  const verifyFn = `verify${pascal(tool.id)}Signature`;

  return `import { Agent } from '@cursor/february/agent';
import express from 'express';
import { ${verifyFn} } from './security/${tool.id}';

const app = express();

app.post('${route}', express.json(), async (req, res) => {
  if (!${verifyFn}(req)) return res.sendStatus(401);

  const event = req.body as ${event.payloadType};

  const agent = Agent.create({
    apiKey: process.env.CURSOR_API_KEY!,
    model: { id: 'composer-2' },
    cloud: {
      repos: [
        { url: 'https://github.com/acme/payments-service', startingRef: 'main' },
      ],
    },
    mcps: [
${mcpLines}
    ],
  });

  const run = await agent.send(\`
${promptLiteral}
  \`, {
    onStep: ({ step }) => {
      forwardToAuditLog(agent.id, step);
    },
  });

  const result = await run.wait();
  res.json({ ok: true, agentId: agent.id, status: result.status });
});

async function ${handlerName}() {
  return app;
}

app.listen(3000);
`;
}

function pascal(s: string): string {
  return s
    .split(/[-_]/)
    .map((p) => (p.length === 0 ? '' : p[0].toUpperCase() + p.slice(1)))
    .join('');
}

const EMPTY_PLACEHOLDER = `import { Agent } from '@cursor/february/agent';

// Pick a tool, an event, and at least one action.
// The SDK code that powers this automation will appear here as you build.
//
// Cursor's SDK lets you run the same Background Agent that powers this hub
// from anywhere in your stack: webhooks, scheduled jobs, SOAR playbook
// steps, even Slack slash commands. The agent gets your MCPs, your
// repos, and your prompt, and ships work back as structured events you
// can index in your SIEM.
`;
