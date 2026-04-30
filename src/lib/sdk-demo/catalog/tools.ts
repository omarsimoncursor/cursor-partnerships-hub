import type { Tool } from '../types';

export const TOOLS: Tool[] = [
  {
    id: 'gitguardian',
    name: 'GitGuardian',
    color: '#1F8FFF',
    blurb: 'Secret detection across every commit, PR, and Slack message.',
    letter: 'GG',
    category: 'secrets',
    plainEnglish:
      'Watches your code for accidentally-committed passwords, API keys, and database credentials. Alerts you the second one is exposed.',
  },
  {
    id: 'wiz',
    name: 'Wiz',
    color: '#3F2EFF',
    blurb: 'CSPM + CNAPP across AWS, Azure, and GCP.',
    letter: 'W',
    category: 'cspm',
    plainEnglish:
      'Scans your cloud accounts for misconfigurations: public buckets holding sensitive data, over-permissive admin roles, exposed databases.',
  },
  {
    id: 'snyk',
    name: 'Snyk',
    color: '#A06CD5',
    blurb: 'SAST + SCA + container + IaC vulnerability detection.',
    letter: 'S',
    category: 'sast',
    plainEnglish:
      'Scans your dependencies and code for known vulnerabilities. Tells you which version of a library is safe to upgrade to.',
  },
  {
    id: 'crowdstrike',
    name: 'CrowdStrike',
    color: '#FF0033',
    blurb: 'Endpoint detection + response (Falcon).',
    letter: 'CS',
    category: 'edr',
    plainEnglish:
      'Watches every laptop and server for malicious activity. Flags suspicious processes the second they run.',
  },
  {
    id: 'okta',
    name: 'Okta',
    color: '#1C82E1',
    blurb: 'Identity + access. System Log streams every auth.',
    letter: 'O',
    category: 'identity',
    plainEnglish:
      'Logs every employee sign-in. Catches impossible-travel patterns, MFA fatigue, and compromised accounts.',
  },
  {
    id: 'splunk',
    name: 'Splunk',
    color: '#65A637',
    blurb: 'SIEM + SOAR (Phantom). Correlation searches and playbooks.',
    letter: 'SP',
    category: 'siem',
    plainEnglish:
      'The central log-aggregation system most security teams already run. Correlates events from every other tool to spot patterns.',
  },
  {
    id: 'zscaler',
    name: 'Zscaler',
    color: '#0099CC',
    blurb: 'Zero-trust + DLP across egress traffic.',
    letter: 'Z',
    category: 'network',
    plainEnglish:
      'Inspects every byte leaving your network. Blocks employees from sending sensitive files to unauthorized destinations.',
  },
  {
    id: 'vanta',
    name: 'Vanta',
    color: '#5BB5C5',
    blurb: 'GRC + continuous-control monitoring.',
    letter: 'V',
    category: 'grc',
    plainEnglish:
      'Continuously checks the controls you need for SOC 2 / ISO 27001 audits. Flags failed controls before the auditor sees them.',
  },
];

export function getTool(id: string | null): Tool | null {
  if (!id) return null;
  return TOOLS.find((t) => t.id === id) ?? null;
}
