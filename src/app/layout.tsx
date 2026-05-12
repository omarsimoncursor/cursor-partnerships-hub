import type { Metadata } from 'next';
import { ScrollToTop } from '@/components/scroll-to-top';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cursor Partnerships — Co-sell demos for strategic partners',
  description: 'Interactive co-sell demos showing how Cursor transforms partner tools into automated, agentic workflows across Databricks, Datadog, Figma, Sentry, Snowflake, and AWS.',
  openGraph: {
    title: 'Cursor Partnerships — Co-sell demos for strategic partners',
    description: 'Interactive co-sell demos for Cursor\'s strategic partners.',
    type: 'website',
    url: 'https://cursorpartners.omarsimon.com',
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
