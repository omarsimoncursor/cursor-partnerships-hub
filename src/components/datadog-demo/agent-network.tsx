'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BellOff,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ExternalLink,
  Github,
  Moon,
  PenLine,
  ScanSearch,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { gsap } from '@/lib/gsap-init';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type Channel =
  | 'datadog'
  | 'pagerduty'
  | 'jira'
  | 'github'
  | 'shell'
  | 'opus'
  | 'composer'
  | 'codex';

type Phase = 'identified' | 'context' | 'fix' | 'test' | 'resolved';

type AgentState = 'sleeping' | 'waking' | 'working' | 'resolved' | 'dormant';

interface Beat {
  channel: Channel | 'self';
  agentLabel: string;
  phase: Phase;
  delayMs: number;
  pingDirection?: 'out' | 'in' | 'roundtrip';
}

// --------------------------------------------------------------------------
// Static node config (positions in 0–100 % space)
// --------------------------------------------------------------------------

interface NodeMeta {
  channel: Channel;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  color: string;            // hex used for rings, lines, pings
  brand: 'D' | 'PD' | 'J' | 'GH' | 'SH' | 'O' | 'CO' | 'CX';
  icon: React.ComponentType<{ className?: string }>;
}

const NODES: Record<Channel, NodeMeta> = {
  datadog:   { channel: 'datadog',   label: 'Datadog',    sublabel: 'monitor 3f12-8a2c', x: 18, y: 26, color: '#A689D4', brand: 'D',  icon: Activity },
  pagerduty: { channel: 'pagerduty', label: 'PagerDuty',  sublabel: 'INC-8421',          x: 50, y: 12, color: '#57D990', brand: 'PD', icon: BellOff },
  jira:      { channel: 'jira',      label: 'Jira',       sublabel: 'CUR-4318',          x: 82, y: 26, color: '#4C9AFF', brand: 'J',  icon: ScanSearch },
  github:    { channel: 'github',    label: 'GitHub',     sublabel: 'PR #157',           x: 90, y: 56, color: '#E2E2E5', brand: 'GH', icon: Github },
  shell:     { channel: 'shell',     label: 'Shell',      sublabel: 'tsc · curl',        x: 75, y: 86, color: '#4ADE80', brand: 'SH', icon: Terminal },
  codex:     { channel: 'codex',     label: 'Codex',      sublabel: 'review',            x: 50, y: 92, color: '#10A37F', brand: 'CX', icon: Check },
  composer:  { channel: 'composer',  label: 'Composer',   sublabel: 'edit',              x: 25, y: 86, color: '#60A5FA', brand: 'CO', icon: PenLine },
  opus:      { channel: 'opus',      label: 'Claude Opus', sublabel: 'triage',           x: 10, y: 56, color: '#D97757', brand: 'O',  icon: Brain },
};

const AGENT_POS = { x: 50, y: 50 };

// --------------------------------------------------------------------------
// Script — paced slower than the old console so the viewer can digest each step.
// Total real-time ~30s; displayed elapsed scales to ~2m 14s to match artifact copy.
// --------------------------------------------------------------------------

const SCRIPT: Beat[] = [
  // Wake
  { channel: 'datadog',   phase: 'identified', delayMs: 2000, agentLabel: 'Datadog alert received',                 pingDirection: 'in' },
  { channel: 'self',      phase: 'identified', delayMs: 1400, agentLabel: 'Issue identified, P1 SLO breach' },

  // Context
  { channel: 'datadog',   phase: 'context',    delayMs: 1500, agentLabel: 'Gathering context from Datadog' },
  { channel: 'datadog',   phase: 'context',    delayMs: 1700, agentLabel: 'Reading APM trace, 12 spans' },
  { channel: 'pagerduty', phase: 'context',    delayMs: 1500, agentLabel: 'Suppressing PagerDuty page' },
  { channel: 'jira',      phase: 'context',    delayMs: 1700, agentLabel: 'Filing Jira ticket CUR-4318' },
  { channel: 'github',    phase: 'context',    delayMs: 1700, agentLabel: 'Pulling commit history from GitHub' },
  { channel: 'opus',      phase: 'context',    delayMs: 2000, agentLabel: 'Triaging with Claude Opus' },
  { channel: 'self',      phase: 'context',    delayMs: 1500, agentLabel: 'Root cause: serial await in aggregate-orders.ts' },

  // Fix
  { channel: 'composer',  phase: 'fix',        delayMs: 2000, agentLabel: 'Drafting patch with Composer' },
  { channel: 'composer',  phase: 'fix',        delayMs: 1700, agentLabel: 'Promise.all over 6 regions' },
  { channel: 'codex',     phase: 'fix',        delayMs: 1900, agentLabel: 'Reviewing patch with Codex' },

  // Test
  { channel: 'shell',     phase: 'test',       delayMs: 1500, agentLabel: 'Type-checking, tsc --noEmit ✓' },
  { channel: 'shell',     phase: 'test',       delayMs: 1700, agentLabel: 'Live latency 7.41s → 0.61s ✓' },

  // Resolve
  { channel: 'github',    phase: 'resolved',   delayMs: 1700, agentLabel: 'Opening PR #157' },
  { channel: 'jira',      phase: 'resolved',   delayMs: 1300, agentLabel: 'Updating Jira to In Review' },
  { channel: 'pagerduty', phase: 'resolved',   delayMs: 1300, agentLabel: 'Resolving PagerDuty INC-8421' },
  { channel: 'self',      phase: 'resolved',   delayMs: 1300, agentLabel: 'Issue resolved, artifacts ready' },

  // Sleep
  { channel: 'self',      phase: 'resolved',   delayMs: 2000, agentLabel: 'Going back to sleep…' },
];

const PHASES: Array<{ id: Phase; label: string }> = [
  { id: 'identified', label: 'Issue identified' },
  { id: 'context',    label: 'Gathering context' },
  { id: 'fix',        label: 'Building fix' },
  { id: 'test',       label: 'Testing fix' },
  { id: 'resolved',   label: 'Issue resolved' },
];

// Real total ~30.5s; pretend wall-clock ~2m 14s on screen.
const TIME_SCALE = 4.4;

function formatElapsed(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(mins).padStart(1, '0')}:${String(s).padStart(2, '0')}`;
}

// --------------------------------------------------------------------------
// Reduced motion hook
// --------------------------------------------------------------------------

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

interface AgentNetworkProps {
  onComplete?: () => void;
  onViewDatadog?: () => void;
}

interface Ping {
  id: number;
  channel: Channel;
  direction: 'out' | 'in';
  color: string;
}

export function AgentNetwork({ onComplete, onViewDatadog }: AgentNetworkProps) {
  const [phase, setPhase] = useState<Phase>('identified');
  const [agentState, setAgentState] = useState<AgentState>('sleeping');
  const [agentLabel, setAgentLabel] = useState('Sleeping, waiting for alert');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activatedChannels, setActivatedChannels] = useState<Set<Channel>>(new Set());
  const [completedPhases, setCompletedPhases] = useState<Set<Phase>>(new Set());
  const [pings, setPings] = useState<Ping[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);

  const completedRef = useRef(false);
  const startRef = useRef<number>(0);
  const pingIdRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  // Schedule the script once on mount.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    startRef.current = performance.now();

    SCRIPT.forEach((beat, i) => {
      cumulative += beat.delayMs;
      const t = setTimeout(() => {
        runBeat(beat, i);
      }, cumulative);
      timers.push(t);
    });

    // Wall-clock ticker for the agent badge.
    const tickerStart = performance.now();
    const ticker = setInterval(() => {
      setElapsedMs((performance.now() - tickerStart) * TIME_SCALE);
    }, 200);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(ticker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runBeat = useCallback(
    (beat: Beat, idx: number) => {
      // Phase tracking
      setPhase(prev => {
        if (prev !== beat.phase) {
          setCompletedPhases(s => new Set(s).add(prev));
        }
        return beat.phase;
      });

      // Agent label
      setAgentLabel(beat.agentLabel);

      // Agent state transitions
      if (idx === 0) {
        setAgentState('waking');
        // Move to working shortly after wake completes.
        setTimeout(() => setAgentState('working'), 700);
      } else if (idx === SCRIPT.length - 2) {
        // "Issue resolved" beat
        setAgentState('resolved');
      } else if (idx === SCRIPT.length - 1) {
        // "Going back to sleep" beat
        setAgentState('dormant');
      }

      // Satellite reveal + ping
      if (beat.channel !== 'self') {
        const ch = beat.channel;
        setActivatedChannels(s => (s.has(ch) ? s : new Set(s).add(ch)));
        setActiveChannel(ch);

        const dir = beat.pingDirection ?? 'roundtrip';
        if (dir === 'in' || dir === 'roundtrip') {
          spawnPing(ch, 'in');
        }
        if (dir === 'out' || dir === 'roundtrip') {
          // Slightly delayed so the round-trip reads as two distinct pings.
          setTimeout(() => spawnPing(ch, 'out'), reducedMotion ? 0 : 220);
        }
      } else {
        setActiveChannel(null);
      }

      // Final beat: mark phase complete and notify parent.
      if (idx === SCRIPT.length - 1) {
        setTimeout(() => {
          setCompletedPhases(s => new Set(s).add(beat.phase));
          setFinished(true);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }, 900);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onComplete, reducedMotion]
  );

  const spawnPing = useCallback((channel: Channel, direction: 'in' | 'out') => {
    const id = ++pingIdRef.current;
    const color = NODES[channel].color;
    setPings(p => [...p, { id, channel, direction, color }]);
  }, []);

  const removePing = useCallback((id: number) => {
    setPings(p => p.filter(x => x.id !== id));
  }, []);

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <div className="w-full">
      {/* Phase banner */}
      <PhaseBanner phase={phase} completed={completedPhases} finished={finished} />

      {/* Live region for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {agentLabel}
      </div>

      {/* Desktop orbital viz */}
      <div className="hidden md:block">
        <OrbitalView
          agentState={agentState}
          agentLabel={agentLabel}
          elapsedMs={elapsedMs}
          activeChannel={activeChannel}
          activatedChannels={activatedChannels}
          pings={pings}
          onPingDone={removePing}
          reducedMotion={reducedMotion}
          finished={finished}
          onViewDatadog={onViewDatadog}
        />
      </div>

      {/* Mobile vertical fallback */}
      <div className="block md:hidden">
        <VerticalTimeline currentLabel={agentLabel} agentState={agentState} elapsedMs={elapsedMs} phase={phase} />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// PhaseBanner
// --------------------------------------------------------------------------

function PhaseBanner({
  phase,
  completed,
  finished,
}: {
  phase: Phase;
  completed: Set<Phase>;
  finished: boolean;
}) {
  return (
    <div
      className="w-full max-w-[860px] mx-auto mb-6 rounded-xl border border-dark-border bg-dark-surface px-3 py-3"
      aria-label="Agent progress"
    >
      <ol className="flex items-center justify-between gap-1.5">
        {PHASES.map((p, i) => {
          const isActive = phase === p.id && !finished;
          const isComplete = completed.has(p.id) || (finished && i <= PHASES.findIndex(x => x.id === phase));
          const isFuture = !isActive && !isComplete;

          return (
            <li
              key={p.id}
              className="flex items-center gap-1.5 flex-1 min-w-0"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={[
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-1 min-w-0 transition-all duration-300',
                  isActive && 'bg-[#632CA6]/15 ring-1 ring-[#632CA6]/45 shadow-[0_0_16px_rgba(166,137,212,0.2)]',
                  isComplete && !isActive && 'bg-accent-green/10 ring-1 ring-accent-green/30',
                  isFuture && 'bg-dark-bg/40 ring-1 ring-dark-border/60',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold',
                    isActive && 'bg-[#A689D4]/30 text-[#E0CFF0] animate-pulse',
                    isComplete && !isActive && 'bg-accent-green/30 text-accent-green',
                    isFuture && 'bg-dark-border text-text-tertiary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isComplete && !isActive ? <Check className="w-2.5 h-2.5" /> : i + 1}
                </span>
                <span
                  className={[
                    'text-[11px] font-medium tracking-tight truncate',
                    isActive && 'text-[#E0CFF0]',
                    isComplete && !isActive && 'text-accent-green',
                    isFuture && 'text-text-tertiary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {p.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={[
                    'shrink-0 h-px w-3 transition-colors duration-300',
                    isComplete ? 'bg-accent-green/40' : 'bg-dark-border',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// --------------------------------------------------------------------------
// Orbital View (md+)
// --------------------------------------------------------------------------

interface OrbitalViewProps {
  agentState: AgentState;
  agentLabel: string;
  elapsedMs: number;
  activeChannel: Channel | null;
  activatedChannels: Set<Channel>;
  pings: Ping[];
  onPingDone: (id: number) => void;
  reducedMotion: boolean;
  finished: boolean;
  onViewDatadog?: () => void;
}

function OrbitalView({
  agentState,
  agentLabel,
  elapsedMs,
  activeChannel,
  activatedChannels,
  pings,
  onPingDone,
  reducedMotion,
  finished,
  onViewDatadog,
}: OrbitalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, '');

  return (
    <div className="w-full max-w-[860px] mx-auto">
      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden"
        style={{ aspectRatio: '16 / 11' }}
      >
        {/* Background grid + radial glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.45]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(99,44,166,0.18), transparent 55%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        />

        {/* Connection lines + animated dashes (SVG, stretched to container) */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {(Object.keys(NODES) as Channel[]).map(ch => {
            const node = NODES[ch];
            const visible = activatedChannels.has(ch);
            const active = activeChannel === ch;
            return (
              <line
                key={ch}
                x1={AGENT_POS.x}
                y1={AGENT_POS.y}
                x2={node.x}
                y2={node.y}
                stroke={node.color}
                strokeOpacity={visible ? (active ? 0.55 : 0.22) : 0}
                strokeWidth={active ? 0.35 : 0.22}
                strokeDasharray="0.8 1.4"
                style={{
                  transition: 'stroke-opacity 400ms ease, stroke-width 400ms ease',
                  animation:
                    visible && active && !reducedMotion
                      ? 'agentNetDash 2.4s linear infinite'
                      : undefined,
                }}
                filter={active ? `url(#glow-${uid})` : undefined}
              />
            );
          })}
        </svg>

        {/* Satellite bubbles */}
        {(Object.keys(NODES) as Channel[]).map(ch => (
          <SatelliteBubble
            key={ch}
            node={NODES[ch]}
            visible={activatedChannels.has(ch)}
            active={activeChannel === ch}
            reducedMotion={reducedMotion}
          />
        ))}

        {/* Pings */}
        {pings.map(p => (
          <PingDot key={p.id} ping={p} onDone={onPingDone} reducedMotion={reducedMotion} />
        ))}

        {/* Agent bubble (center) */}
        <AgentBubble
          state={agentState}
          label={agentLabel}
          elapsedMs={elapsedMs}
          reducedMotion={reducedMotion}
        />

        {/* Footer link to Datadog */}
        {onViewDatadog && (
          <button
            onClick={onViewDatadog}
            className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#632CA6]/15 border border-[#632CA6]/35 text-[#A689D4] text-[11px] font-medium hover:bg-[#632CA6]/25 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            View in Datadog
          </button>
        )}

        {/* Status pill */}
        <div className="absolute top-3 left-3 z-30 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-dark-bg/80 border border-dark-border backdrop-blur-sm">
          <span
            className={[
              'w-1.5 h-1.5 rounded-full',
              agentState === 'sleeping' && 'bg-text-tertiary',
              agentState === 'waking' && 'bg-accent-amber animate-pulse',
              agentState === 'working' && 'bg-accent-blue animate-pulse',
              agentState === 'resolved' && 'bg-accent-green',
              agentState === 'dormant' && 'bg-text-tertiary',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
            {agentState === 'sleeping' && 'idle'}
            {agentState === 'waking' && 'waking'}
            {agentState === 'working' && 'engaged'}
            {agentState === 'resolved' && 'resolved'}
            {agentState === 'dormant' && 'idle'}
          </span>
          <span className="text-[10px] font-mono text-text-tertiary border-l border-dark-border pl-1.5 ml-0.5">
            {formatElapsed(elapsedMs)}
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes agentNetDash {
          to { stroke-dashoffset: -22; }
        }
        @keyframes agentBreath {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.025); }
        }
        @keyframes agentRingPulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.65; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes satellitePop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes satellitePulseRing {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.55; }
          100% { transform: translate(-50%, -50%) scale(1.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// --------------------------------------------------------------------------
// AgentBubble
// --------------------------------------------------------------------------

function AgentBubble({
  state,
  label,
  elapsedMs,
  reducedMotion,
}: {
  state: AgentState;
  label: string;
  elapsedMs: number;
  reducedMotion: boolean;
}) {
  const stateColor =
    state === 'working'
      ? '#60A5FA'
      : state === 'waking'
      ? '#F5A623'
      : state === 'resolved'
      ? '#4ADE80'
      : '#94A3B8';

  const ringOpacity = state === 'sleeping' || state === 'dormant' ? 0.18 : 0.55;

  return (
    <div
      className="absolute z-20"
      style={{
        left: `${AGENT_POS.x}%`,
        top: `${AGENT_POS.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer animated ring (working / waking) */}
      {(state === 'working' || state === 'waking' || state === 'resolved') && !reducedMotion && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: 180,
            height: 180,
            border: `2px solid ${stateColor}`,
            opacity: 0,
            animation: 'agentRingPulse 2.4s ease-out infinite',
          }}
        />
      )}

      {/* Static halo */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none transition-all duration-500"
        style={{
          width: 160,
          height: 160,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${stateColor}33 0%, transparent 65%)`,
          opacity: ringOpacity,
        }}
      />

      {/* Bubble body */}
      <div
        className="relative rounded-full border-2 bg-dark-bg/90 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4 transition-colors duration-500"
        style={{
          width: 168,
          height: 168,
          borderColor: stateColor,
          boxShadow: `0 0 32px ${stateColor}33, inset 0 0 24px ${stateColor}1a`,
          animation: !reducedMotion && (state === 'sleeping' || state === 'dormant') ? 'agentBreath 4.5s ease-in-out infinite' : undefined,
        }}
      >
        {/* Icon */}
        <div
          className="mb-1.5 w-7 h-7 rounded-md flex items-center justify-center"
          style={{
            background: `${stateColor}22`,
            color: stateColor,
          }}
        >
          {state === 'sleeping' && <Moon className="w-3.5 h-3.5" />}
          {state === 'waking' && <AlertCircle className="w-3.5 h-3.5" />}
          {state === 'working' && <Bot className="w-3.5 h-3.5" />}
          {state === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {state === 'dormant' && <Moon className="w-3.5 h-3.5" />}
        </div>

        {/* Title */}
        <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-text-tertiary leading-none mb-1">
          Cursor agent
        </p>

        {/* Live label */}
        <p
          key={label}
          className="text-[12.5px] font-medium text-text-primary leading-snug px-1"
          style={{
            animation: reducedMotion ? undefined : 'agentLabelFade 0.35s ease-out',
          }}
        >
          {label}
        </p>

        {/* Sub-row */}
        <p className="mt-1.5 text-[10px] font-mono text-text-tertiary">
          {state === 'dormant' ? 'ready for next alert' : `t+${formatElapsed(elapsedMs)}`}
        </p>
      </div>

      <style jsx>{`
        @keyframes agentLabelFade {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// --------------------------------------------------------------------------
// SatelliteBubble
// --------------------------------------------------------------------------

function SatelliteBubble({
  node,
  visible,
  active,
  reducedMotion,
}: {
  node: NodeMeta;
  visible: boolean;
  active: boolean;
  reducedMotion: boolean;
}) {
  const Icon = node.icon;
  return (
    <div
      className="absolute z-10 select-none"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
        animation: visible && !reducedMotion ? 'satellitePop 0.45s ease-out' : undefined,
        transition: 'opacity 250ms ease',
      }}
    >
      {/* Pulse ring on activity */}
      {active && !reducedMotion && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: 84,
            height: 84,
            border: `1.5px solid ${node.color}`,
            opacity: 0,
            animation: 'satellitePulseRing 1.6s ease-out infinite',
          }}
        />
      )}

      <div
        className="relative rounded-full border-2 flex flex-col items-center justify-center bg-dark-bg/90 backdrop-blur-sm transition-all duration-300"
        style={{
          width: 72,
          height: 72,
          borderColor: active ? node.color : `${node.color}55`,
          boxShadow: active
            ? `0 0 22px ${node.color}66, inset 0 0 12px ${node.color}22`
            : `0 0 8px ${node.color}22`,
        }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center mb-0.5"
          style={{ background: `${node.color}22`, color: node.color }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p
          className="text-[10px] font-semibold leading-none text-text-primary truncate max-w-[62px]"
          title={node.label}
        >
          {node.label}
        </p>
      </div>
      {node.sublabel && (
        <p
          className="absolute left-1/2 -bottom-4 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap"
          style={{ color: active ? node.color : 'var(--color-text-tertiary, #6b7280)', opacity: active ? 0.95 : 0.55, transition: 'opacity 300ms' }}
        >
          {node.sublabel}
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// PingDot — animates from agent center to satellite (or reverse)
// --------------------------------------------------------------------------

function PingDot({
  ping,
  onDone,
  reducedMotion,
}: {
  ping: Ping;
  onDone: (id: number) => void;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const node = NODES[ping.channel];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromX = ping.direction === 'in' ? node.x : AGENT_POS.x;
    const fromY = ping.direction === 'in' ? node.y : AGENT_POS.y;
    const toX = ping.direction === 'in' ? AGENT_POS.x : node.x;
    const toY = ping.direction === 'in' ? AGENT_POS.y : node.y;

    if (reducedMotion) {
      // Just flash and remove.
      gsap.fromTo(
        el,
        { left: `${toX}%`, top: `${toY}%`, opacity: 0.8, scale: 1.4 },
        {
          opacity: 0,
          scale: 0.6,
          duration: 0.35,
          ease: 'power1.out',
          onComplete: () => onDone(ping.id),
        }
      );
      return;
    }

    gsap.set(el, { left: `${fromX}%`, top: `${fromY}%`, opacity: 0, scale: 0.4 });
    const tl = gsap.timeline({ onComplete: () => onDone(ping.id) });
    tl.to(el, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .to(el, { left: `${toX}%`, top: `${toY}%`, duration: 0.95, ease: 'power2.inOut' }, 0)
      .to(el, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in' }, '-=0.25');

    return () => {
      tl.kill();
    };
  }, [ping.id, ping.direction, node.x, node.y, onDone, reducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        zIndex: 15,
        width: 12,
        height: 12,
        marginLeft: -6,
        marginTop: -6,
        borderRadius: '9999px',
        background: ping.color,
        boxShadow: `0 0 14px ${ping.color}, 0 0 4px ${ping.color}`,
        opacity: 0,
      }}
    />
  );
}

// --------------------------------------------------------------------------
// VerticalTimeline (mobile fallback)
// --------------------------------------------------------------------------

function VerticalTimeline({
  currentLabel,
  agentState,
  elapsedMs,
  phase,
}: {
  currentLabel: string;
  agentState: AgentState;
  elapsedMs: number;
  phase: Phase;
}) {
  const stateColor =
    agentState === 'working'
      ? '#60A5FA'
      : agentState === 'waking'
      ? '#F5A623'
      : agentState === 'resolved'
      ? '#4ADE80'
      : '#94A3B8';

  // Find which beats have already happened — we approximate by phase + label match
  // (good enough for the fallback).
  const labelIdx = useMemo(
    () => SCRIPT.findIndex(b => b.agentLabel === currentLabel),
    [currentLabel]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="rounded-xl border bg-dark-surface p-4 mb-3"
        style={{ borderColor: stateColor + '55' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: stateColor }}
          />
          <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-text-tertiary">
            Cursor agent · {phase.replace('_', ' ')}
          </p>
        </div>
        <p className="text-sm font-medium text-text-primary">{currentLabel}</p>
        <p className="text-[10px] font-mono text-text-tertiary mt-1.5">
          {agentState === 'dormant' ? 'ready for next alert' : `t+${formatElapsed(elapsedMs)}`}
        </p>
      </div>

      <ol className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
        {SCRIPT.map((b, i) => {
          const isPast = labelIdx >= 0 && i < labelIdx;
          const isCurrent = i === labelIdx;
          const channelColor = b.channel === 'self' ? '#94A3B8' : NODES[b.channel].color;
          return (
            <li
              key={i}
              className="flex items-start gap-2 text-[12px] py-1.5 px-2 rounded-md"
              style={{
                background: isCurrent ? `${channelColor}15` : undefined,
                opacity: i > labelIdx + 1 && labelIdx >= 0 ? 0.4 : 1,
              }}
            >
              <span
                className="shrink-0 w-3 h-3 mt-0.5 rounded-full flex items-center justify-center"
                style={{ background: isPast ? '#4ADE80' : channelColor + '55' }}
              >
                {isPast ? <Check className="w-2 h-2 text-dark-bg" /> : <Sparkles className="w-2 h-2" style={{ color: channelColor }} />}
              </span>
              <span className="text-text-primary leading-tight">{b.agentLabel}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
