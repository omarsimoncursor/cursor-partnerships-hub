import { cookies } from 'next/headers';
import {
  adminCookieName,
  getAdminPassword,
  verifyAdminCookie,
} from '@/lib/prospect-store/admin-auth';
import { AdminGate } from '../admin/admin-gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Server-side admin gate, reused from /admin (same ADMIN_PASSWORD,
// same `pb_admin_session` cookie, single sign-in for both surfaces).
// Children only render when the cookie is valid.
export default async function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!getAdminPassword()) {
    return <AdminSetupRequired />;
  }
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(adminCookieName())?.value;
  const authed = verifyAdminCookie(cookieValue);
  if (!authed) {
    return <AdminGate />;
  }
  return <>{children}</>;
}

function AdminSetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full rounded-2xl border border-accent-amber/40 bg-accent-amber/5 p-8">
        <p className="text-[11px] uppercase tracking-wider font-mono text-accent-amber mb-2">
          Setup required
        </p>
        <h1 className="text-xl font-semibold text-text-primary mb-3">
          Admin password isn&apos;t configured.
        </h1>
        <p className="text-sm text-text-secondary">
          The /outreach surface uses the same admin password as /admin. Configure{' '}
          <code className="text-accent-amber font-mono">ADMIN_PASSWORD</code> on this
          deployment to unlock either.
        </p>
      </div>
    </div>
  );
}
