'use client';

/**
 * Pixel-perfect GitHub PR for the Cloudflare demo. The PR is a Worker
 * rate-limit tighten + a sibling DRAFT app-side detector PR (highlighted in the
 * sidebar), reflecting the agent's guardrail of not auto-merging security-
 * sensitive code.
 */

import {
  GitMerge,
  GitPullRequest,
  Check,
  MessageSquare,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Book,
  AlertCircle,
} from 'lucide-react';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      {/* Top header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">acme-corp</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">edge-platform</span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">Private</span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">9</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">42</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" />
          <NavTab label="Issues" count="7" />
          <NavTab label="Pull requests" count="4" active />
          <NavTab label="Actions" />
          <NavTab label="Projects" />
          <NavTab label="Wiki" />
          <NavTab label="Security" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      {/* PR header */}
      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            security: tighten /api/auth/login rate limit during credential-stuffing event
            <span className="text-[#7d8590] ml-2 font-light">#318</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f6feb] text-white text-[13px] font-medium">
            <GitPullRequest className="w-4 h-4" />
            Open
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">cursor-agent</span> wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">2 commits</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">main</span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">security/auth-rate-limit-tighten</span>
          </p>
        </div>
      </div>

      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="4" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="2" />
          <PrTab label="Checks" count="5" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="2" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="2 minutes ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  Tighten the per-IP rate limit on{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">/api/auth/login</code>{' '}
                  in the Cloudflare Worker at{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">workers/auth-rate-limit.ts</code>. New behaviour: any IP whose Bot Management score is below 5 gets capped at <strong>5 req / minute</strong> instead of the default <strong>100 req / second</strong>. Deployed to a canary route (1% traffic) for 30s before promotion to production.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Why now</h3>
                <p>
                  Credential-stuffing wave from <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">ASN 14618</span> targeting{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">/api/auth/login</code>: 4.3M auth attempts in 90s, 0.4% success rate. WAF rule{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">waf-2c8a4f</code>{' '}
                  shed 55% of traffic; this Worker patch absorbs the residual ~30% that survives the rule (different UA strings, same ASN family).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Edge mitigation timeline</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Layer</th>
                        <th className="px-3 py-2 text-right font-semibold">Live at</th>
                        <th className="px-3 py-2 text-right font-semibold">Req/s after</th>
                        <th className="px-3 py-2 text-right font-semibold">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2">Pre-attack baseline</td>
                        <td className="px-3 py-2 text-right font-mono text-[#7d8590]">—</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">12.0k</td>
                        <td className="px-3 py-2 text-right font-mono text-[#7d8590]">—</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2">Attack peak</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">T+0:30</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">84.0k</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">+600%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">L1 · WAF rule (Block)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">T+1:22</td>
                        <td className="px-3 py-2 text-right font-mono text-[#FAAE40]">38.0k</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−55%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">L2 · Worker rate-limit (this PR)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">T+2:12</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">12.2k</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−85% (cumulative)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview · workers/auth-rate-limit.ts</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span>{`  import { Env } from "./env";
  import { verifyBotScore } from "./bot-score";

  export default {
    async fetch(req: Request, env: Env): Promise<Response> {
      const url = new URL(req.url);
      if (url.pathname !== "/api/auth/login") {
        return env.ORIGIN.fetch(req);
      }

      const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
      const score = await verifyBotScore(req, env);
`}</span>
<span className="bg-[#301216] text-[#f85149]">{`-     const limit = env.RATE_LIMIT.limit({ key: ip, perSecond: 100 });
-     if (!limit.success) {
-       return new Response("Too many requests", { status: 429 });
-     }
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+     const isLikelyBot = score < 5;
+     const limit = isLikelyBot
+       ? env.RATE_LIMIT_STRICT.limit({ key: ip, perMinute: 5 })
+       : env.RATE_LIMIT_DEFAULT.limit({ key: ip, perSecond: 100 });
+     if (!limit.success) {
+       return new Response("Too many requests", {
+         status: 429,
+         headers: { "Retry-After": String(limit.retryAfter ?? 60) },
+       });
+     }
`}</span>
<span>{`
      return env.ORIGIN.fetch(req);
    },
  };
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Cloudflare event:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">cf-2026-04-23-2342</span>
                  </li>
                  <li>
                    WAF rule:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">waf-2c8a4f</span>{' '}
                    · Log → 60s observe → Block (0 false positives)
                  </li>
                  <li>
                    Wrangler deploy: build <span className="font-mono text-[12.5px]">d4f2a</span> · canary 1% (30s, 0 errors) → production 100%
                  </li>
                  <li>
                    Post-fix req/s: <span className="text-[#3fb950]">12.2k (baseline 12k)</span> · error rate <span className="text-[#3fb950]">0.7% (baseline 0.6%)</span>
                  </li>
                  <li>Typecheck: <span className="text-[#3fb950]">✓</span> · Lint: <span className="text-[#3fb950]">✓</span> · miniflare unit tests: <span className="text-[#3fb950]">✓</span></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 1 file · +12 −4 (Worker only). No origin, schema, or migration changes.</li>
                  <li>
                    Rate-limit threshold (<span className="font-mono">5 req/min/IP for bot-score &lt; 5</span>) gates by Bot Management score, not by IP allowlist — false-positive risk on legitimate clients with low scores remains low (Bot Management false-positive rate &lt; 0.05%).
                  </li>
                  <li>
                    Rollback: <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">wrangler rollback --env production</code> (single command, no schema state).
                  </li>
                </ul>
              </section>

              <section className="rounded-md border border-[#FAAE40]/40 bg-[#FAAE40]/5 p-3">
                <h3 className="font-semibold text-[15px] mb-1 flex items-center gap-2 text-[#FAAE40]">
                  <AlertCircle className="w-4 h-4" />
                  Sister PR &mdash; awaiting human review
                </h3>
                <p className="text-[13.5px] leading-relaxed">
                  PR{' '}
                  <span className="text-[#4493f8] hover:underline cursor-pointer font-mono">#319 (DRAFT)</span>{' '}
                  &mdash; app-side detector improvements (CAPTCHA on suspicious-IP, lockout-threshold tightening). Marked draft because it touches authentication code; requires security-team review per agent guardrail.
                </p>
              </section>
            </div>
          </PrComment>

          {/* Codex approval */}
          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· just now</span>
            </p>
          </div>

          {/* Checks summary */}
          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">All checks have passed</span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">Show all checks</button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="3s" />
              <CheckRow name="lint" detail="eslint + prettier" duration="2s" />
              <CheckRow name="miniflare-unit" detail="rate-limit binding · 12 passed" duration="6s" />
              <CheckRow name="wrangler-canary" detail="1% canary route · 30s · 0 errors" duration="32s" />
              <CheckRow name="security-policy" detail="No country/ASN-wide blocking · audit ✓" duration="1s" />
            </div>
          </PrComment>

          {/* Merge box */}
          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#3fb950]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  This branch has no conflicts with the base branch
                </p>
                <p className="text-[12.5px] text-[#7d8590]">Merging can be performed automatically. Worker is already serving production via canary promotion.</p>
              </div>
              <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium">
                Merge pull request
              </button>
            </div>
          </PrComment>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
            </SidebarRow>
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#FAAE40]/20 flex items-center justify-center">
                <span className="text-[#FAAE40] text-[10px] font-bold">S</span>
              </div>
              <span className="text-[#e6edf3]">@security-team</span>
              <span className="ml-auto text-[#FAAE40]">requested</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Assignees">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <span className="text-[#e6edf3]">cursor-agent</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="#F38020" label="cloudflare" />
              <Label color="#A371F7" label="security" />
              <Label color="#F5A623" label="credential-stuffing" />
              <Label color="#2188ff" label="auto-fix" />
              <Label color="#7D8590" label="cf-event-2342" />
            </div>
          </SidebarSection>
          <SidebarSection title="Linked">
            <div className="space-y-1 text-[#7d8590]">
              <p className="text-[#4493f8] hover:underline cursor-pointer">CF event cf-2026-04-23-2342</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">PR #319 (DRAFT) · app-side detector</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">Statuspage incident · public</p>
            </div>
          </SidebarSection>
          <SidebarSection title="Milestone">
            <p className="text-[#7d8590]">Q2 · edge hardening</p>
          </SidebarSection>
          <SidebarSection title="3 participants">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#FAAE40]/20 flex items-center justify-center">
                <span className="text-[#FAAE40] text-[10px] font-bold">S</span>
              </div>
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrTab({
  label,
  count,
  active,
  icon,
}: {
  label: string;
  count?: string;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`px-4 py-3 flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrComment({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      {children}
    </div>
  );
}

function PrCommentHeader({
  author,
  bot,
  label,
  time,
}: {
  author: string;
  bot?: boolean;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#151b23]">
      <div className="flex items-center gap-2 text-[13px]">
        <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-[10px] font-bold">{author[0].toUpperCase()}</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">{author}</span>
        {bot && <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">bot</span>}
        <span className="text-[#7d8590]">{label} · {time}</span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({ name, detail, duration }: { name: string; detail: string; duration: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Check className="w-4 h-4 text-[#3fb950] shrink-0" />
      <span className="font-mono text-[12.5px] text-[#e6edf3] font-medium">{name}</span>
      <span className="text-[#7d8590] truncate">{detail}</span>
      <span className="ml-auto text-[#7d8590] font-mono text-[11.5px]">{duration}</span>
      <span className="text-[#4493f8] text-[11.5px] hover:underline cursor-pointer">Details</span>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#30363d] pb-4">
      <div className="flex items-center justify-between mb-2 text-[#7d8590]">
        <span className="font-semibold">{title}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
}

function SidebarRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[13px]">{children}</div>;
}

function Label({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {label}
    </span>
  );
}
