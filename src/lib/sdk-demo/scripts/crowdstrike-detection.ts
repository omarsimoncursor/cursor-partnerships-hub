import type { RuntimeStep } from '../types';

export const CROWDSTRIKE_DETECTION_SCRIPT: RuntimeStep[] = [
  {
    channel: 'sdk',
    delayMs: 250,
    label: 'Webhook received from CrowdStrike Falcon',
    detail: 'POST /webhooks/crowdstrike · HIGH · suspicious npm postinstall',
    sdkEvent: { type: 'agent.create', payload: 'model: composer-2 · 6 MCPs configured' },
  },
  {
    channel: 'sdk',
    delayMs: 200,
    label: 'agent.send() — agent-bc-c08a17be',
    detail: 'cloud.repos: acme/orders-api@main',
    sdkEvent: { type: 'agent.send', payload: 'agentId=bc-c08a17be · status=PENDING' },
  },
  {
    channel: 'sdk',
    delayMs: 350,
    label: 'status.change → RUNNING',
    detail: 'workspace provisioned',
    sdkEvent: { type: 'status.change', payload: 'PENDING → RUNNING' },
  },

  {
    channel: 'crowdstrike',
    delayMs: 500,
    label: 'detects.get(detection_id)',
    detail: 'host: laptop-jess-mbp · process: node → bash → curl evil.example.test',
    sdkEvent: { type: 'tool.call', payload: 'crowdstrike-mcp · detects.get(ldt:abc123)' },
  },
  {
    channel: 'crowdstrike',
    delayMs: 380,
    label: 'process tree extracted',
    detail: 'parent: npm install · child npm script: postinstall · grandchild: bash → curl',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 5-deep process tree' },
  },

  {
    channel: 'opus',
    delayMs: 800,
    label: 'Claude Opus: planning containment + audit',
    detail: 'Step 1: contain host. Step 2: identify offending package. Step 3: revert if pushed.',
    sdkEvent: { type: 'assistant', payload: '"Contain laptop, audit npm tree, scan recent commits."' },
  },

  {
    channel: 'crowdstrike',
    delayMs: 500,
    label: 'devices.actions.contain(laptop-jess-mbp)',
    detail: 'host placed in network containment · only Falcon C2 reachable',
    sdkEvent: { type: 'tool.call', payload: 'crowdstrike-mcp · devices.actions(contain)' },
  },
  {
    channel: 'crowdstrike',
    delayMs: 280,
    label: 'host contained',
    detail: 'all egress blocked except Falcon · responder can still investigate',
    sdkEvent: { type: 'tool.result', payload: '202 Accepted · 277ms' },
  },

  {
    channel: 'github',
    delayMs: 500,
    label: 'commits.list(committer=jess.lin, since=4h)',
    detail: 'auditing whether the laptop pushed anything during the suspicious window',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · search.commits(...)' },
  },
  {
    channel: 'github',
    delayMs: 380,
    label: '1 commit found · feat/checkout-promo',
    detail: 'package.json modified · added @colors/colorz@^1.0.0 (typosquat)',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 1 commit · 1 dep added' },
  },

  {
    channel: 'opus',
    delayMs: 600,
    label: 'Codex: typosquat confirmed',
    detail: '@colors/colorz published 6h ago · author has 0 reputation · 18 weekly downloads',
    sdkEvent: { type: 'assistant', payload: '"Typosquat of @colors/colors. Treat as malicious."' },
  },

  {
    channel: 'composer',
    delayMs: 600,
    label: 'Composer: removing the typosquat',
    detail: 'reverting package.json + package-lock to remove @colors/colorz',
    sdkEvent: { type: 'assistant', payload: 'edit package.json · edit package-lock.json' },
  },
  {
    channel: 'shell',
    delayMs: 700,
    label: 'npm ci',
    detail: '✓ 411 packages installed in 6.8s · @colors/colorz absent',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 6809ms' },
  },
  {
    channel: 'shell',
    delayMs: 600,
    label: 'npm test',
    detail: '✓ 287 tests passed',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 5912ms' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'branch.create(security/remove-typosquat-colorz)',
    detail: 'base: main · author: cursor-agent',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · git.refs.create(...)' },
  },
  {
    channel: 'github',
    delayMs: 450,
    label: 'pulls.create #4422',
    detail: '"security: remove typosquat @colors/colorz (Falcon ldt:abc123)"',
    sdkEvent: { type: 'tool.result', payload: '201 Created · #4422' },
  },
  {
    channel: 'github',
    delayMs: 380,
    label: 'feat/checkout-promo branch quarantined',
    detail: 'protected ref · all merges blocked pending human review',
    sdkEvent: { type: 'tool.result', payload: '200 OK · branch_protection.update' },
  },

  {
    channel: 'jira',
    delayMs: 500,
    label: 'Creating CUR-SEC-2289',
    detail: 'P1 · Security incident · components: orders-api, endpoint, dependencies',
    sdkEvent: { type: 'tool.call', payload: 'jira-mcp · issues.create(...)' },
  },
  {
    channel: 'jira',
    delayMs: 320,
    label: 'CUR-SEC-2289 → Awaiting Review',
    detail: 'linked: Falcon ldt:abc123 · PR #4422 · branch quarantine',
    sdkEvent: { type: 'tool.result', payload: '200 OK · status transitioned' },
  },

  {
    channel: 'splunk',
    delayMs: 480,
    label: 'hec.event(supply_chain.contained)',
    detail: 'index: security_audit · sourcetype: cursor:agent:run',
    sdkEvent: { type: 'tool.call', payload: 'splunk-mcp · services.collector.event(...)' },
  },
  {
    channel: 'slack',
    delayMs: 480,
    label: 'chat.postMessage(#security-incidents)',
    detail: 'structured summary · @on-call paged · laptop containment status linked',
    sdkEvent: { type: 'tool.call', payload: 'slack-mcp · chat.postMessage(...)' },
  },

  {
    channel: 'sdk',
    delayMs: 350,
    label: 'step.complete · all 21 steps emitted',
    detail: 'cumulative billed time: 44.6s · wall time: 16.1s',
    sdkEvent: { type: 'step.complete', payload: 'final step · agent ready to wait()' },
  },
  {
    channel: 'done',
    delayMs: 280,
    label: 'agent.wait() → { status: "FINISHED" }',
    detail: 'host contained · typosquat removed · awaiting review',
    sdkEvent: { type: 'agent.wait', payload: 'status: FINISHED · 4 artifacts' },
  },
];
