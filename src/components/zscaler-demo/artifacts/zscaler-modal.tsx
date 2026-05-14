'use client';

import { X, ShieldCheck } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { ZscalerConsole } from './zscaler-console';

interface ZscalerModalProps {
  onClose: () => void;
}

export function ZscalerModal({ onClose }: ZscalerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Header banner */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#0079D5]/30 border border-[#65B5F2]/40 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#65B5F2]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The risk event that triggered the agent</p>
            <p className="text-xs text-white/60">
              Zscaler ZPA flagged the over-permissive policy and fired the webhook to Cursor
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
        <MacbookFrame url="admin.zscaler.net/zpa/policy/ZTA-pol-9921/risk/evt-21794">
          <ZscalerConsole />
        </MacbookFrame>
      </div>
    </div>
  );
}
