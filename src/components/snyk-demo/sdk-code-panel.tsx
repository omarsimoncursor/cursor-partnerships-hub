'use client';

import { useEffect, useState } from 'react';
import { Code as CodeIcon, Copy, Check } from 'lucide-react';
import { PRE_MERGE_GATE_SNIPPET } from '@/lib/cursor-sdk/example-snippets';
import { DEMO_AGENT } from '@/lib/cursor-sdk/types';

/**
 * Pixel-perfect "the actual SDK code your CI runs" panel. Visual heritage
 * from the Datadog code-frame chrome inside `datadog-trace.tsx::CodePathTab`.
 *
 * Header pill mirrors the SDK's Agent.create + agent.send shape: shows
 * `agent.agentId` + `run.id` populating live as the run starts.
 */

interface SDKCodePanelProps {
  /** Becomes true once the demo's running phase is engaged. */
  active: boolean;
}

export function SDKCodePanel({ active }: SDKCodePanelProps) {
  const [agentIdRevealed, setAgentIdRevealed] = useState(false);
  const [runIdRevealed, setRunIdRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!active) {
      setAgentIdRevealed(false);
      setRunIdRevealed(false);
      return;
    }
    const t1 = setTimeout(() => setAgentIdRevealed(true), 350);
    const t2 = setTimeout(() => setRunIdRevealed(true), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  function handleCopy() {
    navigator.clipboard?.writeText(PRE_MERGE_GATE_SNIPPET).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="rounded-md border overflow-hidden flex flex-col"
      style={{ background: '#0A0B23', borderColor: '#23264F' }}
    >
      <div
        className="px-3 py-2 border-b flex items-center gap-2"
        style={{ background: '#13142F', borderColor: '#23264F' }}
      >
        <CodeIcon className="w-3.5 h-3.5" style={{ color: '#9F98FF' }} />
        <span className="text-[11.5px] font-medium" style={{ color: '#C9C9E5' }}>
          ci/security-gate.ts
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#1A1C40', color: '#9F98FF' }}>
          @cursor/february v1.0.7
        </span>

        <div className="ml-auto flex items-center gap-2">
          <RunIdBadge label="agent.agentId" value={agentIdRevealed ? DEMO_AGENT.agentId : '…'} ready={agentIdRevealed} />
          <RunIdBadge label="run.id" value={runIdRevealed ? DEMO_AGENT.runId : '…'} ready={runIdRevealed} />
          <button
            onClick={handleCopy}
            className="h-6 px-2 rounded text-[10.5px] flex items-center gap-1 border"
            style={{ background: '#13142F', borderColor: '#23264F', color: '#C9C9E5' }}
            title="Copy snippet"
          >
            {copied ? <Check className="w-3 h-3" style={{ color: '#4ADE80' }} /> : <Copy className="w-3 h-3" />}
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1" style={{ maxHeight: 280 }}>
        <SyntaxBlock code={PRE_MERGE_GATE_SNIPPET} />
      </div>
    </div>
  );
}

function RunIdBadge({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <span className="text-[10px] font-mono flex items-center gap-1">
      <span style={{ color: '#7C7CA0' }}>{label}=</span>
      <span
        className={`px-1.5 py-0.5 rounded border truncate max-w-[180px] ${ready ? '' : 'animate-pulse'}`}
        style={{
          background: ready ? 'rgba(76,68,203,0.15)' : '#1A1C40',
          borderColor: ready ? 'rgba(76,68,203,0.4)' : '#23264F',
          color: ready ? '#9F98FF' : '#7C7CA0',
        }}
      >
        {value}
      </span>
    </span>
  );
}

/**
 * Tiny token-aware highlighter. Not a real syntax highlighter — we want zero
 * runtime dependencies and deterministic output.
 */
function SyntaxBlock({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <pre
      className="px-3 py-2.5 text-[12px] font-mono leading-[1.55]"
      style={{ color: '#C9C9E5' }}
    >
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="select-none text-right pr-3 shrink-0" style={{ color: '#3A3A55', width: 28 }}>
            {i + 1}
          </span>
          <span className="whitespace-pre-wrap break-all">
            {tokenize(line)}
          </span>
        </div>
      ))}
    </pre>
  );
}

const KEYWORDS = new Set([
  'import',
  'from',
  'const',
  'let',
  'var',
  'await',
  'async',
  'function',
  'for',
  'switch',
  'case',
  'break',
  'return',
  'if',
  'else',
  'process',
  'true',
  'false',
  'null',
  'undefined',
  'new',
]);

const PUNCT = '(){}[];,.<>=+-*/?:|&!';

function tokenize(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < line.length) {
    const ch = line[i];

    // Comments
    if (ch === '/' && line[i + 1] === '/') {
      out.push(
        <span key={key++} style={{ color: '#7C7CA0', fontStyle: 'italic' }}>
          {line.slice(i)}
        </span>,
      );
      break;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j += 2;
        else j += 1;
      }
      out.push(
        <span key={key++} style={{ color: '#A5F3A1' }}>
          {line.slice(i, Math.min(j + 1, line.length))}
        </span>,
      );
      i = Math.min(j + 1, line.length);
      continue;
    }

    // Whitespace
    if (ch === ' ' || ch === '\t') {
      let j = i;
      while (j < line.length && (line[j] === ' ' || line[j] === '\t')) j++;
      out.push(line.slice(i, j));
      i = j;
      continue;
    }

    // Identifier / keyword
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (KEYWORDS.has(word)) {
        out.push(
          <span key={key++} style={{ color: '#FB7185' }}>
            {word}
          </span>,
        );
      } else if (word[0] === word[0].toUpperCase()) {
        out.push(
          <span key={key++} style={{ color: '#FBBF24' }}>
            {word}
          </span>,
        );
      } else if (line[j] === '(') {
        out.push(
          <span key={key++} style={{ color: '#9F98FF' }}>
            {word}
          </span>,
        );
      } else {
        out.push(<span key={key++}>{word}</span>);
      }
      i = j;
      continue;
    }

    // Punctuation
    if (PUNCT.includes(ch)) {
      out.push(
        <span key={key++} style={{ color: '#7C7CA0' }}>
          {ch}
        </span>,
      );
      i += 1;
      continue;
    }

    out.push(ch);
    i += 1;
  }

  return out;
}
