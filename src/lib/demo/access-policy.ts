import {
  lookupUser,
  type AccessDecision,
  type AccessRequest,
  type Location,
} from './identity-store';

export interface AccessPolicy {
  app: string;
  roles: string[];
  postureRequired: boolean;
  allowedLocations: Location[] | ['*'];
  allowedIdps: string[] | ['*'];
}

export const ADMIN_AUDIT_LOG_POLICY: AccessPolicy = {
  app: 'workforce-admin/audit-logs',
  roles: ['*'],
  postureRequired: false,
  allowedLocations: ['*'],
  allowedIdps: ['*'],
};

function matchAny<T extends string>(allowed: T[] | ['*'], value: T): boolean {
  if ((allowed as string[]).includes('*')) return true;
  return (allowed as string[]).includes(value);
}

export async function evaluateAccess(req: AccessRequest): Promise<AccessDecision> {
  const user = await lookupUser(req.userId);

  const reasons: string[] = [];

  const roleOk =
    ADMIN_AUDIT_LOG_POLICY.roles.includes('*') ||
    user.roles.some(r => ADMIN_AUDIT_LOG_POLICY.roles.includes(r));
  if (roleOk) reasons.push('role:matched');

  const locationOk = matchAny(ADMIN_AUDIT_LOG_POLICY.allowedLocations, req.location);
  if (locationOk) reasons.push('location:matched');

  const idpOk = matchAny(ADMIN_AUDIT_LOG_POLICY.allowedIdps, req.idp);
  if (idpOk) reasons.push('idp:matched');

  const postureOk =
    !ADMIN_AUDIT_LOG_POLICY.postureRequired || req.devicePosture === 'managed-compliant';
  if (postureOk) reasons.push('posture:ok');

  return {
    allow: roleOk && locationOk && idpOk && postureOk,
    user,
    evaluatedAt: Date.now(),
    matchedReasons: reasons,
  };
}

export interface ScopeReport {
  inScope: number;
  intent: number;
  ratio: string;
  unmanagedDevicePaths: number;
}

export function summarizePolicyScope(policy: AccessPolicy): ScopeReport {
  const wildcardRoles = policy.roles.includes('*');
  const wildcardLocations = (policy.allowedLocations as string[]).includes('*');
  const wildcardIdps = (policy.allowedIdps as string[]).includes('*');
  const postureSkipped = !policy.postureRequired;

  const inScope = wildcardRoles && wildcardLocations && wildcardIdps ? 4287 : 18;
  const intent = 18;
  const ratio = inScope > intent ? `${(inScope / intent).toFixed(1)}x` : '1.0x';
  const unmanagedDevicePaths = postureSkipped ? 1 : 0;

  return { inScope, intent, ratio, unmanagedDevicePaths };
}
