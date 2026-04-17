'use client';

import { X, AlertTriangle } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { SentryIssue } from './sentry-issue';

interface SentryModalProps {
  onClose: () => void;
}

export function SentryModal({ onClose }: SentryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Header banner */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#362D59]/40 border border-[#b8a6ff]/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#b8a6ff]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The alert that triggered the agent</p>
            <p className="text-xs text-white/60">
              Sentry captured the exception and fired the webhook to Cursor
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Macbook viewport */}
      <div className="flex-1 flex items-center justify-center p-8">
        <MacbookFrame url="sentry.io/organizations/cursor-demos/issues/CURSOR-142/">
          <SentryIssue />
        </MacbookFrame>
      </div>
    </div>
  );
}
