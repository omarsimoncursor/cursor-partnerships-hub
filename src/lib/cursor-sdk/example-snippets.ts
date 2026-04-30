/**
 * The exact TypeScript shown in `SDKCodePanel`. Kept in a separate file so
 * the snippet is testable as real source if we ever want to compile it
 * against `@cursor/february` directly.
 */

export const PRE_MERGE_GATE_SNIPPET = `import { Agent } from "@cursor/february/agent";
import { buildSecurityGatePrompt } from "./prompts";

// Stage 3 — pre-merge security gate. Runs from CI on every PR that
// touches a path Snyk has flagged in the last 90 days.
const agent = Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2" },
  cloud: {
    repos: [
      {
        url: "https://github.com/cursor-demos/cursor-for-enterprise",
        prUrl: process.env.GITHUB_PR_URL!,
      },
    ],
  },
  mcpServers: {
    snyk: { type: "http", url: "https://mcp.snyk.io/v1" },
    jira: { type: "http", url: "https://mcp.atlassian.com/v1" },
  },
});

const run = await agent.send(buildSecurityGatePrompt({
  issueId: "SNYK-JS-CUSTOMER-PROFILE-001",
  cwe: "CWE-943",
  cvss: 9.8,
}));

for await (const event of run.stream()) {
  switch (event.type) {
    case "tool_call":  recordToolSpan(event); break;
    case "status":     updateGateStatus(event.status); break;
    case "assistant":  forwardToCIComment(event.message); break;
  }
}

const result = await run.wait();
process.exit(result.status === "FINISHED" ? 0 : 1);
`;

export const NIGHTLY_RESCAN_SNIPPET = `import { Agent } from "@cursor/february/agent";

// Stage 4 — nightly Snyk re-scan. Resumes the durable agent so the
// next morning's PR carries the conversation context from the last run.
const agent = Agent.resume(process.env.CURSOR_AGENT_ID!, {
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: "composer-2" },
  cloud: { repos: [{ url: REPO_URL, startingRef: "main" }] },
});

await agent.send(\`Re-run snyk test against main; open a PR for any new \\
  critical or high finding using yesterday's gate prompt.\`);
`;

export const PROD_WEBHOOK_SNIPPET = `// Stage 5 — production safety net. The legacy /api/snyk-webhook route
// keeps working unchanged: when something slips past stages 1-4, the
// Snyk webhook hits the same buildSecurityGatePrompt and opens a PR.
await fetch("https://api.cursor.com/v1/agents", {
  method: "POST",
  headers: { Authorization: \`Basic \${btoa(process.env.CURSOR_API_KEY + ":")}\` },
  body: JSON.stringify({
    prompt: { text: buildSecurityGatePrompt(payload) },
    model: { id: "composer-2" },
    repos: [{ url: REPO_URL, startingRef: "main" }],
    autoCreatePR: true,
  }),
});
`;
