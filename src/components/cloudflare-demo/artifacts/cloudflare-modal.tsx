'use client';

import { Activity, X } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { CloudflareAttackDetail } from './cloudflare-attack-detail';

interface CloudflareModalProps {
  onClose: () => void;
}

export function CloudflareModal({ onClose }: CloudflareModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#F38020]/20 border border-[#F38020]/40 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#FAAE40]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The attack-detail view, after-state</p>
            <p className="text-xs text-white/60">
              Three layers landed by cursor-agent. Pill flipped from Active Attack to Mitigated · Monitoring.
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
        <MacbookFrame url="dash.cloudflare.com/acme-corp/acme-app.com/security/events/cf-2026-04-23-2342">
          <CloudflareAttackDetail />
        </MacbookFrame>
      </div>
    </div>
  );
}
