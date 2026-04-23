'use client';

import { Phone, X } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { PagerdutyIncident } from './pagerduty-incident';

interface PagerdutyModalProps {
  onClose: () => void;
}

export function PagerdutyModal({ onClose }: PagerdutyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#06AC38]/30 border border-[#57D990]/40 flex items-center justify-center">
            <Phone className="w-4 h-4 text-[#57D990]" fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-semibold">The page that didn&apos;t fire</p>
            <p className="text-xs text-white/60">
              Cursor ack&apos;d, triaged, reverted, and resolved — full audit trail in PagerDuty
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
        <MacbookFrame url="acme-eng.pagerduty.com/incidents/INC-21487">
          <PagerdutyIncident />
        </MacbookFrame>
      </div>
    </div>
  );
}
