'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  GitBranch,
  GitPullRequest,
  Layers,
  Layers3,
  Plug,
  Play,
} from 'lucide-react';
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
 * The fleet of Cloud Agents the scan launches in parallel. Each agent owns a
 * slice of the monolith and pulls live context through MCP — they're not
 * waiting on a single sequential reader. This is the visible reason the scan
 * takes 5 hours instead of 4 weeks.
 *
 * `pace` controls how quickly each agent finishes (1.0 = nominal). The fleet
 * finishes at staggered times to make parallelism feel real instead of a
 * single bar masquerading as six.
 */
const SCAN_AGENTS = [
  { id: 'a-customer',   name: 'customer-domain',   loc:   470_000, color: '#FBBF24', pace: 1.30 },
  { id: 'a-catalog',    name: 'catalog-domain',    loc:   540_000, color: '#34D399', pace: 1.15 },
  { id: 'a-inventory',  name: 'inventory-domain',  loc:   780_000, color: '#4DD4FF', pace: 1.00 },
  { id: 'a-billing',    name: 'billing-domain',    loc:   620_000, color: '#A78BFA', pace: 0.92 },
  { id: 'a-batch',      name: 'batch-jobs',        loc:   590_000, color: '#F87171', pace: 0.85 },
  { id: 'a-orders',     name: 'orders-domain',     loc: 1_200_000, color: '#FF9900', pace: 0.70 },
] as const;

/** Live data sources the fleet reads through the MCP marketplace. */
const MCP_SOURCES = [
  { name: 'AWS',     detail: 'Resource graph, IAM, VPC' },
  { name: 'GitHub',  detail: 'Repos, PR history, owners' },
  { name: 'Jira',    detail: 'Incidents, epics, OKRs' },
  { name: 'Datadog', detail: 'p99, error rates, traces' },
  { name: 'Sentry',  detail: 'Recurrence, blast radius' },
  { name: 'Slack',   detail: 'On-call channel context' },
] as const;

/**
 * Scene timing. Each phase contributes to the on-screen story; total run
 * is ~12s so the viewer can read what's happening instead of watching a bar
 * sprint to 100% in a second.
 */
const PHASE_MS = {
  connecting: 4_000,  // sequential MCP handshake — chips light up one by one
  scanning:   6_500,  // fleet reads in parallel; agents finish at staggered times
  merging:    1_500,  // orchestrator stitches results before reveal
} as const;

const MCP_CONNECT_STAGGER = PHASE_MS.connecting / (MCP_SOURCES.length + 1);

type ScanPhase = 'idle' | 'connecting' | 'scanning' | 'merging' | 'done';

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
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  /** Elapsed ms inside the current phase. Drives MCP staggers + agent bars. */
  const [phaseElapsed, setPhaseElapsed] = useState(0);

  const violationIds = useMemo(() => new Set(BOUNDARY_VIOLATIONS.flat()), []);

  // Drive the active phase's clock and advance to the next phase when done.
  useEffect(() => {
    if (scanPhase === 'idle' || scanPhase === 'done') return;

    const phaseDuration =
      scanPhase === 'connecting'
        ? PHASE_MS.connecting
        : scanPhase === 'scanning'
        ? PHASE_MS.scanning
        : PHASE_MS.merging;

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= phaseDuration) {
        setPhaseElapsed(phaseDuration);
        if (scanPhase === 'connecting') setScanPhase('scanning');
        else if (scanPhase === 'scanning') setScanPhase('merging');
        else if (scanPhase === 'merging') setScanPhase('done');
        return;
      }
      setPhaseElapsed(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scanPhase]);

  const revealed = scanPhase === 'done';

  /** How many MCP connectors have completed their handshake (0..N). */
  const mcpConnected =
    scanPhase === 'idle'
      ? 0
      : scanPhase === 'connecting'
      ? Math.min(MCP_SOURCES.length, Math.floor(phaseElapsed / MCP_CONNECT_STAGGER))
      : MCP_SOURCES.length;
  const mcpInProgressIdx = scanPhase === 'connecting' ? mcpConnected : -1;

  return (
    <ActShell act={2}>
      <ActHeader act={2} eyebrow="A fleet of Cursor Cloud Agents — plugged into your AWS, GitHub, Jira, Datadog, and Sentry through MCP — reads 4.2 million lines of Java in parallel. Click scan to start the swarm." />

      <StoryBeat
        tone="dark"
        agent="cloud"
        title="The GSI proposed sending three consultants for four to six weeks. Cursor sends six agents, in parallel, in one overnight shift."
        body={
          <>Each cloud agent owns a domain, reads your live AWS + GitHub + Jira through MCP, and reports back to the orchestrator — no screenshots, no exports, no all-hands interviews.</>
        }
        oldWay="3 consultants · 4–6 weeks"
        newWay="6 agents · one overnight shift"
      />

      <McpConnectorStrip
        connectedCount={mcpConnected}
        inProgressIdx={mcpInProgressIdx}
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
              Cursor Agent Findings
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
          {scanPhase !== 'done' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center">
              {scanPhase === 'idle' ? (
                <>
                  <div className="max-w-md text-[12.5px] leading-snug" style={{ color: 'rgba(229,231,235,0.75)' }}>
                    Ready to launch <strong className="text-white">6 Cursor Cloud Agents</strong> in parallel — one per
                    domain. Each agent reads your live systems through the MCP marketplace, no exports required.
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanPhase('connecting')}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
                    style={{ background: '#4DD4FF', color: '#0B1220' }}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Launch agent fleet
                  </button>
                </>
              ) : (
                <FleetView phase={scanPhase} phaseElapsed={phaseElapsed} mcpConnected={mcpConnected} />
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

        {/* Right: Cursor's recommendation + how-it-was-done */}
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
            Cursor suggests
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
            Start migrating OrdersService
            <span>→</span>
          </button>

          {revealed && <HowCursorDidIt />}
        </aside>
      </div>
    </ActShell>
  );
}

/**
 * Strip of MCP-marketplace data sources the Cloud Agents are reading from.
 * Each chip lights up green sequentially as its handshake completes; once a
 * connection is "connected," it stays green for the rest of the scene.
 */
function McpConnectorStrip({
  connectedCount,
  inProgressIdx,
}: {
  connectedCount: number;
  inProgressIdx: number;
}) {
  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5"
      style={{
        background: 'rgba(167, 139, 250, 0.05)',
        borderColor: 'rgba(167, 139, 250, 0.2)',
      }}
    >
      <span
        className="flex shrink-0 items-center gap-2 pr-2 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: '#A78BFA' }}
      >
        <Plug className="h-3.5 w-3.5" />
        MCP marketplace
      </span>
      <span className="hidden text-[11px] sm:inline" style={{ color: 'rgba(243,244,246,0.6)' }}>
        Connecting to live data sources…
      </span>
      <div className="flex flex-wrap gap-1.5">
        {MCP_SOURCES.map((s, i) => {
          const isConnected = i < connectedCount;
          const isPending = i === inProgressIdx;
          // Three visual states:
          //  - idle (gray)
          //  - pending handshake (purple, pulsing dot)
          //  - connected (green, solid dot, sticky)
          let bg = 'rgba(255,255,255,0.03)';
          let border = 'rgba(255,255,255,0.1)';
          let text = 'rgba(243,244,246,0.6)';
          let dot = 'rgba(255,255,255,0.25)';
          let dotShadow = 'none';
          let pulse = false;
          if (isConnected) {
            bg = 'rgba(52, 211, 153, 0.12)';
            border = 'rgba(52, 211, 153, 0.5)';
            text = '#A7F3D0';
            dot = '#34D399';
            dotShadow = '0 0 8px rgba(52,211,153,0.7)';
          } else if (isPending) {
            bg = 'rgba(167, 139, 250, 0.12)';
            border = 'rgba(167, 139, 250, 0.5)';
            text = '#E9D5FF';
            dot = '#A78BFA';
            dotShadow = '0 0 6px rgba(167,139,250,0.65)';
            pulse = true;
          }
          return (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-mono"
              style={{ background: bg, borderColor: border, color: text, transition: 'all 250ms' }}
              title={`${s.name} — ${s.detail}`}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: dot,
                  boxShadow: dotShadow,
                  animation: pulse ? 'mcpPulse 0.9s ease-in-out infinite' : 'none',
                }}
              />
              {s.name}
              {isConnected && (
                <span className="ml-0.5 text-[10px] font-semibold" aria-hidden>
                  ✓
                </span>
              )}
            </span>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes mcpPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.6); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * Live "fleet" view shown during connecting / scanning / merging. The scene
 * tells a three-phase story so the viewer can read what each Cursor capability
 * is doing instead of watching a single bar sprint to 100%.
 */
function FleetView({
  phase,
  phaseElapsed,
  mcpConnected,
}: {
  phase: ScanPhase;
  phaseElapsed: number;
  mcpConnected: number;
}) {
  const totalLoc = SCAN_AGENTS.reduce((a, b) => a + b.loc, 0);

  // Per-agent progress derived from the scanning-phase clock with a per-agent
  // pace, so the agents finish at distinct moments — not all at exactly 100%.
  const agentProgress = SCAN_AGENTS.map((a) => {
    if (phase === 'idle' || phase === 'connecting') return 0;
    if (phase === 'merging' || phase === 'done') return 1;
    const t = (phaseElapsed / PHASE_MS.scanning) * a.pace;
    // Ease-out so each agent slows as it approaches done; feels less robotic.
    const eased = 1 - Math.pow(1 - Math.min(1, t), 2);
    return Math.max(0, Math.min(1, eased));
  });

  const finishedCount = agentProgress.filter((p) => p >= 1).length;
  const totalRead =
    phase === 'connecting'
      ? 0
      : phase === 'merging' || phase === 'done'
      ? totalLoc
      : SCAN_AGENTS.reduce((a, b, i) => a + b.loc * agentProgress[i], 0);

  // Caption that explains what the user is currently watching.
  const caption =
    phase === 'connecting'
      ? `Handshaking with ${MCP_SOURCES[Math.min(mcpConnected, MCP_SOURCES.length - 1)]?.name ?? '…'} — ${mcpConnected}/${MCP_SOURCES.length} connectors live`
      : phase === 'scanning'
      ? `${finishedCount}/${SCAN_AGENTS.length} agents complete · orchestrator buffering findings…`
      : phase === 'merging'
      ? 'Orchestrator merging 6 agents’ findings into one ranked recommendation…'
      : '';

  return (
    <div className="w-full max-w-[480px]">
      <div className="mb-2 flex items-baseline justify-between text-[11px] uppercase tracking-[0.16em]" style={{ color: '#4DD4FF' }}>
        <span className="flex items-center gap-1.5">
          <Layers3 className="h-3.5 w-3.5" />
          Cloud Agent fleet · 6 in parallel
        </span>
        <span className="font-mono text-white">
          {Math.round(totalRead).toLocaleString()} / {totalLoc.toLocaleString()} LOC
        </span>
      </div>

      <div className="space-y-1.5">
        {SCAN_AGENTS.map((a, i) => {
          const p = agentProgress[i];
          const isWaiting = phase === 'connecting';
          const isDone = p >= 1;
          return (
            <div key={a.id} className="flex items-center gap-2">
              <span
                className="w-[120px] shrink-0 truncate text-left font-mono text-[10.5px]"
                style={{ color: isWaiting ? 'rgba(243,244,246,0.4)' : a.color }}
              >
                {a.name}
              </span>
              <div
                className="relative h-1.5 flex-1 overflow-hidden rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${p * 100}%`,
                    background: a.color,
                    transition: 'width 200ms linear',
                    boxShadow: `0 0 6px ${a.color}55`,
                  }}
                />
              </div>
              <span
                className="w-[44px] shrink-0 text-right font-mono text-[10px]"
                style={{ color: isDone ? '#7EE787' : isWaiting ? 'rgba(243,244,246,0.35)' : 'rgba(243,244,246,0.6)' }}
              >
                {isWaiting ? 'idle' : isDone ? '✓ done' : `${Math.round(p * 100)}%`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 min-h-[16px] text-[10.5px]" style={{ color: 'rgba(243,244,246,0.55)' }}>
        {caption}
      </div>

      {/* Phase progress dots so the viewer can see the larger arc. */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px]" style={{ color: 'rgba(243,244,246,0.5)' }}>
        <PhasePill label="Connect MCP" active={phase === 'connecting'} done={phase !== 'idle' && phase !== 'connecting'} />
        <span aria-hidden>·</span>
        <PhasePill label="Scan in parallel" active={phase === 'scanning'} done={phase === 'merging' || phase === 'done'} />
        <span aria-hidden>·</span>
        <PhasePill label="Merge findings" active={phase === 'merging'} done={phase === 'done'} />
      </div>
    </div>
  );
}

function PhasePill({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  let color = 'rgba(243,244,246,0.4)';
  if (active) color = '#4DD4FF';
  else if (done) color = '#7EE787';
  return (
    <span
      className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.14em]"
      style={{ color }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color, boxShadow: active ? '0 0 6px ' + color : 'none' }}
      />
      {done ? `${label} ✓` : label}
    </span>
  );
}

/**
 * Post-scan "how that was so fast" panel. Closes the loop between the speed
 * and the specific Cursor capabilities that made it possible.
 */
function HowCursorDidIt() {
  return (
    <div
      className="mt-2 flex flex-col gap-1.5 border-t pt-2.5 text-[11px] leading-snug"
      style={{ borderColor: 'rgba(255,153,0,0.2)', color: 'rgba(229,231,235,0.78)' }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#FFC66D' }}>
        How Cursor pulled this off
      </div>
      <ul className="space-y-1">
        <li className="flex gap-1.5">
          <Layers3 className="mt-[2px] h-3 w-3 shrink-0" style={{ color: '#4DD4FF' }} />
          <span><strong className="text-white">Cloud Agent fleet</strong> · 6 agents, one per domain, launched and run in parallel using Cursor 3.</span>
        </li>
        <li className="flex gap-1.5">
          <Plug className="mt-[2px] h-3 w-3 shrink-0" style={{ color: '#A78BFA' }} />
          <span><strong className="text-white">MCP marketplace</strong> · live reads of AWS, GitHub, Jira, Datadog, Sentry — no exports.</span>
        </li>
        <li className="flex gap-1.5">
          <CursorLogo size={12} tone="dark" />
          <span><strong className="text-white">Orchestrator</strong> · stitches each agent&rsquo;s findings into one ranked recommendation.</span>
        </li>
      </ul>
    </div>
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
