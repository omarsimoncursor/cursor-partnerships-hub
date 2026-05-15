'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const REPORT_MARKDOWN = `# Triage — Zero Trust violation on /api/admin/audit-logs

| Field | Value |
| --- | --- |
| **Status** | Fix proposed · PR #213 · CUR-5712 |
| **Severity** | Sec-P1 · Zero Trust violation |
| **ZPA risk event** | evt-21794 (Critical · 92 / 100) |
| **App segment** | workforce-admin · ZPA |
| **First flagged** | 14:21 PDT · rolling 60-minute window |
| **Jira** | CUR-5712 |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (triage) · Composer (edit) · Codex (review) |

## Incident

- **Endpoint**: \`/api/admin/audit-logs\`
- **Users in scope**: 4,287 (intent: 18 · **238x over**)
- **Posture distribution**: 50% unmanaged · 38% managed-noncompliant · 12% managed-compliant
- **ZIA web hits (last 60m)**: 312 · including 4 unmanaged-device sessions and 2 lobby kiosks
- **Risk surface**: read access to internal audit log including contractor activity

## Stack & policy

\`\`\`
ADMIN_AUDIT_LOG_POLICY        src/lib/demo/access-policy.ts:14
  roles: ['*']                                           :15
  postureRequired: false                                 :16
  allowedLocations: ['*']                                :17
  allowedIdps: ['*']                                     :18
evaluateAccess(req)            src/lib/demo/access-policy.ts:25  (unchanged)
\`\`\`

## Root cause

| Layer | Observation |
| --- | --- |
| Policy | Wildcard roles, posture skipped, wildcard locations + IdPs |
| ZIA logs | 312 reads in last hour, 50% from unmanaged devices |
| ZPA | Risk score climbed to 92/100 after the regression deploy |
| Regression | Commit \`b7c91d2\` — "wip: open audit logs for QA" (3 days ago, qa-bot) |
| Type surface | No change required — policy shape preserved |

## Fix

1. Replace \`roles: ['*']\` with explicit \`['security-admin', 'compliance-officer']\`
2. Set \`postureRequired: true\` (managed-compliant only)
3. Restrict \`allowedLocations\` to \`['sf-hq', 'nyc-hq']\`
4. Restrict \`allowedIdps\` to \`['okta-prod']\`
5. \`evaluateAccess\` evaluator unchanged — same return shape, same callers

## Verification

- Static: \`tsc --noEmit\` ✓, \`eslint\` ✓
- Policy conformance probe (4 simulated requests):
  - admin-role + managed-compliant + sf-hq + okta-prod → **allow** ✓
  - admin-role + managed-noncompliant → **deny** ✓
  - employee-role + managed-compliant → **deny** ✓
  - anonymous + unmanaged → **deny** ✓
- Scope recompute: **4,287 → 18 users** · 0 unmanaged-device paths

## Risk

- **Blast radius**: 1 file, +14 −5
- **Rollback**: \`git revert HEAD\` — no migrations, no SCIM changes, no IdP edits
- **Type surface**: unchanged
- **Behavior**: same evaluator, narrower allow-list. No callers refactored.
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
              docs/triage/2026-04-23-zerotrust-violation-audit-logs.md
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#65B5F2]">
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
