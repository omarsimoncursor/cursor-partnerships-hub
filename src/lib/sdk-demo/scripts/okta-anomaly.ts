import type { RuntimeStep } from '../types';

export const OKTA_ANOMALY_SCRIPT: RuntimeStep[] = [
  {
    channel: 'sdk',
    delayMs: 250,
    label: 'Webhook received from Okta',
    detail: 'POST /webhooks/okta · auth.anomaly · impossible-travel',
    sdkEvent: { type: 'agent.create', payload: 'model: composer-2 · 5 MCPs configured' },
  },
  {
    channel: 'sdk',
    delayMs: 200,
    label: 'agent.send() — agent-bc-3e8b62a1',
    detail: 'cloud.repos: acme/payments-service@main',
    sdkEvent: { type: 'agent.send', payload: 'agentId=bc-3e8b62a1 · status=PENDING' },
  },
  {
    channel: 'sdk',
    delayMs: 350,
    label: 'status.change → RUNNING',
    detail: 'workspace provisioned',
    sdkEvent: { type: 'status.change', payload: 'PENDING → RUNNING' },
  },

  {
    channel: 'okta',
    delayMs: 500,
    label: 'systemLog.events.list(actor=jess.lin@acme)',
    detail: 'Berlin 02:14 UTC → Mumbai 02:21 UTC · impossible · 7m gap',
    sdkEvent: { type: 'tool.call', payload: 'okta-mcp · systemLog.events.list(...)' },
  },
  {
    channel: 'okta',
    delayMs: 350,
    label: 'Both events succeeded MFA',
    detail: '2 push approvals on 2 different devices · neither device known good',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 8 events scanned' },
  },

  {
    channel: 'opus',
    delayMs: 800,
    label: 'Claude Opus: triaging',
    detail: 'High likelihood: account compromise · Step 1: revoke sessions',
    sdkEvent: { type: 'assistant', payload: '"Treating as compromise. Revoke immediately, then audit recent commits."' },
  },

  {
    channel: 'okta',
    delayMs: 500,
    label: 'users.sessions.delete()',
    detail: 'all sessions for jess.lin@acme revoked · step-up MFA required on next sign-in',
    sdkEvent: { type: 'tool.call', payload: 'okta-mcp · users.sessions.delete(jess.lin@acme)' },
  },
  {
    channel: 'okta',
    delayMs: 280,
    label: 'OAuth tokens revoked',
    detail: '7 active grants revoked across 4 apps',
    sdkEvent: { type: 'tool.result', payload: '204 No Content · 277ms' },
  },

  {
    channel: 'github',
    delayMs: 500,
    label: 'commits.list(author=jess.lin, since=24h)',
    detail: 'auditing recent activity from compromised identity',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · search.commits(...)' },
  },
  {
    channel: 'github',
    delayMs: 380,
    label: '3 commits in last 24h · all to feature branches',
    detail: 'no commits to main · no PRs merged · no signed releases',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 3 commits · 0 to protected refs' },
  },

  {
    channel: 'opus',
    delayMs: 600,
    label: 'Codex: scanning 3 commits for malicious diffs',
    detail: 'all 3 read benign · no embedded secrets · no suspicious dependency adds',
    sdkEvent: { type: 'assistant', payload: '"All 3 commits read clean. Nothing to revert."' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'branch_protection.update(main, require_signed_commits=true)',
    detail: 'tightening main branch protection until human approves user reactivation',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · repos.update_branch_protection(...)' },
  },
  {
    channel: 'github',
    delayMs: 320,
    label: 'main branch tightened',
    detail: 'signed commits required · admin enforcement on',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 318ms' },
  },

  {
    channel: 'jira',
    delayMs: 500,
    label: 'Creating CUR-SEC-2241',
    detail: 'P0 · Security incident · components: identity, payments-service',
    sdkEvent: { type: 'tool.call', payload: 'jira-mcp · issues.create(...)' },
  },
  {
    channel: 'jira',
    delayMs: 320,
    label: 'CUR-SEC-2241 → Awaiting Human Triage',
    detail: 'assignee: @security-on-call · linked: Okta event 0c4f… · 3 commits',
    sdkEvent: { type: 'tool.result', payload: '200 OK · status transitioned' },
  },

  {
    channel: 'splunk',
    delayMs: 480,
    label: 'hec.event(account.suspected_compromise)',
    detail: 'index: security_audit · sourcetype: cursor:agent:run',
    sdkEvent: { type: 'tool.call', payload: 'splunk-mcp · services.collector.event(...)' },
  },
  {
    channel: 'splunk',
    delayMs: 280,
    label: 'event indexed · correlation hit',
    detail: 'matched against active correlation: Identity-Compromise-Pattern-A',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 277ms · notable created' },
  },

  {
    channel: 'slack',
    delayMs: 480,
    label: 'chat.postMessage(#security-incidents)',
    detail: 'structured summary · @security-on-call paged · awaiting human reactivation decision',
    sdkEvent: { type: 'tool.call', payload: 'slack-mcp · chat.postMessage(...)' },
  },

  {
    channel: 'sdk',
    delayMs: 350,
    label: 'step.complete · all 19 steps emitted',
    detail: 'cumulative billed time: 41.0s · wall time: 14.2s',
    sdkEvent: { type: 'step.complete', payload: 'final step · agent ready to wait()' },
  },
  {
    channel: 'done',
    delayMs: 280,
    label: 'agent.wait() → { status: "FINISHED" }',
    detail: 'containment complete · awaiting human triage of identity status',
    sdkEvent: { type: 'agent.wait', payload: 'status: FINISHED · 4 artifacts' },
  },
];
