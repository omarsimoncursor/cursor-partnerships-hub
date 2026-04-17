/* ============================================================================
 * usp_enrich_customers_360.sql
 *
 * Legacy SQL Server 2019 stored procedure: enriches the customer-360 mart
 * with rolling 13-month purchase behavior, channel preference, and
 * loyalty-tier signals. Runs hourly from SSIS against acme_crm.dbo.
 *
 * This file is deliberately vendor-locked to T-SQL. Cursor modernizes it into
 * either (a) a Snowflake Scripting / Snowpark Python procedure, or
 * (b) a dbt incremental model with macro-driven MERGE — whichever is a
 * better semantic fit. Defaults to (a) for parity.
 *
 * Dependencies:
 *   acme_crm.dbo.stg_customer_events      (JSON blobs per event)
 *   acme_crm.dbo.dim_customer             (current customer profile)
 *   acme_crm.dbo.dim_loyalty_tier         (loyalty cutoffs)
 *   acme_crm.dbo.mart_customer_360        (target)
 *
 * Author:  m.alfaro@acme.com
 * Last touched: 11 months ago (commit 4b8312e)
 * ============================================================================ */

USE acme_crm;
GO

IF OBJECT_ID('dbo.usp_enrich_customers_360', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_enrich_customers_360;
GO

CREATE PROCEDURE dbo.usp_enrich_customers_360
    @run_window_start  DATETIME2(3) = NULL,
    @run_window_end    DATETIME2(3) = NULL,
    @batch_id          UNIQUEIDENTIFIER = NULL,
    @rows_merged       INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    /* -----------------------------------------------------------------------
     * Default window: last 1 hour up to SYSDATETIMEOFFSET().
     *
     * LEGACY: DATETIME2 + SYSDATETIMEOFFSET() are SQL Server-native.
     *         Snowflake: CURRENT_TIMESTAMP / TIMESTAMP_TZ.
     * ---------------------------------------------------------------------- */
    DECLARE @now            DATETIME2(3) = SYSUTCDATETIME();
    DECLARE @window_start   DATETIME2(3) = ISNULL(@run_window_start, DATEADD(HOUR, -1, @now));
    DECLARE @window_end     DATETIME2(3) = ISNULL(@run_window_end,   @now);
    DECLARE @this_batch     UNIQUEIDENTIFIER = ISNULL(@batch_id, NEWID());

    /* -----------------------------------------------------------------------
     * 1. Stage fresh events from the JSON blob column (event_payload NVARCHAR).
     *
     * LEGACY: OPENJSON + WITH (...) schema projection is T-SQL-only.
     *         Snowflake: PARSE_JSON + FLATTEN / LATERAL FLATTEN.
     * ---------------------------------------------------------------------- */
    DECLARE @events TABLE (
        event_id          BIGINT,
        customer_id       BIGINT,
        event_ts          DATETIME2(3),
        event_channel     VARCHAR(32),
        event_type        VARCHAR(64),
        order_id          BIGINT,
        order_value_usd   DECIMAL(18, 4),
        loyalty_points    INT,
        is_returning      BIT
    );

    INSERT INTO @events
    SELECT
        e.event_id,
        e.customer_id,
        e.event_ts,
        e.event_channel,
        j.event_type,
        j.order_id,
        j.order_value_usd,
        j.loyalty_points,
        j.is_returning
    FROM dbo.stg_customer_events e
    CROSS APPLY OPENJSON(e.event_payload)
        WITH (
            event_type       VARCHAR(64)    '$.type',
            order_id         BIGINT         '$.order.id',
            order_value_usd  DECIMAL(18, 4) '$.order.value_usd',
            loyalty_points   INT            '$.loyalty.points_delta',
            is_returning     BIT            '$.customer.is_returning'
        ) j
    WHERE e.event_ts >= @window_start
      AND e.event_ts <  @window_end;

    /* -----------------------------------------------------------------------
     * 2. Rolling 13-month spend per customer, using window functions over
     *    the existing mart. CROSS APPLY materializes a "latest-seen" row
     *    per customer for comparison.
     *
     * LEGACY: CROSS APPLY / OUTER APPLY with TOP is T-SQL-canonical.
     *         Snowflake: LATERAL (SELECT ...) subqueries or window functions.
     * ---------------------------------------------------------------------- */
    ;WITH rolling AS (
        SELECT
            c.customer_id,
            SUM(CASE WHEN e.event_ts >= DATEADD(MONTH, -13, @now)
                     THEN e.order_value_usd ELSE 0 END)   AS spend_13m_usd,
            SUM(CASE WHEN e.event_ts >= DATEADD(DAY,   -30, @now)
                     THEN e.order_value_usd ELSE 0 END)   AS spend_30d_usd,
            COUNT(DISTINCT CASE WHEN e.event_type = 'ORDER_PLACED'
                                AND e.event_ts >= DATEADD(MONTH, -13, @now)
                                THEN e.order_id END)      AS orders_13m,
            MAX(e.event_ts)                               AS last_event_ts
        FROM dbo.dim_customer c
        LEFT JOIN dbo.stg_customer_events se
            ON se.customer_id = c.customer_id
           AND se.event_ts   >= DATEADD(MONTH, -13, @now)
        LEFT JOIN @events e
            ON e.customer_id = c.customer_id
        GROUP BY c.customer_id
    ),
    tier_assignment AS (
        SELECT
            r.customer_id,
            r.spend_13m_usd,
            r.spend_30d_usd,
            r.orders_13m,
            r.last_event_ts,
            t.tier_code,
            t.tier_name
        FROM rolling r
        OUTER APPLY (
            SELECT TOP 1 dt.tier_code, dt.tier_name
            FROM dbo.dim_loyalty_tier dt
            WHERE dt.min_spend_usd <= r.spend_13m_usd
            ORDER BY dt.min_spend_usd DESC
        ) t
    )

    /* -----------------------------------------------------------------------
     * 3. MERGE the rolling signals into the customer-360 mart.
     *
     * LEGACY: MERGE INTO ... USING ... WHEN MATCHED / WHEN NOT MATCHED BY
     *         TARGET is T-SQL-canonical. Snowflake's MERGE is syntactically
     *         similar but Cursor prefers a dbt incremental model with
     *         unique_key = customer_id for observability and testability.
     * ---------------------------------------------------------------------- */
    MERGE INTO dbo.mart_customer_360 AS tgt
    USING tier_assignment AS src
       ON tgt.customer_id = src.customer_id
    WHEN MATCHED THEN UPDATE SET
        tgt.spend_13m_usd   = src.spend_13m_usd,
        tgt.spend_30d_usd   = src.spend_30d_usd,
        tgt.orders_13m      = src.orders_13m,
        tgt.loyalty_tier    = src.tier_code,
        tgt.loyalty_label   = src.tier_name,
        tgt.last_event_ts   = src.last_event_ts,
        tgt.updated_at      = @now,
        tgt.updated_batch   = @this_batch
    WHEN NOT MATCHED BY TARGET THEN INSERT (
        customer_id, spend_13m_usd, spend_30d_usd, orders_13m,
        loyalty_tier, loyalty_label, last_event_ts, created_at,
        updated_at, updated_batch
    ) VALUES (
        src.customer_id, src.spend_13m_usd, src.spend_30d_usd, src.orders_13m,
        src.tier_code, src.tier_name, src.last_event_ts, @now,
        @now, @this_batch
    );

    SET @rows_merged = @@ROWCOUNT;

    /* -----------------------------------------------------------------------
     * 4. Emit a JSON audit row per run so downstream dashboards can track
     *    enrichment freshness.
     *
     * LEGACY: FOR JSON PATH is T-SQL-only. Snowflake: OBJECT_CONSTRUCT(...).
     * ---------------------------------------------------------------------- */
    DECLARE @audit NVARCHAR(MAX) = (
        SELECT
            CAST(@this_batch AS NVARCHAR(64))               AS batch_id,
            CONVERT(NVARCHAR(33), @window_start, 127)       AS window_start,
            CONVERT(NVARCHAR(33), @window_end,   127)       AS window_end,
            @rows_merged                                    AS rows_merged,
            CONVERT(NVARCHAR(33), @now, 127)                AS run_at
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    );

    INSERT INTO dbo.audit_customer_360_runs (batch_id, payload, created_at)
    VALUES (@this_batch, @audit, @now);

    RETURN 0;
END;
GO

GRANT EXECUTE ON dbo.usp_enrich_customers_360 TO [acme_crm_service];
GO
