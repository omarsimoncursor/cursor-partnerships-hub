'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

// ---------------------------------------------------------------------------
// SDK code panel — a syntax-highlighted snippet block with optional tab strip
// and copy-to-clipboard. Used on the narrative page and the demo idle phase
// to make the @cursor/sdk shapes legible to enterprise architects.
//
// The "highlighting" is intentionally hand-rolled (no shiki at runtime) so it
// stays cheap, deterministic, and SSR-safe.
// ---------------------------------------------------------------------------

export interface CodeTab {
  id: string;
  label: string;
  filename: string;
  code: string;
}

interface SdkCodePanelProps {
  title?: string;
  badge?: string;
  tabs: CodeTab[];
  /** Optional accent color for the chrome (defaults to PD green) */
  accentColor?: string;
  /** Optional max height for the body */
  maxHeight?: string;
}

export function SdkCodePanel({
  title = 'This is what powers the auto-pilot',
  badge = '@cursor/sdk',
  tabs,
  accentColor = '#06AC38',
  maxHeight = '420px',
}: SdkCodePanelProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');
  const [copied, setCopied] = useState(false);

  const active = tabs.find(t => t.id === activeId) ?? tabs[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API can fail under permission-policy. Quietly ignore.
    }
  };

  return (
    <div
      className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden"
      style={{ boxShadow: `0 8px 32px ${accentColor}10` }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border bg-dark-bg flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}35` }}
        >
          <Terminal className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-text-primary leading-none mb-0.5">
            {title}
          </p>
          <p className="text-[10.5px] text-text-tertiary font-mono">{badge}</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded-md border border-dark-border text-[10.5px] text-text-secondary font-mono flex items-center gap-1.5 hover:bg-dark-surface-hover hover:text-text-primary transition-colors cursor-pointer"
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

      {/* Tab strip */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-0 border-b border-dark-border bg-dark-bg overflow-x-auto">
          {tabs.map(tab => {
            const isActive = tab.id === active.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                className="px-4 py-2 text-[11.5px] font-mono whitespace-nowrap border-b-2 transition-colors cursor-pointer"
                style={{
                  borderColor: isActive ? accentColor : 'transparent',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  background: isActive ? `${accentColor}08` : 'transparent',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Filename strip */}
      <div className="px-4 py-1.5 border-b border-dark-border bg-dark-bg/50">
        <p className="text-[10.5px] text-text-tertiary font-mono">{active.filename}</p>
      </div>

      {/* Code body */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        <pre className="p-4 text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words">
          <Highlighted code={active.code} />
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cheap syntax highlighter — covers the SDK examples we render. It is NOT a
// general-purpose tokenizer; it just paints the constructs we use:
//   - line comments starting with //
//   - keywords (import, from, const, await, async, function, return, for, of, etc.)
//   - the @cursor/sdk identifiers (Agent, Cursor)
//   - single + double + back-tick quoted strings
//   - decorator-style annotations like `event.type === 'xxx'`
// ---------------------------------------------------------------------------

const KEYWORDS = new Set([
  'import',
  'from',
  'const',
  'let',
  'var',
  'await',
  'async',
  'function',
  'return',
  'for',
  'of',
  'in',
  'if',
  'else',
  'switch',
  'case',
  'break',
  'default',
  'export',
  'new',
  'true',
  'false',
  'null',
  'undefined',
  'as',
  'typeof',
  'class',
  'public',
  'private',
  'this',
]);

const SDK_IDENTIFIERS = new Set([
  'Agent',
  'Cursor',
  'process',
  'console',
]);

const COLORS = {
  comment: '#7B8794',
  keyword: '#C792EA',
  string: '#A5E075',
  number: '#F78C6C',
  sdk: '#82AAFF',
  prop: '#FFCB6B',
  punct: '#9AA7B5',
  text: '#E1E5EA',
};

function Highlighted({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {tokenize(line)}
          {i < lines.length - 1 && '\n'}
        </span>
      ))}
    </>
  );
}

function tokenize(line: string): React.ReactNode {
  const out: Array<React.ReactNode> = [];
  let i = 0;
  let key = 0;

  // Trim a leading comment whole-line
  if (/^\s*\/\//.test(line)) {
    return <span style={{ color: COLORS.comment }}>{line}</span>;
  }

  while (i < line.length) {
    const ch = line[i];

    // Inline comment
    if (ch === '/' && line[i + 1] === '/') {
      out.push(
        <span key={key++} style={{ color: COLORS.comment }}>
          {line.slice(i)}
        </span>,
      );
      break;
    }

    // String literals (single, double, back-tick)
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j += 2;
        else j += 1;
      }
      const end = Math.min(j + 1, line.length);
      out.push(
        <span key={key++} style={{ color: COLORS.string }}>
          {line.slice(i, end)}
        </span>,
      );
      i = end;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch) && (i === 0 || /[\s,(\[+\-=<>!*/%&|^~?:]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9._]/.test(line[j])) j += 1;
      out.push(
        <span key={key++} style={{ color: COLORS.number }}>
          {line.slice(i, j)}
        </span>,
      );
      i = j;
      continue;
    }

    // Identifiers / keywords
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j += 1;
      const word = line.slice(i, j);
      let color = COLORS.text;
      if (KEYWORDS.has(word)) color = COLORS.keyword;
      else if (SDK_IDENTIFIERS.has(word)) color = COLORS.sdk;
      else if (line[j] === ':' && line[j + 1] !== ':') color = COLORS.prop;
      else if (line[j] === '(') color = COLORS.sdk;

      out.push(
        <span key={key++} style={{ color }}>
          {word}
        </span>,
      );
      i = j;
      continue;
    }

    // Punctuation passthrough — accumulate runs of non-identifier chars
    let j = i;
    while (j < line.length && !/[A-Za-z0-9_$"'`/]/.test(line[j])) j += 1;
    if (j === i) j = i + 1;
    out.push(
      <span key={key++} style={{ color: COLORS.punct }}>
        {line.slice(i, j)}
      </span>,
    );
    i = j;
  }

  return <>{out}</>;
}

// ---------------------------------------------------------------------------
// Reusable code samples for the demo + narrative page
// ---------------------------------------------------------------------------

export const SDK_CREATE_SAMPLE: CodeTab = {
  id: 'create',
  label: 'Setup',
  filename: 'workers/cursor-sdk/agent.ts',
  code: `import { Agent } from '@cursor/sdk';

// Runs in your sandboxed worker — the SDK is the same runtime
// that powers Cursor desktop. Admin-enforced network policy
// (Cursor 2.5) keeps egress on a tight allowlist.
export const agent = Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: { id: 'composer-2' },
  cloud: {
    repos: ['github.com/acme/payments-api'],
  },
  sandbox: {
    network: 'allowlist',
    allowedDomains: [
      'api.pagerduty.com',
      'api.datadoghq.com',
      'api.github.com',
      'status.acme.com',
      'hooks.slack.com',
    ],
    fs: { writable: ['./'], readable: ['./', '/etc/ssl/certs'] },
  },
  subagents: {
    triage: { model: { id: 'claude-opus-4-thinking' } },
    revert: { model: { id: 'composer-2' } },
    comms:  { model: { id: 'composer-2' } },
  },
});`,
};

export const SDK_HANDLER_SAMPLE: CodeTab = {
  id: 'handler',
  label: 'Webhook handler',
  filename: 'app/api/pagerduty-webhook/route.ts',
  code: `import { agent } from '@/workers/cursor-sdk/agent';
import { pd } from '@/lib/pagerduty';

export async function POST(req: Request) {
  const event = await req.json();
  if (event.event_type !== 'incident.triggered') return ok();

  // Ack the incident before any human is paged.
  await pd.acknowledge(event.data.id, { actor: 'cursor-agent' });

  // Kick off a Cursor SDK run inside the sandboxed worker.
  const run = await agent.send(
    \`Triage PagerDuty incident \${event.data.id} on payments-api.
     Decide revert vs fix-forward. If confidence > 0.7, ship the change.
     Promote canary -> 100% only after the SLO holds for 60s.\`,
    { onEvent: (e) => pd.notes(event.data.id, mapEvent(e)) },
  );

  // Stream typed events back into your incident timeline.
  for await (const e of run.stream()) {
    if (e.type === 'pull_request.opened')   await pd.linkPr(event.data.id, e);
    if (e.type === 'statuspage.update')     await statuspage.publish(e);
    if (e.type === 'decision')              await metrics.record(e);
  }

  const result = await run.wait();
  if (result.outcome === 'resolved') {
    await pd.resolve(event.data.id, { actor: 'cursor-agent' });
  }
  return ok();
}`,
};

export const SDK_SUBAGENTS_SAMPLE: CodeTab = {
  id: 'subagents',
  label: 'Subagents',
  filename: 'workers/cursor-sdk/subagents.ts',
  code: `// Each subagent runs with its own model, scope, and allowlist.
// Async subagents (Cursor 2.5) let triage + comms run in parallel
// while revert holds the lock on the patch.
agent.subagents = {
  triage: {
    model: { id: 'claude-opus-4-thinking' },
    description: 'Reads PD + Datadog + git history. Owns the revert decision.',
    tools: ['pagerduty.read', 'datadog.read', 'github.read'],
  },
  revert: {
    model: { id: 'composer-2' },
    description: 'Generates the revert commit. Scoped to one repo.',
    tools: ['github.write', 'shell.read'],
  },
  comms: {
    model: { id: 'composer-2' },
    description: 'Posts Statuspage + Slack updates. No code access.',
    tools: ['statuspage.write', 'slack.write'],
  },
};`,
};
