'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  History,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ActHeader, ChapterStage } from '../chapter-stage';
import {
  ACTS,
  PRINCIPAL_COLOR,
  SUBAGENT_COLOR,
  SKILL_COLOR,
  type ActComponentProps,
} from '../story-types';
import { ContextRing } from '../context-ring';

const ACT = ACTS[2];

// --- Streaming script for the two parallel subagents ----------------------

interface StreamLine {
  text: string;
  /** ms after start at which this line appears */
  at: number;
  kind?: 'log' | 'tool' | 'note';
}

const EXPLORER_LINES: StreamLine[] = [
  { at: 200, text: '> /code-explorer map area: payments-service', kind: 'tool' },
  { at: 600, text: 'launching subagent · model: composer-2 · readonly', kind: 'log' },
  { at: 1100, text: 'parallel grep: stripe, webhook, idempotency, retry', kind: 'log' },
  { at: 1700, text: 'matched 47 files · reading 12 of them', kind: 'log' },
  { at: 2400, text: 'detected: Next 16, Drizzle, Stripe SDK 19, BullMQ 5', kind: 'note' },
  { at: 3100, text: 'inferring conventions from app router structure', kind: 'log' },
  { at: 3800, text: 'compressing into 4-section summary…', kind: 'log' },
  { at: 4500, text: 'returning 412 tokens to principal', kind: 'log' },
];

const RECALL_LINES: StreamLine[] = [
  { at: 200, text: '> /vault-reader pull notes for: stripe webhook retry idempotency', kind: 'tool' },
  { at: 600, text: 'launching subagent · model: composer-2 · readonly', kind: 'log' },
  { at: 1100, text: 'scanning 134 notes in ~/team-vault/', kind: 'log' },
  { at: 1700, text: 'frontmatter match · 7 candidates', kind: 'log' },
  { at: 2400, text: 'top hit: 2026-04-12-stripe-webhook-retry-strategy.md', kind: 'note' },
  { at: 3100, text: 'reading 5 notes in parallel · ranking by recency + tag', kind: 'log' },
  { at: 3800, text: 'compressing into 4-section digest…', kind: 'log' },
  { at: 4500, text: 'returning 318 tokens to principal', kind: 'log' },
];

const TOTAL_DURATION = 5200;
const BUDGET = 200_000; // 200K context window

// Composer 2 input price per Cursor docs: $0.50 / 1M tokens
const COMPOSER_INPUT_PER_TOKEN = 0.5 / 1_000_000;
// Composer 2 output price: $2.50 / 1M tokens
const COMPOSER_OUTPUT_PER_TOKEN = 2.5 / 1_000_000;
// Opus 4.7 input price: $5 / 1M
const OPUS_INPUT_PER_TOKEN = 5 / 1_000_000;

const SUMMARY_TOKENS = 412 + 318; // what the principal actually sees: the two compressed payloads

// Subagent internal token usage (their context, not the principal's)
const EXPLORER_INTERNAL_TOKENS = 8400;
const RECALL_INTERNAL_TOKENS = 3200;

export function Act03Orient({ onAdvance }: ActComponentProps) {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const e = Math.min(TOTAL_DURATION, now - startRef.current);
      setElapsed(e);
      if (e >= TOTAL_DURATION) {
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const principalPercent = useMemo(() => {
    if (!done) return 0.05;
    return (SUMMARY_TOKENS / BUDGET) * 100;
  }, [done]);

  const principalTokenSpend = SUMMARY_TOKENS * OPUS_INPUT_PER_TOKEN;
  const explorerCost =
    EXPLORER_INTERNAL_TOKENS * COMPOSER_INPUT_PER_TOKEN + 412 * COMPOSER_OUTPUT_PER_TOKEN;
  const recallCost =
    RECALL_INTERNAL_TOKENS * COMPOSER_INPUT_PER_TOKEN + 318 * COMPOSER_OUTPUT_PER_TOKEN;
  const totalCost = principalTokenSpend + explorerCost + recallCost;

  return (
    <ChapterStage act={ACT}>
      <ActHeader
        number={ACT.number}
        title="Two skills fire. Two cheap subagents do the reading. The principal stays small."
        kicker="Boot with skills"
        moodColor={ACT.moodColor}
      />
      <p className="px-6 max-w-3xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-8">
        The same engineer fires the same agent at the same repo. This time, the session opens with two skills running in parallel. Each delegates to a Composer 2 subagent that has its own context window. Only the structured summaries make it back.
      </p>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        {/* The principal "console" */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm overflow-hidden mb-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-3 text-[11px] font-mono text-text-tertiary">
                Cursor · Opus 4.7 · skills loaded · payments-service
              </span>
            </div>
            <span
              className="text-[10.5px] font-mono"
              style={{ color: PRINCIPAL_COLOR }}
            >
              principal
            </span>
          </div>
          <div className="px-4 py-3 font-mono text-[12.5px]">
            <p className="text-text-secondary">
              <span className="text-[#7DD3F5]">$</span> agent &gt; user prompt: <span className="text-text-primary">&quot;Patch the Stripe webhook retry bug.&quot;</span>
            </p>
            <p className="text-text-tertiary mt-1.5">
              agent &gt; <span style={{ color: SKILL_COLOR }}>orient</span> auto-invoked · <span style={{ color: SKILL_COLOR }}>recall</span> auto-invoked · launching in parallel
            </p>
          </div>
        </div>

        {/* Two streaming panels side by side */}
        <div className="grid lg:grid-cols-2 gap-5 mb-8">
          <SubagentPanel
            kind="explorer"
            title="code-explorer"
            slash="/orient · code-explorer"
            icon={Compass}
            elapsed={elapsed}
            lines={EXPLORER_LINES}
            done={done}
          >
            {done && <CodebaseMapCard />}
          </SubagentPanel>

          <SubagentPanel
            kind="recall"
            title="vault-reader"
            slash="/recall · vault-reader"
            icon={History}
            elapsed={elapsed}
            lines={RECALL_LINES}
            done={done}
          >
            {done && <RecallDigestCard />}
          </SubagentPanel>
        </div>

        {/* Outcome strip: rings + cost comparison */}
        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm p-6 flex flex-col items-center text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <ContextRing
              percent={done ? principalPercent : 0.04}
              color={PRINCIPAL_COLOR}
              label="Principal context"
              sublabel={done ? `${SUMMARY_TOKENS} tokens of summaries` : 'subagents working…'}
              size={200}
              animate
            />
            <p className="mt-4 text-[12px] text-text-secondary">
              The two summaries are all the principal sees.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat
              label="Principal tokens"
              value={SUMMARY_TOKENS.toLocaleString()}
              accent={PRINCIPAL_COLOR}
              hint="vs 28,471 in the cold start"
            />
            <Stat
              label="Subagent tokens"
              value={(EXPLORER_INTERNAL_TOKENS + RECALL_INTERNAL_TOKENS).toLocaleString()}
              accent={SUBAGENT_COLOR}
              hint="isolated context · doesn't bloat principal"
            />
            <Stat
              label="Total spend"
              value={`$${totalCost.toFixed(2)}`}
              accent="#4ADE80"
              hint="vs $3.12 in the cold start"
            />
            <Stat
              label="Time to ready"
              value={done ? '5.2s' : '…'}
              accent={SUBAGENT_COLOR}
              hint="parallel · cheaper model"
            />
            <Stat
              label="Files read by principal"
              value="0"
              accent={PRINCIPAL_COLOR}
              hint="all reads moved to the subagents"
            />
            <Stat
              label="Context window saved"
              value={done ? '99.6%' : '…'}
              accent="#4ADE80"
              hint="for the actual work ahead"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onAdvance}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#A78BFA] text-[#0F0A24] font-semibold text-sm hover:bg-[#C7B5FF] transition-colors shadow-[0_0_24px_rgba(167,139,250,0.45)] cursor-pointer"
          >
            See where the lessons live
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </ChapterStage>
  );
}

function SubagentPanel({
  title,
  slash,
  icon: Icon,
  elapsed,
  lines,
  done,
  children,
}: {
  kind: 'explorer' | 'recall';
  title: string;
  slash: string;
  icon: React.ComponentType<{ className?: string }>;
  elapsed: number;
  lines: StreamLine[];
  done: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              backgroundColor: `${SUBAGENT_COLOR}14`,
              border: `1px solid ${SUBAGENT_COLOR}55`,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-[0.22em]"
              style={{ color: SUBAGENT_COLOR }}
            >
              Subagent · composer-2
            </p>
            <p className="text-[12.5px] font-mono text-text-primary">{title}</p>
          </div>
        </div>
        <span className="text-[10.5px] font-mono text-text-tertiary">{slash}</span>
      </div>
      <div className="px-4 py-3 font-mono text-[12px] text-text-secondary min-h-[260px]">
        <ul className="space-y-1.5">
          {lines.map((line, i) => {
            const visible = elapsed >= line.at;
            const color =
              line.kind === 'note'
                ? PRINCIPAL_COLOR
                : line.kind === 'tool'
                  ? SUBAGENT_COLOR
                  : 'rgba(237,236,236,0.7)';
            return (
              <li
                key={i}
                className="flex items-start gap-2 transition-all"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(2px)',
                  transitionDuration: '320ms',
                  transitionTimingFunction: 'ease-out',
                }}
              >
                <span className="text-text-tertiary shrink-0 select-none">›</span>
                <span style={{ color }}>{line.text}</span>
              </li>
            );
          })}
          {!done && (
            <li className="flex items-center gap-2 text-text-tertiary mt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: SUBAGENT_COLOR }} />
              <span>working in isolated context…</span>
            </li>
          )}
          {done && (
            <li className="flex items-center gap-2 text-[#4ADE80] mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>summary returned to principal</span>
            </li>
          )}
        </ul>
      </div>
      {children && (
        <div className="border-t border-white/8 bg-white/[0.02] p-4">{children}</div>
      )}
    </div>
  );
}

function CodebaseMapCard() {
  return (
    <div
      className="rounded-xl p-4 text-[12px] leading-relaxed"
      style={{
        backgroundColor: `${PRINCIPAL_COLOR}08`,
        border: `1px solid ${PRINCIPAL_COLOR}33`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-3.5 h-3.5" style={{ color: PRINCIPAL_COLOR }} />
        <p
          className="text-[10px] font-mono uppercase tracking-[0.22em]"
          style={{ color: PRINCIPAL_COLOR }}
        >
          Returned to principal · 412 tokens
        </p>
      </div>
      <div className="space-y-2.5 text-text-secondary">
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Summary</p>
          <p>
            Stripe webhook handler in `src/api/billing/webhook.ts` writes events to a
            `webhook_events` idempotency table before processing. Retries are handled by
            BullMQ with exponential backoff.
          </p>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Key files</p>
          <p className="font-mono text-[11.5px]">
            src/api/billing/webhook.ts, src/lib/stripe/idempotency.ts, db/migrations/0042_webhook_events.sql
          </p>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Conventions detected</p>
          <p>Next 16 app router · Drizzle ORM · BullMQ retries · Sentry breadcrumbs</p>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Open questions</p>
          <p>Is the retry-bug an idempotency miss or a backoff misconfig? Ask before editing.</p>
        </div>
      </div>
    </div>
  );
}

function RecallDigestCard() {
  return (
    <div
      className="rounded-xl p-4 text-[12px] leading-relaxed"
      style={{
        backgroundColor: `${VAULT_COLOR_LITE}`,
        border: `1px solid ${VAULT_COLOR_BORDER}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Zap className="w-3.5 h-3.5" style={{ color: '#C7B5FF' }} />
        <p
          className="text-[10px] font-mono uppercase tracking-[0.22em]"
          style={{ color: '#C7B5FF' }}
        >
          Returned to principal · 318 tokens
        </p>
      </div>
      <div className="space-y-2.5 text-text-secondary">
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Recent work</p>
          <p>
            <span className="font-mono text-[11.5px]">2026-04-12</span> · priya.k shipped
            exponential backoff with jitter and an idempotency table for the same handler.
          </p>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Learned the hard way</p>
          <p>
            Stripe re-sends every webhook for up to 72h. Keying idempotency on event.id
            (not payment_intent.id) is the only safe pattern.
          </p>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Do not do this</p>
          <p>
            Do not key idempotency on payment_intent.id. Multiple events share a payment
            intent.
          </p>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-0.5">## Open follow-ups</p>
          <p>Backfill `webhook_events` for the 14-day gap between deploy and migration.</p>
        </div>
      </div>
    </div>
  );
}

const VAULT_COLOR_LITE = 'rgba(167,139,250,0.06)';
const VAULT_COLOR_BORDER = 'rgba(167,139,250,0.30)';

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
        className="text-xl font-semibold tabular-nums leading-none"
        style={{ color: accent }}
      >
        {value}
      </p>
      {hint && (
        <p className="text-[10.5px] text-text-tertiary mt-1.5 leading-tight">{hint}</p>
      )}
    </div>
  );
}
