'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Triage — NoSQL injection in customer profile lookup

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · PR #214 · CUR-7841 |
| **Severity** | Critical · CVSS 9.8 · CWE-943 |
| **Snyk issue** | SNYK-JS-CUSTOMER-PROFILE-001 |
| **Companion finding** | SNYK-JS-MONGOOSE-2961688 (High · CVSS 7.5) |
| **Jira** | CUR-7841 |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (edit) · Codex (review) |

## Vulnerability

- **Type**: NoSQL injection (CWE-943, OWASP A03:2021)
- **CVSS 3.1**: 9.8 (Critical) — \`AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H\`
- **Affected endpoint**: \`/api/customer-profile/lookup\`
- **Affected file**: \`src/lib/demo/customer-profile.ts:22\`
- **Blast**: every customer record returned by a single crafted request, including hashed credentials and admin role flags.

## Tainted flow

\`\`\`
request.query.username                                 (source)
  → lookupCustomerProfile({ username })                (propagation)
    → \`{ "username": "\${query.username}" }\`           (string interpolation, line 22)
      → parseSelector(tainted)                         (predicate construction)
        → CUSTOMERS.filter(matchesSelector(selector))  (sink, line 24)
\`\`\`

## Reproducer

\`\`\`bash
curl 'http://localhost:3000/api/customer-profile/lookup?username='\\
'%27%20%7C%7C%20%271%27%3D%3D%271'
# → 200 OK · 12 records returned (entire customer table)
\`\`\`

## Root cause

| Layer | Observation |
| --- | --- |
| Code | Untrusted \`query.username\` interpolated into selector string |
| Selector | Payload \`' || '1'=='1\` collapses parser to \`always-true\` |
| Validation | No allowlist or schema enforcement on the username field |
| Regression | Commit \`5e9d3c2\` — "feat: add internal customer lookup" (11 days ago) |
| Type surface | Unchanged — fix only narrows the input domain |

## Fix

1. Parameterize the selector: pass \`username\` as a value into \`parseSelector\` instead of interpolating it.
2. Add an allowlist regex \`/^[a-zA-Z0-9_.-]{1,64}$/\` and reject anything else with a typed \`ValidationError\`.
3. Bump \`mongoose\` from \`5.13.7\` to \`5.13.20\` (resolves SNYK-JS-MONGOOSE-2961688).
4. Add a regression test that asserts \`ValidationError\` is thrown for the canonical injection payload.

## Verification

- Static: \`tsc --noEmit\` ✓, \`eslint\` ✓ (eslint-plugin-security clean)
- Unit: \`vitest customer-profile\` ✓ — 11 passed, 1 new
- Exploit replay: \`node scripts/reproduce-snyk-injection.mjs\` — **12 leaked rows → 0 leaked rows**, \`ValidationError\` thrown for the canonical payload
- Snyk re-test: \`snyk test --severity-threshold=medium\` — **0 critical · 0 high · 0 medium**

## Risk

- **Blast radius**: 2 files (\`customer-profile.ts\`, \`package.json\` + lockfile), +34 −7
- **Rollback**: \`git revert HEAD\` — no schema, no migrations
- **Type surface**: unchanged for valid inputs; new typed \`ValidationError\` for invalid inputs
- **Behavior**: identical for any username matching the allowlist; rejects every previously dangerous payload
`;

interface TriageReportProps {
  onClose: () => void;
}

export function TriageReport({ onClose }: TriageReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/triage/2026-04-16-snyk-customer-profile.md
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#9F98FF]">
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
