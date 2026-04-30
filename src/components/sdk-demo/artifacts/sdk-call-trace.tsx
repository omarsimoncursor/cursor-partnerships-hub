'use client';

import { Code2 } from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import type { RuntimeStep } from '@/lib/sdk-demo/types';
import { cn } from '@/lib/utils';

interface SdkCallTraceProps {
  script: ResolvedScript;
  agentId: string;
}

const TYPE_COLOR: Record<string, string> = {
  'agent.create':  'text-accent-blue',
  'agent.send':    'text-accent-blue',
  'status.change': 'text-accent-amber',
  'tool.call':     'text-[#A689D4]',
  'tool.result':   'text-accent-green',
  'step.complete': 'text-text-primary',
  'assistant':     'text-[#D97757]',
  'agent.wait':    'text-accent-green',
};

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const millis = Math.floor(ms) % 1000;
  const hh = 14;
  const mm = 18 + Math.floor(total / 60);
  const ss = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function SdkCallTrace({ script, agentId }: SdkCallTraceProps) {
  let cumulative = 0;
  const events: Array<{ ms: number; step: RuntimeStep }> = [];
  for (const step of script.steps) {
    cumulative += step.delayMs;
    events.push({ ms: cumulative, step });
  }
  const sdkEventCount = events.filter((e) => e.step.sdkEvent).length;
  const wallSeconds = (cumulative / 1000).toFixed(1);
  const billedSeconds = ((cumulative * 2.6) / 1000).toFixed(1);
  const mcpCount = countMcps(script);

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-text-primary font-mono text-[12px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-accent-blue" />
          <span className="text-[11px] text-text-secondary">SDK Call Trace</span>
        </div>
        <span className="text-[10px] text-text-tertiary">cursor-sdk · @cursor/february · v1.0.7</span>
      </div>
      <div className="px-4 py-2 border-b border-dark-border bg-dark-surface text-[11px] text-text-secondary shrink-0">
        <span className="text-accent-blue">agent-{agentId}</span>
        <span className="text-text-tertiary mx-2">·</span>
        <span className="text-accent-green">status FINISHED</span>
        <span className="text-text-tertiary mx-2">·</span>
        {sdkEventCount} SDK events
        <span className="text-text-tertiary mx-2">·</span>
        {mcpCount} MCP servers
        <span className="text-text-tertiary mx-2">·</span>
        wall {wallSeconds}s
        <span className="text-text-tertiary mx-2">·</span>
        billed {billedSeconds}s
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 leading-[1.6]">
        {events.map(({ ms, step }, i) => {
          if (!step.sdkEvent) return null;
          const isLast = i === events.length - 1;
          const isFirst = i === 0;
          const branch = isFirst ? '┌─' : isLast ? '└─' : '├─';
          const cls = TYPE_COLOR[step.sdkEvent.type] ?? 'text-text-secondary';
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-text-tertiary/40 shrink-0">{branch}</span>
              <span className="text-text-tertiary/60 shrink-0 w-[110px]">
                {formatClock(ms)}
              </span>
              <span className={cn('shrink-0 w-[120px] truncate', cls)}>
                {step.sdkEvent.type}
              </span>
              <span className="text-text-secondary truncate flex-1 min-w-0">
                {step.sdkEvent.payload}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function countMcps(script: ResolvedScript): number {
  const mcps = new Set<string>();
  for (const s of script.steps) {
    if (s.channel !== 'sdk' && s.channel !== 'opus' && s.channel !== 'composer' && s.channel !== 'codex' && s.channel !== 'shell' && s.channel !== 'codegen' && s.channel !== 'done') {
      mcps.add(s.channel);
    }
  }
  return mcps.size;
}
