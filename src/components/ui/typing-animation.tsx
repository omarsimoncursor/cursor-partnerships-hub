'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  lines: { text: string; color?: string; prefix?: string }[];
  speed?: number;
  className?: string;
  startDelay?: number;
  onComplete?: () => void;
}

export function TypingAnimation({ lines, speed = 30, className, startDelay = 0, onComplete }: TypingAnimationProps) {
  const [displayLines, setDisplayLines] = useState<{ text: string; color?: string; prefix?: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [started, setStarted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setTimeout(() => setStarted(true), startDelay);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startDelay, hasAnimated]);

  useEffect(() => {
    if (!started || currentLine >= lines.length) {
      if (started && currentLine >= lines.length && onComplete) {
        onComplete();
      }
      return;
    }

    const line = lines[currentLine];
    if (currentChar <= line.text.length) {
      const timer = setTimeout(() => {
        setDisplayLines(prev => {
          const newLines = [...prev];
          newLines[currentLine] = {
            ...line,
            text: line.text.slice(0, currentChar),
          };
          return newLines;
        });
        setCurrentChar(c => c + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setCurrentLine(l => l + 1);
      setCurrentChar(0);
    }
  }, [started, currentLine, currentChar, lines, speed, onComplete]);

  return (
    <div ref={ref} className={cn('font-mono text-sm', className)}>
      {displayLines.map((line, i) => (
        <div key={i} className="flex items-start gap-2">
          {line.prefix && (
            <span className="text-accent-green select-none">{line.prefix}</span>
          )}
          <span style={{ color: line.color || 'inherit' }}>
            {line.text}
            {i === currentLine && currentLine < lines.length && (
              <span className="inline-block w-2 h-4 bg-text-primary animate-pulse ml-0.5" />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
