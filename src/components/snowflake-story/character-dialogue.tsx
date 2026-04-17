'use client';

import { useEffect, useRef, useState } from 'react';
import { CharacterAvatar, CHARACTERS, type CharacterId } from './character-avatar';

interface DialogueLine {
  character: CharacterId;
  text: string;
  time?: string;
  holdMs?: number;
  meta?: string;
}

interface CharacterDialogueProps {
  lines: DialogueLine[];
  autoplay?: boolean;
  maxVisible?: number;
  className?: string;
}

export function CharacterDialogue({
  lines,
  autoplay = true,
  maxVisible = 3,
  className = '',
}: CharacterDialogueProps) {
  const [visibleCount, setVisibleCount] = useState(autoplay ? 1 : lines.length);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (!autoplay) return;
    if (visibleCount >= lines.length) return;
    const current = lines[visibleCount - 1];
    const hold = current?.holdMs ?? 2800;
    const t = setTimeout(() => {
      activeIndexRef.current = visibleCount;
      setVisibleCount((n) => n + 1);
    }, hold);
    return () => clearTimeout(t);
  }, [visibleCount, autoplay, lines]);

  const rendered = lines.slice(0, visibleCount);
  const windowStart = Math.max(0, rendered.length - maxVisible);
  const windowed = rendered.slice(windowStart);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {windowed.map((line, i) => {
        const globalIndex = windowStart + i;
        const isNewest = globalIndex === rendered.length - 1 && autoplay;
        const meta = CHARACTERS[line.character];
        return (
          <div
            key={globalIndex}
            className="flex items-start gap-3 dialogue-enter"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <CharacterAvatar
              character={line.character}
              size="sm"
              speaking={isNewest}
              className="shrink-0 mt-0.5"
            />
            <div
              className="relative flex-1 rounded-xl px-3.5 py-2 border"
              style={{
                background: 'rgba(12, 20, 34, 0.78)',
                borderColor: `${meta.accent}40`,
                boxShadow: isNewest
                  ? `0 0 24px ${meta.glow}, inset 0 0 0 1px ${meta.accent}30`
                  : 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[11.5px] font-semibold" style={{ color: meta.accent }}>
                  {meta.name}
                </span>
                <span className="text-[10px] text-text-tertiary font-mono">
                  {line.time ?? meta.role.split('·')[0].trim()}
                </span>
                {line.meta && (
                  <span className="ml-auto text-[10px] text-text-tertiary font-mono">
                    {line.meta}
                  </span>
                )}
              </div>
              {isNewest ? (
                <TypewriterText text={line.text} />
              ) : (
                <p className="text-[13.5px] leading-relaxed text-text-primary">{line.text}</p>
              )}
            </div>
          </div>
        );
      })}
      <style jsx>{`
        :global(.dialogue-enter) {
          animation: dialogueEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes dialogueEnter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    const chars = Array.from(text);
    let i = 0;
    const tick = () => {
      i += Math.max(1, Math.floor(chars.length / 80));
      const next = chars.slice(0, i).join('');
      setShown(next);
      if (i < chars.length) {
        raf = window.setTimeout(tick, 16);
      }
    };
    let raf = window.setTimeout(tick, 16);
    return () => window.clearTimeout(raf);
  }, [text]);

  return (
    <p className="text-[13.5px] leading-relaxed text-text-primary">
      {shown}
      <span className="inline-block w-1.5 h-3 align-middle ml-0.5 bg-text-primary/60 animate-pulse" />
    </p>
  );
}
