import type { RuntimeStep } from '../types';

export const SNYK_VULN_SCRIPT: RuntimeStep[] = [
  {
    channel: 'sdk',
    delayMs: 250,
    label: 'Webhook received from Snyk',
    detail: 'POST /webhooks/snyk · CRITICAL · CVE-2026-1428 · @acme/orders-api',
    sdkEvent: { type: 'agent.create', payload: 'model: composer-2 · 4 MCPs configured' },
  },
  {
    channel: 'sdk',
    delayMs: 200,
    label: 'agent.send() — agent-bc-91d4f6c0',
    detail: 'cloud.repos: acme/orders-api@main',
    sdkEvent: { type: 'agent.send', payload: 'agentId=bc-91d4f6c0 · status=PENDING' },
  },
  {
    channel: 'sdk',
    delayMs: 350,
    label: 'status.change → RUNNING',
    detail: 'workspace provisioned',
    sdkEvent: { type: 'status.change', payload: 'PENDING → RUNNING' },
  },

  {
    channel: 'snyk',
    delayMs: 500,
    label: 'Fetching vulnerability detail',
    detail: 'CVE-2026-1428 · prototype pollution in lodash@4.17.20 · CVSS 9.8',
    sdkEvent: { type: 'tool.call', payload: 'snyk-mcp · vulnerabilities.get(CVE-2026-1428)' },
  },
  {
    channel: 'snyk',
    delayMs: 400,
    label: 'Reachability: confirmed exploitable',
    detail: '_.merge call site in src/api/orders.ts · request body untrusted · path: high',
    sdkEvent: { type: 'tool.result', payload: '200 OK · reachable=true · exploitability=high' },
  },

  {
    channel: 'opus',
    delayMs: 800,
    label: 'Claude Opus: planning upgrade',
    detail: 'Patched in lodash@4.17.21 · semver-compatible · 0 callers need refactor',
    sdkEvent: { type: 'assistant', payload: '"Patch via 4.17.21 bump. No breaking changes."' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'reading package.json + package-lock.json',
    detail: '8412 lines · current lodash version: 4.17.20',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · contents.get(...)' },
  },
  {
    channel: 'composer',
    delayMs: 700,
    label: 'Composer: bumping lodash to 4.17.21',
    detail: 'package.json + lockfile updated · 1 transitive impact in @acme/utils',
    sdkEvent: { type: 'assistant', payload: 'edit package.json · edit package-lock.json' },
  },
  {
    channel: 'composer',
    delayMs: 500,
    label: 'No caller refactor required',
    detail: '_.merge signature unchanged · prototype-pollution patch is internal',
    sdkEvent: { type: 'assistant', payload: '"Inner _.merge fix only. No public surface change."' },
  },
  {
    channel: 'codex',
    delayMs: 600,
    label: 'Codex review · ✓ patch is minimal',
    detail: '2 files changed · +3 -3 · no logic edits',
    sdkEvent: { type: 'assistant', payload: '"Reviewed. Tight, correct upgrade."' },
  },

  {
    channel: 'shell',
    delayMs: 800,
    label: 'npm ci',
    detail: '✓ 412 packages installed in 7.9s',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 7913ms' },
  },
  {
    channel: 'shell',
    delayMs: 1100,
    label: 'npm test',
    detail: '✓ 287 tests passed · 0 failed · coverage 84.2%',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 11003ms' },
  },
  {
    channel: 'shell',
    delayMs: 600,
    label: 'snyk test --severity-threshold=high',
    detail: '✓ no high/critical vulnerabilities remaining',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 597ms' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'branch.create(security/bump-lodash-cve-2026-1428)',
    detail: 'base: main · author: cursor-agent',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · git.refs.create(...)' },
  },
  {
    channel: 'github',
    delayMs: 450,
    label: 'pulls.create #4419',
    detail: '"security: bump lodash to 4.17.21 (CVE-2026-1428, CVSS 9.8)"',
    sdkEvent: { type: 'tool.result', payload: '201 Created · #4419' },
  },

  {
    channel: 'jira',
    delayMs: 500,
    label: 'Creating CUR-SEC-2266',
    detail: 'P0 · Security incident · components: orders-api, dependencies',
    sdkEvent: { type: 'tool.call', payload: 'jira-mcp · issues.create(...)' },
  },
  {
    channel: 'jira',
    delayMs: 320,
    label: 'CUR-SEC-2266 → Awaiting Review',
    detail: 'linked: Snyk CVE-2026-1428 · PR #4419',
    sdkEvent: { type: 'tool.result', payload: '200 OK · status transitioned' },
  },

  {
    channel: 'slack',
    delayMs: 480,
    label: 'chat.postMessage(#security-incidents)',
    detail: 'CVE summary · upgrade verified · awaiting AppSec review',
    sdkEvent: { type: 'tool.call', payload: 'slack-mcp · chat.postMessage(...)' },
  },

  {
    channel: 'sdk',
    delayMs: 350,
    label: 'step.complete · all 18 steps emitted',
    detail: 'cumulative billed time: 39.4s · wall time: 13.6s',
    sdkEvent: { type: 'step.complete', payload: 'final step · agent ready to wait()' },
  },
  {
    channel: 'done',
    delayMs: 280,
    label: 'agent.wait() → { status: "FINISHED" }',
    detail: 'PR ready for AppSec review · tests green · Snyk scan clean',
    sdkEvent: { type: 'agent.wait', payload: 'status: FINISHED · 4 artifacts' },
  },
];
