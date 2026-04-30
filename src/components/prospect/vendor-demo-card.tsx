'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronRight, Cpu, Play, RotateCcw } from 'lucide-react';
import { applyAccountName, type Vendor } from '@/lib/prospect/vendors';

const STEP_INTERVAL_MS = 1100;

type Props = {
  vendor: Vendor;
  account: string;
  pageAccent: string;
  index: number;
};

export function VendorDemoCard({ vendor, account, pageAccent, index }: Props) {
  const { scenario } = vendor;
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const start = () => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    setActiveStep(0);
  };

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRunning(false);
    setCompleted(false);
    setActiveStep(-1);
  };

  useEffect(() => {
    if (!running || activeStep < 0) return;
    if (activeStep >= scenario.steps.length) {
      setRunning(false);
      setCompleted(true);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setActiveStep(s => s + 1);
    }, STEP_INTERVAL_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [running, activeStep, scenario.steps.length]);

  const visibleSteps = scenario.steps.slice(0, Math.max(0, completed ? scenario.steps.length : activeStep + 1));

  const accent = vendor.brand;
  const headline = applyAccountName(scenario.headline, account);
  const subheadline = applyAccountName(scenario.subheadline, account);

  return (
    <article
      id={`vendor-${vendor.id}`}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${accent}33`, background: `${accent}08` }}
    >
      <header
        className="px-6 py-5 border-b flex flex-wrap items-center gap-4"
        style={{ borderColor: `${accent}26`, background: `${accent}12` }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 overflow-hidden"
          style={{ background: `${accent}25`, color: accent }}
        >
          {vendor.logo ? (
            <img
              src={vendor.logo}
              alt={`${vendor.name} logo`}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            vendor.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider font-mono" style={{ color: accent }}>
            Demo {String(index + 1).padStart(2, '0')} {'\u2022'} {vendor.modeNote}
          </p>
          <h3 className="text-xl font-semibold text-text-primary mt-1">{vendor.name} + Cursor</h3>
          <p className="text-xs text-text-tertiary mt-0.5">{vendor.category}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-mono"
          style={{
            background: `${vendor.mode === 'mcp' ? '#4ade80' : vendor.mode === 'sdk' ? pageAccent : '#fbbf24'}1f`,
            color: vendor.mode === 'mcp' ? '#4ade80' : vendor.mode === 'sdk' ? pageAccent : '#fbbf24',
          }}
        >
          {vendor.mode === 'mcp' ? 'MCP' : vendor.mode === 'sdk' ? 'SDK' : 'MCP + SDK'}
        </span>
      </header>

      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-dark-border space-y-4">
          <div>
            <h4 className="text-base font-semibold text-text-primary leading-snug">{headline}</h4>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{subheadline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={start}
              disabled={running}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-all"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              <Play className="w-3.5 h-3.5" />
              {running ? 'Running...' : completed ? 'Replay agent' : 'Run agent'}
            </button>
            {(running || completed) && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs text-text-tertiary hover:text-text-primary border border-dark-border hover:border-dark-border-hover transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {completed && (
            <div className="rounded-lg border border-accent-green/25 bg-accent-green/5 p-4">
              <p className="text-[11px] uppercase tracking-wider font-mono text-accent-green mb-2 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Outcome for {account}
              </p>
              <ul className="space-y-1.5">
                {scenario.outcomes.map((o, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
                    <span>{applyAccountName(o, account)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6">
          <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-3 inline-flex items-center gap-1.5">
            <Cpu className="w-3 h-3" /> Cursor agent run
          </p>
          <ol className="space-y-2.5">
            {scenario.steps.map((step, i) => {
              const status = completed
                ? 'done'
                : i < activeStep
                  ? 'done'
                  : i === activeStep && running
                    ? 'active'
                    : 'pending';
              const visible = visibleSteps.length > i;
              return (
                <li
                  key={i}
                  className="rounded-lg border px-3 py-2.5 transition-all"
                  style={{
                    borderColor: status === 'active' ? `${accent}66` : status === 'done' ? `${accent}33` : 'rgba(237,236,236,0.06)',
                    background: status === 'active' ? `${accent}14` : status === 'done' ? `${accent}08` : 'rgba(237,236,236,0.02)',
                    opacity: visible ? 1 : 0.45,
                  }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
                      style={{
                        background: status === 'done' ? accent : 'transparent',
                        color: status === 'done' ? '#0a0a0a' : accent,
                        border: status !== 'done' ? `1px solid ${accent}55` : 'none',
                      }}
                    >
                      {status === 'done' ? '\u2713' : i + 1}
                    </span>
                    <p className="text-sm font-medium text-text-primary">{step.label}</p>
                    {status === 'active' && (
                      <span
                        className="ml-auto text-[10px] font-mono uppercase tracking-wider animate-pulse"
                        style={{ color: accent }}
                      >
                        running
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-1.5 ml-8">{applyAccountName(step.detail, account)}</p>
                  <pre
                    className="ml-8 text-[11px] font-mono px-2.5 py-1.5 rounded bg-dark-bg/60 border border-dark-border overflow-x-auto"
                    style={{ color: status === 'done' ? accent : '#a3a3a3' }}
                  >
                    {step.code}
                  </pre>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </article>
  );
}
