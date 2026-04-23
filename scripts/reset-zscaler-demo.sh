#!/usr/bin/env bash
set -euo pipefail

# Resets the Zscaler demo bug files to their original (wildcard, posture-skipped) state.
# Run this after merging a fix PR to make the demo repeatable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
POLICY_FILE="$REPO_ROOT/src/lib/demo/access-policy.ts"
IDENTITY_FILE="$REPO_ROOT/src/lib/demo/identity-store.ts"

cat > "$POLICY_FILE" << 'POLICYEOF'
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
POLICYEOF

cat > "$IDENTITY_FILE" << 'IDENTITYEOF'
export type Location = 'sf-hq' | 'nyc-hq' | 'remote' | 'kiosk' | 'unknown';
export type DevicePosture =
  | 'managed-compliant'
  | 'managed-noncompliant'
  | 'unmanaged'
  | 'unknown';

export interface AccessRequest {
  userId: string;
  location: Location;
  devicePosture: DevicePosture;
  idp: string;
}

export interface User {
  id: string;
  name: string;
  roles: string[];
  department: string;
}

export interface AccessDecision {
  allow: boolean;
  user: User;
  evaluatedAt: number;
  matchedReasons: string[];
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function lookupUser(userId: string): Promise<User> {
  await sleep(95);
  return {
    id: userId,
    name: 'Demo Visitor',
    roles: ['employee'],
    department: 'unknown',
  };
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  app: string;
  at: string;
}

export async function fetchAuditLogPage(): Promise<AuditLogEntry[]> {
  await sleep(80);
  return [
    { id: 'evt-9182', actor: 'alice@cursor.demo',     action: 'view.audit-log',     app: 'workforce-admin', at: '14:21:08' },
    { id: 'evt-9183', actor: 'contractor-71@vendor',  action: 'export.audit-log',   app: 'workforce-admin', at: '14:21:14' },
    { id: 'evt-9184', actor: 'kiosk-lobby-2',         action: 'view.audit-log',     app: 'workforce-admin', at: '14:21:22' },
    { id: 'evt-9185', actor: 'unmanaged-device-44',   action: 'view.audit-log',     app: 'workforce-admin', at: '14:21:31' },
  ];
}
IDENTITYEOF

cd "$REPO_ROOT"
git add "$POLICY_FILE" "$IDENTITY_FILE"
git commit -m "chore: reset zscaler demo bug for next run"
echo ""
echo "Demo bug reset. Push to main to redeploy:"
echo "  git push origin main"
