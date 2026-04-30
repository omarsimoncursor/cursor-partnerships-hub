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
}

const SCRIPTS: Record<ScriptId, ResolvedScript> = {
  'gitguardian-secret': {
    id: 'gitguardian-secret',
    title: 'GitGuardian: leaked credential containment',
    steps: GITGUARDIAN_SECRET_SCRIPT,
  },
  'wiz-public-bucket': {
    id: 'wiz-public-bucket',
    title: 'Wiz: public S3 bucket lockdown',
    steps: WIZ_PUBLIC_BUCKET_SCRIPT,
  },
  'okta-anomaly': {
    id: 'okta-anomaly',
    title: 'Okta: suspected identity compromise',
    steps: OKTA_ANOMALY_SCRIPT,
  },
  'snyk-vuln': {
    id: 'snyk-vuln',
    title: 'Snyk: critical vulnerability remediation',
    steps: SNYK_VULN_SCRIPT,
  },
  'crowdstrike-detection': {
    id: 'crowdstrike-detection',
    title: 'CrowdStrike: endpoint detection + supply-chain audit',
    steps: CROWDSTRIKE_DETECTION_SCRIPT,
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
