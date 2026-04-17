'use client';

import { ReactNode } from 'react';

type Finish = 'space-black' | 'silver';

interface MacBookFrameProps {
  children: ReactNode;
  label?: string;
  labelColor?: string;
  finish?: Finish;
  width?: number;
}

const FINISHES: Record<Finish, { lid: string; keyboard: string; trackpad: string; keys: string; bezel: string }> = {
  'space-black': {
    lid: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 35%, #0e0e10 60%, #1a1a1c 100%)',
    keyboard: 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)',
    trackpad: 'linear-gradient(180deg, #18181a 0%, #0e0e10 100%)',
    keys: '#18181a',
    bezel: '#0a0a0a',
  },
  silver: {
    lid: 'linear-gradient(160deg, #d1d1d3 0%, #b4b4b6 35%, #8c8c8e 60%, #b4b4b6 100%)',
    keyboard: 'linear-gradient(180deg, #d4d4d6 0%, #a8a8aa 100%)',
    trackpad: 'linear-gradient(180deg, #c8c8ca 0%, #a0a0a2 100%)',
    keys: '#e6e6e8',
    bezel: '#1a1a1a',
  },
};

export function MacBookFrame({
  children,
  label,
  labelColor = '#60A5FA',
  finish = 'space-black',
  width = 720,
}: MacBookFrameProps) {
  const f = FINISHES[finish];
  const lidWidth = width;
  const screenWidth = lidWidth - 28;
  const screenHeight = Math.round(screenWidth * 0.63);
  const keyboardWidth = lidWidth + 40;
  const keyboardHeight = 28;

  return (
    <div className="flex flex-col items-center">
      {label && (
        <p className="text-xs uppercase tracking-wider mb-5 font-semibold" style={{ color: labelColor }}>
          {label}
        </p>
      )}

      <div className="relative" style={{ width: keyboardWidth }}>
        {/* Lid (display) */}
        <div
          className="relative mx-auto rounded-[14px] p-[14px]"
          style={{
            width: lidWidth,
            background: f.lid,
            boxShadow: `
              0 30px 60px rgba(0,0,0,0.5),
              0 8px 20px rgba(0,0,0,0.35),
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -1px 0 rgba(0,0,0,0.4)
            `,
          }}
        >
          {/* Screen */}
          <div
            className="relative rounded-[6px] overflow-hidden"
            style={{
              width: screenWidth,
              background: f.bezel,
            }}
          >
            {/* Notch */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-20 rounded-b-[8px]"
              style={{
                width: 120,
                height: 18,
                background: f.bezel,
              }}
            >
              <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full bg-[#0a0a0a] border border-[#1a1a1a]">
                <div className="absolute inset-[1.5px] rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #2a3a5a 0%, #0a0a1a 60%)' }} />
              </div>
            </div>

            {/* Actual screen content area */}
            <div
              className="relative overflow-hidden bg-[#0a0a0a]"
              style={{
                marginTop: 4,
                marginLeft: 4,
                marginRight: 4,
                marginBottom: 4,
                width: screenWidth - 8,
                height: screenHeight,
                borderRadius: 3,
              }}
            >
              {children}
              {/* Subtle screen reflection overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(125deg, rgba(255,255,255,0.04) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.02) 100%)',
                }}
              />
            </div>
          </div>

          {/* Apple logo reflection (subtle) - on the lid top bar above notch */}
          <div className="absolute bottom-[3px] left-1/2 -translate-x-1/2 text-[9px] font-medium opacity-50" style={{ color: finish === 'silver' ? '#555' : '#aaa' }}>
          </div>
        </div>

        {/* Hinge shadow */}
        <div
          className="mx-auto"
          style={{
            width: lidWidth - 8,
            height: 4,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
            borderRadius: '0 0 2px 2px',
          }}
        />

        {/* Keyboard base */}
        <div
          className="relative mx-auto"
          style={{
            width: keyboardWidth,
            height: keyboardHeight,
            background: f.keyboard,
            borderRadius: '4px 4px 14px 14px',
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.45),
              0 4px 10px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -1px 2px rgba(0,0,0,0.4)
            `,
          }}
        >
          {/* Indented lip at the front for opening the lid */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-md"
            style={{
              width: 90,
              height: 5,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1))',
            }}
          />
          {/* Front edge highlight */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        </div>

        {/* Desk shadow under laptop */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none"
          style={{
            width: keyboardWidth * 0.9,
            height: 24,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      </div>
    </div>
  );
}
