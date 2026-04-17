'use client';

import { X, UserCheck } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { GitHubPRPreview } from './github-pr-preview';

interface PrModalProps {
  onClose: () => void;
}

export function PrModal({ onClose }: PrModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Header banner */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ background: 'rgba(162,89,255,0.18)', borderColor: 'rgba(162,89,255,0.35)' }}
          >
            <UserCheck className="w-4 h-4" style={{ color: '#D6BBFF' }} />
          </div>
          <div>
            <p className="text-sm font-semibold">Human in the loop</p>
            <p className="text-xs text-white/60">
              Review, approve, and merge — the agent never ships code on its own
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
        <MacbookFrame url="github.com/cursor/partnerships-hub/pull/163">
          <GitHubPRPreview />
        </MacbookFrame>
      </div>
    </div>
  );
}
