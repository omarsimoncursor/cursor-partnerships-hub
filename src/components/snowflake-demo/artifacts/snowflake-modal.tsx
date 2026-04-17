'use client';

import { X, Snowflake } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { SnowsightWorkspace } from './snowsight-workspace';

interface SnowflakeModalProps {
  onClose: () => void;
}

export function SnowflakeModal({ onClose }: SnowflakeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#29B5E8]/25 border border-[#29B5E8]/40 flex items-center justify-center">
            <Snowflake className="w-4 h-4 text-[#7DD3F5]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The Snowsight workspace that caught the drift</p>
            <p className="text-xs text-white/60">
              Snowflake triggered the audit · Cortex verified semantic equivalence · dbt shipped the rollup
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
        <MacbookFrame url="app.snowflake.com/acme-analytics/us-east-1.aws/worksheets/dbt-runs/fct_daily_revenue">
          <SnowsightWorkspace />
        </MacbookFrame>
      </div>
    </div>
  );
}
