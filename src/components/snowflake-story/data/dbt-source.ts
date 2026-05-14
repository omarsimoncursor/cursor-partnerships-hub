/**
 * Real-looking source files used by Act 4. The legacy BTEQ on the left is
 * what the team has been running for a decade. The dbt model on the right is
 * what Cursor authors. The patches mirror the AWS journey&rsquo;s Codex security
 * patches — here they&rsquo;re data-platform corrections (banker&rsquo;s rounding macro,
 * deprecated currency handling).
 */

export const DAILY_REVENUE_BTEQ = `.LOGON td_prod/analytics_engineer;
.SET ERROROUT STDOUT;
.SET WIDTH 1024;

-- daily_revenue_rollup.bteq
-- Owner: data-platform (one of two readers)
-- Last edit: 2018-04-12

CREATE MULTISET VOLATILE TABLE _stg_daily_revenue
  ON COMMIT PRESERVE ROWS AS (
    SELECT
      order_date,
      region,
      currency,
      category,
      SUM(net_amount)              AS revenue_native,
      SUM(net_amount * fx_rate)    AS revenue_usd
    FROM   prod_orders.fct_order_lines ol
    JOIN   prod_ref.dim_currency      c
      ON   ol.currency = c.iso_code
    WHERE  order_date BETWEEN DATE - 90 AND DATE
      AND  c.deprecated_flag = 'N'
    GROUP BY order_date, region, currency, category
  ) WITH DATA;

COLLECT STATISTICS ON _stg_daily_revenue
  COLUMN (order_date, region, currency, category);

-- Top-100 customers leaderboard (ranking matters to finance)
INSERT INTO prod_marts.fct_daily_revenue
SELECT
  order_date,
  region,
  category,
  SUM(revenue_usd)                                  AS revenue_usd,
  SUM(revenue_native)                               AS revenue_native,
  COUNT(DISTINCT order_id)                          AS orders,
  RANK() OVER (PARTITION BY order_date
               ORDER BY SUM(revenue_usd) DESC)      AS rev_rank
FROM   _stg_daily_revenue s
JOIN   prod_orders.fct_order_lines ol
  ON   ol.order_date = s.order_date
GROUP BY order_date, region, category
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY order_date, region
  ORDER BY     ROUND(SUM(revenue_usd), 2) DESC
) <= 100;

.LOGOFF;
`;

export const FCT_DAILY_REVENUE_DBT = `{{ config(
    materialized        = 'incremental',
    unique_key          = ['order_date', 'region', 'category'],
    on_schema_change    = 'append_new_columns',
    incremental_strategy= 'merge',
    transient           = true
) }}

with stg_daily_revenue as (
    select
        order_date,
        region,
        currency,
        category,
        sum(net_amount)                  as revenue_native,
        sum(net_amount * fx_rate)        as revenue_usd
    from   {{ ref('fct_order_lines') }} ol
    join   {{ ref('dim_currency')   }} c
        on ol.currency = c.iso_code
    where  order_date between current_date - 90 and current_date
      and  c.deprecated_flag = 'N'
    group by order_date, region, currency, category
)

select
    order_date,
    region,
    category,
    sum(revenue_usd)                              as revenue_usd,
    sum(revenue_native)                           as revenue_native,
    count(distinct order_id)                      as orders,
    rank() over (partition by order_date
                 order by sum(revenue_usd) desc)  as rev_rank
from   stg_daily_revenue s
join   {{ ref('fct_order_lines') }} ol
    on ol.order_date = s.order_date
group by order_date, region, category
qualify row_number() over (
    partition by order_date, region
    order by     {{ bankers_round('sum(revenue_usd)', 2) }} desc, customer_id
) <= 100
`;

/**
 * Codex-style auto-patches the agent applies. Each maps to a line in the dbt
 * model that Cursor rewrites in response to either the reviewer&rsquo;s feedback
 * (banker&rsquo;s rounding) or its own inspection (currency tie-break).
 */
export interface DbtPatch {
  /** 1-indexed line in the dbt source above. */
  line: number;
  /** What the line was. */
  before: string;
  /** What Cursor changed it to. */
  after: string;
  category: 'rounding' | 'tie-break' | 'fx';
  summary: string;
  detail: string;
}

export const DBT_PATCHES: DbtPatch[] = [
  {
    line: 35,
    before: '    order by     sum(revenue_usd) desc',
    after: "    order by     {{ bankers_round('sum(revenue_usd)', 2) }} desc, customer_id",
    category: 'rounding',
    summary: 'Apply banker&rsquo;s rounding + customer_id tie-break',
    detail:
      'Preserves legacy BTEQ behavior so finance reconciliation stays clean and the top-100 ranking is deterministic.',
  },
];
