import type { Action, ActionId, ActionPhase } from '../types';

export const ACTIONS: Action[] = [
  {
    id: 'rotate-aws-key',
    label: 'Rotate AWS access key',
    phase: 'containment',
    blurb: 'Mint a replacement key, deactivate the leaked one, attach an explicit deny.',
    mcpsRequired: ['aws-mcp'],
    plainEnglish:
      'Make a new AWS key, turn the leaked one off, and add a rule blocking the leaked one even if someone tries to use it.',
    promptFragment:
      '1. Mint a replacement AWS access key for the affected IAM identity, mark the leaked key Inactive, and attach an explicit deny SCP at the org level keyed on the leaked AccessKeyId.',
  },
  {
    id: 'roll-stripe-key',
    label: 'Roll Stripe restricted key',
    phase: 'containment',
    blurb: 'Roll the restricted key via the Stripe API and propagate the new value.',
    mcpsRequired: ['stripe-mcp', 'vault-mcp'],
    plainEnglish:
      'Tell Stripe to mint a new payment-processing key and invalidate the leaked one.',
    promptFragment:
      '2. Roll the leaked Stripe restricted key via POST /v1/api_keys/{id}/roll and capture the replacement.',
  },
  {
    id: 'publish-to-vault',
    label: 'Publish replacements to Vault',
    phase: 'containment',
    blurb: 'Write the new credentials to the canonical Vault paths the service expects.',
    mcpsRequired: ['vault-mcp'],
    plainEnglish:
      'Save the new keys in the company\u2019s secret manager so the running app picks them up automatically.',
    promptFragment:
      '3. Publish every replacement credential to its canonical Vault path under payments-service/* and bump the version. Do not log the values.',
  },
  {
    id: 'revoke-okta-sessions',
    label: 'Revoke Okta sessions',
    phase: 'containment',
    blurb: 'Force-revoke all active sessions for the affected user identity.',
    mcpsRequired: ['okta-mcp'],
    plainEnglish:
      'Sign the suspected user out of every app and force them to re-authenticate.',
    promptFragment:
      '4. Force-revoke all active sessions for the user via Okta /api/v1/users/{id}/sessions DELETE and require re-authentication with step-up MFA.',
  },
  {
    id: 'quarantine-host',
    label: 'Quarantine endpoint',
    phase: 'containment',
    blurb: 'Place the affected device into Falcon network containment.',
    mcpsRequired: ['crowdstrike-mcp'],
    plainEnglish:
      'Cut the affected laptop off from the network so the threat can\u2019t spread.',
    promptFragment:
      '5. Place the affected host into CrowdStrike Falcon network containment via /devices/entities/devices-actions/v2 with action_name=contain.',
  },
  {
    id: 'block-egress',
    label: 'Block egress destination',
    phase: 'containment',
    blurb: 'Add a temporary Zscaler DLP block for the suspect destination.',
    mcpsRequired: ['zscaler-mcp'],
    plainEnglish:
      'Tell Zscaler to block traffic from your network to the bad destination.',
    promptFragment:
      '6. Add a temporary Zscaler URL filtering rule blocking the suspect egress destination, scoped to the affected org unit.',
  },
  {
    id: 'narrow-iam-policy',
    label: 'Narrow IAM policy',
    phase: 'containment',
    blurb: 'Replace overly-broad wildcards in the IAM policy with least-privilege scope.',
    mcpsRequired: ['aws-mcp', 'github-mcp'],
    plainEnglish:
      'Look at what the resource actually used in the last 30 days, then rewrite the policy to allow only that.',
    promptFragment:
      '7. Replace overly-broad Action and Resource wildcards in the offending IAM policy with the least-privilege scope inferred from CloudTrail usage over the last 30 days.',
  },
  {
    id: 'enable-bucket-block',
    label: 'Enable public-access block',
    phase: 'containment',
    blurb: 'Toggle public-access-block on the offending S3 bucket.',
    mcpsRequired: ['aws-mcp'],
    plainEnglish:
      'Flip the switch in AWS that makes a storage bucket private. Stops the leak now, fixes the code later.',
    promptFragment:
      '8. Enable PublicAccessBlock on the offending S3 bucket with all four sub-flags set to true, and remove any existing public bucket policies and ACLs.',
  },
  {
    id: 'open-cleanup-pr',
    label: 'Open cleanup PR',
    phase: 'remediation',
    blurb: 'Open a PR removing the literal / fixing the misconfiguration / bumping the dep.',
    mcpsRequired: ['github-mcp'],
    plainEnglish:
      'Open a code change request that removes the bad code and replaces it with the safe pattern. A human reviews and merges.',
    promptFragment:
      '9. Open a cleanup PR against main that removes the offending literal, swaps in getSecret() references, and adds the change to .gitleaks.toml. Do NOT auto-merge. Mark the PR as awaiting human review.',
  },
  {
    id: 'open-history-purge-pr-draft',
    label: 'Draft history-purge PR',
    phase: 'remediation',
    blurb: 'Run git filter-repo on a clone, force-push to a new branch, open a draft PR.',
    mcpsRequired: ['github-mcp'],
    plainEnglish:
      'Prepare a separate code change that scrubs the leaked secret from every old commit. Marked draft \u2014 humans must approve before it runs.',
    promptFragment:
      '10. In a workspace clone, run `git filter-repo --replace-text` against the leaked literal. Force-push the cleaned history to a NEW branch, never to main. Open a DRAFT PR that requires team approval before any force-push window. The agent must not merge or force-push to main.',
  },
  {
    id: 'bump-dependency',
    label: 'Bump vulnerable dependency',
    phase: 'remediation',
    blurb: 'Update package.json + lockfile to the patched version, run the test suite.',
    mcpsRequired: ['github-mcp'],
    plainEnglish:
      'Upgrade the vulnerable library to the patched version, run all the tests, and open a PR.',
    promptFragment:
      '11. Bump the vulnerable dependency in package.json + the lockfile to the patched version. Run the full test suite. If breaking changes are present, refactor callers in the same PR.',
  },
  {
    id: 'file-jira',
    label: 'File Jira ticket',
    phase: 'audit',
    blurb: 'Open a P0/P1 ticket linking every artifact produced by the run.',
    mcpsRequired: ['jira-mcp'],
    plainEnglish:
      'Open a Jira ticket so the security team can track the incident, with links to every action the agent took.',
    promptFragment:
      '12. Open a Jira ticket of type "Security incident", priority matching the event severity, and link every artifact (PRs, Vault versions, IAM key IDs, GG incident ID, Splunk event ID).',
  },
  {
    id: 'post-to-slack',
    label: 'Post to #security-incidents',
    phase: 'audit',
    blurb: 'Post a structured incident summary to the on-call channel.',
    mcpsRequired: ['slack-mcp'],
    plainEnglish:
      'Post a clean summary of the incident in Slack so the on-call human knows what just happened.',
    promptFragment:
      '13. Post a structured summary message in #security-incidents with sections: Containment, Remediation, Audit. Include a link to every artifact and an at-mention for the on-call.',
  },
  {
    id: 'emit-splunk-audit-event',
    label: 'Emit Splunk audit event',
    phase: 'audit',
    blurb: 'Index a structured audit event the SIEM can correlate on.',
    mcpsRequired: ['splunk-mcp'],
    plainEnglish:
      'Write a structured record into Splunk so auditors can later prove the incident was contained.',
    promptFragment:
      '14. Index a structured audit event in Splunk with index=security_audit, sourcetype=cursor:agent:run, and fields capturing every action taken plus the agent run ID.',
  },
];

const PHASE_ORDER: Record<ActionPhase, number> = {
  containment: 0,
  remediation: 1,
  audit: 2,
};

export function getAction(id: ActionId): Action | null {
  return ACTIONS.find((a) => a.id === id) ?? null;
}

export function sortActionsByPhase(ids: ActionId[]): ActionId[] {
  return [...ids].sort((a, b) => {
    const aa = getAction(a);
    const bb = getAction(b);
    if (!aa || !bb) return 0;
    return PHASE_ORDER[aa.phase] - PHASE_ORDER[bb.phase];
  });
}

export function getActionsByPhase(phase: ActionPhase): Action[] {
  return ACTIONS.filter((a) => a.phase === phase);
}
