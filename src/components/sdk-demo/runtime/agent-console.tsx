'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Check } from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import type { RuntimeChannel, RuntimeStep } from '@/lib/sdk-demo/types';

type Status = 'pending' | 'running' | 'done';

const CHANNEL_STYLES: Record<RuntimeChannel, { label: string; color: string; bg: string; border: string }> = {
  sdk:         { label: 'cursor-sdk',     color: 'text-accent-blue',    bg: 'bg-accent-blue/10',      border: 'border-accent-blue/30' },
  gitguardian: { label: 'gitguardian-mcp',color: 'text-[#1F8FFF]',      bg: 'bg-[#1F8FFF]/10',        border: 'border-[#1F8FFF]/30' },
  wiz:         { label: 'wiz-mcp',        color: 'text-[#9B8DFF]',      bg: 'bg-[#3F2EFF]/15',        border: 'border-[#3F2EFF]/35' },
  snyk:        { label: 'snyk-mcp',       color: 'text-[#C8A8E0]',      bg: 'bg-[#A06CD5]/15',        border: 'border-[#A06CD5]/30' },
  okta:        { label: 'okta-mcp',       color: 'text-[#5BB1FF]',      bg: 'bg-[#1C82E1]/15',        border: 'border-[#1C82E1]/30' },
  crowdstrike: { label: 'crowdstrike-mcp',color: 'text-[#FF668A]',      bg: 'bg-[#FF0033]/10',        border: 'border-[#FF0033]/30' },
  splunk:      { label: 'splunk-mcp',     color: 'text-[#8FCB5F]',      bg: 'bg-[#65A637]/15',        border: 'border-[#65A637]/30' },
  zscaler:     { label: 'zscaler-mcp',    color: 'text-[#52C7E8]',      bg: 'bg-[#0099CC]/15',        border: 'border-[#0099CC]/30' },
  aws:         { label: 'aws-mcp',        color: 'text-[#FFB158]',      bg: 'bg-[#FF9900]/10',        border: 'border-[#FF9900]/30' },
  stripe:      { label: 'stripe-mcp',     color: 'text-[#9189FF]',      bg: 'bg-[#635BFF]/10',        border: 'border-[#635BFF]/30' },
  vault:       { label: 'vault-mcp',      color: 'text-[#FFEC6E]',      bg: 'bg-[#FFEC6E]/10',        border: 'border-[#FFEC6E]/30' },
  github:      { label: 'github-mcp',     color: 'text-text-primary',   bg: 'bg-text-primary/10',     border: 'border-text-primary/20' },
  jira:        { label: 'jira-mcp',       color: 'text-[#4C9AFF]',      bg: 'bg-[#0052CC]/15',        border: 'border-[#4C9AFF]/30' },
  slack:       { label: 'slack-mcp',      color: 'text-[#E4A6E0]',      bg: 'bg-[#4A154B]/15',        border: 'border-[#4A154B]/30' },
  opus:        { label: 'opus · triage',  color: 'text-[#D97757]',      bg: 'bg-[#D97757]/10',        border: 'border-[#D97757]/30' },
  composer:    { label: 'composer · edit',color: 'text-accent-blue',    bg: 'bg-accent-blue/10',      border: 'border-accent-blue/30' },
  codex:       { label: 'codex · review', color: 'text-[#10a37f]',      bg: 'bg-[#10a37f]/10',        border: 'border-[#10a37f]/30' },
  shell:       { label: 'shell',          color: 'text-accent-green',   bg: 'bg-accent-green/10',     border: 'border-accent-green/20' },
  codegen:     { label: 'codegen',        color: 'text-accent-blue',    bg: 'bg-accent-blue/10',      border: 'border-accent-blue/20' },
  done:        { label: 'complete',       color: 'text-accent-green',   bg: 'bg-accent-green/10',     border: 'border-accent-green/20' },
};

const TIME_SCALE = 2.7;

function formatElapsed(ms: number): string {
  const total = ms / 1000;
  const mins = Math.floor(total / 60);
  const s = Math.floor(total) % 60;
  const millis = Math.floor(ms) % 1000;
  if (mins > 0) {
    return `+${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }
  return `+${String(s).padStart(2, '0')}.${String(millis).padStart(3, '0')}s`;
}

interface AgentConsoleProps {
  script: ResolvedScript;
  onStep?: (step: RuntimeStep, index: number) => void;
  onComplete?: () => void;
}

interface VisibleStep extends RuntimeStep {
  elapsed: number;
  status: Status;
}

export function AgentConsole({ script, onStep, onComplete }: AgentConsoleProps) {
  const [visibleSteps, setVisibleSteps] = useState<VisibleStep[]>([]);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    setVisibleSteps([]);
    setFinished(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    script.steps.forEach((step, i) => {
      cumulative += step.delayMs;
      const t = setTimeout(() => {
        const elapsed = (performance.now() - startRef.current) * TIME_SCALE;
        setVisibleSteps((prev) => {
          const updated = prev.map((s) => ({ ...s, status: 'done' as Status }));
          return [...updated, { ...step, elapsed, status: 'running' as Status }];
        });
        onStep?.(step, i);
        if (i === script.steps.length - 1) {
          const done = setTimeout(() => {
            setVisibleSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as Status })));
            setFinished(true);
            onComplete?.();
          }, 400);
          timers.push(done);
        }
      }, cumulative);
      timers.push(t);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [script, onStep, onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps.length]);

  const durationLabel =
    visibleSteps.length > 0
      ? formatElapsed(visibleSteps[visibleSteps.length - 1].elapsed)
      : '+00.000s';

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary leading-none mb-0.5">
              Cursor Background Agent
            </p>
            <p className="text-[11px] text-text-tertiary font-mono truncate max-w-[18rem]">
              {script.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finished ? 'bg-accent-green' : 'bg-accent-amber animate-pulse'
            }`}
          />
          <span className="text-[11px] text-text-tertiary font-mono">{durationLabel}</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 min-h-[280px]"
      >
        {visibleSteps.length === 0 && (
          <p className="text-text-tertiary italic px-1 py-2">Waiting for the SDK to start the run…</p>
        )}
        {visibleSteps.map((step, i) => {
          const style = CHANNEL_STYLES[step.channel];
          const isActive = step.status === 'running';
          return (
            <div
              key={i}
              className="flex gap-2.5 items-start leading-relaxed"
              style={{ animation: 'agentFadeIn 0.2s ease-out' }}
            >
              <span className="text-text-tertiary shrink-0 w-[88px]">
                {formatElapsed(step.elapsed)}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${style.bg} ${style.border} ${style.color} whitespace-nowrap`}
              >
                {style.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  {isActive ? (
                    <span className="inline-block w-3 h-3 mt-0.5 shrink-0">
                      <span className="block w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
                    </span>
                  ) : (
                    <Check className="w-3 h-3 mt-0.5 text-accent-green shrink-0" />
                  )}
                  <span className="text-text-primary break-words">{step.label}</span>
                </div>
                {step.detail && (
                  <div className="text-text-tertiary text-[11px] ml-5 mt-0.5 break-words">
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes agentFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
