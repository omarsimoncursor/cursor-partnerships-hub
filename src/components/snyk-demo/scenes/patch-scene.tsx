'use client';

import { useEffect, useState } from 'react';
import { FileCode2 } from 'lucide-react';

/**
 * Chapter 3 — Writing the patch.
 *
 * One big diff card. The bad line is shown struck-through in red. After a
 * short beat, two safe lines type in below in green. Plain English: the
 * agent is rewriting the code, you're watching it happen.
 */

const BAD_LINE = `const tainted = \`{ "username": "\${query.username}" }\`;`;

const GOOD_LINES = [
  `if (!ALLOWED_USERNAME.test(query.username))`,
  `  throw new ValidationError("invalid username");`,
  `const selector = parseSelector({ username: query.username });`,
];

export function PatchScene() {
  const [strikeOn, setStrikeOn] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');

  // Phase 1: strike through the bad line.
  useEffect(() => {
    const t = setTimeout(() => setStrikeOn(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Phase 2: type the good lines.
  useEffect(() => {
    if (!strikeOn) return;
    let lineIdx = 0;
    let charIdx = 0;
    const tick = setInterval(() => {
      const target = GOOD_LINES[lineIdx];
      if (!target) {
        clearInterval(tick);
        return;
      }
      charIdx++;
      if (charIdx > target.length) {
        setTypedLines(prev => [...prev, target]);
        setCurrentTyping('');
        lineIdx++;
        charIdx = 0;
        if (lineIdx >= GOOD_LINES.length) clearInterval(tick);
      } else {
        setCurrentTyping(target.slice(0, charIdx));
      }
    }, 22);
    return () => clearInterval(tick);
  }, [strikeOn]);

  return (
    <div className="relative w-full h-full flex items-center justify-center px-10">
      <style jsx>{`
        @keyframes strikePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes lineDrop {
          0% { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes caretBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      <div
        className="w-full max-w-2xl rounded-xl border overflow-hidden"
        style={{ background: '#0A0B23', borderColor: '#23264F' }}
      >
        {/* File header */}
        <div
          className="px-4 py-2 border-b flex items-center gap-2"
          style={{ background: '#13142F', borderColor: '#23264F' }}
        >
          <FileCode2 className="w-3.5 h-3.5" style={{ color: '#9F98FF' }} />
          <span className="text-[12px] font-mono" style={{ color: '#C9C9E5' }}>
            customer-profile.ts
          </span>
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#1A1C40', color: '#7C7CA0' }}>
            line 24
          </span>
        </div>

        {/* Diff body */}
        <div className="p-5 font-mono text-[13px] leading-[1.7] space-y-1">
          {/* Bad line — red, gets struck through */}
          <div className="flex items-start gap-3" style={{ animation: strikeOn ? 'strikePulse 400ms ease-out' : undefined }}>
            <span className="select-none w-4 text-right" style={{ color: '#FB7185' }}>
              −
            </span>
            <span
              className="flex-1 break-all"
              style={{
                color: strikeOn ? '#7A4248' : '#FB7185',
                textDecoration: strikeOn ? 'line-through' : undefined,
                textDecorationColor: 'rgba(225,29,72,0.7)',
                textDecorationThickness: '2px',
                background: strikeOn ? 'rgba(225,29,72,0.05)' : 'rgba(225,29,72,0.10)',
                padding: '2px 6px',
                borderRadius: 4,
                transition: 'color 400ms, background 400ms',
              }}
            >
              {BAD_LINE}
            </span>
          </div>

          {/* Spacer line */}
          <div className="h-2" />

          {/* Good lines — type in one by one */}
          {typedLines.map((line, i) => (
            <div key={i} className="flex items-start gap-3" style={{ animation: 'lineDrop 220ms ease-out' }}>
              <span className="select-none w-4 text-right" style={{ color: '#4ADE80' }}>
                +
              </span>
              <span
                className="flex-1 break-all"
                style={{
                  color: '#A5F3A1',
                  background: 'rgba(74,222,128,0.08)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {line}
              </span>
            </div>
          ))}

          {/* Currently-typing line */}
          {currentTyping && (
            <div className="flex items-start gap-3">
              <span className="select-none w-4 text-right" style={{ color: '#4ADE80' }}>
                +
              </span>
              <span
                className="flex-1 break-all"
                style={{
                  color: '#A5F3A1',
                  background: 'rgba(74,222,128,0.08)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {currentTyping}
                <span
                  className="inline-block w-2 h-3.5 ml-0.5 align-middle"
                  style={{ background: '#A5F3A1', animation: 'caretBlink 800ms steps(1) infinite' }}
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
