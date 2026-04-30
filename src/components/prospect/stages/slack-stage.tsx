'use client';

import type { StageProps } from './types';

type Msg = { author: string; ts: string; body: string; agent?: boolean; pr?: boolean; reaction?: string };

export function SlackStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const messages: Msg[] = [
    { author: 'Datadog', ts: '14:02', body: '🚨 SLO breach: checkout p99 = 812ms (target 300ms)' },
    { author: 'kira.j', ts: '14:02', body: 'Anyone awake? Checkout is breaching.' },
    { author: 'cursor-agent', ts: '14:03', body: `On it — pulling the trace. ETA 4 min.`, agent: true },
    { author: 'cursor-agent', ts: '14:05', body: `Root cause: cache miss in fx.lookup. Patch incoming.`, agent: true },
    { author: 'cursor-agent', ts: '14:06', body: `PR #4218 opened. p99 in benchmark: 168ms.`, agent: true, pr: true },
    { author: 'kira.j',       ts: '14:08', body: 'LGTM — merging.' },
    { author: 'cursor-agent', ts: '14:11', body: `Merged. Datadog confirms recovery.`, agent: true, reaction: '\u2705' },
  ];

  const visible = isComplete ? messages.length : Math.min(messages.length, Math.max(0, activeStep + 2));

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg/70 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          {account.toLowerCase()}.slack.com / # incident-1284
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}55`, color: '#ffd0e2' }}>
          SLACK
        </span>
      </div>

      <div className="px-2 py-2 space-y-0.5 max-h-[360px] overflow-hidden">
        {messages.slice(0, visible).map((m, i) => (
          <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-dark-surface/30">
            <div
              className="w-7 h-7 rounded shrink-0 flex items-center justify-center text-[10px] font-bold"
              style={{
                background: m.agent ? '#0a0a0a' : `${brand}55`,
                color: m.agent ? brand : '#fff',
                border: m.agent ? `1px solid ${brand}` : 'none',
              }}
            >
              {m.author.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[12px] font-bold text-text-primary">
                  {m.author}{m.agent && ' '}
                </span>
                {m.agent && (
                  <span className="text-[8.5px] font-mono px-1 rounded" style={{ background: `${brand}33`, color: brand }}>
                    APP
                  </span>
                )}
                <span className="text-[10px] text-text-tertiary">{m.ts}</span>
              </div>
              <p className="text-[12px] text-text-secondary leading-snug whitespace-pre-wrap">{m.body}</p>
              {m.pr && (
                <div className="mt-1.5 rounded border border-dark-border bg-dark-surface/40 p-2 inline-block">
                  <p className="text-[10.5px] font-mono text-text-tertiary">github.com/{account.toLowerCase()}/web-checkout/pull/4218</p>
                  <p className="text-[11.5px] text-text-primary font-medium mt-0.5">fix(checkout): cache fx.lookup</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">+9 −2 · 1 file · CI green</p>
                </div>
              )}
              {m.reaction && (
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-dark-border bg-dark-surface/40 text-[10px]">
                  <span>{m.reaction}</span>
                  <span className="text-text-tertiary font-mono">3</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {!isComplete && visible < messages.length && (
          <div className="px-3 py-1.5 text-[11px] text-text-tertiary italic flex items-center gap-1.5">
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
              <span className="w-1 h-1 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
            </span>
            cursor-agent is typing…
          </div>
        )}
      </div>
    </div>
  );
}
