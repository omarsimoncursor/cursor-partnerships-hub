'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Incident Triage — TypeError in formatPaymentReceipt

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · awaiting review |
| **Severity** | P1 |
| **Affected users** | 312 |
| **First seen** | 47 minutes ago |
| **Sentry issue** | a2f1…4c0e |
| **Jira ticket** | CUR-4291 |
| **Pull request** | #142 |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (edit) · Codex (review) |

## Summary

A \`TypeError\` is being thrown when customers complete checkout using the
**bank transfer** payment option. The \`formatPaymentReceipt\` function assumes
\`payment.details\` always exists, but this assumption was broken when the
\`bank_transfer\` payment variant was introduced without card details.

Users are unable to complete orders. 1,847 events in the last 47 minutes.

## Stack trace

\`\`\`
TypeError: Cannot read properties of undefined (reading 'brand')
  at formatPaymentReceipt  src/lib/demo/format-payment.ts:4
  at processOrder          src/lib/demo/order-processor.ts:22
  at CheckoutCard          src/components/sentry-demo/checkout-card.tsx:26
\`\`\`

## Root cause

The regression was introduced in commit **a4f2e1b** — *"feat: add bank_transfer
payment type"* (2 days ago). The new payment variant was added to the
\`PaymentMethod\` union, but the \`details\` field remained typed as required.
Downstream consumers were not updated to handle the new variant.

## Proposed fix

1. Mark \`PaymentMethod.details\` as optional in \`src/lib/demo/order-processor.ts\`
2. Add a null guard in \`formatPaymentReceipt\` (\`src/lib/demo/format-payment.ts\`)
3. Return a sensible fallback label for payment methods without card details

## Verification

- \`npx tsc --noEmit\` — no type errors introduced
- Dev server started and the buggy flow was reproduced in a headless browser
- \`POST /partnerships/sentry/demo · click #process-order\` — order processed without error

## Risk assessment

- **Files changed:** 2
- **Lines changed:** +7 −3
- **Blast radius:** Scoped to payment formatting logic — no changes to pricing, charging, or persistence
- **Rollback plan:** Revert PR #142 — no schema or data migrations involved
`;

interface TriageReportProps {
  onClose: () => void;
}

export function TriageReport({ onClose }: TriageReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        {/* Header: file chrome */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/triage/2026-04-16-typeerror-format-payment.md
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-accent-blue">
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
              {REPORT_MARKDOWN}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
