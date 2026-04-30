'use client';

import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { MacbookFrame } from '@/components/datadog-demo/artifacts/macbook-frame';

interface ArtifactModalProps {
  onClose: () => void;
  title: string;
  subtitle?: string;
  url?: string;
  icon?: ReactNode;
  iconBg?: string;
  iconBorder?: string;
  iconColor?: string;
  children: ReactNode;
}

export function ArtifactModal({
  onClose,
  title,
  subtitle,
  url,
  icon,
  iconBg = 'bg-accent-blue/30',
  iconBorder = 'border-accent-blue/40',
  iconColor = 'text-accent-blue',
  children,
}: ArtifactModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          {icon && (
            <div
              className={`w-8 h-8 rounded-lg ${iconBg} border ${iconBorder} ${iconColor} flex items-center justify-center`}
            >
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <MacbookFrame url={url}>{children}</MacbookFrame>
      </div>
    </div>
  );
}
