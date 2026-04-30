import type { RuntimeStep, ScriptId, Workflow } from '../types';
import { GITGUARDIAN_SECRET_SCRIPT } from './gitguardian-secret';
import { WIZ_PUBLIC_BUCKET_SCRIPT } from './wiz-public-bucket';
import { OKTA_ANOMALY_SCRIPT } from './okta-anomaly';
import { SNYK_VULN_SCRIPT } from './snyk-vuln';
import { CROWDSTRIKE_DETECTION_SCRIPT } from './crowdstrike-detection';

export interface ResolvedScript {
  id: ScriptId;
  title: string;
  steps: RuntimeStep[];
  meta: ScriptMeta;
}

export interface ScriptMeta {
  agentId: string;
  prTitle: string;
  prNumber: number;
  prBranch: string;
  prRepo: string;
  jiraId: string;
  jiraSummary: string;
  slackChannel: string;
  incidentSummary: string;
  rootCause: string;
  remediation: string;
  evidenceLinks: Array<{ label: string; ref: string }>;
}

const SCRIPTS: Record<ScriptId, ResolvedScript> = {
  'gitguardian-secret': {
    id: 'gitguardian-secret',
    title: 'GitGuardian: leaked credential containment',
    steps: GITGUARDIAN_SECRET_SCRIPT,
    meta: {
      agentId: 'bc-29f4d1a8',
      prTitle: 'chore(security): remove leaked credentials, source from Vault (resolves GG #41822)',
      prNumber: 3142,
      prBranch: 'cleanup/secret-purge-payments-service',
      prRepo: 'acme/payments-service',
      jiraId: 'CUR-SEC-2118',
      jiraSummary: 'Active credential exposure in payments-service · 3 secrets',
      slackChannel: '#security-incidents',
      incidentSummary:
        'GitGuardian flagged a commit pushing AWS + Stripe credentials to acme/payments-service. Cursor contained the exposure, rotated the keys at the issuers, published the replacements to Vault, and opened a cleanup PR plus a draft history-purge PR.',
      rootCause:
        'Hardcoded literals committed to src/config/payments.ts and src/lib/stripe-client.ts.',
      remediation:
        'Replaced literals with getSecret() calls, added .gitleaks.toml allowlist for AWS-published example credentials.',
      evidenceLinks: [
        { label: 'GitGuardian incident', ref: '#41822' },
        { label: 'Cleanup PR', ref: '#3142 · acme/payments-service' },
        { label: 'History-purge PR (draft)', ref: '#3143 · acme/payments-service' },
        { label: 'Vault secret version', ref: 'v23 · payments-service/aws-access-key-id' },
        { label: 'Splunk audit event', ref: 'index=security_audit · sourcetype=cursor:agent:run' },
      ],
    },
  },
  'wiz-public-bucket': {
    id: 'wiz-public-bucket',
    title: 'Wiz: public S3 bucket lockdown',
    steps: WIZ_PUBLIC_BUCKET_SCRIPT,
    meta: {
      agentId: 'bc-7c1a04ef',
      prTitle: 'security: lock down customer-exports bucket (Wiz 8a3f-9c2e)',
      prNumber: 2204,
      prBranch: 'security/lock-customer-exports-bucket',
      prRepo: 'acme/infra-terraform',
      jiraId: 'CUR-SEC-2207',
      jiraSummary: 'Public S3 bucket holding PII · acme-customer-exports',
      slackChannel: '#security-incidents',
      incidentSummary:
        'Wiz fired a CRITICAL CSPM finding on s3://acme-customer-exports (1.4 GB · 412 inferred customer records). Cursor toggled PublicAccessBlock immediately, narrowed the IAM policy to least-privilege, and opened a Terraform PR.',
      rootCause:
        'Bucket created with acl="public-read" and a wildcard bucket policy in customer-exports.tf.',
      remediation:
        'Enabled PublicAccessBlock, removed wildcard bucket policy, narrowed Action and Resource to the 4 actions seen in CloudTrail over 30 days.',
      evidenceLinks: [
        { label: 'Wiz issue', ref: '8a3f-9c2e · resolved' },
        { label: 'IaC PR', ref: '#2204 · acme/infra-terraform' },
        { label: 'AWS S3 control', ref: 'PublicAccessBlock · all-flags=true' },
        { label: 'CloudTrail analysis', ref: 'last 30 days · 4 distinct actions' },
      ],
    },
  },
  'okta-anomaly': {
    id: 'okta-anomaly',
    title: 'Okta: suspected identity compromise',
    steps: OKTA_ANOMALY_SCRIPT,
    meta: {
      agentId: 'bc-3e8b62a1',
      prTitle: 'security: tighten main branch protection during identity triage',
      prNumber: 0,
      prBranch: '(no PR · branch protection only)',
      prRepo: 'acme/payments-service',
      jiraId: 'CUR-SEC-2241',
      jiraSummary: 'Suspected identity compromise · jess.lin@acme · impossible-travel',
      slackChannel: '#security-incidents',
      incidentSummary:
        'Okta surfaced impossible-travel: Berlin → Mumbai inside 7 minutes, both with successful MFA pushes. Cursor revoked all sessions and OAuth grants, audited 3 commits from the last 24h (all clean), and tightened main branch protection until human reactivation.',
      rootCause:
        'Two near-simultaneous MFA approvals from devices the user has never registered before.',
      remediation:
        'All sessions revoked, OAuth grants revoked, branch protection on main tightened to require signed commits.',
      evidenceLinks: [
        { label: 'Okta event', ref: '0c4f-…' },
        { label: 'Sessions revoked', ref: '7 grants across 4 apps' },
        { label: 'Commits audited', ref: '3 commits · 0 to protected refs' },
        { label: 'Branch protection', ref: 'main · require_signed_commits=true' },
      ],
    },
  },
  'snyk-vuln': {
    id: 'snyk-vuln',
    title: 'Snyk: critical vulnerability remediation',
    steps: SNYK_VULN_SCRIPT,
    meta: {
      agentId: 'bc-91d4f6c0',
      prTitle: 'security: bump lodash to 4.17.21 (CVE-2026-1428, CVSS 9.8)',
      prNumber: 4419,
      prBranch: 'security/bump-lodash-cve-2026-1428',
      prRepo: 'acme/orders-api',
      jiraId: 'CUR-SEC-2266',
      jiraSummary: 'CRITICAL CVE in dependency · lodash@4.17.20 · CVE-2026-1428',
      slackChannel: '#security-incidents',
      incidentSummary:
        'Snyk surfaced a critical prototype-pollution vulnerability in lodash@4.17.20 reachable from src/api/orders.ts. Cursor bumped to 4.17.21, ran the test suite (287 tests green), and opened the PR.',
      rootCause:
        'Reachable _.merge() call accepting unvalidated request body. Lodash 4.17.20 lacks the prototype-pollution patch.',
      remediation: 'Bumped package.json + lockfile to 4.17.21. No caller refactor required.',
      evidenceLinks: [
        { label: 'Snyk vulnerability', ref: 'CVE-2026-1428 · CVSS 9.8' },
        { label: 'Bump PR', ref: '#4419 · acme/orders-api' },
        { label: 'Test results', ref: '287 passed · 0 failed · coverage 84.2%' },
        { label: 'Snyk re-scan', ref: '0 high/critical remaining' },
      ],
    },
  },
  'crowdstrike-detection': {
    id: 'crowdstrike-detection',
    title: 'CrowdStrike: endpoint detection + supply-chain audit',
    steps: CROWDSTRIKE_DETECTION_SCRIPT,
    meta: {
      agentId: 'bc-c08a17be',
      prTitle: 'security: remove typosquat @colors/colorz (Falcon ldt:abc123)',
      prNumber: 4422,
      prBranch: 'security/remove-typosquat-colorz',
      prRepo: 'acme/orders-api',
      jiraId: 'CUR-SEC-2289',
      jiraSummary: 'Endpoint detection traced to typosquat · @colors/colorz',
      slackChannel: '#security-incidents',
      incidentSummary:
        'Falcon detected a suspicious npm postinstall on a developer laptop spawning bash → curl evil.example.test. Cursor contained the host, audited recent commits, found a typosquatted dependency, and opened the cleanup PR.',
      rootCause: 'Typosquat package @colors/colorz added in feat/checkout-promo branch.',
      remediation:
        'Reverted the dependency add. Branch quarantined behind required-review. Host placed in network containment.',
      evidenceLinks: [
        { label: 'Falcon detection', ref: 'ldt:abc123 · HIGH' },
        { label: 'Host containment', ref: 'laptop-jess-mbp · contained' },
        { label: 'Cleanup PR', ref: '#4422 · acme/orders-api' },
        { label: 'Branch quarantine', ref: 'feat/checkout-promo · required-review' },
      ],
    },
  },
};

export function pickScript(workflow: Workflow): ResolvedScript {
  const t = workflow.toolId;
  if (t === 'wiz') return SCRIPTS['wiz-public-bucket'];
  if (t === 'okta') return SCRIPTS['okta-anomaly'];
  if (t === 'snyk') return SCRIPTS['snyk-vuln'];
  if (t === 'crowdstrike') return SCRIPTS['crowdstrike-detection'];
  return SCRIPTS['gitguardian-secret'];
}

export function getScript(id: ScriptId): ResolvedScript {
  return SCRIPTS[id];
}
