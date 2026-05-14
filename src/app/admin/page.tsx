import { cookies } from 'next/headers';
import {
  adminCookieName,
  getAdminPassword,
  verifyAdminCookie,
} from '@/lib/prospect-store/admin-auth';
import { AdminClient } from './admin-client';
import { AdminGate } from './admin-gate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server component for /admin. Reads the `pb_admin_session` cookie
 * (legacy name, retained so existing sessions aren't invalidated by
 * the route move out of /prospect-builder/admin) and renders either
 * the password gate (no/invalid session) or the admin client UI.
 *
 * The admin password is never serialized into the page — the gate
 * component holds nothing more than its own input state, and the
 * password check happens in /api/admin/auth (server-only).
 */
export default async function AdminPage() {
  // Render a "setup required" panel when ADMIN_PASSWORD isn't configured
  // on the deployment. This is the most common failure mode for a peer
  // who forked the template and skipped the env-var step in AGENTS.md.
  if (!getAdminPassword()) {
    return <AdminSetupRequired />;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(adminCookieName())?.value;
  const authed = verifyAdminCookie(cookieValue);

  if (!authed) {
    return <AdminGate />;
  }
  return <AdminClient />;
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
        <p className="text-sm text-text-secondary mb-3">
          The admin surface is locked until you set the{' '}
          <code className="text-accent-amber font-mono">ADMIN_PASSWORD</code> environment variable
          on this deployment.
        </p>
        <ol className="text-sm text-text-secondary list-decimal pl-5 space-y-1.5 mb-4">
          <li>
            Generate a password locally:{' '}
            <code className="font-mono text-accent-amber">openssl rand -base64 18</code> (or pick
            your own).
          </li>
          <li>
            In Vercel, add{' '}
            <code className="font-mono text-accent-amber">ADMIN_PASSWORD=&lt;your value&gt;</code>{' '}
            to the project&apos;s Production environment.
          </li>
          <li>Redeploy.</li>
        </ol>
        <p className="text-xs text-text-tertiary leading-relaxed">
          See <code className="font-mono">AGENTS.md</code> in the repo for the full setup
          playbook.
        </p>
      </div>
    </div>
  );
}
