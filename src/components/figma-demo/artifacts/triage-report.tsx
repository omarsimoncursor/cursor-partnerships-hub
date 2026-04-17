'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Triage — Design drift on ProductCard v2.3

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · awaiting review |
| **Severity** | P2 |
| **Component** | UI/Storefront · ProductCard@2.3 |
| **Figma file** | Marketing/Shop/ProductCard \`zk2N…M9pq\` |
| **Variable collection** | \`design-system/tokens@v2.3\` |
| **Jira ticket** | CUR-4409 |
| **Pull request** | #163 |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (edit) · Codex (review) |

## Summary

Four design-token violations on the shipped \`ProductCard v2.3\` component
exceed the \`±2 px / ΔE > 4\` drift threshold against the Figma spec
\`Marketing/Shop/ProductCard@2.3\`. The violations all map back to one file,
\`src/components/figma-demo/product-card-drifted.tsx\`, where hardcoded CSS
literals were re-introduced during a partial revert and are no longer
referencing the canonical tokens module \`src/lib/demo/design-tokens.ts\`.

## Violations (4)

| # | Element | Variable | Figma spec | Shipped | Delta |
| --- | --- | --- | --- | --- | --- |
| 1 | Card | \`radius/md\` | 16 px | 12 px | −4 px |
| 2 | Card | \`space/6\` (padding) | 24 px | 20 px | −4 px |
| 3 | Title | \`font.title\` (weight / size) | 600 / 18 | 700 / 17 | +100 / −1 |
| 4 | CTA | \`color/brand/accent\` | #A259FF | #9A4FFF | ΔE 6.2 |

A 5th micro-violation on the price badge (\`color/badge/success\` ΔE ~5.8,
#14B892 → #12A67F) is fixed alongside the four primary violations.

## Root cause

Commit **3ef91a2** — *"revert: product card restyle"* (3 days ago, by
\`@megumi-yoshida\`) re-introduced 7 hardcoded CSS literals in
\`product-card-drifted.tsx\` that had previously been migrated to
\`tokens.*\` references. The revert was scoped to the partial restyle but
also undid the unrelated token migration that landed in the same window.

## Fix

- **Token-only substitution.** Replace 7 hardcoded literals with
  \`tokens.radius.card\`, \`tokens.space.cardPadding\`,
  \`tokens.font.titleSize / titleWeight\`, \`tokens.color.brandAccent\`,
  \`tokens.color.priceBadge\`, and \`tokens.radius.button\`.
- **No type changes.** Component props, render tree, and layout are
  untouched. Diff is +7 −7, scoped to one file.
- **Post-fix pixel match: 100%.** Visual regression sweep against the
  Figma frame returns 0 violations and ΔE 0.2.

## Verification

- \`npx tsc --noEmit\` — ✓ no type errors
- \`npm run lint\` — ✓ no lint warnings
- WCAG AA contrast (CTA on surface): **4.17:1 → 4.63:1** ✓
- Visual regression: **4 violations → 0** · mean ΔE **5.4 → 0.2**
- Figma file \`zk2N…M9pq\` unchanged — fix was code-side only

## Risk assessment

- **Files changed:** 1 (\`product-card-drifted.tsx\`)
- **Lines changed:** +7 −7
- **Blast radius:** Scoped to one component instance; no shared style
  changes, no schema changes, no behavior changes.
- **Rollback plan:** Revert PR #163 — no migrations or downstream consumers
  to coordinate with.

## Linked

- Figma file — \`Marketing/Shop/ProductCard@2.3\` (\`zk2N…M9pq\`)
- Jira — \`CUR-4409\`
- GitHub PR — \`#163 · fix/product-card-token-drift\`
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
            <span className="text-xs font-mono text-text-secondary truncate">
              docs/triage/2026-04-16-design-drift-product-card.md
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#D6BBFF]">
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
