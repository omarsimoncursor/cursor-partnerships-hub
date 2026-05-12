import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CursorSdkLiveDemo } from '@/components/sdk-demo/cursor-sdk-live-demo';

export default function CursorSdkDemoPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-30 py-4 px-6 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/partnerships/cursor-sdk"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SDK overview
          </Link>
          <span className="text-sm text-text-tertiary font-mono">Live SDK Demo</span>
        </div>
      </nav>

      <main className="pt-20 pb-16">
        <div className="px-6">
          <div className="max-w-6xl mx-auto">
            <CursorSdkLiveDemo />
          </div>
        </div>
      </main>
    </div>
  );
}
