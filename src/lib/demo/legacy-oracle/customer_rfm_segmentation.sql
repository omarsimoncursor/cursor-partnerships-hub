-- =====================================================================
-- Package: ACME_DW.CUSTOMER_RFM_SEGMENTATION
-- Database: Oracle 19c · schema ACME_DW
-- Author : alex.chen (offboarded 2023-04) · last touched 3 years ago
-- Purpose: Compute Recency / Frequency / Monetary (RFM) quintile scores
--          for every active customer and upsert results into the
--          downstream analytics mart. Drives the weekly marketing pulls,
--          churn model features, and segment mailings.
-- =====================================================================
-- LEGACY: Migration target — port to Databricks Unity Catalog + DLT.
-- LEGACY: Idioms touched on migration day:
--           - explicit cursor + FETCH loop   (→ window function)
--           - GLOBAL TEMPORARY TABLE          (→ Spark DataFrame / DLT table)
--           - MERGE INTO ... USING            (→ MERGE INTO delta.<table>)
--           - CONNECT BY PRIOR                (→ recursive CTE)
--           - NVL / DECODE                    (→ COALESCE / CASE WHEN)
--           - TO_CHAR(date, 'YYYYMM')         (→ DATE_FORMAT)
--           - ROWNUM                          (→ ROW_NUMBER() OVER(...))
-- =====================================================================

CREATE OR REPLACE PACKAGE acme_dw.customer_rfm_segmentation AS
  PROCEDURE run_scoring(p_run_date IN DATE DEFAULT TRUNC(SYSDATE));
  PROCEDURE refresh_quintiles(p_run_date IN DATE);
END customer_rfm_segmentation;
/

CREATE OR REPLACE PACKAGE BODY acme_dw.customer_rfm_segmentation AS

  -- ----------------------------------------------------------------
  -- Staging temp table — one row per active customer per run.
  -- LEGACY: Global temp tables do not exist in Databricks.
  -- ----------------------------------------------------------------
  PROCEDURE ensure_stage IS
    v_exists NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_exists
      FROM user_tables
     WHERE table_name = 'TMP_RFM_SCORES';

    IF v_exists = 0 THEN
      EXECUTE IMMEDIATE '
        CREATE GLOBAL TEMPORARY TABLE tmp_rfm_scores (
          customer_id    NUMBER(18)    NOT NULL,
          run_ym         CHAR(6)       NOT NULL,
          last_order_dt  DATE,
          recency_days   NUMBER(6),
          order_count    NUMBER(8),
          gross_sales    NUMBER(18,2),
          r_score        NUMBER(1),
          f_score        NUMBER(1),
          m_score        NUMBER(1),
          rfm_cell       CHAR(3)
        ) ON COMMIT PRESERVE ROWS';
    END IF;
  END ensure_stage;

  -- ----------------------------------------------------------------
  -- Main scoring procedure.
  -- LEGACY: Cursor + FETCH loop, NVL, DECODE, TO_CHAR, ROWNUM.
  -- ----------------------------------------------------------------
  PROCEDURE run_scoring(p_run_date IN DATE DEFAULT TRUNC(SYSDATE)) IS
    v_run_ym   CHAR(6);
    v_cutoff   DATE;
    v_rows     NUMBER := 0;

    -- Every active customer with at least one order in the last 2 years.
    -- LEGACY: ROWNUM cap is the Oracle-ism for "LIMIT 5,000,000".
    CURSOR c_customers IS
      SELECT c.customer_id,
             NVL(MAX(o.order_dt), DATE '1900-01-01')             AS last_order_dt,
             COUNT(o.order_id)                                   AS order_count,
             NVL(SUM(o.gross_amount), 0)                         AS gross_sales
        FROM acme_dw.customers  c
        LEFT JOIN acme_dw.orders o
          ON o.customer_id = c.customer_id
         AND o.order_dt   >= ADD_MONTHS(p_run_date, -24)
       WHERE c.status_cd IN ('A','H')
         AND ROWNUM <= 5000000
       GROUP BY c.customer_id
       ORDER BY c.customer_id;

    TYPE t_cust_rec IS RECORD (
      customer_id    acme_dw.customers.customer_id%TYPE,
      last_order_dt  DATE,
      order_count    NUMBER,
      gross_sales    NUMBER
    );
    r_cust t_cust_rec;

  BEGIN
    ensure_stage();

    v_run_ym := TO_CHAR(p_run_date, 'YYYYMM');
    v_cutoff := TRUNC(p_run_date);

    DELETE FROM tmp_rfm_scores WHERE run_ym = v_run_ym;

    OPEN c_customers;
    LOOP
      FETCH c_customers INTO r_cust.customer_id,
                             r_cust.last_order_dt,
                             r_cust.order_count,
                             r_cust.gross_sales;
      EXIT WHEN c_customers%NOTFOUND;

      INSERT INTO tmp_rfm_scores (
        customer_id, run_ym, last_order_dt, recency_days,
        order_count, gross_sales, r_score, f_score, m_score, rfm_cell
      )
      VALUES (
        r_cust.customer_id,
        v_run_ym,
        r_cust.last_order_dt,
        GREATEST(v_cutoff - r_cust.last_order_dt, 0),
        r_cust.order_count,
        r_cust.gross_sales,
        NULL, NULL, NULL, NULL
      );

      v_rows := v_rows + 1;
      IF MOD(v_rows, 100000) = 0 THEN
        COMMIT;
      END IF;
    END LOOP;
    CLOSE c_customers;
    COMMIT;

    refresh_quintiles(p_run_date);
  END run_scoring;

  -- ----------------------------------------------------------------
  -- Quintile assignment + MERGE into the mart.
  -- LEGACY: MERGE, DECODE, NVL, CONNECT BY for tier-hierarchy rollup.
  -- ----------------------------------------------------------------
  PROCEDURE refresh_quintiles(p_run_date IN DATE) IS
    v_run_ym CHAR(6);
  BEGIN
    v_run_ym := TO_CHAR(p_run_date, 'YYYYMM');

    -- Assign quintile scores in-place.
    UPDATE tmp_rfm_scores s
       SET r_score = ( SELECT 6 - NTILE(5) OVER (ORDER BY recency_days ASC)
                         FROM tmp_rfm_scores
                        WHERE customer_id = s.customer_id
                          AND run_ym      = s.run_ym ),
           f_score = ( SELECT NTILE(5) OVER (ORDER BY order_count DESC)
                         FROM tmp_rfm_scores
                        WHERE customer_id = s.customer_id
                          AND run_ym      = s.run_ym ),
           m_score = ( SELECT NTILE(5) OVER (ORDER BY gross_sales DESC)
                         FROM tmp_rfm_scores
                        WHERE customer_id = s.customer_id
                          AND run_ym      = s.run_ym )
     WHERE s.run_ym = v_run_ym;

    -- Build the 3-digit RFM cell code.
    UPDATE tmp_rfm_scores
       SET rfm_cell = TO_CHAR(NVL(r_score,0)) ||
                      TO_CHAR(NVL(f_score,0)) ||
                      TO_CHAR(NVL(m_score,0))
     WHERE run_ym = v_run_ym;

    -- Merge the scored rows into the mart.
    -- LEGACY: MERGE INTO <tgt> USING <src> is the canonical Oracle upsert.
    MERGE INTO acme_dw.mart_customer_rfm t
    USING (
      SELECT customer_id,
             run_ym,
             last_order_dt,
             recency_days,
             order_count,
             gross_sales,
             r_score,
             f_score,
             m_score,
             rfm_cell,
             DECODE(rfm_cell,
                    '555','Champion',
                    '554','Champion',
                    '544','Loyal',
                    '455','Loyal',
                    '344','Promising',
                    '255','At Risk',
                    '155','Hibernating',
                    '111','Lost',
                    'Other')                          AS segment_name
        FROM tmp_rfm_scores
       WHERE run_ym = v_run_ym
    ) s
    ON (t.customer_id = s.customer_id AND t.run_ym = s.run_ym)
    WHEN MATCHED THEN UPDATE SET
      t.last_order_dt  = s.last_order_dt,
      t.recency_days   = s.recency_days,
      t.order_count    = s.order_count,
      t.gross_sales    = s.gross_sales,
      t.r_score        = s.r_score,
      t.f_score        = s.f_score,
      t.m_score        = s.m_score,
      t.rfm_cell       = s.rfm_cell,
      t.segment_name   = s.segment_name,
      t.updated_at     = SYSTIMESTAMP
    WHEN NOT MATCHED THEN INSERT (
      customer_id, run_ym, last_order_dt, recency_days,
      order_count, gross_sales, r_score, f_score, m_score,
      rfm_cell, segment_name, created_at, updated_at
    ) VALUES (
      s.customer_id, s.run_ym, s.last_order_dt, s.recency_days,
      s.order_count, s.gross_sales, s.r_score, s.f_score, s.m_score,
      s.rfm_cell, s.segment_name, SYSTIMESTAMP, SYSTIMESTAMP
    );

    -- Tier rollup — walk the customer_tier hierarchy top-down.
    -- LEGACY: CONNECT BY PRIOR has no Spark equivalent; becomes a recursive CTE.
    INSERT INTO acme_dw.mart_rfm_tier_rollup (run_ym, tier_code, customer_count, gross_sales, inserted_at)
    SELECT v_run_ym,
           LPAD(' ', 2*(LEVEL-1)) || t.tier_code     AS tier_code,
           COUNT(DISTINCT r.customer_id)             AS customer_count,
           SUM(r.gross_sales)                        AS gross_sales,
           SYSTIMESTAMP
      FROM acme_dw.customer_tier t
      LEFT JOIN acme_dw.mart_customer_rfm r
        ON r.tier_code = t.tier_code
       AND r.run_ym    = v_run_ym
     START WITH t.parent_tier IS NULL
   CONNECT BY PRIOR t.tier_code = t.parent_tier
     GROUP BY t.tier_code, LEVEL
     ORDER SIBLINGS BY t.tier_code;

    COMMIT;
  END refresh_quintiles;

END customer_rfm_segmentation;
/

-- =====================================================================
-- Grants (propagated to downstream analytics consumers).
-- LEGACY: In Databricks these become Unity Catalog GRANTs on catalogs,
--         schemas, and tables — not on packages or procedures.
-- =====================================================================
GRANT EXECUTE ON acme_dw.customer_rfm_segmentation TO analytics_reader;
GRANT EXECUTE ON acme_dw.customer_rfm_segmentation TO marketing_ops;
GRANT SELECT  ON acme_dw.mart_customer_rfm         TO analytics_reader;
GRANT SELECT  ON acme_dw.mart_customer_rfm         TO marketing_ops;
GRANT SELECT  ON acme_dw.mart_rfm_tier_rollup      TO analytics_reader;
