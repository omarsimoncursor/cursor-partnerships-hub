export type ActId =
  | 'cold-start'
  | 'architecture'
  | 'orient'
  | 'vault'
  | 'closeout'
  | 'endcard';

export interface ActMeta {
  id: ActId;
  number: number;
  title: string;
  subtitle: string;
  moodColor: string;
  duration: string;
}

export const ACTS: ActMeta[] = [
  {
    id: 'cold-start',
    number: 1,
    title: 'The Cold Start',
    subtitle: 'A naive Opus 4.7 burns 47% of context just orienting itself.',
    moodColor: '#F87171',
    duration: '~70s',
  },
  {
    id: 'architecture',
    number: 2,
    title: 'The Pattern',
    subtitle: 'Three skills, two subagents, one shared markdown vault.',
    moodColor: '#A78BFA',
    duration: '~90s',
  },
  {
    id: 'orient',
    number: 3,
    title: 'Boot With Skills',
    subtitle: 'Orient and recall in parallel. 1.4% of the context. $0.04 spent.',
    moodColor: '#60A5FA',
    duration: '~90s',
  },
  {
    id: 'vault',
    number: 4,
    title: 'The Vault',
    subtitle: 'Your team\'s collective brain, distilled into markdown.',
    moodColor: '#7E5BEF',
    duration: '~75s',
  },
  {
    id: 'closeout',
    number: 5,
    title: 'The Closeout',
    subtitle: '47K conversation tokens compressed into a 580-token note.',
    moodColor: '#4ADE80',
    duration: '~60s',
  },
  {
    id: 'endcard',
    number: 6,
    title: 'The Compounding Brain',
    subtitle: 'Every session writes back. Every agent inherits the team.',
    moodColor: '#FBBF24',
    duration: '~30s',
  },
];

export const PRINCIPAL_COLOR = '#F5A623';
export const SUBAGENT_COLOR = '#7DD3F5';
export const SKILL_COLOR = '#4ADE80';
export const VAULT_COLOR = '#A78BFA';

export interface ActComponentProps {
  onAdvance: () => void;
  isActive: boolean;
}

export interface VaultNote {
  filename: string;
  date: string;
  topic: string;
  agent: string;
  model: string;
  repo: string;
  summary: string;
  learned: string;
  doNotDoThis: string;
  filesTouched: string[];
  followUps: string[];
  tags: string[];
}

export const VAULT_NOTES: VaultNote[] = [
  {
    filename: '2026-04-12-stripe-webhook-retry-strategy.md',
    date: '2026-04-12',
    topic: 'Stripe webhook retry strategy',
    agent: 'priya.k',
    model: 'claude-opus-4-7',
    repo: 'payments-service',
    summary:
      'Adopted exponential backoff with jitter for Stripe webhook handler, fronted by an idempotency key in `webhook_events`.',
    learned:
      'Stripe re-sends every webhook for up to 72h. Without an idempotency table, retries double-charge. The pattern is: insert event_id with `ON CONFLICT DO NOTHING`, then process. If the insert returned 0 rows, return 200 and skip.',
    doNotDoThis:
      'Do not key idempotency on `payment_intent.id` alone. Use `event.id` from Stripe. Several events can share a payment_intent.',
    filesTouched: [
      'src/api/stripe-webhook/route.ts',
      'src/db/migrations/0042_webhook_events.sql',
      'src/lib/stripe/idempotency.ts',
    ],
    followUps: [
      'Backfill `webhook_events` for the 14-day gap between deploy and migration.',
      'Add Datadog monitor for retries > 5.',
    ],
    tags: ['payments', 'stripe', 'webhooks', 'idempotency'],
  },
  {
    filename: '2026-04-19-database-migration-rollback-failure.md',
    date: '2026-04-19',
    topic: 'Database migration rollback failure',
    agent: 'andre.t',
    model: 'cursor-composer-2',
    repo: 'platform-core',
    summary:
      'Forward migration `0048_split_orders` succeeded in staging, failed in prod due to a row count mismatch on `orders_archive`.',
    learned:
      'Long migrations on prod hit our 30s lock timeout. The fix is to chunk in 50k batches and run during the maintenance window. Always use `pg_advisory_lock` to prevent two migrators from racing.',
    doNotDoThis:
      'Do not run `ALTER TABLE orders DROP COLUMN` in a single transaction on tables > 5M rows. Use the expand/contract pattern: add new column, dual write, backfill, swap reads, drop old column over 4 deploys.',
    filesTouched: [
      'db/migrations/0048_split_orders.sql',
      'scripts/run-migration.ts',
    ],
    followUps: ['Add a runbook entry for ALTER TABLE on prod.'],
    tags: ['database', 'migrations', 'postgres', 'production'],
  },
  {
    filename: '2026-04-25-react-19-suspense-bug.md',
    date: '2026-04-25',
    topic: 'React 19 Suspense double-fetch',
    agent: 'maya.a',
    model: 'claude-opus-4-7',
    repo: 'web-shell',
    summary:
      'Server components were double-fetching `/api/products` due to a stale Suspense boundary in `app/products/layout.tsx`.',
    learned:
      'In React 19 + Next 16, a `<Suspense>` boundary above a `cache()` call resets the cache key on every render. Move `cache()` to a module-level constant.',
    doNotDoThis:
      'Do not wrap `cache()`-decorated functions inside a component body. The reference identity changes per render and the cache misses every time.',
    filesTouched: [
      'src/app/products/layout.tsx',
      'src/lib/api/products.ts',
    ],
    followUps: ['Add an ESLint rule for `cache()` outside component bodies.'],
    tags: ['react', 'next-16', 'caching', 'performance'],
  },
  {
    filename: '2026-05-02-feature-flag-cleanup-pattern.md',
    date: '2026-05-02',
    topic: 'Feature flag cleanup pattern',
    agent: 'jordan.p',
    model: 'cursor-composer-2',
    repo: 'platform-core',
    summary:
      'Retired 14 stale LaunchDarkly flags. Codified a sweep skill for the team.',
    learned:
      'Stale flags accumulate at ~3 per sprint. The sweep pattern is: query LD for flags untouched > 90d, run codemod to inline the on-branch, delete the LD definition, ship as a single PR per service.',
    doNotDoThis:
      'Do not delete flags from LD before the codemod ships. Production reads the flag before the deploy completes and falls back to default-off.',
    filesTouched: [
      'codemods/inline-flag.ts',
      '.cursor/skills/flag-sweep/SKILL.md',
    ],
    followUps: ['Schedule monthly sweep as a Cloud Agent cron.'],
    tags: ['feature-flags', 'launchdarkly', 'codemod', 'platform'],
  },
  {
    filename: '2026-05-04-rate-limiter-token-bucket.md',
    date: '2026-05-04',
    topic: 'Rate limiter token bucket',
    agent: 'samira.l',
    model: 'claude-opus-4-7',
    repo: 'gateway',
    summary:
      'Replaced the leaky-bucket rate limiter with a token bucket backed by Redis EVAL.',
    learned:
      'Token bucket gives us burst capacity that the marketing team needs for newsletter sends. Use a single Lua script for atomic check-and-deduct. Lua is 1.6x faster than the round-trip MULTI we had before.',
    doNotDoThis:
      'Do not approximate the bucket with `INCR + EXPIRE`. The window slides per request and the rates drift.',
    filesTouched: [
      'src/middleware/rate-limit.ts',
      'redis/lua/token-bucket.lua',
    ],
    followUps: ['Document burst sizes per route in AGENTS.md.'],
    tags: ['rate-limiting', 'redis', 'lua', 'performance'],
  },
  {
    filename: '2026-05-06-jwt-clock-skew-incident.md',
    date: '2026-05-06',
    topic: 'JWT clock skew incident',
    agent: 'andre.t',
    model: 'cursor-composer-2',
    repo: 'auth-service',
    summary:
      'Auth service rejected ~3% of valid JWTs after a node-clock drift on us-east-1c. Added a 30s leeway and a Datadog monitor on `jwt.iat - now()` distribution.',
    learned:
      'JWT verifiers default to 0s leeway. Even NTP-disciplined nodes drift up to 25s under load. Always set `clockTolerance: 30` in the verifier.',
    doNotDoThis:
      'Do not raise the leeway above 60s without a security review. It widens the replay window.',
    filesTouched: [
      'src/auth/verify-jwt.ts',
      'observability/dashboards/auth-clock-skew.tf',
    ],
    followUps: ['Roll the leeway out to all 7 services that decode JWTs.'],
    tags: ['auth', 'jwt', 'incident', 'observability'],
  },
  {
    filename: '2026-05-08-gql-n-plus-1-dataloader.md',
    date: '2026-05-08',
    topic: 'GraphQL N+1 with DataLoader',
    agent: 'priya.k',
    model: 'claude-opus-4-7',
    repo: 'storefront',
    summary:
      'Resolver `Order.lineItems` was running 1+N queries. Wrapped in DataLoader scoped to the request.',
    learned:
      'Per-request DataLoader instances are mandatory. A module-level loader leaks data across users. Construct the loader in `createContext` and pass through.',
    doNotDoThis:
      'Do not memoize a DataLoader at the module level. Cross-request cache hits will return another user\'s order data.',
    filesTouched: [
      'src/graphql/loaders/orders.ts',
      'src/graphql/context.ts',
    ],
    followUps: ['Audit the other 19 resolvers for N+1.'],
    tags: ['graphql', 'dataloader', 'performance', 'security'],
  },
];
