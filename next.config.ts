import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // Removed output: 'export' to enable API routes (Vercel deployment)

  // Permanent redirects for the legacy /prospect-builder paths.
  // The standalone account-demo builder page was deprecated when the
  // admin's "Add prospect" modal absorbed the same flow, and the
  // password-gated admin moved up one level from
  // /prospect-builder/admin to /admin.
  //
  // Existing browser bookmarks and any external link the rep has
  // shared still resolve via these 308 redirects, so a stale URL
  // never lands on a 404. The catch-all under /admin/:path* is
  // future-proofing — today the admin renders only at /admin and
  // doesn't have nested routes, but if we add one (e.g. a per-
  // prospect /admin/<id> deep link) this will continue to forward.
  async redirects() {
    return [
      {
        source: '/prospect-builder/admin/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
      {
        source: '/prospect-builder/admin',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/prospect-builder',
        destination: '/admin',
        permanent: true,
      },
      // The /prospect/<domain> stateless URL-encoded preview route
      // was only reachable from inside the deprecated builder, so it
      // can redirect to the admin too.
      {
        source: '/prospect/:domain*',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
});
