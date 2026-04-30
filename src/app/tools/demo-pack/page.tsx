'use client';

import { Suspense } from 'react';
import { DemoPackBuilderContent } from './demo-pack-builder-content';

export default function DemoPackBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 px-6 text-center text-sm text-text-tertiary">
          Loading demo pack builder…
        </div>
      }
    >
      <DemoPackBuilderContent />
    </Suspense>
  );
}
