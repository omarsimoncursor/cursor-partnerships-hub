'use client';

import { ReactNode } from 'react';

interface IPhoneFrameProps {
  children: ReactNode;
  label?: string;
  labelColor?: string;
}

export function IPhoneFrame({ children, label, labelColor = '#A259FF' }: IPhoneFrameProps) {
  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-xs uppercase tracking-wider mb-5 font-semibold" style={{ color: labelColor }}>
          {label}
        </p>
      )}
      <div className="relative">
        {/* Titanium outer frame */}
        <div
          className="rounded-[3.2rem] p-[2.5px] relative"
          style={{
            background: 'linear-gradient(165deg, #48484a, #1c1c1e 30%, #3a3a3c 50%, #1c1c1e 70%, #48484a)',
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.55),
              0 15px 35px rgba(0,0,0,0.4),
              0 0 0 0.5px rgba(255,255,255,0.08),
              inset 0 0.5px 0 rgba(255,255,255,0.15),
              inset 0 -0.5px 0 rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Inner bezel ring */}
          <div
            className="rounded-[3rem] p-[1.5px] relative"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.3))',
            }}
          >
            {/* Screen housing */}
            <div
              className="rounded-[2.9rem] overflow-hidden relative"
              style={{ width: '280px' }}
            >
              {/* Screen */}
              <div className="relative bg-[#000000]">
                {/* Status bar */}
                <div className="relative px-7 pt-[14px] pb-[6px] flex items-center justify-between">
                  <span className="text-[11px] text-white font-semibold tracking-tight w-12">9:41</span>

                  {/* Dynamic Island */}
                  <div
                    className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-10"
                    style={{
                      boxShadow: 'inset 0 0 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div className="absolute top-[9px] left-[28px] w-[9px] h-[9px] rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
                      <div className="absolute inset-[2px] rounded-full bg-[#0d2f4f]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-[5px] w-12 justify-end">
                    {/* Signal bars */}
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                      <rect x="0" y="8" width="3" height="3" rx="0.5" fill="white" />
                      <rect x="4" y="5.5" width="3" height="5.5" rx="0.5" fill="white" />
                      <rect x="8" y="3" width="3" height="8" rx="0.5" fill="white" />
                      <rect x="12" y="0" width="3" height="11" rx="0.5" fill="white" />
                    </svg>
                    {/* WiFi */}
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M7 9.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
                      <path d="M4.17 6.83a4 4 0 015.66 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M1.76 4.41a7 7 0 0110.49 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {/* Battery */}
                    <div className="flex items-center gap-[1px]">
                      <div className="w-[22px] h-[10px] rounded-[2.5px] border border-white/50 relative p-[1.5px]">
                        <div className="h-full rounded-[1px] bg-white" style={{ width: '85%' }} />
                      </div>
                      <div className="w-[1.5px] h-[4px] rounded-r-sm bg-white/50" />
                    </div>
                  </div>
                </div>

                {/* App content - fixed height so all iPhones render identical dimensions regardless of content length */}
                <div className="h-[560px] overflow-hidden">
                  {children}
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-[8px] pt-[6px]">
                  <div className="w-[120px] h-[4px] rounded-full bg-white/25" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side buttons */}
        {/* Silent switch */}
        <div
          className="absolute -left-[2px] top-[90px] w-[3px] h-[22px] rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #48484a, #2c2c2e)' }}
        />
        {/* Volume up */}
        <div
          className="absolute -left-[2px] top-[126px] w-[3px] h-[38px] rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #48484a, #2c2c2e)' }}
        />
        {/* Volume down */}
        <div
          className="absolute -left-[2px] top-[172px] w-[3px] h-[38px] rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #48484a, #2c2c2e)' }}
        />
        {/* Power button */}
        <div
          className="absolute -right-[2px] top-[142px] w-[3px] h-[55px] rounded-r-sm"
          style={{ background: 'linear-gradient(180deg, #48484a, #2c2c2e)' }}
        />

        {/* Subtle screen reflection */}
        <div
          className="absolute inset-0 rounded-[3.2rem] pointer-events-none z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.01) 100%)',
          }}
        />
      </div>
    </div>
  );
}
