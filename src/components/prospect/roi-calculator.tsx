'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Coins, Cpu, Sparkles, Users, Zap } from 'lucide-react';

// Reasonable, cited-on-request defaults. These are conservative
// industry approximations rather than vendor-published prices, and
// the calculator is meant to start a conversation, not replace
// procurement-ready figures.
const FRONTIER_INPUT_PER_MTOK = 15;   // USD per million input tokens
const FRONTIER_OUTPUT_PER_MTOK = 75;  // USD per million output tokens
const COMPOSER_INPUT_PER_MTOK = 1;    // USD per million input tokens
const COMPOSER_OUTPUT_PER_MTOK = 5;   // USD per million output tokens

// Heuristic split: treat ~1/4 of token volume as output, the rest as input.
const OUTPUT_RATIO = 0.25;

type Props = {
  account: string;
  accent: string;
};

export function RoiCalculator({ account, accent }: Props) {
  const [engineers, setEngineers] = useState(500);
  const [tokensPerEngineerM, setTokensPerEngineerM] = useState(40); // millions/month
  const [frontierPct, setFrontierPct] = useState(10);

  const calc = useMemo(() => {
    const totalTokens = engineers * tokensPerEngineerM * 1_000_000;
    const inputTokens = totalTokens * (1 - OUTPUT_RATIO);
    const outputTokens = totalTokens * OUTPUT_RATIO;

    const allFrontierMonthly =
      (inputTokens / 1_000_000) * FRONTIER_INPUT_PER_MTOK +
      (outputTokens / 1_000_000) * FRONTIER_OUTPUT_PER_MTOK;

    const frontierShare = frontierPct / 100;
    const composerShare = 1 - frontierShare;

    const autoFrontierMonthly =
      ((inputTokens * frontierShare) / 1_000_000) * FRONTIER_INPUT_PER_MTOK +
      ((outputTokens * frontierShare) / 1_000_000) * FRONTIER_OUTPUT_PER_MTOK;
    const autoComposerMonthly =
      ((inputTokens * composerShare) / 1_000_000) * COMPOSER_INPUT_PER_MTOK +
      ((outputTokens * composerShare) / 1_000_000) * COMPOSER_OUTPUT_PER_MTOK;
    const autoMonthly = autoFrontierMonthly + autoComposerMonthly;

    const monthlySavings = Math.max(0, allFrontierMonthly - autoMonthly);
    const annualSavings = monthlySavings * 12;
    const pctSavings = allFrontierMonthly > 0 ? (monthlySavings / allFrontierMonthly) * 100 : 0;

    return {
      totalTokens,
      allFrontierMonthly,
      autoMonthly,
      monthlySavings,
      annualSavings,
      pctSavings,
    };
  }, [engineers, tokensPerEngineerM, frontierPct]);

  const animatedAnnual = useAnimatedNumber(calc.annualSavings);

  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6">
      <div className="space-y-6">
        <Slider
          label="Engineers"
          icon={<Users className="w-3.5 h-3.5" />}
          accent={accent}
          value={engineers}
          min={25}
          max={5000}
          step={25}
          onChange={setEngineers}
          render={v => `${v.toLocaleString()} engineers`}
          hint={`${account}\u2019s addressable engineering org. Move the slider to fit their team size.`}
        />
        <Slider
          label="Tokens per engineer per month"
          icon={<Zap className="w-3.5 h-3.5" />}
          accent={accent}
          value={tokensPerEngineerM}
          min={5}
          max={150}
          step={5}
          onChange={setTokensPerEngineerM}
          render={v => `${v}M tokens / engineer / month`}
          hint="Power Cursor users land between 30M and 80M per month. Scale with what their reps observe."
        />
        <Slider
          label="% of queries that need frontier reasoning"
          icon={<Cpu className="w-3.5 h-3.5" />}
          accent={accent}
          value={frontierPct}
          min={0}
          max={100}
          step={1}
          onChange={setFrontierPct}
          render={v => `${v}% frontier \u2022 ${100 - v}% composer-routable`}
          hint="In practice, fewer than 10% of queries actually need the frontier. The rest can route to Composer."
        />

        <div className="rounded-lg border border-dark-border bg-dark-surface p-4 text-xs text-text-tertiary leading-relaxed">
          <p className="font-mono uppercase tracking-wider text-[11px] text-text-tertiary mb-1">Pricing assumptions</p>
          <p>
            Frontier model priced at ${FRONTIER_INPUT_PER_MTOK} / 1M input + ${FRONTIER_OUTPUT_PER_MTOK} / 1M output;
            Composer at ${COMPOSER_INPUT_PER_MTOK} / 1M input + ${COMPOSER_OUTPUT_PER_MTOK} / 1M output. ~25% of
            tokens are output. Numbers are intentionally conservative and meant to seed the conversation, not finalize
            procurement.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: `${accent}55`, background: `${accent}10` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: accent }} />
            <p className="text-[11px] uppercase tracking-wider font-mono" style={{ color: accent }}>
              Estimated annual savings for {account}
            </p>
          </div>
          <p className="text-4xl md:text-5xl font-bold text-text-primary tabular-nums">
            {formatUsd(animatedAnnual)}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            {calc.pctSavings.toFixed(0)}% reduction vs. routing every query to a frontier model. Auto routes
            non-frontier queries to Composer; engineers never have to think about model selection.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Stat
            label="Monthly: all frontier"
            value={formatUsd(calc.allFrontierMonthly)}
            hint="Every query to Claude Opus / equivalent."
            tone="warning"
          />
          <Stat
            label="Monthly: with auto router"
            value={formatUsd(calc.autoMonthly)}
            hint="Frontier only when reasoning is required."
            tone="positive"
            accent={accent}
          />
          <Stat
            label="Monthly savings"
            value={formatUsd(calc.monthlySavings)}
            hint="Difference, before any productivity gains."
            tone="positive"
          />
          <Stat
            label="Tokens analyzed"
            value={formatTokens(calc.totalTokens)}
            hint={`${engineers.toLocaleString()} engineers \u00d7 ${tokensPerEngineerM}M / month`}
            tone="neutral"
          />
        </div>

        <div className="rounded-lg border border-dark-border p-4 bg-dark-surface">
          <div className="flex items-start gap-3">
            <Calculator className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">
              The auto router is the default for new {account} workspaces, and reps surface the savings monthly via
              the spend dashboard. Productivity gains (faster PR cycles, fewer context switches) compound on top of
              the raw token savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  icon,
  accent,
  value,
  min,
  max,
  step,
  onChange,
  render,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  accent: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  render: (v: number) => string;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <span style={{ color: accent }}>{icon}</span>
          {label}
        </span>
        <span className="text-sm font-mono text-text-primary tabular-nums">{render(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, ${accent} ${pct}%, rgba(237,236,236,0.1) ${pct}%, rgba(237,236,236,0.1) 100%)`,
        }}
      />
      {hint && <p className="text-[11px] text-text-tertiary mt-1">{hint}</p>}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  tone: 'neutral' | 'positive' | 'warning';
  accent?: string;
}) {
  const color =
    tone === 'positive'
      ? accent || '#4ade80'
      : tone === 'warning'
        ? '#fbbf24'
        : 'rgba(237,236,236,0.85)';
  const border =
    tone === 'positive'
      ? `${accent || '#4ade80'}33`
      : tone === 'warning'
        ? '#fbbf2433'
        : 'rgba(237,236,236,0.08)';
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: border }}>
      <p className="text-[11px] uppercase tracking-wider font-mono text-text-tertiary mb-1">{label}</p>
      <p className="text-xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] text-text-tertiary mt-1 leading-snug">{hint}</p>
    </div>
  );
}

function formatUsd(n: number): string {
  if (!isFinite(n)) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return n.toLocaleString();
}

function useAnimatedNumber(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const start = value;
    const delta = target - start;
    if (delta === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(start + delta * ease);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}
