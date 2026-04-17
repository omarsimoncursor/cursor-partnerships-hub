'use client';

import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlights?: number[];
  additions?: number[];
  deletions?: number[];
  className?: string;
}

export function CodeBlock({ code, language = 'typescript', filename, highlights = [], additions = [], deletions = [], className }: CodeBlockProps) {
  const lines = code.split('\n');

  return (
    <div className={cn('rounded-xl overflow-hidden border border-dark-border bg-dark-surface', className)}>
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-dark-border bg-dark-bg">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 text-xs text-text-tertiary font-mono">{filename}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-6">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlight = highlights.includes(lineNum);
            const isAddition = additions.includes(lineNum);
            const isDeletion = deletions.includes(lineNum);

            return (
              <div
                key={i}
                className={cn(
                  'flex',
                  isHighlight && 'bg-accent-blue/10',
                  isAddition && 'bg-accent-green/10',
                  isDeletion && 'bg-accent-red/10 line-through opacity-60',
                )}
              >
                <span className="w-10 inline-block text-right pr-4 text-text-tertiary select-none text-xs">
                  {isAddition ? '+' : isDeletion ? '-' : lineNum}
                </span>
                <code className={cn(
                  'font-mono',
                  isAddition && 'text-accent-green',
                  isDeletion && 'text-accent-red',
                  !isAddition && !isDeletion && 'text-text-primary',
                )}>
                  {line || ' '}
                </code>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
