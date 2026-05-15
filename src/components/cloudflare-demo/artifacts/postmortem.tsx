'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, X, Download } from 'lucide-react';

const POSTMORTEM_MARKDOWN = `# Postmortem — Credential-stuffing attack on /api/auth/login

| Field | Value |
| --- | --- |
| **Status** | Mitigated · monitoring · app-side PR awaiting human review |
| **Severity** | P1 · attack · zero customer-account compromise |
| **Cloudflare event** | cf-2026-04-23-2342 |
| **Trigger** | Bot Management score collapse · 87% bot-traffic on /api/auth/login |
| **Detection-to-first-mitigation** | 45 s |
| **Detection-to-recovered** | 2 m 48 s |
| **Humans paged** | 0 |
| **Authored by** | Cursor Background Agent |
| **Models used** | Opus (plan) · Composer (patch) · Codex (review) |

## Attack summary

A coordinated credential-stuffing wave against \`acme-app.com/api/auth/login\` — **4.3M auth attempts in 90 seconds** from **8,400 distinct source IPs**, all routed through **ASN 14618**. Bot Management scored 87% of new sessions in the 0–4 (high-bot-likelihood) band. Top user-agent: \`curl/7.81.0\`. Success rate: **0.4%** — the attack was inflicting account lockouts faster than it was finding valid credentials.

| Metric | Pre-attack baseline | At peak | After mitigation |
| --- | ---: | ---: | ---: |
| Requests / s | 12,000 | 84,000 | 12,200 |
| 4xx error rate | 0.6% | 11.4% | 0.7% |
| Bot-score < 5 share | 4% | 87% | 5% |
| Customer accounts in lockout | 0 | 12 | 0 (unlocked at recovery) |

## Defense narrative — three layers, in order

### Layer 1 · WAF custom rule (edge-immediate)

Deployed at **T+45 s** as \`waf-2c8a4f\` in **Log mode** with the expression:

\`\`\`
(ip.geoip.asnum eq 14618 and http.user_agent contains "curl/7.81")
and http.request.uri.path eq "/api/auth/login"
\`\`\`

**Scope is intentionally narrow** — single ASN + single UA family + single endpoint. The agent is not authorised to block whole countries or whole ASNs unilaterally.

The 60-second observation window logged **1.92M matches with zero false positives**. The rule was promoted to **Block** at **T+1 m 22 s**, which dropped req/s by 55% within five seconds.

### Layer 2 · Worker rate-limit (edge-rate-limit)

The Cloudflare Worker at \`workers/auth-rate-limit.ts\` was tightened from **100 req/s/IP** to **5 req/min/IP for any IP whose Bot Management score < 5**. Deployed via \`wrangler deploy --env preview\` to a **canary route at 1%** (zero errors in 30 s), then promoted to **production at T+2 m 12 s**.

This caught the residual attack traffic that survived the WAF rule (different UA strings, same ASN), bringing req/s back to baseline.

### Layer 3 · App-side detector (long-term, **draft PR · awaiting human review**)

The agent opened **PR #318** (DRAFT) against \`src/lib/auth/credential-stuffing-detector.ts\`. Changes:

- Add CAPTCHA challenge on suspicious-IP signals (Bot Management score < 30).
- Tighten account-lockout threshold from 5 / 10 min to 5 / 5 min.
- Surface a per-account "auth attempt rate" gauge to the existing fraud dashboard.

This is the only layer that **did not auto-deploy**. Security-sensitive code changes are required to land via human review per the agent's guardrails.

## What's automatic vs what needs human follow-up

| Action | Decided by | Status |
| --- | --- | --- |
| Detect spike + correlate ASN | Cursor agent (Cloudflare + Threat-Intel MCP) | ✓ done |
| Draft 3-layer plan | Opus | ✓ done |
| Deploy WAF rule (Log mode) | Cursor agent (Cloudflare API) | ✓ done |
| Promote WAF rule to Block | Cursor agent (after 60s observation, 0 FP) | ✓ done |
| Deploy Worker rate-limit | Cursor agent (wrangler, canary first) | ✓ done |
| Open app-side PR | Cursor agent | ✓ done · DRAFT |
| **Merge app-side PR** | **Security team** | ⏳ awaiting review |
| Statuspage / Slack / SIEM update | Cursor agent | ✓ done |

## Action items

| # | Action | Owner | ETA |
| --- | --- | --- | --- |
| 1 | Review and merge **PR #318** (app-side detector) | Security team | next on-call rotation |
| 2 | Add ASN 14618 to long-term denylist for paid endpoints | Security team | this week |
| 3 | Backport the per-IP rate-limit pattern to \`/api/password-reset\` | Platform | next sprint |
| 4 | Postmortem review in Friday SRE sync | SRE lead | Friday 10:00 PT |

## Detection-to-mitigation telemetry

\`\`\`
T+0 s     · Cloudflare Bot Management collapse · webhook fired
T+1 s     · Cursor agent picked up event
T+12 s    · Threat-intel correlation complete (ASN 14618 known)
T+28 s    · Plan drafted (Opus · 3 layers)
T+45 s    · Layer 1 WAF rule live (Log mode)
T+1 m 22 s · Layer 1 promoted to Block · req/s −55% in 5s
T+2 m 12 s · Layer 2 Worker rate-limit live in production · req/s back to baseline
T+2 m 30 s · Layer 3 app-side PR opened (DRAFT)
T+2 m 48 s · Mitigated · monitoring · all artifacts ready
\`\`\`

## Residual exposure

- **Until app-side PR merges**, repeat attacks from a *different* ASN with *similar* UA could survive Layer 1 (which is ASN-scoped). Layer 2 still catches them via Bot-score gating.
- **Long-running curl-driven sessions** (rare but possible) would fall under the WAF rule's narrow UA scope. If an adversary rotates to a real-browser UA *and* a different ASN, Layer 2 alone would have to absorb it until a new WAF rule is authored.

## Verification

- Static: \`npx tsc --noEmit\` ✓ · \`eslint\` ✓
- Live: \`miniflare test\` against the Worker patch ✓ (429 returned for sub-5 bot scores)
- Production: req/s back to 12.2k (baseline 12k) within 2 m 48 s · error rate back to 0.7% (baseline 0.6%)
- All actions audited to SIEM via Cloudflare Logpush → S3 → Splunk
`;

interface PostmortemProps {
  onClose: () => void;
}

export function Postmortem({ onClose }: PostmortemProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-dark-border bg-dark-surface overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border bg-dark-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <span className="text-xs font-mono text-text-secondary">
              docs/postmortems/2026-04-23-cf-credential-stuffing.md
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md hover:bg-dark-surface-hover text-text-tertiary hover:text-text-primary transition-colors" title="Download">
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
                h3: ({ children }) => (
                  <h3 className="text-[15px] font-semibold text-text-primary mb-2 mt-4">{children}</h3>
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
                    <code className="px-1 py-0.5 rounded bg-dark-bg border border-dark-border text-[12px] font-mono text-[#FAAE40]">
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
