'use client';

import { Cloud, ExternalLink, RotateCcw } from 'lucide-react';
import type { ModernizationScopeError, ModernizationScopePayload } from './assess-card';

interface ModernizationSummaryProps {
  error: Error;
  onReset: () => void;
  onViewAwsConsole?: () => void;
}

function asScopeError(error: Error): ModernizationScopeError | null {
  if (error.name === 'ModernizationScopeError') {
    return error as ModernizationScopeError;
  }
  return null;
}

export function ModernizationSummary({ error, onReset, onViewAwsConsole }: ModernizationSummaryProps) {
  const scope = asScopeError(error);
  const payload: ModernizationScopePayload | null = scope?.payload ?? null;

  const gsiYears = payload?.gsiBaseline.years ?? 5;
  const gsiUsd = payload?.gsiBaseline.usd ?? 14_000_000;
  const cursorMonths = payload?.cursorBaseline.months ?? 18;
  const onPremCost = payload?.annualOnPremCost ?? 8_400_000;
  const awsCost = payload?.proposedAnnualAwsCost ?? 2_100_000;
  const totalContexts = payload?.totalBoundedContexts ?? 38;
  const contexts =
    payload?.boundedContexts?.slice(0, 5) ??
    [
      { name: 'OrdersService', loc: 14_200, target: 'Lambda + Aurora Serverless v2' },
      { name: 'InventoryService', loc: 9_800, target: 'Lambda + DynamoDB' },
      { name: 'BillingService', loc: 22_100, target: 'ECS Fargate + Aurora PG' },
      { name: 'ShippingService', loc: 8_400, target: 'Lambda + Step Functions' },
      { name: 'CatalogService', loc: 18_600, target: 'Lambda + OpenSearch Serverless' },
    ];

  return (
    <div className="w-full h-full rounded-xl border border-[#FF9900]/25 bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#FF9900]/25 bg-[#FF9900]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#FF9900]/20 border border-[#FF9900]/30 flex items-center justify-center">
            <Cloud className="w-3.5 h-3.5 text-[#FF9900]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#FF9900] leading-none mb-0.5">
              Modernization scope
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              aws-knowledge-mcp · MAP-eligible · us-east-1
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Target */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Extracting now
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-[#FF9900]">
            OrdersService
            <span className="text-text-tertiary"> · @Stateless EJB · 14.2K LOC</span>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            → Lambda (Node.js 20, TS) + Aurora Serverless v2 + CDK
          </p>
        </div>

        {/* Portfolio progress bar */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Portfolio progress · {totalContexts} bounded contexts
          </p>
          <div className="rounded-md bg-dark-bg p-2.5">
            <div className="h-1.5 w-full rounded-full bg-[#232F3E] overflow-hidden mb-2">
              <div
                className="h-full bg-[#FF9900]"
                style={{ width: `${(1 / totalContexts) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10.5px] font-mono text-text-tertiary">
              <span>1 shipped to prod</span>
              <span>
                GSI baseline {gsiYears}y · Cursor est. {cursorMonths}mo
              </span>
            </div>
          </div>
        </div>

        {/* Per-context cadence */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Per bounded context
          </p>
          <div className="rounded-md bg-dark-bg p-2.5 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Cadence</span>
              <span className="font-mono text-[#FF9900]">~22 calendar days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Human review gates</span>
              <span className="font-mono text-[#0972D3]">4 (Arch · Sec · FinOps · Cutover)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Traditional baseline</span>
              <span className="font-mono text-text-tertiary line-through">~16 weeks</span>
            </div>
          </div>
        </div>

        {/* Candidate backlog */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Next up (top 5)
          </p>
          <div className="rounded-md bg-dark-bg divide-y divide-dark-border">
            {contexts.map(ctx => (
              <div key={ctx.name} className="flex items-center justify-between px-2.5 py-1.5 text-[11.5px]">
                <div className="min-w-0">
                  <p className="font-mono text-[#E7ECEE] truncate">{ctx.name}</p>
                  <p className="text-[10px] text-text-tertiary truncate">{ctx.target}</p>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary shrink-0 ml-2">
                  {(ctx.loc / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="GSI $" value={`$${(gsiUsd / 1_000_000).toFixed(0)}M`} color="text-[#F5A623]" />
          <Stat
            label="AWS run"
            value={`$${(awsCost / 1_000_000).toFixed(1)}M/y`}
            color="text-[#4C9AFF]"
          />
          <Stat
            label="Savings"
            value={`$${((onPremCost - awsCost) / 1_000_000).toFixed(1)}M/y`}
            color="text-[#00A86B]"
          />
        </div>

        {/* Source summary */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Legacy source
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="text-[#FF9900]">OrdersService.java :: reserveInventory()</div>
            <div>├─ @Stateless · @PersistenceContext</div>
            <div>├─ JNDI lookup jdbc/OracleDS</div>
            <div>├─ CallableStatement → SP_RESERVE_INVENTORY</div>
            <div className="text-text-tertiary">└─ REF_CURSOR out-param (Oracle-only)</div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewAwsConsole}
          className="w-full py-2 px-3 rounded-lg bg-[#FF9900] text-[#0B0F14] font-medium text-sm
                     hover:bg-[#FFAC33] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in AWS Console
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 px-3 rounded-lg border border-dark-border text-text-secondary
                     font-medium text-sm hover:bg-dark-surface-hover hover:text-text-primary
                     transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset demo
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2.5 rounded-md bg-dark-bg">
      <p className="text-[10px] text-text-tertiary uppercase mb-0.5">{label}</p>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
