'use client';

import { X, Flame } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { DatabricksWorkspace } from './databricks-workspace';

interface DatabricksModalProps {
  onClose: () => void;
}

export function DatabricksModal({ onClose }: DatabricksModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Header banner */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#FF3621]/30 border border-[#FF3621]/45 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#FF9A8A]" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              The Databricks workspace the agent just produced
            </p>
            <p className="text-xs text-white/60">
              DLT pipeline · Unity Catalog · Photon · row delta 0 against the Oracle source
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
        <MacbookFrame url="acme.cloud.databricks.com/#pipelines/customer_rfm_pipeline">
          <DatabricksWorkspace />
        </MacbookFrame>
      </div>
    </div>
  );
}
