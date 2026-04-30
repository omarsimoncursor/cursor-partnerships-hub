'use client';

import type { StageProps } from './types';

const QUERIES = [
  { coll: 'orders',     filter: '{ status: "open", region: "EU" }', meanMs: 412, count: 18_421, indexed: false },
  { coll: 'orders',     filter: '{ customerId: ?, createdAt: { $gte: ? } }', meanMs: 268, count: 9_812, indexed: false },
  { coll: 'sessions',   filter: '{ userId: ?, expiresAt: { $gt: NOW } }', meanMs: 184, count: 7_442, indexed: false },
  { coll: 'cart_items', filter: '{ cartId: ? }', meanMs: 92, count: 22_117, indexed: true },
];

export function MongoDbStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const proposed = isComplete || activeStep >= 2;
  const validated = isComplete || activeStep >= 3;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg/70 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          cloud.mongodb.com / {account.toLowerCase()} / atlas-prod / profiler
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#bcf5d2' }}>
          MONGODB MCP
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-lg border border-dark-border overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_80px_80px] px-3 py-1.5 bg-dark-surface/50 border-b border-dark-border text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            <span>Collection</span>
            <span>Filter</span>
            <span className="text-right">Mean</span>
            <span className="text-right">Count</span>
          </div>
          {QUERIES.map((q, i) => {
            const slow = q.meanMs > 150;
            const indexed = q.indexed || (proposed && slow);
            return (
              <div
                key={i}
                className="grid grid-cols-[100px_1fr_80px_80px] px-3 py-1.5 border-b border-dark-border last:border-b-0 items-center text-[10.5px] font-mono"
                style={{ background: validated && slow ? '#4ade8010' : 'transparent' }}
              >
                <span className="truncate text-text-primary">{q.coll}</span>
                <span className="truncate text-text-secondary">{q.filter}</span>
                <span className="text-right" style={{ color: slow && !validated ? '#fbbf24' : validated ? '#4ade80' : '#a3a3a3' }}>
                  {validated && slow ? `${Math.round(q.meanMs * 0.18)}ms` : `${q.meanMs}ms`}
                </span>
                <span className="text-right text-text-tertiary">
                  {indexed ? <span style={{ color: '#4ade80' }}>idx</span> : q.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {proposed && (
          <div className="rounded-lg border border-dark-border bg-dark-bg/80 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-dark-border bg-dark-surface/60 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              proposed migration · 2025_04_index_orders_eu_open.js
            </div>
            <pre className="p-3 text-[10.5px] font-mono text-text-secondary overflow-x-auto whitespace-pre">
{`db.orders.createIndex(
  { status: 1, region: 1, createdAt: -1 },
  { name: 'orders_eu_open', background: true, partialFilterExpression: { status: 'open' } }
);
db.orders.createIndex(
  { customerId: 1, createdAt: -1 },
  { name: 'orders_by_customer', background: true }
);`}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-[10.5px] font-mono">
          <SmallStat label="p99 swing" value={validated ? '−72%' : '—'} good={validated} />
          <SmallStat label="Plan changed" value={validated ? `${proposed ? 2 : 0}/2` : '—'} good={validated} />
          <SmallStat label="Rollback ready" value={proposed ? 'yes' : '—'} good={proposed} />
        </div>
      </div>
    </div>
  );
}

function SmallStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded border border-dark-border p-2">
      <p className="text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className={good ? 'text-accent-green' : 'text-text-secondary'}>{value}</p>
    </div>
  );
}
