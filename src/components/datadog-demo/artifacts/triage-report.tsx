'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Triage — Latency SLO breach on /api/reports/generate

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · PR #157 · CUR-4318 |
| **Severity** | P1 · SLO breach |
| **Monitor** | Datadog 3f12-8a2c (reports-p99) |
| **First breach** | 6m 12s before triage |
| **Trace** | 8b2e19f4c3d74a9f |
| **Jira** | CUR-4318 |
| **PagerDuty** | INC-8421 (ack'd, page suppressed) |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (edit) · Codex (review) |

## Incident

- **P99 latency**: 7,412ms (SLO target: 500ms)
- **Duration in breach**: 6m 12s
- **Affected endpoint**: \`/api/reports/generate\`
- **Blast**: ~1.4% of daily revenue-reporting users saw >5s waits during the window
- **Burn rate**: 12× against the 30-day error budget

## Stack & trace

\`\`\`
aggregateOrdersByRegion        src/lib/demo/aggregate-orders.ts:12
  for..of region                                              :14
    await fetchRegionOrders     src/lib/demo/region-store.ts:8  (≈602ms)
    await fetchRegionTax        src/lib/demo/region-store.ts:13 (≈557ms)
  × 6 regions (us-east, us-west, eu, apac, latam, uk)
\`\`\`

## Root cause

| Layer | Observation |
| --- | --- |
| Code | Sequential \`await\` in \`aggregate-orders.ts\` for 6 regions × 2 calls |
| Trace | 12 serial spans, 0 parallelism in flame graph |
| Regression | Commit \`a4f2e1b\` — "feat: add eu + latam regions" (4 days ago) |
| Type surface | No change required — output shape preserved |

## Fix

1. Replace outer \`for..of\` with \`Promise.all(REGIONS.map(fetchRegionSummary))\`
2. Add \`fetchRegionSummary\` helper that parallelizes the two inner fetches per region via \`Promise.all\`
3. No changes to contracts, callers, or types

## Verification

- Static: \`tsc --noEmit\` ✓, \`eslint\` ✓
- Live: \`curl -w "%{time_total}" http://localhost:3000/api/reports/generate\` — **7.41s → 0.61s** (12.1× faster, 8.1× under SLO)
- Unit tests: 158 passed · 0 failed
- Perf regression suite: ✓ (0.612s against 500ms SLO target)

## Risk

- **Blast radius**: 1 file, +18 −11
- **Rollback**: \`git revert HEAD\` — no schema, no migrations
- **Type surface**: unchanged
- **Behavior**: identical output shape; only wall-time differs
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
              docs/triage/2026-04-16-slo-breach-aggregate-orders.md
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#A689D4]">
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
