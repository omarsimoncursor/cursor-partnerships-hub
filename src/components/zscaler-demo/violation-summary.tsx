'use client';

import { ShieldAlert, ExternalLink, RotateCcw } from 'lucide-react';
import type { ZeroTrustViolationError } from './audit-card';

interface ViolationSummaryProps {
  error: Error;
  onReset: () => void;
  onViewZscaler?: () => void;
}

function asViolation(error: Error): ZeroTrustViolationError | null {
  if (error.name === 'ZeroTrustViolationError') {
    return error as ZeroTrustViolationError;
  }
  return null;
}

export function ViolationSummary({ error, onReset, onViewZscaler }: ViolationSummaryProps) {
  const v = asViolation(error);
  const inScope = v?.inScope ?? 4287;
  const intent = v?.intent ?? 18;
  const ratio = v?.scopeRatio ?? '238.2x';
  const endpoint = v?.endpoint ?? '/api/admin/audit-logs';

  return (
    <div className="w-full h-full rounded-xl border border-[#0079D5]/25 bg-dark-surface overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#0079D5]/25 bg-[#0079D5]/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#0079D5]/20 border border-[#0079D5]/35 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-[#65B5F2]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#65B5F2] leading-none mb-0.5">
              Zero Trust violation detected
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">
              zscaler · ZPA Policy Engine · risk evt-21794
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Endpoint */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Affected app segment
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-xs text-[#65B5F2] break-words">
            workforce-admin → GET {endpoint}
          </div>
        </div>

        {/* Posture donut */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Device posture across in-scope users
          </p>
          <div className="relative p-3 rounded-md bg-dark-bg overflow-hidden flex items-center gap-3">
            <PostureDonut />
            <div className="text-[11px] space-y-0.5">
              <Legend color="#FF4757" label="Unmanaged · 50%" />
              <Legend color="#F5A623" label="Mgd-noncompliant · 38%" />
              <Legend color="#4ADE80" label="Mgd-compliant · 12%" />
            </div>
          </div>
        </div>

        {/* Scope stats */}
        <div className="grid grid-cols-3 gap-2">
          <Stat label="In scope" value={inScope.toLocaleString()} color="text-accent-amber" />
          <Stat label="Intent" value={intent.toString()} color="text-accent-green" />
          <Stat label="Over" value={ratio} color="text-accent-amber" />
        </div>

        {/* Policy summary */}
        <div>
          <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
            Offending policy
          </p>
          <div className="p-2.5 rounded-md bg-dark-bg font-mono text-[11px] text-text-secondary space-y-0.5">
            <div className="text-[#65B5F2]">access-policy.ts :: ADMIN_AUDIT_LOG_POLICY</div>
            <div>└─ roles: <span className="text-accent-amber">[&apos;*&apos;]</span></div>
            <div>└─ postureRequired: <span className="text-accent-amber">false</span></div>
            <div>└─ allowedLocations: <span className="text-accent-amber">[&apos;*&apos;]</span></div>
            <div>└─ allowedIdps: <span className="text-accent-amber">[&apos;*&apos;]</span></div>
            <div className="text-text-tertiary">└─ regression commit b7c91d2</div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-dark-border bg-dark-bg p-3 shrink-0 space-y-2">
        <button
          onClick={onViewZscaler}
          className="w-full py-2 px-3 rounded-lg bg-[#0079D5] text-white font-medium text-sm
                     hover:bg-[#1A8FE8] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View in Zscaler
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-text-secondary">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="font-mono">{label}</span>
    </div>
  );
}

// Deterministic posture donut: 50/38/12 split (unmanaged / noncompliant / compliant)
function PostureDonut() {
  const size = 70;
  const cx = size / 2;
  const cy = size / 2;
  const r = 26;
  const stroke = 12;
  const c = 2 * Math.PI * r;

  const segments = [
    { color: '#FF4757', pct: 0.5 },
    { color: '#F5A623', pct: 0.38 },
    { color: '#4ADE80', pct: 0.12 },
  ];

  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1B1E2D" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const dash = c * s.pct;
        const offset = -c * acc;
        acc += s.pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        className="fill-text-primary"
        style={{ font: '10px ui-sans-serif, system-ui', fontWeight: 600 }}
      >
        92
      </text>
    </svg>
  );
}
