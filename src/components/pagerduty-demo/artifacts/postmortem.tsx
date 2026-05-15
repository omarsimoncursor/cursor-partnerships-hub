'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, FileText, X } from 'lucide-react';

const POSTMORTEM_MARKDOWN = `# Postmortem — INC-21487 · payments-api 5xx burst

| Field | Value |
| --- | --- |
| **Status** | Resolved · auto-resolved by cursor-agent |
| **Severity** | P1 · Major |
| **Service** | payments-api |
| **Detected by** | Datadog monitor #42971 |
| **PagerDuty** | INC-21487 |
| **Revert PR** | #318 |
| **Statuspage** | status.acme.com/payments-api · 3 updates |
| **Authored by** | Cursor Background Agent (auto-draft) |
| **Awaiting human review** | yes · @sre-rotation |

## Incident summary

A regression introduced in the v1.43.0 deploy of \`payments-api\` (commit \`a4f2e1b\` —
"feat: bank-transfer support") caused a 5xx burst beginning **27 seconds** after
the canary was promoted to 100%. Datadog monitor #42971 fired at **03:14:22 PT**
with a 5xx error rate of **7.4%** against a 5% threshold, sustained for 3 min.

The Cursor background agent acknowledged the page **12 seconds** after trigger,
suppressing the page to the on-call rotation. After triage, the agent reverted
v1.43.0 via PR #318, validated the canary against the SLO gate, promoted to 100%,
and resolved the incident at **03:18:34 PT** — total elapsed **4m 12s**.

## Customer impact

| Metric | Value |
| --- | --- |
| Duration | 4m 12s (03:14:22 → 03:18:34 PT) |
| Peak 5xx rate | 7.4% |
| Failed requests (estimated) | ~1,840 |
| Affected regions | us-west-2, us-east-1, eu-west-1 |
| Customer-visible window | ~3 min before traffic recovered |

## Root cause

The regression commit \`a4f2e1b\` introduced a synchronous DB write to
\`payments_transfers\` inside the request hot path. The write held a row lock
that contended with the existing settlement worker's read query, producing
deadlock-class \`5xx\`s under production traffic shape.

The change was untested against production traffic patterns; the canary at 5%
did not surface the issue because the contending settlement worker only runs
every 4 min, and the canary window happened to fall between worker ticks.

## Recovery telemetry

\`\`\`
03:14:22  TRIGGERED      5xx 7.4%  burn-rate 36×
03:14:34  ACK            5xx 7.4%  page suppressed
03:15:48  DECISION       5xx 7.2%  revert chosen, conf 0.93
03:16:11  PR OPENED      5xx 7.0%  branch revert/v1.43.0-bank-transfer
03:17:54  CANARY GREEN   5xx 0.0%  60s sustained, SLO gate passed
03:18:34  RESOLVED       5xx 0.0%  fleet-wide on v1.42.1
\`\`\`

## What went well

- Cursor agent acknowledged within **12s** — the on-call's phone never rang.
- Decision-rationale (revert vs fix-forward) was logged to the PD incident
  before code was touched.
- Canary + SLO gate caught the rollout posture before promotion.
- Statuspage updates posted in **&lt;1 min** of trigger; brand-voice template
  passed without human edits.

## What didn't

- The canary window was structurally unable to detect this class of regression
  (worker-tick contention). Action item: add a soak test that runs against a
  full settlement worker cycle.
- The bank-transfer feature is now blocked on a fix-forward path that requires a
  schema migration. Action item: design + review.
- Customer comms reached subscribers ~38s after the incident was identified —
  acceptable but tighten if we can.

## Action items

| Owner | Action | Due |
| --- | --- | --- |
| @cursor-agent | Schedule a soak test that covers a full settlement-worker cycle (open task PAY-2207). | Done — task open. |
| @sre-rotation | Review this postmortem and flip status \`Draft\` → \`Final\`. | Today. |
| @payments-platform | Land the fix-forward for bank-transfer (with the schema migration) behind a feature flag. | This week. |
| @cursor-agent | Notify v1.43.0 subscribers their feature is delayed — reuse the Statuspage subscriber list. | Done. |
| @on-call-eng | Confirm the on-call's phone-suppression preference for the next rotation. | Today. |

## Notes still pending human review

The agent **did not**:
- Touch the underlying bank-transfer feature code (out of scope for an incident response).
- Roll the schema migration forward (out of scope, requires DBA review).
- Customer-comms beyond the Statuspage template (account-management decision).
- File a CVE-style disclosure (no security boundary crossed).

These deliberately escalate to humans.
`;

interface PostmortemProps {
  onClose: () => void;
}

export function Postmortem({ onClose }: PostmortemProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/postmortems/2026-04-23-INC-21487.md
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-amber/15 border border-accent-amber/30 text-accent-amber font-medium">
              Draft · awaiting human sign-off
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-md hover:bg-dark-surface-hover text-text-tertiary hover:text-text-primary transition-colors"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-dark-surface-hover text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Markdown body */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <article className="markdown-body text-text-primary">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-text-primary mb-4 mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-text-primary mb-3 mt-6 border-t border-dark-border pt-5">
                    {children}
                  </h2>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="text-sm text-text-secondary space-y-1.5 mb-4 list-disc list-inside ml-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-sm text-text-secondary space-y-1.5 mb-4 list-decimal list-inside ml-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-text-primary">{children}</strong>
                ),
                table: ({ children }) => (
                  <div className="my-5 overflow-x-auto rounded-lg border border-dark-border">
                    <table className="w-full text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-dark-bg">{children}</thead>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-[11px] font-mono uppercase tracking-wider text-text-tertiary border-b border-dark-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-text-secondary border-b border-dark-border last:border-b-0">
                    {children}
                  </td>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) return <code className={className}>{children}</code>;
                  return (
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#57D990]">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="my-4 p-4 rounded-lg bg-dark-bg border border-dark-border overflow-x-auto text-[12px] text-text-secondary font-mono leading-relaxed">
                    {children}
                  </pre>
                ),
              }}
            >
              {POSTMORTEM_MARKDOWN}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
