import { NextResponse } from 'next/server';
import {
  ADMIN_AUDIT_LOG_POLICY,
  evaluateAccess,
  summarizePolicyScope,
} from '@/lib/demo/access-policy';
import { fetchAuditLogPage } from '@/lib/demo/identity-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  // Demo trigger: an unmanaged kiosk device, anonymous claim, unknown location.
  const decision = await evaluateAccess({
    userId: 'demo-visitor',
    location: 'unknown',
    devicePosture: 'unmanaged',
    idp: 'demo-idp',
  });

  const scope = summarizePolicyScope(ADMIN_AUDIT_LOG_POLICY);

  if (!decision.allow) {
    return NextResponse.json(
      {
        endpoint: '/api/admin/audit-logs',
        denied: true,
        decision,
        policy: ADMIN_AUDIT_LOG_POLICY,
        scope,
      },
      { status: 403 }
    );
  }

  const entries = await fetchAuditLogPage();
  const elapsedMs = Date.now() - start;

  return NextResponse.json({
    endpoint: '/api/admin/audit-logs',
    elapsedMs,
    policy: ADMIN_AUDIT_LOG_POLICY,
    scope,
    decision,
    entries,
  });
}
