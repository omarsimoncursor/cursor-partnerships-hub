'use client';

import type { StageProps } from './types';
import type { Vendor } from '@/lib/prospect/vendors';
import { applyAccountName } from '@/lib/prospect/vendors';

// Polished generic stage for vendors without a bespoke visual. Renders
// a vendor "console" mock with a status feed that ticks through the
// agent steps, plus a final outcome panel. Far more visually distinct
// than the original step list, and uses the vendor's brand throughout.
export function DefaultStage({
  activeStep,
  status,
  account,
  brand,
  vendor,
}: StageProps & { vendor: Vendor }) {
  const isComplete = status === 'complete';

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          {vendorHostname(vendor)} / {account.toLowerCase()} / cursor-agent
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: `${brand}33`, color: brand }}>
          {vendor.name}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {vendor.scenario.steps.slice(0, 3).map((s, i) => {
            const visible = i <= activeStep || isComplete;
            const active = i === activeStep && !isComplete;
            return (
              <div
                key={i}
                className="rounded-lg border p-2.5 transition-all"
                style={{
                  borderColor: active ? `${brand}66` : visible ? `${brand}33` : 'rgba(237,236,236,0.06)',
                  background: visible ? `${brand}10` : 'rgba(237,236,236,0.02)',
                  opacity: visible ? 1 : 0.45,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-mono"
                    style={{
                      background: visible ? brand : 'transparent',
                      color: visible ? '#0a0a0a' : brand,
                      border: !visible ? `1px solid ${brand}55` : 'none',
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: brand }}>
                    {active ? 'running' : visible ? 'done' : 'queued'}
                  </p>
                </div>
                <p className="text-[11px] font-medium text-text-primary leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Live event feed */}
        <div className="rounded-lg border border-dark-border bg-dark-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-border">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">cursor agent · {vendor.modeNote.toLowerCase()}</p>
            <span className="text-[10px] font-mono text-text-tertiary">live</span>
          </div>
          <ol className="divide-y divide-dark-border">
            {vendor.scenario.steps.map((s, i) => {
              const visible = i <= activeStep || isComplete;
              if (!visible) return null;
              return (
                <li key={i} className="px-3 py-1.5 text-[11px] font-mono text-text-secondary">
                  <span className="text-text-tertiary tabular-nums mr-2">[{String(i + 1).padStart(2, '0')}]</span>
                  <span style={{ color: brand }}>{s.label.toLowerCase().replace(/\s+/g, '_')}()</span>
                  <span className="text-text-tertiary"> · </span>
                  <span>{applyAccountName(s.detail, account)}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {isComplete && (
          <div className="rounded-lg border border-accent-green/30 bg-accent-green/5 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-accent-green mb-1.5">
              Outcome for {account}
            </p>
            <ul className="space-y-1">
              {vendor.scenario.outcomes.map((o, i) => (
                <li key={i} className="text-[11px] text-text-secondary flex gap-1.5">
                  <span className="text-accent-green">{'\u2713'}</span>
                  <span>{applyAccountName(o, account)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const HOSTS: Record<string, string> = {
  databricks: 'cursor-account.cloud.databricks.com',
  gitlab: 'gitlab.com',
  zscaler: 'admin.zscaler.com',
  jira: 'cursor-account.atlassian.net',
  slack: 'app.slack.com',
  okta: 'cursor-account.okta.com',
  mongodb: 'cloud.mongodb.com',
};
function vendorHostname(v: Vendor): string {
  return HOSTS[v.id] || `${v.id}.com`;
}
