'use client';

import Link from 'next/link';
import { Footer } from '@/components/layout/footer';
import { Partnerships } from '@/components/sections/partnerships';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

// The site is now served as a partnerships hub — the root URL ("/")
// renders what used to live at "/partnerships". The /partnerships route
// still exists and renders the same content for anyone with a direct
// link. The other top-level pages (technical-buyers, non-technical-
// buyers, prospects/*, roi/*) are intentionally kept but unlinked from
// the (now-concealed) nav.
export default function Home() {
  useSmoothScroll();

  return (
    <>
      <main>
        <div className="pt-28 pb-12 px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary mb-4">
              Cursor Gives Partners Agentic Superpowers. Partners Give Cursor Access to Large Customers. Customers Increase ROI from Existing Toolsets.
            </h1>
            <p className="text-lg text-text-secondary max-w-3xl">
              Cursor transforms the tools enterprises already use into automated, agentic workflows. This creates a rare three-way value exchange that makes co-selling effortless. Below are ready-to-implement co-sell motions for a number of key partners that&apos;ll get Cursor in front of large enterprise buyers faster than any cold outreach ever could.
            </p>
            <div className="mt-8">
              <Link
                href="/tools/demo-pack"
                className="inline-flex items-center text-sm font-medium text-accent-blue hover:text-accent-blue/90 underline-offset-4 hover:underline"
              >
                Build a branded account demo pack (internal)
              </Link>
            </div>
          </div>
        </div>
        <Partnerships />
      </main>
      <Footer />
    </>
  );
}
