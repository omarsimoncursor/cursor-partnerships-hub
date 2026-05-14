import type { Metadata } from 'next';
import { ScrollToTop } from '@/components/scroll-to-top';
import './globals.css';

// Build-time origin used for the OG meta tag. We read PUBLIC_APP_ORIGIN
// so that operators who deploy this template at their own subdomain
// (or who flip the canonical from cursorpartners.omarsimon.com to
// cursor.omarsimon.com) get a correct og:url without a code change.
// Falls back to the new canonical so a fresh fork that hasn't set
// the env var yet still renders a sensible value.
const OG_URL = (process.env.PUBLIC_APP_ORIGIN || 'https://cursor.omarsimon.com').replace(/\/$/, '');

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
