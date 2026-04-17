'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function ArtifactModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  accent = '#FF9900',
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  accent?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-white shadow-2xl"
        style={{ borderColor: 'rgba(17,24,39,0.12)' }}
      >
        <header
          className="flex items-center gap-3 border-b px-5 py-3"
          style={{ background: '#F9FAFB', borderColor: 'rgba(17,24,39,0.08)' }}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</div>
            {subtitle && <div className="text-[11px]" style={{ color: '#6B7280' }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" style={{ color: '#374151' }} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
