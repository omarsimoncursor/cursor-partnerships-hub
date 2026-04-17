'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Partnerships } from '@/components/sections/partnerships';
import { NextStrategy } from '@/components/ui/next-strategy';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PartnershipsPage() {
  useSmoothScroll();

  return (
    <>
      <Navbar />
      <main>
        <div className="pt-28 pb-12 px-6">
          <div className="max-w-5xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary mb-4">
              Cursor Gives Partners Agentic Superpowers. Partners Give Cursor Access to Large Customers. Customers Increase ROI from Existing Toolsets.
            </h1>
            <p className="text-lg text-text-secondary max-w-3xl">
              Cursor transforms the tools enterprises already use into automated, agentic workflows. This creates a rare three-way value exchange that makes co-selling effortless. Below are ready-to-implement co-sell motions for a number of key partners designed to get Cursor in front of large enterprise buyers faster than any cold outreach ever could.
            </p>
          </div>
        </div>
        <Partnerships />
        <NextStrategy
          href="/"
          label="Back to Territory Plan Homepage"
          description="Return to the full enterprise sales strategy overview."
          color="#f97316"
          isHome
          example={{
            href: '/partnerships/datadog',
            label: 'Check out the Datadog Co-Sell Demo',
            color: '#a78bfa',
          }}
        />
      </main>
      <Footer />
    </>
  );
}
