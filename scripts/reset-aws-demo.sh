#!/usr/bin/env bash
set -euo pipefail

# Resets the AWS modernization demo legacy-monolith files to their original
# (Java EE + Oracle) state after a real PR merges. Run this after a modernization
# PR is merged to make the demo repeatable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
LEGACY_DIR="$REPO_ROOT/src/lib/demo/legacy-monolith"

JAVA_FILE="$LEGACY_DIR/OrdersService.java"
XML_FILE="$LEGACY_DIR/persistence.xml"
SQL_FILE="$LEGACY_DIR/orders-ddl.sql"

mkdir -p "$LEGACY_DIR"

cat > "$JAVA_FILE" << 'JAVAEOF'
package com.acme.orders.ejb;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Resource;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.sql.DataSource;

import com.acme.billing.ejb.BillingService;
import com.acme.inventory.ejb.InventoryService;
import com.acme.orders.domain.Order;
import com.acme.orders.domain.OrderLine;

@Stateless
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public class OrdersService {

    private static final Logger LOG = Logger.getLogger(OrdersService.class.getName());

    @PersistenceContext(unitName = "orders-pu")
    private EntityManager em;

    @Resource(mappedName = "jdbc/OracleDS")
    private DataSource oracleDs;

    @EJB
    private InventoryService inventoryService;

    @EJB
    private BillingService billingService;

    public long reserveInventory(long orderId, String sku, int quantity)
            throws NamingException, SQLException {

        Context ctx = new InitialContext();
        DataSource ds = (DataSource) ctx.lookup("java:comp/env/jdbc/OracleDS");

        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = ds.getConnection();
            cs = conn.prepareCall("{ call SP_RESERVE_INVENTORY(?, ?, ?, ?) }");
            cs.setLong(1, orderId);
            cs.setString(2, sku);
            cs.setInt(3, quantity);
            cs.registerOutParameter(4, Types.REF_CURSOR);
            cs.execute();

            rs = (ResultSet) cs.getObject(4);
            if (rs != null && rs.next()) {
                return rs.getLong("RESERVATION_ID");
            }
            return -1L;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
            if (conn != null) conn.close();
        }
    }
}
JAVAEOF

cat > "$XML_FILE" << 'XMLEOF'
<?xml version="1.0" encoding="UTF-8"?>
<persistence version="2.1"
             xmlns="http://xmlns.jcp.org/xml/ns/persistence"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence
                                 http://xmlns.jcp.org/xml/ns/persistence/persistence_2_1.xsd">
  <persistence-unit name="orders-pu" transaction-type="JTA">
    <provider>org.eclipse.persistence.jpa.PersistenceProvider</provider>
    <jta-data-source>jdbc/OracleDS</jta-data-source>
    <properties>
      <property name="eclipselink.target-database"
                value="org.eclipse.persistence.platform.database.OraclePlatform" />
      <property name="eclipselink.target-server" value="WebSphere_7" />
      <property name="eclipselink.jdbc.batch-writing" value="ORACLE-JDBC" />
      <property name="eclipselink.connection-pool.default.max" value="64" />
    </properties>
  </persistence-unit>
</persistence>
XMLEOF

cat > "$SQL_FILE" << 'SQLEOF'
CREATE SEQUENCE SEQ_ORDERS
  START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE PROCEDURE SP_RESERVE_INVENTORY (
  P_ORDER_ID  IN  NUMBER,
  P_SKU       IN  VARCHAR2,
  P_QTY       IN  NUMBER,
  P_CURSOR    OUT SYS_REFCURSOR
) AS
  V_ON_HAND   NUMBER(10);
  V_RESERVED  NUMBER(10);
BEGIN
  SELECT ON_HAND, RESERVED INTO V_ON_HAND, V_RESERVED
  FROM   INVENTORY
  WHERE  SKU = P_SKU
  FOR UPDATE;

  IF V_ON_HAND - V_RESERVED < P_QTY THEN
    RAISE_APPLICATION_ERROR(-20010, 'insufficient inventory');
  END IF;

  UPDATE INVENTORY SET RESERVED = RESERVED + P_QTY
   WHERE SKU = P_SKU;

  OPEN P_CURSOR FOR
    SELECT SEQ_ORDERS.NEXTVAL AS RESERVATION_ID, SYSDATE AS RESERVED_AT
    FROM   DUAL;
END SP_RESERVE_INVENTORY;
/
SQLEOF

cd "$REPO_ROOT"
git add "$JAVA_FILE" "$XML_FILE" "$SQL_FILE"
git commit -m "chore: reset aws modernization demo legacy files for next run" || {
  echo "Nothing to commit — legacy files already match the reset baseline."
  exit 0
}
echo ""
echo "Legacy monolith reset. Push to main to redeploy:"
echo "  git push origin main"
