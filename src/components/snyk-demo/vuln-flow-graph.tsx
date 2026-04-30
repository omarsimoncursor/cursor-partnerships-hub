'use client';

import { AlertTriangle, Flame } from 'lucide-react';

/**
 * Vulnerability data-flow flame graph. Visual heritage from
 * `src/components/datadog-demo/artifacts/datadog-trace.tsx::FlameGraph`,
 * but each row is a hop in the taint flow instead of a span. The sink row
 * is annotated with a "sink" tag and a red border.
 *
 * Designed to slot into either:
 *   - the split-screen left panel (small width, 5 hops stacked), or
 *   - inside the SnykIssue artifact (full bleed inside the Code Path tab).
 */

interface Hop {
  /** Indent depth (0 = parent / source, 1+ = downstream calls). */
  indent: number;
  /** Cumulative offset in synthetic ms from the start of the flow. */
  startMs: number;
  /** Synthetic duration in ms. */
  durationMs: number;
  /** Function or expression. */
  label: string;
  /** file:line citation. */
  location: string;
  kind: 'source' | 'flow' | 'sink';
}

const TOTAL_MS = 1200; // synthetic — pure visualization timing

const HOPS: Hop[] = [
  {
    indent: 0,
    startMs: 0,
    durationMs: TOTAL_MS,
    label: 'request.query.username',
    location: 'app/api/customer-profile/lookup/route.ts:14',
    kind: 'source',
  },
  {
    indent: 1,
    startMs: 80,
    durationMs: TOTAL_MS - 160,
    label: 'lookupCustomerProfile({ username })',
    location: 'src/lib/demo/customer-profile.ts:24',
    kind: 'flow',
  },
  {
    indent: 2,
    startMs: 200,
    durationMs: TOTAL_MS - 360,
    label: '`{ "username": "${query.username}" }`',
    location: 'src/lib/demo/customer-profile.ts:25',
    kind: 'flow',
  },
  {
    indent: 3,
    startMs: 360,
    durationMs: TOTAL_MS - 540,
    label: 'parseSelector(tainted)',
    location: 'src/lib/demo/customer-profile.ts:26',
    kind: 'flow',
  },
  {
    indent: 4,
    startMs: 520,
    durationMs: TOTAL_MS - 720,
    label: 'CUSTOMERS.filter(matchesSelector(selector))',
    location: 'src/lib/demo/customer-profile.ts:27',
    kind: 'sink',
  },
];

const KIND_COLOR: Record<Hop['kind'], string> = {
  source: '#E11D48',
  flow: '#7C3AED',
  sink: '#FBBF24',
};

interface VulnFlowGraphProps {
  /** Compact variant for the split-screen left panel. */
  compact?: boolean;
}

export function VulnFlowGraph({ compact = false }: VulnFlowGraphProps) {
  return (
    <div
      className="w-full rounded-md border overflow-hidden"
      style={{ background: '#0E0F2C', borderColor: '#23264F' }}
    >
      <Header compact={compact} />
      <Ruler />
      <div>
        {HOPS.map((hop, i) => (
          <FlowRow key={i} hop={hop} compact={compact} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

function Header({ compact }: { compact: boolean }) {
  return (
    <div
      className="px-3 py-2 border-b flex items-center justify-between"
      style={{ background: '#13142F', borderColor: '#23264F' }}
    >
      <div className="flex items-center gap-2">
        <Flame className="w-3.5 h-3.5" style={{ color: '#9F98FF' }} />
        <span className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: '#C9C9E5' }}>
          Vulnerability data flow
        </span>
        {!compact && (
          <span className="text-[10.5px] font-mono" style={{ color: '#7C7CA0' }}>
            · 5 hops · 1 sink
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Pill label="CWE-943" tone="indigo" />
        <Pill label="CVSS 9.8" tone="red" />
      </div>
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone: 'indigo' | 'red' }) {
  const styles =
    tone === 'red'
      ? { color: '#FB7185', background: 'rgba(225,29,72,0.10)', borderColor: 'rgba(225,29,72,0.30)' }
      : { color: '#9F98FF', background: 'rgba(76,68,203,0.10)', borderColor: 'rgba(76,68,203,0.30)' };
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap"
      style={styles}
    >
      {label}
    </span>
  );
}

function Ruler() {
  const ticks = 4;
  return (
    <div
      className="relative h-6 border-b text-[9.5px] font-mono select-none"
      style={{ background: '#0A0B23', borderColor: '#23264F', color: '#7C7CA0' }}
    >
      <div className="absolute inset-y-0" style={{ left: 220, right: 0 }}>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const pct = (i / ticks) * 100;
          return (
            <div key={i} className="absolute top-0 bottom-0" style={{ left: `${pct}%` }}>
              <div className="w-px h-full" style={{ background: '#23264F' }} />
              <span className="absolute top-1 -translate-x-1/2 px-1" style={{ left: 0 }}>
                {i === 0 ? 'source' : i === ticks ? 'sink' : `hop ${i}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowRow({ hop, compact }: { hop: Hop; compact: boolean }) {
  const rowH = compact ? 26 : 30;
  const labelColW = 220;
  const leftPct = (hop.startMs / TOTAL_MS) * 100;
  const widthPct = (hop.durationMs / TOTAL_MS) * 100;
  const color = KIND_COLOR[hop.kind];
  const isSink = hop.kind === 'sink';
  const isSource = hop.kind === 'source';

  return (
    <div
      className="relative flex items-stretch border-b"
      style={{ height: rowH, borderColor: '#1A1C40' }}
    >
      <div
        className="shrink-0 flex items-center gap-1.5 pr-2 border-r overflow-hidden"
        style={{
          width: labelColW,
          paddingLeft: 8 + hop.indent * 10,
          background: '#0A0B23',
          borderColor: '#23264F',
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span
          className={`truncate text-[11px] ${isSource || isSink ? 'font-semibold text-white' : 'text-[#C9C9E5]'}`}
        >
          {hop.label}
        </span>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0" style={{ background: hop.indent % 2 === 0 ? '#0A0B23' : '#0E0F2C' }} />
        <div
          className="absolute top-1.5 bottom-1.5 rounded-[2px] flex items-center px-1.5 text-[10px] font-mono whitespace-nowrap overflow-hidden"
          style={{
            left: `${leftPct}%`,
            width: `calc(${widthPct}% - 0px)`,
            background: isSink ? `${color}26` : `${color}33`,
            border: isSink ? `1px solid ${color}` : `1px solid ${color}77`,
            color: '#FFFFFF',
          }}
          title={`${hop.label} · ${hop.location}`}
        >
          <span className="truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            {hop.location}
          </span>
          <span className="ml-auto opacity-90 pl-2 flex items-center gap-1 shrink-0">
            {isSource && <span className="text-[9px] uppercase tracking-wider" style={{ color: '#FB7185' }}>source</span>}
            {isSink && (
              <>
                <AlertTriangle className="w-2.5 h-2.5" style={{ color: '#FBBF24' }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: '#FBBF24' }}>sink</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div
      className="px-3 py-1.5 text-[10.5px] font-mono flex items-center gap-3 border-t"
      style={{ background: '#0A0B23', borderColor: '#23264F', color: '#7C7CA0' }}
    >
      <span>
        Critical path:{' '}
        <span style={{ color: '#9F98FF' }}>request.query.username → lookupCustomerProfile → parseSelector → matchesSelector</span>
      </span>
    </div>
  );
}
