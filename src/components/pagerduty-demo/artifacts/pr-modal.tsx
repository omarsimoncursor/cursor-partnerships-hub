'use client';

import { UserCheck, X } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { GitHubPRPreview } from './github-pr-preview';

interface PrModalProps {
  onClose: () => void;
}

export function PrModal({ onClose }: PrModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold">Human in the loop</p>
            <p className="text-xs text-white/60">
              Revert auto-shipped at 0.93 confidence — the on-call still owns the merge
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
        <MacbookFrame url="github.com/acme-eng/payments-api/pull/318">
          <GitHubPRPreview />
        </MacbookFrame>
      </div>
    </div>
  );
}
