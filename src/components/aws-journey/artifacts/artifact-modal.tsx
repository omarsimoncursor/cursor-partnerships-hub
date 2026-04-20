'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function ArtifactModal({
  open,
  onClose,
  children,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Used for the dialog's accessible name. */
  ariaLabel: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  /*
   * Rendered through a portal into document.body so the modal can't be
   * trapped by a transformed ancestor (ActTransition applies a transform
   * that would otherwise turn `position: fixed` into a local containing
   * block and hide the modal behind the act content).
   *
   * Each artifact provides its own MacBook + browser chrome — the modal here
   * is just a positioned scroll container plus a close affordance.
   */
  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-5xl"
      >
        {/* Close button — floats just outside the laptop frame */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 right-0 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] shadow-lg transition-transform hover:-translate-y-0.5 md:-right-3 md:-top-4"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
          <span>Close</span>
        </button>
        {children}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
