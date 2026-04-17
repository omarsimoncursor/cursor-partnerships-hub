'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ArtifactFrameProps {
  title: string;
  subtitle?: string;
  accent?: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const SIZES = {
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
};

export function ArtifactFrame({
  title, subtitle, accent = '#29B5E8', onClose, children, size = 'lg',
}: ArtifactFrameProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 artifact-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-[#05080F]/85 backdrop-blur-md" />
      <div className="absolute top-0 left-0 right-0 h-[6vh] bg-black pointer-events-none letterbox-top" />
      <div className="absolute bottom-0 left-0 right-0 h-[6vh] bg-black pointer-events-none letterbox-bottom" />
      <div
        className={`relative w-full ${SIZES[size]} max-h-[88vh] rounded-2xl overflow-hidden border artifact-enter`}
        style={{
          borderColor: `${accent}35`,
          background: '#05080F',
          boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px ${accent}22, 0 0 80px ${accent}22`,
        }}
      >
        <header
          className="h-12 flex items-center gap-3 px-4 border-b"
          style={{ borderColor: `${accent}20`, background: `${accent}10` }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `${accent}25`, border: `1px solid ${accent}55` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-text-primary leading-tight truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-[10.5px] font-mono text-text-tertiary leading-tight truncate">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 cursor-pointer"
            aria-label="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(88vh - 48px)' }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        :global(.artifact-backdrop) { animation: backdropFade 260ms ease both; }
        :global(.artifact-enter) { animation: artifactRise 460ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        :global(.letterbox-top) { animation: letterTop 460ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        :global(.letterbox-bottom) { animation: letterBottom 460ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes backdropFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes artifactRise {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes letterTop { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes letterBottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
