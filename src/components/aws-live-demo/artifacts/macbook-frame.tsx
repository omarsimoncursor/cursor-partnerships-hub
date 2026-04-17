'use client';

import { type ReactNode } from 'react';

interface MacbookFrameProps {
  children: ReactNode;
  url?: string;
}

export function MacbookFrame({
  children,
  url = 'github.com/cursor/partnerships-hub/pull/482',
}: MacbookFrameProps) {
  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <div className="relative">
        <div
          className="relative rounded-t-2xl p-2 pb-0 shadow-2xl"
          style={{ background: 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)' }}
        >
          <div
            className="relative rounded-t-xl overflow-hidden border-[3px] border-[#0a0a0a]"
            style={{ background: '#000' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-32 h-5 bg-black rounded-b-xl flex items-center justify-center gap-1">
              <div className="w-1 h-1 rounded-full bg-[#1a1a1a]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] ring-1 ring-[#2a2a2a]" />
            </div>

            <div className="bg-[#161b22] border-b border-[#30363d] pt-5 pb-2 px-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1">
                  <span className="text-[#3fb950] text-[11px]">●</span>
                  <span className="text-[12px] text-[#7d8590] font-mono truncate">{url}</span>
                </div>
              </div>
              <div className="w-12" />
            </div>

            <div className="max-h-[76vh] min-h-[520px] overflow-y-auto">{children}</div>
          </div>
        </div>

        <div
          className="relative h-4 rounded-b-[28px]"
          style={{ background: 'linear-gradient(180deg, #1c1c1e 0%, #0e0e0f 100%)' }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-black/40" />
        </div>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[80%] h-3 bg-black/60 blur-xl rounded-full" />
      </div>
    </div>
  );
}
