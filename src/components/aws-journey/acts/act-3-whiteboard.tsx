'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ActShell, ActHeader } from './act-shell';
import { OverrideCard } from '../override-card';
import { CalendarWidget } from '../time/calendar-widget';
import { CursorLogo } from '../cursor-logo';
import { StoryBeat } from '../story-beat';

interface Act3Props {
  onAdvance: () => void;
}

type Phase = 'loading' | 'plan-shown' | 'override' | 'absorbed' | 'park-approves';

export function Act3Whiteboard({ onAdvance }: Act3Props) {
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('plan-shown'), 400);
    return () => clearTimeout(t1);
  }, []);

  const postForReview = () => {
    if (phase !== 'plan-shown') return;
    setPhase('override');
    setTimeout(() => setPhase('absorbed'), 1600);
    // Park reads the updated plan, then signs off.
    setTimeout(() => setPhase('park-approves'), 3800);
  };

  const aiReplyVisible = phase === 'absorbed' || phase === 'park-approves';
  const overrideVisible = phase === 'override' || phase === 'absorbed' || phase === 'park-approves';
  const parkApproveVisible = phase === 'park-approves';
  const stickyMorphed = phase === 'absorbed' || phase === 'park-approves';

  return (
    <ActShell
      act={3}
      topRight={
        <CalendarWidget
          currentDay={1}
          targetDay={3}
          contextLabel="Architecture"
          accent="#FF9900"
          darkMode={false}
        />
      }
    >
      <ActHeader
        act={3}
        eyebrow="Cursor agents took the findings from the previous step and drafted a target AWS architecture in 45 minutes. Click 'Post for review' to send it to the architect — and watch the agents instantly adapt the plan to accommodate her feedback."
      />

      <StoryBeat
        tone="light"
        agent="cloud"
        title="One sketch. One Slack thread. The plan rewrites itself."
        body={<>The agent absorbs a senior architect&rsquo;s pushback, re-grounded in a real 2023 post-mortem — no rework cycle.</>}
        oldWay="5 days of whiteboard sessions"
        newWay="45-min draft, 6-min rewrite"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Whiteboard surface */}
        <div
          className="relative overflow-hidden rounded-xl border shadow-inner"
          style={{
            minHeight: 460,
            background: `
              repeating-linear-gradient(0deg, rgba(17,24,39,0.05) 0 1px, transparent 1px 28px),
              repeating-linear-gradient(90deg, rgba(17,24,39,0.05) 0 1px, transparent 1px 28px),
              #FAF8F3
            `,
            borderColor: 'rgba(17, 24, 39, 0.12)',
          }}
        >
          {/* Drafting byline — pinned on the whiteboard */}
          <div
            className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-md border bg-white/90 px-2.5 py-1.5 shadow-sm"
            style={{ borderColor: 'rgba(17,24,39,0.1)' }}
          >
            <CursorLogo size={14} tone="light" />
            <span className="text-[11px] font-semibold text-[#14120B]">
              Drafted by <span style={{ color: '#B45309' }}>Cursor Agents</span>
            </span>
            <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-800">
              45 min
            </span>
          </div>
          <ArchitectureSvg morphed={stickyMorphed} />
          <StickyNotes morphed={stickyMorphed} />
        </div>

        {/* Right column: conversation */}
        <div className="flex flex-col gap-3">
          <div
            className="rounded-xl border bg-white p-3"
            style={{ borderColor: 'rgba(17,24,39,0.1)' }}
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#6B7280' }}>
              #orders-modernization · Slack
            </div>
            <div className="flex items-start gap-2 text-[12.5px]" style={{ color: '#1F2937' }}>
              <CursorLogo size={16} tone="light" className="mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Cursor Cloud Agent</span>
                <span className="ml-1 font-mono text-[10px] opacity-60">10:42 AM</span>
                <p className="text-[12.5px] leading-snug">Posted target architecture in Slack and @-mentioned J. Park for review.</p>
              </div>
            </div>
            {phase === 'plan-shown' && (
              <button
                type="button"
                onClick={postForReview}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background: '#2563EB', color: 'white' }}
              >
                Post for review →
              </button>
            )}
          </div>

          {/* J. Park override */}
          <OverrideCard
            speaker="park"
            tone="override"
            visible={overrideVisible}
          >
            <p className="text-[12.5px] leading-snug">
              Push back on the <strong>7-day dual-write</strong>. We rolled back InventoryService in 2023 because a
              monthly batch job didn&rsquo;t surface until day 9. Make it <strong>14 days minimum</strong>, plus a
              parity-diff that fails the cutover if drift &gt; 0.01%.
            </p>
          </OverrideCard>

          {/* AI reply */}
          <OverrideCard
            speaker="cursor"
            tone="ai"
            visible={aiReplyVisible}
            delayMs={200}
          >
            <div className="space-y-1.5">
              <p className="text-[12.5px] leading-snug">
                <span className="font-semibold">Plan updated.</span> Dual-write extended to 14 days, parity-diff
                Lambda added (fail-closed @ 0.01% drift).
              </p>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10.5px] text-slate-700">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <CheckCircle2 className="h-3 w-3" /> Grounded in
                </span>{' '}
                <code className="font-mono text-[10.5px]">acme/inventory-postmortem-2023-09</code>
              </div>
            </div>
          </OverrideCard>

          {/* J. Park's sign-off — unblocks the gate button */}
          <OverrideCard
            speaker="park"
            tone="approve"
            visible={parkApproveVisible}
            delayMs={200}
          >
            <p className="text-[12.5px] leading-snug">
              <span className="font-semibold">That&rsquo;s the change I wanted.</span> 14-day window plus the
              parity-diff covers the batch-job edge case from 2023. <strong>Architecture approved</strong> — go ahead
              and start the build.
            </p>
          </OverrideCard>

          <button
            type="button"
            onClick={onAdvance}
            disabled={!parkApproveVisible}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: '#FF9900', color: '#111827' }}
          >
            <ShieldCheck className="h-4 w-4" />
            Approve architecture (gate 1/4)
            <span>→</span>
          </button>
        </div>
      </div>
    </ActShell>
  );
}

function ArchitectureSvg({ morphed }: { morphed: boolean }) {
  return (
    <svg viewBox="0 0 820 520" className="absolute inset-0 h-full w-full p-6">
      <defs>
        <marker id="wb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
        </marker>
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="2" />
          <feDisplacementMap in="SourceGraphic" scale="1.5" />
        </filter>
      </defs>

      {/* Boxes */}
      <Box x={20} y={200} w={140} h={80} label="Legacy WebSphere" sub="OrdersService.ejb" fill="#FFF4DB" border="#E0B453" />

      <Box x={220} y={40}  w={180} h={64} label="API Gateway" sub="(private)" fill="#E8F4FF" border="#2563EB" />

      <Box x={220} y={150} w={180} h={220} label="AWS Lambda handlers" sub="6 functions" fill="#FFF2DA" border="#FF9900" double>
        <text x="310" y="196" textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="#1F2937">createOrder</text>
        <text x="310" y="212" textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="#1F2937">getOrder · listOrders</text>
        <text x="310" y="228" textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="#1F2937">updateStatus</text>
        <text x="310" y="244" textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="#1F2937">cancelOrder · reconcile</text>
        <text x="310" y="272" textAnchor="middle" fontSize="9" fontFamily="ui-monospace" fill="rgba(17,24,39,0.6)">Secrets Manager · VPC endpoints</text>
        <text x="310" y="288" textAnchor="middle" fontSize="9" fontFamily="ui-monospace" fill="rgba(17,24,39,0.6)">S3 · CloudWatch Logs</text>
      </Box>

      <Box x={220} y={410} w={180} h={80} label="Aurora Serverless v2" sub="orders-prod (Postgres)" fill="#E6FCF5" border="#16A34A" />

      <Box x={580} y={280} w={200} h={90} label="Dual-write bridge" sub={morphed ? '14-day window' : '7-day window'} fill="#FEF3C7" border="#F59E0B" />

      {/* Arrows */}
      <Arrow d="M 310 104 L 310 150" />
      <Arrow d="M 310 370 L 310 410" />
      <Arrow d="M 400 260 C 480 260, 530 300, 580 320" />
      <Arrow d="M 680 370 C 660 430, 380 460, 160 270" dashed />
      <Arrow d="M 160 260 C 180 300, 220 260, 220 210" dashed />

      {/* Bridge back to legacy */}
      <text x="690" y="410" textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="rgba(17,24,39,0.55)">
        {morphed ? 'parity-diff every 15min' : 'nightly reconcile'}
      </text>
    </svg>
  );
}

function Box({
  x, y, w, h, label, sub, fill, border, double, children,
}: {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string;
  fill: string; border: string; double?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <g>
      {double && (
        <rect
          x={x + 3}
          y={y + 3}
          width={w}
          height={h}
          rx="10"
          fill="none"
          stroke={border}
          strokeWidth="1.5"
          opacity="0.35"
        />
      )}
      <rect x={x} y={y} width={w} height={h} rx="10" fill={fill} stroke={border} strokeWidth="1.8" />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize="13" fontWeight={700} fill="#111827" fontFamily="Inter, system-ui">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize="10" fill="rgba(17,24,39,0.6)" fontFamily="ui-monospace">
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

function Arrow({ d, dashed }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#111827"
      strokeWidth={1.4}
      opacity={0.7}
      strokeDasharray={dashed ? '6 5' : undefined}
      markerEnd="url(#wb-arrow)"
    />
  );
}

function StickyNotes({ morphed }: { morphed: boolean }) {
  return (
    <>
      {/* Sticky 1 — orange, strangler fig */}
      <div
        className="absolute"
        style={{ top: 20, right: 28, width: 220, transform: 'rotate(3deg)' }}
      >
        <StickyNote color="#FFB95E" shadowColor="rgba(229, 83, 0, 0.15)">
          <div className="font-semibold">Strangler fig pattern.</div>
          <p className="mt-1 text-[12px] leading-snug" style={{ color: '#4B1E00' }}>
            Route via API Gateway. Dual-write for{' '}
            {morphed ? (
              <>
                <s className="opacity-50">7 days</s>{' '}
                <span className="font-bold" style={{ color: '#B91C1C' }}>
                  14 days
                </span>
              </>
            ) : (
              <span className="font-bold">7 days</span>
            )}
            . Monolith keeps serving reads until parity verified.
          </p>
        </StickyNote>
      </div>

      {/* Sticky 2 — blue, SLOs */}
      <div
        className="absolute"
        style={{ bottom: 100, right: 40, width: 210, transform: 'rotate(-2.5deg)' }}
      >
        <StickyNote color="#BFDBFE" shadowColor="rgba(37, 99, 235, 0.15)">
          <div className="font-semibold" style={{ color: '#1E3A8A' }}>SLOs</div>
          <p className="mt-1 text-[12px] leading-snug" style={{ color: '#1E3A8A' }}>
            Target p99 &lt; <span className="font-bold">400ms</span> (monolith p99: 1,240ms).
            <br />
            Target cost: <span className="font-bold">$527/mo</span> (was $70k/mo).
          </p>
        </StickyNote>
      </div>

      {/* Sticky 3 — yellow, parity-diff (appears after override) */}
      <div
        className="absolute transition-all duration-700"
        style={{
          bottom: 24,
          left: 28,
          width: 210,
          transform: `rotate(-4deg) scale(${morphed ? 1 : 0.8})`,
          opacity: morphed ? 1 : 0,
        }}
      >
        <StickyNote color="#FDE68A" shadowColor="rgba(234, 179, 8, 0.15)">
          <div className="font-semibold" style={{ color: '#78350F' }}>NEW · Parity-diff Lambda</div>
          <p className="mt-1 text-[12px] leading-snug" style={{ color: '#78350F' }}>
            Every 15min · fail-closed @ drift &gt; <span className="font-bold">0.01%</span>.
            <br />
            Referenced: InventoryService 2023 post-mortem.
          </p>
        </StickyNote>
      </div>
    </>
  );
}

function StickyNote({
  children,
  color,
  shadowColor,
}: {
  children: React.ReactNode;
  color: string;
  shadowColor: string;
}) {
  return (
    <div
      className="rounded-sm p-3 text-[13px]"
      style={{
        background: color,
        color: '#4B1E00',
        fontStyle: 'italic',
        letterSpacing: '0.02em',
        boxShadow: `0 8px 18px -6px ${shadowColor}, 0 1px 2px rgba(0,0,0,0.05)`,
      }}
    >
      {children}
    </div>
  );
}
