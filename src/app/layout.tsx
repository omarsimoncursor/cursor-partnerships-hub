import type { Metadata } from 'next';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SETUP_CONFIG } from '@/lib/setup-config';
import './globals.css';

// Build-time origin used for the OG meta tag. In production the
// build-baked `canonicalOrigin` always wins (in-code, AGENT-EDITED,
// authoritative for this fork). The env var is a non-production
// override only, useful for staging deploys. Same priority as
// originFromRequest() in api-auth.ts so og:url and demo_url stay in
// sync regardless of which host serves the request.
const OG_URL = (() => {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const canonical = SETUP_CONFIG.canonicalOrigin?.trim();
  const envOrigin = process.env.PUBLIC_APP_ORIGIN?.trim();
  const chosen = isProduction
    ? canonical || envOrigin || ''
    : envOrigin || canonical || '';
  return chosen.replace(/\/$/, '');
})();

export const metadata: Metadata = {
  title: 'Cursor — Agentic automation for the stacks you already run',
  description: 'Cursor brings agentic automation to existing technology stacks. Run live workflows across Datadog, GitHub, Sentry, Snowflake, Databricks, AWS, GitLab, and Figma.',
  openGraph: {
    title: 'Cursor — Agentic automation for the stacks you already run',
    description: 'Cursor brings agentic automation to existing technology stacks.',
    type: 'website',
    url: OG_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
