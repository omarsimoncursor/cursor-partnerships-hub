import type { ToolEvent, ToolId } from '../types';

export const EVENTS: ToolEvent[] = [
  {
    id: 'gg-secret-exposed',
    toolId: 'gitguardian',
    name: 'secret.exposed',
    severity: 'P0',
    description: 'A credential matching a known issuer pattern was detected on a public-facing surface.',
    payloadType: 'GitGuardianIncident',
  },
  {
    id: 'gg-incident-created',
    toolId: 'gitguardian',
    name: 'incident.created',
    severity: 'P1',
    description: 'A new incident was opened in the GitGuardian dashboard.',
    payloadType: 'GitGuardianIncident',
  },
  {
    id: 'gg-incident-resolved',
    toolId: 'gitguardian',
    name: 'incident.resolved',
    severity: 'INFO',
    description: 'A GitGuardian incident moved to the resolved state.',
    payloadType: 'GitGuardianIncident',
  },

  {
    id: 'wiz-issue-critical',
    toolId: 'wiz',
    name: 'issue.opened (CRITICAL)',
    severity: 'P0',
    description: 'Critical CSPM finding such as a public bucket holding sensitive data.',
    payloadType: 'WizIssue',
  },
  {
    id: 'wiz-issue-high',
    toolId: 'wiz',
    name: 'issue.opened (HIGH)',
    severity: 'P1',
    description: 'High-severity posture finding such as an over-permissive IAM policy.',
    payloadType: 'WizIssue',
  },
  {
    id: 'wiz-policy-violation',
    toolId: 'wiz',
    name: 'policy.violation',
    severity: 'P1',
    description: 'A resource was created or modified in violation of a posture policy.',
    payloadType: 'WizPolicyViolation',
  },

  {
    id: 'snyk-vuln-critical',
    toolId: 'snyk',
    name: 'vulnerability.new (CRITICAL)',
    severity: 'P0',
    description: 'A new critical-severity vulnerability disclosed in a dependency in use.',
    payloadType: 'SnykVulnerability',
  },
  {
    id: 'snyk-license-violation',
    toolId: 'snyk',
    name: 'license.violation',
    severity: 'P2',
    description: 'A dependency was added that violates the org license policy.',
    payloadType: 'SnykLicenseEvent',
  },
  {
    id: 'snyk-iac-misconfig',
    toolId: 'snyk',
    name: 'iac.misconfiguration',
    severity: 'P1',
    description: 'A Terraform / Kubernetes manifest violates a security baseline.',
    payloadType: 'SnykIacFinding',
  },

  {
    id: 'cs-detection-high',
    toolId: 'crowdstrike',
    name: 'detection.high-severity',
    severity: 'P0',
    description: 'A high-severity Falcon detection on a managed endpoint.',
    payloadType: 'FalconDetection',
  },
  {
    id: 'cs-prevention-blocked',
    toolId: 'crowdstrike',
    name: 'prevention.blocked',
    severity: 'P1',
    description: 'Falcon blocked an execution that matched a prevention policy.',
    payloadType: 'FalconPreventionEvent',
  },
  {
    id: 'cs-host-contained',
    toolId: 'crowdstrike',
    name: 'host.contained',
    severity: 'P1',
    description: 'A host was placed into network containment.',
    payloadType: 'FalconHostState',
  },

  {
    id: 'okta-auth-anomaly',
    toolId: 'okta',
    name: 'auth.anomaly',
    severity: 'P0',
    description: 'Impossible-travel, MFA-fatigue, or other anomalous sign-in pattern.',
    payloadType: 'OktaSystemLogEvent',
  },
  {
    id: 'okta-mfa-bypass',
    toolId: 'okta',
    name: 'mfa.bypass',
    severity: 'P0',
    description: 'A successful sign-in that bypassed expected MFA enforcement.',
    payloadType: 'OktaSystemLogEvent',
  },
  {
    id: 'okta-policy-failed',
    toolId: 'okta',
    name: 'policy.evaluation.failed',
    severity: 'P1',
    description: 'A sign-in policy could not be evaluated to a deterministic decision.',
    payloadType: 'OktaSystemLogEvent',
  },

  {
    id: 'splunk-correlation-matched',
    toolId: 'splunk',
    name: 'correlation.matched',
    severity: 'P1',
    description: 'A correlation search matched and produced a notable.',
    payloadType: 'SplunkNotable',
  },
  {
    id: 'splunk-notable-event',
    toolId: 'splunk',
    name: 'notable.event',
    severity: 'P1',
    description: 'A notable event was added to the Enterprise Security incident review.',
    payloadType: 'SplunkNotable',
  },
  {
    id: 'splunk-playbook-requested',
    toolId: 'splunk',
    name: 'playbook.requested',
    severity: 'P1',
    description: 'A SOAR playbook explicitly requested Cursor as a remediation step.',
    payloadType: 'SplunkSoarRequest',
  },

  {
    id: 'zs-dlp-fired',
    toolId: 'zscaler',
    name: 'dlp.policy.fired',
    severity: 'P1',
    description: 'DLP policy fired on outbound traffic from a managed device.',
    payloadType: 'ZscalerDlpEvent',
  },
  {
    id: 'zs-tunnel-degraded',
    toolId: 'zscaler',
    name: 'tunnel.health.degraded',
    severity: 'P2',
    description: 'A ZPA app connector is reporting degraded health.',
    payloadType: 'ZscalerHealthEvent',
  },
  {
    id: 'zs-unsanctioned-app',
    toolId: 'zscaler',
    name: 'unsanctioned.app.detected',
    severity: 'P2',
    description: 'A user accessed a SaaS application not on the sanctioned list.',
    payloadType: 'ZscalerSaasEvent',
  },

  {
    id: 'vanta-control-failed',
    toolId: 'vanta',
    name: 'control.failed',
    severity: 'P1',
    description: 'An automated control test failed (e.g., S3 bucket without encryption).',
    payloadType: 'VantaControlEvent',
  },
  {
    id: 'vanta-evidence-expiring',
    toolId: 'vanta',
    name: 'evidence.expiring',
    severity: 'P2',
    description: 'A piece of compliance evidence is about to expire.',
    payloadType: 'VantaEvidenceEvent',
  },
  {
    id: 'vanta-policy-drift',
    toolId: 'vanta',
    name: 'policy.drift',
    severity: 'P1',
    description: 'A policy implementation drifted from its documented control description.',
    payloadType: 'VantaPolicyEvent',
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
