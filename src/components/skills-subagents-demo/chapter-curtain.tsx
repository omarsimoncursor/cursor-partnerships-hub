'use client';

import { useEffect, useState } from 'react';

interface ChapterCurtainProps {
  triggerKey: string | number;
}

export function ChapterCurtain({ triggerKey }: ChapterCurtainProps) {
  const [state, setState] = useState<'idle' | 'closing' | 'holding' | 'opening'>('idle');

  useEffect(() => {
    setState('closing');
    const t1 = setTimeout(() => setState('holding'), 260);
    const t2 = setTimeout(() => setState('opening'), 460);
    const t3 = setTimeout(() => setState('idle'), 820);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [triggerKey]);

  const active = state !== 'idle';
  const closed = state === 'closing' || state === 'holding';

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[60] pointer-events-none ${active ? '' : 'opacity-0'}`}
    >
      <div
        className="absolute left-0 right-0 top-0 bg-[#05060B] transition-[height] duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          height: closed ? 'calc(50% + 1px)' : '0%',
          boxShadow: closed ? '0 4px 24px rgba(167,139,250,0.10)' : 'none',
        }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 bg-[#05060B] transition-[height] duration-[420ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          height: closed ? 'calc(50% + 1px)' : '0%',
          boxShadow: closed ? '0 -4px 24px rgba(167,139,250,0.10)' : 'none',
        }}
      />
      <div
        className={`absolute left-0 right-0 top-1/2 h-px bg-[#A78BFA]/60 transition-opacity duration-200 ${
          state === 'holding' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ boxShadow: '0 0 24px rgba(167,139,250,0.7)' }}
      />
    </div>
  );
}
