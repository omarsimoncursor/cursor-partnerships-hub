'use client';

import { useEffect, useState } from 'react';
import { Database, ShieldAlert, User } from 'lucide-react';

/**
 * Chapter 1 — Looking at the leak.
 *
 * Vault opens, customer cards spill out, red shield arrives at the right,
 * "12 records leaked" counter ticks up. Tells a non-technical viewer:
 * "the database just gave away every customer".
 */

const CARDS = Array.from({ length: 12 }, (_, i) => i);
const TARGET = 12;

export function LeakScene() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setCount(i);
      if (i >= TARGET) clearInterval(t);
    }, 220);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full">
      <style jsx>{`
        @keyframes vaultOpen {
          0% { transform: rotateY(0deg); }
          18% { transform: rotateY(-95deg); }
          100% { transform: rotateY(-95deg); }
        }
        @keyframes cardSpill {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
          18% { opacity: 1; }
          70% { opacity: 1; }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(1);
            opacity: 1;
          }
        }
        @keyframes shieldArrive {
          0% { transform: translate(40px, 0) scale(0.6); opacity: 0; }
          60% { opacity: 0; }
          100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        @keyframes counterPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>

      {/* Vault on the left */}
      <div className="absolute top-1/2 -translate-y-1/2 left-10 flex items-center gap-3">
        <div className="relative">
          {/* Vault body */}
          <div
            className="w-28 h-32 rounded-md border-2 flex items-center justify-center"
            style={{ background: '#0A0B23', borderColor: '#23264F' }}
          >
            <Database className="w-8 h-8" style={{ color: '#5A5A78' }} />
          </div>
          {/* Vault door, swings open */}
          <div
            className="absolute inset-0 rounded-md border-2 origin-left flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2A2A3A, #1A1C40)',
              borderColor: '#3A3A55',
              animation: 'vaultOpen 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: '#5A5A78' }} />
          </div>
        </div>
        <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#7C7CA0' }}>
          Customer<br />database
        </p>
      </div>

      {/* Spilled cards */}
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[280px] h-[200px]">
        {CARDS.map(i => {
          const tx = -80 + (i % 4) * 60;
          const ty = -60 + Math.floor(i / 4) * 60;
          const r = (i * 17) % 24 - 12;
          const delay = 1000 + i * 90;
          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-14 h-9 rounded-md border flex items-center gap-1 px-1.5"
              style={{
                background: '#13142F',
                borderColor: 'rgba(225,29,72,0.5)',
                ['--tx' as string]: `${tx}px`,
                ['--ty' as string]: `${ty}px`,
                ['--r' as string]: `${r}deg`,
                animation: `cardSpill 700ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms forwards`,
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.6)',
                marginLeft: -28,
                marginTop: -18,
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.6)',
              }}
            >
              <User className="w-3 h-3 shrink-0" style={{ color: '#FB7185' }} />
              <div className="flex-1 min-w-0">
                <div className="h-1 rounded-sm w-full mb-0.5" style={{ background: 'rgba(225,29,72,0.4)' }} />
                <div className="h-1 rounded-sm w-2/3" style={{ background: 'rgba(225,29,72,0.25)' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Shield + counter on the right */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-10 flex flex-col items-center gap-3"
        style={{ animation: 'shieldArrive 900ms cubic-bezier(0.34, 1.56, 0.64, 1) 1500ms backwards' }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(225,29,72,0.10)',
            border: '2px solid rgba(225,29,72,0.50)',
            boxShadow: '0 0 32px rgba(225,29,72,0.25)',
          }}
        >
          <ShieldAlert className="w-9 h-9" style={{ color: '#FB7185' }} />
        </div>
        <div className="text-center">
          <p
            className="text-3xl font-bold font-mono"
            style={{
              color: '#FB7185',
              animation: count > 0 && count < TARGET ? 'counterPulse 220ms ease-out' : undefined,
            }}
            key={count}
          >
            {count}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#FB7185' }}>
            records leaked
          </p>
        </div>
      </div>
    </div>
  );
}
