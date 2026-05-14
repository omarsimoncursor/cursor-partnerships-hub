'use client';

import { ArrowRight, Code2, GitPullRequest, Layers, Rocket, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { FigmaActShell, FigmaActHeader } from './act-shell';
import { FigmaGlyph } from '../figma-glyph';

interface Act5Props {
  onAdvance: () => void;
}

const NODES = [
  {
    id: 'pm',
    label: 'PM',
    sub: 'writes intent',
    icon: Users,
    color: '#FBBF24',
    angle: -90,
  },
  {
    id: 'design',
    label: 'Design',
    sub: 'iterates in Figma',
    icon: Sparkles,
    color: '#A259FF',
    angle: -30,
    starred: true,
  },
  {
    id: 'agent',
    label: 'Cursor Agent',
    sub: 'composes & patches',
    icon: Code2,
    color: '#60A5FA',
    angle: 30,
  },
  {
    id: 'review',
    label: 'Review',
    sub: 'PR + tests + checks',
    icon: GitPullRequest,
    color: '#0ACF83',
    angle: 90,
  },
  {
    id: 'ship',
    label: 'Ship',
    sub: 'staged → prod',
    icon: Rocket,
    color: '#1ABCFE',
    angle: 150,
  },
  {
    id: 'observe',
    label: 'Observe',
    sub: 'analytics back to design',
    icon: ShieldCheck,
    color: '#F87171',
    angle: 210,
  },
];

const RADIUS = 230;
const CX = 320;
const CY = 280;

export function Act5Loop({ onAdvance }: Act5Props) {
  return (
    <FigmaActShell act={5}>
      <FigmaActHeader
        act={5}
        eyebrow="Cursor doesn't replace any existing role. It binds them tighter — and Figma is right at the center, alongside the agent that turns design into production code."
      />

      <div className="grid items-center gap-6 lg:grid-cols-[640px_1fr]">
        {/* The diagram */}
        <div
          className="relative mx-auto rounded-2xl border p-4"
          style={{
            width: 640,
            height: 560,
            background:
              'radial-gradient(ellipse at center, rgba(162,89,255,0.07) 0%, transparent 60%), rgba(255,255,255,0.02)',
            borderColor: 'rgba(162,89,255,0.18)',
          }}
        >
          <svg
            viewBox="0 0 640 560"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <radialGradient id="loop-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#A259FF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#A259FF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="loop-arc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A259FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Inner halo on the Figma center */}
            <circle cx={CX} cy={CY} r={RADIUS + 14} fill="none" stroke="rgba(162,89,255,0.12)" strokeWidth={1} strokeDasharray="3 6" />
            <circle cx={CX} cy={CY} r={80} fill="url(#loop-halo)" />

            {/* Spokes */}
            {NODES.map((n) => {
              const a = (n.angle * Math.PI) / 180;
              const x = CX + Math.cos(a) * RADIUS;
              const y = CY + Math.sin(a) * RADIUS;
              return (
                <line
                  key={`spoke-${n.id}`}
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke="url(#loop-arc)"
                  strokeWidth={1.5}
                  strokeDasharray="4 5"
                  opacity={0.7}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="9"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </line>
              );
            })}
          </svg>

          {/* The Figma center node */}
          <div
            className="absolute"
            style={{
              left: CX,
              top: CY,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-white shadow-2xl backdrop-blur"
              style={{
                background: 'linear-gradient(135deg, rgba(162,89,255,0.25), rgba(108,60,224,0.15))',
                borderColor: 'rgba(162,89,255,0.55)',
                boxShadow: '0 0 60px rgba(162,89,255,0.35)',
              }}
            >
              <FigmaGlyph size={18} />
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                  Source of truth
                </div>
                <div className="text-base font-bold">Figma + Figma MCP</div>
                <div className="text-[10px] text-white/55">design system · tokens · components</div>
              </div>
            </div>
          </div>

          {/* The 6 spoke nodes */}
          {NODES.map((n) => {
            const a = (n.angle * Math.PI) / 180;
            const x = CX + Math.cos(a) * RADIUS;
            const y = CY + Math.sin(a) * RADIUS;
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 backdrop-blur"
                  style={{
                    background: 'rgba(20, 17, 42, 0.85)',
                    borderColor: `${n.color}55`,
                    boxShadow: `0 6px 20px ${n.color}22`,
                  }}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ background: `${n.color}22`, color: n.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="text-[12px] font-semibold text-white">
                      {n.label}
                      {n.starred && (
                        <span
                          className="ml-1.5 rounded-full px-1.5 py-[1px] text-[7.5px] font-mono uppercase tracking-wider"
                          style={{ background: `${n.color}25`, color: n.color }}
                        >
                          ↻ in the loop
                        </span>
                      )}
                    </div>
                    <div className="text-[9.5px] text-white/55">{n.sub}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Caption */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-[10px]"
            style={{
              background: 'rgba(20,17,42,0.8)',
              borderColor: 'rgba(162,89,255,0.3)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Figma is the spec. The MCP is the wire. The agent is the implementer.
          </div>
        </div>

        {/* Narrative */}
        <div className="flex flex-col gap-4">
          <Card
            color="#A259FF"
            label="Designers + Figma sales"
            title="Pulled into more deals, not fewer."
            body="Cursor surfaces your Figma file as the contract for everything the AI agent ships. That makes design teams the ones who decide what gets built. POCs that include design close faster — every time."
          />
          <Card
            color="#60A5FA"
            label="Cursor sellers"
            title="A reason to talk to design, day one."
            body="Adding Figma MCP to your evaluation expands the conversation from one engineering champion to design + PM + eng. That broader sponsorship is what unlocks enterprise-wide adoption — POCs to org-wide rollouts."
          />
          <Card
            color="#16A34A"
            label="The customer"
            title="Cycles compress. Drift goes to zero."
            body="What designers approve in Figma is what ships to production. No translation layer. No 'this isn't what I designed.' Design-to-prod time drops by 78% in the workflows we've measured."
          />

          <button
            type="button"
            onClick={onAdvance}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
            style={{ background: '#A259FF', color: '#0F0A1F' }}
          >
            Read the verdict — and the seller plays
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </FigmaActShell>
  );
}

function Card({
  color,
  label,
  title,
  body,
}: {
  color: string;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-xl border-l-4 p-4"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeftColor: color,
        borderLeftWidth: 3,
      }}
    >
      <div
        className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{ color }}
      >
        {label}
      </div>
      <div className="text-[14px] font-semibold text-white">{title}</div>
      <p className="mt-1 text-[12px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
