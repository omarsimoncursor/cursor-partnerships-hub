'use client';

import { useEffect, useState } from 'react';
import { Database, ShieldCheck, Zap } from 'lucide-react';

/**
 * Chapter 5 — Re-running the exploit.
 *
 * Same vault as chapter 1, but this time a glowing wall sits between the
 * vault and the would-be leaked cards. Cards launch from the vault, hit
 * the wall, and bounce back into nothing. Counter ticks 12 → 0. A green
 * "Exploit blocked" stamp lands at the end. Plain English: the same
 * attack is fired and the new patch makes it bounce.
 */

const ATTACK_BURSTS = 12;

export function ReplayScene() {
  const [counterText, setCounterText] = useState('12');
  const [blockedStamp, setBlockedStamp] = useState(false);

  useEffect(() => {
    // Start at 12 (the v1 leak count), then tick down to 0 over 1.4s.
    const t1 = setTimeout(() => {
      let v = 12;
      const id = setInterval(() => {
        v = Math.max(0, v - 2);
        setCounterText(String(v));
        if (v <= 0) clearInterval(id);
      }, 120);
    }, 1500);
    const t2 = setTimeout(() => setBlockedStamp(true), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <style jsx>{`
        @keyframes attack {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translate(140px, var(--ay)) scale(1); opacity: 1; }
          75% { transform: translate(40px, var(--ay)) scale(0.6); opacity: 0.6; }
          100% { transform: translate(0px, var(--ay)) scale(0.4); opacity: 0; }
        }
        @keyframes wallGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
          50% { box-shadow: 0 0 24px 4px rgba(74,222,128,0.45); }
        }
        @keyframes wallShield {
          0%, 100% { background: rgba(74,222,128,0.16); }
          50% { background: rgba(74,222,128,0.30); }
        }
        @keyframes blockedStamp {
          0% { opacity: 0; transform: scale(0.4) rotate(-8deg); }
          70% { opacity: 1; transform: scale(1.15) rotate(-8deg); }
          100% { opacity: 1; transform: scale(1) rotate(-8deg); }
        }
        @keyframes counterTick {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      {/* Vault on the left */}
      <div className="absolute top-1/2 -translate-y-1/2 left-10 flex items-center gap-3">
        <div
          className="w-28 h-32 rounded-md border-2 flex items-center justify-center"
          style={{ background: '#0A0B23', borderColor: '#23264F' }}
        >
          <Database className="w-8 h-8" style={{ color: '#5A5A78' }} />
        </div>
        <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
          Customer<br />database
        </p>
      </div>

      {/* Attack pulses originating from the vault and bouncing back */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[230px] w-[200px] h-[180px] pointer-events-none">
        {Array.from({ length: ATTACK_BURSTS }).map((_, i) => {
          const ay = -50 + (i % 5) * 22;
          const delay = 200 + i * 220;
          return (
            <span
              key={i}
              className="absolute top-1/2 left-0 inline-flex items-center gap-1 text-[10px] font-mono"
              style={{
                ['--ay' as string]: `${ay}px`,
                animation: `attack 1100ms ease-out ${delay}ms backwards`,
                opacity: 0,
                color: '#FB7185',
              }}
            >
              <Zap className="w-3 h-3" />
              attack
            </span>
          );
        })}
      </div>

      {/* The wall — vertical green shimmering bar */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[400px]">
        <div className="relative">
          <div
            className="w-3 h-44 rounded-full"
            style={{
              animation: 'wallShield 1400ms ease-in-out infinite, wallGlow 1400ms ease-in-out infinite',
              background: 'rgba(74,222,128,0.16)',
            }}
          />
          {/* Shield icon over the wall */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(74,222,128,0.18)',
              border: '2px solid rgba(74,222,128,0.55)',
              boxShadow: '0 0 24px rgba(74,222,128,0.35)',
            }}
          >
            <ShieldCheck className="w-6 h-6" style={{ color: '#4ADE80' }} />
          </div>
          <p
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10.5px] font-mono uppercase tracking-wider whitespace-nowrap"
            style={{ color: '#4ADE80' }}
          >
            new check
          </p>
        </div>
      </div>

      {/* Counter on the right + stamp */}
      <div className="absolute top-1/2 -translate-y-1/2 right-10 flex flex-col items-center gap-3">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(74,222,128,0.10)',
            border: '2px solid rgba(74,222,128,0.50)',
            boxShadow: '0 0 32px rgba(74,222,128,0.25)',
          }}
        >
          <ShieldCheck className="w-9 h-9" style={{ color: '#4ADE80' }} />
        </div>
        <div className="text-center">
          <p
            key={counterText}
            className="text-3xl font-bold font-mono"
            style={{
              color: counterText === '0' ? '#4ADE80' : '#FB7185',
              animation: 'counterTick 220ms ease-out',
            }}
          >
            {counterText}
          </p>
          <p
            className="text-[11px] font-mono uppercase tracking-wider"
            style={{ color: counterText === '0' ? '#4ADE80' : '#FB7185' }}
          >
            records leaked
          </p>
        </div>

        {blockedStamp && (
          <span
            className="absolute -bottom-2 right-0 px-2.5 py-1 rounded font-mono text-[10.5px] font-bold uppercase tracking-wider"
            style={{
              background: '#4ADE80',
              color: '#04200E',
              animation: 'blockedStamp 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            exploit blocked
          </span>
        )}
      </div>
    </div>
  );
}
