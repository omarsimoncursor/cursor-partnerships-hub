import { cookies } from 'next/headers';
import { adminCookieName, verifyAdminCookie } from '@/lib/prospect-store/admin-auth';
import { AdminClient } from './admin-client';
import { AdminGate } from './admin-gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server component for /prospect-builder/admin. Reads the
 * `pb_admin_session` cookie and renders either the password gate
 * (no/invalid session) or the existing admin client UI.
 *
 * The admin password is never serialized into the page — the gate
 * component holds nothing more than its own input state, and the
 * password check happens in /api/admin/auth (server-only).
 */
export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(adminCookieName())?.value;
  const authed = verifyAdminCookie(cookieValue);

  if (!authed) {
    return <AdminGate />;
  }
  return <AdminClient />;
}
