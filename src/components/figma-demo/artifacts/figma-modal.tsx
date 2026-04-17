'use client';

import { X } from 'lucide-react';
import { MacbookFrame } from './macbook-frame';
import { FigmaFile } from './figma-file';
import { FigmaLogo } from './figma-logo';

interface FigmaModalProps {
  onClose: () => void;
}

export function FigmaModal({ onClose }: FigmaModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Header banner */}
      <div className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ background: 'rgba(162,89,255,0.18)', borderColor: 'rgba(162,89,255,0.35)' }}
          >
            <FigmaLogo size={14} />
          </div>
          <div>
            <p className="text-sm font-semibold">The source of truth</p>
            <p className="text-xs text-white/60">
              Marketing/Shop/ProductCard@2.3 · variables and 4 annotated drift pins
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

      {/* MacBook viewport */}
      <div className="flex-1 flex items-center justify-center p-8">
        <MacbookFrame url="figma.com/file/zk2NoMjP4xQwM9pq/Marketing--Shop--ProductCard">
          <FigmaFile />
        </MacbookFrame>
      </div>
    </div>
  );
}
