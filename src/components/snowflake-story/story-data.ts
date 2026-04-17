export interface AssetBrick {
  id: number;
  filename: string;
  dialect: 'bteq' | 'tsql' | 'informatica' | 'ssis';
  lastTouched: string;
  loc: number;
  modernizedAtMonth: number;
}

const BTEQ_NAMES = [
  'daily_revenue_rollup', 'customer_ltv_weekly', 'inventory_position_daily', 'order_cycle_rollup',
  'region_revenue_fan', 'fx_conversion_snapshot', 'campaign_attribution_bteq', 'product_hierarchy_rollup',
  'returns_cohort_bteq', 'loyalty_tier_recompute', 'price_elasticity_daily', 'retailer_margin_roll',
  'qty_on_hand_delta', 'promo_impact_bteq', 'customer_churn_bteq', 'basket_size_daily',
  'store_traffic_roll', 'shrinkage_attribution', 'ad_spend_payback', 'net_sales_daily',
];

const TSQL_NAMES = [
  'usp_enrich_customers_360', 'usp_sync_order_hub', 'usp_merge_product_master',
  'usp_settle_loyalty_balances', 'usp_refresh_campaign_cube', 'usp_reconcile_gl_lines',
  'usp_flatten_order_events', 'usp_denormalize_geo', 'usp_apply_price_overrides',
  'usp_mark_dormant_customers', 'usp_expand_basket_json', 'usp_project_store_metrics',
  'usp_rewrite_device_id_map', 'usp_tag_fraud_signals', 'usp_settle_returns', 'usp_score_cart_abandon',
];

const INFORMATICA_NAMES = [
  'wf_customers_360', 'wf_orders_hub', 'wf_product_hierarchy', 'wf_campaign_fact',
  'wf_returns_flow', 'wf_loyalty_events', 'wf_store_traffic_sync', 'wf_media_spend_etl',
];

const SSIS_NAMES = ['pkg_nightly_batch', 'pkg_geo_reload', 'pkg_finance_cube', 'pkg_hr_people_sync'];

const MONTHS_BACK = [
  '4mo ago', '7mo ago', '11mo ago', '1yr ago', '1yr 3mo ago', '1yr 8mo ago', '2yr ago',
  '2yr 4mo ago', '2yr 9mo ago', '3yr 1mo ago', '3yr 6mo ago', '4yr 2mo ago', '5yr 1mo ago',
  '6yr ago', '7yr 3mo ago', '8yr ago',
];

function seeded(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seeded(seed) * arr.length)];
}

export const BRICK_COUNT = 911;

export function buildBricks(): AssetBrick[] {
  const bricks: AssetBrick[] = [];
  const counts: Array<{ kind: AssetBrick['dialect']; n: number; names: string[]; suffix: string }> = [
    { kind: 'bteq', n: 247, names: BTEQ_NAMES, suffix: '.bteq' },
    { kind: 'tsql', n: 412, names: TSQL_NAMES, suffix: '.sql' },
    { kind: 'informatica', n: 184, names: INFORMATICA_NAMES, suffix: '.xml' },
    { kind: 'ssis', n: 68, names: SSIS_NAMES, suffix: '.dtsx' },
  ];
  let id = 0;
  for (const { kind, n, names, suffix } of counts) {
    for (let i = 0; i < n; i++) {
      const base = names[i % names.length];
      const variant = Math.floor(i / names.length);
      const filename =
        variant === 0
          ? `${base}${suffix}`
          : `${base}_${String(variant + 1).padStart(2, '0')}${suffix}`;
      const locSeed = seeded(id * 7 + 11);
      const baseLoc = kind === 'bteq' ? 180 : kind === 'tsql' ? 140 : kind === 'informatica' ? 60 : 90;
      const loc = Math.floor(baseLoc + locSeed * 160);
      let modernizedAtMonth: number;
      if (id === 0) {
        modernizedAtMonth = 0;
      } else {
        const pctSeed = seeded(id * 13 + 3);
        const curve = Math.pow(pctSeed, 0.7);
        modernizedAtMonth = Math.min(14, Math.floor(curve * 15));
      }
      bricks.push({
        id: id++,
        filename,
        dialect: kind,
        lastTouched: pick(MONTHS_BACK, id * 3 + 5),
        loc,
        modernizedAtMonth,
      });
    }
  }
  return bricks;
}

export const DIALECT_META: Record<
  AssetBrick['dialect'],
  { label: string; color: string; short: string }
> = {
  bteq: { label: 'Teradata BTEQ', color: '#F59E0B', short: 'BTEQ' },
  tsql: { label: 'SQL Server T-SQL', color: '#A78BFA', short: 'T-SQL' },
  informatica: { label: 'Informatica PowerCenter', color: '#F97373', short: 'Infa' },
  ssis: { label: 'SQL Server SSIS', color: '#C48FFF', short: 'SSIS' },
};

export interface IdiomNode {
  id: string;
  legacy: string;
  dialect: 'Teradata' | 'T-SQL' | 'Informatica';
  snowflake: string;
  note: string;
  x: number;
  y: number;
  r: number;
}

export const IDIOMS: IdiomNode[] = [
  {
    id: 'qualify', legacy: 'QUALIFY ROW_NUMBER()', dialect: 'Teradata',
    snowflake: 'QUALIFY ROW_NUMBER() (native)',
    note: 'Snowflake supports QUALIFY natively — one-for-one translation. Window spec unchanged.',
    x: 18, y: 30, r: 14,
  },
  {
    id: 'multiset', legacy: 'MULTISET VOLATILE TABLE', dialect: 'Teradata',
    snowflake: 'CTE or transient temp',
    note: 'ON COMMIT PRESERVE ROWS collapses to a CTE or a transient table scoped per-session.',
    x: 36, y: 18, r: 13,
  },
  {
    id: 'collect-stats', legacy: 'COLLECT STATISTICS', dialect: 'Teradata',
    snowflake: 'micro-partition stats',
    note: 'Snowflake maintains micro-partition metadata automatically; the directive is a no-op.',
    x: 58, y: 24, r: 11,
  },
  {
    id: 'td-date-math', legacy: 'ADD_MONTHS, (DATE - 1)', dialect: 'Teradata',
    snowflake: 'DATEADD, DATE_TRUNC',
    note: 'Teradata date arithmetic maps to DATEADD/DATE_TRUNC with explicit units.',
    x: 82, y: 38, r: 11,
  },
  {
    id: 'merge', legacy: 'MERGE ... WHEN MATCHED', dialect: 'T-SQL',
    snowflake: 'MERGE INTO (Snowflake)',
    note: 'Same MERGE verb but Snowflake semantics are stricter on source dedup — handled via CTE.',
    x: 28, y: 62, r: 14,
  },
  {
    id: 'cross-apply', legacy: 'CROSS APPLY', dialect: 'T-SQL',
    snowflake: 'LATERAL FLATTEN',
    note: 'Row-wise subquery application maps to LATERAL; JSON/array payloads go through FLATTEN.',
    x: 52, y: 72, r: 12,
  },
  {
    id: 'openjson', legacy: 'OPENJSON, FOR JSON PATH', dialect: 'T-SQL',
    snowflake: 'PARSE_JSON + FLATTEN',
    note: 'Semi-structured parsing collapses to VARIANT + FLATTEN; output shape is preserved.',
    x: 72, y: 62, r: 12,
  },
];

export interface CalendarBlock {
  month: number;
  assetsCompleted: number;
  cumulativeCredits: number;
  narrative?: string;
}

export const CALENDAR: CalendarBlock[] = [
  { month: 0, assetsCompleted: 1, cumulativeCredits: 0, narrative: 'Asset #1: daily_revenue_rollup lands Friday.' },
  { month: 1, assetsCompleted: 12, cumulativeCredits: 180_000 },
  { month: 2, assetsCompleted: 38, cumulativeCredits: 540_000, narrative: 'Cortex semantic diff catches 2 subtle MERGE bugs the GSI would have shipped.' },
  { month: 3, assetsCompleted: 82, cumulativeCredits: 1_120_000 },
  { month: 4, assetsCompleted: 140, cumulativeCredits: 1_980_000 },
  { month: 5, assetsCompleted: 210, cumulativeCredits: 3_080_000, narrative: 'Dynamic Tables light up on modernized BTEQ rollups.' },
  { month: 6, assetsCompleted: 295, cumulativeCredits: 4_410_000 },
  { month: 7, assetsCompleted: 390, cumulativeCredits: 5_920_000 },
  { month: 8, assetsCompleted: 488, cumulativeCredits: 7_560_000 },
  { month: 9, assetsCompleted: 590, cumulativeCredits: 9_280_000, narrative: 'Snowpark adoption crosses 40% of modernized assets.' },
  { month: 10, assetsCompleted: 690, cumulativeCredits: 10_970_000 },
  { month: 11, assetsCompleted: 770, cumulativeCredits: 12_400_000 },
  { month: 12, assetsCompleted: 840, cumulativeCredits: 13_680_000, narrative: 'Marketplace listing goes live on modernized customer-360 mart.' },
  { month: 13, assetsCompleted: 880, cumulativeCredits: 14_680_000 },
  { month: 14, assetsCompleted: 902, cumulativeCredits: 15_520_000 },
  { month: 15, assetsCompleted: 911, cumulativeCredits: 16_000_000, narrative: 'All 911 legacy assets retired. GSI baseline was 4 years from today.' },
];
