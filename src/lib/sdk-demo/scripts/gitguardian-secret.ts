import type { RuntimeStep } from '../types';

export const GITGUARDIAN_SECRET_SCRIPT: RuntimeStep[] = [
  {
    channel: 'sdk',
    delayMs: 250,
    label: 'Webhook received from GitGuardian',
    detail: 'POST /webhooks/gitguardian · 412 byte payload · signature verified',
    sdkEvent: { type: 'agent.create', payload: 'model: composer-2 · 7 MCPs configured' },
  },
  {
    channel: 'sdk',
    delayMs: 200,
    label: 'agent.send() — agent-bc-29f4d1a8',
    detail: 'prompt: 612 chars · cloud.repos: acme/payments-service@main',
    sdkEvent: { type: 'agent.send', payload: 'agentId=bc-29f4d1a8 · status=PENDING' },
  },
  {
    channel: 'sdk',
    delayMs: 350,
    label: 'status.change → RUNNING',
    detail: 'workspace provisioned · branch base captured',
    sdkEvent: { type: 'status.change', payload: 'PENDING → RUNNING' },
  },

  {
    channel: 'gitguardian',
    delayMs: 500,
    label: 'Fetching incident detail',
    detail: 'GET /incidents/41822 · 3 secrets exposed in payments-service',
    sdkEvent: { type: 'tool.call', payload: 'gitguardian-mcp · incidents.get(41822)' },
  },
  {
    channel: 'gitguardian',
    delayMs: 400,
    label: 'Owner resolved via Asset Graph',
    detail: 'team: payments-eng · service: payments-service · sha: f4e9a1c2',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 397ms · 3 matches' },
  },

  {
    channel: 'opus',
    delayMs: 800,
    label: 'Claude Opus: forming response plan',
    detail: 'Containment first · 3 secrets need rotation in parallel · cleanup PR after',
    sdkEvent: { type: 'assistant', payload: '"Plan: rotate AWS, roll Stripe, publish to Vault, then code cleanup."' },
  },

  {
    channel: 'aws',
    delayMs: 600,
    label: 'iam.create_access_key()',
    detail: 'user: payments-service-deploy · new key AKIAXXXXXXXXX1F4',
    sdkEvent: { type: 'tool.call', payload: 'aws-mcp · iam.create_access_key(user=payments-service-deploy)' },
  },
  {
    channel: 'aws',
    delayMs: 350,
    label: 'iam.update_access_key(status=Inactive)',
    detail: 'leaked key AKIAIOSFODNN7EXAMPLE marked Inactive',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 314ms' },
  },
  {
    channel: 'aws',
    delayMs: 450,
    label: 'organizations.attach_policy()',
    detail: 'explicit deny SCP attached at org root for leaked AccessKeyId',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 449ms' },
  },

  {
    channel: 'stripe',
    delayMs: 500,
    label: 'POST /v1/api_keys/{id}/roll',
    detail: 'replacement rk_live_*** captured',
    sdkEvent: { type: 'tool.call', payload: 'stripe-mcp · keys.roll(rk_live_…EXAMPLE)' },
  },
  {
    channel: 'stripe',
    delayMs: 250,
    label: 'Stripe restricted key rolled',
    detail: 'old key revocation propagated · 0s replication lag',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 248ms' },
  },

  {
    channel: 'vault',
    delayMs: 500,
    label: 'kv.write(payments-service/aws-access-key-id)',
    detail: 'version: 23 · path: secret/data/payments-service/aws-access-key-id',
    sdkEvent: { type: 'tool.call', payload: 'vault-mcp · kv.write(...)' },
  },
  {
    channel: 'vault',
    delayMs: 280,
    label: 'kv.write(payments-service/stripe-restricted-key)',
    detail: 'version: 14',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 278ms' },
  },

  {
    channel: 'composer',
    delayMs: 700,
    label: 'Composer: editing payments.ts',
    detail: 'replacing literals with getSecret() references',
    sdkEvent: { type: 'assistant', payload: 'edit payments.ts · 6 lines' },
  },
  {
    channel: 'composer',
    delayMs: 500,
    label: 'Adding .gitleaks.toml allowlist',
    detail: 'whitelisting AWS-published example credential pattern',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · contents.create(.gitleaks.toml)' },
  },
  {
    channel: 'codex',
    delayMs: 600,
    label: 'Codex review · ✓ no behavioral change',
    detail: 'types preserved · callers unaffected · style ✓',
    sdkEvent: { type: 'assistant', payload: '"Patch reviewed. Safe to ship."' },
  },

  {
    channel: 'shell',
    delayMs: 450,
    label: 'npx tsc --noEmit',
    detail: '✓ no type errors',
    sdkEvent: { type: 'tool.call', payload: 'shell · tsc --noEmit' },
  },
  {
    channel: 'shell',
    delayMs: 400,
    label: 'npm run lint',
    detail: '✓ 0 errors · 0 warnings',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 397ms' },
  },
  {
    channel: 'shell',
    delayMs: 500,
    label: 'gitleaks detect --no-banner',
    detail: '✓ 0 leaks · allowlist applied · 18 files scanned',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 488ms' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'branch.create(cleanup/secret-purge-payments-service)',
    detail: 'base: main · author: cursor-agent',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · git.refs.create(...)' },
  },
  {
    channel: 'github',
    delayMs: 450,
    label: 'pulls.create #3142',
    detail: '"chore(security): remove leaked credentials, source from Vault"',
    sdkEvent: { type: 'tool.result', payload: '201 Created · #3142' },
  },
  {
    channel: 'github',
    delayMs: 500,
    label: 'pulls.create #3143 (DRAFT)',
    detail: '"chore(security): purge leaked credentials from history (REQUIRES TEAM APPROVAL)"',
    sdkEvent: { type: 'tool.result', payload: '201 Created · #3143 · draft: true' },
  },

  {
    channel: 'jira',
    delayMs: 500,
    label: 'Creating CUR-SEC-2118',
    detail: 'P0 · Security incident · components: payments-service, IAM, Stripe, Vault',
    sdkEvent: { type: 'tool.call', payload: 'jira-mcp · issues.create(...)' },
  },
  {
    channel: 'jira',
    delayMs: 320,
    label: 'CUR-SEC-2118 → Awaiting Review',
    detail: 'linked: GG #41822 · PR #3142 · PR #3143 · Vault v23',
    sdkEvent: { type: 'tool.result', payload: '200 OK · status transitioned' },
  },

  {
    channel: 'slack',
    delayMs: 480,
    label: 'chat.postMessage(#security-incidents)',
    detail: 'structured incident summary · @on-call paged',
    sdkEvent: { type: 'tool.call', payload: 'slack-mcp · chat.postMessage(...)' },
  },
  {
    channel: 'splunk',
    delayMs: 320,
    label: 'hec.event(secret_leak.contained)',
    detail: 'index: security_audit · sourcetype: cursor:agent:run',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 318ms' },
  },

  {
    channel: 'gitguardian',
    delayMs: 350,
    label: 'incidents.update(status=resolved)',
    detail: 'incident 41822 closed · resolution attached',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 348ms' },
  },

  {
    channel: 'sdk',
    delayMs: 350,
    label: 'step.complete · all 27 steps emitted',
    detail: 'cumulative billed time: 58.0s · wall time: 22.4s',
    sdkEvent: { type: 'step.complete', payload: 'final step · agent ready to wait()' },
  },
  {
    channel: 'done',
    delayMs: 280,
    label: 'agent.wait() → { status: "FINISHED" }',
    detail: 'artifacts ready for review',
    sdkEvent: { type: 'agent.wait', payload: 'status: FINISHED · 5 artifacts' },
  },
];
