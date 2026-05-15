'use client';

import { Shield, X } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { WafRuleDiff } from './waf-rule-diff';

interface WafModalProps {
  onClose: () => void;
}

export function WafModal({ onClose }: WafModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#F38020]/20 border border-[#F38020]/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#FAAE40]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The WAF rule the agent shipped</p>
            <p className="text-xs text-white/60">
              Log mode → 60s observation → Block. Auto-rollback on first false positive.
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
        <MacbookFrame url="dash.cloudflare.com/acme-corp/acme-app.com/security/waf/custom-rules">
          <WafRuleDiff />
        </MacbookFrame>
      </div>
    </div>
  );
}
