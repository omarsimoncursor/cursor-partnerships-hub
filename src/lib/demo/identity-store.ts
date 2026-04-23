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
