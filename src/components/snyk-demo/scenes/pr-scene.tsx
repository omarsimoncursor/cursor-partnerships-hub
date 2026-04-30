'use client';

import { useEffect, useState } from 'react';
import { Check, FileCode2, GitPullRequest, Loader2, ShieldCheck } from 'lucide-react';

/**
 * Chapter 6 — Opening the pull request.
 *
 * A PR card slides in. The "Files changed" list ticks green one row at a
 * time. Then the "Checks" list ticks green one row at a time. Finally a
 * "Ready for review" stamp lands. Plain English: a clean, complete PR
 * is now sitting in front of a human reviewer.
 */

const FILES = [
  'customer-profile.ts',
  'customer-profile.test.ts',
  'package.json',
];

const CHECKS = [
  'Type check',
  'Lint',
  'Tests',
  'Snyk re-test',
  'Exploit replay',
];

interface PrSceneProps {
  /** When set, renders the final completed state without re-animating. */
  done?: boolean;
}

export function PrScene({ done = false }: PrSceneProps) {
  const [filesGreen, setFilesGreen] = useState(done ? FILES.length : 0);
  const [checksGreen, setChecksGreen] = useState(done ? CHECKS.length : 0);
  const [stampOn, setStampOn] = useState(done);

  useEffect(() => {
    if (done) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Tick files in 0..N
    FILES.forEach((_, i) => {
      timers.push(setTimeout(() => setFilesGreen(i + 1), 700 + i * 240));
    });
    // Tick checks in
    CHECKS.forEach((_, i) => {
      timers.push(setTimeout(() => setChecksGreen(i + 1), 1700 + i * 320));
    });
    timers.push(setTimeout(() => setStampOn(true), 1700 + CHECKS.length * 320 + 200));

    return () => timers.forEach(clearTimeout);
  }, [done]);

  return (
    <div className="relative w-full h-full flex items-center justify-center px-8">
      <style jsx>{`
        @keyframes prSlideIn {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowGreen {
          0% { background: rgba(76,68,203,0.06); }
          100% { background: rgba(74,222,128,0.10); }
        }
        @keyframes checkPop {
          0% { opacity: 0; transform: scale(0.4); }
          70% { opacity: 1; transform: scale(1.18); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes stampLand {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(2.4) rotate(-12deg); }
          70% { opacity: 1; transform: translate(-50%, -50%) scale(1.05) rotate(-12deg); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-12deg); }
        }
      `}</style>

      <div
        className="relative w-full max-w-2xl rounded-xl border overflow-hidden"
        style={{
          background: '#0A0B23',
          borderColor: '#23264F',
          animation: done ? undefined : 'prSlideIn 500ms ease-out',
        }}
      >
        {/* PR header */}
        <div
          className="px-4 py-3 flex items-center gap-3 border-b"
          style={{ background: '#13142F', borderColor: '#23264F' }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(31,111,235,0.18)', color: '#4493f8', border: '1px solid rgba(31,111,235,0.40)' }}
          >
            <GitPullRequest className="w-3 h-3" /> Open
          </span>
          <p className="text-[12.5px] font-medium text-text-primary truncate flex-1">
            Patch customer profile lookup &amp; bump mongoose
          </p>
          <span className="text-[11px] font-mono" style={{ color: '#7C7CA0' }}>
            #214
          </span>
        </div>

        {/* Body: two columns */}
        <div className="grid grid-cols-2 gap-0">
          {/* Files changed */}
          <div className="p-4 border-r" style={{ borderColor: '#23264F' }}>
            <p className="text-[10.5px] font-mono uppercase tracking-wider mb-3" style={{ color: '#9F98FF' }}>
              Files changed
            </p>
            <div className="space-y-1.5">
              {FILES.map((f, i) => {
                const green = i < filesGreen;
                return (
                  <div
                    key={f}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px]"
                    style={{
                      background: green ? 'rgba(74,222,128,0.10)' : 'rgba(76,68,203,0.06)',
                      border: green
                        ? '1px solid rgba(74,222,128,0.30)'
                        : '1px solid rgba(76,68,203,0.20)',
                      transition: 'background 300ms, border-color 300ms',
                    }}
                  >
                    <FileCode2 className="w-3 h-3 shrink-0" style={{ color: green ? '#4ADE80' : '#9F98FF' }} />
                    <span className="font-mono truncate flex-1" style={{ color: green ? '#A5F3A1' : '#C9C9E5' }}>
                      {f}
                    </span>
                    {green && (
                      <Check
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: '#4ADE80', animation: done ? undefined : 'checkPop 280ms ease-out' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checks */}
          <div className="p-4">
            <p className="text-[10.5px] font-mono uppercase tracking-wider mb-3" style={{ color: '#9F98FF' }}>
              Checks
            </p>
            <div className="space-y-1.5">
              {CHECKS.map((c, i) => {
                const green = i < checksGreen;
                return (
                  <div
                    key={c}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px]"
                    style={{
                      background: green ? 'rgba(74,222,128,0.10)' : 'rgba(76,68,203,0.06)',
                      border: green
                        ? '1px solid rgba(74,222,128,0.30)'
                        : '1px solid rgba(76,68,203,0.20)',
                      transition: 'background 300ms, border-color 300ms',
                    }}
                  >
                    {green ? (
                      <Check
                        className="w-3 h-3 shrink-0"
                        style={{ color: '#4ADE80', animation: done ? undefined : 'checkPop 280ms ease-out' }}
                      />
                    ) : (
                      <Loader2 className="w-3 h-3 shrink-0 animate-spin" style={{ color: '#9F98FF' }} />
                    )}
                    <span className="truncate flex-1" style={{ color: green ? '#A5F3A1' : '#C9C9E5' }}>
                      {c}
                    </span>
                    {green && (
                      <span className="text-[10px] font-mono" style={{ color: '#4ADE80' }}>
                        passed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stamp */}
        {stampOn && (
          <span
            className="absolute top-1/2 left-1/2 px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider shadow-2xl pointer-events-none"
            style={{
              background: '#4ADE80',
              color: '#04200E',
              animation: done ? undefined : 'stampLand 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: 'translate(-50%, -50%) rotate(-12deg)',
            }}
          >
            <ShieldCheck className="w-5 h-5" />
            Ready for review
          </span>
        )}
      </div>
    </div>
  );
}
