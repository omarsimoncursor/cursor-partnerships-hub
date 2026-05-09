'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GitPullRequest,
  Loader2,
  Save,
  Sparkles,
  Library,
} from 'lucide-react';
import { ActHeader, ChapterStage } from '../chapter-stage';
import {
  ACTS,
  PRINCIPAL_COLOR,
  SUBAGENT_COLOR,
  VAULT_COLOR,
  VAULT_NOTES,
  type ActComponentProps,
} from '../story-types';

const ACT = ACTS[4];

const SESSION_TOKENS = 47_184;
const NOTE_TOKENS = 582;
const NEW_NOTE_FILENAME = '2026-05-09-stripe-webhook-retry-bug.md';

interface Phase {
  at: number;
  label: string;
}

const PHASES: Phase[] = [
  { at: 0, label: 'PR opened · /closeout auto-invoked' },
  { at: 800, label: 'launching historian subagent · model: composer-2' },
  { at: 1700, label: 'streaming 47,184 conversation tokens to historian' },
  { at: 3400, label: 'historian compressing into 5-section markdown note' },
  { at: 5000, label: 'writing ~/team-vault/2026-05-09-stripe-webhook-retry-bug.md' },
  { at: 6000, label: 'note committed · vault updated · session closed' },
];

const TOTAL = 6800;

export function Act05Closeout({ onAdvance }: ActComponentProps) {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (start.current === null) start.current = now;
      const e = Math.min(TOTAL, now - start.current);
      setElapsed(e);
      if (e >= TOTAL) {
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phase = [...PHASES].reverse().find((p) => elapsed >= p.at) ?? PHASES[0];
  const compressionProgress = Math.min(1, Math.max(0, (elapsed - 1700) / 3300));

  const totalNotesAfter = VAULT_NOTES.length + 1;

  return (
    <ChapterStage act={ACT}>
      <ActHeader
        number={ACT.number}
        title="Task complete is not session complete. Session complete is when the next agent can read what you learned."
        kicker="The closeout"
        moodColor={ACT.moodColor}
      />
      <p className="px-6 max-w-3xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed mb-8">
        The PR opens. The <code className="font-mono text-[#86EFAC] bg-[#4ADE80]/10 px-1.5 py-0.5 rounded">/closeout</code> skill fires. The <code className="font-mono text-[#7DD3F5] bg-[#7DD3F5]/10 px-1.5 py-0.5 rounded">historian</code> subagent compresses 47K tokens of conversation into a 580-token markdown note. The vault grows by one. Tomorrow morning, the next teammate&apos;s agent will read it.
      </p>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left: principal session */}
          <div className="rounded-2xl border border-white/10 bg-[#0B0A12]/85 backdrop-blur-sm overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[11px] font-mono text-text-tertiary">
                  Cursor · Opus 4.7 · session ending
                </span>
              </div>
              <span
                className="text-[10.5px] font-mono"
                style={{ color: PRINCIPAL_COLOR }}
              >
                principal · {SESSION_TOKENS.toLocaleString()} tokens
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 mb-5">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: '#4ADE8014',
                    border: '1px solid #4ADE8055',
                  }}
                >
                  <GitPullRequest className="w-4 h-4 text-[#4ADE80]" />
                </span>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#4ADE80] mb-0.5">
                    PR opened
                  </p>
                  <p className="text-[14px] text-text-primary font-semibold leading-tight">
                    payments-service · #847 · fix(stripe): use event.id for webhook idempotency
                  </p>
                  <p className="text-[12px] text-text-tertiary mt-0.5">
                    9 files changed · 142 additions · 18 deletions
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3 mb-5">
                <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1.5">
                  Conversation transcript
                </p>
                <div className="font-mono text-[11.5px] text-text-secondary space-y-1 max-h-44 overflow-hidden relative">
                  <p>· user: Patch the Stripe webhook retry bug.</p>
                  <p>· orient → returned 412t map of payments-service</p>
                  <p>· recall → returned 318t digest, flagged event.id pattern</p>
                  <p>· agent: read src/api/billing/webhook.ts · proposed patch</p>
                  <p>· user: looks good, also handle dispute.created</p>
                  <p>· agent: extended idempotency to dispute.* events</p>
                  <p>· agent: added integration test, ran suite, all green</p>
                  <p>· user: open the PR</p>
                  <p>· agent: opened #847, branch fix/webhook-event-id</p>
                  <p>... (47,184 tokens total)</p>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0B0A12] to-transparent" />
                </div>
              </div>

              <div className="rounded-xl border border-[#4ADE80]/30 bg-[#4ADE80]/6 p-3 flex items-start gap-3">
                <Save className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#4ADE80] mb-0.5">
                    /closeout · auto-invoked
                  </p>
                  <p className="text-[12.5px] text-text-secondary leading-snug">
                    The closure skill triggered on PR open. Delegating compression to the historian.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: compression flow + new note */}
          <div className="space-y-6">
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
                    <Sparkles className="w-3.5 h-3.5" style={{ color: SUBAGENT_COLOR }} />
                  </span>
                  <div>
                    <p
                      className="text-[10px] font-mono uppercase tracking-[0.22em]"
                      style={{ color: SUBAGENT_COLOR }}
                    >
                      Subagent · composer-2
                    </p>
                    <p className="text-[12.5px] font-mono text-text-primary">historian</p>
                  </div>
                </div>
                <span className="text-[10.5px] font-mono text-text-tertiary">
                  /closeout · historian
                </span>
              </div>

              <div className="p-5">
                <CompressionFlow progress={compressionProgress} />

                <ul className="mt-5 space-y-1.5 font-mono text-[12px]">
                  {PHASES.map((p, i) => {
                    const reached = elapsed >= p.at;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-2 transition-opacity duration-300"
                        style={{ opacity: reached ? 1 : 0.35 }}
                      >
                        {reached ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#4ADE80]" />
                        ) : (
                          <Loader2
                            className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-spin"
                            style={{ color: SUBAGENT_COLOR }}
                          />
                        )}
                        <span className="text-text-secondary">{p.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div
              className="rounded-2xl border bg-[#0B0A12]/85 backdrop-blur-sm overflow-hidden transition-all duration-700"
              style={{
                borderColor: done ? `${VAULT_COLOR}55` : 'rgba(255,255,255,0.10)',
                boxShadow: done ? `0 24px 80px rgba(167,139,250,0.18)` : '0 24px 80px rgba(0,0,0,0.45)',
                opacity: done ? 1 : 0.55,
                transform: done ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" style={{ color: VAULT_COLOR }} />
                  <span className="text-[11px] font-mono text-text-primary">
                    {NEW_NOTE_FILENAME}
                  </span>
                </div>
                <span
                  className="text-[10.5px] font-mono px-2 py-0.5 rounded-md"
                  style={{
                    color: VAULT_COLOR,
                    backgroundColor: `${VAULT_COLOR}10`,
                    border: `1px solid ${VAULT_COLOR}33`,
                  }}
                >
                  + new in vault
                </span>
              </div>
              <div className="p-5 font-mono text-[12px] text-text-secondary leading-relaxed">
                <pre className="whitespace-pre-wrap">{NEW_NOTE_BODY}</pre>
              </div>
            </div>

            <div className="rounded-xl border border-[#A78BFA]/25 bg-[#A78BFA]/5 p-4 flex items-start gap-3">
              <Library className="w-5 h-5 text-[#C7B5FF] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C7B5FF] mb-0.5">
                  Team vault now contains {totalNotesAfter} notes
                </p>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Tomorrow morning, when a teammate fires up an agent on the same service, <code className="font-mono text-[#C7B5FF] bg-[#A78BFA]/10 px-1.5 py-0.5 rounded">/recall</code> will surface this note in 318 tokens. They will know the bug, the fix, and the dispute.* edge case before they type their first prompt.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onAdvance}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#A78BFA] text-[#0F0A24] font-semibold text-sm hover:bg-[#C7B5FF] transition-colors shadow-[0_0_24px_rgba(167,139,250,0.45)] cursor-pointer"
          >
            See the compounded value
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </ChapterStage>
  );
}

const NEW_NOTE_BODY = `---
date: 2026-05-09
agent: ben.s
model: claude-opus-4-7
repo: payments-service
tags: ['stripe', 'webhooks', 'idempotency', 'payments']
---

## What was worked on
Fix for double-processing of Stripe webhooks. Extended the existing idempotency table
to cover dispute.* events, which were keying on payment_intent.id and missing.

## What was learned
Stripe sends multiple events per payment_intent (payment_intent.succeeded, charge.succeeded,
charge.dispute.created). Idempotency must key on event.id, never the resource id.

## Do not do this
Do not assume one event per payment_intent. Do not key idempotency on payment_intent.id.

## Files touched
- src/api/billing/webhook.ts
- src/lib/stripe/idempotency.ts
- tests/integration/stripe-webhook.spec.ts

## Follow-ups
- Audit refund.* events. Likely the same bug, lower volume.
- Add Datadog monitor on duplicate event.id within 60s.
`;

function CompressionFlow({ progress }: { progress: number }) {
  const fromSize = 100;
  const toSize = 16;
  const size = fromSize - (fromSize - toSize) * progress;

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-center flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1">
            Conversation
          </p>
          <p className="text-2xl font-semibold tabular-nums" style={{ color: PRINCIPAL_COLOR }}>
            {SESSION_TOKENS.toLocaleString()}
          </p>
          <p className="text-[10.5px] text-text-tertiary mt-0.5">tokens</p>
        </div>

        <div className="flex-1 flex items-center justify-center relative h-16">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-[#F5A62380] via-[#7DD3F580] to-[#A78BFA80]" />
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full transition-[left] ease-out"
            style={{
              left: `${Math.min(100, progress * 100)}%`,
              width: `${size}%`,
              height: `${Math.max(8, size / 4)}px`,
              transform: `translateX(-${progress * 100}%) translateY(-50%)`,
              background: `linear-gradient(90deg, ${PRINCIPAL_COLOR}, ${SUBAGENT_COLOR}, ${VAULT_COLOR})`,
              boxShadow: `0 0 24px ${SUBAGENT_COLOR}99`,
              transitionDuration: '380ms',
            }}
          />
        </div>

        <div className="text-center flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-text-tertiary mb-1">
            Vault note
          </p>
          <p className="text-2xl font-semibold tabular-nums" style={{ color: VAULT_COLOR }}>
            {NOTE_TOKENS}
          </p>
          <p className="text-[10.5px] text-text-tertiary mt-0.5">tokens</p>
        </div>
      </div>
      <p className="text-center text-[11px] text-text-tertiary mt-4">
        Compression ratio: {(SESSION_TOKENS / NOTE_TOKENS).toFixed(0)}× · the next agent reads only the note
      </p>
    </div>
  );
}
