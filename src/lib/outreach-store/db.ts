// Re-export the shared `getPool` / `query` from prospect-store. The
// outreach tables live in the same Postgres database (same Neon
// project), so we deliberately do NOT spin up a second pool — that
// would just halve the per-pool max connection budget.

export { getPool, query, withClient, isDatabaseConfigured } from '../prospect-store/db';
