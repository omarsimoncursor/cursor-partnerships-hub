import { NextRequest, NextResponse } from 'next/server';
import { lookupCustomerProfile } from '@/lib/demo/customer-profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Demo-only route. The handler intentionally hands the raw query value to the
 * vulnerable lookup function so the NoSQL-injection payload behaves exactly as
 * it would in the real bug. The Snyk demo's reset script rewrites the
 * underlying function to a safe version after a real fix PR merges.
 */
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username') ?? '';
  const records = lookupCustomerProfile({ username });

  return NextResponse.json({
    endpoint: '/api/customer-profile/lookup',
    queriedAt: new Date().toISOString(),
    matched: records.length,
    records,
  });
}
