/**
 * Verbatim Java EE source used by Act 4 (left pane).
 * Vendored from src/lib/demo/legacy-monolith/OrdersService.java at build time.
 * If you update the .java file, regenerate this constant via scripts/reset-aws-demo.sh
 * (or by running: `awk -f scripts/java-to-ts.awk src/lib/demo/legacy-monolith/OrdersService.java`).
 */
export const ORDERS_SERVICE_JAVA = String.raw`package com.acme.orders.ejb;

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

/**
 * OrdersService - core order lifecycle EJB.
 *
 * LEGACY: Deployed on WebSphere Application Server 8.5 against Oracle 12c.
 * This bean mixes orchestration, persistence, billing, and inventory
 * responsibilities across three cross-cutting boundaries and leaks
 * vendor-specific exception types to its callers.
 *
 * Target state: decompose into AWS Lambda handlers + Aurora Serverless v2,
 * with IAM least-privilege and Secrets Manager for credentials. See the
 * modernization triage plan in docs/modernization/ for the decomposition.
 */
@Stateless
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public class OrdersService {

    private static final Logger LOG = Logger.getLogger(OrdersService.class.getName());

    // LEGACY: container-managed EntityManager tied to a WebSphere-specific
    // persistence unit. The \`orders-pu\` unit in persistence.xml pins us to
    // EclipseLink + WebSphere + Oracle.
    @PersistenceContext(unitName = "orders-pu")
    private EntityManager em;

    // LEGACY: shared Oracle DataSource via JNDI. Every service in the monolith
    // elbows its way through the same connection pool, so one slow tenant
    // starves the others.
    @Resource(mappedName = "jdbc/OracleDS")
    private DataSource oracleDs;

    @EJB
    private InventoryService inventoryService;

    @EJB
    private BillingService billingService;

    /**
     * Creates an order, reserves inventory, and captures revenue in a single
     * transaction.
     *
     * LEGACY: Three bounded contexts (orders / inventory / billing) entangled
     * in one transaction. Any slow downstream blocks the whole thread pool.
     */
    public Order createOrder(String customerId, List<OrderLine> lines) throws OrdersException {
        if (customerId == null || customerId.isEmpty()) {
            throw new IllegalArgumentException("customerId is required");
        }
        if (lines == null || lines.isEmpty()) {
            throw new IllegalArgumentException("order must contain at least one line");
        }

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setStatus("PENDING");
        order.setCreatedAt(new Date());
        order.setLines(lines);
        em.persist(order);
        em.flush();

        // LEGACY: synchronous cross-bean call through the container. This is
        // where the EJB call chain turns into a blocking tree — there is no
        // back-pressure and no circuit breaker.
        for (OrderLine line : lines) {
            try {
                reserveInventory(order.getId(), line.getSku(), line.getQuantity());
            } catch (SQLException e) {
                LOG.log(Level.SEVERE, "Oracle stored proc SP_RESERVE_INVENTORY failed", e);
                throw new OrdersException("inventory reservation failed for sku=" + line.getSku(), e);
            } catch (NamingException e) {
                // LEGACY: checked JNDI exceptions leak all the way out to the
                // servlet layer because we never wrapped them.
                LOG.log(Level.SEVERE, "JNDI lookup failed while reserving inventory", e);
                throw new OrdersException("JNDI lookup failed", e);
            }
        }

        try {
            billingService.capturePayment(order.getId(), computeTotal(lines));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "Billing capture failed — order left in PENDING", e);
            throw new OrdersException("billing capture failed", e);
        }

        order.setStatus("CONFIRMED");
        em.merge(order);
        return order;
    }

    /**
     * Reserves inventory for a single line by invoking the Oracle stored
     * procedure SP_RESERVE_INVENTORY directly through a CallableStatement.
     *
     * LEGACY: Direct JDBC on a JNDI DataSource. The stored proc returns a
     * cursor out-parameter that is never closed on every code path.
     */
    public long reserveInventory(long orderId, String sku, int quantity)
            throws NamingException, SQLException {

        // LEGACY: re-lookup via JNDI inside the hot path instead of relying on
        // the injected @Resource. Every call allocates a fresh InitialContext.
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
            // LEGACY: partial cleanup — if rs.close() throws, cs/conn leak.
            if (rs != null) rs.close();
            if (cs != null) cs.close();
            if (conn != null) conn.close();
        }
    }

    /**
     * Captures revenue for a confirmed order.
     *
     * LEGACY: Uses a native Oracle sequence via JPA's native query escape.
     * Portability to Aurora PostgreSQL requires swapping the sequence for a
     * PG identity column or a pg_sequence.
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public long captureRevenue(long orderId, double amount) throws OrdersException {
        if (amount < 0.0) {
            throw new OrdersException("amount must be >= 0");
        }
        try {
            // LEGACY: Oracle-specific SEQ_REVENUE.NEXTVAL inside a JPA native
            // query. Aurora PG has no Oracle sequences.
            Query q = em.createNativeQuery(
                "INSERT INTO REVENUE_LEDGER (ID, ORDER_ID, AMOUNT, CAPTURED_AT) "
                    + "VALUES (SEQ_REVENUE.NEXTVAL, ?, ?, SYSDATE)");
            q.setParameter(1, orderId);
            q.setParameter(2, amount);
            q.executeUpdate();

            Query idQ = em.createNativeQuery("SELECT SEQ_REVENUE.CURRVAL FROM DUAL");
            return ((Number) idQ.getSingleResult()).longValue();
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "Revenue capture failed for order " + orderId, e);
            throw new OrdersException("revenue capture failed", e);
        }
    }

    private double computeTotal(List<OrderLine> lines) {
        double total = 0.0;
        for (OrderLine line : lines) {
            total += line.getUnitPrice() * line.getQuantity();
        }
        return total;
    }

    public static class OrdersException extends Exception {
        private static final long serialVersionUID = 1L;

        public OrdersException(String message) {
            super(message);
        }

        public OrdersException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
`;
