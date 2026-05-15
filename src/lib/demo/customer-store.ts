export interface CustomerRecord {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  internalRole: 'customer' | 'admin' | 'support';
  mfaEnabled: boolean;
  createdAt: string;
}

export interface SelectorClause {
  field: string;
  value: string;
}

export type Selector =
  | { kind: 'eq'; clause: SelectorClause }
  | { kind: 'always-true' };

export const CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust_01HZX8N4KQ2',
    username: 'mark.zuck',
    email: 'mark.zuck@meta-demo.test',
    hashedPassword: '$2b$12$Iqg9XnT8r0V7xF1Cm9S/cefakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'customer',
    mfaEnabled: true,
    createdAt: '2024-08-12T14:02:18Z',
  },
  {
    id: 'cust_01HZX8N4KQ3',
    username: 'sundar.p',
    email: 'sundar.p@alphabet-demo.test',
    hashedPassword: '$2b$12$AaBb1122ccdd3344eefakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'customer',
    mfaEnabled: true,
    createdAt: '2024-09-01T09:45:11Z',
  },
  {
    id: 'cust_01HZX8N4KQ4',
    username: 'satya.n',
    email: 'satya.n@msft-demo.test',
    hashedPassword: '$2b$12$ZzYy9988xxww7766vvfakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'admin',
    mfaEnabled: true,
    createdAt: '2024-06-22T18:31:02Z',
  },
  {
    id: 'cust_01HZX8N4KQ5',
    username: 'jensen.h',
    email: 'jensen.h@nvidia-demo.test',
    hashedPassword: '$2b$12$LlMmNn1122oopp3344qqfakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'customer',
    mfaEnabled: false,
    createdAt: '2024-10-04T22:11:55Z',
  },
  {
    id: 'cust_01HZX8N4KQ6',
    username: 'support.bot',
    email: 'support@cursor-demo.test',
    hashedPassword: '$2b$12$RrSs5566ttuu7788vvwwfakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'support',
    mfaEnabled: true,
    createdAt: '2024-03-18T07:08:42Z',
  },
  {
    id: 'cust_01HZX8N4KQ7',
    username: 'julia.l',
    email: 'julia.l@stripe-demo.test',
    hashedPassword: '$2b$12$Mm99NnOoPpQqRrSs00Tt11fakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'customer',
    mfaEnabled: true,
    createdAt: '2025-01-14T11:22:09Z',
  },
  {
    id: 'cust_01HZX8N4KQ8',
    username: 'priya.s',
    email: 'priya.s@airbnb-demo.test',
    hashedPassword: '$2b$12$BbCcDdEeFfGgHhIiJjKkLlfakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'customer',
    mfaEnabled: true,
    createdAt: '2025-02-02T15:48:31Z',
  },
  {
    id: 'cust_01HZX8N4KQ9',
    username: 'devops.svc',
    email: 'devops@internal-demo.test',
    hashedPassword: '$2b$12$XxYyZz0011223344556677fakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'admin',
    mfaEnabled: false,
    createdAt: '2023-11-29T13:14:00Z',
  },
  {
    id: 'cust_01HZX8N4KR0',
    username: 'omar.s',
    email: 'omar.s@cursor-demo.test',
    hashedPassword: '$2b$12$Aa11Bb22Cc33Dd44Ee55Ff66fakeHashFakeHashFakeHashFakeHashFak',
    internalRole: 'admin',
    mfaEnabled: true,
    createdAt: '2025-03-10T10:00:00Z',
  },
  {
    id: 'cust_01HZX8N4KR1',
    username: 'marcus.a',
    email: 'marcus.a@vercel-demo.test',
    hashedPassword: '$2b$12$Gg77Hh88Ii99Jj00Kk11Llfakefakefakefakefakefakefakefakefak',
    internalRole: 'customer',
    mfaEnabled: true,
    createdAt: '2024-12-19T16:25:44Z',
  },
  {
    id: 'cust_01HZX8N4KR2',
    username: 'ada.l',
    email: 'ada.l@hashicorp-demo.test',
    hashedPassword: '$2b$12$Mm22Nn33Oo44Pp55Qq66Rrfakefakefakefakefakefakefakefakefak',
    internalRole: 'customer',
    mfaEnabled: true,
    createdAt: '2024-07-08T20:55:13Z',
  },
  {
    id: 'cust_01HZX8N4KR3',
    username: 'finbar.q',
    email: 'finbar.q@databricks-demo.test',
    hashedPassword: '$2b$12$Ss77Tt88Uu99Vv00Ww11Xxfakefakefakefakefakefakefakefakefak',
    internalRole: 'customer',
    mfaEnabled: false,
    createdAt: '2025-01-30T05:18:27Z',
  },
];

/**
 * Demo-only mini parser that mimics the bug class. Real-world Mongo selectors
 * accept JSON with operators like `$eq`, `$or`, `$where` — when a developer
 * string-interpolates user input into the JSON, an attacker can collapse the
 * predicate into "always true". We model that here without pulling in a real
 * Mongo driver.
 *
 * Supported tokens (intentionally tiny):
 *   - `{ "username": "<value>" }` — exact match.
 *   - any string containing the literal `' || '1'=='1` collapses to always-true,
 *     matching the canonical NoSQL-injection payload.
 */
export function parseSelector(raw: string): Selector {
  if (raw.includes("' || '1'=='1") || raw.includes('" || "1"=="1')) {
    return { kind: 'always-true' };
  }
  const match = raw.match(/^\{\s*"([a-zA-Z_]+)"\s*:\s*"(.*)"\s*\}\s*$/);
  if (!match) {
    return { kind: 'always-true' };
  }
  const [, field, value] = match;
  if (value.includes('||') || value.includes('==')) {
    return { kind: 'always-true' };
  }
  return { kind: 'eq', clause: { field, value } };
}

export function matchesSelector(record: CustomerRecord, selector: Selector): boolean {
  if (selector.kind === 'always-true') return true;
  const { field, value } = selector.clause;
  const recordValue = (record as unknown as Record<string, unknown>)[field];
  return recordValue === value;
}
