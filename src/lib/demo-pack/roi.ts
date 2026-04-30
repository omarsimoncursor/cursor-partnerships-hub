export type RoiInputs = {
  engineers: number;
  frontierQueryPct: number;
  tokensPerEngineerPerMonth: number;
  opusUsdPerMillionTokens: number;
  composerUsdPerMillionTokens: number;
};

export type RoiResult = {
  monthlyTokensTotal: number;
  monthlyCostAllFrontier: number;
  monthlyCostRouted: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPct: number;
  nonFrontierSharePct: number;
};

/**
 * Simple linear token-cost model: same total tokens, split by query share.
 * "All frontier" = 100% of tokens priced at opus rate.
 * "Auto-routed" = frontier share at opus, remainder at composer-class rate.
 */
export function computeRoi(inputs: RoiInputs): RoiResult {
  const f = Math.min(100, Math.max(0, inputs.frontierQueryPct)) / 100;
  const monthlyTokensTotal = inputs.engineers * inputs.tokensPerEngineerPerMonth;
  const monthlyCostAllFrontier = (monthlyTokensTotal / 1_000_000) * inputs.opusUsdPerMillionTokens;
  const monthlyCostRouted =
    (monthlyTokensTotal / 1_000_000) *
    (f * inputs.opusUsdPerMillionTokens + (1 - f) * inputs.composerUsdPerMillionTokens);
  const monthlySavings = Math.max(0, monthlyCostAllFrontier - monthlyCostRouted);
  const annualSavings = monthlySavings * 12;
  const savingsPct =
    monthlyCostAllFrontier > 0 ? (monthlySavings / monthlyCostAllFrontier) * 100 : 0;
  return {
    monthlyTokensTotal,
    monthlyCostAllFrontier,
    monthlyCostRouted,
    monthlySavings,
    annualSavings,
    savingsPct,
    nonFrontierSharePct: (1 - f) * 100,
  };
}

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1_000_000)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  if (n >= 1000)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatTokens(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}
