-- ============================================================================
-- orders-ddl.sql
--
-- LEGACY: Oracle 12c schema backing the OrdersService EJB. This DDL embodies
-- every reason the monolith cannot scale horizontally:
--   1. Global sequences (SEQ_ORDERS, SEQ_REVENUE) generate primary keys
--      instead of identity columns.
--   2. PL/SQL stored procedures carry business logic that belongs in the
--      application tier.
--   3. A CURSOR out-parameter (SP_RESERVE_INVENTORY) streams rows back to
--      the JDBC caller -- a pattern that does not exist in Aurora
--      PostgreSQL and forces a rewrite on migration.
--   4. CHAR columns, NLS_DATE_FORMAT assumptions, and SYSDATE pin the
--      schema to Oracle's session semantics.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Sequences (Oracle-specific -- no direct Aurora PG equivalent)
-- ---------------------------------------------------------------------------

CREATE SEQUENCE SEQ_ORDERS
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE SEQ_REVENUE
  START WITH 1
  INCREMENT BY 1
  CACHE 100
  NOCYCLE;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE ORDERS (
  ID           NUMBER(19)      NOT NULL,
  CUSTOMER_ID  VARCHAR2(64)    NOT NULL,
  STATUS       CHAR(12)        DEFAULT 'PENDING' NOT NULL,
  CREATED_AT   DATE            DEFAULT SYSDATE   NOT NULL,
  UPDATED_AT   DATE,
  CONSTRAINT PK_ORDERS PRIMARY KEY (ID)
);

CREATE TABLE ORDER_LINES (
  ID           NUMBER(19)      NOT NULL,
  ORDER_ID     NUMBER(19)      NOT NULL,
  SKU          VARCHAR2(64)    NOT NULL,
  QUANTITY     NUMBER(10)      NOT NULL,
  UNIT_PRICE   NUMBER(14, 4)   NOT NULL,
  CONSTRAINT PK_ORDER_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_LINES_ORDER  FOREIGN KEY (ORDER_ID) REFERENCES ORDERS (ID)
);

CREATE TABLE INVENTORY (
  SKU             VARCHAR2(64)  NOT NULL,
  ON_HAND         NUMBER(10)    NOT NULL,
  RESERVED        NUMBER(10)    DEFAULT 0 NOT NULL,
  CONSTRAINT PK_INVENTORY PRIMARY KEY (SKU)
);

CREATE TABLE RESERVATIONS (
  RESERVATION_ID  NUMBER(19)    NOT NULL,
  ORDER_ID        NUMBER(19)    NOT NULL,
  SKU             VARCHAR2(64)  NOT NULL,
  QUANTITY        NUMBER(10)    NOT NULL,
  RESERVED_AT     DATE          DEFAULT SYSDATE NOT NULL,
  CONSTRAINT PK_RESERVATIONS PRIMARY KEY (RESERVATION_ID)
);

CREATE TABLE REVENUE_LEDGER (
  ID           NUMBER(19)      NOT NULL,
  ORDER_ID     NUMBER(19)      NOT NULL,
  AMOUNT       NUMBER(14, 2)   NOT NULL,
  CAPTURED_AT  DATE            DEFAULT SYSDATE NOT NULL,
  CONSTRAINT PK_REVENUE_LEDGER PRIMARY KEY (ID)
);

CREATE INDEX IX_ORDERS_CUSTOMER  ON ORDERS (CUSTOMER_ID);
CREATE INDEX IX_LINES_ORDER      ON ORDER_LINES (ORDER_ID);
CREATE INDEX IX_RES_ORDER        ON RESERVATIONS (ORDER_ID);
CREATE INDEX IX_REV_ORDER        ON REVENUE_LEDGER (ORDER_ID);

-- ---------------------------------------------------------------------------
-- SP_RESERVE_INVENTORY
--
-- LEGACY: This is the stored procedure invoked from OrdersService.java via
-- CallableStatement. It mixes inventory mutation and row streaming in a
-- single call, returning a REF CURSOR to the client. The target Aurora
-- PG equivalent becomes a stored function returning SETOF.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE SP_RESERVE_INVENTORY (
  P_ORDER_ID  IN  NUMBER,
  P_SKU       IN  VARCHAR2,
  P_QTY       IN  NUMBER,
  P_CURSOR    OUT SYS_REFCURSOR
) AS
  V_ON_HAND   NUMBER(10);
  V_RESERVED  NUMBER(10);
  V_RES_ID    NUMBER(19);
BEGIN
  -- Lock the inventory row for update; Oracle row lock semantics.
  SELECT ON_HAND, RESERVED INTO V_ON_HAND, V_RESERVED
  FROM   INVENTORY
  WHERE  SKU = P_SKU
  FOR UPDATE;

  IF V_ON_HAND - V_RESERVED < P_QTY THEN
    RAISE_APPLICATION_ERROR(-20010,
      'insufficient inventory for sku=' || P_SKU || ' qty=' || P_QTY);
  END IF;

  UPDATE INVENTORY
     SET RESERVED = RESERVED + P_QTY
   WHERE SKU = P_SKU;

  V_RES_ID := SEQ_ORDERS.NEXTVAL * 1000;

  INSERT INTO RESERVATIONS (
    RESERVATION_ID, ORDER_ID, SKU, QUANTITY, RESERVED_AT
  ) VALUES (
    V_RES_ID, P_ORDER_ID, P_SKU, P_QTY, SYSDATE
  );

  -- LEGACY: REF CURSOR out-param has no Aurora PG equivalent; the caller
  -- must be rewritten to use a scalar return or SETOF in pg_reserve_inventory.
  OPEN P_CURSOR FOR
    SELECT V_RES_ID AS RESERVATION_ID,
           P_ORDER_ID AS ORDER_ID,
           P_SKU      AS SKU,
           P_QTY      AS QUANTITY,
           SYSDATE    AS RESERVED_AT
    FROM   DUAL;
END SP_RESERVE_INVENTORY;
/

-- ---------------------------------------------------------------------------
-- SP_CAPTURE_REVENUE
-- LEGACY: Business logic (status flip + ledger insert) embedded in PL/SQL.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE SP_CAPTURE_REVENUE (
  P_ORDER_ID  IN  NUMBER,
  P_AMOUNT    IN  NUMBER,
  P_RESULT    OUT NUMBER
) AS
BEGIN
  UPDATE ORDERS
     SET STATUS     = 'CONFIRMED',
         UPDATED_AT = SYSDATE
   WHERE ID = P_ORDER_ID;

  INSERT INTO REVENUE_LEDGER (ID, ORDER_ID, AMOUNT, CAPTURED_AT)
  VALUES (SEQ_REVENUE.NEXTVAL, P_ORDER_ID, P_AMOUNT, SYSDATE);

  P_RESULT := SEQ_REVENUE.CURRVAL;
EXCEPTION
  WHEN OTHERS THEN
    P_RESULT := -1;
    RAISE;
END SP_CAPTURE_REVENUE;
/

-- ---------------------------------------------------------------------------
-- Seed data (trimmed; real monolith has ~4M rows across these tables)
-- ---------------------------------------------------------------------------

INSERT INTO INVENTORY (SKU, ON_HAND, RESERVED) VALUES ('SKU-0001', 12400, 0);
INSERT INTO INVENTORY (SKU, ON_HAND, RESERVED) VALUES ('SKU-0002',  8800, 0);
INSERT INTO INVENTORY (SKU, ON_HAND, RESERVED) VALUES ('SKU-0003',   620, 0);
COMMIT;
