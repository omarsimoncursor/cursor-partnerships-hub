'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileCode2, Folder, Loader2, AlertTriangle } from 'lucide-react';
import { ActHeader, ChapterStage } from '../chapter-stage';
import { ACTS, PRINCIPAL_COLOR, type ActComponentProps } from '../story-types';
import { ContextRing } from '../context-ring';

const ACT = ACTS[0];

interface FileEvent {
  path: string;
  tokens: number;
  reason: string;
}

const FILE_TIMELINE: FileEvent[] = [
  { path: 'src/app/layout.tsx', tokens: 412, reason: 'find the root provider' },
  { path: 'src/app/page.tsx', tokens: 287, reason: 'understand the landing page' },
  { path: 'src/lib/db/client.ts', tokens: 624, reason: 'figure out the ORM' },
  { path: 'src/lib/db/schema.ts', tokens: 1872, reason: 'read every table definition' },
  { path: 'src/lib/auth/session.ts', tokens: 768, reason: 'find the session cookie name' },
  { path: 'src/lib/auth/middleware.ts', tokens: 1102, reason: 'trace request authorization' },
  { path: 'src/api/billing/stripe.ts', tokens: 1421, reason: 'see how Stripe is wired' },
  { path: 'src/api/billing/webhook.ts', tokens: 982, reason: 'understand the webhook handler' },
  { path: 'src/lib/queue/worker.ts', tokens: 1166, reason: 'is BullMQ used here?' },
  { path: 'src/lib/queue/jobs/email.ts', tokens: 412, reason: 'see job shape' },
  { path: 'src/components/dashboard/orders.tsx', tokens: 884, reason: 'how is data fetched' },
  { path: 'src/components/dashboard/order-row.tsx', tokens: 312, reason: 'cell formatting' },
  { path: 'src/lib/feature-flags.ts', tokens: 246, reason: 'is LaunchDarkly used here?' },
  { path: 'src/lib/observability/sentry.ts', tokens: 318, reason: 'find error reporting' },
  { path: 'src/lib/email/transactional.ts', tokens: 612, reason: 'how do we send email' },
  { path: 'src/lib/cache/redis.ts', tokens: 488, reason: 'is Redis the cache' },
  { path: 'src/lib/cache/keys.ts', tokens: 312, reason: 'check the key namespacing' },
  { path: 'src/api/products/route.ts', tokens: 642, reason: 'public API shape' },
  { path: 'src/api/products/[id]/route.ts', tokens: 528, reason: 'detail route' },
  { path: 'src/api/orders/route.ts', tokens: 711, reason: 'order create flow' },
  { path: 'src/lib/payments/refund.ts', tokens: 904, reason: 'partial refund logic' },
  { path: 'src/lib/payments/charge.ts', tokens: 1240, reason: 'how charges are split' },
  { path: 'src/lib/inventory/reserve.ts', tokens: 786, reason: 'locking model' },
  { path: 'src/lib/inventory/release.ts', tokens: 322, reason: 'release path' },
  { path: 'src/lib/shipping/labels.ts', tokens: 612, reason: 'shipping integration' },
  { path: 'src/lib/shipping/rate.ts', tokens: 421, reason: 'rate-shopping behavior' },
  { path: 'src/lib/notifications/dispatch.ts', tokens: 552, reason: 'how alerts fire' },
  { path: 'src/lib/notifications/templates.ts', tokens: 832, reason: 'email templates' },
  { path: 'src/lib/orgs/permissions.ts', tokens: 1006, reason: 'multi-tenant rules' },
  { path: 'src/lib/orgs/membership.ts', tokens: 564, reason: 'org membership' },
  { path: 'src/api/admin/route.ts', tokens: 412, reason: 'admin API surface' },
  { path: 'src/lib/jobs/scheduler.ts', tokens: 686, reason: 'cron jobs' },
  { path: 'src/lib/jobs/retry.ts', tokens: 312, reason: 'retry policy' },
  { path: 'src/lib/utils/dates.ts', tokens: 188, reason: 'date helpers' },
  { path: 'src/lib/utils/money.ts', tokens: 244, reason: 'money helpers' },
  { path: 'src/components/billing/invoice-row.tsx', tokens: 416, reason: 'invoice presentation' },
  { path: 'src/components/billing/upgrade-modal.tsx', tokens: 712, reason: 'upgrade flow' },
  { path: 'src/lib/analytics/track.ts', tokens: 322, reason: 'event names' },
  { path: 'src/lib/feature-flags/launchdarkly.ts', tokens: 412, reason: 'LD client setup' },
  { path: 'src/api/auth/login/route.ts', tokens: 612, reason: 'login flow' },
  { path: 'src/api/auth/refresh/route.ts', tokens: 444, reason: 'token refresh' },
  { path: 'src/lib/storage/s3.ts', tokens: 388, reason: 'asset storage' },
  { path: 'src/lib/storage/presign.ts', tokens: 286, reason: 'presigned URLs' },
  { path: 'src/lib/integrations/slack.ts', tokens: 482, reason: 'Slack notifications' },
  { path: 'src/lib/integrations/intercom.ts', tokens: 326, reason: 'support webhooks' },
  { path: 'src/lib/db/migrations.ts', tokens: 642, reason: 'how migrations run' },
  { path: 'src/lib/db/connection-pool.ts', tokens: 386, reason: 'pool sizing' },
];

// Opus 4.7 input price per Cursor docs: $5 / 1M tokens
const OPUS_INPUT_PER_TOKEN = 5 / 1_000_000;
// 200K context window
const CONTEXT_WINDOW = 200_000;
// Per-step interval (ms)
const TICK_MS = 220;

export function Act01ColdStart({ onAdvance }: ActComponentProps) {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(true);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
      if (tickRef.current >= FILE_TIMELINE.length) {
        setRunning(false);
        window.clearInterval(id);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const visited = FILE_TIMELINE.slice(0, tick);
  const tokensUsed = useMemo(
    () => visited.reduce((sum, f) => sum + f.tokens, 0),
    [visited]
  );
  const percent = Math.min(99, (tokensUsed / CONTEXT_WINDOW) * 100);
  const dollars = tokensUsed * OPUS_INPUT_PER_TOKEN;

  return (
    <ChapterStage act={ACT}>
      <ActHeader
        number={ACT.number}
        title="Every new agent starts from zero. The bill starts immediately."
        kicker="The cold start"
        moodColor={ACT.moodColor}
      />
      <p className="px-6 max-w-3xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-8">
        A staff engineer fires up an Opus 4.7 agent on a service her team has shipped to for two years. The agent has never seen this repo. Before it can answer a single question, it has to walk the tree, open files at random, and try to infer what is important. Watch the context window fill, and the meter run.
      </p>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6">
          {/* Console / file feed */}
          <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/80 backdrop-blur-sm overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[11px] font-mono text-text-tertiary">
                  Cursor · Opus 4.7 high thinking · cold start
                </span>
              </div>
              <span className="text-[10.5px] font-mono text-text-tertiary">
                src/payments-service
              </span>
            </div>
            <div className="px-4 py-4 font-mono text-[12.5px] text-text-secondary h-[420px] overflow-y-auto">
              <p className="text-text-tertiary">
                <span className="text-[#7DD3F5]">$</span> agent &gt; user prompt: <span className="text-text-primary">&quot;Patch the Stripe webhook retry bug.&quot;</span>
              </p>
              <p className="text-text-tertiary mt-1.5">
                agent &gt; <span className="text-[#FBBF24]">no skills loaded · no rules in this repo · no prior context</span>
              </p>
              <p className="text-text-tertiary mt-1.5 mb-3">
                agent &gt; running ls -R, then opening files to orient.
              </p>
              <ul className="space-y-1.5">
                {visited.map((f, i) => (
                  <li
                    key={`${f.path}-${i}`}
                    className="flex items-start gap-2"
                    style={{
                      animation: 'coldStartFade 320ms ease-out both',
                    }}
                  >
                    <FileCode2
                      className="w-3.5 h-3.5 shrink-0 mt-0.5"
                      style={{ color: PRINCIPAL_COLOR }}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="text-text-primary">{f.path}</span>
                      <span className="text-text-tertiary"> · {f.reason}</span>
                    </span>
                    <span className="text-[10.5px] text-text-tertiary shrink-0 tabular-nums">
                      +{f.tokens.toLocaleString()}t
                    </span>
                  </li>
                ))}
                {running && (
                  <li className="flex items-center gap-2 text-text-tertiary">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: PRINCIPAL_COLOR }} />
                    <span>reading next file…</span>
                  </li>
                )}
                {!running && (
                  <li className="flex items-start gap-2 text-[#F87171] mt-3">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Context window at {percent.toFixed(1)}% before the user&apos;s first follow-up. Four of these files were already refactored last sprint. The agent doesn&apos;t know.
                    </span>
                  </li>
                )}
              </ul>
              <style jsx>{`
                @keyframes coldStartFade {
                  from { opacity: 0; transform: translateY(2px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          </div>

          {/* Stats panel */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/80 backdrop-blur-sm p-6 flex flex-col items-center text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <ContextRing
                percent={percent}
                color={PRINCIPAL_COLOR}
                label="Context window"
                sublabel={`${tokensUsed.toLocaleString()} of ${CONTEXT_WINDOW.toLocaleString()} tokens`}
                size={220}
                animate={false}
              />
              <p className="mt-5 text-sm text-text-secondary leading-relaxed max-w-xs">
                Opus 4.7 high thinking, with a 200K context window.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Files opened" value={visited.length.toString()} accent="#F87171" />
              <Stat
                label="Tokens consumed"
                value={tokensUsed.toLocaleString()}
                accent="#F87171"
              />
              <Stat
                label="Token spend"
                value={`$${dollars.toFixed(2)}`}
                accent="#F87171"
                hint="Opus 4.7 · $5 per 1M input"
              />
              <Stat label="Future agents helped" value="0" accent="#F87171" hint="Nothing was written down." />
            </div>

            <div className="rounded-2xl border border-[#F87171]/25 bg-[#F87171]/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4 text-[#F87171]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#F87171]">
                  What happened
                </span>
              </div>
              <p className="text-[13.5px] text-text-secondary leading-relaxed">
                The agent burned premium-model tokens to learn what every other agent on this repo has already learned twelve times. None of it is written back. The next teammate&apos;s agent will start from zero too.
              </p>
            </div>

            <button
              onClick={onAdvance}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#A78BFA] text-[#0F0A24] font-semibold text-sm hover:bg-[#C7B5FF] transition-colors shadow-[0_0_24px_rgba(167,139,250,0.45)] cursor-pointer"
            >
              See the pattern that fixes this
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </ChapterStage>
  );
}

function Stat({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#0B0A12]/60 backdrop-blur-sm p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1.5">
        {label}
      </p>
      <p
        className="text-xl font-semibold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </p>
      {hint && <p className="text-[10.5px] text-text-tertiary mt-1 leading-tight">{hint}</p>}
    </div>
  );
}
