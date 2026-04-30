'use client';

import { useState } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import type { Workflow } from '@/lib/sdk-demo/types';
import { generateSdkCode } from '@/lib/sdk-demo/codegen/generate-sdk-code';
import { cn } from '@/lib/utils';

interface SdkCodePanelProps {
  workflow: Workflow;
}

export function SdkCodePanel({ workflow }: SdkCodePanelProps) {
  const [copied, setCopied] = useState(false);
  const code = generateSdkCode(workflow);

  function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <FileCode2 className="w-3.5 h-3.5 text-text-tertiary ml-2" />
          <span className="text-[11px] text-text-secondary font-mono">
            handlers/{workflow.toolId ?? 'security'}-webhook.ts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider hidden md:inline">
            Live · regenerates on every pick
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-text-tertiary hover:text-text-primary hover:bg-dark-surface-hover transition-colors cursor-pointer"
            title="Copy SDK code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-accent-green" />
                copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-dark-border bg-dark-surface/60 shrink-0">
        <p className="text-[11px] text-text-secondary leading-snug">
          <span className="text-accent-blue font-semibold">This is real, runnable code.</span>{' '}
          A customer drops it into their existing API server. When the chosen tool fires a webhook,
          this handler launches a Cursor agent with the right MCPs and the right prompt to do exactly
          what you picked.
        </p>
      </div>

      <div className="flex-1 overflow-auto bg-dark-bg">
        <pre className="text-[12px] leading-[1.55] font-mono p-4 min-h-full">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="shrink-0 w-8 text-right pr-3 text-text-tertiary/40 select-none">
                {i + 1}
              </span>
              <code className="text-text-primary whitespace-pre-wrap break-words flex-1">
                {tokenize(line)}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

const KEYWORDS = new Set([
  'import',
  'from',
  'const',
  'let',
  'var',
  'function',
  'async',
  'await',
  'return',
  'if',
  'else',
  'as',
  'new',
  'export',
  'true',
  'false',
  'null',
  'undefined',
]);

const COMMENT_RE = /^(\s*)(\/\/.*)$/;
const STRING_RE = /(['"`])(?:\\.|(?!\1)[^\\])*\1/g;
const TEMPLATE_RE = /`(?:\\.|[^`\\])*`/g;
const IDENT_RE = /[A-Za-z_$][A-Za-z0-9_$]*/g;
const NUMBER_RE = /\b\d+(?:\.\d+)?\b/g;

interface Token {
  text: string;
  cls?: string;
}

function tokenize(line: string): React.ReactNode {
  if (line.length === 0) return ' ';
  const commentMatch = line.match(COMMENT_RE);
  if (commentMatch) {
    return (
      <>
        {commentMatch[1]}
        <span className="text-text-tertiary">{commentMatch[2]}</span>
      </>
    );
  }

  const tokens: Token[] = [];
  let cursor = 0;

  const matches: Array<{ start: number; end: number; cls: string; text: string }> = [];

  for (const re of [TEMPLATE_RE, STRING_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, cls: 'text-accent-green', text: m[0] });
    }
  }

  matches.sort((a, b) => a.start - b.start);
  const dedup: typeof matches = [];
  for (const m of matches) {
    if (dedup.length === 0 || m.start >= dedup[dedup.length - 1].end) dedup.push(m);
  }

  for (const m of dedup) {
    if (m.start > cursor) {
      tokens.push(...splitForKeywords(line.slice(cursor, m.start)));
    }
    tokens.push({ text: m.text, cls: m.cls });
    cursor = m.end;
  }
  if (cursor < line.length) {
    tokens.push(...splitForKeywords(line.slice(cursor)));
  }

  return tokens.map((t, i) =>
    t.cls ? (
      <span key={i} className={cn(t.cls)}>
        {t.text}
      </span>
    ) : (
      <span key={i}>{t.text}</span>
    ),
  );
}

function splitForKeywords(segment: string): Token[] {
  const out: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  IDENT_RE.lastIndex = 0;
  while ((match = IDENT_RE.exec(segment)) !== null) {
    if (match.index > lastIndex) {
      out.push({ text: segment.slice(lastIndex, match.index) });
    }
    const word = match[0];
    if (KEYWORDS.has(word)) {
      out.push({ text: word, cls: 'text-[#c084fc]' });
    } else if (word === 'Agent' || word === 'process' || word === 'express' || word === 'app') {
      out.push({ text: word, cls: 'text-accent-blue' });
    } else if (/^[A-Z]/.test(word)) {
      out.push({ text: word, cls: 'text-accent-amber' });
    } else {
      out.push({ text: word });
    }
    lastIndex = match.index + word.length;
  }
  if (lastIndex < segment.length) {
    const tail = segment.slice(lastIndex);
    NUMBER_RE.lastIndex = 0;
    let nlast = 0;
    let nm: RegExpExecArray | null;
    while ((nm = NUMBER_RE.exec(tail)) !== null) {
      if (nm.index > nlast) out.push({ text: tail.slice(nlast, nm.index) });
      out.push({ text: nm[0], cls: 'text-accent-amber' });
      nlast = nm.index + nm[0].length;
    }
    if (nlast < tail.length) out.push({ text: tail.slice(nlast) });
  }
  return out;
}
