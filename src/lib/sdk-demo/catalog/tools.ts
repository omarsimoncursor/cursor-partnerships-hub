import type { Tool } from '../types';

export const TOOLS: Tool[] = [
  {
    id: 'gitguardian',
    name: 'GitGuardian',
    color: '#1F8FFF',
    blurb: 'Secret detection across every commit, PR, and Slack message.',
    letter: 'GG',
    category: 'secrets',
  },
  {
    id: 'wiz',
    name: 'Wiz',
    color: '#3F2EFF',
    blurb: 'CSPM + CNAPP across AWS, Azure, and GCP.',
    letter: 'W',
    category: 'cspm',
  },
  {
    id: 'snyk',
    name: 'Snyk',
    color: '#A06CD5',
    blurb: 'SAST + SCA + container + IaC vulnerability detection.',
    letter: 'S',
    category: 'sast',
  },
  {
    id: 'crowdstrike',
    name: 'CrowdStrike',
    color: '#FF0033',
    blurb: 'Endpoint detection + response (Falcon).',
    letter: 'CS',
    category: 'edr',
  },
  {
    id: 'okta',
    name: 'Okta',
    color: '#1C82E1',
    blurb: 'Identity + access. System Log streams every auth.',
    letter: 'O',
    category: 'identity',
  },
  {
    id: 'splunk',
    name: 'Splunk',
    color: '#65A637',
    blurb: 'SIEM + SOAR (Phantom). Correlation searches and playbooks.',
    letter: 'SP',
    category: 'siem',
  },
  {
    id: 'zscaler',
    name: 'Zscaler',
    color: '#0099CC',
    blurb: 'Zero-trust + DLP across egress traffic.',
    letter: 'Z',
    category: 'network',
  },
  {
    id: 'vanta',
    name: 'Vanta',
    color: '#5BB5C5',
    blurb: 'GRC + continuous-control monitoring.',
    letter: 'V',
    category: 'grc',
  },
];

export function getTool(id: string | null): Tool | null {
  if (!id) return null;
  return TOOLS.find((t) => t.id === id) ?? null;
}
