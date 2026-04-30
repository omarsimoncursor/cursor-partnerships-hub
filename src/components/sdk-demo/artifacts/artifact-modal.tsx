'use client';

import { type ReactNode } from 'react';
import { Eye, Lightbulb, X } from 'lucide-react';
import { MacbookFrame } from '@/components/datadog-demo/artifacts/macbook-frame';
import { cn } from '@/lib/utils';

export type ArtifactFrameMode = 'macbook' | 'browser' | 'document';

interface ArtifactModalProps {
  onClose: () => void;
  title: string;
  subtitle?: string;
  url?: string;
  icon?: ReactNode;
  iconBg?: string;
  iconBorder?: string;
  iconColor?: string;
  /**
   * Plain-English context strip shown immediately above the artifact:
   *   what — one sentence describing what the artifact is
   *   who  — short label identifying who in the audience reads this
   *   why  — one sentence describing why it matters
   */
  whatIsThis?: { what: string; who: string; why: string };
  frame?: ArtifactFrameMode;
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
  whatIsThis,
  frame = 'macbook',
  children,
}: ArtifactModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 text-white">
          {icon && (
            <div
              className={`w-9 h-9 rounded-lg ${iconBg} border ${iconBorder} ${iconColor} flex items-center justify-center`}
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

      {whatIsThis && (
        <div className="shrink-0 px-6 py-3 border-b border-white/5 bg-white/[0.015]">
          <div className="max-w-5xl mx-auto flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-accent-amber/15 border border-accent-amber/30 text-accent-amber flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent-amber mb-1">
                In plain English
              </p>
              <p className="text-[13px] text-white/90 leading-relaxed">
                <span className="font-semibold">{whatIsThis.what}</span>{' '}
                <span className="text-white/60">{whatIsThis.why}</span>
              </p>
              <p className="text-[11px] text-white/50 mt-1 inline-flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Who reads this: <span className="text-white/80">{whatIsThis.who}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex-1 flex items-stretch justify-center',
          frame === 'macbook' ? 'p-8 items-center' : 'p-4 md:p-6',
        )}
      >
        {frame === 'macbook' && <MacbookFrame url={url}>{children}</MacbookFrame>}
        {frame === 'browser' && <BrowserFrame url={url}>{children}</BrowserFrame>}
        {frame === 'document' && <DocumentFrame>{children}</DocumentFrame>}
      </div>
    </div>
  );
}

function BrowserFrame({ children, url }: { children: ReactNode; url?: string }) {
  return (
    <div className="w-full max-w-[1440px] mx-auto rounded-lg overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-[#0d1117] flex flex-col">
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1">
            <span className="text-[#3fb950] text-[10px]">●</span>
            <span className="text-[12px] text-[#7d8590] font-mono truncate">
              {url ?? 'app.example.com'}
            </span>
          </div>
        </div>
        <div className="w-12 shrink-0" />
      </div>
      <div className="min-h-[560px] max-h-[78vh] overflow-y-auto">{children}</div>
    </div>
  );
}

function DocumentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[920px] mx-auto rounded-lg overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white text-[#111] flex flex-col">
      <div className="border-b border-[#e5e5e5] bg-[#fafafa] px-5 py-2 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <p className="text-[12px] text-[#666] font-mono truncate">audit-timeline · markdown preview</p>
      </div>
      <div className="min-h-[560px] max-h-[78vh] overflow-y-auto">{children}</div>
    </div>
  );
}
