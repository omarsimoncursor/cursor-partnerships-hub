'use client';

import { computeRoi, formatTokens, formatUsd, type RoiInputs } from '@/lib/demo-pack/roi';
import clsx from 'clsx';

type Props = {
  value: RoiInputs;
  onChange: (next: RoiInputs) => void;
};

export function RoiCalculator({ value, onChange }: Props) {
  const r = computeRoi(value);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <p className="text-sm text-text-secondary leading-relaxed">
          Fewer than 10% of real engineering prompts need frontier-tier reasoning; routing everything to a frontier
          model inflates spend without guaranteeing better outcomes. Tune the sliders to estimate illustrative
          monthly savings when non-frontier work runs on Composer-class routing instead.
        </p>

        <SliderRow
          label="Engineering seats"
          value={value.engineers}
          min={5}
          max={5000}
          step={5}
          format={v => `${v}`}
          onChange={engineers =>
            onChange({
              ...value,
              engineers,
            })
          }
        />
        <SliderRow
          label="Queries routed to frontier model"
          value={value.frontierQueryPct}
          min={0.5}
          max={40}
          step={0.5}
          format={v => `${v.toFixed(1)}%`}
          onChange={frontierQueryPct =>
            onChange({
              ...value,
              frontierQueryPct,
            })
          }
        />
        <SliderRow
          label="Tokens per engineer / month"
          value={value.tokensPerEngineerPerMonth}
          min={200_000}
          max={30_000_000}
          step={100_000}
          format={v => `${formatTokens(v)} tok`}
          onChange={tokensPerEngineerPerMonth =>
            onChange({
              ...value,
              tokensPerEngineerPerMonth,
            })
          }
        />
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-text-tertiary block mb-1">$/1M tokens (frontier illustrative)</label>
            <input
              type="number"
              step={0.5}
              min={0.01}
              max={200}
              value={value.opusUsdPerMillionTokens}
              onChange={e =>
                onChange({
                  ...value,
                  opusUsdPerMillionTokens: Number(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg bg-dark-surface border border-dark-border px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-[var(--prospect-accent,#60a5fa)]/50"
            />
          </div>
          <div>
            <label className="text-xs text-text-tertiary block mb-1">$/1M tokens (Composer-class illustrative)</label>
            <input
              type="number"
              step={0.5}
              min={0.01}
              max={200}
              value={value.composerUsdPerMillionTokens}
              onChange={e =>
                onChange({
                  ...value,
                  composerUsdPerMillionTokens: Number(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg bg-dark-surface border border-dark-border px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-[var(--prospect-accent,#60a5fa)]/50"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-[var(--prospect-accent-soft)] space-y-4">
        <h4 className="text-sm font-semibold text-text-primary">Estimated routing impact</h4>
        <dl className="space-y-3 text-sm">
          <Stat label="Monthly tokens (org)" value={formatTokens(r.monthlyTokensTotal)} />
          <Stat label="All frontier — est. monthly" value={formatUsd(r.monthlyCostAllFrontier)} />
          <Stat label="With auto-router split — est. monthly" value={formatUsd(r.monthlyCostRouted)} />
          <Stat
            label="Illustrative monthly savings"
            value={formatUsd(r.monthlySavings)}
            emphasize
          />
          <Stat label="Illustrative annual savings" value={formatUsd(r.annualSavings)} emphasize />
          <Stat label="Share not on frontier" value={`${r.nonFrontierSharePct.toFixed(1)}%`} />
          <Stat label="Spend reduction vs all-frontier" value={`${r.savingsPct.toFixed(1)}%`} />
        </dl>
        <p className="text-xs text-text-tertiary pt-2 border-t border-dark-border leading-relaxed">
          Figures are directional for sales conversations—not a billing quote. Replace default $/M token rates with
          the numbers the account uses internally.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 items-baseline">
      <dt className="text-text-tertiary shrink-0">{label}</dt>
      <dd
        className={clsx(
          'font-mono text-right tabular-nums',
          emphasize ? 'text-[var(--prospect-accent,#60a5fa)] font-semibold' : 'text-text-primary'
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono tabular-nums text-[var(--prospect-accent,#60a5fa)]">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={clsx(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-dark-surface border border-dark-border',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--prospect-accent,#60a5fa)]',
          '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--prospect-accent,#60a5fa)] [&::-moz-range-thumb]:border-0'
        )}
      />
    </div>
  );
}
