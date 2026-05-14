import type { Metadata } from 'next';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SETUP_CONFIG } from '@/lib/setup-config';
import './globals.css';

// Build-time origin used for the OG meta tag. Priority:
//   1. PUBLIC_APP_ORIGIN env var — runtime override, wins anywhere.
//   2. SETUP_CONFIG.canonicalOrigin — build-baked default per fork.
// originFromRequest() in api-auth.ts uses the same priority for the
// URLs the API embeds in responses, so og:url and demo_url stay in
// sync regardless of which host serves the request.
const OG_URL = (process.env.PUBLIC_APP_ORIGIN || SETUP_CONFIG.canonicalOrigin).replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Cursor Partnerships — Co-sell demos for strategic partners',
  description: 'Interactive co-sell demos showing how Cursor transforms partner tools into automated, agentic workflows across Databricks, Datadog, Figma, Sentry, Snowflake, and AWS.',
  openGraph: {
    title: 'Cursor Partnerships — Co-sell demos for strategic partners',
    description: 'Interactive co-sell demos for Cursor\'s strategic partners.',
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
