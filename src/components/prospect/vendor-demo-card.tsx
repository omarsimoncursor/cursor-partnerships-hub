'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronRight, Cpu, Play, RotateCcw } from 'lucide-react';
import { applyAccountName, type Vendor } from '@/lib/prospect/vendors';
import { VendorStage } from './stages';
import type { StageStatus } from './stages/types';

const STEP_INTERVAL_MS = 1300;

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

  const accent = vendor.brand;
  const headline = applyAccountName(scenario.headline, account);
  const subheadline = applyAccountName(scenario.subheadline, account);

  const stageStatus: StageStatus = completed ? 'complete' : running ? 'running' : 'idle';

  return (
    <article
      id={`vendor-${vendor.id}`}
      className="rounded-2xl border overflow-hidden bg-dark-surface"
      style={{ borderColor: `${accent}38` }}
    >
      {/* Header — keep a brand-tinted band but on a solid base so text stays high-contrast */}
      <header
        className="px-6 py-5 border-b flex flex-wrap items-center gap-4 bg-dark-surface-hover"
        style={{ borderColor: `${accent}26`, backgroundImage: `linear-gradient(180deg, ${accent}1c 0%, transparent 100%)` }}
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

      {/* Headline + controls */}
      <div className="px-6 py-5 border-b border-dark-border">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-base md:text-lg font-semibold text-text-primary leading-snug">{headline}</h4>
            <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{subheadline}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={start}
              disabled={running}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-all"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              <Play className="w-3.5 h-3.5" />
              {running ? 'Running...' : completed ? 'Replay' : 'Run agent'}
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
        </div>
      </div>

      {/* Stage + step timeline */}
      <div className="grid lg:grid-cols-[1.5fr_1fr]">
        <div className="p-6 lg:border-r border-dark-border">
          <VendorStage
            vendor={vendor}
            totalSteps={scenario.steps.length}
            activeStep={activeStep}
            status={stageStatus}
            account={account}
            brand={accent}
            pageAccent={pageAccent}
          />
        </div>

        <div className="p-6 border-t lg:border-t-0 border-dark-border">
          <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-3 inline-flex items-center gap-1.5">
            <Cpu className="w-3 h-3" /> Cursor agent timeline
          </p>
          <ol className="space-y-2">
            {scenario.steps.map((step, i) => {
              const status = completed
                ? 'done'
                : i < activeStep
                  ? 'done'
                  : i === activeStep && running
                    ? 'active'
                    : 'pending';
              return (
                <li
                  key={i}
                  className="rounded-lg border px-3 py-2 transition-all"
                  style={{
                    borderColor: status === 'active' ? `${accent}66` : status === 'done' ? `${accent}33` : 'rgba(237,236,236,0.06)',
                    background: status === 'active' ? `${accent}14` : status === 'done' ? `${accent}08` : 'rgba(237,236,236,0.02)',
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-0.5">
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
                    <p className="text-[13px] font-medium text-text-primary leading-tight">{step.label}</p>
                    {status === 'active' && (
                      <span
                        className="ml-auto text-[10px] font-mono uppercase tracking-wider animate-pulse"
                        style={{ color: accent }}
                      >
                        running
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-text-secondary mb-1 ml-7 leading-snug">
                    {applyAccountName(step.detail, account)}
                  </p>
                  <pre
                    className="ml-7 text-[10.5px] font-mono px-2 py-1 rounded bg-dark-bg border border-dark-border overflow-x-auto"
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

      {/* Outcomes footer */}
      {completed && (
        <div className="px-6 py-5 border-t border-accent-green/20 bg-accent-green/5">
          <p className="text-[11px] uppercase tracking-wider font-mono text-accent-green mb-2 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Outcome for {account}
          </p>
          <ul className="grid sm:grid-cols-3 gap-2">
            {scenario.outcomes.map((o, i) => (
              <li key={i} className="text-[13px] text-text-secondary flex gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
                <span>{applyAccountName(o, account)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
