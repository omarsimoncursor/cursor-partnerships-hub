import type { ToolEvent, ToolId } from '../types';

export const EVENTS: ToolEvent[] = [
  {
    id: 'gg-secret-exposed',
    toolId: 'gitguardian',
    name: 'secret.exposed',
    severity: 'P0',
    description: 'A credential matching a known issuer pattern was detected on a public-facing surface.',
    payloadType: 'GitGuardianIncident',
    plainEnglish:
      'Someone just committed a real password or API key to a code repo. The clock is ticking.',
  },
  {
    id: 'gg-incident-created',
    toolId: 'gitguardian',
    name: 'incident.created',
    severity: 'P1',
    description: 'A new incident was opened in the GitGuardian dashboard.',
    payloadType: 'GitGuardianIncident',
    plainEnglish: 'GitGuardian opened a fresh incident — needs triage.',
  },
  {
    id: 'gg-incident-resolved',
    toolId: 'gitguardian',
    name: 'incident.resolved',
    severity: 'INFO',
    description: 'A GitGuardian incident moved to the resolved state.',
    payloadType: 'GitGuardianIncident',
    plainEnglish: 'A previously-open incident is now closed.',
  },

  {
    id: 'wiz-issue-critical',
    toolId: 'wiz',
    name: 'issue.opened (CRITICAL)',
    severity: 'P0',
    description: 'Critical CSPM finding such as a public bucket holding sensitive data.',
    payloadType: 'WizIssue',
    plainEnglish:
      'A cloud resource is wide open to the internet, with sensitive data exposed.',
  },
  {
    id: 'wiz-issue-high',
    toolId: 'wiz',
    name: 'issue.opened (HIGH)',
    severity: 'P1',
    description: 'High-severity posture finding such as an over-permissive IAM policy.',
    payloadType: 'WizIssue',
    plainEnglish: 'Something in your cloud has way more permissions than it needs.',
  },
  {
    id: 'wiz-policy-violation',
    toolId: 'wiz',
    name: 'policy.violation',
    severity: 'P1',
    description: 'A resource was created or modified in violation of a posture policy.',
    payloadType: 'WizPolicyViolation',
    plainEnglish:
      'An engineer just created a resource that breaks one of your security rules.',
  },

  {
    id: 'snyk-vuln-critical',
    toolId: 'snyk',
    name: 'vulnerability.new (CRITICAL)',
    severity: 'P0',
    description: 'A new critical-severity vulnerability disclosed in a dependency in use.',
    payloadType: 'SnykVulnerability',
    plainEnglish:
      'A library your code depends on was just disclosed to be exploitable.',
  },
  {
    id: 'snyk-license-violation',
    toolId: 'snyk',
    name: 'license.violation',
    severity: 'P2',
    description: 'A dependency was added that violates the org license policy.',
    payloadType: 'SnykLicenseEvent',
    plainEnglish:
      'A library was added that has a license your legal team doesn\u2019t allow.',
  },
  {
    id: 'snyk-iac-misconfig',
    toolId: 'snyk',
    name: 'iac.misconfiguration',
    severity: 'P1',
    description: 'A Terraform / Kubernetes manifest violates a security baseline.',
    payloadType: 'SnykIacFinding',
    plainEnglish:
      'Some infrastructure code in a pull request would create an insecure cloud resource if merged.',
  },

  {
    id: 'cs-detection-high',
    toolId: 'crowdstrike',
    name: 'detection.high-severity',
    severity: 'P0',
    description: 'A high-severity Falcon detection on a managed endpoint.',
    payloadType: 'FalconDetection',
    plainEnglish:
      'CrowdStrike spotted something dangerous running on a laptop or server.',
  },
  {
    id: 'cs-prevention-blocked',
    toolId: 'crowdstrike',
    name: 'prevention.blocked',
    severity: 'P1',
    description: 'Falcon blocked an execution that matched a prevention policy.',
    payloadType: 'FalconPreventionEvent',
    plainEnglish:
      'CrowdStrike blocked a process from running. Worth investigating why it tried.',
  },
  {
    id: 'cs-host-contained',
    toolId: 'crowdstrike',
    name: 'host.contained',
    severity: 'P1',
    description: 'A host was placed into network containment.',
    payloadType: 'FalconHostState',
    plainEnglish:
      'A laptop or server was just isolated from the network.',
  },

  {
    id: 'okta-auth-anomaly',
    toolId: 'okta',
    name: 'auth.anomaly',
    severity: 'P0',
    description: 'Impossible-travel, MFA-fatigue, or other anomalous sign-in pattern.',
    payloadType: 'OktaSystemLogEvent',
    plainEnglish:
      'An employee just signed in from two impossible places at once \u2014 likely account takeover.',
  },
  {
    id: 'okta-mfa-bypass',
    toolId: 'okta',
    name: 'mfa.bypass',
    severity: 'P0',
    description: 'A successful sign-in that bypassed expected MFA enforcement.',
    payloadType: 'OktaSystemLogEvent',
    plainEnglish:
      'Someone signed in without the MFA prompt that should have been required.',
  },
  {
    id: 'okta-policy-failed',
    toolId: 'okta',
    name: 'policy.evaluation.failed',
    severity: 'P1',
    description: 'A sign-in policy could not be evaluated to a deterministic decision.',
    payloadType: 'OktaSystemLogEvent',
    plainEnglish:
      'Okta couldn\u2019t decide if a sign-in was safe or not. Needs a human or an agent to investigate.',
  },

  {
    id: 'splunk-correlation-matched',
    toolId: 'splunk',
    name: 'correlation.matched',
    severity: 'P1',
    description: 'A correlation search matched and produced a notable.',
    payloadType: 'SplunkNotable',
    plainEnglish:
      'Splunk noticed a suspicious pattern across multiple log sources.',
  },
  {
    id: 'splunk-notable-event',
    toolId: 'splunk',
    name: 'notable.event',
    severity: 'P1',
    description: 'A notable event was added to the Enterprise Security incident review.',
    payloadType: 'SplunkNotable',
    plainEnglish:
      'Something landed in the security team\u2019s queue for review.',
  },
  {
    id: 'splunk-playbook-requested',
    toolId: 'splunk',
    name: 'playbook.requested',
    severity: 'P1',
    description: 'A SOAR playbook explicitly requested Cursor as a remediation step.',
    payloadType: 'SplunkSoarRequest',
    plainEnglish:
      'A Splunk playbook reached the step where it asks Cursor to take action.',
  },

  {
    id: 'zs-dlp-fired',
    toolId: 'zscaler',
    name: 'dlp.policy.fired',
    severity: 'P1',
    description: 'DLP policy fired on outbound traffic from a managed device.',
    payloadType: 'ZscalerDlpEvent',
    plainEnglish:
      'An employee tried to send sensitive data to a destination they shouldn\u2019t.',
  },
  {
    id: 'zs-tunnel-degraded',
    toolId: 'zscaler',
    name: 'tunnel.health.degraded',
    severity: 'P2',
    description: 'A ZPA app connector is reporting degraded health.',
    payloadType: 'ZscalerHealthEvent',
    plainEnglish:
      'A network tunnel is having trouble \u2014 some employees may be unable to access apps.',
  },
  {
    id: 'zs-unsanctioned-app',
    toolId: 'zscaler',
    name: 'unsanctioned.app.detected',
    severity: 'P2',
    description: 'A user accessed a SaaS application not on the sanctioned list.',
    payloadType: 'ZscalerSaasEvent',
    plainEnglish:
      'Someone is using a SaaS app the security team hasn\u2019t approved.',
  },

  {
    id: 'vanta-control-failed',
    toolId: 'vanta',
    name: 'control.failed',
    severity: 'P1',
    description: 'An automated control test failed (e.g., S3 bucket without encryption).',
    payloadType: 'VantaControlEvent',
    plainEnglish:
      'A SOC 2 / ISO 27001 control just stopped passing. Auditor will flag it.',
  },
  {
    id: 'vanta-evidence-expiring',
    toolId: 'vanta',
    name: 'evidence.expiring',
    severity: 'P2',
    description: 'A piece of compliance evidence is about to expire.',
    payloadType: 'VantaEvidenceEvent',
    plainEnglish:
      'Some compliance proof is about to expire \u2014 someone needs to refresh it before audit.',
  },
  {
    id: 'vanta-policy-drift',
    toolId: 'vanta',
    name: 'policy.drift',
    severity: 'P1',
    description: 'A policy implementation drifted from its documented control description.',
    payloadType: 'VantaPolicyEvent',
    plainEnglish:
      'What you wrote in your security policy and what your code is actually doing don\u2019t match anymore.',
  },
];

export function getEventsForTool(toolId: ToolId | null): ToolEvent[] {
  if (!toolId) return [];
  return EVENTS.filter((e) => e.toolId === toolId);
}

export function getEvent(eventId: string | null): ToolEvent | null {
  if (!eventId) return null;
  return EVENTS.find((e) => e.id === eventId) ?? null;
}
