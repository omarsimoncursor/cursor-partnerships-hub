import { Pool, type PoolConfig } from 'pg';

// Single, lazily-initialized Postgres pool shared across all API
// routes. The connection string is `process.env.DATABASE_URL` and is
// expected to point at a Neon project for production / preview, or
// any Postgres 13+ for local dev.
//
// We deliberately keep the pool small because Vercel's serverless
// functions are short-lived and a high `max` would just thrash the
// upstream connection limit on Neon.

declare global {
  // eslint-disable-next-line no-var
  var __prospect_pg_pool: Pool | undefined;
}

// Vercel's Neon integration injects multiple connection-string env vars
// depending on which template was picked at integration time. We accept
// any of them so deployments work regardless of which integration variant
// the operator chose. `DATABASE_URL` is the explicit override and wins.
const CONNECTION_STRING_ENV_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_UNPOOLED',
] as const;

function resolveConnectionString(): string | null {
  for (const name of CONNECTION_STRING_ENV_VARS) {
    const value = process.env[name];
    if (value && value.trim()) return value;
  }
  return null;
}

function buildPool(): Pool | null {
  const connectionString = resolveConnectionString();
  if (!connectionString) return null;

  const config: PoolConfig = {
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX || 4),
    idleTimeoutMillis: 30_000,
  };

  // Neon requires TLS; node-postgres needs `ssl: true` explicitly when
  // the URL doesn't carry `?sslmode=require`. Local dev (postgresql://
  // on localhost) doesn't, so we only flip it on for non-local hosts.
  const isLocal = /localhost|127\.0\.0\.1|host\.docker\.internal/.test(connectionString);
  const sslMode = /[?&]sslmode=/.exec(connectionString)?.[0];
  if (!isLocal && !sslMode) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}

export function getPool(): Pool {
  if (!globalThis.__prospect_pg_pool) {
    const pool = buildPool();
    if (!pool) {
      throw new Error(
        `No Postgres connection string found. Set DATABASE_URL (or any of: ${CONNECTION_STRING_ENV_VARS.join(', ')}) in the deployment environment.`
      );
    }
    globalThis.__prospect_pg_pool = pool;
  }
  return globalThis.__prospect_pg_pool;
}

export function isDatabaseConfigured(): boolean {
  return resolveConnectionString() !== null;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: ReadonlyArray<unknown>
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPool();
  const result = await pool.query<T>(text, params as unknown as unknown[]);
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

export async function withClient<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
