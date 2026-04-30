'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Eye,
  FileSearch,
  Github,
  KeyRound,
  Lock,
  MessageSquare,
  Moon,
  PenLine,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { gsap } from '@/lib/gsap-init';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import type { RuntimeChannel, RuntimePhase, RuntimeStep } from '@/lib/sdk-demo/types';

// --------------------------------------------------------------------------
// Channel meta (color, icon, friendly label).
// --------------------------------------------------------------------------

interface ChannelMeta {
  label: string;
  sublabel: string;
  color: string;
  icon: LucideIcon;
}

const CHANNEL_META: Record<RuntimeChannel, ChannelMeta> = {
  sdk:         { label: 'Cursor SDK',   sublabel: '@cursor/february',   color: '#60A5FA', icon: Sparkles },
  gitguardian: { label: 'GitGuardian',  sublabel: 'gitguardian-mcp',    color: '#1F8FFF', icon: KeyRound },
  wiz:         { label: 'Wiz',          sublabel: 'wiz-mcp',            color: '#9B8DFF', icon: Cloud },
  snyk:        { label: 'Snyk',         sublabel: 'snyk-mcp',           color: '#C8A8E0', icon: ShieldCheck },
  okta:        { label: 'Okta',         sublabel: 'okta-mcp',           color: '#5BB1FF', icon: Lock },
  crowdstrike: { label: 'CrowdStrike',  sublabel: 'crowdstrike-mcp',    color: '#FF668A', icon: Eye },
  splunk:      { label: 'Splunk',       sublabel: 'splunk-mcp',         color: '#8FCB5F', icon: ScanSearch },
  zscaler:     { label: 'Zscaler',      sublabel: 'zscaler-mcp',        color: '#52C7E8', icon: ShieldCheck },
  aws:         { label: 'AWS',          sublabel: 'aws-mcp',            color: '#FFB158', icon: Cloud },
  stripe:      { label: 'Stripe',       sublabel: 'stripe-mcp',         color: '#9189FF', icon: CircleDollarSign },
  vault:       { label: 'Vault',        sublabel: 'vault-mcp',          color: '#FFEC6E', icon: KeyRound },
  github:      { label: 'GitHub',       sublabel: 'github-mcp',         color: '#E2E2E5', icon: Github },
  jira:        { label: 'Jira',         sublabel: 'jira-mcp',           color: '#4C9AFF', icon: FileSearch },
  slack:       { label: 'Slack',        sublabel: 'slack-mcp',          color: '#E4A6E0', icon: MessageSquare },
  opus:        { label: 'Claude Opus',  sublabel: 'reasoning model',    color: '#D97757', icon: Brain },
  composer:    { label: 'Composer',     sublabel: 'edit model',         color: '#60A5FA', icon: PenLine },
  codex:       { label: 'Codex',        sublabel: 'review model',       color: '#10A37F', icon: Check },
  shell:       { label: 'Shell',        sublabel: 'tsc · lint · test',  color: '#4ADE80', icon: Terminal },
  codegen:     { label: 'Codegen',      sublabel: 'doc generation',     color: '#60A5FA', icon: PenLine },
  done:        { label: 'Done',         sublabel: 'agent finished',     color: '#4ADE80', icon: CheckCircle2 },
};

const SATELLITE_CHANNELS: RuntimeChannel[] = [
  'gitguardian',
  'wiz',
  'snyk',
  'okta',
  'crowdstrike',
  'aws',
  'stripe',
  'vault',
  'zscaler',
  'github',
  'jira',
  'slack',
  'splunk',
  'opus',
  'composer',
  'codex',
  'shell',
];

const PHASES: Array<{ id: RuntimePhase; label: string; help: string }> = [
  { id: 'identified',  label: 'Alert received',     help: 'A security tool just told the agent something is wrong.' },
  { id: 'context',     label: 'Gathering context',  help: 'The agent figures out what was hit, who owns it, and why.' },
  { id: 'containment', label: 'Stopping the bleed', help: 'Rotate keys, revoke sessions, cut off bad traffic. No code edits yet.' },
  { id: 'remediation', label: 'Fixing the code',    help: 'AI edits the source, runs tests, opens a Pull Request for human review.' },
  { id: 'audit',       label: 'Notifying humans',   help: 'Files Jira, posts Slack, writes an audit event the SIEM can correlate.' },
  { id: 'resolved',    label: 'Run complete',       help: 'Five artifacts are ready for the reviewer.' },
];

const TIME_SCALE = 2.7;

function formatElapsed(ms: number): string {
  const total = ms / 1000;
  const mins = Math.floor(total / 60);
  const s = Math.floor(total) % 60;
  if (mins > 0) {
    return `${String(mins).padStart(1, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `0:${String(s).padStart(2, '0')}`;
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
  script: ResolvedScript;
  onStep?: (step: RuntimeStep, index: number) => void;
  onComplete?: () => void;
}

interface Ping {
  id: number;
  channel: RuntimeChannel;
  direction: 'in' | 'out';
  color: string;
}

type AgentState = 'sleeping' | 'waking' | 'working' | 'resolved' | 'dormant';

interface NodePosition {
  channel: RuntimeChannel;
  x: number;
  y: number;
}

const AGENT_POS = { x: 50, y: 50 };

// Slow the playback to live-narration pace. The original script timings
// were tuned for the unguided Datadog demo; this demo is presenter-driven
// and needs each beat to linger long enough to talk through.
const PLAYBACK_MULTIPLIER = 2.6;

function deriveNodePositions(channels: RuntimeChannel[]): NodePosition[] {
  if (channels.length === 0) return [];
  // Push satellites further from center so they never collide with the
  // agent bubble (which is ~96px radius). x-radius 46 + y-radius 0.78x
  // keeps the top/bottom nodes well clear of the central agent.
  const radius = 46;
  const startDeg = -90;
  return channels.map((channel, i) => {
    const deg = startDeg + (360 / channels.length) * i;
    const rad = (deg * Math.PI) / 180;
    return {
      channel,
      x: AGENT_POS.x + radius * Math.cos(rad),
      y: AGENT_POS.y + radius * 0.78 * Math.sin(rad),
    };
  });
}

export function AgentNetwork({ script, onStep, onComplete }: AgentNetworkProps) {
  const reducedMotion = usePrefersReducedMotion();

  const usedChannels = useMemo<RuntimeChannel[]>(() => {
    const set = new Set<RuntimeChannel>();
    for (const s of script.steps) {
      if (SATELLITE_CHANNELS.includes(s.channel)) set.add(s.channel);
    }
    // Stable order matching SATELLITE_CHANNELS
    return SATELLITE_CHANNELS.filter((c) => set.has(c));
  }, [script]);

  const nodePositions = useMemo(() => deriveNodePositions(usedChannels), [usedChannels]);

  const [phase, setPhase] = useState<RuntimePhase>('identified');
  const [agentState, setAgentState] = useState<AgentState>('sleeping');
  const [agentLabel, setAgentLabel] = useState('Sleeping, waiting for alert');
  const [agentSubLabel, setAgentSubLabel] = useState('Cursor SDK is idle until a webhook fires.');
  const [activeChannel, setActiveChannel] = useState<RuntimeChannel | null>(null);
  const [activatedChannels, setActivatedChannels] = useState<Set<RuntimeChannel>>(new Set());
  const [completedPhases, setCompletedPhases] = useState<Set<RuntimePhase>>(new Set());
  const [pings, setPings] = useState<Ping[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);

  const completedRef = useRef(false);
  const pingIdRef = useRef(0);

  useEffect(() => {
    setPhase('identified');
    setAgentState('sleeping');
    setAgentLabel('Sleeping, waiting for alert');
    setAgentSubLabel('Cursor SDK is idle until a webhook fires.');
    setActiveChannel(null);
    setActivatedChannels(new Set());
    setCompletedPhases(new Set());
    setPings([]);
    setElapsedMs(0);
    setFinished(false);
    completedRef.current = false;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    const tickerStart = performance.now();
    const ticker = setInterval(() => {
      setElapsedMs((performance.now() - tickerStart) * TIME_SCALE);
    }, 200);

    script.steps.forEach((step, i) => {
      cumulative += step.delayMs * PLAYBACK_MULTIPLIER;
      const t = setTimeout(() => {
        runBeat(step, i);
        onStep?.(step, i);
      }, cumulative);
      timers.push(t);
    });

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(ticker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  const runBeat = useCallback(
    (step: RuntimeStep, idx: number) => {
      const beatPhase = step.phase ?? 'context';
      setPhase((prev) => {
        if (prev !== beatPhase) {
          setCompletedPhases((s) => new Set(s).add(prev));
        }
        return beatPhase;
      });

      setAgentLabel(step.label);
      setAgentSubLabel(step.plainEnglish ?? step.detail ?? '');

      if (idx === 0) {
        setAgentState('waking');
        setTimeout(() => setAgentState('working'), 600);
      } else if (step.channel === 'done') {
        setAgentState('resolved');
      }

      const ch = step.channel;
      if (SATELLITE_CHANNELS.includes(ch)) {
        setActivatedChannels((s) => (s.has(ch) ? s : new Set(s).add(ch)));
        setActiveChannel(ch);

        // tool.call and assistant beats originate at the agent, all others
        // come from the satellite. Read the SDK event type when available.
        const sdkType = step.sdkEvent?.type;
        if (sdkType === 'tool.call' || sdkType === 'assistant' || sdkType === 'agent.send') {
          spawnPing(ch, 'out');
        } else if (sdkType === 'tool.result') {
          spawnPing(ch, 'in');
        } else {
          spawnPing(ch, 'in');
          if (!reducedMotion) {
            setTimeout(() => spawnPing(ch, 'out'), 240);
          }
        }
      }

      if (idx === script.steps.length - 1) {
        setTimeout(() => {
          setCompletedPhases((s) => {
            const next = new Set(s);
            for (const p of PHASES) {
              if (p.id === 'resolved') break;
              next.add(p.id);
            }
            next.add(beatPhase);
            return next;
          });
          setFinished(true);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }, 700);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [script, reducedMotion, onComplete],
  );

  const spawnPing = useCallback((channel: RuntimeChannel, direction: 'in' | 'out') => {
    const id = ++pingIdRef.current;
    const color = CHANNEL_META[channel].color;
    setPings((p) => [...p, { id, channel, direction, color }]);
  }, []);

  const removePing = useCallback((id: number) => {
    setPings((p) => p.filter((x) => x.id !== id));
  }, []);

  return (
    <div className="w-full h-full rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
      {/* Phase banner */}
      <PhaseBanner phase={phase} completed={completedPhases} finished={finished} />

      <div className="px-3 pb-1 pt-0 shrink-0">
        <PhaseExplainer phase={phase} finished={finished} />
      </div>

      {/* Live region for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {agentLabel}. {agentSubLabel}
      </div>

      <div className="flex-1 min-h-0 px-2 pb-2 pt-1">
        <OrbitalView
          nodePositions={nodePositions}
          agentState={agentState}
          agentLabel={agentLabel}
          agentSubLabel={agentSubLabel}
          elapsedMs={elapsedMs}
          activeChannel={activeChannel}
          activatedChannels={activatedChannels}
          pings={pings}
          onPingDone={removePing}
          reducedMotion={reducedMotion}
          finished={finished}
        />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// PhaseBanner + PhaseExplainer
// --------------------------------------------------------------------------

function PhaseBanner({
  phase,
  completed,
  finished,
}: {
  phase: RuntimePhase;
  completed: Set<RuntimePhase>;
  finished: boolean;
}) {
  const currentIdx = PHASES.findIndex((p) => p.id === phase);
  return (
    <div
      className="w-full px-3 pt-3 pb-2 border-b border-dark-border bg-dark-bg shrink-0"
      aria-label="Agent progress"
    >
      <ol className="flex items-center justify-between gap-1">
        {PHASES.map((p, i) => {
          const isActive = phase === p.id && !finished;
          const isComplete = completed.has(p.id) || (finished && i <= currentIdx) || (finished && p.id === 'resolved');
          const isFuture = !isActive && !isComplete;

          return (
            <li
              key={p.id}
              className="flex items-center gap-1 flex-1 min-w-0"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={[
                  'flex items-center gap-1 px-1.5 py-1 rounded-md flex-1 min-w-0 transition-all duration-300',
                  isActive && 'bg-accent-blue/15 ring-1 ring-accent-blue/45 shadow-[0_0_16px_rgba(96,165,250,0.18)]',
                  isComplete && !isActive && 'bg-accent-green/10 ring-1 ring-accent-green/30',
                  isFuture && 'bg-dark-bg/40 ring-1 ring-dark-border/60',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold',
                    isActive && 'bg-accent-blue/30 text-accent-blue animate-pulse',
                    isComplete && !isActive && 'bg-accent-green/30 text-accent-green',
                    isFuture && 'bg-dark-border text-text-tertiary',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isComplete && !isActive ? <Check className="w-2 h-2" /> : i + 1}
                </span>
                <span
                  className={[
                    'text-[10px] font-medium tracking-tight truncate',
                    isActive && 'text-accent-blue',
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
                    'shrink-0 h-px w-1.5 transition-colors duration-300',
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

function PhaseExplainer({ phase, finished }: { phase: RuntimePhase; finished: boolean }) {
  const meta = PHASES.find((p) => p.id === phase) ?? PHASES[0];
  return (
    <div className="px-1 pt-1.5">
      <p className="text-[10px] text-text-tertiary leading-snug">
        <span className="font-mono uppercase tracking-wider mr-1.5">
          {finished ? 'Run complete' : `Phase ${PHASES.findIndex((p) => p.id === phase) + 1} of ${PHASES.length - 1}`}
        </span>
        <span className="text-text-secondary">{finished ? PHASES[PHASES.length - 1].help : meta.help}</span>
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------
// Orbital View
// --------------------------------------------------------------------------

interface OrbitalViewProps {
  nodePositions: NodePosition[];
  agentState: AgentState;
  agentLabel: string;
  agentSubLabel: string;
  elapsedMs: number;
  activeChannel: RuntimeChannel | null;
  activatedChannels: Set<RuntimeChannel>;
  pings: Ping[];
  onPingDone: (id: number) => void;
  reducedMotion: boolean;
  finished: boolean;
}

function OrbitalView({
  nodePositions,
  agentState,
  agentLabel,
  agentSubLabel,
  elapsedMs,
  activeChannel,
  activatedChannels,
  pings,
  onPingDone,
  reducedMotion,
  finished,
}: OrbitalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, '');

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        data-orbital-container
        className="relative w-full h-full rounded-lg border border-dark-border/60 bg-dark-bg/50 overflow-hidden"
        style={{ minHeight: 360 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.45]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(96,165,250,0.15), transparent 55%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        />

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
          {nodePositions.map((node) => {
            const visible = activatedChannels.has(node.channel);
            const active = activeChannel === node.channel;
            const meta = CHANNEL_META[node.channel];
            return (
              <line
                key={node.channel}
                x1={AGENT_POS.x}
                y1={AGENT_POS.y}
                x2={node.x}
                y2={node.y}
                stroke={meta.color}
                strokeOpacity={visible ? (active ? 0.6 : 0.22) : 0}
                strokeWidth={active ? 0.35 : 0.22}
                strokeDasharray="0.8 1.4"
                style={{
                  transition: 'stroke-opacity 400ms ease, stroke-width 400ms ease',
                  animation:
                    visible && active && !reducedMotion
                      ? 'sdkAgentDash 2.4s linear infinite'
                      : undefined,
                }}
                filter={active ? `url(#glow-${uid})` : undefined}
              />
            );
          })}
        </svg>

        {nodePositions.map((node) => (
          <SatelliteBubble
            key={node.channel}
            channel={node.channel}
            x={node.x}
            y={node.y}
            visible={activatedChannels.has(node.channel)}
            active={activeChannel === node.channel}
            reducedMotion={reducedMotion}
          />
        ))}

        {pings.map((p) => {
          const pos = nodePositions.find((n) => n.channel === p.channel);
          if (!pos) return null;
          return (
            <PingDot
              key={p.id}
              ping={p}
              from={p.direction === 'in' ? pos : AGENT_POS}
              to={p.direction === 'in' ? AGENT_POS : pos}
              onDone={onPingDone}
              reducedMotion={reducedMotion}
            />
          );
        })}

        <AgentBubble
          state={agentState}
          label={agentLabel}
          subLabel={agentSubLabel}
          elapsedMs={elapsedMs}
          reducedMotion={reducedMotion}
        />

        <div className="absolute top-2 left-2 z-30 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-dark-bg/85 border border-dark-border backdrop-blur-sm">
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

        {finished && (
          <div className="absolute bottom-2 right-2 z-30 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-green/10 border border-accent-green/30 text-accent-green text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Run complete · scroll for artifacts
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes sdkAgentDash {
          to { stroke-dashoffset: -22; }
        }
        @keyframes sdkAgentBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }
        @keyframes sdkAgentRingPulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.65; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes sdkSatellitePop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes sdkSatellitePulseRing {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.55; }
          100% { transform: translate(-50%, -50%) scale(1.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function AgentBubble({
  state,
  label,
  subLabel,
  elapsedMs,
  reducedMotion,
}: {
  state: AgentState;
  label: string;
  subLabel: string;
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

  const ringOpacity = state === 'sleeping' || state === 'dormant' ? 0.2 : 0.55;

  return (
    <div
      className="absolute z-20"
      style={{
        left: `${AGENT_POS.x}%`,
        top: `${AGENT_POS.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {(state === 'working' || state === 'waking' || state === 'resolved') && !reducedMotion && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: 200,
            height: 200,
            border: `2px solid ${stateColor}`,
            opacity: 0,
            animation: 'sdkAgentRingPulse 2.4s ease-out infinite',
          }}
        />
      )}

      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none transition-all duration-500"
        style={{
          width: 180,
          height: 180,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${stateColor}33 0%, transparent 65%)`,
          opacity: ringOpacity,
        }}
      />

      <div
        className="relative rounded-full border-2 bg-dark-bg/95 backdrop-blur-sm flex flex-col items-center justify-center text-center px-3 transition-colors duration-500"
        style={{
          width: 192,
          height: 192,
          borderColor: stateColor,
          boxShadow: `0 0 32px ${stateColor}33, inset 0 0 24px ${stateColor}1a`,
          animation:
            !reducedMotion && (state === 'sleeping' || state === 'dormant')
              ? 'sdkAgentBreath 4.5s ease-in-out infinite'
              : undefined,
        }}
      >
        <div
          className="mb-1 w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${stateColor}22`, color: stateColor }}
        >
          {state === 'sleeping' && <Moon className="w-3.5 h-3.5" />}
          {state === 'waking' && <AlertCircle className="w-3.5 h-3.5" />}
          {state === 'working' && <Bot className="w-3.5 h-3.5" />}
          {state === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {state === 'dormant' && <Moon className="w-3.5 h-3.5" />}
        </div>

        <p className="text-[9px] font-mono uppercase tracking-[0.16em] text-text-tertiary leading-none mb-1">
          Cursor agent
        </p>

        <p
          key={`label-${label}`}
          className="text-[12px] font-semibold text-text-primary leading-tight px-1 line-clamp-2"
          style={{ animation: reducedMotion ? undefined : 'sdkAgentLabelFade 0.35s ease-out' }}
        >
          {label}
        </p>

        {subLabel && (
          <p
            key={`sub-${subLabel}`}
            className="mt-1 text-[10px] text-text-secondary leading-snug px-1 line-clamp-3"
            style={{ animation: reducedMotion ? undefined : 'sdkAgentLabelFade 0.5s ease-out' }}
          >
            {subLabel}
          </p>
        )}

        <p className="mt-1.5 text-[9px] font-mono text-text-tertiary">
          t+{formatElapsed(elapsedMs)}
        </p>
      </div>

      <style jsx>{`
        @keyframes sdkAgentLabelFade {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function SatelliteBubble({
  channel,
  x,
  y,
  visible,
  active,
  reducedMotion,
}: {
  channel: RuntimeChannel;
  x: number;
  y: number;
  visible: boolean;
  active: boolean;
  reducedMotion: boolean;
}) {
  const meta = CHANNEL_META[channel];
  const Icon = meta.icon;
  return (
    <div
      className="absolute z-10 select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
        animation: visible && !reducedMotion ? 'sdkSatellitePop 0.45s ease-out' : undefined,
        transition: 'opacity 250ms ease',
      }}
    >
      {active && !reducedMotion && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: 84,
            height: 84,
            border: `1.5px solid ${meta.color}`,
            opacity: 0,
            animation: 'sdkSatellitePulseRing 1.6s ease-out infinite',
          }}
        />
      )}

      <div
        className="relative rounded-full border-2 flex flex-col items-center justify-center bg-dark-bg/95 backdrop-blur-sm transition-all duration-300"
        style={{
          width: 64,
          height: 64,
          borderColor: active ? meta.color : `${meta.color}55`,
          boxShadow: active
            ? `0 0 22px ${meta.color}66, inset 0 0 12px ${meta.color}22`
            : `0 0 8px ${meta.color}22`,
        }}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center mb-0.5"
          style={{ background: `${meta.color}22`, color: meta.color }}
        >
          <Icon className="w-3 h-3" />
        </div>
        <p
          className="text-[9px] font-semibold leading-none text-text-primary truncate max-w-[58px]"
          title={meta.label}
        >
          {meta.label}
        </p>
      </div>
      <p
        className="absolute left-1/2 -bottom-3.5 -translate-x-1/2 text-[8px] font-mono whitespace-nowrap"
        style={{
          color: active ? meta.color : 'var(--color-text-tertiary, #6b7280)',
          opacity: active ? 0.95 : 0.55,
          transition: 'opacity 300ms',
        }}
      >
        {meta.sublabel}
      </p>
    </div>
  );
}

function PingDot({
  ping,
  from,
  to,
  onDone,
  reducedMotion,
}: {
  ping: Ping;
  from: { x: number; y: number };
  to: { x: number; y: number };
  onDone: (id: number) => void;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.fromTo(
        el,
        { left: `${to.x}%`, top: `${to.y}%`, opacity: 0.8, scale: 1.4 },
        {
          opacity: 0,
          scale: 0.6,
          duration: 0.35,
          ease: 'power1.out',
          onComplete: () => onDone(ping.id),
        },
      );
      return;
    }

    gsap.set(el, { left: `${from.x}%`, top: `${from.y}%`, opacity: 0, scale: 0.4 });
    const tl = gsap.timeline({ onComplete: () => onDone(ping.id) });
    tl.to(el, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .to(el, { left: `${to.x}%`, top: `${to.y}%`, duration: 0.85, ease: 'power2.inOut' }, 0)
      .to(el, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in' }, '-=0.25');

    return () => {
      tl.kill();
    };
  }, [ping.id, from.x, from.y, to.x, to.y, onDone, reducedMotion]);

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
