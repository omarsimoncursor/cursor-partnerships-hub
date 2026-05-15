'use client';

import { X, ShieldAlert } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { SnykIssue } from './snyk-issue';

interface SnykModalProps {
  onClose: () => void;
}

export function SnykModal({ onClose }: SnykModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#4C44CB]/30 border border-[#9F98FF]/40 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-[#9F98FF]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The finding that triggered the agent</p>
            <p className="text-xs text-white/60">
              Snyk Code flagged the NoSQL injection and fired the webhook to Cursor
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

      <div className="flex-1 flex items-center justify-center p-8">
        <MacbookFrame url="app.snyk.io/org/cursor-demos/project/cursor-for-enterprise/issues/SNYK-JS-CUSTOMER-PROFILE-001">
          <SnykIssue />
        </MacbookFrame>
      </div>
    </div>
  );
}
