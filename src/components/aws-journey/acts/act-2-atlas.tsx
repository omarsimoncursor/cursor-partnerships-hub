'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, GitBranch, GitPullRequest, Layers, Play } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { CursorLogo } from '../cursor-logo';
import { StoryBeat } from '../story-beat';
import {
  BOUNDARY_VIOLATIONS,
  BOUNDED_CONTEXTS,
  DOMAIN_COLORS,
  type BoundedContext,
} from '../data/bounded-contexts';

type LaidOutNode = BoundedContext & { x: number; y: number };

interface Act2Props {
  onAdvance: () => void;
}

/**
 * Compute deterministic radial positions for the 38 contexts + 2 infra clusters.
 * Places OrdersService at the center. Other nodes are distributed across concentric rings
 * sorted by wave number. Within a ring, nodes are spread evenly with a stable angle per id.
 */
function useGraphLayout() {
  return useMemo(() => {
    const CENTER = { x: 500, y: 340 };
    const RING_RADII: Record<number, number> = {
      0: 0,      // orders at center
      1: 120,
      2: 200,
      3: 275,
      4: 345,
    };

    const nodes = BOUNDED_CONTEXTS.map((ctx, i) => {
      if (ctx.wave === 0) {
        return { ...ctx, x: CENTER.x, y: CENTER.y };
      }
      // Collect siblings in the same wave for even distribution
      const siblings = BOUNDED_CONTEXTS.filter((c) => c.wave === ctx.wave);
      const idxInRing = siblings.findIndex((c) => c.id === ctx.id);
      const count = siblings.length;
      // Spread across 360deg starting from top with a small per-wave rotation offset
      const offset = (ctx.wave * 17) * (Math.PI / 180);
      const angle = offset + (idxInRing / count) * Math.PI * 2 - Math.PI / 2;
      const radius = RING_RADII[ctx.wave] + (i % 3) * 6; // slight jitter
      return {
        ...ctx,
        x: CENTER.x + Math.cos(angle) * radius,
        y: CENTER.y + Math.sin(angle) * radius * 0.72, // flatten vertically
      };
    });

    const byId = new Map(nodes.map((n) => [n.id, n] as const));

    // Build domain-adjacency edges (same domain → connect)
    const domainEdges: Array<{ a: string; b: string }> = [];
    const byDomain = new Map<string, string[]>();
    for (const n of nodes) {
      if (!byDomain.has(n.domain)) byDomain.set(n.domain, []);
      byDomain.get(n.domain)!.push(n.id);
    }
    for (const list of byDomain.values()) {
      for (let i = 0; i < list.length - 1; i++) {
        domainEdges.push({ a: list[i], b: list[i + 1] });
      }
    }
    // A few cross-domain spokes from orders
    for (const target of ['inventory', 'billing', 'catalog', 'customer']) {
      domainEdges.push({ a: 'orders', b: target });
    }

    return { nodes, byId, domainEdges, center: CENTER };
  }, []);
}

export function Act2Atlas({ onAdvance }: Act2Props) {
  const { nodes, byId, domainEdges } = useGraphLayout();
  const [hovered, setHovered] = useState<LaidOutNode | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  const violationIds = useMemo(() => new Set(BOUNDARY_VIOLATIONS.flat()), []);

  useEffect(() => {
    if (scanState !== 'scanning') return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 2200;
      if (t >= 1) {
        setScanProgress(1);
        setScanState('done');
        return;
      }
      setScanProgress(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scanState]);

  const revealed = scanState === 'done';

  return (
    <ActShell act={2}>
      <ActHeader act={2} eyebrow="Step 1: ask the Cursor Cloud Agent to read the entire monolith. Click scan and watch it map 4.2 million lines of code." />

      <StoryBeat
        tone="dark"
        agent="cloud"
        title="A GSI sends three consultants for a month. Cursor does it overnight."
        body={
          <>The agent reads every file, maps service boundaries, flags dead code, and ranks each piece by risk and revenue — so the team walks in with one clear answer.</>
        }
        oldWay="4 weeks of interviews"
        newWay="5 hours, $0 in fees"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_280px]">
        {/* Left rail: findings */}
        <aside
          className="flex flex-col gap-3 rounded-xl border p-3.5"
          style={{ background: 'rgba(77, 212, 255, 0.04)', borderColor: 'rgba(77,212,255,0.15)' }}
        >
          <div className="flex items-center gap-2">
            <CursorLogo size={14} tone="dark" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#4DD4FF' }}>
              Findings
            </span>
          </div>
          <ul className="space-y-2.5" style={{ opacity: revealed ? 1 : 0.35, transition: 'opacity 350ms' }}>
            <Finding n={revealed ? '38' : '—'} label="bounded contexts mapped" icon={<Layers className="h-4 w-4" />} />
            <Finding n={revealed ? '8' : '—'} label="boundary violations" icon={<GitBranch className="h-4 w-4" />} accent="#EF4444" />
            <Finding n={revealed ? '17' : '—'} label="orphaned cron jobs" icon={<Clock className="h-4 w-4" />} />
            <Finding n={revealed ? '4' : '—'} label="dead-code subsystems" icon={<AlertTriangle className="h-4 w-4" />} />
          </ul>
        </aside>

        {/* Center: SVG graph */}
        <div
          className="relative overflow-hidden rounded-xl border"
          style={{
            minHeight: 440,
            background: 'radial-gradient(ellipse at center, rgba(77,212,255,0.06) 0%, transparent 60%)',
            borderColor: 'rgba(77,212,255,0.15)',
          }}
        >
          {scanState !== 'done' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 text-center">
              {scanState === 'idle' ? (
                <>
                  <div className="max-w-xs text-[12.5px]" style={{ color: 'rgba(229,231,235,0.7)' }}>
                    Ready to scan <strong className="text-white">4,200,000 lines</strong> of Java.
                    Click below to let Cursor Cloud Agent read the monolith.
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanState('scanning')}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
                    style={{ background: '#4DD4FF', color: '#0B1220' }}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Run Cursor scan
                  </button>
                </>
              ) : (
                <>
                  <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#4DD4FF' }}>
                    Scanning · {Math.round(scanProgress * 4.2 * 1_000_000).toLocaleString()} LOC
                  </div>
                  <div
                    className="h-1.5 w-64 overflow-hidden rounded-full"
                    style={{ background: 'rgba(77,212,255,0.15)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${scanProgress * 100}%`,
                        background: 'linear-gradient(90deg, #4DD4FF 0%, #7EE787 100%)',
                        transition: 'width 120ms linear',
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <svg
            viewBox="0 0 1000 680"
            className="h-full w-full transition-opacity duration-500"
            style={{ minHeight: 440, opacity: revealed ? 1 : 0.15 }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="atlas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(77,212,255,0.05)" strokeWidth="1" />
              </pattern>
              <radialGradient id="orders-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9900" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FF9900" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="1000" height="680" fill="url(#atlas-grid)" />

            {/* Edges - domain */}
            {domainEdges.map(({ a, b }, i) => {
              const na = byId.get(a);
              const nb = byId.get(b);
              if (!na || !nb) return null;
              return (
                <line
                  key={`e-${i}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="rgba(229,231,235,0.08)"
                  strokeWidth={1}
                />
              );
            })}

            {/* Edges - boundary violations (red) */}
            {BOUNDARY_VIOLATIONS.map(([a, b], i) => {
              const na = byId.get(a);
              const nb = byId.get(b);
              if (!na || !nb) return null;
              return (
                <line
                  key={`bv-${i}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="#EF4444"
                  strokeWidth={1.8}
                  strokeDasharray="6 4"
                  opacity={0.75}
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1.6s" repeatCount="indefinite" />
                </line>
              );
            })}

            {/* Halo on Orders */}
            <circle cx={500} cy={340} r="60" fill="url(#orders-halo)" />
            <circle cx={500} cy={340} r="24" fill="none" stroke="#FF9900" strokeWidth={2} opacity={0.85}>
              <animate attributeName="r" values="20;34;20" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* Nodes */}
            {nodes.map((node) => {
              const r = Math.max(5, Math.min(18, Math.sqrt(node.loc) / 32));
              const color = node.id === 'orders' ? '#FF9900' : DOMAIN_COLORS[node.domain];
              const isViolation = violationIds.has(node.id) && node.id !== 'orders';
              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHovered(node)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 1}
                    fill={color}
                    opacity={node.id === 'orders' ? 1 : 0.18}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={node.id === 'orders' ? '#FF9900' : '#0B1220'}
                    stroke={color}
                    strokeWidth={node.id === 'orders' ? 2.5 : isViolation ? 1.8 : 1.2}
                  />
                  {(node.id === 'orders' || r >= 8) && (
                    <text
                      x={node.x}
                      y={node.y + r + 11}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="ui-monospace, monospace"
                      fill={node.id === 'orders' ? '#FF9900' : 'rgba(229,231,235,0.55)'}
                      fontWeight={node.id === 'orders' ? 700 : 400}
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover popover */}
          {hovered && (
            <div
              className="pointer-events-none absolute rounded-lg border px-3 py-2 text-[11px] shadow-xl"
              style={{
                left: `min(calc(${(hovered.x / 1000) * 100}% + 16px), calc(100% - 220px))`,
                top: `calc(${(hovered.y / 680) * 100}% + 16px)`,
                background: 'rgba(11, 18, 32, 0.96)',
                borderColor: `${DOMAIN_COLORS[hovered.domain]}55`,
                color: '#E5E7EB',
                minWidth: 200,
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-[12px] font-semibold" style={{ color: DOMAIN_COLORS[hovered.domain] }}>
                  {hovered.name}
                </span>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider" style={{ background: `${DOMAIN_COLORS[hovered.domain]}22`, color: DOMAIN_COLORS[hovered.domain] }}>
                  Tier {hovered.tier}
                </span>
              </div>
              <dl className="space-y-0.5 text-[10px]" style={{ color: 'rgba(229,231,235,0.8)' }}>
                <div className="flex justify-between gap-2"><dt className="opacity-60">LOC</dt><dd className="font-mono">{hovered.loc.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-2"><dt className="opacity-60">external callers</dt><dd className="font-mono">{hovered.externalCallers}</dd></div>
                <div className="flex justify-between gap-2"><dt className="opacity-60">owner</dt><dd className="font-mono">{hovered.owner}</dd></div>
                <div className="flex justify-between gap-2"><dt className="opacity-60">wave</dt><dd className="font-mono">Wave {hovered.wave}</dd></div>
                {hovered.boundaryViolations && (
                  <div className="flex justify-between gap-2"><dt className="opacity-60">violations</dt><dd className="font-mono" style={{ color: '#EF4444' }}>{hovered.boundaryViolations}</dd></div>
                )}
              </dl>
            </div>
          )}

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-md border px-3 py-2 text-[10px]" style={{ background: 'rgba(11,18,32,0.8)', borderColor: 'rgba(229,231,235,0.1)', color: 'rgba(229,231,235,0.75)' }}>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#FF9900' }} /> OrdersService</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm" style={{ background: '#EF4444' }} /> boundary violation</span>
            <span className="text-[9px] uppercase tracking-wider opacity-60">· hover any node</span>
          </div>
        </div>

        {/* Right: Cursor's recommendation */}
        <aside
          className="flex h-fit flex-col gap-3 rounded-xl border p-4 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(180deg, rgba(255,153,0,0.08) 0%, rgba(255,153,0,0.02) 100%)',
            borderColor: 'rgba(255,153,0,0.3)',
            opacity: revealed ? 1 : 0.3,
          }}
        >
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#FF9900' }}>
            <CursorLogo size={14} tone="dark" />
            Cursor&rsquo;s pick
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(229,231,235,0.55)' }}>Start with</div>
            <h3 className="text-2xl font-bold leading-tight" style={{ color: '#FF9900' }}>OrdersService</h3>
          </div>

          <ul className="space-y-1.5 text-[12px] leading-snug" style={{ color: 'rgba(229,231,235,0.85)' }}>
            <li className="flex gap-1.5"><span className="mt-0.5 font-mono text-[10px]" style={{ color: '#4DD4FF' }}>▸</span><span className="font-semibold text-white">63%</span>&nbsp;of revenue flows through it</li>
            <li className="flex gap-1.5"><span className="mt-0.5 font-mono text-[10px]" style={{ color: '#4DD4FF' }}>▸</span>Just <span className="font-semibold text-white">4.3%</span>&nbsp;of the codebase</li>
            <li className="flex gap-1.5"><span className="mt-0.5 font-mono text-[10px]" style={{ color: '#4DD4FF' }}>▸</span>Unblocks <span className="font-semibold text-white">6 downstream services</span></li>
          </ul>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!revealed}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF9900', color: '#0B1220' }}
          >
            <GitPullRequest className="h-4 w-4" />
            Start with OrdersService
            <span>→</span>
          </button>
        </aside>
      </div>
    </ActShell>
  );
}

function Finding({
  n,
  label,
  icon,
  accent = '#4DD4FF',
}: {
  n: string;
  label: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ background: `${accent}12`, color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xl font-bold tabular-nums leading-none" style={{ color: accent }}>{n}</div>
        <div className="mt-0.5 text-[11px] leading-snug" style={{ color: 'rgba(229,231,235,0.7)' }}>{label}</div>
      </div>
    </li>
  );
}
