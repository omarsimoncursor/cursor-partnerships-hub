'use client';

import { X, Cloud } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { AwsConsole } from './aws-console';

interface AwsModalProps {
  onClose: () => void;
}

export function AwsModal({ onClose }: AwsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#FF9900]/20 border border-[#FF9900]/40 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-[#FF9900]" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              The AWS Console the SA will screenshot into the QBR
            </p>
            <p className="text-xs text-white/60">
              orders-prod · us-east-1 · cutover Day 17 · 4 / 4 review gates · least-priv IAM · Well-Architected 6-pillar
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
        <MacbookFrame url="us-east-1.console.aws.amazon.com/cloudwatch/home#dashboards:name=orders-dev">
          <AwsConsole />
        </MacbookFrame>
      </div>
    </div>
  );
}
