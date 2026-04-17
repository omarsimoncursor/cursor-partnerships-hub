'use client';

import { X, Activity } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { DatadogTrace } from './datadog-trace';

interface DatadogModalProps {
  onClose: () => void;
}

export function DatadogModal({ onClose }: DatadogModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Header banner */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#632CA6]/30 border border-[#A689D4]/40 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#A689D4]" />
          </div>
          <div>
            <p className="text-sm font-semibold">The trace that triggered the agent</p>
            <p className="text-xs text-white/60">
              Datadog captured the SLO breach and fired the webhook to Cursor
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
        <MacbookFrame url="app.datadoghq.com/apm/trace/8b2e19f4c3d74a9f">
          <DatadogTrace />
        </MacbookFrame>
      </div>
    </div>
  );
}
