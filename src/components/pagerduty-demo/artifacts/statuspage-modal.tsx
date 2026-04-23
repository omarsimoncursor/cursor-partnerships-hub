'use client';

import { Globe, X } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { StatuspageUpdate } from './statuspage-update';

interface StatuspageModalProps {
  onClose: () => void;
}

export function StatuspageModal({ onClose }: StatuspageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#3DB46D]/20 border border-[#3DB46D]/40 flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#3DB46D]" />
          </div>
          <div>
            <p className="text-sm font-semibold">Customer-facing Statuspage update</p>
            <p className="text-xs text-white/60">
              Three updates posted automatically · brand-voice template enforced
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
        <MacbookFrame url="status.acme.com/payments-api">
          <StatuspageUpdate />
        </MacbookFrame>
      </div>
    </div>
  );
}
